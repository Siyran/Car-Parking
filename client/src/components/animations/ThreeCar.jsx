import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Float, MeshDistortMaterial, MeshWobbleMaterial, PerspectiveCamera, OrbitControls, Environment, PresentationControls, ContactShadows, Stars } from '@react-three/drei';
import { useRef, useState, useMemo } from 'react';
import * as THREE from 'three';

function FuturisticCar() {
  const meshRef = useRef();
  
  // Use a technical, floating geometric car representation
  // This is a "Mobility Node" concept consistent with the app's terminology
  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <group ref={meshRef}>
        {/* Main Body */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[4, 0.8, 2]} />
          <meshStandardMaterial 
            color="#0f172a" 
            metalness={0.9} 
            roughness={0.1} 
            emissive="#3b82f6"
            emissiveIntensity={0.2}
          />
        </mesh>

        {/* Floating Top/Cockpit */}
        <mesh position={[0, 0.6, 0]}>
          <boxGeometry args={[2.5, 0.5, 1.6]} />
          <meshPhysicalMaterial 
            color="#3b82f6" 
            transmission={0.8} 
            thickness={0.5} 
            roughness={0.1} 
            transparent
            opacity={0.6}
          />
        </mesh>

        {/* Glowing Engine/Core */}
        <mesh position={[0, -0.2, 0]}>
          <boxGeometry args={[3.8, 0.1, 1.8]} />
          <meshStandardMaterial 
            color="#3b82f6" 
            emissive="#3b82f6" 
            emissiveIntensity={2} 
          />
        </mesh>

        {/* Side Accents/Wings */}
        <mesh position={[0, 0, 1.1]}>
          <boxGeometry args={[3.5, 0.1, 0.2]} />
          <meshStandardMaterial color="#8b5cf6" emissive="#8b5cf6" emissiveIntensity={1} />
        </mesh>
        <mesh position={[0, 0, -1.1]}>
          <boxGeometry args={[3.5, 0.1, 0.2]} />
          <meshStandardMaterial color="#8b5cf6" emissive="#8b5cf6" emissiveIntensity={1} />
        </mesh>

        {/* "Wheels" / Anti-Grav Nodes */}
        {[-1.5, 1.5].map(x => [-0.8, 0.8].map(z => (
          <mesh key={`${x}-${z}`} position={[x, -0.4, z]}>
            <cylinderGeometry args={[0.4, 0.4, 0.1, 32]} />
            <meshStandardMaterial color="#1e293b" emissive="#3b82f6" emissiveIntensity={2} />
          </mesh>
        )))}
      </group>
    </Float>
  );
}

function Ground() {
  const gridMap = useMemo(() => {
    const size = 100;
    const divisions = 100;
    const grid = new THREE.GridHelper(size, divisions, "#3b82f6", "#1e293b");
    grid.material.opacity = 0.15;
    grid.material.transparent = true;
    return grid;
  }, []);

  return (
    <group position={[0, -1.5, 0]}>
      <primitive object={gridMap} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#020617" />
      </mesh>
    </group>
  );
}

function ScanningRing() {
  const meshRef = useRef();
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    meshRef.current.scale.x = 1 + Math.sin(t) * 0.1;
    meshRef.current.scale.y = 1 + Math.sin(t) * 0.1;
    meshRef.current.rotation.z += 0.01;
  });

  return (
    <mesh ref={meshRef} position={[0, -1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[4, 4.2, 64]} />
      <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={2} transparent opacity={0.4} />
    </mesh>
  );
}

export default function ThreeCar() {
  return (
    <div className="w-full h-full min-h-[600px] relative">
      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 2, 10]} fov={45} />
        <color attach="background" args={['#020617']} />
        
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} castShadow color="#3b82f6" />
        <pointLight position={[-10, -10, -10]} intensity={1} color="#8b5cf6" />
        
        <Stars radius={50} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        
        <PresentationControls
          global
          config={{ mass: 2, tension: 500 }}
          snap={{ mass: 4, tension: 1500 }}
          rotation={[0, 0.3, 0]}
          polar={[-Math.PI / 4, Math.PI / 4]}
          azimuth={[-Math.PI / 2, Math.PI / 2]}
        >
          <FuturisticCar />
        </PresentationControls>

        <ScanningRing />
        <Ground />
        
        <ContactShadows position={[0, -1.4, 0]} opacity={0.4} scale={20} blur={2} far={4.5} />
        <Environment preset="city" />
      </Canvas>

      {/* Interface Overlay */}
      <div className="absolute inset-x-0 bottom-10 flex flex-col items-center pointer-events-none gap-4">
         <div className="flex items-center gap-6">
            <div className="flex flex-col items-end">
               <span className="text-[10px] font-black text-primary-500 uppercase tracking-[0.4em]">Node Link</span>
               <span className="text-xs font-black text-white italic uppercase tracking-tighter">ACTIVE</span>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="flex flex-col items-start text-glow">
               <span className="text-[10px] font-black text-accent-500 uppercase tracking-[0.4em]">Protocol</span>
               <span className="text-xs font-black text-white italic uppercase tracking-tighter">SYNCED</span>
            </div>
         </div>
         <div className="w-48 h-1 bg-white/5 rounded-full overflow-hidden">
            <motion.div 
               animate={{ x: ['100%', '-100%'] }} 
               transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
               className="w-full h-full bg-linear-to-r from-transparent via-primary-500 to-transparent" 
            />
         </div>
      </div>
    </div>
  );
}
