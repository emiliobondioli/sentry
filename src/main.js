import { createApp } from "vue";
import App from "./App.vue";
import { store } from "./store";
import './assets/styles/main.css'
import router from './router'
import VueNotificationList from '@dafcoe/vue-notification'


const app = createApp(App).use(router);

app.use(store);
app.use(VueNotificationList)

app.mount("#app");
