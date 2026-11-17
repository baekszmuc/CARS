/**
 * BS Select 로고타입. 넓고 각진 Michroma 서체를 넓은 자간으로 쓴다.
 * 높이(h-*)에 맞춰 늘어나도록 SVG 텍스트로 그리고, 색은 currentColor 를 따른다.
 */
export function LogoMark({ className = "", title = "BS Select" }: { className?: string; title?: string }) {
  return (
    <svg viewBox="0 0 620 52" className={className} fill="currentColor" role="img" aria-label={title}>
      <text
        x="0"
        y="44"
        textLength="620"
        lengthAdjust="spacing"
        style={{ fontFamily: "var(--font-michroma), Michroma, sans-serif", fontSize: 50 }}
      >
        BS SELECT
      </text>
    </svg>
  );
}
