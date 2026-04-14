import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox, MeshPhysicalMaterial, Environment, Float, Html } from '@react-three/drei';
import * as THREE from 'three';
import FloatingAsset from './FloatingAsset';

const IPhoneProMax = ({ scrollProgress }) => {
  const group = useRef();
  
  // High-fidelity material constants
  const titaniumMaterial = new THREE.MeshPhysicalMaterial({
    color: '#1a1a1a',
    metalness: 1,
    roughness: 0.15,
    clearcoat: 1,
    clearcoatRoughness: 0.1,
    reflectivity: 1,
  });

  const screenMaterial = new THREE.MeshStandardMaterial({
    color: '#000000',
    metalness: 0,
    roughness: 0.1,
  });

  const lensMaterial = new THREE.MeshPhysicalMaterial({
    color: '#222',
    metalness: 1,
    roughness: 0,
    transparent: true,
    opacity: 0.8,
    transmission: 0.9,
    thickness: 0.5,
  });

  useFrame((state) => {
    if (!group.current) return;
    
    // SCROLL-DRIVEN ROTATION & POSITION
    // 0 -> 1: Rotate from front-facing to a slight tilt, then reveal back if needed
    const rotationX = THREE.MathUtils.lerp(0.2, 0.6, scrollProgress.get());
    const rotationY = THREE.MathUtils.lerp(-0.2, -0.6, scrollProgress.get());
    const scale = THREE.MathUtils.lerp(1, 1.3, scrollProgress.get());

    group.current.rotation.x = rotationX;
    group.current.rotation.y = rotationY;
    group.current.scale.set(scale, scale, scale);
  });

  return (
    <group ref={group}>
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
        
        {/* MAIN CHASSIS */}
        <RoundedBox args={[3.4, 7, 0.4]} radius={0.5} smoothness={4} material={titaniumMaterial}>
          
          {/* SCREEN PANEL */}
          <group position={[0, 0, 0.21]}>
             <RoundedBox args={[3.2, 6.8, 0.05]} radius={0.4} smoothness={4} material={screenMaterial}>
               {/* INTERNAL CONTENT (RENDERED VIA HTML FOR RETINA SHARPNESS) */}
               <Html 
                 transform 
                 occlude 
                 distanceFactor={3.5} 
                 position={[0, 0, 0.03]}
                 style={{ width: '340px', height: '700px', pointerEvents: 'auto' }}
               >
                 <div className="w-[340px] h-[700px] bg-black overflow-hidden relative">
                    <FloatingAsset scrollProgress={scrollProgress} />
                 </div>
               </Html>
             </RoundedBox>
          </group>

          {/* CAMERA HUB (REAR) */}
          <group position={[0.7, 2.5, -0.21]} rotation={[0, Math.PI, 0]}>
             <RoundedBox args={[1.5, 1.5, 0.1]} radius={0.2} smoothness={4} material={titaniumMaterial} />
             {/* THREE LENSES */}
             {[
               [-0.35, 0.35], [0.35, 0.35], [0, -0.35]
             ].map((pos, i) => (
               <mesh key={i} position={[pos[0], pos[1], 0.08]}>
                 <cylinderGeometry args={[0.3, 0.3, 0.1, 32]} />
                 <primitive object={lensMaterial} attach="material" />
               </mesh>
             ))}
          </group>

          {/* FRONT NOTCH (DYNAMIC ISLAND AREA) */}
          <mesh position={[0, 3.1, 0.24]}>
             <capsuleGeometry args={[0.1, 0.5, 4, 16]} />
             <meshBasicMaterial color="#000" />
          </mesh>

        </RoundedBox>

        {/* GLOWING AMBIENCE */}
        <pointLight position={[5, 5, 5]} intensity={200} color="#1e90ff" />
        <pointLight position={[-5, -5, 5]} intensity={100} color="#00ffa3" />
      </Float>

      <Environment preset="city" />
    </group>
  );
};

export default IPhoneProMax;
