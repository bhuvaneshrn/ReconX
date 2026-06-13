import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

type Mode = 'login' | 'register'

export function AuthPage() {
    const { login, register } = useAuth()
    const [mode, setMode] = useState<Mode>('login')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPw, setShowPw] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const switchMode = (next: Mode) => {
        setMode(next)
        setEmail('')
        setPassword('')
        setError(null)
    }

    const handleSubmit = async () => {
        setError(null)
        if (!email || !password) { setError('Email and password are required'); return }
        if (mode === 'register' && password.length < 8) { setError('Password must be at least 8 characters'); return }
        setLoading(true)
        try {
            if (mode === 'login') await login(email, password)
            else await register(email, password)
        } catch (err: any) {
            setError(err?.response?.data?.detail ?? (mode === 'login' ? 'Invalid email or password' : 'Registration failed'))
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-navy-950 flex items-center justify-center px-4">
            <div className="w-full max-w-3xl rounded-2xl overflow-hidden border border-navy-700 relative flex min-h-[440px]">

                {/* Left half — dark info panel (static, always visible) */}
                <div className="w-1/2 bg-navy-950 border-r border-navy-800 flex flex-col items-center justify-center p-10 text-center space-y-4 shrink-0">
                    <h1 className="text-3xl font-mono font-bold">
                        Recon<span className="text-cyan-400">X</span>
                    </h1>
                    <div className="w-8 h-px bg-cyan-500/40 mx-auto" />

                    {mode === 'login' ? (
                        <>
                            <p className="text-lg font-mono font-semibold text-white">New here?</p>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                Join ReconX and start scanning domains from public sources.
                            </p>
                            <button
                                onClick={() => switchMode('register')}
                                className="px-6 py-2 rounded-lg border border-cyan-500/30 text-cyan-400 text-sm font-mono hover:bg-cyan-500/10 transition-all"
                            >
                                Create Account
                            </button>
                        </>
                    ) : (
                        <>
                            <p className="text-lg font-mono font-semibold text-white">Welcome Back!</p>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                Already have an account? Sign in to continue scanning.
                            </p>
                            <button
                                onClick={() => switchMode('login')}
                                className="px-6 py-2 rounded-lg border border-cyan-500/30 text-cyan-400 text-sm font-mono hover:bg-cyan-500/10 transition-all"
                            >
                                Sign In
                            </button>
                        </>
                    )}

                    <p className="text-xs text-slate-700 font-mono pt-2">Passive recon only</p>
                </div>

                {/* Right half — form panel */}
                <div className="w-1/2 bg-navy-900 flex flex-col items-center justify-center p-10 shrink-0">
                    <h2 className="text-xl font-mono font-semibold text-white mb-1">
                        {mode === 'login'
                            ? <>Sign <span className="text-cyan-400">In</span></>
                            : <>Create <span className="text-cyan-400">Account</span></>
                        }
                    </h2>
                    <p className="text-xs text-slate-500 font-mono mb-7">
                        {mode === 'login' ? 'Welcome back to ReconX' : 'Authorized use only'}
                    </p>

                    {error && (
                        <div className="w-full mb-4 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono">
                            {error}
                        </div>
                    )}

                    <div className="w-full space-y-3">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                            placeholder="Email"
                            className="w-full px-3 py-2.5 rounded-lg bg-navy-800 border border-navy-600 text-sm text-white placeholder-slate-600 font-mono focus:outline-none focus:border-cyan-500/50 transition"
                        />
                        <div className="relative">
                            <input
                                type={showPw ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                                placeholder={mode === 'register' ? 'Password (min 8 chars)' : 'Password'}
                                className="w-full px-3 py-2.5 pr-10 rounded-lg bg-navy-800 border border-navy-600 text-sm text-white placeholder-slate-600 font-mono focus:outline-none focus:border-cyan-500/50 transition"
                            />
                            <button type="button" onClick={() => setShowPw(!showPw)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400">
                                {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                        </div>
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="w-full py-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-sm font-mono font-medium hover:bg-cyan-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading && <Loader2 size={14} className="animate-spin" />}
                            {mode === 'login' ? 'Sign In' : 'Create Account'}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    )
}