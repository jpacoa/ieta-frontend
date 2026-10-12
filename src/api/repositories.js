import { apiPool } from '../services/api'

/**
 * Crea un repositorio de solo lectura para un recurso del CMS.
 * El repositorio devuelve el payload del servidor y conserva los errores HTTP
 * rechazados para que los composables o las vistas decidan cómo mostrarlos.
 *
 * @param {string} resourcePath Ruta relativa a VITE_API_URL.
 */
export function createReadRepository(resourcePath) {
  const path = resourcePath.replace(/\/$/, '')

  return Object.freeze({
    /** @returns {Promise<unknown>} */
    get() {
      return apiPool.get(path, { withCredentials: false }).then((response) => response.data)
    },

    /** @param {string | number} id */
    getById(id) {
      return apiPool
        .get(`${path}/${encodeURIComponent(String(id))}`, { withCredentials: false })
        .then((response) => response.data)
    },

    /** @param {Record<string, string | number | boolean>} [params] */
    list(params = {}) {
      return apiPool.get(path, { params, withCredentials: false }).then((response) => response.data)
    },

    /** @param {string} slug */
    getBySlug(slug) {
      const safeSlug = encodeURIComponent(slug)
      return apiPool
        .get(`${path}/${safeSlug}`, { withCredentials: false })
        .then((response) => response.data)
    },
  })
}

export const NoticiasRepository = createReadRepository('/noticias')
export const SobreNosotrosRepository = createReadRepository('/sobre-nosotros')
export const LineasInvestigacionRepository = createReadRepository('/lineas-investigacion')
export const ContactoRepository = createReadRepository('/contacto')
