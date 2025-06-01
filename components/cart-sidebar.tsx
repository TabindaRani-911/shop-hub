"use client"

import { useState } from "react"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react"
import { useCart } from "@/lib/cart-context"
import { useAuth } from "@/lib/auth-context"
import { createOrder, updateStock } from "@/lib/data"

interface CartSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const { cartItems, updateQuantity, removeFromCart, clearCart } = useCart()
  const { user } = useAuth()
  const [isCheckingOut, setIsCheckingOut] = useState(false)

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)

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
    return imageMap[productId] || `/placeholder.svg?height=64&width=64`
  }

  const handleCheckout = async () => {
    if (!user) {
      alert("Please login to checkout")
      return
    }

    if (cartItems.length === 0) {
      alert("Your cart is empty")
      return
    }

    setIsCheckingOut(true)

    try {
      // Update stock for each item
      for (const item of cartItems) {
        updateStock(item.id, item.quantity)
      }

      // Create the order
      const order = {
        userId: user.id,
        customerName: user.name,
        items: cartItems.map((item) => ({
          productId: item.id,
          productName: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
        total,
        status: "completed" as const,
        date: new Date().toISOString(),
      }

      createOrder(order)
      clearCart()

      alert("Order placed successfully!")
      onClose()

      // Refresh the page to show updated data
      window.location.reload()
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to place order")
    } finally {
      setIsCheckingOut(false)
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg bg-gray-800 border-gray-700">
        <SheetHeader>
          <SheetTitle className="flex items-center space-x-2 text-white">
            <ShoppingBag className="h-5 w-5" />
            <span>Shopping Cart</span>
            {itemCount > 0 && (
              <Badge variant="secondary" className="bg-blue-600 text-white">
                {itemCount} items
              </Badge>
            )}
          </SheetTitle>
          <SheetDescription className="text-gray-400">Review your items and proceed to checkout</SheetDescription>
        </SheetHeader>

        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto py-6">
            {cartItems.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingBag className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400">Your cart is empty</p>
                <p className="text-sm text-gray-500 mt-2">Add some products to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center space-x-4 p-4 border border-gray-700 rounded-lg bg-gray-700/50"
                  >
                    <div className="w-16 h-16 bg-gray-600 rounded-md flex items-center justify-center">
                      <img
                        src={getProductImage(item.id) || "/placeholder.svg"}
                        alt={item.name}
                        className="w-full h-full object-cover rounded-md"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate text-white">{item.name}</h4>
                      <p className="text-sm text-gray-400">${item.price}</p>
                      <Badge variant="outline" className="text-xs mt-1 border-gray-600 text-gray-300">
                        {item.category}
                      </Badge>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.id, Math.max(0, item.quantity - 1))}
                        className="h-8 w-8 p-0 border-gray-600 text-gray-300 hover:bg-gray-600"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center text-sm text-white">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="h-8 w-8 p-0 border-gray-600 text-gray-300 hover:bg-gray-600"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeFromCart(item.id)}
                        className="h-8 w-8 p-0 ml-2"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {cartItems.length > 0 && (
            <div className="border-t border-gray-700 pt-4 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Subtotal ({itemCount} items)</span>
                  <span className="text-white">${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Shipping</span>
                  <span className="text-green-400">Free</span>
                </div>
                <Separator className="bg-gray-700" />
                <div className="flex justify-between font-semibold">
                  <span className="text-white">Total</span>
                  <span className="text-white">${total.toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={handleCheckout}
                  disabled={isCheckingOut || !user}
                >
                  {isCheckingOut ? "Processing..." : "Checkout"}
                </Button>
                {!user && <p className="text-xs text-center text-gray-500">Please login to checkout</p>}
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
