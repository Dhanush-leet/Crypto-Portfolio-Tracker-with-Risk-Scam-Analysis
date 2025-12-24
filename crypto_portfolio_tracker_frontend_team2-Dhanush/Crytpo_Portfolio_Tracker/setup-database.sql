-- PostgreSQL Database Setup for Crypto Portfolio Tracker
-- Run this script as a PostgreSQL superuser (e.g., postgres)

-- Create database
CREATE DATABASE crypto_portfolio;

-- Create user
CREATE USER crypto_portfolio WITH PASSWORD 'crypto_portfolio';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE crypto_portfolio TO crypto_portfolio;

-- Connect to the database
\c crypto_portfolio;

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO crypto_portfolio;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO crypto_portfolio;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO crypto_portfolio;

-- Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO crypto_portfolio;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO crypto_portfolio;

-- Verify setup
SELECT 'Database setup completed successfully!' as status;