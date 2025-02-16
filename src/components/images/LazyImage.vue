<template>
  <img v-if="src" class="lazy-image lazy-image--src" loading="lazy" decoding="async" :src="src" :alt="alt ?? ''" />
  <img v-else class="lazy-image" loading="lazy" decoding="async" src="/img/void.png" :alt="alt ?? ''" />
</template>
<script>
export default {
  name: 'lazyImage',
  data() {
    return {}
  },
  props: {
    src: String,
    alt: String,
  },
  methods: {},
}
</script>
<style lang="scss" scoped>
.lazy-image {
  background-color: rgb(var(--fg-color), 0.125);
  display: block;
}
</style>
