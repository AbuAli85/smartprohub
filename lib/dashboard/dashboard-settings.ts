import { executeQuery } from "@/lib/neon/client"

// Get dashboard settings for a user
export async function getDashboardSettings(userId: string) {
  try {
    const result = await executeQuery(
      `
      SELECT 
        layout, 
        visible_widgets, 
        theme, 
        refresh_interval
      FROM 
        dashboard_settings 
      WHERE 
        user_id = $1
      `,
      [userId],
    )

    if (result && result.rows && result.rows.length > 0) {
      return result.rows[0]
    }

    // Return default settings if none exist
    return {
      layout: "default",
      visible_widgets: ["metrics", "revenue", "activity", "bookings"],
      theme: "light",
      refresh_interval: 30,
    }
  } catch (error) {
    console.error("Error fetching dashboard settings:", error)
    // Return default settings on error
    return {
      layout: "default",
      visible_widgets: ["metrics", "revenue", "activity", "bookings"],
      theme: "light",
      refresh_interval: 30,
    }
  }
}

// Save dashboard settings for a user
export async function saveDashboardSettings(
  userId: string,
  settings: {
    layout?: string
    visible_widgets?: string[]
    theme?: string
    refresh_interval?: number
  },
) {
  try {
    // Check if settings exist for this user
    const existingSettings = await executeQuery(`SELECT id FROM dashboard_settings WHERE user_id = $1`, [userId])

    if (existingSettings && existingSettings.rows && existingSettings.rows.length > 0) {
      // Update existing settings
      await executeQuery(
        `
        UPDATE dashboard_settings 
        SET 
          layout = COALESCE($2, layout),
          visible_widgets = COALESCE($3, visible_widgets),
          theme = COALESCE($4, theme),
          refresh_interval = COALESCE($5, refresh_interval),
          updated_at = NOW()
        WHERE 
          user_id = $1
        `,
        [
          userId,
          settings.layout,
          settings.visible_widgets ? JSON.stringify(settings.visible_widgets) : null,
          settings.theme,
          settings.refresh_interval,
        ],
      )
    } else {
      // Insert new settings
      await executeQuery(
        `
        INSERT INTO dashboard_settings (
          user_id, 
          layout, 
          visible_widgets, 
          theme, 
          refresh_interval, 
          created_at, 
          updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, NOW(), NOW()
        )
        `,
        [
          userId,
          settings.layout || "default",
          JSON.stringify(settings.visible_widgets || ["metrics", "revenue", "activity", "bookings"]),
          settings.theme || "light",
          settings.refresh_interval || 30,
        ],
      )
    }

    return true
  } catch (error) {
    console.error("Error saving dashboard settings:", error)
    return false
  }
}
