import { PageHeader } from "../components/PageHeader";
import { SubmitScanPanel } from "../components/SubmitScanPanel";
import { ActiveScansPanel } from "../components/ActiveScansPanel";

function FlowStepCard({ step, title, description, active = false }) {
  return (
    <article
      className={`rounded-[22px] border p-4 transition ${
        active
          ? "border-primary/20 bg-card shadow-sm shadow-stone-200/70"
          : "border-border bg-[#f6f4ef]"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-white text-xs font-semibold text-text-primary">
          {step}
        </div>
        <div>
          <p className="text-sm font-semibold text-text-primary">{title}</p>
          <p className="mt-1 text-xs leading-5 text-text-secondary">{description}</p>
        </div>
      </div>
    </article>
  );
}

function MissionStatusCard({ selectedScan, onNavigate, paths }) {
  const status = selectedScan?.status?.replaceAll("_", " ") ?? "No scan selected";
  const contractStatus = selectedScan?.contract_status ?? "Awaiting bounty";
  const bounty = selectedScan?.bounty_display ?? "Not created";
  const sourceType = selectedScan?.target_type?.replaceAll("_", " ") ?? "Awaiting source";

  return (
    <section className="panel-surface p-5 md:p-6">
      <div className="mb-5">
        <p className="text-sm font-semibold text-text-primary">Current Mission</p>
        <p className="text-xs uppercase tracking-[0.24em] text-text-secondary">Track the scan you want to inspect in the pages on the left</p>
      </div>

      {!selectedScan ? (
        <div className="rounded-2xl border border-dashed border-border bg-[#f6f4ef] p-8 text-center">
          <p className="text-text-primary">No scan selected yet.</p>
          <p className="mt-2 text-sm text-text-secondary">Create a scan, then choose it from Active Scans to inspect activity, findings, proofs, and audit logs.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-[#f6f4ef] p-4">
            <p className="text-[10px] uppercase tracking-[0.18em] text-text-secondary">Selected Scan</p>
            <p className="mt-2 font-mono text-sm text-text-primary">{selectedScan.scan_id}</p>
            <p className="mt-2 text-sm text-text-secondary">{selectedScan.company} • {selectedScan.target_label}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-border bg-[#f6f4ef] p-4">
              <p className="text-[10px] uppercase tracking-[0.18em] text-text-secondary">Status</p>
              <p className="mt-2 text-sm font-semibold text-text-primary">{status}</p>
            </div>
            <div className="rounded-2xl border border-border bg-[#f6f4ef] p-4">
              <p className="text-[10px] uppercase tracking-[0.18em] text-text-secondary">Bounty</p>
              <p className="mt-2 text-sm font-semibold text-text-primary">{bounty}</p>
            </div>
            <div className="rounded-2xl border border-border bg-[#f6f4ef] p-4">
              <p className="text-[10px] uppercase tracking-[0.18em] text-text-secondary">Contract</p>
              <p className="mt-2 text-sm font-semibold text-text-primary">{contractStatus}</p>
            </div>
            <div className="rounded-2xl border border-border bg-[#f6f4ef] p-4">
              <p className="text-[10px] uppercase tracking-[0.18em] text-text-secondary">Source Type</p>
              <p className="mt-2 text-sm font-semibold capitalize text-text-primary">{sourceType}</p>
            </div>
            <div className="rounded-2xl border border-border bg-[#f6f4ef] p-4">
              <p className="text-[10px] uppercase tracking-[0.18em] text-text-secondary">Findings</p>
              <p className="mt-2 text-sm font-semibold text-text-primary">{selectedScan.vulnerabilities_count ?? 0}</p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => onNavigate(paths.scan)}
              className="rounded-xl border border-border bg-white px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-text-primary transition hover:border-primary/20"
            >
              Open Activity
            </button>
            <button
              type="button"
              onClick={() => onNavigate(paths.audit)}
              className="rounded-xl border border-primary bg-primary px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-white"
            >
              Open Audit Logs
            </button>
          </div>
        </div>
      )}

      <div className="mt-4 rounded-2xl border border-border bg-white p-4">
        <p className="text-[10px] uppercase tracking-[0.18em] text-text-secondary">Integrated Runtime</p>
        <div className="mt-3 grid gap-3 text-xs text-text-secondary sm:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-xl border border-border bg-[#f6f4ef] p-3">
            <p className="font-semibold text-text-primary">Target App</p>
            <p className="mt-1 font-mono">integrations/final/app.py</p>
          </div>
          <div className="rounded-xl border border-border bg-[#f6f4ef] p-3">
            <p className="font-semibold text-text-primary">Agent Engine</p>
            <p className="mt-1 font-mono">integrations/final/agent.py</p>
          </div>
          <div className="rounded-xl border border-border bg-[#f6f4ef] p-3">
            <p className="font-semibold text-text-primary">Event Backend</p>
            <p className="mt-1 font-mono">integrations/final/backend.py</p>
          </div>
          <div className="rounded-xl border border-border bg-[#f6f4ef] p-3">
            <p className="font-semibold text-text-primary">Security Tools</p>
            <p className="mt-1 font-mono">integrations/final/security_tools.py</p>
          </div>
          <div className="rounded-xl border border-border bg-[#f6f4ef] p-3">
            <p className="font-semibold text-text-primary">Escrow Contract Source</p>
            <p className="mt-1 font-mono">integrations/secureguard_contract/src/main.cpp</p>
          </div>
          <div className="rounded-xl border border-border bg-[#f6f4ef] p-3">
            <p className="font-semibold text-text-primary">Contract Interface</p>
            <p className="mt-1 font-mono">integrations/secureguard_contract/secureguard.widl</p>
          </div>
          <div className="rounded-xl border border-border bg-[#f6f4ef] p-3">
            <p className="font-semibold text-text-primary">WASM Build Artifact</p>
            <p className="mt-1 font-mono">integrations/secureguard_contract/build/counter.wasm</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function DashboardPage({
  analytics,
  selectedScan,
  scanForm,
  submittingScan,
  activeScans,
  selectedScanId,
  onSelectScan,
  onScanFormChange,
  onSubmitScan,
  onNavigate,
  paths,
}) {
  const steps = [
    {
      step: "01",
      title: "Submit Target",
      description: "Choose a website, API, GitHub repository, or ZIP codebase and define the bounty scope.",
    },
    {
      step: "02",
      title: "AI Security Scan",
      description: "The agent reasons, executes tools, and verifies exploit paths.",
    },
    {
      step: "03",
      title: "Blockchain Proof",
      description: "Proofs and Weilchain audit logs are generated from confirmed findings.",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="SecureGuard AI"
        title="Launch a new autonomous security mission"
        description="Start a new bounty-backed scan for a live website, API, GitHub repository, or ZIP codebase from this page, then use the left-side modules to inspect AI activity, vulnerabilities, proof generation, escrow, and audit history."
        status={selectedScan ? `${selectedScan.scan_id} selected` : "Ready for new submission"}
        stats={[
          { label: "Total Scans", value: analytics.totalScans },
          { label: "Findings", value: analytics.vulnerabilitiesDetected },
          { label: "Queued Jobs", value: activeScans.length },
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(320px,0.9fr)_minmax(0,1.1fr)]">
        <SubmitScanPanel form={scanForm} onChange={onScanFormChange} onSubmit={onSubmitScan} submitting={submittingScan} />
        <MissionStatusCard selectedScan={selectedScan} onNavigate={onNavigate} paths={paths} />
      </div>

      <section className="panel-surface p-5 md:p-6">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-text-primary">How SecureGuard AI Works</p>
            <p className="text-xs uppercase tracking-[0.24em] text-text-secondary">Hackathon-ready mission flow</p>
          </div>
        </div>
        <div className="grid gap-4 xl:grid-cols-3">
          {steps.map((item, index) => (
            <FlowStepCard key={item.step} {...item} active={index === 0} />
          ))}
        </div>
      </section>

      <ActiveScansPanel scans={activeScans} selectedScanId={selectedScanId} onSelect={onSelectScan} />
    </div>
  );
}
