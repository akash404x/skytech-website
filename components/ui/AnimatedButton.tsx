'use client';

import { motion, type HTMLMotionProps } from 'framer-motion';

type Props = HTMLMotionProps<'button'> & {
  children: React.ReactNode;
};

export default function AnimatedButton({ children, className = '', ...props }: Props) {
  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={`transition-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50 ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
}
