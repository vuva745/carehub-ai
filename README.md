# NeoCare - Healthcare Management System

A comprehensive healthcare management platform built with modern web technologies for managing patient care, medication tracking, wound care, fall detection, and medical device monitoring.

## Features

- **Care Overview**: Real-time AI-powered live monitoring of patient care sessions
- **Medication AI Scan**: Automated medication identification and verification
- **WoundCare AI**: Advanced wound assessment and tracking
- **FallRadar AI**: Intelligent fall detection and prevention system
- **Planning & Routes**: Optimized route planning for healthcare visits
- **AI Triage**: Phone support system with intelligent triage
- **Doctor & Family Portal**: Communication and updates portal
- **Finance & Billing**: Financial management and reporting
- **Devices & Hardware**: Medical device inventory and management
- **Household Help**: Home care assistance scheduling
- **Materials & Stock**: Inventory management with AI assistance
- **CareTV Sync**: Video upload and synchronization
- **AI Reports & Insights**: Analytics and reporting dashboard

## Technology Stack

- **Vite** - Fast build tool and development server
- **TypeScript** - Type-safe JavaScript
- **React** - UI library
- **shadcn-ui** - High-quality component library
- **Tailwind CSS** - Utility-first CSS framework
- **Recharts** - Data visualization library
- **Lucide React** - Icon library

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd carehub-ai
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:3000`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:dev` - Build in development mode
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## Project Structure

```
carehub-ai/
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── tabs/         # Tab-specific components
│   │   └── ui/           # shadcn-ui components
│   ├── pages/            # Page components
│   ├── lib/              # Utility functions
│   └── main.tsx          # Application entry point
├── public/               # Static assets
└── package.json          # Dependencies and scripts
```

## Development

The application uses a tab-based navigation system with 13 main sections. Each tab is a self-contained component located in `src/components/tabs/`.

### Key Components

- **Index.tsx**: Main application layout with sidebar navigation
- **Tab Components**: Individual feature implementations in `src/components/tabs/`

## Building for Production

To create a production build:

```bash
npm run build
```

The build output will be in the `dist/` directory.

## License

This project is proprietary software. All rights reserved.
