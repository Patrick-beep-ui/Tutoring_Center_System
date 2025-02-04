import React from "react";
import texts from "../texts/report.json";

const ReportCard = ({ value, count }) => {
  const card = texts.cards[value] || texts.cards.default; // default is a fallback value

  return (
    <div className={`${value}-counter counter-container`}>
      <div className="report-description">
        <p>{card.title}</p>
        <p>{card.description}</p>
      </div>
      <div className="report-data">
        <p>{count}</p>
        <a href="#">{card.link}</a>
      </div>
    </div>
  );
};

export default ReportCard;
