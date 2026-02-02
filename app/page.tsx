import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { ToolsTable } from "@/components/tools-table";
import { Tool } from "@/types/tools";
import { promises as fs } from "fs";
import path from "path";

export const dynamic = "force-dynamic";

async function getTools(): Promise<Tool[]> {
  try {
    const dataFilePath = path.join(process.cwd(), "data", "tools.json");
    const data = await fs.readFile(dataFilePath, "utf-8");
    const tools: Tool[] = JSON.parse(data);
    return tools.sort((a, b) => a.order - b.order);
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const tools = await getTools();

  return (
    <div className="min-h-screen bg-theme transition-colors duration-200">
      {/* Header */}
      <header className="relative border-b border-theme backdrop-blur-xl sticky top-0 z-50 transition-colors duration-200 bg-[var(--background-color)]/80">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size="md" className="text-theme" />
            <div className="h-5 w-px bg-[var(--border-color)]" />
            <span className="text-sm font-medium text-theme-muted">
              Internal Tooling
            </span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-10">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Title */}
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight text-theme">
              Internal Tools
            </h1>
            <p className="text-theme-muted">
              Quick access to Veya internal tools and resources.
            </p>
          </div>

          {/* Tools Table */}
          <ToolsTable tools={tools} />
        </div>
      </main>

    </div>
  );
}
