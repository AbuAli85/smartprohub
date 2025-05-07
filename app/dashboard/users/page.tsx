import { Button } from "@/components/ui/button"
import { Plus, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const users = [
  {
    id: "1",
    name: "John Doe",
    email: "john.doe@example.com",
    role: "admin",
    status: "active",
    lastActive: "2 hours ago",
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane.smith@example.com",
    role: "user",
    status: "active",
    lastActive: "1 day ago",
  },
  {
    id: "3",
    name: "Robert Johnson",
    email: "robert.j@example.com",
    role: "manager",
    status: "active",
    lastActive: "3 hours ago",
  },
  {
    id: "4",
    name: "Emily Davis",
    email: "emily.d@example.com",
    role: "user",
    status: "inactive",
    lastActive: "1 week ago",
  },
  {
    id: "5",
    name: "Michael Brown",
    email: "michael.b@example.com",
    role: "user",
    status: "active",
    lastActive: "5 hours ago",
  },
  {
    id: "6",
    name: "Sarah Wilson",
    email: "sarah.w@example.com",
    role: "manager",
    status: "active",
    lastActive: "2 days ago",
  },
  {
    id: "7",
    name: "David Lee",
    email: "david.l@example.com",
    role: "user",
    status: "inactive",
    lastActive: "2 weeks ago",
  },
  {
    id: "8",
    name: "Lisa Taylor",
    email: "lisa.t@example.com",
    role: "user",
    status: "active",
    lastActive: "1 day ago",
  },
]

export default function UsersPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Users</h2>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Add User
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search users..."
            className="w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-1/3"
          />
        </div>
        <Button variant="outline" size="sm">
          Filter by role
        </Button>
        <Button variant="outline" size="sm">
          Filter by status
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Active</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage
                        src={`/abstract-geometric-shapes.png?height=32&width=32&query=${user.name}`}
                        alt={user.name}
                      />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{user.role}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={user.status === "active" ? "default" : "secondary"}>{user.status}</Badge>
                </TableCell>
                <TableCell>{user.lastActive}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">
                    Edit
                  </Button>
                  <Button variant="ghost" size="sm">
                    Delete
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
