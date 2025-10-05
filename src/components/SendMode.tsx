import React, { useState, useRef, useEffect } from 'react'
import { Copy, Send, RefreshCw, CheckCircle, Clock, Upload, FileText, Image } from 'lucide-react'
import { WebRTCManager, WebRTCData } from '../utils/webrtc'
import { serverlessSignaling } from '../utils/serverlessSignaling'

const SendMode: React.FC = () => {
  const [generatedCode, setGeneratedCode] = useState<string>('')
  const [dataToSend, setDataToSend] = useState<string>('')
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'waiting' | 'connected' | 'sent'>('idle')
  const [copied, setCopied] = useState<boolean>(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [transferProgress, setTransferProgress] = useState<number>(0)
  
  const webrtcManagerRef = useRef<WebRTCManager | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    return () => {
      // Cleanup WebRTC connection on unmount
      if (webrtcManagerRef.current) {
        webrtcManagerRef.current.close()
      }
      // Cleanup signaling connection
      if (generatedCode) {
        serverlessSignaling.clearConnection(generatedCode)
      }
    }
  }, [])

  const generateCode = async () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    setGeneratedCode(code)
    setConnectionStatus('waiting')
    
    try {
      // Initialize WebRTC as initiator
      webrtcManagerRef.current = new WebRTCManager({
        onConnectionStateChange: (state) => {
          console.log('Connection state:', state)
          if (state === 'connected') {
            setConnectionStatus('connected')
          } else if (state === 'closed' || state === 'failed') {
            setConnectionStatus('idle')
          }
        },
        onDataReceived: (data) => {
          console.log('Data received:', data)
        },
        onError: (error) => {
          console.error('WebRTC error:', error)
          setConnectionStatus('idle')
        },
        onProgress: (progress) => {
          setTransferProgress(progress)
        }
      })

      await webrtcManagerRef.current.initialize(true)
      
      // Set up ICE candidate handling
      webrtcManagerRef.current.onIceCandidate((candidate) => {
        serverlessSignaling.sendIceCandidate(code, candidate)
      })
      
      const offer = await webrtcManagerRef.current.createOffer()
      
      // Send offer using serverless signaling
      console.log('Sending offer for code:', code)
      await serverlessSignaling.sendOffer(code, offer)
      console.log('Offer sent successfully')
      setConnectionStatus('waiting')
      
      // Start polling for answer
      pollForAnswer(code)
    } catch (error) {
      console.error('Error initializing WebRTC:', error)
      setConnectionStatus('idle')
    }
  }

  const pollForAnswer = async (code: string) => {
    console.log('Starting to poll for answer with code:', code)
    const pollInterval = setInterval(async () => {
      try {
        console.log('Polling for answer...')
        const answer = await serverlessSignaling.getAnswer(code)
        if (answer && webrtcManagerRef.current) {
          console.log('Answer received, setting up connection')
          clearInterval(pollInterval)
          await webrtcManagerRef.current.setAnswer(answer)
          
          // Start polling for ICE candidates
          pollForIceCandidates(code)
          
          setConnectionStatus('connected')
        }
      } catch (error) {
        console.error('Error polling for answer:', error)
        clearInterval(pollInterval)
        setConnectionStatus('idle')
      }
    }, 1000)

    // Stop polling after 2 minutes
    setTimeout(() => {
      clearInterval(pollInterval)
      if (connectionStatus === 'waiting') {
        setConnectionStatus('idle')
      }
    }, 120000)
  }

  const pollForIceCandidates = async (code: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const candidate = await serverlessSignaling.getIceCandidate(code)
        if (candidate && webrtcManagerRef.current) {
          await webrtcManagerRef.current.addIceCandidate(candidate)
        }
      } catch (error) {
        console.error('Error polling for ICE candidates:', error)
        clearInterval(pollInterval)
      }
    }, 1000)

    // Stop polling after 30 seconds
    setTimeout(() => {
      clearInterval(pollInterval)
    }, 30000)
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
    if (!dataToSend.trim() && !selectedFile) {
      alert('Please enter some text or select a file to send!')
      return
    }
    
    if (!generatedCode || !webrtcManagerRef.current) {
      alert('Please generate a code first!')
      return
    }

    if (connectionStatus !== 'connected') {
      alert('Please wait for connection to be established!')
      return
    }
    
    try {
      if (selectedFile) {
        // Send file
        webrtcManagerRef.current.sendFile(selectedFile)
      } else if (dataToSend.trim()) {
        // Send text
        const data: WebRTCData = {
          type: 'text',
          content: dataToSend.trim()
        }
        webrtcManagerRef.current.sendData(data)
      }
      
      setConnectionStatus('sent')
      setTransferProgress(100)
    } catch (error) {
      console.error('Error sending data:', error)
      alert('Failed to send data. Please try again.')
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Check file size (limit to 10MB for demo)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB')
        return
      }
      setSelectedFile(file)
    }
  }

  const clearFile = () => {
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const resetConnection = () => {
    if (webrtcManagerRef.current) {
      webrtcManagerRef.current.close()
    }
    if (generatedCode) {
      serverlessSignaling.clearConnection(generatedCode)
    }
    setGeneratedCode('')
    setDataToSend('')
    setSelectedFile(null)
    setConnectionStatus('idle')
    setCopied(false)
    setTransferProgress(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
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

      {/* File Upload */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Select file to share:
        </label>
        <div className="flex items-center gap-4">
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx,.txt,.zip"
            disabled={!generatedCode}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={!generatedCode}
            className="btn-secondary flex items-center gap-2"
          >
            <Upload size={20} />
            Choose File
          </button>
          {selectedFile && (
            <div className="flex items-center gap-2 text-sm">
              {selectedFile.type.startsWith('image/') ? (
                <Image size={16} className="text-blue-500" />
              ) : (
                <FileText size={16} className="text-gray-500" />
              )}
              <span className="text-gray-700">{selectedFile.name}</span>
              <span className="text-gray-500">({(selectedFile.size / 1024).toFixed(1)} KB)</span>
              <button
                onClick={clearFile}
                className="text-red-500 hover:text-red-700"
              >
                ✕
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Data Input */}
      <div className="mb-6">
        <label htmlFor="data-input" className="block text-sm font-semibold text-gray-700 mb-2">
          Enter text to share:
        </label>
        <textarea
          id="data-input"
          value={dataToSend}
          onChange={(e) => {
            setDataToSend(e.target.value)
          }}
          className="input-field min-h-[120px] resize-none"
          placeholder="Paste your text, link, or any data here..."
          disabled={!generatedCode}
        />
      </div>

      {/* Transfer Progress */}
      {transferProgress > 0 && transferProgress < 100 && (
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Transferring...</span>
            <span>{transferProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${transferProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={sendData}
          disabled={!generatedCode || (!dataToSend.trim() && !selectedFile)}
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
          <li>3. Wait for "Connected" status</li>
          <li>4. Choose a file AND/OR enter text to share</li>
          <li>5. Click "Send Data" to transfer directly</li>
        </ol>
        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-800">
            <strong>🔒 Privacy:</strong> Data transfers directly between devices. No storage, no servers, completely private!
          </p>
        </div>
      </div>
    </div>
  )
}

export default SendMode
