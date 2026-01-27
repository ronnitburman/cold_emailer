"use client"

import { useState, useEffect } from "react"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Edit2, Trash2, Copy } from "lucide-react"

interface Template {
    id: string
    name: string
    subject: string
    body: string
}

export function TemplatesTab() {
    const [templates, setTemplates] = useState<Template[]>([])
    const [loading, setLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingTemplate, setEditingTemplate] = useState<Template | null>(null)

    // Form State
    const [name, setName] = useState("")
    const [subject, setSubject] = useState("")
    const [body, setBody] = useState("")

    useEffect(() => {
        fetchTemplates()
    }, [])

    const fetchTemplates = async () => {
        try {
            setLoading(true)
            const data = await api.getTemplates()
            setTemplates(data)
        } catch (error) {
            console.error("Failed to fetch templates", error)
        } finally {
            setLoading(false)
        }
    }

    const handleEdit = (template: Template) => {
        setEditingTemplate(template)
        setName(template.name)
        setSubject(template.subject)
        setBody(template.body)
        setIsDialogOpen(true)
    }

    const handleCreateNew = () => {
        setEditingTemplate(null)
        setName("")
        setSubject("")
        setBody("")
        setIsDialogOpen(true)
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this template?")) return
        try {
            await api.deleteTemplate(id)
            setTemplates(templates.filter((t) => t.id !== id))
        } catch (error) {
            console.error("Failed to delete template", error)
        }
    }

    const handleSave = async () => {
        try {
            const templateData = { name, subject, body }

            if (editingTemplate) {
                await api.updateTemplate(editingTemplate.id, templateData)
            } else {
                await api.createTemplate(templateData)
            }

            setIsDialogOpen(false)
            fetchTemplates()
        } catch (error) {
            console.error("Failed to save template", error)
        }
    }

    const insertVariable = (variable: string) => {
        // Simple append for now, ideally insert at cursor position
        setBody((prev) => prev + ` {${variable}}`)
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Email Templates</h1>
                    <p className="text-sm text-muted-foreground">
                        Manage your saved email templates
                    </p>
                </div>
                <Button onClick={handleCreateNew} className="gap-2">
                    <Plus className="h-4 w-4" />
                    New Template
                </Button>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {templates.map((template) => (
                    <Card key={template.id}>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between text-lg">
                                <span className="truncate">{template.name}</span>
                            </CardTitle>
                            <CardDescription className="line-clamp-1">
                                Subject: {template.subject}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="line-clamp-3 text-sm text-muted-foreground whitespace-pre-wrap">
                                {template.body}
                            </p>
                        </CardContent>
                        <CardFooter className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleEdit(template)}>
                                <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDelete(template.id)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{editingTemplate ? "Edit Template" : "New Template"}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Template Name</label>
                            <Input placeholder="e.g. Initial Outreach" value={name} onChange={(e) => setName(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Subject Line</label>
                            <Input placeholder="Subject..." value={subject} onChange={(e) => setSubject(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium">Email Body</label>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" onClick={() => insertVariable("name")} className="h-6 text-xs px-2">
                                        + name
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={() => insertVariable("company")} className="h-6 text-xs px-2">
                                        + company
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={() => insertVariable("email")} className="h-6 text-xs px-2">
                                        + email
                                    </Button>
                                </div>
                            </div>
                            <Textarea
                                placeholder="Hi {name}, ..."
                                value={body}
                                onChange={(e) => setBody(e.target.value)}
                                className="min-h-[200px]"
                            />
                            <p className="text-xs text-muted-foreground">
                                Click buttons above to insert variables. They will be replaced with real data when sending.
                            </p>
                        </div>
                        <Button onClick={handleSave} className="w-full">Save Template</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
