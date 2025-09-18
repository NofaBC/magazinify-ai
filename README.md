# Magazinify AI™

**The future of digital magazine publishing, powered by artificial intelligence.**

Magazinify AI™ is a comprehensive SaaS platform that empowers creators and businesses to effortlessly generate, publish, and manage stunning interactive flipbook magazines. Our AI-driven pipeline handles everything from topic discovery and article writing to visual selection and layout, transforming your content strategy and captivating your audience.

This project was scaffolded and built by Manus, an autonomous AI agent.

## Core Features (MVP)

- **AI Content Pipeline**: A fully automated workflow that discovers topics, generates outlines, writes articles (complete with headlines, decks, and pull-quotes), and selects or generates visuals, paginating everything into a cohesive 8–12 page magazine based on a client-specific Blueprint.
- **Multi-Tenant Architecture**: Each client (tenant) operates within their own sandboxed environment with a dedicated dashboard, brand Blueprint, and monthly issue management.
- **Client Blueprint**: A powerful configuration system that defines each client’s unique brand identity (logo, colors, fonts), voice and tone, magazine structure (sections, page order), and content sources (RSS feeds, uploads).
- **Flexible Subscription Plans**: Three-tiered plans (Basic, Pro, Customize) managed via feature flags, offering scalable features like custom domains, premium templates, advanced analytics, and rich media embeds.
- **Dynamic Ad Slots**: Reserve pages for advertisements using simple keys (e.g., `p4`, `p10`). Creatives and links can be uploaded monthly without altering the core magazine Blueprint.
- **Interactive Flipbook & SEO-Friendly HTML**: Published issues are available as a beautiful, interactive flipbook (powered by StPageFlip) and a fully accessible HTML version to ensure maximum reach and SEO performance.
- **Publishing Lifecycle**: A complete issue lifecycle from auto-drafting monthly, allowing for editor review and tweaks, to one-click publishing. Each issue gets a permanent public URL, and an archive page is automatically maintained.
- **Analytics Dashboard**: An integrated analytics suite to track key metrics like views, page turns, CTA clicks, and ad performance, presented in clear, easy-to-understand charts.

## Tech Stack

- **Frontend**: React (Vite) with TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js (App Router) API Routes deployed on Vercel
- **Database**: Firebase Firestore for scalable, real-time data storage
- **Authentication**: Firebase Authentication
- **File Storage**: Vercel Blob (or Amazon S3) for logos, ad creatives, and other assets
- **Flipbook Renderer**: StPageFlip
- **AI**: OpenAI (GPT-4 and DALL-E 3)

## Project Structure

```
/magazinify-ai
├── .github/                # CI/CD workflows
├── public/                   # Static assets
├── scripts/                  # Seed and utility scripts
│   └── seedPublishedIssue.js
├── src/
│   ├── api/                  # API route handlers
│   ├── assets/               # Images, fonts, etc.
│   ├── components/           # Reusable React components
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── flipbook/
│   │   └── ui/               # shadcn/ui components
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Core libraries and services
│   │   ├── ai/               # AI services (OpenAI, content pipeline)
│   │   ├── auth/             # Authentication context and helpers
│   │   ├── database/         # Firebase services
│   │   └── utils.js          # Utility functions
│   ├── pages/                # Page components
│   └── types/                # TypeScript type definitions
├── tests/                    # Integration and unit tests
├── .env.example              # Environment variable template
├── firebase.json             # Firebase configuration
├── firestore.rules           # Firestore security rules
├── package.json
├── README.md
└── vercel.json               # Vercel deployment configuration
```

## Getting Started

### Prerequisites

- Node.js (v18+)
- pnpm (or npm/yarn)
- Firebase Account (with a Firestore project)
- OpenAI API Key
- Vercel Account

### 1. Clone the Repository

```bash
git clone <repository-url>
cd magazinify-ai
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Configure Environment Variables

Copy the `.env.example` file to `.env` and fill in the required credentials for Firebase, OpenAI, and Vercel Blob storage.

```bash
cp .env.example .env
```

### 4. Set Up Firebase

1.  Go to your Firebase project console.
2.  Enable Firestore and Firebase Authentication (Email/Password provider).
3.  Copy your Firebase project configuration into `src/lib/database/firebase.js`.
4.  Apply the security rules from `firestore.rules` to your Firestore database.
5.  Apply the indexes from `firestore.indexes.json`.

### 5. Seed the Database

To get started with sample data, including a pre-published issue, run the seed script:

```bash
pnpm run seed
```

This will create a test tenant (`visionwing`), a magazine (`showcase`), and a published issue for September 2025.

### 6. Run the Development Server

```bash
pnpm run dev
```

The application will be available at `http://localhost:5173`.

## Testing

The project includes a comprehensive test suite to ensure code quality and stability.

- **Run all tests**: `pnpm test`
- **Run unit tests**: `pnpm run test:unit`
- **Run integration tests**: `pnpm run test:integration`

## Deployment

This project is configured for seamless deployment to Vercel. The CI/CD pipeline in `.github/workflows/ci.yml` handles automated testing and deployment:

- Pushes to the `develop` branch deploy to a staging environment.
- Pushes to the `main` branch deploy to the production environment.

Vercel environment variables and secrets must be configured for the pipeline to work correctly.

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.

