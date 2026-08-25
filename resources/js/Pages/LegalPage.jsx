import { Link, usePage } from "@inertiajs/react";
import { SiteLayout } from "@/layouts/site-layout";

export function LegalPage({ page = "terms" }) {
  const { props } = usePage();
  const content = props?.app_settings?.legal?.[page] || {};
  return <main className="min-h-screen pb-24 pt-28 lg:pt-36"><div className="shell max-w-4xl"><nav className="mb-8 flex items-center gap-2 text-xs text-muted-foreground"><Link href="/" className="hover:text-foreground">Home</Link><span>/</span><span className="font-semibold text-foreground">{content.title || page}</span></nav><header className="border-b border-border pb-10"><span className="eyebrow">{content.eyebrow || "Atelier"}</span><h1 className="mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">{content.title || page}</h1><p className="mt-4 text-muted-foreground">{content.intro || "Please review this page carefully."}</p></header><article className="prose prose-slate mt-10 max-w-none" dangerouslySetInnerHTML={{ __html: content.body || "<p>Content will be available soon.</p>" }} /></div></main>;
}
LegalPage.layout = (page) => <SiteLayout>{page}</SiteLayout>;
export default LegalPage;