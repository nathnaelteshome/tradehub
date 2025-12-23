-- TradeHub Row Level Security Policies
-- Run this after the initial schema migration

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE dispute_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'ADMIN'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- PROFILES POLICIES
-- ============================================
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can update any profile"
  ON profiles FOR UPDATE
  USING (is_admin());

-- ============================================
-- PRODUCTS POLICIES
-- ============================================
CREATE POLICY "Active products viewable by everyone"
  ON products FOR SELECT
  USING (active = true OR seller_id = auth.uid() OR is_admin());

CREATE POLICY "Authenticated users can create products"
  ON products FOR INSERT
  WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Sellers can update own products"
  ON products FOR UPDATE
  USING (auth.uid() = seller_id);

CREATE POLICY "Sellers can delete own products"
  ON products FOR DELETE
  USING (auth.uid() = seller_id);

CREATE POLICY "Admins can delete any product"
  ON products FOR DELETE
  USING (is_admin());

-- ============================================
-- ORDERS POLICIES
-- ============================================
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id OR is_admin());

CREATE POLICY "Authenticated users can create orders"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Sellers can update order status"
  ON orders FOR UPDATE
  USING (auth.uid() = seller_id OR is_admin());

-- ============================================
-- ORDER ITEMS POLICIES
-- ============================================
CREATE POLICY "Users can view order items of own orders"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND (orders.buyer_id = auth.uid() OR orders.seller_id = auth.uid() OR is_admin())
    )
  );

CREATE POLICY "Authenticated users can create order items"
  ON order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.buyer_id = auth.uid()
    )
  );

-- ============================================
-- DISPUTES POLICIES
-- ============================================
CREATE POLICY "Participants can view disputes"
  ON disputes FOR SELECT
  USING (
    opened_by_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = disputes.order_id
      AND (orders.buyer_id = auth.uid() OR orders.seller_id = auth.uid())
    )
    OR is_admin()
  );

CREATE POLICY "Buyers can create disputes"
  ON disputes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_id
      AND orders.buyer_id = auth.uid()
    )
  );

CREATE POLICY "Admins can update disputes"
  ON disputes FOR UPDATE
  USING (is_admin());

-- ============================================
-- DISPUTE MESSAGES POLICIES
-- ============================================
CREATE POLICY "Participants can view messages"
  ON dispute_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM disputes d
      JOIN orders o ON d.order_id = o.id
      WHERE d.id = dispute_messages.dispute_id
      AND (o.buyer_id = auth.uid() OR o.seller_id = auth.uid() OR d.opened_by_id = auth.uid() OR is_admin())
    )
  );

CREATE POLICY "Participants can send messages"
  ON dispute_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM disputes d
      JOIN orders o ON d.order_id = o.id
      WHERE d.id = dispute_id
      AND (o.buyer_id = auth.uid() OR o.seller_id = auth.uid() OR is_admin())
    )
  );

-- ============================================
-- REVIEWS POLICIES
-- ============================================
CREATE POLICY "Anyone can view reviews"
  ON reviews FOR SELECT
  USING (true);

CREATE POLICY "Verified buyers can create reviews"
  ON reviews FOR INSERT
  WITH CHECK (
    auth.uid() = author_id
    AND EXISTS (
      SELECT 1 FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      WHERE o.buyer_id = auth.uid()
      AND oi.product_id = reviews.product_id
      AND o.status = 'DELIVERED'
    )
  );
