-- Function to get CVE counts by severity
CREATE OR REPLACE FUNCTION get_cve_severity_counts()
RETURNS TABLE (base_severity TEXT, count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT c.base_severity, COUNT(*) as count
  FROM cves c
  GROUP BY c.base_severity
  ORDER BY 
    CASE 
      WHEN c.base_severity = 'CRITICAL' THEN 1
      WHEN c.base_severity = 'HIGH' THEN 2
      WHEN c.base_severity = 'MEDIUM' THEN 3
      WHEN c.base_severity = 'LOW' THEN 4
      ELSE 5
    END;
END;
$$ LANGUAGE plpgsql;

-- Function to search CVEs by text
CREATE OR REPLACE FUNCTION search_cves(search_text TEXT)
RETURNS SETOF cves AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM cves
  WHERE 
    to_tsvector('english', description) @@ to_tsquery('english', search_text)
    OR cve_id ILIKE '%' || search_text || '%'
  ORDER BY published DESC;
END;
$$ LANGUAGE plpgsql;
