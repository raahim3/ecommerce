import { cn } from "@/lib/utils";
import { useReveal } from "@/hooks/use-reveal";

export function Reveal({ as: Tag = "div", className, delay = 0, children, ...rest }) {
  const [ref, visible] = useReveal();
  return (
    <Tag
      ref={ref}
      data-visible={visible}
      style={{ transitionDelay: `${delay}ms` }}
      className={cn("reveal", className)}
      {...rest}
    >
      {children}
    </Tag>
  );
}

export function SectionHeading({ eyebrow, title, subtitle, action, className }) {
  return (
    <div
      className={cn(
        "grid gap-6 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end sm:gap-8",
        className,
      )}
    >
      <Reveal className="min-w-0">
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl lg:text-5xl">{title}</h2>
        {subtitle ? (
          <p className="mt-3 max-w-xl text-base text-muted-foreground">{subtitle}</p>
        ) : null}
      </Reveal>
      {action ? (
        <Reveal delay={80} className="shrink-0">
          {action}
        </Reveal>
      ) : null}
    </div>
  );
}
