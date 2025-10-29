import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import VueECharts from "vue-echarts";
import "./assets/tailwind.css";
import "./assets/fonts.css";
import naive from "naive-ui";
import { decodeJwt } from "./utils/jwt";
import { connectWithUser } from "./sockets/socket";
import notif from "./stores/notifications";

const app = createApp(App);
app.use(router);
app.use(naive);
app.component("v-chart", VueECharts);

const token = localStorage.getItem("token");
if (token) {
  const payload = decodeJwt(token);
  if (payload?.userId) {
    connectWithUser(payload.userId);
    notif.bindSocket();
    notif.loadUnread();
  }
}

app.mount("#app");
