-- City Club Hospitality Management System
-- Seed Data for Development

-- =====================================================
-- LOCATIONS
-- =====================================================

INSERT INTO locations (id, name, code, description, sort_order) VALUES
  ('a1111111-1111-1111-1111-111111111111', 'Dining Room', 'D', 'Main dining area', 1),
  ('a2222222-2222-2222-2222-222222222222', 'Outside Patio', 'O', 'Outdoor seating area', 2),
  ('a3333333-3333-3333-3333-333333333333', 'Bar Area', 'B', 'Bar and lounge seating', 3),
  ('a4444444-4444-4444-4444-444444444444', 'Terrace', 'T', 'Upper terrace seating', 4);

-- =====================================================
-- TABLES
-- =====================================================

INSERT INTO tables (id, location_id, table_number, capacity, position_x, position_y, shape) VALUES
  -- Dining Room tables
  ('b1111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 'D1', 4, 100, 100, 'round'),
  ('b2222222-2222-2222-2222-222222222222', 'a1111111-1111-1111-1111-111111111111', 'D2', 4, 200, 100, 'round'),
  ('b3333333-3333-3333-3333-333333333333', 'a1111111-1111-1111-1111-111111111111', 'D3', 6, 300, 100, 'rectangle'),
  ('b4444444-4444-4444-4444-444444444444', 'a1111111-1111-1111-1111-111111111111', 'D4', 4, 100, 200, 'round'),
  ('b5555555-5555-5555-5555-555555555555', 'a1111111-1111-1111-1111-111111111111', 'D5', 4, 200, 200, 'round'),
  ('b6666666-6666-6666-6666-666666666666', 'a1111111-1111-1111-1111-111111111111', 'D6', 8, 300, 200, 'rectangle'),
  -- Outside tables
  ('b7777777-7777-7777-7777-777777777777', 'a2222222-2222-2222-2222-222222222222', 'O1', 4, 100, 100, 'square'),
  ('b8888888-8888-8888-8888-888888888888', 'a2222222-2222-2222-2222-222222222222', 'O2', 4, 200, 100, 'square'),
  ('b9999999-9999-9999-9999-999999999999', 'a2222222-2222-2222-2222-222222222222', 'O3', 6, 300, 100, 'rectangle'),
  -- Terrace tables
  ('ba111111-1111-1111-1111-111111111111', 'a4444444-4444-4444-4444-444444444444', 'T1', 2, 100, 100, 'round'),
  ('ba222222-2222-2222-2222-222222222222', 'a4444444-4444-4444-4444-444444444444', 'T2', 2, 150, 100, 'round'),
  ('ba333333-3333-3333-3333-333333333333', 'a4444444-4444-4444-4444-444444444444', 'T3', 4, 200, 100, 'round'),
  ('ba444444-4444-4444-4444-444444444444', 'a4444444-4444-4444-4444-444444444444', 'TT', 10, 300, 150, 'rectangle');

-- =====================================================
-- CATEGORIES
-- =====================================================

INSERT INTO categories (id, name, slug, color, icon, sort_order) VALUES
  ('c1111111-1111-1111-1111-111111111111', 'All Items', 'all', '#6366F1', 'grid', 0),
  ('c2222222-2222-2222-2222-222222222222', 'Snacks', 'snacks', '#EAB308', 'cookie', 1),
  ('c3333333-3333-3333-3333-333333333333', 'Starters', 'starters', '#22C55E', 'salad', 2),
  ('c4444444-4444-4444-4444-444444444444', 'Salads', 'salads', '#14B8A6', 'leaf', 3),
  ('c5555555-5555-5555-5555-555555555555', 'Mains', 'mains', '#8B5CF6', 'beef', 4),
  ('c6666666-6666-6666-6666-666666666666', 'Beverage', 'beverage', '#EC4899', 'wine', 5),
  ('c7777777-7777-7777-7777-777777777777', 'Coffee', 'coffee', '#92400E', 'coffee', 6),
  ('c8888888-8888-8888-8888-888888888888', 'Pastries', 'pastries', '#F97316', 'croissant', 7),
  ('c9999999-9999-9999-9999-999999999999', 'Dessert', 'dessert', '#D946EF', 'cake', 8),
  ('ca111111-1111-1111-1111-111111111111', 'Sides', 'sides', '#6B7280', 'utensils', 9);

-- =====================================================
-- MODIFIERS
-- =====================================================

INSERT INTO modifiers (id, name, requirement, min_selections, max_selections, sort_order) VALUES
  ('d1111111-1111-1111-1111-111111111111', 'Cook Temperature', 'required', 1, 1, 1),
  ('d2222222-2222-2222-2222-222222222222', 'Milk Choice', 'optional', 0, 1, 2),
  ('d3333333-3333-3333-3333-333333333333', 'Add-Ons', 'optional', 0, NULL, 3),
  ('d4444444-4444-4444-4444-444444444444', 'Dressing', 'optional', 0, 1, 4),
  ('d5555555-5555-5555-5555-555555555555', 'Size', 'required', 1, 1, 5);

INSERT INTO modifier_options (id, modifier_id, name, price_adjustment, is_default, sort_order) VALUES
  -- Cook Temperature
  ('e1111111-1111-1111-1111-111111111111', 'd1111111-1111-1111-1111-111111111111', 'Rare', 0, false, 1),
  ('e1111112-1111-1111-1111-111111111111', 'd1111111-1111-1111-1111-111111111111', 'Medium Rare', 0, true, 2),
  ('e1111113-1111-1111-1111-111111111111', 'd1111111-1111-1111-1111-111111111111', 'Medium', 0, false, 3),
  ('e1111114-1111-1111-1111-111111111111', 'd1111111-1111-1111-1111-111111111111', 'Medium Well', 0, false, 4),
  ('e1111115-1111-1111-1111-111111111111', 'd1111111-1111-1111-1111-111111111111', 'Well Done', 0, false, 5),
  -- Milk Choice
  ('e2222221-2222-2222-2222-222222222222', 'd2222222-2222-2222-2222-222222222222', 'Whole Milk', 0, true, 1),
  ('e2222222-2222-2222-2222-222222222222', 'd2222222-2222-2222-2222-222222222222', 'Oat Milk', 0.75, false, 2),
  ('e2222223-2222-2222-2222-222222222222', 'd2222222-2222-2222-2222-222222222222', 'Almond Milk', 0.75, false, 3),
  ('e2222224-2222-2222-2222-222222222222', 'd2222222-2222-2222-2222-222222222222', 'Skim Milk', 0, false, 4),
  -- Add-Ons
  ('e3333331-3333-3333-3333-333333333333', 'd3333333-3333-3333-3333-333333333333', 'Extra Cheese', 1.00, false, 1),
  ('e3333332-3333-3333-3333-333333333333', 'd3333333-3333-3333-3333-333333333333', 'Avocado', 1.50, false, 2),
  ('e3333333-3333-3333-3333-333333333333', 'd3333333-3333-3333-3333-333333333333', 'Bacon', 2.00, false, 3),
  ('e3333334-3333-3333-3333-333333333333', 'd3333333-3333-3333-3333-333333333333', 'Egg', 1.50, false, 4),
  -- Dressing
  ('e4444441-4444-4444-4444-444444444444', 'd4444444-4444-4444-4444-444444444444', 'Ranch', 0, true, 1),
  ('e4444442-4444-4444-4444-444444444444', 'd4444444-4444-4444-4444-444444444444', 'Caesar', 0, false, 2),
  ('e4444443-4444-4444-4444-444444444444', 'd4444444-4444-4444-4444-444444444444', 'Balsamic', 0, false, 3),
  ('e4444444-4444-4444-4444-444444444444', 'd4444444-4444-4444-4444-444444444444', 'Oil & Vinegar', 0, false, 4),
  -- Size
  ('e5555551-5555-5555-5555-555555555555', 'd5555555-5555-5555-5555-555555555555', 'Small', -2.00, false, 1),
  ('e5555552-5555-5555-5555-555555555555', 'd5555555-5555-5555-5555-555555555555', 'Regular', 0, true, 2),
  ('e5555553-5555-5555-5555-555555555555', 'd5555555-5555-5555-5555-555555555555', 'Large', 2.00, false, 3);

-- =====================================================
-- PRODUCTS
-- =====================================================

INSERT INTO products (id, category_id, name, price, routing, allergens, dietary_tags, is_daily_special, available_count, sort_order) VALUES
  -- Coffee
  ('f1111111-1111-1111-1111-111111111111', 'c7777777-7777-7777-7777-777777777777', 'Cappuccino', 5.00, 'bar', ARRAY['dairy'], NULL, false, 50, 1),
  ('f1111112-1111-1111-1111-111111111111', 'c7777777-7777-7777-7777-777777777777', 'Cafe Latte', 5.00, 'bar', ARRAY['dairy'], NULL, false, 50, 2),
  ('f1111113-1111-1111-1111-111111111111', 'c7777777-7777-7777-7777-777777777777', 'Affogato', 5.00, 'bar', ARRAY['dairy'], NULL, false, 0, 3), -- Sold out
  ('f1111114-1111-1111-1111-111111111111', 'c7777777-7777-7777-7777-777777777777', 'Espresso', 3.00, 'bar', NULL, ARRAY['vegan'], false, NULL, 4),
  -- Salads
  ('f2222221-2222-2222-2222-222222222222', 'c4444444-4444-4444-4444-444444444444', 'Gotham Greens Salad with Chicken', 22.00, 'kitchen', NULL, NULL, true, 12, 1),
  ('f2222222-2222-2222-2222-222222222222', 'c4444444-4444-4444-4444-444444444444', 'Classic Caesar Salad', 16.00, 'kitchen', ARRAY['dairy', 'gluten'], NULL, false, NULL, 2),
  ('f2222223-2222-2222-2222-222222222222', 'c4444444-4444-4444-4444-444444444444', 'Side Salad', 5.00, 'kitchen', NULL, ARRAY['vegan', 'gluten-free'], false, NULL, 3),
  -- Mains
  ('f3333331-3333-3333-3333-333333333333', 'c5555555-5555-5555-5555-555555555555', 'Grilled Cheese and Tomato Soup', 18.00, 'kitchen', ARRAY['dairy', 'gluten'], NULL, false, NULL, 1),
  ('f3333332-3333-3333-3333-333333333333', 'c5555555-5555-5555-5555-555555555555', 'Croissant Sandwich with Scrambled Eggs', 13.00, 'kitchen', ARRAY['dairy', 'gluten', 'egg'], NULL, false, NULL, 2),
  ('f3333333-3333-3333-3333-333333333333', 'c5555555-5555-5555-5555-555555555555', 'Seared Halibut', 36.00, 'kitchen', ARRAY['fish'], NULL, false, 8, 3),
  ('f3333334-3333-3333-3333-333333333333', 'c5555555-5555-5555-5555-555555555555', 'Ricotta Gnudi', 24.00, 'kitchen', ARRAY['dairy', 'gluten'], ARRAY['vegetarian'], false, NULL, 4),
  ('f3333335-3333-3333-3333-333333333333', 'c5555555-5555-5555-5555-555555555555', 'Ham & Gruyere Croissant Sandwich', 15.00, 'kitchen', ARRAY['dairy', 'gluten'], NULL, false, NULL, 5),
  -- Pastries
  ('f4444441-4444-4444-4444-444444444444', 'c8888888-8888-8888-8888-888888888888', 'Croissant', 4.50, 'kitchen', ARRAY['dairy', 'gluten'], ARRAY['vegetarian'], false, 20, 1),
  ('f4444442-4444-4444-4444-444444444444', 'c8888888-8888-8888-8888-888888888888', 'Seasonal Danish', 5.00, 'kitchen', ARRAY['dairy', 'gluten'], ARRAY['vegetarian'], true, 12, 2),
  ('f4444443-4444-4444-4444-444444444444', 'c8888888-8888-8888-8888-888888888888', 'Masa Tea Cake', 6.00, 'kitchen', ARRAY['gluten'], ARRAY['vegetarian'], false, 15, 3),
  -- Desserts
  ('f5555551-5555-5555-5555-555555555555', 'c9999999-9999-9999-9999-999999999999', 'House Dessert', 12.00, 'kitchen', ARRAY['dairy', 'gluten'], NULL, true, 10, 1),
  ('f5555552-5555-5555-5555-555555555555', 'c9999999-9999-9999-9999-999999999999', 'Chocolate Bark', 8.00, 'kitchen', ARRAY['dairy'], ARRAY['gluten-free'], false, NULL, 2),
  -- Sides
  ('f6666661-6666-6666-6666-666666666666', 'ca111111-1111-1111-1111-111111111111', 'Side (Chicken)', 5.00, 'kitchen', NULL, ARRAY['gluten-free'], false, NULL, 1),
  ('f6666662-6666-6666-6666-666666666666', 'ca111111-1111-1111-1111-111111111111', 'Side (Avocado)', 3.00, 'kitchen', NULL, ARRAY['vegan', 'gluten-free'], false, NULL, 2),
  ('f6666663-6666-6666-6666-666666666666', 'ca111111-1111-1111-1111-111111111111', 'Chocolate Croissant', 6.00, 'kitchen', ARRAY['dairy', 'gluten'], ARRAY['vegetarian'], false, 15, 3);

-- =====================================================
-- PRODUCT MODIFIERS (linking products to modifiers)
-- =====================================================

INSERT INTO product_modifiers (product_id, modifier_id, is_required, sort_order) VALUES
  -- Coffee products get milk choice
  ('f1111111-1111-1111-1111-111111111111', 'd2222222-2222-2222-2222-222222222222', false, 1),
  ('f1111112-1111-1111-1111-111111111111', 'd2222222-2222-2222-2222-222222222222', false, 1),
  -- Salads get dressing
  ('f2222221-2222-2222-2222-222222222222', 'd4444444-4444-4444-4444-444444444444', false, 1),
  ('f2222222-2222-2222-2222-222222222222', 'd4444444-4444-4444-4444-444444444444', false, 1),
  ('f2222223-2222-2222-2222-222222222222', 'd4444444-4444-4444-4444-444444444444', false, 1),
  -- Salads can have add-ons
  ('f2222221-2222-2222-2222-222222222222', 'd3333333-3333-3333-3333-333333333333', false, 2),
  -- Halibut gets cook temp (required for fish/meat)
  ('f3333333-3333-3333-3333-333333333333', 'd1111111-1111-1111-1111-111111111111', true, 1);

-- =====================================================
-- MEMBERS
-- =====================================================

INSERT INTO members (id, member_number, first_name, last_name, email, default_discount_percent, dietary_restrictions) VALUES
  ('g1111111-1111-1111-1111-111111111111', 'M001', 'Thomas', 'Kordell', 'thomas.k@email.com', 10, ARRAY['gluten']),
  ('g2222222-2222-2222-2222-222222222222', 'M002', 'James', 'Balog', 'james.b@email.com', 15, NULL),
  ('g3333333-3333-3333-3333-333333333333', 'M003', 'Amanda', 'Warner', 'amanda.w@email.com', 10, ARRAY['dairy']),
  ('g4444444-4444-4444-4444-444444444444', 'M004', 'Ryan', 'Boykin', 'ryan.b@email.com', 20, NULL),
  ('g5555555-5555-5555-5555-555555555555', 'M005', 'Grace', 'Yoon', 'grace.y@email.com', 10, ARRAY['nuts']),
  ('g6666666-6666-6666-6666-666666666666', 'M006', 'Steve', 'Smith', 'steve.s@email.com', 15, NULL),
  ('g7777777-7777-7777-7777-777777777777', 'M007', 'Stefan', 'du Toit', 'stefan.dt@email.com', 10, NULL),
  ('g8888888-8888-8888-8888-888888888888', 'M008', 'Lidia', 'Jones', 'lidia.j@email.com', 10, ARRAY['dairy', 'egg']);

-- =====================================================
-- NOTICES
-- =====================================================

INSERT INTO notices (title, message, type, is_active, show_on_modules) VALUES
  ('Kitchen Alert', 'Notice: short staffed in the Kitchen, longer than normal wait times for food items.', 'warning', true, ARRAY['sale']),
  ('Daily Special', 'Today''s special: House Dessert - Seasonal fruit tart with whipped cream', 'info', true, ARRAY['sale', 'display']);

-- =====================================================
-- APP SETTINGS
-- =====================================================

INSERT INTO app_settings (module, key, value, description) VALUES
  ('sale', 'tax_rate', '0.0875', 'Sales tax rate (8.75%)'),
  ('sale', 'default_tip_percentages', '[15, 18, 20, 25]', 'Default tip percentage options'),
  ('sale', 'skip_seating_default', 'false', 'Whether to skip seating by default'),
  ('display', 'auto_complete_minutes', '30', 'Auto-complete orders after X minutes'),
  ('display', 'show_scheduled', 'true', 'Show scheduled orders section'),
  ('rsvp', 'default_duration_minutes', '90', 'Default reservation duration'),
  ('rsvp', 'max_party_size', '20', 'Maximum party size for online reservations'),
  ('stats', 'default_view', 'daily', 'Default stats view (daily, weekly, monthly, quarterly)');
