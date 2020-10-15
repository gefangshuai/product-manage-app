import Vue from 'vue'
import axios from 'axios'
import db from './utils/datastore'
import App from './App'
import router from './router'
import store from './store'

import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/antd.css'
import '@gefangshuai/frontend-utils/less/index.less'


if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false
Vue.prototype.$db = db
Vue.use(Antd);
//
// db.loadDatabase(function (err) {    // Callback is optional
//     // Now commands will be executed
// });

/* eslint-disable no-new */
new Vue({
    components: {App},
    router,
    store,
    template: '<App/>'
}).$mount('#app')
