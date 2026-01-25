"use client";

import { useState, useEffect } from "react";
import { Plus, Sheet, Trash2, RefreshCw, Check, AlertCircle, X, ExternalLink } from "lucide-react";
import { fetchAuthenticatedData, postAuthenticatedData, deleteAuthenticatedData } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function GoogleSheetsManager({ onSheetsChange }) {
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const [sheets, setSheets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddingSheet, setIsAddingSheet] = useState(false);
    const [newSheetUrl, setNewSheetUrl] = useState("");
    const [newSheetName, setNewSheetName] = useState("");
    const [validationResult, setValidationResult] = useState(null);
    const [isValidating, setIsValidating] = useState(false);
    const [selectedWorksheet, setSelectedWorksheet] = useState("");
    const [error, setError] = useState(null);
    const [syncingSheetId, setSyncingSheetId] = useState(null);

    useEffect(() => {
        // Only load sheets after auth is confirmed
        console.log("GoogleSheetsManager: authLoading=", authLoading, "isAuthenticated=", isAuthenticated);
        if (!authLoading && isAuthenticated) {
            console.log("GoogleSheetsManager: Loading sheets...");
            loadSheets();
        }
    }, [authLoading, isAuthenticated]);

    const loadSheets = async () => {
        setIsLoading(true);
        try {
            console.log("GoogleSheetsManager: Fetching /sheets...");
            const data = await fetchAuthenticatedData("/sheets");
            console.log("GoogleSheetsManager: Got data:", data);
            if (data) {
                setSheets(data);
                onSheetsChange?.(data);
            }
        } catch (err) {
            console.error("Failed to load sheets:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const validateSheet = async () => {
        if (!newSheetUrl.trim()) return;
        
        setIsValidating(true);
        setValidationResult(null);
        setError(null);
        
        try {
            const result = await postAuthenticatedData("/sheets/validate", {
                sheet_url: newSheetUrl
            });
            
            setValidationResult(result);
            
            if (result?.success && result.worksheets?.length > 0) {
                setSelectedWorksheet(result.worksheets[0]);
                if (!newSheetName) {
                    setNewSheetName(result.title || "");
                }
            }
        } catch (err) {
            setError("Failed to validate sheet");
        } finally {
            setIsValidating(false);
        }
    };

    const addSheet = async () => {
        if (!validationResult?.success || !newSheetName.trim()) return;
        
        setError(null);
        
        try {
            const result = await postAuthenticatedData("/sheets", {
                name: newSheetName,
                sheet_url: newSheetUrl,
                worksheet_name: selectedWorksheet || "Sheet1"
            });
            
            if (result) {
                setSheets([result, ...sheets]);
                onSheetsChange?.([result, ...sheets]);
                resetForm();
            }
        } catch (err) {
            setError("Failed to add sheet");
        }
    };

    const deleteSheet = async (sheetId) => {
        if (!confirm("Are you sure you want to remove this sheet?")) return;
        
        try {
            await deleteAuthenticatedData(`/sheets/${sheetId}`);
            const updatedSheets = sheets.filter(s => s.id !== sheetId);
            setSheets(updatedSheets);
            onSheetsChange?.(updatedSheets);
        } catch (err) {
            console.error("Failed to delete sheet:", err);
        }
    };

    const syncSheet = async (sheetId) => {
        setSyncingSheetId(sheetId);
        
        try {
            await postAuthenticatedData(`/sheets/${sheetId}/sync`, {});
            await loadSheets();
        } catch (err) {
            console.error("Failed to sync sheet:", err);
        } finally {
            setSyncingSheetId(null);
        }
    };

    const resetForm = () => {
        setIsAddingSheet(false);
        setNewSheetUrl("");
        setNewSheetName("");
        setValidationResult(null);
        setSelectedWorksheet("");
        setError(null);
    };

    return (
        <div className="sheets-manager">
            <div className="sheets-header">
                <div>
                    <h3>Connected Google Sheets</h3>
                    <p className="sheets-subtitle">Import campaign data from your spreadsheets</p>
                </div>
                {!isAddingSheet && (
                    <button 
                        className="add-sheet-btn"
                        onClick={() => setIsAddingSheet(true)}
                    >
                        <Plus size={16} />
                        Add Sheet
                    </button>
                )}
            </div>

            {isAddingSheet && (
                <div className="add-sheet-form">
                    <div className="form-header">
                        <h4>Connect a Google Sheet</h4>
                        <button className="close-btn" onClick={resetForm}>
                            <X size={18} />
                        </button>
                    </div>
                    
                    {error && (
                        <div className="form-error">
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}
                    
                    <div className="form-group">
                        <label>Google Sheet URL</label>
                        <div className="input-with-button">
                            <input
                                type="url"
                                placeholder="https://docs.google.com/spreadsheets/d/..."
                                value={newSheetUrl}
                                onChange={(e) => {
                                    setNewSheetUrl(e.target.value);
                                    setValidationResult(null);
                                }}
                            />
                            <button 
                                className="validate-btn"
                                onClick={validateSheet}
                                disabled={!newSheetUrl.trim() || isValidating}
                            >
                                {isValidating ? "Checking..." : "Validate"}
                            </button>
                        </div>
                    </div>

                    {validationResult && (
                        <div className={`validation-result ${validationResult.success ? 'success' : 'error'}`}>
                            {validationResult.success ? (
                                <>
                                    <Check size={16} />
                                    <span>Found: <strong>{validationResult.title}</strong></span>
                                </>
                            ) : (
                                <>
                                    <AlertCircle size={16} />
                                    <span>{validationResult.error}</span>
                                </>
                            )}
                        </div>
                    )}

                    {validationResult?.success && (
                        <>
                            <div className="form-group">
                                <label>Display Name</label>
                                <input
                                    type="text"
                                    placeholder="My Campaigns Sheet"
                                    value={newSheetName}
                                    onChange={(e) => setNewSheetName(e.target.value)}
                                />
                            </div>

                            <div className="form-group">
                                <label>Worksheet</label>
                                <select
                                    value={selectedWorksheet}
                                    onChange={(e) => setSelectedWorksheet(e.target.value)}
                                >
                                    {validationResult.worksheets?.map(ws => (
                                        <option key={ws} value={ws}>{ws}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-actions">
                                <button className="cancel-btn" onClick={resetForm}>
                                    Cancel
                                </button>
                                <button 
                                    className="submit-btn"
                                    onClick={addSheet}
                                    disabled={!newSheetName.trim()}
                                >
                                    Connect Sheet
                                </button>
                            </div>
                        </>
                    )}
                    
                    <div className="form-help">
                        <p>
                            <strong>Note:</strong> Make sure to share your Google Sheet with the service account email.
                            Your sheet should have columns like: Name, Status, Sent, Open Rate, Reply Rate
                        </p>
                    </div>
                </div>
            )}

            <div className="sheets-list">
                {isLoading ? (
                    <div className="sheets-loading">
                        <RefreshCw size={20} className="spin" />
                        Loading sheets...
                    </div>
                ) : sheets.length === 0 ? (
                    <div className="no-sheets">
                        <Sheet size={32} />
                        <p>No Google Sheets connected yet</p>
                        <span>Connect a sheet to import your campaign data</span>
                    </div>
                ) : (
                    sheets.map(sheet => (
                        <div key={sheet.id} className="sheet-item">
                            <div className="sheet-icon">
                                <Sheet size={20} />
                            </div>
                            <div className="sheet-info">
                                <div className="sheet-name">{sheet.name}</div>
                                <div className="sheet-meta">
                                    {sheet.worksheet_name} • 
                                    {sheet.last_synced 
                                        ? ` Synced ${new Date(sheet.last_synced).toLocaleString()}`
                                        : " Never synced"
                                    }
                                </div>
                            </div>
                            <div className="sheet-actions">
                                <a 
                                    href={sheet.sheet_url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="sheet-action-btn"
                                    title="Open in Google Sheets"
                                >
                                    <ExternalLink size={16} />
                                </a>
                                <button 
                                    className="sheet-action-btn"
                                    onClick={() => syncSheet(sheet.id)}
                                    disabled={syncingSheetId === sheet.id}
                                    title="Sync now"
                                >
                                    <RefreshCw size={16} className={syncingSheetId === sheet.id ? "spin" : ""} />
                                </button>
                                <button 
                                    className="sheet-action-btn danger"
                                    onClick={() => deleteSheet(sheet.id)}
                                    title="Remove"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <style jsx>{`
                .sheets-manager {
                    background: var(--card-bg);
                    border: 1px solid var(--card-border);
                    border-radius: 1rem;
                    padding: 1.5rem;
                }

                .sheets-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 1.5rem;
                }

                .sheets-header h3 {
                    font-size: 1.125rem;
                    font-weight: 600;
                    margin-bottom: 0.25rem;
                }

                .sheets-subtitle {
                    font-size: 0.875rem;
                    color: var(--muted);
                }

                .add-sheet-btn {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.5rem 1rem;
                    background: var(--foreground);
                    color: var(--background);
                    border: none;
                    border-radius: 0.5rem;
                    font-size: 0.875rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .add-sheet-btn:hover {
                    transform: translateY(-1px);
                }

                .add-sheet-form {
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px solid var(--card-border);
                    border-radius: 0.75rem;
                    padding: 1.25rem;
                    margin-bottom: 1.5rem;
                }

                .form-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1rem;
                }

                .form-header h4 {
                    font-size: 1rem;
                    font-weight: 600;
                }

                .close-btn {
                    background: transparent;
                    border: none;
                    color: var(--muted);
                    cursor: pointer;
                    padding: 0.25rem;
                    border-radius: 0.25rem;
                }

                .close-btn:hover {
                    color: var(--foreground);
                    background: rgba(255, 255, 255, 0.1);
                }

                .form-error {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.75rem;
                    background: var(--accent-red-bg);
                    color: var(--accent-red);
                    border-radius: 0.5rem;
                    font-size: 0.875rem;
                    margin-bottom: 1rem;
                }

                .form-group {
                    margin-bottom: 1rem;
                }

                .form-group label {
                    display: block;
                    font-size: 0.875rem;
                    font-weight: 500;
                    margin-bottom: 0.5rem;
                }

                .form-group input,
                .form-group select {
                    width: 100%;
                    padding: 0.625rem 0.875rem;
                    background: var(--background);
                    border: 1px solid var(--card-border);
                    border-radius: 0.5rem;
                    color: var(--foreground);
                    font-size: 0.875rem;
                }

                .form-group input:focus,
                .form-group select:focus {
                    outline: none;
                    border-color: var(--foreground);
                }

                .input-with-button {
                    display: flex;
                    gap: 0.5rem;
                }

                .input-with-button input {
                    flex: 1;
                }

                .validate-btn {
                    padding: 0.625rem 1rem;
                    background: rgba(255, 255, 255, 0.1);
                    border: 1px solid var(--card-border);
                    border-radius: 0.5rem;
                    color: var(--foreground);
                    font-size: 0.875rem;
                    font-weight: 500;
                    cursor: pointer;
                    white-space: nowrap;
                }

                .validate-btn:hover:not(:disabled) {
                    background: rgba(255, 255, 255, 0.15);
                }

                .validate-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .validation-result {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.75rem;
                    border-radius: 0.5rem;
                    font-size: 0.875rem;
                    margin-bottom: 1rem;
                }

                .validation-result.success {
                    background: var(--accent-green-bg);
                    color: var(--accent-green);
                }

                .validation-result.error {
                    background: var(--accent-red-bg);
                    color: var(--accent-red);
                }

                .form-actions {
                    display: flex;
                    gap: 0.75rem;
                    justify-content: flex-end;
                    margin-top: 1rem;
                }

                .cancel-btn {
                    padding: 0.625rem 1rem;
                    background: transparent;
                    border: 1px solid var(--card-border);
                    border-radius: 0.5rem;
                    color: var(--muted);
                    font-size: 0.875rem;
                    cursor: pointer;
                }

                .cancel-btn:hover {
                    color: var(--foreground);
                    border-color: var(--foreground);
                }

                .submit-btn {
                    padding: 0.625rem 1.25rem;
                    background: var(--accent-green);
                    border: none;
                    border-radius: 0.5rem;
                    color: white;
                    font-size: 0.875rem;
                    font-weight: 600;
                    cursor: pointer;
                }

                .submit-btn:hover:not(:disabled) {
                    opacity: 0.9;
                }

                .submit-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .form-help {
                    margin-top: 1rem;
                    padding-top: 1rem;
                    border-top: 1px solid var(--card-border);
                }

                .form-help p {
                    font-size: 0.8125rem;
                    color: var(--muted);
                    line-height: 1.5;
                }

                .sheets-list {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }

                .sheets-loading,
                .no-sheets {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 2rem;
                    color: var(--muted);
                    text-align: center;
                }

                .no-sheets p {
                    margin: 0.75rem 0 0.25rem;
                    font-weight: 500;
                }

                .no-sheets span {
                    font-size: 0.875rem;
                }

                .sheet-item {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 0.875rem;
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px solid var(--card-border);
                    border-radius: 0.5rem;
                }

                .sheet-icon {
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: rgba(34, 197, 94, 0.1);
                    color: #22c55e;
                    border-radius: 0.5rem;
                }

                .sheet-info {
                    flex: 1;
                }

                .sheet-name {
                    font-weight: 600;
                    margin-bottom: 0.25rem;
                }

                .sheet-meta {
                    font-size: 0.8125rem;
                    color: var(--muted);
                }

                .sheet-actions {
                    display: flex;
                    gap: 0.5rem;
                }

                .sheet-action-btn {
                    padding: 0.5rem;
                    background: transparent;
                    border: 1px solid var(--card-border);
                    border-radius: 0.375rem;
                    color: var(--muted);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    text-decoration: none;
                }

                .sheet-action-btn:hover {
                    color: var(--foreground);
                    border-color: var(--foreground);
                }

                .sheet-action-btn.danger:hover {
                    color: var(--accent-red);
                    border-color: var(--accent-red);
                    background: var(--accent-red-bg);
                }

                .sheet-action-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .spin {
                    animation: spin 1s linear infinite;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
