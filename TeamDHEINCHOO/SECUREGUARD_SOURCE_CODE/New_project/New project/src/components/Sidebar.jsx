import { motion } from "framer-motion";

export function Sidebar({ sections, currentPath, onNavigate }) {
  return (
    <aside className="hidden w-[240px] shrink-0 border-r border-border/90 bg-[#efede8]/90 px-6 py-5 lg:block">
      <div className="mb-8 overflow-hidden">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card text-sm font-semibold text-text-primary">
            SG
          </div>
          <div>
            <h1 className="text-base font-semibold text-text-primary">SecureGuard AI</h1>
            <p className="text-[11px] uppercase tracking-[0.28em] text-text-secondary">Security command center</p>
          </div>
        </div>
      </div>

      <nav className="space-y-7">
        {sections.map((section, sectionIndex) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25, delay: sectionIndex * 0.05 }}
          >
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-text-secondary/70">
              {section.title}
            </p>
            <div className="space-y-2">
              {section.items.map((item) => {
                const isActive = currentPath === item.path;

                return (
                  <button
                    key={item.path}
                    type="button"
                    onClick={() => onNavigate(item.path)}
                    className={`group relative flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-[12px] transition ${
                      isActive
                        ? "border-transparent bg-card text-text-primary"
                        : "border-transparent text-text-secondary hover:bg-card/60 hover:text-text-primary"
                    }`}
                  >
                    {isActive ? <span className="absolute left-0 top-1/2 h-8 w-px -translate-y-1/2 bg-text-primary" /> : null}
                    <span>{item.label}</span>
                    <span
                      className={`h-2.5 w-2.5 rounded-full transition ${
                        isActive ? "bg-text-primary" : "bg-stone-300 group-hover:bg-text-primary/45"
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </motion.div>
        ))}
      </nav>
    </aside>
  );
}
