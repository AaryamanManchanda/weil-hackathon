import { useEffect, useRef } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function DotMarker({ cx, cy, payload }) {
  if (typeof cx !== "number" || typeof cy !== "number") {
    return null;
  }

  return (
    <g>
      <circle cx={cx} cy={cy} r={10} fill="rgba(79, 140, 255, 0.16)" />
      <circle cx={cx} cy={cy} r={4.5} fill="#4F8CFF" stroke="#A5C4FF" strokeWidth={1.5} />
      {payload?.latest ? <circle cx={cx} cy={cy} r={6.5} fill="none" stroke="rgba(79, 140, 255, 0.45)" /> : null}
    </g>
  );
}

export function ScanActivityPanel({ events, scanRunning }) {
  const feedRef = useRef(null);
  const graphData = events.map((eventItem, index) => ({
    time: eventItem.timestamp,
    event: index + 1,
    latest: index === events.length - 1,
  }));

  useEffect(() => {
    if (!feedRef.current) {
      return;
    }

    feedRef.current.scrollTop = feedRef.current.scrollHeight;
  }, [events]);

  return (
    <section className={`panel-surface overflow-hidden p-6 md:p-7 ${scanRunning ? "panel-glow" : ""}`}>
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.32em] text-primary/75">AI Agent Activity</p>
          <h2 className="text-2xl font-semibold text-text-primary">AI Agent Activity</h2>
          <p className="mt-2 text-sm leading-6 text-text-secondary">Live AI reasoning, tool execution, and scan progress</p>
        </div>

        <div
          className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${
            scanRunning
              ? "border-primary/30 bg-primary/10 text-primary"
              : "border-border bg-slate-50 text-text-secondary"
          }`}
        >
          <span
            className={`h-2 w-2 rounded-full ${
              scanRunning ? "bg-primary shadow-[0_0_14px_rgba(79,140,255,0.85)]" : "bg-text-secondary/50"
            }`}
          />
          {scanRunning ? "Pipeline Running" : "Awaiting Scan Trigger"}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,7fr)_minmax(280px,3fr)]">
        <div className="rounded-2xl border border-border bg-slate-50/80 p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-text-primary">Live Activity Feed</p>
              <p className="text-xs uppercase tracking-[0.24em] text-text-secondary">Terminal Stream</p>
            </div>
            <div className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
              LangGraph Pipeline
            </div>
          </div>

          <div
            ref={feedRef}
            className="h-[360px] space-y-3 overflow-y-auto rounded-2xl border border-border bg-white p-4 font-mono text-sm"
          >
            {events.length === 0 ? (
              <div className="flex h-full items-center justify-center text-center text-text-secondary">
                <p>Waiting for `START SCAN` to begin the simulated reasoning workflow.</p>
              </div>
            ) : (
              events.map((eventItem) => (
                <div
                  key={`${eventItem.scan_id}-${eventItem.index}-${eventItem.timestamp}`}
                  className="flex items-start gap-4 rounded-xl border border-border bg-slate-50 px-3 py-2"
                >
                  <span className="shrink-0 text-primary">[{eventItem.timestamp}]</span>
                  <div className="min-w-0 flex-1">
                    <p className="break-words text-text-primary">{eventItem.message}</p>
                    <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-text-secondary/80">
                      {eventItem.workflow_node}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-white p-4">
          <div className="mb-4">
            <p className="text-sm font-semibold text-text-primary">Scan Event Timeline</p>
            <p className="text-xs uppercase tracking-[0.24em] text-text-secondary">Realtime Graph</p>
          </div>

          <div className="h-[360px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={graphData} margin={{ top: 18, right: 12, bottom: 12, left: 0 }}>
                <CartesianGrid stroke="rgba(148, 163, 184, 0.10)" strokeDasharray="4 4" vertical={false} />
                <XAxis
                  dataKey="time"
                  tick={{ fill: "#9CA3AF", fontSize: 11 }}
                  axisLine={{ stroke: "rgba(148, 163, 184, 0.18)" }}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  domain={[1, 8]}
                  tick={{ fill: "#9CA3AF", fontSize: 11 }}
                  axisLine={{ stroke: "rgba(148, 163, 184, 0.18)" }}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    borderColor: "#D7E3EF",
                    borderRadius: "16px",
                    color: "#102033",
                  }}
                  labelStyle={{ color: "#102033" }}
                />
                <Line
                  type="monotone"
                  dataKey="event"
                  stroke="#4F8CFF"
                  strokeWidth={3}
                  dot={<DotMarker />}
                  activeDot={{ r: 6, fill: "#4F8CFF", stroke: "#A5C4FF", strokeWidth: 2 }}
                  isAnimationActive
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
}
