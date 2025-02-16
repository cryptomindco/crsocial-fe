<template>
  <!-- 交差オブザーバーで画面外への移動を検出したら一時停止する -->
  <video
    v-intersection-observer="{ outboundHandler: pause }"
    class="video-player"
    ref="video"
    controls
    loading="lazy"
    loop
    :poster="poster"
    :preload="preload ?? 'metadata'"
  />
</template>
<script>
import Hls from 'app/node_modules/hls.js/dist/hls.js'
export default {
  name: 'videoPlayer',
  data() {
    return {}
  },
  async mounted() {
    if (!this.$refs.video || this.$refs.video == null) {
      return
    }
    const hls = new Hls()
    let isPlaylistExisting = false
    // HLS をサポートする環境
    if (this.playlist != null && Hls.isSupported()) {
      isPlaylistExisting = await this.isUriExisting(this.playlist)
      if (isPlaylistExisting) {
        if (this.$refs.video != null) {
          hls.loadSource(this.playlist)
          hls.attachMedia(this.$refs.video)
        }
        this.$emit('updateVideoType', 'hls')
        return
      }
    }
    if (
      this.playlist != null &&
      isPlaylistExisting !== false &&
      this.$refs.video.canPlayType('application/vnd.apple.mpegurl')
    ) {
      if (isPlaylistExisting == null) {
        isPlaylistExisting = await this.isUriExisting(this.playlist)
      }
      if (isPlaylistExisting) {
        if (this.$refs.video != null) {
          this.$refs.video.src = this.playlist
          this.$refs.video.load()
        }
        this.$emit('updateVideoType', 'browser')
        return
      }
    }

    // playlist が存在しない
    if (this.did != null && this.cid != null) {
      const logJson = await this.fetchLogAudit(this.did)
      if (!(logJson instanceof Error) && logJson != null) {
        const host = Array.isArray(logJson)
          ? // did:plc:
            logJson[0]?.operation?.services?.atproto_pds?.endpoint
          : // did:plc: 以外
            logJson?.didDocument?.service?.[0]?.serviceEndpoint
        if (this.$refs.video != null) {
          this.$refs.video.src = `${host}/xrpc/com.atproto.sync.getBlob?did=${this.did}&cid=${this.cid}`
        }
        this.$emit('updateVideoType', 'blob')
        return
      }
    }
    this.$emit('updateVideoType', 'none')
  },
  props: {
    playlist: String,
    did: String,
    cid: String,
    poster: String,
    preload: String,
  },
  methods: {
    pause() {
      if (this.$refs.video == null) {
        return
      }
      this.$refs.video.pause()
    },
    async isUriExisting(url) {
      const response = await fetch(url, {
        method: 'GET',
        headers: { range: 'bytes=0-0' },
      })
        .then((value) => value)
        .catch((error) => error)
      if (response instanceof Error) {
        return false
      }
      return response.ok
    },
    async fetchLogAudit(did) {
      const url = did.startsWith('did:plc:')
        ? `https://plc.directory/${did}/log/audit`
        : `https://dev.uniresolver.io/1.0/identifiers/${did}`
      const log = await Util.fetchWithTimeout(url)
        .then((value) => value)
        .catch((error) => error)
      if (log instanceof Error) {
        return log
      }
      if (log == null) {
        return
      }
      if (!log.ok) {
        return Error('apiError')
      }
      let logJson = await log.json()
      console.log('[klearsky/log/audit]', logJson)
      if (Array.isArray(logJson)) {
        logJson.reverse()
      }
      return logJson
    },
  },
  watch: {},
}
</script>
