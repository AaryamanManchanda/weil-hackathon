import { AnimatePresence, motion } from "framer-motion";

export function ConfigureAgentModal({ isOpen, config, onClose, onChange, onSave }) {
  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20 px-4 backdrop-blur-md"
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ duration: 0.24 }}
            className="panel-surface panel-glow w-full max-w-xl p-6"
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.32em] text-primary/75">Configure Agent</p>
                <h2 className="text-2xl font-semibold text-text-primary">Scanner Runtime Parameters</h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-border px-3 py-1 text-sm text-text-secondary transition hover:border-primary/30 hover:text-text-primary"
              >
                Close
              </button>
            </div>

            <div className="space-y-5">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-text-primary">Target URL</span>
                <input
                  value={config.targetUrl}
                  onChange={(event) => onChange("targetUrl", event.target.value)}
                  className="w-full rounded-2xl border border-border bg-slate-50 px-4 py-3 text-sm text-text-primary outline-none transition focus:border-primary/40 focus:shadow-[0_0_0_1px_rgba(79,140,255,0.2)]"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-text-primary">Attack Modules</span>
                <select
                  value={config.attackModule}
                  onChange={(event) => onChange("attackModule", event.target.value)}
                  className="w-full rounded-2xl border border-border bg-slate-50 px-4 py-3 text-sm text-text-primary outline-none transition focus:border-primary/40 focus:shadow-[0_0_0_1px_rgba(79,140,255,0.2)]"
                >
                  <option>SQL Injection</option>
                  <option>Prompt Injection</option>
                  <option>Access Control Drift</option>
                </select>
              </label>

              <label className="block">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-text-primary">Confidence Threshold</span>
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                    {config.confidenceThreshold.toFixed(1)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.1"
                  value={config.confidenceThreshold}
                  onChange={(event) => onChange("confidenceThreshold", Number(event.target.value))}
                  className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-primary"
                />
              </label>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-2xl border border-border px-4 py-3 text-sm font-semibold text-text-secondary transition hover:border-primary/25 hover:text-text-primary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onSave}
                className="rounded-2xl border border-primary/50 bg-primary px-4 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-white shadow-[0_0_24px_rgba(79,140,255,0.35)] transition hover:shadow-[0_0_36px_rgba(79,140,255,0.45)]"
              >
                Save
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
