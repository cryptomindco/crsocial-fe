<template>
  <div class="html-text">
    <template v-for="(segment, idx) of segmentArray" :key="idx">
      <template v-if="segment.type === 'externalLink'">
        <a class="textlink external-link" @click.prevent.stop="openWindowIfCan(segment)">
          <span>{{ segment.text }}</span>
        </a>
      </template>
      <template v-else-if="segment.type === 'internalLink'">
        <a class="textlink internal-link" :href="segment.param" @click.prevent.stop="openInternalLink(segment.param)">
          <span>{{ segment.text }}</span>
        </a>
      </template>
      <template v-else-if="segment.type === 'mention'">
        <router-link class="textlink mention" :to="`/profile/feeds?account=${segment.param}`">
          <span>{{ segment.text }}</span>
        </router-link>
      </template>
      <template v-else-if="segment.type === 'tag'">
        <router-link class="textlink hash-tag" :to="`/search/post?text=%23${segment.param}`">
          <span>{{ segment.text }}</span>
        </router-link>
      </template>
      <template v-else>{{ segment.text }}</template>
    </template>
    <template v-if="hasTranslateLink"
      >&nbsp;<a v-if="hasTranslateLink" class="textlink translate-link" @click.prevent.stop="$emit('translate')"> </a>
    </template>
  </div>
</template>
<script>
export default {
  name: 'htmlText',
  data() {
    return {
      hasLoadButton: false,
      segmentArray: [],
    }
  },
  props: {
    richText: Object,
    text: String,
    segments: Array,
    hasTranslateLink: Boolean,
  },
  methods: {
    safeURL(uri) {
      try {
        return new URL(uri)
      } catch (err) {
        return undefined
      }
    },
    validateUrl(urlObject, text) {
      const pathname = urlObject.pathname.replace(/\/$/, '')
      return (
        urlObject.origin !== 'null' &&
        urlObject.host !== '' &&
        (text.startsWith(urlObject.origin + pathname) || text.startsWith(urlObject.host + pathname))
      )
    },
    openWindowIfCan(segment) {
      const urlObject = this.safeURL(segment.param)
      if (urlObject == null) return
      const valid = this.validateUrl(urlObject, segment.text)
      if (!valid) {
        return
      }
      window.open(segment.param, '_blank')
    },
    openInternalLink(uri) {
      const handle = uri.match(/\{\{(.+?)\}\}/)?.[1]
      if (handle != null) {
        this.$router.push(uri)
      }
    },
  },
  watch: {
    segments: {
      immediate: true,
      handler(newVal) {
        this.segmentArray = newVal
      },
    },
  },
}
</script>
<style lang="scss" scoped>
.external-link,
.internal-link {
  word-break: break-all;
}

.translate-link {
  font-size: min(0.875em, 0.875rem);
  padding: 0.125em 0.25em;
  & > span {
    --opacity: 0.5;
    color: rgb(var(--fg-color), var(--opacity));
  }
  &:focus,
  &:hover {
    & > span {
      --opacity: 1;
    }
  }
}
</style>
