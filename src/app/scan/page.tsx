'use client'
import Link from 'next/link'
import { Wine, ArrowLeft, Camera, Upload } from 'lucide-react'

export default function ScanPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b bg-white sticky top-0 z-50"><div className="max-w-6xl mx-auto px-6 h-14 flex items-center gap-3"><Link href="/dashboard" className="text-gray-500 hover:text-gray-900"><ArrowLeft className="h-5 w-5" /></Link><Wine className="h-5 w-5 text-purple-600" /><span className="font-bold">Label Scanner</span></div></nav>
      <main className="max-w-2xl mx-auto px-6 py-12 text-center">
        <Camera className="h-16 w-16 text-purple-600 mx-auto mb-6" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Scan a Wine Label</h1>
        <p className="text-gray-500 mb-8">Take a photo of any wine label and we&apos;ll auto-fill the details</p>
        <div className="bg-white rounded-2xl border-2 border-dashed border-purple-300 p-12 hover:border-purple-500 transition-colors cursor-pointer mb-6">
          <Upload className="h-10 w-10 text-purple-400 mx-auto mb-3" />
          <p className="font-medium text-gray-900">Upload a photo</p>
          <p className="text-sm text-gray-500 mt-1">JPG, PNG up to 5MB</p>
        </div>
        <div className="bg-purple-50 rounded-xl p-6">
          <h3 className="font-semibold text-gray-900 mb-2">How it works</h3>
          <div className="space-y-2 text-sm text-gray-600 text-left max-w-sm mx-auto">
            <p>📸 1. Take a photo of the wine label</p>
            <p>🤖 2. AI identifies the wine, producer, and vintage</p>
            <p>✅ 3. Review and add to your collection with one tap</p>
          </div>
        </div>
      </main>
    </div>
  )
}
