
const StatBox = ({ title, value, subtitle, color }) => {
    return (
        <div className="mx-[30px] min-w-[200px] rounded-[10px] bg-white pb-0 pl-2.5 pr-[50px] pt-1 shadow-[0_2px_5px_rgba(0,0,0,0.1)]">
            <h3 className="p-0 text-left text-xl font-normal">{title}</h3>
            <h2 className="text-left text-2xl">{value}</h2>
            <p className={color === "green" ? "mt-1 text-left text-sm text-green-600" : color === "red" ? "mt-1 text-left text-sm text-red-600" : "mt-1 text-left text-sm"}>{subtitle}</p>
        </div>
    );
};


export default StatBox;
