'use client'

import { useState, useEffect, useMemo } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import { Wine, ArrowLeft, Star, Clock, DollarSign, Thermometer, Utensils, TrendingUp, TrendingDown, BarChart3, Droplets, Check, Grape, MapPin, Award, Users } from 'lucide-react'

const BOTTLE_SHAPES: Record<string, string> = {
  red: 'from-red-900 to-red-700', white: 'from-yellow-700 to-yellow-500', sparkling: 'from-amber-600 to-amber-400',
  rosé: 'from-pink-600 to-pink-400', dessert: 'from-amber-800 to-amber-600', fortified: 'from-purple-900 to-purple-700',
}

export default function WineDetailPage() {
  const { id } = useParams<{ id: string }>()
  const supabase = useMemo(() => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!), [])
  const [wine, setWine] = useState<any>(null)
  const [similar, setSimilar] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'overview' | 'tasting' | 'market' | 'pairings' | 'storage'>('overview')

  useEffect(() => {
    supabase.from('wines').select('*').eq('id', id).single().then(({ data }) => {
      setWine(data); setLoading(false)
      if (data?.country) {
        supabase.from('wines').select('id,name,vintage,producer,current_market_value,parker_score,type').eq('country', data.country).neq('id', id).limit(5)
          .then(({ data: sim }) => setSimilar(sim || []))
      }
    })
  }, [id, supabase])

  if (loading) return <div className="min-h-screen bg-[#1a1a2e] flex items-center justify-center text-gray-400">Loading...</div>
  if (!wine) return <div className="min-h-screen bg-[#1a1a2e] flex items-center justify-center text-gray-400">Wine not found</div>

  const now = new Date().getFullYear()
  const drinkNow = wine.drinking_start && wine.drinking_end && now >= wine.drinking_start && now <= wine.drinking_end
  const roi = wine.purchase_price && wine.current_market_value ? ((wine.current_market_value - wine.purchase_price) / wine.purchase_price * 100) : null
  const avgScore = [wine.parker_score, wine.spectator_score].filter(Boolean)
  const avgScoreVal = avgScore.length ? (avgScore.reduce((a: number, b: number) => a + b, 0) / avgScore.length).toFixed(1) : null

  return (
    <div className="min-h-screen bg-[#1a1a2e] text-gray-100">
      <nav className="border-b border-white/5 bg-[#16213e] sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center gap-3">
          <Link href="/collection" className="text-gray-400 hover:text-white"><ArrowLeft className="h-5 w-5" /></Link>
          <Wine className="h-5 w-5 text-[#D4AF37]" /><span className="font-bold text-sm truncate">{wine.name} {wine.vintage || ''}</span>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* HERO */}
        <div className="flex gap-8 mb-10">
          <div className={`w-36 h-52 rounded-2xl bg-gradient-to-b ${BOTTLE_SHAPES[wine.type] || BOTTLE_SHAPES.red} flex items-center justify-center flex-shrink-0 shadow-2xl shadow-black/40 relative overflow-hidden`}>
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            <Wine className="h-20 w-20 text-white/40 relative z-10" />
            <div className="absolute bottom-3 left-0 right-0 text-center text-[9px] font-bold text-white/60 z-10">{wine.vintage || 'NV'}</div>
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap gap-2 mb-2">
              <span className="text-xs px-2.5 py-1 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] font-medium capitalize">{wine.type}</span>
              {wine.classification && <span className="text-xs px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 font-medium">{wine.classification}</span>}
              {drinkNow && <span className="text-xs px-2.5 py-1 rounded-full bg-green-500/20 text-green-400 font-medium">✅ Drink now</span>}
              {roi && roi > 20 && <span className="text-xs px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 font-medium">📈 Investment grade</span>}
            </div>
            <h1 className="text-3xl font-bold text-white mb-1" style={{ fontFamily: 'Georgia, serif' }}>{wine.name}</h1>
            <p className="text-lg text-gray-400 mb-1">{wine.vintage ? `${wine.vintage} · ` : ''}{wine.producer}</p>
            <p className="text-sm text-gray-500 mb-4 flex items-center gap-1"><MapPin className="h-3 w-3" /> {wine.region}{wine.sub_region ? `, ${wine.sub_region}` : ''}, {wine.country}</p>

            {/* Scores row */}
            <div className="flex gap-2 mb-4 flex-wrap">
              {wine.parker_score && <ScoreBadge label="Parker" score={wine.parker_score} color="bg-red-500/20 text-red-300 border-red-500/30" />}
              {wine.spectator_score && <ScoreBadge label="Spectator" score={wine.spectator_score} color="bg-blue-500/20 text-blue-300 border-blue-500/30" />}
              {wine.vivino_score && <ScoreBadge label="Vivino" score={`${wine.vivino_score}★`} color="bg-purple-500/20 text-purple-300 border-purple-500/30" />}
              {avgScoreVal && <ScoreBadge label="Average" score={avgScoreVal} color="bg-[#D4AF37]/20 text-[#D4AF37] border-[#D4AF37]/30" />}
            </div>

            {/* Price + ROI */}
            <div className="flex items-center gap-4">
              {wine.current_market_value && <p className="text-3xl font-bold text-[#D4AF37]">€{wine.current_market_value}</p>}
              {roi !== null && (
                <span className={`flex items-center gap-1 text-sm font-medium px-2.5 py-1 rounded-full ${roi >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                  {roi >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />} {roi >= 0 ? '+' : ''}{roi.toFixed(1)}%
                </span>
              )}
              <span className="text-sm text-gray-500">{wine.quantity} bottle{wine.quantity !== 1 ? 's' : ''} in cellar</span>
            </div>
          </div>
        </div>

        {/* TABS */}
        <div className="flex gap-1 mb-8 bg-[#16213e] rounded-xl p-1 w-fit border border-white/5">
          {(['overview', 'tasting', 'market', 'pairings', 'storage'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} className={`px-5 py-2.5 rounded-lg text-sm font-medium capitalize transition-all ${tab === t ? 'bg-[#D4AF37]/20 text-[#D4AF37]' : 'text-gray-500 hover:text-gray-300'}`}>{t}</button>
          ))}
        </div>

        {/* OVERVIEW TAB */}
        {tab === 'overview' && (
          <div className="space-y-6">
            {wine.description && <Card><p className="text-gray-300 leading-relaxed text-lg" style={{ fontFamily: 'Georgia, serif' }}>{wine.description}</p></Card>}

            {/* Quick Facts */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                wine.grapes && { label: 'Grapes', value: wine.grapes },
                wine.alcohol && { label: 'Alcohol', value: `${wine.alcohol}%` },
                wine.classification && { label: 'Classification', value: wine.classification },
                wine.bottle_size && { label: 'Format', value: wine.bottle_size },
                wine.region && { label: 'Region', value: wine.region },
                wine.country && { label: 'Country', value: wine.country },
                wine.type && { label: 'Type', value: wine.type.charAt(0).toUpperCase() + wine.type.slice(1) },
                { label: 'Quantity', value: `${wine.quantity} bottles` },
              ].filter(Boolean).map((f: any, i) => (
                <div key={i} className="bg-[#16213e] rounded-xl border border-white/5 p-4">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">{f.label}</p>
                  <p className="text-sm font-medium text-gray-200">{f.value}</p>
                </div>
              ))}
            </div>

            {/* Drinking Window */}
            {wine.drinking_start && (
              <Card>
                <h3 className="font-semibold mb-4 flex items-center gap-2 text-[#D4AF37]"><Clock className="h-4 w-4" /> Drinking Window</h3>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-sm text-gray-500 w-10">{wine.drinking_start}</span>
                  <div className="flex-1 h-4 bg-[#0f0f1a] rounded-full overflow-hidden relative">
                    {(() => {
                      const total = (wine.drinking_end || 2060) - wine.drinking_start
                      const peakPos = ((wine.drinking_peak || wine.drinking_start) - wine.drinking_start) / total * 100
                      const peakW = 20
                      const curPos = Math.min(Math.max((now - wine.drinking_start) / total * 100, 0), 100)
                      return <>
                        <div className="absolute inset-y-0 bg-yellow-600/40 rounded-l-full" style={{ left: '0%', width: `${peakPos}%` }} />
                        <div className="absolute inset-y-0 bg-green-500/60" style={{ left: `${peakPos}%`, width: `${peakW}%` }} />
                        <div className="absolute inset-y-0 bg-orange-500/30 rounded-r-full" style={{ left: `${peakPos + peakW}%`, right: '0%' }} />
                        <div className="absolute top-0 bottom-0 w-1 bg-[#D4AF37] shadow-lg shadow-[#D4AF37]/50" style={{ left: `${curPos}%` }} />
                      </>
                    })()}
                  </div>
                  <span className="text-sm text-gray-500 w-10 text-right">{wine.drinking_end}</span>
                </div>
                <div className="flex gap-6 text-xs text-gray-500">
                  <span>🟡 Aging</span><span>🟢 Peak: {wine.drinking_peak || '—'}</span><span>🟠 Declining</span>
                  <span className="ml-auto font-medium text-gray-300">{drinkNow ? '✅ Ready to drink now' : now < (wine.drinking_start || 2030) ? `⏳ Wait until ${wine.drinking_start}` : '⚠️ Past optimal window'}</span>
                </div>
              </Card>
            )}

            {/* Similar Wines */}
            {similar.length > 0 && (
              <Card>
                <h3 className="font-semibold mb-4 text-[#D4AF37]">Similar Wines</h3>
                <div className="space-y-2">
                  {similar.map(s => (
                    <Link key={s.id} href={`/wines/${s.id}`} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0 hover:bg-white/5 -mx-2 px-2 rounded">
                      <div className="flex items-center gap-3">
                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${s.type === 'red' ? 'bg-red-900/30' : 'bg-yellow-900/30'}`}>
                          <Wine className="h-4 w-4 text-gray-400" />
                        </div>
                        <div><p className="text-sm font-medium text-gray-200">{s.name} {s.vintage || ''}</p><p className="text-xs text-gray-500">{s.producer}</p></div>
                      </div>
                      <div className="text-right">
                        {s.current_market_value && <p className="text-sm font-medium text-[#D4AF37]">€{s.current_market_value}</p>}
                        {s.parker_score && <p className="text-[10px] text-red-400">RP {s.parker_score}</p>}
                      </div>
                    </Link>
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}

        {/* TASTING TAB */}
        {tab === 'tasting' && (
          <div className="space-y-6">
            {(wine.body || wine.tannin || wine.acidity) && (
              <Card>
                <h3 className="font-semibold mb-5 text-[#D4AF37]">Taste Profile</h3>
                <div className="space-y-4 max-w-lg">
                  {[
                    { label: 'Body', value: wine.body, low: 'Light', high: 'Full', color: 'bg-red-500' },
                    { label: 'Tannin', value: wine.tannin, low: 'Smooth', high: 'Firm', color: 'bg-purple-500' },
                    { label: 'Acidity', value: wine.acidity, low: 'Soft', high: 'Crisp', color: 'bg-yellow-500' },
                    { label: 'Sweetness', value: wine.sweetness, low: 'Dry', high: 'Sweet', color: 'bg-pink-400' },
                    wine.alcohol && { label: 'Alcohol', value: Math.round(wine.alcohol / 1.6), low: 'Low', high: 'High', color: 'bg-orange-500' },
                  ].filter(Boolean).map((p: any) => (
                    <div key={p.label}>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="text-gray-400">{p.label}</span>
                        <span className="font-medium text-gray-200">{p.value}/10</span>
                      </div>
                      <div className="relative">
                        <div className="h-3 bg-[#0f0f1a] rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${p.color} transition-all`} style={{ width: `${(p.value || 0) * 10}%` }} />
                        </div>
                        <div className="flex justify-between text-[9px] text-gray-600 mt-0.5"><span>{p.low}</span><span>{p.high}</span></div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {wine.aromas?.length > 0 && (
              <Card>
                <h3 className="font-semibold mb-4 text-[#D4AF37]">Aromas</h3>
                <div className="flex flex-wrap gap-2">
                  {wine.aromas.map((a: string) => (
                    <span key={a} className="px-3 py-1.5 bg-[#722F37]/20 text-[#D4AF37] border border-[#722F37]/30 rounded-full text-sm">{a}</span>
                  ))}
                </div>
              </Card>
            )}

            {wine.color && (
              <Card>
                <h3 className="font-semibold mb-3 text-[#D4AF37]">Color</h3>
                <div className="flex items-center gap-3">
                  <div className={`h-8 w-8 rounded-full ${wine.type === 'red' ? 'bg-gradient-to-br from-red-800 to-red-950' : wine.type === 'white' ? 'bg-gradient-to-br from-yellow-300 to-amber-400' : 'bg-gradient-to-br from-amber-400 to-yellow-300'} shadow-lg`} />
                  <span className="text-gray-300 capitalize">{wine.color}</span>
                </div>
              </Card>
            )}

            {wine.tasting_notes && <Card><h3 className="font-semibold mb-2 text-[#D4AF37]">Professional Notes</h3><p className="text-gray-300 leading-relaxed" style={{ fontFamily: 'Georgia, serif' }}>{wine.tasting_notes}</p></Card>}
          </div>
        )}

        {/* MARKET TAB */}
        {tab === 'market' && (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-[#16213e] rounded-xl border border-white/5 p-5 text-center">
                <p className="text-xs text-gray-500 mb-1">Purchase Price</p>
                <p className="text-xl font-bold text-gray-200">€{wine.purchase_price || '—'}</p>
              </div>
              <div className="bg-[#16213e] rounded-xl border border-[#D4AF37]/20 p-5 text-center">
                <p className="text-xs text-[#D4AF37] mb-1">Current Value</p>
                <p className="text-xl font-bold text-[#D4AF37]">€{wine.current_market_value || '—'}</p>
              </div>
              <div className={`bg-[#16213e] rounded-xl border p-5 text-center ${roi && roi >= 0 ? 'border-green-500/20' : 'border-red-500/20'}`}>
                <p className="text-xs text-gray-500 mb-1">ROI</p>
                <p className={`text-xl font-bold ${roi && roi >= 0 ? 'text-green-400' : 'text-red-400'}`}>{roi !== null ? `${roi >= 0 ? '+' : ''}${roi.toFixed(1)}%` : '—'}</p>
              </div>
            </div>

            <Card>
              <h3 className="font-semibold mb-4 text-[#D4AF37] flex items-center gap-2"><BarChart3 className="h-4 w-4" /> Investment Analysis</h3>
              <div className="space-y-3 text-sm">
                <Row label="Total investment" value={`€${((wine.purchase_price || 0) * (wine.quantity || 0)).toLocaleString()}`} />
                <Row label="Current total value" value={`€${((wine.current_market_value || 0) * (wine.quantity || 0)).toLocaleString()}`} highlight />
                <Row label="Profit/Loss" value={`€${(((wine.current_market_value || 0) - (wine.purchase_price || 0)) * (wine.quantity || 0)).toLocaleString()}`} highlight={roi ? roi >= 0 : false} />
                <Row label="Per bottle gain" value={roi !== null ? `€${((wine.current_market_value || 0) - (wine.purchase_price || 0)).toLocaleString()} (${roi.toFixed(1)}%)` : '—'} />
              </div>
            </Card>

            <Card>
              <h3 className="font-semibold mb-3 text-[#D4AF37]">Simulated Trade History</h3>
              <div className="overflow-hidden rounded-lg border border-white/5">
                <table className="w-full text-sm">
                  <thead><tr className="bg-[#0f0f1a] text-gray-500 text-xs"><th className="px-4 py-2 text-left">Date</th><th className="px-4 py-2 text-right">Price</th><th className="px-4 py-2 text-right">Qty</th><th className="px-4 py-2 text-left">Platform</th></tr></thead>
                  <tbody>
                    {[
                      { date: 'Mar 2026', price: wine.current_market_value, qty: '6 btls', platform: 'Liv-ex' },
                      { date: 'Feb 2026', price: Math.round((wine.current_market_value || 0) * 0.97), qty: '12 btls', platform: 'Auction' },
                      { date: 'Jan 2026', price: Math.round((wine.current_market_value || 0) * 0.93), qty: '3 btls', platform: 'Merchant' },
                      { date: 'Dec 2025', price: Math.round((wine.current_market_value || 0) * 0.90), qty: '6 btls', platform: 'Liv-ex' },
                    ].map((t, i) => (
                      <tr key={i} className="border-t border-white/5 text-gray-300">
                        <td className="px-4 py-2">{t.date}</td><td className="px-4 py-2 text-right font-mono">€{t.price}</td>
                        <td className="px-4 py-2 text-right">{t.qty}</td><td className="px-4 py-2 text-gray-500">{t.platform}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* PAIRINGS TAB */}
        {tab === 'pairings' && (
          <div className="space-y-6">
            {wine.food_pairings?.length > 0 ? (
              <Card>
                <h3 className="font-semibold mb-5 text-[#D4AF37] flex items-center gap-2"><Utensils className="h-4 w-4" /> Food Pairings</h3>
                <div className="grid grid-cols-2 gap-3">
                  {wine.food_pairings.map((dish: string, i: number) => {
                    const icons = ['🥩', '🧀', '🍫', '🦞', '🍝', '🥘', '🍖', '🍄', '🫕', '🥗']
                    const stars = i < 2 ? '★★★ Perfect' : i < 4 ? '★★ Great' : '★ Adventurous'
                    return (
                      <div key={i} className="bg-[#0f0f1a] rounded-xl p-4 flex items-center gap-4 border border-white/5 hover:border-[#D4AF37]/20 transition-colors">
                        <span className="text-3xl">{icons[i % icons.length]}</span>
                        <div>
                          <p className="font-medium text-gray-200">{dish}</p>
                          <p className="text-[10px] text-[#D4AF37]">{stars}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </Card>
            ) : (
              <Card><div className="text-center py-8"><Utensils className="h-10 w-10 text-gray-600 mx-auto mb-3" /><p className="text-gray-500">No pairing data available</p></div></Card>
            )}
          </div>
        )}

        {/* STORAGE TAB */}
        {tab === 'storage' && (
          <div className="space-y-6">
            <Card>
              <h3 className="font-semibold mb-5 text-[#D4AF37] flex items-center gap-2"><Thermometer className="h-4 w-4" /> Storage Guide</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: '🌡️', label: 'Temperature', value: wine.storage_temp || '14-16°C' },
                  { icon: '💧', label: 'Humidity', value: '65-75%' },
                  { icon: '🔅', label: 'Light', value: 'Store in dark — UV sensitive' },
                  { icon: '↔️', label: 'Position', value: 'Horizontal (keep cork moist)' },
                  { icon: '🍷', label: 'Serving temp', value: wine.type === 'red' ? '16-18°C' : wine.type === 'sparkling' ? '6-8°C' : '10-12°C' },
                  { icon: '⏱️', label: 'Decant', value: wine.type === 'red' && (wine.tannin || 0) >= 7 ? 'Yes — 1-2 hours' : 'Not necessary' },
                  { icon: '🥂', label: 'Glass', value: wine.type === 'red' ? 'Bordeaux glass (large, wide)' : wine.type === 'sparkling' ? 'Flute or tulip' : 'White wine glass' },
                  { icon: '📅', label: 'After opening', value: wine.type === 'fortified' ? '2-4 weeks' : wine.type === 'sparkling' ? '1-2 days' : '2-3 days' },
                ].map((item, i) => (
                  <div key={i} className="bg-[#0f0f1a] rounded-xl p-4 border border-white/5">
                    <div className="flex items-center gap-2 mb-1"><span>{item.icon}</span><span className="text-xs text-gray-500">{item.label}</span></div>
                    <p className="text-sm font-medium text-gray-200">{item.value}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="bg-[#16213e] rounded-xl border border-white/5 p-6">{children}</div>
}

function ScoreBadge({ label, score, color }: { label: string; score: string | number; color: string }) {
  return <div className={`rounded-lg border px-3 py-1.5 text-center ${color}`}><p className="text-lg font-bold leading-tight">{score}</p><p className="text-[9px] opacity-70">{label}</p></div>
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return <div className="flex justify-between py-2 border-b border-white/5"><span className="text-gray-500">{label}</span><span className={`font-medium ${highlight ? 'text-[#D4AF37]' : 'text-gray-200'}`}>{value}</span></div>
}
