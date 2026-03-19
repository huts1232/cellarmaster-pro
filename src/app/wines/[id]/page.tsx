'use client'

import { useState, useEffect, useMemo } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import { Wine, ArrowLeft, Star, Clock, DollarSign, Thermometer, Utensils, Droplets, Check, TrendingUp } from 'lucide-react'

export default function WineDetailPage() {
  const { id } = useParams<{ id: string }>()
  const supabase = useMemo(() => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!), [])
  const [wine, setWine] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'overview' | 'tasting' | 'market' | 'pairings'>('overview')

  useEffect(() => {
    supabase.from('wines').select('*').eq('id', id).single().then(({ data }) => { setWine(data); setLoading(false) })
  }, [id, supabase])

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading...</div>
  if (!wine) return <div className="min-h-screen flex items-center justify-center text-gray-500">Wine not found</div>

  const typeColors: Record<string, string> = { red: 'bg-red-100 text-red-800', white: 'bg-yellow-100 text-yellow-800', sparkling: 'bg-amber-100 text-amber-800', rosé: 'bg-pink-100 text-pink-800', fortified: 'bg-purple-100 text-purple-800', dessert: 'bg-orange-100 text-orange-800' }
  const drinkNow = wine.drinking_start && wine.drinking_end && new Date().getFullYear() >= wine.drinking_start && new Date().getFullYear() <= wine.drinking_end
  const roi = wine.purchase_price && wine.current_market_value ? ((wine.current_market_value - wine.purchase_price) / wine.purchase_price * 100) : null

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b bg-white sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center gap-3">
          <Link href="/collection" className="text-gray-500 hover:text-gray-900"><ArrowLeft className="h-5 w-5" /></Link>
          <Wine className="h-5 w-5 text-purple-600" /><span className="font-bold text-sm truncate">{wine.name}</span>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Hero */}
        <div className="flex gap-8 mb-8">
          {/* Bottle silhouette */}
          <div className="w-32 h-48 rounded-2xl bg-gradient-to-b from-gray-100 to-gray-200 flex items-center justify-center flex-shrink-0 shadow-inner">
            <Wine className={`h-16 w-16 ${wine.type === 'red' ? 'text-red-400' : wine.type === 'white' ? 'text-yellow-400' : 'text-purple-400'}`} />
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap gap-2 mb-2">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeColors[wine.type] || 'bg-gray-100 text-gray-700'}`}>{wine.type}</span>
              {wine.classification && <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-medium">{wine.classification}</span>}
              {drinkNow && <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">✅ Drink now</span>}
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">{wine.name} {wine.vintage || ''}</h1>
            <p className="text-lg text-gray-500 mb-3">{wine.producer} · {wine.region}{wine.sub_region ? `, ${wine.sub_region}` : ''}, {wine.country}</p>

            {/* Scores */}
            <div className="flex gap-3 mb-4">
              {wine.parker_score && <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-1.5 text-center"><p className="text-lg font-bold text-red-800">{wine.parker_score}</p><p className="text-[9px] text-red-600">Parker</p></div>}
              {wine.spectator_score && <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-1.5 text-center"><p className="text-lg font-bold text-blue-800">{wine.spectator_score}</p><p className="text-[9px] text-blue-600">Spectator</p></div>}
              {wine.vivino_score && <div className="bg-purple-50 border border-purple-200 rounded-lg px-3 py-1.5 text-center"><p className="text-lg font-bold text-purple-800">{wine.vivino_score}★</p><p className="text-[9px] text-purple-600">Vivino</p></div>}
            </div>

            {/* Price */}
            <div className="flex items-center gap-4">
              {wine.current_market_value && <p className="text-2xl font-bold text-green-700">€{wine.current_market_value}</p>}
              {roi !== null && <span className={`text-sm font-medium ${roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>{roi >= 0 ? '▲' : '▼'} {Math.abs(roi).toFixed(1)}% since purchase</span>}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-gray-100 rounded-lg p-1 w-fit">
          {(['overview', 'tasting', 'market', 'pairings'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-md text-sm font-medium capitalize transition-all ${tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>{t}</button>
          ))}
        </div>

        {tab === 'overview' && (
          <div className="space-y-6">
            {wine.description && <div className="bg-white rounded-xl border p-6"><p className="text-gray-700 leading-relaxed">{wine.description}</p></div>}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {wine.grapes && <Fact label="Grapes" value={wine.grapes} />}
              {wine.alcohol && <Fact label="Alcohol" value={`${wine.alcohol}%`} />}
              {wine.bottle_size && <Fact label="Bottle" value={wine.bottle_size} />}
              <Fact label="Quantity" value={`${wine.quantity} bottles`} />
            </div>

            {/* Drinking Window */}
            {wine.drinking_start && (
              <div className="bg-white rounded-xl border p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2"><Clock className="h-4 w-4 text-orange-500" /> Drinking Window</h3>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm text-gray-500">{wine.drinking_start}</span>
                  <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden relative">
                    {(() => {
                      const now = new Date().getFullYear()
                      const total = (wine.drinking_end || 2060) - wine.drinking_start
                      const peakStart = ((wine.drinking_peak || wine.drinking_start) - wine.drinking_start) / total * 100
                      const peakWidth = 15
                      const currentPos = Math.min(Math.max((now - wine.drinking_start) / total * 100, 0), 100)
                      return (
                        <>
                          <div className="absolute inset-y-0 bg-yellow-300 rounded-full" style={{ left: '0%', width: `${peakStart}%` }} />
                          <div className="absolute inset-y-0 bg-green-400 rounded-full" style={{ left: `${peakStart}%`, width: `${peakWidth}%` }} />
                          <div className="absolute inset-y-0 bg-orange-300 rounded-full" style={{ left: `${peakStart + peakWidth}%`, right: '0%' }} />
                          <div className="absolute top-0 bottom-0 w-0.5 bg-gray-900" style={{ left: `${currentPos}%` }} />
                        </>
                      )
                    })()}
                  </div>
                  <span className="text-sm text-gray-500">{wine.drinking_end}</span>
                </div>
                <div className="flex gap-4 text-xs text-gray-500">
                  <span>🟡 Aging</span><span>🟢 Peak: {wine.drinking_peak}</span><span>🟠 Declining</span>
                  <span className="ml-auto font-medium">{drinkNow ? '✅ Ready to drink' : `⏳ Wait until ${wine.drinking_start}`}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'tasting' && (
          <div className="space-y-6">
            {/* Taste Profile */}
            {(wine.body || wine.tannin || wine.acidity) && (
              <div className="bg-white rounded-xl border p-6">
                <h3 className="font-semibold mb-4">Taste Profile</h3>
                <div className="space-y-3 max-w-md">
                  {[
                    { label: 'Body', value: wine.body, color: 'bg-red-500' },
                    { label: 'Tannin', value: wine.tannin, color: 'bg-purple-500' },
                    { label: 'Acidity', value: wine.acidity, color: 'bg-yellow-500' },
                    { label: 'Sweetness', value: wine.sweetness, color: 'bg-pink-400' },
                  ].filter(p => p.value != null).map(p => (
                    <div key={p.label}>
                      <div className="flex justify-between text-sm mb-1"><span className="text-gray-600">{p.label}</span><span className="font-medium">{p.value}/10</span></div>
                      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden"><div className={`h-full rounded-full ${p.color}`} style={{ width: `${(p.value || 0) * 10}%` }} /></div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Aromas */}
            {wine.aromas?.length > 0 && (
              <div className="bg-white rounded-xl border p-6">
                <h3 className="font-semibold mb-3">Aromas</h3>
                <div className="flex flex-wrap gap-2">
                  {wine.aromas.map((a: string) => <span key={a} className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-full text-sm">{a}</span>)}
                </div>
              </div>
            )}

            {/* Color + Notes */}
            {wine.color && <div className="bg-white rounded-xl border p-6"><h3 className="font-semibold mb-2">Color</h3><p className="text-gray-700 capitalize">{wine.color}</p></div>}
            {wine.tasting_notes && <div className="bg-white rounded-xl border p-6"><h3 className="font-semibold mb-2">Tasting Notes</h3><p className="text-gray-700">{wine.tasting_notes}</p></div>}
          </div>
        )}

        {tab === 'market' && (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-xl border p-5 text-center"><p className="text-sm text-gray-500">Purchase Price</p><p className="text-xl font-bold text-gray-900">€{wine.purchase_price || '—'}</p></div>
              <div className="bg-green-50 rounded-xl border border-green-200 p-5 text-center"><p className="text-sm text-green-700">Current Value</p><p className="text-xl font-bold text-green-800">€{wine.current_market_value || '—'}</p></div>
              <div className={`rounded-xl border p-5 text-center ${roi && roi >= 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
                <p className="text-sm text-gray-500">ROI</p>
                <p className={`text-xl font-bold ${roi && roi >= 0 ? 'text-emerald-800' : 'text-red-800'}`}>{roi !== null ? `${roi >= 0 ? '+' : ''}${roi.toFixed(1)}%` : '—'}</p>
              </div>
            </div>
            <div className="bg-white rounded-xl border p-6">
              <h3 className="font-semibold mb-3 flex items-center gap-2"><TrendingUp className="h-4 w-4 text-green-600" /> Price Analysis</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-2 border-b"><span className="text-gray-500">Total investment</span><span className="font-medium">€{((wine.purchase_price || 0) * (wine.quantity || 0)).toLocaleString()}</span></div>
                <div className="flex justify-between py-2 border-b"><span className="text-gray-500">Current total value</span><span className="font-medium text-green-700">€{((wine.current_market_value || 0) * (wine.quantity || 0)).toLocaleString()}</span></div>
                <div className="flex justify-between py-2"><span className="text-gray-500">Profit/Loss</span><span className={`font-bold ${roi && roi >= 0 ? 'text-green-700' : 'text-red-700'}`}>€{(((wine.current_market_value || 0) - (wine.purchase_price || 0)) * (wine.quantity || 0)).toLocaleString()}</span></div>
              </div>
            </div>
          </div>
        )}

        {tab === 'pairings' && (
          <div className="space-y-6">
            {wine.food_pairings?.length > 0 ? (
              <div className="bg-white rounded-xl border p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2"><Utensils className="h-4 w-4 text-purple-600" /> Food Pairings</h3>
                <div className="grid grid-cols-2 gap-3">
                  {wine.food_pairings.map((dish: string, i: number) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <span className="text-2xl">{['🥩', '🧀', '🍫', '🦞', '🍕', '🥘'][i % 6]}</span>
                      <span className="text-sm font-medium text-gray-900">{dish}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl border p-12 text-center"><Utensils className="h-10 w-10 text-gray-300 mx-auto mb-3" /><p className="text-gray-500">No pairing data yet</p></div>
            )}
            {wine.storage_temp && (
              <div className="bg-white rounded-xl border p-6">
                <h3 className="font-semibold mb-3 flex items-center gap-2"><Thermometer className="h-4 w-4 text-blue-600" /> Storage</h3>
                <div className="text-sm text-gray-700"><p>🌡️ Serve at: {wine.storage_temp}</p><p className="mt-1">📦 Store horizontally in a dark, vibration-free space</p></div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

function Fact({ label, value }: { label: string; value: string }) {
  return <div className="bg-white rounded-xl border p-4"><p className="text-xs text-gray-500 mb-0.5">{label}</p><p className="text-sm font-medium text-gray-900">{value}</p></div>
}
