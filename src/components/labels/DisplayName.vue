<template>
  <div class="display-name">
    <slot />
    <span>{{ displayName || '&emsp;' }}</span>
  </div>
</template>
<script>
export default {
  name: 'displayName',
  data() {
    return {}
  },
  props: {
    displayName: String,
  },
}
</script>
<style lang="scss" scoped>
.display-name {
  display: flex;
  overflow: hidden;

  & > span {
    font-weight: bold;
    line-height: 1.25;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
