/**
 * Chequeo de la tabla de Pier Forces.
 *
 *   node resources/js/cad/lib/pierForcesTable.check.mjs
 *
 * POR QUÉ EXISTE: acá todo lo que puede salir mal es numérico y silencioso —
 * unidades sin convertir, el signo de P al revés, o un caso espectral suelto
 * colándose entre los combos. Nada de eso se ve en la tabla; se ve en el D/C.
 */

import { COLUMNAS, filasDePier, piersDe, pisosDe, filtrar, aDemandas, aTexto, numerarEstiloEtabs }
  from "./pierForcesTable.js";

const TONF = 9806.65;
let fallos = 0;
const ok = (cond, titulo, detalle = "") => {
  console.log(`${cond ? "  OK  " : "  FALLA"} ${titulo}${detalle ? "  — " + detalle : ""}`);
  if (!cond) fallos++;
};

const crudas = [
  { pier: "P1", story: "Story1", location: "Bottom", case: "CM", caseType: "LinStatic",
    length: 2.2, P: -22.9632 * TONF, V2: 1.1197 * TONF, V3: -0.1436 * TONF,
    T: -0.2217 * TONF, M2: -0.3082 * TONF, M3: 1.2006 * TONF },
  { pier: "P1", story: "Story1", location: "Top", case: "SDX", caseType: "LinRespSpec",
    length: 2.2, P: 3.8042 * TONF, V2: 9.881 * TONF, V3: 2.8433 * TONF,
    T: 2.4267 * TONF, M2: 4.1026 * TONF, M3: 7.7872 * TONF },
  { pier: "P1", story: "Story2", location: "Bottom", case: "02 1.25(CM+CV)+SDX",
    caseType: "Combination", stepType: "Max", length: 2.2, P: -11.4 * TONF, V2: 6.47 * TONF, V3: 1.88 * TONF,
    T: 1.59 * TONF, M2: 4.83 * TONF, M3: 13.70 * TONF },
  { pier: "P3", story: "Story1", location: "Bottom", case: "CM", caseType: "LinStatic",
    length: 1.85, P: -18.068 * TONF, V2: 0.3203 * TONF, V3: -0.1742 * TONF,
    T: -0.1111 * TONF, M2: -0.1712 * TONF, M3: -0.2452 * TONF },
];

const filas = filasDePier(crudas);

// ── Unidades ──────────────────────────────────────────────────────────────
ok(Math.abs(filas[0].P - -22.9632) < 1e-9, "N → tonf", `P = ${filas[0].P}`);
ok(Math.abs(filas[0].M3 - 1.2006) < 1e-9, "N·m → tonf·m", `M3 = ${filas[0].M3}`);
ok(COLUMNAS.join(",") === "P,V2,V3,T,M2,M3", "las columnas van en el orden de ETABS");

// ── Agrupación ────────────────────────────────────────────────────────────
ok(piersDe(filas).join(",") === "P1,P3", "lista los piers sin repetir");
ok(pisosDe(filas, "P1").join(",") === "Story2,Story1", "los pisos van de arriba a abajo");
ok(pisosDe(filas, "P3").join(",") === "Story1", "los pisos se filtran por pier");

// ── Filtros ───────────────────────────────────────────────────────────────
ok(filtrar(filas, { pier: "P1" }).length === 3, "filtra por pier");
ok(filtrar(filas, { location: "Bottom" }).length === 3, "filtra por ubicación");
ok(filtrar(filas, { pier: "P1", story: "Story1", location: "Bottom" }).length === 1,
   "los tres filtros juntos dejan una fila");

// El caso espectral SUELTO no puede colarse entre los combos: sin gravedad ni
// factores, puede salir gobernante sin significar nada.
const combos = filtrar(filas, { soloCombos: true });
ok(combos.length === 1 && combos[0].caseType === "Combination",
   "soloCombos deja fuera los casos sueltos", `quedaron ${combos.length}`);
ok(!combos.some((f) => f.case === "SDX"), "SDX suelto NO entra como demanda");

// ── Demandas ──────────────────────────────────────────────────────────────
const d = aDemandas([filas[0]])[0];
ok(d.P === 22.9632, "P se invierte (el motor da tracción positiva)", `P = ${d.P}`);
ok(d.M2 === -0.3082 && d.M3 === 1.2006, "M2 y M3 pasan tal cual");
ok(d.nombre.includes("Story1") && d.nombre.includes("CM") && d.nombre.includes("Bottom"),
   "el nombre identifica piso, caso y ubicación", d.nombre);

// ── Texto ─────────────────────────────────────────────────────────────────
const texto = aTexto([filas[0]]);
ok(texto.split("\t").length === 10, "el texto lleva las 6 componentes más los rótulos", texto);
ok(texto.includes("-22.9632"), "el texto conserva el signo del motor");

// ── Max / Min ─────────────────────────────────────────────────────────────
// ETABS abre cada combo ± en dos filas, Max y Min, y las repite para +SDX y
// −SDX aunque den lo mismo (el espectro no tiene signo). La tabla tiene que
// poder cruzarse fila por fila con la suya, así que el paso viaja como dato.
ok(filas[2].stepType === "Max", "el Max/Min viaja desde el motor", filas[2].stepType);
ok(filas[0].stepType === "", "un caso sin sismo no tiene paso");
ok(aTexto([filas[2]]).split("	").length === 11, "un combo suma la columna Max/Min");
ok(aDemandas([filas[2]])[0].nombre.includes("Max"),
   "el nombre de la demanda distingue Max de Min", aDemandas([filas[2]])[0].nombre);

// ── Numeración estilo ETABS ───────────────────────────────────────────────
// Cada Response Spectrum Case se corre en su propio request, así que el motor
// solo ve los combos de SU caso: numerando allá salían dos "02" y ningún "06".
const mk = (base, sismo, signo, rank, paso) => ({
  pier: "P1", story: "Story1", location: "Bottom",
  case: base + signo + sismo, caseType: "Combination", stepType: paso,
  comboRank: rank, comboCase: sismo, comboSign: signo, length: 2.2,
  P: 0, V2: 0, V3: 0, T: 0, M2: 0, M3: 0,
});
const mezcla = [{ pier: "P1", story: "Story1", location: "Bottom", case: "1.4CM+1.7CV",
                  caseType: "Combination", comboRank: 0, comboCase: "", comboSign: "",
                  length: 2.2, P: 0, V2: 0, V3: 0, T: 0, M2: 0, M3: 0 }];
for (const sismo of ["SDX", "SDY"])
  for (const [rank, base] of [[1, "1.25(CM+CV)"], [2, "0.9CM"]])
    for (const signo of ["+", "-"])
      for (const paso of ["Max", "Min"]) mezcla.push(mk(base, sismo, signo, rank, paso));

const num = numerarEstiloEtabs(filasDePier(mezcla));
const nombres = [...new Set(num.map((f) => f.case))];
ok(num.length === 17, "salen las 17 filas (1 de gravedad + 8 combos x Max/Min)", `${num.length}`);
ok(nombres.length === 9, "y 9 combinaciones distintas, como ETABS", `${nombres.length}`);
ok(nombres[0] === "01 1.4CM+1.7CV", "01 es el de gravedad", nombres[0]);
ok(nombres[1] === "02 1.25(CM+CV)+SDX" && nombres[4] === "05 1.25(CM+CV)-SDY",
   "los 1.25(CM+CV) van 02-05");
ok(nombres[5] === "06 0.9CM+SDX" && nombres[8] === "09 0.9CM-SDY",
   "los 0.9CM van 06-09", nombres.slice(5).join(" · "));
ok(num.filter((f) => f.stepType === "Max").length === 8
   && num.filter((f) => f.stepType === "Min").length === 8,
   "hay tantos Max como Min");
// La trampa que se comio los Max: deduplicar sin el paso deja una sola fila.
const claves = new Set(num.map((f) => `${f.pier}|${f.story}|${f.location}|${f.case}|${f.stepType}`));
ok(claves.size === 17, "la clave con el PASO no colapsa Max con Min", `${claves.size}`);

// ── Bordes ────────────────────────────────────────────────────────────────
ok(filasDePier(null).length === 0, "sin resultados no rompe");
ok(filasDePier([{ pier: "PX" }])[0].P === 0, "una fila incompleta queda en cero, no en NaN");
ok(pisosDe(filasDePier([{ pier: "PX", location: "Bottom" }])).join("") === "",
   "sin nombre de piso queda una sola entrada vacía");

console.log(fallos ? `\n${fallos} chequeo(s) fallaron` : "\nTodo OK");
process.exit(fallos ? 1 : 0);
