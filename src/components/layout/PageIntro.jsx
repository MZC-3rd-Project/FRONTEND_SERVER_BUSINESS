import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function PageIntro({
  eyebrow,
  title,
  description,
  meta = [],
  className,
  children,
}) {
  return (
    <section
      className={cn(
        "glass-panel surface-hero reveal-up relative overflow-hidden rounded-[2rem] px-5 py-5 sm:px-6 sm:py-6",
        className
      )}
    >
      <div className="pointer-events-none absolute right-[-4rem] top-[-4rem] h-36 w-36 rounded-full bg-[radial-gradient(circle,rgba(56,189,248,0.18),transparent_65%)]" />
      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          {eyebrow ? <p className="section-kicker">{eyebrow}</p> : null}
          <h1 className="display-title mt-3 text-[clamp(2rem,2.1vw+1rem,3rem)] leading-[0.95] text-foreground">
            {title}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
            {description}
          </p>
          {meta.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {meta.map((item) => (
                <Badge
                  key={item}
                  variant="outline"
                  className="bg-white/72 text-[0.74rem] text-slate-600 dark:bg-slate-950/40 dark:text-slate-300"
                >
                  {item}
                </Badge>
              ))}
            </div>
          ) : null}
        </div>
        {children ? (
          <div className="flex w-full max-w-sm flex-col gap-3 lg:w-[21rem]">
            {children}
          </div>
        ) : null}
      </div>
    </section>
  );
}
