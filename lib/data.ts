export interface Product {
  id: number
  name: string
  price: number
  category: string
  description: string
  stock: number
}

export interface User {
  id: number
  name: string
  email: string
  password: string
  phone?: string
  address?: string
  createdAt: string
}

export interface Order {
  id: number
  userId: number
  customerName: string
  items: {
    productId: number
    productName: string
    quantity: number
    price: number
  }[]
  total: number
  status: "pending" | "completed" | "cancelled"
  date: string
}

// In-memory data storage (simulates database)
const products: Product[] = [
  {
    id: 1,
    name: "Wireless Bluetooth Headphones",
    price: 79.99,
    category: "Electronics",
    description: "High-quality wireless headphones with noise cancellation and 30-hour battery life.",
    stock: 25,
  },
  {
    id: 2,
    name: "Smart Fitness Watch",
    price: 199.99,
    category: "Electronics",
    description: "Advanced fitness tracking with heart rate monitor, GPS, and smartphone integration.",
    stock: 15,
  },
  {
    id: 3,
    name: "Organic Cotton T-Shirt",
    price: 29.99,
    category: "Clothing",
    description: "Comfortable and sustainable organic cotton t-shirt available in multiple colors.",
    stock: 50,
  },
  {
    id: 4,
    name: "Stainless Steel Water Bottle",
    price: 24.99,
    category: "Home & Garden",
    description: "Insulated stainless steel water bottle that keeps drinks cold for 24 hours.",
    stock: 30,
  },
  {
    id: 5,
    name: "Wireless Phone Charger",
    price: 39.99,
    category: "Electronics",
    description: "Fast wireless charging pad compatible with all Qi-enabled devices.",
    stock: 20,
  },
  {
    id: 6,
    name: "Premium Coffee Beans",
    price: 18.99,
    category: "Food & Beverage",
    description: "Single-origin arabica coffee beans, medium roast with notes of chocolate and caramel.",
    stock: 40,
  },
  {
    id: 7,
    name: "Yoga Mat",
    price: 49.99,
    category: "Sports & Fitness",
    description: "Non-slip yoga mat with extra cushioning for comfortable practice.",
    stock: 35,
  },
  {
    id: 8,
    name: "LED Desk Lamp",
    price: 59.99,
    category: "Home & Garden",
    description: "Adjustable LED desk lamp with multiple brightness levels and USB charging port.",
    stock: 18,
  },
]

const users: User[] = [
  {
    id: 1,
    name: "Admin User",
    email: "admin@shop.com",
    password: "admin123",
    phone: "+1-555-0100",
    address: "123 Admin Street, Admin City, AC 12345",
    createdAt: new Date().toISOString(),
  },
]

const orders: Order[] = []

let nextProductId = products.length + 1
let nextUserId = users.length + 1
let nextOrderId = 1

// Product functions
export function getProducts(): Product[] {
  return [...products]
}

export function getProductById(id: number): Product | undefined {
  return products.find((p) => p.id === id)
}

export function addProduct(product: Omit<Product, "id">): Product {
  const newProduct = { ...product, id: nextProductId++ }
  products.push(newProduct)
  return newProduct
}

export function updateProduct(id: number, updates: Partial<Product>): Product {
  const index = products.findIndex((p) => p.id === id)
  if (index !== -1) {
    products[index] = { ...products[index], ...updates }
    return products[index]
  }
  throw new Error("Product not found")
}

export function deleteProduct(id: number): boolean {
  const index = products.findIndex((p) => p.id === id)
  if (index !== -1) {
    products.splice(index, 1)
    return true
  }
  return false
}

// User functions
export function getUsers(): User[] {
  return [...users]
}

export function addUser(user: Omit<User, "id" | "createdAt">): User {
  const newUser = {
    ...user,
    id: nextUserId++,
    createdAt: new Date().toISOString(),
  }
  users.push(newUser)
  return newUser
}

export function updateUser(id: number, updates: Partial<User>): User {
  const index = users.findIndex((u) => u.id === id)
  if (index !== -1) {
    users[index] = { ...users[index], ...updates }
    return users[index]
  }
  throw new Error("User not found")
}

// Order functions
export function getOrders(): Order[] {
  return [...orders]
}

export function getOrdersByUserId(userId: number): Order[] {
  return orders.filter((order) => order.userId === userId)
}

export function createOrder(order: Omit<Order, "id">): Order {
  const newOrder = { ...order, id: nextOrderId++ }
  orders.push(newOrder)
  return newOrder
}

// Inventory functions
export function updateStock(productId: number, quantityPurchased: number): boolean {
  const product = products.find((p) => p.id === productId)

  if (!product) {
    throw new Error("Product not found")
  }

  if (product.stock < quantityPurchased) {
    throw new Error("Insufficient stock")
  }

  product.stock -= quantityPurchased
  return true
}

export function adjustStock(productId: number, adjustment: number): boolean {
  const product = products.find((p) => p.id === productId)

  if (!product) {
    throw new Error("Product not found")
  }

  product.stock = Math.max(0, product.stock + adjustment)
  return true
}
