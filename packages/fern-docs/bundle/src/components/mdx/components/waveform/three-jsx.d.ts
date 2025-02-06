import { Object3DNode } from "@react-three/fiber";
import { PlaneGeometry, ShaderMaterial } from "three";

declare module "@react-three/fiber" {
  interface ThreeElements {
    shaderMaterial: Object3DNode<ShaderMaterial, typeof ShaderMaterial>;
    planeGeometry: Object3DNode<PlaneGeometry, typeof PlaneGeometry>;
  }
}
