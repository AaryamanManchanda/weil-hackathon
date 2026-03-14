function StatusBadge({ status }) {
  const styles =
    status === "released"
      ? "border-secondary/20 bg-secondary/10 text-secondary"
      : status === "vulnerable" || status === "proof_generated" || status === "proof_submitted"
        ? "border-amber-500/20 bg-amber-500/10 text-amber-600"
        : status === "scanning" || status === "queued"
          ? "border-primary/20 bg-primary/10 text-primary"
          : "border-border bg-card text-text-secondary";

  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${styles}`}>
      {status.replaceAll("_", " ")}
    </span>
  );
}

export function ActiveScansPanel({ scans, selectedScanId, onSelect }) {
  return (
    <section className="panel-surface p-5 md:p-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-text-primary">Active Scans</p>
          <p className="text-xs uppercase tracking-[0.24em] text-text-secondary">Queued, scanning, and released jobs</p>
        </div>
        <div className="rounded-full border border-border bg-card px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
          {scans.length} scans
        </div>
      </div>

      {scans.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-[#f4f2ed] p-8 text-center">
          <p className="text-text-primary">No scan jobs yet.</p>
          <p className="mt-2 text-sm text-text-secondary">Submit a target to create the first bounty-backed scan.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          <div className="grid grid-cols-[1.15fr_1.35fr_0.9fr_0.8fr] gap-3 border-b border-border bg-[#f4f2ed] px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
            <span>Scan ID</span>
            <span>Target</span>
            <span>Status</span>
            <span>Bounty</span>
          </div>
          <div className="max-h-[310px] overflow-y-auto">
            {scans.map((scan) => {
              const isActive = scan.scan_id === selectedScanId;

              return (
                <button
                  key={scan.scan_id}
                  type="button"
                  onClick={() => onSelect(scan.scan_id)}
                  className={`grid w-full grid-cols-[1.15fr_1.35fr_0.9fr_0.8fr] gap-3 border-b border-border px-4 py-4 text-left transition ${
                    isActive ? "bg-card" : "bg-white hover:bg-[#f7f5f0]"
                  }`}
                >
                  <div>
                    <p className="font-mono text-sm text-text-primary">{scan.scan_id}</p>
                    <p className="mt-1 text-xs text-text-secondary">{scan.company}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-primary">{scan.target_label}</p>
                    <p className="mt-1 text-xs text-text-secondary">{scan.scan_type.replaceAll("_", " ")}</p>
                  </div>
                  <div className="self-center">
                    <StatusBadge status={scan.status} />
                  </div>
                  <div className="self-center text-sm font-semibold text-text-primary">{scan.bounty_display}</div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
