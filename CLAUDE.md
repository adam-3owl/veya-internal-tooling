# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server at localhost:3000
npm run build    # Production build
npm run start    # Run production server
npm run lint     # Run Next.js linting
```

## Architecture

This is a Next.js 14 App Router application that converts Figma designs into PRDs (Product Requirements Documents) and creates Linear tickets.

### Workflow State Machine

The app follows a linear workflow managed in `app/page.tsx` via `WorkflowState`:

1. **upload** - User adds Figma URLs via `FigmaUploadStep`
2. **generate-prd** - AI generates PRD from frames via `PRDGenerationStep`
3. **configure-linear** - User selects Linear team/project/milestone via `LinearConfigStep`
4. **create-tickets** - Tickets created from PRD via `TicketCreationStep`
5. **complete** - Success screen

All workflow state lives in the root page component and flows down through props.

### API Routes

- `POST /api/figma/frames` - Fetches Figma file metadata and frame preview images. Extracts file key and node ID from URLs, calls Figma API.
- `POST /api/generate-prd` - Sends frames to Claude API, returns structured PRD JSON matching `GeneratedPRD` type.

### Type Definitions

All shared types are in `types/workflow.ts`:
- `FigmaFrame`, `GeneratedPRD`, `PRDSection` - Design and PRD data
- `LinearTeam`, `LinearProject`, `LinearMilestone`, `LinearTicket` - Linear entities
- `WorkflowState`, `WorkflowStep` - State machine types

### Component Patterns

- **UI components** (`components/ui/`) - shadcn/ui primitives built on Radix UI
- **Step components** (`components/steps/`) - Each workflow step is self-contained
- **Shared components** - `EmptyState`, `LoadingSkeleton`, `WorkflowProgress`

Use the `cn()` utility from `lib/utils.ts` for conditional class merging (clsx + tailwind-merge).

## Environment Variables

Required in `.env.local`:
```
FIGMA_API_KEY=      # Figma personal access token
ANTHROPIC_API_KEY=  # For PRD generation via Claude API
LINEAR_API_KEY=     # For Linear integration (not yet implemented)
```

## Key Integration Points

When implementing Linear integration, add API routes at `app/api/linear/` and update `LinearConfigStep` and `TicketCreationStep` to call them.
