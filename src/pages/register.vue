<template>
  <q-layout>
    <q-page-container>
      <q-page>
        <div class="parent clearfix">
          <div class="login">
            <div class="position-relative">
              <div class="flex flex-center q-mx-auto window-height">
                <div class="container justify-center">
                  <q-card-section class="q-pa-lg login-form">
                    <div class="d-flex justify-content-center">
                      <q-avatar>
                        <img src="../assets/social.png" />
                      </q-avatar>
                    </div>
                    <p class="text-h5 text-primary text-center q-mt-sm">
                      <b>{{ usePassword ? 'Signup with password' : 'Signup with passkey' }}</b>
                    </p>
                    <div>
                      <div class="d-flex justify-content-center q-mt-sm">
                        <div>
                          <div>
                            <q-input
                              outlined
                              v-model="username"
                              label="Username"
                              class="has-icon-input login-input"
                              stack-label
                              @focus="onUsernameFocus"
                              @blur="onUsernameBlur"
                              @update:model-value="onUsernameChange"
                              :dense="dense"
                            >
                              <template v-slot:append v-if="!usePassword">
                                <q-btn round dense flat icon="refresh" @click="refreshRandomUsername" />
                              </template>
                            </q-input>
                          </div>
                          <div v-if="!notUseRandomUsername && username != ''">
                            <p>Randomly generated</p>
                          </div>
                        </div>
                      </div>
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
                      />
                    </div>
                    <div class="d-flex justify-content-center q-mt-sm">
                      <q-input
                        outlined
                        v-model="email"
                        class="login-input"
                        label="Email"
                        :rules="emailRules"
                        stack-label
                        :dense="dense"
                      />
                    </div>
                    <div class="d-flex justify-content-center q-mb-md q-mt-sm">
                      <q-btn
                        label="Create"
                        color="primary"
                        class="text-center"
                        icon="app_registration"
                        :loading="loading"
                        :disable="!canRegister()"
                        @click="usePassword ? registerWithPassword() : registerUserPasskey()"
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
                          <a class="login-link blue-link" @click.stop.prevent="signupWithPassword">{{
                            usePassword ? 'Signup With Passkey' : 'Signup With Password'
                          }}</a>
                        </div>
                        <div class="text-center">
                          <q-icon name="undo" size="sm" class="q-mr-sm blue-link" />
                          <router-link
                            class="login-link blue-link"
                            :to="usePassword ? '/login?type=password' : '/login?type=passkey'"
                            >Back to login</router-link
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
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script>
import { startRegistration } from '@simplewebauthn/browser'
import { responseError } from 'src/helper/error'
import { mapActions } from 'vuex'
const DESTINATION_CHECK_CHECKING = 1
const DESTINATION_CHECK_FAIL = 2
const DESTINATION_CHECK_DONE = 3
export default {
  name: 'pageRegister',
  data() {
    return {
      username: '',
      displayName: '',
      randomUsername: '',
      notUseRandomUsername: false,
      email: '',
      password: '',
      passwordCfm: '',
      usePassword: false,
      isPwd: true,
      loading: false,
      error: null,
      msg: [],
      authType: 1,
      allowCreate: false,
      cantRegister: false,
      emailRules: [(v) => (v && /^[^@]+@\w+(\.\w+)+\w$/.test(v)) || 'Email is required'],
    }
  },
  created() {
    const router = this.$route.query.type
    this.usePassword = router == 'password'
    if (this.randomUsername == '') {
      this.createRandomUsername()
    }
  },
  methods: {
    ...mapActions({
      setLogin: 'user/setLogin',
    }),
    async createRandomUsername() {
      this.$api
        .get('/auth/gen-random-username')
        .then((res) => {
          if (!res.error) {
            const result = JSON.parse(res.data)
            this.randomUsername = result.username
            if (!this.notUseRandomUsername) {
              this.username = this.randomUsername
            }
          }
        })
        .catch((err) => {
          responseError(err)
        })
    },
    refreshRandomUsername() {
      this.createRandomUsername()
    },
    onUsernameFocus() {
      if (!this.notUseRandomUsername) {
        this.username = ''
      }
    },
    onUsernameBlur() {
      if (!this.notUseRandomUsername || this.username == '') {
        this.username = this.randomUsername
      }
    },
    onUsernameChange(value) {
      this.username = value
      this.notUseRandomUsername = this.username && this.username != ''
    },
    async handlerFinishRegistration(options, sessionKey) {
      let asseResp
      try {
        asseResp = await startRegistration(options.publicKey)
      } catch (error) {
        this.loading = false
        console.log('Conditional UI request was aborted')
        this.cancelRegisterUser(sessionKey)
        return
      }
      this.$api
        .post('/auth/register-finish?sessionKey=' + sessionKey + '&email=' + this.email, asseResp)
        .then((res) => {
          this.setLogin(res)
          this.$router.push({ path: '/' })
        })
        .catch((err) => {
          this.loading = false
          this.cancelRegisterUser(sessionKey)
          responseError(err)
        })
    },
    registerUserPasskey() {
      if (!this.isValidEmail(this.email)) {
        return
      }
      this.loading = true
      this.$api
        .post('/auth/register-start?username=' + this.username, {})
        .then((res) => {
          const resultData = JSON.parse(res)
          let sessionKey
          let options
          if (resultData) {
            options = resultData.options
            sessionKey = resultData.sessionkey
          }
          if (!options) {
            if (sessionKey && sessionKey != '') {
              this.cancelRegisterUser(sessionKey)
            }
            this.loading = false
            return
          }
          this.handlerFinishRegistration(options, sessionKey)
        })
        .catch((err) => {
          this.loading = false
          responseError(err)
        })
    },
    registerWithPassword() {
      if (
        !this.isValidPassword(this.password) ||
        !this.isValidUsername(this.username) ||
        !this.isValidEmail(this.email)
      ) {
        return
      }
      this.$store
        .dispatch('user/register', {
          username: this.username,
          password: this.password,
          email: this.email,
        })
        .then((res) => {
          this.$q.notify({
            message: 'Your account was created. You are logging in with a new account',
            color: 'positive',
            icon: 'check',
          })
          this.setLogin(res)
          this.$router.push({ path: '/' })
        })
        .catch((error) => {
          this.error = error.response ? error.response.data.message : error.message
          responseError(error)
        })
    },
    cancelRegisterUser(sessionKey) {
      this.$api
        .post('/auth/cancel-register?sessionKey=' + sessionKey)
        .then((res) => {
          console.log('cancel register successfully')
        })
        .catch((err) => {
          responseError(err)
        })
    },
    validateUsername(value) {
      if (this.isValidUsername(value)) {
        this.msg['username'] = ''
        return
      }
      this.msg['username'] = 'Please enter your username'
    },
    validatePasswordField(value) {
      if (this.isValidPassword(value)) {
        this.msg['password'] = ''
        return
      }
      this.msg['password'] = 'Password must be at least 6 characters. Please re-enter your password'
    },
    isValidUsername(value) {
      return value && value.length > 0
    },
    isValidEmail(value) {
      return value && /^[^@]+@\w+(\.\w+)+\w$/.test(value)
    },
    isValidPassword(value) {
      return value && value.length >= 6
    },
    canRegister() {
      return (
        (this.usePassword && this.isValidUsername(this.username) && this.isValidPassword(this.password)) ||
        (!this.usePassword && this.isValidUsername(this.username))
      )
    },
    isValidPasswordCfm(value) {
      return !value || (value && value === this.password)
    },
    signupWithPassword() {
      this.usePassword = !this.usePassword
      const queryChange = this.usePassword ? 'password' : 'passkey'
      this.$router.replace({ query: { type: queryChange } })
    },
  },
  watch: {
    password(value) {
      this.password = value
      this.validatePasswordField(value)
    },
  },
}
</script>
