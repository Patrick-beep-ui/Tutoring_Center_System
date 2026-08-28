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
    <div className="flex w-full items-center gap-3 sm:w-auto">
      <label
        id="user-type-label"
        className="shrink-0 text-sm font-medium text-foreground"
      >
        View
      </label>
      <Select
        value={value}
        onValueChange={onValueChange}
        disabled={options.length === 1}
      >
        <SelectTrigger
          aria-labelledby="user-type-label"
          className="h-10 w-full min-w-40 border-border bg-card text-left font-medium text-primary shadow-none sm:w-44"
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
