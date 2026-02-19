import * as THREE from 'https://jspm.dev/three'

export function initSilhouette(scene) {

  const geo = new THREE.ConeGeometry(5, 10, 4)

  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 }
    },
    vertexShader: `
      uniform float uTime;
      varying vec3 vNormal;

      void main() {
        vNormal = normal;
        vec3 pos = position;

        float pulse = sin(uTime * 3.0) * 0.3;
        pos += normal * pulse;

        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      varying vec3 vNormal;

      void main() {
        float fresnel = pow(1.0 - dot(normalize(vNormal), vec3(0,0,1)), 4.0);
        vec3 color = vec3(0.0, 0.0, 0.0);
        color += vec3(1.0, 0.0, 1.0) * fresnel * 2.0;
        gl_FragColor = vec4(color, 1.0);
      }
    `,
    transparent: true
  })

  const mesh = new THREE.Mesh(geo, mat)
  scene.add(mesh)

  function update(time) {
    mat.uniforms.uTime.value = time
    mesh.rotation.y += 0.01
  }

  return { update }
}
