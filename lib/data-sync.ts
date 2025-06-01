// This file provides a central event system for data synchronization
// between different parts of the application

type EventType = "inventory-updated" | "order-created" | "product-added" | "product-deleted"

type EventCallback = (data?: any) => void

class DataSyncManager {
  private listeners: Map<EventType, EventCallback[]> = new Map()
  private debug = true

  // Register a listener for a specific event
  subscribe(event: EventType, callback: EventCallback): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }

    this.listeners.get(event)!.push(callback)

    if (this.debug) {
      console.log(`[DataSync] Subscribed to ${event}, total listeners: ${this.listeners.get(event)!.length}`)
    }

    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(event)
      if (callbacks) {
        const index = callbacks.indexOf(callback)
        if (index !== -1) {
          callbacks.splice(index, 1)
          if (this.debug) {
            console.log(`[DataSync] Unsubscribed from ${event}, remaining listeners: ${callbacks.length}`)
          }
        }
      }
    }
  }

  // Publish an event to all listeners
  publish(event: EventType, data?: any): void {
    const callbacks = this.listeners.get(event)

    if (this.debug) {
      console.log(`[DataSync] Publishing ${event} event with data:`, data)
      console.log(`[DataSync] Number of listeners for ${event}: ${callbacks?.length || 0}`)
    }

    if (callbacks && callbacks.length > 0) {
      callbacks.forEach((callback) => {
        try {
          callback(data)
        } catch (error) {
          console.error(`[DataSync] Error in ${event} event handler:`, error)
        }
      })
    }
  }
}

// Create a singleton instance
const dataSyncManager = new DataSyncManager()

export default dataSyncManager
