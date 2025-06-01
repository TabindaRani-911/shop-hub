"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { User, Package, ShoppingCart, Heart, TrendingUp, ArrowLeft, RefreshCw } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useCart } from "@/lib/cart-context"
import { getOrdersByUserId } from "@/lib/data"
import { RecommendationEngine } from "@/lib/recommendations"
import { useRouter } from "next/navigation"
import UserProfile from "@/components/user-profile"
import ProductRecommendations from "@/components/product-recommendations"

export default function UserDashboard() {
  const { user } = useAuth()
  const { cartItems } = useCart()
  const router = useRouter()
  const [showProfile, setShowProfile] = useState(false)
  const [userOrders, setUserOrders] = useState<any[]>([])
  const [recommendations, setRecommendations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push("/")
      return
    }

    if (user.email === "admin@shop.com") {
      router.push("/admin")
      return
    }

    loadUserData()
  }, [user, router])

  const loadUserData = () => {
    if (!user) return

    setIsLoading(true)

    // Load user orders
    const orders = getOrdersByUserId(user.id)
    setUserOrders(orders)

    // Load personalized recommendations
    const personalizedRecs = RecommendationEngine.getPersonalizedRecommendations(user.id, 6)
    setRecommendations(personalizedRecs)

    setIsLoading(false)
  }

  const handleRefresh = () => {
    loadUserData()
  }

  if (!user || user.email === "admin@shop.com") {
    return null
  }

  const totalSpent = userOrders.reduce((sum, order) => sum + order.total, 0)
  const totalOrders = userOrders.length
  const cartValue = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black">
      <header className="bg-gray-900/80 backdrop-blur-md border-b border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => router.push("/")} className="text-gray-300 hover:bg-gray-800">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Store
              </Button>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                My Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={handleRefresh}
                className="border-gray-600 text-gray-300 hover:bg-gray-800 flex items-center gap-2"
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                {isLoading ? "Refreshing..." : "Refresh"}
              </Button>
              <span className="text-gray-300">Welcome, {user.name}!</span>
              <Button
                variant="outline"
                onClick={() => setShowProfile(true)}
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                <User className="h-4 w-4 mr-2" />
                Profile
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Total Orders</CardTitle>
              <Package className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{totalOrders}</div>
              <p className="text-xs text-gray-400">Completed purchases</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Total Spent</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">${totalSpent.toFixed(2)}</div>
              <p className="text-xs text-gray-400">Lifetime value</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Cart Items</CardTitle>
              <ShoppingCart className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{cartItemCount}</div>
              <p className="text-xs text-gray-400">${cartValue.toFixed(2)} value</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Member Since</CardTitle>
              <User className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-white">{new Date(user.createdAt).toLocaleDateString()}</div>
              <p className="text-xs text-gray-400">Account created</p>
            </CardContent>
          </Card>
        </div>

        {/* Dashboard Tabs */}
        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-gray-800 border-gray-700">
            <TabsTrigger value="orders" className="data-[state=active]:bg-gray-700 text-gray-300">
              My Orders
            </TabsTrigger>
            <TabsTrigger value="recommendations" className="data-[state=active]:bg-gray-700 text-gray-300">
              For You
            </TabsTrigger>
            <TabsTrigger value="wishlist" className="data-[state=active]:bg-gray-700 text-gray-300">
              Wishlist
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders">
            <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Order History</CardTitle>
                <CardDescription className="text-gray-400">Track your purchases and order status</CardDescription>
              </CardHeader>
              <CardContent>
                {userOrders.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg">No orders yet</p>
                    <p className="text-gray-500 text-sm mt-2">Start shopping to see your orders here</p>
                    <Button onClick={() => router.push("/")} className="mt-4 bg-blue-600 hover:bg-blue-700">
                      Start Shopping
                    </Button>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-700">
                        <TableHead className="text-gray-300">Order ID</TableHead>
                        <TableHead className="text-gray-300">Date</TableHead>
                        <TableHead className="text-gray-300">Items</TableHead>
                        <TableHead className="text-gray-300">Total</TableHead>
                        <TableHead className="text-gray-300">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {userOrders.map((order) => (
                        <TableRow key={order.id} className="border-gray-700">
                          <TableCell className="font-medium text-white">#{order.id}</TableCell>
                          <TableCell className="text-gray-300">{new Date(order.date).toLocaleDateString()}</TableCell>
                          <TableCell className="text-gray-300">{order.items.length} items</TableCell>
                          <TableCell className="text-green-400 font-medium">${order.total.toFixed(2)}</TableCell>
                          <TableCell>
                            <Badge variant="default" className="bg-green-600 text-white">
                              {order.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recommendations">
            <div className="space-y-6">
              <ProductRecommendations type="personalized" title="🎯 Recommended Just for You" />
              <ProductRecommendations type="trending" title="🔥 Trending Products" />
            </div>
          </TabsContent>

          <TabsContent value="wishlist">
            <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-white">
                  <Heart className="h-5 w-5 text-pink-400" />
                  <span>My Wishlist</span>
                </CardTitle>
                <CardDescription className="text-gray-400">Save items for later</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Heart className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">Wishlist feature coming soon!</p>
                  <p className="text-gray-500 text-sm mt-2">Save your favorite items for later purchase</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <UserProfile isOpen={showProfile} onClose={() => setShowProfile(false)} />
    </div>
  )
}
