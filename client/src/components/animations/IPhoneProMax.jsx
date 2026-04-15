import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox, Environment, Float, Html } from '@react-three/drei';
import * as THREE from 'three';
import FloatingAsset from './FloatingAsset';

const IPhoneProMax = ({ scrollProgress }) => {
  const group = useRef();
  const spotlight = useRef();
  
  // STATE-OF-THE-ART MATERIAL: Black Titanium
  const titaniumMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: '#1a1a1a',
    metalness: 1,
    roughness: 0.18,
    clearcoat: 1,
    clearcoatRoughness: 0.05,
    reflectivity: 1,
    sheen: 0.5,
    sheenRoughness: 0.2,
    sheenColor: new THREE.Color('#444'),
  }), []);

  const lensMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: '#000',
    metalness: 1,
    roughness: 0,
    transmission: 0.95,
    thickness: 1,
    transparent: true,
    opacity: 0.9,
  }), []);

  const screenMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#000',
    metalness: 0,
    roughness: 0.1,
  }), []);

  useFrame((state) => {
    if (!group.current) return;
    
    // SCROLL-DRIVEN DRAMATIC ROTATION
    const prog = typeof scrollProgress.get === 'function' ? scrollProgress.get() : 0;
    
    // Dramatic Y-rotation to show thickness and back lenses
    const rotationX = THREE.MathUtils.lerp(0.1, 0.5, prog);
    const rotationY = THREE.MathUtils.lerp(-0.1, -1.2, prog); // Revealing the side and rear
    const scale = THREE.MathUtils.lerp(1, 1.4, prog);

    group.current.rotation.x = rotationX;
    group.current.rotation.y = rotationY;
    group.current.scale.set(scale, scale, scale);

    // Reactive Spotlight: Follows the phone's tilt to create moving highlights
    if (spotlight.current) {
        spotlight.current.position.x = Math.sin(state.clock.elapsedTime) * 2;
        spotlight.current.position.y = Math.cos(state.clock.elapsedTime) * 2;
    }
  });

  return (
    <group ref={group}>
      <Float speed={2} rotationIntensity={0.25} floatIntensity={0.6}>
        
        {/* MAIN 3D CHASSIS */}
        <RoundedBox args={[3.4, 7, 0.4]} radius={0.5} smoothness={8}>
           <primitive object={titaniumMaterial} attach="material" />
          
          {/* SCREEN PANEL (INSIDE FRONT) */}
          <group position={[0, 0, 0.2]}>
             <RoundedBox args={[3.2, 6.8, 0.05]} radius={0.4} smoothness={4}>
               <primitive object={screenMaterial} attach="material" />
               
               {/* RETINA CONTENT PROJECTION */}
               <Html 
                 transform 
                 distanceFactor={4} 
                 position={[0, 0, 0.03]}
                 style={{ width: '340px', height: '700px', pointerEvents: 'auto' }}
               >
                 <div className="w-[340px] h-[700px] bg-black overflow-hidden relative rounded-[3.8rem]">
                    <FloatingAsset scrollProgress={scrollProgress} />
                 </div>
               </Html>
             </RoundedBox>
          </group>

          {/* PHYSICAL SIDE BUTTONS (THE 'ACTUAL PHONE' DETAILS) */}
          {/* Action Button & Volume */}
          <group position={[-1.72, 1.8, 0]}>
             <RoundedBox args={[0.08, 0.4, 0.1]} radius={0.02} material={titaniumMaterial} />
          </group>
          <group position={[-1.72, 1, 0]}>
             <RoundedBox args={[0.08, 0.8, 0.1]} radius={0.02} material={titaniumMaterial} />
          </group>
          {/* Power Button */}
          <group position={[1.72, 1, 0]}>
             <RoundedBox args={[0.08, 1.2, 0.1]} radius={0.02} material={titaniumMaterial} />
          </group>

          {/* STATE-OF-THE-ART CAMERA HUB (REAR) */}
          <group position={[0.6, 2.4, -0.22]} rotation={[0, Math.PI, 0]}>
             {/* Hub Base */}
             <RoundedBox args={[1.7, 1.7, 0.15]} radius={0.25} smoothness={4}>
                <primitive object={titaniumMaterial} attach="material" />
             </RoundedBox>
             {/* THREE PRO LENSES */}
             {[
               [-0.4, 0.4], [0.4, 0.4], [0, -0.4]
             ].map((pos, i) => (
               <group key={i} position={[pos[0], pos[1], 0.1]}>
                  {/* Outer Ring */}
                  <mesh rotation={[Math.PI/2, 0, 0]}>
                     <cylinderGeometry args={[0.35, 0.35, 0.1, 64]} />
                     <primitive object={titaniumMaterial} attach="material" />
                  </mesh>
                  {/* Glass Lens */}
                  <mesh position={[0, 0, 0.06]}>
                     <sphereGeometry args={[0.25, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
                     <primitive object={lensMaterial} attach="material" />
                  </mesh>
                  {/* Internal Camera Detail */}
                  <mesh position={[0, 0, 0.02]}>
                     <circleGeometry args={[0.15, 32]} />
                     <meshBasicMaterial color="#111" />
                  </mesh>
               </group>
             ))}
          </group>

          {/* FRONT DYNAMIC ISLAND */}
          <mesh position={[0, 3.1, 0.23]}>
             <capsuleGeometry args={[0.08, 0.45, 8, 32]} />
             <meshBasicMaterial color="#000" />
          </mesh>

        </RoundedBox>

        {/* RECTIVE HIGHLIGHTS */}
        <spotLight 
            ref={spotlight}
            position={[5, 10, 5]} 
            angle={0.2} 
            penumbra={1} 
            intensity={400} 
            color="#fff" 
            castShadow 
        />
      </Float>

      <Environment preset="city" />
    </group>
  );
};

export default IPhoneProMax;
