import {
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const distributionColors = {
  "SQL Injection": "#EF4444",
  XSS: "#F59E0B",
  "Auth Bypass": "#4F8CFF",
};

function MetricCard({ title, value, description, accentClass }) {
  return (
    <article className="panel-surface h-full p-5 transition duration-300 hover:border-primary/25 hover:shadow-[0_0_28px_rgba(79,140,255,0.14)]">
      <div className={`mb-4 inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${accentClass}`}>
        Metric
      </div>
      <p className="text-sm font-medium text-text-secondary">{title}</p>
      <p className="mt-3 text-4xl font-semibold tracking-tight text-text-primary">{value}</p>
      <p className="mt-3 text-sm leading-6 text-text-secondary">{description}</p>
    </article>
  );
}

function GlowDot({ cx, cy, payload }) {
  if (typeof cx !== "number" || typeof cy !== "number") {
    return null;
  }

  return (
    <g>
      <circle cx={cx} cy={cy} r={10} fill="rgba(79, 140, 255, 0.14)" />
      <circle cx={cx} cy={cy} r={4.5} fill="#4F8CFF" stroke="#A5C4FF" strokeWidth={1.5} />
      {payload?.latest ? <circle cx={cx} cy={cy} r={6.5} fill="none" stroke="rgba(79, 140, 255, 0.45)" /> : null}
    </g>
  );
}

export function SystemIntelligencePanel({ analytics, scanRunning, model, contractStatus }) {
  const timelineData = analytics.timeline.map((item, index) => ({
    ...item,
    latest: index === analytics.timeline.length - 1,
  }));
  const hasDistributionData = analytics.distribution.some((item) => item.value > 0);
  const payoutStatus = contractStatus === "Released" ? "Escrow payout completed." : "Escrow payout pending.";

  const metrics = [
    {
      title: "Total Scans Executed",
      value: analytics.totalScans,
      description: "Number of vulnerability scans performed by the AI agent.",
      accentClass: "border-primary/20 bg-primary/10 text-primary",
    },
    {
      title: "Vulnerabilities Detected",
      value: analytics.vulnerabilitiesDetected,
      description: "Total confirmed security findings discovered by the AI scanner.",
      accentClass: "border-amber-500/25 bg-amber-500/10 text-amber-300",
    },
    {
      title: "Exploit Success Rate",
      value: `${Math.round(analytics.exploitSuccessRate * 100)}%`,
      description: "Percentage of exploit attempts that successfully identified vulnerabilities.",
      accentClass: "border-secondary/20 bg-secondary/10 text-secondary",
    },
    {
      title: "Average AI Confidence",
      value: analytics.avgConfidence.toFixed(2),
      description: "Average confidence score across all vulnerability detections.",
      accentClass: "border-primary/20 bg-primary/10 text-primary",
    },
  ];

  return (
    <section className="panel-surface overflow-hidden p-6 md:p-7">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.32em] text-primary/75">System Intelligence</p>
          <h2 className="text-2xl font-semibold text-text-primary">System Intelligence</h2>
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            AI security agent performance and scan analytics
          </p>
        </div>
        <div className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          {scanRunning ? "Active Monitoring" : "Analytics Ready"}
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard
            key={metric.title}
            title={metric.title}
            value={metric.value}
            description={metric.description}
            accentClass={metric.accentClass}
          />
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(340px,0.8fr)]">
        <div className="panel-surface h-full p-5">
          <div className="mb-4">
            <p className="text-sm font-semibold text-text-primary">Scan Activity Overview</p>
            <p className="text-xs uppercase tracking-[0.24em] text-text-secondary">Live vulnerabilities by timestamp</p>
          </div>

          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timelineData} margin={{ top: 18, right: 18, bottom: 8, left: 0 }}>
                <CartesianGrid stroke="rgba(148, 163, 184, 0.10)" strokeDasharray="4 4" vertical={false} />
                <XAxis
                  dataKey="time"
                  tick={{ fill: "#9CA3AF", fontSize: 11 }}
                  axisLine={{ stroke: "rgba(148, 163, 184, 0.18)" }}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
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
                  dataKey="vulnerabilities"
                  stroke="#4F8CFF"
                  strokeWidth={3}
                  dot={<GlowDot />}
                  activeDot={{ r: 6, fill: "#4F8CFF", stroke: "#A5C4FF", strokeWidth: 2 }}
                  isAnimationActive
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid gap-6">
          <div className="panel-surface p-5">
            <div className="mb-4">
              <p className="text-sm font-semibold text-text-primary">Vulnerability Distribution</p>
              <p className="text-xs uppercase tracking-[0.24em] text-text-secondary">Confirmed finding categories</p>
            </div>

            {hasDistributionData ? (
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.distribution}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={55}
                      outerRadius={92}
                      paddingAngle={4}
                    >
                      {analytics.distribution.map((entry) => (
                        <Cell key={entry.name} fill={distributionColors[entry.name] ?? "#4F8CFF"} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#FFFFFF",
                        borderColor: "#D7E3EF",
                        borderRadius: "16px",
                        color: "#102033",
                      }}
                    />
                    <Legend wrapperStyle={{ color: "#9CA3AF", fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex h-[250px] items-center justify-center rounded-2xl border border-dashed border-border bg-slate-50 text-center">
                <div>
                  <p className="text-text-primary">No confirmed categories yet.</p>
                  <p className="mt-2 text-sm text-text-secondary">The pie chart will populate after detections arrive.</p>
                </div>
              </div>
            )}
          </div>

          <div className="panel-surface p-5">
            <div className="mb-4">
              <p className="text-sm font-semibold text-text-primary">AI Security Agent Health</p>
              <p className="text-xs uppercase tracking-[0.24em] text-text-secondary">Operational performance snapshot</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-border bg-slate-50 p-4">
                <p className="mb-1 text-xs uppercase tracking-[0.24em] text-text-secondary">Model</p>
                <p className="text-text-primary">{model}</p>
              </div>
              <div className="rounded-2xl border border-border bg-slate-50 p-4">
                <p className="mb-1 text-xs uppercase tracking-[0.24em] text-text-secondary">Scan Status</p>
                <p className={scanRunning ? "text-secondary" : "text-text-primary"}>{scanRunning ? "Active" : "Idle"}</p>
              </div>
              <div className="rounded-2xl border border-border bg-slate-50 p-4">
                <p className="mb-1 text-xs uppercase tracking-[0.24em] text-text-secondary">Accuracy</p>
                <p className="text-text-primary">{Math.round(analytics.performance.accuracy * 100)}%</p>
              </div>
              <div className="rounded-2xl border border-border bg-slate-50 p-4">
                <p className="mb-1 text-xs uppercase tracking-[0.24em] text-text-secondary">Coverage</p>
                <p className="text-text-primary">{Math.round(analytics.performance.coverage * 100)}%</p>
              </div>
              <div className="rounded-2xl border border-border bg-slate-50 p-4 sm:col-span-2">
                <p className="mb-1 text-xs uppercase tracking-[0.24em] text-text-secondary">Average Scan Time</p>
                <p className="text-text-primary">{analytics.performance.avg_scan_time.toFixed(1)} seconds</p>
              </div>
            </div>

            <div
              className={`mt-4 rounded-2xl border p-4 text-sm leading-6 ${
                contractStatus === "Released"
                  ? "border-secondary/20 bg-secondary/10 text-secondary"
                  : "border-primary/20 bg-primary/10 text-primary"
              }`}
            >
              {payoutStatus}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
