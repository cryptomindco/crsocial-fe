<template>
  <div ref="externalComponent" class="external">
    <div v-if="isInvalidUrl" class="external--invalid textlabel">
      <div class="textlabel__text--alert"><q-icon name="alert" />Invalid url</div>
    </div>
    <Component
      v-else-if="type === ''"
      :is="noLink ? 'div' : 'a'"
      class="external--default"
      :data-layout="layout"
      :href="externalData.uri"
      rel="noreferrer"
      target="_blank"
      @click.stop
    >
      <LazyImage
        v-if="displayImage && layout !== 'none' && typeof externalData.thumb === 'string'"
        :src="externalData.thumb"
      />
      <div class="external__meta">
        <div class="external__meta__title">
          <span>{{ externalData.title || '&emsp;' }}</span>
        </div>
        <div class="external__meta__uri">
          <q-icon name="link" />
          <span>{{ externalData.uri }}</span>
        </div>
        <div class="external__meta__description">
          <span>{{ externalData.description || '&emsp;' }}</span>
        </div>
      </div>

      <button v-if="!noLink" class="external__search-button" @click.prevent="searchUrl">
        <q-icon name="search" />
      </button>
    </Component>

    <div v-else>
      <iframe
        v-if="type === 'applemusic'"
        class="external--applemusic"
        :src="`https://embed.music.apple.com/${embeddedContentId}`"
        allow="autoplay *; encrypted-media *; fullscreen *; clipboard-write"
        allowfullScreen
        frameBorder="0"
        loading="lazy"
        sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation"
        scrolling="no"
        width="100%"
        height="450"
      />

      <iframe
        v-if="type === 'giphy'"
        class="external--giphy"
        :src="`https://giphy.com/embed/${embeddedContentId}`"
        allowfullScreen
        frameBorder="0"
        loading="lazy"
        scrolling="no"
        width="100%"
        height="300"
      />

      <video
        v-if="type === 'graysky'"
        class="external--graysky"
        autoplay
        controls
        loading="lazy"
        loop
        muted
        :poster="externalData.thumb"
        preload="metadata"
        height="300"
      >
        <source :src="`https://media.tenor.com/${embeddedContentId}.mp4`" type="video/mp4" />
      </video>

      <div v-else-if="type === 'nicovideo'" class="external--nicovideo" />

      <iframe
        v-else-if="type === 'spotify'"
        class="external--spotify"
        :src="`https://open.spotify.com/embed/${spotifyType}/${embeddedContentId}?utm_source=generator`"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        allowfullscreen
        frameborder="0"
        loading="lazy"
        scrolling="no"
        width="100%"
        :height="spotifyType === 'album' ? 352 : 152"
      />

      <div v-else-if="type === 'tenor'" class="external--tenor">
        <img :src="embeddedContentId" alt="" decoding="async" loading="lazy" />
      </div>

      <iframe
        v-else-if="type === 'twitch'"
        class="external--twitch"
        :src="`https://player.twitch.tv/?channel=${embeddedContentId}&parent=${hostname}&autoplay=false`"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        allowfullscreen
        frameborder="0"
        loading="lazy"
        scrolling="no"
        width="100%"
      />

      <iframe
        v-else-if="type === 'youtube'"
        class="external--youtube"
        :src="`https://www.youtube-nocookie.com/embed/${embeddedContentId}`"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowfullscreen
        frameborder="0"
        loading="lazy"
        scrolling="no"
        width="100%"
      />

      <iframe
        v-else-if="type === 'vimeo'"
        class="external--vimeo"
        :src="`https://player.vimeo.com/video/${embeddedContentId}`"
        allow="autoplay; fullscreen; picture-in-picture"
        allowfullscreen
        frameborder="0"
        loading="lazy"
        scrolling="no"
        width="100%"
      />
      <a class="external__meta--special" :href="externalData.uri" rel="noreferrer" target="_blank" @click.stop>
        <div class="external__meta__title">
          <span>{{ externalData.title || '' }}</span>
        </div>
        <div class="external__meta__uri">
          <q-icon name="link" />
          <span>{{ externalData.uri }}</span>
        </div>
        <div class="external__meta__description">
          <span>{{ externalData.description || '' }}</span>
        </div>
      </a>
    </div>

    <slot name="after" />
  </div>
</template>
<script>
import LazyImage from '../images/LazyImage.vue'
import { safeURL } from 'src/helper/helper'
export default {
  name: 'linkCard',
  data() {
    return {
      isInvalidUrl: false,
      type: '',
      embeddedContentId: '',
      spotifyType: '',
      hostname: '',
      externalData: {},
    }
  },
  created() {
    this.getEmbeddedContentId()
  },
  props: {
    external: Object,
    noLink: Boolean,
    layout: String,
    displayImage: Boolean,
    noEmbedded: Boolean,
  },
  components: {
    LazyImage,
  },
  methods: {
    getEmbeddedContentId() {
      const url = this.externalData ? safeURL(this.externalData.uri) : null
      if (url == null) {
        this.isInvalidUrl = true
        return
      }

      if (url.hostname.endsWith('music.apple.com')) {
        const matches = url.pathname.match(/^\/([^?].+)/)
        if (matches != null && matches[1] != null) {
          this.type = 'applemusic'
          this.embeddedContentId = matches[1]
          return
        }
      } else if (url.hostname.endsWith('giphy.com')) {
        const matches = url.pathname.match(/([0-9a-zA-Z]{10,})(?:$|\/)/)
        if (matches != null && matches[1] != null) {
          this.type = 'giphy'
          this.embeddedContentId = matches[1]
          return
        }
      } else if (url.hostname.endsWith('graysky.app')) {
        const matches = url.pathname.match(/\/gif\/(.+?)\.mp4/)
        if (matches != null && matches[1] != null) {
          this.type = 'graysky'
          this.embeddedContentId = matches[1]
          return
        }
      } else if (url.hostname === 'www.nicovideo.jp') {
        const matches = url.pathname.match(/\/watch\/([^\/]+)/)
        if (matches != null && matches[1] != null) {
          this.type = 'nicovideo'
          this.embeddedContentId = matches[1]
          return
        }
      } else if (url.hostname === 'open.spotify.com') {
        const matches = url.pathname.match(/\/(album|artist|track)\/([^\/]+)/)
        if (matches != null && matches[1] != null && matches[2] != null) {
          this.type = 'spotify'
          this.embeddedContentId = matches[2]
          this.spotifyType = matches[1]
          return
        }
      } else if (url.hostname.endsWith('.tenor.com')) {
        this.type = 'tenor'
        this.embeddedContentId = url.href
        return
      } else if (url.hostname === 'www.twitch.tv') {
        const matches = url.pathname.match(/^\/([^\/]+)/)
        if (matches != null && matches[1] != null) {
          this.type = 'twitch'
          this.embeddedContentId = matches[1]
          return
        }
      } else if (
        (url.hostname === 'www.youtube.com' || url.hostname === 'music.youtube.com') &&
        url.pathname === '/watch'
      ) {
        this.type = 'youtube'
        this.embeddedContentId = url.searchParams.get('v')
        return
      } else if (url.hostname === 'youtu.be' && url.pathname) {
        this.type = 'youtube'
        this.embeddedContentId = url.pathname.substring(1)
        return
      } else if (url.hostname === 'vimeo.com') {
        const matches = url.pathname.match(/^\/([^?]+)/)
        if (matches != null && matches[1] != null) {
          this.type = 'vimeo'
          this.embeddedContentId = matches[1]
          return
        }
      }
    },
    updateEmbeddedContents(newType) {
      if (newType === 'nicovideo') {
        const parent = this.$refs.externalComponent.value.querySelector('.external--nicovideo')
        if (parent.children.length === 0) {
          const script = document.createElement('script')
          script.setAttribute('src', `https://embed.nicovideo.jp/watch/${this.embeddedContentId}/script`)
          parent.appendChild(script)
        }
      }
    },
    searchUrl() {
      this.$router.push({
        name: 'post-search',
        query: { text: this.externalData.uri },
      })
    },
  },
  watch: {
    external: {
      immediate: true,
      handler(newVal) {
        this.externalData = newVal
        this.getEmbeddedContentId()
      },
    },
    type: {
      immediate: true,
      handler(newVal) {
        this.updateEmbeddedContents(newVal)
      },
    },
  },
}
</script>
