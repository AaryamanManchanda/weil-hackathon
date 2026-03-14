import { AnimatePresence, motion } from "framer-motion";

const eventConfig = {
  deposit: {
    color: "text-secondary",
    ring: "border-secondary/20 bg-secondary/10",
    label: "Deposit",
  },
  scan_started: {
    color: "text-primary",
    ring: "border-primary/20 bg-primary/10",
    label: "Scan Start",
  },
  vulnerability_detected: {
    color: "text-amber-400",
    ring: "border-amber-500/25 bg-amber-500/10",
    label: "Vulnerability Detected",
  },
  proof_submitted: {
    color: "text-fuchsia-400",
    ring: "border-fuchsia-500/25 bg-fuchsia-500/10",
    label: "Proof Submitted",
  },
  verification_passed: {
    color: "text-cyan-400",
    ring: "border-cyan-500/25 bg-cyan-500/10",
    label: "Verification Passed",
  },
  bounty_released: {
    color: "text-secondary",
    ring: "border-secondary/20 bg-secondary/10",
    label: "Bounty Released",
  },
};

function LogIcon({ event }) {
  const config = eventConfig[event] ?? eventConfig.scan_started;

  return (
    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border ${config.ring}`}>
      <span className={`h-3 w-3 rounded-full ${config.color} bg-current shadow-[0_0_16px_currentColor]`} />
    </div>
  );
}

function LogEntry({ log, active = false }) {
  const config = eventConfig[log.event] ?? eventConfig.scan_started;
  const txLink = log.tx_hash ? `https://marauder.weilliptic.ai/tx/${log.tx_hash}` : "";

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: -14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.28 }}
      className={`rounded-2xl border p-4 shadow-lg shadow-slate-200/60 transition ${
        active
          ? "border-primary/20 bg-primary/8 shadow-[0_0_28px_rgba(79,140,255,0.14)]"
          : "border-border bg-slate-50"
      }`}
    >
      <div className="flex items-start gap-4">
        <LogIcon event={log.event} />

        <div className="min-w-0 flex-1">
          <div className="mb-3 flex flex-wrap items-center gap-3">
            <span className="font-mono text-sm text-primary">[{log.timestamp}]</span>
            <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${config.ring} ${config.color}`}>
              {config.label}
            </span>
          </div>

          <div className="space-y-2 font-mono text-sm leading-6">
            <p className="text-text-primary">
              <span className="text-text-secondary">SCAN:</span> {log.scan_id}
            </p>
            <p className="text-text-primary">
              <span className="text-text-secondary">TARGET:</span> {log.target_label || log.target || "Unknown target"}
            </p>
            <p className="text-text-primary">
              <span className="text-text-secondary">EVENT:</span> {config.label}
            </p>
            <p className="text-text-primary">
              <span className="text-text-secondary">DETAILS:</span> {log.message}
            </p>
            <p className="text-text-primary">
              <span className="text-text-secondary">TX:</span>{" "}
              {log.tx_hash ? (
                <a
                  href={txLink}
                  target="_blank"
                  rel="noreferrer"
                  className="break-all text-primary transition hover:text-primary/75"
                >
                  {log.tx_hash}
                </a>
              ) : (
                <span className="text-text-secondary">Pending</span>
              )}
            </p>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

function groupLogsByScan(logs) {
  const grouped = new Map();

  logs.forEach((log) => {
    const scanId = log.scan_id || "unknown_scan";

    if (!grouped.has(scanId)) {
      grouped.set(scanId, []);
    }

    grouped.get(scanId).push(log);
  });

  return [...grouped.entries()]
    .map(([scanId, entries]) => ({
      scanId,
      entries,
      latest: entries[0],
    }))
    .sort((left, right) => new Date(right.latest?.created_at ?? 0).getTime() - new Date(left.latest?.created_at ?? 0).getTime());
}

export function BlockchainAuditLogsPanel({ logs }) {
  const groupedLogs = groupLogsByScan(logs);

  return (
    <section className="panel-surface overflow-hidden p-6 md:p-7">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.32em] text-primary/75">
            Blockchain Activity
          </p>
          <h2 className="text-2xl font-semibold text-text-primary">Blockchain Activity</h2>
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            Weilchain audit logs for deposits, proof submission, verification, and payout release
          </p>
        </div>
        <div className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          {groupedLogs.length} scan{groupedLogs.length === 1 ? "" : "s"} tracked
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-slate-50/80 p-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-text-primary">Event Timeline</p>
            <p className="text-xs uppercase tracking-[0.24em] text-text-secondary">Grouped by scan, latest scan first</p>
          </div>
          <div className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
            On-chain Stream
          </div>
        </div>

        <div className="h-[420px] overflow-y-auto rounded-2xl border border-border bg-white p-4">
          {logs.length === 0 ? (
            <div className="flex h-full items-center justify-center text-center">
              <div>
                <p className="text-text-primary">No on-chain events recorded yet.</p>
                <p className="mt-2 text-sm text-text-secondary">
                  Deposit bounty, start scans, and submit proofs to populate the immutable log stream.
                </p>
              </div>
            </div>
          ) : (
            <motion.div layout className="space-y-5">
              <AnimatePresence initial={false}>
                {groupedLogs.map((group, groupIndex) => (
                  <motion.section
                    key={group.scanId}
                    layout
                    initial={{ opacity: 0, y: -12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.24 }}
                    className="rounded-2xl border border-border bg-[#f8f7f3] p-4"
                  >
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.2em] text-text-secondary">Scan</p>
                        <p className="mt-1 font-mono text-sm text-text-primary">{group.scanId}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-text-secondary">Target</p>
                        <p className="mt-1 text-sm font-medium text-text-primary">
                          {group.latest?.target_label || group.latest?.target || "Unknown target"}
                        </p>
                      </div>
                      <div className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                        {group.entries.length} event{group.entries.length === 1 ? "" : "s"}
                      </div>
                    </div>

                    <div className="space-y-4">
                      {group.entries.map((log, entryIndex) => (
                        <LogEntry
                          key={log.id ?? `${group.scanId}-${log.timestamp}-${log.event}-${log.tx_hash ?? "na"}`}
                          log={log}
                          active={groupIndex === 0 && entryIndex === 0}
                        />
                      ))}
                    </div>
                  </motion.section>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
