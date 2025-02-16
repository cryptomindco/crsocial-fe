<template>
  <div class="q-pt-md q-px-lg">
    <div class="border-solid-light-grey q-pa-sm b-radius-10">
      <div class="d-flex ai-center">
        <div class="relative-position">
          <q-avatar size="100px">
            <img v-if="this.profile.avatar == ''" src="../assets/user-icon.png" />
            <img v-else :src="this.profile.avatar" />
          </q-avatar>
          <label class="add-button" tabindex="0" v-if="isLoginUser">
            <input type="file" accept="image/*" @click="onFileClick" @change="onAvatarChange" />
            <q-icon size="sm" color="primary" name="edit" class="absolute-bottom-right q-mb-xs q-mr-xs circle-btn" />
          </label>
        </div>
        <div class="q-ml-sm">
          <p class="text-size-16">@{{ this.profile.username }}</p>
          <q-btn
            v-if="!isLoginUser && isLoggingin"
            @click="followUser"
            class="q-ml-xs"
            :color="followStatus ? 'accent' : 'primary'"
            :icon="followStatus ? 'remove' : 'add'"
            :label="followStatus ? 'Unfollow' : 'Follow'"
          />
        </div>
      </div>
      <div class="d-flex q-mt-md q-ml-sm">
        <p class="fw-600">Display name:</p>
        <q-input v-model="displayName" class="q-ml-sm" outlined v-if="isLoginUser && dispNameEditing">
          <template v-slot:append>
            <div class="q-pt-xs">
              <q-icon name="check" color="green" @click="updateDispName" class="cursor-pointer" />
              <q-icon name="close" color="red" @click="dispNameEditing = false" class="cursor-pointer" />
            </div>
          </template>
        </q-input>
        <div class="d-flex q-ml-sm" v-if="!isLoginUser || !dispNameEditing">
          <p>{{ this.profile.fullName }}</p>
          <label v-if="isLoginUser" class="add-button q-ml-sm" tabindex="0">
            <q-icon name="edit" size="xs" @click="editDisplayname" />
          </label>
        </div>
      </div>
      <div class="d-flex q-mt-sm q-ml-sm">
        <p class="fw-600">Bio:</p>
        <q-input
          v-if="isLoginUser && bioEditing"
          v-model="bio"
          outlined
          class="q-ml-sm shadow-none"
          placeholder="Your Bio?"
          style="min-width: 250px"
        >
          <template v-slot:append>
            <div class="q-pt-xs">
              <q-icon name="check" color="green" @click="updateBio" class="cursor-pointer" />
              <q-icon name="close" color="red" @click="bioEditing = false" class="cursor-pointer" />
            </div>
          </template>
        </q-input>
        <div class="d-flex q-ml-sm" v-if="!isLoginUser || !bioEditing">
          <p>{{ this.profile.bio }}</p>
          <label v-if="isLoginUser" class="add-button q-ml-sm" tabindex="0">
            <q-icon name="edit" size="xs" @click="editBio" />
          </label>
        </div>
      </div>
    </div>
    <div class="border-solid-light-grey d-flex q-pa-sm q-mt-md b-radius-10" v-if="isLoginUser">
      <q-avatar size="lg" class="q-pt-sm">
        <img v-if="isLoggingin && isLoginUser" :src="this.profile.avatar" />
      </q-avatar>
      <div class="w-100 q-pr-md">
        <q-input
          type="textarea"
          class="q-ml-sm border-none shadow-none w-100"
          v-model="postContent"
          rows="5"
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
        <div>
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
  <div class="q-pt-md q-px-lg" v-if="isLoginUser">
    <q-tabs class="border-bottom" v-model="postTab" narrow-indicator dense align="justify">
      <q-tab class="text-blue-10" name="mypost" icon="subject" label="My Posts" />
      <q-tab
        class="text-orange-10"
        name="following"
        icon="account_box"
        :label="'Following (' + following.length + ')'"
      />
    </q-tabs>
  </div>
  <FeedList v-if="isMyPosts" :feeds="timelines" @updateImagePopupProps="updateImagePopupProps"></FeedList>
  <div v-if="isFollowingDisp" class="q-pa-md q-ml-lg">
    <div
      v-for="(followTarget, idx) of following"
      :key="idx"
      class="d-flex q-mt-md cursor-pointer"
      @click="toUserProfile(followTarget.target)"
    >
      <q-avatar size="lg" class="q-mr-sm">
        <img v-if="followTarget.avatar == ''" src="../assets/user-icon.png" />
        <img v-else :src="followTarget.avatar" />
      </q-avatar>
      <div>
        <p class="text-size-16 fw-600 q-mb-none">{{ followTarget.fullName }}</p>
        <p class="text-size-14">@{{ followTarget.target }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import LazyImage from 'src/components/images/LazyImage.vue'
import FeedList from 'src/components/lists/FeedList.vue'
import { mapGetters, mapActions } from 'vuex'
import { api } from 'boot/axios'
export default {
  name: 'profilePage',
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
      cursor: '',
      postTab: 'mypost',
      maxNumber: 4,
      files: [],
      previews: [],
      profile: {},
      dispNameEditing: false,
      bioEditing: false,
      displayName: '',
      bio: '',
      followStatus: false,
      following: [],
      postContent: '',
    }
  },
  created() {
    this.fetchData()
  },
  computed: {
    ...mapGetters({
      user: 'user/getUser',
    }),
    isLoginUser() {
      return this.user.username == this.profile.username
    },
    isMyPosts() {
      return this.postTab == 'mypost'
    },
    isFollowingDisp() {
      return this.postTab == 'following'
    },
    isAllPosts() {
      return this.postTab == 'allfeed'
    },
    isLoggingin() {
      return this.user && this.user.id > 0 && this.user.username != ''
    },
  },
  methods: {
    ...mapActions({
      setGlobalUser: 'user/setGlobalUser',
    }),
    fetchData() {
      this.postTab = 'mypost'
      this.$api
        .get(`/public/get-user-posts/${this.$route.params.username}`)
        .then((res) => {
          this.timelines = res.posts
        })
        .catch((err) => {
          responseError(err)
        })

      this.$api
        .get(`/public/get-user-by-name/${this.$route.params.username}`)
        .then((res) => {
          this.profile = res.userinfo
          this.followStatus = res.follow
          this.following = res.following
          this.displayName = this.profile.fullName
          this.bio = this.profile.bio
        })
        .catch((err) => {
          responseError(err)
        })
    },
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
    async onAvatarChange(e) {
      const newFiles = this.getFiles(e)
      if (newFiles == null || newFiles.length < 1) return
      const file = newFiles[0]
      let formData = new FormData()
      formData.append('file', file)
      let headers = {
        'Content-Type': 'multipart/form-data',
      }
      const res = await api.post('/user/update-avatar', formData, headers)
      if (res instanceof Error) {
        responseError(res)
        return
      }
      this.profile = res
      let newUser = {}
      Object.assign(newUser, this.user)
      newUser.avatar = res.avatar
      this.setGlobalUser(newUser)
      window.location.reload()
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
    editBio() {
      this.bioEditing = true
    },
    editDisplayname() {
      this.dispNameEditing = true
    },
    updateDispName() {
      if (!this.displayName || this.displayName == '' || this.displayName == this.profile.fullName) {
        this.dispNameEditing = false
        return
      }
      this.$api
        .post('/user/update-display-name', { fullName: this.displayName })
        .then((res) => {
          this.profile = res
          this.dispNameEditing = false
          let newUser = {}
          Object.assign(newUser, this.user)
          newUser.fullName = res.fullName
          this.setGlobalUser(newUser)
          window.location.reload()
        })
        .catch((err) => {
          responseError(err)
        })
    },
    updateBio() {
      if (!this.bio || this.bio == '' || this.bio == this.profile.bio) {
        this.bioEditing = false
        return
      }
      this.$api
        .post('/user/update-bio', { bio: this.bio })
        .then((res) => {
          this.profile = res
          this.bioEditing = false
        })
        .catch((err) => {
          responseError(err)
        })
    },
    followUser() {
      this.$api
        .post('/user/follow-user', { targetUsername: this.profile.username, status: !this.followStatus })
        .then((res) => {
          this.followStatus = res
        })
        .catch((err) => {
          responseError(err)
        })
    },
    toUserProfile(target) {
      this.$router.push({ path: `/profile/${target}` })
    },
  },
  watch: {
    $route(to, from) {
      this.fetchData()
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
