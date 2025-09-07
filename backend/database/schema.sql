-- Store Rating Platform Database Schema
-- Drop database if exists and create fresh
DROP DATABASE IF EXISTS store_rating_db;
CREATE DATABASE store_rating_db;
USE store_rating_db;

-- Users table (handles all user types)
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(60) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    address TEXT,
    role ENUM('admin', 'normal_user', 'store_owner') NOT NULL DEFAULT 'normal_user',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Constraints for validation
    CONSTRAINT chk_name_length CHECK (CHAR_LENGTH(name) BETWEEN 20 AND 60),
    CONSTRAINT chk_address_length CHECK (address IS NULL OR CHAR_LENGTH(address) <= 400),
    
    -- Indexes for performance
    INDEX idx_users_email (email),
    INDEX idx_users_role (role),
    INDEX idx_users_active (is_active)
);

-- Stores table
CREATE TABLE stores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    address TEXT,
    owner_id INT NULL,
    average_rating DECIMAL(2,1) DEFAULT 0.0,
    total_ratings INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign key constraint
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL,
    
    -- Constraints
    CONSTRAINT chk_store_address_length CHECK (address IS NULL OR CHAR_LENGTH(address) <= 400),
    CONSTRAINT chk_average_rating CHECK (average_rating >= 0 AND average_rating <= 5),
    
    -- Indexes for performance
    INDEX idx_store_name (name),
    INDEX idx_store_address (address(100)),
    INDEX idx_store_owner (owner_id),
    INDEX idx_store_rating (average_rating),
    INDEX idx_store_active (is_active)
);

-- Ratings table
CREATE TABLE ratings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    store_id INT NOT NULL,
    rating INT NOT NULL,
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
    
    -- Ensure one rating per user per store
    UNIQUE KEY unique_user_store_rating (user_id, store_id),
    
    -- Constraints
    CONSTRAINT chk_rating_range CHECK (rating BETWEEN 1 AND 5),
    CONSTRAINT chk_comment_length CHECK (comment IS NULL OR CHAR_LENGTH(comment) <= 1000),
    
    -- Indexes for performance
    INDEX idx_rating_user (user_id),
    INDEX idx_rating_store (store_id),
    INDEX idx_rating_value (rating),
    INDEX idx_rating_created (created_at)
);

-- Create triggers to automatically update store average ratings
DELIMITER $$

-- Trigger for INSERT
CREATE TRIGGER tr_rating_insert 
AFTER INSERT ON ratings
FOR EACH ROW
BEGIN
    UPDATE stores 
    SET 
        average_rating = (
            SELECT ROUND(AVG(rating), 1) 
            FROM ratings 
            WHERE store_id = NEW.store_id
        ),
        total_ratings = (
            SELECT COUNT(*) 
            FROM ratings 
            WHERE store_id = NEW.store_id
        ),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.store_id;
END$$

-- Trigger for UPDATE
CREATE TRIGGER tr_rating_update 
AFTER UPDATE ON ratings
FOR EACH ROW
BEGIN
    UPDATE stores 
    SET 
        average_rating = (
            SELECT ROUND(AVG(rating), 1) 
            FROM ratings 
            WHERE store_id = NEW.store_id
        ),
        total_ratings = (
            SELECT COUNT(*) 
            FROM ratings 
            WHERE store_id = NEW.store_id
        ),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.store_id;
END$$

-- Trigger for DELETE
CREATE TRIGGER tr_rating_delete 
AFTER DELETE ON ratings
FOR EACH ROW
BEGIN
    UPDATE stores 
    SET 
        average_rating = COALESCE((
            SELECT ROUND(AVG(rating), 1) 
            FROM ratings 
            WHERE store_id = OLD.store_id
        ), 0.0),
        total_ratings = (
            SELECT COUNT(*) 
            FROM ratings 
            WHERE store_id = OLD.store_id
        ),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = OLD.store_id;
END$$

DELIMITER ;

-- Insert default system administrator
-- Note: Password is 'Admin@123' - should be changed in production
INSERT INTO users (name, email, password_hash, address, role) VALUES 
('System Administrator User', 'admin@storerating.com', '$2b$10$rOZ1zHXQPrXMZc4RQyN9sOK7FYoKnJc4XzR2f1qJ3e4Zk5P7v8A9B', '123 Admin Street, Admin City, AC 12345', 'admin');

-- Insert sample stores for testing
INSERT INTO stores (name, email, address) VALUES 
('Tech Electronics Store', 'contact@techelectronics.com', '456 Technology Avenue, Silicon Valley, CA 94000'),
('Fresh Grocery Market', 'info@freshgrocery.com', '789 Market Street, Downtown District, NY 10001'),
('Fashion Boutique Shop', 'hello@fashionboutique.com', '321 Fashion Lane, Beverly Hills, CA 90210'),
('Book Haven Library Store', 'books@bookhaven.com', '654 Literature Road, Academic Town, MA 02139'),
('Coffee Corner Cafe', 'coffee@coffeecorner.com', '987 Brew Street, Caffeine City, WA 98101');

-- Insert sample normal users for testing
-- Note: All passwords are 'User@123' - should be changed in production
INSERT INTO users (name, email, password_hash, address, role) VALUES 
('John Michael Smith Anderson', 'john.smith@email.com', '$2b$10$rOZ1zHXQPrXMZc4RQyN9sOK7FYoKnJc4XzR2f1qJ3e4Zk5P7v8A9B', '100 User Lane, User City, UC 11111', 'normal_user'),
('Sarah Elizabeth Johnson Williams', 'sarah.johnson@email.com', '$2b$10$rOZ1zHXQPrXMZc4RQyN9sOK7FYoKnJc4XzR2f1qJ3e4Zk5P7v8A9B', '200 Customer Street, Customer Town, CT 22222', 'normal_user'),
('Michael David Brown Wilson', 'michael.brown@email.com', '$2b$10$rOZ1zHXQPrXMZc4RQyN9sOK7FYoKnJc4XzR2f1qJ3e4Zk5P7v8A9B', '300 Reviewer Road, Review City, RC 33333', 'normal_user');

-- Insert sample store owners
INSERT INTO users (name, email, password_hash, address, role) VALUES 
('Robert James Tech Store Owner', 'robert.tech@techelectronics.com', '$2b$10$rOZ1zHXQPrXMZc4RQyN9sOK7FYoKnJc4XzR2f1qJ3e4Zk5P7v8A9B', '456 Technology Avenue, Silicon Valley, CA 94000', 'store_owner'),
('Emily Grace Grocery Owner Lady', 'emily.grace@freshgrocery.com', '$2b$10$rOZ1zHXQPrXMZc4RQyN9sOK7FYoKnJc4XzR2f1qJ3e4Zk5P7v8A9B', '789 Market Street, Downtown District, NY 10001', 'store_owner');

-- Update stores to link with owners
UPDATE stores SET owner_id = 4 WHERE id = 1; -- Tech store
UPDATE stores SET owner_id = 5 WHERE id = 2; -- Grocery store

-- Insert sample ratings
INSERT INTO ratings (user_id, store_id, rating, comment) VALUES 
(2, 1, 5, 'Excellent tech store with great customer service and competitive prices!'),
(2, 2, 4, 'Fresh products and clean environment. Good variety of items available.'),
(2, 3, 3, 'Average fashion store. Limited selection but decent quality clothes.'),
(3, 1, 4, 'Good tech store but slightly expensive. Staff is knowledgeable and helpful.'),
(3, 2, 5, 'Best grocery store in the area! Always fresh produce and friendly staff.'),
(3, 4, 4, 'Great book collection and cozy reading environment. Highly recommended!'),
(1, 1, 3, 'Decent store but could improve customer service response time.'),
(1, 5, 5, 'Amazing coffee and perfect atmosphere for work or casual meetings.');

-- Create a view for store statistics
CREATE VIEW store_stats AS
SELECT 
    s.id,
    s.name,
    s.email,
    s.address,
    s.average_rating,
    s.total_ratings,
    CONCAT(u.name) as owner_name,
    u.email as owner_email,
    s.is_active,
    s.created_at
FROM stores s
LEFT JOIN users u ON s.owner_id = u.id
WHERE s.is_active = TRUE;

-- Create a view for user statistics
CREATE VIEW user_stats AS
SELECT 
    u.id,
    u.name,
    u.email,
    u.address,
    u.role,
    COUNT(r.id) as total_ratings_given,
    AVG(r.rating) as average_rating_given,
    u.is_active,
    u.created_at
FROM users u
LEFT JOIN ratings r ON u.id = r.user_id
WHERE u.is_active = TRUE
GROUP BY u.id;

-- Create indexes for views
CREATE INDEX idx_store_stats ON stores(is_active, average_rating);
CREATE INDEX idx_user_stats ON users(is_active, role);

-- Show table structures
DESCRIBE users;
DESCRIBE stores;  
DESCRIBE ratings;