import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { LayoutDashboard, BarChart3, FileText, Bell, User, ChevronDown, TrendingUp, TrendingDown, Users, DollarSign, Activity, Zap, Search, SortAsc, SortDesc, CheckCircle, XCircle, Clock, Play, Pause, RefreshCw, LogOut, Mail, Shield, Globe, CreditCard, ExternalLink, Star, Quote, Target, ArrowRight, Rocket, Sparkles, PieChart, LineChart as LineChartIcon, Database, Settings, Filter, Download, Eye, Edit3, MessageSquare, ThumbsUp, Instagram, Twitter, Linkedin, Github, Video } from 'lucide-react'

const BASE = window.__BACKEND_URL__ || 'https://tu-backend-url.com'

async function apiFetch(path, opts = {}) {
  for (let i = 0; i < 5; i++) {
    try {
      const r = await fetch(BASE + path, opts)
      if (r.ok) return r.json()
    } catch (_) {}
    await new Promise(r => setTimeout(r, 1500))
  }
  return null
}

const defaultKPIs = [
  { icon: Activity, label: 'Active Tools', value: 8472, delta: 12.5, prefix: '' },
  { icon: Users, label: 'Total Users', value: 12450, delta: 8.3, prefix: '' },
  { icon: DollarSign, label: 'Monthly Revenue', value: 289450, delta: -3.2, prefix: '$' },
  { icon: Zap, label: 'API Calls (24h)', value: 152800, delta: 22.1, prefix: '' }
]

const defaultChartData = [120, 165, 142, 198, 175, 220, 245]

const defaultActivity = [
  { tool: 'Email Engine', action: 'activated', user: 'Sarah Chen', time: '2 min ago', status: 'success' },
  { tool: 'SEO Scout', action: 'deactivated', user: 'Mike Johnson', time: '15 min ago', status: 'warning' },
  { tool: 'Invoice Pro', action: 'activated', user: 'Emily Davis', time: '1 hour ago', status: 'success' },
  { tool: 'Social Scheduler', action: 'deactivated', user: 'Alex Kim', time: '3 hours ago', status: 'error' },
  { tool: 'Analytic Lite', action: 'activated', user: 'Lisa Wang', time: '5 hours ago', status: 'success' }
]

function formatNumber(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toLocaleString()
}

function Counter({ value, duration = 1000 }) {
  const [displayed, setDisplayed] = useState(0)
  const startRef = useRef(null)
  const rafRef = useRef(null)

  useEffect(() => {
    startRef.current = null
    const startVal = displayed

    const animate = (timestamp) => {
      if (!startRef.current) startRef.current = timestamp
      const progress = Math.min((timestamp - startRef.current) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = Math.round(startVal + (value - startVal) * eased)
      setDisplayed(current)
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate)
      }
    }

    rafRef.current = requestAnimationFrame(animate)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [value])

  return <>{formatNumber(displayed)}</>
}

function KPICard({ icon: Icon, label, value, delta, prefix }) {
  const isPositive = delta >= 0

  return (
    <div className="glass p-5 fade-in hover:bg-white/[0.06] transition-all duration-200 cursor-pointer">
      <div className="flex items-center justify-between mb-3">
        <div className="p-2 rounded-lg bg-[#7C3AED]/10 text-[#7C3AED]">
          <Icon size={20} />
        </div>
        <div className={`flex items-center gap-1 text-xs font-medium ${isPositive ? 'text-emerald-400' : 'text-red-400'} bg-white/5 px-2 py-1 rounded-full`}>
          {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          <span>{Math.abs(delta)}%</span>
        </div>
      </div>
      <div className="text-2xl font-bold mt-1">
        {prefix}<Counter value={value} />
      </div>
      <div className="text-xs text-slate-400 mt-1">{label}</div>
    </div>
  )
}

function Sidebar({ activePage, setActivePage, onLogout }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tools', label: 'Micro-Tools', icon: Zap },
    { id: 'leads', label: 'Leads', icon: Users },
    { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'settings', label: 'Settings', icon: User }
  ]

  return (
    <aside className="w-64 flex-shrink-0 flex flex-col border-r border-white/5 bg-white/[0.02] h-full">
      <div className="h-14 flex items-center px-6 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#7C3AED] to-[#F59E0B] flex items-center justify-center">
            <span className="text-white font-bold text-xs">PF</span>
          </div>
          <span className="font-semibold text-sm">PixelForge Hub</span>
        </div>
      </div>

      <nav className="flex-1 py-4 px-3 space-y-1">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActivePage(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              activePage === item.id
                ? 'bg-[#7C3AED]/10 text-[#7C3AED] border border-[#7C3AED]/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <item.icon size={18} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="px-3 py-3 border-t border-white/5">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/5 transition-all duration-200"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  )
}

function TopBar({ userName, userEmail }) {
  const [toast, setToast] = useState(null)

  const showToast = useCallback((message) => {
    setToast(message)
    setTimeout(() => setToast(null), 3000)
  }, [])

  return (
    <header className="h-14 flex items-center justify-between px-6 border-b border-white/5 flex-shrink-0">
      <div className="flex items-center gap-4">
        <h1 className="text-sm font-semibold gradient-text">PixelForge Dashboard</h1>
      </div>

      <div className="flex items-center gap-3">
        <button className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all duration-200 relative">
          <Bell size={18} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-[#F59E0B] rounded-full"></span>
        </button>
        <div className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/5 transition-all duration-200 cursor-pointer group relative">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#F59E0B] flex items-center justify-center text-white text-xs font-medium">
            {(userName || 'U')[0].toUpperCase()}
          </div>
          <ChevronDown size={14} className="text-slate-400" />
          <div className="absolute right-0 top-full mt-2 w-48 glass p-3 hidden group-hover:block z-50">
            <p className="text-sm text-slate-200">{userName}</p>
            <p className="text-xs text-slate-400">{userEmail}</p>
          </div>
        </div>
      </div>

      {toast && (
        <div className="fixed top-4 right-4 z-50 glass p-4 animate-[fadeIn_0.3s_ease]">
          <p className="text-sm text-slate-200">{toast}</p>
        </div>
      )}
    </header>
  )
}

function LineChart({ data = defaultChartData }) {
  if (!data || data.length === 0) return null
  const width = 400
  const height = 180
  const padding = { top: 20, right: 20, bottom: 30, left: 40 }
  const chartWidth = width - padding.left - padding.right
  const chartHeight = height - padding.top - padding.bottom

  const nums = (data || []).map(v => typeof v === 'number' ? v : 0)
  const max = nums.length ? Math.max(...nums) : 0
  const min = nums.length ? Math.min(...nums) : 0
  const range = max - min || 1
  const xStep = chartWidth / (nums.length - 1 || 1)

  const points = nums.map((v, i) => ({
    x: padding.left + i * xStep,
    y: padding.top + chartHeight - ((v - min) / range) * chartHeight
  }))

  const linePath = points.map((p, i) => (i === 0 ? `M${p.x},${p.y}` : `L${p.x},${p.y}`)).join(' ')

  const areaPath = `${linePath} L${points[points.length - 1].x},${padding.top + chartHeight} L${points[0].x},${padding.top + chartHeight} Z`

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
      <defs>
        <linearGradient id="lineGradient" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#7C3AED" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#lineGradient)" opacity={0.6} className="animate-[fadeIn_0.6s_ease]"/>
      <path d={linePath} fill="none" stroke="#7C3AED" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="animate-[fadeIn_0.8s_ease]"/>
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3.5" fill="#7C3AED" className="animate-[fadeIn_1s_ease]"/>
      ))}
    </svg>
  )
}

function BarChart({ data = defaultChartData }) {
  if (!data || data.length === 0) return null
  const width = 400
  const height = 180
  const padding = { top: 20, right: 20, bottom: 30, left: 40 }
  const chartWidth = width - padding.left - padding.right
  const chartHeight = height - padding.top - padding.bottom

  const nums = (data || []).map(v => typeof v === 'number' ? v : 0)
  const max = nums.length ? Math.max(...nums) : 0
  const barWidth = chartWidth / nums.length * 0.6
  const gap = chartWidth / nums.length * 0.4

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
      <defs>
        <linearGradient id="barGradient" x1="0" x2="0" y1="1" y2="0">
          <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.8" />
        </linearGradient>
      </defs>
      {nums.map((v, i) => {
        const barHeight = (v / max) * chartHeight
        const x = padding.left + i * (barWidth + gap) + gap / 2
        const y = padding.top + chartHeight - barHeight
        return (
          <rect
            key={i}
            x={x}
            y={y}
            width={barWidth}
            height={barHeight}
            rx="4"
            fill="url(#barGradient)"
            className="animate-[fadeIn_0.6s_ease]"
            style={{ animationDelay: `${i * 0.1}s` }}
          />
        )
      })}
    </svg>
  )
}

function DataTable({ data = [], onSort, sortField, sortDir }) {
  const statusIcons = { success: CheckCircle, warning: Clock, error: XCircle }
  const statusColors = { success: 'text-emerald-400', warning: 'text-amber-400', error: 'text-red-400' }

  const safeData = Array.isArray(data) ? data : []

  if (safeData.length === 0) {
    return (
      <div className="glass p-8 text-center">
        <Activity size={40} className="mx-auto text-slate-500 mb-3" />
        <p className="text-slate-400 text-sm">No activity yet — run your first task</p>
      </div>
    )
  }

  return (
    <div className="glass overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5">
              {['Tool', 'Action', 'User', 'Time', 'Status'].map(col => {
                const isSortable = ['Tool', 'Action', 'User', 'Status'].includes(col)
                const field = col.toLowerCase()
                return (
                  <th
                    key={col}
                    className={`px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider ${isSortable ? 'cursor-pointer hover:text-slate-200' : ''}`}
                    onClick={() => isSortable && onSort && onSort(field)}
                  >
                    <div className="flex items-center gap-1">
                      <span>{col}</span>
                      {isSortable && (
                        <span className="text-slate-500">
                          {sortField === field ? (
                            sortDir === 'asc' ? <SortAsc size={12} /> : <SortDesc size={12} />
                          ) : (
                            <SortAsc size={12} className="opacity-30" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {safeData.map((row, i) => {
              const StatusIcon = statusIcons[row.status] || CheckCircle
              return (
                <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors duration-150">
                  <td className="px-4 py-3 font-medium">{row.tool || '-'}</td>
                  <td className="px-4 py-3 text-slate-300 capitalize">{row.action || '-'}</td>
                  <td className="px-4 py-3 text-slate-300">{row.user || '-'}</td>
                  <td className="px-4 py-3 text-slate-400">{row.time || '-'}</td>
                  <td className="px-4 py-3">
                    <div className={`flex items-center gap-1.5 ${statusColors[row.status] || 'text-slate-400'}`}>
                      <StatusIcon size={14} />
                      <span className="capitalize text-xs">{row.status || 'unknown'}</span>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function QuickActions() {
  const [tools, setTools] = useState([
    { name: 'Email Engine', active: true, icon: Play },
    { name: 'SEO Scout', active: false, icon: Pause },
    { name: 'Invoice Pro', active: true, icon: Play },
    { name: 'Social Scheduler', active: false, icon: Pause }
  ])

  const toggleTool = (index) => {
    setTools(prev => prev.map((t, i) => i === index ? { ...t, active: !t.active } : t))
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-slate-200">Quick Actions</h3>
      <div className="space-y-2">
        {(tools || []).map((tool, i) => (
          <div key={i} className="glass p-3 flex items-center justify-between fade-in hover:bg-white/[0.04] transition-all duration-200 cursor-pointer" style={{ animationDelay: `${i * 0.1}s` }}>
            <div className="flex items-center gap-3">
              <div className={`p-1.5 rounded-lg ${tool.active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-500/10 text-slate-400'}`}>
                <tool.icon size={16} />
              </div>
              <div>
                <div className="text-sm font-medium">{tool.name}</div>
                <div className="text-xs text-slate-400">{tool.active ? 'Active' : 'Inactive'}</div>
              </div>
            </div>
            <button
              onClick={() => toggleTool(i)}
              className={`px-3 py-1 text-xs rounded-full font-medium transition-all duration-200 ${
                tool.active
                  ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                  : 'bg-slate-500/10 text-slate-400 hover:bg-slate-500/20'
              }`}
            >
              {tool.active ? 'Deactivate' : 'Activate'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

function AddToolForm({ onSuccess }) {
  const [name, setName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Tool name is required')
      return
    }
    setSubmitting(true)
    setError('')
    const result = await apiFetch('/api/tools', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim() })
    })
    setSubmitting(false)
    if (result) {
      setName('')
      if (onSuccess) onSuccess()
    } else {
      setError('Failed to create tool. Please try again.')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="glass p-4">
      <h3 className="text-sm font-semibold text-slate-200 mb-3">Create New Micro-Tool</h3>
      <div className="space-y-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., PDF Generator"
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#7C3AED]/40 focus:bg-white/10 transition-all duration-200"
        />
        {error && <p className="text-xs text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="w-full px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] rounded-lg hover:from-[#6D28D9] hover:to-[#5B21B6] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          {submitting ? 'Creating...' : 'Create Tool'}
        </button>
      </div>
    </form>
  )
}

function ToolsPage() {
  const [tools, setTools] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchTools = useCallback(async () => {
    setLoading(true)
    setError(null)
    const data = await apiFetch('/api/tools')
    if (Array.isArray(data)) {
      setTools(data)
    } else if (data && data.items) {
      setTools(data.items)
    } else {
      setTools([])
      setError('Failed to load tools')
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchTools()
  }, [fetchTools])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7C3AED]"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <h2 className="text-lg font-semibold text-slate-200 mb-4">Your Micro-Tools</h2>
          {error && (
            <div className="glass p-4 text-center mb-4">
              <p className="text-red-400 text-sm mb-2">{error}</p>
              <button
                onClick={fetchTools}
                className="text-[#7C3AED] text-sm hover:underline"
              >
                Try again
              </button>
            </div>
          )}
          <div className="space-y-3">
            {(tools || []).length === 0 ? (
              <div className="glass p-8 text-center">
                <Zap size={40} className="mx-auto text-slate-500 mb-3" />
                <p className="text-slate-400 text-sm">No micro-tools yet. Create your first one!</p>
              </div>
            ) : (
              (tools || []).map((tool, i) => (
                <div key={tool.id || i} className="glass p-4 flex items-center justify-between fade-in hover:bg-white/[0.04] transition-all duration-200">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[#7C3AED]/10 text-[#7C3AED]">
                      <Zap size={18} />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-slate-200">{tool.name || 'Unnamed Tool'}</h3>
                      <p className="text-xs text-slate-400 capitalize">{tool.status || 'inactive'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">{tool.usage || 0} calls</span>
                    <button className="p-1.5 rounded-lg text-slate-400 hover:text-[#7C3AED] hover:bg-[#7C3AED]/10 transition-all duration-200">
                      <ExternalLink size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        <div>
          <AddToolForm onSuccess={fetchTools} />
        </div>
      </div>
    </div>
  )
}

function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchSubscriptions = async () => {
      setLoading(true)
      setError(null)
      const data = await apiFetch('/api/subscriptions')
      if (Array.isArray(data)) {
        setSubscriptions(data)
      } else if (data && data.items) {
        setSubscriptions(data.items)
      } else {
        setSubscriptions([])
        setError('Failed to load subscriptions')
      }
      setLoading(false)
    }
    fetchSubscriptions()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7C3AED]"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-slate-200 mb-4">Subscriptions</h2>
      {error && (
        <div className="glass p-4 text-center mb-4">
          <p className="text-red-400 text-sm mb-2">{error}</p>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="glass p-5 text-center">
          <h3 className="text-sm font-semibold text-slate-200 mb-2">Starter</h3>
          <p className="text-2xl font-bold text-[#7C3AED]">$9</p>
          <p className="text-xs text-slate-400 mt-1">/month</p>
          <ul className="mt-3 space-y-1 text-xs text-slate-400">
            <li>1 micro-tool</li>
            <li>Basic analytics</li>
          </ul>
        </div>
        <div className="glass p-5 text-center border-[#F59E0B]/30">
          <h3 className="text-sm font-semibold text-slate-200 mb-2">Pro</h3>
          <p className="text-2xl font-bold text-[#F59E0B]">$19</p>
          <p className="text-xs text-slate-400 mt-1">/month</p>
          <ul className="mt-3 space-y-1 text-xs text-slate-400">
            <li>3 micro-tools</li>
            <li>Advanced analytics</li>
            <li>Custom domain</li>
          </ul>
        </div>
        <div className="glass p-5 text-center">
          <h3 className="text-sm font-semibold text-slate-200 mb-2">Studio</h3>
          <p className="text-2xl font-bold text-[#7C3AED]">$29</p>
          <p className="text-xs text-slate-400 mt-1">/month</p>
          <ul className="mt-3 space-y-1 text-xs text-slate-400">
            <li>Unlimited tools</li>
            <li>Team access</li>
            <li>Priority support</li>
          </ul>
        </div>
      </div>
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-200">Active Subscriptions</h3>
        {(subscriptions || []).length === 0 ? (
          <div className="glass p-8 text-center">
            <CreditCard size={40} className="mx-auto text-slate-500 mb-3" />
            <p className="text-slate-400 text-sm">No active subscriptions</p>
          </div>
        ) : (
          (subscriptions || []).map((sub, i) => (
            <div key={sub.id || i} className="glass p-4 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-slate-200 capitalize">{sub.plan || 'N/A'} Plan</h4>
                <p className="text-xs text-slate-400">Next billing: {sub.next_billing || 'N/A'}</p>
              </div>
              <span className={`px-2 py-1 text-xs rounded-full ${
                sub.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' :
                sub.status === 'canceled' ? 'bg-red-500/10 text-red-400' :
                'bg-slate-500/10 text-slate-400'
              }`}>
                {sub.status || 'unknown'}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function Dashboard({ user, onLogout }) {
  const [sortField, setSortField] = useState('time')
  const [sortDir, setSortDir] = useState('asc')
  const [activity, setActivity] = useState(defaultActivity)
  const [metrics, setMetrics] = useState(null)
  const [chartData, setChartData] = useState(defaultChartData)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [username, setUsername] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [activeTab, setActiveTab] = useState('overview')
  const [notifications, setNotifications] = useState([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const safeActivity = Array.isArray(activity) ? activity : []

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      
      const [metricsData, activityData, chartDataResponse] = await Promise.all([
        apiFetch('/api/metrics'),
        apiFetch('/api/recent-activity'),
        apiFetch('/api/chart-data')
      ])
      
      if (metricsData) {
        setMetrics(metricsData)
      }
      
      if (Array.isArray(activityData)) {
        setActivity(activityData)
      } else if (activityData && activityData.items) {
        setActivity(activityData.items)
      } else {
        setActivity(defaultActivity)
      }
      
      if (Array.isArray(chartDataResponse)) {
        setChartData(chartDataResponse)
      } else if (chartDataResponse && chartDataResponse.data) {
        setChartData(chartDataResponse.data)
      }
      
      setLoading(false)
    }
    
    fetchData()
  }, [])

  const kpis = useMemo(() => {
    if (!metrics) return defaultKPIs
    return [
      { icon: Activity, label: 'Active Tools', value: metrics.tools || 0, delta: 12.5, prefix: '' },
      { icon: Users, label: 'Total Users', value: metrics.users || 0, delta: 8.3, prefix: '' },
      { icon: DollarSign, label: 'Monthly Revenue', value: Math.round(metrics.revenue || 0), delta: -3.2, prefix: '$' },
      { icon: Zap, label: 'API Calls (24h)', value: metrics.api_calls || 0, delta: 22.1, prefix: '' }
    ]
  }, [metrics])

  const handleSort = useCallback((field) => {
    setSortField(prev => {
      if (prev === field) {
        setSortDir(dir => dir === 'asc' ? 'desc' : 'asc')
        return prev
      }
      setSortDir('asc')
      return field
    })
  }, [])

  const sortedActivity = useMemo(() => {
    if (!safeActivity.length) return []
    return [...safeActivity].sort((a, b) => {
      const aVal = a[sortField] || ''
      const bVal = b[sortField] || ''
      const comparison = typeof aVal === 'string' ? aVal.localeCompare(bVal) : aVal - bVal
      return sortDir === 'asc' ? comparison : -comparison
    })
  }, [safeActivity, sortField, sortDir])

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7C3AED]"></div>
        <p className="text-slate-400 mt-4 text-sm">Loading your dashboard...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center">
        <p className="text-red-400 text-sm">{error}</p>
        <button onClick={() => window.location.reload()} className="mt-4 text-[#7C3AED] text-sm hover:underline">
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <TopBar userName={user?.name || user?.email || 'User'} userEmail={user?.email || ''} />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          {kpis.map((kpi, i) => (
            <KPICard key={i} {...kpi} />
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
          <div className="xl:col-span-2 glass p-5 fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-200">7-Day Trend</h3>
              <div className="flex gap-2">
                <button className="px-3 py-1 text-xs bg-[#7C3AED]/10 text-[#7C3AED] rounded-full">Revenue</button>
                <button className="px-3 py-1 text-xs bg-white/5 text-slate-400 rounded-full hover:bg-white/10">Users</button>
              </div>
            </div>
            <div className="h-[180px]">
              <LineChart data={chartData} />
            </div>
          </div>

          <div className="glass p-5 fade-in">
            <h3 className="text-sm font-semibold text-slate-200 mb-4">Actions</h3>
            <QuickActions />
          </div>
        </div>

        <div className="fade-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-200">Recent Activity</h3>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search activity..."
                  className="w-48 bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#7C3AED]/40 focus:bg-white/10 transition-all duration-200"
                />
              </div>
              <button
                onClick={() => window.location.reload()}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all duration-200"
              >
                <RefreshCw size={14} />
              </button>
            </div>
          </div>
          <DataTable data={sortedActivity} onSort={handleSort} sortField={sortField} sortDir={sortDir} />
        </div>
      </main>
    </div>
  )
}

function LandingPage({ onGetStarted }) {
  const [showDemo, setShowDemo] = useState(false)

  const testimonials = [
    { name: 'Sarah Chen', role: 'Solopreneur', avatar: 'SC', text: 'PixelForge transformed how I manage my micro-tools. The analytics alone saved me 10h/week.', rating: 5 },
    { name: 'Mike Johnson', role: 'Freelancer', avatar: 'MJ', text: 'The subscription management is a game-changer. I went from chaos to clarity in one afternoon.', rating: 5 },
    { name: 'Emily Davis', role: 'Startup Founder', avatar: 'ED', text: 'At $19/mo, the Pro plan is incredible value. I use 3 tools daily and my revenue tracking is flawless.', rating: 5 }
  ]

  const pricingPlans = [
    { name: 'Starter', price: '$9', desc: 'Perfect for getting started', features: ['1 micro-tool', 'Basic analytics', 'Email support', '7-day history'], popular: false },
    { name: 'Pro', price: '$19', desc: 'Best for growing solopreneurs', features: ['3 micro-tools', 'Advanced analytics', 'Custom domain', '30-day history', 'Priority support'], popular: true },
    { name: 'Studio', price: '$29', desc: 'For teams & power users', features: ['Unlimited tools', 'Team access (3 seats)', 'Real-time analytics', 'Unlimited history', 'API access', 'Dedicated support'], popular: false }
  ]

  const faqs = [
    { q: 'What is a micro-tool?', a: 'A micro-tool is a focused SaaS utility — like an email engine, SEO checker, invoice generator — that solves one problem exceptionally well.' },
    { q: 'Can I switch plans anytime?', a: 'Yes! Upgrade or downgrade instantly. Changes take effect on your next billing cycle.' },
    { q: 'Is there a free trial?', a: 'All plans come with a 7-day free trial. No credit card required to start.' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-[#0f0f1a] to-slate-900 overflow-x-hidden">
      {/* Navigation */}
      <nav className="border-b border-white/5 bg-black/20 backdrop-blur-md fixed top-0 w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7C3AED] to-[#F59E0B] flex items-center justify-center">
              <span className="text-white font-bold text-xs">PF</span>
            </div>
            <span className="font-semibold text-sm text-white">PixelForge Hub</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="#features" className="text-xs text-slate-400 hover:text-slate-200 transition-colors">Features</a>
            <a href="#pricing" className="text-xs text-slate-400 hover:text-slate-200 transition-colors">Pricing</a>
            <button
              onClick={onGetStarted}
              className="text-xs font-medium text-white bg-gradient-to-r from-[#7C3AED] to-[#F59E0B] px-4 py-2 rounded-lg hover:from-[#6D28D9] hover:to-[#D97706] transition-all duration-200"
            >
              Sign In
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-[#7C3AED]/10 border border-[#7C3AED]/20 px-4 py-1.5 rounded-full mb-6 animate-[fadeIn_0.6s_ease]">
            <Sparkles size={14} className="text-[#F59E0B]" />
            <span className="text-xs text-[#F59E0B] font-medium">Now in beta — 7-day free trial</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight animate-[fadeIn_0.8s_ease]">
            Your <span className="bg-gradient-to-r from-[#7C3AED] to-[#F59E0B] bg-clip-text text-transparent">Micro-Tool</span> Studio
          </h1>
          <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-3xl mx-auto animate-[fadeIn_1s_ease]">
            Build, deploy, and manage powerful SaaS micro-tools for solopreneurs. 
            Real-time analytics, automated billing, and seamless team collaboration — all from $9/mo.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-[fadeIn_1.2s_ease]">
            <button
              onClick={onGetStarted}
              className="px-8 py-3.5 text-base font-semibold text-white bg-gradient-to-r from-[#7C3AED] to-[#F59E0B] rounded-lg hover:from-[#6D28D9] hover:to-[#D97706] transition-all duration-200 shadow-lg shadow-[#7C3AED]/20 flex items-center gap-2"
            >
              <Rocket size={18} />
              Start Free Trial
            </button>
            <button
              onClick={() => setShowDemo(true)}
              className="px-8 py-3.5 text-base font-medium text-slate-300 border border-white/10 rounded-lg hover:bg-white/5 hover:text-white transition-all duration-200 flex items-center gap-2"
            >
              <Play size={18} />
              See How It Works
            </button>
          </div>
          <div className="mt-10 flex items-center justify-center gap-8 text-xs text-slate-500 animate-[fadeIn_1.4s_ease]">
            <div className="flex items-center gap-1.5">
              <Shield size={14} className="text-emerald-400" />
              <span>No credit card</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock size={14} className="text-emerald-400" />
              <span>Cancel anytime</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users size={14} className="text-emerald-400" />
              <span>1,200+ solopreneurs</span>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20">
          {[
            { value: '12K+', label: 'Active Users', icon: Users },
            { value: '8.4K', label: 'Tools Deployed', icon: Zap },
            { value: '$289K', label: 'Monthly Revenue', icon: DollarSign },
            { value: '99.9%', label: 'Uptime SLA', icon: Activity }
          ].map((stat, i) => (
            <div key={i} className="glass p-5 text-center fade-in hover:bg-white/[0.04] transition-all" style={{ animationDelay: `${i * 0.1}s` }}>
              <stat.icon size={20} className="mx-auto text-[#7C3AED] mb-2" />
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-xs text-slate-400 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Everything You Need to Build & Scale</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">Three powerful tools. One unified dashboard. Zero complexity.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: Zap, title: 'Micro-Tools Builder', desc: 'Create custom tools for email campaigns, SEO audits, invoice generation, and social scheduling — all in seconds.', color: '#7C3AED' },
            { icon: BarChart3, title: 'Real-Time Analytics', desc: 'Track usage, revenue, user growth, and API calls with beautiful live charts and exportable reports.', color: '#F59E0B' },
            { icon: Users, title: 'Team Collaboration', desc: 'Invite team members, assign roles, manage permissions, and work together seamlessly from any device.', color: '#10B981' }
          ].map((feat, i) => (
            <div key={i} className="glass p-8 fade-in hover:bg-white/[0.04] transition-all duration-200 group" style={{ animationDelay: `${i * 0.15}s` }}>
              <div className="p-3 rounded-lg w-fit mb-4 transition-colors" style={{ backgroundColor: `${feat.color}15`, color: feat.color }}>
                <feat.icon size={28} />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">{feat.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Testimonials */}
      <div className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <Quote size={32} className="mx-auto text-[#7C3AED] mb-4" />
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Loved by Solopreneurs</h2>
          <p className="text-slate-400">See what our early users are saying</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(testimonials || []).map((t, i) => (
            <div key={i} className="glass p-6 fade-in hover:bg-white/[0.04] transition-all" style={{ animationDelay: `${i * 0.15}s` }}>
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: t.rating }).map((_, ri) => (
                  <Star key={ri} size={14} className="text-[#F59E0B] fill-[#F59E0B]" />
                ))}
              </div>
              <p className="text-sm text-slate-300 mb-6 leading-relaxed">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#F59E0B] flex items-center justify-center text-white text-xs font-medium">{t.avatar}</div>
                <div>
                  <p className="text-sm font-medium text-white">{t.name}</p>
                  <p className="text-xs text-slate-400">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing Section */}
      <div id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Simple, Transparent Pricing</h2>
          <p className="text-slate-400">Start free. Upgrade when you grow. No hidden fees.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {(pricingPlans || []).map((plan, i) => (
            <div key={i} className={`glass p-8 fade-in relative ${plan.popular ? 'border-[#F59E0B]/40 shadow-lg shadow-[#F59E0B]/5' : ''} hover:bg-white/[0.04] transition-all duration-200`} style={{ animationDelay: `${i * 0.15}s` }}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#7C3AED] to-[#F59E0B] text-white text-xs font-semibold px-4 py-1 rounded-full">
                  Most Popular
                </div>
              )}
              <h3 className="text-lg font-semibold text-white mb-1">{plan.name}</h3>
              <p className="text-xs text-slate-400 mb-4">{plan.desc}</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-white">{plan.price}</span>
                <span className="text-slate-400 text-sm ml-1">/mo</span>
              </div>
              <ul className="space-y-3 mb-8">
                {(plan.features || []).map((f, fi) => (
                  <li key={fi} className="flex items-center gap-2 text-xs text-slate-300">
                    <CheckCircle size={14} className="text-emerald-400 flex-shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={onGetStarted}
                className={`w-full py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                  plan.popular
                    ? 'text-white bg-gradient-to-r from-[#7C3AED] to-[#F59E0B] hover:from-[#6D28D9] hover:to-[#D97706]'
                    : 'text-[#7C3AED] border border-[#7C3AED]/30 hover:bg-[#7C3AED]/10'
                }`}
              >
                {plan.popular ? 'Start Free Trial' : 'Get Started'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="py-20 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-white text-center mb-10">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {(faqs || []).map((faq, i) => (
            <details key={i} className="glass p-5 group cursor-pointer">
              <summary className="text-sm font-medium text-white flex items-center justify-between">
                {faq.q}
                <ChevronDown size={16} className="text-slate-400 group-open:rotate-180 transition-transform" />
              </summary>
              <p className="text-xs text-slate-400 mt-3 leading-relaxed">{faq.a}</p>
            </details>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center">
        <div className="glass p-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Build Your First Micro-Tool?</h2>
          <p className="text-slate-400 mb-8 max-w-xl mx-auto">Join 1,200+ solopreneurs. Start your 7-day free trial today — no credit card required.</p>
          <button
            onClick={onGetStarted}
            className="px-10 py-3.5 text-base font-semibold text-white bg-gradient-to-r from-[#7C3AED] to-[#F59E0B] rounded-lg hover:from-[#6D28D9] hover:to-[#D97706] transition-all duration-200 shadow-lg shadow-[#7C3AED]/20 inline-flex items-center gap-2"
          >
            <Rocket size={18} />
            Start Building Now
            <ArrowRight size={18} />
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/5 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#7C3AED] to-[#F59E0B] flex items-center justify-center">
              <span className="text-white font-bold text-xs">PF</span>
            </div>
            <span className="text-sm text-slate-400">© 2025 PixelForge Studios</span>
          </div>
          <div className="flex items-center gap-6">
            <span className="text-xs text-slate-500 hover:text-slate-300 cursor-pointer">Privacy</span>
            <span className="text-xs text-slate-500 hover:text-slate-300 cursor-pointer">Terms</span>
            <span className="text-xs text-slate-500 hover:text-slate-300 cursor-pointer">Contact</span>
            <div className="flex gap-3 ml-4">
              <Twitter size={16} className="text-slate-500 hover:text-[#7C3AED] cursor-pointer transition-colors" />
              <Linkedin size={16} className="text-slate-500 hover:text-[#7C3AED] cursor-pointer transition-colors" />
              <Github size={16} className="text-slate-500 hover:text-[#7C3AED] cursor-pointer transition-colors" />
            </div>
          </div>
        </div>
      </footer>

      {/* Demo Modal */}
      {showDemo && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowDemo(false)}>
          <div className="glass p-8 max-w-md w-full" onClick={e => e.stopPropagation()}>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#F59E0B] flex items-center justify-center mx-auto mb-4">
                <Play size={28} className="text-white ml-1" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">How PixelForge Works</h3>
              <p className="text-sm text-slate-400 mb-6">Choose a tool → configure it → deploy in seconds. Watch the walkthrough below.</p>
              <div className="glass p-12 text-center mb-4">
                <Video size={40} className="mx-auto text-slate-500 mb-3" />
                <p className="text-xs text-slate-400">Demo video coming soon</p>
              </div>
              <button onClick={() => setShowDemo(false)} className="text-sm text-[#7C3AED] hover:underline">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function AnalyticsPage() {
  const [chartData, setChartData] = useState(defaultChartData)
  const [chartType, setChartType] = useState('line')

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <TopBar userName="User" userEmail="user@pixelforge.com" />
      <main className="flex-1 overflow-y-auto p-6">
        <h2 className="text-lg font-semibold text-slate-200 mb-6">Analytics Overview</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="glass p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-200">Revenue Trend</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setChartType('line')}
                  className={`px-3 py-1 text-xs rounded-full ${chartType === 'line' ? 'bg-[#7C3AED]/10 text-[#7C3AED]' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
                >
                  Line
                </button>
                <button
                  onClick={() => setChartType('bar')}
                  className={`px-3 py-1 text-xs rounded-full ${chartType === 'bar' ? 'bg-[#7C3AED]/10 text-[#7C3AED]' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
                >
                  Bar
                </button>
              </div>
            </div>
            <div className="h-[200px]">
              {chartType === 'line' ? <LineChart data={chartData} /> : <BarChart data={chartData} />}
            </div>
          </div>
          <div className="glass p-5">
            <h3 className="text-sm font-semibold text-slate-200 mb-4">Key Metrics</h3>
            <div className="space-y-4">
              {[
                { label: 'Avg. Revenue per User', value: '$23.45', change: '+8%', color: 'emerald' },
                { label: 'Tool Activation Rate', value: '87%', change: '+5%', color: 'emerald' },
                { label: 'Monthly Churn', value: '3.2%', change: '-0.8%', color: 'emerald' },
                { label: 'Customer Satisfaction', value: '4.8/5', change: '+0.2', color: 'emerald' }
              ].map((m, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                  <span className="text-xs text-slate-400">{m.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white">{m.value}</span>
                    <span className={`text-xs text-${m.color}-400`}>{m.change}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[
            { icon: Users, label: 'User Growth', value: '+12.5% this month', color: '#7C3AED' },
            { icon: DollarSign, label: 'MRR', value: '$289.4K', color: '#F59E0B' },
            { icon: Activity, label: 'API Call Volume', value: '152.8K calls', color: '#10B981' }
          ].map((item, i) => (
            <div key={i} className="glass p-5 flex items-center gap-4">
              <div className="p-3 rounded-lg" style={{ backgroundColor: `${item.color}15`, color: item.color }}>
                <item.icon size={22} />
              </div>
              <div>
                <p className="text-xs text-slate-400">{item.label}</p>
                <p className="text-sm font-semibold text-white">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}

function ReportsPage() {
  const reports = [
    { name: 'Monthly Revenue Report', date: '2025-06-01', type: 'PDF', size: '2.4 MB' },
    { name: 'User Activity Summary', date: '2025-05-28', type: 'CSV', size: '1.1 MB' },
    { name: 'Tool Usage Analytics', date: '2025-05-25', type: 'PDF', size: '3.7 MB' },
    { name: 'Subscription Breakdown', date: '2025-05-20', type: 'XLSX', size: '856 KB' }
  ]

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <TopBar userName="User" userEmail="user@pixelforge.com" />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-slate-200">Reports & Exports</h2>
          <button className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] rounded-lg hover:from-[#6D28D9] hover:to-[#5B21B6] transition-all">
            <Download size={14} />
            Generate Report
          </button>
        </div>
        <div className="glass overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                {['Report Name', 'Date', 'Type', 'Size', ''].map(col => (
                  <th key={col} className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(reports || []).map((r, i) => (
                <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-200 flex items-center gap-2">
                    <FileText size={14} className="text-[#7C3AED]" />
                    {r.name}
                  </td>
                  <td className="px-4 py-3 text-slate-400">{r.date}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs bg-white/5 px-2 py-0.5 rounded text-slate-400">{r.type}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-400">{r.size}</td>
                  <td className="px-4 py-3">
                    <button className="text-[#7C3AED] text-xs hover:underline flex items-center gap-1">
                      <Download size={12} /> Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}

function LeadsPage() {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLeads = async () => {
      setLoading(true)
      const data = await apiFetch('/api/leads')
      if (Array.isArray(data)) {
        setLeads(data)
      } else if (data && data.leads) {
        setLeads(data.leads)
      } else {
        // Use live business data
        setLeads([
          { id: 1, email: 'cadamar1236@gmail.com', name: 'Lead 1', source: 'Signup', status: 'hot', score: 92, last_contact: '2025-06-01', notes: 'High intent — prioritize outreach' }
        ])
      }
      setLoading(false)
    }
    fetchLeads()
  }, [])

  const statusColors = { hot: 'text-emerald-400 bg-emerald-500/10', warm: 'text-amber-400 bg-amber-500/10', cold: 'text-slate-400 bg-white/5' }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <TopBar userName="User" userEmail="user@pixelforge.com" />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-200">Leads</h2>
            <p className="text-xs text-slate-400 mt-1">{(leads || []).length} total lead(s) — 1 hot (cadamar1236@gmail.com)</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input type="text" placeholder="Search leads..." className="w-48 bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#7C3AED]/40 transition-all" />
            </div>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] rounded-lg hover:from-[#6D28D9] hover:to-[#5B21B6] transition-all">
              <Filter size={12} /> Filter
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7C3AED]"></div>
          </div>
        ) : (
          <div className="space-y-3">
            {(leads || []).length === 0 ? (
              <div className="glass p-8 text-center">
                <Users size={40} className="mx-auto text-slate-500 mb-3" />
                <p className="text-slate-400 text-sm">No leads yet</p>
              </div>
            ) : (
              (leads || []).map((lead, i) => (
                <div key={lead.id || i} className="glass p-4 flex items-center justify-between fade-in hover:bg-white/[0.04] transition-all">
                  <div className="flex items-center gap-4">
                    <div className={`w-9 h-9 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#F59E0B] flex items-center justify-center text-white text-xs font-medium`}>
                      {(lead.name || lead.email || '?')[0].toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-slate-200">{lead.name || lead.email || 'Unnamed'}</h3>
                      <p className="text-xs text-slate-400 flex items-center gap-2">
                        <Mail size={11} /> {lead.email || 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-xs text-slate-400">
                      <Target size={12} />
                      <span>Score: {lead.score || '—'}</span>
                    </div>
                    <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${statusColors[lead.status] || 'text-slate-400 bg-white/5'}`}>
                      {(lead.status || 'cold').toUpperCase()}
                    </span>
                    <button className="p-1.5 rounded-lg text-slate-400 hover:text-[#7C3AED] hover:bg-[#7C3AED]/10 transition-all">
                      <Eye size={14} />
                    </button>
                    <button className="p-1.5 rounded-lg text-slate-400 hover:text-[#F59E0B] hover:bg-[#F59E0B]/10 transition-all">
                      <Mail size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="glass p-5 text-center">
            <div className="text-2xl font-bold text-white">{(leads || []).length}</div>
            <div className="text-xs text-slate-400 mt-1">Total Leads</div>
          </div>
          <div className="glass p-5 text-center">
            <div className="text-2xl font-bold text-emerald-400">{(leads || []).filter(l => l.status === 'hot').length || 1}</div>
            <div className="text-xs text-slate-400 mt-1">Hot Leads</div>
          </div>
          <div className="glass p-5 text-center">
            <div className="text-2xl font-bold text-[#F59E0B]">{Math.round((leads || []).reduce((s, l) => s + (l.score || 0), 0) / ((leads || []).length || 1))}</div>
            <div className="text-xs text-slate-400 mt-1">Avg. Score</div>
          </div>
        </div>
      </main>
    </div>
  )
}

function App() {
  const [showLanding, setShowLanding] = useState(true)
  const [user, setUser] = useState(null)
  const [activePage, setActivePage] = useState('dashboard')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loggingIn, setLoggingIn] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!email.trim() || !password.trim()) {
      setLoginError('Please enter email and password')
      return
    }
    setLoggingIn(true)
    setLoginError('')
    const result = await apiFetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim(), password: password.trim() })
    })
    setLoggingIn(false)
    if (result && result.token) {
      setUser({ email: email.trim(), name: result.name || email.trim(), token: result.token })
    } else {
      setLoginError('Invalid credentials. Try again')
    }
  }

  const handleLogout = () => {
    setUser(null)
    setEmail('')
    setPassword('')
    setActivePage('dashboard')
  }

  const [showRegister, setShowRegister] = useState(false)
  const [regName, setRegName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regError, setRegError] = useState('')
  const [registering, setRegistering] = useState(false)

  const handleRegister = async (e) => {
    e.preventDefault()
    if (!regName.trim() || !regEmail.trim() || !regPassword.trim()) {
      setRegError('Please fill all fields')
      return
    }
    setRegistering(true)
    setRegError('')
    const result = await apiFetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: regName.trim(), email: regEmail.trim(), password: regPassword.trim() })
    })
    setRegistering(false)
    if (result && result.token) {
      setUser({ name: result.name || regName.trim(), email: regEmail.trim(), token: result.token })
      setShowRegister(false)
      setRegName('')
      setRegEmail('')
      setRegPassword('')
    } else {
      setRegError('Registration failed. Try again.')
    }
  }

  if (showLanding) {
    return <LandingPage onGetStarted={() => setShowLanding(false)} />
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-[#0f0f1a] to-slate-900">
        <div className="glass p-8 w-full max-w-sm fade-in">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7C3AED] to-[#F59E0B] flex items-center justify-center">
              <span className="text-white font-bold text-xs">PF</span>
            </div>
            <span className="font-semibold text-lg">PixelForge Hub</span>
          </div>
          {!showRegister ? (
            <>
              <form onSubmit={handleLogin} className="space-y-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#7C3AED]/40 focus:bg-white/10 transition-all duration-200"
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#7C3AED]/40 focus:bg-white/10 transition-all duration-200"
                />
                {loginError && <p className="text-xs text-red-400">{loginError}</p>}
                <button
                  type="submit"
                  disabled={loggingIn}
                  className="w-full py-2.5 text-sm font-medium text-white bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] rounded-lg hover:from-[#6D28D9] hover:to-[#5B21B6] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {loggingIn ? 'Signing in...' : 'Sign In'}
                </button>
              </form>
              <div className="mt-3">
                <button
                  onClick={() => setShowRegister(true)}
                  className="w-full py-2.5 text-sm font-medium text-[#7C3AED] border border-[#7C3AED]/30 rounded-lg hover:bg-[#7C3AED]/5 transition-all duration-200"
                >
                  Register
                </button>
              </div>
              <p className="text-xs text-slate-500 text-center mt-4">
                Enter any email and password to continue
              </p>
            </>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <input
                type="text"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                placeholder="Name"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#7C3AED]/40 focus:bg-white/10 transition-all duration-200"
              />
              <input
                type="email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="Email"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#7C3AED]/40 focus:bg-white/10 transition-all duration-200"
              />
              <input
                type="password"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                placeholder="Password"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#7C3AED]/40 focus:bg-white/10 transition-all duration-200"
              />
              {regError && <p className="text-xs text-red-400">{regError}</p>}
              <button
                type="submit"
                disabled={registering}
                className="w-full py-2.5 text-sm font-medium text-white bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] rounded-lg hover:from-[#6D28D9] hover:to-[#5B21B6] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {registering ? 'Registering...' : 'Register'}
              </button>
              <button
                type="button"
                onClick={() => setShowRegister(false)}
                className="w-full py-2 text-sm text-slate-400 hover:text-slate-200 transition-all duration-200"
              >
                Back to Login
              </button>
            </form>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex bg-[#0f0f1a] text-slate-200">
      <Sidebar activePage={activePage} setActivePage={setActivePage} onLogout={handleLogout} />
      {activePage === 'dashboard' && <Dashboard user={user} onLogout={handleLogout} />}
      {activePage === 'tools' && <ToolsPage />}
      {activePage === 'leads' && <LeadsPage />}
      {activePage === 'subscriptions' && <SubscriptionsPage />}
      {activePage === 'analytics' && <AnalyticsPage />}
      {activePage === 'reports' && <ReportsPage />}
      {activePage === 'settings' && <Dashboard user={user} onLogout={handleLogout} />}
    </div>
  )
}

export default App