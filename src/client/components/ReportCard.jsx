import React from "react";
import texts from "../texts/report.json";

const ReportCard = ({ value, count }) => {
  const card = texts.cards[value] || texts.cards.default; // default is a fallback value

  return (
    <div className="flex h-[200px] flex-col justify-between rounded-[5px] border border-[var(--gray)] p-5 text-left shadow-[0_2px_4px_rgba(0,0,0,0.1)]">
      <div>
        <p className="mb-0 text-[1.3rem] font-medium">{card.title}</p>
        <p className="mt-0.5 text-sm text-[var(--gray)]">{card.description}</p>
      </div>
      <div className="flex items-end justify-between">
        <p className="mb-0 text-2xl font-bold">{count}</p>
        <a href="#">{card.link}</a>
      </div>
    </div>
  );
};

export default ReportCard;
