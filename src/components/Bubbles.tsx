// Bollicine che salgono, come in una birra appena versata.
// variant "page": sfondo dell'intera pagina · "hero": dentro le fasce verdi
export default function Bubbles({ variant = 'page', count = 26 }: { variant?: 'page' | 'hero'; count?: number }) {
  const bubbles = Array.from({ length: count }, (_, i) => ({
    left: (i * 37 + 11) % 100,
    size: 3 + ((i * 7) % 11),
    delay: -((i * 1.7) % 14),
    dur: 8 + ((i * 5) % 10),
    sway: ((i % 3) - 1) * 14,
  }));
  return (
    <div className={`bubbles bubbles-${variant}`} aria-hidden>
      {bubbles.map((b, i) => (
        <span
          key={i}
          style={{
            left: `${b.left}%`, width: b.size, height: b.size,
            animationDelay: `${b.delay}s`, animationDuration: `${b.dur}s`,
            ['--sway' as string]: `${b.sway}px`,
          }}
        />
      ))}
    </div>
  );
}
