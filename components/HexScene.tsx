"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { gsap, ScrollTrigger } from "@/lib/gsap";

type Variant = "lattice" | "vee";

/**
 * Three.js hero scene. A honeycomb of hexagonal prisms (the brand motif) that rises in on load,
 * ripples under the pointer and tilts with scroll. GSAP owns the `state` object (intro, scroll,
 * pointer easing); Three.js just reads it every frame.
 * "vee" adds two angled banks of pistons (a V engine) on top of a calm lattice floor.
 */
export default function HexScene({ variant = "lattice", className = "" }: { variant?: Variant; className?: string }) {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    } catch {
      return; // CSS fallback behind the canvas stays visible
    }
    const coarse = matchMedia("(pointer: coarse)").matches;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, coarse ? 1.5 : 2));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    el.appendChild(renderer.domElement);
    renderer.domElement.setAttribute("aria-hidden", "true");
    Object.assign(renderer.domElement.style, { width: "100%", height: "100%", display: "block" });

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);

    // ---- lights
    scene.add(new THREE.HemisphereLight(0xffffff, 0xcfe6da, 1.15));
    const key = new THREE.DirectionalLight(0xffffff, 2.2);
    key.position.set(-6, 12, 6);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0x18b777, 1.4);
    rim.position.set(8, 4, -8);
    scene.add(rim);
    const glow = new THREE.PointLight(0x18b777, 40, 14, 1.6);
    glow.position.set(0, 3, 0);
    scene.add(glow);

    // ---- honeycomb
    const N = variant === "vee" ? 6 : coarse ? 6 : 7;
    const r = 0.5;
    const d = Math.sqrt(3) * r;
    const cells: { x: number; z: number; dist: number }[] = [];
    for (let q = -N; q <= N; q++)
      for (let s = -N; s <= N; s++) {
        if (Math.abs(q + s) > N) continue;
        const x = d * (q + s / 2);
        const z = 1.5 * r * s;
        cells.push({ x, z, dist: Math.hypot(x, z) });
      }
    const maxDist = Math.max(...cells.map((c) => c.dist));
    const geo = new THREE.CylinderGeometry(r * 0.94, r * 0.94, 1, 6, 1);
    geo.translate(0, 0.5, 0);
    const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.38, metalness: 0.04 });
    const lattice = new THREE.InstancedMesh(geo, mat, cells.length);
    lattice.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    lattice.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(cells.length * 3), 3);
    const root = new THREE.Group();
    root.add(lattice);
    scene.add(root);

    // ---- V-engine pistons (variant "vee")
    const pistons: { housing: THREE.Mesh; piston: THREE.Mesh; phase: number }[] = [];
    if (variant === "vee") {
      const hGeo = new THREE.CylinderGeometry(0.42, 0.42, 1, 6);
      hGeo.translate(0, 0.5, 0);
      const pGeo = new THREE.CylinderGeometry(0.3, 0.3, 1, 6);
      pGeo.translate(0, 0.5, 0);
      const hMat = new THREE.MeshStandardMaterial({ color: 0xf2f7f4, roughness: 0.25, metalness: 0.15 });
      const pMat = new THREE.MeshStandardMaterial({ color: 0x08794d, roughness: 0.3, metalness: 0.3, emissive: 0x0a6b45, emissiveIntensity: 0.6 });
      [-1, 1].forEach((side) => {
        const bank = new THREE.Group();
        bank.position.set(side * 0.2, 0.4, 0);
        bank.rotation.z = -side * 0.62;
        for (let i = 0; i < 4; i++) {
          const g = new THREE.Group();
          g.position.set(0, 0, (i - 1.5) * 1.12);
          const housing = new THREE.Mesh(hGeo, hMat);
          housing.scale.set(1, 2.3, 1);
          const piston = new THREE.Mesh(pGeo, pMat);
          g.add(housing, piston);
          bank.add(g);
          pistons.push({ housing, piston, phase: (i % 2 ? Math.PI : 0) + (side > 0 ? Math.PI / 2 : 0) });
        }
        root.add(bank);
      });
    }

    // ---- GSAP-owned state
    const state = { intro: 0, scroll: 0, px: 0, pz: 0, tx: 0, tz: 0, spin: 0 };
    const pointer = { x: 0, y: 0, active: false };
    const ray = new THREE.Raycaster();
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const hit = new THREE.Vector3();

    const fit = () => {
      const w = el.clientWidth || 1;
      const h = el.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      const vf = THREE.MathUtils.degToRad(camera.fov / 2);
      const tanV = Math.tan(vf);
      const tanH = tanV * camera.aspect;
      const R = (N * d + r) * 1.02;
      const dist = (R / Math.min(tanV, tanH)) * 0.86 + 2;
      const tilt = THREE.MathUtils.degToRad(variant === "vee" ? 46 : 52);
      camera.position.set(0, Math.sin(tilt) * dist, Math.cos(tilt) * dist);
      camera.lookAt(0, variant === "vee" ? 0.5 : 0, 0);
      camera.updateProjectionMatrix();
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);

    const m4 = new THREE.Matrix4();
    const pos = new THREE.Vector3();
    const quat = new THREE.Quaternion();
    const scl = new THREE.Vector3();
    const c0 = new THREE.Color(0xeef4f1);
    const c1 = new THREE.Color(0x18b777);
    const c2 = new THREE.Color(0x063c29);
    const tmp = new THREE.Color();
    const amp = variant === "vee" ? 0.22 : 0.55;

    const near1 = () => (pointer.active ? 0.6 : 0);
    const draw = (time: number) => {
      const t = time * 0.001;
      for (let i = 0; i < cells.length; i++) {
        const c = cells[i];
        // intro: rings rise outward->inward driven by gsap `state.intro` (0..1)
        const k = THREE.MathUtils.clamp(state.intro * 1.7 - (c.dist / maxDist) * 0.7, 0, 1);
        const e = 1 - Math.pow(1 - k, 3);
        const wave = Math.sin(c.dist * 1.1 - t * 1.3) * 0.5 + 0.5;
        const dx = c.x - state.px;
        const dz = c.z - state.pz;
        const near = Math.max(0, 1 - Math.hypot(dx, dz) / 2.6);
        const rise = near * near * 1.5;
        const edgeFall = 1 - Math.pow(c.dist / maxDist, 2.2) * 0.75;
        const h = (0.12 + (wave * amp + rise) * edgeFall + (1 - c.dist / maxDist) * 0.18) * e + 0.02;
        pos.set(c.x, 0, c.z);
        scl.set(1, Math.max(h, 0.001), 1);
        quat.identity();
        m4.compose(pos, quat, scl);
        lattice.setMatrixAt(i, m4);
        const heat = THREE.MathUtils.clamp(near * 1.1 + wave * 0.22, 0, 1);
        tmp.copy(c0).lerp(c1, heat);
        tmp.lerp(c2, Math.max(0, (c.dist / maxDist - 0.8) * 1.2) * 0.0); // keep edges light
        lattice.setColorAt(i, tmp);
      }
      lattice.instanceMatrix.needsUpdate = true;
      if (lattice.instanceColor) lattice.instanceColor.needsUpdate = true;

      pistons.forEach((p, i) => {
        const a = (Math.sin(t * 2.2 + p.phase) * 0.5 + 0.5) * state.intro;
        p.piston.scale.y = 0.9 + 2.6 * a + 0.3;
        p.piston.position.y = 0.3 + a * 0.2;
        p.housing.scale.y = 2.3 * Math.min(1, state.intro * 1.4);
        void i;
      });

      root.rotation.y = state.spin + t * (reduce ? 0 : 0.06) + state.scroll * 0.9;
      root.rotation.x = state.scroll * -0.12;
      glow.position.set(state.px, 2.4 + near1(), state.pz);
      renderer.render(scene, camera);
    };

    // ---- GSAP: intro + scroll-scrub + pointer easing
    const tweens: gsap.core.Tween[] = [];
    if (reduce) {
      state.intro = 1;
      draw(0);
    } else {
      tweens.push(gsap.to(state, { intro: 1, duration: 2.6, ease: "power3.out", delay: 0.15 }));
      tweens.push(gsap.fromTo(state, { spin: -0.9 }, { spin: 0, duration: 3, ease: "expo.out" }));
      tweens.push(
        gsap.to(state, {
          scroll: 1,
          ease: "none",
          scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: 0.8 },
        })
      );
    }

    const onMove = (e: PointerEvent) => {
      const b = el.getBoundingClientRect();
      pointer.x = ((e.clientX - b.left) / b.width) * 2 - 1;
      pointer.y = -(((e.clientY - b.top) / b.height) * 2 - 1);
      pointer.active = true;
      ray.setFromCamera(new THREE.Vector2(pointer.x, pointer.y), camera);
      // un-rotate hit into lattice-local space
      if (ray.ray.intersectPlane(plane, hit)) {
        const a = -root.rotation.y;
        state.tx = hit.x * Math.cos(a) - hit.z * Math.sin(a);
        state.tz = hit.x * Math.sin(a) + hit.z * Math.cos(a);
      }
    };
    const onLeave = () => { pointer.active = false; state.tx = 99; state.tz = 99; };
    state.tx = 99; state.tz = 99; state.px = 99; state.pz = 99;
    if (!reduce) {
      window.addEventListener("pointermove", onMove, { passive: true });
      el.addEventListener("pointerleave", onLeave);
    }

    // idle sweep so touch devices still see a moving highlight
    let idle = 0;
    const loop = (time: number) => {
      idle = time * 0.001;
      if (!pointer.active) {
        state.tx = Math.cos(idle * 0.6) * N * d * 0.55;
        state.tz = Math.sin(idle * 0.45) * N * d * 0.55;
      }
      state.px += (state.tx - state.px) * 0.08;
      state.pz += (state.tz - state.pz) * 0.08;
      draw(time);
    };

    let raf = 0;
    let visible = true;
    const tick = (time: number) => {
      if (visible && !document.hidden) loop(time);
      raf = requestAnimationFrame(tick);
    };
    if (!reduce) raf = requestAnimationFrame(tick);
    const io = new IntersectionObserver(([en]) => (visible = en.isIntersecting), { threshold: 0 });
    io.observe(el);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      tweens.forEach((tw) => { tw.scrollTrigger?.kill(); tw.kill(); });
      ScrollTrigger.refresh();
      geo.dispose(); mat.dispose(); lattice.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [variant]);

  return (
    <div className={`hex-scene relative ${className}`} aria-hidden="true">
      {/* CSS fallback / loading backdrop */}
      <svg className="absolute inset-0 h-full w-full opacity-60" viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice">
        <defs>
          <pattern id={`hp-${variant}`} width="34.64" height="60" patternUnits="userSpaceOnUse" patternTransform="scale(1.2)">
            <polygon points="17.32,0 34.64,10 34.64,30 17.32,40 0,30 0,10" fill="none" stroke="#08794d" strokeOpacity=".14" />
            <polygon points="34.64,30 51.96,40 51.96,60 34.64,70 17.32,60 17.32,40" fill="none" stroke="#08794d" strokeOpacity=".14" />
          </pattern>
        </defs>
        <rect width="400" height="400" fill={`url(#hp-${variant})`} />
      </svg>
      <div ref={host} className="absolute inset-0" />
    </div>
  );
}
