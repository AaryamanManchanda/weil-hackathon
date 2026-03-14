import { motion } from "framer-motion";

const statusStyles = {
  Initialized: "border-border bg-slate-50 text-text-secondary",
  "Bounty Deposited": "border-secondary/20 bg-secondary/10 text-secondary",
  "Proof Submitted": "border-primary/25 bg-primary/10 text-primary",
  Verified: "border-secondary/20 bg-secondary/10 text-secondary",
  Released: "border-primary/25 bg-primary/10 text-primary",
};

function MetaRow({ label, value, mono = false, link }) {
  const content = link ? (
    <a
      href={link}
      target="_blank"
      rel="noreferrer"
      className={`break-all text-primary transition hover:text-primary/75 ${mono ? "font-mono" : ""}`}
    >
      {value}
    </a>
  ) : (
    <span className={`${mono ? "font-mono" : ""} break-all text-text-primary`}>{value}</span>
  );

  return (
    <div className="rounded-2xl border border-border bg-slate-50 p-4">
      <p className="mb-1 text-xs uppercase tracking-[0.24em] text-text-secondary">{label}</p>
      {content}
    </div>
  );
}

function ContractActionButton({
  label,
  onClick,
  disabled,
  variant = "neutral",
}) {
  const styles =
    variant === "success"
      ? "border-secondary/45 bg-secondary text-white hover:shadow-[0_0_28px_rgba(34,197,94,0.28)]"
      : variant === "primary"
        ? "border-primary/50 bg-primary text-white hover:shadow-[0_0_28px_rgba(79,140,255,0.28)]"
        : "border-primary/35 bg-primary/10 text-text-primary hover:border-primary/50 hover:bg-primary/15";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
        disabled ? "cursor-not-allowed border-border bg-white text-text-secondary" : styles
      }`}
    >
      {label}
    </button>
  );
}

export function BlockchainEscrowPanel({
  contractState,
  onDeposit,
  onSubmitProof,
  onRelease,
  proofReady,
  proofEligible,
  actionLoading,
}) {
  const explorerLink = "https://marauder.weilliptic.ai";
  const addressLink = explorerLink;
  const statusClass = statusStyles[contractState.status] ?? statusStyles.Initialized;

  return (
    <section className="panel-surface overflow-hidden p-6 md:p-7">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.32em] text-primary/75">Blockchain Escrow</p>
          <h2 className="text-2xl font-semibold text-text-primary">Blockchain Escrow</h2>
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            SecureGuard Smart Contract state and bounty lifecycle
          </p>
        </div>
        <div className={`rounded-full border px-3 py-1 text-xs font-medium ${statusClass}`}>
          {contractState.status}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)]">
        <div className="rounded-2xl border border-border bg-white p-5">
          <div className="mb-5">
            <p className="text-sm font-semibold text-text-primary">Contract Information</p>
            <p className="text-xs uppercase tracking-[0.24em] text-text-secondary">
              SecureGuard escrow metadata and lifecycle state
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <MetaRow label="Contract Name" value="SecureGuard Escrow Contract" />
            <MetaRow label="Network" value="Weilchain Sentinel" />
            <MetaRow
              label="Contract Address"
              value="aaaaaaqey6suypclwh6wmvu4pjy52pcxhieusrqpjt43ytehnz32uqksvu"
              link={addressLink}
              mono
            />
            <MetaRow label="Explorer Link" value={explorerLink} link={explorerLink} />
            <MetaRow label="Bounty Amount" value={`${contractState.bounty} WUSD`} />
            <MetaRow label="Escrow Status" value={contractState.status} />
            <MetaRow label="Transaction Hash" value={contractState.tx_hash || "Pending"} mono />
            <MetaRow label="Bounty Paid" value={contractState.payout || "Not released"} />
          </div>

          <div className="mt-5 rounded-2xl border border-border bg-slate-50 p-4">
            <p className="mb-3 text-sm font-semibold text-text-primary">Bounty Lifecycle</p>
            <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.18em] text-text-secondary">
              <span>Deposit</span>
              <span className="text-primary">{"->"}</span>
              <span>AI Scan</span>
              <span className="text-primary">{"->"}</span>
              <span>Submit Proof</span>
              <span className="text-primary">{"->"}</span>
              <span>Verify</span>
              <span className="text-primary">{"->"}</span>
              <span>Release</span>
              <span className="text-primary">{"->"}</span>
              <span>On-chain Log</span>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-border bg-slate-50 p-4">
            <p className="mb-3 text-sm font-semibold text-text-primary">Attached Contract Bundle</p>
            <div className="grid gap-3 text-xs text-text-secondary md:grid-cols-2">
              <div className="rounded-xl border border-border bg-white p-3">
                <p className="font-semibold text-text-primary">Source</p>
                <p className="mt-1 font-mono">integrations/secureguard_contract/src/main.cpp</p>
              </div>
              <div className="rounded-xl border border-border bg-white p-3">
                <p className="font-semibold text-text-primary">Interface</p>
                <p className="mt-1 font-mono">integrations/secureguard_contract/secureguard.widl</p>
              </div>
              <div className="rounded-xl border border-border bg-white p-3">
                <p className="font-semibold text-text-primary">Methods</p>
                <p className="mt-1 font-mono">deposit / submit_proof / release / log_event</p>
              </div>
              <div className="rounded-xl border border-border bg-white p-3">
                <p className="font-semibold text-text-primary">Build Artifact</p>
                <p className="mt-1 font-mono">integrations/secureguard_contract/build/counter.wasm</p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-slate-50/80 p-5">
          <div className="mb-5">
            <p className="text-sm font-semibold text-text-primary">Contract Control Actions</p>
            <p className="text-xs uppercase tracking-[0.24em] text-text-secondary">
              Escrow controls and payout progression
            </p>
          </div>

          <div className="grid gap-3">
            <ContractActionButton
              label={actionLoading === "deposit" ? "Depositing..." : "Deposit Bounty"}
              onClick={onDeposit}
              disabled={Boolean(actionLoading) || contractState.status !== "Initialized"}
              variant="success"
            />
            <ContractActionButton
              label={actionLoading === "submit" ? "Submitting..." : "Submit Proof"}
              onClick={onSubmitProof}
              disabled={Boolean(actionLoading) || !proofReady}
            />
            <ContractActionButton
              label={actionLoading === "release" ? "Releasing..." : "Release Bounty"}
              onClick={onRelease}
              disabled={Boolean(actionLoading) || contractState.status !== "Verified"}
              variant="primary"
            />
          </div>

          <div
            className={`mt-5 rounded-2xl border p-4 text-sm leading-6 ${
              proofReady
                ? proofEligible
                  ? "border-secondary/20 bg-secondary/10 text-secondary"
                  : "border-amber-500/25 bg-amber-500/10 text-amber-300"
                : "border-border bg-white text-text-secondary"
            }`}
          >
            {!proofReady
              ? "Generate a proof hash first to enable proof submission."
              : proofEligible
                ? "Proof is eligible for smart contract verification."
                : "Proof can be submitted, but current severity/confidence may fail verification."}
          </div>

          <motion.div
            key={`${contractState.status}-${contractState.tx_hash}-${contractState.payout}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="mt-5 rounded-2xl border border-primary/20 bg-primary/8 p-4 shadow-[0_0_28px_rgba(79,140,255,0.08)]"
          >
            <p className="mb-2 text-sm font-semibold text-text-primary">Contract State Snapshot</p>
            <pre className="overflow-x-auto rounded-2xl border border-border bg-white p-4 font-mono text-sm leading-6 text-text-primary">
              {JSON.stringify(
                {
                  status: contractState.status,
                  bounty: contractState.bounty,
                  tx_hash: contractState.tx_hash || undefined,
                  payout: contractState.payout || undefined,
                },
                null,
                2,
              )}
            </pre>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
