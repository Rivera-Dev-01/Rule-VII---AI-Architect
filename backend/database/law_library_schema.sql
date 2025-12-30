-- Enable the UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create the structured law definitions table
CREATE TABLE IF NOT EXISTS law_definitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    law_code TEXT NOT NULL,          -- e.g., 'RA 9514', 'PD 1096'
    section_ref TEXT NOT NULL,       -- e.g., 'SECTION 10.2.5.4', 'Rule VII - Section 1'
    content TEXT NOT NULL,           -- The full text of the section
    description TEXT,                -- Brief summary (optional)
    tags TEXT[],                     -- e.g., ['fire safety', 'means of egress']
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Associate the table with the vector store for potential future hybrid search
-- (Optional: Add embedding column if you decide to vector-index this later)
-- ALTER TABLE law_definitions ADD COLUMN embedding vector(384);

-- Create indexes for fast exact lookup
CREATE INDEX IF NOT EXISTS idx_law_code ON law_definitions(law_code);
CREATE INDEX IF NOT EXISTS idx_section_ref ON law_definitions(section_ref);

-- Enable Row Level Security (RLS)
ALTER TABLE law_definitions ENABLE ROW LEVEL SECURITY;

-- Policy: Allow read access to everyone (public)
CREATE POLICY "Allow public read access"
ON law_definitions
FOR SELECT
TO public
USING (true);

-- Policy: Allow write access only to authenticated users (admin/service role)
CREATE POLICY "Allow service role write access"
ON law_definitions
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
