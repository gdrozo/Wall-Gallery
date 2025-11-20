import { useTexture, useCursor, useGLTF } from "@react-three/drei";
import { useState, useRef, useMemo, useLayoutEffect } from "react";
import { ThreeEvent, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

export default function Photo({id, url, position: initialPosition }: { id: string; url: string; position: [number, number, number] }) {
  const texture = useTexture(url)
  const { scene } = useGLTF('/thumbtack.glb')
  const { camera } = useThree() as { camera: THREE.PerspectiveCamera }
  
  const thumbtack = useMemo(() => scene.clone(), [scene])
  
  // Cast to any to avoid TS errors with texture.image
  const img = (texture as any).image
  const aspect = img.naturalWidth / img.naturalHeight
  const height = 2.5
  const width = height * aspect

  const [position, setPosition] = useState(getPosition())
  const [hovered, setHover] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [active, setActive] = useState(false)
  
  const groupRef = useRef<THREE.Group>(null)
  const dragOffset = useRef(new THREE.Vector3())
  const hasDragged = useRef(false)

  useCursor(dragging || hovered, dragging ? 'grabbing' : 'grab', 'auto')

  useLayoutEffect(() => {
    if (groupRef.current) {
      groupRef.current.position.set(...position)
    }
  }, [])

  useFrame((state, delta) => {
    if (!groupRef.current) return
    
    const step = 12 * delta
    
    if (active) {
        // Target: World [0, 0, 3.5] -> Local [0, -1, 8.4]
        // We use a fixed target that puts the photo in front of the camera
        const targetPos = new THREE.Vector3(0, -1, 8.4)
        
        // Calculate scale to fit viewport
        const targetWorldPos = new THREE.Vector3(0, 0, 3.5)
        const distance = camera.position.distanceTo(targetWorldPos)
        const vFov = THREE.MathUtils.degToRad((camera as THREE.PerspectiveCamera).fov)
        const viewportHeight = 2 * Math.tan(vFov / 2) * distance
        const viewportWidth = viewportHeight * camera.aspect
        
        const availableWidth = viewportWidth * 0.98
        const availableHeight = viewportHeight * 0.98
        
        const scale = Math.min(availableWidth / width, availableHeight / height)

        groupRef.current.position.lerp(targetPos, step)
        groupRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), step)
        groupRef.current.rotation.set(0, 0, 0)
    } else {
        groupRef.current.position.lerp(new THREE.Vector3(...position), step)
        groupRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), step)
    }
  })

  const onPointerDown = (e: ThreeEvent<PointerEvent>) => {
    if (active) return
    e.stopPropagation()
    if (e.button !== 0) return;
    
    hasDragged.current = false
    setDragging(true)
    ;(e.target as any).setPointerCapture(e.pointerId)

    const parent = groupRef.current?.parent;
    if (!parent) return;

    const ray = e.ray;
    // Create a plane in world space that represents the parent's Z=0 plane
    const planeNormal = new THREE.Vector3(0, 0, 1).applyQuaternion(parent.getWorldQuaternion(new THREE.Quaternion()));
    const planePoint = parent.getWorldPosition(new THREE.Vector3());
    const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(planeNormal, planePoint);
    
    const intersection = new THREE.Vector3();
    ray.intersectPlane(plane, intersection);
    
    if (intersection) {
        const localIntersection = parent.worldToLocal(intersection.clone());
        dragOffset.current.subVectors(new THREE.Vector3(...position), localIntersection);
    }
  }

  const onPointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (!dragging) return;
    hasDragged.current = true
    e.stopPropagation();
    
    const parent = groupRef.current?.parent;
    if (!parent) return;

    const ray = e.ray;
    const planeNormal = new THREE.Vector3(0, 0, 1).applyQuaternion(parent.getWorldQuaternion(new THREE.Quaternion()));
    const planePoint = parent.getWorldPosition(new THREE.Vector3());
    const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(planeNormal, planePoint);
    
    const intersection = new THREE.Vector3();
    ray.intersectPlane(plane, intersection);
    
    if (intersection) {
        const localIntersection = parent.worldToLocal(intersection.clone());
        const newPos = new THREE.Vector3().addVectors(localIntersection, dragOffset.current);
        setPosition([newPos.x, newPos.y, 0]);
        storePosition([newPos.x, newPos.y, 0]);
    }
  }

  function getPosition(): [number, number, number] {
    const storedPosition = localStorage.getItem(id);
    return storedPosition ? JSON.parse(storedPosition) : initialPosition;
  }

  function storePosition(position: [number, number, number]) {
    localStorage.setItem(id, JSON.stringify(position));
  }

  const onPointerUp = (e: ThreeEvent<PointerEvent>) => {
    if (dragging) {
        setDragging(false)
        ;(e.target as any).releasePointerCapture(e.pointerId)
    }
  }

  const onClick = (e: ThreeEvent<MouseEvent>) => {
      if (hasDragged.current) return
      e.stopPropagation()
      setActive(!active)
  }

  return (
    <group 
      ref={groupRef}
      onClick={onClick}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}
      renderOrder={active ? 1000 : 0}
    >
      {/* Frame */}
      <mesh position={[0, 0, -0.01]}>
        <planeGeometry args={[width + 0.1, height + 0.1]} />
        <meshBasicMaterial color="#bfb6a9" />
      </mesh>
        
      {/* Photo */}
      <mesh>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial map={texture} />
      </mesh>
      
      {/* Thumbtack */}
      <primitive 
        object={thumbtack} 
        position={[0, 1, 0]} 
        scale={2}
        rotation={[Math.PI / 2, 0, 0]}
        castShadow
      />
   
    </group>
  )
}