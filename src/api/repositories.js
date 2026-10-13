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
export const CursosRepository = createReadRepository('/cursos')
export const ServiciosRepository = createReadRepository('/servicios')
export const AutoresRepository = createReadRepository('/autores')
export const ArticulosRepository = createReadRepository('/articulos')
export const PersonalRepository = createReadRepository('/personal')
export const BancoDatosRepository = createReadRepository('/banco-datos')
export const AreasTematicasRepository = createReadRepository('/area-tematicas')
export const MemoriasInvestigacionRepository = createReadRepository('/memorias-investigacion')
export const ComiteEditorialRepository = createReadRepository('/comite-editorial')
export const CargosInstitucionalesRepository = createReadRepository('/cargos-institucionales')
export const EspecialidadesRepository = createReadRepository('/especialidades')
export const GradosAcademicosRepository = createReadRepository('/grado-academicos')
export const InstitucionesRepository = createReadRepository('/instituciones')
export const CursoModalidadesRepository = createReadRepository('/curso-modalidades')
export const TipoAutoresRepository = createReadRepository('/tipo-autores')
export const TipoCursosRepository = createReadRepository('/tipo-cursos')
export const TipoParticipacionesRepository = createReadRepository('/tipo-participaciones')
export const RevistaVarianzaRepository = createReadRepository('/revista-varianza')
export const EtiquetasArtRepository = createReadRepository('/etiquetas-art')
export const InstruccionesAutoresRepository = createReadRepository('/instrucciones-autores')
export const EdicionesVarianzaRepository = Object.freeze({
  ...createReadRepository('/ediciones-varianza'),
  getLatest() {
    return apiPool.get('/ediciones-varianza/', { withCredentials: false }).then((response) => response.data)
  },
})
export const ComunicadosRepository = Object.freeze({
  ...createReadRepository('/comunicados'),
  getActive() {
    return apiPool.get('/comunicados/activo', { withCredentials: false }).then((response) => response.data)
  },
})
export const ConfiguracionRepository = createReadRepository('/configuracion')
