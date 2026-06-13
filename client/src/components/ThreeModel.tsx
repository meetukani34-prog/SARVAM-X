import React, { useEffect, useRef } from "react"
import * as THREE from "three"

interface ThreeModelProps {
  mode: "rings" | "dodecahedron" | "octahedron" | "icosahedron"
  className?: string
  color?: number
}

const ThreeModel: React.FC<ThreeModelProps> = ({ mode, className = "", color }) => {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    const width = container.clientWidth || 300
    const height = container.clientHeight || 300

    // Scene setup
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100)
    camera.position.z = 5

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    container.appendChild(renderer.domElement)

    // Lights
    const ambientLight = new THREE.AmbientLight(0x111111)
    scene.add(ambientLight)

    const pointLight = new THREE.PointLight(0xffffff, 1.5, 100)
    pointLight.position.set(5, 5, 5)
    scene.add(pointLight)

    const pointLight2 = new THREE.PointLight(color || 0x00e5ff, 1, 50)
    pointLight2.position.set(-5, -5, 3)
    scene.add(pointLight2)

    // Objects base
    let mainMesh: THREE.Mesh | THREE.Group | null = null
    let particles: THREE.Points | null = null

    // Particle field
    const pCount = mode === "rings" ? 500 : 150
    const pGeom = new THREE.BufferGeometry()
    const pPositions = new Float32Array(pCount * 3)

    for (let i = 0; i < pCount * 3; i++) {
      pPositions[i] = (Math.random() - 0.5) * (mode === "rings" ? 12 : 6)
    }
    pGeom.setAttribute("position", new THREE.BufferAttribute(pPositions, 3))
    const pMat = new THREE.PointsMaterial({
      color: color || 0x00e5ff,
      size: 0.025,
      transparent: true,
      opacity: 0.45,
    })
    particles = new THREE.Points(pGeom, pMat)
    scene.add(particles)

    // Mode-specific meshes
    if (mode === "rings") {
      // Holographic concentric rings
      const group = new THREE.Group()
      const ringColor = color || 0x10b981 // Primary emerald for rings

      const r1Geom = new THREE.RingGeometry(1.2, 1.25, 64)
      const r1Mat = new THREE.MeshBasicMaterial({ color: ringColor, side: THREE.DoubleSide, transparent: true, opacity: 0.8 })
      const ring1 = new THREE.Mesh(r1Geom, r1Mat)
      ring1.rotation.x = Math.PI / 2
      group.add(ring1)

      const r2Geom = new THREE.RingGeometry(1.6, 1.63, 64)
      const r2Mat = new THREE.MeshBasicMaterial({ color: 0x00e5ff, side: THREE.DoubleSide, transparent: true, opacity: 0.5 })
      const ring2 = new THREE.Mesh(r2Geom, r2Mat)
      ring2.rotation.y = Math.PI / 3
      group.add(ring2)

      const r3Geom = new THREE.TorusGeometry(2.0, 0.02, 16, 100)
      const r3Mat = new THREE.MeshPhongMaterial({ color: ringColor, wireframe: true })
      const ring3 = new THREE.Mesh(r3Geom, r3Mat)
      group.add(ring3)

      mainMesh = group
      scene.add(mainMesh)
    } else if (mode === "dodecahedron") {
      // SARVAM twin
      const dGeom = new THREE.DodecahedronGeometry(1.4, 0)
      const dMat = new THREE.MeshPhongMaterial({
        color: color || 0x00e5ff,
        wireframe: true,
        emissive: color || 0x00e5ff,
        emissiveIntensity: 0.4,
      })
      mainMesh = new THREE.Mesh(dGeom, dMat)
      scene.add(mainMesh)
    } else if (mode === "octahedron") {
      // TRINETRA logo
      const oGeom = new THREE.OctahedronGeometry(1.3, 0)
      const oMat = new THREE.MeshPhongMaterial({
        color: color || 0xa855f7, // purple
        wireframe: true,
        emissive: color || 0xa855f7,
        emissiveIntensity: 0.6,
      })
      mainMesh = new THREE.Mesh(oGeom, oMat)
      scene.add(mainMesh)
    } else if (mode === "icosahedron") {
      // Assistant mini orb
      const iGeom = new THREE.IcosahedronGeometry(1.1, 1)
      const iMat = new THREE.MeshBasicMaterial({
        color: color || 0x00f2ff,
        wireframe: true,
      })
      mainMesh = new THREE.Mesh(iGeom, iMat)
      scene.add(mainMesh)
    }

    // Animation Loop
    let animationFrameId: number
    const timer = new THREE.Timer()

    const animate = (timestamp: number) => {
      animationFrameId = requestAnimationFrame(animate)

      timer.update(timestamp)
      const elapsed = timer.getElapsed()

      if (particles) {
        particles.rotation.y = elapsed * 0.05
        particles.rotation.x = Math.sin(elapsed * 0.1) * 0.1
      }

      if (mainMesh) {
        if (mode === "rings") {
          mainMesh.rotation.y = elapsed * 0.15
          mainMesh.rotation.x = elapsed * 0.1
          // Pulse scale
          const pulse = 1.0 + Math.sin(elapsed * 1.5) * 0.04
          mainMesh.scale.set(pulse, pulse, pulse)
        } else if (mode === "dodecahedron") {
          mainMesh.rotation.y = elapsed * 0.3
          mainMesh.rotation.x = Math.sin(elapsed * 0.5) * 0.2
          const pulse = 1.0 + Math.sin(elapsed * 2) * 0.05
          mainMesh.scale.set(pulse, pulse, pulse)
        } else if (mode === "octahedron") {
          mainMesh.rotation.y = elapsed * 0.25
          mainMesh.rotation.x = elapsed * 0.15
          const pulse = 1.0 + Math.sin(elapsed * 1.8) * 0.03
          mainMesh.scale.set(pulse, pulse, pulse)
        } else if (mode === "icosahedron") {
          mainMesh.rotation.y = elapsed * 0.4
          mainMesh.rotation.x = elapsed * 0.2
        }
      }

      renderer.render(scene, camera)
    }

    requestAnimationFrame(animate)

    // Resize Handler
    const handleResize = () => {
      if (!containerRef.current) return
      const w = container.clientWidth
      const h = container.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener("resize", handleResize)

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize)
      cancelAnimationFrame(animationFrameId)
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }

      // Dispose resources
      pGeom.dispose()
      pMat.dispose()

      if (mainMesh) {
        if (mainMesh instanceof THREE.Group) {
          mainMesh.children.forEach((child) => {
            if (child instanceof THREE.Mesh) {
              child.geometry.dispose()
              if (child.material instanceof Array) {
                child.material.forEach((m) => m.dispose())
              } else {
                child.material.dispose()
              }
            }
          })
        } else if (mainMesh instanceof THREE.Mesh) {
          mainMesh.geometry.dispose()
          if (mainMesh.material instanceof Array) {
            mainMesh.material.forEach((m) => m.dispose())
          } else {
            mainMesh.material.dispose()
          }
        }
      }
      renderer.dispose()
    }
  }, [mode, color])

  return <div ref={containerRef} className={`w-full h-full relative overflow-hidden ${className}`} />
}

export default ThreeModel
