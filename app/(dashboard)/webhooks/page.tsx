"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WEBHOOK_EVENTS } from "@/lib/fingerspot";
import { RefreshCw, Eye, Webhook } from "lucide-react";

interface WebhookLog {
  id: string;
  device_sn: string | null;
  event: string | null;
  status: string | null;
  raw_payload: Record<string, unknown> | null;
  created_at: string;
}

export default function WebhooksPage() {
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedLog, setSelectedLog] = useState<WebhookLog | null>(null);
  const [origin, setOrigin] = useState("");

  const webhookUrl = useMemo(() => origin ? `${origin}/api/webhook` : "", [origin]);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/webhook/logs");
      const data = await res.json();
      if (data.logs) setLogs(data.logs);
    } catch (error) {
      console.error("Failed to load webhook logs:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/webhook/logs");
        const data = await res.json();
        if (!cancelled && data.logs) setLogs(data.logs);
      } catch (error) {
        console.error("Failed to load webhook logs:", error);
      }
      if (!cancelled) setLoading(false);
    };
    fetchData();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (typeof window !== "undefined") setOrigin(window.location.origin);
    return () => { cancelled = true; };
  }, []);

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case "processed":
        return "success";
      case "pending":
        return "pending";
      case "failed":
        return "destructive";
      default:
        return "secondary";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Webhooks</h1>
        <p className="text-muted-foreground">Monitor incoming webhook events from devices</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Webhook className="h-5 w-5" />
            Webhook Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Webhook URL</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={webhookUrl}
                readOnly
                className="flex-1 h-10 rounded-md border border-input bg-muted px-3 py-2 text-sm font-mono"
              />
              <Button
                variant="outline"
                onClick={() => navigator.clipboard.writeText(webhookUrl)}
              >
                Copy
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Set this URL in Fingerspot Customer Portal → Mesin Absensi → Detail → Webhook URL
            </p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Supported Events</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {WEBHOOK_EVENTS.map((event) => (
                <div
                  key={event.event}
                  className="flex items-center gap-2 rounded-md border p-2 text-sm"
                >
                  <Badge variant="outline" className="text-xs">
                    {event.event}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{event.description}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Webhook Logs ({logs.length})</CardTitle>
            <Button variant="outline" size="sm" onClick={loadLogs} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Device</TableHead>
                <TableHead>Event</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No webhook events received yet
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-sm">
                      {new Date(log.created_at).toLocaleString("id-ID")}
                    </TableCell>
                    <TableCell className="font-mono text-sm">{log.device_sn}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{log.event}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(log.status) as "success" | "pending" | "destructive" | "secondary"}>
                        {log.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => setSelectedLog(log)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selectedLog && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Webhook Payload</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setSelectedLog(null)}>
                Close
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <pre className="rounded-md bg-muted p-4 text-sm overflow-auto max-h-96">
              {JSON.stringify(selectedLog.raw_payload, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
