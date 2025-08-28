import React, { useState } from "react";

const faqData = [
  {
    question: "What is Startup Bubbles?",
    answer: "Startup Bubbles is a platform that visualizes the world's top startups using interactive bubbles, showing their valuation, sector, and country."
  },
  {
    question: "How can I filter startups by country or sector?",
    answer: "You can use the selectors at the top of the chart to filter startups by country or by Top N valuation. Both the visualization and the table will update automatically."
  },
  {
    question: "How is the total valuation calculated?",
    answer: "The total valuation displayed above the chart sums all the visible startups and converts it to trillions of dollars (T$)."
  },
  {
    question: "Can I see detailed information about each startup?",
    answer: "Yes, hovering over a bubble will show a tooltip with the startup's name, sector, and valuation."
  },
  {
    question: "Can I see all startups?",
    answer: "Yes, in the 'Show' selector you can choose 'All' to display all startups in the database."
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div style={{ color: "white", padding: "40px", maxWidth: "800px", margin: "0 auto" }}>
      <h2 style={{ textAlign: "center", marginBottom: "30px" }}>FAQ</h2>
      <div>
        {faqData.map((item, index) => (
          <div key={index} style={{ marginBottom: "15px", borderBottom: "1px solid #444", paddingBottom: "10px" }}>
            <div
              onClick={() => toggle(index)}
              style={{ 
                cursor: "pointer", 
                fontWeight: "bold", 
                fontSize: "16px", 
                display: "flex", 
                alignItems: "center", 
                gap: "8px",
                color: openIndex === index ? "#FFD700" : "white" // cambia de color al abrir
              }}
            >
              <span role="img" aria-label="search">🔍</span>
              {item.question}
            </div>
            {openIndex === index && (
              <div style={{ marginTop: "8px", fontSize: "15px", lineHeight: "1.5", color: "#ccc" }}>
                {item.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
