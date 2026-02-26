import type { Transition, Variants } from "framer-motion";

export const motionTransition = {
  quick: {
    duration: 0.16,
    ease: "easeOut",
  } satisfies Transition,
  standard: {
    duration: 0.2,
    ease: "easeOut",
  } satisfies Transition,
};

export const fadeInUp = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: motionTransition.standard },
} satisfies Variants;

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.98 },
  visible: { opacity: 1, scale: 1, transition: motionTransition.standard },
} satisfies Variants;

export const listStagger = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.03,
    },
  },
} satisfies Variants;
