# Scriboo - Socket.IO Setup Instructions

## Quick Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Update Vercel URL**
   - Open `src/utils/socketSignaling.ts`
   - Replace `https://your-vercel-app.vercel.app` with your actual Vercel URL
   - Example: `https://scriboo-abc123.vercel.app`

3. **Deploy to Vercel**
   ```bash
   git add .
   git commit -m "Add Socket.IO signaling server"
   git push
   ```

4. **Test Locally (Optional)**
   ```bash
   npm run dev:full
   ```
   This runs both the frontend (port 3000) and Socket.IO server (port 3001)

## How It Works Now

✅ **Real-time signaling** using Socket.IO  
✅ **Proper offer/answer exchange** between devices  
✅ **Automatic connection cleanup**  
✅ **Works on Vercel** - no additional services needed  

## Testing

1. Open the app on two different devices
2. On device 1: Click "Generate Code" and share the code
3. On device 2: Enter the code and click "Connect & Receive"
4. Send data from device 1 - it should appear on device 2!

## Troubleshooting

- Make sure your Vercel URL is correct in `socketSignaling.ts`
- Check browser console for any errors
- Ensure both devices are connected to the internet

The messaging should now work properly between devices! 🎉
