"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DEVICES } from "@/lib/fingerspot";
import { RefreshCw, Plus, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";

interface UserInfo {
  id: string;
  device_sn: string | null;
  pin: string | null;
  name: string | null;
  card: string | null;
  privilege: number | null;
  status: string | null;
  created_at: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [cloudId, setCloudId] = useState(DEVICES[0].cloud_id);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/sync-users?cloud_id=${cloudId}`);
      const data = await res.json();
      if (data.users) setUsers(data.users);
    } catch (error) {
      console.error("Failed to load users:", error);
    }
    setLoading(false);
  };

  const syncFromDevice = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/sync-users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cloud_id: cloudId }),
      });
      const data = await res.json();
      if (data.message) alert(data.message);
      await loadUsers();
    } catch (error) {
      console.error("Failed to sync users:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadUsers();
  }, [cloudId]);

  const handleDelete = async (pin: string) => {
    if (!confirm(`Delete user with PIN ${pin}?`)) return;
    try {
      await fetch("/api/sync-users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cloud_id: cloudId, pin }),
      });
      await loadUsers();
    } catch (error) {
      console.error("Failed to delete user:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Employees</h1>
          <p className="text-muted-foreground">Manage employee data on devices</p>
        </div>
        <Button asChild>
          <Link href={`/users/new?device=${cloudId}`}>
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Device Controls</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-end">
            <div className="space-y-2">
              <label className="text-sm font-medium">Device (cloud_id)</label>
              <Select value={cloudId} onChange={(e) => setCloudId(e.target.value)}>
                {DEVICES.map((d) => (
                  <option key={d.cloud_id} value={d.cloud_id}>
                    {d.cloud_id} ({d.type})
                  </option>
                ))}
              </Select>
            </div>
            <Button onClick={syncFromDevice} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Sync from Device
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Users ({users.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>PIN</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Card (RFID)</TableHead>
                <TableHead>Privilege</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.pin}</TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.card || "-"}</TableCell>
                    <TableCell>{user.privilege}</TableCell>
                    <TableCell>
                      <Badge variant={user.status === "active" ? "success" : "secondary"}>
                        {user.status || "unknown"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/users/${user.pin}/edit?device=${cloudId}`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(user.pin!)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
