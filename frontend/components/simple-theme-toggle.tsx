"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"

export function SimpleThemeToggle() {
  const { setTheme, theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-300 dark:border-gray-600 hover:bg-white dark:hover:bg-gray-800 shadow-sm hover:shadow-md transition-all duration-200 px-2"
      >
        <Sun className="h-4 w-4 text-yellow-600" />
      </Button>
    )
  }

  return (
    <Button
      onClick={toggleTheme}
      variant="outline"
      size="sm"
      className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-300 dark:border-gray-600 hover:bg-white dark:hover:bg-gray-800 shadow-sm hover:shadow-md transition-all duration-200 px-2"
    >
      {theme === "dark" ? (
        <Sun className="h-4 w-4 text-yellow-600" />
      ) : (
        <Moon className="h-4 w-4 text-blue-600" />
      )}
    </Button>
  )
} 