import { useState } from 'react'
import LandingPage from './pages/LandingPage'
import AppPage from './pages/AppPage'

type Page = 'landing' | 'app'

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('landing')

  const navigateToApp = () => {
    setCurrentPage('app')
  }

  const navigateToLanding = () => {
    setCurrentPage('landing')
  }

  return (
    <div className="min-h-screen">
      {currentPage === 'landing' ? (
        <LandingPage onGetStarted={navigateToApp} />
      ) : (
        <AppPage onBackToHome={navigateToLanding} />
      )}
    </div>
  )
}

export default App