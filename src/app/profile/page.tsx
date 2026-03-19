'use client'
import Link from 'next/link'
import { Wine, ArrowLeft, User, Settings, Bell, Shield } from 'lucide-react'

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b bg-white sticky top-0 z-50"><div className="max-w-6xl mx-auto px-6 h-14 flex items-center gap-3"><Link href="/dashboard" className="text-gray-500 hover:text-gray-900"><ArrowLeft className="h-5 w-5" /></Link><Wine className="h-5 w-5 text-purple-600" /><span className="font-bold">Profile</span></div></nav>
      <main className="max-w-2xl mx-auto px-6 py-8">
        <div className="bg-white rounded-xl border p-6 mb-6 flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-purple-100 flex items-center justify-center"><User className="h-8 w-8 text-purple-600" /></div>
          <div><h2 className="text-lg font-bold">Wine Enthusiast</h2><p className="text-sm text-gray-500">Free Plan · Member since 2026</p></div>
        </div>
        <div className="space-y-3">
          {[
            { icon: <Settings className="h-5 w-5 text-gray-600" />, title: 'Account Settings', desc: 'Email, password, preferences' },
            { icon: <Bell className="h-5 w-5 text-gray-600" />, title: 'Notifications', desc: 'Drinking alerts, price changes' },
            { icon: <Shield className="h-5 w-5 text-gray-600" />, title: 'Privacy', desc: 'Data export, account deletion' },
          ].map((item, i) => (
            <div key={i} className="bg-white rounded-xl border p-4 flex items-center gap-4 hover:shadow-sm transition-all cursor-pointer">
              {item.icon}
              <div><p className="font-medium">{item.title}</p><p className="text-sm text-gray-500">{item.desc}</p></div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
