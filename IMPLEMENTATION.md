# Implementation Guide: Figma to Linear

This guide covers implementing the production integrations for Figma API, Linear API, and AI-powered PRD generation.

---

## 1. Figma API Integration

### Setup

1. Get Figma API access:
   - Go to Figma Account Settings → Personal Access Tokens
   - Generate new token
   - Store in `.env.local`: `FIGMA_API_KEY=your_token_here`

2. Install Figma API client:
```bash
npm install figma-api
```

### Implementation

Create `lib/figma-client.ts`:

```typescript
import * as Figma from 'figma-api';

const client = new Figma.Api({
  personalAccessToken: process.env.FIGMA_API_KEY!,
});

export async function getFileData(fileKey: string) {
  try {
    const file = await client.getFile(fileKey);
    return file;
  } catch (error) {
    console.error('Error fetching Figma file:', error);
    throw error;
  }
}

export async function getFileImages(fileKey: string, nodeIds: string[]) {
  try {
    const images = await client.getImage(fileKey, {
      ids: nodeIds,
      format: 'png',
      scale: 2,
    });
    return images;
  } catch (error) {
    console.error('Error fetching Figma images:', error);
    throw error;
  }
}

export function extractFileKey(url: string): string | null {
  const match = url.match(/file\/([a-zA-Z0-9]+)/);
  return match ? match[1] : null;
}

export function extractNodeId(url: string): string | null {
  const match = url.match(/node-id=([^&]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}
```

Update `components/steps/figma-upload-step.tsx`:

```typescript
import { getFileData, getFileImages, extractFileKey, extractNodeId } from '@/lib/figma-client';

const handleAddUrl = async () => {
  if (!figmaUrl.trim()) return;
  
  const fileKey = extractFileKey(figmaUrl);
  const nodeId = extractNodeId(figmaUrl);
  
  if (!fileKey) {
    setError('Invalid Figma URL');
    return;
  }

  try {
    setIsLoading(true);
    const fileData = await getFileData(fileKey);
    
    // Get image preview if node ID is specified
    let imageUrl;
    if (nodeId) {
      const images = await getFileImages(fileKey, [nodeId]);
      imageUrl = images.images[nodeId];
    }

    const newFrame: FigmaFrame = {
      id: `frame-${Date.now()}`,
      name: fileData.name,
      url: figmaUrl,
      imageUrl,
    };

    onFramesChange([...frames, newFrame]);
    setFigmaUrl('');
  } catch (error) {
    setError('Failed to fetch Figma file');
  } finally {
    setIsLoading(false);
  }
};
```

---

## 2. Linear API Integration

### Setup

1. Get Linear API key:
   - Go to Linear Settings → API → Personal API keys
   - Create new key
   - Store in `.env.local`: `LINEAR_API_KEY=your_token_here`

2. Install Linear SDK:
```bash
npm install @linear/sdk
```

### Implementation

Create `lib/linear-client.ts`:

```typescript
import { LinearClient } from '@linear/sdk';

const client = new LinearClient({
  apiKey: process.env.LINEAR_API_KEY!,
});

export async function getTeams() {
  const teams = await client.teams();
  return teams.nodes.map(team => ({
    id: team.id,
    name: team.name,
    key: team.key,
  }));
}

export async function getProjects(teamId: string) {
  const team = await client.team(teamId);
  const projects = await team.projects();
  return projects.nodes.map(project => ({
    id: project.id,
    name: project.name,
    teamId: teamId,
  }));
}

export async function getMilestones(projectId: string) {
  const project = await client.project(projectId);
  // Note: Linear calls milestones "project milestones"
  const milestones = await project.projectMilestones();
  return milestones.nodes.map(milestone => ({
    id: milestone.id,
    name: milestone.name,
    projectId: projectId,
  }));
}

export async function createIssue(params: {
  teamId: string;
  projectId: string;
  title: string;
  description: string;
  priority: number;
  estimate?: number;
}) {
  const issue = await client.createIssue({
    teamId: params.teamId,
    projectId: params.projectId,
    title: params.title,
    description: params.description,
    priority: params.priority,
    estimate: params.estimate,
  });

  return {
    id: issue.issue?.id || '',
    title: params.title,
    description: params.description,
    priority: params.priority,
    estimate: params.estimate,
  };
}
```

Create API routes for server-side calls:

`app/api/linear/teams/route.ts`:
```typescript
import { NextResponse } from 'next/server';
import { getTeams } from '@/lib/linear-client';

export async function GET() {
  try {
    const teams = await getTeams();
    return NextResponse.json(teams);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch teams' },
      { status: 500 }
    );
  }
}
```

`app/api/linear/projects/route.ts`:
```typescript
import { NextResponse } from 'next/server';
import { getProjects } from '@/lib/linear-client';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const teamId = searchParams.get('teamId');

  if (!teamId) {
    return NextResponse.json(
      { error: 'teamId is required' },
      { status: 400 }
    );
  }

  try {
    const projects = await getProjects(teamId);
    return NextResponse.json(projects);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}
```

Update `components/steps/linear-config-step.tsx`:
```typescript
useEffect(() => {
  async function fetchTeams() {
    const response = await fetch('/api/linear/teams');
    const data = await response.json();
    setTeams(data);
  }
  fetchTeams();
}, []);

useEffect(() => {
  if (selectedTeam) {
    async function fetchProjects() {
      const response = await fetch(
        `/api/linear/projects?teamId=${selectedTeam.id}`
      );
      const data = await response.json();
      setProjects(data);
    }
    fetchProjects();
  }
}, [selectedTeam]);
```

---

## 3. AI PRD Generation

### Option A: OpenAI GPT-4

Install OpenAI SDK:
```bash
npm install openai
```

Create `lib/openai-client.ts`:
```typescript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function generatePRD(frames: FigmaFrame[]) {
  const prompt = `You are a product manager creating a PRD from Figma designs.

Designs provided:
${frames.map(f => `- ${f.name}: ${f.url}`).join('\n')}

Generate a comprehensive PRD with the following sections:
1. Overview - high-level summary
2. Background & Context - why this feature exists
3. User Stories - as a user, I want...
4. Functional Requirements - detailed requirements list
5. Technical Considerations - implementation notes
6. Success Metrics - how we measure success

Format as JSON with this structure:
{
  "title": "string",
  "overview": "string",
  "sections": [{"title": "string", "content": "string"}],
  "requirements": ["string"],
  "technicalNotes": ["string"]
}`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      {
        role: 'system',
        content: 'You are an expert product manager who writes clear, actionable PRDs.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    response_format: { type: 'json_object' },
  });

  const content = completion.choices[0].message.content;
  return JSON.parse(content || '{}');
}
```

### Option B: Anthropic Claude

Install Anthropic SDK:
```bash
npm install @anthropic-ai/sdk
```

Create `lib/anthropic-client.ts`:
```typescript
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function generatePRD(frames: FigmaFrame[]) {
  const prompt = `You are a product manager creating a PRD from Figma designs.

Designs provided:
${frames.map(f => `- ${f.name}: ${f.url}`).join('\n')}

Generate a comprehensive PRD with sections for Overview, User Stories, Requirements, and Technical Notes.`;

  const message = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  // Parse Claude's response into structured PRD
  const content = message.content[0].text;
  
  // You'll need to parse the markdown response into your PRD structure
  return parsePRDFromMarkdown(content);
}
```

Create API route `app/api/generate-prd/route.ts`:
```typescript
import { NextResponse } from 'next/server';
import { generatePRD } from '@/lib/openai-client'; // or anthropic-client

export async function POST(request: Request) {
  try {
    const { frames } = await request.json();
    const prd = await generatePRD(frames);
    return NextResponse.json(prd);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to generate PRD' },
      { status: 500 }
    );
  }
}
```

Update `components/steps/prd-generation-step.tsx`:
```typescript
const generatePRD = async () => {
  setIsGenerating(true);
  
  try {
    const response = await fetch('/api/generate-prd', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ frames }),
    });

    if (!response.ok) throw new Error('Failed to generate PRD');

    const prd = await response.json();
    onPRDGenerated(prd);
  } catch (error) {
    console.error('Error generating PRD:', error);
    setError('Failed to generate PRD. Please try again.');
  } finally {
    setIsGenerating(false);
  }
};
```

---

## 4. Environment Variables

Create `.env.local`:
```env
# Figma
FIGMA_API_KEY=your_figma_token_here

# Linear
LINEAR_API_KEY=your_linear_token_here

# AI (choose one or both)
OPENAI_API_KEY=your_openai_key_here
ANTHROPIC_API_KEY=your_anthropic_key_here
```

---

## 5. Error Handling

Add error boundary `components/error-boundary.tsx`:

```typescript
'use client';

import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export function ErrorState({ 
  error, 
  reset 
}: { 
  error: Error; 
  reset: () => void;
}) {
  return (
    <Card className="border-destructive">
      <CardContent className="pt-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
          <div className="flex-1">
            <h3 className="font-medium text-destructive mb-1">
              Something went wrong
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {error.message || 'An unexpected error occurred'}
            </p>
            <Button onClick={reset} variant="outline" size="sm">
              Try Again
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

---

## 6. Testing

Add test utilities:

```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom jest
```

Example test `__tests__/workflow.test.tsx`:

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { FigmaUploadStep } from '@/components/steps/figma-upload-step';

describe('FigmaUploadStep', () => {
  it('adds Figma URL when submitted', () => {
    const onFramesChange = jest.fn();
    const onNext = jest.fn();

    render(
      <FigmaUploadStep
        frames={[]}
        onFramesChange={onFramesChange}
        onNext={onNext}
      />
    );

    const input = screen.getByPlaceholderText(/Paste Figma URL/i);
    const addButton = screen.getByText(/Add/i);

    fireEvent.change(input, {
      value: 'https://figma.com/file/abc123/Design',
    });
    fireEvent.click(addButton);

    expect(onFramesChange).toHaveBeenCalled();
  });
});
```

---

## 7. Production Checklist

- [ ] Set up environment variables in deployment platform
- [ ] Add rate limiting for API routes
- [ ] Implement proper error logging (Sentry, LogRocket)
- [ ] Add analytics tracking (PostHog, Mixpanel)
- [ ] Set up monitoring (Vercel Analytics, DataDog)
- [ ] Add authentication if needed (NextAuth.js)
- [ ] Configure CORS for API routes
- [ ] Add request validation with Zod
- [ ] Implement caching for Linear/Figma data
- [ ] Add webhook handlers for real-time updates
- [ ] Set up CI/CD pipeline
- [ ] Configure CSP headers
- [ ] Add sitemap and robots.txt
- [ ] Optimize images and fonts
- [ ] Run Lighthouse audits

---

## 8. Deployment

### Vercel (Recommended)

```bash
npm install -g vercel
vercel login
vercel --prod
```

Add environment variables in Vercel dashboard.

### Docker

Create `Dockerfile`:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t figma-to-linear .
docker run -p 3000:3000 --env-file .env.local figma-to-linear
```

---

## Support

For issues or questions:
- Check API documentation: Figma, Linear, OpenAI/Anthropic
- Review Next.js App Router docs
- Test API endpoints with Postman
- Check server logs for errors
