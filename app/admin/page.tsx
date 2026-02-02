"use client";

import { useState, useEffect } from "react";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tool } from "@/types/tools";
import { ChevronUp, ChevronDown, Trash2, Plus, Lock } from "lucide-react";

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState("");
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(false);

  // Form state for new tool
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [formError, setFormError] = useState("");

  // Check for existing auth on mount
  useEffect(() => {
    const savedPassword = sessionStorage.getItem("adminPassword");
    if (savedPassword) {
      setPassword(savedPassword);
      setIsAuthenticated(true);
    }
  }, []);

  // Fetch tools when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchTools();
    }
  }, [isAuthenticated]);

  const fetchTools = async () => {
    try {
      const res = await fetch("/api/tools");
      const data = await res.json();
      setTools(data);
    } catch (err) {
      console.error("Failed to fetch tools:", err);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: {
          "x-admin-password": password,
        },
      });

      if (res.status === 401) {
        setAuthError("Invalid password");
        setLoading(false);
        return;
      }

      if (res.status === 500) {
        const data = await res.json();
        setAuthError(data.error || "Server error");
        setLoading(false);
        return;
      }

      sessionStorage.setItem("adminPassword", password);
      setIsAuthenticated(true);
    } catch {
      setAuthError("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("adminPassword");
    setIsAuthenticated(false);
    setPassword("");
  };

  const handleAddTool = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!newName.trim() || !newDescription.trim() || !newUrl.trim()) {
      setFormError("All fields are required");
      return;
    }

    try {
      const res = await fetch("/api/tools", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": password,
        },
        body: JSON.stringify({
          name: newName.trim(),
          description: newDescription.trim(),
          url: newUrl.trim(),
        }),
      });

      if (!res.ok) {
        setFormError("Failed to add tool");
        return;
      }

      setNewName("");
      setNewDescription("");
      setNewUrl("");
      fetchTools();
    } catch {
      setFormError("An error occurred");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this tool?")) return;

    try {
      await fetch(`/api/tools?id=${id}`, {
        method: "DELETE",
        headers: { "x-admin-password": password },
      });
      fetchTools();
    } catch (err) {
      console.error("Failed to delete tool:", err);
    }
  };

  const handleMove = async (tool: Tool, direction: "up" | "down") => {
    const sortedTools = [...tools].sort((a, b) => a.order - b.order);
    const currentIndex = sortedTools.findIndex((t) => t.id === tool.id);

    if (direction === "up" && currentIndex === 0) return;
    if (direction === "down" && currentIndex === sortedTools.length - 1) return;

    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    const targetTool = sortedTools[targetIndex];

    try {
      // Swap orders
      await fetch("/api/tools", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": password,
        },
        body: JSON.stringify({ id: tool.id, order: targetTool.order }),
      });

      fetchTools();
    } catch (err) {
      console.error("Failed to move tool:", err);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-theme transition-colors duration-200">
        <header className="relative border-b border-theme backdrop-blur-xl sticky top-0 z-50 transition-colors duration-200 bg-[var(--background-color)]/80">
          <div className="container mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Logo size="md" className="text-theme" />
              <div className="h-5 w-px bg-[var(--border-color)]" />
              <span className="text-sm font-medium text-theme-muted">Admin</span>
            </div>
            <ThemeToggle />
          </div>
        </header>

        <main className="container mx-auto px-6 py-10">
          <div className="max-w-sm mx-auto">
            <div className="border border-theme rounded-lg p-6 space-y-6">
              <div className="text-center">
                <Lock className="h-12 w-12 mx-auto text-theme-muted mb-4" />
                <h1 className="text-xl font-semibold text-theme">Admin Access</h1>
                <p className="text-sm text-theme-muted mt-1">
                  Enter the admin password to continue
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoFocus
                />
                {authError && (
                  <p className="text-sm text-red-400">{authError}</p>
                )}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Verifying..." : "Login"}
                </Button>
              </form>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-theme transition-colors duration-200">
      <header className="relative border-b border-theme backdrop-blur-xl sticky top-0 z-50 transition-colors duration-200 bg-[var(--background-color)]/80">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size="md" className="text-theme" />
            <div className="h-5 w-px bg-[var(--border-color)]" />
            <span className="text-sm font-medium text-theme-muted">Admin</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              Logout
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-10">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight text-theme">
              Manage Tools
            </h1>
            <p className="text-theme-muted">
              Add, remove, and reorder tools in the directory.
            </p>
          </div>

          {/* Add Tool Form */}
          <div className="border border-theme rounded-lg p-6">
            <h2 className="text-lg font-medium text-theme mb-4">Add New Tool</h2>
            <form onSubmit={handleAddTool} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  placeholder="Tool name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
                <Input
                  placeholder="Description"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                />
                <Input
                  placeholder="URL"
                  type="url"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                />
              </div>
              {formError && <p className="text-sm text-red-400">{formError}</p>}
              <Button type="submit">
                <Plus className="h-4 w-4 mr-2" />
                Add Tool
              </Button>
            </form>
          </div>

          {/* Tools List */}
          <div className="border border-theme rounded-lg overflow-hidden">
            <div className="bg-[var(--muted-color)] px-4 py-3 border-b border-theme">
              <h2 className="text-sm font-semibold text-theme-muted uppercase tracking-wider">
                Tools ({tools.length})
              </h2>
            </div>
            <div className="divide-y divide-[var(--border-color)]">
              {tools.length === 0 ? (
                <div className="p-8 text-center text-theme-muted">
                  No tools configured yet. Add one above.
                </div>
              ) : (
                tools.map((tool, index) => (
                  <div
                    key={tool.id}
                    className="px-4 py-3 flex items-center justify-between hover:bg-[var(--muted-color)] transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-theme truncate">
                        {tool.name}
                      </div>
                      <div className="text-sm text-theme-muted truncate">
                        {tool.description}
                      </div>
                      <div className="text-xs text-theme-muted/60 truncate mt-0.5">
                        {tool.url}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 ml-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleMove(tool, "up")}
                        disabled={index === 0}
                        title="Move up"
                      >
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleMove(tool, "down")}
                        disabled={index === tools.length - 1}
                        title="Move down"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        onClick={() => handleDelete(tool.id)}
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
