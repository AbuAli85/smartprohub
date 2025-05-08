import { executeQuery } from "./client"

// Get dashboard metrics from Neon database
export async function getDashboardMetrics(userId: string) {
  return executeQuery(
    `
    SELECT 
      COUNT(DISTINCT b.id) as total_bookings,
      COUNT(DISTINCT CASE WHEN b.status = 'confirmed' THEN b.id END) as confirmed_bookings,
      COUNT(DISTINCT CASE WHEN b.status = 'pending' THEN b.id END) as pending_bookings,
      COUNT(DISTINCT CASE WHEN b.status = 'cancelled' THEN b.id END) as cancelled_bookings,
      COUNT(DISTINCT c.id) as total_contracts,
      COUNT(DISTINCT CASE WHEN c.status = 'signed' THEN c.id END) as signed_contracts,
      SUM(CASE WHEN c.status = 'signed' THEN c.value ELSE 0 END) as total_contract_value
    FROM 
      bookings b
    LEFT JOIN 
      contracts c ON b.user_id = c.user_id
    WHERE 
      b.user_id = $1 OR c.user_id = $1
    GROUP BY 
      b.user_id
  `,
    [userId],
  )
}

// Get recent activity for dashboard
export async function getRecentActivity(userId: string, limit = 10) {
  return executeQuery(
    `
    WITH combined_activity AS (
      SELECT 
        id, 
        'booking' as type, 
        created_at, 
        status, 
        NULL as title
      FROM 
        bookings 
      WHERE 
        user_id = $1
      
      UNION ALL
      
      SELECT 
        id, 
        'contract' as type, 
        created_at, 
        status, 
        title
      FROM 
        contracts 
      WHERE 
        user_id = $1
      
      UNION ALL
      
      SELECT 
        id, 
        'message' as type, 
        created_at, 
        CASE WHEN read THEN 'read' ELSE 'unread' END as status, 
        NULL as title
      FROM 
        messages 
      WHERE 
        recipient_id = $1
    )
    SELECT * FROM combined_activity
    ORDER BY created_at DESC
    LIMIT $2
  `,
    [userId, limit],
  )
}

// Get revenue data for charts
export async function getRevenueData(userId: string, period: "week" | "month" | "year" = "month") {
  let timeFormat: string
  let groupBy: string

  if (period === "week") {
    timeFormat = "YYYY-MM-DD"
    groupBy = "DATE(created_at)"
  } else if (period === "month") {
    timeFormat = "YYYY-MM-DD"
    groupBy = "DATE(created_at)"
  } else {
    timeFormat = "YYYY-MM"
    groupBy = "DATE_TRUNC('month', created_at)"
  }

  return executeQuery(
    `
    SELECT 
      TO_CHAR(${groupBy}, '${timeFormat}') as time_period,
      SUM(value) as revenue
    FROM 
      contracts
    WHERE 
      user_id = $1 
      AND status = 'signed'
      AND created_at >= NOW() - INTERVAL '1 ${period}'
    GROUP BY 
      time_period
    ORDER BY 
      time_period
  `,
    [userId],
  )
}
