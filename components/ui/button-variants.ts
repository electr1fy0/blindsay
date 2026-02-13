import { cva, type VariantProps } from "class-variance-authority";

export const buttonVariants = cva(
  "focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 rounded-2xl border bg-clip-padding text-sm font-medium focus-visible:ring-3 aria-invalid:ring-3 [&_svg:not([class*='size-'])]:size-4 inline-flex items-center justify-center whitespace-nowrap transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none shrink-0 [&_svg]:shrink-0 outline-none group/button select-none relative",
  {
    variants: {
      variant: {
        default:
          "border-[#3B6DFF] bg-gradient-to-b from-[#7BB3FF] to-[#3B6DFF] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.55),0_16px_32px_-20px_rgba(37,99,235,0.55)] hover:from-[#8BBEFF] hover:to-[#2F5DE8]",
        outline:
          "border-[#3B6DFF] bg-gradient-to-b from-[#7BB3FF] to-[#3B6DFF] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.55),0_16px_32px_-20px_rgba(37,99,235,0.55)] hover:from-[#8BBEFF] hover:to-[#2F5DE8] aria-expanded:bg-primary aria-expanded:text-white",
        secondary:
          "border-[#4B7BFF] bg-gradient-to-b from-[#9BC0FF] to-[#4B7BFF] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.5),0_14px_28px_-20px_rgba(37,99,235,0.5)] hover:from-[#A9CAFF] hover:to-[#3E6FFF]",
        ghost:
          "border-transparent bg-transparent text-foreground hover:bg-white/70 hover:text-foreground",
        destructive:
          "border-[#FF4D4D] bg-gradient-to-b from-[#FF9B9B] to-[#FF4D4D] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.55),0_14px_28px_-20px_rgba(220,38,38,0.45)] hover:from-[#FFADAD] hover:to-[#F53B3B]",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 gap-2.5 px-5 has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4",
        xs: "h-8 gap-1.5 rounded-[min(var(--radius-md),14px)] px-3 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-3.5",
        sm: "h-10 gap-2 rounded-[min(var(--radius-md),14px)] px-4 text-[0.9rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3 [&_svg:not([class*='size-'])]:size-4",
        lg: "h-12 gap-3 px-6 has-data-[icon=inline-end]:pr-5 has-data-[icon=inline-start]:pl-5",
        icon: "size-11",
        "icon-xs": "size-8 rounded-[min(var(--radius-md),14px)] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3.5",
        "icon-sm": "size-10 rounded-[min(var(--radius-md),14px)] in-data-[slot=button-group]:rounded-lg",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export type ButtonVariants = VariantProps<typeof buttonVariants>;
