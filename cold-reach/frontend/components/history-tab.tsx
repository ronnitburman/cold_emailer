"use client"

import { useState, useEffect } from "react"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Search, Mail, Eye } from "lucide-react"

interface EmailLog {
  id: string
  timestamp: string
  recipient_count: number
  subject: string
  body: string
  status: "sent" | "failed"
  recipients: string[]
}

export function HistoryTab() {
  const [history, setHistory] = useState<EmailLog[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedEmail, setSelectedEmail] = useState<EmailLog | null>(null)

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await api.getEmailHistory()
        setHistory(data)
      } catch (error) {
        console.error("Failed to fetch email history", error)
      } finally {
        setLoading(false)
      }
    }
    fetchHistory()
  }, [])

  const filteredHistory = history.filter(
    (log) =>
      log.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.body.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Email History</h1>
          <p className="text-sm text-muted-foreground">
            View logs of all sent campaigns
          </p>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search history..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="rounded-md border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date & Time</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Recipients</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredHistory.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No history found
                </TableCell>
              </TableRow>
            ) : (
              filteredHistory.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    {new Date(log.timestamp).toLocaleString()}
                  </TableCell>
                  <TableCell className="font-medium">{log.subject}</TableCell>
                  <TableCell>{log.recipient_count} recipients</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                        log.status === "sent"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {log.status.toUpperCase()}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedEmail(log)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!selectedEmail} onOpenChange={() => setSelectedEmail(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Email Details</DialogTitle>
          </DialogHeader>
          {selectedEmail && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-semibold text-muted-foreground">Sent:</span>{" "}
                  {new Date(selectedEmail.timestamp).toLocaleString()}
                </div>
                <div>
                  <span className="font-semibold text-muted-foreground">Status:</span>{" "}
                  {selectedEmail.status.toUpperCase()}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Subject
                </label>
                <div className="rounded-md border border-border bg-muted p-2 text-sm">
                  {selectedEmail.subject}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Body
                </label>
                <div className="max-h-[300px] overflow-y-auto rounded-md border border-border bg-muted p-4 text-sm whitespace-pre-wrap">
                  {selectedEmail.body}
                </div>
              </div>
              <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                      Recipient IDs ({selectedEmail.recipient_count})
                  </label>
                  <div className="max-h-[100px] overflow-y-auto rounded-md border p-2 text-xs text-muted-foreground">
                      {selectedEmail.recipients?.join(", ") || "No recipients logged"}
                  </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
