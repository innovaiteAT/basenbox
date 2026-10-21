import { History as HistoryIcon, ListChecks, Settings as SettingsIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { api } from "./api/client";
import type { Rule, Run, RunPatch } from "./api/types";
import { BadgeTrio } from "./components/BadgeTrio";
import { Stepper } from "./components/Stepper";
import { useToast } from "./components/Toast";
import { lastRun, STEPS } from "./lib";
import { FinishScreen } from "./screens/FinishScreen";
import { HistoryScreen } from "./screens/HistoryScreen";
import { MenuScreen } from "./screens/MenuScreen";
import { ResultScreen } from "./screens/ResultScreen";
import { ReviewScreen } from "./screens/ReviewScreen";
import { SettingsScreen } from "./screens/SettingsScreen";
import { UploadScreen } from "./screens/UploadScreen";

type View = "flow" | "history" | "settings";

export interface ScreenProps {
  run: Run;
  rules: Rule[];
  busy: boolean;
  patch: (patch: RunPatch) => Promise<Run | null>;
  go: (step: number) => void;
}

export function App() {
  const toast = useToast();
  const [view, setView] = useState<View>("flow");
  const [step, setStep] = useState(0);
  const [run, setRun] = useState<Run | null>(null);
  const [rules, setRules] = useState<Rule[]>([]);
  const [busy, setBusy] = useState(false);

  const loadRules = useCallback(() => {
    api.rules().then(setRules).catch((e) => toast(e.message, "error"));
  }, [toast]);

  useEffect(() => {
    loadRules();
    const id = lastRun.get();
    if (id) {
      api
        .run(id)
        .then((r) => {
          setRun(r);
          setStep(r.files.length ? 3 : 1);
        })
        .catch(() => lastRun.set(null));
    }
  }, [loadRules]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [step, view]);

  const openRun = (r: Run, target?: number) => {
    setRun(r);
    lastRun.set(r.id);
    setView("flow");
    setStep(target ?? (r.files.length ? 3 : 1));
  };

  const patch = useCallback(
    async (p: RunPatch) => {
      if (!run) return null;
      setBusy(true);
      try {
        const next = await api.patch(run.id, p);
        setRun(next);
        return next;
      } catch (e) {
        toast((e as Error).message, "error");
        return null;
      } finally {
        setBusy(false);
      }
    },
    [run, toast],
  );

  const startNew = () => {
    setRun(null);
    lastRun.set(null);
    setView("flow");
    setStep(0);
  };

  const reachable = !run ? 0 : run.files.length ? 4 : 3;
  const props = run ? { run, rules, busy, patch, go: setStep } : null;

  return (
    <div className="shell">
      <header className="topbar">
        <button
          type="button"
          onClick={() => setView("flow")}
          style={{ all: "unset", cursor: "pointer", display: "flex", alignItems: "center", gap: 14 }}
          aria-label="Zum Tagesablauf"
        >
          <img src="/basenbox_logo.jpg" alt="Basenbox" className="topbar__logo" />
        </button>
        <BadgeTrio />
        <nav className="topbar__nav" aria-label="Hauptnavigation">
          <button type="button" className="navlink" aria-current={view === "flow" ? "page" : undefined} onClick={() => setView("flow")}>
            <ListChecks size={16} aria-hidden /> Ablauf
          </button>
          <button type="button" className="navlink" aria-current={view === "history" ? "page" : undefined} onClick={() => setView("history")}>
            <HistoryIcon size={16} aria-hidden /> Verlauf
          </button>
          <button type="button" className="navlink" aria-current={view === "settings" ? "page" : undefined} onClick={() => setView("settings")}>
            <SettingsIcon size={16} aria-hidden /> Einstellungen
          </button>
        </nav>
      </header>

      {view === "flow" && (
        <>
          <Stepper steps={STEPS} current={step} reachable={reachable} onSelect={setStep} />
          <main className="page" key={step}>
            {step === 0 && (
              <UploadScreen
                run={run}
                busy={busy}
                patch={patch}
                onUploaded={(r) => openRun(r, 0)}
                onReset={startNew}
                go={setStep}
              />
            )}
            {props && step === 1 && <ReviewScreen {...props} />}
            {props && step === 2 && <MenuScreen {...props} onGenerated={(r) => {
                  setRun(r);
                  setStep(3);
                }} />}
            {props && step === 3 && <ResultScreen {...props} onGenerated={setRun} />}
            {props && step === 4 && <FinishScreen {...props} onRestart={startNew} />}
          </main>
        </>
      )}
      {view === "history" && (
        <main className="page">
          <HistoryScreen currentId={run?.id} onOpen={openRun} onNew={startNew} />
        </main>
      )}
      {view === "settings" && (
        <main className="page">
          <SettingsScreen
            onRulesSaved={(r) => {
              setRules(r);
              if (run) patch({});
            }}
            onTemplatesSaved={() => run && patch({})}
          />
        </main>
      )}
    </div>
  );
}
