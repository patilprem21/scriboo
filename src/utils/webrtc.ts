export interface WebRTCData {
  type: 'text' | 'file' | 'image'
  content: string | ArrayBuffer
  filename?: string
  mimeType?: string
  size?: number
}

export interface WebRTCCallbacks {
  onConnectionStateChange: (state: string) => void
  onDataReceived: (data: WebRTCData) => void
  onError: (error: string) => void
  onProgress?: (progress: number) => void
}

export class WebRTCManager {
  private peerConnection: RTCPeerConnection | null = null
  private dataChannel: RTCDataChannel | null = null
  private callbacks: WebRTCCallbacks
  // private _isInitiator: boolean = false

  constructor(callbacks: WebRTCCallbacks) {
    this.callbacks = callbacks
  }

  async initialize(isInitiator: boolean = false): Promise<void> {
    // this._isInitiator = isInitiator
    
    // Create peer connection with STUN servers
    this.peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' }
      ]
    })

    // Handle connection state changes
    this.peerConnection.onconnectionstatechange = () => {
      if (this.peerConnection) {
        this.callbacks.onConnectionStateChange(this.peerConnection.connectionState)
      }
    }

    // Handle ICE connection state changes
    this.peerConnection.oniceconnectionstatechange = () => {
      if (this.peerConnection) {
        console.log('ICE connection state:', this.peerConnection.iceConnectionState)
      }
    }

    // Handle ICE candidates
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('ICE candidate generated:', event.candidate)
        // ICE candidates will be handled by the signaling layer
      }
    }

    if (isInitiator) {
      // Create data channel for sending data
      this.dataChannel = this.peerConnection.createDataChannel('data', {
        ordered: true
      })
      this.setupDataChannel(this.dataChannel)
    } else {
      // Listen for incoming data channel
      this.peerConnection.ondatachannel = (event) => {
        this.dataChannel = event.channel
        this.setupDataChannel(this.dataChannel)
      }
    }
  }

  private setupDataChannel(channel: RTCDataChannel): void {
    channel.onopen = () => {
      console.log('Data channel opened')
      this.callbacks.onConnectionStateChange('connected')
    }

    channel.onclose = () => {
      console.log('Data channel closed')
      this.callbacks.onConnectionStateChange('closed')
    }

    channel.onerror = (error) => {
      console.error('Data channel error:', error)
      this.callbacks.onError('Data channel error')
    }

    channel.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        this.callbacks.onDataReceived(data)
      } catch (error) {
        console.error('Error parsing received data:', error)
        this.callbacks.onError('Invalid data received')
      }
    }
  }

  async createOffer(): Promise<string> {
    if (!this.peerConnection) {
      throw new Error('Peer connection not initialized')
    }

    const offer = await this.peerConnection.createOffer()
    await this.peerConnection.setLocalDescription(offer)
    
    return JSON.stringify(offer)
  }

  async createAnswer(offer: string): Promise<string> {
    if (!this.peerConnection) {
      throw new Error('Peer connection not initialized')
    }

    const offerObj = JSON.parse(offer)
    await this.peerConnection.setRemoteDescription(offerObj)
    
    const answer = await this.peerConnection.createAnswer()
    await this.peerConnection.setLocalDescription(answer)
    
    return JSON.stringify(answer)
  }

  async setAnswer(answer: string): Promise<void> {
    if (!this.peerConnection) {
      throw new Error('Peer connection not initialized')
    }

    const answerObj = JSON.parse(answer)
    await this.peerConnection.setRemoteDescription(answerObj)
  }


  sendData(data: WebRTCData): void {
    if (!this.dataChannel || this.dataChannel.readyState !== 'open') {
      this.callbacks.onError('Data channel not ready')
      return
    }

    try {
      this.dataChannel.send(JSON.stringify(data))
    } catch (error) {
      console.error('Error sending data:', error)
      this.callbacks.onError('Failed to send data')
    }
  }

  sendFile(file: File): void {
    if (!this.dataChannel || this.dataChannel.readyState !== 'open') {
      this.callbacks.onError('Data channel not ready')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const data: WebRTCData = {
        type: file.type.startsWith('image/') ? 'image' : 'file',
        content: reader.result as ArrayBuffer,
        filename: file.name,
        mimeType: file.type,
        size: file.size
      }
      this.sendData(data)
    }
    reader.onerror = () => {
      this.callbacks.onError('Failed to read file')
    }
    reader.readAsArrayBuffer(file)
  }

  close(): void {
    if (this.dataChannel) {
      this.dataChannel.close()
    }
    if (this.peerConnection) {
      this.peerConnection.close()
    }
  }

  getConnectionState(): string {
    return this.peerConnection?.connectionState || 'disconnected'
  }

  // Add ICE candidate
  async addIceCandidate(candidate: RTCIceCandidateInit): Promise<void> {
    if (!this.peerConnection) {
      throw new Error('Peer connection not initialized')
    }
    await this.peerConnection.addIceCandidate(candidate)
  }

  // Get ICE candidates (for signaling)
  onIceCandidate(callback: (candidate: RTCIceCandidateInit) => void): void {
    if (this.peerConnection) {
      this.peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          callback(event.candidate)
        }
      }
    }
  }
}

// Use the new ServerlessSignaling for cross-device communication
export { ServerlessSignaling as SignalingManager } from './serverlessSignaling'
