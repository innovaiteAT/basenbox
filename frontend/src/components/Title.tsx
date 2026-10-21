import type { ReactNode } from "react";

interface Props {
  kicker?: ReactNode;
  light: string;
  bold: string;
  lead?: ReactNode;
  aside?: ReactNode;
}

/** Zweistufiger Titel wie im Logo: erster Teil Warmgrau, Schlüsselwort fett. */
export function Title({ kicker, light, bold, lead, aside }: Props) {
  return (
    <header className="section-head">
      <div>
        {kicker && <p className="kicker">{kicker}</p>}
        <h1 className="title">
          {light}
          <strong>{bold}</strong>
        </h1>
        {lead && <p className="lead">{lead}</p>}
      </div>
      {aside}
    </header>
  );
}
