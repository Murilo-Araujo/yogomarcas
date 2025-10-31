import { Controller } from "@hotwired/stimulus"
import { Renderer, Program, Mesh, Color, Triangle } from "ogl"

export default class extends Controller {
  static values = {
    color: Array,
    speed: Number,
    amplitude: Number,
    mouseReact: Boolean
  }

  connect() {
    console.log("Iridescence controller connected")
    this.mousePos = { x: 0.5, y: 0.5 }
    this.initializeWebGL()
  }

  disconnect() {
    this.cleanup()
  }

  initializeWebGL() {
    if (!this.element) return

    this.renderer = new Renderer()
    this.gl = this.renderer.gl
    this.gl.clearColor(1, 1, 1, 1)

    this.resize = this.resize.bind(this)
    this.handleMouseMove = this.handleMouseMove.bind(this)

    window.addEventListener('resize', this.resize)
    this.resize()

    const vertexShader = `
      attribute vec2 uv;
      attribute vec2 position;

      varying vec2 vUv;

      void main() {
        vUv = uv;
        gl_Position = vec4(position, 0, 1);
      }
    `

    const fragmentShader = `
      precision highp float;

      uniform float uTime;
      uniform vec3 uColor;
      uniform vec3 uResolution;
      uniform vec2 uMouse;
      uniform float uAmplitude;
      uniform float uSpeed;

      varying vec2 vUv;

      void main() {
        float mr = min(uResolution.x, uResolution.y);
        vec2 uv = (vUv.xy * 2.0 - 1.0) * uResolution.xy / mr;

        uv += (uMouse - vec2(0.5)) * uAmplitude;

        float d = -uTime * 0.5 * uSpeed;
        float a = 0.0;
        for (float i = 0.0; i < 8.0; ++i) {
          a += cos(i - d - a * uv.x);
          d += sin(uv.y * i + a);
        }
        d += uTime * 0.5 * uSpeed;
        vec3 col = vec3(cos(uv * vec2(d, a)) * 0.6 + 0.4, cos(a + d) * 0.5 + 0.5);
        col = cos(col * cos(vec3(d, a, 2.5)) * 0.5 + 0.5) * uColor;
        gl_FragColor = vec4(col, 1.0);
      }
    `

    const geometry = new Triangle(this.gl)
    this.program = new Program(this.gl, {
      vertex: vertexShader,
      fragment: fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new Color(...(this.colorValue || [1, 1, 1])) },
        uResolution: {
          value: new Color(this.gl.canvas.width, this.gl.canvas.height, this.gl.canvas.width / this.gl.canvas.height)
        },
        uMouse: { value: new Float32Array([this.mousePos.x, this.mousePos.y]) },
        uAmplitude: { value: this.amplitudeValue || 0.1 },
        uSpeed: { value: this.speedValue || 1.0 }
      }
    })

    this.mesh = new Mesh(this.gl, { geometry, program: this.program })
    this.element.appendChild(this.gl.canvas)

    if (this.mouseReactValue) {
      this.element.addEventListener('mousemove', this.handleMouseMove)
    }

    this.startAnimation()
  }

  resize() {
    if (!this.renderer || !this.element) return
    
    const scale = 1
    this.renderer.setSize(this.element.offsetWidth * scale, this.element.offsetHeight * scale)
    
    if (this.program) {
      this.program.uniforms.uResolution.value = new Color(
        this.gl.canvas.width,
        this.gl.canvas.height,
        this.gl.canvas.width / this.gl.canvas.height
      )
    }
  }

  handleMouseMove(e) {
    if (!this.element || !this.program) return
    
    const rect = this.element.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = 1.0 - (e.clientY - rect.top) / rect.height
    
    this.mousePos = { x, y }
    this.program.uniforms.uMouse.value[0] = x
    this.program.uniforms.uMouse.value[1] = y
  }

  startAnimation() {
    const animate = (t) => {
      if (!this.program || !this.renderer || !this.mesh) return
      
      this.animationId = requestAnimationFrame(animate)
      this.program.uniforms.uTime.value = t * 0.001
      this.renderer.render({ scene: this.mesh })
    }
    
    this.animationId = requestAnimationFrame(animate)
  }

  cleanup() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
    }

    window.removeEventListener('resize', this.resize)
    
    if (this.mouseReactValue && this.element) {
      this.element.removeEventListener('mousemove', this.handleMouseMove)
    }

    if (this.gl && this.gl.canvas && this.element && this.element.contains(this.gl.canvas)) {
      this.element.removeChild(this.gl.canvas)
    }

    if (this.gl) {
      const ext = this.gl.getExtension('WEBGL_lose_context')
      if (ext) ext.loseContext()
    }
  }
}