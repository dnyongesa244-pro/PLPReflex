import { createContext, useContext, useEffect, useState } from 'react'
import authService from '../services/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const restoreSession = async () => {
            const token = localStorage.getItem('reflex_token')

            if (!token) {
                setLoading(false)
                return
            }

            try {
                const data = await authService.getCurrentUser()
                setUser(data.user)
            } catch (error) {
                localStorage.removeItem('reflex_token')
                setUser(null)
            } finally {
                setLoading(false)
            }
        }

        restoreSession()
    }, [])

    const login = async (credentials) => {
        const data = await authService.login(credentials)

        localStorage.setItem('reflex_token', data.token)
        setUser(data.user)

        return data
    }

    const logout = () => {
        localStorage.removeItem('reflex_token')
        setUser(null)
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)

    if (!context) {
        throw new Error('useAuth must be used inside AuthProvider')
    }

    return context
}