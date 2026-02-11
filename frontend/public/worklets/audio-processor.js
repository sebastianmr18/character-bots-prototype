class AudioProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.targetSampleRate = 16000;
    this.sourceSampleRate = sampleRate;
    this.ratio = this.sourceSampleRate / this.targetSampleRate;
    this._offset = 0;
  }

  process(inputs) {
    const input = inputs[0];
    if (!input || !input[0]) return true;

    const channelData = input[0];
    const outLength = Math.floor(channelData.length / this.ratio);
    const pcm16 = new Int16Array(outLength);

    let idx = 0;
    for (let i = 0; i < outLength; i++) {
      const pos = i * this.ratio;
      const i0 = Math.floor(pos);
      const i1 = Math.min(i0 + 1, channelData.length - 1);
      const frac = pos - i0;

      const sample =
        channelData[i0] * (1 - frac) +
        channelData[i1] * frac;

      const s = Math.max(-1, Math.min(1, sample));
      pcm16[idx++] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }

    this.port.postMessage(pcm16.buffer, [pcm16.buffer]);
    return true;
  }
}

registerProcessor('audio-processor', AudioProcessor);
