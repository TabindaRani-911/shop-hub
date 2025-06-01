"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { Product } from "./data"
import { getProducts } from "./data"

interface CartItem extends Product {
  quantity: number
}

interface CartContextType {
  cartItems: CartItem[]
  addToCart: (product: Product) => void
  removeFromCart: (productId: number) => void
  updateQuantity: (productId: number, quantity: number) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([])

  useEffect(() => {
    const savedCart = localStorage.getItem("cartItems")
    if (savedCart) {
      setCartItems(JSON.parse(savedCart))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(cartItems))
  }, [cartItems])

  const addToCart = (product: Product) => {
    // Get the latest product data
    const products = getProducts()
    const currentProduct = products.find((p) => p.id === product.id) || product

    if (currentProduct.stock <= 0) {
      alert("Product is out of stock!")
      return
    }

    const existingItem = cartItems.find((item) => item.id === currentProduct.id)
    const currentQuantityInCart = existingItem ? existingItem.quantity : 0

    if (currentQuantityInCart >= currentProduct.stock) {
      alert(`Only ${currentProduct.stock} items available in stock!`)
      return
    }

    setCartItems((prev) => {
      const existingItem = prev.find((item) => item.id === currentProduct.id)
      if (existingItem) {
        return prev.map((item) => (item.id === currentProduct.id ? { ...item, quantity: item.quantity + 1 } : item))
      }
      return [...prev, { ...currentProduct, quantity: 1 }]
    })

    alert(`${currentProduct.name} added to cart!`)
  }

  const removeFromCart = (productId: number) => {
    setCartItems((prev) => prev.filter((item) => item.id !== productId))
  }

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }

    const products = getProducts()
    const product = products.find((p) => p.id === productId)

    if (product && quantity > product.stock) {
      alert(`Only ${product.stock} items available in stock!`)
      return
    }

    setCartItems((prev) => prev.map((item) => (item.id === productId ? { ...item, quantity } : item)))
  }

  const clearCart = () => {
    setCartItems([])
  }

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
