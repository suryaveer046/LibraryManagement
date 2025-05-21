"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useLibrary } from "@/context/library-context"
import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { motion } from "framer-motion"
import { format, addDays } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { CalendarIcon } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Book, Student } from "@/types/library"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function IssueBookPage() {
  const { user, books, students, issuedBooks, issueBook } = useLibrary()
  const router = useRouter()
  const { toast } = useToast()

  const [selectedBook, setSelectedBook] = useState("")
  const [selectedStudent, setSelectedStudent] = useState("")
  const [issueDate, setIssueDate] = useState<Date>(new Date())
  const [returnDate, setReturnDate] = useState<Date>(addDays(new Date(), 7))
  const [isSubmitting, setIsSubmitting] = useState(false)

  const availableBooks = books.filter((book) => !issuedBooks.some((issue) => issue.bookId === book.id))

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      router.push("/")
    } else if (user.role === "student") {
      router.push("/dashboard/request-book")
    }
  }, [user, router])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    if (!selectedBook || !selectedStudent) {
      toast({
        title: "Missing information",
        description: "Please select both a book and a student",
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }

    // Issue the book
    issueBook({
      id: `issue-${Date.now()}`,
      bookId: selectedBook,
      studentId: selectedStudent,
      issueDate: issueDate.toISOString(),
      returnDate: returnDate.toISOString(),
      status: "issued",
    })

    toast({
      title: "Book issued",
      description: "The book has been successfully issued",
    })

    // Reset form
    setSelectedBook("")
    setSelectedStudent("")
    setIssueDate(new Date())
    setReturnDate(addDays(new Date(), 7))
    setIsSubmitting(false)
  }

  // Update return date when issue date changes
  useEffect(() => {
    setReturnDate(addDays(issueDate, 7))
  }, [issueDate])

  if (!user || user.role !== "admin") return null

  const getBookById = (id: string): Book | undefined => {
    return books.find((book) => book.id === id)
  }

  const getStudentById = (id: string): Student | undefined => {
    return students.find((student) => student.id === id)
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Issue Book</h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto"
        >
          {availableBooks.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>No books available</AlertTitle>
              <AlertDescription>
                All books are currently issued. Please wait for returns or add new books.
              </AlertDescription>
            </Alert>
          ) : students.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>No students registered</AlertTitle>
              <AlertDescription>
                There are no students registered in the system. Students need to register first.
              </AlertDescription>
            </Alert>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Issue a Book</CardTitle>
                <CardDescription>Select a book and a student to issue the book.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} id="issue-book-form" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="book">Book</Label>
                    <Select value={selectedBook} onValueChange={setSelectedBook}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a book" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableBooks.map((book) => (
                          <SelectItem key={book.id} value={book.id}>
                            {book.title} by {book.author}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="student">Student</Label>
                    <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a student" />
                      </SelectTrigger>
                      <SelectContent>
                        {students.map((student) => (
                          <SelectItem key={student.id} value={student.id}>
                            {student.name} ({student.rollNo})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="issue-date">Issue Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !issueDate && "text-muted-foreground",
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {issueDate ? format(issueDate, "PPP") : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={issueDate}
                            onSelect={(date) => date && setIssueDate(date)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="return-date">Return Date (7 days)</Label>
                      <Button variant={"outline"} className="w-full justify-start text-left font-normal" disabled>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {returnDate ? format(returnDate, "PPP") : <span>Auto-calculated</span>}
                      </Button>
                    </div>
                  </div>
                </form>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => router.push("/dashboard")}>
                  Cancel
                </Button>
                <Button type="submit" form="issue-book-form" disabled={isSubmitting}>
                  {isSubmitting ? "Issuing..." : "Issue Book"}
                </Button>
              </CardFooter>
            </Card>
          )}
        </motion.div>

        {selectedBook && selectedStudent && (
          <div className="mt-6 max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Issue Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-medium">Book Details</h3>
                      <p className="text-sm text-muted-foreground">
                        {getBookById(selectedBook)?.title} by {getBookById(selectedBook)?.author}
                      </p>
                      <p className="text-xs text-muted-foreground">ISBN: {getBookById(selectedBook)?.isbn}</p>
                    </div>
                    <div>
                      <h3 className="font-medium">Student Details</h3>
                      <p className="text-sm text-muted-foreground">{getStudentById(selectedStudent)?.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Roll No: {getStudentById(selectedStudent)?.rollNo}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-medium">Issue Date</h3>
                      <p className="text-sm text-muted-foreground">{format(issueDate, "PPP")}</p>
                    </div>
                    <div>
                      <h3 className="font-medium">Return Date</h3>
                      <p className="text-sm text-muted-foreground">{format(returnDate, "PPP")}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
