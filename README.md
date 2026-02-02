# Figma to Linear – AI-Powered PRD Generator

A production-ready Next.js application that converts Figma designs into comprehensive Product Requirements Documents (PRDs) and automatically creates Linear tickets.

## Features

- **Figma Import**: Add multiple Figma file or frame URLs
- **AI PRD Generation**: Automatically generates structured PRDs from design analysis
- **Linear Integration**: Select Team → Project → Milestone hierarchy
- **Ticket Creation**: Bulk create Linear tickets with proper organization
- **Premium UI**: Built with shadcn/ui and Tailwind CSS for a polished experience
- **Workflow Progress**: Visual step-by-step progress tracking
- **Loading States**: Comprehensive skeletons and progress indicators
- **Empty States**: Thoughtful empty state designs throughout

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui (Radix UI primitives)
- **Icons**: Lucide React
- **Fonts**: Geist Sans & Geist Mono

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Clone the repository or extract the files
2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Run the development server:

```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
figma-to-linear/
├── app/
│   ├── layout.tsx          # Root layout with fonts
│   ├── page.tsx            # Main workflow orchestration
│   └── globals.css         # Global styles and design tokens
├── components/
│   ├── ui/                 # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── progress.tsx
│   │   ├── select.tsx
│   │   ├── separator.tsx
│   │   └── tabs.tsx
│   ├── steps/              # Workflow step components
│   │   ├── figma-upload-step.tsx
│   │   ├── prd-generation-step.tsx
│   │   ├── linear-config-step.tsx
│   │   └── ticket-creation-step.tsx
│   ├── empty-state.tsx     # Reusable empty state
│   ├── loading-skeleton.tsx # Loading skeletons
│   └── workflow-progress.tsx # Progress indicator
├── lib/
│   └── utils.ts            # Utility functions
├── types/
│   └── workflow.ts         # TypeScript type definitions
└── ...config files
```

## Workflow Steps

### 1. Import Figma Designs
- Add Figma file or frame URLs
- Support for multiple designs
- Visual preview of added frames

### 2. Generate PRD
- AI analyzes Figma designs
- Generates structured PRD with:
  - Overview and context
  - User stories
  - Functional requirements
  - Technical considerations
  - Success metrics

### 3. Configure Linear
- Select Team from organization
- Choose Project within team
- Pick Milestone for ticket placement

### 4. Create Tickets
- Automatically generates Linear tickets
- Maps PRD requirements to individual tickets
- Assigns priorities and estimates
- Provides direct links to Linear

## Integration Points

### Figma API Integration
To connect real Figma data, update `components/steps/figma-upload-step.tsx`:
- Add Figma API authentication
- Fetch frame previews
- Extract design metadata

### Linear API Integration
To connect real Linear data, update:
- `components/steps/linear-config-step.tsx` for teams/projects/milestones
- `components/steps/ticket-creation-step.tsx` for ticket creation

Example Linear API setup:
```typescript
const linearClient = new LinearClient({
  apiKey: process.env.LINEAR_API_KEY
});

// Fetch teams
const teams = await linearClient.teams();

// Create issue
const issue = await linearClient.createIssue({
  teamId: selectedTeam.id,
  title: ticket.title,
  description: ticket.description,
  priority: ticket.priority,
});
```

### AI/LLM Integration
To enable real PRD generation, integrate with:
- OpenAI GPT-4
- Anthropic Claude
- Custom ML models

Update `components/steps/prd-generation-step.tsx` with your AI service.

## Customization

### Design Tokens
Modify colors, spacing, and typography in:
- `app/globals.css` - CSS variables
- `tailwind.config.ts` - Tailwind theme extensions

### Workflow Steps
Add or modify steps by:
1. Creating new step component in `components/steps/`
2. Adding step to workflow in `app/page.tsx`
3. Updating `WorkflowStep` type in `types/workflow.ts`
4. Adding to progress indicator in `components/workflow-progress.tsx`

## Production Deployment

### Build for Production

```bash
npm run build
npm start
```

### Environment Variables
Create `.env.local` for sensitive data:

```env
FIGMA_API_KEY=your_figma_api_key
LINEAR_API_KEY=your_linear_api_key
OPENAI_API_KEY=your_openai_api_key
```

### Deployment Platforms
- **Vercel**: Optimized for Next.js (recommended)
- **Netlify**: Full Next.js support
- **AWS/GCP/Azure**: Standard Node.js hosting

## Design Philosophy

This application follows the Veya Platform principles:
- **Brand-native by default**: Premium, polished UI
- **Operational reliability**: Proper loading and error states
- **Design-system discipline**: Token-based theming
- **Shared core, configurable edges**: Reusable components

## Contributing

To extend this application:
1. Follow existing component patterns
2. Maintain TypeScript strict mode
3. Use shadcn/ui components for consistency
4. Add proper loading and empty states
5. Update types in `types/workflow.ts`

## License

MIT License - feel free to use this in your own projects!

## Support

For questions or issues:
- Check the inline code comments
- Review component props and types
- Consult shadcn/ui documentation
- Reference Next.js App Router docs
