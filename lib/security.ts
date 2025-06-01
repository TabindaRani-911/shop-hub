// Security utilities for production-ready authentication
export class SecurityUtils {
  // Simulate bcrypt password hashing
  static async hashPassword(password: string): Promise<string> {
    // In production, use actual bcrypt
    const salt = Math.random().toString(36).substring(2, 15)
    return `hashed_${password}_${salt}`
  }

  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    // In production, use actual bcrypt.compare
    return hash.includes(password)
  }

  // Input validation
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  static validatePassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (password.length < 8) {
      errors.push("Password must be at least 8 characters long")
    }
    if (!/[A-Z]/.test(password)) {
      errors.push("Password must contain at least one uppercase letter")
    }
    if (!/[a-z]/.test(password)) {
      errors.push("Password must contain at least one lowercase letter")
    }
    if (!/\d/.test(password)) {
      errors.push("Password must contain at least one number")
    }

    return { isValid: errors.length === 0, errors }
  }

  // XSS Protection
  static sanitizeInput(input: string): string {
    return input
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#x27;")
      .replace(/\//g, "&#x2F;")
  }
}
