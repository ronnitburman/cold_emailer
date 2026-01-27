import { Client } from "@/components/clients-tab";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const api = {
    getClients: async (search?: string): Promise<Client[]> => {
        const query = search ? `?search=${encodeURIComponent(search)}` : "";
        const response = await fetch(`${API_BASE_URL}/clients${query}`);
        if (!response.ok) throw new Error("Failed to fetch clients");
        return response.json();
    },

    createClient: async (data: any) => {
        const response = await fetch(`${API_BASE_URL}/clients`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error("Failed to create client");
        return response.json();
    },

    importExcel: async (file: File, skipDuplicates = false) => {
        const formData = new FormData();
        formData.append("file", file);
        const response = await fetch(`${API_BASE_URL}/clients/import/excel?skip_duplicates=${skipDuplicates}`, {
            method: "POST",
            body: formData,
        });
        if (response.status === 409) {
            const errorData = await response.json();
            const error = new Error("Duplicate clients found");
            (error as any).details = errorData.detail;
            throw error;
        }
        if (!response.ok) throw new Error("Failed to import excel");
        return response.json();
    },

    importGoogleSheet: async (url: string) => {
        const response = await fetch(`${API_BASE_URL}/clients/import/google-sheet`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url }),
        });
        if (!response.ok) throw new Error("Failed to import google sheet");
        return response.json();
    },

    deleteClient: async (id: string) => {
        const response = await fetch(`${API_BASE_URL}/clients/${id}`, {
            method: "DELETE",
        });
        if (!response.ok) throw new Error("Failed to delete client");
    },

    sendEmail: async (data: { recipient_ids: string[]; subject: string; body: string; template_id?: string; attachments?: any[] }) => {
        const response = await fetch(`${API_BASE_URL}/email/send`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error("Failed to send email");
        return response.json();
    },

    getTasks: async (): Promise<any[]> => {
        const response = await fetch(`${API_BASE_URL}/tasks`);
        if (!response.ok) throw new Error("Failed to fetch tasks");
        return response.json();
    },

    getEmailHistory: async (): Promise<any[]> => {
        const response = await fetch(`${API_BASE_URL}/email/history`);
        if (!response.ok) throw new Error("Failed to fetch email history");
        return response.json();
    },

    getTemplates: async (): Promise<any[]> => {
        const response = await fetch(`${API_BASE_URL}/templates`);
        if (!response.ok) throw new Error("Failed to fetch templates");
        return response.json();
    },

    createTemplate: async (data: any) => {
        const response = await fetch(`${API_BASE_URL}/templates`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error("Failed to create template");
        return response.json();
    },

    updateTemplate: async (id: string, data: any) => {
        const response = await fetch(`${API_BASE_URL}/templates/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error("Failed to update template");
        return response.json();
    },

    deleteTemplate: async (id: string) => {
        const response = await fetch(`${API_BASE_URL}/templates/${id}`, {
            method: "DELETE",
        });
        if (!response.ok) throw new Error("Failed to delete template");
    },

    getAttachments: async (): Promise<any[]> => {
        const response = await fetch(`${API_BASE_URL}/attachments`);
        if (!response.ok) throw new Error("Failed to fetch attachments");
        return response.json();
    },

    uploadAttachment: async (file: File) => {
        const formData = new FormData();
        formData.append("file", file);
        const response = await fetch(`${API_BASE_URL}/attachments`, {
            method: "POST",
            body: formData,
        });
        if (!response.ok) throw new Error("Failed to upload attachment");
        return response.json();
    }
};
