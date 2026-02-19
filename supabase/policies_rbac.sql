-- Enable Delete for Admins only
-- Inventory Items
create policy "Enable delete for admins only"
  on public.inventory_items for delete
  to authenticated
  using (
    auth.uid() in (
      select id from public.profiles where role = 'admin'
    )
  );

-- Stock Movements
create policy "Enable delete for admins only"
  on public.stock_movements for delete
  to authenticated
  using (
    auth.uid() in (
      select id from public.profiles where role = 'admin'
    )
  );

-- Expenses
create policy "Enable delete for admins only"
  on public.expenses for delete
  to authenticated
  using (
    auth.uid() in (
      select id from public.profiles where role = 'admin'
    )
  );
