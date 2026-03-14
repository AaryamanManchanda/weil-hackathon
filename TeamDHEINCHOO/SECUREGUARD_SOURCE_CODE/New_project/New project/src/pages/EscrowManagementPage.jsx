import { ActionButton } from "../components/ActionButton";
import { BlockchainEscrowPanel } from "../components/BlockchainEscrowPanel";
import { PageHeader } from "../components/PageHeader";

function ContractCard({ label, value, description }) {
  return (
    <div className="panel-surface p-5">
      <p className="text-xs uppercase tracking-[0.24em] text-text-secondary">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-text-primary">{value}</p>
      <p className="mt-3 text-sm leading-6 text-text-secondary">{description}</p>
    </div>
  );
}

export function EscrowManagementPage({
  contractState,
  proofReady,
  proofEligible,
  actionLoading,
  onDeposit,
  onSubmitProof,
  onRelease,
  onNavigate,
  dashboardPath,
  auditPath,
}) {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Blockchain Escrow"
        title="Escrow Management Console"
        description="Manage bounty funding, proof submission, verification state, and automated payout release from a single contract view."
        status={contractState.status}
        stats={[
          { label: "Bounty", value: `${contractState.bounty} WUSD` },
          { label: "Proof Ready", value: proofReady ? "Yes" : "No" },
          { label: "Eligible", value: proofEligible ? "Yes" : "No" },
        ]}
        actions={
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <ActionButton label="Return to Hub" onClick={() => onNavigate(dashboardPath)} />
            <ActionButton label="Open Audit Ledger" primary onClick={() => onNavigate(auditPath)} disabled={Boolean(actionLoading)} />
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <ContractCard label="Contract Status" value={contractState.status} description="Current position in the escrow lifecycle from initialization to release." />
        <ContractCard label="Latest Transaction" value={contractState.tx_hash || "Pending"} description="Most recent transaction emitted by the mock contract control flow." />
        <ContractCard label="Payout" value={contractState.payout || "Not released"} description="Funds released to the bounty recipient after successful verification." />
      </div>

      <BlockchainEscrowPanel
        contractState={contractState}
        onDeposit={onDeposit}
        onSubmitProof={onSubmitProof}
        onRelease={onRelease}
        proofReady={proofReady}
        proofEligible={proofEligible}
        actionLoading={actionLoading}
      />
    </div>
  );
}
