export interface ReadRepository {
  /** Reads a public endpoint without sending cookies. */
  get(): Promise<unknown>
  getById(id: string | number): Promise<unknown>
  list(params?: Record<string, string | number | boolean>): Promise<unknown>
  getBySlug(slug: string): Promise<unknown>
}

export declare function createReadRepository(resourcePath: string): ReadRepository

export declare const NoticiasRepository: ReadRepository
export declare const SobreNosotrosRepository: ReadRepository
export declare const LineasInvestigacionRepository: ReadRepository
export declare const ContactoRepository: ReadRepository
