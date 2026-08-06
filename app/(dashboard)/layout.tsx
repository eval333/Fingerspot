import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  if (supabase) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      redirect("/login");
    }
  }

  return (
    <div className="min-h-screen">
      <Sidebar />
      <div className="md:ml-64">
        <Header />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
