import React from 'react'
import { ArrowRight, Shield, Zap, Smartphone, Monitor } from 'lucide-react'

interface LandingPageProps {
  onGetStarted: () => void
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Scribo</h1>
                <p className="text-sm text-gray-500">Cross-Device Sharing</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 text-sm text-gray-500">
                <Smartphone size={16} />
                <span>Mobile</span>
                <Monitor size={16} />
                <span>Desktop</span>
              </div>
              <button
                onClick={onGetStarted}
                className="btn-primary flex items-center gap-2"
              >
                Get Started
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Don't make sharing{' '}
              <span className="text-black">
                awkward
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-2xl mx-auto">
              No more emailing yourself links or searching for lost contacts. 
              Share data instantly between devices using secure 6-digit codes.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <button
                onClick={onGetStarted}
                className="btn-primary text-lg px-8 py-4 flex items-center gap-2"
              >
                Start sharing
                <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Here's how it works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              More sharing, less fumbling.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center text-white mx-auto mb-6">
                <span className="text-2xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Generate code</h3>
              <p className="text-gray-600">Create a 6-digit code on your device</p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center text-white mx-auto mb-6">
                <span className="text-2xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Share code</h3>
              <p className="text-gray-600">Give the code to the receiving device</p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center text-white mx-auto mb-6">
                <span className="text-2xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Transfer data</h3>
              <p className="text-gray-600">Data transfers instantly and securely</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why choose Scribo?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Simple, secure, and fast data sharing between devices.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                icon: <Shield className="w-8 h-8" />,
                title: "Secure & Private",
                description: "No data stored anywhere. Direct device-to-device transfer."
              },
              {
                icon: <Zap className="w-8 h-8" />,
                title: "Lightning Fast",
                description: "Instant transfers with no waiting or delays."
              },
              {
                icon: <Smartphone className="w-8 h-8" />,
                title: "Cross-Platform",
                description: "Works on mobile, tablet, laptop, and desktop."
              }
            ].map((feature, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-700 mx-auto mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Get connected and start sharing.
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            No login required. No data stored. Just simple, secure sharing.
          </p>
          <button
            onClick={onGetStarted}
            className="btn-primary text-lg px-8 py-4"
          >
            Start sharing
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-12 px-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="text-lg font-semibold text-gray-900">Scribo</span>
            </div>
            
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <a href="#" className="hover:text-gray-900 transition-colors">About</a>
              <a href="#" className="hover:text-gray-900 transition-colors">Privacy</a>
              <a href="#" className="hover:text-gray-900 transition-colors">Terms</a>
              <a href="#" className="hover:text-gray-900 transition-colors">Contact</a>
            </div>
          </div>
          
          <div className="border-t border-gray-100 mt-8 pt-8 text-center text-gray-500">
            <p>&copy; 2024 Scribo. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
