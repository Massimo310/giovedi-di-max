import { MAX_VOTE } from '../lib/types';

// Voto da 1 a 10 boccali
export default function MugRating({ value, onChange, disabled }: { value: number; onChange?: (v: number) => void; disabled?: boolean }) {
  return (
    <div className="mugs-wrap">
      <div className="mugs" role="radiogroup">
        {Array.from({ length: MAX_VOTE }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            aria-label={`${n} su ${MAX_VOTE}`}
            title={String(n)}
            className={n <= value ? 'mug on' : 'mug'}
            disabled={disabled}
            onClick={() => onChange?.(n)}
          >
            🍺
          </button>
        ))}
      </div>
      <span className="mug-value">{value ? value : '–'}</span>
    </div>
  );
}
