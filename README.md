# Ecommerce Platform

A complete ecommerce platform for managing products, customers, orders and online payments from one place. The project includes a customer storefront and a protected administration panel.

## Features

### Customer Storefront

- Homepage with featured catalog content
- Product browsing and product detail pages
- Category-based product organization
- Product variants, pricing and stock visibility
- Wishlist management
- Shopping cart with add, update, remove, clear and cart synchronization actions
- Coupon code validation and discount support
- Guest and authenticated checkout
- Saved customer addresses with default address selection
- Stripe payment intent, payment confirmation and webhook handling
- Order tracking by order number
- Downloadable order invoices
- Customer account profile and password management
- Registration, login, logout and password reset flows
- Newsletter subscription
- Contact form and informational pages

### Admin Panel

- Dashboard for store operations
- Product creation, editing, activation and deletion
- Product stock updates and inventory bulk updates
- Category management and activation controls
- Order list and order status management
- Payment status updates and shipment tracking details
- Customer list and customer detail views
- Sales reports and report export
- Coupon creation, editing, activation and deletion
- Store settings management
- Contact submission management
- Admin notification center with read, clear and delete actions
- Authenticated admin-only access

### Platform Services

- Transactional email support for welcome, product publication and order confirmation messages
- Product image upload and storage management
- Role-based access control for administrators
- Database-backed catalog, cart, order, review, coupon and customer data

## Tech Stack

- PHP 8.3+
- Laravel 13
- Inertia.js
- Vite
- MySQL or SQLite
- Stripe for payment processing

## Requirements

- PHP 8.3 or newer
- Composer
- Node.js and npm
- A configured database
- Stripe credentials for online payments

## Installation

1. Install PHP dependencies:

	```bash
	composer install
	```

2. Create the environment file and application key:

	```bash
	copy .env.example .env
	php artisan key:generate
	```

3. Configure the database, mail and Stripe values in `.env`, then run migrations:

	```bash
	php artisan migrate
	```

4. Install frontend dependencies and build the assets:

	```bash
	npm install
	npm run build
	```

5. Create the public storage link:

	```bash
	php artisan storage:link
	```

## Development

Run the application and Vite development server with:

```bash
composer run dev
```

The storefront is available at `/`. Administrators can access the panel at `/admin` after signing in with an administrator account.

To run the test suite:

```bash
composer test
```

## Configuration

At minimum, configure the following values in `.env`:

- Database connection settings
- Mail transport settings for transactional emails
- Stripe publishable and secret keys
- Stripe webhook signing secret

Keep payment and mail credentials private and do not commit `.env` to source control.

## License

This project is open-sourced under the MIT license.
