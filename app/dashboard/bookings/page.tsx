import { Button } from "@/components/ui/button"
import { Calendar, Clock, Plus, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

const bookings = [
  {
    id: "1",
    client: "John Doe",
    service: "Business Consultation",
    date: "2023-11-15",
    time: "10:00 AM",
    status: "confirmed",
  },
  {
    id: "2",
    client: "Jane Smith",
    service: "Tax Planning",
    date: "2023-11-16",
    time: "2:30 PM",
    status: "pending",
  },
  {
    id: "3",
    client: "Robert Johnson",
    service: "Financial Analysis",
    date: "2023-11-17",
    time: "11:00 AM",
    status: "confirmed",
  },
  {
    id: "4",
    client: "Emily Davis",
    service: "Marketing Strategy",
    date: "2023-11-18",
    time: "3:00 PM",
    status: "cancelled",
  },
  {
    id: "5",
    client: "Michael Brown",
    service: "Legal Consultation",
    date: "2023-11-19",
    time: "9:30 AM",
    status: "confirmed",
  },
  {
    id: "6",
    client: "Sarah Wilson",
    service: "Business Consultation",
    date: "2023-11-20",
    time: "1:00 PM",
    status: "pending",
  },
  {
    id: "7",
    client: "David Lee",
    service: "Tax Planning",
    date: "2023-11-21",
    time: "11:30 AM",
    status: "confirmed",
  },
  {
    id: "8",
    client: "Lisa Taylor",
    service: "Financial Analysis",
    date: "2023-11-22",
    time: "4:00 PM",
    status: "cancelled",
  },
]

export default function BookingsPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Bookings</h2>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> New Booking
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search bookings..."
            className="w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-1/3"
          />
        </div>
        <Button variant="outline" size="sm">
          <Calendar className="mr-2 h-4 w-4" />
          Filter by date
        </Button>
        <Button variant="outline" size="sm">
          <Clock className="mr-2 h-4 w-4" />
          Filter by time
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell className="font-medium">{booking.client}</TableCell>
                <TableCell>{booking.service}</TableCell>
                <TableCell>{booking.date}</TableCell>
                <TableCell>{booking.time}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      booking.status === "confirmed"
                        ? "default"
                        : booking.status === "pending"
                          ? "outline"
                          : "destructive"
                    }
                  >
                    {booking.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">
                    View
                  </Button>
                  <Button variant="ghost" size="sm">
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
