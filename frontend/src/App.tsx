import { useEffect, useState } from 'react'
import './App.css'

const API_BASE = import.meta.env.VITE_API_URL || ''

interface ShortenedUrl {
  code: string
  shortUrl: string
  originalUrl: string
}

function App() {
  const [appName, setAppName] = useState('URL Shortener')
  const [url, setUrl] = useState('')
  const [result, setResult] = useState<ShortenedUrl | null>(null)
  const [history, setHistory] = useState<ShortenedUrl[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetch(`${API_BASE}/api/name`)
      .then((res) => res.text())
      .then((data) => setAppName(data))
      .catch(() => setAppName('URL Shortener'))
  }, [])

  const handleShorten = async () => {
    if (!url.trim()) {
      setError('Please enter a URL')
      return
    }

    setError('')
    setLoading(true)
    setCopied(false)

    try {
      const res = await fetch(`${API_BASE}/api/shorten`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      })

      if (!res.ok) throw new Error('Failed to shorten URL')

      const data: ShortenedUrl = await res.json()
      setResult(data)
      setHistory((prev) => [data, ...prev])
      setUrl('')
    } catch {
      setError('Failed to shorten URL. Make sure the backend is running.')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleShorten()
  }

  return (
    <div className="app-container">
      <div className="content">
        <h1>{appName}</h1>
        <p className="subtitle">Paste a long URL and get a short one instantly</p>

        <div className="input-group">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="https://example.com/very/long/url..."
            className="url-input"
          />
          <button onClick={handleShorten} disabled={loading} className="shorten-btn">
            {loading ? 'Shortening...' : 'Shorten'}
          </button>
        </div>

        {error && <p className="error">{error}</p>}

        {result && (
          <div className="result">
            <p className="result-label">Shortened URL:</p>
            <div className="result-url-row">
              <a href={result.shortUrl} target="_blank" rel="noopener noreferrer" className="short-link">
                {result.shortUrl}
              </a>
              <button onClick={() => handleCopy(result.shortUrl)} className="copy-btn">
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <p className="original-url">Original: {result.originalUrl}</p>
          </div>
        )}

        {history.length > 1 && (
          <div className="history">
            <h2>History</h2>
            {history.slice(1).map((item, i) => (
              <div key={i} className="history-item">
                <a href={item.shortUrl} target="_blank" rel="noopener noreferrer" className="short-link">
                  {item.shortUrl}
                </a>
                <span className="history-original">{item.originalUrl}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default App
