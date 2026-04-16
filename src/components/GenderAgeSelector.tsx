import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Baby, GraduationCap, Briefcase, Clock, HeartPulse, Sparkles, ArrowRight, type LucideIcon } from "lucide-react";

export type Gender = "male" | "female";
export type AgeRange = "0-5" | "5-18" | "18-40" | "40-60" | "60+";
export type ActivityLevel = "sedentary" | "moderate" | "active";

const AGE_RANGES: { value: AgeRange; label: string; description: string; icon: LucideIcon }[] = [
  { value: "0-5", label: "0–5 years", description: "Infant / Toddler", icon: Baby },
  { value: "5-18", label: "5–18 years", description: "Child / Teen", icon: GraduationCap },
  { value: "18-40", label: "18–40 years", description: "Young Adult", icon: Briefcase },
  { value: "40-60", label: "40–60 years", description: "Middle-aged", icon: Clock },
  { value: "60+", label: "60+ years", description: "Senior", icon: HeartPulse },
];

const ACTIVITY_LEVELS: { value: ActivityLevel; label: string; emoji: string; desc: string }[] = [
  { value: "sedentary", label: "Sedentary", emoji: "🪑", desc: "Mostly sitting" },
  { value: "moderate", label: "Moderate", emoji: "🚶", desc: "Regular walks" },
  { value: "active", label: "Active", emoji: "🏃", desc: "Daily exercise" },
];

interface Props {
  onComplete: (gender: Gender, ageRange: AgeRange, activityLevel: ActivityLevel) => void;
}

export default function GenderAgeSelector({ onComplete }: Props) {
  const [gender, setGender] = useState<Gender | null>(null);
  const [ageRange, setAgeRange] = useState<AgeRange | null>(null);
  const [activityLevel, setActivityLevel] = useState<ActivityLevel | null>(null);

  const canContinue = gender && ageRange && activityLevel;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      className="max-w-xl w-full mx-auto space-y-8"
    >
      {/* Title */}
      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.1 }}
          className="w-16 h-16 rounded-2xl glass neon-border flex items-center justify-center mx-auto mb-4"
        >
          <Sparkles className="w-8 h-8 text-primary" />
        </motion.div>
        <h1 className="font-display font-bold text-3xl gradient-text mb-1">Your Profile</h1>
        <p className="text-muted-foreground text-sm">Tell us about yourself for personalized analysis</p>
      </div>

      {/* Gender Selection */}
      <div className="space-y-3">
        <h3 className="text-sm font-display font-semibold text-foreground/80">Gender</h3>
        <div className="grid grid-cols-2 gap-4">
          {(["male", "female"] as const).map((g, i) => (
            <motion.button
              key={g}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.08 }}
              onClick={() => setGender(g)}
              className={`group relative rounded-2xl glass p-5 transition-all duration-300 cursor-pointer ${
                gender === g
                  ? "border-2 border-primary bg-primary/10 shadow-[0_0_25px_oklch(0.72_0.22_180/0.3)]"
                  : "border border-border/30 hover:border-primary/50 hover:bg-primary/5"
              }`}
            >
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-3 transition-all duration-300 group-hover:scale-110 ${
                gender === g ? "bg-primary/20" : "bg-muted/50 group-hover:bg-primary/10"
              }`}>
                <span className="text-3xl">{g === "male" ? "♂" : "♀"}</span>
              </div>
              <span className="font-display font-semibold text-foreground capitalize text-lg block text-center">{g}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Age Range */}
      <div className="space-y-3">
        <h3 className="text-sm font-display font-semibold text-foreground/80">Age Range</h3>
        <div className="grid gap-2">
          {AGE_RANGES.map((age, i) => {
            const Icon = age.icon;
            const isSelected = ageRange === age.value;
            return (
              <motion.button
                key={age.value}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.05 }}
                onClick={() => setAgeRange(age.value)}
                className={`group flex items-center gap-4 rounded-xl glass p-3 transition-all duration-300 cursor-pointer text-left ${
                  isSelected
                    ? "border-2 border-primary bg-primary/10 shadow-[0_0_20px_oklch(0.72_0.22_180/0.25)]"
                    : "border border-border/30 hover:border-primary/40 hover:bg-primary/5"
                }`}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-110 ${
                  isSelected ? "bg-primary/20" : "bg-muted/50 group-hover:bg-primary/10"
                }`}>
                  <Icon className={`w-4 h-4 ${isSelected ? "text-primary" : "text-muted-foreground group-hover:text-primary"}`} />
                </div>
                <div>
                  <span className="font-display font-semibold text-foreground text-sm block">{age.label}</span>
                  <span className="text-muted-foreground text-xs">{age.description}</span>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Activity Level */}
      <div className="space-y-3">
        <h3 className="text-sm font-display font-semibold text-foreground/80">Activity Level</h3>
        <div className="grid grid-cols-3 gap-3">
          {ACTIVITY_LEVELS.map((level, i) => {
            const isSelected = activityLevel === level.value;
            return (
              <motion.button
                key={level.value}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.06 }}
                onClick={() => setActivityLevel(level.value)}
                className={`rounded-xl glass p-4 text-center transition-all duration-300 cursor-pointer ${
                  isSelected
                    ? "border-2 border-primary bg-primary/10 shadow-[0_0_20px_oklch(0.72_0.22_180/0.25)]"
                    : "border border-border/30 hover:border-primary/40 hover:bg-primary/5"
                }`}
              >
                <span className="text-2xl block mb-1">{level.emoji}</span>
                <span className="font-display font-semibold text-xs text-foreground block">{level.label}</span>
                <span className="text-[9px] text-muted-foreground">{level.desc}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Continue Button */}
      <motion.button
        onClick={() => canContinue && onComplete(gender!, ageRange!, activityLevel!)}
        disabled={!canContinue}
        whileHover={canContinue ? { scale: 1.02 } : {}}
        whileTap={canContinue ? { scale: 0.98 } : {}}
        className={`w-full py-3.5 rounded-xl font-display font-bold text-sm flex items-center justify-center gap-2 transition-all duration-300 ${
          canContinue
            ? "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-[0_0_30px_oklch(0.72_0.22_180/0.4)] hover:shadow-[0_0_40px_oklch(0.72_0.22_180/0.6)]"
            : "bg-muted/50 text-muted-foreground cursor-not-allowed"
        }`}
      >
        Continue
        <ArrowRight className="w-4 h-4" />
      </motion.button>
    </motion.div>
  );
}
