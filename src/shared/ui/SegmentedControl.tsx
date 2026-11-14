type SegmentedControlProps<T extends string | number> = {
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
  labelledBy: string;
  getLabel?: (option: T) => string;
};

export function SegmentedControl<T extends string | number>({
  options,
  value,
  onChange,
  labelledBy,
  getLabel = String,
}: SegmentedControlProps<T>) {
  return (
    <div
      role="group"
      aria-labelledby={labelledBy}
      className="grid auto-cols-fr grid-flow-col gap-2.5"
    >
      {options.map((option) => {
        const isSelected = option === value;
        return (
          <button
            key={option}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onChange(option)}
            className={`min-h-14 rounded-[14px] border-2 font-display text-[22px] font-bold ${
              isSelected
                ? 'border-ink bg-ink text-white'
                : 'border-line bg-subtle text-ink hover:bg-page'
            }`}
          >
            {getLabel(option)}
          </button>
        );
      })}
    </div>
  );
}
