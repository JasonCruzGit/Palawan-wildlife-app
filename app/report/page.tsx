import { redirect } from "next/navigation";

/** Public /report shortcut → partner report desk (login required). */
export default function ReportRedirectPage() {
  redirect("/partner/report");
}
