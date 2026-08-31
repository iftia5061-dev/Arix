import { useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'

function lerp(current, target, factor) {
  return current + (target - current) * factor
}

function IcosahedronShape() {
  const meshRef = useRef(null)
  const { viewport } = useThree()
  const mouse = useRef({ x: 0, y: 0 })

  // Track mouse position within the canvas
  useFrame((state) => {
    if (!meshRef.current) return

    mouse.current.x = lerp(mouse.current.x, state.pointer.x, 0.05)
    mouse.current.y = lerp(mouse.current.y, state.pointer.y, 0.05)

    // Gyro tilt based on mouse position
    meshRef.current.rotation.x = lerp(meshRef.current.rotation.x, mouse.current.y * 0.6, 0.05)
    meshRef.current.rotation.y = lerp(meshRef.current.rotation.y, mouse.current.x * 0.6, 0.05)

    // Slow idle auto-rotation
    meshRef.current.rotation.z += 0.002
  })

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[1.4, 0]} />
      <meshStandardMaterial
        color="#00F0FF"
        emissive="#00F0FF"
        emissiveIntensity={0.4}
        wireframe
      />
    </mesh>
  )
}

function GyroModel() {
  return (
    <div style={{ width: '100%', height: '100%', minHeight: '260px' }}>
      <Canvas camera={{ position: [0, 0, 4], fov: 45 }}>
        <ambientLight intensity={0.3} />
        <pointLight position={[3, 2, 3]} color="#00F0FF" intensity={1.2} />
        <pointLight position={[-3, -2, -2]} color="#B026FF" intensity={1.2} />
        <IcosahedronShape />
      </Canvas>
    </div>
  )
}

export default GyroModel