import { io, Socket } from 'socket.io-client'

// Socket.IO based signaling server
export class SignalingServer {
  private static socket: Socket | null = null
  private static baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://scriboo.vercel.app'  // Your actual Vercel URL
    : 'http://localhost:3001'

  private static getSocket(): Socket {
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

      this.socket.on('error', (error: any) => {

        
        console.error('Socket.IO error:', error)
      })
    }
    return this.socket
  }

  static async sendOffer(code: string, offer: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const socket = this.getSocket()
      
      const timeout = setTimeout(() => {
        reject(new Error('Timeout sending offer'))
      }, 10000)

      socket.emit('send-offer', { code, offer })
      
      socket.once('offer-sent', (data: any) => {
        clearTimeout(timeout)
        if (data.success) {
          resolve()
        } else {
          reject(new Error('Failed to send offer'))
        }
      })
    })
  }

  static async getOffer(_code: string): Promise<string | null> {
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        resolve(null) // Return null if no offer found
      }, 5000)

      // Listen for answer-received event (this means there's an offer waiting)
      const checkForOffer = () => {
        // For receiver, we need to check if there's an offer available
        // We'll use a different approach - the receiver will connect and wait
        // The sender will send the offer when receiver connects
        clearTimeout(timeout)
        resolve(null) // This will be handled differently in the receiver component
      }

      setTimeout(checkForOffer, 1000)
    })
  }

  static async sendAnswer(code: string, answer: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const socket = this.getSocket()
      
      const timeout = setTimeout(() => {
        reject(new Error('Timeout sending answer'))
      }, 10000)

      socket.emit('send-answer', { code, answer })
      
      socket.once('answer-sent', (data: any) => {
        clearTimeout(timeout)
        if (data.success) {
          resolve()
        } else {
          reject(new Error('Failed to send answer'))
        }
      })
    })
  }

  static async getAnswer(code: string): Promise<string | null> {
    return new Promise((resolve) => {
      const socket = this.getSocket()
      
      const timeout = setTimeout(() => {
        resolve(null) // Return null if no answer found
      }, 30000) // Wait up to 30 seconds for answer

      socket.once('answer-received', (data: any) => {
        clearTimeout(timeout)
        if (data.code === code) {
          resolve(data.answer)
        } else {
          resolve(null)
        }
      })
    })
  }

  static async clearConnection(code: string): Promise<void> {
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

  static disconnect(): void {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }
}
