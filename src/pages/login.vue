<template>
  <q-layout>
    <q-page-container>
      <q-page>
        <div class="parent clearfix">
          <div class="login">
            <div class="position-relative">
              <div class="flex flex-center q-mx-auto window-height">
                <div class="container justify-center">
                  <div>
                    <q-card-section class="q-pa-lg login-form">
                      <div class="d-flex justify-content-center">
                        <q-avatar>
                          <img src="../assets/social.png" />
                        </q-avatar>
                      </div>
                      <p class="text-h5 text-primary text-center q-mt-sm">
                        <b>{{ usePassword ? 'Login with password' : 'Login with passkey' }}</b>
                      </p>
                      <div class="d-flex justify-content-center q-mt-sm" v-if="usePassword">
                        <q-input
                          outlined
                          v-model="username"
                          label="Username"
                          class="login-input"
                          stack-label
                          :dense="dense"
                          :rules="usernameRules"
                        />
                      </div>
                      <div class="d-flex justify-content-center q-mt-sm" v-if="usePassword">
                        <q-input
                          outlined
                          v-model="password"
                          type="password"
                          label="Password"
                          class="login-input"
                          stack-label
                          :dense="dense"
                          :rules="passwordRules"
                        />
                      </div>
                      <div class="d-flex justify-content-center q-mb-md q-mt-sm">
                        <q-btn
                          label="Login"
                          color="primary"
                          class="text-center"
                          :icon="usePassword ? 'keyboard' : 'fingerprint'"
                          :disable="cantLogin && usePassword"
                          :loading="signBtnLoading"
                          @click="usePassword ? goLogin() : openPasskeyMgr()"
                        />
                      </div>
                      <div class="text-grey-3 q-mt-md justify-content-center d-flex">
                        <div>
                          <div class="text-center">
                            <q-icon
                              :name="usePassword ? 'fingerprint' : 'keyboard'"
                              size="sm"
                              class="q-mr-sm blue-link"
                            />
                            <a class="login-link blue-link" @click.stop.prevent="loginWithPassword">{{
                              usePassword ? 'Login With Passkey' : 'Login With Password'
                            }}</a>
                          </div>
                          <div class="text-center">
                            <q-icon name="app_registration" size="sm" class="q-mr-sm blue-link" />
                            <router-link
                              class="login-link blue-link"
                              :to="usePassword ? '/register?type=password' : '/register?type=passkey'"
                              >Signup</router-link
                            >
                          </div>
                        </div>
                      </div>
                    </q-card-section>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { responseError } from 'src/helper/error'
import { Notify } from 'quasar'
import { startAuthentication } from '@simplewebauthn/browser'

export default {
  name: 'pageLogin',
  data() {
    return {
      username: '',
      password: '',
      error: null,
      isPwd: true,
      usePassword: false,
      msg: [],
      cantLogin: false,
      signBtnLoading: false,
      usernameRules: [(v) => (v && v.length > 0) || 'Username is required'],
      passwordRules: [(v) => (v && v.length > 0) || 'Password is required'],
    }
  },
  created() {
    const router = this.$route.query.type
    this.usePassword = router == 'password'
  },
  computed: {
    ...mapGetters({
      user: 'user/getUser',
    }),
  },
  methods: {
    ...mapActions({
      login: 'user/login',
      setLogin: 'user/setLogin',
    }),
    async goLogin() {
      const { error, data } = await this.login({
        username: this.username,
        password: this.password,
      })
      if (error) {
        this.error = error.message
        responseError(error)
        return
      }
      this.$router.push({ path: '/' })
    },
    validateRequiredField(name, value) {
      if (value && value.length > 0) {
        this.msg[name] = ''
        return
      }
      this.msg[name] = 'Please enter your ' + name
    },
    openPasskeyMgr() {
      this.signBtnLoading = true
      this.$api
        .post('/auth/assertion-options', {})
        .then((res) => {
          if (!res.error) {
            const resultData = JSON.parse(res.data)
            if (!resultData || !resultData.options) {
              return
            }
            const opts = resultData.options
            const sessionKey = resultData.sessionkey
            this.handlerLoginFinish(opts, sessionKey, false)
          } else {
            Notify.create({
              type: 'negative',
              message: res.msg,
            })
            this.signBtnLoading = false
          }
        })
        .catch((err) => {
          this.signBtnLoading = false
          responseError(err)
        })
    },
    async handlerLoginFinish(opts, sessionKey, startConditionalUI) {
      let asseResp
      try {
        asseResp = await startAuthentication(opts.publicKey, startConditionalUI)
      } catch (error) {
        this.signBtnLoading = false
        console.log('Conditional UI request was aborted')
        return
      }
      this.$api
        .post('/auth/assertion-result?sessionKey=' + sessionKey, asseResp)
        .then((res) => {
          this.setLogin(res)
          this.$router.push({ path: '/' })
        })
        .catch((err) => {
          this.signBtnLoading = false
          responseError(err)
        })
    },
    loginWithPassword() {
      this.usePassword = !this.usePassword
      const queryChange = this.usePassword ? 'password' : 'passkey'
      this.$router.replace({ query: { type: queryChange } })
    },
  },
  watch: {
    username(value) {
      this.username = value
      this.validateRequiredField('username', value)
      this.cantLogin = !this.username || this.username === '' || !this.password || this.password === ''
    },
    password(value) {
      this.password = value
      this.validateRequiredField('password', value)
      this.cantLogin = !this.username || this.username === '' || !this.password || this.password === ''
    },
  },
}
</script>

<style lang="scss">
.logo {
  height: 2em;
}
.login-form-wrapper {
  max-width: 28rem;
}
.link {
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
}
</style>
