export interface Book {
  id: string
  title: string
  author: string
  isbn: string
  genre?: string
}

export interface Student {
  id: string
  name: string
  username: string
  password: string
  rollNo: string
}

export interface User {
  id: string
  name: string
  role: "admin" | "student"
}

export interface BookIssue {
  id: string
  bookId: string
  studentId: string
  issueDate: string
  returnDate: string
  status: "issued" | "requested"
}
