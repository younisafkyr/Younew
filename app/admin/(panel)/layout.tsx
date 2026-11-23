import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import Sidebar from "@/components/admin/Sidebar";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin", robots: { index: false } };

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  if (!(await isAdmin())) redirect("/admin/login");
  const pending = await db.order.count({ where: { status: "NEW" } });
  return (
    <div className="adm">
      <Sidebar pending={pending} />
      <div className="adm-main">{children}</div>
    </div>
  );
}
