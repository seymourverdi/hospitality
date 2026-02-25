# City Club HMS

Hospitality Management System for Highland City Club - a modern POS and operations platform for managing food & beverage service, reservations, and kitchen operations.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS with custom dark theme
- **Components:** shadcn/ui
- **Database:** Supabase (PostgreSQL)
- **Language:** TypeScript

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone git@github.com:highlandcityclub/hospitality.git
cd hospitality

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`

### Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (app)/              # Authenticated app routes
│   │   ├── sale/           # POS sale screen
│   │   ├── display/        # Kitchen display
│   │   ├── rsvp/           # Reservations
│   │   ├── tables/         # Table management
│   │   ├── stats/          # Analytics dashboard
│   │   └── ...
│   └── globals.css         # Global styles & theme
├── components/
│   ├── ui/                 # shadcn/ui components
│   └── layout/             # App shell, navigation
├── modules/                # Feature modules
│   ├── Sale/               # POS functionality
│   │   ├── components/     # Sale-specific components
│   │   ├── screens/        # Step screens
│   │   ├── modals/         # Dialogs
│   │   ├── context/        # State management
│   │   └── types.ts        # TypeScript types
│   ├── Display/            # Kitchen display
│   ├── RSVP/               # Reservations
│   └── Stats/              # Analytics
├── core/                   # Shared infrastructure
│   ├── supabase/           # Database client
│   ├── repositories/       # Data access layer
│   └── lib/                # Utilities
└── Icons/                  # SVG icons
```

## Development Workflow

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make changes and commit: `git commit -m "feat: add feature"`
3. Push and create PR: `git push -u origin feature/your-feature`
4. Merge via Pull Request on GitHub

## Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Modules

### Sale (POS)
Point-of-sale interface for taking orders. Features:
- Category-based product browsing
- Member lookup with alphabet keyboard
- Table and seat selection
- Modifier support
- Discount tiers
- Order scheduling

### Display (Kitchen)
Kitchen display system showing active orders in a Kanban-style board.

### RSVP
Reservation management for dining room bookings.

### Stats
Analytics dashboard for sales metrics and popular items.

---

## License

Private - Highland City Club
