import { useEffect, useState } from 'react'
import './App.css'

const SEARCH_TERMS = [
  'weird dancing', 'cursed image', 'unexpected animal', 'chaotic energy',
  'fever dream', 'awkward moment', 'unhinged behavior', 'bizarre food',
  'creepy doll', 'confused cat', 'dramatic chipmunk', 'weird flex',
  'cursed cat', 'frog scream', 'existential dread', 'goblin mode',
  'maniacal laugh', 'weird bird', 'sus moment', 'nightmare fuel',
  'eldritch horror', 'menacing aura', 'deranged energy', 'feral behavior',
  'uncanny valley', 'chaos goblin', 'psycho stare', 'weird puppet',
  'disturbing smile', 'haunted vibes',
]

const GIPHY_API_KEY = '0UnHCD5HB5Jr3hw9Ws1Eezh4Kf9CDCHu'

interface CachedGif {
  url: string
  title: string
  date: string
}

function getTodayKey(): string {
  return new Date().toISOString().split('T')[0]
}

function getSearchTerm(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number)
  const index = (year * 366 + month * 31 + day) % SEARCH_TERMS.length
  return SEARCH_TERMS[index]
}

function App() {
  const [gif, setGif] = useState<CachedGif | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  async function copyGif() {
    if (!gif) return
    try {
      const res = await fetch(gif.url)
      const blob = await res.blob()
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob }),
      ])
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback: copy the URL as text
      await navigator.clipboard.writeText(gif.url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  useEffect(() => {
    const today = getTodayKey()

    const cached = localStorage.getItem('gif-of-the-day')
    if (cached) {
      const parsed: CachedGif = JSON.parse(cached)
      if (parsed.date === today) {
        setGif(parsed)
        setLoading(false)
        return
      }
    }

    const term = getSearchTerm(today)
    fetch(
      `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(term)}&limit=1&rating=g`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.data && data.data.length > 0) {
          const gifData: CachedGif = {
            url: data.data[0].images.original.url,
            title: data.data[0].title || term,
            date: today,
          }
          localStorage.setItem('gif-of-the-day', JSON.stringify(gifData))
          setGif(gifData)
        } else {
          setError('No GIF found for today. Try again later!')
        }
      })
      .catch(() => setError('Failed to fetch GIF. Check your connection.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="app">
      {loading && <p className="status">Loading today's GIF...</p>}
      {error && <p className="status error">{error}</p>}
      {gif && (
        <div className="gif-container">
          <img src={gif.url} alt={gif.title} />
          <button className="copy-btn" onClick={copyGif} title={copied ? 'Copied!' : 'Copy GIF'}>
            {copied ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
            )}
          </button>
        </div>
      )}
    </div>
  )
}

export default App
