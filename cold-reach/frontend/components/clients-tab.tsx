"use client"

import React, { useState, useRef } from "react"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Upload,
  Link2,
  Search,
  Send,
  MoreHorizontal,
  FileSpreadsheet,
  X,
  Trash2,
  AlertCircle,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export interface Client {
  id: string
  name: string
  email: string
  company: string
  status: "not_contacted" | "emailed" | "replied" | "follow_up" | "closed"
  lastContact: string | null
}

const initialClients: Client[] = []

const statusConfig = {
  not_contacted: { label: "Not Contacted", color: "bg-secondary text-secondary-foreground" },
  emailed: { label: "Emailed", color: "bg-blue-500/20 text-blue-400" },
  replied: { label: "Replied", color: "bg-accent/20 text-accent" },
  follow_up: { label: "Follow Up", color: "bg-yellow-500/20 text-yellow-400" },
  closed: { label: "Closed", color: "bg-muted text-muted-foreground" },
}

interface ClientsTabProps {
  selectedClients: string[]
  setSelectedClients: (clients: string[]) => void
  onComposeEmail: () => void
}

export function ClientsTab({
  selectedClients,
  setSelectedClients,
  onComposeEmail,
}: ClientsTabProps) {
  const [clients, setClients] = useState<Client[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showLinkModal, setShowLinkModal] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(true)

  const fetchClients = async () => {
    try {
      setLoading(true)
      const data = await api.getClients(searchQuery)
      setClients(data)
    } catch (error) {
      console.error("Failed to fetch clients", error)
    } finally {
      setLoading(false)
    }
  }

  // Initial fetch and search debouncing could be added here
  // For MVP, just fetching on mount and when search changes (debounced ideally, but simple here)
  React.useEffect(() => {
    const timer = setTimeout(() => fetchClients(), 500)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const filteredClients = clients // Backend handles filtering now if we use the search param properly, or we filter locally if backend returns all. 
  // Our backend implementation does filtering. So we rely on fetchClients. 
  // However, to keep it smooth, let's trust the backend response.

  const toggleClient = (id: string) => {
    setSelectedClients(
      selectedClients.includes(id)
        ? selectedClients.filter((c) => c !== id)
        : [...selectedClients, id]
    )
  }

  const toggleAll = () => {
    if (selectedClients.length === clients.length) {
      setSelectedClients([])
    } else {
      setSelectedClients(clients.map((c) => c.id))
    }
  }

  const [duplicateData, setDuplicateData] = useState<{ existing_emails: string[] } | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      try {
        await api.importExcel(file, false)
        await fetchClients()
        setShowUploadModal(false)
        setSelectedFile(null)
      } catch (error: any) {
        if (error.details && error.details.existing_emails) {
          setDuplicateData(error.details)
          // Don't close upload modal yet, technically we switch to duplicate modal
          // But let's keep upload modal open or close it? 
          // Better UX: Close upload modal, open duplicate modal
          setShowUploadModal(false)
        } else {
          console.error("Upload failed", error)
          alert(error.message || "Failed to upload file")
        }
      }
    }
  }

  const handleConfirmDuplicates = async () => {
    if (selectedFile) {
      try {
        await api.importExcel(selectedFile, true)
        await fetchClients()
        setDuplicateData(null)
        setSelectedFile(null)
      } catch (error) {
        console.error("Upload failed", error)
        alert("Failed to upload file after confirmation")
      }
    }
  }

  const handleGoogleSheetLink = async (url: string) => {
    if (url) {
      try {
        await api.importGoogleSheet(url)
        await fetchClients()
        setShowLinkModal(false)
      } catch (error) {
        console.error("Link failed", error)
        alert("Failed to import from Google Sheet")
      }
    }
  }

  const deleteClient = async (id: string) => {
    try {
      await api.deleteClient(id)
      setClients(clients.filter((c) => c.id !== id))
      setSelectedClients(selectedClients.filter((c) => c !== id))
    } catch (error) {
      console.error("Delete failed", error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Clients</h1>
          <p className="text-sm text-muted-foreground">
            Manage your contact list and send personalized emails
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2 bg-transparent"
            onClick={() => setShowUploadModal(true)}
          >
            <Upload className="h-4 w-4" />
            Upload Excel
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 bg-transparent"
            onClick={() => setShowLinkModal(true)}
          >
            <Link2 className="h-4 w-4" />
            Google Sheet
          </Button>
        </div>
      </div>

      {/* Search and Actions Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search clients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        {selectedClients.length > 0 && (
          <div className="flex gap-2">
            <Button variant="destructive" onClick={async () => {
              if (confirm(`Are you sure you want to delete ${selectedClients.length} clients?`)) {
                try {
                  setLoading(true)
                  await Promise.all(selectedClients.map(id => api.deleteClient(id)))
                  await fetchClients()
                  setSelectedClients([])
                } catch (error) {
                  console.error("Bulk delete failed", error)
                  alert("Failed to delete clients")
                } finally {
                  setLoading(false)
                }
              }
            }} className="gap-2">
              <Trash2 className="h-4 w-4" />
              Delete ({selectedClients.length})
            </Button>
            <Button onClick={onComposeEmail} className="gap-2">
              <Send className="h-4 w-4" />
              Compose Email ({selectedClients.length})
            </Button>
          </div>
        )}
      </div>

      {/* Clients Table */}
      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full">
          <thead className="bg-card">
            <tr className="border-b border-border">
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={
                    filteredClients.length > 0 &&
                    selectedClients.length === filteredClients.length
                  }
                  onChange={toggleAll}
                  className="h-4 w-4 rounded border-border bg-input accent-accent"
                />
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Name
              </th>
              <th className="hidden px-4 py-3 text-left text-sm font-medium text-muted-foreground md:table-cell">
                Company
              </th>
              <th className="hidden px-4 py-3 text-left text-sm font-medium text-muted-foreground sm:table-cell">
                Status
              </th>
              <th className="hidden px-4 py-3 text-left text-sm font-medium text-muted-foreground lg:table-cell">
                Last Contact
              </th>
              <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredClients.map((client) => (
              <tr
                key={client.id}
                className={`border-b border-border transition-colors hover:bg-card/50 ${selectedClients.includes(client.id) ? "bg-card" : ""
                  }`}
              >
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedClients.includes(client.id)}
                    onChange={() => toggleClient(client.id)}
                    className="h-4 w-4 rounded border-border bg-input accent-accent"
                  />
                </td>
                <td className="px-4 py-3">
                  <div>
                    <div className="font-medium text-foreground">{client.name}</div>
                    <div className="text-sm text-muted-foreground">{client.email}</div>
                  </div>
                </td>
                <td className="hidden px-4 py-3 text-foreground md:table-cell">
                  {client.company}
                </td>
                <td className="hidden px-4 py-3 sm:table-cell">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusConfig[client.status].color
                      }`}
                  >
                    {statusConfig[client.status].label}
                  </span>
                </td>
                <td className="hidden px-4 py-3 text-sm text-muted-foreground lg:table-cell">
                  {client.lastContact
                    ? new Date(client.lastContact).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                    : "-"}
                </td>
                <td className="px-4 py-3 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => toggleClient(client.id)}>
                        {selectedClients.includes(client.id) ? "Deselect" : "Select"}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => deleteClient(client.id)}
                        className="text-destructive"
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredClients.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FileSpreadsheet className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-lg font-medium text-foreground">No clients found</p>
            <p className="text-sm text-muted-foreground">
              Upload an Excel file or connect a Google Sheet to get started
            </p>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <Modal title="Upload Excel File" onClose={() => setShowUploadModal(false)}>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Upload an Excel file (.xlsx, .xls) with columns for Name, Email, Company,
              and Status.
            </p>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-8 transition-colors hover:border-accent"
            >
              <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
              <p className="text-sm font-medium text-foreground">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-muted-foreground">XLSX, XLS up to 10MB</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        </Modal>
      )}

      {/* Google Sheet Link Modal */}
      {showLinkModal && (
        <GoogleSheetModal
          onClose={() => setShowLinkModal(false)}
          onSubmit={handleGoogleSheetLink}
        />
      )}

      {/* Duplicate Warning Modal */}
      {duplicateData && (
        <Modal title="Duplicate Clients Found" onClose={() => {
          setDuplicateData(null)
          setSelectedFile(null)
        }}>
          <div className="space-y-4">
            <div className="rounded-md bg-yellow-500/10 p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    {duplicateData.existing_emails.length} clients already exist
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>The following emails are already in your list:</p>
                    <ul className="mt-1 max-h-32 list-disc overflow-y-auto pl-5">
                      {duplicateData.existing_emails.map((email) => (
                        <li key={email}>{email}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Do you want to skip these duplicates and add only the new unique clients?
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => {
                setDuplicateData(null)
                setSelectedFile(null)
              }}>
                Cancel
              </Button>
              <Button onClick={handleConfirmDuplicates}>
                Add Remaining Clients
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

function Modal({
  title,
  children,
  onClose,
}: {
  title: string
  children: React.ReactNode
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          <button
            onClick={onClose}
            className="rounded p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

function GoogleSheetModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void
  onSubmit: (url: string) => void
}) {
  const [url, setUrl] = useState("")

  return (
    <Modal title="Connect Google Sheet" onClose={onClose}>
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Paste your Google Sheet sharing link. Make sure the sheet is accessible.
        </p>
        <Input
          placeholder="https://docs.google.com/spreadsheets/d/..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => onSubmit(url)} disabled={!url}>
            Import
          </Button>
        </div>
      </div>
    </Modal>
  )
}
