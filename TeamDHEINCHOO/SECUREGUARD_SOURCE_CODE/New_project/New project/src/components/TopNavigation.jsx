import { motion } from "framer-motion";

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16 21 21" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M6.5 16.5h11l-1.4-2.1V10a4.6 4.6 0 0 0-9.2 0v4.4z" />
      <path d="M10 19a2 2 0 0 0 4 0" />
    </svg>
  );
}

export function TopNavigation({ currentRoute, searchValue, onSearchChange, onSearchSubmit, notificationCount }) {
  return (
    <header className="panel-surface sticky top-4 z-30 px-5 py-4 md:px-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-center gap-4">
          <motion.div
            whileHover={{ rotate: -4, scale: 1.03 }}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-sm font-semibold text-text-primary"
          >
            SG
          </motion.div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-text-secondary">SecureGuard AI</p>
            <div className="mt-1 flex flex-wrap items-center gap-3">
              <h1 className="text-lg font-semibold text-text-primary">{currentRoute.label}</h1>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <form
            onSubmit={onSearchSubmit}
            className="flex min-w-[280px] items-center gap-3 rounded-xl border border-border bg-card px-4 py-3"
          >
            <span className="text-text-secondary">
              <SearchIcon />
            </span>
            <input
              type="search"
              value={searchValue}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search modules, scans, proofs, escrow..."
              className="w-full bg-transparent text-sm text-text-primary outline-none placeholder:text-text-secondary/75"
            />
          </form>

          <div className="flex items-center gap-3">
            <button
              type="button"
              className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-card text-text-secondary transition hover:text-text-primary"
            >
              <BellIcon />
              {notificationCount > 0 ? (
                <span className="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-text-primary px-1.5 py-0.5 text-[10px] font-semibold text-white">
                  {notificationCount}
                </span>
              ) : null}
            </button>

            <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-2">
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-[0.18em] text-text-secondary">Hi, Alex</p>
                <p className="text-sm font-semibold text-text-primary">Security Lead</p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-[#efede8] text-sm font-semibold text-text-primary">
                AM
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
