"use client"

import { useEffect, useState } from "react"
import { Plus, LayoutGrid, Table as TableIcon, Pencil, Trash2, History } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { CustomerFormDialog } from "@/components/customer-form-dialog"
import { AuditLogDialog } from "@/components/audit-log-dialog"
import { toast } from "sonner"

interface Customer {
  id: number
  name: string
  email?: string | null
  phone?: string | null
  company?: string | null
  notes?: string | null
  createdAt: string
  updatedAt: string
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"table" | "card">("table")
  const [formDialogOpen, setFormDialogOpen] = useState(false)
  const [auditDialogOpen, setAuditDialogOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null)
  const [auditLogsMap, setAuditLogsMap] = useState<Record<number, boolean>>({})

  useEffect(() => {
    fetchCustomers()
  }, [])

  useEffect(() => {
    const filtered = customers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.company?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    setFilteredCustomers(filtered)
  }, [searchQuery, customers])

  const fetchCustomers = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/customers")
      if (response.ok) {
        const data = await response.json()
        setCustomers(data)
        setFilteredCustomers(data)
        
        // Check audit logs for each customer
        data.forEach((customer: Customer) => {
          checkAuditLogs(customer.id)
        })
      }
    } catch (error) {
      toast.error("Failed to fetch customers")
    } finally {
      setIsLoading(false)
    }
  }

  const checkAuditLogs = async (customerId: number) => {
    try {
      const response = await fetch(`/api/customers/${customerId}/audit-logs`)
      if (response.ok) {
        const logs = await response.json()
        setAuditLogsMap((prev) => ({ ...prev, [customerId]: logs.length > 0 }))
      }
    } catch (error) {
      console.error("Failed to check audit logs:", error)
    }
  }

  const handleDelete = async () => {
    if (!customerToDelete) return

    try {
      const response = await fetch(`/api/customers/${customerToDelete.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Customer deleted successfully")
        fetchCustomers()
      } else {
        toast.error("Failed to delete customer")
      }
    } catch (error) {
      toast.error("Failed to delete customer")
    } finally {
      setDeleteDialogOpen(false)
      setCustomerToDelete(null)
    }
  }

  const openEditDialog = (customer: Customer) => {
    setSelectedCustomer(customer)
    setFormDialogOpen(true)
  }

  const openCreateDialog = () => {
    setSelectedCustomer(null)
    setFormDialogOpen(true)
  }

  const openAuditDialog = (customer: Customer) => {
    setSelectedCustomer(customer)
    setAuditDialogOpen(true)
  }

  const confirmDelete = (customer: Customer) => {
    setCustomerToDelete(customer)
    setDeleteDialogOpen(true)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading customers...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Customers</h1>
          <p className="text-muted-foreground">
            Manage your customer database
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Add Customer
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <Input
          placeholder="Search customers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
        <div className="flex gap-2 ml-auto">
          <Button
            variant={viewMode === "table" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("table")}
          >
            <TableIcon className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "card" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("card")}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {viewMode === "table" ? (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Company</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    No customers found
                  </TableCell>
                </TableRow>
              ) : (
                filteredCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {customer.name}
                        {auditLogsMap[customer.id] && (
                          <Badge variant="secondary" className="text-xs">
                            Has Changes
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{customer.email || "-"}</TableCell>
                    <TableCell>{customer.phone || "-"}</TableCell>
                    <TableCell>{customer.company || "-"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {auditLogsMap[customer.id] && (
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => openAuditDialog(customer)}
                          >
                            <History className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => openEditDialog(customer)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => confirmDelete(customer)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCustomers.length === 0 ? (
            <div className="col-span-full text-center py-8 text-muted-foreground">
              No customers found
            </div>
          ) : (
            filteredCustomers.map((customer) => (
              <Card key={customer.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        {customer.name}
                        {auditLogsMap[customer.id] && (
                          <Badge variant="secondary" className="text-xs">
                            Changes
                          </Badge>
                        )}
                      </CardTitle>
                      {customer.company && (
                        <CardDescription>{customer.company}</CardDescription>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    {customer.email && (
                      <div>
                        <span className="text-muted-foreground">Email:</span>{" "}
                        {customer.email}
                      </div>
                    )}
                    {customer.phone && (
                      <div>
                        <span className="text-muted-foreground">Phone:</span>{" "}
                        {customer.phone}
                      </div>
                    )}
                    {customer.notes && (
                      <div>
                        <span className="text-muted-foreground">Notes:</span>
                        <p className="text-xs mt-1 line-clamp-2">
                          {customer.notes}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {auditLogsMap[customer.id] && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openAuditDialog(customer)}
                        className="flex-1"
                      >
                        <History className="h-4 w-4 mr-2" />
                        History
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(customer)}
                      className="flex-1"
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => confirmDelete(customer)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      <CustomerFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        customer={selectedCustomer}
        onSuccess={fetchCustomers}
      />

      {selectedCustomer && (
        <AuditLogDialog
          open={auditDialogOpen}
          onOpenChange={setAuditDialogOpen}
          entityType="Customer"
          entityId={selectedCustomer.id}
        />
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the customer &quot;{customerToDelete?.name}&quot;
              and all associated data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
