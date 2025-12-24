# TradeHub

A peer-to-peer marketplace where users can buy and sell products securely.

Built with Next.js 15, Supabase, and Tailwind CSS.

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Run development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Features

- User authentication with email verification
- Product listings with image uploads
- Shopping cart and checkout
- Order tracking for buyers and sellers
- Dispute resolution system
- Admin dashboard

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 15 |
| Database | Supabase (PostgreSQL) |
| Styling | Tailwind CSS + ShadCN UI |
| Auth | Supabase Auth |
| Email | Resend |
| Images | Cloudinary |
| State | Zustand |

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

## Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Documentation

See [PROJECT.md](./PROJECT.md) for detailed documentation.

## License

MIT
