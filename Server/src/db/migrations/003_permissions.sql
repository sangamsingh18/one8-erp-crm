-- Add permissions JSONB column to users table
-- NULL = use role default permissions
-- Array of strings = custom permission keys e.g. ["dashboard","customers","challans"]
ALTER TABLE users ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT NULL;
