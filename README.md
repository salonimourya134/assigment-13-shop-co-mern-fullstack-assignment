# SHOP.CO MERN E-Commerce

## Stack

- React.js
- SCSS
- React Router
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcryptjs
- Axios
- EmailJS REST API

## Features
### Customer

- Home
- Categories
- Product listing
- Backend search with 400ms debounce
- Category, price, availability, size and dress-style filters
- Backend sorting and pagination
- Product details
- Size-wise inventory validation
- Cart add, update, remove and clear
- Coupon codes
- Multiple saved addresses
- Default address
- Browser current-location support
- Reverse geocoding
- Delivery estimate
- Checkout
- COD, Card and UPI demo selection
- Orders and order details
- Profile
- Saved addresses
- Wishlist

### Authentication

- Signup
- Login
- Logout
- JWT authentication
- Password hashing
- Protected customer routes
- Protected admin routes
- Customer/admin roles
- Invalid or expired authentication is cleared on 401 responses

### Admin

- Dashboard statistics
- Product CRUD
- Category CRUD
- Category deletion protection when products exist
- Order listing
- Order status update
- User listing
- Low-stock indication

## Inventory

Product size quantities are the inventory source of truth. Product `quantity` is derived from all size quantities and `status` is derived from total quantity.
Low stock is defined as total quantity greater than zero and less than or equal to 5.
Cart and checkout validate stock on the backend. Checkout uses conditional database updates so a quantity cannot be decremented below available stock.

## Coupon Codes

- SAVE10: 10%
- SAVE20: 20%
- SAVE30: 30%

Coupon discounts are calculated again on the backend during checkout. Frontend totals are never trusted for order creation.

## Checkout Flow

1. Validate authentication.
2. Validate shipping address.
3. Load the authenticated user's cart.
4. Load every product from MongoDB.
5. Validate size and requested stock.
6. Calculate subtotal from database prices.
7. Calculate coupon discount.
8. Calculate delivery fee.
9. Decrease inventory conditionally.
10. Create the order with purchase-time prices.
11. Restore inventory if order creation fails.
12. Clear the cart after successful order creation.

## Environment

Create `Backend/.env` from `Backend/.env.example`.

```env
PORT=5000
MONGO_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173
```

Create `Frontend/.env` from `Frontend/.env.example`.

```env
VITE_API_URL=http://localhost:5000
VITE_EMAILJS_SERVICE_ID=your_emailjs_service_id
VITE_EMAILJS_TEMPLATE_ID=your_emailjs_template_id
VITE_EMAILJS_PUBLIC_KEY=your_emailjs_public_key
```

Never commit `.env` files or real secrets.

## EmailJS Newsletter

The newsletter sends the subscriber email through the EmailJS HTTP API from the frontend.

Configure these values in `Frontend/.env`:

- `VITE_EMAILJS_SERVICE_ID`
- `VITE_EMAILJS_TEMPLATE_ID`
- `VITE_EMAILJS_PUBLIC_KEY`

The EmailJS template should accept either `email` or `subscriber_email` as the subscriber variable.
## Backend Setup

```bash
cd Backend
npm install
npm run dev
```

Health endpoint:

```text
http://localhost:5000/api/health
```

Seed sample data when required:

```bash
npm run data:import
```

## Frontend Setup

```bash
cd Frontend
npm install
npm run dev
```

## API Routes

- `/api/auth`
- `/api/users`
- `/api/categories`
- `/api/products`
- `/api/cart`
- `/api/orders`
- `/api/reviews`
- `/api/location`
- `/api/admin`
- `/api/upload`

## Performance

- Product cards use React.memo where useful.
- Derived product/category data uses useMemo where useful.
- API handlers use useCallback where function references benefit child components or effects.
- Customer and admin pages use React.lazy and route-level code splitting.
- Product search uses a 400ms debounce.
- Product filtering and pagination are handled by the backend/database.
- Product and order images use persisted purchase-time image selection where applicable.

## Core Web Vitals

Measure LCP, CLS and INP with Chrome Lighthouse or Chrome DevTools before submission. Check the production build rather than only the development server. Optimize image dimensions, loading behavior, unnecessary renders, API request frequency and layout stability based on the measured result.

## SCSS

Custom styling is organized across component and page SCSS files. Shared variables and reusable functions/mixins are kept under `Frontend/src/styles`.

Native element selectors were replaced with reusable classes while preserving the existing visual declarations. The existing Figma-based visual styling remains the source of truth.

## Security

- Passwords are hashed before storage.
- JWT authentication is checked by backend middleware.
- Admin APIs require the admin role.
- Customer order queries are restricted to the authenticated customer.
- User role cannot be changed through normal profile updates.
- Frontend environment files are ignored by Git.
- Backend secrets must remain outside the repository.
