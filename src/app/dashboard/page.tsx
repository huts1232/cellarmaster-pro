import { createClient } from "@supabase/supabase-js"
import Link from "next/link"
import { redirect } from "next/navigation"
import { 
  Wine, 
  BarChart3, 
  TrendingUp, 
  Thermometer, 
  Droplets, 
  Bell, 
  Plus,
  Search,
  Filter,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Calendar,
  DollarSign,
  MapPin
} from "lucide-react"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

async function getDashboardData(userId: string) {
  const [
    { data: profile },
    { data: wines },
    { data: recentTastings },
    { data: drinkingSoon },
    { data: priceAlerts },
    { data: storageIssues }
  ] = await Promise.all([
    supabase.from('user_profiles').select('*').eq('user_id', userId).single(),
    supabase.from('wines').select(`
      *,
      wine_images(image_url),
      price_valuations(current_price, price_change_30d, market_trend)
    `).eq('user_id', userId).order('created_at', { ascending: false }).limit(10),
    supabase.from('tasting_notes').select(`
      *,
      wines(name, producer, vintage)
    `).eq('user_id', userId).order('tasting_date', { ascending: false }).limit(5),
    supabase.from('drinking_windows').select(`
      *,
      wines(id, name, producer, vintage, wine_images(image_url))
    `).lte('peak_start', new Date().toISOString()).gte('peak_end', new Date().toISOString()).limit(5),
    supabase.from('price_alerts').select(`
      *,
      wines(name, producer, vintage)
    `).eq('user_id', userId).eq('is_active', true).limit(5),
    supabase.from('storage_conditions').select(`
      *,
      wines(name, producer, vintage)
    `).or('temperature.lt.45,temperature.gt.65,humidity.lt.50,humidity.gt.80').limit(5)
  ])

  return { profile, wines, recentTastings, drinkingSoon, priceAlerts, storageIssues }
}

export default async function DashboardPage() {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  const { profile, wines, recentTastings, drinkingSoon, priceAlerts, storageIssues } = await getDashboardData(user.id)

  const totalValue = wines?.reduce((sum, wine) => sum + (wine.price_valuations?.[0]?.current_price || wine.purchase_price || 0) * wine.quantity, 0) || 0
  const totalBottles = wines?.reduce((sum, wine) => sum + wine.quantity, 0) || 0
  const averageBottleValue = totalBottles > 0 ? totalValue / totalBottles : 0

  const handleDeleteWine = async (wineId: string) => {
    try {
      const { error } = await supabase.from('wines').delete().eq('id', wineId)
      if (error) throw error
      window.location.reload()
    } catch (error) {
      console.error('Error deleting wine:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 w-64 h-full bg-white border-r border-gray-200 z-10">
        <div className="p-6">
          <div className="flex items-center space-x-2 mb-8">
            <Wine className="h-8 w-8 text-purple-600" />
            <span className="text-xl font-bold text-gray-900">CellarMaster Pro</span>
          </div>
          
          <nav className="space-y-2">
            <Link href="/dashboard" className="flex items-center space-x-3 px-3 py-2 bg-purple-50 text-purple-700 rounded-lg">
              <BarChart3 className="h-5 w-5" />
              <span>Dashboard</span>
            </Link>
            <Link href="/collection" className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">
              <Wine className="h-5 w-5" />
              <span>Collection</span>
            </Link>
            <Link href="/scan" className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">
              <Search className="h-5 w-5" />
              <span>Add Wine</span>
            </Link>
            <Link href="/analytics" className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">
              <TrendingUp className="h-5 w-5" />
              <span>Analytics</span>
            </Link>
            <Link href="/community" className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">
              <Wine className="h-5 w-5" />
              <span>Community</span>
            </Link>
            <Link href="/profile" className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">
              <Wine className="h-5 w-5" />
              <span>Profile</span>
            </Link>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back, {profile?.full_name || user.email}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Bottles</p>
                <p className="text-2xl font-bold text-gray-900">{totalBottles}</p>
              </div>
              <Wine className="h-8 w-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Collection Value</p>
                <p className="text-2xl font-bold text-gray-900">${totalValue.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Bottle Value</p>
                <p className="text-2xl font-bold text-gray-900">${averageBottleValue.toFixed(0)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Alerts</p>
                <p className="text-2xl font-bold text-gray-900">{priceAlerts?.length || 0}</p>
              </div>
              <Bell className="h-8 w-8 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Wines */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Recent Additions</h2>
                <Link href="/collection" className="text-purple-600 hover:text-purple-700 text-sm font-medium">
                  View all
                </Link>
              </div>
            </div>
            <div className="p-6">
              {wines && wines.length > 0 ? (
                <div className="space-y-4">
                  {wines.slice(0, 5).map((wine) => (
                    <div key={wine.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        {wine.wine_images?.[0]?.image_url ? (
                          <img 
                            src={wine.wine_images[0].image_url} 
                            alt={wine.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <Wine className="h-6 w-6 text-purple-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {wine.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {wine.producer} • {wine.vintage}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          ${wine.price_valuations?.[0]?.current_price || wine.purchase_price || 0}
                        </p>
                        <p className="text-xs text-gray-500">{wine.quantity} bottles</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Link href={`/collection/${wine.id}`}>
                          <button className="p-1 text-gray-400 hover:text-gray-600">
                            <Eye className="h-4 w-4" />
                          </button>
                        </Link>
                        <button 
                          onClick={() => handleDeleteWine(wine.id)}
                          className="p-1 text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Wine className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No wines in your collection yet</p>
                  <Link href="/scan">
                    <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">
                      Add Your First Wine
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Drinking Soon */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Drinking Soon</h2>
                <Calendar className="h-5 w-5 text-gray-400" />
              </div>
            </div>
            <div className="p-6">
              {drinkingSoon && drinkingSoon.length > 0 ? (
                <div className="space-y-4">
                  {drinkingSoon.map((window) => (
                    <div key={window.id} className="flex items-center space-x-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
                      <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                        {window.wines?.wine_images?.[0]?.image_url ? (
                          <img 
                            src={window.wines.wine_images[0].image_url} 
                            alt={window.wines.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <Wine className="h-6 w-6 text-orange-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {window.wines?.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {window.wines?.producer} • {window.wines?.vintage}
                        </p>
                        <p className="text-xs text-orange-600 font-medium">
                          Peak: {new Date(window.peak_start).toLocaleDateString()} - {new Date(window.peak_end).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No wines ready to drink soon</p>
                </div>
              )}
            </div>
          </div>

          {/* Price Alerts */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Price Alerts</h2>
                <Bell className="h-5 w-5 text-gray-400" />
              </div>
            </div>
            <div className="p-6">
              {priceAlerts && priceAlerts.length > 0 ? (
                <div className="space-y-4">
                  {priceAlerts.map((alert) => (
                    <div key={alert.id} className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {alert.wines?.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {alert.wines?.producer} • {alert.wines?.vintage}
                        </p>
                        <p className="text-xs text-blue-600">
                          Alert at ${alert.alert_price}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        alert.alert_type === 'price_drop' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {alert.alert_type === 'price_drop' ? 'Drop' : 'Rise'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No active price alerts</p>
                </div>
              )}
            </div>
          </div>

          {/* Storage Issues */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Storage Alerts</h2>
                <Thermometer className="h-5 w-5 text-gray-400" />
              </div>
            </div>
            <div className="p-6">
              {storageIssues && storageIssues.length > 0 ? (
                <div className="space-y-4">
                  {storageIssues.map((condition) => (
                    <div key={condition.id} className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {condition.wines?.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {condition.wines?.producer} • {condition.wines?.vintage}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-2 text-xs text-red-600">
                          <Thermometer className="h-3 w-3" />
                          <span>{condition.temperature}°F</span>
                        </div>
                        <div className="flex items-center space-x-2 text-xs text-red-600">
                          <Droplets className="h-3 w-3" />
                          <span>{condition.humidity}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Thermometer className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">All wines stored properly</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/scan">
              <button className="w-full flex items-center justify-center space-x-2 bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 transition-colors">
                <Plus className="h-5 w-5" />
                <span>Add Wine</span>
              </button>
            </Link>
            <Link href="/collection">
              <button className="w-full flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-200 transition-colors">
                <Search className="h-5 w-5" />
                <span>Browse Collection</span>
              </button>
            </Link>
            <Link href="/analytics">
              <button className="w-full flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-200 transition-colors">
                <BarChart3 className="h-5 w-5" />
                <span>View Analytics</span>
              </button>
            </Link>
            <Link href="/community">
              <button className="w-full flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-200 transition-colors">
                <Wine className="h-5 w-5" />
                <span>Community</span>
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}