import React from "react";
import { COLORS } from "../styles/tokens";

export function FormField({ label, children }) {
  return (
    <div>
      <label className="text-xs font-semibold" style={{ color: "#444" }}>{label}</label>
      {children}
    </div>
  );
}

const inputClass = "w-full mt-1 px-3 py-2 rounded-md text-sm border";
const inputStyle = { borderColor: COLORS.border };

export function TextInput(props) {
  return <input {...props} className={inputClass + " " + (props.className || "")} style={{ ...inputStyle, ...props.style }} />;
}

export function Select({ children, ...props }) {
  return (
    <select {...props} className={inputClass + " " + (props.className || "")} style={{ ...inputStyle, ...props.style }}>
      {children}
    </select>
  );
}

export function TextArea(props) {
  return <textarea {...props} className={inputClass + " " + (props.className || "")} style={{ ...inputStyle, ...props.style }} />;
}
