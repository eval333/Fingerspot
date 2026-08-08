"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { SCAN_TYPES, STATUS_SCAN, DEVICES } from "@/lib/fingerspot";
import { Download, RefreshCw } from "lucide-react";

interface Attlog {
  id: string;
  device_sn: string | null;
  pin: string | null;
  datetime: string | null;
  verified: number | null;
  mode: number | null;
  status_scan: number | null;
  status: string | null;
  created_at: string;
}

export default function AttendancePage() {
  const [logs, setLogs] = useState<Attlog[]>([]);
  const [loading, setLoading] = useState(false);
  const [cloudId, setCloudId] = useState(DEVICES[0].cloud_id);
  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ cloud_id: cloudId, start_date: startDate, end_date: endDate });
      const res = await fetch(`/api/sync-logs?${params}`);
      const data = await res.json();
      if (data.logs) setLogs(data.logs);
    } catch (error) {
      console.error("Failed to fetch logs:", error);
    }
    setLoading(false);
  };

  const loadLocalLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ cloud_id: cloudId });
      const res = await fetch(`/api/sync-logs?${params}`);
      const data = await res.json();
      if (data.logs) setLogs(data.logs);
    } catch (error) {
      console.error("Failed to load logs:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadLocalLogs();
  }, []);

  const handleExport = () => {
    const params = new URLSearchParams({ cloud_id: cloudId, start_date: startDate, end_date: endDate });
    window.open(`/api/export?type=attlogs&${params}`, "_blank");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Attendance Logs</h1>
        <p className="text-muted-foreground">View and sync attendance records</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sync Controls</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-end">
            <div className="space-y-2">
              <label className="text-sm font-medium">Device</label>
              <Select value={cloudId} onChange={(e) => setCloudId(e.target.value)}>
                {DEVICES.map((d) => (
                  <option key={d.cloud_id} value={d.cloud_id}>
                    {d.cloud_id}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Start Date</label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">End Date</label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
            <Button onClick={fetchLogs} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Sync from Device
            </Button>
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Records ({logs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Device</TableHead>
                <TableHead>PIN</TableHead>
                <TableHead>Date/Time</TableHead>
                <TableHead>Scan Type</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No records found
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono text-sm">{log.device_sn}</TableCell>
                    <TableCell>{log.pin}</TableCell>
                    <TableCell>
                      {log.datetime ? new Date(log.datetime).toLocaleString("id-ID") : "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {SCAN_TYPES[log.verified ?? 0] || "Unknown"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {STATUS_SCAN[log.status_scan ?? 0] || "Unknown"}
                      </Badge>
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
