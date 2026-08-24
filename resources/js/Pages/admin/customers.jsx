import { useState, useMemo } from "react";
import { Link } from "@inertiajs/react";
import {
  Users,
  Search,
  Mail,
  ShoppingBag,
  DollarSign,
  Calendar,
  ExternalLink,
  ChevronRight,
  Eye,
  X,
  Package,
  MapPin,
  Clock,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { formatPrice } from "@/lib/shop-data";
import { cn } from "@/lib/utils";
import { downloadCsv } from "@/lib/export-csv";
import { AdminLayout } from "@/layouts/admin-layout";

const MOCK_CUSTOMERS = [
  {
    id: 1,
    name: "Alex Rivers",
    email: "alex@example.com",
    phone: "+1 (555) 234-5678",
    orders_count: 5,
    total_spent: 1420.50,
    created_at: "2026-01-15T10:00:00Z",
    tier: "VIP Concierge",
    status: "Active",
  },
  {
    id: 2,
    name: "Sofia Lindqvist",
    email: "sofia@nordic.se",
    phone: "+46 70 123 4567",
    orders_count: 3,
    total_spent: 890.00,
    created_at: "2026-02-01T14:30:00Z",
    tier: "Preferred Member",
    status: "Active",
  },
  {
    id: 3,
    name: "Marcus Vance",
    email: "marcus.v@atelier-club.com",
    phone: "+1 (555) 987-6543",
    orders_count: 2,
    total_spent: 450.00,
    created_at: "2026-02-10T09:15:00Z",
    tier: "Member",
    status: "Active",
  },
];

export function AdminCustomersPage({ customers: serverCustomers = { data: [] }, filters = {} }) {
  const serverData = serverCustomers?.data ?? [];
  const initialCustomers = serverData.length > 0
    ? serverData.map((c) => ({
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone || "—",
        orders_count: c.orders_count ?? 0,
        total_spent: c.total_spent ? parseFloat(c.total_spent) : 0,
        created_at: c.created_at,
        tier: (c.orders_count > 3) ? "VIP Concierge" : (c.orders_count > 0) ? "Preferred Member" : "Member",
        status: "Active",
      }))
    : MOCK_CUSTOMERS;

  const [customers, setCustomers] = useState(initialCustomers);
  const [searchQuery, setSearchQuery] = useState(filters.search ?? "");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [customerDetails, setCustomerDetails] = useState(null);

  const filteredCustomers = useMemo(() => {
    if (!searchQuery.trim()) return customers;
    const q = searchQuery.toLowerCase();
    return customers.filter(
      (c) => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)
    );
  }, [customers, searchQuery]);

  const handleInspect = async (customer) => {
    setSelectedCustomer(customer);
    setLoadingDetails(true);
    try {
      const res = await fetch(`/admin/customers/${customer.id}`, {
        headers: { "X-Requested-With": "XMLHttpRequest" },
      });
      const data = await res.json();
      if (res.ok && data.customer) {
        setCustomerDetails(data);
      } else {
        setCustomerDetails({ customer, orders: [], lifetime_value: customer.total_spent });
      }
    } catch {
      setCustomerDetails({ customer, orders: [], lifetime_value: customer.total_spent });
    } finally {
      setLoadingDetails(false);
    }
  };

  const totalRevenueAll = customers.reduce((sum, c) => sum + (c.total_spent || 0), 0);
  const avgOrderPerCustomer = customers.length > 0
    ? (customers.reduce((sum, c) => sum + c.orders_count, 0) / customers.length).toFixed(1)
    : "0";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Customer Directory
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {customers.length} registered customers • Track customer lifetime value, engagement, and order history.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (customers.length === 0) { toast.info("No customer records to export."); return; }
              const headers = ["ID", "Name", "Email", "Phone", "Total Orders", "Total Spent", "VIP Tier", "Status", "Registered Date"];
              const rows = customers.map((c) => [
                c.id,
                c.name,
                c.email,
                c.phone || "",
                c.orders_count || 0,
                c.total_spent || 0,
                c.tier || "Standard",
                c.status || "Active",
                c.created_at ? new Date(c.created_at).toLocaleDateString() : "",
              ]);
              downloadCsv("customers_directory_export", headers, rows);
              toast.success(`Exported ${customers.length} customer records to CSV!`);
            }}
            className="flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
          >
            Export Directory CSV
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs flex items-center gap-4">
          <div className="grid size-11 place-items-center rounded-2xl bg-slate-900 text-white">
            <Users className="size-5" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Customers</p>
            <h3 className="text-2xl font-extrabold text-slate-900">{customers.length}</h3>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs flex items-center gap-4">
          <div className="grid size-11 place-items-center rounded-2xl bg-emerald-100 text-emerald-700">
            <DollarSign className="size-5" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Customer Lifetime Value</p>
            <h3 className="text-2xl font-extrabold text-slate-900">{formatPrice(totalRevenueAll)}</h3>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs flex items-center gap-4">
          <div className="grid size-11 place-items-center rounded-2xl bg-violet-100 text-violet-700">
            <ShoppingBag className="size-5" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Avg Orders / Customer</p>
            <h3 className="text-2xl font-extrabold text-slate-900">{avgOrderPerCustomer} orders</h3>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="relative">
          <Search className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by customer name, email address, or phone number..."
            className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-xs placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="rounded-3xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Status & Tier</th>
                <th className="px-6 py-4">Orders</th>
                <th className="px-6 py-4">Total Spent</th>
                <th className="px-6 py-4">Joined Date</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    No customers found matching &quot;{searchQuery}&quot;.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="grid size-9 place-items-center rounded-xl bg-slate-900 text-white font-bold text-xs shrink-0">
                          {customer.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{customer.name}</p>
                          <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <Mail className="size-3" />
                            {customer.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 text-violet-700 px-2.5 py-0.5 text-[11px] font-bold">
                        <Sparkles className="size-3" />
                        {customer.tier}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-900">{customer.orders_count}</span>
                      <span className="text-slate-400 ml-1">orders</span>
                    </td>

                    <td className="px-6 py-4 font-bold text-slate-900">
                      {formatPrice(customer.total_spent)}
                    </td>

                    <td className="px-6 py-4 text-slate-500">
                      {customer.created_at ? new Date(customer.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Recent"}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleInspect(customer)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 font-bold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                      >
                        <Eye className="size-3.5" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Detail Drawer Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="grid size-12 place-items-center rounded-2xl bg-slate-900 text-white font-extrabold text-base">
                  {selectedCustomer.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{selectedCustomer.name}</h3>
                  <p className="text-xs text-slate-500">{selectedCustomer.email} • {selectedCustomer.phone}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => { setSelectedCustomer(null); setCustomerDetails(null); }}
                className="grid size-8 place-items-center rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="size-4" />
              </button>
            </div>

            {loadingDetails ? (
              <div className="py-12 text-center text-xs text-slate-400">Loading customer telemetry...</div>
            ) : (
              <div className="space-y-6">
                {/* Stats row */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="rounded-2xl bg-slate-50 p-3.5 border border-slate-100 text-center">
                    <p className="text-[11px] font-bold text-slate-400 uppercase">Lifetime Value</p>
                    <p className="text-lg font-extrabold text-slate-900 mt-0.5">
                      {formatPrice(customerDetails?.lifetime_value || selectedCustomer.total_spent)}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-3.5 border border-slate-100 text-center">
                    <p className="text-[11px] font-bold text-slate-400 uppercase">Total Orders</p>
                    <p className="text-lg font-extrabold text-slate-900 mt-0.5">
                      {customerDetails?.orders?.length || selectedCustomer.orders_count}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-3.5 border border-slate-100 text-center col-span-2 sm:col-span-1">
                    <p className="text-[11px] font-bold text-slate-400 uppercase">Customer Tier</p>
                    <p className="text-lg font-extrabold text-violet-700 mt-0.5">
                      {selectedCustomer.tier}
                    </p>
                  </div>
                </div>

                {/* Recent Orders List */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Recent Purchase History
                  </h4>
                  {(!customerDetails?.orders || customerDetails.orders.length === 0) ? (
                    <p className="text-xs text-slate-400 bg-slate-50 rounded-2xl p-4 text-center">
                      No order records found for this user account.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {customerDetails.orders.map((ord) => (
                        <div key={ord.id} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/60 p-3.5 text-xs">
                          <div>
                            <span className="font-bold text-slate-900">#{ord.order_number}</span>
                            <span className="text-slate-400 ml-2">
                              • {new Date(ord.placed_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-slate-900">{formatPrice(parseFloat(ord.total_amount))}</span>
                            <span className="rounded-full bg-emerald-100 text-emerald-700 px-2 py-0.5 text-[10px] font-bold uppercase">
                              {ord.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Direct Action */}
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      window.location.href = `mailto:${selectedCustomer.email}`;
                    }}
                    className="flex h-9 items-center gap-1.5 rounded-xl bg-slate-900 px-4 text-xs font-bold text-white hover:bg-slate-800"
                  >
                    <Mail className="size-3.5" />
                    <span>Send Email</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

AdminCustomersPage.layout = (page) => <AdminLayout>{page}</AdminLayout>;

export default AdminCustomersPage;
