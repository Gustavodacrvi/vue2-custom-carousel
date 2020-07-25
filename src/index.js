
import Carousel from "./Carousel.vue"

function install(Vue) {
  if (install.installed) return;
  install.installed = true
  Vue.component("v-custom-carousel", Carousel)
}

const plugin = {
  install
}

let GlobalVue = null
if (typeof window !== "undefined") {
  GlobalVue = window.Vue
} else if (typeof global !== "undefined") {
  GlobalVue = global.vue
}
if (GlobalVue) {
  GlobalVue.use(plugin)
}

Carousel.install = install

export default Carousel
