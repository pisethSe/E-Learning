import React from "react";
import { motion as Motion } from "framer-motion";

export function Card({
  children,
  className = "",
  animate = false,
  delay = 0,
  ...props
}) {
  const baseClasses = "rounded-lg border border-slate-200 bg-white p-6 shadow-card";

  if (animate) {
    return (
      <Motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay }}
        className={`${baseClasses} ${className}`.trim()}
        {...props}
      >
        {children}
      </Motion.div>
    );
  }

  return (
    <div className={`${baseClasses} ${className}`.trim()} {...props}>
      {children}
    </div>
  );
}
