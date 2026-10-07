<script setup lang="ts">
// AppFooter placeholder — Fase 3
// Implementación real: Fase 4
</script>

<template>
  <footer class="app-footer">
    <div class="container footer-inner">
      <div class="footer-brand">
        <span class="footer-brand__name">IETA</span>
        <p class="footer-brand__desc">
          Instituto de Estadística Teórica y Aplicada<br />
          Universidad Mayor de San Andrés
        </p>
      </div>

      <nav class="footer-nav" aria-label="Navegación del pie de página">
        <div class="footer-nav__col">
          <h3 class="footer-nav__title">Institución</h3>
          <a href="/acerca-de">Acerca de</a>
          <a href="/contacto">Contacto</a>
        </div>
        <div class="footer-nav__col">
          <h3 class="footer-nav__title">Contenido</h3>
          <a href="/noticias">Noticias</a>
          <a href="/servicios">Servicios</a>
          <a href="/recursos">Recursos</a>
        </div>
        <div class="footer-nav__col">
          <h3 class="footer-nav__title">Investigación</h3>
          <a href="/investigacion/lineas">Líneas de Investigación</a>
          <a href="/investigacion/memorias">Memorias</a>
          <a href="/revista-varianza">Revista Varianza</a>
        </div>
      </nav>
    </div>

    <div class="footer-bottom">
      <div class="container">
        <p>© {{ new Date().getFullYear() }} IETA — Instituto de Estadística Teórica y Aplicada. Todos los derechos reservados.</p>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.app-footer {
  background: var(--color-tinta);
  color: var(--color-blanco);
  margin-top: auto;
}

.footer-inner {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: var(--space-8);
  padding-top: var(--space-8);
  padding-bottom: var(--space-8);
}

.footer-brand__name {
  font-size: 2rem;
  font-weight: 700;
  display: block;
  margin-bottom: var(--space-1);
}
.footer-brand__desc {
  font-size: var(--text-small-size);
  opacity: 0.7;
  line-height: 1.6;
}

.footer-nav {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-4);
}
.footer-nav__col {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}
.footer-nav__title {
  font-size: var(--text-small-size);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  opacity: 0.5;
  margin-bottom: var(--space-1);
}
.footer-nav__col a {
  color: rgba(255, 255, 255, 0.75);
  text-decoration: none;
  font-size: var(--text-small-size);
  transition: color 0.15s ease;
}
.footer-nav__col a:hover {
  color: var(--color-blanco);
}

.footer-bottom {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-block: var(--space-2);
}
.footer-bottom p {
  font-size: var(--text-small-size);
  opacity: 0.5;
  text-align: center;
}

@media (max-width: 768px) {
  .footer-inner {
    grid-template-columns: 1fr;
    gap: var(--space-4);
  }
  .footer-nav {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
