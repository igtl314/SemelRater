"use client";
import { Input } from "@heroui/input";
import { CategoryRatings } from "@/types";

const CATEGORY_LABELS: { key: keyof CategoryRatings; label: string }[] = [
  { key: "gradde", label: "Grädde (Cream)" },
  { key: "mandelmassa", label: "MandelMassa (Almond Paste)" },
  { key: "lock", label: "Lock (Lid)" },
  { key: "bulle", label: "Bulle (Bun)" },
  { key: "helhet", label: "Helhet (Overall)" },
];

const INPUT_CLASS =
  "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500";

type CategoryRatingInputProps = {
  values: { [key in keyof CategoryRatings]: string };
  onChange: (category: keyof CategoryRatings, value: string) => void;
};

export function CategoryRatingInput({
  values,
  onChange,
}: CategoryRatingInputProps) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-medium text-foreground-600">
        Rate each category (1-5)
      </p>
      {CATEGORY_LABELS.map(({ key, label }) => (
        <Input
          key={key}
          isRequired
          className={INPUT_CLASS}
          label={label}
          max={5}
          min={1}
          name={key}
          placeholder="1-5"
          type="number"
          value={values[key]}
          onChange={(e) => onChange(key, e.target.value)}
        />
      ))}
    </div>
  );
}

export { CATEGORY_LABELS };
