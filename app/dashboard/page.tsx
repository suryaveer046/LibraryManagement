"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useLibrary } from "@/context/library-context"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Users, BookCopy, BookMarked } from "lucide-react"
import { motion } from "framer-motion"

export default function Dashboard() {
  const { user, books, issuedBooks, students } = useLibrary()
  const router = useRouter()

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      router.push("/")
    }
  }, [user, router])

  if (!user) return null

  // Count user's issued books if student
  const userIssuedBooks =
    user.role === "student" ? issuedBooks.filter((issue) => issue.studentId === user.id).length : issuedBooks.length

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Hello, {user.name || (user.role === "admin" ? "Admin" : "Student")}</h1>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={container}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={item}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Books</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{books.length}</div>
                <p className="text-xs text-muted-foreground">Books in the library</p>
              </CardContent>
            </Card>
          </motion.div>

          {user.role === "admin" && (
            <motion.div variants={item}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{students.length}</div>
                  <p className="text-xs text-muted-foreground">Registered students</p>
                </CardContent>
              </Card>
            </motion.div>
          )}

          <motion.div variants={item}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {user.role === "admin" ? "Total Issued Books" : "My Issued Books"}
                </CardTitle>
                <BookCopy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userIssuedBooks}</div>
                <p className="text-xs text-muted-foreground">
                  {user.role === "admin" ? "Books currently issued" : "Books you have borrowed"}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={item}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Available Books</CardTitle>
                <BookMarked className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{books.length - issuedBooks.length}</div>
                <p className="text-xs text-muted-foreground">Books available for issue</p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Welcome to the Library Management System</CardTitle>
              <CardDescription>
                {user.role === "admin"
                  ? "Manage books, users, and book issues from the sidebar menu."
                  : "Browse books and manage your book issues from the sidebar menu."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                {user.role === "admin"
                  ? "As an administrator, you have full access to all features of the system. You can add, edit, and delete books, manage users, and handle book issues and returns."
                  : "As a student, you can browse the library catalog, request books, and view your currently issued books."}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
