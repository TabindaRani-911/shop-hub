import { getOrders, getUsers, getProducts } from "./data"

export class AnalyticsEngine {
  // Sales analytics
  static getSalesAnalytics() {
    const orders = getOrders()
    const currentDate = new Date()
    const currentMonth = currentDate.getMonth()
    const currentYear = currentDate.getFullYear()

    // Monthly sales
    const monthlySales = orders
      .filter((order) => {
        const orderDate = new Date(order.date)
        return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear
      })
      .reduce((sum, order) => sum + order.total, 0)

    // Daily sales (last 7 days)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - i)
      return date.toISOString().split("T")[0]
    }).reverse()

    const dailySales = last7Days.map((date) => {
      const dayOrders = orders.filter((order) => order.date.split("T")[0] === date)
      return {
        date,
        sales: dayOrders.reduce((sum, order) => sum + order.total, 0),
        orders: dayOrders.length,
      }
    })

    return {
      monthlySales,
      dailySales,
      totalRevenue: orders.reduce((sum, order) => sum + order.total, 0),
      averageOrderValue: orders.length > 0 ? orders.reduce((sum, order) => sum + order.total, 0) / orders.length : 0,
    }
  }

  // Product performance
  static getProductAnalytics() {
    const orders = getOrders()
    const products = getProducts()

    // Calculate sales per product
    const productSales = new Map<number, { quantity: number; revenue: number }>()

    orders.forEach((order) => {
      order.items.forEach((item) => {
        const current = productSales.get(item.productId) || { quantity: 0, revenue: 0 }
        productSales.set(item.productId, {
          quantity: current.quantity + item.quantity,
          revenue: current.revenue + item.price * item.quantity,
        })
      })
    })

    // Top selling products
    const topProducts = Array.from(productSales.entries())
      .map(([productId, stats]) => {
        const product = products.find((p) => p.id === productId)
        return {
          product,
          ...stats,
        }
      })
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5)

    return {
      topProducts,
      totalProductsSold: Array.from(productSales.values()).reduce((sum, stats) => sum + stats.quantity, 0),
    }
  }

  // Customer analytics
  static getCustomerAnalytics() {
    const users = getUsers()
    const orders = getOrders()

    // Customer lifetime value
    const customerValues = new Map<number, number>()
    orders.forEach((order) => {
      const current = customerValues.get(order.userId) || 0
      customerValues.set(order.userId, current + order.total)
    })

    // Top customers
    const topCustomers = Array.from(customerValues.entries())
      .map(([userId, value]) => {
        const user = users.find((u) => u.id === userId)
        return { user, totalSpent: value }
      })
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 5)

    return {
      totalCustomers: users.filter((u) => u.email !== "admin@shop.com").length,
      topCustomers,
      averageCustomerValue:
        customerValues.size > 0
          ? Array.from(customerValues.values()).reduce((sum, value) => sum + value, 0) / customerValues.size
          : 0,
    }
  }
}
