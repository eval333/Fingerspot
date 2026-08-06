"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DEVICES, COMMANDS } from "@/lib/fingerspot";
import { Play, Clock, CheckCircle, XCircle } from "lucide-react";

interface CommandLog {
  id: string;
  device_sn: string | null;
  trans_id: string | null;
  command: string | null;
  request_payload: Record<string, unknown> | null;
  response_payload: Record<string, unknown> | null;
  response_code: number | null;
  status: string | null;
  created_at: string;
}

const today = new Date().toISOString().split("T")[0];
const twoDaysAgo = new Date(Date.now() - 2 * 86400000).toISOString().split("T")[0];

const DEFAULT_PARAMS: Record<string, string> = {
  get_attlog: JSON.stringify({ start_date: twoDaysAgo, end_date: today }, null, 2),
  get_device: JSON.stringify({}, null, 2),
  get_userinfo: JSON.stringify({ pin: "1" }, null, 2),
  set_userinfo: JSON.stringify({ pin: "1", name: "Nama Karyawan", privilege: "0", rfid: "", password: "", finger: "", face: "", vein: "" }, null, 2),
  delete_userinfo: JSON.stringify({ pin: "1" }, null, 2),
  get_all_pin: JSON.stringify({}, null, 2),
  set_time: JSON.stringify({}, null, 2),
  restart_device: JSON.stringify({}, null, 2),
  reg_online: JSON.stringify({ pin: "1" }, null, 2),
};

export default function CommandsPage() {
  const [cloudId, setCloudId] = useState(DEVICES[0].cloud_id);
  const [command, setCommand] = useState("get_attlog");
  const [params, setParams] = useState(DEFAULT_PARAMS["get_attlog"]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CommandLog | null>(null);
  const [logs, setLogs] = useState<CommandLog[]>([]);

  const selectedCommand = COMMANDS.find((c) => c.command === command);

  useEffect(() => {
    setParams(DEFAULT_PARAMS[command] || "{}");
  }, [command]);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await fetch("/api/commands");
      const data = await res.json();
      if (data.logs) setLogs(data.logs);
    } catch (error) {
      console.error("Failed to fetch logs:", error);
    }
  };

  const executeCommand = async () => {
    setLoading(true);
    setResult(null);
    try {
      let parsedParams = {};
      try {
        parsedParams = JSON.parse(params);
      } catch {
        alert("Invalid JSON parameters");
        setLoading(false);
        return;
      }

      const res = await fetch("/api/commands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cloud_id: cloudId,
          command,
          params: parsedParams,
        }),
      });
      const data = await res.json();
      if (data.log) setResult(data.log);
      if (data.logs) setLogs(data.logs);
    } catch (error) {
      console.error("Command failed:", error);
    }
    setLoading(false);
  };

  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">API Tester</h1>
        <p className="text-muted-foreground">Send commands to Fingerspot devices</p>
      </div>

      <Tabs defaultValue="send">
        <TabsList>
          <TabsTrigger value="send">Send Command</TabsTrigger>
          <TabsTrigger value="logs">Command Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="send">
          <Card>
            <CardHeader>
              <CardTitle>Execute Command</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <div className="space-y-2">
                  <label className="text-sm font-medium">Command</label>
                  <Select value={command} onChange={(e) => setCommand(e.target.value)}>
                    {COMMANDS.map((c) => (
                      <option key={c.command} value={c.command}>
                        {c.command} ({c.type})
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              {selectedCommand && (
                <div className="rounded-md bg-muted p-3 text-sm">
                  <span className="font-medium">{selectedCommand.description}</span>
                  <span className="ml-2 text-muted-foreground">({selectedCommand.type})</span>
                  <div className="text-xs text-muted-foreground mt-1 font-mono">
                    POST {selectedCommand.endpoint}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">Parameters (JSON)</label>
                <Textarea
                  value={params}
                  onChange={(e) => setParams(e.target.value)}
                  rows={8}
                  className="font-mono text-sm"
                />
              </div>

              <Button onClick={executeCommand} disabled={loading}>
                <Play className="h-4 w-4 mr-2" />
                {loading ? "Executing..." : "Execute Command"}
              </Button>

              {result && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Response</label>
                  <pre className="rounded-md bg-muted p-4 text-sm overflow-auto max-h-64">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Recent Commands</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {logs.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No command logs yet. Execute a command to see results.
                  </p>
                ) : (
                  logs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-center justify-between border rounded-lg p-3"
                    >
                      <div className="flex items-center gap-3">
                        {getStatusIcon(log.status)}
                        <div>
                          <span className="font-medium">{log.command}</span>
                          <span className="text-muted-foreground ml-2">on {log.device_sn}</span>
                          {log.trans_id && (
                            <span className="text-xs text-muted-foreground ml-2">
                              trans_id: {log.trans_id}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={
                            log.status === "success"
                              ? "success"
                              : log.status === "pending"
                              ? "pending"
                              : "destructive"
                          }
                        >
                          {log.status}
                        </Badge>
                        <div className="text-xs text-muted-foreground mt-1">
                          {new Date(log.created_at).toLocaleString("id-ID")}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
