import React, { useState } from 'react'
import { ArrowLeft, Send, Download } from 'lucide-react'
import SendMode from '../components/SendMode'
import ReceiveMode from '../components/ReceiveMode'

interface AppPageProps {
  onBackToHome: () => void
}

type Mode = 'send' | 'receive'

const AppPage: React.FC<AppPageProps> = ({ onBackToHome }) => {
  const [mode, setMode] = useState<Mode>('send')

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onBackToHome}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft size={20} />
                <span>Back to Home</span>
              </button>
              
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">S</span>
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">Scribo</h1>
                  <p className="text-xs text-gray-500">Cross-Device Sharing</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-500">Secure</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        {/* Mode Selector */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setMode('send')}
              className={`flex items-center gap-2 px-6 py-3 rounded-md font-medium transition-colors duration-200 ${
                mode === 'send'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Send size={20} />
              Send Data
            </button>
            <button
              onClick={() => setMode('receive')}
              className={`flex items-center gap-2 px-6 py-3 rounded-md font-medium transition-colors duration-200 ${
                mode === 'receive'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Download size={20} />
              Receive Data
            </button>
          </div>
        </div>

        {/* Main App Interface */}
        <div className="max-w-4xl mx-auto">
          {mode === 'send' ? <SendMode /> : <ReceiveMode />}
        </div>
      </main>
    </div>
  )
}

export default AppPage
