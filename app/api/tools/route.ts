import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { Tool } from "@/types/tools";

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

const TOOLS_KEY = "tools";

async function getTools(): Promise<Tool[]> {
  const tools = await redis.get<Tool[]>(TOOLS_KEY);
  return tools || [];
}

async function setTools(tools: Tool[]): Promise<void> {
  await redis.set(TOOLS_KEY, tools);
}

function checkAdminPassword(request: NextRequest): boolean {
  const password = request.headers.get("x-admin-password");
  const adminPassword = process.env.ADMIN_PASSWORD;
  return password === adminPassword && !!adminPassword;
}

// GET: Return all tools sorted by order
export async function GET() {
  try {
    const tools = await getTools();
    const sortedTools = tools.sort((a, b) => a.order - b.order);
    return NextResponse.json(sortedTools);
  } catch (error) {
    console.error("Failed to get tools:", error);
    return NextResponse.json({ error: "Failed to fetch tools" }, { status: 500 });
  }
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

    const tools = await getTools();
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
    await setTools(tools);

    return NextResponse.json(newTool, { status: 201 });
  } catch (error) {
    console.error("Failed to add tool:", error);
    return NextResponse.json({ error: "Failed to add tool" }, { status: 500 });
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

    const tools = await getTools();
    const toolIndex = tools.findIndex((t) => t.id === id);

    if (toolIndex === -1) {
      return NextResponse.json({ error: "Tool not found" }, { status: 404 });
    }

    // Handle reordering
    if (order !== undefined) {
      const currentOrder = tools[toolIndex].order;
      const newOrder = order;

      if (newOrder !== currentOrder) {
        tools.forEach((t) => {
          if (t.id !== id) {
            if (newOrder < currentOrder) {
              if (t.order >= newOrder && t.order < currentOrder) {
                t.order += 1;
              }
            } else {
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

    await setTools(tools);

    return NextResponse.json(tools[toolIndex]);
  } catch (error) {
    console.error("Failed to update tool:", error);
    return NextResponse.json({ error: "Failed to update tool" }, { status: 500 });
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

    const tools = await getTools();
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

    await setTools(tools);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete tool:", error);
    return NextResponse.json({ error: "Failed to delete tool" }, { status: 500 });
  }
}
