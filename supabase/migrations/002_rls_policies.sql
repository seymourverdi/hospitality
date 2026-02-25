-- City Club Hospitality Management System
-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE modifiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE modifier_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_modifiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Get current user's role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role AS $$
BEGIN
  RETURN (
    SELECT role FROM profiles WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user has specific role or higher
CREATE OR REPLACE FUNCTION has_role(required_role user_role)
RETURNS BOOLEAN AS $$
DECLARE
  current_role user_role;
BEGIN
  SELECT role INTO current_role FROM profiles WHERE id = auth.uid();

  -- Role hierarchy: admin > manager > server/host/kitchen > readonly
  CASE required_role
    WHEN 'readonly' THEN
      RETURN current_role IS NOT NULL;
    WHEN 'server', 'host', 'kitchen' THEN
      RETURN current_role IN ('admin', 'manager', 'server', 'host', 'kitchen');
    WHEN 'manager' THEN
      RETURN current_role IN ('admin', 'manager');
    WHEN 'admin' THEN
      RETURN current_role = 'admin';
    ELSE
      RETURN false;
  END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- PROFILES POLICIES
-- =====================================================

-- Users can read all profiles (needed for seeing server names, etc.)
CREATE POLICY "profiles_select_all"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

-- Users can update their own profile
CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Only admins can insert new profiles
CREATE POLICY "profiles_insert_admin"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (has_role('admin'));

-- Only admins can delete profiles
CREATE POLICY "profiles_delete_admin"
  ON profiles FOR DELETE
  TO authenticated
  USING (has_role('admin'));

-- =====================================================
-- MEMBERS POLICIES
-- =====================================================

-- All authenticated users can view members
CREATE POLICY "members_select_all"
  ON members FOR SELECT
  TO authenticated
  USING (true);

-- Server+ can insert members
CREATE POLICY "members_insert"
  ON members FOR INSERT
  TO authenticated
  WITH CHECK (has_role('server'));

-- Server+ can update members
CREATE POLICY "members_update"
  ON members FOR UPDATE
  TO authenticated
  USING (has_role('server'));

-- Only managers+ can delete members
CREATE POLICY "members_delete"
  ON members FOR DELETE
  TO authenticated
  USING (has_role('manager'));

-- =====================================================
-- LOCATIONS & TABLES POLICIES
-- =====================================================

-- All authenticated users can view locations and tables
CREATE POLICY "locations_select_all"
  ON locations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "tables_select_all"
  ON tables FOR SELECT
  TO authenticated
  USING (true);

-- Only managers+ can modify locations
CREATE POLICY "locations_insert_manager"
  ON locations FOR INSERT
  TO authenticated
  WITH CHECK (has_role('manager'));

CREATE POLICY "locations_update_manager"
  ON locations FOR UPDATE
  TO authenticated
  USING (has_role('manager'));

CREATE POLICY "locations_delete_admin"
  ON locations FOR DELETE
  TO authenticated
  USING (has_role('admin'));

-- Host+ can update table status; Manager+ can modify table config
CREATE POLICY "tables_insert_manager"
  ON tables FOR INSERT
  TO authenticated
  WITH CHECK (has_role('manager'));

CREATE POLICY "tables_update_host"
  ON tables FOR UPDATE
  TO authenticated
  USING (has_role('host'));

CREATE POLICY "tables_delete_admin"
  ON tables FOR DELETE
  TO authenticated
  USING (has_role('admin'));

-- =====================================================
-- PRODUCTS & CATEGORIES POLICIES
-- =====================================================

-- All authenticated users can view categories and products
CREATE POLICY "categories_select_all"
  ON categories FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "products_select_all"
  ON products FOR SELECT
  TO authenticated
  USING (true);

-- Only managers+ can modify categories and products
CREATE POLICY "categories_insert_manager"
  ON categories FOR INSERT
  TO authenticated
  WITH CHECK (has_role('manager'));

CREATE POLICY "categories_update_manager"
  ON categories FOR UPDATE
  TO authenticated
  USING (has_role('manager'));

CREATE POLICY "categories_delete_admin"
  ON categories FOR DELETE
  TO authenticated
  USING (has_role('admin'));

CREATE POLICY "products_insert_manager"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (has_role('manager'));

CREATE POLICY "products_update_manager"
  ON products FOR UPDATE
  TO authenticated
  USING (has_role('manager'));

CREATE POLICY "products_delete_admin"
  ON products FOR DELETE
  TO authenticated
  USING (has_role('admin'));

-- =====================================================
-- MODIFIERS POLICIES
-- =====================================================

-- All authenticated users can view modifiers
CREATE POLICY "modifiers_select_all"
  ON modifiers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "modifier_options_select_all"
  ON modifier_options FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "product_modifiers_select_all"
  ON product_modifiers FOR SELECT
  TO authenticated
  USING (true);

-- Only managers+ can modify modifiers
CREATE POLICY "modifiers_insert_manager"
  ON modifiers FOR INSERT
  TO authenticated
  WITH CHECK (has_role('manager'));

CREATE POLICY "modifiers_update_manager"
  ON modifiers FOR UPDATE
  TO authenticated
  USING (has_role('manager'));

CREATE POLICY "modifiers_delete_admin"
  ON modifiers FOR DELETE
  TO authenticated
  USING (has_role('admin'));

CREATE POLICY "modifier_options_insert_manager"
  ON modifier_options FOR INSERT
  TO authenticated
  WITH CHECK (has_role('manager'));

CREATE POLICY "modifier_options_update_manager"
  ON modifier_options FOR UPDATE
  TO authenticated
  USING (has_role('manager'));

CREATE POLICY "modifier_options_delete_admin"
  ON modifier_options FOR DELETE
  TO authenticated
  USING (has_role('admin'));

CREATE POLICY "product_modifiers_insert_manager"
  ON product_modifiers FOR INSERT
  TO authenticated
  WITH CHECK (has_role('manager'));

CREATE POLICY "product_modifiers_update_manager"
  ON product_modifiers FOR UPDATE
  TO authenticated
  USING (has_role('manager'));

CREATE POLICY "product_modifiers_delete_admin"
  ON product_modifiers FOR DELETE
  TO authenticated
  USING (has_role('admin'));

-- =====================================================
-- ORDERS POLICIES
-- =====================================================

-- Server+ can view all orders
CREATE POLICY "orders_select_server"
  ON orders FOR SELECT
  TO authenticated
  USING (has_role('server'));

-- Server+ can create orders
CREATE POLICY "orders_insert_server"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (has_role('server'));

-- Server+ can update their own orders; Manager+ can update any
CREATE POLICY "orders_update"
  ON orders FOR UPDATE
  TO authenticated
  USING (
    has_role('manager') OR
    (has_role('server') AND server_id = auth.uid())
  );

-- Only managers+ can delete orders
CREATE POLICY "orders_delete_manager"
  ON orders FOR DELETE
  TO authenticated
  USING (has_role('manager'));

-- Order line items follow same pattern
CREATE POLICY "order_items_select_server"
  ON order_line_items FOR SELECT
  TO authenticated
  USING (has_role('server'));

CREATE POLICY "order_items_insert_server"
  ON order_line_items FOR INSERT
  TO authenticated
  WITH CHECK (has_role('server'));

CREATE POLICY "order_items_update_server"
  ON order_line_items FOR UPDATE
  TO authenticated
  USING (has_role('server'));

CREATE POLICY "order_items_delete_manager"
  ON order_line_items FOR DELETE
  TO authenticated
  USING (has_role('manager'));

-- =====================================================
-- RESERVATIONS POLICIES
-- =====================================================

-- Host+ can view all reservations
CREATE POLICY "reservations_select_host"
  ON reservations FOR SELECT
  TO authenticated
  USING (has_role('host'));

-- Host+ can create reservations
CREATE POLICY "reservations_insert_host"
  ON reservations FOR INSERT
  TO authenticated
  WITH CHECK (has_role('host'));

-- Host+ can update reservations
CREATE POLICY "reservations_update_host"
  ON reservations FOR UPDATE
  TO authenticated
  USING (has_role('host'));

-- Only managers+ can delete reservations
CREATE POLICY "reservations_delete_manager"
  ON reservations FOR DELETE
  TO authenticated
  USING (has_role('manager'));

-- =====================================================
-- APP SETTINGS POLICIES
-- =====================================================

-- All authenticated users can view settings
CREATE POLICY "app_settings_select_all"
  ON app_settings FOR SELECT
  TO authenticated
  USING (true);

-- Only admins can modify settings
CREATE POLICY "app_settings_insert_admin"
  ON app_settings FOR INSERT
  TO authenticated
  WITH CHECK (has_role('admin'));

CREATE POLICY "app_settings_update_admin"
  ON app_settings FOR UPDATE
  TO authenticated
  USING (has_role('admin'));

CREATE POLICY "app_settings_delete_admin"
  ON app_settings FOR DELETE
  TO authenticated
  USING (has_role('admin'));

-- =====================================================
-- AUDIT LOGS POLICIES
-- =====================================================

-- Only admins can view audit logs
CREATE POLICY "audit_logs_select_admin"
  ON audit_logs FOR SELECT
  TO authenticated
  USING (has_role('admin'));

-- System can insert audit logs (via function)
CREATE POLICY "audit_logs_insert_system"
  ON audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- No one can update or delete audit logs
-- (No policies = denied)

-- =====================================================
-- NOTICES POLICIES
-- =====================================================

-- All authenticated users can view active notices
CREATE POLICY "notices_select_active"
  ON notices FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Manager+ can view all notices
CREATE POLICY "notices_select_manager"
  ON notices FOR SELECT
  TO authenticated
  USING (has_role('manager'));

-- Only managers+ can modify notices
CREATE POLICY "notices_insert_manager"
  ON notices FOR INSERT
  TO authenticated
  WITH CHECK (has_role('manager'));

CREATE POLICY "notices_update_manager"
  ON notices FOR UPDATE
  TO authenticated
  USING (has_role('manager'));

CREATE POLICY "notices_delete_admin"
  ON notices FOR DELETE
  TO authenticated
  USING (has_role('admin'));
