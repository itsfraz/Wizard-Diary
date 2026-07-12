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
      transition: { staggerChildren: 0.05, delayChildren: 0.2 },
    },
  };

  const child = {
    visible: { 
      opacity: 1, 
      y: 0, 
      filter: "blur(0.3px)",
      color: "#1a1c29"
    },
    hidden: { 
      opacity: 0, 
      y: 2, 
      filter: "blur(8px)",
      color: "#4a3219" // slightly brownish/watery ink color before drying
    },
  };

  return (
    <>
      {/* Ink Bleed SVG Filter */}
      <svg width="0" height="0" className="absolute pointer-events-none">
        <filter id="wet-ink">
          <feTurbulence type="fractalNoise" baseFrequency="0.15" numOctaves="3" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" xChannelSelector="R" yChannelSelector="G" result="displaced" />
          <feColorMatrix in="displaced" type="matrix" values="
            1 0 0 0 0
            0 1 0 0 0
            0 0 1 0 0
            0 0 0 3 -0.5
          " />
        </filter>
      </svg>
      
      <motion.div
        variants={container}
        initial="hidden"
        animate="visible"
        onAnimationComplete={onComplete}
        className="text-xl md:text-2xl lg:text-3xl font-handwriting leading-relaxed whitespace-pre-wrap w-full"
        style={{ filter: "url(#wet-ink)" }}
      >
        {characters.map((char, index) => (
          <motion.span 
            variants={child} 
            key={index} 
            className="inline-block"
            transition={{ duration: 0.8, ease: "easeOut" }} // Slower fade for ink to dry
          >
            {char === ' ' ? '\u00A0' : char}
          </motion.span>
        ))}
      </motion.div>
    </>
  );
};

const ParticleBurst = ({ isActive }) => {
  if (!isActive) return null;
  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 pointer-events-none">
      {[...Array(30)].map((_, i) => {
        const angle = (Math.PI * 2 * i) / 30 + Math.random() * 0.5;
        const velocity = 150 + Math.random() * 200;
        return (
          <motion.div
            key={i}
            initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
            animate={{ 
              x: Math.cos(angle) * velocity, 
              y: Math.sin(angle) * velocity, 
              opacity: 0, 
              scale: Math.random() * 2 + 1 
            }}
            transition={{ duration: 1 + Math.random() * 0.8, ease: "easeOut" }}
            className="absolute w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_15px_#fbbf24]"
          />
        );
      })}
    </div>
  );
};

const BookCover = ({ state, onClick }) => {
  const isClosed = state === 'CLOSED';
  const isOpening = state === 'OPENING';
  const isOpen = state === 'OPEN';

  if (isOpen) return null;

  return (
    <div 
      className={`absolute top-0 right-0 h-full z-50 origin-left transition-all duration-[1200ms] ease-in-out cursor-pointer ${
        isClosed ? 'w-full' : 'w-full md:w-1/2'
      }`}
      style={{
        transform: isOpening ? 'rotateY(-160deg)' : 'rotateY(0deg)',
        transformStyle: 'preserve-3d',
        perspective: '2000px'
      }}
      onClick={isClosed ? onClick : undefined}
    >
      {/* Front Face of Cover */}
      <div 
        className="absolute inset-0 backface-hidden transition-opacity duration-700 ease-in rounded-xl md:rounded-l-none md:rounded-r-xl"
        style={{ 
          opacity: isOpening ? 0 : 1,
          transitionDelay: isOpening ? '300ms' : '0ms',
          backgroundColor: '#3e2723',
          backgroundImage: `
            radial-gradient(circle at center, transparent 30%, rgba(0,0,0,0.8) 150%),
            url("data:image/svg+xml,%3Csvg width='400' height='400' viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.02' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='matrix' values='1 0 0 0 0, 0 0.8 0 0 0, 0 0.5 0 0 0, 0 0 0 0.15 0' /%3E%3C/filter%3E%3Crect width='400' height='400' filter='url(%23noise)'/%3E%3C/svg%3E")
          `,
          boxShadow: 'inset 4px 0 20px rgba(0,0,0,0.5), inset -10px 0 30px rgba(0,0,0,0.9), 10px 10px 30px rgba(0,0,0,0.8)'
        }}
      >
        {/* Brass Corners */}
        <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-amber-600 rounded-tl-xl opacity-80 mix-blend-screen shadow-[inset_2px_2px_5px_rgba(255,255,255,0.2)]"></div>
        <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-amber-600 rounded-tr-xl opacity-80 mix-blend-screen shadow-[inset_-2px_2px_5px_rgba(255,255,255,0.2)]"></div>
        <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-amber-600 rounded-bl-xl opacity-80 mix-blend-screen shadow-[inset_2px_-2px_5px_rgba(255,255,255,0.2)]"></div>
        <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-amber-600 rounded-br-xl opacity-80 mix-blend-screen shadow-[inset_-2px_-2px_5px_rgba(255,255,255,0.2)]"></div>

        {/* Engraving / Crest */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 pointer-events-none">
          <motion.div 
            whileHover={{ scale: 1.05, filter: "drop-shadow(0 0 30px rgba(251, 191, 36, 1))" }}
            className="relative w-48 h-48 md:w-64 md:h-64 rounded-full border-2 border-amber-500/40 flex items-center justify-center mb-10 transition-all duration-300 pointer-events-auto"
            style={{ boxShadow: 'inset 0 0 40px rgba(251, 191, 36, 0.2)' }}
          >
            {/* Geometric Magic Circle */}
            <div className="absolute inset-3 rounded-full border border-amber-500/40 rotate-45"></div>
            <div className="absolute inset-6 rounded-full border-2 border-dashed border-amber-500/20 animate-[spin_60s_linear_infinite]"></div>
            <svg width="120" height="120" viewBox="0 0 100 100" className="text-amber-500/80 drop-shadow-[0_0_12px_rgba(251,191,36,0.8)]">
              <polygon points="50,5 95,95 5,95" fill="none" stroke="currentColor" strokeWidth="1" />
              <polygon points="50,95 95,5 5,5" fill="none" stroke="currentColor" strokeWidth="1" />
              <circle cx="50" cy="50" r="25" fill="none" stroke="currentColor" strokeWidth="2" />
              <circle cx="50" cy="50" r="5" fill="currentColor" />
            </svg>
          </motion.div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-tome text-amber-500/90 text-center tracking-widest leading-tight" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.9), 0 0 20px rgba(251,191,36,0.5)' }}>
            GRIMOIRE
          </h1>
          <h2 className="text-lg md:text-xl font-tome text-amber-500/60 mt-4 tracking-[0.4em] text-center">
            OF INFINITE KNOWLEDGE
          </h2>

          <motion.div 
            animate={{ opacity: [0.2, 0.9, 0.2] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-12 md:bottom-20 text-amber-500/90 font-handwriting text-2xl md:text-3xl drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]"
          >
            Click the cover to unleash its secrets...
          </motion.div>
        </div>

        {/* Latch */}
        <motion.div 
          whileHover={{ rotate: [-2, 2, -2, 0] }}
          className="absolute right-0 top-1/2 -translate-y-1/2 w-10 md:w-12 h-32 md:h-40 bg-gradient-to-r from-amber-700 via-amber-400 to-amber-800 rounded-l-lg shadow-[-5px_0_20px_rgba(0,0,0,1)] border border-amber-900 flex items-center justify-center cursor-pointer pointer-events-auto z-10"
        >
          <div className="w-5 h-5 rounded-full bg-amber-950 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.8)] border border-amber-700"></div>
        </motion.div>
      </div>

      {/* Back Face of Cover */}
      <div 
        className="absolute inset-0 bg-[#2d1b15] backface-hidden rounded-r-xl md:rounded-none md:rounded-l-xl border-l-8 border-[#1a0f0c]"
        style={{ 
          transform: 'rotateY(180deg)',
          boxShadow: 'inset -20px 0 50px rgba(0,0,0,0.9)',
          opacity: isOpening ? 1 : 0,
          transition: 'opacity 0.6s ease-in'
        }}
      >
        {/* Subtle inner page texture on the back of the cover */}
        <div className="absolute inset-2 md:inset-4 border border-[#4a2f25] opacity-20 bg-[#eaddc5]/5"></div>
      </div>
    </div>
  );
};

export default function WizardDiary() {
  // Book States: CLOSED -> OPENING -> OPEN
  const [bookCoverState, setBookCoverState] = useState('CLOSED');
  
  // App States: IDLE -> WRITTEN -> VANISHING -> THINKING -> TYPING -> READING -> DONE
  const [appState, setAppState] = useState('IDLE');
  const [inputText, setInputText] = useState('');
  const [submittedText, setSubmittedText] = useState('');
  const [wizardResponse, setWizardResponse] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    let timer;
    if (appState === 'READING') {
      timer = setTimeout(() => {
        setAppState('DONE');
      }, 7000);
    }
    return () => clearTimeout(timer);
  }, [appState]);

  const handleOpenBook = () => {
    if (bookCoverState !== 'CLOSED') return;
    setBookCoverState('OPENING');
    setTimeout(() => {
      setBookCoverState('OPEN');
    }, 1200);
  };

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
  const isClosed = bookCoverState === 'CLOSED';
  const isOpening = bookCoverState === 'OPENING';
  const isOpen = bookCoverState === 'OPEN';

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

  const containerClasses = `relative w-[92vw] max-h-[90vh] rounded-xl shadow-[0_40px_100px_rgba(0,0,0,1)] overflow-hidden flex flex-col md:flex-row z-10 mx-auto transition-all duration-[1200ms] ease-in-out ${
    isClosed 
      ? 'max-w-[450px] md:max-w-[500px] aspect-[10/14] md:aspect-[3/4]' 
      : 'max-w-[450px] md:max-w-[1000px] lg:max-w-[1200px] aspect-[10/14] md:aspect-[16/10] md:w-[90vw]'
  }`;

  return (
    <div className="min-h-screen w-full bg-neutral-950 flex items-center justify-center p-2 sm:p-4 md:p-8 selection:bg-amber-900/30 overflow-hidden relative" style={{ perspective: '2000px' }}>
      <style>{`
        @import url('${fontUrl}');
        .font-handwriting { font-family: 'Caveat', cursive; }
        .font-tome { font-family: 'Cinzel', serif; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(92, 58, 33, 0.2); border-radius: 4px; }
        .backface-hidden { backface-visibility: hidden; -webkit-backface-visibility: hidden; }
      `}</style>

      {/* Magical ambient background glow */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-900/10 via-transparent to-transparent opacity-50 pointer-events-none blur-3xl transition-opacity duration-1000 ${isOpen ? 'opacity-80' : 'opacity-40'}`}></div>

      {/* Main Container */}
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className={containerClasses}
        style={{
          boxShadow: "inset 0 0 100px rgba(92, 58, 33, 0.5), inset 0 0 30px rgba(58, 30, 10, 0.6), 0 40px 80px -20px rgba(0,0,0,1)",
          ...paperStyle
        }}
      >
        <BookCover state={bookCoverState} onClick={handleOpenBook} />
        <ParticleBurst isActive={isOpening} />

        {/* Decorative Leather Binding Edges (Under Cover) */}
        <div className="absolute inset-0 border-[12px] md:border-[16px] border-[#3e2723]/10 pointer-events-none rounded-xl z-20" />

        {/* Spine Shadow (Desktop - Vertical) */}
        <div className={`hidden md:block absolute top-0 bottom-0 left-1/2 w-16 -ml-8 bg-gradient-to-r from-transparent via-[#5c3a21]/40 to-transparent pointer-events-none z-10 mix-blend-multiply transition-opacity duration-1000 ${isClosed ? 'opacity-0' : 'opacity-100'}`} />
        <div className={`hidden md:block absolute top-0 bottom-0 left-1/2 w-[2px] bg-[#3e2723]/30 pointer-events-none z-10 transition-opacity duration-1000 ${isClosed ? 'opacity-0' : 'opacity-100'}`} />

        {/* Spine Shadow (Mobile - Horizontal) */}
        <div className={`md:hidden absolute left-0 right-0 top-1/2 h-16 -mt-8 bg-gradient-to-b from-transparent via-[#5c3a21]/40 to-transparent pointer-events-none z-10 mix-blend-multiply transition-opacity duration-1000 ${isClosed ? 'opacity-0' : 'opacity-100'}`} />
        <div className={`md:hidden absolute left-0 right-0 top-1/2 h-[2px] bg-[#3e2723]/30 pointer-events-none z-10 transition-opacity duration-1000 ${isClosed ? 'opacity-0' : 'opacity-100'}`} />

        {/* Top-Right Clear Button */}
        <AnimatePresence>
          {appState === 'DONE' && isOpen && (
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
        <div className={`w-full h-1/2 md:w-1/2 md:h-full relative p-6 sm:p-10 md:p-14 lg:p-20 flex flex-col justify-center overflow-hidden transition-opacity duration-1000 delay-300 ${isClosed ? 'opacity-0' : 'opacity-100'}`}>
          {/* Ambient Glowing Magic while thinking */}
          <AnimatePresence>
            {appState === 'THINKING' && isOpen && (
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
              {(appState === 'TYPING' || appState === 'READING') && isOpen && (
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
        <div className={`w-full h-1/2 md:w-1/2 md:h-full relative p-6 sm:p-10 md:p-14 lg:p-20 flex flex-col justify-center items-center overflow-hidden transition-opacity duration-1000 delay-300 ${isClosed ? 'opacity-0' : 'opacity-100'}`}>
          {/* Render User's Submitted Text */}
          <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-6 sm:px-10 md:px-14 lg:px-20 pointer-events-none -translate-y-8 md:-translate-y-16">
            <AnimatePresence>
              {(appState === 'WRITTEN' || appState === 'VANISHING') && isOpen && (
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
                disabled={isInputDisabled || !isOpen}
                placeholder={isInputDisabled || !isOpen ? "" : "Cast your inquiry into the pages..."}
                className="w-full bg-transparent border-b border-[#5c3a21]/20 pb-2 text-lg sm:text-xl md:text-2xl font-handwriting text-[#1c1917] placeholder:text-[#5c3a21]/40 focus:outline-none focus:border-[#5c3a21]/60 transition-colors disabled:opacity-0"
              />
              {!isInputDisabled && isOpen && (
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


