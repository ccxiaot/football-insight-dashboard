import type { DateOption } from '../types';

type DateFiltersProps = {
  options: DateOption[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
};

export function DateFilters({ options, selectedDate, onSelectDate }: DateFiltersProps) {
  return (
    <section className="date-filters" aria-label="日期筛选">
      {options.map((option) => (
        <button
          aria-pressed={selectedDate === option.date}
          className={selectedDate === option.date ? 'date-pill active' : 'date-pill'}
          key={option.date}
          onClick={() => onSelectDate(option.date)}
          type="button"
        >
          <span>{option.label}</span>
          <small>{option.display}</small>
        </button>
      ))}
    </section>
  );
}
