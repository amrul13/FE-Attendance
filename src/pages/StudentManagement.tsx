"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash, UserCheck } from "lucide-react";

type Student = {
  id: string;
  name: string;
  studentId: string;
  year: number;
  status: "Enrolled" | "Pending";
  avatar: string;
};

const studentsData: Student[] = [
  {
    id: "1",
    name: "Anushka Sharma",
    studentId: "SA-101",
    year: 2021,
    status: "Enrolled",
    avatar: "/avatars/avatar1.png",
  },
  {
    id: "2",
    name: "Bhavin Patel",
    studentId: "SA-102",
    year: 2021,
    status: "Pending",
    avatar: "/avatars/avatar2.png",
  },
  {
    id: "3",
    name: "Catherine Williams",
    studentId: "SA-103",
    year: 2022,
    status: "Enrolled",
    avatar: "/avatars/avatar3.png",
  },
  {
    id: "4",
    name: "David Miller",
    studentId: "SA-104",
    year: 2022,
    status: "Pending",
    avatar: "/avatars/avatar4.png",
  },
];

const StudentManagementPage: React.FC = () => {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"all" | "enrolled" | "pending">("all");

  const filteredStudents = studentsData.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(search.toLowerCase()) ||
      student.studentId.toLowerCase().includes(search.toLowerCase());
    const matchesTab =
      tab === "all" ||
      (tab === "enrolled" && student.status === "Enrolled") ||
      (tab === "pending" && student.status === "Pending");
    return matchesSearch && matchesTab;
  });

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Student Management</h1>
        <Button>Add New Student</Button>
      </div>

      {/* Search & Tabs */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <Input
          placeholder="Search by student name or ID"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />

        <Tabs
          value={tab}
          onValueChange={(v) => setTab(v as any)}
          className="w-full md:w-auto"
        >
          <TabsList>
            <TabsTrigger value="all">All Students</TabsTrigger>
            <TabsTrigger value="enrolled">Enrolled</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Student Name</TableHead>
            <TableHead>Student ID</TableHead>
            <TableHead>Tahun Masuk</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredStudents.map((student) => (
            <TableRow key={student.id}>
              <TableCell className="flex items-center gap-3">
                <img
                  src={student.avatar}
                  alt={student.name}
                  className="w-8 h-8 rounded-full"
                />
                {student.name}
              </TableCell>
              <TableCell>{student.studentId}</TableCell>
              <TableCell>{student.year}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    student.status === "Enrolled" ? "success" : "secondary"
                  }
                >
                  {student.status}
                </Badge>
              </TableCell>
              <TableCell className="flex gap-2">
                {student.status === "Pending" && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex items-center gap-1"
                  >
                    <UserCheck size={16} /> Enroll Face
                  </Button>
                )}
                <Button size="sm" variant="outline">
                  <Pencil size={16} />
                </Button>
                <Button size="sm" variant="destructive">
                  <Trash size={16} />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default StudentManagementPage;
