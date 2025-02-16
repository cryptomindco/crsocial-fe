<template>
  <button class="load-button" @click.prevent="onActivate">
    <template v-if="!processing">
      <q-icon v-if="direction === 'new'" name="arrow_upward" />
      <q-icon v-else name="arrow_downward" />
    </template>
    <LoaderDiv v-else />
  </button>
</template>
<script>
import LoaderDiv from '../shells/LoaderDiv.vue'

export default {
  name: 'loadButton',
  data() {
    return {
      direction: '',
      processing: false,
    }
  },
  components: {
    LoaderDiv,
  },
  methods: {
    onActivate() {
      if (this.processing) return
    },
  },
}
</script>
<style lang="scss" scoped>
.load-button {
  --fill-color: rgb(var(--fg-color), 0.5);
  background-clip: content-box;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  min-height: 3rem;

  &[data-direction='middle'] {
    background-color: rgb(var(--fg-color), 0.125);
  }

  & > .svg-icon {
    font-size: 1.5rem;
    fill: var(--fill-color);
  }

  &:focus,
  &:hover {
    --fill-color: rgb(var(--fg-color));
  }

  & > .loader {
    background-color: unset;
    font-size: 0.75rem;
    z-index: 1;
  }
}
</style>
