"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { Book, Student, User, BookIssue } from "@/types/library"

// Sample books data
const sampleBooks: Book[] = [
  {
    id: "book-1",
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    isbn: "9780061120084",
    genre: "Fiction",
  },
  {
    id: "book-2",
    title: "1984",
    author: "George Orwell",
    isbn: "9780451524935",
    genre: "Science Fiction",
  },
  {
    id: "book-3",
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    isbn: "9780743273565",
    genre: "Fiction",
  },
  {
    id: "book-4",
    title: "Pride and Prejudice",
    author: "Jane Austen",
    isbn: "9780141439518",
    genre: "Romance",
  },
  {
    id: "book-5",
    title: "The Catcher in the Rye",
    author: "J.D. Salinger",
    isbn: "9780316769488",
    genre: "Fiction",
  },
  {
    id: "book-6",
    title: "The Hobbit",
    author: "J.R.R. Tolkien",
    isbn: "9780547928227",
    genre: "Fantasy",
  },
  {
    id: "book-7",
    title: "Harry Potter and the Philosopher's Stone",
    author: "J.K. Rowling",
    isbn: "9780747532743",
    genre: "Fantasy",
  },
  {
    id: "book-8",
    title: "The Lord of the Rings",
    author: "J.R.R. Tolkien",
    isbn: "9780618640157",
    genre: "Fantasy",
  },
  {
    id: "book-9",
    title: "The Alchemist",
    author: "Paulo Coelho",
    isbn: "9780062315007",
    genre: "Fiction",
  },
  {
    id: "book-10",
    title: "The Da Vinci Code",
    author: "Dan Brown",
    isbn: "9780307474278",
    genre: "Mystery",
  },
  {
    id: "book-11",
    title: "The Hunger Games",
    author: "Suzanne Collins",
    isbn: "9780439023481",
    genre: "Science Fiction",
  },
  {
    id: "book-12",
    title: "The Shining",
    author: "Stephen King",
    isbn: "9780307743657",
    genre: "Horror",
  },
  {
    id: "book-13",
    title: "Brave New World",
    author: "Aldous Huxley",
    isbn: "9780060850524",
    genre: "Science Fiction",
  },
  {
    id: "book-14",
    title: "The Odyssey",
    author: "Homer",
    isbn: "9780140268867",
    genre: "Classic",
  },
  {
    id: "book-15",
    title: "Moby-Dick",
    author: "Herman Melville",
    isbn: "9780142437247",
    genre: "Adventure",
  },
]

interface LibraryContextType {
  user: User | null
  books: Book[]
  students: Student[]
  issuedBooks: BookIssue[]
  loginAdmin: () => void
  loginStudent: (student: Student) => void
  registerStudent: (student: Student) => void
  logout: () => void
  addBook: (book: Book) => void
  updateBook: (book: Book) => void
  deleteBook: (bookId: string) => void
  updateStudent: (student: Student) => void
  deleteStudent: (studentId: string) => void
  issueBook: (issue: BookIssue) => void
  returnBook: (issueId: string) => void
  requestBook: (request: BookIssue) => void
  approveRequest: (requestId: string) => void
}

const LibraryContext = createContext<LibraryContextType | undefined>(undefined)

export const LibraryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [books, setBooks] = useState<Book[]>(sampleBooks)
  const [students, setStudents] = useState<Student[]>([])
  const [issuedBooks, setIssuedBooks] = useState<BookIssue[]>([])

  // Load data from localStorage on initial render
  useEffect(() => {
    const storedBooks = localStorage.getItem("library-books")
    const storedStudents = localStorage.getItem("library-students")
    const storedIssuedBooks = localStorage.getItem("library-issued-books")

    if (storedBooks) {
      setBooks(JSON.parse(storedBooks))
    }
    if (storedStudents) {
      setStudents(JSON.parse(storedStudents))
    }
    if (storedIssuedBooks) {
      setIssuedBooks(JSON.parse(storedIssuedBooks))
    }
  }, [])

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("library-books", JSON.stringify(books))
  }, [books])

  useEffect(() => {
    localStorage.setItem("library-students", JSON.stringify(students))
  }, [students])

  useEffect(() => {
    localStorage.setItem("library-issued-books", JSON.stringify(issuedBooks))
  }, [issuedBooks])

  const loginAdmin = () => {
    setUser({
      id: "admin",
      name: "Admin",
      role: "admin",
    })
  }

  const loginStudent = (student: Student) => {
    setUser({
      id: student.id,
      name: student.name,
      role: "student",
    })
  }

  const registerStudent = (student: Student) => {
    setStudents([...students, student])
  }

  const logout = () => {
    setUser(null)
  }

  const addBook = (book: Book) => {
    setBooks([...books, book])
  }

  const updateBook = (updatedBook: Book) => {
    setBooks(books.map((book) => (book.id === updatedBook.id ? updatedBook : book)))
  }

  const deleteBook = (bookId: string) => {
    setBooks(books.filter((book) => book.id !== bookId))
  }

  const updateStudent = (updatedStudent: Student) => {
    setStudents(students.map((student) => (student.id === updatedStudent.id ? updatedStudent : student)))
  }

  const deleteStudent = (studentId: string) => {
    setStudents(students.filter((student) => student.id !== studentId))
  }

  const issueBook = (issue: BookIssue) => {
    setIssuedBooks([...issuedBooks, issue])
  }

  const returnBook = (issueId: string) => {
    setIssuedBooks(issuedBooks.filter((issue) => issue.id !== issueId))
  }

  const requestBook = (request: BookIssue) => {
    setIssuedBooks([...issuedBooks, request])
  }

  const approveRequest = (requestId: string) => {
    setIssuedBooks(issuedBooks.map((issue) => (issue.id === requestId ? { ...issue, status: "issued" } : issue)))
  }

  return (
    <LibraryContext.Provider
      value={{
        user,
        books,
        students,
        issuedBooks,
        loginAdmin,
        loginStudent,
        registerStudent,
        logout,
        addBook,
        updateBook,
        deleteBook,
        updateStudent,
        deleteStudent,
        issueBook,
        returnBook,
        requestBook,
        approveRequest,
      }}
    >
      {children}
    </LibraryContext.Provider>
  )
}

export const useLibrary = () => {
  const context = useContext(LibraryContext)
  if (context === undefined) {
    throw new Error("useLibrary must be used within a LibraryProvider")
  }
  return context
}
