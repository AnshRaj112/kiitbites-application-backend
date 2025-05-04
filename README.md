# KIITBites Application  Backend

## Introduction
The **KIITBites Application Backend** is the core of the food ordering and inventory management system for KIIT University. It handles user authentication, order processing, inventory tracking, payment processing, and real-time updates. This backend is built using **Node.js with Express.js** and uses **MongoDB** and **Mongoose** as the database.

## Tech Stack
- **Backend Framework:** Node.js with Express.js
- **Database:** MongoDB (Mongoose ODM)
- **Authentication:** JWT (JSON Web Token)
- **Real-Time Communication:** Socket.io
- **Caching:** Redis (for session management and performance optimization)
- **Security:** Helmet, CORS, bcrypt.js

## Features
### User Management
- User authentication (JWT-based login and registration)
- Role-based access control (Users, Admins, Vendors)
- Google OAuth authentication

### Order Management
- Place, update, and cancel orders
- Real-time order status updates with WebSockets
- Order tracking for users
- Digital queue management for food pickup

### Inventory Management
- Food courts can manage stock levels in real-time
- Low-stock alerts and expiry tracking
- Offline mode support with data synchronization

### Payment Integration
- Supports multiple payment methods (UPI, Cards, Wallets)
- Secure transactions with order validation
- Payment failure handling with retry mechanism

### Notifications
- Email and push notifications for order updates
- WebSocket-based real-time alerts

## Environment Variables
Create a `.env` file in the root directory and configure the following variables:
```
PORT=5001
MONGO_URL=your_mongodb_uri
JWT_SECRET=your_secret_key
REDIS_URL=your_redis_url
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXT_PUBLIC_BACKEND_URL=your_backend_url
BACKEND_URL=your_backend_url
PAYMENT_GATEWAY_KEY=your_payment_gateway_key
```

## Installation & Setup
### Prerequisites
- Node.js and npm installed
- MongoDB set up and running

### Installation Steps
1. **Fork the repository** on GitHub.
2. **Clone the repository**:
   ```bash
   git clone https://github.com/your-repo/KIITBites-Backend.git
   cd KIITBites-Backend
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Create a new branch** following the naming convention:
   - For new features: `features/feature-name`
   - For bug fixes: `fixes/fix-name/feature-name`
   ```bash
   git checkout -b features/your-feature-name
   ```
5. **Start the backend server**:
   ```bash
   npm run dev
   ```
6. The backend server will start on `http://localhost:5001`

## API Endpoints
### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Orders
- `POST /api/orders` - Place an order
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id` - Update order status

### Inventory
- `GET /api/inventory` - Fetch available stock
- `POST /api/inventory` - Add new stock
- `PUT /api/inventory/:id` - Update stock quantity

### Payments
- `POST /api/payments/initiate` - Start a payment
- `GET /api/payments/status/:id` - Check payment status

## Contributing
1. Fork the repository.
2. Create a new branch (`git checkout -b features/feature-name` or `fixes/fix-name/feature-name`).
3. Commit your changes (`git commit -m 'Added new feature'`).
4. Push to your branch (`git push origin features/feature-name`).
5. Open a pull request.

## License
This project is licensed under the MIT License.

## Contact
For queries or contributions, contact the **KIITBites Backend Team** at [kiitbites@gmail.com](mailto:kiitbites@gmail.com).
