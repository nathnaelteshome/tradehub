# 🛒 TradeHub - P2P Marketplace Platform

## Project Overview

Build a modern peer-to-peer marketplace where sellers list products, buyers browse and purchase, and admins manage the platform and resolve disputes. Think of it as a simplified Etsy/eBay clone with clean, minimal aesthetics.

---

## 📋 Core Requirements Checklist

> These are mandatory for the job application task

| Requirement                        | Implementation                        |
| ---------------------------------- | ------------------------------------- |
| ✅ Authentication                  | Email/password signup & login         |
| ✅ Email verification              | Verify email before full access       |
| ✅ Password reset                  | Forgot password flow with email       |
| ✅ Password hashing                | Bcrypt or Argon2                      |
| ✅ Rate limiting                   | On auth endpoints & API               |
| ✅ Proper API status codes         | RESTful responses with messages       |
| ✅ Two roles with different access | Buyer/Seller + Admin                  |
| ✅ Pagination                      | Product listings, orders, disputes    |
| ✅ Form validation                 | Client + server side                  |
| ✅ Error states                    | Toast notifications, inline errors    |
| ✅ Loading states                  | Skeletons, spinners, disabled buttons |
| ✅ Logging                         | Winston/Pino for backend logs         |

---

## 🛠 Tech Stack

### Frontend

- **Framework**: Next.js 14+ (App Router)
- **UI**: ShadCN UI + Tailwind CSS
- **Forms**: React Hook Form + Zod validation
- **State**: Zustand or React Query
- **Icons**: Lucide React

### Backend

- **Runtime**: Node.js
- **Framework**: Express.js or Hono
- **Database**: PostgreSQL with Prisma ORM
- **Auth**: JWT + HTTP-only cookies
- **Email**: Resend or Nodemailer
- **File Upload**: Cloudinary or UploadThing
- **Logging**: Winston or Pino

---

## 👥 User Roles & Permissions

### 1. Buyer/Seller (Default User)

Users can both buy AND sell (like eBay). After email verification:

**As Seller:**

- Create/edit/delete own product listings
- View orders for their products
- Update order status (processing → shipped → delivered)
- Respond to disputes on their products

**As Buyer:**

- Browse all products
- Add to cart, checkout
- View order history
- Open disputes on orders
- Leave reviews after purchase

### 2. Admin

- Full dashboard access
- View all users, products, orders
- Suspend/ban users
- Remove product listings
- Manage disputes (view both sides, make decisions)
- View platform analytics

---

## 📦 Feature Breakdown

### Authentication Module

```
├── POST /api/auth/register     → Create account (sends verification email)
├── POST /api/auth/login        → Login (returns JWT in HTTP-only cookie)
├── POST /api/auth/logout       → Clear cookie
├── POST /api/auth/verify-email → Verify with token from email
├── POST /api/auth/forgot-password → Send reset email
├── POST /api/auth/reset-password  → Reset with token
└── GET  /api/auth/me           → Get current user
```

### Products Module

```
├── GET    /api/products              → List all (paginated, filterable)
├── GET    /api/products/:id          → Single product
├── POST   /api/products              → Create (seller only)
├── PUT    /api/products/:id          → Update (owner only)
├── DELETE /api/products/:id          → Delete (owner or admin)
└── GET    /api/products/my-listings  → Seller's own products
```

### Orders Module

```
├── POST   /api/orders                → Create order (buyer)
├── GET    /api/orders                → User's orders (as buyer)
├── GET    /api/orders/sales          → User's sales (as seller)
├── GET    /api/orders/:id            → Single order
├── PATCH  /api/orders/:id/status     → Update status (seller)
└── GET    /api/admin/orders          → All orders (admin)
```

### Disputes Module

```
├── POST   /api/disputes              → Open dispute (buyer)
├── GET    /api/disputes              → User's disputes
├── GET    /api/disputes/:id          → Single dispute with messages
├── POST   /api/disputes/:id/messages → Add message to dispute
├── PATCH  /api/disputes/:id/resolve  → Resolve dispute (admin)
└── GET    /api/admin/disputes        → All disputes (admin)
```

### Admin Module

```
├── GET    /api/admin/users           → All users (paginated)
├── PATCH  /api/admin/users/:id       → Suspend/unsuspend user
├── GET    /api/admin/stats           → Platform analytics
└── DELETE /api/admin/products/:id    → Remove any product
```

---

## 🗄 Database Schema (Prisma)

```prisma
model User {
  id                String    @id @default(cuid())
  email             String    @unique
  passwordHash      String
  name              String
  avatar            String?
  role              Role      @default(USER)
  emailVerified     Boolean   @default(false)
  verifyToken       String?
  resetToken        String?
  resetTokenExpiry  DateTime?
  suspended         Boolean   @default(false)
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  products          Product[]
  orders            Order[]   @relation("BuyerOrders")
  sales             Order[]   @relation("SellerOrders")
  disputes          Dispute[] @relation("DisputeOpener")
  disputeMessages   DisputeMessage[]
  reviews           Review[]
}

enum Role {
  USER
  ADMIN
}

model Product {
  id          String   @id @default(cuid())
  title       String
  description String
  price       Decimal  @db.Decimal(10, 2)
  images      String[] // Array of image URLs
  category    String
  condition   Condition
  quantity    Int      @default(1)
  active      Boolean  @default(true)
  sellerId    String
  seller      User     @relation(fields: [sellerId], references: [id])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  orderItems  OrderItem[]
  reviews     Review[]
}

enum Condition {
  NEW
  LIKE_NEW
  GOOD
  FAIR
}

model Order {
  id            String      @id @default(cuid())
  orderNumber   String      @unique @default(cuid())
  status        OrderStatus @default(PENDING)
  totalAmount   Decimal     @db.Decimal(10, 2)
  shippingAddress Json
  buyerId       String
  buyer         User        @relation("BuyerOrders", fields: [buyerId], references: [id])
  sellerId      String
  seller        User        @relation("SellerOrders", fields: [sellerId], references: [id])
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt

  items         OrderItem[]
  dispute       Dispute?
}

enum OrderStatus {
  PENDING
  PROCESSING
  SHIPPED
  DELIVERED
  CANCELLED
}

model OrderItem {
  id        String  @id @default(cuid())
  quantity  Int
  price     Decimal @db.Decimal(10, 2)
  orderId   String
  order     Order   @relation(fields: [orderId], references: [id])
  productId String
  product   Product @relation(fields: [productId], references: [id])
}

model Dispute {
  id          String        @id @default(cuid())
  reason      String
  status      DisputeStatus @default(OPEN)
  resolution  String?
  orderId     String        @unique
  order       Order         @relation(fields: [orderId], references: [id])
  openedById  String
  openedBy    User          @relation("DisputeOpener", fields: [openedById], references: [id])
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt

  messages    DisputeMessage[]
}

enum DisputeStatus {
  OPEN
  UNDER_REVIEW
  RESOLVED_BUYER_FAVOR
  RESOLVED_SELLER_FAVOR
  CLOSED
}

model DisputeMessage {
  id         String   @id @default(cuid())
  content    String
  disputeId  String
  dispute    Dispute  @relation(fields: [disputeId], references: [id])
  authorId   String
  author     User     @relation(fields: [authorId], references: [id])
  createdAt  DateTime @default(now())
}

model Review {
  id        String   @id @default(cuid())
  rating    Int      // 1-5
  comment   String?
  productId String
  product   Product  @relation(fields: [productId], references: [id])
  authorId  String
  author    User     @relation(fields: [authorId], references: [id])
  createdAt DateTime @default(now())

  @@unique([productId, authorId]) // One review per product per user
}
```

---

## 🎨 UI/UX Design System

### Design Principles

- **Minimal & Clean**: Lots of whitespace, no clutter
- **Neutral Palette**: Grayscale with one accent color
- **Consistent Spacing**: 4px base unit (4, 8, 12, 16, 24, 32, 48)
- **Subtle Shadows**: Light depth, not heavy drop shadows
- **Smooth Transitions**: 150-200ms ease-out animations

### Color Palette

```css
/* Light Mode */
--background: 0 0% 100%         /* #FFFFFF */
--foreground: 0 0% 9%           /* #171717 */
--muted: 0 0% 96%               /* #F5F5F5 */
--muted-foreground: 0 0% 45%    /* #737373 */
--border: 0 0% 90%              /* #E5E5E5 */
--accent: 262 83% 58%           /* #7C3AED - Purple accent */
--destructive: 0 84% 60%        /* #EF4444 - Red for errors */
--success: 142 76% 36%          /* #16A34A - Green for success */

/* Dark Mode (optional but recommended) */
--background: 0 0% 9%           /* #171717 */
--foreground: 0 0% 98%          /* #FAFAFA */
--muted: 0 0% 15%               /* #262626 */
--border: 0 0% 20%              /* #333333 */
```

### Typography

```css
/* Font: Inter (clean, modern, highly readable) */
--font-sans: "Inter", system-ui, sans-serif;

/* Scale */
--text-xs: 0.75rem; /* 12px - labels, captions */
--text-sm: 0.875rem; /* 14px - secondary text */
--text-base: 1rem; /* 16px - body text */
--text-lg: 1.125rem; /* 18px - emphasized body */
--text-xl: 1.25rem; /* 20px - small headings */
--text-2xl: 1.5rem; /* 24px - section headings */
--text-3xl: 1.875rem; /* 30px - page titles */
```

### Component Styling Guidelines

**Buttons**

- Primary: Filled accent color, white text
- Secondary: Ghost/outline style
- Destructive: Red for delete actions
- All buttons: `rounded-lg` (8px), subtle hover state

**Cards**

- White background, 1px border, `rounded-xl` (12px)
- Subtle shadow on hover for interactive cards
- Consistent padding: 16px or 24px

**Forms**

- Labels above inputs, muted color
- Inputs: Clean border, focus ring with accent color
- Error messages: Red text below input, icon optional
- Success: Green checkmark or border

**Tables**

- Clean horizontal lines only (no vertical)
- Hover state on rows
- Sticky header on scroll

**Modals/Dialogs**

- Centered, backdrop blur
- Max-width 500px for forms, wider for content
- Close button top-right

---

## 📱 Page Structure

```
/                           → Landing page (product grid)
/products                   → Browse products with filters
/products/[id]              → Product detail page
/cart                       → Shopping cart
/checkout                   → Checkout flow

/auth/login                 → Login page
/auth/register              → Signup page
/auth/verify-email          → Email verification
/auth/forgot-password       → Request password reset
/auth/reset-password        → Reset password form

/dashboard                  → User dashboard (redirect based on context)
/dashboard/orders           → Orders as buyer
/dashboard/sales            → Orders as seller
/dashboard/products         → Manage listings (seller)
/dashboard/products/new     → Create new listing
/dashboard/products/[id]    → Edit listing
/dashboard/disputes         → User's disputes
/dashboard/settings         → Account settings

/admin                      → Admin dashboard
/admin/users                → Manage users
/admin/products             → All products
/admin/orders               → All orders
/admin/disputes             → Manage disputes
```

---

## 🔐 Security Checklist

- [ ] Password hashing with Bcrypt (cost factor 12) or Argon2
- [ ] JWT stored in HTTP-only, secure, sameSite cookies
- [ ] Rate limiting: 5 attempts/15min on auth routes
- [ ] Input sanitization on all user inputs
- [ ] CORS configured properly
- [ ] Environment variables for secrets
- [ ] SQL injection prevention (Prisma handles this)
- [ ] XSS prevention (React handles most, sanitize HTML if needed)
- [ ] CSRF protection if using cookies

---

## 📧 Email Templates Needed

1. **Email Verification** - "Verify your TradeHub account"
2. **Password Reset** - "Reset your password"
3. **Order Confirmation** - "Your order #123 is confirmed"
4. **Order Shipped** - "Your order is on its way"
5. **New Sale** - "You made a sale!"
6. **Dispute Opened** - "A dispute has been opened"
7. **Dispute Resolved** - "Your dispute has been resolved"

---

## 🚀 Deployment

- **Frontend**: Vercel (automatic with Next.js)
- **Backend**: Railway, Render, or Fly.io
- **Database**: Neon (serverless Postgres) or Railway Postgres
- **File Storage**: Cloudinary (free tier) or UploadThing
- **Email**: Resend (free tier: 100 emails/day)

---

# Claude Code Prompt

Copy everything below this line and use it as your prompt in Claude Code:

---

```
Build TradeHub - a P2P marketplace fullstack application.

## Tech Stack
- Frontend: Next.js 14+ (App Router) + ShadCN UI + Tailwind CSS
- Backend: Express.js with TypeScript
- Database: PostgreSQL with Prisma ORM
- Auth: JWT in HTTP-only cookies
- Email: Resend
- File uploads: UploadThing or Cloudinary

## Project Structure
Create a monorepo with:
/apps/web - Next.js frontend
/apps/api - Express backend
/packages/database - Prisma schema and client
/packages/shared - Shared types and utilities

## Core Features

### Authentication (REQUIRED)
- Email/password registration with email verification
- Login with JWT stored in HTTP-only cookies
- Password reset flow with email
- Hash passwords with Bcrypt (cost 12)
- Rate limit auth endpoints (5 attempts/15 min)

### User Roles
1. USER (default) - Can buy and sell products
2. ADMIN - Full platform management

### Products
- CRUD for product listings (seller)
- Image upload (multiple images)
- Categories, conditions (New/Like New/Good/Fair)
- Pagination and filtering
- Search functionality

### Orders
- Shopping cart with local storage
- Checkout flow
- Order status: Pending → Processing → Shipped → Delivered
- Seller can update order status
- Order history for buyers and sellers

### Disputes
- Buyer can open dispute on orders
- Message thread between buyer, seller, admin
- Admin resolves disputes

### Admin Dashboard
- User management (view, suspend)
- Product oversight (remove listings)
- Order overview
- Dispute management and resolution
- Basic analytics (total users, products, orders)

## UI Requirements
- Clean, minimal aesthetic with lots of whitespace
- Use ShadCN UI components throughout
- Color scheme: Neutral grays + purple accent (#7C3AED)
- Dark mode support
- Loading states: Skeleton loaders for lists, spinners for actions
- Form validation with inline error messages
- Toast notifications for success/error feedback
- Responsive design (mobile-first)

## API Response Format
All API responses should follow:
{
  "success": boolean,
  "data": any | null,
  "error": string | null,
  "message": string
}

Use appropriate HTTP status codes:
- 200: Success
- 201: Created
- 400: Bad Request (validation errors)
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 429: Too Many Requests
- 500: Internal Server Error

## Database
Use the Prisma schema I provided with these models:
User, Product, Order, OrderItem, Dispute, DisputeMessage, Review

## Security
- Bcrypt for password hashing
- HTTP-only cookies for JWT
- Rate limiting on auth routes
- Input validation with Zod
- CORS configuration
- Environment variables for secrets

## Logging
Use Winston or Pino for structured logging:
- Log all API requests
- Log errors with stack traces
- Log auth events (login, logout, failed attempts)

Start by setting up the project structure, then implement authentication, then products, then orders, then disputes, then admin features. Focus on clean code and good UX.
```

---

## Development Order

1. **Project Setup** - Monorepo, dependencies, env files
2. **Database** - Prisma schema, migrations
3. **Auth** - Register, login, verify, reset
4. **Products** - CRUD, images, listing page
5. **Cart & Orders** - Cart, checkout, order management
6. **Disputes** - Open, message, resolve
7. **Admin** - Dashboard, user management, disputes
8. **Polish** - Loading states, error handling, responsive
9. **Deploy** - Vercel + Railway + Neon
