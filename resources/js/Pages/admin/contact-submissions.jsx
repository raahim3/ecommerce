import { useState } from "react";
import { Mail, Trash2 } from "lucide-react";
import { AdminLayout } from "@/layouts/admin-layout";

export function AdminContactSubmissionsPage({ submissions = [] }) {
  const [rows, setRows] = useState(submissions);
  const csrf = () => document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "";
  const update = async (id, status) => {
    const response = await fetch(`/admin/contact-submissions/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json", "X-CSRF-TOKEN": csrf() }, body: JSON.stringify({ status }) });
    if (response.ok) setRows((current) => current.map((row) => row.id === id ? { ...row, status } : row));
  };
  const remove = async (id) => {
    const response = await fetch(`/admin/contact-submissions/${id}`, { method: "DELETE", headers: { "X-CSRF-TOKEN": csrf() } });
    if (response.ok) setRows((current) => current.filter((row) => row.id !== id));
  };
  return <div className="space-y-6"><div><h1 className="text-2xl font-extrabold text-slate-900">Contact Submissions</h1><p className="mt-1 text-xs text-slate-500">Messages received from the storefront contact form.</p></div><div className="overflow-hidden rounded-3xl border border-slate-200 bg-white"><table className="w-full text-left text-xs"><thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500"><tr><th className="p-4">Sender</th><th className="p-4">Subject</th><th className="p-4">Message</th><th className="p-4">Status</th><th className="p-4 text-right">Action</th></tr></thead><tbody className="divide-y divide-slate-100">{rows.map((row) => <tr key={row.id}><td className="p-4"><p className="font-bold text-slate-900">{row.name}</p><a className="text-slate-500" href={`mailto:${row.email}`}>{row.email}</a></td><td className="p-4 font-semibold">{row.subject || "General Inquiry"}</td><td className="max-w-md p-4 text-slate-600">{row.message}</td><td className="p-4"><select value={row.status} onChange={(e) => update(row.id, e.target.value)} className="rounded-lg border border-slate-200 px-2 py-1 text-xs"><option value="new">New</option><option value="read">Read</option><option value="replied">Replied</option><option value="archived">Archived</option></select></td><td className="p-4 text-right"><button type="button" onClick={() => remove(row.id)} className="grid size-8 place-items-center rounded-lg text-red-500 hover:bg-red-50" title="Delete submission"><Trash2 className="size-4" /></button></td></tr>)}</tbody></table>{rows.length === 0 && <div className="p-12 text-center text-sm text-slate-400"><Mail className="mx-auto mb-2 size-6" />No contact submissions yet.</div>}</div></div>;
}
AdminContactSubmissionsPage.layout = (page) => <AdminLayout>{page}</AdminLayout>;
export default AdminContactSubmissionsPage;