export function WalletSummaryPanel({ selectedScan, contractAddress, onNavigateToEscrow }) {
  return (
    <section className="panel-surface p-5 md:p-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-text-primary">Wallet & Escrow</p>
          <p className="text-xs uppercase tracking-[0.24em] text-text-secondary">Researcher payout and proof state</p>
        </div>
      </div>

      {!selectedScan ? (
        <div className="rounded-xl border border-dashed border-border bg-[#f4f2ed] p-8 text-center">
          <p className="text-text-primary">No scan selected.</p>
          <p className="mt-2 text-sm text-text-secondary">Choose an active scan to view escrow and wallet details.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-[#f4f2ed] p-4">
            <p className="text-[10px] uppercase tracking-[0.18em] text-text-secondary">Contract</p>
            <p className="mt-2 break-all font-mono text-xs text-text-primary">{contractAddress}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-[#f4f2ed] p-4">
              <p className="text-[10px] uppercase tracking-[0.18em] text-text-secondary">Researcher Wallet</p>
                <div className="mt-2 text-sm font-semibold text-text-primary break-all">
                  {selectedScan.researcher_wallet || "ebf5e858909648af6ebc5270ba794569d9146b92081f7428b8acf3cac2e97ce4"}
                </div>
            </div>
            <div className="rounded-xl border border-border bg-[#f4f2ed] p-4">
              <p className="text-[10px] uppercase tracking-[0.18em] text-text-secondary">Bounty</p>
              <p className="mt-2 text-sm font-semibold text-text-primary">{selectedScan.bounty_display}</p>
            </div>
            <div className="rounded-xl border border-border bg-[#f4f2ed] p-4">
              <p className="text-[10px] uppercase tracking-[0.18em] text-text-secondary">Contract Status</p>
              <p className="mt-2 text-sm font-semibold text-text-primary">{selectedScan.contract_status}</p>
            </div>
            <div className="rounded-xl border border-border bg-[#f4f2ed] p-4">
              <p className="text-[10px] uppercase tracking-[0.18em] text-text-secondary">Bounty Paid</p>
              <p className="mt-2 text-sm font-semibold text-text-primary">{selectedScan.bounty_paid ? "Yes" : "No"}</p>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-[#f4f2ed] p-4">
            <p className="text-[10px] uppercase tracking-[0.18em] text-text-secondary">Proof Hash</p>
            <p className="mt-2 break-all font-mono text-xs text-text-primary">
              {selectedScan.proof_hash || "Proof not generated yet."}
            </p>
          </div>

          <div className="grid gap-3">
            <button
              type="button"
              onClick={onNavigateToEscrow}
              className="rounded-xl border border-primary bg-primary px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-white"
            >
              Open Escrow
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
