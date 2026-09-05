import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const USER_TYPE_OPTIONS = [
  { value: "student", label: "Students" },
  { value: "tutor", label: "Tutors" },
];

function UserTypeSelector({ value, onValueChange, canViewTutors }) {
  const options = canViewTutors
    ? USER_TYPE_OPTIONS
    : USER_TYPE_OPTIONS.slice(0, 1);

  return (
    <div className="flex w-full flex-col items-stretch gap-1.5 sm:w-auto sm:flex-row sm:items-center sm:gap-3">
      <label
        id="user-type-label"
        className="shrink-0 text-left text-xs font-semibold text-muted-foreground"
      >
        User type
      </label>
      <Select
        value={value}
        onValueChange={onValueChange}
        disabled={options.length === 1}
      >
        <SelectTrigger
          aria-labelledby="user-type-label"
          className="h-9 w-full border-border bg-card text-left font-medium text-[var(--primary)] shadow-none disabled:cursor-default disabled:opacity-100 sm:w-40"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export default UserTypeSelector;
