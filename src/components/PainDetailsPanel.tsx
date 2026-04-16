import { useState } from "react";
import { motion } from "framer-motion";
import { Zap, Waves, Flame, Sparkles, Clock, ArrowRight } from "lucide-react";

const PAIN_TYPES = [
  { value: "sharp", label: "Sharp", icon: Zap, desc: "Sudden, stabbing" },
  { value: "dull", label: "Dull", icon: Waves, desc: "Aching, pressure" },
  { value: "burning", label: "Burning", icon: Flame, desc: "Hot, stinging" },
  { value: "tingling", label: "Tingling", icon: Sparkles, desc: "Pins & needles" },
];

const DURATIONS = [
  { value: "hours", label: "Hours", desc: "Just started" },
  { value: "days", label: "Days", desc: "Few days" },
  { value: "weeks", label: "Weeks", desc: "1-4 weeks" },
  { value: "months", label: "Months", desc: "Long-term" },
];

const PAIN_EMOJIS = ["😊", "🙂", "😐", "😕", "😣", "😖", "😫", "😰", "🤯", "💀"];
const PAIN_LABELS = [
  "No Pain", "Minimal", "Mild", "Uncomfortable", "Moderate",
  "Distracting", "Distressing", "Intense", "Severe", "Unbearable",
];

function getSliderColor(level: number): string {
  if (level <= 2) return "oklch(0.75 0.18 145)";
  if (level <= 4) return "oklch(0.80 0.17 85)";
  if (level <= 6) return "oklch(0.75 0.20 60)";
  if (level <= 8) return "oklch(0.70 0.20 40)";
  return "oklch(0.60 0.24 25)";
}

interface Props {
  bodyPart: string;
  onSubmit: (data: { painType: string; intensity: number; duration: string }) => void;
}

export default function PainDetailsPanel({ bodyPart, onSubmit }: Props) {
  const [painType, setPainType] = useState<string | null>(null);
  const [intensity, setIntensity] = useState(5);
  const [duration, setDuration] = useState<string | null>(null);

  const canSubmit = painType && duration;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-lg mx-auto w-full"
    >
      <div className="text-center">
        <h2 className="font-display font-bold text-xl gradient-text">Pain Details</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Describe your pain in <span className="text-primary font-semibold">{bodyPart}</span>
        </p>
      </div>

      {/* Pain Type */}
      <div className="space-y-3">
        <h3 className="text-sm font-display font-semibold text-foreground/80">Type of Pain</h3>
        <div className="grid grid-cols-2 gap-3">
          {PAIN_TYPES.map((type, i) => {
            const Icon = type.icon;
            const isSelected = painType === type.value;
            return (
              <motion.button
                key={type.value}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setPainType(type.value)}
                className={`group relative rounded-xl glass p-4 text-left transition-all duration-300 cursor-pointer ${
                  isSelected
                    ? "border-2 border-primary bg-primary/10 shadow-[0_0_20px_oklch(0.72_0.22_180/0.3)]"
                    : "border border-border/30 hover:border-primary/40 hover:bg-primary/5"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                    isSelected ? "bg-primary/20" : "bg-muted/50 group-hover:bg-primary/10"
                  }`}>
                    <Icon className={`w-5 h-5 ${isSelected ? "text-primary" : "text-muted-foreground group-hover:text-primary"}`} />
                  </div>
                  <div>
                    <span className="font-display font-semibold text-sm text-foreground block">{type.label}</span>
                    <span className="text-[10px] text-muted-foreground">{type.desc}</span>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Intensity Slider */}
      <div className="space-y-3">
        <h3 className="text-sm font-display font-semibold text-foreground/80">Pain Intensity</h3>
        <div className="glass rounded-xl p-5 space-y-4">
          <div className="flex justify-center">
            <motion.span key={intensity} initial={{ scale: 0.5 }} animate={{ scale: 1 }} className="text-5xl">
              {PAIN_EMOJIS[intensity - 1]}
            </motion.span>
          </div>
          <div className="relative">
            <div className="h-2 rounded-full pain-gradient opacity-30" />
            <input
              type="range"
              min={1}
              max={10}
              value={intensity}
              onChange={(e) => setIntensity(Number(e.target.value))}
              className="absolute inset-0 w-full h-2 appearance-none bg-transparent cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6
                [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2
                [&::-webkit-slider-thumb]:border-foreground/50 [&::-webkit-slider-thumb]:shadow-lg
                [&::-webkit-slider-thumb]:bg-background"
            />
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>1</span><span>5</span><span>10</span>
          </div>
          <motion.p
            key={intensity}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm font-semibold text-center"
            style={{ color: getSliderColor(intensity) }}
          >
            {intensity}/10 — {PAIN_LABELS[intensity - 1]}
          </motion.p>
        </div>
      </div>

      {/* Duration */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-sm font-display font-semibold text-foreground/80">Duration</h3>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {DURATIONS.map((d, i) => {
            const isSelected = duration === d.value;
            return (
              <motion.button
                key={d.value}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setDuration(d.value)}
                className={`rounded-xl glass px-3 py-3 text-center transition-all duration-300 cursor-pointer ${
                  isSelected
                    ? "border-2 border-primary bg-primary/10 shadow-[0_0_15px_oklch(0.72_0.22_180/0.25)]"
                    : "border border-border/30 hover:border-primary/40"
                }`}
              >
                <span className="font-display font-semibold text-xs text-foreground block">{d.label}</span>
                <span className="text-[9px] text-muted-foreground">{d.desc}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Submit */}
      <motion.button
        onClick={() => canSubmit && onSubmit({ painType: painType!, intensity, duration: duration! })}
        disabled={!canSubmit}
        whileHover={canSubmit ? { scale: 1.02 } : {}}
        whileTap={canSubmit ? { scale: 0.98 } : {}}
        className={`w-full py-3.5 rounded-xl font-display font-bold text-sm flex items-center justify-center gap-2 transition-all duration-300 ${
          canSubmit
            ? "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-[0_0_30px_oklch(0.72_0.22_180/0.4)] hover:shadow-[0_0_40px_oklch(0.72_0.22_180/0.6)]"
            : "bg-muted/50 text-muted-foreground cursor-not-allowed"
        }`}
      >
        <Sparkles className="w-4 h-4" />
        Analyze My Pain
        <ArrowRight className="w-4 h-4" />
      </motion.button>
    </motion.div>
  );
}
