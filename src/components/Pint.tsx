import { MAX_VOTE } from '../lib/types';

// Bicchiere che si riempie in base al punteggio (0..max)
export default function Pint({ value, max = MAX_VOTE, size = 56 }: { value: number | null; max?: number; size?: number }) {
  const pct = value === null ? 0 : Math.max(0, Math.min(1, value / max));
  const top = 8 + (1 - pct) * 50; // y della superficie della birra
  const id = `pint-${Math.random().toString(36).slice(2, 7)}`;
  return (
    <svg width={size} height={size * 1.15} viewBox="0 0 48 64" className="pint" aria-hidden>
      <defs>
        <clipPath id={id}>
          <path d="M6 6h36l-4 54H10z" />
        </clipPath>
        <linearGradient id={`${id}-g`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#ffd25e" />
          <stop offset="1" stopColor="#d9861a" />
        </linearGradient>
      </defs>
      <g clipPath={`url(#${id})`}>
        <rect x="0" y={top} width="48" height="64" fill={`url(#${id}-g)`} className="pint-beer" />
        {pct > 0 && <rect x="0" y={top - 5} width="48" height="6" rx="3" fill="#fff8e7" />}
      </g>
      <path d="M6 6h36l-4 54H10z" fill="none" stroke="currentColor" strokeOpacity=".55" strokeWidth="2.5" strokeLinejoin="round" />
    </svg>
  );
}
