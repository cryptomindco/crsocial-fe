<template>
  <div class="feed-list">
    <LoadButton v-if="hasLoadButton" direction="new" @activate="fetchFeeds('new')" />
    <div class="feeds" v-if="feedArray.length > 0">
      <template v-for="(feed, idx) of feedArray" :key="idx">
        <FeedItem
          :feed="feed"
          @updateImagePopupProps="updateImagePopupProps"
          @updateThisPostThread="updateThisPostThread"
          @removeThisPost="removeThisPost"
        />
      </template>
    </div>
    <div class="d-flex justify-content-center q-mt-md" v-else>
      <p>No posts to display</p>
    </div>
    <LoadButton v-if="hasLoadButton" direction="old" @activate="fetchFeeds('old')" />
  </div>
</template>
<script>
import LoadButton from '../buttons/LoadButton.vue'
import FeedItem from '../compositions/FeedItem.vue'
export default {
  name: 'feedList',
  data() {
    return {
      hasLoadButton: false,
      feedArray: [],
    }
  },
  props: {
    feeds: Array,
  },
  components: {
    LoadButton,
    FeedItem,
  },
  methods: {
    fetchFeeds(type) {
      console.log('fetch feed: ', type)
    },
    updateThisPostThread() {},
    removeThisPost() {},
    updateImagePopupProps(updateProp) {
      this.$emit('updateImagePopupProps', updateProp)
    },
  },
  watch: {
    feeds: {
      immediate: true,
      handler(newVal) {
        this.feedArray = newVal
      },
    },
  },
}
</script>
