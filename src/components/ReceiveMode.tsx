import React, { useState, useRef, useEffect } from 'react'
import { Copy, Download, CheckCircle, AlertCircle, Clock, FileText, Image } from 'lucide-react'
import { WebRTCManager, WebRTCData } from '../utils/webrtc'
import { serverlessSignaling } from '../utils/serverlessSignaling'

const ReceiveMode: React.FC = () => {
  const [code, setCode] = useState<string>('')
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connecting' | 'connected' | 'received' | 'error'>('idle')
  const [receivedData, setReceivedData] = useState<WebRTCData | null>(null)
  const [copied, setCopied] = useState<boolean>(false)
  const [transferProgress, setTransferProgress] = useState<number>(0)
  
  const webrtcManagerRef = useRef<WebRTCManager | null>(null)

  useEffect(() => {
    return () => {
      // Cleanup WebRTC connection on unmount
      if (webrtcManagerRef.current) {
        webrtcManagerRef.current.close()
      }
      // Cleanup signaling connection
      if (code) {
        serverlessSignaling.clearConnection(code)
      }
    }
  }, [])

  const connectToSender = async () => {
    if (code.length !== 6) {
      alert('Please enter a valid 6-digit code!')
      return
    }
    
    setConnectionStatus('connecting')
    
    try {
      // Initialize WebRTC as receiver
      webrtcManagerRef.current = new WebRTCManager({
        onConnectionStateChange: (state) => {
          console.log('Connection state:', state)
          if (state === 'connected') {
            setConnectionStatus('connected')
          } else if (state === 'closed' || state === 'failed') {
            setConnectionStatus('error')
          }
        },
        onDataReceived: (data) => {
          console.log('Data received:', data)
          setReceivedData(data)
          setConnectionStatus('received')
          setTransferProgress(100)
        },
        onError: (error) => {
          console.error('WebRTC error:', error)
          setConnectionStatus('error')
        },
        onProgress: (progress) => {
          setTransferProgress(progress)
        }
      })

      await webrtcManagerRef.current.initialize(false)
      
      // Set up ICE candidate handling
      webrtcManagerRef.current.onIceCandidate((candidate) => {
        serverlessSignaling.sendIceCandidate(code, candidate)
      })
      
      // Get offer from signaling server
      console.log('Getting offer for code:', code)
      const offer = await serverlessSignaling.getOffer(code)
      if (!offer) {
        console.log('No offer found for code:', code)
        setConnectionStatus('error')
        return
      }

      console.log('Offer received, creating answer')
      // Create answer
      const answer = await webrtcManagerRef.current.createAnswer(offer)
      console.log('Answer created, sending to signaling server')
      await serverlessSignaling.sendAnswer(code, answer)
      console.log('Answer sent successfully')
      
      // Start polling for ICE candidates
      pollForIceCandidates(code)
      
      setConnectionStatus('connected')
    } catch (error) {
      console.error('Error connecting:', error)
      setConnectionStatus('error')
    }
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

  const copyReceivedData = async () => {
    if (!receivedData) return
    
    try {
      if (receivedData.type === 'text') {
        await navigator.clipboard.writeText(receivedData.content as string)
      } else {
        // For files, copy filename or show message
        await navigator.clipboard.writeText(receivedData.filename || 'File received')
      }
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy data:', err)
    }
  }

  const downloadReceivedFile = () => {
    if (!receivedData || receivedData.type === 'text') return

    try {
      const blob = new Blob([receivedData.content as ArrayBuffer], { 
        type: receivedData.mimeType || 'application/octet-stream' 
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = receivedData.filename || 'received-file'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to download file:', error)
    }
  }

  const resetConnection = () => {
    if (webrtcManagerRef.current) {
      webrtcManagerRef.current.close()
    }
    setCode('')
    setConnectionStatus('idle')
    setReceivedData(null)
    setCopied(false)
    setTransferProgress(0)
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

      {/* Transfer Progress */}
      {transferProgress > 0 && transferProgress < 100 && (
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Receiving data...</span>
            <span>{transferProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-success-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${transferProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Received Data */}
      {receivedData && (
        <div className="mb-6">
          <div className="bg-success-50 border border-success-200 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-3">
              {receivedData.type === 'image' ? (
                <Image size={20} className="text-blue-500" />
              ) : receivedData.type === 'file' ? (
                <FileText size={20} className="text-gray-500" />
              ) : (
                <FileText size={20} className="text-green-500" />
              )}
              <h3 className="font-semibold text-success-800">
                {receivedData.type === 'text' ? 'Received Text:' : 
                 receivedData.type === 'image' ? 'Received Image:' : 'Received File:'}
              </h3>
            </div>
            
            {receivedData.type === 'text' ? (
              <div className="bg-white rounded-lg p-4 border border-success-200">
                <pre className="whitespace-pre-wrap text-gray-900 font-mono text-sm">
                  {receivedData.content as string}
                </pre>
              </div>
            ) : receivedData.type === 'image' ? (
              <div className="bg-white rounded-lg p-4 border border-success-200">
                <img 
                  src={URL.createObjectURL(new Blob([receivedData.content as ArrayBuffer], { type: receivedData.mimeType }))}
                  alt="Received image"
                  className="max-w-full h-auto rounded-lg"
                />
                <p className="text-sm text-gray-600 mt-2">
                  {receivedData.filename} ({(receivedData.size! / 1024).toFixed(1)} KB)
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-lg p-4 border border-success-200">
                <div className="flex items-center gap-2">
                  <FileText size={20} className="text-gray-500" />
                  <div>
                    <p className="font-medium text-gray-900">{receivedData.filename}</p>
                    <p className="text-sm text-gray-600">
                      {(receivedData.size! / 1024).toFixed(1)} KB • {receivedData.mimeType}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex gap-2 mt-4">
              {receivedData.type === 'text' ? (
                <button
                  onClick={copyReceivedData}
                  className="btn-secondary flex items-center gap-2"
                >
                  {copied ? <CheckCircle size={20} /> : <Copy size={20} />}
                  {copied ? 'Copied!' : 'Copy Text'}
                </button>
              ) : (
                <>
                  <button
                    onClick={downloadReceivedFile}
                    className="btn-primary flex items-center gap-2"
                  >
                    <Download size={20} />
                    Download File
                  </button>
                  <button
                    onClick={copyReceivedData}
                    className="btn-secondary flex items-center gap-2"
                  >
                    {copied ? <CheckCircle size={20} /> : <Copy size={20} />}
                    {copied ? 'Copied!' : 'Copy Name'}
                  </button>
                </>
              )}
            </div>
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
          <li>4. Wait for "Connected" status</li>
          <li>5. Data will appear automatically when sent</li>
          <li>6. Copy text or download files</li>
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

export default ReceiveMode
