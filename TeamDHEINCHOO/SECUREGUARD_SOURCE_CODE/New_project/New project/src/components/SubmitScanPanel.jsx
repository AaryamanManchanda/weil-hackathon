function getTargetLabel(targetType) {
  if (targetType === "api") {
    return "API Endpoint";
  }

  if (targetType === "github") {
    return "Repository URL";
  }

  return "Target URL";
}

function getTargetPlaceholder(targetType) {
  if (targetType === "api") {
    return "https://api.acme.com/v1";
  }

  if (targetType === "github") {
    return "https://github.com/acme/security-app";
  }

  return "https://store.acme.com";
}

export function SubmitScanPanel({ form, onChange, onSubmit, submitting }) {
  const isCodebaseTarget = form.target_type === "github" || form.target_type === "zip";
  const hasTargetSource = form.target_type === "zip" ? Boolean(form.zip_file_name) : Boolean(form.target?.trim());
  const canSubmit = Boolean(form.company?.trim()) && hasTargetSource && Number(form.bounty) > 0;

  return (
    <section className="panel-surface p-5 md:p-6">
      <div className="mb-5">
        <p className="text-sm font-semibold text-text-primary">Submit Scan</p>
        <p className="text-xs uppercase tracking-[0.24em] text-text-secondary">Website, API, repository, or ZIP intake</p>
      </div>

      <form
        onSubmit={onSubmit}
        className="space-y-4"
      >
        <div>
          <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
            Company Name
          </label>
          <input
            type="text"
            value={form.company}
            onChange={(event) => onChange("company", event.target.value)}
            className="w-full rounded-xl border border-border bg-[#f4f2ed] px-4 py-3 text-sm text-text-primary outline-none transition focus:border-primary/20"
            placeholder="Acme Finance"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
              Target Type
            </label>
            <select
              value={form.target_type}
              onChange={(event) => onChange("target_type", event.target.value)}
              className="w-full rounded-xl border border-border bg-[#f4f2ed] px-4 py-3 text-sm text-text-primary outline-none transition focus:border-primary/20"
            >
              <option value="website">Website URL</option>
              <option value="api">API Endpoint</option>
              <option value="github">GitHub Repository</option>
              <option value="zip">ZIP Codebase</option>
            </select>
          </div>
          <div>
            <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
              Scan Type
            </label>
            <select
              value={form.scan_type}
              onChange={(event) => onChange("scan_type", event.target.value)}
              className="w-full rounded-xl border border-border bg-[#f4f2ed] px-4 py-3 text-sm text-text-primary outline-none transition focus:border-primary/20"
            >
              <option value="web_security">Web Security</option>
              <option value="api_security">API Security</option>
              <option value="code_review">Code Review</option>
            </select>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
            {form.target_type === "zip" ? "ZIP Codebase" : getTargetLabel(form.target_type)}
          </label>
          {form.target_type === "zip" ? (
            <div className="space-y-3">
              <label className="flex cursor-pointer items-center justify-between rounded-xl border border-dashed border-border bg-[#f4f2ed] px-4 py-3 text-sm text-text-primary transition hover:border-primary/25">
                <span>{form.zip_file_name || "Choose ZIP file"}</span>
                <span className="rounded-lg border border-border bg-white px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-text-secondary">
                  Browse
                </span>
                <input
                  type="file"
                  accept=".zip"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    onChange("zip_file_name", file?.name ?? "");
                    onChange("target", file?.name ? `upload://${file.name}` : "");
                  }}
                />
              </label>
              <p className="text-xs leading-5 text-text-secondary">
                ZIP uploads are captured as scan sources for the workflow. Real file ingestion can be wired to your agent runtime next.
              </p>
            </div>
          ) : (
            <input
              type="text"
              value={form.target}
              onChange={(event) => onChange("target", event.target.value)}
              className="w-full rounded-xl border border-border bg-[#f4f2ed] px-4 py-3 text-sm text-text-primary outline-none transition focus:border-primary/20"
              placeholder={getTargetPlaceholder(form.target_type)}
            />
          )}
        </div>

        {form.target_type === "github" ? (
          <div>
            <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
              Repository Branch
            </label>
            <input
              type="text"
              value={form.repository_branch}
              onChange={(event) => onChange("repository_branch", event.target.value)}
              className="w-full rounded-xl border border-border bg-[#f4f2ed] px-4 py-3 text-sm text-text-primary outline-none transition focus:border-primary/20"
              placeholder="main"
            />
          </div>
        ) : null}

        {isCodebaseTarget ? (
          <div>
            <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
              Entry Point / Scope
            </label>
            <input
              type="text"
              value={form.entry_point}
              onChange={(event) => onChange("entry_point", event.target.value)}
              className="w-full rounded-xl border border-border bg-[#f4f2ed] px-4 py-3 text-sm text-text-primary outline-none transition focus:border-primary/20"
              placeholder={form.target_type === "github" ? "src/, apps/api, or services/auth" : "src/, app/, or specific package"}
            />
          </div>
        ) : null}

        <div>
          <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
            Scan Notes
          </label>
          <textarea
            value={form.notes}
            onChange={(event) => onChange("notes", event.target.value)}
            rows={3}
            className="w-full rounded-xl border border-border bg-[#f4f2ed] px-4 py-3 text-sm text-text-primary outline-none transition focus:border-primary/20"
            placeholder="Optional scope notes, credentials, excluded paths, or audit context"
          />
        </div>

        <div>
          <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
            Bounty Amount
          </label>
          <div className="flex items-center rounded-xl border border-border bg-[#f4f2ed] px-4">
            <input
              type="number"
              min="1"
              value={form.bounty}
              onChange={(event) => onChange("bounty", Number(event.target.value))}
              className="w-full bg-transparent py-3 text-sm text-text-primary outline-none"
            />
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-text-secondary">WUSD</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting || !canSubmit}
          className={`w-full rounded-xl border px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.22em] transition ${
            submitting || !canSubmit
              ? "cursor-not-allowed border-border bg-card text-text-secondary"
              : "border-primary bg-primary text-white"
          }`}
        >
          {submitting ? "Creating Scan" : "Start Scan"}
        </button>
      </form>
    </section>
  );
}
