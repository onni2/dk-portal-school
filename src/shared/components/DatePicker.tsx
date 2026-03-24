/**
 * Custom date picker with a text input and a popup calendar.
 * Exports: DatePicker
 */
import { useEffect, useRef, useState } from "react";
import { cn } from "@/shared/utils/cn";

interface DatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (date: string) => void;
  placeholder?: string;
  minDate?: string; // YYYY-MM-DD
  maxDate?: string; // YYYY-MM-DD
}

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function toDisplay(value: string): string {
  if (!value) return "";
  const [year, month, day] = value.split("-");
  return `${day}.${month} ${year}`;
}

function toISO(display: string): string {
  // accepts DD.MM YYYY or DD.MM.YYYY
  const clean = display.replace(/\s+/g, ".");
  const parts = clean.split(".");
  if (parts.length === 3) {
    const [day, month, year] = parts;
    if (day && month && year && year.length === 4) {
      return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    }
  }
  return "";
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

export function DatePicker({
  value,
  onChange,
  placeholder,
  minDate,
  maxDate,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const [inputText, setInputText] = useState(toDisplay(value));
  const ref = useRef<HTMLDivElement>(null);

  const today = new Date();
  const parsedDate = value ? new Date(value + "T00:00:00") : null;
  const [viewYear, setViewYear] = useState(
    parsedDate?.getFullYear() ?? today.getFullYear(),
  );
  const [viewMonth, setViewMonth] = useState(
    parsedDate?.getMonth() ?? today.getMonth(),
  );

  useEffect(() => {
    setInputText(toDisplay(value));
  }, [value]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const text = e.target.value;
    setInputText(text);
    const iso = toISO(text);
    if (iso) onChange(iso);
  }

  function handleDayClick(day: number) {
    const iso = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    onChange(iso);
    setOpen(false);
  }

  function prevMonth() {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else setViewMonth((m) => m - 1);
  }

  function nextMonth() {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else setViewMonth((m) => m + 1);
  }

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const selectedDay = parsedDate?.getDate();
  const selectedMonth = parsedDate?.getMonth();
  const selectedYear = parsedDate?.getFullYear();

  return (
    <div ref={ref} className="relative">
      <div className="flex items-center rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5">
        <input
          type="text"
          value={inputText}
          onChange={handleInputChange}
          onFocus={() => setOpen(true)}
          placeholder={placeholder ?? "DD.MM YYYY"}
          className="w-28 bg-transparent text-sm text-[var(--color-text)] outline-none placeholder:text-[var(--color-text-muted)]"
        />
        {value ? (
          <button
            onClick={() => {
              onChange("");
              setInputText("");
            }}
            className="ml-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
          >
            ×
          </button>
        ) : (
          <button
            onClick={() => setOpen((o) => !o)}
            className="ml-2 text-[var(--color-text-muted)]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2Z"
              />
            </svg>
          </button>
        )}
      </div>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 w-72 rounded-lg border border-[var(--color-border)] bg-white p-4 shadow-lg">
          {/* Header */}
          <div className="mb-3 flex items-center justify-between">
            <button
              onClick={prevMonth}
              className="px-1 text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
            >
              &lt;
            </button>
            <span className="text-sm font-bold text-[var(--color-text)]">
              {MONTHS[viewMonth]} {viewYear}
            </span>
            <button
              onClick={nextMonth}
              className="px-1 text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
            >
              &gt;
            </button>
          </div>

          {/* Day headers */}
          <div className="mb-1 grid grid-cols-7 text-center text-xs text-[var(--color-text-muted)]">
            {DAYS.map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>

          <hr className="mb-2 border-[var(--color-border)]" />

          {/* Days grid */}
          <div className="grid grid-cols-7 text-center text-sm">
            {cells.map((day, i) => {
              const iso = day
                ? `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
                : null;
              const isSelected =
                day !== null &&
                day === selectedDay &&
                viewMonth === selectedMonth &&
                viewYear === selectedYear;
              const isDisabled =
                day === null ||
                (minDate !== undefined && iso !== null && iso < minDate) ||
                (maxDate !== undefined && iso !== null && iso > maxDate);
              return (
                <button
                  key={i}
                  disabled={isDisabled}
                  onClick={() => !isDisabled && iso && handleDayClick(day!)}
                  className={cn(
                    "rounded-md py-1.5 text-sm",
                    day === null && "invisible",
                    isDisabled &&
                      day !== null &&
                      "cursor-not-allowed text-[var(--color-text-muted)] opacity-40",
                    isSelected
                      ? "bg-blue-600 font-semibold text-white"
                      : !isDisabled &&
                          "text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]",
                  )}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
