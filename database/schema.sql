-- Database Schema for ChargeWise India
CREATE DATABASE IF NOT EXISTS chargewise_db;
USE chargewise_db;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    username VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'ROLE_USER',
    profile_picture VARCHAR(255),
    reset_token VARCHAR(255),
    email_verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(255),
    refresh_token VARCHAR(500),
    created_at DATETIME,
    updated_at DATETIME
);

-- 2. Vehicle Table
CREATE TABLE IF NOT EXISTS vehicle (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    battery_capacity DOUBLE NOT NULL, -- in kWh
    max_range DOUBLE NOT NULL,        -- in km
    connector_type VARCHAR(50) NOT NULL,
    user_id BIGINT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Stations Table
CREATE TABLE IF NOT EXISTS stations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(1000) NOT NULL,
    latitude DOUBLE NOT NULL,
    longitude DOUBLE NOT NULL,
    network VARCHAR(100) NOT NULL, -- Tata Power, Statiq, etc.
    state VARCHAR(100) NOT NULL,
    pin_code VARCHAR(20) NOT NULL,
    operating_hours VARCHAR(100) DEFAULT '24 Hours',
    contact_details VARCHAR(100),
    base_pricing DOUBLE DEFAULT 15.0, -- INR per kWh
    status VARCHAR(50) DEFAULT 'AVAILABLE', -- AVAILABLE, BUSY, OFFLINE
    average_rating DOUBLE DEFAULT 0.0,
    reviews_count INT DEFAULT 0,
    carbon_saved_kg DOUBLE DEFAULT 0.0
);

-- 4. Station Images Table
CREATE TABLE IF NOT EXISTS station_images (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    image_url VARCHAR(1000) NOT NULL,
    station_id BIGINT NOT NULL,
    FOREIGN KEY (station_id) REFERENCES stations(id) ON DELETE CASCADE
);

-- 5. Connector Types Table
CREATE TABLE IF NOT EXISTS connector_types (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL, -- CCS2, Type 2, etc.
    description VARCHAR(255),
    max_power_kw DOUBLE NOT NULL
);

-- 6. Station Connectors mapping table
CREATE TABLE IF NOT EXISTS station_connectors (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    station_id BIGINT NOT NULL,
    connector_type_id BIGINT NOT NULL,
    status VARCHAR(50) DEFAULT 'AVAILABLE',
    power_output_kw DOUBLE NOT NULL,
    pricing DOUBLE NOT NULL,
    FOREIGN KEY (station_id) REFERENCES stations(id) ON DELETE CASCADE,
    FOREIGN KEY (connector_type_id) REFERENCES connector_types(id) ON DELETE RESTRICT
);

-- 7. Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    rating INT NOT NULL,
    comment VARCHAR(1000) NOT NULL,
    user_id BIGINT NOT NULL,
    station_id BIGINT NOT NULL,
    created_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (station_id) REFERENCES stations(id) ON DELETE CASCADE
);

-- 8. Favorites Table
CREATE TABLE IF NOT EXISTS favorites (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    station_id BIGINT NOT NULL,
    UNIQUE KEY unique_user_station (user_id, station_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (station_id) REFERENCES stations(id) ON DELETE CASCADE
);

-- 9. Charging History Table
CREATE TABLE IF NOT EXISTS charging_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    station_id BIGINT NOT NULL,
    vehicle_id BIGINT,
    energy_consumed_kwh DOUBLE NOT NULL,
    total_cost DOUBLE NOT NULL,
    charging_duration_minutes INT NOT NULL,
    session_date DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (station_id) REFERENCES stations(id) ON DELETE CASCADE,
    FOREIGN KEY (vehicle_id) REFERENCES vehicle(id) ON DELETE SET NULL
);

-- 10. Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    station_id BIGINT NOT NULL,
    vehicle_id BIGINT,
    booking_time DATETIME,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, ACTIVE, COMPLETED, CANCELLED
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (station_id) REFERENCES stations(id) ON DELETE CASCADE,
    FOREIGN KEY (vehicle_id) REFERENCES vehicle(id) ON DELETE SET NULL
);

-- 11. Reports Table
CREATE TABLE IF NOT EXISTS reports (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    station_id BIGINT NOT NULL,
    issue_description VARCHAR(1000) NOT NULL,
    status VARCHAR(55) DEFAULT 'PENDING', -- PENDING, RESOLVED
    reported_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (station_id) REFERENCES stations(id) ON DELETE CASCADE
);

-- 12. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message VARCHAR(1000) NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
