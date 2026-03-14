import { motion } from "framer-motion";

const moduleStyles = {
  system: "border-border bg-card text-text-primary",
  scan: "border-border bg-card text-text-primary",
  vulnerabilities: "border-border bg-card text-text-primary",
  proof: "border-border bg-card text-text-primary",
  escrow: "border-border bg-card text-text-primary",
  audit: "border-border bg-card text-text-primary",
};

function StatusRail({ items }) {
  return (
    <div className="mb-6 flex flex-wrap gap-3">
      {items.map((item) => (
        <div
          key={item.label}
          className="inline-flex items-center gap-3 rounded-full border border-border bg-card px-4 py-2"
        >
          <span className={`h-2.5 w-2.5 rounded-full ${item.dotClass}`} />
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-text-primary">{item.label}</span>
          <span className="text-xs text-text-secondary">{item.value}</span>
        </div>
      ))}
    </div>
  );
}

function ModuleCard({ module, onNavigate }) {
  return (
    <motion.button
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.18 }}
      whileTap={{ scale: 0.995 }}
      type="button"
      onClick={() => onNavigate(module.path)}
      className="group rounded-[22px] border border-border bg-card p-5 text-left shadow-sm shadow-stone-200/60 transition hover:border-text-primary/15 hover:bg-white"
    >
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <div className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${moduleStyles[module.key]}`}>
            {module.title}
          </div>
          <p className="mt-4 text-[2rem] font-semibold tracking-tight text-text-primary">{module.value}</p>
          <p className="mt-2 text-sm leading-6 text-text-secondary">{module.summary}</p>
        </div>
        <span className="rounded-full border border-border bg-[#f2f0eb] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-text-secondary">
          {module.status}
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {module.metrics.map((metric) => (
          <div key={metric.label} className="rounded-xl border border-border bg-[#f4f2ed] px-3 py-3">
            <p className="text-[10px] uppercase tracking-[0.18em] text-text-secondary">{metric.label}</p>
            <p className="mt-2 text-sm font-semibold text-text-primary">{metric.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary transition group-hover:text-text-primary">
        Open detailed page
        <span aria-hidden="true">-&gt;</span>
      </div>
    </motion.button>
  );
}

function FeedPreview({ title, subtitle, items, emptyMessage }) {
  return (
    <div className="panel-surface h-full p-5">
      <div className="mb-4">
        <p className="text-sm font-semibold text-text-primary">{title}</p>
        <p className="text-xs uppercase tracking-[0.24em] text-text-secondary">{subtitle}</p>
      </div>

      <div className="space-y-3">
        {items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-[#f4f2ed] p-5 text-sm leading-6 text-text-secondary">
            {emptyMessage}
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="rounded-xl border border-border bg-[#f4f2ed] px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-text-primary">{item.title}</p>
                <span className="font-mono text-xs text-secondary">{item.timestamp}</span>
              </div>
              <p className="mt-2 text-sm leading-6 text-text-secondary">{item.description}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function SnapshotCard({ title, value, description, accent }) {
  return (
    <div className="rounded-[22px] border border-border bg-card p-4">
      <p className="text-xs uppercase tracking-[0.24em] text-text-secondary">{title}</p>
      <p className={`mt-2 text-2xl font-semibold tracking-tight ${accent}`}>{value}</p>
      <p className="mt-2 text-sm leading-6 text-text-secondary">{description}</p>
    </div>
  );
}

export function CentralIntelligencePanel({
  analytics,
  scanRunning,
  events,
  vulnerabilities,
  selectedVulnerability,
  proofHash,
  contractState,
  logs,
  paths,
  onNavigate,
}) {
  const latestEvent = events[events.length - 1];
  const latestVulnerability = vulnerabilities[vulnerabilities.length - 1];
  const latestLog = logs[0];
  const eligibleCount = vulnerabilities.filter((item) => item.confidence >= 0.8).length;

  const statusItems = [
    {
      label: "System",
      value: analytics.totalScans > 0 ? "Operational" : "Ready",
      dotClass: "bg-primary shadow-[0_0_14px_rgba(79,140,255,0.35)]",
    },
    {
      label: "AI Scan",
      value: scanRunning ? "Running" : "Idle",
      dotClass: scanRunning ? "bg-secondary shadow-[0_0_14px_rgba(34,197,94,0.35)]" : "bg-slate-300",
    },
    {
      label: "Proof",
      value: proofHash ? "Generated" : selectedVulnerability ? "Selected" : "Pending",
      dotClass: proofHash ? "bg-primary shadow-[0_0_14px_rgba(79,140,255,0.35)]" : "bg-slate-300",
    },
    {
      label: "Escrow",
      value: contractState.status,
      dotClass:
        contractState.status === "Released"
          ? "bg-secondary shadow-[0_0_14px_rgba(34,197,94,0.35)]"
          : "bg-primary shadow-[0_0_14px_rgba(79,140,255,0.35)]",
    },
  ];

  const moduleCards = [
    {
      key: "system",
      path: paths.system,
      title: "System Intelligence",
      value: `${analytics.totalScans}`,
      status: scanRunning ? "Live" : "Ready",
      summary: "Core performance telemetry, confidence scoring, and exploit efficiency.",
      metrics: [
        { label: "Confidence", value: analytics.avgConfidence.toFixed(2) },
        { label: "Coverage", value: `${Math.round(analytics.performance.coverage * 100)}%` },
      ],
    },
    {
      key: "scan",
      path: paths.scan,
      title: "AI Scan Activity",
      value: scanRunning ? "Live" : `${events.length} events`,
      status: latestEvent?.workflow_node ?? "Waiting",
      summary: "Reasoning steps, tool execution, and live event progression from the active scan.",
      metrics: [
        { label: "Latest", value: latestEvent?.timestamp ?? "--:--:--" },
        { label: "State", value: scanRunning ? "Running" : "Idle" },
      ],
    },
    {
      key: "vulnerabilities",
      path: paths.vulnerabilities,
      title: "Detected Vulnerabilities",
      value: `${vulnerabilities.length}`,
      status: latestVulnerability?.severity ?? "None",
      summary: "Confirmed findings with payload, endpoint, severity, and blockchain readiness.",
      metrics: [
        { label: "Latest", value: latestVulnerability?.vulnerability ?? "No findings" },
        { label: "Eligible", value: eligibleCount },
      ],
    },
    {
      key: "proof",
      path: paths.proof,
      title: "Proof Engine",
      value: proofHash ? "Ready" : selectedVulnerability ? "Selected" : "Awaiting",
      status: selectedVulnerability?.scan_id ?? "No target",
      summary: "Deterministic cryptographic proof generation for blockchain-bound findings.",
      metrics: [
        { label: "Candidate", value: selectedVulnerability?.vulnerability ?? "None" },
        { label: "Hash", value: proofHash ? `${proofHash.slice(0, 12)}...` : "Pending" },
      ],
    },
    {
      key: "escrow",
      path: paths.escrow,
      title: "Blockchain Escrow",
      value: contractState.status,
      status: `${contractState.bounty} WUSD`,
      summary: "Track deposit, proof submission, verification, and automated payout release.",
      metrics: [
        { label: "Bounty", value: `${contractState.bounty} WUSD` },
        { label: "Payout", value: contractState.payout || "Pending" },
      ],
    },
    {
      key: "audit",
      path: paths.audit,
      title: "Audit Logs",
      value: `${logs.length}`,
      status: latestLog?.event?.replaceAll("_", " ") ?? "No events",
      summary: "Immutable blockchain event stream for deposits, findings, proofs, and payout events.",
      metrics: [
        { label: "Latest TX", value: latestLog?.tx_hash ?? "Pending" },
        { label: "Stream", value: logs.length ? "Active" : "Waiting" },
      ],
    },
  ];

  const activityItems = events.slice(-4).reverse().map((eventItem, index) => ({
    id: `event-${index}-${eventItem.timestamp}`,
    title: eventItem.workflow_node ?? eventItem.event,
    timestamp: eventItem.timestamp,
    description: eventItem.message,
  }));

  const auditItems = logs.slice(0, 4).map((log, index) => ({
    id: `log-${index}-${log.timestamp}`,
    title: log.event.replaceAll("_", " "),
    timestamp: log.timestamp,
    description: log.message,
  }));

  return (
    <section className="panel-surface p-6 md:p-7">
      <div>
        <div className="mb-8 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-4xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.34em] text-primary/75">
              Unified Command Surface
            </p>
            <h3 className="text-[2rem] font-semibold tracking-tight text-text-primary md:text-[2.35rem]">
              Full platform visibility with one-click module handoff
            </h3>
            <p className="mt-4 text-sm leading-7 text-text-secondary md:text-base">
              Every mission-critical subsystem is summarized here so operators can understand system health immediately,
              then jump into a dedicated analytical page for deeper control and investigation.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 xl:w-[430px] xl:grid-cols-1">
            <SnapshotCard title="System Health" value={scanRunning ? "Active Mission" : "Mission Ready"} description="Live overview of AI scan state and overall platform posture." accent={scanRunning ? "text-secondary" : "text-text-primary"} />
            <SnapshotCard
              title="Latest Finding"
              value={latestVulnerability?.vulnerability ?? "No findings"}
              description="Most recent confirmed exploit surfaced by the autonomous agent."
              accent="text-text-primary"
            />
            <SnapshotCard
              title="Escrow Position"
              value={contractState.status}
              description="Current smart contract lifecycle stage in the bounty flow."
              accent="text-text-primary"
            />
          </div>
        </div>

        <StatusRail items={statusItems} />

        <div className="grid gap-5 xl:grid-cols-3">
          {moduleCards.map((module) => (
            <ModuleCard key={module.path} module={module} onNavigate={onNavigate} />
          ))}
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <FeedPreview
            title="Real-time Activity Stream"
            subtitle="Latest scan reasoning and tool execution"
            items={activityItems}
            emptyMessage="Start a scan to populate the AI activity stream with live reasoning, tool execution, and verification events."
          />
          <FeedPreview
            title="Blockchain Audit Snapshot"
            subtitle="Most recent immutable contract events"
            items={auditItems}
            emptyMessage="Contract events will appear here as soon as deposits, proof submissions, verification, or payouts occur."
          />
        </div>
      </div>
    </section>
  );
}
