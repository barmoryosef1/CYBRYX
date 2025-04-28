-- Add vendor column to cves table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'cves'
    AND column_name = 'vendor'
  ) THEN
    ALTER TABLE cves ADD COLUMN vendor TEXT;
  END IF;
END $$;

-- Create index on vendor column for faster searches
CREATE INDEX IF NOT EXISTS idx_cves_vendor ON cves(vendor);

-- Create or replace function to search CVEs by text including vendor
CREATE OR REPLACE FUNCTION search_cves(search_text TEXT)
RETURNS SETOF cves AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM cves
  WHERE 
    to_tsvector('english', description) @@ to_tsquery('english', search_text)
    OR cve_id ILIKE '%' || search_text || '%'
    OR vendor ILIKE '%' || search_text || '%'
  ORDER BY published DESC;
END;
$$ LANGUAGE plpgsql;
