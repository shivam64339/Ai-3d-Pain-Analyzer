import { useState } from "react";
import { motion } from "framer-motion";

const PAIN_EMOJIS = ["😊", "🙂", "😐", "😕", "😣", "😖", "😫", "😰", "🤯", "💀"];
const PAIN_LABELS = [
  "No Pain", "Minimal", "Mild", "Uncomfortable", "Moderate",
  "Distracting", "Distressing", "Intense", "Severe", "Unbearable"
];

function getPainColor(level: number): string {
  if (level <= 2) return "oklch(0.75 0.18 145)";
  if (level <= 4) return "oklch(0.80 0.17 85)";
  if (level <= 6) return "oklch(0.75 0.20 60)";
  if (level <= 8) return "oklch(0.70 0.20 40)";
  return "oklch(0.60 0.24 25)";
}

interface Props {
  onSubmit: (level: number) => void;
  bodyPart: string;
}

export default function PainScale({ onSubmit, bodyPart }: Props) {
  const [level, setLevel] = useState(5);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-5 space-y-4"
    >
      <div className="text-center">
        <p className="text-xs text-muted-foreground mb-1">Rate your pain in</p>
        <p className="font-display font-semibold text-sm text-foreground">{bodyPart}</p>
      </div>

      <div className="flex justify-center">
        <motion.span
          key={level}
          initial={{ scale: 0.5 }}
          animate={{ scale: 1 }}
          className="text-5xl"
        >
          {PAIN_EMOJIS[level - 1]}
        </motion.span>
      </div>

      <div className="space-y-2">
        <div className="relative">
          <div className="h-2 rounded-full pain-gradient opacity-30" />
          <input
            type="range"
            min={1}
            max={10}
            value={level}
            onChange={(e) => setLevel(Number(e.target.value))}
            className="absolute inset-0 w-full h-2 appearance-none bg-transparent cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-foreground/50 [&::-webkit-slider-thumb]:shadow-lg"
            style={{
              // @ts-expect-error custom property
              "--tw-ring-color": getPainColor(level),
            }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground px-0.5">
          <span>1</span>
          <span>5</span>
          <span>10</span>
        </div>
      </div>

      <div className="text-center">
        <motion.p
          key={level}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm font-semibold"
          style={{ color: getPainColor(level) }}
        >
          {level}/10 — {PAIN_LABELS[level - 1]}
        </motion.p>
      </div>

      <button
        onClick={() => onSubmit(level)}
        className="w-full py-2.5 rounded-xl font-display font-semibold text-sm text-neon-foreground transition-all duration-300 hover:brightness-110 neon-border"
        style={{ background: getPainColor(level) }}
      >
        Analyze with this intensity
      </button>
    </motion.div>
  );
}
