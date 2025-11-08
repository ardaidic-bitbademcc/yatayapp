-- Performans için kritik indeksler (taslak)

CREATE INDEX IF NOT EXISTS idx_sales_branch_date ON sales(branch_id, sale_date DESC);
CREATE INDEX IF NOT EXISTS idx_sales_cashier ON sales(cashier_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_product ON sale_items(product_id);
CREATE INDEX IF NOT EXISTS idx_branch_products_branch ON branch_products(branch_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_user_date ON time_entries(user_id, clock_in DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_branch_date ON expenses(branch_id, expense_date DESC);
CREATE INDEX IF NOT EXISTS idx_menu_analysis_branch_date ON menu_engineering_analysis(branch_id, analysis_date DESC);

-- Composite Indexes
CREATE INDEX IF NOT EXISTS idx_sales_composite ON sales(branch_id, sale_date, payment_status);
CREATE INDEX IF NOT EXISTS idx_products_composite ON products(organization_id, category_id, is_active);

-- Full-text Search (örnek)
-- CREATE INDEX IF NOT EXISTS idx_products_search ON products USING gin(to_tsvector('turkish', name || ' ' || COALESCE(description, '')));
