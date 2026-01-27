"use client"

import { useState } from "react"
import { LandingPage } from "@/components/landing-page"
import { Dashboard } from "@/components/dashboard"

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const handleSignIn = () => {
    // In production, this would handle OAuth with Google/Apple
    setIsAuthenticated(true)
  }

  const handleSignOut = () => {
    setIsAuthenticated(false)
  }

  if (!isAuthenticated) {
    return <LandingPage onSignIn={handleSignIn} />
  }

  return <Dashboard onSignOut={handleSignOut} />
}
