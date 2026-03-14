import { ActionButton } from "../components/ActionButton";
import { PageHeader } from "../components/PageHeader";

function SettingsCard({ label, value, description, mono = false }) {
  return (
    <div className="panel-surface p-5">
      <p className="text-xs uppercase tracking-[0.24em] text-text-secondary">{label}</p>
      <p className={`mt-3 text-lg font-semibold text-text-primary ${mono ? "break-all font-mono" : ""}`}>{value}</p>
      <p className="mt-3 text-sm leading-6 text-text-secondary">{description}</p>
    </div>
  );
}

export function SettingsPage({ config, profile, onOpenConfigure, onNavigate, dashboardPath }) {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Settings"
        title="Agent Configuration and Platform Controls"
        description="Manage target configuration, attack modules, confidence threshold, and agent identity settings from a dedicated control page."
        status="Configuration Ready"
        stats={[
          { label: "Target", value: config.targetUrl },
          { label: "Module", value: config.attackModule },
          { label: "Threshold", value: config.confidenceThreshold.toFixed(2) },
        ]}
        actions={
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <ActionButton label="Configure Agent" primary onClick={onOpenConfigure} />
            <ActionButton label="Return to Hub" onClick={() => onNavigate(dashboardPath)} />
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <SettingsCard label="Target URL" value={config.targetUrl} description="Primary system target used for the autonomous scan pipeline." mono />
        <SettingsCard label="Attack Module" value={config.attackModule} description="Selected exploit strategy for the configured scan workflow." />
        <SettingsCard label="Confidence Threshold" value={config.confidenceThreshold.toFixed(2)} description="Minimum confidence required to qualify a finding for blockchain submission." />
        <SettingsCard label="Agent Name" value={profile.agent_name} description="Agent identity surfaced across the control center and blockchain-linked workflows." />
        <SettingsCard label="Model" value={profile.model} description="Core reasoning model configured for exploit detection and operational orchestration." />
        <SettingsCard label="Contract" value={profile.contract_address} description="Linked contract address for proof verification and bounty release." mono />
      </div>
    </div>
  );
}
