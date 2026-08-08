"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { DEVICES } from "@/lib/fingerspot";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

export default function NewUserPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const deviceParam = searchParams.get("device") || DEVICES[0].cloud_id;

  const [cloudId, setCloudId] = useState(deviceParam);
  const [pin, setPin] = useState("");
  const [name, setName] = useState("");
  const [card, setCard] = useState("");
  const [password, setPassword] = useState("");
  const [privilege, setPrivilege] = useState("0");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/sync-users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cloud_id: cloudId,
          pin,
          name,
          card,
          password,
          privilege: parseInt(privilege),
        }),
      });
      const data = await res.json();
      if (data.success) {
        router.push("/users");
      } else {
        alert(data.message || "Failed to create user");
      }
    } catch (error) {
      console.error("Failed to create user:", error);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/users">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Add Employee</h1>
          <p className="text-muted-foreground">Create a new employee on device</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Employee Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
            <div className="space-y-2">
              <label className="text-sm font-medium">Device (cloud_id)</label>
              <Select value={cloudId} onChange={(e) => setCloudId(e.target.value)}>
                {DEVICES.map((d) => (
                  <option key={d.cloud_id} value={d.cloud_id}>
                    {d.cloud_id}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">PIN *</label>
              <Input value={pin} onChange={(e) => setPin(e.target.value)} required placeholder="Employee PIN" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Name *</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Employee name" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">RFID Card</label>
              <Input value={card} onChange={(e) => setCard(e.target.value)} placeholder="RFID card number" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Device password" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Privilege</label>
              <Select value={privilege} onChange={(e) => setPrivilege(e.target.value)}>
                <option value="0">User</option>
                <option value="1">Admin</option>
                <option value="2">Super Admin</option>
              </Select>
            </div>
            <Button type="submit" disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? "Creating..." : "Create User"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
