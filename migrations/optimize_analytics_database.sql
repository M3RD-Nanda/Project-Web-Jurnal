-- Migration: Optimize Analytics Database for JEBAKA
-- Date: 2025-01-10
-- Description: Ensure analytics database is optimized and clean for the new journal name

-- Ensure page_visits table exists with proper structure
CREATE TABLE IF NOT EXISTS page_visits (
  id SERIAL PRIMARY KEY,
  path TEXT NOT NULL,
  visited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_agent TEXT,
  ip_address INET,
  referrer TEXT,
  session_id TEXT
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_page_visits_visited_at ON page_visits(visited_at);
CREATE INDEX IF NOT EXISTS idx_page_visits_path ON page_visits(path);
CREATE INDEX IF NOT EXISTS idx_page_visits_session ON page_visits(session_id);
CREATE INDEX IF NOT EXISTS idx_page_visits_date_path ON page_visits(DATE(visited_at), path);

-- Create stored procedure for daily visit counts
CREATE OR REPLACE FUNCTION get_daily_visit_counts(start_date timestamptz, end_date timestamptz)
RETURNS TABLE(visit_date date, visit_count bigint) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    DATE(visited_at) as visit_date,
    COUNT(*) as visit_count
  FROM page_visits 
  WHERE visited_at >= start_date AND visited_at <= end_date
  GROUP BY DATE(visited_at)
  ORDER BY visit_date;
END;
$$ LANGUAGE plpgsql;

-- Create function to get visitor statistics
CREATE OR REPLACE FUNCTION get_visitor_statistics(days_back integer DEFAULT 7)
RETURNS TABLE(
  total_today bigint,
  total_period bigint,
  unique_paths bigint,
  avg_daily bigint
) AS $$
DECLARE
  today_start timestamptz;
  today_end timestamptz;
  period_start timestamptz;
BEGIN
  today_start := date_trunc('day', NOW());
  today_end := today_start + interval '1 day';
  period_start := today_start - interval '1 day' * days_back;
  
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM page_visits WHERE visited_at >= today_start AND visited_at < today_end) as total_today,
    (SELECT COUNT(*) FROM page_visits WHERE visited_at >= period_start AND visited_at < today_end) as total_period,
    (SELECT COUNT(DISTINCT path) FROM page_visits WHERE visited_at >= period_start AND visited_at < today_end) as unique_paths,
    (SELECT COUNT(*) / GREATEST(days_back, 1) FROM page_visits WHERE visited_at >= period_start AND visited_at < today_end) as avg_daily;
END;
$$ LANGUAGE plpgsql;

-- Create function to get top pages
CREATE OR REPLACE FUNCTION get_top_pages(days_back integer DEFAULT 7, page_limit integer DEFAULT 10)
RETURNS TABLE(
  path TEXT,
  visit_count bigint,
  percentage numeric
) AS $$
DECLARE
  total_visits bigint;
  period_start timestamptz;
BEGIN
  period_start := date_trunc('day', NOW()) - interval '1 day' * days_back;
  
  -- Get total visits for percentage calculation
  SELECT COUNT(*) INTO total_visits 
  FROM page_visits 
  WHERE visited_at >= period_start;
  
  RETURN QUERY
  SELECT 
    pv.path,
    COUNT(*) as visit_count,
    ROUND((COUNT(*) * 100.0 / GREATEST(total_visits, 1)), 2) as percentage
  FROM page_visits pv
  WHERE pv.visited_at >= period_start
  GROUP BY pv.path
  ORDER BY visit_count DESC
  LIMIT page_limit;
END;
$$ LANGUAGE plpgsql;

-- Create function to clean old analytics data (optional)
CREATE OR REPLACE FUNCTION cleanup_old_analytics_data(days_to_keep integer DEFAULT 365)
RETURNS bigint AS $$
DECLARE
  deleted_count bigint;
  cutoff_date timestamptz;
BEGIN
  cutoff_date := NOW() - interval '1 day' * days_to_keep;
  
  DELETE FROM page_visits 
  WHERE visited_at < cutoff_date;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Add comments to tables and columns
COMMENT ON TABLE page_visits IS 'Analytics data for JEBAKA website page visits';
COMMENT ON COLUMN page_visits.path IS 'URL path of the visited page';
COMMENT ON COLUMN page_visits.visited_at IS 'Timestamp when the page was visited';
COMMENT ON COLUMN page_visits.user_agent IS 'Browser user agent string';
COMMENT ON COLUMN page_visits.ip_address IS 'Visitor IP address (anonymized)';
COMMENT ON COLUMN page_visits.referrer IS 'Referring page URL';
COMMENT ON COLUMN page_visits.session_id IS 'Session identifier for tracking user sessions';

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT ON page_visits TO authenticated;
GRANT EXECUTE ON FUNCTION get_daily_visit_counts(timestamptz, timestamptz) TO authenticated;
GRANT EXECUTE ON FUNCTION get_visitor_statistics(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION get_top_pages(integer, integer) TO authenticated;

-- Create RLS policies for page_visits
ALTER TABLE page_visits ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read analytics data
CREATE POLICY "Allow read access to analytics" ON page_visits
  FOR SELECT TO authenticated
  USING (true);

-- Allow service role to insert analytics data
CREATE POLICY "Allow service role to insert analytics" ON page_visits
  FOR INSERT TO service_role
  WITH CHECK (true);

-- Create a view for daily analytics summary
CREATE OR REPLACE VIEW daily_analytics_summary AS
SELECT 
  DATE(visited_at) as visit_date,
  COUNT(*) as total_visits,
  COUNT(DISTINCT session_id) as unique_sessions,
  COUNT(DISTINCT path) as unique_pages,
  COUNT(DISTINCT ip_address) as unique_visitors
FROM page_visits
WHERE visited_at >= (NOW() - interval '30 days')
GROUP BY DATE(visited_at)
ORDER BY visit_date DESC;

-- Grant access to the view
GRANT SELECT ON daily_analytics_summary TO authenticated;

-- Add constraint to prevent future data
ALTER TABLE page_visits 
ADD CONSTRAINT chk_visited_at_not_future 
CHECK (visited_at <= NOW() + interval '1 hour');

-- Create index for better performance on common queries
CREATE INDEX IF NOT EXISTS idx_page_visits_recent 
ON page_visits(visited_at DESC) 
WHERE visited_at >= (NOW() - interval '30 days');

-- Analyze table for better query planning
ANALYZE page_visits;
