const express = require('express')
const cors = require('cors')
const fs = require('fs')
const path = require('path')

const app = express()
const PORT = 5000
const DATA_FILE = path.join(__dirname, 'data.json')

// Middleware - Enable CORS with explicit options
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ status: 'Backend server is running' })
})

// Ensure data.json exists
const initializeDataFile = () => {
  if (!fs.existsSync(DATA_FILE)) {
    const initialData = { teams: [] }
    fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2))
  }
}

initializeDataFile()

// GET /getData - Fetch data from file
app.get('/getData', (req, res) => {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8')
    const jsonData = JSON.parse(data)
    res.status(200).json(jsonData)
  } catch (error) {
    console.error('Error reading data:', error)
    res.status(500).json({ error: 'Failed to read data' })
  }
})

// POST /saveData - Save data to file
app.post('/saveData', (req, res) => {
  try {
    const data = req.body
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2))
    res.status(200).json({ success: true, message: 'Data saved successfully' })
  } catch (error) {
    console.error('Error saving data:', error)
    res.status(500).json({ error: 'Failed to save data' })
  }
})

app.listen(PORT, () => {
  console.log(`✅ Backend server running on http://localhost:${PORT}`)
  console.log(`📍 GET /getData - Fetch team data`)
  console.log(`📍 POST /saveData - Save team data`)
})
