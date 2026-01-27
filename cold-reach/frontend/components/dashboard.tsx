"use client"

import React from "react"

import { useState } from "react"
import { Logo } from "./logo"
import { ClientsTab } from "./clients-tab"
import { TasksTab } from "./tasks-tab"
import { HistoryTab } from "./history-tab"
import { TemplatesTab } from "./templates-tab"
import { OverviewTab } from "./overview-tab"
import { EmailComposer } from "./email-composer"
import { Button } from "@/components/ui/button"
import { Users, ListTodo, LogOut, LayoutDashboard, History, FileText } from "lucide-react"

interface DashboardProps {
  onSignOut: () => void
}

export function Dashboard({ onSignOut }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "clients" | "tasks" | "history" | "templates">("overview")
  const [selectedClients, setSelectedClients] = useState<string[]>([])
  const [showComposer, setShowComposer] = useState(false)

  const handleLogoClick = () => setActiveTab("overview")

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div onClick={handleLogoClick} className="cursor-pointer transition-opacity hover:opacity-80">
            <Logo />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">john@company.com</span>
            <Button variant="ghost" size="sm" onClick={onSignOut} className="gap-2">
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex gap-1">
            <TabButton
              active={activeTab === "overview"}
              onClick={() => setActiveTab("overview")}
              icon={<LayoutDashboard className="h-4 w-4" />}
              label="Overview"
            />
            <TabButton
              active={activeTab === "clients"}
              onClick={() => setActiveTab("clients")}
              icon={<Users className="h-4 w-4" />}
              label="Clients"
            />
            <TabButton
              active={activeTab === "tasks"}
              onClick={() => setActiveTab("tasks")}
              icon={<ListTodo className="h-4 w-4" />}
              label="Tasks"
              badge={3}
            />
            <TabButton
              active={activeTab === "history"}
              onClick={() => setActiveTab("history")}
              icon={<History className="h-4 w-4" />}
              label="History"
            />
            <TabButton
              active={activeTab === "templates"}
              onClick={() => setActiveTab("templates")}
              icon={<FileText className="h-4 w-4" />}
              label="Templates"
            />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 px-6 py-8">
        <div className="mx-auto max-w-7xl">
          {activeTab === "overview" && (
            <OverviewTab onNavigateToClients={() => setActiveTab("clients")} />
          )}
          {activeTab === "clients" && (
            <ClientsTab
              selectedClients={selectedClients}
              setSelectedClients={setSelectedClients}
              onComposeEmail={() => setShowComposer(true)}
            />
          )}
          {activeTab === "tasks" && <TasksTab />}
          {activeTab === "history" && <HistoryTab />}
          {activeTab === "templates" && <TemplatesTab />}
        </div>
      </main>

      {/* Email Composer Modal */}
      {showComposer && (
        <EmailComposer
          recipientIds={selectedClients}
          onClose={() => setShowComposer(false)}
          onSend={() => {
            setShowComposer(false)
            setSelectedClients([])
          }}
        />
      )}
    </div>
  )
}

function TabButton({
  active,
  onClick,
  icon,
  label,
  badge,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
  badge?: number
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${active
        ? "border-accent text-foreground"
        : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
        }`}
    >
      {icon}
      {label}
      {badge !== undefined && badge > 0 && (
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-xs font-semibold text-accent-foreground">
          {badge}
        </span>
      )}
    </button>
  )
}
