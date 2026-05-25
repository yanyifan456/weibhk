import menu from "./menu"
const route = [
    {
        path: '/',
        redirect: '/manage',
        component: () => import('@/views/layout/layout.vue'),
        children: [...menu]
    },

]
export default route