import { useEffect, useState, useRef } from 'react'

const STORAGE_KEY = 'youtubeFavorites'

function getYoutubeId(value) {
  if (!value) return ''
  const url = value.trim()
  const regex = /(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)?)([\w-]{11})/i
  const match = url.match(regex)
  if (match && match[1]) return match[1]
  return url.length === 11 ? url : ''
}

function readFavorites() {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveFavorites(favorites) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites))
  } catch {
    // ignore write errors
  }
}

export default function FavouritePlay() {
  const [source, setSource] = useState('')
  const [videoId, setVideoId] = useState('')
  const [favorites, setFavorites] = useState([])
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const inputRef = useRef(null)
  const [playOnScreenClose, setPlayOnScreenClose] = useState(() => {
    return localStorage.getItem('yt-play-on-screen-close') === 'true'
  })

  useEffect(() => {
    const list = readFavorites()
    setFavorites(list)
    if (list.length > 0) {
      setSource(list[0])
      const id = getYoutubeId(list[0])
      if (id) setVideoId(id)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('yt-play-on-screen-close', playOnScreenClose)
  }, [playOnScreenClose])

  // Background playback feature with Media Session API and Wake Lock
  useEffect(() => {
    if (!videoId || !playOnScreenClose) return

    let wakeLock = null

    // Request wake lock to prevent screen from turning off
    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLock = await navigator.wakeLock.request('screen')
          console.log('Wake lock acquired')
        }
      } catch (err) {
        console.log('Wake lock request failed:', err)
      }
    }

    // Register media session if available
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: 'YouTube Video',
        artist: 'YouTube',
        artwork: [
          { src: 'https://www.youtube.com/favicon.ico', sizes: '96x96', type: 'image/x-icon' }
        ]
      })

      navigator.mediaSession.setActionHandler('play', () => {
        // Handle play action
      })
      navigator.mediaSession.setActionHandler('pause', () => {
        // Handle pause action
      })
    }

    // Request wake lock on load
    requestWakeLock()

    // Handle visibility change to maintain playback and re-acquire wake lock
    const handleVisibilityChange = async () => {
      if (!playOnScreenClose) return
      if (!document.hidden) {
        // Tab is visible again, re-acquire wake lock
        await requestWakeLock()
      } else {
        // Tab is hidden, set playback state to playing
        if ('mediaSession' in navigator) {
          navigator.mediaSession.playbackState = 'playing'
        }
      }
    }

    // Handle page visibility changes (tab switch, screen lock, etc.)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      // Release wake lock when component unmounts
      if (wakeLock) {
        wakeLock.release()
      }
    }
  }, [videoId, playOnScreenClose])

  const handleChange = (event) => {
    setSource(event.target.value)
  }

  const handleLoad = () => {
    const id = getYoutubeId(source)
    if (id) {
      setVideoId(id)
    } else {
      setVideoId('')
      alert('Please enter a valid YouTube URL or video ID.')
    }
  }

  const handleAddFavorite = () => {
    const id = getYoutubeId(source)
    if (!id) return
    // Prevent duplicate
    if (favorites.some(fav => getYoutubeId(fav) === id)) {
      alert('This video is already in your favourites.')
      return
    }
    const newFavs = [source, ...favorites]
    setFavorites(newFavs)
    saveFavorites(newFavs)
  }

  const handleDropdownSelect = (item) => {
    setSource(item)
    setDropdownOpen(false)
    const id = getYoutubeId(item)
    if (id) setVideoId(id)
  }

  return (
    <div style={{
      minHeight: '100vh',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      background: '#f8fafc',
      padding: 0,
      margin: 0
    }}>
      <p style={{ marginBottom: 16 }}>Enter YouTube URL/video ID OR Pick from favourites.</p>
      <div
        style={{
          width: '100%',
          maxWidth: 800,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          gap: 12,
          padding: '0 6px',
        }}
      >
        {/* Input and dropdown row */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            width: '100%',
            flexWrap: 'nowrap',
            position: 'relative',
          }}
        >
          <input
            ref={inputRef}
            type="text"
            value={source}
            onChange={handleChange}
            placeholder="Enter YouTube URL or video ID"
            style={{ flex: 1, padding: '10px 12px', borderRadius: '8px', border: '1px solid #ccc', minWidth: 0 }}
          />
          {/* Dropdown icon */}
          <span
            onClick={() => setDropdownOpen((v) => !v)}
            style={{
              cursor: 'pointer',
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#f4f6f8',
              borderRadius: '50%',
              border: '1px solid #ccc',
              zIndex: 2
            }}
            title="Select from favourites"
          >
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M5 8l5 5 5-5" stroke="#0b74de" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </span>
          {/* Dropdown menu */}
          {dropdownOpen && favorites.length > 0 && (
            <div style={{
              position: 'absolute',
              left: 0,
              top: 44,
              background: '#fff',
              border: '1px solid #ccc',
              borderRadius: 8,
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              zIndex: 10,
              minWidth: 220,
              maxHeight: 200,
              overflowY: 'auto',
            }}>
              {favorites.map((item, idx) => (
                <div
                  key={item + idx}
                  onClick={() => handleDropdownSelect(item)}
                  style={{
                    padding: '10px 16px',
                    cursor: 'pointer',
                    background: item === source ? '#e3f2fd' : '#fff',
                    borderBottom: idx !== favorites.length - 1 ? '1px solid #eee' : 'none',
                    fontSize: 15
                  }}
                >
                  {item}
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Buttons row - both on next line */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            gap: 12,
            width: '100%',
            justifyContent: 'flex-start',
          }}
        >
          <button
            onClick={handleLoad}
            style={{ padding: '10px 18px', borderRadius: '8px', border: 'none', background: '#0b74de', color: '#fff', cursor: 'pointer', minWidth: '110px', flex: 1 }}
          >
            Load
          </button>
          <button
            onClick={handleAddFavorite}
            style={{ padding: '10px 18px', borderRadius: '8px', border: 'none', background: '#28a745', color: '#fff', cursor: 'pointer', minWidth: '140px', flex: 1 }}
          >
            Add to Favourite
          </button>
        </div>
      </div>
      {videoId ? (
        <div
          style={{
            marginTop: 32,
            width: '100vw',
            maxWidth: 1200,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: 'calc(100vh - 260px)',
            minHeight: 320,
            maxHeight: 700,
            overflow: 'hidden',
          }}
        >
          <iframe
            title="YouTube player"
            src={`https://www.youtube.com/embed/${videoId}?autoplay=${playOnScreenClose ? 1 : 0}`}
            style={{
              width: '100%',
              maxWidth: 1000,
              height: '100%',
              minHeight: 320,
              maxHeight: 700,
              border: '0',
              borderRadius: '12px',
              background: '#000',
              display: 'block',
            }}
            allow="autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; accelerometer; camera; microphone; payment"
            allowFullScreen
            playsInline={true}
          />
        </div>
      ) : null}
    </div>
  )
}
