"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Users } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-4"
      >
        <Card className="border-2 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">Library Management System</CardTitle>
            <CardDescription>Choose your login type</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <Link href="/login/admin">
                <Button variant="outline" className="w-full h-20 text-lg justify-start gap-4">
                  <Users className="h-6 w-6" />
                  <div className="flex flex-col items-start">
                    <span>Login as Admin</span>
                    <span className="text-xs text-muted-foreground">Manage books, users and issues</span>
                  </div>
                </Button>
              </Link>
            </motion.div>

            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <Link href="/login/student">
                <Button variant="outline" className="w-full h-20 text-lg justify-start gap-4">
                  <BookOpen className="h-6 w-6" />
                  <div className="flex flex-col items-start">
                    <span>Login as Student</span>
                    <span className="text-xs text-muted-foreground">View and request books</span>
                  </div>
                </Button>
              </Link>
            </motion.div>
          </CardContent>
          <CardFooter className="flex justify-center text-sm text-muted-foreground">
            Library Management System v1.0
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}
