import { createApp } from 'vue'
import { createPinia } from 'pinia';
import '@/style.css'
import '@/assets/styles/_global.css'
import '@/assets/styles/_category.css';
import App from '@/App.vue'
import router from '@/router/index';

const pinia = createPinia();
const app = createApp(App);

app.use(pinia);
app.use(router);

app.mount('#app')
