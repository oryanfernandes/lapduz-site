"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { gsap } from "@/lib/useGsap";

const LOGOS: { img: string; link: string }[] = [
  { img: "https://lapduz.com/wp-content/uploads/2026/03/citrolife.png",    link: "https://www.instagram.com/citrolife_sucos/" },
  { img: "https://lapduz.com/wp-content/uploads/2026/03/jardins.png",      link: "https://www.instagram.com/oticajardinsararaquara/" },
  { img: "https://lapduz.com/wp-content/uploads/2026/03/makar.png",        link: "https://www.instagram.com/makarmultimarcas/" },
  { img: "https://lapduz.com/wp-content/uploads/2026/03/transface.png",    link: "https://www.instagram.com/transfacetransportes/" },
  { img: "https://lapduz.com/wp-content/uploads/2026/03/zapad.png",        link: "https://www.instagram.com/zapadlab/" },
  { img: "https://lapduz.com/wp-content/uploads/2026/03/omni.png",         link: "https://www.instagram.com/agenteomniararaquara/" },
  { img: "/globologos/arthur.png",                                         link: "https://www.instagram.com/arthuraguiar/" },
  { img: "https://lapduz.com/wp-content/uploads/2026/03/sofer.png",        link: "https://www.instagram.com/soferagroindustrial/" },
  { img: "https://lapduz.com/wp-content/uploads/2026/03/suprema.png",      link: "https://www.instagram.com/suprema.vidrosesquadrias/" },
];

/**
 * Esfera 3D de logos (three.js vanilla) com drag pra girar, hover pra escalar
 * e click pra abrir o Instagram do cliente.
 */
export default function LogoSphere() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container: HTMLDivElement | null = containerRef.current;
    if (!container) return;
    const el = container; // alias não-nulo para uso em closures aninhadas

    const FOV = 75;
    const RADIUS = 230;
    const BASE_SIZE = 100;
    const MAX_LOGO_ASPECT = 3;
    const Z_DESKTOP = 470; // pouco mais perto que o original 500 — esfera ~6% maior, sem zoom exagerado
    // No mobile não tem hover, então o sprite máximo é só base * aspect
    const SPRITE_HALF_NO_HOVER = (BASE_SIZE * MAX_LOGO_ASPECT) / 2;
    const MAX_EXTENT_NO_HOVER = RADIUS + SPRITE_HALF_NO_HOVER;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      FOV,
      el.clientWidth / el.clientHeight,
      0.1,
      2000
    );

    /**
     * Desktop (aspect >= 1.0): Z fixo em 500 — tamanho original da esfera.
     * Mobile (aspect < 1.0): empurra Z só o suficiente pra logos não cortarem
     * lateralmente. O ideal seria manter mesmo tamanho mas o frustum não cabe
     * em viewport estreita; o pull-back é mínimo (sem incluir hover, já que
     * mobile não tem hover).
     */
    const fitCamera = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (!w || !h) return;
      const aspect = w / h;
      camera.aspect = aspect;

      if (aspect >= 1.0) {
        camera.position.z = Z_DESKTOP;
      } else {
        const fovRad = (FOV * Math.PI) / 180;
        const tanHalf = Math.tan(fovRad / 2);
        const dH = MAX_EXTENT_NO_HOVER / (tanHalf * aspect);
        camera.position.z = Math.max(Z_DESKTOP, dH * 1.05);
      }
      camera.updateProjectionMatrix();
    };
    fitCamera();

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(el.clientWidth, el.clientHeight);
    el.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    const radius = RADIUS;
    const loader = new THREE.TextureLoader();
    loader.crossOrigin = "anonymous";

    LOGOS.forEach((item, i) => {
      // Assets locais (ex: /globologos/arthur.png) carregam direto; só URLs
      // externas passam pelo proxy /api/img (resolve CORS do WP do Lapduz).
      const src = item.img.startsWith("http")
        ? `/api/img?url=${encodeURIComponent(item.img)}`
        : item.img;
      loader.load(src, (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        const material = new THREE.SpriteMaterial({
          map: tex,
          transparent: true,
        });
        const sprite = new THREE.Sprite(material);
        const baseSize = 100;
        const aspect = tex.image.width / tex.image.height;
        const scaleX = baseSize * aspect;
        const scaleY = baseSize;
        sprite.scale.set(scaleX, scaleY, 1);
        sprite.userData = {
          baseScale: { x: scaleX, y: scaleY },
          link: item.link,
        };
        const phi = Math.acos(-1 + (2 * i) / LOGOS.length);
        const theta = Math.sqrt(LOGOS.length * Math.PI) * phi;
        sprite.position.set(
          radius * Math.cos(theta) * Math.sin(phi),
          radius * Math.sin(theta) * Math.sin(phi),
          radius * Math.cos(phi)
        );
        group.add(sprite);
      });
    });

    /* No mobile (touch), desativamos drag/click/hover — apenas auto-rotação */
    const isInteractive = window.matchMedia("(pointer: fine)").matches;

    /* --- DRAG --- */
    let isDown = false;
    let hasDragged = false;
    let isInteracting = false;
    let lastX = 0;
    let lastY = 0;
    let velX = 0.002;
    let velY = 0.001;

    const onDown = (e: PointerEvent) => {
      isDown = true;
      hasDragged = false;
      isInteracting = true;
      el.classList.add("grabbing");
      lastX = e.clientX;
      lastY = e.clientY;
    };
    const onUp = () => {
      isDown = false;
      isInteracting = false;
      el.classList.remove("grabbing");
    };
    const onMoveDrag = (e: PointerEvent) => {
      if (!isDown) return;
      hasDragged = true;
      velX = (e.clientX - lastX) * 0.005;
      velY = (e.clientY - lastY) * 0.005;
      lastX = e.clientX;
      lastY = e.clientY;
    };

    /* --- RAYCAST --- */
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let hovered: THREE.Sprite | null = null;

    const onMoveHover = (event: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const onClick = (event: MouseEvent) => {
      if (hasDragged) return;
      const rect = el.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(group.children);
      if (intersects.length > 0) {
        const obj = intersects[0].object as THREE.Sprite;
        const base = obj.userData.baseScale;
        gsap.to(obj.scale, {
          x: base.x * 1.2,
          y: base.y * 1.2,
          duration: 0.1,
          yoyo: true,
          repeat: 1,
        });
        setTimeout(() => {
          window.open(obj.userData.link, "_blank", "noopener");
        }, 180);
      }
    };

    // Só registra os listeners se for desktop (pointer: fine)
    if (isInteractive) {
      el.addEventListener("pointerdown", onDown);
      window.addEventListener("pointerup", onUp);
      window.addEventListener("pointermove", onMoveDrag);
      el.addEventListener("pointermove", onMoveHover);
      el.addEventListener("click", onClick);
    } else {
      // mobile: scroll passa por cima do canvas normalmente
      el.style.touchAction = "auto";
      el.style.cursor = "default";
    }

    function handleHover() {
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(group.children);
      if (intersects.length > 0) {
        const obj = intersects[0].object as THREE.Sprite;
        el.classList.add("hovering");
        if (hovered !== obj) {
          if (hovered) {
            const b = hovered.userData.baseScale;
            gsap.to(hovered.scale, { x: b.x, y: b.y, duration: 0.3 });
          }
          hovered = obj;
          const b = obj.userData.baseScale;
          gsap.to(obj.scale, {
            x: b.x * 1.6,
            y: b.y * 1.6,
            duration: 0.3,
            ease: "power2.out",
          });
        }
      } else {
        el.classList.remove("hovering");
        if (hovered) {
          const b = hovered.userData.baseScale;
          gsap.to(hovered.scale, { x: b.x, y: b.y, duration: 0.3 });
        }
        hovered = null;
      }
    }

    /* --- LOOP com IntersectionObserver --- */
    let active = false;
    let rafId: number | null = null;
    function animate() {
      if (!active) return;
      rafId = requestAnimationFrame(animate);
      if (!isDown) {
        velX *= 0.97;
        velY *= 0.97;
      }
      group.rotation.y += velX;
      group.rotation.x += velY;
      if (!isInteracting) {
        group.rotation.y += 0.001;
        group.rotation.x += 0.001;
      }
      if (isInteractive) handleHover();
      renderer.render(scene, camera);
    }
    const start = () => {
      if (!active) {
        active = true;
        animate();
      }
    };
    const stop = () => {
      active = false;
      if (rafId) cancelAnimationFrame(rafId);
    };

    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => (e.isIntersecting ? start() : stop())),
      { threshold: 0.1, rootMargin: "150px" }
    );
    io.observe(el);

    // RESIZE — re-ajusta o Z da câmera além de tamanho do renderer
    const onResize = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h);
      fitCamera();
    };
    window.addEventListener("resize", onResize);

    return () => {
      io.disconnect();
      stop();
      window.removeEventListener("resize", onResize);
      if (isInteractive) {
        el.removeEventListener("pointerdown", onDown);
        window.removeEventListener("pointerup", onUp);
        window.removeEventListener("pointermove", onMoveDrag);
        el.removeEventListener("pointermove", onMoveHover);
        el.removeEventListener("click", onClick);
      }
      renderer.dispose();
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      group.traverse((obj) => {
        const sp = obj as THREE.Sprite;
        if (sp.material) sp.material.dispose();
      });
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="three-sphere relative aspect-square w-full select-none overflow-hidden md:max-w-[700px] md:cursor-grab"
    />
  );
}
