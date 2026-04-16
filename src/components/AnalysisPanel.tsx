import { motion, AnimatePresence } from "framer-motion";
import { Activity, AlertTriangle, Shield, Stethoscope, MessageCircle, Loader2, Sparkles, type LucideIcon } from "lucide-react";

export interface AnalysisResult {
  bodyPart: string;
  primary_type: string;
  secondary_type: string | null;
  pain_nature: string;
  possibleCauses: string[];
  symptoms: string[];
  severity: "low" | "medium" | "high" | "critical";
  precautions: string[];
  followUpQuestions: string[];
  confidence_score: string;
  reasoning: string;
  warning: string;
  summary: string;
}

const severityConfig: Record<string, { label: string; className: string; emoji: string }> = {
  low: { label: "Low", className: "bg-pain-low/20 text-pain-low border-pain-low/30", emoji: "🟢" },
  medium: { label: "Medium", className: "bg-pain-medium/20 text-pain-medium border-pain-medium/30", emoji: "🟡" },
  high: { label: "High", className: "bg-pain-high/20 text-pain-high border-pain-high/30", emoji: "🟠" },
  critical: { label: "Critical", className: "bg-pain-critical/20 text-pain-critical border-pain-critical/30", emoji: "🔴" },
};

const FOLLOW_UP_BUTTONS = [
  { label: "🏠 Home Remedies", prompt: "What are effective home remedies for this pain?" },
  { label: "🏥 When to See Doctor", prompt: "When should I see a doctor about this pain?" },
  { label: "🧘 Exercises", prompt: "What exercises can help with this pain?" },
  { label: "💊 Common Treatments", prompt: "What are common treatments for this condition?" },
];

function Section({ icon: Icon, title, children, delay = 0 }: { icon: LucideIcon; title: string; children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="space-y-2"
    >
      <h3 className="flex items-center gap-2 font-display font-semibold text-sm text-foreground/90">
        <Icon className="w-4 h-4 text-primary" />
        {title}
      </h3>
      <div className="pl-6">{children}</div>
    </motion.div>
  );
}

export default function AnalysisPanel(props: {
  analysis: AnalysisResult | null;
  loading: boolean;
  selectedPart: string | null;
  error?: string | null;
  painLevel?: number | null;
  onFollowUp?: (question: string) => void;
}) {
  const { analysis, loading, selectedPart, error, painLevel, onFollowUp } = props;

  return (
    <div className="h-full flex flex-col">
      {/* Disclaimer */}
      <div className="glass rounded-xl p-3 mb-4 border border-pain-high/20">
        <p className="text-xs text-pain-high flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            <strong>Medical Disclaimer:</strong> This is not medical advice. Always consult a healthcare professional.
          </span>
        </p>
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center gap-4"
          >
            <div className="relative">
              <div className="w-16 h-16 rounded-full neon-border flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
              <div className="absolute inset-0 rounded-full animate-pulse-glow" />
            </div>
            <div className="text-center">
              <p className="text-muted-foreground text-sm font-body">
                Analyzing <span className="text-primary font-semibold neon-text">{selectedPart?.replace(/_/g, " ")}</span>
              </p>
              {painLevel && (
                <p className="text-xs text-muted-foreground mt-1">Pain level: {painLevel}/10</p>
              )}
            </div>
          </motion.div>
        ) : error ? (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center gap-3 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-pain-high/10 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-pain-high" />
            </div>
            <p className="text-sm text-pain-high max-w-[260px]">{error}</p>
          </motion.div>
        ) : analysis ? (
          <motion.div
            key="analysis"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 overflow-y-auto space-y-5 pr-1 custom-scrollbar"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <h2 className="font-display font-bold text-lg gradient-text">
                {analysis.bodyPart}
              </h2>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${severityConfig[analysis.severity].className}`}>
                {severityConfig[analysis.severity].emoji} {severityConfig[analysis.severity].label}
              </span>
            </div>

            {/* Pain Classification */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass rounded-xl px-4 py-3 space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Pain Type</span>
                <span className="font-display font-bold text-sm text-primary">{analysis.primary_type}</span>
              </div>
              {analysis.secondary_type && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Secondary</span>
                  <span className="font-display text-xs text-foreground/70">{analysis.secondary_type}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Nature</span>
                <span className="text-xs text-foreground/80 capitalize">{analysis.pain_nature}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Confidence</span>
                <span className="text-xs text-accent font-semibold">{analysis.confidence_score}</span>
              </div>
              {painLevel && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Pain Intensity</span>
                  <span className="font-display font-bold text-sm text-foreground">{painLevel}/10</span>
                </div>
              )}
            </motion.div>

            {/* Warning */}
            {analysis.warning && analysis.warning !== "none" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass rounded-xl p-3 border border-pain-high/30"
              >
                <p className="text-xs text-pain-high flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{analysis.warning}</span>
                </p>
              </motion.div>
            )}

            {/* Summary */}
            <p className="text-sm text-muted-foreground leading-relaxed">{analysis.summary}</p>

            {/* Reasoning */}
            {analysis.reasoning && (
              <div className="glass rounded-xl px-4 py-2">
                <p className="text-xs text-muted-foreground italic">💡 {analysis.reasoning}</p>
              </div>
            )}

            {/* Causes */}
            <Section icon={Stethoscope} title="Possible Causes" delay={0.1}>
              <ul className="space-y-1.5">
                {analysis.possibleCauses.map((c, i) => (
                  <li key={i} className="text-sm text-foreground/80 flex items-start gap-2">
                    <span className="text-primary mt-1 shrink-0">•</span>
                    {c}
                  </li>
                ))}
              </ul>
            </Section>

            {/* Symptoms */}
            <Section icon={Activity} title="Common Symptoms" delay={0.15}>
              <div className="flex flex-wrap gap-2">
                {analysis.symptoms.map((s, i) => (
                  <span key={i} className="text-xs glass px-2.5 py-1 rounded-full text-foreground/80">
                    {s}
                  </span>
                ))}
              </div>
            </Section>

            {/* Precautions */}
            <Section icon={Shield} title="Precautions & Self-Care" delay={0.2}>
              <ul className="space-y-1.5">
                {analysis.precautions.map((p, i) => (
                  <li key={i} className="text-sm text-foreground/80 flex items-start gap-2">
                    <span className="text-accent mt-1 shrink-0">✓</span>
                    {p}
                  </li>
                ))}
              </ul>
            </Section>

            {/* Follow-up Questions */}
            <Section icon={MessageCircle} title="Questions for Your Doctor" delay={0.25}>
              <ul className="space-y-1.5">
                {analysis.followUpQuestions.map((q, i) => (
                  <li key={i} className="text-sm text-foreground/80 italic opacity-80">
                    "{q}"
                  </li>
                ))}
              </ul>
            </Section>

            {/* Smart Follow-up Buttons */}
            {onFollowUp && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-2 pt-2 border-t border-border/30"
              >
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-accent" />
                  <p className="text-xs font-display font-semibold text-foreground/70">Learn More</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {FOLLOW_UP_BUTTONS.map((btn) => (
                    <button
                      key={btn.label}
                      onClick={() => onFollowUp(`Regarding my ${analysis.bodyPart} pain: ${btn.prompt}`)}
                      className="text-xs text-left px-3 py-2 rounded-xl glass neon-border hover:bg-primary/5 hover:border-primary/40 text-muted-foreground hover:text-foreground transition-all duration-200"
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center gap-4 text-center"
          >
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center animate-float">
                <Activity className="w-10 h-10 text-primary" />
              </div>
              <div className="absolute inset-0 rounded-full animate-pulse-glow" />
            </div>
            <div>
              <p className="text-foreground text-sm font-display font-semibold mb-1">Ready to Analyze</p>
              <p className="text-muted-foreground text-xs max-w-[200px]">
                Click on the 3D model to identify and analyze pain areas
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
