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

This is a Next.js 14 App Router application that serves as an internal tools directory for Veya.

### Key Files

- `app/page.tsx` - Main page displaying the tools table
- `app/admin/page.tsx` - Admin page for managing tools (password protected)
- `app/api/tools/route.ts` - API routes for CRUD operations on tools
- `types/tools.ts` - Tool interface definition
- `data/tools.json` - Persistent storage for tools data
- `components/tools-table.tsx` - Table component for displaying tools
- `components/ui/` - shadcn/ui primitives (Button, Input, etc.)
- `components/logo.tsx` - Veya logo component

### Adding/Managing Tools

Tools are managed via the admin page at `/admin`. The admin password is set via the `ADMIN_PASSWORD` environment variable.

Each tool has:
- `id` - Unique identifier
- `name` - Display name
- `description` - Brief description
- `url` - Link to the tool
- `order` - Display order (managed via up/down buttons)

### Styling

Uses Tailwind CSS with CSS variables for theming. Theme colors defined in `app/globals.css`.

Use the `cn()` utility from `lib/utils.ts` for conditional class merging.
