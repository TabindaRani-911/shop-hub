import { getProducts, getOrders, type Product } from "./data"

export class RecommendationEngine {
  // Get product recommendations based on user's order history
  static getPersonalizedRecommendations(userId: number, limit = 4): Product[] {
    const orders = getOrders()
    const products = getProducts()

    // Get user's purchase history
    const userOrders = orders.filter((order) => order.userId === userId)
    const purchasedProductIds = new Set<number>()
    const categoryPreferences = new Map<string, number>()

    userOrders.forEach((order) => {
      order.items.forEach((item) => {
        purchasedProductIds.add(item.productId)
        const product = products.find((p) => p.id === item.productId)
        if (product) {
          const current = categoryPreferences.get(product.category) || 0
          categoryPreferences.set(product.category, current + item.quantity)
        }
      })
    })

    // Get preferred categories
    const sortedCategories = Array.from(categoryPreferences.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([category]) => category)

    // Recommend products from preferred categories that user hasn't bought
    const recommendations = products
      .filter((product) => !purchasedProductIds.has(product.id) && product.stock > 0)
      .sort((a, b) => {
        const aIndex = sortedCategories.indexOf(a.category)
        const bIndex = sortedCategories.indexOf(b.category)

        // Prioritize preferred categories
        if (aIndex !== -1 && bIndex !== -1) {
          return aIndex - bIndex
        }
        if (aIndex !== -1) return -1
        if (bIndex !== -1) return 1

        // Secondary sort by price (ascending)
        return a.price - b.price
      })
      .slice(0, limit)

    return recommendations
  }

  // Get trending products based on recent sales
  static getTrendingProducts(limit = 4): Product[] {
    const orders = getOrders()
    const products = getProducts()
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    // Count recent sales
    const recentSales = new Map<number, number>()

    orders
      .filter((order) => new Date(order.date) >= thirtyDaysAgo)
      .forEach((order) => {
        order.items.forEach((item) => {
          const current = recentSales.get(item.productId) || 0
          recentSales.set(item.productId, current + item.quantity)
        })
      })

    // Get trending products
    const trending = Array.from(recentSales.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([productId]) => products.find((p) => p.id === productId))
      .filter((product): product is Product => product !== undefined && product.stock > 0)

    return trending
  }

  // Get similar products based on category and price range
  static getSimilarProducts(productId: number, limit = 4): Product[] {
    const products = getProducts()
    const targetProduct = products.find((p) => p.id === productId)

    if (!targetProduct) return []

    const priceRange = targetProduct.price * 0.3 // 30% price range

    return products
      .filter(
        (product) =>
          product.id !== productId &&
          product.category === targetProduct.category &&
          Math.abs(product.price - targetProduct.price) <= priceRange &&
          product.stock > 0,
      )
      .sort((a, b) => Math.abs(a.price - targetProduct.price) - Math.abs(b.price - targetProduct.price))
      .slice(0, limit)
  }
}
