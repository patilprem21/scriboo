const express = require('express')
const { createServer } = require('http')
const { Server } = require('socket.io')
const cors = require('cors')

const app = express()
const server = createServer(app)

// Enable CORS for all origins
app.use(cors({
  origin: "*",
  methods: ["GET", "POST"]
}))

// Create Socket.IO server
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
})

// Store active connections
const connections = new Map()

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id)

  // Handle offer from sender
  socket.on('send-offer', (data) => {
    const { code, offer } = data
    console.log('Received offer for code:', code)
    
    // Store the offer
    connections.set(code, {
      offer,
      senderSocket: socket.id,
      timestamp: Date.now()
    })
    
    // Notify that offer is ready
    socket.emit('offer-sent', { code, success: true })
    
    // If there's a receiver waiting for this code, send the offer immediately
    const connection = connections.get(code)
    if (connection && connection.receiverSocket) {
      io.to(connection.receiverSocket).emit('offer-received', { code, offer })
    }
  })

  // Handle receiver waiting for offer
  socket.on('wait-for-offer', (data) => {
    const { code } = data
    console.log('Receiver waiting for offer with code:', code)
    
    const connection = connections.get(code)
    if (connection) {
      // Store receiver socket and send offer if available
      connection.receiverSocket = socket.id
      if (connection.offer) {
        socket.emit('offer-received', { code, offer: connection.offer })
      }
    } else {
      // Create new connection entry for receiver
      connections.set(code, {
        receiverSocket: socket.id,
        timestamp: Date.now()
      })
    }
  })

  // Handle answer from receiver
  socket.on('send-answer', (data) => {
    const { code, answer } = data
    console.log('Received answer for code:', code)
    
    const connection = connections.get(code)
    if (connection) {
      connection.answer = answer
      connection.receiverSocket = socket.id
      
      // Send answer back to sender
      io.to(connection.senderSocket).emit('answer-received', { code, answer })
      
      // Notify receiver that answer was sent
      socket.emit('answer-sent', { code, success: true })
    } else {
      socket.emit('error', { message: 'Code not found' })
    }
  })

  // Handle ICE candidates
  socket.on('send-ice-candidate', (data) => {
    const { code, candidate, isSender } = data
    console.log('Received ICE candidate for code:', code)
    
    const connection = connections.get(code)
    if (connection) {
      if (isSender) {
        // ICE candidate from sender, send to receiver
        if (connection.receiverSocket) {
          io.to(connection.receiverSocket).emit('ice-candidate-received', { code, candidate })
        }
      } else {
        // ICE candidate from receiver, send to sender
        if (connection.senderSocket) {
          io.to(connection.senderSocket).emit('ice-candidate-received', { code, candidate })
        }
      }
    }
  })

  // Handle connection cleanup
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id)
    
    // Clean up connections where this socket was involved
    for (const [code, connection] of connections.entries()) {
      if (connection.senderSocket === socket.id || connection.receiverSocket === socket.id) {
        connections.delete(code)
        console.log('Cleaned up connection for code:', code)
      }
    }
  })

  // Handle manual cleanup
  socket.on('clear-connection', (data) => {
    const { code } = data
    if (connections.has(code)) {
      connections.delete(code)
      console.log('Manually cleared connection for code:', code)
      socket.emit('connection-cleared', { code, success: true })
    }
  })
})

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    connections: connections.size,
    timestamp: new Date().toISOString()
  })
})

// Get active connections (for debugging)
app.get('/connections', (req, res) => {
  const connectionList = Array.from(connections.entries()).map(([code, conn]) => ({
    code,
    hasOffer: !!conn.offer,
    hasAnswer: !!conn.answer,
    senderSocket: conn.senderSocket,
    receiverSocket: conn.receiverSocket,
    timestamp: conn.timestamp
  }))
  
  res.json({ connections: connectionList })
})

const PORT = process.env.PORT || 3001

server.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`)
})
