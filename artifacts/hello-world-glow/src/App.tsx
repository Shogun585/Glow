import {
  useState,
  useRef,
  useEffect,
  useCallback,
  Component,
  ReactNode,
  ErrorInfo,
} from "react";
import Spline from "@splinetool/react-spline";
import { motion, AnimatePresence } from "framer-motion";

class SplineErrorBoundary extends Component<
  { children: ReactNode; fallback?: ReactNode },
  { error: boolean }
> {
  constructor(props: { children: ReactNode; fallback?: ReactNode }) {
    super(props);
    this.state = { error: false };
  }
  static getDerivedStateFromError() {
    return { error: true };
  }
  componentDidCatch(_err: Error, _info: ErrorInfo) {}
  render() {
    if (this.state.error) {
      return this.props.fallback ?? <div className="spline-fallback">⌨️</div>;
    }
    return this.props.children;
  }
}

type Phase = "input" | "glow";

const PHRASES = [
  "Hello World",
  "Make something wonderful",
  "The internet is for everyone",
  "Design is intelligence made visible",
  "Stay curious",
];

export default function App() {
  const [phase, setPhase] = useState<Phase>("input");
  const [segments, setSegments] = useState<string[]>([]);
  const [current, setCurrent] = useState("");
  const [aboutOpen, setAboutOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const isInputPhase = phase === "input";
  const inputOpacity = phase === "fadeOut" ? 0 : 1;
  const hasContent = segments.length > 0 || current.length > 0;

  // Focus hidden input on mount and click
  useEffect(() => {
    if (isInputPhase) inputRef.current?.focus();
  }, [isInputPhase]);

  const handleContainerClick = useCallback(() => {
    if (isInputPhase) inputRef.current?.focus();
  }, [isInputPhase]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (phase !== "input") return;

      if (e.key === "Enter") {
        e.preventDefault();
        const final = [...segments, current].filter(Boolean).join(". ");
        if (!final) return;
        setPhase("glow");
        // Trigger glow effect with final text
        return;
      }

      if (e.key === ".") {
        e.preventDefault();
        if (current.trim()) {
          setSegments((prev) => [...prev, current.trim()]);
          setCurrent("");
        }
        return;
      }

      if (e.key === "Backspace") {
        e.preventDefault();
        if (current.length > 0) {
          setCurrent((prev) => prev.slice(0, -1));
        } else if (segments.length > 0) {
          setSegments((prev) => prev.slice(0, -1));
        }
        return;
      }

      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        setCurrent((prev) => prev + e.key);
      }
    },
    [phase, segments, current],
  );

  const handleCopy = useCallback(() => {
    const text = [...segments, current].filter(Boolean).join(". ");
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [segments, current]);

  const handleRestart = useCallback(() => {
    setSegments([]);
    setCurrent("");
    setPhase("input");
    setCopied(false);
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val.endsWith(".")) {
      const trimmed = val.slice(0, -1).trim();
      if (trimmed) setSegments((prev) => [...prev, trimmed]);
      setCurrent("");
    } else {
      setCurrent(val);
    }
  }, []);

  // Random phrase suggestion
  const randomPhrase = PHRASES[Math.floor(Math.random() * PHRASES.length)];

  return (
    <div className="root" ref={containerRef} onClick={handleContainerClick}>
      {/* ── Top nav ── */}
      <nav className="top-nav">
        <span className="nav-brand">Glow</span>
        <button
          className="nav-about"
          onClick={(e) => {
            e.stopPropagation();
            setAboutOpen(true);
          }}
        >
          About
        </button>
      </nav>

      {/* ── About popup ── */}
      <AnimatePresence>
        {aboutOpen && (
          <div className="about-backdrop" onClick={() => setAboutOpen(false)}>
            <div className="about-card" onClick={(e) => e.stopPropagation()}>
              <button
                className="about-close"
                onClick={() => setAboutOpen(false)}
              >
                ✕
              </button>
              <p className="about-created">Created by Abhilash Singh</p>
              <p className="about-tagline">Breaking and building....</p>
              <div className="about-links">
                <a
                  href="http://github.com/shogun585/"
                  target="_blank"
                  rel="noreferrer"
                >
                  Github
                </a>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Glow Phase ── */}
      {phase === "glow" && (
        <div className="glow-host">
          <GlowEffect
            text={[...segments, current].filter(Boolean).join(". ")}
            onRestart={handleRestart}
          />
        </div>
      )}

      {/* ── Glow-phase bottom hint ── */}
      {phase === "glow" && (
        <div className="glow-hint">
          <span className="glow-copy-btn" onClick={handleCopy}>
            <kbd>{copied ? "copied!" : "copy"}</kbd>
          </span>{" "}
          to your website
        </div>
      )}

      {/* ── Input Phase Overlay ── */}
      {isInputPhase && (
        <div
          className="input-overlay"
          style={{ opacity: inputOpacity, transition: "opacity 0.6s ease" }}
        >
          {/* Typed text display */}
          <div className="typed-display">
            <span className="typed-prefix">print(</span>
            <span className="typed-quote">"</span>
            {hasContent && (
              <>
                {segments.map((seg, i) => (
                  <span key={i} className="typed-segment">
                    {seg}
                    <span className="typed-dot">.</span>
                  </span>
                ))}
                <span className="typed-chars">{current}</span>
              </>
            )}
            <span className="typed-cursor">▍</span>
            <span className="typed-quote">"</span>
            <span className="typed-prefix">)</span>
          </div>

          {/* Spline 3D keyboard */}
          <div className="spline-wrap" onClick={(e) => e.stopPropagation()}>
            <SplineErrorBoundary
              fallback={<div className="spline-fallback">⌨️</div>}
            >
              <Spline scene="https://prod.spline.design/H1LvhYkNlE0G22dJ/scene.splinecode" />
            </SplineErrorBoundary>
          </div>

          {/* Hint */}
          <p className="enter-hint">
            Press <kbd>.</kbd> to add a phrase · <kbd>Enter</kbd> to glow
          </p>

          {/* Hidden real input to capture keystrokes */}
          <input
            ref={inputRef}
            className="hidden-input"
            value={current}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            autoFocus
            autoComplete="off"
            spellCheck={false}
          />
        </div>
      )}
    </div>
  );
}

// ── Glow Effect Component ──
function GlowEffect({
  text,
  onRestart,
}: {
  text: string;
  onRestart: () => void;
}) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        background: "#F2F2F2",
        cursor: "pointer",
      }}
      onClick={onRestart}
    >
      <motion.h1
        initial={{ opacity: 0, scale: 0.9, filter: "blur(20px)" }}
        animate={{
          opacity: 1,
          scale: 1,
          filter: "blur(0px)",
          textShadow: [
            "0 0 20px rgba(91, 31, 214, 0)",
            "0 0 40px rgba(91, 31, 214, 0.3)",
            "0 0 60px rgba(91, 31, 214, 0.5)",
            "0 0 40px rgba(91, 31, 214, 0.3)",
            "0 0 20px rgba(91, 31, 214, 0)",
          ],
        }}
        transition={{
          duration: 2,
          textShadow: {
            repeat: Infinity,
            duration: 3,
            ease: "easeInOut",
          },
        }}
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: "clamp(24px, 5vw, 64px)",
          color: "#3a3050",
          textAlign: "center",
          padding: "0 24px",
          letterSpacing: "-0.02em",
        }}
      >
        {text}
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ delay: 1.5 }}
        style={{
          marginTop: 24,
          fontFamily: "'Inter', sans-serif",
          fontSize: 14,
          color: "#3a3050",
          cursor: "pointer",
        }}
      >
        Click anywhere to start over
      </motion.p>
    </div>
  );
}
