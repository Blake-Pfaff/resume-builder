"use client";

import { motion, useReducedMotion, type HTMLMotionProps, type Variants } from "framer-motion";

import { fadeInUp, listStagger } from "@/lib/motion";

type MotionDivProps = Omit<HTMLMotionProps<"div">, "variants" | "initial" | "animate">;

export const FadeIn = ({ children, ...props }: MotionDivProps) => {
  const prefersReducedMotion = useReducedMotion();
  return (
    <motion.div
      variants={prefersReducedMotion ? undefined : fadeInUp}
      initial={prefersReducedMotion ? undefined : "hidden"}
      animate={prefersReducedMotion ? undefined : "visible"}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const StaggerList = ({
  children,
  variants,
  ...props
}: MotionDivProps & {
  variants?: Variants;
}) => {
  const prefersReducedMotion = useReducedMotion();
  return (
    <motion.div
      variants={prefersReducedMotion ? undefined : (variants ?? listStagger)}
      initial={prefersReducedMotion ? undefined : "hidden"}
      animate={prefersReducedMotion ? undefined : "visible"}
      {...props}
    >
      {children}
    </motion.div>
  );
};
