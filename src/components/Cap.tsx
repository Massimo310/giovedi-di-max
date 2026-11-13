// Marchio dell'app: un tappo a corona con la M di Max
export default function Cap({ size = 44 }: { size?: number }) {
  const teeth = 21;
  const pts = Array.from({ length: teeth * 2 }, (_, i) => {
    const a = (i / (teeth * 2)) * Math.PI * 2;
    const r = i % 2 ? 46 : 50;
    return `${50 + r * Math.cos(a)},${50 + r * Math.sin(a)}`;
  }).join(' ');
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className="cap" aria-hidden>
      <polygon points={pts} fill="var(--cap-edge)" />
      <circle cx="50" cy="50" r="40" fill="var(--cap-face)" />
      <circle cx="50" cy="50" r="33" fill="none" stroke="var(--cap-ring)" strokeWidth="2.5" />
      <text x="50" y="63" textAnchor="middle" fontFamily="Oswald, sans-serif" fontWeight="700" fontSize="38" fill="var(--cap-ring)">M</text>
    </svg>
  );
}
