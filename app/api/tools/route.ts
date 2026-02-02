import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { Tool } from "@/types/tools";

const dataFilePath = path.join(process.cwd(), "data", "tools.json");

async function readTools(): Promise<Tool[]> {
  try {
    const data = await fs.readFile(dataFilePath, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function writeTools(tools: Tool[]): Promise<void> {
  await fs.writeFile(dataFilePath, JSON.stringify(tools, null, 2));
}

function checkAdminPassword(request: NextRequest): boolean {
  const password = request.headers.get("x-admin-password");
  const adminPassword = process.env.ADMIN_PASSWORD;
  return password === adminPassword && !!adminPassword;
}

// GET: Return all tools sorted by order
export async function GET() {
  const tools = await readTools();
  const sortedTools = tools.sort((a, b) => a.order - b.order);
  return NextResponse.json(sortedTools);
}

// POST: Add new tool (requires admin password)
export async function POST(request: NextRequest) {
  if (!checkAdminPassword(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, description, url } = body;

    if (!name || !description || !url) {
      return NextResponse.json(
        { error: "Name, description, and URL are required" },
        { status: 400 }
      );
    }

    const tools = await readTools();
    const maxOrder = tools.reduce((max, t) => Math.max(max, t.order), 0);
    const maxId = tools.reduce((max, t) => Math.max(max, parseInt(t.id) || 0), 0);

    const newTool: Tool = {
      id: String(maxId + 1),
      name,
      description,
      url,
      order: maxOrder + 1,
    };

    tools.push(newTool);
    await writeTools(tools);

    return NextResponse.json(newTool, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}

// PUT: Update tool / reorder (requires admin password)
export async function PUT(request: NextRequest) {
  if (!checkAdminPassword(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, name, description, url, order } = body;

    if (!id) {
      return NextResponse.json({ error: "Tool ID is required" }, { status: 400 });
    }

    const tools = await readTools();
    const toolIndex = tools.findIndex((t) => t.id === id);

    if (toolIndex === -1) {
      return NextResponse.json({ error: "Tool not found" }, { status: 404 });
    }

    // Handle reordering
    if (order !== undefined) {
      const currentOrder = tools[toolIndex].order;
      const newOrder = order;

      if (newOrder !== currentOrder) {
        // Adjust other tools' orders
        tools.forEach((t) => {
          if (t.id !== id) {
            if (newOrder < currentOrder) {
              // Moving up: increment orders between newOrder and currentOrder
              if (t.order >= newOrder && t.order < currentOrder) {
                t.order += 1;
              }
            } else {
              // Moving down: decrement orders between currentOrder and newOrder
              if (t.order > currentOrder && t.order <= newOrder) {
                t.order -= 1;
              }
            }
          }
        });
        tools[toolIndex].order = newOrder;
      }
    }

    // Update other fields if provided
    if (name !== undefined) tools[toolIndex].name = name;
    if (description !== undefined) tools[toolIndex].description = description;
    if (url !== undefined) tools[toolIndex].url = url;

    await writeTools(tools);

    return NextResponse.json(tools[toolIndex]);
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}

// DELETE: Remove tool (requires admin password)
export async function DELETE(request: NextRequest) {
  if (!checkAdminPassword(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Tool ID is required" }, { status: 400 });
    }

    const tools = await readTools();
    const toolIndex = tools.findIndex((t) => t.id === id);

    if (toolIndex === -1) {
      return NextResponse.json({ error: "Tool not found" }, { status: 404 });
    }

    const deletedOrder = tools[toolIndex].order;
    tools.splice(toolIndex, 1);

    // Reorder remaining tools
    tools.forEach((t) => {
      if (t.order > deletedOrder) {
        t.order -= 1;
      }
    });

    await writeTools(tools);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
