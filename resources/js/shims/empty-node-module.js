// Stub vacío para el builtin "module" de Node.
//
// @mlightcad/libredwg-web (conversor DWG→DXF que carga el módulo CAD bajo
// demanda) trae dentro el glue de emscripten con una rama SOLO-Node:
//   if (ENVIRONMENT_IS_NODE) { const { createRequire } = await import("module"); ... }
// En el navegador ENVIRONMENT_IS_NODE es false y esa rama NUNCA se ejecuta,
// pero el análisis de imports de Vite intenta resolver el especificador
// "module" (builtin de Node, inexistente en browser) y falla. Con un alias
// "module" -> este stub, Vite resuelve a un módulo válido y vacío; como la
// rama jamás corre, su contenido nunca se usa. createRequire se exporta solo
// por completitud (por si algún día se referencia sin ejecutarse).
export function createRequire() {
  return () => {
    throw new Error('node "module".createRequire no está disponible en el navegador');
  };
}

export default {};
