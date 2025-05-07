"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

const bookings = [
  {
    id: "1",
    name: "John Doe",
    email: "john.doe@example.com",
    service: "Business Consultation",
    date: "2023-11-15",
    time: "10:00 AM",
    status: "confirmed",
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane.smith@example.com",
    service: "Tax Planning",
    date: "2023-11-16",
    time: "2:30 PM",
    status: "pending",
  },
  {
    id: "3",
    name: "Robert Johnson",
    email: "robert.j@example.com",
    service: "Financial Analysis",
    date: "2023-11-17",
    time: "11:00 AM",
    status: "confirmed",
  },
  {
    id: "4",
    name: "Emily Davis",
    email: "emily.d@example.com",
    service: "Marketing Strategy",
    date: "2023-11-18",
    time: "3:00 PM",
    status: "cancelled",
  },
  {
    id: "5",
    name: "Michael Brown",
    email: "michael.b@example.com",
    service: "Legal Consultation",
    date: "2023-11-19",
    time: "9:30 AM",
    status: "confirmed",
  },
]

export function RecentBookings() {
  return (
    <div className="space-y-8">
      {bookings.map((booking) => (
        <div key={booking.id} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarImage
              src={`/abstract-geometric-shapes.png?height=36&width=36&query=${booking.name}`}
              alt={booking.name}
            />
            <AvatarFallback>{booking.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{booking.name}</p>
            <p className="text-sm text-muted-foreground">{booking.service}</p>
          </div>
          <div className="ml-auto text-sm text-right">
            <div>{booking.date}</div>
            <div>{booking.time}</div>
          </div>
          <div className="ml-2">
            <Badge
              variant={
                booking.status === "confirmed" ? "default" : booking.status === "pending" ? "outline" : "destructive"
              }
            >
              {booking.status}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  )
}
