-- City Club Hospitality Management System
-- Initial Database Schema
-- Supabase PostgreSQL

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For fuzzy text search

-- =====================================================
-- ENUMS
-- =====================================================

-- User roles
CREATE TYPE user_role AS ENUM (
  'admin',
  'manager',
  'server',
  'host',
  'kitchen',
  'readonly'
);

-- Order status
CREATE TYPE order_status AS ENUM (
  'draft',
  'submitted',
  'incoming',
  'fired',
  'complete',
  'cancelled',
  'scheduled'
);

-- Payment status
CREATE TYPE payment_status AS ENUM (
  'pending',
  'paid',
  'refunded',
  'partial'
);

-- Reservation status
CREATE TYPE reservation_status AS ENUM (
  'confirmed',
  'seated',
  'completed',
  'cancelled',
  'no_show'
);

-- Table status
CREATE TYPE table_status AS ENUM (
  'available',
  'occupied',
  'reserved',
  'blocked'
);

-- Modifier requirement type
CREATE TYPE modifier_requirement AS ENUM (
  'required',
  'optional'
);

-- Routing destination
CREATE TYPE routing_destination AS ENUM (
  'kitchen',
  'bar',
  'both'
);

-- =====================================================
-- PROFILES (Users)
-- =====================================================

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  role user_role NOT NULL DEFAULT 'server',
  pin_code TEXT, -- 4-digit PIN for quick login
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for quick lookups
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_pin ON profiles(pin_code) WHERE pin_code IS NOT NULL;

-- =====================================================
-- MEMBERS
-- =====================================================

CREATE TABLE members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_number TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  avatar_url TEXT,
  notes TEXT,
  -- Discount settings
  default_discount_percent INTEGER DEFAULT 0 CHECK (default_discount_percent >= 0 AND default_discount_percent <= 100),
  -- Preferences
  dietary_restrictions TEXT[],
  favorite_items UUID[], -- References to products
  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_members_name ON members USING gin ((first_name || ' ' || last_name) gin_trgm_ops);
CREATE INDEX idx_members_number ON members(member_number);

-- =====================================================
-- LOCATIONS / TABLE LAYOUTS
-- =====================================================

CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL, -- e.g., "Dining Room", "Patio", "Bar"
  code TEXT NOT NULL UNIQUE, -- e.g., "D", "O", "B"
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE tables (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  table_number TEXT NOT NULL, -- e.g., "D1", "O3", "TT"
  display_name TEXT, -- Optional friendly name
  capacity INTEGER NOT NULL DEFAULT 4,
  -- Floor plan position
  position_x FLOAT NOT NULL DEFAULT 0,
  position_y FLOAT NOT NULL DEFAULT 0,
  rotation INTEGER NOT NULL DEFAULT 0, -- Degrees
  shape TEXT NOT NULL DEFAULT 'round', -- round, square, rectangle
  width FLOAT DEFAULT 1,
  height FLOAT DEFAULT 1,
  -- Status
  status table_status NOT NULL DEFAULT 'available',
  current_server_id UUID REFERENCES profiles(id),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(location_id, table_number)
);

-- Indexes
CREATE INDEX idx_tables_location ON tables(location_id);
CREATE INDEX idx_tables_status ON tables(status);

-- =====================================================
-- PRODUCT CATEGORIES
-- =====================================================

CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE, -- e.g., "snacks", "starters", "mains"
  description TEXT,
  color TEXT NOT NULL DEFAULT '#6366F1', -- Hex color for UI
  icon TEXT, -- Icon name from Lucide
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- PRODUCTS
-- =====================================================

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  -- Display options
  image_url TEXT,
  -- Inventory
  track_inventory BOOLEAN NOT NULL DEFAULT false,
  available_count INTEGER, -- NULL means unlimited
  low_stock_threshold INTEGER DEFAULT 5,
  -- Kitchen display
  routing routing_destination NOT NULL DEFAULT 'kitchen',
  prep_time_minutes INTEGER, -- Estimated prep time
  -- Dietary/Allergen info
  allergens TEXT[], -- Array of allergen codes
  dietary_tags TEXT[], -- vegetarian, vegan, gluten-free, etc.
  -- Availability
  is_daily_special BOOLEAN NOT NULL DEFAULT false,
  available_start_time TIME, -- For items only available certain hours
  available_end_time TIME,
  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_visible_mobile BOOLEAN NOT NULL DEFAULT true, -- Show in mobile app
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_name ON products USING gin (name gin_trgm_ops);
CREATE INDEX idx_products_active ON products(is_active) WHERE is_active = true;

-- =====================================================
-- MODIFIERS
-- =====================================================

CREATE TABLE modifiers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL, -- e.g., "Cook Temperature", "Milk Choice"
  description TEXT,
  requirement modifier_requirement NOT NULL DEFAULT 'optional',
  min_selections INTEGER NOT NULL DEFAULT 0,
  max_selections INTEGER, -- NULL means unlimited
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE modifier_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  modifier_id UUID NOT NULL REFERENCES modifiers(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- e.g., "Rare", "Medium Rare", "Well Done"
  price_adjustment DECIMAL(10,2) NOT NULL DEFAULT 0, -- Additional cost
  is_default BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Link products to modifiers
CREATE TABLE product_modifiers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  modifier_id UUID NOT NULL REFERENCES modifiers(id) ON DELETE CASCADE,
  is_required BOOLEAN NOT NULL DEFAULT false, -- Override modifier default
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(product_id, modifier_id)
);

-- Indexes
CREATE INDEX idx_modifier_options_modifier ON modifier_options(modifier_id);
CREATE INDEX idx_product_modifiers_product ON product_modifiers(product_id);

-- =====================================================
-- ORDERS
-- =====================================================

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number SERIAL, -- Auto-increment order number for the day
  -- Customer info
  member_id UUID REFERENCES members(id),
  is_non_member BOOLEAN NOT NULL DEFAULT false,
  guest_name TEXT, -- For non-members
  guest_count INTEGER NOT NULL DEFAULT 1,
  -- Location
  table_id UUID REFERENCES tables(id),
  seat_assignments JSONB, -- { "1": "item_id", "2": "item_id" }
  -- Server
  server_id UUID NOT NULL REFERENCES profiles(id),
  -- Status
  status order_status NOT NULL DEFAULT 'draft',
  -- Timing
  scheduled_time TIMESTAMPTZ, -- For scheduled orders
  submitted_at TIMESTAMPTZ,
  fired_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  -- Pricing
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
  discount_percent INTEGER DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL DEFAULT 0,
  -- Payment
  payment_status payment_status NOT NULL DEFAULT 'pending',
  -- Notes
  notes TEXT, -- General order notes
  kitchen_notes TEXT, -- Notes for kitchen
  -- Metadata
  source TEXT DEFAULT 'pos', -- pos, mobile, web
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Order line items
CREATE TABLE order_line_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  -- Details
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  -- Modifiers selected
  modifiers JSONB, -- Array of { modifier_id, option_id, name, price }
  modifier_total DECIMAL(10,2) DEFAULT 0,
  -- Notes
  notes TEXT, -- Special instructions for this item
  allergen_notes TEXT, -- Customer allergen warnings
  -- Seat assignment
  seat_number INTEGER,
  -- Course
  course_number INTEGER DEFAULT 1,
  -- Status
  status order_status NOT NULL DEFAULT 'draft',
  fired_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  -- Pricing
  line_total DECIMAL(10,2) NOT NULL,
  discount_percent INTEGER DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  -- Routing
  routing routing_destination,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_table ON orders(table_id);
CREATE INDEX idx_orders_server ON orders(server_id);
CREATE INDEX idx_orders_member ON orders(member_id);
CREATE INDEX idx_orders_created ON orders(created_at DESC);
CREATE INDEX idx_order_items_order ON order_line_items(order_id);
CREATE INDEX idx_order_items_status ON order_line_items(status);

-- =====================================================
-- RESERVATIONS
-- =====================================================

CREATE TABLE reservations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  -- Guest info
  member_id UUID REFERENCES members(id),
  guest_name TEXT NOT NULL, -- Required even for members
  guest_email TEXT,
  guest_phone TEXT,
  party_size INTEGER NOT NULL DEFAULT 2,
  -- Timing
  reservation_date DATE NOT NULL,
  reservation_time TIME NOT NULL,
  duration_minutes INTEGER DEFAULT 90,
  -- Table assignment
  table_id UUID REFERENCES tables(id),
  location_preference UUID REFERENCES locations(id),
  -- Server
  assigned_server_id UUID REFERENCES profiles(id),
  -- Status
  status reservation_status NOT NULL DEFAULT 'confirmed',
  -- Details
  notes TEXT,
  special_occasion TEXT, -- birthday, anniversary, etc.
  dietary_requirements TEXT[],
  -- Menu preferences
  menu_type TEXT, -- all-day, lunch, dinner, social-lunch
  -- Confirmation
  confirmation_sent BOOLEAN DEFAULT false,
  reminder_sent BOOLEAN DEFAULT false,
  -- Created by
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_reservations_date ON reservations(reservation_date);
CREATE INDEX idx_reservations_table ON reservations(table_id);
CREATE INDEX idx_reservations_member ON reservations(member_id);
CREATE INDEX idx_reservations_status ON reservations(status);

-- =====================================================
-- APP SETTINGS
-- =====================================================

CREATE TABLE app_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  module TEXT NOT NULL, -- stats, sale, rsvp, display, tables, filter, log, admin
  key TEXT NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(module, key)
);

-- =====================================================
-- AUDIT LOG
-- =====================================================

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL, -- create, update, delete, login, etc.
  table_name TEXT,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for querying recent actions
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_table ON audit_logs(table_name);

-- =====================================================
-- NOTICES (Banner messages for Sale screen)
-- =====================================================

CREATE TABLE notices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info', -- info, warning, error
  is_active BOOLEAN NOT NULL DEFAULT true,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  show_on_modules TEXT[] DEFAULT ARRAY['sale'], -- Which modules to show on
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to all tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_members_updated_at BEFORE UPDATE ON members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_locations_updated_at BEFORE UPDATE ON locations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tables_updated_at BEFORE UPDATE ON tables
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_modifiers_updated_at BEFORE UPDATE ON modifiers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_modifier_options_updated_at BEFORE UPDATE ON modifier_options
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_order_items_updated_at BEFORE UPDATE ON order_line_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reservations_updated_at BEFORE UPDATE ON reservations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_app_settings_updated_at BEFORE UPDATE ON app_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notices_updated_at BEFORE UPDATE ON notices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate order totals
CREATE OR REPLACE FUNCTION calculate_order_totals(order_uuid UUID)
RETURNS void AS $$
DECLARE
  v_subtotal DECIMAL(10,2);
  v_tax_rate DECIMAL(5,4) := 0.0875; -- 8.75% tax rate (configurable)
BEGIN
  -- Calculate subtotal from line items
  SELECT COALESCE(SUM(line_total - discount_amount), 0)
  INTO v_subtotal
  FROM order_line_items
  WHERE order_id = order_uuid;

  -- Update order totals
  UPDATE orders
  SET
    subtotal = v_subtotal,
    tax_amount = v_subtotal * v_tax_rate,
    total = v_subtotal + (v_subtotal * v_tax_rate) - discount_amount
  WHERE id = order_uuid;
END;
$$ LANGUAGE plpgsql;

-- Function to handle product count decrement
CREATE OR REPLACE FUNCTION decrement_product_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'submitted' AND OLD.status = 'draft' THEN
    UPDATE products
    SET available_count = available_count - NEW.quantity
    WHERE id = NEW.product_id
      AND track_inventory = true
      AND available_count IS NOT NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER decrement_product_on_submit
  AFTER UPDATE ON order_line_items
  FOR EACH ROW
  EXECUTE FUNCTION decrement_product_count();
