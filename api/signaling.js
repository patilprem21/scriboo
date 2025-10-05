// Serverless function for signaling - works better with Vercel
// Store connections in memory (will reset on serverless function restart)
const connections = new Map()

module.exports = (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  // Health check
  if (req.url === '/health') {
    res.status(200).json({ 
      status: 'ok', 
      connections: connections.size,
      timestamp: new Date().toISOString()
    })
    return
  }

  // Get connections (for debugging)
  if (req.url === '/connections') {
    const connectionList = Array.from(connections.entries()).map(([code, conn]) => ({
      code,
      hasOffer: !!conn.offer,
      hasAnswer: !!conn.answer,
      timestamp: conn.timestamp
    }))
    
    res.status(200).json({ connections: connectionList })
    return
  }

  // Handle signaling requests
  if (req.method === 'POST') {
    let body = ''
    req.on('data', chunk => {
      body += chunk.toString()
    })
    
    req.on('end', () => {
      try {
        const data = JSON.parse(body)
        const { action, code, offer, answer, candidate } = data

        switch (action) {
          case 'send-offer':
            connections.set(code, {
              offer,
              timestamp: Date.now()
            })
            res.status(200).json({ success: true, code })
            break

          case 'get-offer':
            const connection = connections.get(code)
            if (connection && connection.offer) {
              res.status(200).json({ success: true, offer: connection.offer })
            } else {
              res.status(404).json({ success: false, message: 'Offer not found' })
            }
            break

          case 'send-answer':
            const conn = connections.get(code)
            if (conn) {
              conn.answer = answer
              res.status(200).json({ success: true, code })
            } else {
              res.status(404).json({ success: false, message: 'Connection not found' })
            }
            break

          case 'get-answer':
            const connectionWithAnswer = connections.get(code)
            if (connectionWithAnswer && connectionWithAnswer.answer) {
              res.status(200).json({ success: true, answer: connectionWithAnswer.answer })
            } else {
              res.status(404).json({ success: false, message: 'Answer not found' })
            }
            break

          case 'send-ice-candidate':
            const connWithCandidate = connections.get(code)
            if (connWithCandidate) {
              if (!connWithCandidate.iceCandidates) {
                connWithCandidate.iceCandidates = []
              }
              connWithCandidate.iceCandidates.push(candidate)
              res.status(200).json({ success: true, code })
            } else {
              res.status(404).json({ success: false, message: 'Connection not found' })
            }
            break

          case 'get-ice-candidate':
            const connectionWithCandidates = connections.get(code)
            if (connectionWithCandidates && connectionWithCandidates.iceCandidates && connectionWithCandidates.iceCandidates.length > 0) {
              const candidate = connectionWithCandidates.iceCandidates.shift() // Get and remove first candidate
              res.status(200).json({ success: true, candidate })
            } else {
              res.status(404).json({ success: false, message: 'No ICE candidates found' })
            }
            break

          case 'clear-connection':
            connections.delete(code)
            res.status(200).json({ success: true, code })
            break

          default:
            res.status(400).json({ success: false, message: 'Invalid action' })
        }
      } catch (error) {
        res.status(400).json({ success: false, message: 'Invalid JSON' })
      }
    })
  } else {
    res.status(405).json({ success: false, message: 'Method not allowed' })
  }
}
