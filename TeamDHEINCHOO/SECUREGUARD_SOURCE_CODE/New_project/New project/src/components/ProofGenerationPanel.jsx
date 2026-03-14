import { motion } from "framer-motion";

function ProofField({ label, value, mono = false }) {
  return (
    <div className="rounded-2xl border border-border bg-slate-50 p-4">
      <p className="mb-1 text-xs uppercase tracking-[0.24em] text-text-secondary">{label}</p>
      <p className={`${mono ? "font-mono" : ""} break-words text-text-primary`}>{value}</p>
    </div>
  );
}

export function ProofGenerationPanel({
  selectedVulnerability,
  proofHash,
  onGenerateProof,
  onCopyProof,
  onSubmitProof,
  hashGenerating,
  copyState,
}) {
  const isEligible = selectedVulnerability ? selectedVulnerability.confidence >= 0.8 : false;
  const canSubmit = Boolean(proofHash && selectedVulnerability && isEligible);

  return (
    <section className="panel-surface overflow-hidden p-6 md:p-7">
      <div className="mb-6">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.32em] text-primary/75">Proof Generation</p>
          <h2 className="text-2xl font-semibold text-text-primary">Proof Generation</h2>
          <p className="mt-2 text-sm leading-6 text-text-secondary">Generate blockchain-ready proof hashes.</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)]">
        <div className="rounded-2xl border border-border bg-white p-5">
          <div className="mb-5">
            <p className="text-sm font-semibold text-text-primary">Proof Data Preview</p>
            <p className="text-xs uppercase tracking-[0.24em] text-text-secondary">
              Selected vulnerability payload
            </p>
          </div>

          {!selectedVulnerability ? (
            <div className="rounded-2xl border border-dashed border-border bg-slate-50 p-8 text-center">
              <p className="text-text-primary">No vulnerability selected for proof generation.</p>
              <p className="mt-2 text-sm text-text-secondary">
                Use `Generate Proof` on a vulnerability card to populate this panel.
              </p>
            </div>
          ) : (
            <motion.div
              key={`${selectedVulnerability.scan_id}-${selectedVulnerability.timestamp}`}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="grid gap-4 md:grid-cols-2"
            >
              <ProofField label="Scan ID" value={selectedVulnerability.scan_id} mono />
              <ProofField label="Vulnerability" value={selectedVulnerability.vulnerability} />
              <ProofField label="Endpoint" value={selectedVulnerability.endpoint} mono />
              <ProofField label="Payload" value={selectedVulnerability.payload} mono />
              <ProofField label="Severity" value={selectedVulnerability.severity} />
              <ProofField label="Confidence" value={selectedVulnerability.confidence.toFixed(2)} />
              <div className="md:col-span-2">
                <ProofField label="Detected" value={selectedVulnerability.timestamp} />
              </div>
            </motion.div>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-slate-50/80 p-5">
          <div className="mb-5">
            <p className="text-sm font-semibold text-text-primary">Proof Hash Generator</p>
          </div>

          <div
            className={`rounded-2xl border p-4 text-sm leading-6 ${
              selectedVulnerability
                ? isEligible
                  ? "border-secondary/20 bg-secondary/10 text-secondary"
                  : "border-danger/20 bg-danger/10 text-danger"
                : "border-border bg-white text-text-secondary"
            }`}
          >
            {!selectedVulnerability
              ? "Select a vulnerability to evaluate blockchain proof eligibility."
              : isEligible
                ? "Eligible for blockchain verification."
                : "Low confidence - not eligible for blockchain submission."}
          </div>

          <button
            type="button"
            onClick={onGenerateProof}
            disabled={!selectedVulnerability || hashGenerating}
            className={`mt-5 w-full rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
              !selectedVulnerability || hashGenerating
                ? "cursor-not-allowed border-border bg-white text-text-secondary"
                : "border-primary/40 bg-primary/10 text-text-primary hover:border-primary/55 hover:bg-primary/15 hover:shadow-[0_0_28px_rgba(79,140,255,0.2)]"
            }`}
          >
            {hashGenerating ? "Generating Proof..." : "Generate Cryptographic Proof"}
          </button>

          <div className="mt-5 rounded-2xl border border-primary/20 bg-primary/8 p-4 shadow-[0_0_30px_rgba(79,140,255,0.08)]">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-text-primary">Proof Hash</p>
              </div>
              <button
                type="button"
                onClick={onCopyProof}
                disabled={!proofHash}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                  proofHash
                    ? "border-primary/35 bg-primary/10 text-primary hover:border-primary/50"
                    : "border-border bg-white text-text-secondary"
                }`}
              >
                {copyState}
              </button>
            </div>

            <div className="rounded-2xl border border-border bg-white p-4">
              <p className="break-all font-mono text-sm leading-7 text-text-primary">
                {proofHash || "No proof hash generated yet."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onSubmitProof}
            disabled={!canSubmit}
            className={`mt-5 w-full rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
              canSubmit
                ? "border-primary/50 bg-primary text-white shadow-[0_0_24px_rgba(79,140,255,0.35)] hover:shadow-[0_0_36px_rgba(79,140,255,0.45)]"
                : "cursor-not-allowed border-border bg-white text-text-secondary"
            }`}
          >
            Submit Proof to Blockchain
          </button>
        </div>
      </div>
    </section>
  );
}
