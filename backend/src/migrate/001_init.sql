-- Enable PostGIS if available
CREATE EXTENSION IF NOT EXISTS postgis;

-- users
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text,
  email text UNIQUE NOT NULL,
  password_hash text,
  role text DEFAULT 'user',
  created_at timestamptz DEFAULT now()
);

-- refresh tokens
CREATE TABLE IF NOT EXISTS refresh_tokens (
  token text PRIMARY KEY,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL
);

-- spots (using PostGIS geography POINT)
CREATE TABLE IF NOT EXISTS spots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid REFERENCES users(id) ON DELETE SET NULL,
  title text,
  address text,
  description text,
  price_per_hour numeric DEFAULT 0,
  total_slots integer DEFAULT 0,
  available_slots integer DEFAULT 0,
  location geography(Point, 4326),
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_spots_location ON spots USING GIST(location);

-- bookings
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  spot_id uuid REFERENCES spots(id) ON DELETE SET NULL,
  start_time timestamptz,
  end_time timestamptz,
  status text DEFAULT 'reserved',
  total_amount numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_spot ON bookings(spot_id);

-- payments
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES bookings(id) ON DELETE CASCADE,
  stripe_payment_intent_id text,
  status text,
  amount numeric,
  created_at timestamptz DEFAULT now()
);

-- reviews
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  spot_id uuid REFERENCES spots(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  rating integer,
  comment text,
  created_at timestamptz DEFAULT now()
);

-- simple seed admin
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@parkflow.local') THEN
    INSERT INTO users (name, email, password_hash, role) VALUES ('Admin', 'admin@parkflow.local', '', 'admin');
  END IF;
END$$;
