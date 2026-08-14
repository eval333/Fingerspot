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

function getDefaultDates() {
  const now = new Date();
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
  return {
    startDate: twoDaysAgo.toISOString().split("T")[0],
    endDate: now.toISOString().split("T")[0],
  };
}

export default function AttendancePage() {
  const [logs, setLogs] = useState<Attlog[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [cloudId, setCloudId] = useState(DEVICES[0].cloud_id);
  const [dates] = useState(getDefaultDates);
  const [startDate, setStartDate] = useState(dates.startDate);
  const [endDate, setEndDate] = useState(dates.endDate);
  const [syncResult, setSyncResult] = useState<string | null>(null);

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

  const syncFromDevice = async () => {
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await fetch("/api/sync-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cloud_id: cloudId, start_date: startDate, end_date: endDate }),
      });
      const data = await res.json();

      if (data.success && data.logs && data.logs.length > 0) {
        setLogs((prev) => {
          const existingIds = new Set(prev.map((l) => l.id));
          const newLogs = data.logs.filter((l: Attlog) => !existingIds.has(l.id));
          return [...newLogs, ...prev];
        });
        setSyncResult(`${data.count} new record(s) synced from device`);
      } else {
        setSyncResult(data.message || "No new records");
      }
    } catch (error) {
      console.error("Failed to sync:", error);
      setSyncResult("Sync failed. Please try again.");
    }
    setSyncing(false);
  };

  useEffect(() => {
    let cancelled = false;
    const loadLocalLogs = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ cloud_id: cloudId });
        const res = await fetch(`/api/sync-logs?${params}`);
        const data = await res.json();
        if (!cancelled && data.logs) setLogs(data.logs);
      } catch (error) {
        console.error("Failed to load logs:", error);
      }
      if (!cancelled) setLoading(false);
    };
    loadLocalLogs();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
            <Button onClick={syncFromDevice} disabled={syncing || loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? "animate-spin" : ""}`} />
              {syncing ? "Syncing..." : "Sync from Device"}
            </Button>
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
          {syncResult && (
            <div className="mt-3 text-sm text-muted-foreground bg-muted/50 rounded-md px-3 py-2">
              {syncResult}
            </div>
          )}
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
                    {loading ? "Loading..." : "No records found. Click Sync from Device to pull data."}
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
