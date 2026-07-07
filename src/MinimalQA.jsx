import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Replace with your actual Gemini API Key
const API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const fontUrl = "https://fonts.googleapis.com/css2?family=Caveat:wght@400;600;700&display=swap";

const fetchAIResponse = async (prompt) => {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`
    },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: "Provide highly accurate, factual, and correct answers. Keep responses short and direct (maximum 2-3 sentences)." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7
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
      className="text-2xl md:text-3xl lg:text-4xl font-handwriting leading-relaxed text-[#1a1c29] whitespace-pre-wrap"
    >
      {characters.map((char, index) => (
        <motion.span variants={child} key={index} className="inline-block">
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </motion.div>
  );
};

export default function MinimalQA() {
  // State Machine: IDLE -> WRITTEN -> VANISHING -> THINKING -> TYPING -> READING -> DONE
  const [appState, setAppState] = useState('IDLE');
  const [query, setQuery] = useState('');
  const [submittedText, setSubmittedText] = useState('');
  const [answer, setAnswer] = useState('');
  const inputRef = useRef(null);

  // Auto-reset timer
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

  // Focus input when returning to IDLE or DONE
  useEffect(() => {
    if ((appState === 'IDLE' || appState === 'DONE') && inputRef.current) {
      inputRef.current.focus();
    }
  }, [appState]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim() || (appState !== 'IDLE' && appState !== 'DONE')) return;

    const currentQuery = query.trim();
    setSubmittedText(currentQuery);
    setQuery('');
    setAnswer(''); // Clear previous answer
    setAppState('WRITTEN');

    // 1. Pause for 1.5s
    await new Promise(r => setTimeout(r, 1500));

    // 2. Vanishing animation
    setAppState('VANISHING');
    await new Promise(r => setTimeout(r, 2000));

    // 3. Thinking and API Fetch
    setAppState('THINKING');
    try {
      const response = await fetchAIResponse(currentQuery);
      setAnswer(response);
      setAppState('TYPING');
    } catch (error) {
      setAnswer(`Error: ${error.message}`);
      setAppState('TYPING');
    }
  };

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

  const isInputDisabled = appState !== 'IDLE' && appState !== 'DONE';

  return (
    <div className="min-h-screen w-full bg-neutral-900 flex flex-col justify-center items-center p-4 md:p-8 transition-colors duration-500 selection:bg-amber-900/30">
      <style>{`
        @import url('${fontUrl}');
        .font-handwriting { font-family: 'Caveat', cursive; }
      `}</style>
      
      <div 
        className="w-full max-w-4xl flex flex-col justify-center items-center rounded-lg shadow-2xl p-8 md:p-14 lg:p-20 border-[12px] border-[#3e2723]/10 min-h-[60vh] md:min-h-[70vh] relative overflow-hidden"
        style={{
          boxShadow: "inset 0 0 80px rgba(92, 58, 33, 0.4), inset 0 0 25px rgba(58, 30, 10, 0.5), 0 30px 60px -15px rgba(0,0,0,0.9)",
          ...paperStyle
        }}
      >
        
        {/* Ambient Glowing Magic while thinking */}
        <AnimatePresence>
          {appState === 'THINKING' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.15, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 bg-amber-400 mix-blend-overlay rounded-lg blur-3xl pointer-events-none"
            />
          )}
        </AnimatePresence>

        {/* Center Area (Answers & Vanishing Question) */}
        <div className="absolute inset-0 flex flex-col justify-center items-center pointer-events-none -translate-y-16 md:-translate-y-24 z-10">
          
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
                className="absolute inset-0 flex items-center justify-center text-4xl md:text-5xl font-handwriting leading-relaxed text-center px-4 pointer-events-none"
              >
                {submittedText}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {(appState === 'TYPING' || appState === 'READING') && (
              <motion.div
                key="wizard-answer"
                exit={{ opacity: 0, filter: "blur(8px)", transition: { duration: 2 } }}
                className="absolute inset-0 flex items-center justify-center text-center px-4 translate-y-16 md:translate-y-24"
              >
                <TypingText
                  text={answer}
                  onComplete={() => setAppState('READING')}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Input Area */}
        <div className="w-full relative z-10 -translate-y-16 md:-translate-y-24">
          <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto relative group">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={isInputDisabled}
              placeholder={isInputDisabled ? "" : "Ask a question..."}
              className="w-full bg-transparent border-b border-[#5c3a21]/20 pb-2 text-2xl font-handwriting text-[#1c1917] placeholder:text-[#5c3a21]/40 focus:outline-none focus:border-[#5c3a21]/60 transition-colors disabled:opacity-0"
            />
            
            {!isInputDisabled && (
              <motion.div
                className="absolute bottom-0 left-0 h-[1px] bg-amber-900/40"
                initial={{ width: "0%" }}
                whileInView={{ width: "100%" }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
            )}

            <AnimatePresence>
              {query.trim().length > 0 && !isInputDisabled && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.5, right: "1rem" }}
                  animate={{ opacity: 1, scale: 1, right: "1rem" }}
                  exit={{ opacity: 0, scale: 0.5, right: "1rem" }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className="absolute top-1/2 -translate-y-1/2 text-stone-700 hover:text-amber-900 transition-colors p-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                  </svg>
                </motion.button>
              )}
            </AnimatePresence>
          </form>
        </div>

      </div>
    </div>
  );
}
