import { createFileRoute } from "@tanstack/react-router";
import { useState, Suspense, lazy, useCallback } from "react";
import { ClientOnly } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, RotateCcw, ArrowLeft } from "lucide-react";
import { type AnalysisResult } from "@/components/AnalysisPanel";
import ChatWidget from "@/components/ChatWidget";
import HelpModal from "@/components/HelpModal";
import { analyzePain } from "@/utils/analyze-pain.functions";
import { BODY_PARTS } from "@/components/HumanBody3D";
import GenderAgeSelector, { type Gender, type AgeRange, type ActivityLevel } from "@/components/GenderAgeSelector";
import StepProgress from "@/components/StepProgress";
import FloatingParticles from "@/components/FloatingParticles";
import PainDetailsPanel from "@/components/PainDetailsPanel";
import ScanningLoader from "@/components/ScanningLoader";
import ResultDashboard from "@/components/ResultDashboard";
import VoiceInputPanel from "@/components/VoiceInputPanel";

const HumanBody3D = lazy(() => import("@/components/HumanBody3D"));

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AI 3D Pain Analyzer — Interactive Body Pain Education Tool" },
      { name: "description", content: "Explore an interactive 3D human body model, click on body parts experiencing discomfort, and receive AI-powered educational analysis." },
      { property: "og:title", content: "AI 3D Pain Analyzer" },
      { property: "og:description", content: "Interactive 3D body pain education tool powered by AI" },
    ],
  }),
  component: PainAnalyzerPage,
});

type WizardStep = 1 | 2 | 3 | 4 | 5 | 6;

const slideVariants = {
  enter: { opacity: 0, x: 60 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -60 },
};

function PainAnalyzerPage() {
  const [step, setStep] = useState<WizardStep>(1);
  const [profile, setProfile] = useState<{ gender: Gender; ageRange: AgeRange; activityLevel: ActivityLevel } | null>(null);
  const [selectedPart, setSelectedPart] = useState<string | null>(null);
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [painLevel, setPainLevel] = useState<number>(5);
  const [painDetails, setPainDetails] = useState<{ painType: string; intensity: number; duration: string } | null>(null);
  const [voiceDescription, setVoiceDescription] = useState<string | null>(null);

  const handleProfileComplete = useCallback((gender: Gender, ageRange: AgeRange, activityLevel: ActivityLevel) => {
    setProfile({ gender, ageRange, activityLevel });
    setStep(2);
  }, []);

  const handleSelectPart = useCallback((partName: string) => {
    setSelectedPart(partName);
    const label = BODY_PARTS.find((p: { name: string; label: string }) => p.name === partName)?.label ?? partName;
    setSelectedLabel(label);
    setStep(3); // Voice input step
  }, []);

  const handleVoiceSubmit = useCallback((description: string) => {
    setVoiceDescription(description);
    setStep(4); // Pain details step
  }, []);

  const handlePainDetailsSubmit = useCallback(async (data: { painType: string; intensity: number; duration: string }) => {
    if (!selectedPart || !profile) return;
    setPainDetails(data);
    setPainLevel(data.intensity);
    setStep(5); // Scanning/analysis step
    setAnalysis(null);
    setAnalysisError(null);

    const label = BODY_PARTS.find((p: { name: string; label: string }) => p.name === selectedPart)?.label ?? selectedPart;

    try {
      const result = await analyzePain({
        data: {
          bodyPart: label,
          gender: profile.gender,
          ageRange: profile.ageRange,
          additionalSymptoms: `Pain type: ${data.painType}. Pain intensity: ${data.intensity}/10. Duration: ${data.duration}. Activity level: ${profile.activityLevel}.${voiceDescription ? ` User's voice description: "${voiceDescription}"` : ""}`,
        },
      });
      setAnalysis(result as AnalysisResult);
      setStep(6);
    } catch (err) {
      console.error("Analysis failed:", err);
      setAnalysisError(err instanceof Error ? err.message : "Analysis failed. Please try again.");
      setStep(6);
    }
  }, [selectedPart, profile, voiceDescription]);

  const handleFollowUp = useCallback((question: string) => {
    const event = new CustomEvent("open-chat", { detail: question });
    window.dispatchEvent(event);
  }, []);

  const handleStartOver = useCallback(() => {
    setStep(1);
    setProfile(null);
    setSelectedPart(null);
    setSelectedLabel(null);
    setAnalysis(null);
    setAnalysisError(null);
    setPainDetails(null);
    setPainLevel(5);
    setVoiceDescription(null);
  }, []);

  const handleBack = useCallback(() => {
    if (step === 2) setStep(1);
    else if (step === 3) setStep(2);
    else if (step === 4) setStep(3);
    else if (step === 6) setStep(4);
  }, [step]);

  return (
    <div className="min-h-screen bg-background flex flex-col relative">
      <FloatingParticles />

      {/* Background ambient */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-300px] right-[-200px] w-[600px] h-[600px] rounded-full bg-primary/3 blur-[150px]" />
        <div className="absolute bottom-[-300px] left-[-200px] w-[600px] h-[600px] rounded-full bg-accent/3 blur-[150px]" />
      </div>

      {/* Header */}
      <header className="relative z-20 glass border-b border-border/20 px-5 py-2.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {step > 1 && step !== 5 && (
              <motion.button
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={handleBack}
                className="w-8 h-8 rounded-lg glass flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
              </motion.button>
            )}
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Brain className="w-4.5 h-4.5 text-primary" />
              </div>
              <div>
                <h1 className="font-display font-bold text-base gradient-text tracking-tight">AI Pain Analyzer</h1>
                <p className="text-[9px] text-muted-foreground leading-none">Advanced Pain Education</p>
              </div>
            </div>
          </div>

          {step > 1 && (
            <button
              onClick={handleStartOver}
              className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground glass rounded-lg px-2.5 py-1.5 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          )}
        </div>
      </header>

      {/* Step Progress */}
      <div className="relative z-10 pt-3 pb-1">
        <StepProgress currentStep={step} />
      </div>

      {/* Main content */}
      <main className="relative z-10 flex-1 flex flex-col items-center px-4 pb-6 overflow-y-auto overflow-x-hidden">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="w-full py-4">
              <GenderAgeSelector onComplete={handleProfileComplete} />
            </motion.div>
          )}

          {step === 2 && profile && (
            <motion.div key="step2" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="w-full flex-1 flex flex-col absolute inset-0">
              <div className="text-center pt-2 pb-1 relative z-10">
                <h2 className="font-display font-bold text-xl gradient-text">Select Pain Area</h2>
                <p className="text-muted-foreground text-xs mt-0.5">Rotate and click on the body to select pain area</p>
              </div>
              <div className="flex-1 relative">
                <ClientOnly fallback={
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-muted-foreground text-sm">Loading 3D model...</div>
                  </div>
                }>
                  <Suspense fallback={
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-muted-foreground text-sm">Loading 3D model...</div>
                    </div>
                  }>
                    <HumanBody3D
                      selectedPart={selectedPart}
                      onSelectPart={handleSelectPart}
                      gender={profile.gender}
                      ageRange={profile.ageRange}
                    />
                  </Suspense>
                </ClientOnly>
              </div>
            </motion.div>
          )}

          {step === 3 && selectedLabel && (
            <motion.div key="step3" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="w-full py-4">
              <VoiceInputPanel bodyPart={selectedLabel} onSubmit={handleVoiceSubmit} />
            </motion.div>
          )}

          {step === 4 && selectedLabel && (
            <motion.div key="step4" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="w-full py-4">
              <PainDetailsPanel bodyPart={selectedLabel} onSubmit={handlePainDetailsSubmit} />
            </motion.div>
          )}

          {step === 5 && (
            <ScanningLoader bodyPart={selectedLabel ?? "body"} />
          )}

          {step === 6 && (
            <motion.div key="step6" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="w-full py-4">
              {analysisError ? (
                <div className="text-center space-y-4 py-16">
                  <p className="text-pain-high text-sm">{analysisError}</p>
                  <button onClick={handleStartOver} className="glass px-4 py-2 rounded-xl text-sm text-foreground hover:bg-primary/10 transition-colors">
                    Try Again
                  </button>
                </div>
              ) : analysis ? (
                <ResultDashboard
                  analysis={analysis}
                  painLevel={painLevel}
                  onFollowUp={handleFollowUp}
                  onStartOver={handleStartOver}
                />
              ) : null}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <ChatWidget />
      <HelpModal />
    </div>
  );
}
