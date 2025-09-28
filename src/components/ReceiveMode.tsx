import React, { useState, useEffect } from 'react'
import { Copy, Download, CheckCircle, AlertCircle, Clock } from 'lucide-react'

interface ConnectionData {
  code: string
  data: string
  status: 'waiting' | 'connected' | 'sent'
}

const ReceiveMode: React.FC = () => {
  const [code, setCode] = useState<string>('')
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connecting' | 'connected' | 'received' | 'error'>('idle')
  const [receivedData, setReceivedData] = useState<string>('')
  const [copied, setCopied] = useState<boolean>(false)
  const [connections, setConnections] = useState<Record<string, ConnectionData>>({})

  const connectToSender = async () => {
    if (code.length !== 6) {
      alert('Please enter a valid 6-digit code!')
      return
    }
    
    setConnectionStatus('connecting')
    
    // Simulate connection check
    setTimeout(() => {
      // In a real app, this would check a server or use WebRTC
      // For demo purposes, we'll simulate finding a connection
      const mockConnection = {
        code,
        data: 'This is sample data from the sender! In a real app, this would be the actual data sent from the other device.',
        status: 'sent' as const
      }
      
      if (Math.random() > 0.3) { // 70% success rate for demo
        setConnections(prev => ({ ...prev, [code]: mockConnection }))
        setReceivedData(mockConnection.data)
        setConnectionStatus('received')
      } else {
        setConnectionStatus('error')
      }
    }, 2000)
  }

  const copyReceivedData = async () => {
    try {
      await navigator.clipboard.writeText(receivedData)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy data:', err)
    }
  }

  const resetConnection = () => {
    setCode('')
    setConnectionStatus('idle')
    setReceivedData('')
    setCopied(false)
  }

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 6)
    setCode(value)
  }

  return (
    <div className="card max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">📥 Receive Data</h2>
        <p className="text-gray-600">Enter the 6-digit code to receive data</p>
      </div>

      {/* Code Input */}
      <div className="mb-8">
        <label htmlFor="code-input" className="block text-sm font-semibold text-gray-700 mb-2">
          Enter 6-digit code:
        </label>
        <input
          id="code-input"
          type="text"
          value={code}
          onChange={handleCodeChange}
          className="input-field text-center text-3xl font-bold tracking-widest"
          placeholder="123456"
          maxLength={6}
        />
      </div>

      {/* Connect Button */}
      <div className="mb-6">
        <button
          onClick={connectToSender}
          disabled={code.length !== 6 || connectionStatus === 'connecting'}
          className="btn-primary flex items-center gap-2 w-full"
        >
          {connectionStatus === 'connecting' ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Connecting...
            </>
          ) : (
            <>
              <Download size={20} />
              Connect & Receive
            </>
          )}
        </button>
      </div>

      {/* Status Messages */}
      {connectionStatus !== 'idle' && (
        <div className="mb-6">
          {connectionStatus === 'connecting' && (
            <div className="status-info flex items-center gap-2">
              <Clock size={20} />
              <span>Connecting to sender...</span>
            </div>
          )}
          {connectionStatus === 'connected' && (
            <div className="status-info flex items-center gap-2">
              <CheckCircle size={20} />
              <span>Connected! Waiting for data...</span>
            </div>
          )}
          {connectionStatus === 'received' && (
            <div className="status-success flex items-center gap-2">
              <CheckCircle size={20} />
              <span>Data received successfully!</span>
            </div>
          )}
          {connectionStatus === 'error' && (
            <div className="status-error flex items-center gap-2">
              <AlertCircle size={20} />
              <span>Code not found. Please check the code and try again.</span>
            </div>
          )}
        </div>
      )}

      {/* Received Data */}
      {receivedData && (
        <div className="mb-6">
          <div className="bg-success-50 border border-success-200 rounded-xl p-6">
            <h3 className="font-semibold text-success-800 mb-3">Received Data:</h3>
            <div className="bg-white rounded-lg p-4 border border-success-200">
              <pre className="whitespace-pre-wrap text-gray-900 font-mono text-sm">
                {receivedData}
              </pre>
            </div>
            <button
              onClick={copyReceivedData}
              className="btn-secondary flex items-center gap-2 mt-4"
            >
              {copied ? <CheckCircle size={20} /> : <Copy size={20} />}
              {copied ? 'Copied!' : 'Copy to Clipboard'}
            </button>
          </div>
        </div>
      )}

      {/* Reset Button */}
      {connectionStatus !== 'idle' && (
        <div className="text-center">
          <button
            onClick={resetConnection}
            className="btn-secondary"
          >
            Start New Connection
          </button>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-8 p-4 bg-gray-50 rounded-xl">
        <h3 className="font-semibold text-gray-900 mb-2">How to use:</h3>
        <ol className="text-sm text-gray-600 space-y-1">
          <li>1. Get the 6-digit code from the sender</li>
          <li>2. Enter the code in the input field above</li>
          <li>3. Click "Connect & Receive"</li>
          <li>4. Wait for the data to appear</li>
          <li>5. Copy the data to your clipboard</li>
        </ol>
      </div>
    </div>
  )
}

export default ReceiveMode
