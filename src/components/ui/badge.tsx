import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "group/badge inline-flex h-7 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border border-transparent px-3 py-1 text-[0.74rem] font-semibold whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-[4px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-[0_10px_22px_rgba(29,161,242,0.18)]",
        secondary:
          "bg-secondary text-secondary-foreground dark:bg-slate-100 dark:text-slate-950",
        destructive:
          "bg-rose-500/12 text-rose-600 focus-visible:ring-destructive/20 dark:bg-rose-500/18 dark:text-rose-300 dark:focus-visible:ring-destructive/40",
        outline:
          "border-border bg-white/72 text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] dark:border-slate-700 dark:bg-slate-950/44",
        ghost:
          "hover:bg-white/70 hover:text-foreground dark:hover:bg-slate-900/52",
        link: "text-primary underline-offset-4 hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
