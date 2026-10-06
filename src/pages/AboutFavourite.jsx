import { useEffect, useState } from 'react'

const STORAGE_KEY = 'youtubeFavorites'

function normalizeFavoriteEntry(entry) {
  if (typeof entry === 'string') {
    const value = entry.trim()
    return { value, label: value }
  }

  if (entry && typeof entry === 'object') {
    const value = (entry.value || entry.url || entry.source || '').trim()
    const label = (entry.label || entry.name || value || '').trim()
    return { value, label: label || value }
  }

  return { value: '', label: '' }
}

function readFavorites() {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    if (!Array.isArray(parsed)) return []
    return parsed.map(normalizeFavoriteEntry).filter(item => item.value)
  } catch {
    return []
  }
}

function saveFavorites(favorites) {
  if (typeof window === 'undefined') return
  try {
    const normalized = (Array.isArray(favorites) ? favorites : []).map(normalizeFavoriteEntry).filter(item => item.value)
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized))
  } catch {
    // ignore write errors
  }
}

export default function AboutFavourite() {
  const [favorites, setFavorites] = useState([])

  useEffect(() => {
    setFavorites(readFavorites())
  }, [])

  const updateFavoriteName = (index, value) => {
    const updated = favorites.map((item, idx) => {
      if (idx !== index) return item
      const nextValue = value.trim() || item.value
      return { ...item, label: nextValue }
    })

    setFavorites(updated)
    saveFavorites(updated)
  }

  return (
    <div style={{ width: '100%', padding: '20px 16px 40px' }}>
      <h2 style={{ marginBottom: 16 }}>Favourite Videos</h2>

      {favorites.length === 0 ? (
        <p>No favourite videos added yet.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8 }}>
            <thead>
              <tr style={{ background: '#f8fafc', textAlign: 'left' }}>
                <th style={{ padding: '12px 14px', borderBottom: '1px solid #e5e7eb', minWidth: 260 }}>Video URL / ID</th>
                <th style={{ padding: '12px 14px', borderBottom: '1px solid #e5e7eb', minWidth: 220 }}>Display Name</th>
              </tr>
            </thead>
            <tbody>
              {favorites.map((item, idx) => (
                <tr key={`${item.value}-${idx}`}>
                  <td style={{ padding: '12px 14px', borderBottom: '1px solid #e5e7eb', wordBreak: 'break-all', verticalAlign: 'top' }}>
                    {item.value}
                  </td>
                  <td style={{ padding: '12px 14px', borderBottom: '1px solid #e5e7eb', verticalAlign: 'top' }}>
                    <input
                      type="text"
                      value={item.label || item.value}
                      onChange={(event) => updateFavoriteName(idx, event.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: 8,
                        border: '1px solid #cbd5e1',
                        minWidth: 180,
                        boxSizing: 'border-box',
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
