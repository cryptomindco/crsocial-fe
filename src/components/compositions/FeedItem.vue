<template>
  <div class="feed">
    <PostItem
      v-if="feedData != null"
      position="post"
      :post="feedData"
      @onClickReplier="toggleReplyDisplay"
      @updateThisPostThread="updateThisPostThread"
      @removeThisPost="removeThisPost"
      @updateImagePopupProps="updateImagePopupProps"
    />
  </div>
</template>
<script>
import PostItem from './PostItem.vue'
export default {
  name: 'feedItem',
  data() {
    return {
      hasLoadButton: false,
      feedData: {},
    }
  },
  props: {
    feed: Object,
  },
  components: {
    PostItem,
  },
  methods: {
    fetchFeeds(type) {
      console.log('fetch feed: ', type)
    },
    toggleReplyDisplay() {},
    updateThisPostThread() {},
    removeThisPost() {},
    updateImagePopupProps(updateProp) {
      this.$emit('updateImagePopupProps', updateProp)
    },
  },
  watch: {
    feed: {
      immediate: true,
      handler(newVal) {
        this.feedData = newVal
      },
    },
  },
}
</script>
