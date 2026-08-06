"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DEVICES, COMMANDS, WEBHOOK_EVENTS, SCAN_TYPES, STATUS_SCAN } from "@/lib/fingerspot";

export default function DocsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Documentation</h1>
        <p className="text-muted-foreground">Fingerspot Developer API reference</p>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="commands">Commands</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="scan-types">Scan Types</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>System Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Architecture</h3>
                <pre className="rounded-md bg-muted p-4 text-sm overflow-auto">
{`┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Browser   │────▶│  Next.js App     │────▶│  Fingerspot API │
│  (Dashboard)│     │  (Vercel)        │     │  (Cloud)        │
└─────────────┘     └──────────────────┘     └─────────────────┘
                           │     ▲
                           │     │
                           ▼     │
                    ┌──────────────────┐
                    │  Supabase        │
                    │  (PostgreSQL)    │
                    └──────────────────┘
                           ▲     │
                           │     │
                    ┌──────────────────┐
                    │  Fingerspot      │
                    │  Device (Webhook)│
                    └──────────────────┘`}
                </pre>
              </div>
              <div>
                <h3 className="font-semibold mb-2">API Info</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><strong>Base URL:</strong> https://developer.fingerspot.io</div>
                  <div><strong>Auth:</strong> Bearer Token</div>
                  <div><strong>Format:</strong> application/json</div>
                  <div><strong>Sync ops:</strong> get_attlog, get_device</div>
                  <div><strong>Async ops:</strong> All others (via webhook)</div>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Response Pattern</h3>
                <p className="text-sm text-muted-foreground">
                  <strong>Sync operations</strong> return full payload directly in HTTP response body.
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Async operations</strong> return confirmation <code>{'{"success": true, "trans_id": "..."}'}</code> and send actual result via webhook callback to device&apos;s registered URL.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="commands">
          <Card>
            <CardHeader>
              <CardTitle>API Endpoints</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {COMMANDS.map((cmd) => (
                  <div key={cmd.command} className="border rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <code className="font-mono font-medium">{cmd.command}</code>
                      <Badge variant={cmd.type === "Sync" ? "outline" : "secondary"}>
                        {cmd.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{cmd.description}</p>
                    <code className="text-xs text-muted-foreground font-mono">POST {cmd.endpoint}</code>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webhooks">
          <Card>
            <CardHeader>
              <CardTitle>Webhook Events</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {WEBHOOK_EVENTS.map((event) => (
                  <div key={event.event} className="border rounded-lg p-4">
                    <code className="font-mono font-medium">{event.event}</code>
                    <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                  </div>
                ))}
              </div>
              <div>
                <h3 className="font-semibold mb-2">Webhook Payload Examples</h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm font-medium">Attlog (real-time)</p>
                    <pre className="rounded-md bg-muted p-3 text-xs overflow-auto">
{`{
  "type": "attlog",
  "cloud_id": "C2696422DF2F3337",
  "data": {
    "pin": "1",
    "scan": "2026-08-06 10:11",
    "verify": "1",
    "status_scan": "0"
  }
}`}
                    </pre>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Get User Info callback</p>
                    <pre className="rounded-md bg-muted p-3 text-xs overflow-auto">
{`{
  "type": "get_userinfo",
  "cloud_id": "C2696422DF2F3337",
  "trans_id": "1",
  "data": {
    "pin": "1",
    "name": "john",
    "privilege": "1",
    "finger": "1",
    "face": "0",
    "password": "111",
    "rfid": "",
    "vein": "0",
    "template": "..."
  }
}`}
                    </pre>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Get User ID List callback</p>
                    <pre className="rounded-md bg-muted p-3 text-xs overflow-auto">
{`{
  "type": "get_userid_list",
  "cloud_id": "C2696422DF2F3337",
  "trans_id": "1",
  "data": {
    "total": 3,
    "pin_arr": ["1", "2", "3"]
  }
}`}
                    </pre>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scan-types">
          <Card>
            <CardHeader>
              <CardTitle>Verification & Status Types</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Verify Method (scan type)</h3>
                <div className="space-y-2">
                  {Object.entries(SCAN_TYPES).map(([code, label]) => (
                    <div key={code} className="flex items-center gap-4 border rounded-lg p-3">
                      <code className="font-mono font-medium w-8">{code}</code>
                      <span>{label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Status Scan (in/out)</h3>
                <div className="space-y-2">
                  {Object.entries(STATUS_SCAN).map(([code, label]) => (
                    <div key={code} className="flex items-center gap-4 border rounded-lg p-3">
                      <code className="font-mono font-medium w-8">{code}</code>
                      <span>{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="database">
          <Card>
            <CardHeader>
              <CardTitle>Database Schema (Supabase)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Tables</h3>
                <div className="space-y-2 text-sm">
                  {[
                    { name: "attlogs", desc: "Log absensi dari device" },
                    { name: "userinfos", desc: "Data user/employee" },
                    { name: "pins", desc: "PIN terdaftar di device" },
                    { name: "api_requests", desc: "Semua request ke Fingerspot API" },
                    { name: "webhook_logs", desc: "Semua webhook yang diterima" },
                    { name: "command_logs", desc: "Log perintah yang dikirim" },
                  ].map((table) => (
                    <div key={table.name} className="border rounded-lg p-3">
                      <code className="font-mono font-medium">{table.name}</code>
                      <span className="text-muted-foreground ml-2">— {table.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Registered Devices</h3>
                <div className="space-y-2">
                  {DEVICES.map((d) => (
                    <div key={d.cloud_id} className="flex items-center justify-between border rounded-lg p-3">
                      <span className="font-mono text-sm">{d.cloud_id}</span>
                      <Badge variant="secondary">{d.type}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
