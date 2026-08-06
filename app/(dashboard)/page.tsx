import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Clock, Terminal, Webhook } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();

  const [attlogsRes, userinfosRes, commandLogsRes, webhookLogsRes] = await Promise.all([
    supabase.from("attlogs").select("*", { count: "exact", head: true }),
    supabase.from("userinfos").select("*", { count: "exact", head: true }),
    supabase.from("command_logs").select("*", { count: "exact", head: true }),
    supabase.from("webhook_logs").select("*", { count: "exact", head: true }),
  ]);

  const [pendingCommandsRes] = await Promise.all([
    supabase.from("command_logs").select("*", { count: "exact", head: true }).eq("status", "pending"),
  ]);

  const [recentAttlogs] = await Promise.all([
    supabase.from("attlogs").select("*").order("created_at", { ascending: false }).limit(5),
  ]);

  const stats = [
    { title: "Total Attendance", value: attlogsRes.count || 0, icon: Clock, color: "text-blue-500" },
    { title: "Total Employees", value: userinfosRes.count || 0, icon: Users, color: "text-green-500" },
    { title: "Commands Sent", value: commandLogsRes.count || 0, icon: Terminal, color: "text-purple-500" },
    { title: "Webhook Events", value: webhookLogsRes.count || 0, icon: Webhook, color: "text-orange-500" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your Fingerspot system</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value.toLocaleString()}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Pending Commands</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-500">
              {pendingCommandsRes.count || 0}
            </div>
            <p className="text-sm text-muted-foreground mt-1">Commands awaiting response</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Registered Devices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">C2696422DF2F3337</span>
                <Badge variant="secondary">Fingerprint</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">S129000853</span>
                <Badge variant="secondary">Face</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Attendance</CardTitle>
        </CardHeader>
        <CardContent>
          {recentAttlogs.data && recentAttlogs.data.length > 0 ? (
            <div className="space-y-2">
              {recentAttlogs.data.map((log) => (
                <div key={log.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                  <div>
                    <span className="font-medium">{log.pin}</span>
                    <span className="text-muted-foreground ml-2">on {log.device_sn}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {log.datetime ? new Date(log.datetime).toLocaleString("id-ID") : "-"}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No attendance records yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
