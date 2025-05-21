"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useLibrary } from "@/context/library-context"
import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { motion } from "framer-motion"
import { ArrowLeft } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function AddBookPage() {
  const { user, addBook, books } = useLibrary()
  const router = useRouter()
  const { toast } = useToast()
  const [title, setTitle] = useState("")
  const [author, setAuthor] = useState("")
  const [isbn, setIsbn] = useState("")
  const [genre, setGenre] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Redirect if not logged in or not admin
  useEffect(() => {
    if (!user) {
      router.push("/")
    } else if (user.role !== "admin") {
      router.push("/dashboard")
      toast({
        title: "Access denied",
        description: "Only administrators can add books",
        variant: "destructive",
      })
    }
  }, [user, router, toast])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Check if ISBN already exists
    if (books.some((book) => book.isbn === isbn)) {
      toast({
        title: "Duplicate ISBN",
        description: "A book with this ISBN already exists",
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }

    // Add the book
    addBook({
      id: `book-${Date.now()}`,
      title,
      author,
      isbn,
      genre,
    })

    toast({
      title: "Book added",
      description: "The book has been added to the library",
    })

    // Reset form
    setTitle("")
    setAuthor("")
    setIsbn("")
    setGenre("")
    setIsSubmitting(false)
  }

  if (!user || user.role !== "admin") return null

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/books")} className="mr-2">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">Add New Book</h1>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto"
        >
          <Card>
            <CardHeader>
              <CardTitle>Book Details</CardTitle>
              <CardDescription>Enter the details of the new book to add it to the library.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} id="add-book-form" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="Enter book title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="author">Author</Label>
                  <Input
                    id="author"
                    placeholder="Enter author name"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="isbn">ISBN</Label>
                  <Input
                    id="isbn"
                    placeholder="Enter ISBN number"
                    value={isbn}
                    onChange={(e) => setIsbn(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="genre">Genre</Label>
                  <Select value={genre} onValueChange={setGenre}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select genre" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Fiction">Fiction</SelectItem>
                      <SelectItem value="Non-Fiction">Non-Fiction</SelectItem>
                      <SelectItem value="Science Fiction">Science Fiction</SelectItem>
                      <SelectItem value="Fantasy">Fantasy</SelectItem>
                      <SelectItem value="Mystery">Mystery</SelectItem>
                      <SelectItem value="Romance">Romance</SelectItem>
                      <SelectItem value="Thriller">Thriller</SelectItem>
                      <SelectItem value="Biography">Biography</SelectItem>
                      <SelectItem value="History">History</SelectItem>
                      <SelectItem value="Science">Science</SelectItem>
                      <SelectItem value="Technology">Technology</SelectItem>
                      <SelectItem value="Self-Help">Self-Help</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </form>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => router.push("/dashboard/books")}>
                Cancel
              </Button>
              <Button type="submit" form="add-book-form" disabled={isSubmitting}>
                {isSubmitting ? "Adding..." : "Add Book"}
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  )
}
