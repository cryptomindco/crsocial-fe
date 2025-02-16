<template>
  <div class="author-handle">{{ handle || '&emsp;' }}</div>
</template>
<script>
export default {
  name: 'authorHandle',
  data() {
    return {}
  },
  props: {
    handle: String,
  },
}
</script>
<style lang="scss" scoped>
.author-handle {
  color: rgb(var(--fg-color), 0.5);
  font-size: 0.75em;
  line-height: 1.25;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  &[data-is-invalid-handle='true'] {
    --fg-color: var(--notice-color);
    font-weight: bold;
  }
}
</style>
