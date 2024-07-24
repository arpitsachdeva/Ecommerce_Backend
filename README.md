# E-commerce API Management

## Overview

This repository provides the backend API for managing an E-commerce platform. It includes user management, product management, order processing, and more functionalities.

## Features

- **User Management**: Register users, login, and manage user profiles and addresses.
- **Product Management**: Create, update, delete, and view products and their details.
- **Category & Brand Management**: Manage product categories and brands.
- **Order Processing**: Create and manage orders, including items and shipment tracking.
- **Cart & Wishlist**: Add items to the cart and wishlist.
- **Coupon Management**: Create and manage discount coupons.
- **Reviews**: Allow users to leave reviews for products.

## Database Schema

### Users
- `id`: Unique identifier
- `username`: Username of the user
- `email`: Email of the user
- `password`: User password (hashed)
- `role`: User role (e.g., admin, user)
- `created_at`: Timestamp of account creation
- `updated_at`: Timestamp of last update

### UserProfiles
- `user_id`: Foreign key referencing `Users.id`
- `name`: Full name of the user
- `secondary_email`: Secondary email
- `phone_number`: Phone number
- `is_active`: Status of the profile
- `oauth_provider`: OAuth provider (if any)
- `oauth_id`: OAuth identifier (if any)
- `created_at`: Timestamp of profile creation
- `updated_at`: Timestamp of last update

### UserAddresses
- `id`: Unique identifier
- `user_id`: Foreign key referencing `Users.id`
- `address_line1`: Primary address line
- `address_line2`: Secondary address line
- `city`: City
- `state`: State
- `postal_code`: Postal code
- `country`: Country
- `phone_number`: Phone number
- `is_primary`: Whether this is the primary address
- `created_at`: Timestamp of address creation
- `updated_at`: Timestamp of last update

### Products
- `id`: Unique identifier
- `title`: Product title
- `slug`: Unique slug for the product
- `short_description`: Short description
- `description`: Detailed description
- `price`: Price of the product
- `category_id`: Foreign key referencing `Categories.id`
- `brand_id`: Foreign key referencing `Brands.id`
- `images`: JSON array of product images
- `image_gallery`: JSON array of additional images
- `meta_title`: Meta title for SEO
- `meta_description`: Meta description for SEO
- `meta_keywords`: Meta keywords for SEO
- `is_indexed`: Whether the product is indexed for search
- `is_in_stock`: Stock status
- `is_featured`: Whether the product is featured
- `status`: Product status (e.g., active, discontinued)
- `created_at`: Timestamp of product creation
- `updated_at`: Timestamp of last update

### Categories
- `id`: Unique identifier
- `title`: Category title
- `slug`: Unique slug for the category
- `parent_id`: Foreign key referencing parent category
- `level_images`: JSON array of level images
- `image_gallery`: JSON array of additional images
- `meta_title`: Meta title for SEO
- `meta_description`: Meta description for SEO
- `meta_keywords`: Meta keywords for SEO
- `is_indexed`: Whether the category is indexed for search
- `status`: Category status
- `created_at`: Timestamp of category creation
- `updated_at`: Timestamp of last update

### Brands
- `id`: Unique identifier
- `title`: Brand title
- `slug`: Unique slug for the brand
- `short_description`: Short description
- `description`: Detailed description
- `image_gallery`: JSON array of images
- `meta_title`: Meta title for SEO
- `meta_description`: Meta description for SEO
- `meta_keywords`: Meta keywords for SEO
- `is_indexed`: Whether the brand is indexed for search
- `status`: Brand status
- `created_at`: Timestamp of brand creation
- `updated_at`: Timestamp of last update

### Orders
- `id`: Unique identifier
- `user_id`: Foreign key referencing `Users.id`
- `address_id`: Foreign key referencing `UserAddresses.id`
- `order_status`: Status of the order
- `payment_method`: Payment method used
- `total_amount`: Total amount of the order
- `order_delivered_at`: Timestamp when the order was delivered
- `created_at`: Timestamp of order creation
- `updated_at`: Timestamp of last update

### OrderItems
- `id`: Unique identifier
- `order_id`: Foreign key referencing `Orders.id`
- `product_id`: Foreign key referencing `Products.id`
- `quantity`: Quantity of the product
- `price`: Price of the product at the time of the order
- `created_at`: Timestamp of item creation
- `updated_at`: Timestamp of last update

### CartItems
- `id`: Unique identifier
- `user_id`: Foreign key referencing `Users.id`
- `product_id`: Foreign key referencing `Products.id`
- `quantity`: Quantity of the product
- `created_at`: Timestamp of item creation
- `updated_at`: Timestamp of last update

### WishListItems
- `id`: Unique identifier
- `user_id`: Foreign key referencing `Users.id`
- `product_id`: Foreign key referencing `Products.id`
- `created_at`: Timestamp of item creation
- `updated_at`: Timestamp of last update

### Coupons
- `id`: Unique identifier
- `code`: Unique coupon code
- `discount_percent`: Discount percentage
- `discount_amount`: Discount amount
- `valid_from`: Start date of validity
- `valid_to`: End date of validity
- `created_at`: Timestamp of coupon creation
- `updated_at`: Timestamp of last update

### UserCoupons
- `id`: Unique identifier
- `user_id`: Foreign key referencing `Users.id`
- `coupon_id`: Foreign key referencing `Coupons.id`
- `redeemed_at`: Timestamp when the coupon was redeemed
- `created_at`: Timestamp of record creation
- `updated_at`: Timestamp of last update

### Shipments
- `id`: Unique identifier
- `order_id`: Foreign key referencing `Orders.id`
- `shipment_status`: Status of the shipment
- `tracking_number`: Tracking number
- `shipped_at`: Timestamp when the shipment was sent
- `delivered_at`: Timestamp when the shipment was delivered
- `created_at`: Timestamp of shipment creation
- `updated_at`: Timestamp of last update

### Reviews
- `id`: Unique identifier
- `product_id`: Foreign key referencing `Products.id`
- `user_id`: Foreign key referencing `Users.id`
- `rating`: Rating given by the user
- `comment`: Review comment
- `created_at`: Timestamp of review creation
- `updated_at`: Timestamp of last update

## Installation

1. **Clone the Repository**

   git clone <repository-url>

2. **Navigate to the Project Directory**

   cd <project-directory>

3. **Install Dependencies**

   npm install

4. **Set Up Environment Variables**

   Create a `.env` file in the root directory and add the following variables:

   JWT_SECRET=<your-jwt-secret>
   MONGO_URI=<your-mongodb-uri>

5. **Start the Application**

   npm start

## API Endpoints

### User Management

- **POST /api/users** - Create a new user.
- **GET /api/users** - Get a list of users (Admin/Staff only).
- **GET /api/users/:id** - Get user by ID.
- **PUT /api/users/:id** - Update user information.
- **DELETE /api/users/:id** - Delete a user.
- **POST /api/users/login** - User login.
- **POST /api/users/logout** - User logout.

### Product Management

- **POST /api/products** - Create a new product.
- **GET /api/products** - Get a list of products.
- **GET /api/products/:id** - Get product by ID.
- **PUT /api/products/:id** - Update product information.
- **DELETE /api/products/:id** - Delete a product.

### Category & Brand Management

- **POST /api/categories** - Create a new category.
- **GET /api/categories** - Get a list of categories.
- **GET /api/categories/:id** - Get category by ID.
- **PUT /api/categories/:id** - Update category information.
- **DELETE /api/categories/:id** - Delete a category.

- **POST /api/brands** - Create a new brand.
- **GET /api/brands** - Get a list of brands.
- **GET /api/brands/:id** - Get brand by ID.
- **PUT /api/brands/:id** - Update brand information.
- **DELETE /api/brands/:id** - Delete a brand.

### Order Processing

- **POST /api/orders** - Create a new order.
- **GET /api/orders** - Get a list of orders.
- **GET /api/orders/:id** - Get order by ID.
- **PUT /api/orders/:id** - Update order status.
- **DELETE /api/orders/:id** - Delete an order.

### Cart & Wishlist

- **POST /api/cart-items** - Add an item

 to the cart.
- **GET /api/cart-items** - Get a list of cart items.
- **DELETE /api/cart-items/:id** - Remove an item from the cart.

- **POST /api/wishlist-items** - Add an item to the wishlist.
- **GET /api/wishlist-items** - Get a list of wishlist items.
- **DELETE /api/wishlist-items/:id** - Remove an item from the wishlist.

### Coupons

- **POST /api/coupons** - Create a new coupon.
- **GET /api/coupons** - Get a list of coupons.
- **GET /api/coupons/:id** - Get coupon by ID.
- **PUT /api/coupons/:id** - Update coupon information.
- **DELETE /api/coupons/:id** - Delete a coupon.

### Shipments

- **POST /api/shipments** - Create a new shipment.
- **GET /api/shipments** - Get a list of shipments.
- **GET /api/shipments/:id** - Get shipment by ID.
- **PUT /api/shipments/:id** - Update shipment status.
- **DELETE /api/shipments/:id** - Delete a shipment.

### Reviews

- **POST /api/reviews** - Create a new review.
- **GET /api/reviews** - Get a list of reviews.
- **GET /api/reviews/:id** - Get review by ID.
- **PUT /api/reviews/:id** - Update review.
- **DELETE /api/reviews/:id** - Delete a review.

## Pagination

- **GET /api/users** and **GET /api/products** support pagination via query parameters:
  - `page` (default: 1)
  - `limit` (default: 10)

## Token Validation

- JWT tokens are required for authenticated routes.
- Use the `Authorization` header with the token for secured endpoints.
- Tokens are validated for expiration and validity.

## Contributing

Contributions are welcome! Please fork the repository and create a pull request with your changes.

