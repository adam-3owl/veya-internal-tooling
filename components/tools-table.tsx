"use client";

import { useState } from "react";
import { Copy, ExternalLink, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tool } from "@/types/tools";
import { cn } from "@/lib/utils";

interface ToolsTableProps {
  tools: Tool[];
}

export function ToolsTable({ tools }: ToolsTableProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Safety check for non-array data
  const toolsList = Array.isArray(tools) ? tools : [];

  const copyToClipboard = async (tool: Tool) => {
    try {
      await navigator.clipboard.writeText(tool.url);
      setCopiedId(tool.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  if (toolsList.length === 0) {
    return (
      <div className="border border-theme rounded-lg p-12 text-center">
        <p className="text-theme-muted">No tools configured yet.</p>
        <p className="text-sm text-theme-muted/60 mt-1">
          Visit /admin to add tools.
        </p>
      </div>
    );
  }

  return (
    <div className="border border-theme rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-theme bg-[var(--muted-color)]">
              <th className="px-4 py-3 text-left text-xs font-semibold text-theme-muted uppercase tracking-wider">
                Tool
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-theme-muted uppercase tracking-wider w-28">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-color)]">
            {toolsList.map((tool) => (
              <tr
                key={tool.id}
                className="hover:bg-[var(--muted-color)] transition-colors"
              >
                <td className="px-4 py-4">
                  <div className="font-medium text-theme">{tool.name}</div>
                  <div className="text-sm text-theme-muted mt-0.5">
                    {tool.description}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => copyToClipboard(tool)}
                      className={cn(
                        "h-8 w-8",
                        copiedId === tool.id && "text-emerald-400"
                      )}
                      title="Copy URL"
                    >
                      {copiedId === tool.id ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      asChild
                      className="h-8 w-8"
                      title="Open in new tab"
                    >
                      <a href={tool.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
