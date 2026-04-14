import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox, Environment, Float, Html } from '@react-three/drei';
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
  });

  useFrame((state) => {
    if (!group.current) return;
    
    // SCROLL-DRIVEN ROTATION & POSITION
    // Ensure scrollProgress.get() is available
    const prog = typeof scrollProgress.get === 'function' ? scrollProgress.get() : 0;
    
    const rotationX = THREE.MathUtils.lerp(0.1, 0.4, prog);
    const rotationY = THREE.MathUtils.lerp(-0.1, -0.5, prog);
    const scale = THREE.MathUtils.lerp(1, 1.25, prog);

    group.current.rotation.x = rotationX;
    group.current.rotation.y = rotationY;
    group.current.scale.set(scale, scale, scale);
  });

  return (
    <group ref={group}>
      <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.3}>
        
        {/* MAIN CHASSIS */}
        <RoundedBox args={[3.4, 7, 0.4]} radius={0.5} smoothness={4}>
           <primitive object={titaniumMaterial} attach="material" />
          
          {/* SCREEN PANEL */}
          <group position={[0, 0, 0.21]}>
             <RoundedBox args={[3.2, 6.8, 0.05]} radius={0.4} smoothness={4}>
               <primitive object={screenMaterial} attach="material" />
               
               {/* INTERNAL CONTENT (RENDERED VIA HTML FOR RETINA SHARPNESS) */}
               <Html 
                 transform 
                 distanceFactor={4} 
                 position={[0, 0, 0.04]}
                 style={{ width: '340px', height: '700px', pointerEvents: 'auto' }}
                 portal={{ current: document.body }}
               >
                 <div className="w-[340px] h-[700px] bg-black overflow-hidden relative border-[1px] border-white/10 rounded-[4rem]">
                    <FloatingAsset scrollProgress={scrollProgress} />
                 </div>
               </Html>
             </RoundedBox>
          </group>

          {/* CAMERA HUB (REAR) */}
          <group position={[0.7, 2.5, -0.21]} rotation={[0, Math.PI, 0]}>
             <RoundedBox args={[1.5, 1.5, 0.1]} radius={0.2} smoothness={4}>
                <primitive object={titaniumMaterial} attach="material" />
             </RoundedBox>
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
             <capsuleGeometry args={[0.08, 0.45, 4, 16]} />
             <meshBasicMaterial color="#000" />
          </mesh>

        </RoundedBox>
      </Float>

      {/* FAIL-SAFE ENVIRONMENT (If presets fail, standard lights in VibeHero will take over) */}
      <Environment preset="city" blur={1} />
    </group>
  );
};

export default IPhoneProMax;
