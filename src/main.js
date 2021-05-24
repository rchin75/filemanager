import { createApp } from 'vue'
import App from './App.vue'
import Framework7 from "framework7/lite-bundle";
import Framework7Vue, {registerComponents} from "framework7-vue/bundle";
import 'framework7/framework7-bundle.min.css';
import 'framework7-icons';

import registerFilters from "./filters";

Framework7.use(Framework7Vue);

const app = createApp(App);
registerComponents(app);
registerFilters(app);
app.mount('#app');
