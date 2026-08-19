import React from "react";

export function PageHeader({ title, subtitle }) {
  return (
    <div className="mb-4">
      <h1 className="text-2xl font-semibold" style={{ color: "#1a1a1a" }}>{title}</h1>
      {subtitle && <p className="text-sm mt-1" style={{ color: "#666" }}>{subtitle}</p>}
    </div>
  );
}
