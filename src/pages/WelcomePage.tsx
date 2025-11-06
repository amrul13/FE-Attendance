"use client";
import { useNavigate } from "react-router-dom"; // import useNavigate

import React, { useState } from "react";
import {
  Mic,
  ClipboardCheck,
  ShieldCheck,
  GraduationCap,
  Presentation,
  ArrowLeft,
//   Users,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
type ModalView = "select_role" | "student_join" | "teacher_login";

/* ---------------- Feature Card ---------------- */
const FeatureCard = ({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) => (
  <Card className="text-center shadow-md hover:shadow-lg transition-all duration-300">
    <CardHeader>
      <div className="flex justify-center items-center mb-3">
        <div className="p-3 rounded-full bg-blue-100 text-blue-600">{icon}</div>
      </div>
      <CardTitle className="text-xl font-semibold">{title}</CardTitle>
      <CardDescription className="text-gray-600 mt-2">
        {description}
      </CardDescription>
    </CardHeader>
  </Card>
);

/* ---------------- Select Role View ---------------- */
const SelectRoleView = ({ onSelect }: { onSelect: (v: ModalView) => void }) => (
  <div className="space-y-6 text-center">
    <h2 className="text-2xl font-semibold">Choose Your Role</h2>
    <p className="text-gray-600">Please select your role to continue.</p>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
      <Card
        onClick={() => onSelect("student_join")}
        className="cursor-pointer hover:scale-[1.02] transition-transform"
      >
        <CardContent className="p-6 text-center space-y-3">
          <GraduationCap className="mx-auto text-blue-600" size={32} />
          <h3 className="font-semibold text-lg">Student</h3>
          <p className="text-gray-500 text-sm">
            Join a session to mark your attendance.
          </p>
        </CardContent>
      </Card>

      <Card
        onClick={() => onSelect("teacher_login")}
        className="cursor-pointer hover:scale-[1.02] transition-transform"
      >
        <CardContent className="p-6 text-center space-y-3">
          <Presentation className="mx-auto text-blue-600" size={32} />
          <h3 className="font-semibold text-lg">Teacher</h3>
          <p className="text-gray-500 text-sm">
            Log in to manage your classes and themes.
          </p>
        </CardContent>
      </Card>
    </div>
  </div>
);

/* ---------------- Student Join View ---------------- */
const StudentJoinView = () => {
  const [sessionCode, setSessionCode] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // hook untuk redirect

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (sessionCode.length !== 6) {
      toast.error("Please enter a valid 6-digit session code.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("https://localhost:8000/attendance/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ session_code: sessionCode }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "Failed to join session");
      }

      const data = await response.json();
      toast.success(`Joined session successfully! Session ID: ${data.id}`);
      navigate("/siswa")
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleJoin} className="space-y-5">
      <div className="space-y-2 text-left">
        <Label htmlFor="session-code">Session Code</Label>
        <Input
          id="session-code"
          placeholder="Enter 6-digit code"
          maxLength={6}
          value={sessionCode}
          onChange={(e) => setSessionCode(e.target.value)}
        />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Joining..." : "Join Session"}
      </Button>
    </form>
  );
};

/* ---------------- Teacher Login View ---------------- */
const TeacherLoginView = () => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <Input id="email" type="email" placeholder="teacher@example.com" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-3 text-gray-500 hover:text-gray-800"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      <div className="text-right text-sm">
        <a href="/forgot-password" className="text-blue-600 hover:underline">
          Forgot Password?
        </a>
      </div>

      <Button type="submit" className="w-full">
        Login
      </Button>
    </form>
  );
};

/* ---------------- Main Modal ---------------- */
const ChooseRoleModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [view, setView] = useState<ModalView>("select_role");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <DialogTitle className="flex justify-between items-center">
            {view !== "select_role" && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setView("select_role")}
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
            <span className="flex-1 text-center">
              {view === "select_role"
                ? "Get Started"
                : view === "student_join"
                ? "Join Session"
                : "Teacher Login"}
            </span>
            <span className="w-8" /> {/* spacer */}
          </DialogTitle>
        </DialogHeader>

        <Separator className="my-3" />

        {view === "select_role" && <SelectRoleView onSelect={setView} />}
        {view === "student_join" && <StudentJoinView />}
        {view === "teacher_login" && <TeacherLoginView />}
      </DialogContent>
    </Dialog>
  );
};

/* ---------------- Welcome Page ---------------- */
export default function WelcomePage() {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white">
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-600">Smart Attendance</h1>
        <div className="space-x-3">
          <Button variant="ghost" onClick={() => setOpen(true)}>
            Login
          </Button>
          <Button>Register</Button>
        </div>
      </header>

      <main className="flex-1">
        <section className="text-center py-24 px-4">
          <h2 className="text-4xl font-bold text-gray-900">
            Effortless Attendance with Your Voice
          </h2>
          <p className="mt-4 text-gray-600 max-w-xl mx-auto">
            Say goodbye to manual roll calls. Smart Attendance simplifies the
            process using voice recognition technology.
          </p>
          <Button
            className="mt-8 text-lg px-8 py-6"
            onClick={() => setOpen(true)}
          >
            Get Started Now
          </Button>
        </section>

        <section className="bg-blue-50/50 py-16">
          <div className="container mx-auto grid md:grid-cols-3 gap-8 px-4">
            <FeatureCard
              icon={<Mic size={28} />}
              title="Voice-Based Check-in"
              description="Simply speak the keyword to record your attendance instantly."
            />
            <FeatureCard
              icon={<ClipboardCheck size={28} />}
              title="Track Your Records"
              description="View attendance history and course details easily."
            />
            <FeatureCard
              icon={<ShieldCheck size={28} />}
              title="Secure & Reliable"
              description="Advanced voice biometrics ensure accurate records."
            />
          </div>
        </section>
      </main>

      <footer className="py-8 text-center text-gray-500 text-sm">
        © 2025 Smart Attendance. All rights reserved.
      </footer>

      <ChooseRoleModal isOpen={open} onClose={() => setOpen(false)} />
    </div>
  );
}
