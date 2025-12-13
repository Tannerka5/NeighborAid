-- ============================================
-- USERS
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'household'
);

-- ============================================
-- HOUSEHOLDS (1 per user)
-- ============================================
CREATE TABLE IF NOT EXISTS households (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    address VARCHAR(255),
    neighborhood_code VARCHAR(50),
    latitude NUMERIC(9,6),
    longitude NUMERIC(9,6),
    phone_number VARCHAR(50),
    readiness_level VARCHAR(10),
    notes TEXT,
    CONSTRAINT households_user_unique UNIQUE (user_id)
);

-- ============================================
-- RESOURCE TYPES (water, generator, etc.)
-- ============================================
CREATE TABLE IF NOT EXISTS resource_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,   -- 'supplies', 'equipment', 'skills', 'space'
    description TEXT,
    CONSTRAINT resource_types_name_unique UNIQUE (name)
);

-- ============================================
-- RESOURCES OWNED BY HOUSEHOLDS
-- ============================================
CREATE TABLE IF NOT EXISTS resources (
    id SERIAL PRIMARY KEY,
    household_id INTEGER NOT NULL REFERENCES households(id) ON DELETE CASCADE,
    resource_type_id INTEGER NOT NULL REFERENCES resource_types(id),
    quantity INTEGER NOT NULL,
    description TEXT,
    is_available BOOLEAN DEFAULT TRUE
);

-- ============================================
-- DEMO DATA
-- ============================================

-- Demo user
INSERT INTO users (first_name, last_name, email, password_hash, role)
VALUES ('Demo', 'User', 'demo@example.com', 'test', 'household')
ON CONFLICT (email) DO NOTHING;

-- Demo household (1 per user)
INSERT INTO households (user_id, address, latitude, longitude, phone_number, readiness_level, notes)
VALUES (
    (SELECT id FROM users WHERE email = 'demo@example.com'),
    '123 Oak Street',
    40.250000,
    -111.650000,
    '555-123-4567',
    'medium',
    'Initial demo household.'
)
ON CONFLICT (user_id) DO NOTHING;

-- Resource types
INSERT INTO resource_types (name, category, description) VALUES
    ('Water storage (gallons)', 'supplies', 'Stored water in barrels or containers'),
    ('Gas generator', 'equipment', 'Fuel-powered backup generator'),
    ('Solar generator', 'equipment', 'Battery + solar panel system'),
    ('First aid kit', 'supplies', 'Basic first aid supplies'),
    ('Guest sleeping space', 'space', 'Space for evacuees to sleep')
ON CONFLICT (name) DO NOTHING;