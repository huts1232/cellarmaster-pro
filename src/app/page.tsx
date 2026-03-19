'use client'

import Link from 'next/link'
import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { 
  Wine, 
  TrendingUp, 
  Camera, 
  BarChart3, 
  Users, 
  Shield, 
  Clock, 
  DollarSign,
  CheckCircle,
  Star,
  ArrowRight,
  Menu,
  X
} from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage('')

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password: 'temp_password_123',
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      })

      if (error) {
        setMessage(error.message)
      } else {
        setMessage('Check your email for the confirmation link!')
        setEmail('')
      }
    } catch (error) {
      setMessage('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGetStarted = () => {
    window.location.href = '/dashboard'
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Wine className="h-8 w-8 text-purple-400" />
              <span className="ml-2 text-xl font-bold text-white">CellarMaster Pro</span>
            </div>
            
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <a href="#features" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Features</a>
                <a href="#pricing" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Pricing</a>
                <Link href="/dashboard" className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                  Get Started
                </Link>
              </div>
            </div>

            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-400 hover:text-white"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-black/40 backdrop-blur-sm">
              <a href="#features" className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium">Features</a>
              <a href="#pricing" className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium">Pricing</a>
              <Link href="/dashboard" className="bg-purple-600 hover:bg-purple-700 text-white block px-3 py-2 rounded-md text-base font-medium">
                Get Started
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            The Ultimate Digital
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              Wine Cellar Management
            </span>
          </h1>
          
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            For serious collectors with 100+ bottles. Track value, optimize drinking windows, 
            and gain deep insights into your wine collection with professional-grade analytics.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <button
              onClick={handleGetStarted}
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-lg text-lg font-semibold flex items-center gap-2 transition-colors"
            >
              Start Your Free Trial
              <ArrowRight className="h-5 w-5" />
            </button>
            
            <form onSubmit={handleSignUp} className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="px-4 py-4 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
                required
              />
              <button
                type="submit"
                disabled={isLoading}
                className="bg-white/10 hover:bg-white/20 text-white px-6 py-4 rounded-lg font-semibold border border-white/20 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Sending...' : 'Get Updates'}
              </button>
            </form>
          </div>

          {message && (
            <div className={`text-sm ${message.includes('error') || message.includes('wrong') ? 'text-red-400' : 'text-green-400'} mb-4`}>
              {message}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
              <div className="text-3xl font-bold text-purple-400 mb-2">500K+</div>
              <div className="text-gray-300">Bottles Tracked</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
              <div className="text-3xl font-bold text-purple-400 mb-2">$50M+</div>
              <div className="text-gray-300">Collection Value</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
              <div className="text-3xl font-bold text-purple-400 mb-2">2,000+</div>
              <div className="text-gray-300">Active Collectors</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-black/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Everything You Need to Master Your Collection
            </h2>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Professional-grade tools designed specifically for serious wine collectors
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10 hover:border-purple-400/30 transition-colors">
              <Camera className="h-12 w-12 text-purple-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">Smart Bottle Scanner</h3>
              <p className="text-gray-300">
                Instantly catalog wines with AI-powered label recognition. Automatically pulls vintages, producers, and market data.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10 hover:border-purple-400/30 transition-colors">
              <TrendingUp className="h-12 w-12 text-purple-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">Real-Time Valuations</h3>
              <p className="text-gray-300">
                Track your collection's value with live market data from Wine-Searcher and auction houses. Set price alerts.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10 hover:border-purple-400/30 transition-colors">
              <Clock className="h-12 w-12 text-purple-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">Optimal Drinking Windows</h3>
              <p className="text-gray-300">
                AI-powered predictions for when each bottle will be at its peak. Never miss the perfect moment to open a wine.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10 hover:border-purple-400/30 transition-colors">
              <BarChart3 className="h-12 w-12 text-purple-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">Advanced Analytics</h3>
              <p className="text-gray-300">
                Deep insights into your collection's performance, regional breakdown, vintage analysis, and investment ROI.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10 hover:border-purple-400/30 transition-colors">
              <Shield className="h-12 w-12 text-purple-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">Storage Monitoring</h3>
              <p className="text-gray-300">
                Track temperature, humidity, and storage conditions. Get alerts when conditions deviate from optimal ranges.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10 hover:border-purple-400/30 transition-colors">
              <Users className="h-12 w-12 text-purple-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">Collector Community</h3>
              <p className="text-gray-300">
                Connect with fellow collectors, share tasting notes, and discover wines through a curated community.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-gray-300 text-lg mb-12">
            Everything you need to manage your wine collection professionally
          </p>

          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 max-w-md mx-auto">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-white mb-2">CellarMaster Pro</h3>
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="text-4xl font-bold text-white">$19</span>
                <span className="text-gray-300">/month</span>
              </div>
              <p className="text-gray-300">Perfect for serious collectors</p>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span className="text-white">Unlimited bottle tracking</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span className="text-white">AI-powered bottle scanning</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span className="text-white">Real-time market valuations</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span className="text-white">Optimal drinking windows</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span className="text-white">Advanced analytics dashboard</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span className="text-white">Storage condition monitoring</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span className="text-white">Collector community access</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span className="text-white">Price alerts & notifications</span>
              </div>
            </div>

            <button
              onClick={handleGetStarted}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-4 rounded-lg font-semibold text-lg transition-colors"
            >
              Start Free Trial
            </button>

            <p className="text-gray-400 text-sm mt-4">
              14-day free trial. No credit card required.
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-black/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Trusted by Serious Collectors
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-300 mb-4">
                "Finally, a wine app built for serious collectors. The valuation tracking has helped me identify which bottles to sell and when."
              </p>
              <div className="text-white font-semibold">Marcus Chen</div>
              <div className="text-gray-400 text-sm">2,400 bottle collection</div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-300 mb-4">
                "The drinking window predictions are incredibly accurate. I've never had a wine past its prime since using CellarMaster."
              </p>
              <div className="text-white font-semibold">Sarah Rodriguez</div>
              <div className="text-gray-400 text-sm">1,800 bottle collection</div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-300 mb-4">
                "The scanning feature is a game-changer. Cataloged my entire 3,000 bottle cellar in just two weekends."
              </p>
              <div className="text-white font-semibold">David Thompson</div>
              <div className="text-gray-400 text-sm">3,000 bottle collection</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Master Your Wine Collection?
          </h2>
          <p className="text-gray-300 text-lg mb-8">
            Join thousands of serious collectors who trust CellarMaster Pro to manage their most valuable bottles.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={handleGetStarted}
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-lg text-lg font-semibold flex items-center gap-2 transition-colors"
            >
              Start Your Free Trial
              <ArrowRight className="h-5 w-5" />
            </button>
            
            <div className="text-gray-400 text-sm">
              14-day free trial • No credit card required • Cancel anytime
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/40 border-t border-white/10 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <Wine className="h-6 w-6 text-purple-400" />
            <span className="ml-2 text-lg font-bold text-white">CellarMaster Pro</span>
          </div>
          
          <div className="text-gray-400 text-sm">
            © 2024 CellarMaster Pro. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}