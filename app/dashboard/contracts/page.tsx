import { Button } from "@/components/ui/button"
import { Plus, Search, Filter, Download } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const contracts = [
  {
    id: "CON-001",
    title: "Business Consultation Agreement",
    client: "Acme Inc.",
    startDate: "2023-01-15",
    endDate: "2023-12-31",
    status: "active",
    value: "$5,000",
  },
  {
    id: "CON-002",
    title: "Marketing Services Contract",
    client: "TechStart LLC",
    startDate: "2023-02-10",
    endDate: "2023-08-10",
    status: "active",
    value: "$12,000",
  },
  {
    id: "CON-003",
    title: "Financial Advisory Agreement",
    client: "Global Enterprises",
    startDate: "2023-03-01",
    endDate: "2023-06-30",
    status: "expired",
    value: "$8,500",
  },
  {
    id: "CON-004",
    title: "Legal Consultation Contract",
    client: "Smith & Partners",
    startDate: "2023-04-15",
    endDate: "2024-04-14",
    status: "active",
    value: "$15,000",
  },
  {
    id: "CON-005",
    title: "IT Support Agreement",
    client: "Innovate Solutions",
    startDate: "2023-05-01",
    endDate: "2023-11-01",
    status: "active",
    value: "$9,200",
  },
  {
    id: "CON-006",
    title: "HR Consulting Services",
    client: "Metro Group",
    startDate: "2023-01-20",
    endDate: "2023-07-20",
    status: "expired",
    value: "$7,500",
  },
  {
    id: "CON-007",
    title: "Strategic Planning Agreement",
    client: "Future Vision Inc.",
    startDate: "2023-06-01",
    endDate: "2024-05-31",
    status: "draft",
    value: "$20,000",
  },
  {
    id: "CON-008",
    title: "Supply Chain Consultation",
    client: "Global Logistics",
    startDate: "2023-07-15",
    endDate: "2024-01-15",
    status: "active",
    value: "$11,000",
  },
]

export default function ContractsPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Contracts</h2>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> New Contract
        </Button>
      </div>
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search contracts..."
            className="w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-1/3"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Contract ID</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Value</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contracts.map((contract) => (
              <TableRow key={contract.id}>
                <TableCell className="font-medium">{contract.id}</TableCell>
                <TableCell>{contract.title}</TableCell>
                <TableCell>{contract.client}</TableCell>
                <TableCell>{contract.startDate}</TableCell>
                <TableCell>{contract.endDate}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      contract.status === "active" ? "default" : contract.status === "draft" ? "outline" : "secondary"
                    }
                  >
                    {contract.status}
                  </Badge>
                </TableCell>
                <TableCell>{contract.value}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        Actions
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>View Details</DropdownMenuItem>
                      <DropdownMenuItem>Edit Contract</DropdownMenuItem>
                      <DropdownMenuItem>Download PDF</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600">Delete Contract</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
