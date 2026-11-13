// Voto da 1 a 5 boccali
export default function MugRating({ value, onChange, disabled }: { value: number; onChange?: (v: number) => void; disabled?: boolean }) {
  return (
    <div className="mugs" role="radiogroup">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} su 5`}
          className={n <= value ? 'mug on' : 'mug'}
          disabled={disabled}
          onClick={() => onChange?.(n)}
        >
          🍺
        </button>
      ))}
    </div>
  );
}
