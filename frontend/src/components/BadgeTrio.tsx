import type { CSSProperties } from "react";

export function BadgeTrio() {
  return (
    <span className="trio" role="img" aria-label="bunt, bio, basisch">
      <span style={{ background: "var(--bb-lemon)" }} />
      <span style={{ background: "var(--bb-lime)" }} />
      <span style={{ background: "var(--bb-coral)" }} />
    </span>
  );
}

export function Deco({ size, color, style }: { size: number; color: string; style: CSSProperties }) {
  return <span className="deco" aria-hidden style={{ width: size, height: size, background: color, ...style }} />;
}
