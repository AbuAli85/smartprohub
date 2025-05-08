import { FixBookingsTable } from "@/components/setup/fix-bookings-table"

export default function FixBookingsTablePage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="mb-6 text-3xl font-bold">Create Bookings Table</h1>
      <p className="mb-8 text-gray-600">
        This utility will create the bookings table that is required for appointment scheduling functionality.
      </p>

      <FixBookingsTable />
    </div>
  )
}
