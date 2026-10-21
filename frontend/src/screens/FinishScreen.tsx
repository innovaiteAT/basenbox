import { ArrowLeft, Download, ExternalLink, Mail, PartyPopper, QrCode, Send, Tags } from "lucide-react";
import type { ReactNode } from "react";
import type { ScreenProps } from "../App";
import { api } from "../api/client";
import { Deco } from "../components/BadgeTrio";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Checklist, Progress, type ChecklistItem } from "../components/Checklist";
import { CopyField } from "../components/CopyField";
import { Notice } from "../components/Notice";
import { Title } from "../components/Title";

const QR_URL = "https://app.qr-code-generator.com/manage/?login=1";

export function FinishScreen({ run, patch, go }: ScreenProps) {
  const d = run.derived;
  const label = run.delivery.label;
  const labelsFile = run.files.find((f) => f.endsWith("Etikettenliste.xlsx"));
  const gesamtFile = run.files.find((f) => f.endsWith("Gesamt.xlsx"));
  const specialPdf = run.files.find((f) => f.endsWith("Spezialwünsche.pdf"));

  const fileLink = (name: string | undefined, text: string) =>
    name && (
      <a className="btn btn--ghost btn--small" href={api.fileUrl(run.id, name)} download={name} style={{ justifySelf: "start" }}>
        <Download size={16} /> {text}
      </a>
    );

  const mails: ChecklistItem[] = Object.entries(d.mails).map(([id, mail]) => ({
    id: `mail.${id}`,
    title: <>Mail an {mail.name} verschickt</>,
    body: (
      <div style={{ display: "grid", gap: 8 }}>
        <CopyField value={mail.subject} label="Betreff" />
        <CopyField value={mail.body} label="Mailtext" />
        <div className="actions">
          <a className="btn btn--small" href={`mailto:${encodeURIComponent(mail.to)}?subject=${encodeURIComponent(mail.subject)}&body=${encodeURIComponent(mail.body)}`}>
            <Send size={16} /> Im Mailprogramm öffnen
          </a>
          {id === "goran" && fileLink(gesamtFile, "Gesamtliste für den Anhang")}
          {id !== "goran" && fileLink(specialPdf, "Spezialwünsche-PDF für den Anhang")}
        </div>
      </div>
    ),
  }));

  const avery: ChecklistItem[] = [
    { id: "avery.open", title: <>Avery Zweckform öffnen, Vorlage 3424, Schritt „Anpassen“</> },
    {
      id: "avery.import",
      title: <>Links „Daten importieren“ → „Import / Seriendruck starten“ → Etikettenliste hochladen</>,
      body: fileLink(labelsFile, labelsFile ?? "Etikettenliste"),
    },
    { id: "avery.header", title: <>Häkchen bei der ersten Zeile entfernen (Kopfzeile nicht drucken)</> },
    {
      id: "avery.fields",
      title: <>Felder anordnen, zwischen PLZ und Spezialwünsche eine Leerzeile</>,
      body: <CopyField value={d.avery_layout} label="Feldanordnung" />,
    },
    { id: "avery.print", title: <>Fertig stellen → Vorschau &amp; Drucken</> },
    { id: "avery.save", title: <>Herunterladen und speichern als</>, body: <CopyField value={d.labels_filename} label="Dateiname" /> },
  ];

  const ac: ChecklistItem[] = [
    {
      id: "ac.emails",
      title: <>E-Mail-Adressen kopieren ({d.emails.length})</>,
      body: <CopyField value={d.emails.join("\n")} display={`${d.emails.length} Adressen, eine pro Zeile`} label="E-Mail-Adressen" />,
    },
    { id: "ac.import", title: <>In AC: Contacts → Import → „Copy and paste your contacts“ → einfügen → Next</> },
    { id: "ac.list", title: <>Unter „Select lists“ die Liste wählen</>, body: <CopyField value={d.ac_list} label="Liste" /> },
    { id: "ac.tag", title: <>Bei „Add tags“ den Tag vergeben</>, body: <CopyField value={d.ac_tag} label="Tag" /> },
    { id: "ac.update", title: <>„Update existing contacts while importing“ ankreuzen → Import → auf „Import complete!“ warten</> },
    {
      id: "ac.bulk",
      title: (
        <>
          Contacts nach dem Tag filtern → Edit all → Add to a list „{d.ac_list}“ → Apply. Es müssen <strong>{d.emails.length}</strong> Kontakte sein
        </>
      ),
    },
    { id: "ac.campaign", title: <>Campaigns → Kurbrief mit diesem Datum suchen → Continue</>, body: <CopyField value={d.ac_search} label="Suchbegriff" /> },
    {
      id: "ac.recipients",
      title: (
        <>
          Subscribed to: „{d.ac_list}“ · Send to: „{d.ac_tag}“ · Calculate recipients muss {d.emails.length} ergeben
        </>
      ),
    },
    {
      id: "ac.schedule",
      title: (
        <>
          Schedule: {d.ac_search}, <strong>{d.ac_time} Uhr</strong> → Set schedule → Finish (optional vorher Testmail an die Support-Mail)
        </>
      ),
    },
  ];

  const qr: ChecklistItem[] = [
    { id: "qr.link", title: <>In AC: Campaign → Kurbrief mit heutigem Datum → View Report → Message → Globus „View the web copy“ → Link kopieren</> },
    {
      id: "qr.edit",
      title: <>Im QR-Code-Generator bei „Basenbrief digital“ auf den Stift (Inhalt bearbeiten) → neuen Link hinterlegen → speichern</>,
      body: (
        <a className="btn btn--ghost btn--small" href={QR_URL} target="_blank" rel="noreferrer" style={{ justifySelf: "start" }}>
          <ExternalLink size={16} /> QR-Code-Generator öffnen
        </a>
      ),
    },
    { id: "qr.test", title: <>QR-Code mit dem Handy scannen und testen</> },
  ];

  const groups: { key: string; title: string; subtitle: string; icon: ReactNode; items: ChecklistItem[]; before?: ReactNode }[] = [
    { key: "mail", title: "Mails", subtitle: "Gaumenfreundinnen und Goran", icon: <Mail size={20} />, items: mails },
    { key: "avery", title: "Etiketten drucken", subtitle: `Avery Zweckform 3424 · ${label} Etiketten`, icon: <Tags size={20} />, items: avery },
    { key: "ac", title: "AC Kurbrief", subtitle: "ActiveCampaign · Versand 11:00", icon: <Send size={20} />, items: ac },
    {
      key: "qr",
      title: "QR-Code Basenbrief",
      subtitle: "Nur den Link tauschen",
      icon: <QrCode size={20} />,
      items: qr,
      before: (
        <div style={{ marginBottom: 14 }}>
          <Notice tone="strong">
            <strong>ACHTUNG:</strong> Immer kontrollieren, ob der QR-Code funktioniert.
          </Notice>
          <Notice tone="strong">
            <strong>ACHTUNG:</strong> QR-Code nicht löschen oder ändern. Nur den hinterlegten Link anpassen.
          </Notice>
        </div>
      ),
    },
  ];

  const all = groups.flatMap((g) => g.items.map((i) => i.id));
  const doneCount = all.filter((id) => run.checklist[id]).length;
  const finished = doneCount === all.length;
  const toggle = (id: string, value: boolean) => patch({ checklist: { [id]: value } });

  return (
    <>
      <Title
        kicker={`Schritt 5 · ${run.delivery.weekday} ${label}`}
        light="Fast "
        bold="geschafft"
        lead="Was nicht automatisch geht, erledigst du hier Schritt für Schritt. Dein Fortschritt bleibt gespeichert."
      />

      {finished ? (
        <div className="success" role="status">
          <Deco size={220} color="var(--bb-orange)" style={{ right: -60, top: -80, opacity: 0.6 }} />
          <Deco size={160} color="var(--bb-lime)" style={{ left: -50, bottom: -70, opacity: 0.8 }} />
          <span className="icon-circle" style={{ width: 80, height: 80, margin: "0 auto 16px", background: "var(--bb-white)" }} aria-hidden>
            <PartyPopper size={36} />
          </span>
          <h2 className="title" style={{ fontSize: 32 }}>
            Super<strong>rrr geschafft!</strong>
          </h2>
          <p className="lead" style={{ margin: "12px auto 0", color: "var(--bb-ink)" }}>
            Alles für {run.delivery.weekday}, den {label}, ist erledigt. Danke dir!
          </p>
        </div>
      ) : (
        <Card white title={`${doneCount} von ${all.length} erledigt`} subtitle="Hak ab, was du gemacht hast.">
          <Progress value={doneCount} total={all.length} label="Fortschritt" />
        </Card>
      )}

      <div style={{ display: "grid", gap: 16, marginTop: 16 }}>
        {groups.map((g) => {
          const n = g.items.filter((i) => run.checklist[i.id]).length;
          return (
            <Card
              key={g.key}
              icon={g.icon}
              iconTone={n === g.items.length ? "lime" : "lemon"}
              title={g.title}
              subtitle={g.subtitle}
              aside={<span className={`pill ${n === g.items.length ? "pill--lime" : "pill--mist"}`}>{n}/{g.items.length}</span>}
            >
              {g.before}
              <Checklist items={g.items} done={run.checklist} onToggle={toggle} />
            </Card>
          );
        })}
      </div>

      <div className="footer-actions">
        <Button variant="ghost" icon={<ArrowLeft size={16} />} onClick={() => go(3)}>
          Zurück zum Ergebnis
        </Button>
      </div>
    </>
  );
}
