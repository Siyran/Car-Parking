import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const ThreeParkingScene = () => {
  const mountRef = useRef(null);
  const rendererRef = useRef(null);

  useEffect(() => {
    // 1. SCENE & CAMERA SETUP
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;
    mountRef.current.appendChild(renderer.domElement);

    // 2. LIGHTING
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    // 3. THE MAP (INTERNAL SCREEN VIEW)
    const textureLoader = new THREE.TextureLoader();
    const mapTexture = textureLoader.load("https://cartodb-basemaps-a.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png");
    
    // We'll use a large plane for the map background
    const mapGeo = new THREE.PlaneGeometry(30, 30);
    const mapMat = new THREE.MeshBasicMaterial({ 
      map: mapTexture,
      transparent: true,
      opacity: 0.15,
      color: 0x1e293b
    });
    const mapPlane = new THREE.Mesh(mapGeo, mapMat);
    mapPlane.position.z = -2;
    scene.add(mapPlane);

    // Stylized Grid Overlay
    const gridHelper = new THREE.GridHelper(40, 40, 0x00ffa3, 0x00ffa3);
    gridHelper.rotation.x = Math.PI / 2;
    gridHelper.position.z = -1.9;
    gridHelper.material.opacity = 0.05;
    gridHelper.material.transparent = true;
    scene.add(gridHelper);

    // 4. THE PRO VEHICLE (HIGH-RES PROJECTION)
    const carTexture = textureLoader.load("https://cdn-icons-png.flaticon.com/512/744/744465.png");
    const carGeo = new THREE.PlaneGeometry(0.8, 0.8);
    const carMat = new THREE.MeshBasicMaterial({ 
      map: carTexture, 
      transparent: true,
      side: THREE.DoubleSide
    });
    const carPlane = new THREE.Mesh(carGeo, carMat);
    carPlane.position.set(0, -1, 0.5);
    scene.add(carPlane);

    // Car Shadow (Soft Glow)
    const shadowGeo = new THREE.CircleGeometry(0.5, 32);
    const shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.4, side: THREE.DoubleSide });
    const carShadow = new THREE.Mesh(shadowGeo, shadowMat);
    carShadow.position.z = -0.05;
    carPlane.add(carShadow);

    // 5. PARKING SPOTS (GLOW SPRITES)
    const spots = [];
    const glowTexture = textureLoader.load("https://res.cloudinary.com/df9v7as6k/image/upload/v1642103507/radial-glow.png"); // Generic radial glow
    
    for (let i = 0; i < 15; i++) {
        const spotMat = new THREE.SpriteMaterial({ 
          map: glowTexture, 
          color: Math.random() > 0.3 ? 0x00ffa3 : 0xff3b3b,
          transparent: true,
          opacity: 0.6,
          blending: THREE.AdditiveBlending
        });
        const spot = new THREE.Sprite(spotMat);
        spot.position.set((Math.random() - 0.5) * 15, (Math.random() - 0.5) * 20, -1.8);
        spot.scale.set(0.6, 0.6, 1);
        scene.add(spot);
        spots.push(spot);
    }

    // 6. GSAP ANIMATION TIMELINE
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: ".three-trigger",
        start: "top top",
        end: "bottom bottom",
        scrub: 1,
      }
    });

    tl.to(camera.position, { z: 3.5, y: 1 }, 0)
      .to(carPlane.position, { x: 3, y: 5, z: 1 }, 0)
      .to(carPlane.rotation, { z: -0.4 }, 0)
      .to(mapPlane.position, { y: 2 }, 0);

    // 7. RENDER LOOP
    const clock = new THREE.Clock();
    const animate = () => {
      const delta = clock.getElapsedTime();
      
      // Floating sports car
      carPlane.position.y += Math.sin(delta * 2) * 0.002;
      
      // Pulsing spots
      spots.forEach((s, i) => {
        const pulse = 0.5 + Math.sin(delta * 2 + i) * 0.2;
        s.scale.set(pulse, pulse, 1);
        s.material.opacity = 0.4 + Math.sin(delta * 2 + i) * 0.2;
      });

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    animate();

    // 8. UTILS
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      tl.kill();
      ScrollTrigger.getAll().forEach(t => t.kill());
      if (mountRef.current) mountRef.current.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className="fixed inset-0 pointer-events-none z-0 overflow-hidden" />;
};

export default ThreeParkingScene;
