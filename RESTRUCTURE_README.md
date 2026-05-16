# PlayOnline - Full Stack Application

This is a restructured full-stack application with a React frontend and Node.js backend.

## Project Structure

```
playOnline/
├── frontend/          # React application
│   ├── src/
│   ├── package.json
│   ├── vite.config.js
│   └── ...
├── backend/           # Node.js/Express API server
│   ├── server.js      # Main server file
│   ├── data.json      # Data storage file
│   ├── package.json
│   └── ...
├── package.json       # Root package.json for running both apps
└── ...
```

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm

### Installation

1. Install root dependencies:
```bash
cd playOnline
npm install
```

2. Install frontend dependencies:
```bash
cd frontend
npm install
```

3. Install backend dependencies:
```bash
cd backend
npm install
```

### Running the Application

#### Run both frontend and backend together:
```bash
npm run dev
```

This will start:
- **Backend**: Running on `http://localhost:5000`
- **Frontend**: Running on `http://localhost:5173` (Vite default)

#### Run individually:
```bash
# Backend only
npm run backend

# Frontend only
npm run frontend
```

## API Endpoints

### Backend Routes

#### GET /getData
Fetches team data from the `data.json` file.

**Response:**
```json
{
  "teams": [
    {
      "id": 1,
      "name": "John Doe",
      "role": "Developer",
      "email": "john@example.com"
    },
    ...
  ]
}
```

#### POST /saveData
Saves data to the `data.json` file.

**Request Body:**
```json
{
  "teams": [...]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Data saved successfully"
}
```

## Features

- **React Frontend** with routing (Home, YouTube, About)
- **Node.js/Express Backend** with file-based storage
- **CORS Enabled** for cross-origin requests
- **Concurrent Execution** using concurrently package
- **RESTful API** for data management

## Frontend Pages

- **Home**: Displays 12 task boxes
- **YouTube**: Play YouTube videos with favorites management
- **About**: Team information fetched from backend API

## Notes

- The backend uses file-based JSON storage (`data.json`)
- Make sure both applications are running for full functionality
- The frontend makes API calls to `http://localhost:5000`
- Edit `backend/data.json` directly to modify team data
- Use `npm run build` to build the frontend for production
