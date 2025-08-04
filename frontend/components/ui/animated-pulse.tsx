import { motion } from "framer-motion"

interface AnimatedPulseProps {
  children: React.ReactNode
  className?: string
  duration?: number
  scale?: number
}

export function AnimatedPulse({ 
  children, 
  className = "", 
  duration = 2, 
  scale = 1.1 
}: AnimatedPulseProps) {
  return (
    <motion.div
      className={className}
      animate={{
        scale: [1, scale, 1],
        opacity: [1, 0.8, 1],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      {children}
    </motion.div>
  )
} 