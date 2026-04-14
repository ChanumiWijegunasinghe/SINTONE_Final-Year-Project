import { useState, useEffect } from 'react'
import LoadingScreen from './components/LoadingScreen'
import HomePage from './components/HomePage'
import FeaturesPage from './components/FeaturesPage'
import AnalyzePage from './components/AnalyzePage'
import './assets/css/App.css'

function App() {
  const seenLoading = sessionStorage.getItem('hasSeenLoading') === 'true'
  const [isLoading, setIsLoading] = useState(!seenLoading)

  const deriveRouteFromLocation = () => {
    const hash = (window.location.hash || '').replace('#', '').replace('/', '')
    if (hash === 'features') return 'features'
    if (hash === 'analyze') return 'analyze'
    return 'home'
  }

  const [route, setRoute] = useState(() => deriveRouteFromLocation())

  useEffect(() => {
    if (!seenLoading) {
      const timer = setTimeout(() => {
        setIsLoading(false)
        try { sessionStorage.setItem('hasSeenLoading', 'true') } catch (e) {}
      }, 3000)

      return () => clearTimeout(timer)
    } else {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const onHashChange = () => setRoute(deriveRouteFromLocation())
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])


  return (
    <>
      {isLoading ? (
        <LoadingScreen />
      ) : (
        <>
          {route === 'home' && (
            <HomePage
              route={route}
              onNavigate={(r) => {
                window.location.hash = r === 'home' ? '' : `#/${r}`
                setRoute(r)
              }}
            />
          )}

          {route === 'features' && (
            <FeaturesPage
              route={route}
              onNavigate={(r) => {
                window.location.hash = r === 'home' ? '' : `#/${r}`
                setRoute(r)
              }}
            />
          )}

          {route === 'analyze' && (
            <AnalyzePage
              route={route}
              onNavigate={(r) => {
                window.location.hash = r === 'home' ? '' : `#/${r}`
                setRoute(r)
              }}
            />
          )}
        </>
      )}
    </>
  )
}

export default App
