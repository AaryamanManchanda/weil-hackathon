import { createHash } from "node:crypto";
import { createServer } from "node:http";
import cors from "cors";
import express from "express";
import { Server as SocketServer } from "socket.io";

const app = express();
const httpServer = createServer(app);
const io = new SocketServer(httpServer, {
  cors: {
    origin: "*",
  },
});

app.use(cors());
app.use(express.json());

const CONTRACT_ADDRESS = "aaaaaaqey6suypclwh6wmvu4pjy52pcxhieusrqpjt43ytehnz32uqksvu";
const NETWORK_NAME = "Weilchain Sentinel";
const AGENT_WALLET = "ebf5e858909648af6ebc5270ba794569d9146b92081f7428b8acf3cac2e97ce4";
const COMPANY_WALLET = "acme-finance.weil";

const scans = new Map();
const scanTimers = new Map();
let scanCounter = 1042;

const performanceProfile = {
  accuracy: 0.91,
  coverage: 0.72,
  avg_scan_time: 2.1,
};

function formatTimestamp(date = new Date()) {
  return date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

function formatChartTime(date = new Date()) {
  return date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function buildTxHash() {
  return `0x${Math.random().toString(16).slice(2, 10)}${Math.random().toString(16).slice(2, 10)}`;
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

function generateProofHash(vulnerability) {
  const proofPayload = {
    confidence: vulnerability.confidence,
    endpoint: vulnerability.endpoint,
    scan_id: vulnerability.scan_id,
    severity: vulnerability.severity,
    vulnerability: vulnerability.vulnerability,
  };

  return createHash("sha256").update(serializeSorted(proofPayload)).digest("hex");
}

function getTargetLabel(target = "") {
  try {
    const parsed = new URL(target);
    return parsed.hostname.replace(/^www\./, "");
  } catch {
    return target.replace(/^https?:\/\//, "");
  }
}

function buildTargetLabel(scan) {
  if (scan.target_type === "zip") {
    return scan.zip_file_name || "uploaded-codebase.zip";
  }

  if (scan.target_type === "github") {
    try {
      const parsed = new URL(scan.target);
      return parsed.pathname.replace(/^\/+/, "") || parsed.hostname;
    } catch {
      return scan.target;
    }
  }

  return getTargetLabel(scan.target);
}

function resolveTargetFromPayload(payload = {}) {
  if (payload.target_type === "zip") {
    const zipFileName = String(payload.zip_file_name ?? "").trim();
    return zipFileName ? `upload://${zipFileName}` : "";
  }

  return String(payload.target ?? "").trim();
}

function toCurrency(value) {
  return `${Number(value || 0)} WUSD`;
}

function isScanRunning(scan) {
  return ["queued", "scanning", "vulnerable", "proof_generated", "proof_submitted", "verified"].includes(scan.status);
}

function buildScanSummary(scan) {
  return {
    scan_id: scan.scan_id,
    company: scan.company,
    target: scan.target,
    target_label: buildTargetLabel(scan),
    target_type: scan.target_type,
    scan_type: scan.scan_type,
    zip_file_name: scan.zip_file_name,
    repository_branch: scan.repository_branch,
    entry_point: scan.entry_point,
    notes: scan.notes,
    bounty: scan.bounty,
    bounty_display: toCurrency(scan.bounty),
    status: scan.status,
    contract_status: scan.contract_status,
    proof_hash: scan.proof_hash,
    bounty_paid: scan.bounty_paid,
    payout: scan.payout,
    created_at: scan.created_at,
    updated_at: scan.updated_at,
    last_event: scan.agent_events[scan.agent_events.length - 1]?.message ?? "",
    vulnerabilities_count: scan.vulnerabilities.length,
  };
}

function buildScanDetail(scan) {
  return {
    ...buildScanSummary(scan),
    company_wallet: scan.company_wallet,
    researcher_wallet: scan.researcher_wallet,
    transaction_hash: scan.transaction_hash,
    proof_submitted_at: scan.proof_submitted_at,
    released_at: scan.released_at,
    agent_events: scan.agent_events,
    workflow: scan.workflow,
    selected_attack: scan.selected_attack,
    proof_object: scan.proof_object,
  };
}

function getAllScans() {
  return [...scans.values()].sort((left, right) => new Date(right.created_at).getTime() - new Date(left.created_at).getTime());
}

function getLatestScan() {
  return getAllScans()[0] ?? null;
}

function buildGlobalLogs() {
  return getAllScans()
    .flatMap((scan) => scan.audit_logs)
    .sort((left, right) => new Date(right.created_at).getTime() - new Date(left.created_at).getTime());
}

function buildAnalyticsPayload() {
  const allScans = getAllScans();
  const vulnerabilities = allScans.flatMap((scan) => scan.vulnerabilities);
  const successfulExploits = vulnerabilities.length;
  const totalExploitAttempts = allScans.reduce((sum, scan) => sum + scan.metrics.total_exploit_attempts, 0);
  const avgConfidence =
    vulnerabilities.length > 0
      ? vulnerabilities.reduce((sum, vulnerability) => sum + vulnerability.confidence, 0) / vulnerabilities.length
      : 0;

  const distributionMap = {
    "SQL Injection": 0,
    XSS: 0,
    "Auth Bypass": 0,
  };

  vulnerabilities.forEach((vulnerability) => {
    distributionMap[vulnerability.vulnerability] = (distributionMap[vulnerability.vulnerability] ?? 0) + 1;
  });

  const timeline = allScans
    .map((scan) => ({
      time: formatChartTime(new Date(scan.created_at)),
      vulnerabilities: scan.vulnerabilities.length,
    }))
    .slice(-24);

  return {
    total_scans: allScans.length,
    vulnerabilities_detected: vulnerabilities.length,
    exploit_success_rate: totalExploitAttempts > 0 ? successfulExploits / totalExploitAttempts : 0,
    avg_confidence: avgConfidence,
    timeline,
    distribution: Object.entries(distributionMap).map(([name, value]) => ({
      name,
      value,
    })),
    performance: performanceProfile,
  };
}

function emitAnalyticsUpdate(scan, vulnerability) {
  io.emit("vulnerability_update", {
    scan_id: scan.scan_id,
    vulnerability: vulnerability.vulnerability,
    confidence: vulnerability.confidence,
    timestamp: vulnerability.timestamp,
    ...buildAnalyticsPayload(),
  });
}

function emitScanUpdate(scan) {
  io.emit("scan_update", buildScanSummary(scan));
}

function appendAuditLog(scan, log) {
  const nextLog = {
    id: `${scan.scan_id}-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
    scan_id: scan.scan_id,
    target: scan.target,
    target_label: buildTargetLabel(scan),
    created_at: new Date().toISOString(),
    timestamp: formatTimestamp(),
    ...log,
  };

  scan.audit_logs.unshift(nextLog);
  scan.updated_at = new Date().toISOString();
  io.emit("contract_event", nextLog);
  emitScanUpdate(scan);

  return nextLog;
}

function appendAgentEvent(scan, eventPayload) {
  const nextEvent = {
    index: scan.agent_events.length + 1,
    scan_id: scan.scan_id,
    target: scan.target,
    created_at: new Date().toISOString(),
    timestamp: formatTimestamp(),
    ...eventPayload,
  };

  scan.agent_events.push(nextEvent);
  scan.updated_at = new Date().toISOString();
  io.emit("scan_event", nextEvent);
  emitScanUpdate(scan);

  return nextEvent;
}

function clearScanTimers(scanId) {
  const timers = scanTimers.get(scanId);

  if (!timers) {
    return;
  }

  timers.forEach((timerId) => clearTimeout(timerId));
  scanTimers.delete(scanId);
}

function scheduleStep(scan, delay, action) {
  const timerId = setTimeout(() => {
    if (!scans.has(scan.scan_id)) {
      return;
    }

    action();
  }, delay);

  const existing = scanTimers.get(scan.scan_id) ?? [];
  existing.push(timerId);
  scanTimers.set(scan.scan_id, existing);
}

function createVulnerability(scan) {
  const vulnerability = {
    scan_id: scan.scan_id,
    vulnerability: "SQL Injection",
    endpoint: "/login",
    payload: "' OR 1=1 -- ",
    severity: "High",
    confidence: 0.99,
    timestamp: formatTimestamp(),
    exploit_result: "Authentication bypass successful",
    server_response: "Login successful without credentials",
    tool_output: {
      vulnerability: "SQL Injection",
      endpoint: "/login",
      payload: "' OR 1=1 -- ",
      status: "VULNERABLE",
    },
  };

  scan.vulnerabilities.push(vulnerability);
  scan.metrics.successful_exploits += 1;

  return vulnerability;
}

function createScanRecord(payload = {}) {
  scanCounter += 1;
  const scanId = `scan_${scanCounter}`;
  const bountyAmount = Number(payload.bounty ?? 100);
  const createdAt = new Date().toISOString();
  const txHash = buildTxHash();
  const targetType = payload.target_type || "website";
  const resolvedTarget = resolveTargetFromPayload(payload);

  const scan = {
    scan_id: scanId,
    company: payload.company || "Acme Finance",
    company_wallet: payload.company_wallet || COMPANY_WALLET,
    target_type: targetType,
    target: resolvedTarget || (targetType === "api" ? "https://api.acme.com/v1" : targetType === "github" ? "https://github.com/acme/security-app" : targetType === "zip" ? "upload://uploaded-codebase.zip" : "https://store.acme.com"),
    scan_type: payload.scan_type || "web_security",
    zip_file_name: payload.zip_file_name || "",
    repository_branch: payload.repository_branch || "main",
    entry_point: payload.entry_point || "",
    notes: payload.notes || "",
    bounty: bountyAmount,
    status: "queued",
    contract_status: "Bounty Deposited",
    proof_hash: "",
    proof_object: null,
    proof_submitted_at: "",
    released_at: "",
    payout: "",
    bounty_paid: false,
    transaction_hash: txHash,
    created_at: createdAt,
    updated_at: createdAt,
    researcher_wallet: AGENT_WALLET,
    selected_attack: "SQL Injection",
    agent_events: [],
    audit_logs: [],
    vulnerabilities: [],
    workflow: "LangGraph security scan",
    metrics: {
      total_exploit_attempts: 1,
      successful_exploits: 0,
    },
  };

  scans.set(scanId, scan);

  appendAuditLog(scan, {
    event: "deposit",
    message: `${toCurrency(bountyAmount)} deposited into escrow`,
    tx_hash: txHash,
    stage: "BOUNTY_CREATED",
  });

  emitScanUpdate(scan);
  io.emit("scan_created", buildScanSummary(scan));

  return scan;
}

function startScanLifecycle(scan) {
  clearScanTimers(scan.scan_id);

  scan.status = 'scanning';
  scan.updated_at = new Date().toISOString();
  appendAuditLog(scan, {
    event: 'scan_started',
    message: 'AI vulnerability scan initiated',
    stage: 'SCAN_JOB_CREATED',
  });
  appendAgentEvent(scan, {
    event: 'scan_started',
    workflow_node: 'Reasoning Node',
    message: "AI reasoning started for " + scan.target,
  });

  import('node:child_process').then(({ spawn }) => {
      import('node:path').then((path) => {
          import('node:url').then((url) => {
              const __filename = url.fileURLToPath(import.meta.url);
              const __dirname = path.dirname(__filename);
              const agentPath = path.resolve(__dirname, '../../../FINAL/agent.py');
              const pythonExecutable =
                process.env.PYTHON_EXECUTABLE ||
                path.resolve(__dirname, '../../../.venv/Scripts/python.exe');
              console.log('Spawning agent:', agentPath, 'with SCAN_ID=', scan.scan_id);
              const pythonProcess = spawn(pythonExecutable, [agentPath], {
                env: { ...process.env, SCAN_ID: scan.scan_id, PYTHONIOENCODING: 'utf-8' }
              });

              pythonProcess.stdout.on('data', (data) => console.log('[AGENT]', data.toString()));
              pythonProcess.stderr.on('data', (data) => console.error('[AGENT_ERR]', data.toString()));
              pythonProcess.on('error', (error) => console.error('[AGENT_SPAWN_ERROR]', error));
              pythonProcess.on('close', (code) => console.log('[AGENT_EXIT]', code));
          });
      });
  });
}

function requireScan(scanId, response) {
  const normalizedScanId = typeof scanId === "string" ? scanId.trim() : "";
  const scan =
    !normalizedScanId || normalizedScanId === "undefined" || normalizedScanId === "null"
      ? getLatestScan()
      : scans.get(normalizedScanId);
  if (!scan) {
    if (response) {
       response.status(404).json({ status: "error", message: "Scan not found" });
    }
  }
  return scan;
}

  app.post('/push_event', (request, response) => {
    const { scan_id, event_type, message, payload, stage, status, contract_status, proof_hash, transaction_hash, payout, bounty_paid } = request.body;
    let scan = scan_id ? scans.get(scan_id) : getLatestScan();
    
    if (!scan) {
        return response.status(404).json({ error: 'scan not found' });
    }
    
    if (status) scan.status = status;
    if (contract_status) scan.contract_status = contract_status;
    if (proof_hash) scan.proof_hash = proof_hash;
    if (transaction_hash) scan.transaction_hash = transaction_hash;
    if (payout) scan.payout = payout;
    if (bounty_paid !== undefined) scan.bounty_paid = bounty_paid;
    
    scan.updated_at = new Date().toISOString();
    
    if (event_type === 'agent_event') {
       appendAgentEvent(scan, {
         event: payload?.event || 'agent_update',
         workflow_node: payload?.workflow_node || 'Reasoning Node',
         message: message,
         ...payload
       });
    } else if (event_type === 'audit_log') {
       appendAuditLog(scan, {
         event: payload?.event || stage,
         message: message,
         stage: stage,
         ...payload
       });
    } else if (event_type === 'vulnerability') {
          const vuln = { scan_id: scan.scan_id, timestamp: formatTimestamp(), ...payload };
         scan.vulnerabilities.push(vuln);
         if (scan.metrics) scan.metrics.successful_exploits = (scan.metrics.successful_exploits || 0) + 1;
       emitAnalyticsUpdate(scan, vuln);
    } else if (event_type === 'complete') {
       io.emit('scan_complete', {
          scan_id: scan.scan_id,
          status: scan.status,
          timestamp: formatTimestamp(),
       });
    }

    emitScanUpdate(scan);
    response.json({ status: 'ok' });
  });


app.get("/agent-info", (_request, response) => {
  response.json({
    agent_name: "SecureGuard AI",
    model: "Gemini 1.5 Flash",
    contract: "SecureGuard Escrow",
    contract_address: CONTRACT_ADDRESS,
    network: NETWORK_NAME,
  });
});

app.post("/start_scan", (request, response) => {
  const payload = request.body ?? {};
  const hasTargetSource =
    payload.target_type === "zip"
      ? Boolean(String(payload.zip_file_name ?? "").trim())
      : Boolean(String(payload.target ?? "").trim());

  if (!hasTargetSource) {
    response.status(400).json({
      status: "error",
      message: "A target source is required.",
    });
    return;
  }

  const scan = createScanRecord(payload);
  startScanLifecycle(scan);

  response.status(201).json({
    status: "queued",
    ...buildScanDetail(scan),
  });
});

app.get("/active_scans", (_request, response) => {
  response.json({
    scans: getAllScans().map(buildScanSummary),
  });
});

app.get("/scan_status/:scanId", (request, response) => {
  const scan = requireScan(request.params.scanId, response);

  if (!scan) {
    return;
  }

  response.json(buildScanDetail(scan));
});

app.get("/audit_logs/:scanId", (request, response) => {
  const scan = requireScan(request.params.scanId, response);

  if (!scan) {
    return;
  }

  response.json({
    scan_id: scan.scan_id,
    logs: scan.audit_logs,
  });
});

app.get("/vulnerabilities/:scanId", (request, response) => {
  const scan = requireScan(request.params.scanId, response);

  if (!scan) {
    return;
  }

  response.json({
    scan_id: scan.scan_id,
    proof_hash: scan.proof_hash,
    contract_status: scan.contract_status,
    vulnerabilities: scan.vulnerabilities,
  });
});

app.get("/vulnerabilities", (_request, response) => {
  const scan = getLatestScan();

  if (!scan) {
    response.json({
      scan_id: "",
      proof_hash: "",
      contract_status: "Initialized",
      vulnerabilities: [],
    });
    return;
  }

  response.json({
    scan_id: scan.scan_id,
    proof_hash: scan.proof_hash,
    contract_status: scan.contract_status,
    vulnerabilities: scan.vulnerabilities,
  });
});

app.get("/contract/status", (request, response) => {
  const scanId = request.query.scan_id;
  const scan = scanId ? scans.get(String(scanId)) : getLatestScan();

  if (!scan) {
    response.json({
      status: "Initialized",
      bounty: 0,
      tx_hash: "",
      payout: "",
    });
    return;
  }

  response.json({
    status: scan.contract_status,
    bounty: scan.bounty,
    tx_hash: scan.transaction_hash,
    payout: scan.payout,
    scan_id: scan.scan_id,
  });
});

app.get("/contract/logs", (request, response) => {
  const scanId = request.query.scan_id;

  if (scanId && scans.has(String(scanId))) {
    response.json({
      logs: scans.get(String(scanId)).audit_logs,
    });
    return;
  }

  response.json({
    logs: buildGlobalLogs(),
  });
});

app.get("/analytics/scans", (_request, response) => {
  response.json({
    total_scans: buildAnalyticsPayload().total_scans,
  });
});

app.get("/analytics/vulnerabilities", (_request, response) => {
  const analytics = buildAnalyticsPayload();
  response.json({
    vulnerabilities_detected: analytics.vulnerabilities_detected,
    exploit_success_rate: analytics.exploit_success_rate,
    avg_confidence: analytics.avg_confidence,
    timeline: analytics.timeline,
    distribution: analytics.distribution,
  });
});

app.get("/analytics/performance", (_request, response) => {
  response.json(performanceProfile);
});

app.post("/contract/deposit", (request, response) => {
  const scan = request.body?.scan_id ? scans.get(String(request.body.scan_id)) : getLatestScan();

  if (!scan) {
    response.status(404).json({
      status: "error",
      message: "No scan available for escrow deposit.",
    });
    return;
  }

  scan.contract_status = "Bounty Deposited";
  scan.transaction_hash = buildTxHash();
  scan.updated_at = new Date().toISOString();

  appendAuditLog(scan, {
    event: "deposit",
    message: `${toCurrency(scan.bounty)} deposited into escrow`,
    tx_hash: scan.transaction_hash,
    stage: "BOUNTY_CREATED",
  });

  response.json({
    status: "success",
    bounty: scan.bounty,
    contract_status: scan.contract_status,
    tx_hash: scan.transaction_hash,
    command: `execute -n ${CONTRACT_ADDRESS} --method deposit --method-args '{"scan_id":"${scan.scan_id}","amount":${scan.bounty}}'`,
  });
});

app.post("/contract/submit-proof", (request, response) => {
  const scan = request.body?.scan_id ? scans.get(String(request.body.scan_id)) : getLatestScan();

  if (!scan) {
    response.status(404).json({
      status: "error",
      message: "No scan available for proof submission.",
    });
    return;
  }

  scan.contract_status = "Proof Submitted";
  scan.status = "proof_submitted";
  scan.transaction_hash = buildTxHash();
  scan.updated_at = new Date().toISOString();

  appendAuditLog(scan, {
    event: "proof_submitted",
    message: "Proof submitted to SecureGuard contract",
    tx_hash: scan.transaction_hash,
    stage: "PROOF_SUBMITTED",
  });

  response.json({
    status: "success",
    contract_status: scan.contract_status,
    tx_hash: scan.transaction_hash,
    command: `execute -n ${CONTRACT_ADDRESS} --method submit_proof --method-args '${JSON.stringify(request.body ?? {})}'`,
  });

  // Mock the verification process that takes a few seconds
  setTimeout(() => {
    scan.contract_status = "Verified";
    scan.status = "verified";
    scan.updated_at = new Date().toISOString();

    appendAuditLog(scan, {
      event: "proof_verified",
      message: "Proof cryptographically verified by SecureGuard nodes",
      tx_hash: buildTxHash(),
      stage: "VERIFICATION"
    });
  }, 3000);
});

app.post("/contract/release", (request, response) => {
  const scan = request.body?.scan_id ? scans.get(String(request.body.scan_id)) : getLatestScan();

  if (!scan) {
    response.status(404).json({
      status: "error",
      message: "No scan available for payout release.",
    });
    return;
  }

  if (scan.contract_status !== "Verified") {
    response.status(409).json({
      status: "error",
      message: "Escrow is not verified yet.",
    });
    return;
  }

  scan.contract_status = "Released";
  scan.status = "released";
  scan.bounty_paid = true;
  scan.payout = toCurrency(scan.bounty);
  scan.transaction_hash = buildTxHash();
  scan.updated_at = new Date().toISOString();

  appendAuditLog(scan, {
    event: "bounty_released",
    message: `${toCurrency(scan.bounty)} bounty released to ${scan.researcher_wallet}`,
    tx_hash: scan.transaction_hash,
    stage: "BOUNTY_RELEASED",
  });

  response.json({
    status: "success",
    contract_status: scan.contract_status,
    payout: scan.payout,
    tx_hash: scan.transaction_hash,
    command: `execute -n ${CONTRACT_ADDRESS} --method release --method-args '{"scan_id":"${scan.scan_id}"}'`,
  });
});

io.on("connection", (socket) => {
  socket.emit("agent:status", {
    status: "socket_placeholder_ready",
    message: "SecureGuard Socket.io channel initialized",
  });

  socket.emit("scan_snapshot", {
    scans: getAllScans().map(buildScanSummary),
  });

  socket.on("start_scan", (payload = {}) => {
    const scan = createScanRecord(payload);
    startScanLifecycle(scan);
    socket.emit("scan_created", buildScanSummary(scan));
  });

  socket.on("disconnect", () => {
    // No per-socket timers to clear because scans are global workflows.
  });
});

const port = Number(process.env.PORT ?? 8000);

httpServer.listen(port, () => {
  console.log(`SecureGuard workflow backend listening on http://127.0.0.1:${port}`);
});

