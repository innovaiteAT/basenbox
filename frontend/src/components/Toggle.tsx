import { MEAL_LABEL, MEALS, type Meal } from "../api/types";

interface Props {
  value: Meal[] | undefined; // undefined = noch nicht entschieden
  onChange: (value: Meal[]) => void;
  label: string;
}

/** Mahlzeit-Toggle: Mehrfachauswahl Früh/Mittag/Abend oder „keine“. */
export function MealToggle({ value: raw, onChange, label }: Props) {
  const value = raw ?? [];
  const toggle = (meal: Meal) =>
    onChange(value.includes(meal) ? value.filter((m) => m !== meal) : MEALS.filter((m) => m === meal || value.includes(m)));
  return (
    <div className="segment" role="group" aria-label={label}>
      {MEALS.map((meal) => (
        <button key={meal} type="button" data-meal={meal} aria-pressed={value.includes(meal)} onClick={() => toggle(meal)}>
          {MEAL_LABEL[meal]}
        </button>
      ))}
      <button type="button" data-meal="none" aria-pressed={raw !== undefined && raw.length === 0} onClick={() => onChange([])}>
        keine
      </button>
    </div>
  );
}
