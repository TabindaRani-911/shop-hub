"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Users, Package, ShoppingCart, DollarSign, Plus, Trash2, RefreshCw } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import {
  getProducts,
  getUsers,
  getOrders,
  addProduct,
  deleteProduct,
  adjustStock,
  type Product,
  type User,
  type Order,
} from "@/lib/data"
import { useRouter } from "next/navigation"

export default function AdminDashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    category: "",
    description: "",
    stock: "",
  })

  useEffect(() => {
    if (!user || user.email !== "admin@shop.com") {
      router.push("/")
      return
    }

    loadData()
  }, [user, router])

  const loadData = () => {
    setIsLoading(true)
    setProducts(getProducts())
    setUsers(getUsers())
    setOrders(getOrders())
    setIsLoading(false)
  }

  const handleRefresh = () => {
    loadData()
  }

  if (!user || user.email !== "admin@shop.com") {
    return null
  }

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.price || !newProduct.category) {
      alert("Please fill in all required fields")
      return
    }

    const product: Omit<Product, "id"> = {
      name: newProduct.name,
      price: Number.parseFloat(newProduct.price),
      category: newProduct.category,
      description: newProduct.description,
      stock: Number.parseInt(newProduct.stock) || 0,
    }

    addProduct(product)
    setProducts(getProducts())
    setNewProduct({ name: "", price: "", category: "", description: "", stock: "" })
    alert("Product added successfully!")
  }

  const handleDeleteProduct = (id: number) => {
    if (confirm("Are you sure you want to delete this product?")) {
      deleteProduct(id)
      setProducts(getProducts())
      alert("Product deleted successfully!")
    }
  }

  const handleStockAdjustment = (productId: number, adjustment: number) => {
    try {
      adjustStock(productId, adjustment)
      setProducts(getProducts())
      alert("Stock adjusted successfully!")
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to adjust stock")
    }
  }

  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0)
  const totalUsers = users.length
  const totalProducts = products.length
  const totalOrders = orders.length

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black">
      <header className="bg-gray-900/80 backdrop-blur-md border-b border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={handleRefresh}
                className="border-gray-600 text-gray-300 hover:bg-gray-800 flex items-center gap-2"
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                {isLoading ? "Refreshing..." : "Refresh Data"}
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/")}
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                Back to Store
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Total Users</CardTitle>
              <Users className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{totalUsers}</div>
              <p className="text-xs text-gray-400">Registered customers</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Total Products</CardTitle>
              <Package className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{totalProducts}</div>
              <p className="text-xs text-gray-400">Available products</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{totalOrders}</div>
              <p className="text-xs text-gray-400">Completed orders</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">${totalRevenue.toFixed(2)}</div>
              <p className="text-xs text-gray-400">Total sales</p>
            </CardContent>
          </Card>
        </div>

        {/* Management Tabs */}
        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-gray-800 border-gray-700">
            <TabsTrigger value="products" className="data-[state=active]:bg-gray-700 text-gray-300">
              Products
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-gray-700 text-gray-300">
              Users
            </TabsTrigger>
            <TabsTrigger value="orders" className="data-[state=active]:bg-gray-700 text-gray-300">
              Orders
            </TabsTrigger>
            <TabsTrigger value="inventory" className="data-[state=active]:bg-gray-700 text-gray-300">
              Inventory
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-6">
            {/* Add Product Form */}
            <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-white">
                  <Plus className="h-5 w-5" />
                  <span>Add New Product</span>
                </CardTitle>
                <CardDescription className="text-gray-400">Add a new product to your inventory</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-gray-300">
                      Product Name *
                    </Label>
                    <Input
                      id="name"
                      value={newProduct.name}
                      onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                      placeholder="Enter product name"
                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price" className="text-gray-300">
                      Price *
                    </Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                      placeholder="0.00"
                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-gray-300">
                      Category *
                    </Label>
                    <Input
                      id="category"
                      value={newProduct.category}
                      onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                      placeholder="e.g., Electronics, Clothing"
                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stock" className="text-gray-300">
                      Stock Quantity
                    </Label>
                    <Input
                      id="stock"
                      type="number"
                      value={newProduct.stock}
                      onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                      placeholder="0"
                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-gray-300">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                    placeholder="Enter product description"
                    rows={3}
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  />
                </div>
                <Button onClick={handleAddProduct} className="w-full md:w-auto bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              </CardContent>
            </Card>

            {/* Products Table */}
            <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Product Inventory</CardTitle>
                <CardDescription className="text-gray-400">Manage your product catalog</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-700">
                      <TableHead className="text-gray-300">Name</TableHead>
                      <TableHead className="text-gray-300">Category</TableHead>
                      <TableHead className="text-gray-300">Price</TableHead>
                      <TableHead className="text-gray-300">Stock</TableHead>
                      <TableHead className="text-gray-300">Actions</TableHead>
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
                        <TableCell className="text-gray-300">${product.price}</TableCell>
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
                            {product.stock}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="destructive" size="sm" onClick={() => handleDeleteProduct(product.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">User Management</CardTitle>
                <CardDescription className="text-gray-400">View all registered customers</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-700">
                      <TableHead className="text-gray-300">Name</TableHead>
                      <TableHead className="text-gray-300">Email</TableHead>
                      <TableHead className="text-gray-300">Phone</TableHead>
                      <TableHead className="text-gray-300">Address</TableHead>
                      <TableHead className="text-gray-300">Joined</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users
                      .filter((u) => u.email !== "admin@shop.com")
                      .map((user) => (
                        <TableRow key={user.id} className="border-gray-700">
                          <TableCell className="font-medium text-white">{user.name}</TableCell>
                          <TableCell className="text-gray-300">{user.email}</TableCell>
                          <TableCell className="text-gray-300">{user.phone || "N/A"}</TableCell>
                          <TableCell className="text-gray-300">{user.address || "N/A"}</TableCell>
                          <TableCell className="text-gray-300">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders">
            <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Order Management</CardTitle>
                <CardDescription className="text-gray-400">Track all customer orders</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-700">
                      <TableHead className="text-gray-300">Order ID</TableHead>
                      <TableHead className="text-gray-300">Customer</TableHead>
                      <TableHead className="text-gray-300">Items</TableHead>
                      <TableHead className="text-gray-300">Total</TableHead>
                      <TableHead className="text-gray-300">Status</TableHead>
                      <TableHead className="text-gray-300">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id} className="border-gray-700">
                        <TableCell className="font-medium text-white">#{order.id}</TableCell>
                        <TableCell className="text-gray-300">{order.customerName}</TableCell>
                        <TableCell className="text-gray-300">{order.items.length} items</TableCell>
                        <TableCell className="text-gray-300">${order.total.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge variant="default" className="bg-green-600 text-white">
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-300">{new Date(order.date).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inventory">
            <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Inventory Management</CardTitle>
                <CardDescription className="text-gray-400">Adjust stock levels for products</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-700">
                      <TableHead className="text-gray-300">Product</TableHead>
                      <TableHead className="text-gray-300">Current Stock</TableHead>
                      <TableHead className="text-gray-300">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product) => (
                      <TableRow key={product.id} className="border-gray-700">
                        <TableCell className="font-medium text-white">{product.name}</TableCell>
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
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStockAdjustment(product.id, -1)}
                              disabled={product.stock <= 0}
                              className="border-gray-600 text-gray-300 hover:bg-gray-600"
                            >
                              -1
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStockAdjustment(product.id, -5)}
                              disabled={product.stock < 5}
                              className="border-gray-600 text-gray-300 hover:bg-gray-600"
                            >
                              -5
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStockAdjustment(product.id, 5)}
                              className="border-gray-600 text-gray-300 hover:bg-gray-600"
                            >
                              +5
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStockAdjustment(product.id, 10)}
                              className="border-gray-600 text-gray-300 hover:bg-gray-600"
                            >
                              +10
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
