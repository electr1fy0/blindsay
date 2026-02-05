import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { Link } from "react-router";

type HelpTextParams = {
  type: "info" | "error" | "warning";
  content: string;
  linkUrl?: string;
  linkStr?: string;
};

export default function HelpText({
  type,
  content,
  linkUrl,
  linkStr,
}: HelpTextParams) {
  return (
    <motion.div
      key="password-help-text"
      className={cn(
        "text-sm text-neutral-400 text-center mx-auto overflow-hidden",
        type == "error" && "text-red-500",
      )}
      initial={{ opacity: 0, height: 0, marginTop: 0, y: -10 }}
      animate={{
        opacity: 1,
        height: "auto",
        marginTop: 16,
        y: 0,
      }}
      exit={{ opacity: 0, height: 0, marginTop: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      {content}{" "}
      {linkUrl && linkStr && (
        <Link className="text-neutral-800 hover:underline" to={linkUrl}>
          {linkStr}
        </Link>
      )}
    </motion.div>
  );
}
