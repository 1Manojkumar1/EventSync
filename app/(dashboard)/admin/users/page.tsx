"use client";

import { useEffect, useState } from "react";
import { MOCK_USERS } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { firestoreService } from "@/lib/firestore";
import { User, Role } from "@/lib/types";
import { UserPlus, Loader2, Shield, User as UserIcon } from "lucide-react";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");

  // New Coordinator Form
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const dbUsers = await firestoreService.getAllUsers();
      // Merge mock users and db users, avoid duplicates by ID
      const allUsers = [...MOCK_USERS];
      dbUsers.forEach(dbU => {
        if (!allUsers.find(mu => mu.id === dbU.id || mu.email === dbU.email)) {
          allUsers.push(dbU);
        }
      });
      setUsers(allUsers);
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateCoordinator = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const newUser: Omit<User, 'id'> = {
        name,
        email,
        username,
        password,
        role: 'coordinator',
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
      };

      await firestoreService.createUser(newUser);
      
      // Reset form
      setName("");
      setEmail("");
      setUsername("");
      setPassword("");
      setIsCreating(false);
      
      // Refresh list
      await fetchUsers();
    } catch (err: any) {
      setError(err.message || "Failed to create coordinator");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">View and manage system users and roles.</p>
        </div>
        <Button onClick={() => setIsCreating(!isCreating)} className="gap-2">
          {isCreating ? "Cancel" : <><UserPlus className="h-4 w-4" /> Create Coordinator</>}
        </Button>
      </div>

      {isCreating && (
        <Card className="border-accent/20 bg-accent/5">
          <CardHeader>
            <CardTitle>Create New Coordinator</CardTitle>
            <CardDescription>Setup access for a new event coordinator.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateCoordinator} className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" value={name} onChange={e => setName(e.target.value)} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="username">Username (Login ID)</Label>
                <Input id="username" value={username} onChange={e => setUsername(e.target.value)} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
              </div>
              {error && <div className="text-sm text-destructive font-medium sm:col-span-2">{error}</div>}
              <div className="sm:col-span-2">
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Coordinator Account"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>Total users registered in the system.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm text-left">
              <thead className="[&_tr]:border-b">
                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <th className="h-12 px-4 align-middle font-medium text-muted-foreground">User</th>
                  <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Role</th>
                  <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Email</th>
                  <th className="h-12 px-4 align-middle font-medium text-muted-foreground text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {isLoading && !isCreating ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-muted-foreground">No users found.</td>
                  </tr>
                ) : (
                  users.map(user => (
                    <tr key={user.id} className="border-b transition-colors hover:bg-muted/50">
                      <td className="p-4 align-middle">
                        <div className="flex items-center gap-3">
                          <img src={user.avatarUrl} alt={user.name} className="h-8 w-8 rounded-full bg-muted" />
                          <div>
                            <div className="font-medium">{user.name}</div>
                            {user.username && <div className="text-xs text-muted-foreground">@{user.username}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 align-middle">
                        <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${
                          user.role === 'admin' ? 'bg-amber-100 text-amber-900 border-amber-200' :
                          user.role === 'coordinator' ? 'bg-blue-100 text-blue-900 border-blue-200' :
                          'bg-slate-100 text-slate-900 border-slate-200'
                        }`}>
                          {user.role === 'admin' && <Shield className="h-3 w-3" />}
                          {user.role}
                        </span>
                      </td>
                      <td className="p-4 align-middle">{user.email}</td>
                      <td className="p-4 align-middle text-right">
                        <Button size="sm" variant="ghost" disabled>Edit</Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
