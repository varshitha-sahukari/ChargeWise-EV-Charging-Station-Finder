-- Seed Data for ChargeWise India
USE chargewise_db;

-- 1. Insert Default Connector Types
INSERT INTO connector_types (name, description, max_power_kw) VALUES
('CCS2', 'Combined Charging System 2 (DC Fast Charging)', 150.0),
('Type 2', 'Mennekes AC Connector (Slow/Fast AC)', 22.0),
('CHAdeMO', 'Japanese DC Fast Charging plug', 50.0),
('AC001', 'Standard Indian AC Charger', 10.0),
('DC001', 'GB/T Standard Indian DC Fast Charger', 15.0);

-- 2. Insert Default Users (Passwords are encoded BCrypt: admin123, user123)
INSERT INTO users (email, password, username, role, email_verified, profile_picture, created_at, updated_at) VALUES
('admin@chargewise.in', '$2a$10$wE96F9D/l9uO.9t8/wU41us1k2g3271v2y345v678y90ab12cd3ef', 'admin', 'ROLE_ADMIN', TRUE, 'https://api.dicebear.com/7.x/bottts/svg?seed=admin', NOW(), NOW()),
('rajesh@gmail.com', '$2a$10$xU5pB12v43n5m6o7p8q9rus1k2g3271v2y345v678y90ab12cd3ef', 'Rajesh Kumar', 'ROLE_USER', TRUE, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rajesh', NOW(), NOW());

-- 3. Insert Default Vehicles
INSERT INTO vehicle (brand, model, battery_capacity, max_range, connector_type, user_id) VALUES
('Tata', 'Nexon EV Max', 40.5, 437.0, 'CCS2', 2),
('Tata', 'Tiago EV', 24.0, 250.0, 'CCS2', 2),
('Ather', '450X Gen 4', 3.7, 150.0, 'Type 2', 2);

-- 4. Insert Sample Charging Stations (Delhi, Mumbai, Bengaluru, Hyderabad hubs)
INSERT INTO stations (name, address, latitude, longitude, network, state, pin_code, base_pricing, status, average_rating, reviews_count, carbon_saved_kg) VALUES
('Tata Power Delhi Hub #1', '12, Connaught Place, New Delhi, Delhi, India', 28.6139, 77.2090, 'Tata Power EZ Charge', 'Delhi', '110001', 18.5, 'AVAILABLE', 4.5, 12, 120.5),
('Statiq Mumbai Mall Parking', 'Oberoi Mall, Goregaon East, Mumbai, Maharashtra, India', 19.1635, 72.8560, 'Statiq', 'Maharashtra', '400063', 17.0, 'AVAILABLE', 4.2, 8, 95.2),
('ChargeZone Bengaluru Tech Park', 'Gate 2, Manyata Tech Park, Bengaluru, Karnataka, India', 13.0451, 77.6266, 'ChargeZone', 'Karnataka', '560045', 16.5, 'BUSY', 4.7, 15, 230.1),
('Jio-bp Pulse Hyderabad Highway', 'Shell Fuel Pump, Gachibowli, Hyderabad, Telangana, India', 17.4483, 78.3741, 'Jio-bp Pulse', 'Telangana', '500032', 19.0, 'AVAILABLE', 4.4, 6, 85.0),
('Zeon Charging Pune Highway', 'Highway Food Plaza, Lonavala, Pune, Maharashtra, India', 18.7540, 73.4020, 'Zeon Charging', 'Maharashtra', '410401', 20.0, 'OFFLINE', 3.9, 4, 45.0);

-- 5. Insert Connectors for Stations
INSERT INTO station_connectors (station_id, connector_type_id, status, power_output_kw, pricing) VALUES
(1, 1, 'AVAILABLE', 150.0, 18.5), -- Station 1: CCS2 DC 150kW
(1, 2, 'AVAILABLE', 22.0, 15.0),  -- Station 1: Type 2 AC 22kW
(2, 1, 'AVAILABLE', 50.0, 17.0),  -- Station 2: CCS2 DC 50kW
(3, 1, 'BUSY', 120.0, 16.5),       -- Station 3: CCS2 DC 120kW
(3, 2, 'AVAILABLE', 22.0, 14.5),  -- Station 3: Type 2 AC 22kW
(4, 1, 'AVAILABLE', 60.0, 19.0),  -- Station 4: CCS2 DC 60kW
(5, 1, 'OFFLINE', 50.0, 20.0);     -- Station 5: CCS2 DC 50kW

-- 6. Insert Sample Reviews
INSERT INTO reviews (rating, comment, user_id, station_id, created_at) VALUES
(5, 'Excellent charging speed! Reached 80% SOC in less than 35 mins.', 2, 1, NOW() - INTERVAL 5 DAY),
(4, 'Very convenient spot, clean toilets and food stalls nearby.', 2, 2, NOW() - INTERVAL 3 DAY),
(5, 'Heavy rush during office hours, but charger worked flawlessly.', 2, 3, NOW() - INTERVAL 1 DAY);

-- 7. Insert Sample Charging History
INSERT INTO charging_history (user_id, station_id, vehicle_id, energy_consumed_kwh, total_cost, charging_duration_minutes, session_date) VALUES
(2, 1, 1, 35.4, 654.9, 42, NOW() - INTERVAL 5 DAY),
(2, 2, 1, 28.5, 484.5, 35, NOW() - INTERVAL 3 DAY),
(2, 3, 2, 18.0, 297.0, 25, NOW() - INTERVAL 1 DAY);
