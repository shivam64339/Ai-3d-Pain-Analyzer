import { motion } from "framer-motion";
import { Check, User, Target, Mic, ClipboardList, Brain, BarChart3 } from "lucide-react";

const STEPS = [
  { label: "Profile", icon: User },
  { label: "Body", icon: Target },
  { label: "Voice", icon: Mic },
  { label: "Details", icon: ClipboardList },
  { label: "Analysis", icon: Brain },
  { label: "Results", icon: BarChart3 },
];

export default function StepProgress({ currentStep }: { currentStep: number }) {
  return (
    <div className="w-full max-w-xl mx-auto px-6">
      <div className="flex items-center justify-between relative">
        {/* Background line */}
        <div className="absolute top-[18px] left-[10%] right-[10%] h-[2px] bg-border/30 rounded-full" />
        {/* Filled line */}
        <motion.div
          className="absolute top-[18px] left-[10%] h-[2px] rounded-full"
          style={{ background: "linear-gradient(90deg, var(--primary), var(--accent))" }}
          initial={{ width: "0%" }}
          animate={{ width: `${Math.max(0, ((currentStep - 1) / (STEPS.length - 1)) * 80)}%` }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        />

        {STEPS.map((step, i) => {
          const stepNum = i + 1;
          const isCompleted = currentStep > stepNum;
          const isActive = currentStep === stepNum;
          const Icon = step.icon;

          return (
            <div key={step.label} className="flex flex-col items-center relative z-10 min-w-[44px]">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{
                  scale: isActive ? 1.1 : 1,
                }}
                className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                  isCompleted
                    ? "bg-primary text-primary-foreground"
                    : isActive
                      ? "bg-primary/15 border-2 border-primary text-primary"
                      : "bg-muted/40 border border-border/40 text-muted-foreground/50"
                }`}
                style={isActive ? { boxShadow: "0 0 16px oklch(0.72 0.22 180 / 0.35)" } : undefined}
              >
                {isCompleted ? <Check className="w-4 h-4" /> : <Icon className="w-3.5 h-3.5" />}
              </motion.div>
              <span
                className={`text-[9px] mt-1.5 font-medium transition-colors duration-300 ${
                  isActive ? "text-primary" : isCompleted ? "text-foreground/60" : "text-muted-foreground/40"
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
