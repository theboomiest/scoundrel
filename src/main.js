import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'

import PrimeVue from 'primevue/config'
import Nora from '@primeuix/themes/nora'
import Button from 'primevue/button'

const app = createApp(App)

app.use(createPinia())

app.use(PrimeVue, {
  theme: {
    preset: Nora,
  },
})

app.component('Button', Button)

app.mount('#app')
