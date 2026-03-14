export function PageHeader({ eyebrow, title, description, status, stats = [], actions = null }) {
  return (
    <section className="panel-surface p-6 md:p-7">
      <div className="flex flex-col gap-8 xl:flex-row xl:items-start xl:justify-between">
        <div className="max-w-4xl">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-text-secondary">{eyebrow}</p>
          <h2 className="text-[2rem] font-semibold tracking-tight text-text-primary md:text-[2.35rem]">{title}</h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-text-secondary md:text-base">{description}</p>

          <div className="mt-6 flex flex-wrap gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-text-primary">
              <span className="h-2 w-2 rounded-full bg-secondary" />
              {status}
            </div>
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-full border border-border bg-card px-4 py-2 text-[11px]"
              >
                <span className="mr-2 uppercase tracking-[0.16em] text-text-secondary">{stat.label}</span>
                <span className="font-semibold text-text-primary">{stat.value}</span>
              </div>
            ))}
          </div>
        </div>

        {actions ? <div className="xl:w-[520px]">{actions}</div> : null}
      </div>
    </section>
  );
}
