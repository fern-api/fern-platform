import { motion } from "motion/react";

export function WaveformAnimation({ volume }: { volume: number }) {
  return (
    // TODO: make this look more like iOS voice message recording
    <div className="flex size-full items-center justify-between gap-0.5">
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="bg-text-default h-full w-0.5"
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
