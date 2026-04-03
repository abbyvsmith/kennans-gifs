import { useEffect, useState } from 'react'
import './App.css'

const SEARCH_TERMS = [
  // weird & bizarre
  'weird dancing', 'weird flex', 'weird bird', 'weird puppet', 'weird food',
  'bizarre animal', 'bizarre talent', 'bizarre invention', 'strange creature',
  'oddly satisfying fail', 'weird commercial', 'weird mascot', 'weird sport',
  // cursed & creepy
  'cursed image', 'cursed cat', 'creepy doll', 'uncanny valley', 'cursed video',
  'cursed food', 'haunted vibes', 'nightmare fuel', 'disturbing smile',
  'sleep paralysis demon', 'backrooms', 'liminal space', 'creepy smile',
  // chaotic energy
  'chaotic energy', 'chaos goblin', 'deranged energy', 'feral behavior',
  'unhinged behavior', 'goblin mode', 'gremlin energy', 'feral cat energy',
  'pure chaos', 'absolute mayhem', 'everything is fine fire', 'controlled chaos',
  // animals being weird
  'unexpected animal', 'confused cat', 'dramatic chipmunk', 'screaming goat',
  'angry raccoon', 'derpy dog', 'startled cat', 'judgmental bird',
  'chaotic parrot', 'suspicious hamster', 'frog scream', 'cat zoomies',
  'dog tantrum', 'angry possum', 'evil goose',
  // unhinged reactions
  'fever dream', 'awkward moment', 'existential dread', 'sus moment',
  'psycho stare', 'maniacal laugh', 'menacing aura', 'villain laugh',
  'evil grin', 'slow descent into madness', 'thousand yard stare',
  'awkward silence', 'visible confusion', 'internal screaming',
  'this is fine', 'stressed out', 'losing it',
  // chaotic internet culture
  'shitpost energy', 'deep fried meme', 'glitch art', 'earrape face',
  'speed wobble', 'windows error', 'buffering reality', 'lag in real life',
  'npc behavior', 'main character energy', 'plot twist moment',
  'side quest energy', 'boss music starts', 'ominous floating',
  // unhinged physical comedy
  'spectacular fail', 'unexpected explosion', 'surprise scare reaction',
  'ragdoll physics', 'cartoon logic irl', 'slapstick chaos',
  'bowling strike fail', 'trampoline fail', 'inflatable chaos',
  // eldritch & surreal
  'eldritch horror', 'cosmic horror reaction', 'void stare',
  'reality glitch', 'interdimensional', 'surreal meme',
  'abstract nightmare', 'fever dream logic', 'time loop',
]

const GIPHY_API_KEY = '0UnHCD5HB5Jr3hw9Ws1Eezh4Kf9CDCHu'

interface CachedGif {
  url: string
  title: string
  date: string
}

function getTodayKey(): string {
  const now = new Date()
  const mst = new Date(now.toLocaleString('en-US', { timeZone: 'America/Denver' }))
  return `${mst.getFullYear()}-${String(mst.getMonth() + 1).padStart(2, '0')}-${String(mst.getDate()).padStart(2, '0')}`
}

function hashDate(dateStr: string): number {
  // Simple but effective hash to spread dates across a large range
  const [year, month, day] = dateStr.split('-').map(Number)
  let h = year * 374761 + month * 51329 + day * 2971
  h = ((h >>> 0) ^ (h << 13)) >>> 0
  h = (h * 2654435761) >>> 0
  return h
}

function getSearchTerm(dateStr: string): string {
  const h = hashDate(dateStr)
  return SEARCH_TERMS[h % SEARCH_TERMS.length]
}

function getGiphyOffset(dateStr: string): number {
  // Use a different part of the hash to pick an offset (0-49)
  // so even repeated search terms return different GIFs
  const h = hashDate(dateStr)
  return Math.floor(h / SEARCH_TERMS.length) % 50
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
    const offset = getGiphyOffset(today)
    fetch(
      `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(term)}&limit=1&offset=${offset}&rating=g`
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
