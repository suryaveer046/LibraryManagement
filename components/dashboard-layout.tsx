"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useLibrary } from "@/context/library-context"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { BookOpen, Users, LogOut, Menu, X, Home, PlusCircle, BookCopy, User, BookMarked } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarTrigger,
} from "@/components/ui/sidebar"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logout } = useLibrary()
  const router = useRouter()
  const { toast } = useToast()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      router.push("/")
    }
  }, [user, router])

  const handleLogout = () => {
    logout()
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    })
    router.push("/")
  }

  if (!user) return null

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background">
        {/* Desktop Sidebar */}
        <Sidebar className="hidden md:flex">
          <SidebarHeader className="p-4">
            <Link href="/dashboard" className="flex items-center gap-2">
              <BookOpen className="h-6 w-6" />
              <span className="font-bold text-xl">Library MS</span>
            </Link>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link href="/dashboard">
                        <Home className="h-4 w-4" />
                        <span>Dashboard</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link href="/dashboard/books">
                        <BookOpen className="h-4 w-4" />
                        <span>View Books</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  {user.role === "admin" && (
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link href="/dashboard/books/add">
                          <PlusCircle className="h-4 w-4" />
                          <span>Add Book</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )}
                  {user.role === "admin" ? (
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link href="/dashboard/issue-books">
                          <BookCopy className="h-4 w-4" />
                          <span>Issue Book</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ) : (
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link href="/dashboard/request-book">
                          <BookCopy className="h-4 w-4" />
                          <span>Request Book</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )}
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link href="/dashboard/issued-books">
                        <BookMarked className="h-4 w-4" />
                        <span>{user.role === "admin" ? "Issued Books" : "My Books"}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  {user.role === "admin" && (
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link href="/dashboard/users">
                          <Users className="h-4 w-4" />
                          <span>Manage Users</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5" />
                <div>
                  <p className="text-sm font-medium">{user.name || (user.role === "admin" ? "Admin" : "Student")}</p>
                  <p className="text-xs text-muted-foreground">{user.role}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>

        {/* Mobile Header */}
        <div className="fixed top-0 left-0 right-0 z-30 bg-background border-b md:hidden">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-6 w-6" />
              <span className="font-bold text-xl">Library MS</span>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, x: -300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -300 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-20 bg-background md:hidden pt-16"
            >
              <div className="flex flex-col h-full">
                <div className="flex-1 overflow-auto p-4">
                  <nav className="space-y-4">
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-2 p-2 rounded-md hover:bg-accent"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Home className="h-5 w-5" />
                      <span>Dashboard</span>
                    </Link>
                    <Link
                      href="/dashboard/books"
                      className="flex items-center gap-2 p-2 rounded-md hover:bg-accent"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <BookOpen className="h-5 w-5" />
                      <span>View Books</span>
                    </Link>
                    {user.role === "admin" && (
                      <Link
                        href="/dashboard/books/add"
                        className="flex items-center gap-2 p-2 rounded-md hover:bg-accent"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <PlusCircle className="h-5 w-5" />
                        <span>Add Book</span>
                      </Link>
                    )}
                    {user.role === "admin" ? (
                      <Link
                        href="/dashboard/issue-books"
                        className="flex items-center gap-2 p-2 rounded-md hover:bg-accent"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <BookCopy className="h-5 w-5" />
                        <span>Issue Book</span>
                      </Link>
                    ) : (
                      <Link
                        href="/dashboard/request-book"
                        className="flex items-center gap-2 p-2 rounded-md hover:bg-accent"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <BookCopy className="h-5 w-5" />
                        <span>Request Book</span>
                      </Link>
                    )}
                    <Link
                      href="/dashboard/issued-books"
                      className="flex items-center gap-2 p-2 rounded-md hover:bg-accent"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <BookMarked className="h-5 w-5" />
                      <span>{user.role === "admin" ? "Issued Books" : "My Books"}</span>
                    </Link>
                    {user.role === "admin" && (
                      <Link
                        href="/dashboard/users"
                        className="flex items-center gap-2 p-2 rounded-md hover:bg-accent"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Users className="h-5 w-5" />
                        <span>Manage Users</span>
                      </Link>
                    )}
                  </nav>
                </div>
                <div className="p-4 border-t">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      <div>
                        <p className="text-sm font-medium">
                          {user.name || (user.role === "admin" ? "Admin" : "Student")}
                        </p>
                        <p className="text-xs text-muted-foreground">{user.role}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={handleLogout}>
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main
          className={cn(
            "flex-1 md:ml-0",
            "md:pt-0 pt-16", // Add padding top on mobile for the header
          )}
        >
          <div className="hidden md:block">
            <div className="flex items-center p-4 border-b">
              <SidebarTrigger className="mr-2" />
              <div className="flex-1" />
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {children}
        </main>
      </div>
    </SidebarProvider>
  )
}
