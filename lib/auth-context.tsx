"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { getUsers, addUser, updateUser, type User } from "./data"

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  register: (userData: Omit<User, "id" | "createdAt">) => Promise<void>
  logout: () => void
  updateProfile: (userData: Partial<User>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const savedUser = localStorage.getItem("currentUser")
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
  }, [])

  const login = async (email: string, password: string) => {
    const users = getUsers()
    const foundUser = users.find((u) => u.email === email && u.password === password)

    if (!foundUser) {
      throw new Error("Invalid email or password")
    }

    setUser(foundUser)
    localStorage.setItem("currentUser", JSON.stringify(foundUser))
  }

  const register = async (userData: Omit<User, "id" | "createdAt">) => {
    const users = getUsers()
    const existingUser = users.find((u) => u.email === userData.email)

    if (existingUser) {
      throw new Error("User with this email already exists")
    }

    const newUser = addUser(userData)
    setUser(newUser)
    localStorage.setItem("currentUser", JSON.stringify(newUser))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("currentUser")
  }

  const updateProfile = async (userData: Partial<User>) => {
    if (!user) throw new Error("No user logged in")

    const updatedUser = updateUser(user.id, userData)
    setUser(updatedUser)
    localStorage.setItem("currentUser", JSON.stringify(updatedUser))
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateProfile }}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
