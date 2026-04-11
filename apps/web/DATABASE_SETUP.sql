-- Hisah Tech Database Schema
-- Run this on your Neon PostgreSQL database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    country VARCHAR(100),
    whatsapp_number VARCHAR(50),
    profile_image VARCHAR(500),
    bio TEXT,
    is_admin BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- SESSIONS TABLE
CREATE TABLE IF NOT EXISTS sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- BIOS FILES TABLE
CREATE TABLE IF NOT EXISTS bios_files (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    manufacturer VARCHAR(100),
    model VARCHAR(255),
    chipset VARCHAR(100),
    file_path VARCHAR(500),
    file_size BIGINT,
    version VARCHAR(50),
    download_count INTEGER DEFAULT 0,
    is_premium BOOLEAN DEFAULT FALSE,
    price DECIMAL(10,2) DEFAULT 0,
    uploaded_by INTEGER REFERENCES users(id),
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- SCHEMATICS TABLE
CREATE TABLE IF NOT EXISTS schematics (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    manufacturer VARCHAR(100),
    model VARCHAR(255),
    board_number VARCHAR(100),
    file_path VARCHAR(500),
    file_size BIGINT,
    file_type VARCHAR(20),
    download_count INTEGER DEFAULT 0,
    is_premium BOOLEAN DEFAULT FALSE,
    price DECIMAL(10,2) DEFAULT 0,
    uploaded_by INTEGER REFERENCES users(id),
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- REPAIR GUIDES TABLE
CREATE TABLE IF NOT EXISTS repair_guides (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(100),
    tags VARCHAR(255),
    difficulty VARCHAR(50),
    estimated_time VARCHAR(50),
    views INTEGER DEFAULT 0,
    is_premium BOOLEAN DEFAULT FALSE,
    price DECIMAL(10,2) DEFAULT 0,
    author INTEGER REFERENCES users(id),
    status VARCHAR(50) DEFAULT 'published',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- FILES TABLE (General downloads)
CREATE TABLE IF NOT EXISTS files (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    file_path VARCHAR(500),
    file_size BIGINT,
    file_type VARCHAR(50),
    version VARCHAR(50),
    download_count INTEGER DEFAULT 0,
    rating_total INTEGER DEFAULT 0,
    rating_count INTEGER DEFAULT 0,
    is_premium BOOLEAN DEFAULT FALSE,
    price DECIMAL(10,2) DEFAULT 0,
    uploaded_by INTEGER REFERENCES users(id),
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- FILE RATINGS
CREATE TABLE IF NOT EXISTS file_ratings (
    id SERIAL PRIMARY KEY,
    file_id INTEGER REFERENCES files(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP DEFAULT NOW()
);

-- FILE COMMENTS
CREATE TABLE IF NOT EXISTS file_comments (
    id SERIAL PRIMARY KEY,
    file_id INTEGER REFERENCES files(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id),
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- MESSAGES TABLE
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    sender_id INTEGER REFERENCES users(id),
    receiver_id INTEGER REFERENCES users(id),
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- CONVERSATIONS TABLE
CREATE TABLE IF NOT EXISTS conversations (
    id SERIAL PRIMARY KEY,
    participant1 INTEGER REFERENCES users(id),
    participant2 INTEGER REFERENCES users(id),
    last_message_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

-- BLOG POSTS
CREATE TABLE IF NOT EXISTS blog_posts (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE,
    content TEXT NOT NULL,
    excerpt TEXT,
    cover_image VARCHAR(500),
    author INTEGER REFERENCES users(id),
    status VARCHAR(50) DEFAULT 'draft',
    views INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    payment_method VARCHAR(50),
    status VARCHAR(50) DEFAULT 'pending',
    transaction_id VARCHAR(255),
    item_type VARCHAR(50),
    item_id INTEGER,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- FIRMWARE TABLE
CREATE TABLE IF NOT EXISTS firmware (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    device_type VARCHAR(100),
    brand VARCHAR(100),
    model VARCHAR(255),
    version VARCHAR(50),
    file_path VARCHAR(500),
    file_size BIGINT,
    download_count INTEGER DEFAULT 0,
    is_premium BOOLEAN DEFAULT FALSE,
    price DECIMAL(10,2) DEFAULT 0,
    uploaded_by INTEGER REFERENCES users(id),
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_files_uploaded_by ON files(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_bios_files_manufacturer ON bios_files(manufacturer);
CREATE INDEX IF NOT EXISTS idx_schematics_manufacturer ON schematics(manufacturer);

-- Insert a test admin user (password: admin123)
INSERT INTO users (email, username, password_hash, name, country, is_admin)
VALUES ('admin@hisahtech.com', 'admin', 'admin123', 'Admin User', 'United States', TRUE)
ON CONFLICT (email) DO NOTHING;

-- Insert sample categories
INSERT INTO bios_files (title, description, manufacturer, model, status)
VALUES 
    ('Sample BIOS - Dell', 'Sample entry for testing', 'Dell', 'Inspiron 15', 'published'),
    ('Sample BIOS - HP', 'Sample entry for testing', 'HP', 'Pavilion', 'published'),
    ('Sample BIOS - Lenovo', 'Sample entry for testing', 'Lenovo', 'ThinkPad', 'published')
ON CONFLICT DO NOTHING;

INSERT INTO schematics (title, description, manufacturer, model, status)
VALUES 
    ('Sample Schematic - Samsung', 'Sample entry for testing', 'Samsung', 'TV Model', 'published'),
    ('Sample Schematic - LG', 'Sample entry for testing', 'LG', 'Monitor', 'published')
ON CONFLICT DO NOTHING;

INSERT INTO repair_guides (title, content, category, difficulty, status)
VALUES 
    ('Getting Started with Electronics Repair', 'Welcome to Hisah Tech! This guide will help you get started with electronics repair.', 'Beginner', 'Easy', 'published'),
    ('How to Use a Multimeter', 'Learn how to properly use a multimeter for troubleshooting.', 'Tools', 'Easy', 'published'),
    ('Soldering Basics', 'Master the art of soldering electronic components.', 'Skills', 'Medium', 'published')
ON CONFLICT DO NOTHING;

INSERT INTO blog_posts (title, slug, content, author, status)
VALUES 
    ('Welcome to Hisah Tech', 'welcome-to-hisahtech', 'Welcome to Hisah Tech - your ultimate resource for electronics repair and technical knowledge.', 1, 'published'),
    ('Top 10 Repair Tools Every Technician Needs', 'top-10-repair-tools', 'Discover the essential tools that every electronics repair technician should have in their toolkit.', 1, 'published')
ON CONFLICT DO NOTHING;

SELECT 'Database schema created successfully!' as status;