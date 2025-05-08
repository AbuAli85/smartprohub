"use server"

import { publishUpdate, CHANNELS } from "@/lib/redis/real-time-service"
import { executeQuery } from "@/lib/neon/client"
import { revalidatePath } from "next/cache"

// Publish booking update to Redis
export async function publishBookingUpdate(bookingData: any) {
  try {
    await publishUpdate(CHANNELS.BOOKING_UPDATES, {
      type: "booking",
      data: bookingData,
    })

    // Update metrics in Neon database
    await executeQuery(`
      SELECT update_dashboard_metrics_on_booking_change()
    `)

    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    console.error("Error publishing booking update:", error)
    return { success: false, error: "Failed to publish booking update" }
  }
}

// Publish contract update to Redis
export async function publishContractUpdate(contractData: any) {
  try {
    await publishUpdate(CHANNELS.CONTRACT_UPDATES, {
      type: "contract",
      data: contractData,
    })

    // Update metrics in Neon database
    await executeQuery(`
      SELECT update_dashboard_metrics_on_contract_change()
    `)

    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    console.error("Error publishing contract update:", error)
    return { success: false, error: "Failed to publish contract update" }
  }
}

// Publish message update to Redis
export async function publishMessageUpdate(messageData: any) {
  try {
    await publishUpdate(CHANNELS.MESSAGE_UPDATES, {
      type: "message",
      data: messageData,
    })

    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    console.error("Error publishing message update:", error)
    return { success: false, error: "Failed to publish message update" }
  }
}

// Publish metrics update to Redis
export async function publishMetricsUpdate(userId: string) {
  try {
    // Get latest metrics from Neon database
    const metrics = await executeQuery(
      `
      SELECT * FROM dashboard_metrics WHERE user_id = $1
    `,
      [userId],
    )

    if (metrics && metrics.length > 0) {
      await publishUpdate(CHANNELS.METRICS_UPDATES, {
        type: "metrics",
        data: metrics[0],
      })
    }

    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    console.error("Error publishing metrics update:", error)
    return { success: false, error: "Failed to publish metrics update" }
  }
}
