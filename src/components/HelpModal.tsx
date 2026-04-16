import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, X, User, MousePointer2, ClipboardList, Gauge, Brain, MessageCircle, Phone, ChevronDown, RotateCcw } from "lucide-react";

const STEPS = [
  { icon: User, title: "Step 1 — Set Your Profile", desc: "Select your gender, age range, and activity level. This helps the AI tailor results specifically to you." },
  { icon: MousePointer2, title: "Step 2 — Select Pain Area", desc: "Rotate the full-screen 3D body model by dragging, zoom with scroll, and click exactly where it hurts. AI identifies the precise body part." },
  { icon: ClipboardList, title: "Step 3 — Describe Your Pain", desc: "Choose pain type (Sharp, Dull, Burning, Tingling), set intensity on the 1–10 slider, and select how long you've had it." },
  { icon: Brain, title: "Step 4 — AI Analysis", desc: "Hit 'Analyze My Pain' and the AI scans your inputs to generate a detailed educational report." },
  { icon: Gauge, title: "Step 5 — View Results", desc: "See possible causes, risk level (color-coded), suggested actions, and when to see a doctor — all in one dashboard." },
  { icon: MessageCircle, title: "Chat with AI", desc: "Use the chat bubble (bottom-right) anytime to ask follow-up questions. The AI adapts to your language and age." },
];

const FAQS = [
  { q: "Is this a medical diagnosis?", a: "No. This tool provides educational information only. Always consult a healthcare professional for diagnosis and treatment." },
  { q: "How accurate is body part detection?", a: "We use AI vision to identify clicked body parts with high accuracy — down to individual fingers, facial features, and 85+ anatomical zones. If misidentified, click again on the exact spot." },
  { q: "Can I select multiple pain areas?", a: "One area at a time. After viewing results, use 'Start Over' or the back button to analyze a different area." },
  { q: "What do the risk level colors mean?", a: "Green = low risk (self-care likely sufficient), Yellow = moderate (monitor closely), Red = high (consider seeing a doctor soon)." },
  { q: "Does the chatbot understand Hindi/Hinglish?", a: "Yes! The AI chat detects your language automatically. You can type in English, Hindi, or Hinglish and it will reply in the same style." },
  { q: "Is my data stored?", a: "No personal health data is stored. All analysis happens in real-time and is not saved." },
  { q: "Can I go back to a previous step?", a: "Yes — use the back arrow (top-left) or the 'Reset' button to start over from scratch at any time." },
];

export default function HelpModal() {
  const [open, setOpen] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 left-6 z-50 w-10 h-10 rounded-full glass neon-border flex items-center justify-center hover:brightness-110 transition-all"
      >
        <HelpCircle className="w-5 h-5 text-primary" />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-50 bg-background/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.95 }}
              className="fixed inset-x-4 top-[10%] bottom-[10%] md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[480px] md:max-h-[600px] z-50 glass-strong rounded-2xl flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-border/30">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-primary" />
                  <h2 className="font-display font-bold text-lg gradient-text">How to Use</h2>
                </div>
                <button onClick={() => setOpen(false)} className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center transition-colors">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
                {/* Steps */}
                <div className="space-y-3">
                  {STEPS.map((step, i) => {
                    const Icon = step.icon;
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className="flex items-start gap-3 group"
                      >
                        <div className="w-9 h-9 rounded-xl bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center shrink-0 transition-colors">
                          <Icon className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-display font-semibold text-sm text-foreground">{step.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{step.desc}</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* FAQs */}
                <div>
                  <h3 className="font-display font-semibold text-sm text-foreground mb-3">FAQ</h3>
                  <div className="space-y-2">
                    {FAQS.map((faq, i) => (
                      <div key={i} className="rounded-xl border border-border/30 overflow-hidden">
                        <button
                          onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                          className="w-full flex items-center justify-between px-3 py-2.5 text-left hover:bg-muted/30 transition-colors"
                        >
                          <span className="text-xs font-medium text-foreground">{faq.q}</span>
                          <ChevronDown className={`w-3 h-3 text-muted-foreground transition-transform ${expandedFaq === i ? "rotate-180" : ""}`} />
                        </button>
                        <AnimatePresence>
                          {expandedFaq === i && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <p className="text-xs text-muted-foreground px-3 pb-3">{faq.a}</p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Emergency */}
                <div className="bg-pain-high/10 border border-pain-high/20 rounded-xl p-3">
                  <div className="flex items-start gap-2">
                    <Phone className="w-4 h-4 text-pain-high shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-pain-high">Emergency?</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        If you're experiencing severe symptoms like chest pain, difficulty breathing, or sudden numbness, call emergency services immediately.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
