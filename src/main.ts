import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

import './style.css'
import 'vant/lib/index.css'
import './utils/flexible'

// 引入 Vant 组件库
import { 
  Button, 
  Field, 
  Checkbox, 
  CheckboxGroup, 
  Tabs, 
  Tab, 
  Empty, 
  Dialog,
  Search,
  Popup,
  Cell,
  CellGroup,
  Radio,
  RadioGroup
} from 'vant'

const app = createApp(App)

app.use(createPinia())
app.use(router)

// 注册 Vant 组件
app.use(Button)
app.use(Field)
app.use(Checkbox)
app.use(CheckboxGroup)
app.use(Tabs)
app.use(Tab)
app.use(Empty)
app.use(Dialog)
app.use(Search)
app.use(Popup)
app.use(Cell)
app.use(CellGroup)
app.use(Radio)
app.use(RadioGroup)

app.mount('#app')