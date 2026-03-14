import { AnimatePresence, motion } from "framer-motion";
import { Component, startTransition, useEffect, useRef, useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { TopNavigation } from "./components/TopNavigation";
import { ConfigureAgentModal } from "./components/ConfigureAgentModal";
import { VulnerabilityDetailsModal } from "./components/VulnerabilityDetailsModal";
import { DashboardPage } from "./pages/DashboardPage";
import { ScanActivityPage } from "./pages/ScanActivityPage";
import { VulnerabilityAnalysisPage } from "./pages/VulnerabilityAnalysisPage";
import { ProofEnginePage } from "./pages/ProofEnginePage";
import { EscrowManagementPage } from "./pages/EscrowManagementPage";
import { AuditLedgerPage } from "./pages/AuditLedgerPage";
import { socket } from "./lib/socket";

const defaultConfig = {
  targetUrl: "http://127.0.0.1:5000",
  attackModule: "SQL Injection",
  confidenceThreshold: 0.8,
};

const defaultScanForm = {
  company: "Acme Finance",
  target_type: "website",
  target: "https://store.acme.com",
  scan_type: "web_security",
  bounty: 100,
  zip_file_name: "",
  repository_branch: "main",
  entry_point: "",
  notes: "",
};

const fallbackAgentInfo = {
  agent_name: "SecureGuard AI",
  model: "Gemini 1.5 Flash",
  contract: "SecureGuard Escrow",
  contract_address: "aaaaaaqey6suypclwh6wmvu4pjy52pcxhieusrqpjt43ytehnz32uqksvu",
  network: "Weilchain Sentinel",
};

const paths = {
  dashboard: "/",
  scan: "/scan-activity",
  vulnerabilities: "/vulnerabilities",
  proof: "/proof-engine",
  escrow: "/escrow-management",
  audit: "/audit-ledger",
};

const routeDefinitions = [
  { path: paths.dashboard, label: "New Scan", keywords: ["dashboard", "secureguard", "scan", "input", "home"] },
  { path: paths.scan, label: "AI Scan Activity", keywords: ["scan", "activity", "pipeline", "events"] },
  { path: paths.vulnerabilities, label: "Vulnerabilities", keywords: ["vulnerabilities", "findings", "results"] },
  { path: paths.proof, label: "Proof Engine", keywords: ["proof", "hash", "engine", "blockchain"] },
  { path: paths.escrow, label: "Blockchain Escrow", keywords: ["escrow", "bounty", "contract", "payout"] },
  { path: paths.audit, label: "Audit Logs", keywords: ["audit", "logs", "ledger", "blockchain"] },
];

const navigationSections = [
  {
    title: "Main",
    items: [{ label: "New Scan", path: paths.dashboard }],
  },
  {
    title: "Operations",
    items: [
      { label: "AI Scan Activity", path: paths.scan },
      { label: "Vulnerabilities", path: paths.vulnerabilities },
      { label: "Proof Engine", path: paths.proof },
    ],
  },
  {
    title: "Blockchain",
    items: [
      { label: "Blockchain Escrow", path: paths.escrow },
      { label: "Audit Logs", path: paths.audit },
    ],
  }
];

const routeMap = Object.fromEntries(routeDefinitions.map((route) => [route.path, route]));

const defaultContractState = {
  status: "Initialized",
  bounty: 0,
  tx_hash: "",
  payout: "",
};

const defaultAnalyticsState = {
  totalScans: 0,
  vulnerabilitiesDetected: 0,
  exploitSuccessRate: 0,
  avgConfidence: 0,
  timeline: [],
  distribution: [
    { name: "SQL Injection", value: 0 },
    { name: "XSS", value: 0 },
    { name: "Auth Bypass", value: 0 },
  ],
  performance: {
    accuracy: 0.91,
    coverage: 0.72,
    avg_scan_time: 2.1,
  },
};

function normalizePath(pathname) {
  return routeMap[pathname] ? pathname : paths.dashboard;
}

function buildProofPayload(vulnerability) {
  return {
    confidence: vulnerability.confidence,
    endpoint: vulnerability.endpoint,
    scan_id: vulnerability.scan_id,
    severity: vulnerability.severity,
    vulnerability: vulnerability.vulnerability,
  };
}

function serializeSorted(value) {
  if (Array.isArray(value)) {
    return `[${value.map((item) => serializeSorted(item)).join(",")}]`;
  }

  if (value && typeof value === "object") {
    const sortedEntries = Object.entries(value).sort(([left], [right]) => left.localeCompare(right));
    return `{${sortedEntries
      .map(([key, nestedValue]) => `${JSON.stringify(key)}:${serializeSorted(nestedValue)}`)
      .join(",")}}`;
  }

  return JSON.stringify(value);
}

async function generateProofHashForVulnerability(vulnerability) {
  const proofString = serializeSorted(buildProofPayload(vulnerability));
  
  if (!window.crypto || !window.crypto.subtle) {
    // Fallback for non-secure contexts (http:// IP addresses) where crypto.subtle is undefined
    let hash = 0;
    for (let i = 0; i < proofString.length; i++) {
        const char = proofString.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return "0x" + Math.abs(hash).toString(16).padStart(62, "0");
  }

  const encoded = new TextEncoder().encode(proofString);
  const digest = await crypto.subtle.digest("SHA-256", encoded);

  return Array.from(new Uint8Array(digest))
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("");
}

function isWorkflowRunning(scan) {
  return Boolean(scan && ["queued", "scanning", "vulnerable", "proof_generated", "proof_submitted", "verified"].includes(scan.status));
}

function buildScanPayload(form) {
  const basePayload = {
    company: form.company.trim() || "Acme Finance",
    target_type: form.target_type,
    scan_type: form.scan_type,
    bounty: Number(form.bounty) || 100,
    repository_branch: form.repository_branch?.trim() || "main",
    entry_point: form.entry_point?.trim() || "",
    notes: form.notes?.trim() || "",
  };

  if (form.target_type === "zip") {
    const zipFileName = form.zip_file_name?.trim() || "";
    return {
      ...basePayload,
      zip_file_name: zipFileName,
      target: zipFileName ? `upload://${zipFileName}` : "",
    };
  }

  return {
    ...basePayload,
    target: form.target.trim(),
  };
}

async function fetchJson(url, options) {
  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json();
}

class PageErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <section className="panel-surface p-6 md:p-7">
          <p className="text-sm font-semibold text-text-primary">Page is refreshing scan data.</p>
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            This module hit a temporary render issue while switching scans. Select the scan again or return to the dashboard.
          </p>
        </section>
      );
    }

    return this.props.children;
  }
}

export default function App() {
  const [currentPath, setCurrentPath] = useState(() => normalizePath(window.location.pathname));
  const [searchValue, setSearchValue] = useState("");
  const [agentInfo, setAgentInfo] = useState(null);
  const [isConfigureOpen, setIsConfigureOpen] = useState(false);
  const [config, setConfig] = useState(defaultConfig);
  const [scanForm, setScanForm] = useState(defaultScanForm);
  const [submittingScan, setSubmittingScan] = useState(false);
  const [activeScans, setActiveScans] = useState([]);
  const [selectedScanId, setSelectedScanId] = useState("");
  const [selectedScanDetail, setSelectedScanDetail] = useState(null);
  const [selectedScanLogs, setSelectedScanLogs] = useState([]);
  const [globalLogs, setGlobalLogs] = useState([]);
  const [selectedScanVulnerabilities, setSelectedScanVulnerabilities] = useState([]);
  const [selectedVulnerability, setSelectedVulnerability] = useState(null);
  const [detailsVulnerability, setDetailsVulnerability] = useState(null);
  const [proofHash, setProofHash] = useState("");
  const [hashGenerating, setHashGenerating] = useState(false);
  const [copyState, setCopyState] = useState("Copy Hash");
  const [contractActionLoading, setContractActionLoading] = useState("");
  const [analytics, setAnalytics] = useState(defaultAnalyticsState);
  const selectedScanIdRef = useRef("");

  const profile = agentInfo ?? fallbackAgentInfo;
  const currentRoute = routeMap[currentPath] ?? routeMap[paths.dashboard];
  const selectedScan = selectedScanDetail ?? activeScans.find((scan) => scan.scan_id === selectedScanId) ?? null;
  const events = selectedScanDetail?.agent_events ?? [];
  const vulnerabilities = selectedScanVulnerabilities;
  const logs = selectedScanLogs;
  const scanRunning = isWorkflowRunning(selectedScan);
  const contractState = selectedScan
    ? {
        status: selectedScan.contract_status ?? defaultContractState.status,
        bounty: selectedScan.bounty ?? defaultContractState.bounty,
        tx_hash: selectedScan.transaction_hash ?? selectedScan.tx_hash ?? "",
        payout: selectedScan.payout ?? "",
      }
    : defaultContractState;
  const proofEligible = Boolean(selectedVulnerability && selectedVulnerability.confidence >= 0.8);
  const proofReady = Boolean(selectedVulnerability && proofHash);
  const notificationCount =
    Math.min(analytics.vulnerabilitiesDetected, 8) + activeScans.filter((scan) => isWorkflowRunning(scan)).length;

  useEffect(() => {
    selectedScanIdRef.current = selectedScanId;
  }, [selectedScanId]);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(normalizePath(window.location.pathname));
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [currentPath]);

  const navigate = (path) => {
    const nextPath = normalizePath(path);

    if (nextPath !== currentPath) {
      window.history.pushState({}, "", nextPath);
      setCurrentPath(nextPath);
      return;
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const loadAgentInfo = async () => {
    try {
      const data = await fetchJson("/agent-info");
      setAgentInfo(data);
    } catch {
      setAgentInfo(fallbackAgentInfo);
    }
  };

  const loadAnalytics = async () => {
    try {
      const [scansData, vulnerabilitiesData, performanceData] = await Promise.all([
        fetchJson("/analytics/scans"),
        fetchJson("/analytics/vulnerabilities"),
        fetchJson("/analytics/performance"),
      ]);

      setAnalytics({
        totalScans: scansData.total_scans ?? 0,
        vulnerabilitiesDetected: vulnerabilitiesData.vulnerabilities_detected ?? 0,
        exploitSuccessRate: vulnerabilitiesData.exploit_success_rate ?? 0,
        avgConfidence: vulnerabilitiesData.avg_confidence ?? 0,
        timeline: vulnerabilitiesData.timeline ?? [],
        distribution: vulnerabilitiesData.distribution ?? defaultAnalyticsState.distribution,
        performance: performanceData ?? defaultAnalyticsState.performance,
      });
    } catch {
      setAnalytics(defaultAnalyticsState);
    }
  };

  const loadActiveScans = async () => {
    try {
      const data = await fetchJson("/active_scans");
      const nextScans = data.scans ?? [];
      setActiveScans(nextScans);
      return nextScans;
    } catch {
      setActiveScans([]);
      return [];
    }
  };

  const loadSelectedScan = async (scanId) => {
    if (!scanId) {
      setSelectedScanDetail(null);
      setSelectedScanLogs([]);
      setSelectedScanVulnerabilities([]);
      return null;
    }

    try {
      const [detail, logsResponse, vulnerabilitiesResponse] = await Promise.all([
        fetchJson(`/scan_status/${encodeURIComponent(scanId)}`),
        fetchJson(`/audit_logs/${encodeURIComponent(scanId)}`),
        fetchJson(`/vulnerabilities/${encodeURIComponent(scanId)}`),
      ]);

      if (selectedScanIdRef.current !== scanId) {
        return detail;
      }

      setSelectedScanDetail(detail);
      setSelectedScanLogs(logsResponse.logs ?? []);
      setSelectedScanVulnerabilities(vulnerabilitiesResponse.vulnerabilities ?? []);

      if (detail.proof_hash) {
        setProofHash(detail.proof_hash);
      }

      return detail;
    } catch {
      return null;
    }
  };

  const loadGlobalLogs = async () => {
    try {
      const response = await fetchJson("/contract/logs");
      setGlobalLogs(response.logs ?? []);
      return response.logs ?? [];
    } catch {
      setGlobalLogs([]);
      return [];
    }
  };

  useEffect(() => {
    let ignore = false;

    const bootstrap = async () => {
      await Promise.all([loadAgentInfo(), loadAnalytics(), loadGlobalLogs()]);
      const scans = await loadActiveScans();

      if (!ignore && scans.length > 0) {
        setSelectedScanId((current) => current || scans[0].scan_id);
      }
    };

    bootstrap();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    setSelectedVulnerability(null);
    setProofHash("");
    setCopyState("Copy Hash");
    setDetailsVulnerability((current) => (current?.scan_id === selectedScanId ? current : null));

    if (!selectedScanId) {
      setSelectedScanDetail(null);
      setSelectedScanLogs([]);
      setSelectedScanVulnerabilities([]);
      return;
    }

    loadSelectedScan(selectedScanId);
  }, [selectedScanId]);

  useEffect(() => {
    if (selectedScanVulnerabilities.length > 0 && (!selectedVulnerability || selectedVulnerability.scan_id !== selectedScanId)) {
      setSelectedVulnerability(selectedScanVulnerabilities[selectedScanVulnerabilities.length - 1]);
      setProofHash(selectedScanDetail?.proof_hash ?? "");
      return;
    }

    if (!selectedVulnerability) {
      return;
    }

    const stillExists = selectedScanVulnerabilities.find(
      (item) =>
        item.scan_id === selectedVulnerability.scan_id &&
        item.timestamp === selectedVulnerability.timestamp &&
        item.endpoint === selectedVulnerability.endpoint,
    );

    if (!stillExists) {
      setSelectedVulnerability(null);
      setProofHash(selectedScanDetail?.proof_hash ?? "");
      setCopyState("Copy Hash");
      return;
    }

    setSelectedVulnerability(stillExists);
  }, [selectedScanDetail?.proof_hash, selectedScanVulnerabilities, selectedVulnerability]);

  useEffect(() => {
    const refreshFromEvent = async (scanId) => {
      await Promise.all([loadActiveScans(), loadAnalytics(), loadGlobalLogs()]);

      // Only refresh the detailed module data when the incoming event belongs
      // to the scan the operator is actively inspecting.
      if (scanId && selectedScanIdRef.current === scanId) {
        await loadSelectedScan(scanId);
      }
    };

    const handleScanSnapshot = (payload) => {
      startTransition(() => {
        setActiveScans(payload.scans ?? []);
      });
    };

    const handleScanCreated = async (payload) => {
      if (!selectedScanIdRef.current) {
        await Promise.all([loadActiveScans(), loadAnalytics()]);
        await focusScan(payload.scan_id);
        return;
      }

      await Promise.all([loadActiveScans(), loadAnalytics()]);
    };

    const handleScanUpdate = async (payload) => {
      startTransition(() => {
        setActiveScans((current) => {
          const others = current.filter((scan) => scan.scan_id !== payload.scan_id);
          return [payload, ...others].sort((left, right) => new Date(right.created_at).getTime() - new Date(left.created_at).getTime());
        });
      });

      if (!selectedScanIdRef.current) {
        await focusScan(payload.scan_id);
        return;
      }

      await refreshFromEvent(payload.scan_id);
    };

    const handleContractEvent = async (payload) => {
      startTransition(() => {
        setGlobalLogs((current) => [payload, ...current.filter((log) => log.id !== payload.id)]);
      });

      if (payload.scan_id === selectedScanIdRef.current) {
        startTransition(() => {
          setSelectedScanLogs((current) => [payload, ...current.filter((log) => log.id !== payload.id)]);
        });
      }

      await refreshFromEvent(payload.scan_id);
    };

    const handleVulnerabilityUpdate = async (payload) => {
      startTransition(() => {
        setAnalytics((current) => ({
          ...current,
          totalScans: payload.total_scans ?? current.totalScans,
          vulnerabilitiesDetected: payload.vulnerabilities_detected ?? current.vulnerabilitiesDetected,
          exploitSuccessRate: payload.exploit_success_rate ?? current.exploitSuccessRate,
          avgConfidence: payload.avg_confidence ?? current.avgConfidence,
          timeline: payload.timeline ?? current.timeline,
          distribution: payload.distribution ?? current.distribution,
        }));
      });

      await refreshFromEvent(payload.scan_id);
    };

    const handleScanComplete = async (payload) => {
      await refreshFromEvent(payload.scan_id);
    };

    if (!socket.connected) {
      socket.connect();
    }

    socket.on("scan_snapshot", handleScanSnapshot);
    socket.on("scan_created", handleScanCreated);
    socket.on("scan_update", handleScanUpdate);
    socket.on("contract_event", handleContractEvent);
    socket.on("vulnerability_update", handleVulnerabilityUpdate);
    socket.on("scan_complete", handleScanComplete);

    return () => {
      socket.off("scan_snapshot", handleScanSnapshot);
      socket.off("scan_created", handleScanCreated);
      socket.off("scan_update", handleScanUpdate);
      socket.off("contract_event", handleContractEvent);
      socket.off("vulnerability_update", handleVulnerabilityUpdate);
      socket.off("scan_complete", handleScanComplete);
      socket.disconnect();
    };
  }, []);

  const handleSearchSubmit = (event) => {
    event.preventDefault();

    const normalizedQuery = searchValue.trim().toLowerCase();

    if (!normalizedQuery) {
      navigate(paths.dashboard);
      return;
    }

    const matchedRoute = routeDefinitions.find(
      (route) =>
        route.label.toLowerCase().includes(normalizedQuery) ||
        route.keywords.some((keyword) => keyword.includes(normalizedQuery)),
    );

    if (matchedRoute) {
      navigate(matchedRoute.path);
    }
  };

  const handleConfigChange = (field, value) => {
    setConfig((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSaveConfig = () => {
    setScanForm((current) => ({
      ...current,
      target: config.targetUrl,
    }));
    setIsConfigureOpen(false);
  };

  const focusScan = async (scanId) => {
    if (!scanId) {
      return;
    }

    selectedScanIdRef.current = scanId;
    startTransition(() => {
      setSelectedScanId(scanId);
    });
    await loadSelectedScan(scanId);
  };

  const handleScanFormChange = (field, value) => {
    setScanForm((current) => {
      if (field === "target_type") {
        const nextTargetType = value;
        const scanTypeByTarget = {
          website: "web_security",
          api: "api_security",
          github: "code_review",
          zip: "code_review",
        };

        return {
          ...current,
          target_type: nextTargetType,
          scan_type: scanTypeByTarget[nextTargetType] ?? current.scan_type,
          target:
            nextTargetType === "website"
              ? "https://store.acme.com"
              : nextTargetType === "api"
                ? "https://api.acme.com/v1"
                : nextTargetType === "github"
                  ? "https://github.com/acme/security-app"
                  : "",
          zip_file_name: nextTargetType === "zip" ? current.zip_file_name : "",
          entry_point: nextTargetType === "zip" || nextTargetType === "github" ? current.entry_point : "",
        };
      }

      return {
        ...current,
        [field]: value,
      };
    });
  };

  const handleSubmitScan = async (event) => {
    event?.preventDefault?.();
    setSubmittingScan(true);

    try {
      const data = await fetchJson("/start_scan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(buildScanPayload(scanForm)),
      });

      await Promise.all([loadActiveScans(), loadAnalytics()]);
      await focusScan(data.scan_id);

      navigate(paths.dashboard);
    } finally {
      setSubmittingScan(false);
    }
  };

  const handleSelectProofCandidate = (vulnerability) => {
    setSelectedVulnerability(vulnerability);
    setProofHash(selectedScanDetail?.proof_hash ?? "");
    setCopyState("Copy Hash");
    navigate(paths.proof);
  };

  const handleGenerateProofHash = async () => {
    if (!selectedVulnerability) {
      return;
    }

    setHashGenerating(true);
    setCopyState("Copy Hash");

    try {
      const nextProofHash = await generateProofHashForVulnerability(selectedVulnerability);
      setProofHash(nextProofHash);
    } finally {
      setHashGenerating(false);
    }
  };

  const handleCopyProofHash = async () => {
    if (!proofHash) {
      return;
    }

    try {
      await navigator.clipboard.writeText(proofHash);
      setCopyState("Copied");
    } catch {
      setCopyState("Copy Failed");
    }
  };

  const refreshSelectedScanArtifacts = async () => {
    await Promise.all([loadActiveScans(), loadAnalytics()]);

    if (selectedScanIdRef.current) {
      await loadSelectedScan(selectedScanIdRef.current);
    }
  };

  const handleDepositBounty = async () => {
    if (!selectedScanId) {
      return;
    }

    setContractActionLoading("deposit");

    try {
      await fetchJson("/contract/deposit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          scan_id: selectedScanId,
          amount: selectedScan?.bounty ?? scanForm.bounty,
        }),
      });
      await refreshSelectedScanArtifacts();
    } finally {
      setContractActionLoading("");
    }
  };

  const handleEscrowSubmitProof = async () => {
    if (!selectedVulnerability || !proofHash) {
      return;
    }

    setContractActionLoading("submit");

    try {
      await fetchJson("/contract/submit-proof", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          scan_id: selectedVulnerability.scan_id,
          vulnerability: selectedVulnerability.vulnerability,
          endpoint: selectedVulnerability.endpoint,
          severity: selectedVulnerability.severity,
          proof_hash: proofHash,
          confidence: selectedVulnerability.confidence,
        }),
      });
      await refreshSelectedScanArtifacts();
      navigate(paths.escrow);
    } finally {
      setContractActionLoading("");
    }
  };

  const handleReleaseBounty = async () => {
    if (!selectedScanId) {
      return;
    }

    setContractActionLoading("release");

    try {
      await fetchJson("/contract/release", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          scan_id: selectedScanId,
        }),
      });
      await refreshSelectedScanArtifacts();
    } finally {
      setContractActionLoading("");
    }
  };

  let page = null;

  switch (currentPath) {
    case paths.scan:
      page = (
        <ScanActivityPage
          events={events}
          scanRunning={scanRunning}
          onStartScan={handleSubmitScan}
          onNavigate={navigate}
          dashboardPath={paths.dashboard}
        />
      );
      break;
    case paths.vulnerabilities:
      page = (
        <VulnerabilityAnalysisPage
          vulnerabilities={vulnerabilities}
          onViewDetails={setDetailsVulnerability}
          onGenerateProof={handleSelectProofCandidate}
          onNavigate={navigate}
          dashboardPath={paths.dashboard}
          proofPath={paths.proof}
        />
      );
      break;
    case paths.proof:
      page = (
        <ProofEnginePage
          vulnerabilities={vulnerabilities}
          selectedVulnerability={selectedVulnerability}
          proofHash={proofHash}
          hashGenerating={hashGenerating}
          copyState={copyState}
          onSelectVulnerability={handleSelectProofCandidate}
          onGenerateProof={handleGenerateProofHash}
          onCopyProof={handleCopyProofHash}
          onSubmitProof={handleEscrowSubmitProof}
          onNavigate={navigate}
          dashboardPath={paths.dashboard}
        />
      );
      break;
    case paths.escrow:
      page = (
        <EscrowManagementPage
          contractState={contractState}
          proofReady={proofReady}
          proofEligible={proofEligible}
          actionLoading={contractActionLoading}
          onDeposit={handleDepositBounty}
          onSubmitProof={handleEscrowSubmitProof}
          onRelease={handleReleaseBounty}
          onNavigate={navigate}
          dashboardPath={paths.dashboard}
          auditPath={paths.audit}
        />
      );
      break;
    case paths.audit:
      page = <AuditLedgerPage logs={globalLogs} onNavigate={navigate} dashboardPath={paths.dashboard} />;
      break;
    default:
      page = (
        <DashboardPage
          analytics={analytics}
          selectedScan={selectedScan}
          scanForm={scanForm}
          submittingScan={submittingScan}
          activeScans={activeScans}
          selectedScanId={selectedScanId}
          events={events}
          vulnerabilities={vulnerabilities}
          logs={logs}
          onSelectScan={setSelectedScanId}
          onScanFormChange={handleScanFormChange}
          onSubmitScan={handleSubmitScan}
          onViewDetails={setDetailsVulnerability}
          onGenerateProof={handleSelectProofCandidate}
          onNavigate={navigate}
          paths={paths}
        />
      );
  }

  return (
    <div className="min-h-screen">
      <div className="flex min-h-screen gap-4 p-4 md:p-5">
        <Sidebar sections={navigationSections} currentPath={currentPath} onNavigate={navigate} />

        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <TopNavigation
            currentRoute={currentRoute}
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            onSearchSubmit={handleSearchSubmit}
            notificationCount={notificationCount}
          />

          <AnimatePresence mode="wait">
            <motion.main
              key={`${currentPath}-${selectedScanId || "none"}`}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.24 }}
              className="mx-auto w-full max-w-[1680px] space-y-6"
            >
              <PageErrorBoundary resetKey={`${currentPath}-${selectedScanId || "none"}`}>
                {page}
              </PageErrorBoundary>
            </motion.main>
          </AnimatePresence>
        </div>
      </div>

      <ConfigureAgentModal
        isOpen={isConfigureOpen}
        config={config}
        onClose={() => setIsConfigureOpen(false)}
        onChange={handleConfigChange}
        onSave={handleSaveConfig}
      />
      <VulnerabilityDetailsModal
        vulnerability={detailsVulnerability}
        onClose={() => setDetailsVulnerability(null)}
      />
    </div>
  );
}
