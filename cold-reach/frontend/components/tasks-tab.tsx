"use client"

import { useState, useEffect } from "react"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import {
  Clock,
  MessageSquare,
  Reply,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Task {
  id: string
  type: "follow_up" | "respond" | "review"
  clientName: string
  clientEmail: string
  company: string
  description: string
  dueDate: string
  priority: "high" | "medium" | "low"
  completed: boolean
}

const taskTypeConfig = {
  follow_up: {
    label: "Follow Up",
    icon: Clock,
    color: "text-yellow-400",
  },
  respond: {
    label: "Respond",
    icon: Reply,
    color: "text-blue-400",
  },
  review: {
    label: "Review",
    icon: MessageSquare,
    color: "text-accent",
  },
}

const priorityConfig = {
  high: { label: "High", color: "bg-red-500/20 text-red-400" },
  medium: { label: "Medium", color: "bg-yellow-500/20 text-yellow-400" },
  low: { label: "Low", color: "bg-secondary text-muted-foreground" },
}

export function TasksTab() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("pending")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const data = await api.getTasks()
        // Map backend data to frontend Task interface if needed, or ensure they match
        // Assuming backend returns matching structure. 
        // Backend key: clientName, frontend: clientName (aliased in Pydantic)
        setTasks(data)
      } catch (error) {
        console.error("Failed to fetch tasks", error)
      } finally {
        setLoading(false)
      }
    }
    fetchTasks()
  }, [])

  const filteredTasks = tasks.filter((task) => {
    if (filter === "pending") return !task.completed
    if (filter === "completed") return task.completed
    return true
  })

  const toggleTask = (id: string) => {
    // TODO: Add API call to toggle completion
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    )
  }

  const pendingCount = tasks.filter((t) => !t.completed).length
  const completedCount = tasks.filter((t) => t.completed).length

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date() && new Date(dueDate).toDateString() !== new Date().toDateString()
  }

  const isToday = (dueDate: string) => {
    return new Date(dueDate).toDateString() === new Date().toDateString()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Tasks</h1>
          <p className="text-sm text-muted-foreground">
            Track follow-ups, responses, and pending actions
          </p>
        </div>

        {/* Filter Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2 bg-transparent">
              {filter === "all" && "All Tasks"}
              {filter === "pending" && `Pending (${pendingCount})`}
              {filter === "completed" && `Completed (${completedCount})`}
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setFilter("all")}>
              All Tasks ({tasks.length})
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilter("pending")}>
              Pending ({pendingCount})
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilter("completed")}>
              Completed ({completedCount})
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/20">
              <AlertCircle className="h-5 w-5 text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {tasks.filter((t) => !t.completed && isOverdue(t.dueDate)).length}
              </p>
              <p className="text-sm text-muted-foreground">Overdue</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500/20">
              <Clock className="h-5 w-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {tasks.filter((t) => !t.completed && isToday(t.dueDate)).length}
              </p>
              <p className="text-sm text-muted-foreground">Due Today</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/20">
              <CheckCircle2 className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{completedCount}</p>
              <p className="text-sm text-muted-foreground">Completed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {filteredTasks.map((task) => {
          const TypeIcon = taskTypeConfig[task.type].icon
          const overdue = isOverdue(task.dueDate) && !task.completed
          const today = isToday(task.dueDate)

          return (
            <div
              key={task.id}
              className={`rounded-lg border border-border bg-card p-4 transition-all ${task.completed ? "opacity-60" : ""
                } ${overdue ? "border-red-500/50" : ""}`}
            >
              <div className="flex items-start gap-4">
                <button
                  onClick={() => toggleTask(task.id)}
                  className={`mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 transition-colors ${task.completed
                      ? "border-accent bg-accent text-accent-foreground"
                      : "border-muted-foreground hover:border-accent"
                    }`}
                >
                  {task.completed && <CheckCircle2 className="h-3 w-3" />}
                </button>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <div
                      className={`flex items-center gap-1 ${taskTypeConfig[task.type].color}`}
                    >
                      <TypeIcon className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        {taskTypeConfig[task.type].label}
                      </span>
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${priorityConfig[task.priority].color
                        }`}
                    >
                      {priorityConfig[task.priority].label}
                    </span>
                  </div>

                  <p
                    className={`mt-1 text-foreground ${task.completed ? "line-through" : ""
                      }`}
                  >
                    {task.description}
                  </p>

                  <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <span>
                      {task.clientName} - {task.company}
                    </span>
                    <span
                      className={`${overdue ? "text-red-400" : ""} ${today ? "text-yellow-400" : ""
                        }`}
                    >
                      {overdue && "Overdue: "}
                      {today && "Today"}
                      {!overdue &&
                        !today &&
                        `Due: ${new Date(task.dueDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}`}
                    </span>
                  </div>
                </div>

                {!task.completed && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleTask(task.id)}
                  >
                    Mark Done
                  </Button>
                )}
              </div>
            </div>
          )
        })}

        {filteredTasks.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-card py-12 text-center">
            <CheckCircle2 className="mb-4 h-12 w-12 text-accent" />
            <p className="text-lg font-medium text-foreground">All caught up!</p>
            <p className="text-sm text-muted-foreground">
              {filter === "pending"
                ? "No pending tasks"
                : filter === "completed"
                  ? "No completed tasks yet"
                  : "No tasks to display"}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
