import { useState, useEffect } from 'react'

const TASKS = [
  { id: 1, title: 'Task 1' },
  { id: 2, title: 'Task 2' },
  { id: 3, title: 'Task 3' },
  { id: 4, title: 'Task 4' },
  { id: 5, title: 'Task 5' },
  { id: 6, title: 'Task 6' },
  { id: 7, title: 'Task 7' },
  { id: 8, title: 'Task 8' },
  { id: 9, title: 'Task 9' },
  { id: 10, title: 'Task 10' },
  { id: 11, title: 'Task 11' },
  { id: 12, title: 'Task 12' }
]

export default function Home() {
  const [selectedTask, setSelectedTask] = useState(null)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleTaskClick = (task) => {
    setSelectedTask(task)
    console.log('Task clicked:', task)
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      minHeight: '100vh',
      background: '#f8fafc',
      padding: '20px'
    }}>
      <h1 style={{ marginBottom: 32, fontSize: 28, color: '#333' }}>Tasks</h1>
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? 'repeat(3, 1fr)' : 'repeat(auto-fit, minmax(120px, 1fr))',
        gap: 16,
        maxWidth: isMobile ? '100%' : 600,
        width: '100%'
      }}>
        {TASKS.map((task) => (
          <div
            key={task.id}
            onClick={() => handleTaskClick(task)}
            style={{
              aspectRatio: '1 / 1',
              background: selectedTask?.id === task.id ? '#0b74de' : '#fff',
              border: selectedTask?.id === task.id ? '2px solid #0b74de' : '2px solid #ccc',
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: 16,
              fontWeight: 500,
              color: selectedTask?.id === task.id ? '#fff' : '#333',
              transition: 'all 0.3s ease',
              boxShadow: selectedTask?.id === task.id ? '0 4px 12px rgba(11, 116, 222, 0.3)' : '0 2px 4px rgba(0,0,0,0.08)'
            }}
            onMouseEnter={(e) => {
              if (selectedTask?.id !== task.id) {
                e.currentTarget.style.background = '#f0f0f0'
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.12)'
              }
            }}
            onMouseLeave={(e) => {
              if (selectedTask?.id !== task.id) {
                e.currentTarget.style.background = '#fff'
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.08)'
              }
            }}
          >
            {task.title}
          </div>
        ))}
      </div>
    </div>
  )
}
