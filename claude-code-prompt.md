# TradeHub - Claude Code Prompt

Copy this entire prompt into Claude Code:

---

Build "TradeHub" - a P2P marketplace where users buy and sell products, with admin dispute management.

## Tech Stack
- **Frontend**: Next.js 14 (App Router) + ShadCN UI + Tailwind + React Hook Form + Zod
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: JWT in HTTP-only cookies + Bcrypt
- **Email**: Resend
- **Uploads**: UploadThing

## Folder Structure
```
/apps
  /web          # Next.js frontend
  /api          # Express backend
/packages
  /database     # Prisma schema
  /shared       # Types
```

## Database Models
User (id, email, passwordHash, name, avatar, role[USER/ADMIN], emailVerified, verifyToken, resetToken, suspended)
Product (id, title, description, price, images[], category, condition[NEW/LIKE_NEW/GOOD/FAIR], quantity, active, sellerId)
Order (id, orderNumber, status[PENDING/PROCESSING/SHIPPED/DELIVERED/CANCELLED], totalAmount, shippingAddress, buyerId, sellerId)
OrderItem (id, quantity, price, orderId, productId)
Dispute (id, reason, status[OPEN/UNDER_REVIEW/RESOLVED_BUYER_FAVOR/RESOLVED_SELLER_FAVOR/CLOSED], resolution, orderId, openedById)
DisputeMessage (id, content, disputeId, authorId)
Review (id, rating 1-5, comment, productId, authorId)

## API Endpoints

### Auth
POST /api/auth/register - Create account, send verification email
POST /api/auth/login - Login, return JWT cookie
POST /api/auth/logout - Clear cookie
POST /api/auth/verify-email - Verify with token
POST /api/auth/forgot-password - Send reset email
POST /api/auth/reset-password - Reset with token
GET /api/auth/me - Current user

### Products
GET /api/products - List (paginated, filterable by category/price/condition)
GET /api/products/:id - Single product
POST /api/products - Create (auth required)
PUT /api/products/:id - Update (owner only)
DELETE /api/products/:id - Delete (owner or admin)
GET /api/products/my-listings - User's products

### Orders
POST /api/orders - Create order
GET /api/orders - User's purchases
GET /api/orders/sales - User's sales
GET /api/orders/:id - Single order
PATCH /api/orders/:id/status - Update status (seller)

### Disputes
POST /api/disputes - Open dispute (buyer)
GET /api/disputes - User's disputes
GET /api/disputes/:id - Single with messages
POST /api/disputes/:id/messages - Add message
PATCH /api/disputes/:id/resolve - Resolve (admin)

### Admin
GET /api/admin/users - All users
PATCH /api/admin/users/:id - Suspend user
GET /api/admin/stats - Analytics
GET /api/admin/disputes - All disputes
DELETE /api/admin/products/:id - Remove product

## Pages
/ - Landing with featured products
/products - Browse with filters
/products/[id] - Detail page
/cart - Shopping cart
/checkout - Checkout flow
/auth/login, /auth/register, /auth/verify-email, /auth/forgot-password, /auth/reset-password
/dashboard - User home
/dashboard/orders - Purchases
/dashboard/sales - Sales
/dashboard/products - My listings
/dashboard/products/new - Create listing
/dashboard/disputes - My disputes
/admin - Admin home
/admin/users, /admin/products, /admin/orders, /admin/disputes

## UI Design
- Clean, minimal, lots of whitespace
- Colors: Neutral grays + purple accent (#7C3AED)
- Font: Inter
- Use ShadCN: Button, Card, Input, Dialog, Table, Tabs, Badge, Avatar, DropdownMenu, Toast, Skeleton
- Loading: Skeleton for lists, Spinner for buttons
- Forms: Labels above inputs, inline error messages in red, disabled state while submitting
- Cards: White bg, subtle border, rounded-xl, hover shadow for interactive
- Dark mode support

## Required Features
1. Email verification before full access
2. Password reset via email
3. Bcrypt password hashing (cost 12)
4. Rate limiting on auth (5/15min)
5. Two roles: USER (buy+sell) and ADMIN (manage)
6. Pagination on all list endpoints
7. Form validation (Zod client+server)
8. Loading states everywhere
9. Error toasts + inline errors
10. Winston/Pino logging

## API Response Format
```json
{ "success": boolean, "data": any, "error": string | null, "message": string }
```

Status codes: 200 OK, 201 Created, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 429 Rate Limited, 500 Error

## Security
- HTTP-only, secure, sameSite cookies for JWT
- Rate limiting with express-rate-limit
- Input sanitization
- Proper CORS
- Env vars for secrets

## Build Order
1. Setup monorepo with pnpm workspaces
2. Prisma schema + migrations
3. Auth system (register, verify, login, reset)
4. Product CRUD + image uploads
5. Cart (localStorage) + checkout + orders
6. Disputes system
7. Admin dashboard
8. Polish (loading, errors, responsive)

Start now. Create the project structure first, then implement auth, then work through the features in order.
