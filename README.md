# 📱💻 Scribo - Cross-Device Data Sharing

A modern, secure web application for instant data sharing between devices using 6-digit codes. No login required, no data stored anywhere.

## 🚀 Live Demo
Visit the live app at: [Your Vercel URL]

![Scribo Preview](https://via.placeholder.com/800x400/6366f1/ffffff?text=Scribo+-+Cross-Device+Sharing)

## ✨ Features

- 🔒 **Secure & Private** - No data stored anywhere
- ⚡ **Lightning Fast** - Instant peer-to-peer transfers
- 📱 **Cross-Platform** - Works on mobile, tablet, and desktop
- 🆓 **No Login Required** - Start sharing immediately
- 🌐 **Works Anywhere** - Any device with a modern browser
- 🎨 **Modern UI** - Beautiful, responsive design

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/scribo.git
cd scribo
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **Icons**: Lucide React
- **PWA**: Vite PWA Plugin
- **Deployment**: Vercel

## 📱 How It Works

### Send Mode
1. Generate a 6-digit code
2. Share the code with the receiving device
3. Enter your text or link
4. Send the data instantly

### Receive Mode
1. Enter the 6-digit code from sender
2. Connect to the sender
3. Receive the data instantly
4. Copy to clipboard

## 🚀 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy with one click!

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/scribo)

### Manual Deployment

```bash
npm run build
npm run preview
```

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Project Structure

```
scribo/
├── src/
│   ├── components/          # React components
│   │   ├── Header.tsx
│   │   ├── SendMode.tsx
│   │   ├── ReceiveMode.tsx
│   │   └── Features.tsx
│   ├── App.tsx             # Main app component
│   ├── main.tsx           # App entry point
│   └── index.css          # Global styles
├── public/                # Static assets
├── package.json          # Dependencies
├── tailwind.config.js    # Tailwind configuration
├── vite.config.ts        # Vite configuration
└── vercel.json          # Vercel deployment config
```

## 🔒 Security & Privacy

- **No Data Storage**: Data is never stored on servers
- **Peer-to-Peer**: Direct device-to-device communication
- **Temporary Codes**: 6-digit codes expire after use
- **No Tracking**: No user tracking or analytics
- **HTTPS Only**: Secure connections only

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [React](https://reactjs.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Icons by [Lucide](https://lucide.dev/)
- Deployed on [Vercel](https://vercel.com/)

## 📞 Support

If you have any questions or need help, please open an issue on GitHub.

---

Made with ❤️ for seamless cross-device data sharing
