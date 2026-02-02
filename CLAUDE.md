# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Commands

```bash
npm run dev      # Start development server at localhost:3000
npm run build    # Production build
npm run start    # Run production server
npm run lint     # Run Next.js linting
```

## Architecture

This is a Next.js 14 App Router application that displays a filterable reference table of Veya Analytics SDK metrics.

### Key Files

- `app/page.tsx` - Main page with search, category filters, and metrics table
- `types/metrics.ts` - All SDK metrics data with descriptions, methods, and categories
- `components/ui/` - shadcn/ui primitives (Button, Input, etc.)
- `components/logo.tsx` - Veya logo component

### Adding New Metrics

Add new metrics to the `metrics` array in `types/metrics.ts`:

```typescript
{
  name: "event_name",
  method: "methodName(params)",
  category: "ecommerce", // one of MetricCategory
  description: "What this event tracks",
  parameters?: "param1, param2" // optional
}
```

### Styling

Uses Tailwind CSS with CSS variables for theming. Theme colors defined in `app/globals.css`.

Use the `cn()` utility from `lib/utils.ts` for conditional class merging.
