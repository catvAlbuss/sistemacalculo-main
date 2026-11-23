import { execSync } from 'node:child_process';
import { readdirSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const modulos = [
  ['2.VINCHOS MODULO 2 - ESTRUCTURAS.dwg', 'modulo-02'],
  ['3.VINCHOS MODULO 3 - ESTRUCTURAS.dwg', 'modulo-03'],
  ['4.VINCHOS MODULO 4 - ESTRUCTURAS.dwg', 'modulo-04'],
  ['5.VINCHOS MODULO 5 -  ESTRUCTURAS.dwg', 'modulo-05'],
  ['6.VINCHOS MODULO 6 - ESTRUCTURAS.dwg', 'modulo-06'],
  ['7.VINCHOS MODULO 7.- ESTRUCTURAS.dwg', 'modulo-07'],
  ['8.VINCHOS MODULO 8 - ESTRUCTURAS.dwg', 'modulo-08'],
  ['9.VINCHOS MODULO 9 -ESTRUCTURAS.dwg', 'modulo-09'],
  ['10.VINCHOS MODULO 10 - ESTRUCTURAS.dwg', 'modulo-10'],
  ['11.VINCHOS MODULO 11 - ESTRUCTURAS.dwg', 'modulo-11'],
  ['12.VINCHOS MODULO 12 - ESTRUCTURAS.dwg', 'modulo-12'],
  ['13.VINCHOS MODULO 13 - ESTRUCTURAS.dwg', 'modulo-13'],
  ['14.VINCHOS MODULO 14 - ESTRUCTURAS.dwg', 'modulo-14'],
  ['15.VINCHOS MODULO 15 - ESTRUCTURAS.dwg', 'modulo-15'],
];

for (const [archivo, nombre] of modulos) {
  const ruta = `storage/app/private/entrenamiento/estructuras/${archivo}`;
  if (!existsSync(ruta)) {
    console.error(`No existe: ${ruta}`);
    continue;
  }
  console.log(`\n=== Procesando ${nombre} ===`);
  try {
    const cmd = `node scripts/agente/aprender-expediente.mjs "${ruta}" "${nombre}"`;
    const out = execSync(cmd, { encoding: 'utf8', stdio: 'pipe' });
    console.log(out.trim());
  } catch (err) {
    console.error(`Error en ${nombre}:`, err.stdout || err.message);
  }
}
console.log('\nFinalizado aprendizaje de todos los expedientes.');
