import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  MessageCircle,
  Search,
  ChevronDown,
  ChevronUp,
  Send,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const FAQS = [
  {
    category: "Orders & Shipping",
    q: "How fast is shipping and what are the delivery costs?",
    a: "We offer complimentary standard shipping on all orders over $100 worldwide (delivering in 3–5 business days). Express 2-day priority delivery is available at checkout for $15.",
  },
  {
    category: "Orders & Shipping",
    q: "Can I modify or cancel my order after placing it?",
    a: "Orders are processed swiftly at our automated warehouse. If you need to make changes, please email support@atelier-studios.com within 60 minutes of placing your order.",
  },
  {
    category: "Returns & Exchanges",
    q: "What is your return policy?",
    a: "We provide a 30-day risk-free return window. Any item in unworn, original condition with tags and packaging intact is eligible for a full refund or exchange with complimentary prepaid return labels.",
  },
  {
    category: "Returns & Exchanges",
    q: "How long does a refund take to process?",
    a: "Once our logistics hub receives and inspects your returned package, your refund is credited to your original payment method within 2–4 business days.",
  },
  {
    category: "Warranty & Repairs",
    q: "What is covered under the 2-Year Atelier Warranty?",
    a: "All electronics, timepieces, leather bags, and hardware components are backed by a comprehensive 2-year warranty covering manufacturing defects, driver malfunctions, and stitching integrity.",
  },
  {
    category: "Product Care & Sizing",
    q: "How should I care for my cashmere and linen garments?",
    a: "We recommend gentle hand washing in cool water using mild wool detergent or professional dry cleaning. Lay flat on a clean towel to dry. Never tumble dry cashmere.",
  },
];

export const FAQ_CATEGORIES = ["All", "Orders & Shipping", "Returns & Exchanges", "Warranty & Repairs", "Product Care & Sizing"];

export function ContactPage() {
  const [activeFaqCategory, setActiveFaqCategory] = useState("All");
  const [faqSearchQuery, setFaqSearchQuery] = useState("");
  const [openFaqIdx, setOpenFaqIdx] = useState(0);

  // Form State
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    subject: "General Inquiry",
    orderId: "",
    message: "",
  });
  const [isSending, setIsSending] = useState(false);

  const filteredFaqs = useMemo(() => {
    return FAQS.filter((faq) => {
      if (activeFaqCategory !== "All" && faq.category !== activeFaqCategory) return false;
      if (faqSearchQuery.trim()) {
        const query = faqSearchQuery.toLowerCase();
        return faq.q.toLowerCase().includes(query) || faq.a.toLowerCase().includes(query);
      }
      return true;
    });
  }, [activeFaqCategory, faqSearchQuery]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      toast.success("Message sent successfully!", {
        description: "Our client care team will respond within 2 to 4 business hours.",
      });
      setContactForm({ name: "", email: "", subject: "General Inquiry", orderId: "", message: "" });
    }, 800);
  };

  return (
    <main className="min-h-screen pb-24 pt-28 lg:pt-36">
      <div className="shell">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-2 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="font-semibold text-foreground">Contact & Support</span>
        </nav>

        {/* Header */}
        <div className="border-b border-border pb-8 text-center max-w-2xl mx-auto">
          <span className="eyebrow">Client Services</span>
          <h1 className="mt-2 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground">
            How can we assist you?
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
            Our client care specialists are on hand 7 days a week to answer questions regarding orders, sizing, materials, and styling.
          </p>
        </div>

        {/* 3 Quick Contact Cards */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-3xl border border-border/80 bg-surface p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="grid size-10 place-items-center rounded-2xl bg-accent/10 text-accent">
                <Mail className="size-5" />
              </div>
              <h3 className="mt-4 text-base font-bold text-foreground">Email Client Care</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Average reply time: under 2 hours during studio hours.
              </p>
            </div>
            <a
              href="mailto:care@atelier-studios.com"
              className="mt-4 text-xs font-bold text-accent hover:underline inline-flex items-center gap-1"
            >
              care@atelier-studios.com
            </a>
          </div>

          <div className="rounded-3xl border border-border/80 bg-surface p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="grid size-10 place-items-center rounded-2xl bg-accent/10 text-accent">
                <MessageCircle className="size-5" />
              </div>
              <h3 className="mt-4 text-base font-bold text-foreground">Live Stylist Chat</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Instant guidance on garment sizing and curated pairings.
              </p>
            </div>
            <button
              type="button"
              onClick={() => toast.info("Atelier Live Stylist connected")}
              className="mt-4 text-xs font-bold text-accent hover:underline text-left inline-flex items-center gap-1"
            >
              Start Live Chat Session
            </button>
          </div>

          <div className="rounded-3xl border border-border/80 bg-surface p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="grid size-10 place-items-center rounded-2xl bg-accent/10 text-accent">
                <Phone className="size-5" />
              </div>
              <h3 className="mt-4 text-base font-bold text-foreground">Phone Concierge</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Monday–Saturday, 9:00 AM – 6:00 PM EST.
              </p>
            </div>
            <a
              href="tel:+18005558942"
              className="mt-4 text-xs font-bold text-accent hover:underline inline-flex items-center gap-1"
            >
              +1 (800) 555-ATELIER
            </a>
          </div>
        </div>

        {/* Main 2-Column: Left Contact Form + Right Searchable FAQs */}
        <div className="mt-14 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ================= LEFT: CONTACT FORM (5 cols) ================= */}
          <div className="lg:col-span-5 rounded-3xl border border-border/80 bg-surface p-6 sm:p-8 shadow-xs">
            <h2 className="text-xl font-bold text-foreground border-b border-border pb-3">
              Send a Message
            </h2>
            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Your Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={contactForm.name}
                  onChange={(e) => setContactForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Maya Lin"
                  className="mt-1 h-11 w-full rounded-xl border border-border bg-background px-3.5 text-sm focus:border-accent focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={contactForm.email}
                  onChange={(e) => setContactForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="maya@example.com"
                  className="mt-1 h-11 w-full rounded-xl border border-border bg-background px-3.5 text-sm focus:border-accent focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Subject
                  </label>
                  <select
                    value={contactForm.subject}
                    onChange={(e) => setContactForm((f) => ({ ...f, subject: e.target.value }))}
                    className="mt-1 h-11 w-full rounded-xl border border-border bg-background px-3 text-xs font-semibold focus:border-accent focus:outline-none"
                  >
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="Order Status">Order Status</option>
                    <option value="Returns & Exchanges">Returns & Exchanges</option>
                    <option value="Styling Advice">Styling Advice</option>
                    <option value="Press & Wholesale">Press & Wholesale</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Order Ref (Optional)
                  </label>
                  <input
                    type="text"
                    value={contactForm.orderId}
                    onChange={(e) => setContactForm((f) => ({ ...f, orderId: e.target.value }))}
                    placeholder="ATL-000000"
                    className="mt-1 h-11 w-full rounded-xl border border-border bg-background px-3 font-mono text-xs uppercase focus:border-accent focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Message *
                </label>
                <textarea
                  rows={5}
                  required
                  value={contactForm.message}
                  onChange={(e) => setContactForm((f) => ({ ...f, message: e.target.value }))}
                  placeholder="Describe your inquiry or question…"
                  className="mt-1 w-full rounded-xl border border-border bg-background p-3.5 text-sm focus:border-accent focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSending}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary text-xs font-bold text-primary-foreground hover:bg-accent hover:text-accent-foreground transition-all shadow-sm active:scale-[0.99]"
              >
                <Send className="size-3.5" />
                <span>{isSending ? "Sending Message..." : "Send Message to Client Care"}</span>
              </button>
            </form>
          </div>

          {/* ================= RIGHT: SEARCHABLE FAQS (7 cols) ================= */}
          <div className="lg:col-span-7 space-y-5">
            <div className="rounded-3xl border border-border/80 bg-surface p-6 sm:p-8 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
                <div>
                  <h2 className="text-xl font-bold text-foreground">Frequently Asked Questions</h2>
                  <p className="text-xs text-muted-foreground">Instant answers to our most common inquiries.</p>
                </div>
              </div>

              {/* FAQ Search Bar */}
              <div className="relative mt-4">
                <Search className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="search"
                  value={faqSearchQuery}
                  onChange={(e) => setFaqSearchQuery(e.target.value)}
                  placeholder="Search questions by keyword (e.g. shipping, returns, cashmere)…"
                  className="h-11 w-full rounded-xl border border-border bg-background pl-10 pr-4 text-xs placeholder:text-subtle focus:border-accent focus:outline-none"
                />
              </div>

              {/* Category Filter Pills */}
              <div className="no-scrollbar mt-4 flex gap-1.5 overflow-x-auto pb-1">
                {FAQ_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveFaqCategory(cat)}
                    className={cn(
                      "rounded-full px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-all",
                      activeFaqCategory === cat
                        ? "bg-primary text-primary-foreground font-bold shadow-xs"
                        : "bg-muted text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* FAQ Accordion List */}
              <div className="mt-5 divide-y divide-border rounded-2xl border border-border overflow-hidden">
                {filteredFaqs.length > 0 ? (
                  filteredFaqs.map((faq, idx) => {
                    const isOpen = openFaqIdx === idx;
                    return (
                      <div key={idx} className="bg-surface">
                        <button
                          type="button"
                          onClick={() => setOpenFaqIdx(isOpen ? -1 : idx)}
                          className="flex w-full items-center justify-between p-4 text-left font-bold text-xs sm:text-sm text-foreground hover:bg-muted/40 transition-colors"
                        >
                          <span>{faq.q}</span>
                          {isOpen ? (
                            <ChevronUp className="size-4 text-accent shrink-0 ml-2" />
                          ) : (
                            <ChevronDown className="size-4 text-muted-foreground shrink-0 ml-2" />
                          )}
                        </button>
                        {isOpen && (
                          <div className="px-4 pb-4 text-xs text-muted-foreground leading-relaxed animate-in fade-in">
                            {faq.a}
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="p-6 text-center text-xs text-muted-foreground">
                    No FAQs matched "{faqSearchQuery}". Try another keyword or submit the contact form.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
