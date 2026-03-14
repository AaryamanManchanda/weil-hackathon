import { ActionButton } from "../components/ActionButton";
import { PageHeader } from "../components/PageHeader";
import { ScanActivityPanel } from "../components/ScanActivityPanel";

function FeedCard({ title, value, description, accent = "text-primary" }) {
  return (
    <div className="panel-surface p-5">
      <p className="text-xs uppercase tracking-[0.24em] text-text-secondary">{title}</p>
      <p className={`mt-3 text-3xl font-semibold tracking-tight ${accent}`}>{value}</p>
      <p className="mt-3 text-sm leading-6 text-text-secondary">{description}</p>
    </div>
  );
}

export function ScanActivityPage({ events, scanRunning, onStartScan, onNavigate, dashboardPath }) {
  const latestEvent = events[events.length - 1];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="AI Scan Activity"
        title="Live Autonomous Scan Operations"
        description="Monitor reasoning steps, tool execution, verification flow, and proof preparation in real time."
        status={scanRunning ? "Pipeline Running" : "Pipeline Idle"}
        stats={[
          { label: "Events", value: events.length },
          { label: "Latest", value: latestEvent?.timestamp ?? "--:--:--" },
          { label: "Node", value: latestEvent?.workflow_node ?? "Awaiting scan" },
        ]}
        actions={
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <ActionButton label={scanRunning ? "Scan Running" : "Start Scan"} primary onClick={onStartScan} disabled={scanRunning} />
            <ActionButton label="Return to Hub" onClick={() => onNavigate(dashboardPath)} />
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <FeedCard title="Pipeline State" value={scanRunning ? "Live" : "Ready"} description="Current operational state of the LangGraph-style scan pipeline." accent={scanRunning ? "text-secondary" : "text-text-primary"} />
        <FeedCard title="Latest Step" value={latestEvent?.event ?? "none"} description="Most recent event emitted by the scan orchestration engine." />
        <FeedCard title="Latest Message" value={latestEvent?.message ?? "No activity"} description="Latest reasoning or exploit execution output from the AI agent." />
      </div>

      <ScanActivityPanel events={events} scanRunning={scanRunning} />
    </div>
  );
}
