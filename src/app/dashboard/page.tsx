'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import { Wine, BarChart3, TrendingUp, TrendingDown, Bell, Plus, DollarSign, MapPin, Clock, Flame, ArrowRight } from 'lucide-react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { WineChatbot } from '@/components/WineChatbot'

const COLORS = ['#7c3aed', '#2563eb', '#059669', '#d97706', '#dc2626', '#8b5cf6', '#06b6d4', '#f43f5e']

export default function DashboardPage() {
  const supabase = useMemo(() => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!), [])
  const [wines, setWines] = useState<any[]>([])
  const [alerts, setAlerts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      supabase.from('wines').select('*').order('created_at', { ascending: false }),
      supabase.from('drinking_alerts').select('*, wines(name, producer, vintage)').order('created_at', { ascending: false }).limit(5),
    ]).then(([wineRes, alertRes]) => {
      setWines(wineRes.data || [])
      setAlerts(alertRes.data || [])
      setLoading(false)
    })
  }, [supabase])

  const totalBottles = wines.reduce((s, w) => s + (w.quantity || 0), 0)
  const totalValue = wines.reduce((s, w) => s + ((w.current_market_value || 0) * (w.quantity || 0)), 0)
  const totalCost = wines.reduce((s, w) => s + ((w.purchase_price || 0) * (w.quantity || 0)), 0)
  const roi = totalCost > 0 ? ((totalValue - totalCost) / totalCost * 100) : 0

  const regionData = Object.entries(
    wines.reduce((acc: Record<string, number>, w) => { const r = w.region || 'Other'; acc[r] = (acc[r] || 0) + (w.quantity || 0); return acc }, {})
  ).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)

  const countryData = Object.entries(
    wines.reduce((acc: Record<string, number>, w) => { const c = w.country || 'Other'; acc[c] = (acc[c] || 0) + ((w.current_market_value || 0) * (w.quantity || 0)); return acc }, {})
  ).map(([name, value]) => ({ name, value: Math.round(value) })).sort((a, b) => b.value - a.value).slice(0, 6)

  const gainers = wines.filter(w => w.current_market_value && w.purchase_price && w.current_market_value > w.purchase_price)
    .map(w => ({ ...w, gain: ((w.current_market_value - w.purchase_price) / w.purchase_price * 100) }))
    .sort((a, b) => b.gain - a.gain).slice(0, 5)

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500">Loading your cellar...</div>

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2"><Wine className="h-5 w-5 text-purple-600" /><span className="font-bold text-gray-900">CellarMaster Pro</span></Link>
          <div className="flex items-center gap-5 text-sm">
            <Link href="/dashboard" className="font-medium text-purple-600">Dashboard</Link>
            <Link href="/collection" className="text-gray-600 hover:text-gray-900">Collection</Link>
            <Link href="/analytics" className="text-gray-600 hover:text-gray-900">Analytics</Link>
            <Link href="/scan" className="text-gray-600 hover:text-gray-900">Scan</Link>
            <Link href="/alerts" className="text-gray-600 hover:text-gray-900 relative">Alerts{alerts.length > 0 && <span className="absolute -top-1 -right-2 h-4 w-4 bg-red-500 text-white text-[9px] rounded-full flex items-center justify-center">{alerts.length}</span>}</Link>
            <Link href="/collection" className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700"><Plus className="h-3.5 w-3.5" /> Add Wine</Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Bottles', value: totalBottles.toString(), icon: <Wine className="h-5 w-5 text-purple-600" />, bg: 'bg-purple-50', sub: `${wines.length} wines` },
            { label: 'Collection Value', value: `€${totalValue.toLocaleString()}`, icon: <DollarSign className="h-5 w-5 text-green-600" />, bg: 'bg-green-50', sub: `invested €${totalCost.toLocaleString()}` },
            { label: 'ROI', value: `${roi >= 0 ? '+' : ''}${roi.toFixed(1)}%`, icon: roi >= 0 ? <TrendingUp className="h-5 w-5 text-emerald-600" /> : <TrendingDown className="h-5 w-5 text-red-600" />, bg: roi >= 0 ? 'bg-emerald-50' : 'bg-red-50', sub: `€${Math.abs(totalValue - totalCost).toLocaleString()} ${roi >= 0 ? 'profit' : 'loss'}` },
            { label: 'Regions', value: regionData.length.toString(), icon: <MapPin className="h-5 w-5 text-blue-600" />, bg: 'bg-blue-50', sub: `${[...new Set(wines.map(w => w.country).filter(Boolean))].length} countries` },
          ].map((s, i) => (
            <div key={i} className={`${s.bg} rounded-xl p-5`}>
              <div className="mb-2">{s.icon}</div>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-sm text-gray-500">{s.label}</p>
              <p className="text-xs text-gray-400 mt-1">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Market Intelligence */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-5 mb-6 border border-purple-100">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><Flame className="h-4 w-4 text-orange-500" /> Market Intelligence</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { icon: '🔥', text: '2015 Barolo Monfortino trending', sub: '+48% in 12 months', color: 'text-orange-700 bg-orange-50 border-orange-200' },
              { icon: '📈', text: 'Bordeaux 2019 rated exceptional', sub: 'Robert Parker: 98-100 pts', color: 'text-blue-700 bg-blue-50 border-blue-200' },
              { icon: '⚠️', text: 'Mouton Rothschild 2015 peaked', sub: 'Consider selling — €620/btl', color: 'text-amber-700 bg-amber-50 border-amber-200' },
            ].map((a, i) => (
              <div key={i} className={`rounded-lg border p-3 ${a.color}`}>
                <p className="text-sm font-medium">{a.icon} {a.text}</p>
                <p className="text-xs opacity-70 mt-0.5">{a.sub}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Pie Chart */}
          <div className="bg-white rounded-xl border p-5">
            <h3 className="font-semibold text-gray-900 mb-4">By Region</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={regionData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} label={({ name, percent }: any) => `${(name || '').slice(0, 12)} ${((percent || 0) * 100).toFixed(0)}%`} labelLine={false} fontSize={9}>
                  {regionData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Bar Chart */}
          <div className="bg-white rounded-xl border p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Value by Country</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={countryData}>
                <XAxis dataKey="name" fontSize={10} />
                <YAxis fontSize={10} tickFormatter={v => `€${(v / 1000).toFixed(0)}K`} />
                <Tooltip formatter={(v: any) => `€${Number(v).toLocaleString()}`} />
                <Bar dataKey="value" fill="#7c3aed" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Drink Soon */}
          <div className="bg-white rounded-xl border p-5">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><Clock className="h-4 w-4 text-orange-500" /> Drink Soon</h3>
            {alerts.length === 0 ? <p className="text-sm text-gray-500 py-8 text-center">No alerts</p> : (
              <div className="space-y-3">
                {alerts.map((a, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0"><Bell className="h-4 w-4 text-orange-500" /></div>
                    <div><p className="text-sm font-medium text-gray-900">{a.wines?.name} {a.wines?.vintage}</p><p className="text-xs text-gray-500">{a.message}</p></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Gainers */}
          <div className="bg-white rounded-xl border p-5">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><TrendingUp className="h-4 w-4 text-green-600" /> Top Gainers</h3>
            <div className="space-y-2">
              {gainers.map((w, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div><p className="text-sm font-medium text-gray-900">{w.name} {w.vintage}</p><p className="text-xs text-gray-500">{w.producer}</p></div>
                  <div className="text-right"><p className="text-sm font-bold text-green-600">+{w.gain.toFixed(1)}%</p><p className="text-xs text-gray-400">€{w.purchase_price} → €{w.current_market_value}</p></div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent */}
          <div className="bg-white rounded-xl border p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">Recent Additions</h3>
              <Link href="/collection" className="text-sm text-purple-600 hover:underline flex items-center gap-1">View all <ArrowRight className="h-3 w-3" /></Link>
            </div>
            <div className="space-y-2">
              {wines.slice(0, 6).map(w => (
                <div key={w.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-purple-50 flex items-center justify-center"><Wine className="h-4 w-4 text-purple-600" /></div>
                    <div><p className="text-sm font-medium text-gray-900">{w.name}</p><p className="text-xs text-gray-500">{w.vintage} · {w.region}</p></div>
                  </div>
                  <div className="text-right"><p className="text-sm font-semibold">{w.quantity} btl</p><p className="text-xs text-green-600">€{w.current_market_value || w.purchase_price}</p></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <WineChatbot wines={wines} />
    </div>
  )
}
