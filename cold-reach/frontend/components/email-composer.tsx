"use client"

import { useState, useEffect } from "react"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  X,
  Paperclip,
  Send,
  FileText,
  File,
  ChevronDown,
  Check,
  Trash2,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface EmailTemplate {
  id: string
  name: string
  subject: string
  body: string
}

interface Attachment {
  id: string
  name: string
  size: string
}



interface EmailComposerProps {
  recipientIds: string[]
  onClose: () => void
  onSend: () => void
}

export function EmailComposer({ recipientIds, onClose, onSend }: EmailComposerProps) {
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null)
  const [subject, setSubject] = useState("")
  const [body, setBody] = useState("")
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [isSending, setIsSending] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const [loadingTemplates, setLoadingTemplates] = useState(false)
  const [availableAttachments, setAvailableAttachments] = useState<Attachment[]>([])

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      setLoadingTemplates(true)
      const [tplData, attData] = await Promise.all([
        api.getTemplates(),
        api.getAttachments()
      ])
      setTemplates(tplData)
      setAvailableAttachments(attData)
    } catch (error) {
      console.error("Failed to fetch data", error)
    } finally {
      setLoadingTemplates(false)
    }
  }

  const selectedCount = recipientIds.length

  const handleTemplateSelect = (template: EmailTemplate) => {
    setSelectedTemplate(template)
    setSubject(template.subject)
    setBody(template.body)
  }

  const toggleAttachment = (attachment: Attachment) => {
    if (attachments.find((a) => a.id === attachment.id)) {
      setAttachments(attachments.filter((a) => a.id !== attachment.id))
    } else {
      setAttachments([...attachments, attachment])
    }
  }

  const removeAttachment = (id: string) => {
    setAttachments(attachments.filter((a) => a.id !== id))
  }

  const handleSend = async () => {
    try {
      setIsSending(true)
      await api.sendEmail({
        recipient_ids: recipientIds,
        subject,
        body,
        template_id: selectedTemplate?.id,
        attachment_ids: attachments.map(a => a.id)
      })
      setIsSending(false)
      setShowSuccess(true)
      setTimeout(() => {
        onSend()
      }, 1500)
    } catch (error) {
      console.error("Send failed", error)
      setIsSending(false)
      alert("Failed to send emails")
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
      <div className="flex h-[90vh] w-full max-w-3xl flex-col rounded-lg border border-border bg-card shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Compose Email</h2>
            <p className="text-sm text-muted-foreground">
              Sending to {selectedCount} {selectedCount === 1 ? "recipient" : "recipients"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Success State */}
        {showSuccess ? (
          <div className="flex flex-1 flex-col items-center justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent">
              <Check className="h-8 w-8 text-accent-foreground" />
            </div>
            <h3 className="mt-4 text-xl font-semibold text-foreground">Emails Sent!</h3>
            <p className="mt-2 text-muted-foreground">
              Successfully sent to {selectedCount} recipients
            </p>
          </div>
        ) : (
          <>
            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {/* Template Selection */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Email Template
                  </label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full justify-between bg-transparent">
                        {selectedTemplate ? (
                          <span className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-accent" />
                            {selectedTemplate.name}
                          </span>
                        ) : (
                          "Select a template..."
                        )}
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-[calc(var(--radix-dropdown-menu-trigger-width))]">
                      {templates.map((template) => (
                        <DropdownMenuItem
                          key={template.id}
                          onClick={() => handleTemplateSelect(template)}
                          className="flex items-center gap-2"
                        >
                          <FileText className="h-4 w-4 text-accent" />
                          {template.name}
                          {selectedTemplate?.id === template.id && (
                            <Check className="ml-auto h-4 w-4 text-accent" />
                          )}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Subject */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Subject
                  </label>
                  <Input
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Email subject..."
                    className="bg-input"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    {"Use {{name}}, {{company}} for personalization"}
                  </p>
                </div>

                {/* Body */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Message
                  </label>
                  <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    rows={12}
                    placeholder="Write your email..."
                    className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    {"Use {{name}}, {{company}} for personalization"}
                  </p>
                </div>

                {/* Attachments */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Attachments
                  </label>

                  {/* Selected Attachments */}
                  {attachments.length > 0 && (
                    <div className="mb-3 space-y-2">
                      {attachments.map((attachment) => (
                        <div
                          key={attachment.id}
                          className="flex items-center justify-between rounded-lg border border-border bg-secondary px-3 py-2"
                        >
                          <div className="flex items-center gap-2">
                            <File className="h-4 w-4 text-accent" />
                            <span className="text-sm text-foreground">
                              {attachment.name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              ({attachment.size})
                            </span>
                          </div>
                          <button
                            onClick={() => removeAttachment(attachment.id)}
                            className="rounded p-1 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    {/* Upload New Button */}
                    <Button variant="outline" size="sm" className="gap-2 bg-transparent" onClick={() => document.getElementById('file-upload')?.click()}>
                      <Paperclip className="h-4 w-4" />
                      Upload New File
                      <input
                        id="file-upload"
                        type="file"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            try {
                              setIsSending(true); // Reuse loading state slightly
                              const newAtt = await api.uploadAttachment(file);
                              setAttachments([...attachments, newAtt]);
                            } catch (err) {
                              console.error(err);
                              alert("Failed to upload");
                            } finally {
                              setIsSending(false);
                            }
                          }
                        }}
                      />
                    </Button>

                    {/* Select Existing Dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                          <File className="h-4 w-4" />
                          Select Existing
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56 max-h-60 overflow-y-auto">
                        {loadingTemplates ? ( // Reusing loading state for simplicity or create new one
                          <DropdownMenuItem disabled>Loading...</DropdownMenuItem>
                        ) : availableAttachments.length === 0 ? (
                          <DropdownMenuItem disabled>No files found</DropdownMenuItem>
                        ) : (
                          availableAttachments.map((att) => (
                            <DropdownMenuItem
                              key={att.id}
                              onClick={(e) => {
                                e.preventDefault(); // Keep open
                                toggleAttachment(att);
                              }}
                              className="flex items-center gap-2 cursor-pointer"
                            >
                              <div className={`flex h-4 w-4 items-center justify-center rounded border ${attachments.find(a => a.id === att.id) ? 'bg-primary border-primary' : 'border-muted-foreground'}`}>
                                {attachments.find(a => a.id === att.id) && <Check className="h-3 w-3 text-primary-foreground" />}
                              </div>
                              <span className="truncate flex-1">{att.name}</span>
                              <span className="text-xs text-muted-foreground">{att.size}</span>
                            </DropdownMenuItem>
                          ))
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-border px-6 py-4">
              <p className="text-sm text-muted-foreground">
                {attachments.length > 0 && `${attachments.length} attachment(s) `}
              </p>
              <div className="flex gap-3">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSend}
                  disabled={!subject || !body || isSending}
                  className="gap-2"
                >
                  {isSending ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Send to {selectedCount} {selectedCount === 1 ? "Client" : "Clients"}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
