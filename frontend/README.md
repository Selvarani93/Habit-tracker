# Habit Tracker Frontend

React frontend built with Vite, Tailwind CSS, and shadcn/ui.

## Tech Stack

- **React** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **Lucide React** - Icons
- **React Router** - Routing
- **Axios** - HTTP client
- **date-fns** - Date utilities

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### 3. Make sure Backend is Running

The frontend expects the backend API to be running at `http://localhost:8000`. Start the backend server before using the frontend.

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   └── ui/          # shadcn/ui components
│   │       ├── button.jsx
│   │       ├── card.jsx
│   │       └── input.jsx
│   ├── pages/
│   │   ├── Home.jsx     # Landing page
│   │   └── Dashboard.jsx # Main habit tracker
│   ├── services/
│   │   └── api.js       # API service layer
│   ├── lib/
│   │   └── utils.js     # Utility functions
│   ├── App.jsx          # Main app component
│   ├── index.css        # Global styles
│   └── main.jsx         # Entry point
├── index.html
├── vite.config.js
├── tailwind.config.js
└── package.json
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Features

### Current
- Landing page with feature highlights
- Dashboard to view and manage habits
- Log daily habit completion (done/partial/missed)
- Demo user account

### Coming Soon
- User authentication
- Create/edit/delete habits
- Habit statistics and visualizations
- Streak tracking
- Calendar view
