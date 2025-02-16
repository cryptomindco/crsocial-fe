<template>
  <div class="tweet-wrap">
    <div class="tweet-header">
      <q-avatar size="md" class="q-mr-sm cursor-pointer" @click="toProfilePage(postData.username)">
        <img v-if="postData.author.avatar == ''" src="../../assets/user-icon.png" />
        <img v-else :src="postData.author.avatar" />
      </q-avatar>
      <div>
        <div class="tweet-header-info cursor-pointer" @click.stop="toProfilePage(postData.username)">
          {{ postData.author.fullName }} <span>@{{ postData.author.username }}</span
          ><span> . {{ getDisplayTime(postData.createdAt) }} </span>
        </div>
        <div>
          <p class="html-text">{{ postData.content }}</p>
        </div>
      </div>
    </div>
    <div class="tweet-img-wrap">
      <div v-if="images && images.length > 0" class="quad-images" :data-number-of-images="images.length">
        <div v-for="(image, imageIndex) of images" :key="imageIndex" class="quad-image">
          <Thumbnail :image="image" @click.stop="openImagePopup(imageIndex)" />
        </div>
      </div>
      <div v-if="video != null && video != undefined" class="video-container">
        <video controls>
          <source :src="video" type="video/mp4" />
        </video>
      </div>
    </div>
    <div class="tweet-info-counts">
      <div class="comments">
        <svg
          class="feather feather-message-circle sc-dnqmqq jxshSx"
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path
            d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"
          ></path>
        </svg>
        <div class="comment-count">{{ postData.commentCount }}</div>
      </div>

      <div class="likes">
        <svg
          class="feather feather-heart sc-dnqmqq jxshSx"
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
          @click.stop="like()"
        >
          <path
            d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
          ></path>
        </svg>
        <div class="likes-count">{{ postData.likeCount }}</div>
      </div>
    </div>
  </div>
</template>
<script>
import Thumbnail from '../images/Thumbnail.vue'
import { mapGetters } from 'vuex'
export default {
  name: 'postItem',
  data() {
    return {
      level: 1,
      position: 'post',
      rootPost: {},
      parentPost: {},
      grandparentAuthor: {},
      hasReplyIcon: false,
      hasQuoteRepostIcon: false,
      noLink: false,
      noLabelTags: false,
      forceHideMedia: false,
      forceHideQuoteRepost: false,
      forceUpdatePostThread: false,
      processing: false,
      postData: null,
      images: [],
      video: {},
      videoAspectRatio: 'unset',
      videoType: null,
      imagePopupProps: {},
      linkCard: null,
    }
  },
  props: {
    post: Object,
  },
  components: {
    Thumbnail,
  },
  computed: {
    ...mapGetters({
      user: 'user/getUser',
    }),
  },
  methods: {
    isFocused() {},
    onActivatePost(e) {},
    onActivateReplierLink() {},
    getDisplayTime(time) {
      const date = new Date(Date.parse(time))
      const now = new Date()
      const dateInt = date.getTime()
      const nowInt = now.getTime()
      // if less than 1 hour
      if (nowInt - dateInt <= 3600000) {
        const minuteNum = Math.round(Math.abs(nowInt - dateInt) / 60000)
        return minuteNum + 'm ago'
      }
      if (nowInt - dateInt > 86400000) {
        return date.getFullYear() == now.getFullYear()
          ? date.toLocaleString('default', { day: 'numeric', month: 'short' })
          : date.toLocaleString('default', { year: 'numeric', day: 'numeric', month: 'short' })
      } else {
        const hourNum = Math.round(Math.abs(now - date) / 36e5)
        return hourNum + ' ' + (hourNum < 2 ? 'hour' : 'hours') + ' ago'
      }
    },
    toProfilePage(target) {
      this.$router.push({ path: `/profile/${target}` })
    },
    updateVideoType(type) {
      this.videoType = type
    },
    isLoginUser(target) {
      return this.user && this.user.username && this.user.username != '' && this.user.username == target
    },
    initImages() {
      if (!this.postData.imageUrls || this.postData.imageUrls == null) {
        this.images = []
        return
      }
      this.images = this.postData.imageUrls
    },
    initVideo() {
      if (!this.postData.videoUrl || this.postData.videoUrl == '') {
        this.video = undefined
        return
      }
      this.video = this.postData.videoUrl
    },
    openImagePopup(imageIndex) {
      if (!this.images[imageIndex] == null || this.images[imageIndex] == null) {
        return
      }
      this.imagePopupProps.images = this.images.map((image) => {
        const result = {
          smallUri: image,
          largeUri: image,
        }
        return result
      })
      this.imagePopupProps.index = imageIndex
      this.imagePopupProps.display = true
      this.$emit('updateImagePopupProps', this.imagePopupProps)
    },
  },
  watch: {
    post: {
      immediate: true,
      handler(newVal) {
        this.postData = newVal
        this.initImages()
        this.initVideo()
      },
    },
  },
}
</script>
<style lang="scss" scoped>
img {
  max-width: 100%;
}
.html-text {
  white-space: pre-wrap;
  word-break: break-word;
}
.avator {
  border-radius: 100px;
  width: 48px;
  margin-right: 15px;
}

.tweet-wrap {
  max-width: 650px;
  background: #fff;
  border-radius: 3px;
  padding: 30px;
  border-bottom: 1px solid #e6ecf0;
}

.tweet-header {
  display: flex;
  align-items: flex-start;
  font-size: 14px;
}
.tweet-header-info {
  font-weight: bold;
}
.tweet-header-info span {
  color: #657786;
  font-weight: normal;
  margin-left: 5px;
}
.tweet-header-info p {
  font-weight: normal;
  margin-top: 5px;
}
.tweet-img-wrap {
  padding-left: 50px;
}

.tweet-info-counts {
  display: flex;
  margin-left: 60px;
  margin-top: 10px;
}
.tweet-info-counts div {
  display: flex;
  margin-right: 20px;
}
.tweet-info-counts div svg {
  color: #657786;
  margin-right: 10px;
}
@media screen and (max-width: 430px) {
  body {
    padding-left: 20px;
    padding-right: 20px;
  }
  .tweet-header {
    flex-direction: column;
  }
  .tweet-header img {
    margin-bottom: 20px;
  }
  .tweet-header-info p {
    margin-bottom: 30px;
  }
  .tweet-img-wrap {
    padding-left: 0;
  }
  .tweet-info-counts {
    display: flex;
    margin-left: 0;
  }
  .tweet-info-counts div {
    margin-right: 10px;
  }
}
.repost {
  background-color: rgba(62, 176, 234, 0.125);
  border: 1px solid rgb(62, 176, 234, 0.25);
  border-radius: 0.25em;
  margin-left: 60px;
  margin-top: 10px;

  :not([data-position='slim']) & > .post {
    padding: 0.75em;
  }
  [data-position='slim'] & > .post {
    padding: 0.5em;
  }

  &.textlabel {
    opacity: 0.75;
    padding: 0.75em;
  }
}
.repost .tweet-wrap {
  background: transparent;
}
.repost .tweet-wrap {
  padding: 15px 20px;
}
</style>
