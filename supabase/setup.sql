-- Enable RLS (Row Level Security) on all tables (Best Practice)

-- 1. Profiles Table
-- Linked to auth.users to store additional user data like roles.
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  role text default 'encoder' check (role in ('admin', 'encoder')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.profiles enable row level security;

-- 2. Inventory Items
create table public.inventory_items (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  category text,
  current_stock integer default 0,
  min_stock_level integer default 10,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.inventory_items enable row level security;

-- 3. Stock Movements
-- Records every "In" (Restock) and "Out" (Usage/Sale)
create table public.stock_movements (
  id uuid default gen_random_uuid() primary key,
  item_id uuid references public.inventory_items(id) on delete cascade not null,
  type text not null check (type in ('in', 'out')),
  quantity integer not null,
  movement_date timestamp with time zone default timezone('utc'::text, now()) not null,
  receipt_url text, -- For uploaded images
  created_by uuid references auth.users(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.stock_movements enable row level security;

-- 4. Expenses
create table public.expenses (
  id uuid default gen_random_uuid() primary key,
  description text not null,
  amount numeric(10, 2) not null,
  category text,
  expense_date timestamp with time zone default timezone('utc'::text, now()) not null,
  receipt_url text,
  created_by uuid references auth.users(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.expenses enable row level security;

-- POLICIES

-- Profiles:
-- Everyone can read profiles (to check roles).
create policy "Public profiles are viewable by everyone"
  on public.profiles for select
  using ( true );

-- Users can update their own profile.
create policy "Users can update own profile"
  on public.profiles for update
  using ( auth.uid() = id );

-- Inventory Items:
-- Authenticated users can view inventory.
create policy "Enable read access for all authenticated users"
  on public.inventory_items for select
  to authenticated
  using ( true );

-- Only authenticated users can insert/update (Refine for Roles later if needed).
create policy "Enable insert for authenticated users"
  on public.inventory_items for insert
  to authenticated
  with check ( true );

create policy "Enable update for authenticated users"
  on public.inventory_items for update
  to authenticated
  using ( true );

-- Stock Movements:
create policy "Enable read access for all authenticated users"
  on public.stock_movements for select
  to authenticated
  using ( true );

create policy "Enable insert for authenticated users"
  on public.stock_movements for insert
  to authenticated
  with check ( true );

-- Expenses:
create policy "Enable read access for all authenticated users"
  on public.expenses for select
  to authenticated
  using ( true );

create policy "Enable insert for authenticated users"
  on public.expenses for insert
  to authenticated
  with check ( true );


-- AUTOMATION

-- Trigger to create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'encoder');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Trigger to update inventory count on stock movement
create or replace function public.handle_stock_movement()
returns trigger
language plpgsql
security definer
as $$
begin
  if new.type = 'in' then
    update public.inventory_items
    set current_stock = current_stock + new.quantity,
        updated_at = now()
    where id = new.item_id;
  elsif new.type = 'out' then
     update public.inventory_items
    set current_stock = current_stock - new.quantity,
        updated_at = now()
    where id = new.item_id;
  end if;
  return new;
end;
$$;

create trigger on_stock_movement_created
  after insert on public.stock_movements
  for each row execute procedure public.handle_stock_movement();
