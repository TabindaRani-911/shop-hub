"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, TrendingUp, Heart } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useCart } from "@/lib/cart-context"
import { RecommendationEngine } from "@/lib/recommendations"
import type { Product } from "@/lib/data"

interface ProductRecommendationsProps {
  type: "personalized" | "trending" | "similar"
  productId?: number
  title?: string
}

export default function ProductRecommendations({ type, productId, title }: ProductRecommendationsProps) {
  const { user } = useAuth()
  const { addToCart } = useCart()
  const [recommendations, setRecommendations] = useState<Product[]>([])

  useEffect(() => {
    let products: Product[] = []

    switch (type) {
      case "personalized":
        if (user) {
          products = RecommendationEngine.getPersonalizedRecommendations(user.id)
        }
        break
      case "trending":
        products = RecommendationEngine.getTrendingProducts()
        break
      case "similar":
        if (productId) {
          products = RecommendationEngine.getSimilarProducts(productId)
        }
        break
    }

    setRecommendations(products)
  }, [type, user, productId])

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
    return imageMap[productId] || `/placeholder.svg?height=150&width=150`
  }

  const getTitle = () => {
    if (title) return title

    switch (type) {
      case "personalized":
        return "Recommended for You"
      case "trending":
        return "Trending Products"
      case "similar":
        return "Similar Products"
      default:
        return "Recommendations"
    }
  }

  const getIcon = () => {
    switch (type) {
      case "personalized":
        return <Heart className="h-5 w-5 text-pink-400" />
      case "trending":
        return <TrendingUp className="h-5 w-5 text-green-400" />
      case "similar":
        return <Star className="h-5 w-5 text-yellow-400" />
      default:
        return null
    }
  }

  if (recommendations.length === 0) {
    return null
  }

  return (
    <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-white">
          {getIcon()}
          <span>{getTitle()}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {recommendations.map((product) => (
            <div
              key={product.id}
              className="group bg-gray-700/50 rounded-lg p-4 hover:bg-gray-700/70 transition-all duration-300"
            >
              <div className="aspect-square bg-gray-600 rounded-lg mb-3 overflow-hidden">
                <img
                  src={getProductImage(product.id) || "/placeholder.svg"}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-white text-sm line-clamp-2">{product.name}</h4>
                <Badge variant="secondary" className="text-xs bg-gray-600 text-gray-300">
                  {product.category}
                </Badge>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs text-gray-400">4.5</span>
                  </div>
                  <span className="font-bold text-green-400">${product.price}</span>
                </div>

                <Button
                  size="sm"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-xs"
                  onClick={() => addToCart(product)}
                  disabled={product.stock === 0}
                >
                  {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
