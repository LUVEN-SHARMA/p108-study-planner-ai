import React from "react";
import { Sparkles, Calendar } from "lucide-react";

export default function Brand({ inverse = false, size = "normal" }) {
  return (
    <div className={`brand ${inverse ? "brand-inverse" : ""} brand-${size}`}>
      <span className="brand-icon-wrapper">
        <Sparkles size={size === "large" ? 20 : 16} strokeWidth={2.4} />
      </span>
      <span className="brand-text">
        Daymark<span className="brand-accent">.ai</span>
      </span>
    </div>
  );
}