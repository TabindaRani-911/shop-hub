import { getProducts, updateProduct, type Product } from "./data"
import dataSyncManager from "./data-sync"

export class InventoryManager {
  // Update stock levels after purchase
  static updateStock(productId: number, quantityPurchased: number): boolean {
    const products = getProducts()
    const product = products.find((p) => p.id === productId)

    if (!product) {
      throw new Error(`Product not found: ${productId}`)
    }

    if (product.stock < quantityPurchased) {
      throw new Error(
        `Insufficient stock for product ${product.name}: ${product.stock} available, ${quantityPurchased} requested`,
      )
    }

    const updatedProduct = {
      ...product,
      stock: product.stock - quantityPurchased,
    }

    console.log(
      `[Inventory] Updating stock for product ${product.name} (ID: ${productId}): ${product.stock} -> ${updatedProduct.stock}`,
    )

    updateProduct(productId, updatedProduct)

    // Notify subscribers about inventory change
    dataSyncManager.publish("inventory-updated", {
      productId,
      oldStock: product.stock,
      newStock: updatedProduct.stock,
      action: "purchase",
    })

    return true
  }

  // Reserve stock when items are added to cart (temporary hold)
  static reserveStock(productId: number, quantity: number): boolean {
    const products = getProducts()
    const product = products.find((p) => p.id === productId)

    if (!product) {
      throw new Error("Product not found")
    }

    if (product.stock < quantity) {
      throw new Error("Insufficient stock to reserve")
    }

    return true // In a real app, this would create a temporary reservation
  }

  // Manual stock adjustment for admin
  static adjustStock(productId: number, adjustment: number, reason = "Manual adjustment"): boolean {
    const products = getProducts()
    const product = products.find((p) => p.id === productId)

    if (!product) {
      throw new Error("Product not found")
    }

    const newStock = Math.max(0, product.stock + adjustment)

    const updatedProduct = {
      ...product,
      stock: newStock,
    }

    console.log(
      `[Inventory] Adjusting stock for product ${product.name} (ID: ${productId}): ${product.stock} -> ${newStock} (${reason})`,
    )

    updateProduct(productId, updatedProduct)

    // Log the adjustment (in real app, this would go to audit log)
    console.log(`Stock adjusted for ${product.name}: ${adjustment} (${reason}). New stock: ${newStock}`)

    // Notify subscribers about inventory change
    dataSyncManager.publish("inventory-updated", {
      productId,
      oldStock: product.stock,
      newStock: updatedProduct.stock,
      action: "adjustment",
      reason,
    })

    return true
  }

  // Check low stock items
  static getLowStockItems(threshold = 10): Product[] {
    const products = getProducts()
    return products.filter((product) => product.stock <= threshold && product.stock > 0)
  }

  // Get out of stock items
  static getOutOfStockItems(): Product[] {
    const products = getProducts()
    return products.filter((product) => product.stock === 0)
  }

  // Restock items
  static restockItem(productId: number, quantity: number): boolean {
    return this.adjustStock(productId, quantity, "Restock")
  }

  // Get inventory report with more details
  static getInventoryReport() {
    const products = getProducts()
    const totalProducts = products.length
    const totalStock = products.reduce((sum, product) => sum + product.stock, 0)
    const lowStockItems = this.getLowStockItems()
    const outOfStockItems = this.getOutOfStockItems()
    const wellStockedItems = products.filter((product) => product.stock > 10)

    // Calculate inventory value
    const totalInventoryValue = products.reduce((sum, product) => sum + product.price * product.stock, 0)

    return {
      totalProducts,
      totalStock,
      lowStockCount: lowStockItems.length,
      outOfStockCount: outOfStockItems.length,
      wellStockedCount: wellStockedItems.length,
      totalInventoryValue,
      lowStockItems,
      outOfStockItems,
      wellStockedItems,
      averageStockPerProduct: totalProducts > 0 ? totalStock / totalProducts : 0,
    }
  }

  // Get stock alerts
  static getStockAlerts() {
    const lowStock = this.getLowStockItems()
    const outOfStock = this.getOutOfStockItems()

    return {
      critical: outOfStock.length,
      warning: lowStock.length,
      alerts: [
        ...outOfStock.map((product) => ({
          type: "critical" as const,
          message: `${product.name} is out of stock`,
          productId: product.id,
          stock: product.stock,
        })),
        ...lowStock.map((product) => ({
          type: "warning" as const,
          message: `${product.name} is running low (${product.stock} left)`,
          productId: product.id,
          stock: product.stock,
        })),
      ],
    }
  }
}
