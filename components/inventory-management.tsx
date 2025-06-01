"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Minus, Package, AlertTriangle, TrendingUp, RefreshCw } from "lucide-react"
import { InventoryManager } from "@/lib/inventory"
import { getProducts, type Product } from "@/lib/data"
import dataSyncManager from "@/lib/data-sync"

export default function InventoryManagement() {
  const [products, setProducts] = useState<Product[]>([])
  const [inventoryReport, setInventoryReport] = useState<any>(null)
  const [stockAlerts, setStockAlerts] = useState<any>(null)
  const [adjustments, setAdjustments] = useState<{ [key: number]: string }>({})
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadInventoryData()

    // Subscribe to inventory updates
    const unsubscribe = dataSyncManager.subscribe("inventory-updated", () => {
      loadInventoryData()
    })

    // Subscribe to product changes
    const unsubscribeProductAdded = dataSyncManager.subscribe("product-added", () => {
      loadInventoryData()
    })

    const unsubscribeProductDeleted = dataSyncManager.subscribe("product-deleted", () => {
      loadInventoryData()
    })

    return () => {
      unsubscribe()
      unsubscribeProductAdded()
      unsubscribeProductDeleted()
    }
  }, [])

  const loadInventoryData = () => {
    setIsLoading(true)
    setProducts(getProducts())
    setInventoryReport(InventoryManager.getInventoryReport())
    setStockAlerts(InventoryManager.getStockAlerts())
    setIsLoading(false)
  }

  const handleStockAdjustment = (productId: number, adjustment: number) => {
    try {
      InventoryManager.adjustStock(
        productId,
        adjustment,
        `Manual adjustment: ${adjustment > 0 ? "+" : ""}${adjustment}`,
      )
      loadInventoryData()
      setAdjustments({ ...adjustments, [productId]: "" })

      // Publish inventory update event
      dataSyncManager.publish("inventory-updated")

      alert(`Stock adjusted successfully!`)
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to adjust stock")
    }
  }

  const handleQuickAdjustment = (productId: number, amount: number) => {
    handleStockAdjustment(productId, amount)
  }

  const handleCustomAdjustment = (productId: number) => {
    const adjustment = Number.parseInt(adjustments[productId] || "0")
    if (adjustment !== 0) {
      handleStockAdjustment(productId, adjustment)
    }
  }

  const handleRefresh = () => {
    loadInventoryData()
  }

  if (!inventoryReport || !stockAlerts) {
    return <div className="text-white">Loading inventory data...</div>
  }

  return (
    <div className="space-y-6">
      {/* Refresh Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleRefresh}
          className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          {isLoading ? "Refreshing..." : "Refresh Data"}
        </Button>
      </div>

      {/* Inventory Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Total Stock Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">${inventoryReport.totalInventoryValue.toFixed(2)}</div>
            <p className="text-xs text-gray-400">{inventoryReport.totalStock} total items</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Well Stocked</CardTitle>
            <Package className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{inventoryReport.wellStockedCount}</div>
            <p className="text-xs text-gray-400">Products with 10+ items</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Low Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{inventoryReport.lowStockCount}</div>
            <p className="text-xs text-gray-400">Need restocking</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Out of Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{inventoryReport.outOfStockCount}</div>
            <p className="text-xs text-gray-400">Urgent attention needed</p>
          </CardContent>
        </Card>
      </div>

      {/* Stock Alerts */}
      {stockAlerts.alerts.length > 0 && (
        <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-white">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
              <span>Stock Alerts</span>
              <Badge variant="destructive" className="bg-red-600 text-white">
                {stockAlerts.alerts.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stockAlerts.alerts.map((alert: any, index: number) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    alert.type === "critical"
                      ? "bg-red-900/30 border border-red-700"
                      : "bg-yellow-900/30 border border-yellow-700"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <AlertTriangle
                      className={`h-4 w-4 ${alert.type === "critical" ? "text-red-400" : "text-yellow-400"}`}
                    />
                    <span className="text-white">{alert.message}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      onClick={() => handleQuickAdjustment(alert.productId, 10)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      +10
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleQuickAdjustment(alert.productId, 25)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      +25
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Inventory Management Table */}
      <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-white">
            <RefreshCw className="h-5 w-5 text-blue-400" />
            <span>Inventory Management</span>
          </CardTitle>
          <CardDescription className="text-gray-400">
            Manage stock levels for all products. Use +/- buttons for quick adjustments or enter custom amounts.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-gray-700">
                <TableHead className="text-gray-300">Product</TableHead>
                <TableHead className="text-gray-300">Category</TableHead>
                <TableHead className="text-gray-300">Current Stock</TableHead>
                <TableHead className="text-gray-300">Stock Value</TableHead>
                <TableHead className="text-gray-300">Quick Actions</TableHead>
                <TableHead className="text-gray-300">Custom Adjustment</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id} className="border-gray-700">
                  <TableCell className="font-medium text-white">{product.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-gray-700 text-gray-300">
                      {product.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={product.stock > 10 ? "default" : product.stock > 0 ? "secondary" : "destructive"}
                      className={
                        product.stock > 10
                          ? "bg-green-600 text-white"
                          : product.stock > 0
                            ? "bg-yellow-600 text-white"
                            : "bg-red-600 text-white"
                      }
                    >
                      {product.stock} units
                    </Badge>
                  </TableCell>
                  <TableCell className="text-green-400 font-medium">
                    ${(product.price * product.stock).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleQuickAdjustment(product.id, -1)}
                        disabled={product.stock <= 0}
                        className="h-8 w-8 p-0 border-gray-600 text-gray-300 hover:bg-gray-600"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleQuickAdjustment(product.id, -5)}
                        disabled={product.stock < 5}
                        className="h-8 px-2 border-gray-600 text-gray-300 hover:bg-gray-600 text-xs"
                      >
                        -5
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleQuickAdjustment(product.id, 5)}
                        className="h-8 px-2 border-gray-600 text-gray-300 hover:bg-gray-600 text-xs"
                      >
                        +5
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleQuickAdjustment(product.id, 1)}
                        className="h-8 w-8 p-0 border-gray-600 text-gray-300 hover:bg-gray-600"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="number"
                        placeholder="±0"
                        value={adjustments[product.id] || ""}
                        onChange={(e) => setAdjustments({ ...adjustments, [product.id]: e.target.value })}
                        className="w-20 h-8 bg-gray-700 border-gray-600 text-white text-sm"
                      />
                      <Button
                        size="sm"
                        onClick={() => handleCustomAdjustment(product.id)}
                        disabled={!adjustments[product.id] || adjustments[product.id] === "0"}
                        className="h-8 bg-blue-600 hover:bg-blue-700 text-xs"
                      >
                        Apply
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
