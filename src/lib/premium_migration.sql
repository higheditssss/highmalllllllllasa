-- Adaugă coloana is_premium în tabelul profiles
-- Rulează asta în Supabase SQL Editor

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS is_premium BOOLEAN NOT NULL DEFAULT FALSE;

-- (Opțional) Setează un user ca premium manual:
-- UPDATE profiles SET is_premium = TRUE WHERE username = 'numeuser';

-- Adaugă coloana hat pentru accesorii avatar
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS hat TEXT NOT NULL DEFAULT 'none';
