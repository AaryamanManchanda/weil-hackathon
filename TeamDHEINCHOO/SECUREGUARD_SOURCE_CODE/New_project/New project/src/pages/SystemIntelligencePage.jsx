import { ActionButton } from "../components/ActionButton";
import { PageHeader } from "../components/PageHeader";
import { SystemIntelligencePanel } from "../components/SystemIntelligencePanel";

function InsightCard({ label, value, description }) {
  return (
    <div className="panel-surface p-5">
      <p className="text-xs uppercase tracking-[0.24em] text-text-secondary">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-text-primary">{value}</p>
      <p className="mt-3 text-sm leading-6 text-text-secondary">{description}</p>
    </div>
  );
}

export function SystemIntelligencePage({ analytics, scanRunning, model, contractStatus, onStartScan, onNavigate, dashboardPath }) {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="System Intelligence"
        title="Operational Intelligence Matrix"
        description="Performance analytics, coverage, exploit efficiency, and confidence metrics for the AI security agent."
        status={scanRunning ? "Telemetry Live" : "Telemetry Ready"}
        stats={[
          { label: "Accuracy", value: `${Math.round(analytics.performance.accuracy * 100)}%` },
          { label: "Coverage", value: `${Math.round(analytics.performance.coverage * 100)}%` },
          { label: "Avg Confidence", value: analytics.avgConfidence.toFixed(2) },
        ]}
        actions={
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <ActionButton label={scanRunning ? "Scan Running" : "Launch Scan"} primary onClick={onStartScan} disabled={scanRunning} />
            <ActionButton label="Back to Hub" onClick={() => onNavigate(dashboardPath)} />
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <InsightCard label="Model" value={model} description="Primary reasoning model powering the security agent and scoring logic." />
        <InsightCard
          label="Exploit Success Rate"
          value={`${Math.round(analytics.exploitSuccessRate * 100)}%`}
          description="Measured ratio of successful exploit attempts against total execution attempts."
        />
        <InsightCard
          label="Contract Linkage"
          value={contractStatus}
          description="Current blockchain workflow state paired with the operational AI telemetry stream."
        />
      </div>

      <SystemIntelligencePanel
        analytics={analytics}
        scanRunning={scanRunning}
        model={model}
        contractStatus={contractStatus}
      />
    </div>
  );
}
