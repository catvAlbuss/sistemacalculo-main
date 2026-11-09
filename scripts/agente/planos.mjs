// Planos de entrenamiento del agente (expedientes de clientes). Viven fuera de git
// y de public/: storage/app/private/entrenamiento/, o la carpeta de AGENTE_PLANOS.
//
//   entrenamiento/estructuras/<expediente> arquitectura.dwg | estructuras.dwg
//   entrenamiento/casas3d/*.dwg
//
// Las pruebas que necesitan un plano se saltan si no está en esta máquina.

import {resolve, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

export const PLANOS = process.env.AGENTE_PLANOS
  ? resolve(process.env.AGENTE_PLANOS)
  : resolve(raiz, 'storage/app/private/entrenamiento');

export const plano = (...partes) => resolve(PLANOS, ...partes);
