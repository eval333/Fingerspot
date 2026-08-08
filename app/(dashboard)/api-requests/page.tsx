"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { DEVICES } from "@/lib/fingerspot";
import { RefreshCw, Eye } from "lucide-react";

interface ApiRequest {
  id: string;
  device_sn: string | null;
  endpoint: string | null;
  method: string | null;
  request_payload: Record<string, unknown> | null;
  response_payload: Record<string, unknown> | null;
  response_code: number | null;
  status: string | null;
  created_at: string;
}

export default function ApiRequestsPage() {
  const [requests, setRequests] = useState<ApiRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [cloudId, setCloudId] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState<ApiRequest | null>(null);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (cloudId !== "all") params.set("cloud_id", cloudId);
      const res = await fetch(`/api/api-requests?${params}`);
      const data = await res.json();
      if (data.requests) setRequests(data.requests);
    } catch (error) {
      console.error("Failed to load requests:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (cloudId !== "all") params.set("cloud_id", cloudId);
        const res = await fetch(`/api/api-requests?${params}`);
        const data = await res.json();
        if (!cancelled && data.requests) setRequests(data.requests);
      } catch (error) {
        console.error("Failed to load requests:", error);
      }
      if (!cancelled) setLoading(false);
    };
    fetchData();
    return () => { cancelled = true; };
  }, [cloudId]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">API Logs</h1>
        <p className="text-muted-foreground">View all API requests to Fingerspot</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Request Logs</CardTitle>
            <div className="flex gap-2">
              <Select value={cloudId} onChange={(e) => setCloudId(e.target.value)}>
                <option value="all">All Devices</option>
                {DEVICES.map((d) => (
                  <option key={d.cloud_id} value={d.cloud_id}>
                    {d.cloud_id}
                  </option>
                ))}
              </Select>
              <Button variant="outline" size="sm" onClick={loadRequests} disabled={loading}>
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Device</TableHead>
                <TableHead>Endpoint</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Status Code</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    No API requests logged
                  </TableCell>
                </TableRow>
              ) : (
                requests.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell className="text-sm">
                      {new Date(req.created_at).toLocaleString("id-ID")}
                    </TableCell>
                    <TableCell className="font-mono text-sm">{req.device_sn}</TableCell>
                    <TableCell>{req.endpoint}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{req.method}</Badge>
                    </TableCell>
                    <TableCell>{req.response_code || "-"}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          req.status === "success"
                            ? "success"
                            : req.status === "failed"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {req.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedRequest(req)}
                      >
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

      {selectedRequest && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Request Detail</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setSelectedRequest(null)}>
                Close
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Request</label>
                <pre className="rounded-md bg-muted p-4 text-sm overflow-auto max-h-64 mt-2">
                  {JSON.stringify(selectedRequest.request_payload, null, 2)}
                </pre>
              </div>
              <div>
                <label className="text-sm font-medium">Response</label>
                <pre className="rounded-md bg-muted p-4 text-sm overflow-auto max-h-64 mt-2">
                  {JSON.stringify(selectedRequest.response_payload, null, 2)}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
