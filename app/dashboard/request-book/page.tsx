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
import { CalendarIcon, AlertCircle } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Book } from "@/types/library"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function RequestBookPage() {
  const { user, books, requestBook, issuedBooks } = useLibrary()
  const router = useRouter()
  const { toast } = useToast()

  const [selectedBook, setSelectedBook] = useState("")
  const [issueDate, setIssueDate] = useState<Date>(new Date())
  const [returnDate, setReturnDate] = useState<Date>(addDays(new Date(), 7))
  const [isSubmitting, setIsSubmitting] = useState(false)

  const availableBooks = books.filter((book) => !issuedBooks.some((issue) => issue.bookId === book.id))

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      router.push("/")
    }
  }, [user, router])

  // Update return date when issue date changes
  useEffect(() => {
    setReturnDate(addDays(issueDate, 7))
  }, [issueDate])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    if (!selectedBook) {
      toast({
        title: "Missing information",
        description: "Please select a book",
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }

    if (!user || user.role !== "student") {
      toast({
        title: "Authentication error",
        description: "You must be logged in as a student to request books",
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }

    // Request the book
    requestBook({
      id: `request-${Date.now()}`,
      bookId: selectedBook,
      studentId: user.id,
      issueDate: issueDate.toISOString(),
      returnDate: returnDate.toISOString(),
      status: "requested",
    })

    toast({
      title: "Book requested",
      description: "Your book request has been submitted",
    })

    // Reset form
    setSelectedBook("")
    setIssueDate(new Date())
    setReturnDate(addDays(new Date(), 7))
    setIsSubmitting(false)
  }

  if (!user) return null

  const getBookById = (id: string): Book | undefined => {
    return books.find((book) => book.id === id)
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Request a Book</h1>

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
              <AlertDescription>All books are currently issued. Please check back later.</AlertDescription>
            </Alert>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Request a Book</CardTitle>
                <CardDescription>Select a book you would like to borrow from the library.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} id="request-book-form" className="space-y-4">
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
                <Button type="submit" form="request-book-form" disabled={isSubmitting}>
                  {isSubmitting ? "Requesting..." : "Request Book"}
                </Button>
              </CardFooter>
            </Card>
          )}
        </motion.div>

        {selectedBook && (
          <div className="mt-6 max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Request Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium">Book Details</h3>
                    <p className="text-sm text-muted-foreground">
                      {getBookById(selectedBook)?.title} by {getBookById(selectedBook)?.author}
                    </p>
                    <p className="text-xs text-muted-foreground">ISBN: {getBookById(selectedBook)?.isbn}</p>
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
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Note</AlertTitle>
                    <AlertDescription>
                      Your request will need to be approved by an administrator before you can collect the book.
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
