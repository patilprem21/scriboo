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
  private _isInitiator: boolean = false

  constructor(callbacks: WebRTCCallbacks) {
    this.callbacks = callbacks
  }

  async initialize(isInitiator: boolean = false): Promise<void> {
    this._isInitiator = isInitiator
    
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

  async addIceCandidate(candidate: string): Promise<void> {
    if (!this.peerConnection) {
      throw new Error('Peer connection not initialized')
    }

    const candidateObj = JSON.parse(candidate)
    await this.peerConnection.addIceCandidate(candidateObj)
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
}

// Simple signaling server simulation (in real app, you'd use a proper signaling server)
export class SignalingManager {
  private static getStorageKey(code: string): string {
    return `scriboo_signaling_${code}`
  }

  private static getConnections(): Map<string, {
    offer?: string
    answer?: string
    candidates: string[]
  }> {
    const connections = new Map()
    // Load from localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith('scriboo_signaling_')) {
        const code = key.replace('scriboo_signaling_', '')
        try {
          const data = JSON.parse(localStorage.getItem(key) || '{}')
          connections.set(code, data)
        } catch (e) {
          // Ignore invalid data
        }
      }
    }
    return connections
  }

  private static saveConnection(code: string, data: any): void {
    localStorage.setItem(this.getStorageKey(code), JSON.stringify(data))
  }

  static async sendOffer(code: string, offer: string): Promise<void> {
    const data = { offer, candidates: [] }
    this.saveConnection(code, data)
  }

  static async getOffer(code: string): Promise<string | null> {
    const connections = this.getConnections()
    const connection = connections.get(code)
    return connection?.offer || null
  }

  static async sendAnswer(code: string, answer: string): Promise<void> {
    const connections = this.getConnections()
    const connection = connections.get(code)
    if (connection) {
      connection.answer = answer
      this.saveConnection(code, connection)
    }
  }

  static async getAnswer(code: string): Promise<string | null> {
    const connections = this.getConnections()
    const connection = connections.get(code)
    return connection?.answer || null
  }

  static async addCandidate(code: string, candidate: string): Promise<void> {
    const connections = this.getConnections()
    const connection = connections.get(code)
    if (connection) {
      connection.candidates.push(candidate)
      this.saveConnection(code, connection)
    }
  }

  static async getCandidates(code: string): Promise<string[]> {
    const connections = this.getConnections()
    const connection = connections.get(code)
    return connection?.candidates || []
  }

  static clearConnection(code: string): void {
    localStorage.removeItem(this.getStorageKey(code))
  }
}
