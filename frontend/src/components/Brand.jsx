import { Command } from "lucide-react";

export default function Brand({ inverse = false }) {
  return (
    <span className={`brand ${inverse ? "brand-inverse" : ""}`}>
      <span className="brand-mark">
        <Command size={17} strokeWidth={2.4} />
      </span>
      daymark<span className="brand-period">.</span>
    </span>
  );
}