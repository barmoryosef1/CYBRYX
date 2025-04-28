-- Function to get CVE counts by severity
CREATE OR REPLACE FUNCTION get_cve_severity_counts()
RETURNS TABLE (base_severity TEXT, count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(c.base_severity, 'UNKNOWN') as base_severity, 
    COUNT(*) as count
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

-- Function to get CVE counts by year
CREATE OR REPLACE FUNCTION get_cve_counts_by_year()
RETURNS TABLE (year TEXT, count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    SUBSTRING(cve_id FROM 5 FOR 4) as year,
    COUNT(*) as count
  FROM cves
  GROUP BY year
  ORDER BY year DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get CVE counts by month (for the past year)
CREATE OR REPLACE FUNCTION get_cve_counts_by_month()
RETURNS TABLE (month TEXT, count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    TO_CHAR(published, 'YYYY-MM') as month,
    COUNT(*) as count
  FROM cves
  WHERE published >= NOW() - INTERVAL '1 year'
  GROUP BY month
  ORDER BY month;
END;
$$ LANGUAGE plpgsql;

-- Drop the vendor-related function if it exists
DROP FUNCTION IF EXISTS get_cve_counts_by_vendor();
