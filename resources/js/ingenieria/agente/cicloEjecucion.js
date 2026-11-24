import {firmaDeGeneracion} from './contratoDibujo.js';

export const REVISION_TRAS_ACCION = {plano_estructuras: 'revisar_laminas', metrar_estructura: 'ver_metrado'};
const ESCRITURAS = new Set(['plano_estructuras', 'metrar_estructura', 'corregir_estructura', 'datos_proyecto', 'quitar_laminas']);

// El límite de rondas por sí solo no impide volver a dibujar lo mismo ocho veces.
export function controlDeEscrituras() {
  const hechas = new Set();
  let revision = 0;
  return {
    permitir(nombre, args) {
      if (!ESCRITURAS.has(nombre) || (nombre === 'datos_proyecto' && !Object.keys(args).length)) return true;
      const clave = firmaDeGeneracion({nombre, args, revision: REVISION_TRAS_ACCION[nombre] ? revision : 0});
      if (hechas.has(clave)) return false;
      hechas.add(clave);
      return true;
    },
    registrar(nombre, resultado) {
      if (['corregir_estructura', 'datos_proyecto'].includes(nombre) && resultado?.ok && !resultado.sinCambios && !resultado.omitida) revision++;
    },
  };
}
