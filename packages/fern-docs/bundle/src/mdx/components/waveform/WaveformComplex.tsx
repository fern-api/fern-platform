import {
  ReactNode,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { OrthographicCamera } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  LazyMotion,
  domAnimation,
  useMotionValueEvent,
  useSpring,
} from "motion/react";
import * as m from "motion/react-m";
import * as THREE from "three";

import { cn } from "@fern-docs/components";

import fragmentShader from "./WaveformComplexShader.frag";
import vertexShader from "./WaveformComplexShader.vert";
import type { GradientStop, WaveformColor } from "./types";
import { gradientColors } from "./types";

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
    <LazyMotion features={domAnimation} strict>
      <m.div
        className={cn("relative w-full", className, "h-[400px]")}
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
      </m.div>
    </LazyMotion>
  );
}

const Camera = ({ zoom }: { zoom: number }): React.JSX.Element => {
  const cameraRef = useRef(undefined) as any;
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
}): React.JSX.Element {
  const { gl } = useThree();
  const planeRef = useRef(undefined) as any;
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
