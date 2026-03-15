import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Auth from './pages/Auth'
import Profile from './pages/Profile'
import Dashboard from './pages/Dashboard'
import UserDashboard from './pages/UserDashboard'

// Helper component for protected routes
const ProtectedRoute = ({ children, allowedRoles }) => {
    const token = localStorage.getItem('auth_token')
    if (!token || token.split('.').length < 3) {
        return <Navigate to="/auth" replace />
    }

    try {
        const user = JSON.parse(atob(token.split('.')[1]))

        if (allowedRoles === 'ROOT_LOGIC') {
            return user.role === 'customer' ? <Navigate to="/user-dashboard" replace /> : <Navigate to="/dashboard" replace />
        }

        if (allowedRoles && !allowedRoles.includes(user.role)) {
            return user.role === 'customer' ? <Navigate to="/user-dashboard" replace /> : <Navigate to="/dashboard" replace />
        }

        return children
    } catch (e) {
        console.error('Invalid token', e)
        localStorage.removeItem('auth_token')
        return <Navigate to="/auth" replace />
    }
}

function App() {
    return (
        <Router>
            <div className="min-h-screen bg-slate-900 text-slate-100">
                <Routes>
                    <Route path="/" element={<ProtectedRoute allowedRoles="ROOT_LOGIC" />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route
                        path="/user-dashboard"
                        element={
                            <ProtectedRoute allowedRoles={['customer']}>
                                <UserDashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/profile"
                        element={
                            <ProtectedRoute>
                                <Profile />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute allowedRoles={['admin', 'pharmacist']}>
                                <Dashboard />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </div>
        </Router>
    )
}

export default App
