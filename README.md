# Magazinify AI™

<div align="center">
  <img src="assets/images/logo.png" alt="Magazinify AI Logo" width="200">
  <h3>Turn Your Website Into An Engaging Digital Magazine</h3>
</div>

## 🌟 Overview

Magazinify AI™ is a SaaS platform that automatically generates monthly digital magazines for businesses. With just a website URL, our AI analyzes your brand, creates tailored content, sources images, and publishes a professional flipbook that builds authority and drives traffic back to your website.

### Perfect for:
- 🏠 Real estate agents
- 💆 Spas and wellness centers
- 🏥 Medical clinics
- 🍽️ Restaurants
- 🔧 Home service providers
- 🛍️ Local retailers
- 👩‍💼 Solo founders and small businesses

## ✨ Features

- **Automated Content Creation**: One flagship article and 4-5 supporting blog-style pieces tailored to your business
- **Smart Image Sourcing**: Uses your uploaded images, website content, AI-generated visuals, or licensed stock photos
- **Interactive Flipbook**: Share your magazine with a digital link that offers an immersive reading experience
- **Performance Analytics**: Track views and clicks to measure engagement
- **Ad Space Management**: Include ads from partners or self-promotions, with optional white-labeling for paid tiers
- **Monthly Activation**: Fresh content every month with minimal effort

## 🚀 How It Works

1. **Purchase a Plan**: Choose between Basic (12 pages) or Pro (24 pages)
2. **Submit Your Website**: Enter your URL and optionally upload brand assets
3. **AI Content Generation**: Our system crawls your site and creates relevant articles and images
4. **Magazine Creation**: A designed PDF and interactive flipbook is generated
5. **Share & Track**: Receive a shareable link and track engagement with built-in analytics

## 💻 Tech Stack

- **Frontend**: React.js, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: Firebase Firestore
- **Storage**: Firebase Cloud Storage
- **Authentication**: Firebase Auth
- **AI/ML**: OpenAI API, Google Cloud Vision API
- **PDF Generation**: Puppeteer, PDFKit
- **Flipbook**: Turn.js
- **Payments**: Stripe
- **Analytics**: Firebase Analytics, Custom tracking

## 📋 Project Structure

```
magazinify-ai/
├── client/                    # Frontend React application
│   ├── public/                # Static assets
│   └── src/
│       ├── assets/            # Images, fonts, etc.
│       ├── components/        # Reusable components
│       ├── contexts/          # React contexts for state management
│       ├── hooks/             # Custom React hooks
│       ├── pages/             # Application pages
│       ├── services/          # API service calls
│       └── utils/             # Utility functions
│
├── server/                    # Backend Node.js/Express application
│   ├── config/                # Configuration files
│   ├── controllers/           # Route controllers
│   ├── middleware/            # Express middlewares
│   ├── models/                # Data models
│   ├── routes/                # API routes
│   ├── services/              # Business logic services
│   │   ├── ai/                # AI content generation
│   │   ├── pdf/               # PDF generation
│   │   ├── image/             # Image processing
│   │   └── analytics/         # Analytics tracking
│   └── utils/                 # Utility functions
│
├── firestore.rules            # Firestore security rules
├── storage.rules              # Storage security rules
└── functions/                 # Firebase Cloud Functions
    ├── stripe/                # Stripe payment webhooks
    ├── pdf-generation/        # PDF generation functions
    ├── scheduled-jobs/        # Monthly activation jobs
    └── cleanup-tasks/         # Asset cleanup jobs
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- Firebase CLI
- Google Cloud SDK
- Yarn or npm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/nofa/magazinify-ai.git
   cd magazinify-ai
   ```

2. Install dependencies:
   ```bash
   # Install client dependencies
   cd client
   yarn install
   
   # Install server dependencies
   cd ../server
   yarn install
   
   # Install functions dependencies
   cd ../functions
   yarn install
   ```

3. Set up environment variables:
   ```bash
   # Create .env files from templates
   cp client/.env.example client/.env
   cp server/.env.example server/.env
   cp functions/.env.example functions/.env
   ```

4. Set up Firebase:
   ```bash
   # Login to Firebase
   firebase login
   
   # Initialize Firebase
   firebase init
   ```

5. Start development servers:
   ```bash
   # Start client
   cd client
   yarn start
   
   # Start server (in another terminal)
   cd server
   yarn dev
   ```

## 💳 Plans

- **Basic** — $99/month
  - 12 pages
  - Hosted flipbook link
  - One monthly activation
  - Basic analytics

- **Pro** — $199/month
  - 24 pages
  - Richer visuals
  - Optional video links
  - More ad slots
  - Advanced analytics

- **Custom** — Custom pricing
  - Realtor-ready layouts
  - Multiple listings
  - Advanced brand control
  - Optional custom domain
  - White label options

## 🔒 Security & Privacy

- **Data Isolation**: Tenant-scoped Firestore collections and Storage
- **Access Control**: Strict security rules based on tenantId claims
- **Secret Management**: Server environment variables, no exposed API keys
- **Content Permissions**: Public readers can only access published issues

## 📊 Data Model

```
tenants/{tenantId}/                     # Tenant root
  ├── profile/                          # Tenant profile data
  ├── brandAssets/                      # Brand assets (logo, colors)
  ├── issues/{year}-{month}/            # Issues by year-month
  │    ├── articles/                    # Articles in the issue
  │    ├── images/                      # Images used in the issue
  │    ├── ads/                         # Ad slots
  │    └── analytics/                   # View and click data
  └── subscribers/                      # Magazine subscribers
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

## 📝 License

This project is licensed under the [MIT License](LICENSE).

## 📞 Contact

- Email: info@magazinify.ai
- Website: [magazinify.ai](https://magazinify.ai)
- Twitter: [@magazinifyai](https://twitter.com/magazinifyai)

---

<div align="center">
  <p>© 2025 Magazinify AI™. All rights reserved.</p>
  <p>A product of NOFA Business Consulting</p>
</div>
