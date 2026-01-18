"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";

const AuthContext = createContext(null);

const API_BASE_URL = "http://localhost:8000/api";

// Token storage utilities
const TokenStorage = {
    getAccessToken: () => {
        if (typeof window === "undefined") return null;
        return localStorage.getItem("access_token");
    },
    getRefreshToken: () => {
        if (typeof window === "undefined") return null;
        return localStorage.getItem("refresh_token");
    },
    setTokens: (accessToken, refreshToken) => {
        if (typeof window === "undefined") return;
        localStorage.setItem("access_token", accessToken);
        localStorage.setItem("refresh_token", refreshToken);
    },
    clearTokens: () => {
        if (typeof window === "undefined") return;
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
    }
};

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Fetch user data
    const fetchUser = useCallback(async () => {
        const accessToken = TokenStorage.getAccessToken();
        if (!accessToken) {
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/auth/me`, {
                headers: {
                    "Authorization": `Bearer ${accessToken}`
                }
            });

            if (response.ok) {
                const userData = await response.json();
                setUser(userData);
                setIsAuthenticated(true);
            } else if (response.status === 401) {
                // Try to refresh token
                await refreshAccessToken();
            } else {
                TokenStorage.clearTokens();
                setUser(null);
                setIsAuthenticated(false);
            }
        } catch (error) {
            console.error("Failed to fetch user:", error);
            TokenStorage.clearTokens();
            setUser(null);
            setIsAuthenticated(false);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Refresh access token
    const refreshAccessToken = async () => {
        const refreshToken = TokenStorage.getRefreshToken();
        if (!refreshToken) {
            TokenStorage.clearTokens();
            setUser(null);
            setIsAuthenticated(false);
            return false;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ refresh_token: refreshToken })
            });

            if (response.ok) {
                const data = await response.json();
                TokenStorage.setTokens(data.access_token, data.refresh_token);
                setUser(data.user);
                setIsAuthenticated(true);
                return true;
            } else {
                TokenStorage.clearTokens();
                setUser(null);
                setIsAuthenticated(false);
                return false;
            }
        } catch (error) {
            console.error("Failed to refresh token:", error);
            TokenStorage.clearTokens();
            setUser(null);
            setIsAuthenticated(false);
            return false;
        }
    };

    // Initialize Google Sign In
    const signInWithGoogle = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/google/init`);
            const data = await response.json();
            
            if (data.authorization_url) {
                // Store state for verification
                sessionStorage.setItem("oauth_state", data.state);
                // Redirect to Google
                window.location.href = data.authorization_url;
            }
        } catch (error) {
            console.error("Failed to initialize Google sign in:", error);
            throw error;
        }
    };

    // Initialize Apple Sign In
    const signInWithApple = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/apple/init`);
            const data = await response.json();
            
            if (data.authorization_url) {
                // Store state for verification
                sessionStorage.setItem("oauth_state", data.state);
                // Redirect to Apple
                window.location.href = data.authorization_url;
            }
        } catch (error) {
            console.error("Failed to initialize Apple sign in:", error);
            throw error;
        }
    };

    // Handle OAuth callback
    const handleOAuthCallback = async (provider, code, state) => {
        const storedState = sessionStorage.getItem("oauth_state");
        
        // Verify state matches
        if (state !== storedState) {
            throw new Error("Invalid state - possible CSRF attack");
        }

        try {
            const response = await fetch(`${API_BASE_URL}/auth/${provider}/callback`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ code, state })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || "Authentication failed");
            }

            const data = await response.json();
            TokenStorage.setTokens(data.access_token, data.refresh_token);
            setUser(data.user);
            setIsAuthenticated(true);
            
            // Clean up
            sessionStorage.removeItem("oauth_state");
            
            return data.user;
        } catch (error) {
            console.error("OAuth callback failed:", error);
            throw error;
        }
    };

    // Logout
    const logout = async () => {
        const refreshToken = TokenStorage.getRefreshToken();
        
        try {
            if (refreshToken) {
                await fetch(`${API_BASE_URL}/auth/logout`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ refresh_token: refreshToken })
                });
            }
        } catch (error) {
            console.error("Logout request failed:", error);
        } finally {
            TokenStorage.clearTokens();
            setUser(null);
            setIsAuthenticated(false);
        }
    };

    // Logout from all devices
    const logoutAll = async () => {
        const accessToken = TokenStorage.getAccessToken();
        
        try {
            if (accessToken) {
                await fetch(`${API_BASE_URL}/auth/logout-all`, {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${accessToken}`
                    }
                });
            }
        } catch (error) {
            console.error("Logout all request failed:", error);
        } finally {
            TokenStorage.clearTokens();
            setUser(null);
            setIsAuthenticated(false);
        }
    };

    // Initialize auth state on mount
    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    // Get authenticated fetch function
    const authFetch = useCallback(async (url, options = {}) => {
        const accessToken = TokenStorage.getAccessToken();
        
        const headers = {
            ...options.headers,
            "Authorization": `Bearer ${accessToken}`
        };

        let response = await fetch(url, { ...options, headers });

        // If unauthorized, try to refresh and retry
        if (response.status === 401) {
            const refreshed = await refreshAccessToken();
            if (refreshed) {
                const newAccessToken = TokenStorage.getAccessToken();
                headers["Authorization"] = `Bearer ${newAccessToken}`;
                response = await fetch(url, { ...options, headers });
            }
        }

        return response;
    }, []);

    const value = {
        user,
        isLoading,
        isAuthenticated,
        signInWithGoogle,
        signInWithApple,
        handleOAuthCallback,
        logout,
        logoutAll,
        authFetch,
        refreshUser: fetchUser
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}

export default AuthContext;
