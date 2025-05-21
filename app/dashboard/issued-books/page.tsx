"use client"

import { AlertDescription } from "@/components/ui/alert"

import { AlertTitle } from "@/components/ui/alert"

import { Alert } from "@/components/ui/alert"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useLibrary } from "@/context/library-context"
import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, MoreHorizontal, CheckCircle, AlertCircle } from "lucide-react"
import { motion } from "framer-motion"
import { Input } from "@/components/ui/input"
import { format, parseISO, isAfter } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import type { Book, Student, BookIssue } from "@/types/library"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function IssuedBooksPage() {
  const { user, books, students, issuedBooks, returnBook, approveRequest } = useLibrary()
  const router = useRouter()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredIssues, setFilteredIssues] = useState<BookIssue[]>([])
  const [selectedIssue, setSelectedIssue] = useState<BookIssue | null>(null)
  const [isReturnDialogOpen, setIsReturnDialogOpen] = useState(false)
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false)

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      router.push("/")
    }
  }, [user, router])

  // Filter issues based on search term and user role
  useEffect(() => {
    let filtered = issuedBooks

    // If student, only show their issues
    if (user && user.role === "student") {
      filtered = filtered.filter((issue) => issue.studentId === user.id)
    }

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter((issue) => {
        const book = getBookById(issue.bookId)
        const student = getStudentById(issue.studentId)

        return (
          book?.title.toLowerCase().includes(term) ||
          book?.author.toLowerCase().includes(term) ||
          student?.name.toLowerCase().includes(term) ||
          student?.rollNo.toLowerCase().includes(term)
        )
      })
    }

    setFilteredIssues(filtered)
  }, [searchTerm, issuedBooks, user])

  const getBookById = (id: string): Book | undefined => {
    return books.find((book) => book.id === id)
  }

  const getStudentById = (id: string): Student | undefined => {
    return students.find((student) => student.id === id)
  }

  const isOverdue = (returnDate: string): boolean => {
    return isAfter(new Date(), parseISO(returnDate))
  }

  const handleReturn = (issue: BookIssue) => {
    setSelectedIssue(issue)
    setIsReturnDialogOpen(true)
  }

  const handleApprove = (issue: BookIssue) => {
    setSelectedIssue(issue)
    setIsApproveDialogOpen(true)
  }

  const confirmReturn = () => {
    if (!selectedIssue) return

    returnBook(selectedIssue.id)
    toast({
      title: "Book returned",
      description: "The book has been marked as returned",
    })

    setIsReturnDialogOpen(false)
    setSelectedIssue(null)
  }

  const confirmApprove = () => {
    if (!selectedIssue) return

    approveRequest(selectedIssue.id)
    toast({
      title: "Request approved",
      description: "The book request has been approved",
    })

    setIsApproveDialogOpen(false)
    setSelectedIssue(null)
  }

  if (!user) return null

  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">{user.role === "admin" ? "All Issued Books" : "My Issued Books"}</h1>

        <div className="relative mb-6">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by book title, author, or student name..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Book Title</TableHead>
                  <TableHead>Author</TableHead>
                  {user.role === "admin" && <TableHead>Student</TableHead>}
                  <TableHead>Issue Date</TableHead>
                  <TableHead>Return Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredIssues.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={user.role === "admin" ? 7 : 6} className="text-center h-24">
                      No issued books found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredIssues.map((issue) => {
                    const book = getBookById(issue.bookId)
                    const student = getStudentById(issue.studentId)
                    const isBookOverdue = isOverdue(issue.returnDate)

                    return (
                      <TableRow key={issue.id}>
                        <TableCell className="font-medium">{book?.title || "Unknown Book"}</TableCell>
                        <TableCell>{book?.author || "Unknown Author"}</TableCell>
                        {user.role === "admin" && <TableCell>{student?.name || "Unknown Student"}</TableCell>}
                        <TableCell>{format(parseISO(issue.issueDate), "MMM d, yyyy")}</TableCell>
                        <TableCell>{format(parseISO(issue.returnDate), "MMM d, yyyy")}</TableCell>
                        <TableCell>
                          {issue.status === "requested" ? (
                            <Badge
                              variant="outline"
                              className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                            >
                              Requested
                            </Badge>
                          ) : isBookOverdue ? (
                            <Badge
                              variant="outline"
                              className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                            >
                              Overdue
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                            >
                              Issued
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {user.role === "admin" && issue.status === "requested" && (
                                <DropdownMenuItem onClick={() => handleApprove(issue)}>
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Approve Request
                                </DropdownMenuItem>
                              )}
                              {(user.role === "admin" || issue.status !== "requested") && (
                                <DropdownMenuItem onClick={() => handleReturn(issue)}>
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  {issue.status === "requested" ? "Cancel Request" : "Return Book"}
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </motion.div>
      </div>

      {/* Return Book Dialog */}
      <Dialog open={isReturnDialogOpen} onOpenChange={setIsReturnDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedIssue?.status === "requested" ? "Cancel Book Request" : "Return Book"}</DialogTitle>
            <DialogDescription>
              {selectedIssue?.status === "requested"
                ? "Are you sure you want to cancel this book request?"
                : "Are you sure you want to mark this book as returned?"}
            </DialogDescription>
          </DialogHeader>
          {selectedIssue && (
            <div className="py-4">
              <p className="font-medium">{getBookById(selectedIssue.bookId)?.title}</p>
              <p className="text-sm text-muted-foreground">by {getBookById(selectedIssue.bookId)?.author}</p>
              {user.role === "admin" && (
                <p className="text-sm text-muted-foreground mt-2">
                  Issued to: {getStudentById(selectedIssue.studentId)?.name}
                </p>
              )}
              <div className="flex justify-between mt-4 text-sm">
                <span>Issue Date: {format(parseISO(selectedIssue.issueDate), "MMM d, yyyy")}</span>
                <span>Return Date: {format(parseISO(selectedIssue.returnDate), "MMM d, yyyy")}</span>
              </div>
              {isOverdue(selectedIssue.returnDate) && selectedIssue.status !== "requested" && (
                <div className="mt-4">
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Overdue</AlertTitle>
                    <AlertDescription>
                      This book is overdue. It was due on {format(parseISO(selectedIssue.returnDate), "MMM d, yyyy")}.
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReturnDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmReturn}>
              {selectedIssue?.status === "requested" ? "Cancel Request" : "Confirm Return"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve Request Dialog */}
      <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Book Request</DialogTitle>
            <DialogDescription>Are you sure you want to approve this book request?</DialogDescription>
          </DialogHeader>
          {selectedIssue && (
            <div className="py-4">
              <p className="font-medium">{getBookById(selectedIssue.bookId)?.title}</p>
              <p className="text-sm text-muted-foreground">by {getBookById(selectedIssue.bookId)?.author}</p>
              <p className="text-sm text-muted-foreground mt-2">
                Requested by: {getStudentById(selectedIssue.studentId)?.name}
              </p>
              <div className="flex justify-between mt-4 text-sm">
                <span>Issue Date: {format(parseISO(selectedIssue.issueDate), "MMM d, yyyy")}</span>
                <span>Return Date: {format(parseISO(selectedIssue.returnDate), "MMM d, yyyy")}</span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsApproveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmApprove}>Approve Request</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
