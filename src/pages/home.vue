<template>
  <div class="q-pt-md q-px-lg" v-if="isLoggingin">
    <div class="border-solid-light-grey d-flex q-pa-sm b-radius-10">
      <q-avatar size="lg" class="q-mt-sm">
        <img v-if="!user.avatar || user.avatar == ''" src="../assets/user-icon.png" />
        <img v-else :src="user.avatar" />
      </q-avatar>
      <div class="w-100 q-pr-md">
        <q-input
          type="textarea"
          class="q-ml-sm border-none shadow-none w-100"
          rows="5"
          v-model="postContent"
          placeholder="What's up?"
        ></q-input>
        <div class="border-bottom q-mb-sm"></div>
        <div class="d-flex justify-content-between">
          <div>
            <label class="add-button" tabindex="0">
              <input type="file" multiple accept="image/*" @click="onFileClick" @change="onImageFileChange" />
              <q-icon name="image" size="sm" />
            </label>
            <label class="add-button q-ml-sm" tabindex="0">
              <input type="file" accept="video/*" @click="onFileClick" @change="onVideoFileChange" />
              <q-icon name="videocam" size="sm" />
            </label>
          </div>
          <q-btn unelevated rounded color="primary" class="btn-wide-padding" label="Post" @click="postNewArticle" />
        </div>
        <div class="q-mt-md">
          <div v-if="previews.length > 0" class="quad-images" :data-number-of-images="previews.length">
            <div v-for="(preview, index) of previews" :key="index" class="quad-image">
              <div class="thumbnail">
                <div v-if="files != null && files[index]?.type?.startsWith('video/')">
                  <video ref="media" controls loading="lazy" loop muted preload="metadata" width="500" height="300">
                    <source :src="preview" />
                  </video>
                </div>
                <LazyImage v-else ref="media" :src="preview" @click.prevent.stop />
                <button class="delete-button" @click.prevent="deleteFile(index)">
                  <q-icon name="close" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="q-pt-md q-px-lg">
    <q-tabs class="border-bottom" v-model="postTab" narrow-indicator dense align="justify">
      <q-tab class="text-blue-10" name="timeline" icon="subject" label="Timelines" />
      <q-tab class="text-deep-purple-7" name="allfeed" icon="rss_feed" label="All Posts" />
    </q-tabs>
  </div>

  <FeedList v-if="isTimeline" :feeds="timelines" @updateImagePopupProps="updateImagePopupProps"></FeedList>
  <FeedList v-if="isAllPosts" :feeds="allPosts" @updateImagePopupProps="updateImagePopupProps"></FeedList>
</template>

<script>
import LazyImage from 'src/components/images/LazyImage.vue'
import FeedList from 'src/components/lists/FeedList.vue'
import { api } from 'boot/axios'
import { mapGetters } from 'vuex'
export default {
  name: 'homePage',
  beforeRouteLeave: function (to, from, next) {
    next()
  },
  components: {
    LazyImage,
    FeedList,
  },
  data() {
    return {
      timelines: [],
      allPosts: [],
      cursor: '',
      postTab: 'timeline',
      maxNumber: 4,
      files: [],
      previews: [],
      postContent: '',
    }
  },
  created() {
    this.$api
      .get(`/public/get-timelines`)
      .then((res) => {
        this.timelines = res.posts
      })
      .catch((err) => {
        responseError(err)
      })
    this.$api
      .get(`/public/get-all-posts`)
      .then((res) => {
        this.allPosts = res.posts
      })
      .catch((err) => {
        responseError(err)
      })
  },
  computed: {
    ...mapGetters({
      user: 'user/getUser',
    }),
    isTimeline() {
      return this.postTab == 'timeline'
    },
    isAllPosts() {
      return this.postTab == 'allfeed'
    },
    isLoggingin() {
      return this.user && this.user.id > 0 && this.user.username != ''
    },
  },
  methods: {
    updateImagePopupProps(updateProp) {
      this.$emit('updateImagePopupProps', updateProp)
    },
    onFileClick(e) {
      if (e.target != null) e.target.value = ''
    },
    onFileChange(e, type) {
      const newFiles = this.getFiles(e)
      if (newFiles == null) return
      if (this.maxNumber === 1) this.files.unshift(...newFiles)
      else this.files.push(...newFiles)
      this.resetFiles(type)
    },
    onImageFileChange(e) {
      this.onFileChange(e, 'image')
    },
    onVideoFileChange(e) {
      this.onFileChange(e, 'video')
    },
    getFiles(e) {
      const fileList = e.target?.files ?? null
      return fileList == null ? null : Array.from(fileList)
    },
    resetFiles(type) {
      if (this.maxNumber != null) {
        this.files.splice(this.maxNumber)
      }
      if (type == 'video') {
        const firstVideo = this.files.find((file) => {
          return file.type?.startsWith('video/')
        })
        if (firstVideo != null) {
          this.files.splice(0, this.files.length, firstVideo)
        }
      }
      this.setPreviews(this.files)
    },
    setPreviews(files) {
      if (files.length === 0) {
        this.previews.splice(0)
        return
      }
      const objectUrls = files.map((file) => window.URL.createObjectURL(file))
      this.previews.splice(0, this.previews.length, ...objectUrls)
    },
    deleteFile(index) {
      this.files.splice(index, 1)
      this.previews.splice(index, 1)
    },
    async postNewArticle() {
      const content = this.postContent
      if (!content || content == '') {
        return
      }
      if (this.files && this.files.length > 0) {
        // get file type
        const fileType = this.files[0].type
        let formData = new FormData()
        for (var i = 0; i < this.files.length; i++) {
          formData.append('files[' + i + ']', this.files[i])
        }
        formData.set('postContent', content)
        formData.set('fileType', fileType)
        let headers = {
          'Content-Type': 'multipart/form-data',
        }
        const res = await api.post('/post/post-with-files', formData, headers)
        if (res instanceof Error) {
          responseError(res)
          return
        }
        window.location.reload()
        return
      }
      this.$api
        .post('/post/post-without-files', { postContent: content })
        .then((res) => {
          window.location.reload()
        })
        .catch((err) => {
          responseError(err)
        })
    },
  },
}
</script>

<style lang="scss" scoped>
.add-button {
  min-width: 16px;
  max-width: 16px;
  min-height: 16px;
  max-height: 16px;
  cursor: pointer;
  [data-disabled='true'] & {
    opacity: 0.5;
  }

  & > input {
    display: none;
  }

  & > .svg-icon {
    font-size: 16px;
  }
}
</style>
