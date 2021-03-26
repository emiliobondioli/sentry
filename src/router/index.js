import { createRouter, createWebHashHistory } from 'vue-router'
import Farms from '../views/Farms.vue'

const routes = [
  {
    path: '/',
    name: 'Farms',
    component: Farms
  },
  {
    path: '/prices',
    name: 'Prices',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/Prices.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
