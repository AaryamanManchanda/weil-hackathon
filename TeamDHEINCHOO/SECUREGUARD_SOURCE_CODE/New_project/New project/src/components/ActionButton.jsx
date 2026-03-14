import { motion } from "framer-motion";

export function ActionButton({ label, onClick, primary = false, disabled = false }) {
  return (
    <motion.button
      whileHover={disabled ? undefined : { y: -2 }}
      whileTap={disabled ? undefined : { scale: 0.99 }}
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-[22px] border px-4 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.22em] transition ${
        primary
          ? "border-primary bg-primary text-white shadow-sm shadow-stone-300/80"
          : "border-border bg-card text-text-primary hover:border-primary/25 hover:bg-white"
      } ${disabled ? "cursor-not-allowed opacity-60 hover:bg-inherit hover:text-inherit" : ""}`}
    >
      {label}
    </motion.button>
  );
}
