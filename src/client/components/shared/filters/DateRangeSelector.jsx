import { useId } from "react";

const INPUT_CLASS =
    "min-w-[140px] cursor-pointer rounded-md border border-[#ddd] bg-white px-2.5 py-2 text-[13px] outline-none focus:border-[#0a84ff] max-md:min-w-full";

const DateRangeSelector = ({
    from = "",
    to = "",
    onFromChange,
    onToChange,
    fromLabel = "From",
    toLabel = "To",
    className = ""
}) => {
    const fromId = useId();
    const toId = useId();

    const handleFromChange = (event) => {
        const nextFrom = event.target.value;
        onFromChange(nextFrom);

        if (to && nextFrom && to < nextFrom) {
            onToChange("");
        }
    };

    return (
        <div className={`flex flex-wrap gap-3 max-md:flex-col max-md:items-stretch ${className}`.trim()}>
            <div className="flex flex-col gap-1">
                <label htmlFor={fromId} className="text-[11px] font-semibold uppercase tracking-[0.5px] text-[#666]">
                    {fromLabel}
                </label>
                <input
                    id={fromId}
                    className={INPUT_CLASS}
                    type="date"
                    value={from}
                    onChange={handleFromChange}
                />
            </div>
            <div className="flex flex-col gap-1">
                <label htmlFor={toId} className="text-[11px] font-semibold uppercase tracking-[0.5px] text-[#666]">
                    {toLabel}
                </label>
                <input
                    id={toId}
                    className={INPUT_CLASS}
                    type="date"
                    value={to}
                    min={from || undefined}
                    onChange={(event) => onToChange(event.target.value)}
                />
            </div>
        </div>
    );
};

export default DateRangeSelector;
