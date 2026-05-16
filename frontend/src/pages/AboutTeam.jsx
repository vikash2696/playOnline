import { useEffect, useState } from 'react'

export default function AboutTeam() {
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000'
        const response = await fetch(`${apiUrl}/getData`)
        if (!response.ok) throw new Error('Failed to fetch data')
        const data = await response.json()
        setTeams(data.teams || [])
        setError(null)
      } catch (err) {
        console.error('Error fetching team data:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchTeamData()
  }, [])

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>About - Team</h2>
      {loading && <p>Loading team data...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {teams.length > 0 ? (
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          marginTop: '20px',
          border: '1px solid #ddd'
        }}>
          <thead>
            <tr style={{ background: '#f4f6f8', borderBottom: '2px solid #ddd' }}>
              <th style={{ padding: '12px', textAlign: 'left', borderRight: '1px solid #ddd' }}>Name</th>
              <th style={{ padding: '12px', textAlign: 'left', borderRight: '1px solid #ddd' }}>Role</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Email</th>
            </tr>
          </thead>
          <tbody>
            {teams.map((member) => (
              <tr key={member.id} style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '12px', borderRight: '1px solid #ddd' }}>{member.name}</td>
                <td style={{ padding: '12px', borderRight: '1px solid #ddd' }}>{member.role}</td>
                <td style={{ padding: '12px' }}>{member.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        !loading && <p>No team members found</p>
      )}
    </div>
  )
}
