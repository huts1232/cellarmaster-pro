'use client'

import { useState, useRef, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { Wine, ArrowLeft, Camera, Upload, Loader2, Check, Star, Utensils, Clock, DollarSign } from 'lucide-react'

export default function ScanPage() {
  const supabase = useMemo(() => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!), [])
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')
  const [preview, setPreview] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)

  async function handleFile(file: File) {
    setPreview(URL.createObjectURL(file))
    setScanning(true); setError(''); setResult(null)
    const form = new FormData()
    form.append('image', file)
    try {
      const res = await fetch('/api/scan', { method: 'POST', body: form })
      const data = await res.json()
      if (data.error) { setError(data.error); setScanning(false); return }
      setResult(data)
    } catch { setError('Failed to analyze. Try again.') }
    setScanning(false)
  }

  async function handleAdd() {
    if (!result) return
    setAdding(true)
    await supabase.from('wines').insert({
      name: result.name, producer: result.producer, vintage: result.vintage,
      region: result.region, country: result.country, quantity: 1,
      purchase_price: parseFloat(result.estimatedValue?.replace(/[^0-9.]/g, '') || '0'),
    })
    setAdding(false)
    router.push('/collection')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b bg-white sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center gap-3">
          <Link href="/dashboard" className="text-gray-500 hover:text-gray-900"><ArrowLeft className="h-5 w-5" /></Link>
          <Wine className="h-5 w-5 text-purple-600" /><span className="font-bold">Label Scanner</span>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-6 py-8">
        {!result ? (
          <>
            <div className="text-center mb-8">
              <Camera className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-2">Scan a Wine Label</h1>
              <p className="text-gray-500">AI identifies the wine and gives you all the details</p>
            </div>

            <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden"
              onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />

            {preview && scanning ? (
              <div className="text-center py-12">
                <div className="relative inline-block mb-4">
                  <img src={preview} alt="Scanning" className="w-48 h-64 object-cover rounded-xl opacity-50" />
                  <div className="absolute inset-0 flex items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-purple-600" /></div>
                </div>
                <p className="text-purple-600 font-medium">Analyzing label...</p>
                <p className="text-xs text-gray-500 mt-1">This takes a few seconds</p>
              </div>
            ) : (
              <div onClick={() => fileRef.current?.click()}
                className="bg-white rounded-2xl border-2 border-dashed border-purple-300 p-16 text-center cursor-pointer hover:border-purple-500 hover:bg-purple-50/50 transition-all">
                <Upload className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                <p className="font-semibold text-gray-900 text-lg mb-1">Upload a photo of the label</p>
                <p className="text-sm text-gray-500">JPG, PNG up to 5MB · Or use your camera</p>
              </div>
            )}
            {error && <p className="text-red-500 text-sm text-center mt-4">{error}</p>}
          </>
        ) : (
          <div>
            <div className="flex gap-6 mb-6">
              {preview && <img src={preview} alt="Wine" className="w-32 h-44 object-cover rounded-xl shadow-lg" />}
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{result.name}</h2>
                <p className="text-gray-500">{result.producer}</p>
                <div className="flex gap-3 mt-3 text-sm">
                  {result.vintage && <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded">{result.vintage}</span>}
                  {result.region && <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded">{result.region}</span>}
                  {result.country && <span className="px-2 py-1 bg-green-50 text-green-700 rounded">{result.country}</span>}
                </div>
                {result.grape && <p className="text-sm text-gray-500 mt-2">🍇 {result.grape}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              {result.estimatedValue && (
                <div className="bg-green-50 rounded-xl p-4"><DollarSign className="h-5 w-5 text-green-600 mb-1" /><p className="text-lg font-bold text-green-800">{result.estimatedValue}</p><p className="text-xs text-green-600">Estimated value</p></div>
              )}
              {result.drinkingWindow && (
                <div className="bg-orange-50 rounded-xl p-4"><Clock className="h-5 w-5 text-orange-600 mb-1" /><p className="text-lg font-bold text-orange-800">{result.drinkingWindow}</p><p className="text-xs text-orange-600">Drinking window</p></div>
              )}
              {result.rating && (
                <div className="bg-yellow-50 rounded-xl p-4"><Star className="h-5 w-5 text-yellow-600 mb-1" /><p className="text-lg font-bold text-yellow-800">{result.rating}</p><p className="text-xs text-yellow-600">Rating</p></div>
              )}
              {result.foodPairings && (
                <div className="bg-purple-50 rounded-xl p-4"><Utensils className="h-5 w-5 text-purple-600 mb-1" /><p className="text-sm font-medium text-purple-800">{result.foodPairings?.join(', ')}</p><p className="text-xs text-purple-600">Food pairings</p></div>
              )}
            </div>

            {result.tastingNotes && (
              <div className="bg-white rounded-xl border p-4 mb-6">
                <h3 className="font-semibold text-sm mb-2">Tasting Notes</h3>
                <p className="text-sm text-gray-600">{result.tastingNotes}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={handleAdd} disabled={adding}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 disabled:opacity-50">
                {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                Add to Collection
              </button>
              <button onClick={() => { setResult(null); setPreview(null) }}
                className="px-6 py-3 border rounded-xl font-medium text-gray-700 hover:bg-gray-50">
                Scan Another
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
