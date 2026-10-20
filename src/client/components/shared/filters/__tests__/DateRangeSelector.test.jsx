import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import DateRangeSelector from "../DateRangeSelector";

describe("DateRangeSelector", () => {
    it("renders controlled date values and constrains the end date", () => {
        render(
            <DateRangeSelector
                from="2026-01-10"
                to="2026-01-20"
                onFromChange={vi.fn()}
                onToChange={vi.fn()}
            />
        );

        expect(screen.getByLabelText("From")).toHaveValue("2026-01-10");
        expect(screen.getByLabelText("To")).toHaveValue("2026-01-20");
        expect(screen.getByLabelText("To")).toHaveAttribute("min", "2026-01-10");
    });

    it("reports each selected date to its controlled callback", () => {
        const onFromChange = vi.fn();
        const onToChange = vi.fn();
        render(<DateRangeSelector from="" to="" onFromChange={onFromChange} onToChange={onToChange} />);

        fireEvent.change(screen.getByLabelText("From"), { target: { value: "2026-02-01" } });
        fireEvent.change(screen.getByLabelText("To"), { target: { value: "2026-02-28" } });

        expect(onFromChange).toHaveBeenCalledWith("2026-02-01");
        expect(onToChange).toHaveBeenCalledWith("2026-02-28");
    });

    it("clears the end date when the selected start date is later", () => {
        const onFromChange = vi.fn();
        const onToChange = vi.fn();
        render(
            <DateRangeSelector
                from="2026-01-01"
                to="2026-01-20"
                onFromChange={onFromChange}
                onToChange={onToChange}
            />
        );

        fireEvent.change(screen.getByLabelText("From"), { target: { value: "2026-01-21" } });

        expect(onFromChange).toHaveBeenCalledWith("2026-01-21");
        expect(onToChange).toHaveBeenCalledWith("");
    });
});
