import * as THREE from 'https://jspm.dev/three'

export class AudioEngine {

  constructor(camera) {

    this.listener = new THREE.AudioListener()
    camera.add(this.listener)

    this.audio = new THREE.Audio(this.listener)
    this.analyser = null

    this.data = {
      average: 0,
      bass: 0
    }
  }

  async load(url) {

    const loader = new THREE.AudioLoader()

    return new Promise((resolve) => {

      loader.load(url, (buffer) => {

        this.audio.setBuffer(buffer)
        this.audio.setLoop(true)
        this.audio.setVolume(0.7)

        this.analyser = new THREE.AudioAnalyser(this.audio, 128)

        resolve()
      })
    })
  }

  play() {
    if (!this.audio.isPlaying) {
      this.audio.play()
    }
  }

  update() {

    if (!this.analyser) return

    const data = this.analyser.getFrequencyData()

    let sum = 0
    for (let i = 0; i < data.length; i++) {
      sum += data[i]
    }

    const average = sum / data.length
    const bass = data.slice(0, 10).reduce((a, b) => a + b, 0) / 10

    this.data.average = average / 256
    this.data.bass = bass / 256
  }
}
