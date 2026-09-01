import { useEffect, useMemo, useRef, useState } from "react";
import { CheckIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

function UsersCourseAutocomplete({
    value,
    onChange,
    onSelect,
    options,
    selectField = "code",
    showNameInCode = true,
    placeholder = "Search all courses…",
}) {
    const fieldValue = (course) =>
        selectField === "name" ? course.course_name : course.course_code;

    const isCodeMode = selectField === "code";

    const [query, setQuery] = useState(value && value !== "all" ? value : "");
    const [open, setOpen] = useState(false);
    const [highlighted, setHighlighted] = useState(0);
    const [isTyping, setIsTyping] = useState(false);
    const containerRef = useRef(null);

    const selectedCourse = options.find((o) => fieldValue(o) === value);

    useEffect(() => {
        if (value && value !== "all") {
            setQuery(value);
            setIsTyping(false);
        } else {
            setQuery("");
            setIsTyping(false);
        }
    }, [value]);

    const matches = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return options;
        return options.filter((course) => {
            const code = (course.course_code || "").toLowerCase();
            const name = (course.course_name || "").toLowerCase();
            return code.includes(q) || name.includes(q);
        });
    }, [query, options]);

    useEffect(() => {
        setHighlighted(0);
    }, [matches.length, query]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        const handleKeyDown = (e) => {
            if (e.key === "Escape") setOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    const selectCourse = (course) => {
        setQuery(fieldValue(course));
        setIsTyping(false);
        onSelect?.(course);
        onChange?.(fieldValue(course));
        setOpen(false);
    };

    const clear = () => {
        setQuery("");
        setIsTyping(false);
        onChange?.("all");
        onSelect?.(null);
        setOpen(false);
    };

    const onInputKeyDown = (e) => {
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setOpen(true);
            setHighlighted((i) => (i + 1) % Math.max(matches.length, 1));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlighted((i) => (i - 1 + Math.max(matches.length, 1)) % Math.max(matches.length, 1));
        } else if (e.key === "Enter") {
            if (open && matches[highlighted]) {
                e.preventDefault();
                selectCourse(matches[highlighted]);
            }
        } else if (
            (e.key === "Backspace" && query === "" && value && value !== "all") ||
            (e.key === "Backspace" && !isTyping && !open && value && value !== "all")
        ) {
            clear();
        }
    };

    const selectClassName =
        "h-10 w-full cursor-pointer rounded-md border border-input bg-card px-3 text-sm text-foreground outline-none transition-[color,box-shadow] focus:border-ring focus:ring-[3px] focus:ring-ring/20 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground";

    const isSelected = (course) => value && value !== "all" && fieldValue(course) === value;

    const displayValue =
        !isTyping && !open && selectedCourse
            ? isCodeMode
                ? showNameInCode
                    ? `${selectedCourse.course_code} — ${selectedCourse.course_name}`
                    : selectedCourse.course_code
                : selectedCourse.course_name
            : query;

    return (
        <div ref={containerRef} className="relative w-full">
            <Input
                className={cn(selectClassName, "h-10")}
                type="text"
                value={displayValue}
                placeholder={placeholder}
                onChange={(e) => {
                    setQuery(e.target.value);
                    setIsTyping(true);
                    setOpen(true);
                    if (e.target.value.trim() === "") {
                        onChange?.("all");
                        onSelect?.(null);
                    }
                }}
                onFocus={() => setOpen(true)}
                onKeyDown={onInputKeyDown}
            />
            {open && (
                <ul className="absolute z-50 mt-1 max-h-52 w-full overflow-y-auto rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md">
                    {matches.length === 0 && (
                        <li className="px-2 py-1.5 text-sm text-muted-foreground">No results</li>
                    )}
                    {matches.map((course, index) => (
                        <li key={course.course_id ?? course.course_code}>
                            <button
                                type="button"
                                onMouseDown={(e) => {
                                    e.preventDefault();
                                    selectCourse(course);
                                }}
                                onMouseEnter={() => setHighlighted(index)}
                                className={cn(
                                    "relative flex w-full items-center justify-between gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-none",
                                    index === highlighted && "bg-accent text-accent-foreground"
                                )}
                            >
                                <span className="flex min-w-0 items-baseline gap-2">
                                    {isCodeMode ? (
                                        <>
                                            <span className="font-medium">{course.course_code}</span>
                                            <span className="truncate text-muted-foreground">{course.course_name}</span>
                                        </>
                                    ) : (
                                        <>
                                            <span className="font-medium">{course.course_name}</span>
                                            <span className="truncate text-muted-foreground">{course.course_code}</span>
                                        </>
                                    )}
                                </span>
                                {isSelected(course) && (
                                    <span className="absolute right-2 flex size-3.5 items-center justify-center">
                                        <CheckIcon className="size-4" />
                                    </span>
                                )}
                            </button>
                        </li>
                    ))}
                    {value && value !== "all" && (
                        <li>
                            <button
                                type="button"
                                onMouseDown={(e) => {
                                    e.preventDefault();
                                    clear();
                                }}
                                className="w-full rounded-sm px-2 py-1.5 text-left text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                            >
                                Clear filter (all courses)
                            </button>
                        </li>
                    )}
                </ul>
            )}
        </div>
    );
}

export default UsersCourseAutocomplete;
