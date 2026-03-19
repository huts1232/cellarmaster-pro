'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import { Wine, Plus, Search, ArrowLeft, Save, Loader2, Trash2 } from 'lucide-react'

export default function CollectionPage() {
  const supabase = useMemo(() => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!), [])
  const [wines, setWines] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: '', producer: '', vintage: 2024, region: '', country: '', quantity: 1, purchase_price: '' })

  useEffect(() => { loadWines() }, [supabase])

  async function loadWines() {
    const { data } = await supabase.from('wines').select('*').order('created_at', { ascending: false })
    setWines(data || []); setLoading(false)
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault(); setSaving(true)
    await supabase.from('wines').insert({ ...form, purchase_price: form.purchase_price ? parseFloat(form.purchase_price) : null })
    setSaving(false); setShowAdd(false); setForm({ name: '', producer: '', vintage: 2024, region: '', country: '', quantity: 1, purchase_price: '' }); loadWines()
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this wine?')) return
    await supabase.from('wines').delete().eq('id', id); loadWines()
  }

  const filtered = wines.filter(w => !search || w.name?.toLowerCase().includes(search.toLowerCase()) || w.producer?.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b bg-white sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3"><Link href="/dashboard" className="text-gray-500 hover:text-gray-900"><ArrowLeft className="h-5 w-5" /></Link><Wine className="h-5 w-5 text-purple-600" /><span className="font-bold">Collection</span></div>
          <button onClick={() => setShowAdd(!showAdd)} className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700"><Plus className="h-4 w-4" /> Add Wine</button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {showAdd && (
          <form onSubmit={handleAdd} className="bg-white rounded-xl border p-6 mb-6 space-y-4">
            <h3 className="font-semibold">Add Wine</h3>
            <div className="grid grid-cols-2 gap-3">
              <input required placeholder="Wine name *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="col-span-2 px-3 py-2 border rounded-lg text-sm" />
              <input required placeholder="Producer *" value={form.producer} onChange={e => setForm(f => ({ ...f, producer: e.target.value }))} className="px-3 py-2 border rounded-lg text-sm" />
              <input type="number" placeholder="Vintage" value={form.vintage} onChange={e => setForm(f => ({ ...f, vintage: parseInt(e.target.value) }))} className="px-3 py-2 border rounded-lg text-sm" />
              <input placeholder="Region" value={form.region} onChange={e => setForm(f => ({ ...f, region: e.target.value }))} className="px-3 py-2 border rounded-lg text-sm" />
              <input placeholder="Country" value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))} className="px-3 py-2 border rounded-lg text-sm" />
              <input type="number" min="1" placeholder="Qty" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: parseInt(e.target.value) }))} className="px-3 py-2 border rounded-lg text-sm" />
              <input type="number" step="0.01" placeholder="Price (€)" value={form.purchase_price} onChange={e => setForm(f => ({ ...f, purchase_price: e.target.value }))} className="px-3 py-2 border rounded-lg text-sm" />
            </div>
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 border rounded-lg text-sm">Cancel</button>
              <button type="submit" disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm disabled:opacity-50">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save
              </button>
            </div>
          </form>
        )}

        <div className="relative mb-4">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input placeholder="Search wines..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm bg-white" />
        </div>

        {loading ? <div className="text-center py-12 text-gray-500">Loading...</div> : filtered.length === 0 ? (
          <div className="bg-white rounded-xl border p-12 text-center">
            <Wine className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">{search ? 'No wines match your search' : 'No wines yet. Add your first bottle!'}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(wine => (
              <div key={wine.id} className="bg-white rounded-xl border p-4 flex items-center justify-between hover:shadow-sm transition-all">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-purple-50 flex items-center justify-center"><Wine className="h-5 w-5 text-purple-600" /></div>
                  <div>
                    <p className="font-medium text-gray-900">{wine.name} {wine.vintage || ''}</p>
                    <p className="text-xs text-gray-500">{wine.producer} · {wine.region || ''} {wine.country || ''} · {wine.quantity} btl</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {wine.purchase_price && <span className="text-sm font-semibold text-green-700">€{wine.purchase_price}</span>}
                  <button onClick={() => handleDelete(wine.id)} className="text-gray-400 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
