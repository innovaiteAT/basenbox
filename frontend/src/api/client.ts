import type { MailTemplates, Rule, RuleTestResult, Run, RunPatch, RunSummary } from "./types";

export class ApiError extends Error {}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const init: RequestInit = { method };
  if (body instanceof FormData) init.body = body;
  else if (body !== undefined) {
    init.body = JSON.stringify(body);
    init.headers = { "Content-Type": "application/json" };
  }
  let res: Response;
  try {
    res = await fetch(`/api${path}`, init);
  } catch {
    throw new ApiError("Keine Verbindung zum Server. Läuft der Stack?");
  }
  if (!res.ok) {
    let message = `Fehler ${res.status}`;
    try {
      const data = await res.json();
      if (typeof data.detail === "string") message = data.detail;
      else if (Array.isArray(data.detail)) message = "Eingabe ungültig: " + data.detail.map((d: { msg: string }) => d.msg).join(", ");
    } catch {
      /* Antwort ohne JSON */
    }
    throw new ApiError(message);
  }
  return res.json() as Promise<T>;
}

const enc = encodeURIComponent;

export const api = {
  health: () => request<{ status: string }>("GET", "/health"),
  upload: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return request<Run>("POST", "/runs", form);
  },
  runs: () => request<RunSummary[]>("GET", "/runs"),
  run: (id: string) => request<Run>("GET", `/runs/${enc(id)}`),
  patch: (id: string, patch: RunPatch) => request<Run>("PATCH", `/runs/${enc(id)}`, patch),
  generate: (id: string) => request<Run>("POST", `/runs/${enc(id)}/generate`),
  fileUrl: (id: string, name: string) => `/api/runs/${enc(id)}/files/${enc(name)}`,
  zipUrl: (id: string) => `/api/runs/${enc(id)}/zip`,
  rules: () => request<Rule[]>("GET", "/config/rules"),
  saveRules: (rules: Rule[]) => request<Rule[]>("PUT", "/config/rules", rules),
  importRules: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return request<Rule[]>("POST", "/config/rules/import", form);
  },
  testRules: (text: string) => request<RuleTestResult>("POST", "/config/rules/test", { text }),
  mailTemplates: () => request<MailTemplates>("GET", "/config/mail-templates"),
  saveMailTemplates: (value: MailTemplates) => request<MailTemplates>("PUT", "/config/mail-templates", value),
};
