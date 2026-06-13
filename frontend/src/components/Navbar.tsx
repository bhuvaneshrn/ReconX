import { Shield, LogOut, User } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

export function Navbar() {
  const { user, logout } = useAuth()

  return (
    <nav className="border-b border-navy-800 bg-navy-950/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <Shield size={18} className="text-cyan-400" />
          <span className="font-mono font-bold text-white">
            Recon<span className="text-cyan-400">X</span>
          </span>
          <span className="hidden sm:inline text-xs font-mono text-slate-600 ml-1">
            v3.0
          </span>
        </div>

        {/* User info + logout */}
        {user && (
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 text-xs font-mono text-slate-500">
              <User size={11} />
              {user.email}
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-navy-700 text-slate-500 hover:text-red-400 hover:border-red-500/30 text-xs font-mono transition-all"
            >
              <LogOut size={12} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}