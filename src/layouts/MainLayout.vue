<template>
  <q-layout class="main-layout" view="hHh lpR fFf">
    <div class="p-relative sidebar-div">
      <div class="p-absolute">
        <q-drawer
          show-if-above
          v-model="leftDrawerOpen"
          :mini="miniState"
          side="left"
          class="left-sidebar"
          :width="230"
        >
          <div class="d-flex justify-content-center q-mt-md">
            <q-btn flat no-caps v-if="isLoggingin">
              <div>
                <div class="d-flex justify-content-center q-mb-sm">
                  <q-avatar>
                    <img v-if="!user.avatar || user.avatar == ''" src="../assets/user-icon.png" />
                    <img v-else :src="user.avatar" />
                  </q-avatar>
                </div>
                <div class="d-flex justify-content-center" v-if="user.fullName && user.fullName != ''">
                  <q-item-label lines="1" class="text-size-16 header-text">
                    {{ user.fullName }}
                  </q-item-label>
                </div>
                <div class="d-flex justify-content-center">
                  <p class="text-size-13 fw-400i">@{{ user.username }}</p>
                </div>
              </div>
              <q-menu transition-show="jump-down" transition-hide="jump-up">
                <q-list style="min-width: 100px">
                  <q-item @click="logOut" clickable v-close-popup>
                    <q-item-section>Log out</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
            <q-avatar v-else>
              <img src="../assets/user-icon.png" />
            </q-avatar>
          </div>
          <div class="d-flex justify-content-center q-mr-md" v-if="!isLoggingin">
            <q-btn
              label="Login"
              color="primary"
              size="md"
              @click="toLoginPage"
              class="text-center new-post-btn w-100"
              icon="login"
            />
          </div>
          <div class="border-bottom q-my-sm"></div>
          <q-list padding class="text-grey-2">
            <template v-for="(menuItem, index) in menuList">
              <q-item
                :key="index"
                :active="activePage === menuItem.name"
                @click="activePage = menuItem.name"
                clickable
                :to="menuItem.to == '/profile' ? `/profile/${user.username}` : menuItem.to"
                active-class="bg-cyan-2 sidebar-active-item"
                class="GNL__drawer-item sidebar-item"
                v-if="!(menuItem.hide || (menuItem.to == '/profile' && !isLoggingin))"
                v-ripple
              >
                <q-item-section avatar>
                  <q-icon size="md" class="sidebar-icon" :name="'o_' + menuItem.icon" />
                </q-item-section>
                <q-item-section>
                  <span class="row sidebar-text justify-between">{{ menuItem.label }}</span>
                </q-item-section>
              </q-item>
              <q-separator :key="'sep' + index" v-if="menuItem.separator" />
            </template>
          </q-list>
        </q-drawer>
      </div>
    </div>
    <div class="p-relative float-right sidebar-div">
      <div class="p-absolute">
        <q-drawer show-if-above side="right" class="right-sidebar" :width="230"> </q-drawer>
      </div>
    </div>
    <q-page-container>
      <q-page>
        <router-view @updateImagePopupProps="updateImagePopupProps" />
      </q-page>
    </q-page-container>
    <q-footer class="bg-white toolbar-footer text-primary" v-if="$q.screen.lt.md">
      <q-tabs v-model="activePage" class="text-primary" active-color="primary" indicator-color="primary">
        <template v-for="(menuItem, index) in menuList" :key="index">
          <q-tab
            v-if="!(menuItem.hide || (menuItem.to == '/profile' && !isLoggingin))"
            :name="menuItem.name"
            @click="toLink(menuItem.to)"
            :icon="'o_' + menuItem.icon"
            :label="menuItem.label"
          />
        </template>
        <q-tab name="logout" @click="logOut" label="Logout" icon="logout"></q-tab>
      </q-tabs>
    </q-footer>
  </q-layout>
  <div class="popup-container">
    <Transition>
      <ImagePopup
        v-if="imagePopupProps.display"
        :popupData="imagePopupProps"
        @close="imagePopupProps.display = false"
      />
    </Transition>
  </div>
</template>

<script>
import { useQuasar } from 'quasar'
import role from 'src/consts/role'
import { ref } from 'vue'
import { mapGetters } from 'vuex'
import { responseError } from 'src/helper/error'
import ImagePopup from 'src/components/popups/ImagePopup.vue'

export default {
  data() {
    return {
      version: process.env.VERSION.replace(/"/g, ''),
      drawer: false,
      menuList: [
        {
          icon: 'home',
          name: 'home',
          label: 'Home',
          separator: false,
          to: '/home',
          hide: false,
        },
        {
          icon: 'search',
          name: 'search',
          label: 'Search',
          separator: false,
          to: '/search',
          hide: true,
        },
        {
          icon: 'notifications',
          name: 'notifications',
          label: 'Notifications',
          separator: false,
          to: '/notifications',
          hide: true,
        },
        {
          icon: 'chat',
          name: 'chat',
          label: 'Chat',
          separator: false,
          to: '/chat',
          hide: true,
        },
        {
          icon: 'account_circle',
          name: 'profile',
          label: 'My Profile',
          separator: false,
          to: '/profile',
          hide: false,
        },
        {
          icon: 'settings',
          name: 'settings',
          label: 'Settings',
          separator: false,
          to: '/settings',
          hide: true,
        },
      ],
      working: false,
      pausing: true,
      approvalCount: 0,
      unpaidCount: 0,
      displayAdminSeparator: true,
      displayReport: true,
      totalTimeSeconds: 0,
      interval: null,
      timeHour: '',
      timeMin: '00',
      timeSecond: '00',
      runningTimer: {},
      imagePopupProps: {},
      activePage: '',
    }
  },
  components: {
    ImagePopup,
  },
  setup() {
    const $q = useQuasar()
    const leftDrawerOpen = ref(false)
    const miniState = ref(false)
    return {
      leftDrawerOpen,
      toggleLeftDrawer() {
        leftDrawerOpen.value = !leftDrawerOpen.value
      },
      miniState,
      toogleMiniState() {
        miniState.value = !miniState.value
        this.displayAdminSeparator = !this.displayAdminSeparator
      },
    }
  },
  computed: {
    ...mapGetters({
      user: 'user/getUser',
    }),
    isAdmin() {
      return this.user && this.user.role === role.ADMIN
    },
    isLoggingin() {
      return this.user && this.user.id > 0 && this.user.username != ''
    },
  },
  methods: {
    updateImagePopupProps(updateProp) {
      this.imagePopupProps = updateProp
    },
    logOut() {
      this.$store.dispatch('user/logOut')
      this.$router.push({ path: '/login' })
    },
    toLink(to) {
      const link = to == '/profile' ? `/profile/${this.user.username}` : to
      this.$router.push({ path: link })
    },
    empty(str) {
      return (
        typeof str == 'undefined' ||
        !str ||
        str.length === 0 ||
        str === '' ||
        !/[^\s]/.test(str) ||
        /^\s*$/.test(str) ||
        str.replace(/\s/g, '') === ''
      )
    },
    toLoginPage() {
      this.$router.push({ path: `/login` })
    },
  },
  watch: {
    $route: {
      immediate: true,
      handler(to) {
        if (to.meta.requiresAuth && this.user.id === 0) {
          this.$router.push({
            path: '/login',
          })
        }
        const path = this.$route.path
        let setted = false
        this.menuList.forEach((menu) => {
          if (path.startsWith('/' + menu.name) && !(menu.hide || (menu.to == '/profile' && !this.isLoggingin))) {
            if (menu.to == '/profile' && !path.includes(`/profile/${this.user.username}`)) {
              setted = true
              this.activePage = ''
              return
            }
            setted = true
            this.activePage = menu.name
            return
          }
        })
        if (!setted) {
          this.activePage = ''
        }
      },
    },
  },
}
</script>
