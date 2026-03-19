'use client'
import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import { Wine, ArrowLeft, TrendingUp, DollarSign, MapPin, BarChart3 } from 'lucide-react'

export default function AnalyticsPage() {
  const supabase = useMemo(() => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!), [])
  const [wines, setWines] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => { supabase.from('wines').select('*').then(({ data }) => { setWines(data || []); setLoading(false) }) }, [supabase])

  const total = wines.reduce((s, w) => s + (w.quantity || 0), 0)
  const value = wines.reduce((s, w) => s + ((w.current_market_value || w.purchase_price || 0) * (w.quantity || 0)), 0)
  const cost = wines.reduce((s, w) => s + ((w.purchase_price || 0) * (w.quantity || 0)), 0)
  const regions = [...new Set(wines.map(w => w.region).filter(Boolean))]

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b bg-white sticky top-0 z-50"><div className="max-w-6xl mx-auto px-6 h-14 flex items-center gap-3"><Link href="/dashboard" className="text-gray-500 hover:text-gray-900"><ArrowLeft className="h-5 w-5" /></Link><Wine className="h-5 w-5 text-purple-600" /><span className="font-bold">Analytics</span></div></nav>
      <main className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold mb-6">Collection Analytics</h1>
        {loading ? <p className="text-gray-500">Loading...</p> : (
          <>
            <div className="grid grid-cols-4 gap-4 mb-8">
              {[{ l: 'Bottles', v: total, i: <Wine className="h-5 w-5 text-purple-600" />, bg: 'bg-purple-50' }, { l: 'Value', v: `€${value.toLocaleString()}`, i: <DollarSign className="h-5 w-5 text-green-600" />, bg: 'bg-green-50' }, { l: 'Invested', v: `€${cost.toLocaleString()}`, i: <TrendingUp className="h-5 w-5 text-blue-600" />, bg: 'bg-blue-50' }, { l: 'ROI', v: cost > 0 ? `${(((value-cost)/cost)*100).toFixed(1)}%` : '—', i: <BarChart3 className="h-5 w-5 text-orange-600" />, bg: 'bg-orange-50' }].map((s,i) => (
                <div key={i} className={`${s.bg} rounded-xl p-5`}>{s.i}<p className="text-2xl font-bold mt-2">{s.v}</p><p className="text-sm text-gray-500">{s.l}</p></div>
              ))}
            </div>
            <div className="bg-white rounded-xl border p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2"><MapPin className="h-4 w-4 text-purple-600" /> By Region</h3>
              {regions.length === 0 ? <p className="text-sm text-gray-500">Add wines with regions to see breakdown</p> : regions.map(r => {
                const c = wines.filter(w => w.region === r).reduce((s, w) => s + (w.quantity || 0), 0)
                return <div key={r} className="mb-3"><div className="flex justify-between text-sm mb-1"><span>{r}</span><span className="text-gray-500">{c} btl</span></div><div className="h-2 bg-gray-100 rounded-full"><div className="h-full bg-purple-500 rounded-full" style={{ width: `${total > 0 ? (c/total)*100 : 0}%` }} /></div></div>
              })}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
