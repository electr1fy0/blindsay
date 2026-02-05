import { cn } from "@/lib/utils";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import { motion } from "motion/react";

type AuthLayoutProps = {
  children?: React.ReactNode;
  icon: IconSvgElement;
  title: string;
  subtitle: string;
};

export function AuthLayout({
  title,
  subtitle,
  children,
  icon,
}: AuthLayoutProps) {
  return (
    <motion.div className="w-full max-w-md mx-auto mt-10 ">
      <HugeiconsIcon
        className={cn(
          "mx-auto my-4",
          title === "Welcome to Unsaid"
            ? "bg-white size-12"
            : "bg-blue-100 text-blue-500  p-2.5 rounded-full size-10",
        )}
        strokeWidth={2}
        icon={icon}
      />
      <h2 className="text-center text-lg">{title} </h2>
      <h3 className="text-neutral-500 text-center">{subtitle}</h3>
      <motion.div className="space-y-4">{children}</motion.div>
    </motion.div>
  );
}
