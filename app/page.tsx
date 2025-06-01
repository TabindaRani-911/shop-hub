"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ShoppingCart, Search, User, LogIn, UserPlus, Star, RefreshCw } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useCart } from "@/lib/cart-context"
import { getProducts, type Product } from "@/lib/data"
import AuthModal from "@/components/auth-modal"
import CartSidebar from "@/components/cart-sidebar"
import UserProfile from "@/components/user-profile"
import ProductRecommendations from "@/components/product-recommendations"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const { user, logout } = useAuth()
  const { addToCart, cartItems } = useCart()
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<"login" | "register">("login")
  const [showCart, setShowCart] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = () => {
    setIsLoading(true)
    const productData = getProducts()
    setProducts(productData)
    setFilteredProducts(productData)
    setIsLoading(false)
  }

  useEffect(() => {
    let filtered = products

    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter((product) => product.category === selectedCategory)
    }

    setFilteredProducts(filtered)
  }, [searchTerm, selectedCategory, products])

  const categories = ["all", ...Array.from(new Set(products.map((p) => p.category)))]
  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  const handleAddToCart = (product: Product) => {
    addToCart(product)
  }

  const handleRefresh = () => {
    loadProducts()
  }

  const getProductImage = (productId: number) => {
    const imageMap: { [key: number]: string } = {
      1: "/images/wireless-headphones.png",
      2: "/images/smart-fitness-watch.png",
      3: "/images/organic-cotton-tshirt.png",
      4: "/images/stainless-steel-water-bottle.png",
      5: "/images/wireless-phone-charger.png",
      6: "/images/premium-coffee-beans.png",
      7: "/images/yoga-mat.png",
      8: "/images/led-desk-lamp.png",
    }
    return imageMap[productId] || `/placeholder.svg?height=200&width=200`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black">
      {/* Header */}
      <header className="bg-gray-900/80 backdrop-blur-md border-b border-gray-700 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                ShopHub
              </h1>
            </div>

            <div className="flex-1 max-w-md mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                className="border-gray-600 text-gray-300 hover:bg-gray-800 flex items-center gap-2"
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                {isLoading ? "Refreshing..." : "Refresh"}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCart(true)}
                className="relative border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                <ShoppingCart className="h-4 w-4" />
                {cartItemCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-blue-600">
                    {cartItemCount}
                  </Badge>
                )}
              </Button>

              {user ? (
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push("/user-dashboard")}
                    className="flex items-center space-x-2 text-gray-300 hover:bg-gray-800"
                  >
                    <User className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowProfile(true)}
                    className="flex items-center space-x-2 text-gray-300 hover:bg-gray-800"
                  >
                    <span>{user.name}</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={logout}
                    className="border-gray-600 text-gray-300 hover:bg-gray-800"
                  >
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setAuthMode("login")
                      setShowAuthModal(true)
                    }}
                    className="border-gray-600 text-gray-300 hover:bg-gray-800"
                  >
                    <LogIn className="h-4 w-4 mr-2" />
                    Login
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      setAuthMode("register")
                      setShowAuthModal(true)
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Sign Up
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Category Filter */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className={`capitalize ${
                selectedCategory === category
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "border-gray-600 text-gray-300 hover:bg-gray-800"
              }`}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <main className="container mx-auto px-4 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <Card
              key={product.id}
              className="group hover:shadow-xl transition-all duration-300 bg-gray-800/50 backdrop-blur-sm border-gray-700 hover:border-gray-600"
            >
              <CardHeader className="p-0">
                <div className="aspect-square bg-gradient-to-br from-gray-700 to-gray-800 rounded-t-lg flex items-center justify-center">
                  <img
                    src={getProductImage(product.id) || "/placeholder.svg"}
                    alt={product.name}
                    className="w-full h-full object-cover rounded-t-lg group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <CardTitle className="text-lg font-semibold line-clamp-1 text-white">{product.name}</CardTitle>
                  <Badge variant="secondary" className="text-xs bg-gray-700 text-gray-300">
                    {product.category}
                  </Badge>
                </div>
                <CardDescription className="text-sm text-gray-400 line-clamp-2 mb-3">
                  {product.description}
                </CardDescription>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm text-gray-400">4.5</span>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-400">${product.price}</div>
                    <div className="text-sm text-gray-500">Stock: {product.stock}</div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => handleAddToCart(product)}
                  disabled={product.stock === 0}
                >
                  {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg">No products found</div>
            <div className="text-gray-500 text-sm mt-2">Try adjusting your search or filters</div>
          </div>
        )}
      </main>

      {/* Product Recommendations */}
      <div className="container mx-auto px-4 pb-8 space-y-6">
        <ProductRecommendations type="trending" title="🔥 Trending Now" />
        {user && <ProductRecommendations type="personalized" title="✨ Just for You" />}
      </div>

      {/* Modals and Sidebars */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode={authMode}
        onModeChange={setAuthMode}
      />

      <CartSidebar isOpen={showCart} onClose={() => setShowCart(false)} />

      <UserProfile isOpen={showProfile} onClose={() => setShowProfile(false)} />
    </div>
  )
}
