export function MetaCard({ label, value, accent = "primary", mono = false }) {
  const accentStyles =
    accent === "secondary"
      ? "border-border bg-card"
      : accent === "danger"
        ? "border-danger/20 bg-danger/5"
        : "border-border bg-card";

  return (
    <div className={`rounded-[22px] border p-4 ${accentStyles}`}>
      <p className="mb-2 text-[11px] uppercase tracking-[0.22em] text-text-secondary">{label}</p>
      <p className={`text-sm leading-6 text-text-primary ${mono ? "break-all font-mono text-[12px]" : "font-medium"}`}>
        {value}
      </p>
    </div>
  );
}
