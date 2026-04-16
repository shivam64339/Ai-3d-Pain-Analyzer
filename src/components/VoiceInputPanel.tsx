import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Square, Play, Pause, Check, Keyboard, ArrowRight, Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  bodyPart: string;
  onSubmit: (description: string) => void;
}

type RecordingState = "idle" | "recording" | "recorded" | "playing";

export default function VoiceInputPanel({ bodyPart, onSubmit }: Props) {
  const [state, setState] = useState<RecordingState>("idle");
  const [transcript, setTranscript] = useState("");
  const [timer, setTimer] = useState(0);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [micDenied, setMicDenied] = useState(false);
  const [showTextFallback, setShowTextFallback] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [waveformLevels, setWaveformLevels] = useState<number[]>(Array(20).fill(0.1));

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  const MAX_DURATION = 20;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
      if (recognitionRef.current) recognitionRef.current.abort();
    };
  }, []);

  const updateWaveform = useCallback(() => {
    if (!analyserRef.current) return;
    const data = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(data);
    const step = Math.floor(data.length / 20);
    const levels = Array.from({ length: 20 }, (_, i) => {
      const val = data[i * step] / 255;
      return Math.max(0.1, val);
    });
    setWaveformLevels(levels);
    animFrameRef.current = requestAnimationFrame(updateWaveform);
  }, []);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Analyser for waveform
      const audioCtx = new AudioContext();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      // MediaRecorder
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        stream.getTracks().forEach(t => t.stop());
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        setWaveformLevels(Array(20).fill(0.1));
      };

      recorder.start();
      setState("recording");
      setTimer(0);

      // Start Web Speech API recognition
      const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognitionAPI) {
        const recognition = new SpeechRecognitionAPI();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";
        recognitionRef.current = recognition;

        let finalText = "";
        recognition.onresult = (event: SpeechRecognitionEvent) => {
          let interim = "";
          for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              finalText += event.results[i][0].transcript + " ";
            } else {
              interim += event.results[i][0].transcript;
            }
          }
          setTranscript((finalText + interim).trim());
        };
        recognition.onerror = () => { /* ignore, user can type */ };
        recognition.start();
      }

      // Timer
      timerRef.current = setInterval(() => {
        setTimer(prev => {
          if (prev >= MAX_DURATION - 1) {
            stopRecording();
            return MAX_DURATION;
          }
          return prev + 1;
        });
      }, 1000);

      updateWaveform();
    } catch {
      setMicDenied(true);
      setShowTextFallback(true);
    }
  }, [updateWaveform]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setState("recorded");
    setIsTranscribing(true);
    // Small delay to simulate processing
    setTimeout(() => setIsTranscribing(false), 800);
  }, []);

  const togglePlayback = useCallback(() => {
    if (!audioUrl) return;
    if (state === "playing") {
      audioRef.current?.pause();
      setState("recorded");
    } else {
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      audio.onended = () => setState("recorded");
      audio.play();
      setState("playing");
    }
  }, [audioUrl, state]);

  const handleSubmit = useCallback(() => {
    if (transcript.trim()) {
      onSubmit(transcript.trim());
    }
  }, [transcript, onSubmit]);

  const canSubmit = transcript.trim().length > 0 && !isTranscribing;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-lg mx-auto w-full"
    >
      {/* Header */}
      <div className="text-center">
        <h2 className="font-display font-bold text-xl gradient-text">Describe Your Pain</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Speak about your pain in{" "}
          <span className="text-primary font-semibold">{bodyPart}</span>
          {" "}(10–20 seconds)
        </p>
      </div>

      {/* Mic Section */}
      {!showTextFallback ? (
        <div className="glass rounded-2xl p-6 space-y-5 border border-border/30">
          {/* Mic Button */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              {/* Pulsing rings when recording */}
              <AnimatePresence>
                {state === "recording" && (
                  <>
                    <motion.div
                      initial={{ scale: 1, opacity: 0.4 }}
                      animate={{ scale: 2, opacity: 0 }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="absolute inset-0 rounded-full bg-destructive/30"
                    />
                    <motion.div
                      initial={{ scale: 1, opacity: 0.3 }}
                      animate={{ scale: 1.6, opacity: 0 }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
                      className="absolute inset-0 rounded-full bg-destructive/20"
                    />
                  </>
                )}
              </AnimatePresence>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={state === "idle" ? startRecording : state === "recording" ? stopRecording : startRecording}
                className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer ${
                  state === "recording"
                    ? "bg-destructive/20 border-2 border-destructive shadow-[0_0_30px_oklch(0.6_0.25_25/0.5)]"
                    : "bg-primary/10 border-2 border-primary/40 shadow-[0_0_20px_oklch(0.72_0.22_180/0.2)] hover:shadow-[0_0_30px_oklch(0.72_0.22_180/0.4)]"
                }`}
              >
                {state === "recording" ? (
                  <Square className="w-7 h-7 text-destructive" />
                ) : (
                  <Mic className="w-8 h-8 text-primary" />
                )}
              </motion.button>
            </div>

            {/* Status text */}
            <motion.p
              key={state}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-muted-foreground font-medium"
            >
              {state === "idle" && "Tap to start recording"}
              {state === "recording" && (
                <span className="text-destructive flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
                  Recording... {timer}s / {MAX_DURATION}s
                </span>
              )}
              {(state === "recorded" || state === "playing") && "Recording complete"}
            </motion.p>
          </div>

          {/* Waveform */}
          <AnimatePresence>
            {state === "recording" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 48 }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-end justify-center gap-[3px] h-12"
              >
                {waveformLevels.map((level, i) => (
                  <motion.div
                    key={i}
                    animate={{ height: `${level * 100}%` }}
                    transition={{ duration: 0.1 }}
                    className="w-1.5 rounded-full bg-primary/60"
                    style={{ minHeight: 4 }}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Timer bar */}
          {state === "recording" && (
            <div className="w-full h-1.5 rounded-full bg-muted/30 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-destructive"
                animate={{ width: `${(timer / MAX_DURATION) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          )}

          {/* Playback controls */}
          <AnimatePresence>
            {(state === "recorded" || state === "playing") && audioUrl && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-center gap-3"
              >
                <button
                  onClick={togglePlayback}
                  className="glass rounded-xl px-4 py-2 text-xs font-medium flex items-center gap-2 border border-border/30 hover:border-primary/40 transition-colors cursor-pointer"
                >
                  {state === "playing" ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  {state === "playing" ? "Pause" : "Replay"}
                </button>
                <button
                  onClick={() => { setState("idle"); setTranscript(""); setAudioUrl(null); setTimer(0); }}
                  className="glass rounded-xl px-4 py-2 text-xs font-medium flex items-center gap-2 border border-border/30 hover:border-primary/40 transition-colors cursor-pointer"
                >
                  <Mic className="w-3.5 h-3.5" />
                  Re-record
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Switch to text */}
          <button
            onClick={() => setShowTextFallback(true)}
            className="w-full text-xs text-muted-foreground hover:text-foreground flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Keyboard className="w-3.5 h-3.5" />
            Prefer typing? Switch to text input
          </button>
        </div>
      ) : (
        /* Text fallback */
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-6 space-y-4 border border-border/30"
        >
          {micDenied && (
            <div className="flex items-center gap-2 text-xs text-amber-400 bg-amber-400/10 rounded-lg p-3">
              <MicOff className="w-4 h-4 shrink-0" />
              Microphone access denied. You can type your pain description instead.
            </div>
          )}
          <Textarea
            placeholder={`Describe your pain in ${bodyPart}... (e.g., "I feel a sharp pain when I move my arm above my head")`}
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            className="bg-muted/20 border-border/30 focus:border-primary/50 min-h-[100px] text-sm resize-none"
          />
          {!micDenied && (
            <button
              onClick={() => setShowTextFallback(false)}
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Mic className="w-3.5 h-3.5" />
              Switch to voice input
            </button>
          )}
        </motion.div>
      )}

      {/* Transcript display */}
      <AnimatePresence>
        {!showTextFallback && (state === "recorded" || state === "playing") && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl p-5 space-y-3 border border-border/30"
          >
            {isTranscribing ? (
              <div className="flex items-center justify-center gap-2 py-4 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                Transcribing your voice...
              </div>
            ) : (
              <>
                <p className="text-xs text-muted-foreground font-medium">You said:</p>
                <Textarea
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  placeholder="Transcript will appear here... You can also edit it."
                  className="bg-muted/20 border-border/30 focus:border-primary/50 min-h-[80px] text-sm resize-none"
                />
                <p className="text-[10px] text-muted-foreground">You can edit the text above if needed</p>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit */}
      <motion.button
        onClick={handleSubmit}
        disabled={!canSubmit}
        whileHover={canSubmit ? { scale: 1.02 } : {}}
        whileTap={canSubmit ? { scale: 0.98 } : {}}
        className={`w-full py-3.5 rounded-xl font-display font-bold text-sm flex items-center justify-center gap-2 transition-all duration-300 ${
          canSubmit
            ? "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-[0_0_30px_oklch(0.72_0.22_180/0.4)] hover:shadow-[0_0_40px_oklch(0.72_0.22_180/0.6)]"
            : "bg-muted/50 text-muted-foreground cursor-not-allowed"
        }`}
      >
        <Check className="w-4 h-4" />
        Use This Description
        <ArrowRight className="w-4 h-4" />
      </motion.button>
    </motion.div>
  );
}
