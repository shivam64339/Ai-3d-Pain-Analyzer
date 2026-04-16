import { motion } from "framer-motion";
import { Stethoscope, Shield, AlertTriangle, Activity, MessageCircle, RotateCcw, Sparkles } from "lucide-react";
import type { AnalysisResult } from "./AnalysisPanel";

const severityConfig: Record<string, { label: string; color: string; bgClass: string; emoji: string }> = {
  low: { label: "Low Risk", color: "oklch(0.75 0.18 145)", bgClass: "bg-pain-low/15 border-pain-low/30 text-pain-low", emoji: "🟢" },
  medium: { label: "Medium Risk", color: "oklch(0.80 0.17 85)", bgClass: "bg-pain-medium/15 border-pain-medium/30 text-pain-medium", emoji: "🟡" },
  high: { label: "High Risk", color: "oklch(0.70 0.20 40)", bgClass: "bg-pain-high/15 border-pain-high/30 text-pain-high", emoji: "🟠" },
  critical: { label: "Critical", color: "oklch(0.60 0.24 25)", bgClass: "bg-pain-critical/15 border-pain-critical/30 text-pain-critical", emoji: "🔴" },
};

const FOLLOW_UP_BUTTONS = [
  { label: "🏠 Home Remedies", prompt: "What are effective home remedies for this pain?" },
  { label: "🏥 When to See Doctor", prompt: "When should I see a doctor about this pain?" },
  { label: "🧘 Exercises", prompt: "What exercises can help with this pain?" },
  { label: "💊 Treatments", prompt: "What are common treatments for this condition?" },
];

interface Props {
  analysis: AnalysisResult;
  painLevel: number;
  onFollowUp: (question: string) => void;
  onStartOver: () => void;
}

export default function ResultDashboard({ analysis, painLevel, onFollowUp, onStartOver }: Props) {
  const sev = severityConfig[analysis.severity] ?? severityConfig.low;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 max-w-2xl mx-auto w-full"
    >
      {/* Header */}
      <div className="text-center space-y-2">
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display font-bold text-2xl gradient-text"
        >
          Analysis Complete
        </motion.h2>
        <p className="text-muted-foreground text-sm">{analysis.bodyPart} — Pain Level {painLevel}/10</p>
      </div>

      {/* Pain Classification Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.08 }}
        className="glass rounded-2xl p-4 neon-border space-y-2"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Primary Type</span>
          <span className="font-display font-bold text-sm text-primary">{analysis.primary_type}</span>
        </div>
        {analysis.secondary_type && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Secondary Type</span>
            <span className="text-xs text-foreground/70">{analysis.secondary_type}</span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Pain Nature</span>
          <span className="text-xs text-foreground/80 capitalize">{analysis.pain_nature}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Confidence</span>
          <span className="text-xs text-accent font-semibold">{analysis.confidence_score}</span>
        </div>
      </motion.div>

      {/* Risk Level Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className={`rounded-2xl border-2 p-5 text-center ${sev.bgClass}`}
        style={{ boxShadow: `0 0 30px ${sev.color}33` }}
      >
        <span className="text-3xl">{sev.emoji}</span>
        <p className="font-display font-bold text-lg mt-2">{sev.label}</p>
        <p className="text-xs opacity-80 mt-1">{analysis.summary}</p>
      </motion.div>

      {/* Warning */}
      {analysis.warning && analysis.warning !== "none" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="glass rounded-xl p-3 border border-pain-high/30"
        >
          <p className="text-xs text-pain-high flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span><strong>Warning:</strong> {analysis.warning}</span>
          </p>
        </motion.div>
      )}

      {/* Reasoning */}
      {analysis.reasoning && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.13 }}
          className="glass rounded-xl px-4 py-3 neon-border"
        >
          <p className="text-xs text-muted-foreground italic">💡 <strong>AI Reasoning:</strong> {analysis.reasoning}</p>
        </motion.div>
      )}

      {/* Grid cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Possible Causes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass rounded-xl p-4 space-y-3 neon-border"
        >
          <div className="flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-primary" />
            <h3 className="font-display font-semibold text-sm">Possible Causes</h3>
          </div>
          <ul className="space-y-1.5">
            {analysis.possibleCauses.map((c, i) => (
              <li key={i} className="text-xs text-foreground/80 flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>{c}
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Symptoms */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-xl p-4 space-y-3 neon-border"
        >
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-accent" />
            <h3 className="font-display font-semibold text-sm">Symptoms</h3>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {analysis.symptoms.map((s, i) => (
              <span key={i} className="text-[10px] bg-muted/50 px-2 py-1 rounded-full text-foreground/70">{s}</span>
            ))}
          </div>
        </motion.div>

        {/* Precautions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="glass rounded-xl p-4 space-y-3 neon-border"
        >
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-pain-low" />
            <h3 className="font-display font-semibold text-sm">Self-Care & Precautions</h3>
          </div>
          <ul className="space-y-1.5">
            {analysis.precautions.map((p, i) => (
              <li key={i} className="text-xs text-foreground/80 flex items-start gap-2">
                <span className="text-pain-low mt-0.5">✓</span>{p}
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Doctor Questions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-xl p-4 space-y-3 neon-border"
        >
          <div className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-pain-high" />
            <h3 className="font-display font-semibold text-sm">Ask Your Doctor</h3>
          </div>
          <ul className="space-y-1.5">
            {analysis.followUpQuestions.map((q, i) => (
              <li key={i} className="text-xs text-foreground/80 italic">"{q}"</li>
            ))}
          </ul>
        </motion.div>
      </div>

      {/* Follow-up buttons */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="space-y-3"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-accent" />
          <p className="text-xs font-display font-semibold text-foreground/70">Explore Further</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {FOLLOW_UP_BUTTONS.map((btn) => (
            <button
              key={btn.label}
              onClick={() => onFollowUp(`Regarding my ${analysis.bodyPart} pain: ${btn.prompt}`)}
              className="text-xs text-left px-3 py-2.5 rounded-xl glass neon-border hover:bg-primary/5 hover:border-primary/40 text-muted-foreground hover:text-foreground transition-all duration-200"
            >
              {btn.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Disclaimer + Start Over */}
      <div className="space-y-3">
        <div className="glass rounded-xl p-3 border border-pain-high/20">
          <p className="text-xs text-pain-high flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span><strong>Medical Disclaimer:</strong> This is educational only. Always consult a healthcare professional.</span>
          </p>
        </div>

        <button
          onClick={onStartOver}
          className="w-full py-3 rounded-xl glass neon-border text-sm font-display font-semibold text-muted-foreground hover:text-foreground hover:bg-primary/5 transition-all flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Start Over
        </button>
      </div>
    </motion.div>
  );
}
