<template>
  <div class="thumbnail">
    <LazyImage :src="imageSrc()" />
    <button v-if="imageData.alt" class="button--invert alt-button">
      <span>ALT</span>
    </button>
  </div>
</template>
<script>
import LazyImage from './LazyImage.vue'
export default {
  name: 'thumbNail',
  data() {
    return {
      hasLoadButton: false,
      imageData: {},
    }
  },
  props: {
    image: String,
  },
  components: {
    LazyImage,
  },
  methods: {
    imageSrc() {
      if (this.imageData) {
        return this.imageData
      }
      return '#'
    },
  },
  watch: {
    image: {
      immediate: true,
      handler(newVal) {
        this.imageData = newVal
      },
    },
  },
}
</script>
<style lang="scss" scoped>
.thumbnail {
  background-color: rgb(var(--fg-color), 0.125);
  border: 1px solid rgb(var(--fg-color), 0.125);
  border-radius: var(--border-radius-middle);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;

  & > .lazy-image {
    display: block;
    object-fit: cover;
    min-height: calc(2em + 4px); // NOTICE: ALTボタンを考慮

    // TODO: 暫定対応
    max-height: 400vh;
  }
}

.alt-button {
  border-radius: var(--border-radius-middle);
  font-size: 0.75em;
  position: absolute;
  bottom: 2px;
  left: 2px;
}

.error {
  background-color: rgb(var(--bg-color), 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;

  & > .svg-icon {
    fill: rgb(var(--notice-color));
    font-size: 2em;
  }
}

.loader {
  font-size: 0.75em;
  z-index: unset;
}
</style>
