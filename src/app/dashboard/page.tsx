'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import { Wine, BarChart3, TrendingUp, Bell, Plus, DollarSign, MapPin } from 'lucide-react'

export default function DashboardPage() {
  const supabase = useMemo(() => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!), [])
  const [wines, setWines] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('wines').select('*').order('created_at', { ascending: false }).limit(10)
      .then(({ data }) => { setWines(data || []); setLoading(false) })
  }, [supabase])

  const totalBottles = wines.reduce((s, w) => s + (w.quantity || 0), 0)
  const totalValue = wines.reduce((s, w) => s + ((w.current_market_value || 0) * (w.quantity || 0)), 0)
  const regions = [...new Set(wines.map(w => w.region).filter(Boolean))].length

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b bg-white sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2"><Wine className="h-5 w-5 text-purple-600" /><span className="font-bold text-gray-900">CellarMaster Pro</span></Link>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/dashboard" className="font-medium text-purple-600">Dashboard</Link>
            <Link href="/collection" className="text-gray-600 hover:text-gray-900">Collection</Link>
            <Link href="/analytics" className="text-gray-600 hover:text-gray-900">Analytics</Link>
            <Link href="/scan" className="text-gray-600 hover:text-gray-900">Scan</Link>
            <Link href="/profile" className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center text-xs font-bold text-purple-700">U</Link>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div><h1 className="text-2xl font-bold text-gray-900">Dashboard</h1><p className="text-sm text-gray-500">Your cellar at a glance</p></div>
          <Link href="/collection" className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700"><Plus className="h-4 w-4" /> Add Wine</Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Bottles', value: totalBottles.toString(), icon: <Wine className="h-5 w-5 text-purple-600" />, bg: 'bg-purple-50' },
            { label: 'Collection Value', value: `€${totalValue.toLocaleString()}`, icon: <DollarSign className="h-5 w-5 text-green-600" />, bg: 'bg-green-50' },
            { label: 'Regions', value: regions.toString(), icon: <MapPin className="h-5 w-5 text-blue-600" />, bg: 'bg-blue-50' },
            { label: 'Wine Types', value: wines.length.toString(), icon: <BarChart3 className="h-5 w-5 text-orange-600" />, bg: 'bg-orange-50' },
          ].map((s, i) => (
            <div key={i} className={`${s.bg} rounded-xl p-5`}>
              <div className="mb-2">{s.icon}</div>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-sm text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl border overflow-hidden">
          <div className="px-6 py-4 border-b flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Recent Wines</h2>
            <Link href="/collection" className="text-sm text-purple-600 hover:underline">View all →</Link>
          </div>
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : wines.length === 0 ? (
            <div className="p-12 text-center">
              <Wine className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No wines in your cellar yet</p>
              <Link href="/collection" className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700">Add your first wine</Link>
            </div>
          ) : (
            <div className="divide-y">
              {wines.slice(0, 5).map(wine => (
                <div key={wine.id} className="px-6 py-3 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-purple-50 flex items-center justify-center"><Wine className="h-5 w-5 text-purple-600" /></div>
                    <div>
                      <p className="font-medium text-gray-900">{wine.name}</p>
                      <p className="text-xs text-gray-500">{wine.producer} · {wine.vintage || 'NV'} · {wine.region || 'Unknown'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{wine.quantity} btl</p>
                    {wine.current_market_value && <p className="text-xs text-green-600">€{wine.current_market_value}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
