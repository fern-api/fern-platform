/* eslint-disable react/no-unknown-property */
import type { GradientStop, WaveformColor } from "./types";
import { gradientColors } from "./types";

import { OrthographicCamera } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import cn from "clsx";
import {
  ReactNode,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import * as THREE from "three";

import { motion, useMotionValueEvent, useSpring } from "framer-motion";
import fragmentShader from "./WaveformComplexShader.frag";
import vertexShader from "./WaveformComplexShader.vert";

const DEFAULT_SPEED = 1;
const INITIAL_ZOOM = 95;
const INITIAL_COLORS = gradientColors.transparent;

const springSettings = {
  mass: 0.2,
  damping: 50,
  stiffness: 130,
  restDelta: 0.0001,
};

export default function WaveformComplex({
  color = "neutral",
  className,
  zoom = 120,
  speed = DEFAULT_SPEED,
  blur,
}: {
  className?: string;
  color?: WaveformColor;
  zoom?: number;
  blur?: number;
  speed?: number;
}): ReactNode {
  const colors = gradientColors[color] || gradientColors.neutral;
  const canvasWrapper = useRef<HTMLDivElement>(null);
  const [displayCanvas, setDisplayCanvas] = useState(false);

  useEffect(() => {
    const IO = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setDisplayCanvas(true);
        }
      });
    });
    if (canvasWrapper.current) {
      IO.observe(canvasWrapper.current);
    }
    return () => {
      IO.disconnect();
    };
  }, [canvasWrapper]);

  return (
    <motion.div
      className={cn("h-400 relative w-full", className)}
      ref={canvasWrapper}
      animate={{
        filter: `blur(${blur}px)`,
      }}
      transition={{ ...springSettings }}
    >
      {displayCanvas && (
        <Canvas className="absolute inset-0">
          <Camera zoom={zoom} />
          <Scene colors={colors} speed={speed} />
        </Canvas>
      )}
    </motion.div>
  );
}

const Camera = ({ zoom }: { zoom: number }): JSX.Element => {
  const cameraRef = useRef() as any;
  const { viewport } = useThree();
  const zoomSpring = useSpring(INITIAL_ZOOM, springSettings);

  useLayoutEffect(() => {
    cameraRef.current.aspect = viewport.width / viewport.height;
    cameraRef.current.updateProjectionMatrix();
  }, [viewport]);

  useEffect(() => {
    zoomSpring.set(zoom);
  }, [zoom, zoomSpring]);

  useMotionValueEvent(zoomSpring, "change", (latest) => {
    cameraRef.current.zoom = latest;
    cameraRef.current.updateProjectionMatrix();
  });

  return (
    <OrthographicCamera
      far={100}
      makeDefault
      near={-100}
      ref={cameraRef}
      zoom={zoomSpring.get()}
    />
  );
};

function Scene({
  colors,
  speed,
}: {
  colors: GradientStop[];
  speed: number;
}): JSX.Element {
  const { gl } = useThree();
  const planeRef = useRef() as any;
  const targetColorsRef = useRef(colors);

  useEffect(() => {
    const canvas = gl.domElement;
    const onContextLost = (event: Event) => {
      event.preventDefault();
      setTimeout(function () {
        gl.forceContextRestore();
      }, 1);
    };
    canvas.addEventListener("webglcontextlost", onContextLost, false);

    return () => {
      canvas.removeEventListener("webglcontextlost", onContextLost, false);
    };
  }, [gl]);

  useEffect(() => {
    targetColorsRef.current = colors;
  }, [colors]);

  useFrame(({ clock }) => {
    if (!planeRef.current) {
      return;
    }
    planeRef.current.material.uniforms.uTime.value = clock.getElapsedTime();
    planeRef.current.material.uniforms.uGradientStops.value.map(
      (stop: { color: THREE.Vector4 }, index: number) => {
        stop.color.lerp(
          new THREE.Vector4(
            new THREE.Color(
              targetColorsRef.current[index]?.color
            ).convertLinearToSRGB().r,
            new THREE.Color(
              targetColorsRef.current[index]?.color
            ).convertLinearToSRGB().g,
            new THREE.Color(
              targetColorsRef.current[index]?.color
            ).convertLinearToSRGB().b,
            targetColorsRef.current[index]?.alpha
          ),
          0.03
        );
      }
    );
  });

  const uniforms = useMemo(() => {
    return {
      uTime: new THREE.Uniform(0),
      uAmplitude: new THREE.Uniform(1.3),
      uDensity: new THREE.Uniform(0.25),
      uSpeed: new THREE.Uniform(0.09 * speed),
      uGradientRepeat: new THREE.Uniform(2.0),
      uGradientStops: new THREE.Uniform(
        INITIAL_COLORS.map((stop) => ({
          color: new THREE.Vector4(
            new THREE.Color(stop.color).convertLinearToSRGB().r,
            new THREE.Color(stop.color).convertLinearToSRGB().g,
            new THREE.Color(stop.color).convertLinearToSRGB().b,
            stop.alpha
          ),
          position: stop.position,
        }))
      ),
    };
  }, [speed]);

  return (
    <mesh ref={planeRef} rotation={[Math.PI / 2, -Math.PI, 0]}>
      <planeGeometry args={[24, 10, 128, 64]} />
      <shaderMaterial
        attach="material"
        fragmentShader={fragmentShader}
        side={THREE.DoubleSide}
        uniforms={uniforms}
        vertexShader={vertexShader}
      />
    </mesh>
  );
}
