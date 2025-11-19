import { Canvas, useThree } from '@react-three/fiber'
import { useTexture, Image, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import Gallery from './Gallery'

function CanvasComponent() {
  return (
    <Canvas>
      <InnerCanvas />
    </Canvas>
  )
}

export default CanvasComponent

function InnerCanvas() {
  const texture = useTexture('/Background.jpg')
  const { camera } = useThree() as { camera: THREE.PerspectiveCamera }
  const planeZ = -5

  // Calculate the viewport size at the plane's distance
  const distance = camera.position.z - planeZ
  const vFov = (camera.fov * Math.PI) / 180 // convert vertical fov to radians
  const viewportHeight = 2 * Math.tan(vFov / 2) * distance
  const viewportWidth = viewportHeight * camera.aspect

  let planeWidth = viewportWidth
  let planeHeight = viewportHeight

  if (texture.image) {
    const w = (texture as any).image.naturalWidth
    const h = (texture as any).image.naturalHeight
    const imageAspect = w / h
    const viewportAspect = viewportWidth / viewportHeight

    if (imageAspect > viewportAspect) {
      // Image is wider than viewport, so we 'cover' by fitting the height and cropping the width
      planeWidth = viewportHeight * imageAspect
    } else {
      // Image is taller than viewport, so we 'cover' by fitting the width and cropping the height
      planeHeight = viewportWidth / imageAspect
    }
  }

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[50, 0, 5]} />

      <directionalLight color="red" position={[0, 0, 5]} />
      {/* background wall */}
      <mesh position={[0, 0, planeZ]}>
        <planeGeometry args={[planeWidth, planeHeight]} />
        <meshBasicMaterial map={texture} />
      </mesh>

      <Gallery />
      
      {/* 
      <OrbitControls />
       */}
    </>
  )
}
