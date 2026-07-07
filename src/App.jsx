import { useState } from 'react'
import { motion } from 'framer-motion'
import WizardDiary from './WizardDiary'
import MinimalQA from './MinimalQA'

function App() {
  // 'diary' or 'minimal'
  const [mode, setMode] = useState('diary')

  return (
    <div className="relative min-h-screen w-full">
      {mode === 'diary' ? <WizardDiary /> : <MinimalQA />}

      {/* Classic Theme Toggle */}
      <div className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-50 flex items-center space-x-3 bg-[#f4ebd8]/70 backdrop-blur-sm px-4 py-2 rounded-full border border-[#5c3a21]/10 shadow-sm opacity-90 hover:opacity-100 transition-opacity">
        <span 
          className="text-xl font-handwriting cursor-pointer transition-colors"
          style={{ color: mode === 'diary' ? '#3e2723' : 'rgba(92, 58, 33, 0.4)' }}
          onClick={() => setMode('diary')}
        >
          Book
        </span>
        
        <button
          onClick={() => setMode(mode === 'diary' ? 'minimal' : 'diary')}
          className="relative w-10 h-4 rounded-full outline-none focus:outline-none flex items-center transition-colors duration-300 mx-1"
          style={{ 
            backgroundColor: mode === 'diary' ? 'rgba(92, 58, 33, 0.3)' : 'rgba(92, 58, 33, 0.3)',
            WebkitTapHighlightColor: 'transparent'
          }}
          aria-label="Toggle UI Mode"
        >
          <motion.div
            className="absolute w-5 h-5 rounded-full shadow border border-black/10"
            style={{ backgroundColor: '#5c3a21' }}
            animate={{ x: mode === 'diary' ? -2 : 22 }}
            transition={{ type: "tween", duration: 0.2, ease: "easeOut" }}
          />
        </button>

        <span 
          className="text-xl font-handwriting cursor-pointer transition-colors"
          style={{ color: mode === 'minimal' ? '#3e2723' : 'rgba(92, 58, 33, 0.4)' }}
          onClick={() => setMode('minimal')}
        >
          Single
        </span>
      </div>
    </div>
  )
}

export default App
