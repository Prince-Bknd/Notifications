"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

export function SimpleThemeToggle() {
  const { setTheme, theme } = useTheme()

  // Force to light if system is detected
  const currentTheme = theme === "system" ? "light" : theme
  const isDark = currentTheme === "dark"

  const toggleTheme = () => {
    if (isDark) {
      setTheme("light")
    } else {
      setTheme("dark")
    }
  }

  return (
    <Button
      onClick={toggleTheme}
      variant="outline"
      size="sm"
      className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-300 dark:border-gray-600 hover:bg-white dark:hover:bg-gray-800 shadow-sm hover:shadow-md transition-all duration-200 px-2"
    >
      {isDark ? (
        <Sun className="h-4 w-4 text-yellow-600" />
      ) : (
        <Moon className="h-4 w-4 text-blue-600" />
      )}
    </Button>
  )
} 