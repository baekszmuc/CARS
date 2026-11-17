/**
 * 레퍼런스의 원형 게이지: 아래가 열린 270° 호 위에 값을 채운다.
 * fraction 은 0~1. 숫자는 가운데, 단위는 그 아래.
 */
export function Gauge({ value, unit, fraction, label }: { value: string; unit: string; fraction: number; label: string }) {
  const r = 88;
  const c = 2 * Math.PI * r;
  const arc = c * 0.75;
  const f = Math.max(0, Math.min(1, fraction));
  return (
    <svg viewBox="0 0 220 200" className="mx-auto h-auto w-full max-w-[15rem]" role="img" aria-label={`${label} ${value} ${unit}`}>
      <g transform="rotate(135 110 110)">
        <circle cx="110" cy="110" r={r} fill="none" stroke="#c9cbd0" strokeWidth="1.5" strokeDasharray={`${arc} ${c}`} />
        <circle cx="110" cy="110" r={r} fill="none" stroke="#121417" strokeWidth="3" strokeDasharray={`${arc * f} ${c}`} />
      </g>
      <text x="110" y="118" textAnchor="middle" style={{ fontFamily: "var(--font-michroma), sans-serif", fontSize: 40 }}>
        {value}
      </text>
      <text x="110" y="150" textAnchor="middle" fill="#4a4d53" style={{ fontSize: 15 }}>
        {unit}
      </text>
    </svg>
  );
}
