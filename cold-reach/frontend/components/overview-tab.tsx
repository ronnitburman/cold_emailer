"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { Client } from "./clients-tab"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Users, Mail, TrendingUp, UserPlus } from "lucide-react"

export function OverviewTab({ onNavigateToClients }: { onNavigateToClients: () => void }) {
    const [clients, setClients] = useState<Client[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await api.getClients()
                setClients(data)
            } catch (error) {
                console.error("Failed to fetch stats", error)
            } finally {
                setLoading(false)
            }
        }
        fetchStats()
    }, [])

    const totalClients = clients.length
    const emailedClients = clients.filter(c => c.status === "emailed").length
    const repliedClients = clients.filter(c => c.status === "replied").length

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalClients}</div>
                        <p className="text-xs text-muted-foreground">
                            +0% from last month
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Emails Sent</CardTitle>
                        <Mail className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{emailedClients}</div>
                        <p className="text-xs text-muted-foreground">
                            Outreach campaigns active
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {emailedClients > 0
                                ? Math.round((repliedClients / emailedClients) * 100)
                                : 0}%
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {repliedClients} positive replies
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                        <CardDescription>
                            Latest interactions with your clients.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {/* Mock activity list */}
                            <div className="flex items-center">
                                <div className="ml-4 space-y-1">
                                    <p className="text-sm font-medium leading-none">System Ready</p>
                                    <p className="text-sm text-muted-foreground">
                                        Dashboard initialized successfully.
                                    </p>
                                </div>
                                <div className="ml-auto font-medium">+1m ago</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <button
                            onClick={onNavigateToClients}
                            className="flex w-full items-center justify-between rounded-lg border p-4 hover:bg-accent hover:text-accent-foreground"
                        >
                            <span className="flex items-center gap-2">
                                <UserPlus className="h-4 w-4" />
                                Manage Clients
                            </span>
                            <span className="text-xs text-muted-foreground">→</span>
                        </button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
