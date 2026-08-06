"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DEVICES } from "@/lib/fingerspot";
import { RefreshCw } from "lucide-react";

interface Pin {
  id: string;
  device_sn: string | null;
  pin: string | null;
  name: string | null;
  status: string | null;
  created_at: string;
}

export default function PinsPage() {
  const [pins, setPins] = useState<Pin[]>([]);
  const [loading, setLoading] = useState(false);
  const [cloudId, setCloudId] = useState(DEVICES[0].cloud_id);

  const loadPins = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/sync-pins?cloud_id=${cloudId}`);
      const data = await res.json();
      if (data.pins) setPins(data.pins);
    } catch (error) {
      console.error("Failed to load pins:", error);
    }
    setLoading(false);
  };

  const syncFromDevice = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/sync-pins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cloud_id: cloudId }),
      });
      const data = await res.json();
      if (data.message) alert(data.message);
      await loadPins();
    } catch (error) {
      console.error("Failed to sync pins:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadPins();
  }, [cloudId]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">PIN Manager</h1>
        <p className="text-muted-foreground">Manage registered PINs on devices</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sync Controls</CardTitle>
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
              Sync PINs from Device
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Registered PINs ({pins.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Device</TableHead>
                <TableHead>PIN</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pins.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No PINs found
                  </TableCell>
                </TableRow>
              ) : (
                pins.map((pin) => (
                  <TableRow key={pin.id}>
                    <TableCell className="font-mono text-sm">{pin.device_sn}</TableCell>
                    <TableCell className="font-mono">{pin.pin}</TableCell>
                    <TableCell>{pin.name || "-"}</TableCell>
                    <TableCell>
                      <Badge variant={pin.status === "active" ? "success" : "secondary"}>
                        {pin.status || "unknown"}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(pin.created_at).toLocaleString("id-ID")}</TableCell>
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
