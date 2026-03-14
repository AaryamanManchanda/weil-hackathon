import { ActionButton } from "../components/ActionButton";
import { BlockchainAuditLogsPanel } from "../components/BlockchainAuditLogsPanel";
import { PageHeader } from "../components/PageHeader";

function countLogs(logs, eventName) {
  return logs.filter((log) => log.event === eventName).length;
}

function AuditCard({ label, value, description }) {
  return (
    <div className="panel-surface p-5">
      <p className="text-xs uppercase tracking-[0.24em] text-text-secondary">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-text-primary">{value}</p>
      <p className="mt-3 text-sm leading-6 text-text-secondary">{description}</p>
    </div>
  );
}

export function AuditLedgerPage({ logs, onNavigate, dashboardPath }) {
  const latest = logs[0];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Audit Ledger"
        title="Immutable Blockchain Event History"
        description="Trace deposits, scan starts, vulnerability confirmations, proof submissions, verification events, and payouts in a chronological ledger."
        status={logs.length ? "Ledger Streaming" : "Ledger Waiting"}
        stats={[
          { label: "Events", value: logs.length },
          { label: "Latest", value: latest?.timestamp ?? "--:--:--" },
          { label: "TX", value: latest?.tx_hash ?? "Pending" },
        ]}
        actions={
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <ActionButton label="Return to Hub" onClick={() => onNavigate(dashboardPath)} />
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        <AuditCard label="Deposits" value={countLogs(logs, "deposit")} description="Escrow funding events recorded on-chain." />
        <AuditCard label="Scan Starts" value={countLogs(logs, "scan_started")} description="AI scan sessions initiated from the dashboard." />
        <AuditCard label="Findings" value={countLogs(logs, "vulnerability_detected")} description="Confirmed vulnerabilities written into the ledger stream." />
        <AuditCard label="Proofs" value={countLogs(logs, "proof_submitted")} description="Proof submissions pushed toward the contract." />
        <AuditCard label="Verified" value={countLogs(logs, "verification_passed")} description="Successful verification checkpoints in the contract workflow." />
        <AuditCard label="Released" value={countLogs(logs, "bounty_released")} description="Final payout release events registered in escrow." />
      </div>

      <BlockchainAuditLogsPanel logs={logs} />
    </div>
  );
}
