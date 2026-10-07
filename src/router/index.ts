import { createRouter, createWebHistory } from 'vue-router'
import PublicLayout from '@/layouts/PublicLayout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) return savedPosition
    return { top: 0, behavior: 'smooth' }
  },
  routes: [
    {
      path: '/',
      component: PublicLayout,
      children: [
        // ── Inicio ─────────────────────────────────────────────
        {
          path: '',
          name: 'home',
          component: () => import('@/views/HomeView.vue'),
          meta: { title: 'Inicio' },
        },

        // ── Acerca de ───────────────────────────────────────────
        {
          path: 'acerca-de/:tab?',
          name: 'acerca-de',
          component: () => import('@/views/AcercaDeView.vue'),
          meta: { title: 'Acerca de' },
        },
        {
          path: 'acerca-de/personal/:slug',
          name: 'personal-ficha',
          component: () => import('@/views/PersonalFichaView.vue'),
          meta: { title: 'Personal' },
        },

        // ── Investigación ───────────────────────────────────────
        {
          path: 'investigacion/lineas',
          name: 'investigacion-lineas',
          component: () => import('@/views/InvestigacionLineasView.vue'),
          meta: { title: 'Líneas de Investigación' },
        },
        {
          path: 'investigacion/lineas/:slug',
          name: 'investigacion-linea-detalle',
          component: () => import('@/views/InvestigacionLineaDetalleView.vue'),
          meta: { title: 'Detalle de Línea' },
        },
        {
          path: 'investigacion/memorias',
          name: 'investigacion-memorias',
          component: () => import('@/views/InvestigacionMemoriasView.vue'),
          meta: { title: 'Memorias de Investigación' },
        },

        // ── Revista Varianza ────────────────────────────────────
        {
          path: 'revista-varianza/:tab?',
          name: 'revista-varianza',
          component: () => import('@/views/RevistaVarianzaView.vue'),
          meta: { title: 'Revista Varianza' },
        },
        {
          path: 'revista-varianza/autores/:slug',
          name: 'autor-perfil',
          component: () => import('@/views/AutorPerfilView.vue'),
          meta: { title: 'Perfil de Autor' },
        },
        {
          path: 'revista-varianza/ediciones/:numero',
          name: 'edicion-detalle',
          component: () => import('@/views/EdicionDetalleView.vue'),
          meta: { title: 'Edición' },
        },
        {
          path: 'revista-varianza/articulos/:slug',
          name: 'articulo-detalle',
          component: () => import('@/views/ArticuloDetalleView.vue'),
          meta: { title: 'Artículo' },
        },

        // ── Servicios ───────────────────────────────────────────
        {
          path: 'servicios',
          name: 'servicios',
          component: () => import('@/views/ServiciosView.vue'),
          meta: { title: 'Servicios' },
        },
        {
          path: 'servicios/:slug',
          name: 'servicio-detalle',
          component: () => import('@/views/ServicioDetalleView.vue'),
          meta: { title: 'Servicio' },
        },

        // ── Noticias ────────────────────────────────────────────
        {
          path: 'noticias',
          name: 'noticias',
          component: () => import('@/views/NoticiasView.vue'),
          meta: { title: 'Noticias' },
        },
        {
          path: 'noticias/:slug',
          name: 'noticia-detalle',
          component: () => import('@/views/NoticiaDetalleView.vue'),
          meta: { title: 'Noticia' },
        },

        // ── Cursos y Talleres ───────────────────────────────────
        // Acceso: Inicio → tarjeta de curso → detalle
        // No está en el menú principal (pendiente de validación)
        {
          path: 'cursos-talleres/:slug',
          name: 'curso-detalle',
          component: () => import('@/views/CursoDetalleView.vue'),
          meta: { title: 'Cursos y Talleres' },
        },

        // ── Recursos ────────────────────────────────────────────
        {
          path: 'recursos/:tab?',
          name: 'recursos',
          component: () => import('@/views/RecursosView.vue'),
          meta: { title: 'Recursos' },
        },

        // ── Contacto ────────────────────────────────────────────
        {
          path: 'contacto',
          name: 'contacto',
          component: () => import('@/views/ContactoView.vue'),
          meta: { title: 'Contacto' },
        },
      ],
    },

    // ── 404 ─────────────────────────────────────────────────────
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue'),
      meta: { title: 'Página no encontrada' },
    },
  ],
})

// Actualizar el <title> del documento en cada navegación
router.afterEach((to) => {
  const title = to.meta?.title as string | undefined
  document.title = title ? `${title} | IETA` : 'IETA'
})

export default router
