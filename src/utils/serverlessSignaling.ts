// Serverless function based signaling - works with Vercel
export class ServerlessSignaling {
  private static baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://scriboo.vercel.app'  // Your actual Vercel URL
    : 'http://localhost:3000'

  private static async makeRequest(action: string, data: any): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/signaling`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action,
          ...data
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Signaling request failed:', error)
      throw error
    }
  }

  static async sendOffer(code: string, offer: string): Promise<void> {
    const result = await this.makeRequest('send-offer', { code, offer })
    if (!result.success) {
      throw new Error('Failed to send offer')
    }
  }

  static async getOffer(code: string): Promise<string | null> {
    try {
      const result = await this.makeRequest('get-offer', { code })
      return result.success ? result.offer : null
    } catch (error) {
      return null
    }
  }

  static async sendAnswer(code: string, answer: string): Promise<void> {
    const result = await this.makeRequest('send-answer', { code, answer })
    if (!result.success) {
      throw new Error('Failed to send answer')
    }
  }

  static async getAnswer(code: string): Promise<string | null> {
    try {
      const result = await this.makeRequest('get-answer', { code })
      return result.success ? result.answer : null
    } catch (error) {
      return null
    }
  }

  static async clearConnection(code: string): Promise<void> {
    try {
      await this.makeRequest('clear-connection', { code })
    } catch (error) {
      console.error('Failed to clear connection:', error)
    }
  }
}

// Export the class directly since all methods are static
export const serverlessSignaling = ServerlessSignaling
