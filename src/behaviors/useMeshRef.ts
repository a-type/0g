import { useRef } from 'react';
import { useFrame } from 'react-three-fiber';
import { Mesh } from 'three';
import { Entity } from './useEntity';

export function useMeshRef(entity: Entity<any>) {
  const meshRef = useRef<Mesh>();

  useFrame(() => {
    if (!meshRef.current) return;
    const pos = entity.body.getPosition();
    meshRef.current.position.x = pos.x;
    meshRef.current.position.y = pos.y;
    meshRef.current.position.z = 0;
    meshRef.current.rotation.z = entity.body.getAngle();
  });

  return meshRef;
}
