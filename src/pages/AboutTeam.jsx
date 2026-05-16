import { useState } from 'react'

export default function AboutTeam() {
  const [teams] = useState([
    {
      id: 1,
      name: 'John Doe',
      role: 'Developer',
      email: 'john@example.com'
    },
    {
      id: 2,
      name: 'Jane Smith',
      role: 'Designer',
      email: 'jane@example.com'
    },
    {
      id: 3,
      name: 'Mike Johnson',
      role: 'Product Manager',
      email: 'mike@example.com'
    }
  ])

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>About - Team</h2>
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
        <p>No team members found</p>
      )}
    </div>
  )
}
