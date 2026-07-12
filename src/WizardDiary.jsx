import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Replace with your actual Gemini API Key
const API_KEY = import.meta.env.VITE_GROQ_API_KEY;

const fontUrl = "https://fonts.googleapis.com/css2?family=Caveat:wght@400;600;700&family=Cinzel:wght@400;700&display=swap";

// Simulated or real fetch to AI
const fetchWizardResponse = async (prompt) => {
  if (API_KEY === "YOUR_API_KEY" || !API_KEY) {
    // Simulation for demo purposes if no key provided
    await new Promise(r => setTimeout(r, 2500));
    return "The winds of time obscure your path, seeker. Yet, those who look closely will find their own magic within. Proceed with a brave heart.";
  }

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`
    },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: "Act as an ancient, sentient wizard trapped inside a magical diary. Provide highly accurate, factual, and correct answers to the user's questions. You may use a slightly mystical tone, but never sacrifice factual correctness or hide behind riddles. Keep responses short and direct (maximum 2-3 sentences)." },
        { role: "user", content: prompt }
      ],
      temperature: 0.9
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`HTTP Error ${response.status}: ${errorData.error?.message || response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
};

const TypingText = ({ text, onComplete }) => {
  const characters = Array.from(text);

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.04, delayChildren: 0.2 },
    },
  };

  const child = {
    visible: { opacity: 1, y: 0, filter: "blur(0px)" },
    hidden: { opacity: 0, y: 2, filter: "blur(2px)" },
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="visible"
      onAnimationComplete={onComplete}
      className="text-xl md:text-2xl lg:text-3xl font-handwriting leading-relaxed text-[#1a1c29] whitespace-pre-wrap w-full"
    >
      {characters.map((char, index) => (
        <motion.span variants={child} key={index} className="inline-block">
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </motion.div>
  );
};

export default function WizardDiary() {
  // State Machine: IDLE -> WRITTEN -> VANISHING -> THINKING -> TYPING -> READING -> DONE
  const [appState, setAppState] = useState('IDLE');
  const [inputText, setInputText] = useState('');
  const [submittedText, setSubmittedText] = useState('');
  const [wizardResponse, setWizardResponse] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    let timer;
    if (appState === 'READING') {
      // Magically vanish the answer after 7 seconds of reading
      timer = setTimeout(() => {
        setAppState('DONE');
      }, 7000);
    }
    return () => clearTimeout(timer);
  }, [appState]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || (appState !== 'IDLE' && appState !== 'DONE')) return;

    const query = inputText.trim();
    setSubmittedText(query);
    setInputText('');
    setWizardResponse(''); // Clear previous answer
    setAppState('WRITTEN');

    // 1. Pause for 1.5s
    await new Promise(r => setTimeout(r, 1500));

    // 2. Vanishing animation
    setAppState('VANISHING');
    await new Promise(r => setTimeout(r, 2000));

    // 3. Thinking and API Fetch
    setAppState('THINKING');
    try {
      const response = await fetchWizardResponse(query);
      setWizardResponse(response);
    } catch (error) {
      setWizardResponse(`Connection error: ${error.message}`);
    }

    // 4. Typing the response
    setAppState('TYPING');
  };

  const handleClear = () => {
    setAppState('IDLE');
    setSubmittedText('');
    setWizardResponse('');
    setInputText('');
    if (inputRef.current) inputRef.current.focus();
  };

  const isInputDisabled = appState !== 'IDLE' && appState !== 'DONE';

  const paperStyle = {
    backgroundColor: '#eaddc5', // Aged ivory/tan base
    backgroundImage: `
      radial-gradient(circle at center, transparent 30%, rgba(139, 69, 19, 0.2) 85%, rgba(92, 58, 33, 0.45) 100%),
      radial-gradient(ellipse at 20% 80%, rgba(200, 160, 120, 0.25) 0%, transparent 45%),
      radial-gradient(ellipse at 80% 20%, rgba(180, 130, 90, 0.2) 0%, transparent 55%),
      url("data:image/svg+xml,%3Csvg width='400' height='400' viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.012' numOctaves='5' stitchTiles='stitch'/%3E%3CfeColorMatrix type='matrix' values='1 0 0 0 0, 0 0.9 0 0 0, 0 0.7 0 0 0, 0 0 0 0.12 0' /%3E%3C/filter%3E%3Crect width='400' height='400' filter='url(%23noise)'/%3E%3C/svg%3E"),
      url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='fine-noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23fine-noise)' opacity='0.08'/%3E%3C/svg%3E")
    `,
    backgroundSize: '100% 100%, 100% 100%, 100% 100%, 400px 400px, 100px 100px',
    backgroundBlendMode: 'normal, normal, normal, multiply, normal'
  };

  return (
    <div className="min-h-screen w-full bg-neutral-950 flex items-center justify-center p-2 sm:p-4 md:p-8 selection:bg-amber-900/30 overflow-hidden relative">
      <style>{`
        @import url('${fontUrl}');
        .font-handwriting { font-family: 'Caveat', cursive; }
        .font-tome { font-family: 'Cinzel', serif; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(92, 58, 33, 0.2); border-radius: 4px; }
      `}</style>

      {/* Magical ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-900/10 via-transparent to-transparent opacity-50 pointer-events-none blur-3xl"></div>

      {/* Book Container with Floating Animation */}
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="relative w-[92vw] max-w-[450px] aspect-[10/14] md:w-[90vw] md:max-w-[1000px] lg:max-w-[1200px] md:aspect-[16/10] max-h-[90vh] rounded-xl shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col md:flex-row z-10 mx-auto"
        style={{
          boxShadow: "inset 0 0 100px rgba(92, 58, 33, 0.5), inset 0 0 30px rgba(58, 30, 10, 0.6), 0 40px 80px -20px rgba(0,0,0,1)",
          ...paperStyle
        }}
      >
        {/* Decorative Leather Binding Edges */}
        <div className="absolute inset-0 border-[12px] md:border-[16px] border-[#3e2723]/10 pointer-events-none rounded-xl z-20" />

        {/* Spine Shadow (Desktop - Vertical) */}
        <div className="hidden md:block absolute top-0 bottom-0 left-1/2 w-16 -ml-8 bg-gradient-to-r from-transparent via-[#5c3a21]/40 to-transparent pointer-events-none z-10 mix-blend-multiply" />
        <div className="hidden md:block absolute top-0 bottom-0 left-1/2 w-[2px] bg-[#3e2723]/30 pointer-events-none z-10" />

        {/* Spine Shadow (Mobile - Horizontal) */}
        <div className="md:hidden absolute left-0 right-0 top-1/2 h-16 -mt-8 bg-gradient-to-b from-transparent via-[#5c3a21]/40 to-transparent pointer-events-none z-10 mix-blend-multiply" />
        <div className="md:hidden absolute left-0 right-0 top-1/2 h-[2px] bg-[#3e2723]/30 pointer-events-none z-10" />

        {/* Top-Right Clear Button */}
        <AnimatePresence>
          {appState === 'DONE' && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 0.5, scale: 1 }}
              whileHover={{ opacity: 1, scale: 1.1 }}
              onClick={handleClear}
              className="absolute top-6 right-6 z-30 p-2 text-stone-700 hover:text-amber-900 transition-colors rounded-full bg-[#eaddc5]/50 backdrop-blur-sm"
              title="Clear Pages"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
              </svg>
            </motion.button>
          )}
        </AnimatePresence>

        {/* Left Page (Top on Mobile): AI Response Canvas */}
        <div className="w-full h-1/2 md:w-1/2 md:h-full relative p-6 sm:p-10 md:p-14 lg:p-20 flex flex-col justify-center overflow-hidden">
          {/* Ambient Glowing Magic while thinking */}
          <AnimatePresence>
            {appState === 'THINKING' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: [0, 0.3, 0], scale: [0.8, 1.1, 0.8] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 bg-amber-400 mix-blend-overlay rounded-xl blur-[60px] pointer-events-none z-0"
              />
            )}
          </AnimatePresence>

          <div className="relative z-10 w-full max-h-full overflow-y-auto custom-scrollbar pr-2">
            <AnimatePresence mode="wait">
              {(appState === 'TYPING' || appState === 'READING') && (
                <motion.div
                  key="wizard-answer"
                  exit={{ opacity: 0, filter: "blur(8px)", transition: { duration: 2 } }}
                >
                  <TypingText
                    text={wizardResponse}
                    onComplete={() => setAppState('READING')}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Page (Bottom on Mobile): User Input Canvas */}
        <div className="w-full h-1/2 md:w-1/2 md:h-full relative p-6 sm:p-10 md:p-14 lg:p-20 flex flex-col justify-center items-center overflow-hidden">
          {/* Render User's Submitted Text */}
          <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-6 sm:px-10 md:px-14 lg:px-20 pointer-events-none -translate-y-8 md:-translate-y-16">
            <AnimatePresence>
              {(appState === 'WRITTEN' || appState === 'VANISHING') && (
                <motion.div
                  key="user-text"
                  initial={{ filter: "blur(0px)", opacity: 1, scale: 1, color: "#1c1917" }}
                  animate={
                    appState === 'VANISHING'
                      ? { filter: "blur(12px)", opacity: 0, scale: 0.95, color: "#44403c" }
                      : { filter: "blur(0px)", opacity: 1, scale: 1, color: "#1c1917" }
                  }
                  transition={
                    appState === 'VANISHING'
                      ? { duration: 2, ease: "easeOut" }
                      : { duration: 0 }
                  }
                  className="text-2xl sm:text-3xl md:text-4xl font-handwriting leading-relaxed w-full max-h-full overflow-y-auto custom-scrollbar px-2"
                >
                  {submittedText}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Input Area */}
          <div className="relative z-10 w-full max-w-lg -translate-y-8 md:-translate-y-16">
            <form onSubmit={handleSubmit} className="relative group">
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={isInputDisabled}
                placeholder={isInputDisabled ? "" : "Cast your inquiry into the pages..."}
                className="w-full bg-transparent border-b border-[#5c3a21]/20 pb-2 text-lg sm:text-xl md:text-2xl font-handwriting text-[#1c1917] placeholder:text-[#5c3a21]/40 focus:outline-none focus:border-[#5c3a21]/60 transition-colors disabled:opacity-0"
              />
              {!isInputDisabled && (
                <motion.div
                  className="absolute bottom-0 left-0 h-[2px] bg-amber-900/60"
                  initial={{ width: "0%" }}
                  whileInView={{ width: "100%" }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
              )}
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

