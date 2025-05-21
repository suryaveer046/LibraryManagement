"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useLibrary } from "@/context/library-context"
import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, MoreHorizontal, Edit, Trash, BookOpen } from "lucide-react"
import { motion } from "framer-motion"
import type { Student } from "@/types/library"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

export default function UsersPage() {
  const { user, students, issuedBooks, deleteStudent, updateStudent } = useLibrary()
  const router = useRouter()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredStudents, setFilteredStudents] = useState<Student[]>(students)
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)
  const [editName, setEditName] = useState("")
  const [editUsername, setEditUsername] = useState("")
  const [editRollNo, setEditRollNo] = useState("")
  const [editPassword, setEditPassword] = useState("")

  // Redirect if not logged in or not admin
  useEffect(() => {
    if (!user) {
      router.push("/")
    } else if (user.role !== "admin") {
      router.push("/dashboard")
      toast({
        title: "Access denied",
        description: "Only administrators can view this page",
        variant: "destructive",
      })
    }
  }, [user, router, toast])

  // Filter students based on search term
  useEffect(() => {
    const filtered = students.filter(
      (student) =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.rollNo.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredStudents(filtered)
  }, [searchTerm, students])

  const handleEdit = (student: Student) => {
    setEditingStudent(student)
    setEditName(student.name)
    setEditUsername(student.username)
    setEditRollNo(student.rollNo)
    setEditPassword(student.password)
  }

  const handleDelete = (studentId: string) => {
    // Check if student has issued books
    const hasIssuedBooks = issuedBooks.some((issue) => issue.studentId === studentId)

    if (hasIssuedBooks) {
      toast({
        title: "Cannot delete student",
        description: "This student has issued books. Please return all books first.",
        variant: "destructive",
      })
      return
    }

    deleteStudent(studentId)
    toast({
      title: "Student deleted",
      description: "The student has been removed from the system",
    })
  }

  const handleSaveEdit = () => {
    if (!editingStudent) return

    // Check if username is already taken by another student
    const isDuplicateUsername = students.some((s) => s.id !== editingStudent.id && s.username === editUsername)

    if (isDuplicateUsername) {
      toast({
        title: "Username already exists",
        description: "Please choose a different username",
        variant: "destructive",
      })
      return
    }

    updateStudent({
      ...editingStudent,
      name: editName,
      username: editUsername,
      rollNo: editRollNo,
      password: editPassword,
    })

    setEditingStudent(null)
    toast({
      title: "Student updated",
      description: "The student details have been updated",
    })
  }

  const getStudentIssuedBooks = (studentId: string) => {
    return issuedBooks.filter((issue) => issue.studentId === studentId)
  }

  if (!user || user.role !== "admin") return null

  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Students Management</h1>

        <div className="relative mb-6">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search students by name, username, or roll number..."
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
                  <TableHead>Name</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Roll Number</TableHead>
                  <TableHead>Books Issued</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center h-24">
                      No students found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStudents.map((student) => {
                    const studentBooks = getStudentIssuedBooks(student.id)

                    return (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">{student.name}</TableCell>
                        <TableCell>{student.username}</TableCell>
                        <TableCell>{student.rollNo}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <BookOpen className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span>{studentBooks.length}</span>
                            {studentBooks.length > 0 && (
                              <Badge variant="outline" className="ml-2">
                                {studentBooks.some((book) => book.status === "requested") ? "Requests Pending" : ""}
                              </Badge>
                            )}
                          </div>
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
                              <DropdownMenuItem onClick={() => handleEdit(student)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDelete(student.id)} className="text-red-600">
                                <Trash className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
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

      {/* Edit Student Dialog */}
      <Dialog open={!!editingStudent} onOpenChange={(open) => !open && setEditingStudent(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
            <DialogDescription>Make changes to the student details below.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input id="name" value={editName} onChange={(e) => setEditName(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="username" className="text-right">
                Username
              </Label>
              <Input
                id="username"
                value={editUsername}
                onChange={(e) => setEditUsername(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="rollNo" className="text-right">
                Roll Number
              </Label>
              <Input
                id="rollNo"
                value={editRollNo}
                onChange={(e) => setEditRollNo(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={editPassword}
                onChange={(e) => setEditPassword(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingStudent(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
