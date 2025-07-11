-- Fix Analytics Permissions for Charts
-- Date: 2025-07-10
-- Description: Ensure analytics functions and data are accessible to all users including anonymous

-- Grant execute permissions on analytics functions to anonymous users
GRANT EXECUTE ON FUNCTION get_daily_visit_counts(timestamptz, timestamptz) TO anon;
GRANT EXECUTE ON FUNCTION get_visitor_statistics(integer) TO anon;
GRANT EXECUTE ON FUNCTION get_top_pages(integer, integer) TO anon;

-- Grant select permissions on page_visits table to anonymous users
GRANT SELECT ON page_visits TO anon;

-- Update RLS policy to allow anonymous users to read analytics data
DROP POLICY IF EXISTS "Allow read access to analytics" ON page_visits;
CREATE POLICY "Allow read access to analytics" ON page_visits
  FOR SELECT TO anon, authenticated
  USING (true);

-- Grant access to the daily analytics summary view
GRANT SELECT ON daily_analytics_summary TO anon;

-- Verify permissions are set correctly
SELECT 
  routine_name, 
  routine_type, 
  security_type 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name IN ('get_daily_visit_counts', 'get_visitor_statistics', 'get_top_pages');

-- Test the functions work
SELECT 'Testing get_daily_visit_counts' as test_name, COUNT(*) as result_count
FROM get_daily_visit_counts(NOW() - interval '7 days', NOW());

SELECT 'Testing get_visitor_statistics' as test_name, total_today, total_period
FROM get_visitor_statistics(7);

SELECT 'Testing get_top_pages' as test_name, COUNT(*) as result_count
FROM get_top_pages(7, 10);
