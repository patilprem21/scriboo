import { io, Socket } from 'socket.io-client'

// Socket.IO based signaling server with proper offer/answer handling
export class SocketSignaling {
  private socket: Socket | null = null
  private baseUrl: string

  constructor() {
    this.baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://scriboo.vercel.app'  // Your actual Vercel URL
      : 'http://localhost:3001'
  }

  private getSocket(): Socket {
    if (!this.socket) {
      this.socket = io(this.baseUrl, {
        transports: ['websocket', 'polling'],
        timeout: 10000,
        forceNew: true
      })

      this.socket.on('connect', () => {
        console.log('Connected to signaling server')
      })

      this.socket.on('disconnect', () => {
        console.log('Disconnected from signaling server')
      })

      this.socket.on('error', (error) => {
        console.error('Socket.IO error:', error)
      })
    }
    return this.socket
  }

  // For sender: send offer and wait for answer
  async sendOfferAndWaitForAnswer(code: string, offer: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const socket = this.getSocket()
      
      const timeout = setTimeout(() => {
        reject(new Error('Timeout waiting for answer'))
      }, 60000) // Wait up to 60 seconds for answer

      // Send the offer
      socket.emit('send-offer', { code, offer })
      
      // Wait for answer
      socket.once('answer-received', (data) => {
        clearTimeout(timeout)
        if (data.code === code) {
          resolve(data.answer)
        } else {
          reject(new Error('Invalid answer received'))
        }
      })

      socket.once('offer-sent', (data) => {
        if (!data.success) {
          clearTimeout(timeout)
          reject(new Error('Failed to send offer'))
        }
      })
    })
  }

  // For receiver: wait for offer and send answer
  async waitForOfferAndSendAnswer(code: string, createAnswerCallback: (offer: string) => Promise<string>): Promise<void> {
    return new Promise((resolve, reject) => {
      const socket = this.getSocket()
      
      const timeout = setTimeout(() => {
        reject(new Error('Timeout waiting for offer'))
      }, 60000) // Wait up to 60 seconds for offer

      // Listen for offer
      socket.once('offer-received', async (data) => {
        clearTimeout(timeout)
        if (data.code === code) {
          try {
            // Create answer using the callback
            const answer = await createAnswerCallback(data.offer)
            
            // Send answer
            socket.emit('send-answer', { code, answer })
            
            socket.once('answer-sent', (response) => {
              if (response.success) {
                resolve()
              } else {
                reject(new Error('Failed to send answer'))
              }
            })
          } catch (error) {
            reject(error)
          }
        } else {
          reject(new Error('Invalid offer received'))
        }
      })

      // Notify server that we're waiting for an offer with this code
      socket.emit('wait-for-offer', { code })
    })
  }

  // Send ICE candidate
  sendIceCandidate(code: string, candidate: string, isSender: boolean): void {
    const socket = this.getSocket()
    socket.emit('send-ice-candidate', { code, candidate, isSender })
  }

  // Listen for ICE candidates
  onIceCandidate(callback: (candidate: string) => void): void {
    const socket = this.getSocket()
    socket.on('ice-candidate-received', (data) => {
      callback(data.candidate)
    })
  }

  // Clear connection
  async clearConnection(code: string): Promise<void> {
    return new Promise((resolve) => {
      const socket = this.getSocket()
      socket.emit('clear-connection', { code })
      socket.once('connection-cleared', () => {
        resolve()
      })
      
      // Resolve after timeout even if no response
      setTimeout(() => resolve(), 1000)
    })
  }

  // Disconnect
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }
}

// Export singleton instance
export const socketSignaling = new SocketSignaling()
