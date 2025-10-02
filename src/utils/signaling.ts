// Simple signaling server using a completely free service
export class SignalingServer {
  private static baseUrl = 'https://httpbin.org'

  static async sendOffer(code: string, offer: string): Promise<void> {
    try {
      // Store offer using httpbin (completely free)
      const response = await fetch(`${this.baseUrl}/post`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          code,
          offer,
          timestamp: Date.now()
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to send offer')
      }
    } catch (error) {
      console.error('Error sending offer:', error)
      throw error
    }
  }

  static async getOffer(code: string): Promise<string | null> {
    try {
      // For demo purposes, we'll use a simple approach
      // In a real app, you'd use a proper signaling server
      const response = await fetch(`${this.baseUrl}/get?code=${code}`)
      
      if (response.ok) {
        const data = await response.json()
        return data.args?.offer || null
      }
      return null
    } catch (error) {
      console.error('Error getting offer:', error)
      return null
    }
  }

  static async sendAnswer(code: string, answer: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/post`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          code,
          answer,
          timestamp: Date.now()
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to send answer')
      }
    } catch (error) {
      console.error('Error sending answer:', error)
      throw error
    }
  }

  static async getAnswer(code: string): Promise<string | null> {
    try {
      const response = await fetch(`${this.baseUrl}/get?code=${code}`)
      
      if (response.ok) {
        const data = await response.json()
        return data.args?.answer || null
      }
      return null
    } catch (error) {
      console.error('Error getting answer:', error)
      return null
    }
  }

  static async clearConnection(code: string): Promise<void> {
    // No-op for this simple implementation
    console.log('Clearing connection for code:', code)
  }
}
