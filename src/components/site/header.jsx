import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Heart, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useScrolled } from "@/hooks/use-reveal";
import { useCart } from "./cart";

const NAV = [
  { label: "Shop All", href: "/shop" },
  { label: "Fashion", href: "/shop?category=Fashion" },
  { label: "Electronics", href: "/shop?category=Electronics" },
  { label: "Accessories", href: "/shop?category=Accessories" },
  { label: "Our Story", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "Sale", href: "/shop?sale=true" },
];

function IconButton({ label, children, className, ...rest }) {
  return (
    <button
      type="button"
      aria-label={label}
      className={cn(
        "relative grid size-10 shrink-0 place-items-center rounded-full text-current transition-all duration-300 hover:bg-foreground/5 active:scale-95",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

export function Header() {
  const scrolled = useScrolled(40);
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { count, pulse, openCart, wishlist } = useCart();

  const isHome = location.pathname === "/";

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setSearchOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const handleNavClick = (e, href) => {
    setMenuOpen(false);
    navigate(href);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearchOpen(false);
    navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      {/* Top Banner Marquee */}
      <div className="overflow-hidden bg-ink text-ink-foreground">
        <div className="flex w-max animate-marquee gap-16 py-2.5 pr-16 text-[11px] font-medium tracking-[0.2em] uppercase">
          {Array.from({ length: 4 }).map((_, i) => (
            <span key={i} className="whitespace-nowrap">
              Free shipping on orders over $100 &nbsp;•&nbsp; Easy 30-day returns &nbsp;•&nbsp; Use code <strong className="text-accent">ATELIER10</strong> for 10% off
            </span>
          ))}
        </div>
      </div>

      {/* Main Navbar */}
      <div
        className={cn(
          "transition-all duration-500",
          scrolled || !isHome
            ? "glass border-b border-border/70 text-foreground"
            : "border-b border-transparent bg-transparent text-foreground",
        )}
      >
        <div className="shell grid grid-cols-[auto_1fr_auto] items-center gap-4 py-3 lg:py-4">
          <Link
            to="/"
            className="text-lg font-extrabold tracking-[-0.06em] whitespace-nowrap sm:text-xl transition-transform hover:opacity-90"
          >
            ATELIER<span className="text-accent">.</span>
          </Link>

          <nav aria-label="Primary" className="hidden justify-center gap-7 lg:flex">
            {NAV.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className={cn(
                  "link-underline text-sm font-medium transition-colors duration-300 hover:text-accent cursor-pointer",
                  item.label === "Sale" && "text-accent font-semibold",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <span className="lg:hidden" />

          {/* Action Icons */}
          <div className="flex items-center justify-end gap-0.5">
            <IconButton
              label="Search"
              onClick={() => setSearchOpen((v) => !v)}
              aria-expanded={searchOpen}
            >
              <Search className="size-[18px]" strokeWidth={1.6} />
            </IconButton>

            <Link to="/account" title="My Account">
              <IconButton label="Account" className="hidden sm:grid">
                <User className="size-[18px]" strokeWidth={1.6} />
              </IconButton>
            </Link>

            <Link to="/wishlist" title="Wishlist">
              <IconButton
                label={`Wishlist, ${wishlist.length} items`}
                className="hidden sm:grid"
              >
                <Heart
                  className={cn(
                    "size-[18px]",
                    wishlist.length > 0 && "fill-accent/20 text-accent",
                  )}
                  strokeWidth={1.6}
                />
                {wishlist.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 grid min-w-4.5 place-items-center rounded-full bg-accent/90 px-1 text-[9px] font-bold text-accent-foreground">
                    {wishlist.length}
                  </span>
                )}
              </IconButton>
            </Link>

            {/* Cart Drawer Trigger */}
            <IconButton
              label={`Shopping bag, ${count} items`}
              onClick={openCart}
            >
              <ShoppingBag
                key={pulse}
                className={cn("size-[18px]", pulse > 0 && "animate-pop")}
                strokeWidth={1.6}
              />
              {count > 0 ? (
                <span className="animate-pop absolute -top-0.5 -right-0.5 grid min-w-5 place-items-center rounded-full bg-accent px-1.5 text-[10px] font-bold text-accent-foreground shadow-xs">
                  {count}
                </span>
              ) : null}
            </IconButton>

            <IconButton
              label={menuOpen ? "Close menu" : "Open menu"}
              className="lg:hidden"
              onClick={() => setMenuOpen((v) => !v)}
              aria-expanded={menuOpen}
            >
              {menuOpen ? (
                <X className="size-5" strokeWidth={1.6} />
              ) : (
                <Menu className="size-5" strokeWidth={1.6} />
              )}
            </IconButton>
          </div>
        </div>

        {/* Expandable Search Drawer */}
        <div
          className={cn(
            "grid overflow-hidden border-border transition-all duration-500",
            searchOpen ? "grid-rows-[1fr] border-t" : "grid-rows-[0fr]",
          )}
        >
          <div className="min-h-0">
            <form
              className="shell flex items-center gap-3 py-4"
              onSubmit={handleSearchSubmit}
            >
              <Search className="size-5 shrink-0 text-muted-foreground" strokeWidth={1.6} />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, collections, cashmere, audio, sunglasses…"
                aria-label="Search products"
                className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-subtle"
                autoFocus={searchOpen}
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="eyebrow shrink-0 transition-colors hover:text-foreground cursor-pointer"
              >
                Close
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      <div
        className={cn(
          "fixed inset-0 z-50 lg:hidden",
          menuOpen ? "pointer-events-auto" : "pointer-events-none",
        )}
        aria-hidden={!menuOpen}
      >
        <div
          className={cn(
            "absolute inset-0 bg-ink/40 transition-opacity duration-500",
            menuOpen ? "opacity-100" : "opacity-0",
          )}
          onClick={() => setMenuOpen(false)}
        />
        <nav
          aria-label="Mobile"
          className={cn(
            "absolute inset-y-0 right-0 flex w-[86%] max-w-sm flex-col bg-surface px-6 pt-6 pb-10 transition-transform duration-500 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)]",
            menuOpen ? "translate-x-0" : "translate-x-full",
          )}
        >
          <div className="flex items-center justify-between">
            <Link
              to="/"
              onClick={() => setMenuOpen(false)}
              className="text-lg font-extrabold tracking-[-0.06em]"
            >
              ATELIER<span className="text-accent">.</span>
            </Link>
            <IconButton label="Close menu" onClick={() => setMenuOpen(false)}>
              <X className="size-5" strokeWidth={1.6} />
            </IconButton>
          </div>

          <div className="mt-8 flex flex-col">
            {NAV.map((item, i) => (
              <a
                key={item.label}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                style={{ transitionDelay: `${menuOpen ? 100 + i * 40 : 0}ms` }}
                className={cn(
                  "border-b border-border py-3.5 text-xl font-bold tracking-tight transition-all duration-500",
                  menuOpen ? "translate-x-0 opacity-100" : "translate-x-6 opacity-0",
                  item.label === "Sale" && "text-accent",
                )}
              >
                {item.label}
              </a>
            ))}
          </div>

          <div className="mt-auto flex flex-col gap-2.5 pt-6 border-t border-border">
            <Link
              to="/account"
              onClick={() => setMenuOpen(false)}
              className="flex h-11 items-center justify-center gap-2 rounded-full bg-primary text-xs font-semibold text-primary-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <User className="size-4" />
              My Account
            </Link>
            <Link
              to="/wishlist"
              onClick={() => setMenuOpen(false)}
              className="flex h-11 items-center justify-center gap-2 rounded-full border border-border text-xs font-semibold text-foreground transition-colors hover:bg-muted"
            >
              <Heart className="size-4 text-accent" />
              Saved Wishlist ({wishlist.length})
            </Link>
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                openCart();
              }}
              className="flex h-11 items-center justify-center gap-2 rounded-full border border-border text-xs font-semibold text-foreground transition-colors hover:bg-muted"
            >
              <ShoppingBag className="size-4" />
              Shopping Bag ({count})
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
}
