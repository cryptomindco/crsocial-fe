<template>
  <div class="image-popup" :data-mode="mode">
    <div
      class="image"
      :style="`
        background-image: url(${images[index] != null ? images[index].smallUri : '#'});
        background-position: ${x * 100}% ${y * 100}%;
      `"
      @mousedown="startDrag"
      @touchstart.passive="startDrag"
      @mousemove="moveDrag"
      @touchmove.passive="moveDrag"
      @mouseup="endDrag"
      @touchend.passive="endDrag"
    >
      <div
        class="image"
        :style="`
          background-image: url(${images[index] != null ? images[index].largeUri : '#'});
          background-position: ${x * 100}% ${y * 100}%;
        `"
      />
    </div>
    <button class="floating-button previous-image-button" :disabled="index === 0" @click.prevent="showImage(-1)">
      <q-icon name="arrow_back_ios" size="md" class="popup-btn" />
    </button>
    <button
      class="floating-button next-image-button"
      :disabled="index + 1 === images.length"
      @click.prevent="showImage(1)"
    >
      <q-icon name="arrow_forward_ios" size="md" class="popup-btn" />
    </button>
    <button class="floating-button close-button" @click.prevent="close">
      <q-icon name="close" size="md" class="popup-btn" />
    </button>
  </div>
</template>
<script>
import hotkeys from 'app/node_modules/hotkeys-js/index'
function hideScroll() {
  window.document.body.style.overflowX = 'hidden'
  window.document.body.style.overflowY = 'hidden'
}
function showScroll() {
  window.document.body.style.overflowX = ''
  window.document.body.style.overflowY = ''
}
export default {
  name: 'imagePopup',
  data() {
    return {
      mode: false,
      isBlob: false,
      blobs: [],
      x: 0.5,
      y: 0.5,
      imagePopupProps: {},
      images: [],
      alts: [],
      index: 0,
    }
  },
  props: {
    popupData: Object,
  },
  beforeMount() {
    hotkeys('esc', this.close)
    hotkeys('left', () => {
      this.showImage(-1)
    })
    hotkeys('right', () => {
      this.showImage(1)
    })
  },
  beforeUnmount() {
    hotkeys.unbind('esc')
    hotkeys.unbind('left')
    hotkeys.unbind('right')
  },
  methods: {
    startDrag(event) {
      const e = event.touches != null ? event.touches[0] : event
      if (e.button != null && e.button !== 0) return
      this.mode = true
      this.x = e.clientX / window.innerWidth
      this.y = e.clientY / window.innerHeight
      hideScroll()
    },
    moveDrag(event) {
      if (!this.mode || (event.buttons != null && event.buttons !== 1)) return
      const e = event.touches != null ? event.touches[0] : event
      this.x = e.clientX / window.innerWidth
      this.y = e.clientY / window.innerHeight
    },
    endDrag() {
      this.x = 0.5
      this.y = 0.5
      this.mode = false
      showScroll()
    },
    showImage(indexAdding) {
      if (this.images[this.index + indexAdding] == null) return
      this.imagePopupProps.index = this.index + indexAdding
      this.index = this.imagePopupProps.index
    },
    close() {
      showScroll()
      this.$emit('close')
    },
  },
  watch: {
    popupData: {
      immediate: true,
      handler(newVal) {
        if (!newVal || !newVal.images) {
          return
        }
        this.imagePopupProps = newVal
        this.images = newVal.images
        this.alts = newVal.alts
        this.index = newVal.index
      },
    },
  },
}
</script>
