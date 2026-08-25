import { useEffect, useState } from "react";
import { Link, usePage, router } from "@inertiajs/react";
import { Heart, Menu, Search, ShoppingBag, User, X, LogOut, Shield, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useScrolled } from "@/hooks/use-reveal";
import { useCart } from "./cart";
import { formatPrice } from "@/lib/shop-data";

const PAGE_URLS = { shop: "/shop", about: "/about", contact: "/contact", wishlist: "/wishlist", account: "/account" };

function menuHref(item, categories) {
  if (item.type === "category") {
    const category = categories.find((entry) => String(entry.id) === String(item.target));
    return category ? `/shop?category=${encodeURIComponent(category.slug || category.name)}` : "/shop";
  }
  return item.type === "custom" ? item.target || "/" : PAGE_URLS[item.target] || item.target || "/";
}

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
  const { url, props } = usePage();
  const user = props?.auth?.user;
  const generalSettings = props?.app_settings?.general || {};
  const navigation = props?.app_settings?.navigation || {};
  const categories = props?.app_settings?.navigationCategories || [];
  const navItems = navigation.headerMenuItems || [];
  const marqueeText = (navigation.marqueeText || "").replace("{currency}", formatPrice(0).replace("0", ""));
  const navigate = (href) => router.visit(href);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { count, pulse, openCart, wishlist } = useCart();

  const isHome = url === "/";

  // Select logo depending on header background contrast
  const activeLogo = generalSettings.logoDark;

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
              {marqueeText}
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
            href="/"
            className="flex items-center gap-2 text-lg font-extrabold tracking-[-0.06em] whitespace-nowrap sm:text-xl transition-transform hover:opacity-90"
          >
            {activeLogo ? (
              <img
                src={activeLogo}
                alt={generalSettings.storeName || "Store Logo"}
                className="h-14 w-auto object-contain"
              />
            ) : (
              <span>
                {generalSettings.storeName || "ATELIER"}
                <span className="text-accent">.</span>
              </span>
            )}
          </Link>

          <nav aria-label="Primary" className="hidden justify-center gap-7 lg:flex">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={menuHref(item, categories)}
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

            {/* User Account / Auth Dropdown */}
            <div className="relative hidden sm:block">
              {user ? (
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen((v) => !v)}
                  className="flex items-center gap-1.5 rounded-full border border-border bg-surface/80 py-1 pl-2 pr-2.5 text-xs font-semibold text-foreground transition-all hover:border-foreground/30 hover:bg-surface"
                >
                  <div className="grid size-6 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="max-w-[90px] truncate">{user.name.split(" ")[0]}</span>
                  <ChevronDown className="size-3 text-muted-foreground" />
                </button>
              ) : (
                <Link href="/login" title="Sign In">
                  <IconButton label="Account">
                    <User className="size-[18px]" strokeWidth={1.6} />
                  </IconButton>
                </Link>
              )}

              {userDropdownOpen && user && (
                <div
                  className="absolute right-0 top-11 z-50 w-52 rounded-2xl border border-border bg-surface p-2 shadow-lift animate-pop text-xs"
                  onClick={() => setUserDropdownOpen(false)}
                >
                  <div className="border-b border-border px-3 py-2">
                    <p className="font-bold text-foreground truncate">{user.name}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
                    {user.is_admin && (
                      <span className="mt-1 inline-block rounded-md bg-violet-100 px-1.5 py-0.5 text-[10px] font-extrabold text-violet-700 uppercase">
                        Admin
                      </span>
                    )}
                  </div>

                  <div className="py-1 space-y-0.5">
                    <Link
                      href="/account"
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-foreground transition-colors hover:bg-muted font-medium"
                    >
                      <User className="size-3.5 text-muted-foreground" />
                      My Account & Orders
                    </Link>

                    {user.is_admin && (
                      <Link
                        href="/admin"
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-violet-700 bg-violet-50/70 transition-colors hover:bg-violet-100 font-bold"
                      >
                        <Shield className="size-3.5 text-violet-600" />
                        Admin Dashboard
                      </Link>
                    )}

                    <Link
                      href="/wishlist"
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-foreground transition-colors hover:bg-muted font-medium"
                    >
                      <Heart className="size-3.5 text-muted-foreground" />
                      Saved Wishlist ({wishlist.length})
                    </Link>
                  </div>

                  <div className="border-t border-border pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        router.post("/logout", {}, {
                          onSuccess: () => toast.success("Signed out successfully"),
                        });
                      }}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-destructive transition-colors hover:bg-destructive/10 font-semibold"
                    >
                      <LogOut className="size-3.5" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>

            <Link href="/wishlist" title="Wishlist">
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
              href="/"
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
            {navItems.map((item, i) => (
              <a
                key={item.label}
                href={menuHref(item, categories)}
                onClick={(e) => handleNavClick(e, menuHref(item, categories))}
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

          <div className="mt-auto flex flex-col gap-2 pt-4 border-t border-border">
            {user ? (
              <>
                <div className="flex items-center justify-between px-2 py-1 bg-muted/40 rounded-xl mb-1">
                  <div className="flex items-center gap-2">
                    <div className="grid size-7 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-foreground truncate">{user.name}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
                    </div>
                  </div>
                  {user.is_admin && (
                    <span className="rounded bg-violet-100 px-1.5 py-0.5 text-[9px] font-extrabold text-violet-700 uppercase">
                      Admin
                    </span>
                  )}
                </div>

                <Link
                  href="/account"
                  onClick={() => setMenuOpen(false)}
                  className="flex h-10 items-center justify-center gap-2 rounded-full bg-primary text-xs font-semibold text-primary-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  <User className="size-3.5" />
                  My Account & Orders
                </Link>

                {user.is_admin && (
                  <Link
                    href="/admin"
                    onClick={() => setMenuOpen(false)}
                    className="flex h-10 items-center justify-center gap-2 rounded-full bg-violet-600 text-xs font-semibold text-white transition-colors hover:bg-violet-700"
                  >
                    <Shield className="size-3.5" />
                    Admin Dashboard
                  </Link>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    router.post("/logout", {}, {
                      onSuccess: () => toast.success("Signed out successfully"),
                    });
                  }}
                  className="flex h-9 items-center justify-center gap-1.5 text-xs font-semibold text-destructive transition-colors hover:bg-destructive/10 rounded-xl"
                >
                  <LogOut className="size-3.5" />
                  Sign Out
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2 mb-1">
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="flex h-10 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMenuOpen(false)}
                  className="flex h-10 items-center justify-center rounded-full border border-border text-xs font-semibold text-foreground transition-colors hover:bg-muted"
                >
                  Register
                </Link>
              </div>
            )}

            <Link
              href="/wishlist"
              onClick={() => setMenuOpen(false)}
              className="flex h-10 items-center justify-center gap-2 rounded-full border border-border text-xs font-semibold text-foreground transition-colors hover:bg-muted"
            >
              <Heart className="size-3.5 text-accent" />
              Saved Wishlist ({wishlist.length})
            </Link>
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                openCart();
              }}
              className="flex h-10 items-center justify-center gap-2 rounded-full border border-border text-xs font-semibold text-foreground transition-colors hover:bg-muted"
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
