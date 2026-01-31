"use client";

import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Lock, User as UserIcon, Mail, Calendar, UserPlus } from "lucide-react";

export default function LoginPage() {
  const { login, signup, user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("staff");
  const [studentMode, setStudentMode] = useState<"login" | "signup">("signup");

  // Staff State
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // Student State
  const [email, setEmail] = useState("");
  const [studentPassword, setStudentPassword] = useState("");

  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      // Check if onboarding is needed
      if (user.role === 'participant' && user.onboardingComplete === false) {
        router.push('/onboarding');
      } else if (user.role === 'admin') {
        router.push('/admin');
      } else if (user.role === 'coordinator') {
        router.push('/coordinator/my-events');
      } else {
        router.push('/events');
      }
    }
  }, [user, router]);

  const handleStaffLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login('staff', { username, password });
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.endsWith('@anurag.edu.in')) {
      setError("Email must be a valid college email ending with @anurag.edu.in");
      return;
    }
    if (studentPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      if (studentMode === "signup") {
        await signup(email, studentPassword);
        // Redirect happens via useEffect
      } else {
        await login('student', { email, password: studentPassword });
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
      <div className="hidden bg-primary lg:flex flex-col justify-between p-10 text-primary-foreground">
        <div className="flex items-center gap-2 font-bold text-2xl">
          <Calendar className="h-6 w-6 text-accent" />
          <span>Campus Events</span>
        </div>
        <div className="space-y-4">
          <h1 className="text-5xl font-extrabold tracking-tight leading-tight">
            Connect, <br />
            <span className="text-accent">Celebrate,</span> <br />
            Create Memories.
          </h1>
          <p className="text-lg text-primary-foreground/80 max-w-md">
            The central hub for all university gatherings, workshops, and student activities. Join the community today.
          </p>
        </div>
        <div className="text-sm text-primary-foreground/60">
          © 2026 Anurag University
        </div>
      </div>

      <div className="flex items-center justify-center py-12 px-4">
        <div className="mx-auto grid w-full max-w-[380px] gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold">
              {activeTab === "student" && studentMode === "signup" ? "Create Account" : "Welcome Back"}
            </h1>
            <p className="text-balance text-muted-foreground">
              {activeTab === "student" && studentMode === "signup"
                ? "Sign up with your college email"
                : "Sign in to your account to continue"}
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setError(""); }} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="staff">Staff</TabsTrigger>
              <TabsTrigger value="student">Student</TabsTrigger>
            </TabsList>

            <TabsContent value="staff">
              <form onSubmit={handleStaffLogin} className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="username">Username</Label>
                  <div className="relative">
                    <UserIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="username"
                      placeholder="admin"
                      className="pl-9"
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      className="pl-9"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
                {error && <div className="text-sm text-destructive font-medium">{error}</div>}
                <Button type="submit" className="w-full">
                  Login
                </Button>
                {/* <div className="text-center text-xs text-muted-foreground mt-2">
                  Demo: admin/password123
                </div> */}
              </form>
            </TabsContent>

            <TabsContent value="student">
              <form onSubmit={handleStudentSubmit} className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">College Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="yourrollno@anurag.edu.in"
                      className="pl-9"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <p className="text-[0.8rem] text-muted-foreground">Must be @anurag.edu.in</p>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="student-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="student-password"
                      type="password"
                      placeholder="••••••••"
                      className="pl-9"
                      value={studentPassword}
                      onChange={e => setStudentPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                {error && <div className="text-sm text-destructive font-medium">{error}</div>}
                <Button type="submit" className="w-full gap-2">
                  {studentMode === "signup" ? (
                    <>
                      <UserPlus className="h-4 w-4" /> Sign Up
                    </>
                  ) : (
                    "Login"
                  )}
                </Button>
                <div className="text-center text-sm text-muted-foreground">
                  {studentMode === "signup" ? (
                    <>
                      Already have an account?{" "}
                      <button
                        type="button"
                        onClick={() => { setStudentMode("login"); setError(""); }}
                        className="text-accent underline-offset-4 hover:underline font-medium"
                      >
                        Login
                      </button>
                    </>
                  ) : (
                    <>
                      New student?{" "}
                      <button
                        type="button"
                        onClick={() => { setStudentMode("signup"); setError(""); }}
                        className="text-accent underline-offset-4 hover:underline font-medium"
                      >
                        Create account
                      </button>
                    </>
                  )}
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
