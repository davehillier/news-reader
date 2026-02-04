# News Reader

A personalised news aggregator with AI-powered briefings, talking points, and intelligent summaries.

## How It Works

News Reader pulls from 27 RSS feeds across major news sources, then uses AI to transform raw headlines into actionable intelligence:

1. **Aggregate** - Fetch and cache articles from BBC, Guardian, TechCrunch, Reuters, Sky, FT, and more
2. **Categorise** - Filter by Tech, Finance, UK, World, Sport, Culture, or Science
3. **Summarise** - AI generates briefings, talking points, and email digests on demand
4. **Personalise** - User preferences stored in Firestore, authentication via Firebase

### AI Features

| Feature | Description |
|---------|-------------|
| Morning Briefing | Executive summary of top stories with conversation starters |
| Talking Points | Water-cooler-ready insights with bold takes and lighter moments |
| Weekly Bios | Background context on people making the news |
| Email Digest | Formatted digest ready to send via Resend |
| AI Chat | Ask questions about the day's news |

All AI features support both Claude and Google Gemini, with caching to reduce API costs.

## News Sources

**27 feeds** across 8 categories:

- **Tech**: TechCrunch, The Verge, Ars Technica, Guardian Tech
- **Finance**: BBC Business, FT Markets, Guardian Business
- **UK**: BBC UK, Guardian UK, Sky News UK
- **World**: BBC World, Guardian World, Al Jazeera, Reuters, Euronews, France24, SCMP
- **Sport**: BBC Sport, Sky Sports, Guardian Sport
- **Culture**: BBC Entertainment, Guardian Music/Film/TV, NME, Pitchfork
- **Science**: BBC Science, Guardian Science/Environment, NASA, New Scientist

## Getting Started

### Prerequisites

- Node.js 18+
- Firebase project with Authentication and Firestore enabled
- API keys for Claude and/or Google Gemini
- (Optional) Resend API key for email digests

### Environment Variables

Create `.env.local`:

```bash
# Firebase (client-side)
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...

# Firebase Admin (server-side)
FIREBASE_ADMIN_PROJECT_ID=...
FIREBASE_ADMIN_CLIENT_EMAIL=...
FIREBASE_ADMIN_PRIVATE_KEY=...

# AI Providers
ANTHROPIC_API_KEY=...
GOOGLE_AI_API_KEY=...

# Email (optional)
RESEND_API_KEY=...
```

### Installation

```bash
# Clone the repository
git clone git@github.com:davehillier/news-reader.git
cd news-reader

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## Tech Stack

- **Framework**: Next.js 16 with App Router and Turbopack
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Authentication**: Firebase Auth (Google Sign-in)
- **Database**: Firestore for user preferences
- **AI**: Claude (Anthropic) and Gemini (Google)
- **RSS Parsing**: rss-parser
- **Email**: Resend
- **Icons**: Lucide React

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Main feed view
│   ├── settings/page.tsx     # User preferences
│   └── api/
│       ├── feeds/route.ts    # RSS aggregation endpoint
│       ├── preferences/      # User settings CRUD
│       └── ai/
│           ├── briefing/     # Morning briefing generation
│           ├── talking-points/ # Conversation starters
│           ├── weekly-bios/  # People in the news
│           ├── email-digest/ # Formatted email content
│           ├── summarise/    # Article summaries
│           └── ask/          # Conversational Q&A
├── components/
│   ├── feed/                 # Article cards, grid, navigation
│   ├── ai/                   # AI feature modals
│   ├── auth/                 # Authentication button
│   └── layout/               # Header, navigation
├── context/
│   ├── AuthContext.tsx       # Firebase authentication
│   └── PreferencesContext.tsx # User settings
├── hooks/
│   └── useFeed.ts            # Feed fetching and caching
├── lib/
│   ├── feedSources.ts        # RSS source definitions
│   ├── rssParser.ts          # Feed parsing logic
│   ├── feedCache.ts          # In-memory caching
│   └── aiTypes.ts            # AI response interfaces
└── types/
    └── index.ts              # Core TypeScript interfaces
```

## Features

- **Responsive grid layout** with hero, story, and compact card variants
- **Category filtering** with real-time article counts
- **Source health monitoring** showing connected/failed feeds
- **Pull-to-refresh** with loading skeletons
- **AI provider toggle** between Claude and Gemini
- **Response caching** to minimise API costs
- **User authentication** with Google Sign-in
- **Preference persistence** for enabled sources and muted topics

## Licence

MIT
