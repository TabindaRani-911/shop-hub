"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { TrendingUp, DollarSign, Package, Users, AlertTriangle, BarChart3, RefreshCw } from "lucide-react"
import { AnalyticsEngine } from "@/lib/analytics"
import { InventoryManager } from "@/lib/inventory"
import dataSyncManager from "@/lib/data-sync"

export default function EnhancedAdminAnalytics() {
  const [salesData, setSalesData] = useState<any>(null)
  const [productData, setProductData] = useState<any>(null)
  const [customerData, setCustomerData] = useState<any>(null)
  const [inventoryData, setInventoryData] = useState<any>(null)
  const [restockProductId, setRestockProductId] = useState("")
  const [restockQuantity, setRestockQuantity] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadAnalytics()

    // Subscribe to data change events
    const unsubscribeOrder = dataSyncManager.subscribe("order-created", () => {
      loadAnalytics()
    })

    const unsubscribeInventory = dataSyncManager.subscribe("inventory-updated", () => {
      loadAnalytics()
    })

    const unsubscribeProductAdded = dataSyncManager.subscribe("product-added", () => {
      loadAnalytics()
    })

    const unsubscribeProductDeleted = dataSyncManager.subscribe("product-deleted", () => {
      loadAnalytics()
    })

    return () => {
      unsubscribeOrder()
      unsubscribeInventory()
      unsubscribeProductAdded()
      unsubscribeProductDeleted()
    }
  }, [])

  const loadAnalytics = () => {
    setIsLoading(true)
    setSalesData(AnalyticsEngine.getSalesAnalytics())
    setProductData(AnalyticsEngine.getProductAnalytics())
    setCustomerData(AnalyticsEngine.getCustomerAnalytics())
    setInventoryData(InventoryManager.getInventoryReport())
    setIsLoading(false)
  }

  const handleRestock = () => {
    if (!restockProductId || !restockQuantity) {
      alert("Please enter product ID and quantity")
      return
    }

    try {
      InventoryManager.restockItem(Number(restockProductId), Number(restockQuantity))
      alert("Product restocked successfully!")
      setRestockProductId("")
      setRestockQuantity("")
      loadAnalytics()

      // Publish inventory update event
      dataSyncManager.publish("inventory-updated")
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to restock")
    }
  }

  const handleRefresh = () => {
    loadAnalytics()
  }

  if (!salesData || !productData || !customerData || !inventoryData) {
    return <div className="text-white">Loading analytics...</div>
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
          {isLoading ? "Refreshing..." : "Refresh Analytics"}
        </Button>
      </div>

      {/* Enhanced Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">${salesData.monthlySales.toFixed(2)}</div>
            <p className="text-xs text-gray-400">Avg Order: ${salesData.averageOrderValue.toFixed(2)}</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Inventory Status</CardTitle>
            <Package className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{inventoryData.totalStock}</div>
            <p className="text-xs text-gray-400">{inventoryData.lowStockCount} low stock items</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Top Products Sold</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{productData.totalProductsSold}</div>
            <p className="text-xs text-gray-400">{productData.topProducts.length} trending items</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Customer Value</CardTitle>
            <Users className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">${customerData.averageCustomerValue.toFixed(2)}</div>
            <p className="text-xs text-gray-400">{customerData.totalCustomers} active customers</p>
          </CardContent>
        </Card>
      </div>

      {/* Sales Trend Chart */}
      <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-white">
            <BarChart3 className="h-5 w-5" />
            <span>Sales Trend (Last 7 Days)</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {salesData.dailySales.map((day: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                <div>
                  <div className="text-white font-medium">{new Date(day.date).toLocaleDateString()}</div>
                  <div className="text-gray-400 text-sm">{day.orders} orders</div>
                </div>
                <div className="text-right">
                  <div className="text-green-400 font-bold">${day.sales.toFixed(2)}</div>
                  <div className="w-24 bg-gray-600 rounded-full h-2 mt-1">
                    <div
                      className="bg-green-400 h-2 rounded-full"
                      style={{
                        width: `${Math.min((day.sales / Math.max(...salesData.dailySales.map((d: any) => d.sales))) * 100, 100)}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Products */}
      <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Top Selling Products</CardTitle>
          <CardDescription className="text-gray-400">Best performing products by quantity sold</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-gray-700">
                <TableHead className="text-gray-300">Product</TableHead>
                <TableHead className="text-gray-300">Category</TableHead>
                <TableHead className="text-gray-300">Quantity Sold</TableHead>
                <TableHead className="text-gray-300">Revenue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {productData.topProducts.map((item: any, index: number) => (
                <TableRow key={index} className="border-gray-700">
                  <TableCell className="font-medium text-white">{item.product?.name || "Unknown"}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-gray-700 text-gray-300">
                      {item.product?.category || "N/A"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-300">{item.quantity}</TableCell>
                  <TableCell className="text-green-400 font-medium">${item.revenue.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Inventory Management */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Alert */}
        <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-white">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
              <span>Low Stock Alert</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {inventoryData.lowStockItems.length === 0 ? (
              <p className="text-gray-400">All products are well stocked!</p>
            ) : (
              <div className="space-y-2">
                {inventoryData.lowStockItems.map((product: any) => (
                  <div key={product.id} className="flex items-center justify-between p-2 bg-gray-700/50 rounded">
                    <span className="text-white">{product.name}</span>
                    <Badge variant="destructive" className="bg-yellow-600 text-white">
                      {product.stock} left
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Restock */}
        <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-white">
              <RefreshCw className="h-5 w-5 text-blue-400" />
              <span>Quick Restock</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="productId" className="text-gray-300">
                Product ID
              </Label>
              <Input
                id="productId"
                type="number"
                value={restockProductId}
                onChange={(e) => setRestockProductId(e.target.value)}
                placeholder="Enter product ID"
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity" className="text-gray-300">
                Quantity
              </Label>
              <Input
                id="quantity"
                type="number"
                value={restockQuantity}
                onChange={(e) => setRestockQuantity(e.target.value)}
                placeholder="Enter quantity to add"
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
            <Button onClick={handleRestock} className="w-full bg-blue-600 hover:bg-blue-700">
              Restock Product
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Top Customers */}
      <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Top Customers</CardTitle>
          <CardDescription className="text-gray-400">Highest value customers by total spending</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-gray-700">
                <TableHead className="text-gray-300">Customer</TableHead>
                <TableHead className="text-gray-300">Email</TableHead>
                <TableHead className="text-gray-300">Total Spent</TableHead>
                <TableHead className="text-gray-300">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customerData.topCustomers.map((customer: any, index: number) => (
                <TableRow key={index} className="border-gray-700">
                  <TableCell className="font-medium text-white">{customer.user?.name || "Unknown"}</TableCell>
                  <TableCell className="text-gray-300">{customer.user?.email || "N/A"}</TableCell>
                  <TableCell className="text-green-400 font-medium">${customer.totalSpent.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge
                      variant="default"
                      className={customer.totalSpent > 200 ? "bg-purple-600 text-white" : "bg-blue-600 text-white"}
                    >
                      {customer.totalSpent > 200 ? "VIP" : "Regular"}
                    </Badge>
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
