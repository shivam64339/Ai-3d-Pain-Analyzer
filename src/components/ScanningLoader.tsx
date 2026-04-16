import { motion } from "framer-motion";
import { Brain } from "lucide-react";

export default function ScanningLoader({ bodyPart }: { bodyPart: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md">
      <div className="flex flex-col items-center gap-6">
        {/* Central scanning animation */}
        <div className="relative w-28 h-28">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full"
            style={{
              border: "2px solid transparent",
              borderTopColor: "var(--primary)",
              borderRightColor: "oklch(0.72 0.22 180 / 0.2)",
              filter: "drop-shadow(0 0 6px var(--glow))",
            }}
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
            className="absolute inset-3 rounded-full"
            style={{
              border: "2px solid transparent",
              borderBottomColor: "var(--accent)",
              borderLeftColor: "oklch(0.65 0.20 290 / 0.2)",
            }}
          />
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 1.8, repeat: Infinity }}
            className="absolute inset-6 rounded-full bg-primary/10 flex items-center justify-center"
          >
            <Brain className="w-8 h-8 text-primary" />
          </motion.div>
        </div>

        <div className="text-center space-y-1.5">
          <motion.p
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="font-display font-bold text-lg gradient-text"
          >
            Analyzing...
          </motion.p>
          <p className="text-xs text-muted-foreground">
            Scanning <span className="text-primary font-semibold">{bodyPart}</span>
          </p>
        </div>

        {/* Wave bars */}
        <div className="flex items-end gap-1 h-6">
          {Array.from({ length: 10 }).map((_, i) => (
            <motion.div
              key={i}
              animate={{ height: ["25%", "100%", "25%"] }}
              transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.06 }}
              className="w-1 rounded-full bg-gradient-to-t from-primary to-accent"
              style={{ minHeight: "3px" }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
