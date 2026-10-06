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
  const [playAudio, setPlayAudio] = useState(false)
  const [audioProgress, setAudioProgress] = useState(0)
  const [audioDuration, setAudioDuration] = useState(0)
  const [isAudioPlaying, setIsAudioPlaying] = useState(false)
  const [isAudioMuted, setIsAudioMuted] = useState(false)
  const audioPlayerRef = useRef(null)
  const wakeLockRef = useRef(null)

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
    if (!playAudio || !videoId) {
      if (audioPlayerRef.current) {
        try {
          audioPlayerRef.current.stopVideo()
        } catch {
          // ignore stop errors
        }
        try {
          audioPlayerRef.current.destroy()
        } catch {
          // ignore destroy errors
        }
      }
      audioPlayerRef.current = null
      setAudioProgress(0)
      setAudioDuration(0)
      setIsAudioPlaying(false)
      setIsAudioMuted(false)
      return
    }

    const loadAudioPlayer = () => {
      const existingContainer = document.getElementById('youtube-audio-player')
      if (existingContainer) {
        existingContainer.innerHTML = ''
      }

      const container = document.createElement('div')
      container.id = 'youtube-audio-player'
      container.style.position = 'absolute'
      container.style.left = '-9999px'
      container.style.top = '-9999px'
      container.style.width = '1px'
      container.style.height = '1px'
      container.style.opacity = '0'
      container.style.pointerEvents = 'none'
      document.body.appendChild(container)

      if (audioPlayerRef.current) {
        try {
          audioPlayerRef.current.destroy()
        } catch {
          // ignore destroy errors
        }
      }

      audioPlayerRef.current = new window.YT.Player(container.id, {
        videoId,
        playerVars: {
          autoplay: 1,
          controls: 0,
          mute: 0,
          playsinline: 1,
          rel: 0,
          modestbranding: 1,
          iv_load_policy: 3,
        },
        events: {
          onReady: (event) => {
            const duration = event.target.getDuration() || 0
            setAudioDuration(duration)
            setAudioProgress(0)
            event.target.unMute()
            event.target.playVideo()
            setIsAudioMuted(false)
            setIsAudioPlaying(true)
          },
          onStateChange: (event) => {
            const state = event.data
            if (state === window.YT.PlayerState.PLAYING) {
              setIsAudioPlaying(true)
            } else if (state === window.YT.PlayerState.PAUSED || state === window.YT.PlayerState.ENDED) {
              setIsAudioPlaying(false)
            }
          },
        },
      })
    }

    if (window.YT && window.YT.Player) {
      loadAudioPlayer()
      return
    }

    const scriptId = 'youtube-iframe-api-script'
    let script = document.getElementById(scriptId)
    if (!script) {
      script = document.createElement('script')
      script.id = scriptId
      script.src = 'https://www.youtube.com/iframe_api'
      document.body.appendChild(script)
    }

    window.onYouTubeIframeAPIReady = () => {
      loadAudioPlayer()
    }

    return () => {
      const oldContainer = document.getElementById('youtube-audio-player')
      if (oldContainer) oldContainer.remove()
      if (audioPlayerRef.current) {
        try {
          audioPlayerRef.current.destroy()
        } catch {
          // ignore destroy errors
        }
        audioPlayerRef.current = null
      }
    }
  }, [videoId, playAudio])

  useEffect(() => {
    if (!playAudio || !audioPlayerRef.current || !window.YT) return

    const timer = setInterval(() => {
      try {
        const current = audioPlayerRef.current.getCurrentTime?.() || 0
        const duration = audioPlayerRef.current.getDuration?.() || audioDuration
        setAudioProgress(current)
        if (duration) setAudioDuration(duration)
      } catch {
        // ignore timer errors
      }
    }, 300)

    return () => clearInterval(timer)
  }, [playAudio, audioDuration])

  useEffect(() => {
    if (!playAudio || !videoId) {
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {})
        wakeLockRef.current = null
      }
      return
    }

    const requestWakeLock = async () => {
      if (!('wakeLock' in navigator)) return
      try {
        if (wakeLockRef.current) {
          await wakeLockRef.current.release()
        }
        wakeLockRef.current = await navigator.wakeLock.request('screen')
      } catch {
        // Some browsers or platforms reject wake lock requests automatically.
      }
    }

    requestWakeLock()

    const handleVisibilityChange = async () => {
      if (!playAudio || !videoId) return

      try {
        if (document.visibilityState === 'visible') {
          if (audioPlayerRef.current && typeof audioPlayerRef.current.playVideo === 'function') {
            audioPlayerRef.current.playVideo()
          }
          await requestWakeLock()
        } else {
          if ('mediaSession' in navigator) {
            navigator.mediaSession.playbackState = 'playing'
          }
          await requestWakeLock()
        }
      } catch {
        // ignore visibility errors
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: 'YouTube audio',
        artist: 'YouTube',
      })
      navigator.mediaSession.setActionHandler('play', () => {
        if (audioPlayerRef.current && typeof audioPlayerRef.current.playVideo === 'function') {
          audioPlayerRef.current.playVideo()
        }
      })
      navigator.mediaSession.setActionHandler('pause', () => {
        if (audioPlayerRef.current && typeof audioPlayerRef.current.pauseVideo === 'function') {
          audioPlayerRef.current.pauseVideo()
        }
      })
    }

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {})
        wakeLockRef.current = null
      }
    }
  }, [playAudio, videoId])

  const handleChange = (event) => {
    setSource(event.target.value)
  }

  const handleLoad = () => {
    const id = getYoutubeId(source)
    if (id) {
      setVideoId(id)
      setPlayAudio(false)
      setAudioProgress(0)
      setAudioDuration(0)
    } else {
      setVideoId('')
      alert('Please enter a valid YouTube URL or video ID.')
    }
  }

  const handlePlayVideo = () => {
    const id = getYoutubeId(source)
    if (!id) {
      alert('Please enter a valid YouTube URL or video ID.')
      return
    }

    setVideoId(id)
    setPlayAudio(false)
  }

  const handlePlayAudio = () => {
    const id = getYoutubeId(source)
    if (!id) {
      alert('Please enter a valid YouTube URL or video ID.')
      return
    }

    setVideoId(id)
    setPlayAudio(true)
  }

  const handleToggleAudio = () => {
    if (!audioPlayerRef.current || !window.YT) {
      handlePlayAudio()
      return
    }

    const state = audioPlayerRef.current.getPlayerState()
    if (state === window.YT.PlayerState.PLAYING) {
      audioPlayerRef.current.pauseVideo()
      setIsAudioPlaying(false)
    } else {
      audioPlayerRef.current.playVideo()
      setIsAudioPlaying(true)
    }
  }

  const handleMuteToggle = () => {
    if (!audioPlayerRef.current || !window.YT) return

    const nextMuted = !isAudioMuted
    if (nextMuted) {
      audioPlayerRef.current.mute()
    } else {
      audioPlayerRef.current.unMute()
    }
    setIsAudioMuted(nextMuted)
  }

  const handleAudioSeek = (event) => {
    const value = Number(event.target.value)
    if (audioPlayerRef.current && typeof audioPlayerRef.current.seekTo === 'function') {
      audioPlayerRef.current.seekTo(value, true)
    }
    setAudioProgress(value)
  }

  const handleDownloadAudio = () => {
    const id = getYoutubeId(source) || videoId
    if (!id) {
      alert('Please enter a valid YouTube URL or video ID.')
      return
    }

    alert('Real YouTube MP3 download is not possible in a pure browser app without a backend or a trusted external service. This project is frontend-only, so the app cannot extract the audio file itself.')
  }

  const formatTime = (value) => {
    if (!Number.isFinite(value) || value < 0) return '0:00'
    const minutes = Math.floor(value / 60)
    const seconds = Math.floor(value % 60)
    return `${minutes}:${String(seconds).padStart(2, '0')}`
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
            placeholder="Enter YouTube URL or video ID here"
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
            Play Video
          </button>
          <button
            onClick={handlePlayAudio}
            style={{ padding: '10px 18px', borderRadius: '8px', border: 'none', background: '#7c3aed', color: '#fff', cursor: 'pointer', minWidth: '120px', flex: 1 }}
          >
            Play Audio
          </button>
          <button
            onClick={handleAddFavorite}
            style={{ padding: '10px 18px', borderRadius: '8px', border: 'none', background: '#28a745', color: '#fff', cursor: 'pointer', minWidth: '140px', flex: 1 }}
          >
            Add to Favourite
          </button>
        </div>
      </div>
      {playAudio && videoId ? (
        <div
          style={{
            marginTop: 26,
            width: '100%',
            maxWidth: 680,
            background: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: 14,
            padding: '18px 20px',
            boxShadow: '0 6px 20px rgba(15, 23, 42, 0.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ fontWeight: 700, color: '#1f2937' }}>Audio Player</div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={handleMuteToggle}
                style={{
                  background: '#374151',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '8px 12px',
                  cursor: 'pointer',
                  fontWeight: 700,
                  minWidth: 52,
                }}
              >
                {isAudioMuted ? '🔇' : '🔊'}
              </button>
              <button
                onClick={handleToggleAudio}
                style={{
                  background: isAudioPlaying ? '#ef4444' : '#16a34a',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '8px 14px',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                {isAudioPlaying ? 'Pause' : 'Play'}
              </button>
              <button
                onClick={handleDownloadAudio}
                style={{
                  background: '#dc2626',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '8px 14px',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                Download Audio
              </button>
            </div>
          </div>

          <input
            type="range"
            min="0"
            max={audioDuration || 1}
            value={audioProgress}
            onChange={handleAudioSeek}
            style={{ width: '100%', accentColor: '#7c3aed' }}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569', fontSize: 12, marginTop: 8 }}>
            <span>{formatTime(audioProgress)}</span>
            <span>{formatTime(audioDuration)}</span>
          </div>
        </div>
      ) : null}

      {!playAudio && videoId ? (
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
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&controls=1&mute=0&playsinline=1&rel=0&modestbranding=1`}
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
