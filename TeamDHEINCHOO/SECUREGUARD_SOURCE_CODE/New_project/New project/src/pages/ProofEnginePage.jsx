import { ActionButton } from "../components/ActionButton";
import { PageHeader } from "../components/PageHeader";
import { ProofGenerationPanel } from "../components/ProofGenerationPanel";

function SelectionCard({ vulnerability, isActive, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(vulnerability)}
      className={`w-full rounded-2xl border p-4 text-left transition ${
        isActive
          ? "border-primary/35 bg-primary/10 shadow-[0_0_24px_rgba(79,140,255,0.16)]"
          : "border-border bg-white hover:border-primary/20 hover:bg-slate-50"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-text-primary">{vulnerability.vulnerability}</p>
          <p className="mt-1 text-xs uppercase tracking-[0.18em] text-text-secondary">{vulnerability.endpoint}</p>
        </div>
        <span className="rounded-full border border-border bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-text-secondary">
          {vulnerability.severity}
        </span>
      </div>
      <p className="mt-3 font-mono text-sm text-text-primary">{vulnerability.payload}</p>
      <p className="mt-2 text-sm text-text-secondary">Confidence {vulnerability.confidence.toFixed(2)}</p>
    </button>
  );
}

export function ProofEnginePage({
  vulnerabilities,
  selectedVulnerability,
  proofHash,
  hashGenerating,
  copyState,
  onSelectVulnerability,
  onGenerateProof,
  onCopyProof,
  onSubmitProof,
  onNavigate,
  dashboardPath,
}) {
  const recentCandidates = [...vulnerabilities].slice(-4).reverse();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Proof Engine"
        title="Cryptographic Proof Preparation"
        description="Select a confirmed vulnerability, generate a deterministic SHA-256 proof, and stage the payload for blockchain submission."
        status={proofHash ? "Proof Ready" : selectedVulnerability ? "Selection Loaded" : "Awaiting Selection"}
        stats={[
          { label: "Selected", value: selectedVulnerability?.scan_id ?? "None" },
          { label: "Hash", value: proofHash ? "Generated" : "Pending" },
          { label: "Copy State", value: copyState },
        ]}
        actions={
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <ActionButton label="Return to Hub" onClick={() => onNavigate(dashboardPath)} />
            <ActionButton
              label={hashGenerating ? "Generating Proof" : "Generate Proof"}
              primary
              onClick={onGenerateProof}
              disabled={!selectedVulnerability || hashGenerating}
            />
          </div>
        }
      />

      <section className="panel-surface p-5 md:p-6">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-text-primary">Candidate Findings</p>
            <p className="text-xs uppercase tracking-[0.24em] text-text-secondary">Select a vulnerability to stage in the proof engine</p>
          </div>
        </div>

        {recentCandidates.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-slate-50 p-8 text-center">
            <p className="text-text-primary">No vulnerability candidates available yet.</p>
            <p className="mt-2 text-sm text-text-secondary">Run a scan and confirm a finding to start proof generation.</p>
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
            {recentCandidates.map((vulnerability) => (
              <SelectionCard
                key={`${vulnerability.scan_id}-${vulnerability.timestamp}`}
                vulnerability={vulnerability}
                isActive={selectedVulnerability?.scan_id === vulnerability.scan_id && selectedVulnerability?.timestamp === vulnerability.timestamp}
                onSelect={onSelectVulnerability}
              />
            ))}
          </div>
        )}
      </section>

      <ProofGenerationPanel
        selectedVulnerability={selectedVulnerability}
        proofHash={proofHash}
        onGenerateProof={onGenerateProof}
        onCopyProof={onCopyProof}
        onSubmitProof={onSubmitProof}
        hashGenerating={hashGenerating}
        copyState={copyState}
      />
    </div>
  );
}
