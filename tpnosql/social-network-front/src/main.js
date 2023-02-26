import { createApp } from 'vue';
import Home from './components/HomeView';
import router from './router';
import axios from 'axios';
import './assets/global.css'

/* import the fontawesome core */
import { library } from '@fortawesome/fontawesome-svg-core'
/* import font awesome icon component */
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
/* import specific icons */
import { faDatabase } from '@fortawesome/free-solid-svg-icons'
/* add icons to the library */
library.add(faDatabase)

createApp(Home).use(router).component('font-awesome-icon', FontAwesomeIcon).mount('#app');
axios.defaults.baseURL = 'http://localhost:3000';
