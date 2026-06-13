import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import axios from 'axios'

interface User {
    id: number
    email: string
}

interface AuthState {
    user: User | null
    token: string | null
    loading: boolean
}

interface AuthContextType extends AuthState {
    login: (email: string, password: string) => Promise<void>
    register: (email: string, password: string) => Promise<void>
    logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

const API_BASE = import.meta.env.VITE_API_URL ?? '/api/v1'

export function AuthProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<AuthState>({
        user: null,
        token: localStorage.getItem('reconx_token'),
        loading: true,
    })

    // On mount, verify stored token
    useEffect(() => {
        const token = localStorage.getItem('reconx_token')
        if (!token) {
            setState((s) => ({ ...s, loading: false }))
            return
        }
        axios
            .get(`${API_BASE}/auth/me`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => {
                setState({ user: res.data, token, loading: false })
            })
            .catch(() => {
                localStorage.removeItem('reconx_token')
                setState({ user: null, token: null, loading: false })
            })
    }, [])

    const login = async (email: string, password: string) => {
        const res = await axios.post(`${API_BASE}/auth/login`, { email, password })
        const { access_token, user_id } = res.data
        localStorage.setItem('reconx_token', access_token)
        setState({ user: { id: user_id, email }, token: access_token, loading: false })
    }

    const register = async (email: string, password: string) => {
        const res = await axios.post(`${API_BASE}/auth/register`, { email, password })
        const { access_token, user_id } = res.data
        localStorage.setItem('reconx_token', access_token)
        setState({ user: { id: user_id, email }, token: access_token, loading: false })
    }

    const logout = () => {
        localStorage.removeItem('reconx_token')
        setState({ user: null, token: null, loading: false })
    }

    return (
        <AuthContext.Provider value={{ ...state, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used within AuthProvider')
    return ctx
}