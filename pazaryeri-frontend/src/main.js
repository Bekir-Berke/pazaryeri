import { createApp } from 'vue'
import { createPinia } from 'pinia'
import {createBootstrap} from 'bootstrap-vue-next'
import ToastPlugin from 'vue-toast-notification';
import "bootstrap/dist/css/bootstrap.min.css"
import 'bootstrap-vue-next/dist/bootstrap-vue-next.css'
import 'vue-toast-notification/dist/theme-bootstrap.css';
import "@/assets/main.css"

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(createBootstrap())
app.use(ToastPlugin)
app.use(router)

app.mount('#app')
