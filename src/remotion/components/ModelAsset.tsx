import { useEffect, useLayoutEffect, useState } from "react";
import { useThree } from "@react-three/fiber";
import {
  cancelRender,
  continueRender,
  delayRender,
  staticFile,
} from "remotion";
import { EquirectangularReflectionMapping, Object3D } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";

export function AssetEnvironment({
  src,
  onReady,
}: {
  src: string;
  onReady?: () => void;
}) {
  const { scene, gl, camera } = useThree();
  const [handle] = useState(() => delayRender(`HDRI ${src}`));
  useEffect(() => {
    let active = true;
    const previous = scene.environment;
    const texture = new RGBELoader().load(
      staticFile(src),
      (loaded) => {
        if (!active) return;
        loaded.mapping = EquirectangularReflectionMapping;
        scene.environment = loaded;
        gl.render(scene, camera);
        continueRender(handle);
        onReady?.();
      },
      undefined,
      (error) => {
        if (active) cancelRender(error);
      },
    );
    return () => {
      active = false;
      scene.environment = previous;
      texture.dispose();
      continueRender(handle);
    };
  }, [src, scene, gl, camera, handle, onReady]);
  return null;
}

type Rotation = [number, number, number];
export function ModelAsset({
  src,
  rotation = [0, 0, 0],
  nodeRotations = {},
  onReady,
}: {
  src: string;
  rotation?: Rotation;
  nodeRotations?: Record<string, Rotation>;
  onReady?: () => void;
}) {
  const [handle] = useState(() => delayRender(`GLB ${src}`));
  const { gl, scene, camera } = useThree();
  const [model, setModel] = useState<Object3D | null>(null);
  useEffect(() => {
    let active = true;
    let loaded: Object3D | undefined;
    const dispose = (object: Object3D) => {
      object.traverse((node) => {
        const mesh = node as import("three").Mesh;
        mesh.geometry?.dispose();
        if (mesh.material)
          for (const material of Array.isArray(mesh.material)
            ? mesh.material
            : [mesh.material])
            material.dispose();
      });
    };
    new GLTFLoader().load(
      staticFile(src),
      (gltf) => {
        loaded = gltf.scene;
        if (!active) {
          dispose(loaded);
          return;
        }
        setModel(loaded);
      },
      undefined,
      (error) => {
        if (active) cancelRender(error);
      },
    );
    return () => {
      active = false;
      if (loaded) dispose(loaded);
      continueRender(handle);
    };
  }, [src, handle]);
  useLayoutEffect(() => {
    if (!model) return;
    for (const [name, angles] of Object.entries(nodeRotations)) {
      const node = model.getObjectByName(name);
      if (!node) {
        cancelRender(new Error(`Modellknoten fehlt: ${name}`));
        return;
      }
      node.rotation.set(...angles);
    }
    gl.render(scene, camera);
    continueRender(handle);
    onReady?.();
  }, [model, nodeRotations, handle, gl, scene, camera, onReady]);
  return model ? (
    <group rotation={rotation}>
      <primitive object={model} />
    </group>
  ) : null;
}
