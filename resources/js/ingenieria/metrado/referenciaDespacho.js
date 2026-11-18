// Generado por scripts/agente/aprender-metrados.mjs con 15 módulos de planillas del despacho.
// Relaciones que no dependen del tamaño del edificio (rango real del despacho) y el catálogo
// de partidas. Solo números y nombres genéricos de partidas: nada del proyecto ni del cliente.
// No editar a mano: volver a correr el script con más planillas.

export const REFERENCIA_DESPACHO = {
 "fuente": "15 módulos de planillas del despacho",
 "modulos": 15,
 "relaciones": {
  "plateaAcero": {
   "nombre": "Acero de losa de cimentación",
   "unidad": "kg/m³",
   "num": "02.03.01.02",
   "den": "02.03.01.01",
   "n": 9,
   "min": 35.98,
   "p10": 43.098,
   "mediana": 90.86,
   "p90": 109.796,
   "max": 152.78
  },
  "zapataAcero": {
   "nombre": "Acero de zapatas",
   "unidad": "kg/m³",
   "num": "02.03.02.02",
   "den": "02.03.02.01",
   "n": 5,
   "min": 46.799,
   "p10": 46.998,
   "mediana": 63.447,
   "p90": 145.726,
   "max": 181.886
  },
  "vigaCimentacionAcero": {
   "nombre": "Acero de vigas de cimentación",
   "unidad": "kg/m³",
   "num": "02.03.03.03",
   "den": "02.03.03.01",
   "n": 2,
   "min": 105.445,
   "p10": 106.047,
   "mediana": 108.452,
   "p90": 110.858,
   "max": 111.459
  },
  "placaAcero": {
   "nombre": "Acero de placas",
   "unidad": "kg/m³",
   "num": "02.03.05.01.03",
   "den": "02.03.05.01.01",
   "n": 10,
   "min": 89.572,
   "p10": 94.094,
   "mediana": 141.878,
   "p90": 162.59,
   "max": 232.847
  },
  "placaEncofrado": {
   "nombre": "Encofrado de placas",
   "unidad": "m²/m³",
   "num": "02.03.05.01.02",
   "den": "02.03.05.01.01",
   "n": 10,
   "min": 7.576,
   "p10": 7.576,
   "mediana": 8.077,
   "p90": 9.288,
   "max": 10
  },
  "columnaAcero": {
   "nombre": "Acero de columnas",
   "unidad": "kg/m³",
   "num": "02.03.06.01.03",
   "den": "02.03.06.01.01",
   "n": 15,
   "min": 87.58,
   "p10": 111.204,
   "mediana": 165.858,
   "p90": 184.898,
   "max": 191.046
  },
  "columnaEncofrado": {
   "nombre": "Encofrado de columnas",
   "unidad": "m²/m³",
   "num": "02.03.06.01.02",
   "den": "02.03.06.01.01",
   "n": 15,
   "min": 6.667,
   "p10": 6.743,
   "mediana": 8.205,
   "p90": 11.267,
   "max": 12.333
  },
  "vigaAcero": {
   "nombre": "Acero de vigas",
   "unidad": "kg/m³",
   "num": "02.03.07.01.03",
   "den": "02.03.07.01.01",
   "n": 15,
   "min": 92.804,
   "p10": 110.774,
   "mediana": 174.396,
   "p90": 230.472,
   "max": 780.115
  },
  "vigaEncofrado": {
   "nombre": "Encofrado de vigas",
   "unidad": "m²/m³",
   "num": "02.03.07.01.02",
   "den": "02.03.07.01.01",
   "n": 15,
   "min": 7.431,
   "p10": 7.677,
   "mediana": 9.546,
   "p90": 14.954,
   "max": 38.667
  },
  "columnetaAcero": {
   "nombre": "Acero de columnetas",
   "unidad": "kg/m³",
   "num": "02.03.08.03",
   "den": "02.03.08.01",
   "n": 12,
   "min": 92.824,
   "p10": 114.828,
   "mediana": 140.251,
   "p90": 164.414,
   "max": 173.214
  },
  "columnetaEncofrado": {
   "nombre": "Encofrado de columnetas",
   "unidad": "m²/m³",
   "num": "02.03.08.02",
   "den": "02.03.08.01",
   "n": 12,
   "min": 1,
   "p10": 15.153,
   "mediana": 18.011,
   "p90": 20.301,
   "max": 34.478
  },
  "vsaAcero": {
   "nombre": "Acero de viguetas de amarre",
   "unidad": "kg/m³",
   "num": "02.03.09.03",
   "den": "02.03.09.01",
   "n": 12,
   "min": 74.492,
   "p10": 101.044,
   "mediana": 131.386,
   "p90": 155.389,
   "max": 168.544
  },
  "vsaEncofrado": {
   "nombre": "Encofrado de viguetas de amarre",
   "unidad": "m²/m³",
   "num": "02.03.09.02",
   "den": "02.03.09.01",
   "n": 12,
   "min": 8.333,
   "p10": 11.679,
   "mediana": 15.385,
   "p90": 15.385,
   "max": 20.385
  },
  "canaletaAcero": {
   "nombre": "Acero de canaleta de techo",
   "unidad": "kg/m³",
   "num": "02.03.10.03",
   "den": "02.03.10.01",
   "n": 11,
   "min": 48.328,
   "p10": 55.96,
   "mediana": 99.107,
   "p90": 109.997,
   "max": 141.122
  },
  "losaFactor": {
   "nombre": "Concreto de losa aligerada por m²",
   "unidad": "m³/m²",
   "num": "02.03.11.01",
   "den": "02.03.11.02",
   "n": 12,
   "min": 0.087,
   "p10": 0.087,
   "mediana": 0.088,
   "p90": 0.088,
   "max": 0.088
  },
  "losaAcero": {
   "nombre": "Acero de losa aligerada por m²",
   "unidad": "kg/m²",
   "num": "02.03.11.03",
   "den": "02.03.11.02",
   "n": 12,
   "min": 4.57,
   "p10": 5.167,
   "mediana": 6.437,
   "p90": 8.025,
   "max": 9.588
  },
  "losaLadrillo": {
   "nombre": "Ladrillos de techo por m²",
   "unidad": "und/m²",
   "num": "02.03.11.04",
   "den": "02.03.11.02",
   "n": 12,
   "min": 8.399,
   "p10": 8.4,
   "mediana": 8.402,
   "p90": 8.429,
   "max": 8.468
  },
  "losaMacizaAcero": {
   "nombre": "Acero de losa maciza",
   "unidad": "kg/m³",
   "num": "02.03.12.03",
   "den": "02.03.12.01",
   "n": 5,
   "min": 95.16,
   "p10": 96.003,
   "mediana": 98.882,
   "p90": 131.734,
   "max": 145.068
  },
  "escaleraAcero": {
   "nombre": "Acero de escaleras",
   "unidad": "kg/m³",
   "num": "02.03.13.03",
   "den": "02.03.13.01",
   "n": 2,
   "min": 92.546,
   "p10": 92.546,
   "mediana": 92.546,
   "p90": 92.546,
   "max": 92.546
  },
  "cimientoEncofrado": {
   "nombre": "Encofrado de cimiento corrido",
   "unidad": "m²/m³",
   "num": "02.02.03.02",
   "den": "02.02.03.01",
   "n": 11,
   "min": 5,
   "p10": 5,
   "mediana": 5,
   "p90": 5,
   "max": 5
  }
 },
 "catalogo": {
  "02.01.02.01.01": {
   "descripcion": "EXCAVACION DE ZANJAS PARA ZAPATA C/MAQUINARIA",
   "und": "m3",
   "modulos": 5
  },
  "02.01.02.01.02": {
   "descripcion": "EXCAVACION DE ZANJAS PARA VIGA DE CIMENTACION C/MAQUINARIA",
   "und": "m3",
   "modulos": 2
  },
  "02.01.02.01.03": {
   "descripcion": "EXCAVACION PARA LOSA DE CIMENTACION C/MAQUINARIA",
   "und": "m3",
   "modulos": 10
  },
  "02.01.02.02.01": {
   "descripcion": "EXCAVACION DE ZANJAS PARA CIMIENTOS CORRIDOS",
   "und": "m3",
   "modulos": 1
  },
  "02.01.03.02": {
   "descripcion": "RELLENO CON MATERIAL PROPIO AFIRMADO Y COMPACTADO AL 95% M.D.S EN ZAPATAS",
   "und": "m3",
   "modulos": 6
  },
  "02.01.03.03": {
   "descripcion": "RELLENO CON MATERIAL PROPIO AFIRMADO Y COMPACTADO AL 95% M.D.S EN VIGA DE CIMENTACION",
   "und": "m3",
   "modulos": 2
  },
  "02.01.03.04": {
   "descripcion": "RELLENO CON MATERIAL PROPIO AFIRMADO Y COMPACTADO AL 95% M.D.S EN LOSA DE CIMENTACION",
   "und": "m3",
   "modulos": 9
  },
  "02.01.03.05": {
   "descripcion": "RELLENO CON MATERIAL PRESTAMO AFIRMADO Y COMPACTADO AL 95% M.D.S E=20cm PARA PISO INTERIOR",
   "und": "m3",
   "modulos": 14
  },
  "02.01.04.01": {
   "descripcion": "NIVELACION INTERIOR Y APISONADO",
   "und": "m2",
   "modulos": 15
  },
  "02.01.05.01": {
   "descripcion": "ACARREO DE MATERIAL EXCEDENTE CON EQUIPO D= 30 M",
   "und": "m3",
   "modulos": 15
  },
  "02.01.05.02": {
   "descripcion": "ELIMINACION DE MATERIAL EXCEDENTE CON EQUIPO D=4,65KM",
   "und": "m3",
   "modulos": 15
  },
  "02.02.01.01": {
   "descripcion": "CONCRETO EN SOLADOS DE ZAPATAS E=0.10m, F'C=100KG/CM2",
   "und": "m2",
   "modulos": 7
  },
  "02.02.01.02": {
   "descripcion": "CONCRETO EN SOLADOS DE LOSA DE CIMENTACION E=0.10m, F'C=100KG/CM2",
   "und": "m2",
   "modulos": 8
  },
  "02.02.02.01": {
   "descripcion": "FALSO PISO DE CONCRETO F'C=140KG/CM2; E=4\"",
   "und": "m2",
   "modulos": 13
  },
  "02.02.02.02": {
   "descripcion": "ENCOFRADO Y DESENCOFRADO EN FALSO PISO, E=0.10m, F'C = 140 KG/CM2",
   "und": "m2",
   "modulos": 13
  },
  "02.02.03.01": {
   "descripcion": "CONCRETO EN CIMIENTO CORRIDO, F'C =100KG/CM2 + 30%P.G.",
   "und": "m3",
   "modulos": 11
  },
  "02.02.03.02": {
   "descripcion": "ENCOFRADO Y DESENCOFRADO EN CIMIENTO CORRIDO",
   "und": "m2",
   "modulos": 11
  },
  "02.02.04.01": {
   "descripcion": "CONCRETO EN SOBRECIMIENTO, F'C=140KG/CM2 + 25% P.M.",
   "und": "m3",
   "modulos": 12
  },
  "02.02.04.02": {
   "descripcion": "ENCOFRADO Y DESENCOFRADO EN SOBRECIMIENTOS, F'C=140KG/CM2 + 25% P.M.",
   "und": "m2",
   "modulos": 12
  },
  "02.02.04.03": {
   "descripcion": "CURADO DEL CONCRETO EN SOBRECIMIENTO, F'C=140KG/CM2 + 25% P.M.",
   "und": "m2",
   "modulos": 12
  },
  "02.03.01.01": {
   "descripcion": "CONCRETO EN LOSA DE CIMENTACION F´C=210 KG/CM2",
   "und": "m3",
   "modulos": 9
  },
  "02.03.01.02": {
   "descripcion": "ACERO EN LOSA DE CIMENTACION F'C=210KG/CM2 CON F´Y=4200 KG/CM2",
   "und": "kg",
   "modulos": 9
  },
  "02.03.01.03": {
   "descripcion": "CURADO DEL CONCRETO EN LOSA DE CIMENTACION F'C=210KG/CM2",
   "und": "m2",
   "modulos": 9
  },
  "02.03.02.01": {
   "descripcion": "CONCRETO EN ZAPATAS F´C=210 KG/CM2",
   "und": "m3",
   "modulos": 5
  },
  "02.03.02.02": {
   "descripcion": "ACERO EN ZAPATAS F'C=210KG/CM2 CON F´Y=4200 KG/CM2",
   "und": "kg",
   "modulos": 5
  },
  "02.03.02.03": {
   "descripcion": "CURADO DEL CONCRETO EN ZAPATAS F'C=210KG/CM2",
   "und": "m2",
   "modulos": 5
  },
  "02.03.03.01": {
   "descripcion": "CONCRETO EN VIGAS DE CIMENTACION F´C=210 KG/CM2",
   "und": "m3",
   "modulos": 2
  },
  "02.03.03.02": {
   "descripcion": "ENCOFRADO Y DESENCOFRADO EN VIGAS DE CIMENTACION F'C = 210kg/cm2",
   "und": "m2",
   "modulos": 2
  },
  "02.03.03.03": {
   "descripcion": "ACERO EN VIGAS DE CIMENTACION F´C=210 KG/CM2 CON F´Y=4200 KG/CM2",
   "und": "kg",
   "modulos": 2
  },
  "02.03.03.04": {
   "descripcion": "CURADO DE CONCRETO EN VIGAS DE CIMENTACION F'C = 210kg/cm2",
   "und": "m2",
   "modulos": 2
  },
  "02.03.05.01.01": {
   "descripcion": "CONCRETO EN PLACAS F´C=210 KG/CM2",
   "und": "m3",
   "modulos": 10
  },
  "02.03.05.01.02": {
   "descripcion": "ENCOFRADO Y DESENCOFRADO EN PLACAS F´C=210 KG/CM2",
   "und": "m2",
   "modulos": 10
  },
  "02.03.05.01.03": {
   "descripcion": "ACERO EN PLACAS F´C=210 KG/CM2 CON F´Y=4200 KG/CM2",
   "und": "kg",
   "modulos": 10
  },
  "02.03.05.01.04": {
   "descripcion": "CURADO DEL CONCRETO EN PLACAS F'C = 210KG/CM2",
   "und": "m2",
   "modulos": 10
  },
  "02.03.06.01.01": {
   "descripcion": "CONCRETO EN COLUMNAS F´C=210 KG/CM2",
   "und": "m3",
   "modulos": 15
  },
  "02.03.06.01.02": {
   "descripcion": "ENCOFRADO Y DESENCOFRADO EN COLUMNAS F´C=210 KG/CM2",
   "und": "m2",
   "modulos": 15
  },
  "02.03.06.01.03": {
   "descripcion": "ACERO EN COLUMNAS F´C=210 KG/CM2 CON F´Y=4200 KG/CM2",
   "und": "kg",
   "modulos": 15
  },
  "02.03.06.01.04": {
   "descripcion": "CURADO DEL CONCRETO EN COLUMNAS F'C = 210KG/CM2",
   "und": "m2",
   "modulos": 15
  },
  "02.03.07.01.01": {
   "descripcion": "CONCRETO EN VIGAS F´C=210 KG/CM2",
   "und": "m3",
   "modulos": 15
  },
  "02.03.07.01.02": {
   "descripcion": "ENCOFRADO Y DESENCOFRADO EN VIGAS F'C = 210kg/cm2",
   "und": "m2",
   "modulos": 15
  },
  "02.03.07.01.03": {
   "descripcion": "ACERO EN VIGAS F´C=210 KG/CM2 CON F´Y=4200 KG/CM2",
   "und": "kg",
   "modulos": 15
  },
  "02.03.07.01.04": {
   "descripcion": "CURADO DE CONCRETO EN VIGAS F'C = 210kg/cm2",
   "und": "m2",
   "modulos": 14
  },
  "02.03.08.01": {
   "descripcion": "CONCRETO PARA COLUMNETAS DE AMARRE F'C=175 KG/CM2",
   "und": "m3",
   "modulos": 12
  },
  "02.03.08.02": {
   "descripcion": "ENCOFRADO Y DESENCOFRADO NORMAL EN COLUMNETAS",
   "und": "m2",
   "modulos": 12
  },
  "02.03.08.03": {
   "descripcion": "ACERO EN COLUMNETA Fy=4200 KG/CM2",
   "und": "kg",
   "modulos": 12
  },
  "02.03.08.04": {
   "descripcion": "CURADO EN COLUMNETAS",
   "und": "m2",
   "modulos": 12
  },
  "02.03.09.01": {
   "descripcion": "CONCRETO PARA VIGUETAS DE AMARRE F'C=175 KG/CM2",
   "und": "m3",
   "modulos": 12
  },
  "02.03.09.02": {
   "descripcion": "ENCOFRADO Y DESENCOFRADO EN VIGUETAS",
   "und": "m2",
   "modulos": 12
  },
  "02.03.09.03": {
   "descripcion": "ACERO EN VIGUETAS Fy=4200 KG/CM2",
   "und": "kg",
   "modulos": 12
  },
  "02.03.09.04": {
   "descripcion": "CURADO DEL CONCRETO EN VIGUETAS CONCRETO F'C=175 KG/CM2",
   "und": "m2",
   "modulos": 12
  },
  "02.03.10.01": {
   "descripcion": "CANALETA EN TECHO CONCRETO F'C = 210 KG/CM2",
   "und": "m3",
   "modulos": 11
  },
  "02.03.10.02": {
   "descripcion": "CANALETA EN TECHO ENCOFRADO Y DESENCOFRADO",
   "und": "m2",
   "modulos": 11
  },
  "02.03.10.03": {
   "descripcion": "ACERO PARA CANALETA EN TECHO F'Y = 4200 KG/CM2",
   "und": "kg",
   "modulos": 11
  },
  "02.03.10.04": {
   "descripcion": "CURADO DE CANALETA EN TECHO CONCRETO F'C = 210 KG/CM2",
   "und": "m2",
   "modulos": 11
  },
  "02.03.11.01": {
   "descripcion": "CONCRETO EN LOSAS ALIGERADAS F´C=210 KG/CM2",
   "und": "m3",
   "modulos": 12
  },
  "02.03.11.02": {
   "descripcion": "ENCOFRADO Y DESENCOFRADO EN LOSAS ALIGERADAS F´C=210 KG/CM2",
   "und": "m2",
   "modulos": 12
  },
  "02.03.11.03": {
   "descripcion": "ACERO EN LOSAS ALIGERADAS F´C=210 KG/CM2 CON F´Y=4200 KG/CM2",
   "und": "kg",
   "modulos": 12
  },
  "02.03.11.04": {
   "descripcion": "LADRILLO HUECO DE ARCILLA RAYADO DE 15X30X30 CM P/TECHO EN LOSA ALIGERADA F´C=210 KG/CM2",
   "und": "und",
   "modulos": 12
  },
  "02.03.11.05": {
   "descripcion": "CURADO DEL CONCRETO EN LOSA ALIGERADA F´C=210 KG/CM2",
   "und": "m2",
   "modulos": 12
  },
  "02.03.12.01": {
   "descripcion": "CONCRETO EN LOSA MACIZA F'C= 210KG/CM2",
   "und": "m3",
   "modulos": 5
  },
  "02.03.12.02": {
   "descripcion": "ENCOFRADO Y DESENCOFRADO EN LOSA MACIZA F'C= 210KG/CM2",
   "und": "m2",
   "modulos": 5
  },
  "02.03.12.03": {
   "descripcion": "ACERO EN LOSA MACIZA F'C= 210KG/CM2 CON F´Y=4200 KG/CM2",
   "und": "kg",
   "modulos": 5
  },
  "02.03.12.04": {
   "descripcion": "CURADO DEL CONCRETO EN LOSA MACIZA F'C= 210KG/CM2",
   "und": "m2",
   "modulos": 5
  },
  "02.03.13.01": {
   "descripcion": "CONCRETO PARA ESCALERAS F'C=210 KG/CM2",
   "und": "m3",
   "modulos": 2
  },
  "02.03.13.02": {
   "descripcion": "ENCOFRADO Y DESENCOFRADO EN ESCALERAS",
   "und": "m2",
   "modulos": 2
  },
  "02.03.13.03": {
   "descripcion": "ACERO DE REFUERZO FY=4200 KG/CM2, GRADO 60",
   "und": "kg",
   "modulos": 2
  },
  "02.03.13.04": {
   "descripcion": "CURADO DEL CONCRETO EN ESCALERAS F´C=210 KG/CM2",
   "und": "m2",
   "modulos": 2
  },
  "02.03.14.01": {
   "descripcion": "CONCRETO EN TRIBUNA F'C= 210KG/CM2",
   "und": "m3",
   "modulos": 1
  },
  "02.03.14.02": {
   "descripcion": "ENCOFRADO Y DESENCOFRADO EN TRIBUNA F'C= 210KG/CM2",
   "und": "m2",
   "modulos": 1
  },
  "02.03.14.03": {
   "descripcion": "ACERO EN TRIBUNA F'C= 210KG/CM2 CON F´Y=4200 KG/CM2",
   "und": "kg",
   "modulos": 1
  },
  "02.03.14.04": {
   "descripcion": "CURADO DEL CONCRETO EN TRIBUNA F'C= 210KG/CM2",
   "und": "m2",
   "modulos": 1
  },
  "02.03.15.01": {
   "descripcion": "CONCRETO EN RAMPAS F´C=210 KG/CM2",
   "und": "m3",
   "modulos": 1
  },
  "02.03.15.02": {
   "descripcion": "ENCOFRADO Y DESENCOFRADO EN RAMPAS",
   "und": "m2",
   "modulos": 1
  },
  "02.03.15.03": {
   "descripcion": "ACERO EN RAMPAS F'C= 210KG/CM2 CON F´Y=4200 KG/CM2",
   "und": "kg",
   "modulos": 1
  },
  "02.03.15.04": {
   "descripcion": "CURADO DEL CONCRETO EN RAMPAS",
   "und": "m2",
   "modulos": 1
  },
  "02.03.20.01": {
   "descripcion": "CONCRETO PARA TANQUE CISTERNA F'C=280 KG/CM2",
   "und": "m3",
   "modulos": 1
  },
  "02.03.20.02": {
   "descripcion": "ENCOFRADO Y DESENCOFRADO NORMAL EN TANQUE CISTERNA",
   "und": "m2",
   "modulos": 1
  },
  "02.03.20.03": {
   "descripcion": "ACERO DE REFUERZO FY=4200 KG/CM2, GRADO 60",
   "und": "kg",
   "modulos": 1
  },
  "02.03.20.04": {
   "descripcion": "CURADO DEL CONCRETO EN TANQUE CISTERNA F´C=280 KG/CM2",
   "und": "m2",
   "modulos": 1
  },
  "02.03.21.01": {
   "descripcion": "CONCRETO PARA TANQUE ELEVADO F'C=280 KG/CM2",
   "und": "m3",
   "modulos": 1
  },
  "02.03.21.02": {
   "descripcion": "ENCOFRADO Y DESENCOFRADO NORMAL EN TANQUE ELEVADO",
   "und": "m2",
   "modulos": 1
  },
  "02.03.21.03": {
   "descripcion": "ACERO DE REFUERZO FY=4200 KG/CM2, GRADO 60",
   "und": "kg",
   "modulos": 1
  },
  "02.03.21.04": {
   "descripcion": "CURADO DEL CONCRETO EN TANQUE ELEVADO F´C=280 KG/CM2",
   "und": "m2",
   "modulos": 1
  },
  "02.04.01.01": {
   "descripcion": "ARMADO DE CORREA METÁLICA TUBO ASTM A500 LAC y GALV CUADRADO DE F° 2\"X2\"X2.00mm",
   "und": "m",
   "modulos": 11
  },
  "02.04.01.02": {
   "descripcion": "MONTAJE DE CORREA METÁLICA TUBO ASTM A500 LAC y GALV CUADRADO DE F° 2\"X2\"X2.00mm",
   "und": "m",
   "modulos": 11
  },
  "02.04.02.01": {
   "descripcion": "SUMINISTRO Y COLOCACIÓN DECOBERTURA AUTOSOPORTANTE DE AZUCINC E= 1,2MM",
   "und": "m2",
   "modulos": 3
  },
  "02.04.02.02": {
   "descripcion": "SUMINISTRO Y COLOCACIÓN COBERTURA PLANCHA DE ALUZINC TIPO TR4 E= 0,5MM",
   "und": "m2",
   "modulos": 11
  },
  "02.04.02.03": {
   "descripcion": "SUMINISTRO Y COLOCACIÓN CUMBRERA DENTADA DE ALUZINC ANCHO E= 0,5MM",
   "und": "m",
   "modulos": 11
  },
  "02.04.03.01": {
   "descripcion": "CANALETA DE CONCRETO CON IMPERMEABILIZANTE INCLINACIÓN DE 0.5%",
   "und": "m",
   "modulos": 3
  },
  "02.04.04.01": {
   "descripcion": "BASES METÁLICAS Y ANCLAJES",
   "und": "und",
   "modulos": 3
  },
  "02.05.01.03": {
   "descripcion": "JUNTA DE TECNOPOR E=1\" C/SELLADO",
   "und": "m",
   "modulos": 13
  }
 }
};
