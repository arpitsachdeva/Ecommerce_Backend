# E-Commerce API Management

## Overview

This repository provides the backend API for an E-commerce platform, including essential features for user management, product handling, order processing, and more.

## Features

- **User Management**: Register users, log in, manage profiles, and addresses.
- **Product Management**: Create, update, delete, and view products.
- **Category & Brand Management**: Handle categories and brands.
- **Order Processing**: Manage orders and track shipments.
- **Cart & Wishlist**: Add items to carts and wishlists.
- **Coupon Management**: Create and manage discount coupons.
- **Reviews**: Enable users to review products.

## Database Schema

### Users
- **id**: Unique identifier
- **username**: User's username
- **email**: User's email address
- **password**: Hashed password
- **role**: User role (e.g., admin, user)
- **created_at**: Account creation timestamp
- **updated_at**: Last update timestamp

### UserProfiles
- **user_id**: Foreign key referencing Users.id
- **name**: Full name
- **secondary_email**: Secondary email
- **phone_number**: Phone number
- **is_active**: Profile status
- **oauth_provider**: OAuth provider (if applicable)
- **oauth_id**: OAuth identifier (if applicable)
- **created_at**: Profile creation timestamp
- **updated_at**: Last update timestamp

### UserAddresses
- **id**: Unique identifier
- **user_id**: Foreign key referencing Users.id
- **address_line1**: Primary address line
- **address_line2**: Secondary address line
- **city**: City
- **state**: State
- **postal_code**: Postal code
- **country**: Country
- **phone_number**: Phone number
- **is_primary**: Primary address indicator
- **created_at**: Address creation timestamp
- **updated_at**: Last update timestamp

### Products
- **id**: Unique identifier
- **title**: Product title
- **slug**: Unique product slug
- **short_description**: Brief description
- **description**: Detailed description
- **price**: Product price
- **category_id**: Foreign key referencing Categories.id
- **brand_id**: Foreign key referencing Brands.id
- **images**: JSON array of product images
- **image_gallery**: JSON array of additional images
- **meta_title**: SEO meta title
- **meta_description**: SEO meta description
- **meta_keywords**: SEO meta keywords
- **is_indexed**: Search indexing status
- **is_in_stock**: Stock status
- **is_featured**: Featured product indicator
- **status**: Product status (e.g., active, discontinued)
- **created_at**: Product creation timestamp
- **updated_at**: Last update timestamp

### Categories
- **id**: Unique identifier
- **title**: Category title
- **slug**: Unique category slug
- **parent_id**: Foreign key referencing parent category
- **level_images**: JSON array of level images
- **image_gallery**: JSON array of additional images
- **meta_title**: SEO meta title
- **meta_description**: SEO meta description
- **meta_keywords**: SEO meta keywords
- **is_indexed**: Search indexing status
- **status**: Category status
- **created_at**: Category creation timestamp
- **updated_at**: Last update timestamp

### Brands
- **id**: Unique identifier
- **title**: Brand title
- **slug**: Unique brand slug
- **short_description**: Brief description
- **description**: Detailed description
- **image_gallery**: JSON array of images
- **meta_title**: SEO meta title
- **meta_description**: SEO meta description
- **meta_keywords**: SEO meta keywords
- **is_indexed**: Search indexing status
- **status**: Brand status
- **created_at**: Brand creation timestamp
- **updated_at**: Last update timestamp

### Orders
- **id**: Unique identifier
- **user_id**: Foreign key referencing Users.id
- **address_id**: Foreign key referencing UserAddresses.id
- **order_status**: Status of the order
- **payment_method**: Payment method used
- **total_amount**: Total order amount
- **order_delivered_at**: Delivery timestamp
- **created_at**: Order creation timestamp
- **updated_at**: Last update timestamp

### OrderItems
- **id**: Unique identifier
- **order_id**: Foreign key referencing Orders.id
- **product_id**: Foreign key referencing Products.id
- **quantity**: Quantity ordered
- **price**: Product price at the time of order
- **created_at**: Item creation timestamp
- **updated_at**: Last update timestamp

### CartItems
- **id**: Unique identifier
- **user_id**: Foreign key referencing Users.id
- **product_id**: Foreign key referencing Products.id
- **quantity**: Quantity in cart
- **created_at**: Item creation timestamp
- **updated_at**: Last update timestamp

### WishListItems
- **id**: Unique identifier
- **user_id**: Foreign key referencing Users.id
- **product_id**: Foreign key referencing Products.id
- **created_at**: Item creation timestamp
- **updated_at**: Last update timestamp

### Coupons
- **id**: Unique identifier
- **code**: Unique coupon code
- **discount_percent**: Discount percentage
- **discount_amount**: Discount amount
- **valid_from**: Start date of validity
- **valid_to**: End date of validity
- **created_at**: Coupon creation timestamp
- **updated_at**: Last update timestamp

### UserCoupons
- **id**: Unique identifier
- **user_id**: Foreign key referencing Users.id
- **coupon_id**: Foreign key referencing Coupons.id
- **redeemed_at**: Redemption timestamp
- **created_at**: Record creation timestamp
- **updated_at**: Last update timestamp

### Shipments
- **id**: Unique identifier
- **order_id**: Foreign key referencing Orders.id
- **shipment_status**: Shipment status
- **tracking_number**: Tracking number
- **shipped_at**: Shipment date
- **delivered_at**: Delivery date
- **created_at**: Shipment creation timestamp
- **updated_at**: Last update timestamp

### Reviews
- **id**: Unique identifier
- **product_id**: Foreign key referencing Products.id
- **user_id**: Foreign key referencing Users.id
- **rating**: User rating
- **comment**: Review comment
- **created_at**: Review creation timestamp
- **updated_at**: Last update timestamp

## Installation

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/yourusername/your-repository.git
   cd your-repository
2. Install Dependencies:
