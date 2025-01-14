import { motion } from "framer-motion";

export function WaveformAnimation({ volume }: { volume: number }) {
  return (
    <div className="flex size-full items-center justify-between gap-0.5">
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="h-full w-0.5 bg-black"
          animate={{
            scaleY: [0.2, Math.max(0.4, Math.min(volume, 1)), 0.2],
          }}
          transition={{
            duration: 1 - volume * 0.5,
            repeat: Infinity,
            delay: i * 0.05,
          }}
        />
      ))}
    </div>
  );
}
