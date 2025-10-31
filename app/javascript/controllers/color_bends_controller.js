import { Controller } from "@hotwired/stimulus"
import * as THREE from "three"

const MAX_COLORS = 8

const fragmentShader = `
#define MAX_COLORS ${MAX_COLORS}
uniform vec2 uCanvas;
uniform float uTime;
uniform float uSpeed;
uniform vec2 uRot;
uniform int uColorCount;
uniform vec3 uColors[MAX_COLORS];
uniform int uTransparent;
uniform float uScale;
uniform float uFrequency;
uniform float uWarpStrength;
uniform vec2 uPointer;
uniform float uMouseInfluence;
uniform float uParallax;
uniform float uNoise;
varying vec2 vUv;

void main() {
  float t = uTime * uSpeed;
  vec2 p = vUv * 2.0 - 1.0;
  p += uPointer * uParallax * 0.1;
  vec2 rp = vec2(p.x * uRot.x - p.y * uRot.y, p.x * uRot.y + p.y * uRot.x);
  vec2 q = vec2(rp.x * (uCanvas.x / uCanvas.y), rp.y);
  q /= max(uScale, 0.0001);
  q /= 0.5 + 0.2 * dot(q, q);
  q += 0.2 * cos(t) - 7.56;
  vec2 toward = (uPointer - rp);
  q += toward * uMouseInfluence * 0.2;

    vec3 col = vec3(0.0);
    float a = 1.0;

    if (uColorCount > 0) {
      vec2 s = q;
      vec3 sumCol = vec3(0.0);
      float cover = 0.0;
      for (int i = 0; i < MAX_COLORS; ++i) {
            if (i >= uColorCount) break;
            s -= 0.01;
            vec2 r = sin(1.5 * (s.yx * uFrequency) + 2.0 * cos(s * uFrequency));
            float m0 = length(r + sin(5.0 * r.y * uFrequency - 3.0 * t + float(i)) / 4.0);
            float kBelow = clamp(uWarpStrength, 0.0, 1.0);
            float kMix = pow(kBelow, 0.3);
            float gain = 1.0 + max(uWarpStrength - 1.0, 0.0);
            vec2 disp = (r - s) * kBelow;
            vec2 warped = s + disp * gain;
            float m1 = length(warped + sin(5.0 * warped.y * uFrequency - 3.0 * t + float(i)) / 4.0);
            float m = mix(m0, m1, kMix);
            float w = 1.0 - exp(-6.0 / exp(6.0 * m));
            sumCol += uColors[i] * w;
            cover = max(cover, w);
      }
      col = clamp(sumCol, 0.0, 1.0);
      a = uTransparent > 0 ? cover : 1.0;
    } else {
        vec2 s = q;
        for (int k = 0; k < 3; ++k) {
            s -= 0.01;
            vec2 r = sin(1.5 * (s.yx * uFrequency) + 2.0 * cos(s * uFrequency));
            float m0 = length(r + sin(5.0 * r.y * uFrequency - 3.0 * t + float(k)) / 4.0);
            float kBelow = clamp(uWarpStrength, 0.0, 1.0);
            float kMix = pow(kBelow, 0.3);
            float gain = 1.0 + max(uWarpStrength - 1.0, 0.0);
            vec2 disp = (r - s) * kBelow;
            vec2 warped = s + disp * gain;
            float m1 = length(warped + sin(5.0 * warped.y * uFrequency - 3.0 * t + float(k)) / 4.0);
            float m = mix(m0, m1, kMix);
            col[k] = 1.0 - exp(-6.0 / exp(6.0 * m));
        }
        a = uTransparent > 0 ? max(max(col.r, col.g), col.b) : 1.0;
    }

    if (uNoise > 0.0001) {
      float n = fract(sin(dot(gl_FragCoord.xy + vec2(uTime), vec2(12.9898, 78.233))) * 43758.5453123);
      col += (n - 0.5) * uNoise;
      col = clamp(col, 0.0, 1.0);
    }

    vec3 rgb = (uTransparent > 0) ? col * a : col;
    gl_FragColor = vec4(rgb, a);
}
`

const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}
`

export default class extends Controller {
  static values = {
    colors: Array,
    rotation: Number,
    speed: Number,
    transparent: Boolean,
    autoRotate: Number,
    scale: Number,
    frequency: Number,
    warpStrength: Number,
    mouseInfluence: Number,
    parallax: Number,
    noise: Number
  }

  connect() {
    this.initializeThreeJS()
  }

  disconnect() {
    this.cleanup()
  }

  initializeThreeJS() {
    if (!this.element) return

    this.scene = new THREE.Scene()
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)

    const geometry = new THREE.PlaneGeometry(2, 2)
    const uColorsArray = Array.from({ length: MAX_COLORS }, () => new THREE.Vector3(0, 0, 0))

    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uCanvas: { value: new THREE.Vector2(1, 1) },
        uTime: { value: 0 },
        uSpeed: { value: this.speedValue || 0.2 },
        uRot: { value: new THREE.Vector2(1, 0) },
        uColorCount: { value: 0 },
        uColors: { value: uColorsArray },
        uTransparent: { value: this.transparentValue ? 1 : 0 },
        uScale: { value: this.scaleValue || 1 },
        uFrequency: { value: this.frequencyValue || 1 },
        uWarpStrength: { value: this.warpStrengthValue || 1 },
        uPointer: { value: new THREE.Vector2(0, 0) },
        uMouseInfluence: { value: this.mouseInfluenceValue || 1 },
        uParallax: { value: this.parallaxValue || 0.5 },
        uNoise: { value: this.noiseValue || 0.1 }
      },
      premultipliedAlpha: true,
      transparent: true
    })

    const mesh = new THREE.Mesh(geometry, this.material)
    this.scene.add(mesh)

    this.renderer = new THREE.WebGLRenderer({
      antialias: false,
      powerPreference: 'high-performance',
      alpha: true
    })

    this.renderer.outputColorSpace = THREE.SRGBColorSpace
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    this.renderer.setClearColor(0x000000, this.transparentValue ? 0 : 1)
    this.renderer.domElement.style.width = '100%'
    this.renderer.domElement.style.height = '100%'
    this.renderer.domElement.style.display = 'block'
    this.element.appendChild(this.renderer.domElement)

    this.clock = new THREE.Clock()
    this.rotationRef = this.rotationValue || 45
    this.autoRotateRef = this.autoRotateValue || 0
    this.pointerTarget = new THREE.Vector2(0, 0)
    this.pointerCurrent = new THREE.Vector2(0, 0)
    this.pointerSmooth = 8

    this.handleResize = this.handleResize.bind(this)
    this.handlePointerMove = this.handlePointerMove.bind(this)

    this.handleResize()
    this.updateColors()

    if ('ResizeObserver' in window) {
      this.resizeObserver = new ResizeObserver(this.handleResize)
      this.resizeObserver.observe(this.element)
    } else {
      window.addEventListener('resize', this.handleResize)
    }

    this.element.addEventListener('pointermove', this.handlePointerMove)
    this.startAnimation()
  }

  handleResize() {
    if (!this.renderer || !this.element) return
    
    const w = this.element.clientWidth || 1
    const h = this.element.clientHeight || 1
    this.renderer.setSize(w, h, false)
    this.material.uniforms.uCanvas.value.set(w, h)
  }

  handlePointerMove(e) {
    if (!this.element) return
    
    const rect = this.element.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / (rect.width || 1)) * 2 - 1
    const y = -(((e.clientY - rect.top) / (rect.height || 1)) * 2 - 1)
    this.pointerTarget.set(x, y)
  }

  updateColors() {
    if (!this.material) return

    const toVec3 = hex => {
      const h = hex.replace('#', '').trim()
      const v = h.length === 3
        ? [parseInt(h[0] + h[0], 16), parseInt(h[1] + h[1], 16), parseInt(h[2] + h[2], 16)]
        : [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]
      return new THREE.Vector3(v[0] / 255, v[1] / 255, v[2] / 255)
    }

    const colors = this.colorsValue || []
    const arr = colors.filter(Boolean).slice(0, MAX_COLORS).map(toVec3)
    
    for (let i = 0; i < MAX_COLORS; i++) {
      const vec = this.material.uniforms.uColors.value[i]
      if (i < arr.length) {
        vec.copy(arr[i])
      } else {
        vec.set(0, 0, 0)
      }
    }
    
    this.material.uniforms.uColorCount.value = arr.length
  }

  startAnimation() {
    const animate = () => {
      if (!this.material || !this.renderer || !this.scene) return
      
      this.animationId = requestAnimationFrame(animate)
      
      const dt = this.clock.getDelta()
      const elapsed = this.clock.elapsedTime
      this.material.uniforms.uTime.value = elapsed

      const deg = (this.rotationRef % 360) + this.autoRotateRef * elapsed
      const rad = (deg * Math.PI) / 180
      const c = Math.cos(rad)
      const s = Math.sin(rad)
      this.material.uniforms.uRot.value.set(c, s)

      const amt = Math.min(1, dt * this.pointerSmooth)
      this.pointerCurrent.lerp(this.pointerTarget, amt)
      this.material.uniforms.uPointer.value.copy(this.pointerCurrent)
      
      this.renderer.render(this.scene, this.camera)
    }
    
    this.animationId = requestAnimationFrame(animate)
  }

  cleanup() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
    }

    if (this.resizeObserver) {
      this.resizeObserver.disconnect()
    } else {
      window.removeEventListener('resize', this.handleResize)
    }

    if (this.element) {
      this.element.removeEventListener('pointermove', this.handlePointerMove)
    }

    if (this.renderer && this.renderer.domElement && this.element && this.element.contains(this.renderer.domElement)) {
      this.element.removeChild(this.renderer.domElement)
    }

    if (this.material) this.material.dispose()
    if (this.renderer) this.renderer.dispose()
  }
}