import React from "react";

export function Card({ children, style = {} }) {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm" style={style}>
      {children}
    </div>
  );
}
