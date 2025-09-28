import React, { useState } from 'react'
import { Copy, Send, RefreshCw, CheckCircle, Clock } from 'lucide-react'

interface ConnectionData {
  code: string
  data: string
  status: 'waiting' | 'connected' | 'sent'
}

const SendMode: React.FC = () => {
  const [generatedCode, setGeneratedCode] = useState<string>('')
  const [dataToSend, setDataToSend] = useState<string>('')
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'waiting' | 'connected' | 'sent'>('idle')
  const [copied, setCopied] = useState<boolean>(false)
  const [, setConnections] = useState<Record<string, ConnectionData>>({})

  const generateCode = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    setGeneratedCode(code)
    setConnectionStatus('waiting')
    
    // Initialize connection
    setConnections(prev => ({
      ...prev,
      [code]: {
        code,
        data: '',
        status: 'waiting'
      }
    }))
  }

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(generatedCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy code:', err)
    }
  }

  const sendData = () => {
    if (!dataToSend.trim()) {
      alert('Please enter some text or link to send!')
      return
    }
    
    if (!generatedCode) {
      alert('Please generate a code first!')
      return
    }
    
    setConnections(prev => ({
      ...prev,
      [generatedCode]: {
        ...prev[generatedCode],
        data: dataToSend,
        status: 'sent'
      }
    }))
    
    setConnectionStatus('sent')
  }

  const resetConnection = () => {
    setGeneratedCode('')
    setDataToSend('')
    setConnectionStatus('idle')
    setCopied(false)
  }

  return (
    <div className="card max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">📤 Send Data</h2>
        <p className="text-gray-600">Generate a code and share your data instantly</p>
      </div>

      {/* Code Generation */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-2xl p-8 text-center">
          <div className="text-6xl font-bold text-primary-600 mb-4 tracking-widest">
            {generatedCode || '------'}
          </div>
          
          {generatedCode && (
            <button
              onClick={copyCode}
              className="btn-secondary flex items-center gap-2 mx-auto mb-4"
            >
              {copied ? <CheckCircle size={20} /> : <Copy size={20} />}
              {copied ? 'Copied!' : 'Copy Code'}
            </button>
          )}
          
          <button
            onClick={generateCode}
            className="btn-primary flex items-center gap-2 mx-auto"
          >
            <RefreshCw size={20} />
            {generatedCode ? 'Generate New Code' : 'Generate Code'}
          </button>
        </div>
      </div>

      {/* Status */}
      {connectionStatus !== 'idle' && (
        <div className="mb-6">
          {connectionStatus === 'waiting' && (
            <div className="status-warning flex items-center gap-2">
              <Clock size={20} />
              <span>Waiting for connection... Share the code with the receiving device.</span>
            </div>
          )}
          {connectionStatus === 'connected' && (
            <div className="status-info flex items-center gap-2">
              <CheckCircle size={20} />
              <span>Device connected! Ready to send data.</span>
            </div>
          )}
          {connectionStatus === 'sent' && (
            <div className="status-success flex items-center gap-2">
              <CheckCircle size={20} />
              <span>Data sent successfully!</span>
            </div>
          )}
        </div>
      )}

      {/* Data Input */}
      <div className="mb-6">
        <label htmlFor="data-input" className="block text-sm font-semibold text-gray-700 mb-2">
          Enter text or link to share:
        </label>
        <textarea
          id="data-input"
          value={dataToSend}
          onChange={(e) => setDataToSend(e.target.value)}
          className="input-field min-h-[120px] resize-none"
          placeholder="Paste your text, link, or any data here..."
          disabled={!generatedCode}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={sendData}
          disabled={!generatedCode || !dataToSend.trim()}
          className="btn-primary flex items-center gap-2 flex-1"
        >
          <Send size={20} />
          Send Data
        </button>
        
        {generatedCode && (
          <button
            onClick={resetConnection}
            className="btn-secondary px-6"
          >
            Reset
          </button>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-8 p-4 bg-gray-50 rounded-xl">
        <h3 className="font-semibold text-gray-900 mb-2">How to use:</h3>
        <ol className="text-sm text-gray-600 space-y-1">
          <li>1. Click "Generate Code" to create a 6-digit code</li>
          <li>2. Share this code with the receiving device</li>
          <li>3. Enter your text or link in the text area</li>
          <li>4. Click "Send Data" when ready</li>
        </ol>
      </div>
    </div>
  )
}

export default SendMode
