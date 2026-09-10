import { Head, Link, usePage } from "@inertiajs/react";
import { SiteLayout } from "@/layouts/site-layout";

export function LegalPage({ page = "terms" }) {
  const { props } = usePage();
  const content = props?.app_settings?.legal?.[page] || {};
  const isTerms = page === "terms";
  const defaultTitle = isTerms ? "Terms of Service" : "Privacy Policy";
  const title = content.title || defaultTitle;
  const eyebrow = content.eyebrow || "Legal";
  const intro = content.intro || (isTerms ? "Please review these terms and conditions carefully before using our store." : "Learn how we protect and manage your personal data.");
  const pageTitle = `${title} | Atelier`;
  const metaDescription = content.intro || `Read Atelier's ${defaultTitle}.`;
  
  const body = content.body;

  return (
    <main className="min-h-screen pb-24 pt-28 lg:pt-36">
      <Head>
        <title head-key="title">{pageTitle}</title>
        <meta head-key="description" name="description" content={metaDescription} />
        <meta head-key="robots" name="robots" content="index,nofollow" />
      </Head>

      <div className="shell max-w-4xl">
        <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="font-semibold text-foreground">{title}</span>
        </nav>

        <header className="border-b border-border pb-10">
          <span className="eyebrow">{eyebrow}</span>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl text-foreground">
            {title}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            {intro}
          </p>
        </header>

        <article
          className="prose prose-slate mt-10 max-w-none text-foreground/90 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: body }}
        />
      </div>
    </main>
  );
}

LegalPage.layout = (page) => <SiteLayout>{page}</SiteLayout>;
export default LegalPage;