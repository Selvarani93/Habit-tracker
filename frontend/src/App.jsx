import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import RoutineTemplate from './pages/RoutineTemplate';
import DailyTracker from './pages/DailyTracker';
import Analytics from './pages/Analytics';
import Interviews from './pages/Interviews';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected Routes with Layout */}
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/routine-template" element={<RoutineTemplate />} />
            <Route path="/daily-tracker" element={<DailyTracker />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/interviews" element={<Interviews />} />
          </Route>

          {/* Redirect /dashboard to /routine-template */}
          <Route path="/dashboard" element={<Navigate to="/routine-template" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
