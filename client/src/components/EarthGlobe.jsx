import { useEffect, useRef } from 'react';
import * as THREE from 'three';

// A real textured 3D Earth (day map + city lights at night) using three.js.
// Rotates slowly on its own; when `highlight` ({lat, lng}) is set, the camera
// eases toward that point on the globe — a "zoom into the country" effect.
export default function EarthGlobe({ highlight, className = '' }) {
  const mountRef = useRef(null);
  const targetRef = useRef(null);
  const earthRef = useRef(null);
  const cameraRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    const width = mount.clientWidth;
    const height = mount.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 3.4;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    // Earth sphere with a night-lights texture (city lights on dark landmasses)
    const textureLoader = new THREE.TextureLoader();
    const nightTexture = textureLoader.load(
      'https://eoimages.gsfc.nasa.gov/images/imagerecords/79000/79765/dnb_land_ocean_ice.2012.3600x1800.jpg',
      undefined,
      undefined,
      () => {
        // fallback to a smaller mirror if NASA's server is slow/unreachable
        textureLoader.load(
          'https://unpkg.com/three-globe@2.31.0/example/img/earth-night.jpg',
          (tex) => { material.map = tex; material.needsUpdate = true; }
        );
      }
    );

    const geometry = new THREE.SphereGeometry(1.4, 64, 64);
    const material = new THREE.MeshBasicMaterial({ map: nightTexture });
    const earth = new THREE.Mesh(geometry, material);
    earth.rotation.y = Math.PI; // face a reasonable starting longitude
    scene.add(earth);
    earthRef.current = earth;

    // Faint atmosphere glow
    const glowGeometry = new THREE.SphereGeometry(1.44, 64, 64);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0x3a6ea5,
      transparent: true,
      opacity: 0.12,
      side: THREE.BackSide,
    });
    scene.add(new THREE.Mesh(glowGeometry, glowMaterial));

    // Thin, crisp rim line right at the sphere's edge (matches the bright
    // blue atmospheric edge visible in real satellite photos of Earth)
    const rimGeometry = new THREE.SphereGeometry(1.41, 64, 64);
    const rimMaterial = new THREE.MeshBasicMaterial({
      color: 0x6fa8dc,
      transparent: true,
      opacity: 0.35,
      side: THREE.BackSide,
    });
    scene.add(new THREE.Mesh(rimGeometry, rimMaterial));

    // Marker for the highlighted country
    const markerGeometry = new THREE.SphereGeometry(0.018, 16, 16);
    const markerMaterial = new THREE.MeshBasicMaterial({ color: 0xc7a878 });
    const marker = new THREE.Mesh(markerGeometry, markerMaterial);
    marker.visible = false;
    earth.add(marker);

    const latLngToVec3 = (lat, lng, radius) => {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lng + 180) * (Math.PI / 180);
      return new THREE.Vector3(
        -radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.sin(theta)
      );
    };

    let animationId;
    let autoRotate = true;
    let isDragging = false;
    let prevMouse = { x: 0, y: 0 };
    let dragVelocity = { x: 0, y: 0 };
    let manualRotation = { x: 0, y: 0 };

    const onPointerDown = (e) => {
      isDragging = true;
      autoRotate = false;
      prevMouse = { x: e.clientX, y: e.clientY };
    };
    const onPointerMove = (e) => {
      if (!isDragging) return;
      const dx = e.clientX - prevMouse.x;
      const dy = e.clientY - prevMouse.y;
      prevMouse = { x: e.clientX, y: e.clientY };
      dragVelocity = { x: dx * 0.005, y: dy * 0.005 };
      manualRotation.x += dragVelocity.x;
      manualRotation.y += dragVelocity.y;
    };
    const onPointerUp = () => { isDragging = false; };
    const onWheel = (e) => {
      e.preventDefault();
      camera.position.z = Math.min(4.5, Math.max(1.8, camera.position.z + e.deltaY * 0.0015));
    };

    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    renderer.domElement.addEventListener('wheel', onWheel, { passive: false });
    renderer.domElement.style.cursor = 'grab';
    renderer.domElement.addEventListener('pointerdown', () => { renderer.domElement.style.cursor = 'grabbing'; });
    window.addEventListener('pointerup', () => { renderer.domElement.style.cursor = 'grab'; });

    const animate = () => {
      if (isDragging) {
        earth.rotation.y += dragVelocity.x;
        earth.rotation.x = Math.max(-1, Math.min(1, earth.rotation.x + dragVelocity.y));
        dragVelocity.x *= 0.9;
        dragVelocity.y *= 0.9;
      } else if (Math.abs(dragVelocity.x) > 0.0001 || Math.abs(dragVelocity.y) > 0.0001) {
        // momentum after release
        earth.rotation.y += dragVelocity.x;
        earth.rotation.x = Math.max(-1, Math.min(1, earth.rotation.x + dragVelocity.y));
        dragVelocity.x *= 0.95;
        dragVelocity.y *= 0.95;
      } else if (autoRotate) {
        earth.rotation.y += 0.0009;
      } else if (targetRef.current) {
        // Ease the earth's rotation so the target longitude faces the camera
        const targetY = targetRef.current.rotY;
        let diff = targetY - earth.rotation.y;
        diff = Math.atan2(Math.sin(diff), Math.cos(diff));
        earth.rotation.y += diff * 0.04;
        earth.rotation.x += (0 - earth.rotation.x) * 0.04;

        // Ease camera closer for a gentle emphasis, without losing the full globe + glow
        camera.position.z += (2.85 - camera.position.z) * 0.04;
      } else {
        camera.position.z += (3.4 - camera.position.z) * 0.03;
      }

      renderer.render(scene, camera);
      animationId = requestAnimationFrame(animate);
    };
    animate();

    // Expose a way for the effect below to update target + marker
    mount.__setHighlight = (h) => {
      if (h) {
        autoRotate = false;
        isDragging = false;
        dragVelocity = { x: 0, y: 0 };
        const vec = latLngToVec3(h.lat, h.lng, 1.4);
        marker.position.copy(vec);
        marker.visible = true;
        const theta = (h.lng + 180) * (Math.PI / 180);
        targetRef.current = { rotY: -theta - Math.PI / 2 + Math.PI };
      } else {
        autoRotate = true;
        marker.visible = false;
        targetRef.current = null;
      }
    };

    const handleResize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      mount.removeChild(renderer.domElement);
      geometry.dispose();
      material.dispose();
    };
  }, []);

  useEffect(() => {
    if (mountRef.current?.__setHighlight) {
      mountRef.current.__setHighlight(highlight);
    }
  }, [highlight]);

  return <div ref={mountRef} className={className} />;
}
