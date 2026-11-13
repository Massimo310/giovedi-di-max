// Bollicine che salgono sullo sfondo, come in un boccale appena spillato
const BUBBLES = Array.from({ length: 22 }, (_, i) => ({
  left: (i * 37) % 100,
  size: 4 + ((i * 7) % 12),
  delay: (i * 1.3) % 12,
  dur: 9 + ((i * 5) % 9),
}));

export default function Bubbles() {
  return (
    <div className="bubbles" aria-hidden>
      {BUBBLES.map((b, i) => (
        <span
          key={i}
          style={{ left: `${b.left}%`, width: b.size, height: b.size, animationDelay: `${b.delay}s`, animationDuration: `${b.dur}s` }}
        />
      ))}
    </div>
  );
}
