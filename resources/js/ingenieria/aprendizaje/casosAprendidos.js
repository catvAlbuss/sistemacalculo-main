// Generado por scripts/agente/aprender-pares.mjs: no editar a mano.
// Casos aprendidos de los pares arquitectura + estructuras (ver casos.js). Sin datos personales.
export const CASOS = [
 {
  "nombre": "vinchos:modulo-01",
  "grupo": "vinchos",
  "id": "modulo-01",
  "etiqueta": null,
  "rasgos": {
   "vista": "vista-01",
   "areaAbierta": false,
   "niveles": 3,
   "ejes": {
    "x": 2,
    "y": 6
   },
   "luces": {
    "x": [
     7.43
    ],
    "y": [
     4.26,
     3.81,
     4.18,
     4.08,
     4.69
    ]
   },
   "largo": 21.01,
   "ancho": 7.43,
   "area": 156.04,
   "luzLosa": 4.69,
   "luzMax": 7.43,
   "columnas": 12,
   "tipos": [
    {
     "nombre": "CT1",
     "forma": "T",
     "b": 1,
     "h": 0.6,
     "n": 6
    },
    {
     "nombre": "PL1",
     "forma": "L",
     "b": 1.5,
     "h": 1,
     "n": 2
    },
    {
     "nombre": "C1",
     "forma": "L",
     "b": 1,
     "h": 0.6,
     "n": 1
    },
    {
     "nombre": "C2",
     "forma": "L",
     "b": 1.07,
     "h": 0.6,
     "n": 1
    },
    {
     "nombre": "PL2",
     "forma": "T",
     "b": 1.5,
     "h": 0.5,
     "n": 1
    },
    {
     "nombre": "PL3",
     "forma": "L",
     "b": 1.5,
     "h": 0.5,
     "n": 1
    }
   ],
   "placas": true,
   "columnetas": 40,
   "techoLiviano": true,
   "cubierta": true,
   "falsoCielo": true,
   "deportivo": false,
   "agua": false,
   "banos": true
  },
  "decisiones": {
   "cimentacion": "platea",
   "cimientoCorrido": true,
   "hz": 0.7,
   "df": 2,
   "losa": "aligerada y maciza",
   "espesorLosa": 0.2,
   "plantasDeLosa": 3,
   "vigas": [],
   "fcColumnas": 210,
   "fcColumnetas": 175,
   "estribos": "3/8\": 1@.05, 10@.10",
   "porticos": 7,
   "mallaCimentacion": false,
   "columnasComoArquitectura": true,
   "losaDeTecho": true
  },
  "geometria": {
   "version": 1,
   "unidad": "m",
   "vistas": [
    {
     "id": "vista-01",
     "nivel": null,
     "categorias": {
      "ejes": [
       {
        "nombre": "J",
        "p": {
         "x": 0,
         "y": 13.19
        },
        "q": {
         "x": 9.4,
         "y": 13.19
        }
       },
       {
        "nombre": "M",
        "p": {
         "x": 0,
         "y": 9.01
        },
        "q": {
         "x": 9.49,
         "y": 9.01
        }
       },
       {
        "nombre": "O´",
        "p": {
         "x": 0,
         "y": 5.2
        },
        "q": {
         "x": 9.49,
         "y": 5.2
        }
       },
       {
        "nombre": "G´",
        "p": {
         "x": 0,
         "y": 17.28
        },
        "q": {
         "x": 9.49,
         "y": 17.28
        }
       },
       {
        "nombre": "U",
        "p": {
         "x": 0,
         "y": 0.96
        },
        "q": {
         "x": 9.49,
         "y": 0.96
        }
       },
       {
        "nombre": "E",
        "p": {
         "x": 0,
         "y": 21.97
        },
        "q": {
         "x": 9.49,
         "y": 21.97
        }
       },
       {
        "nombre": "3",
        "p": {
         "x": 1.04,
         "y": 22.93
        },
        "q": {
         "x": 1.04,
         "y": 0
        }
       },
       {
        "nombre": "6",
        "p": {
         "x": 8.47,
         "y": 22.93
        },
        "q": {
         "x": 8.46,
         "y": 0
        }
       }
      ],
      "columnas": [
       {
        "eje": "3/U",
        "centro": {
         "x": 1.04,
         "y": 0.96
        },
        "b": 1.5,
        "h": 0.5,
        "forma": "L"
       },
       {
        "eje": "6/U",
        "centro": {
         "x": 8.46,
         "y": 0.96
        },
        "b": 1.5,
        "h": 0.5,
        "forma": "L"
       },
       {
        "eje": "3/O´",
        "centro": {
         "x": 1.04,
         "y": 5.2
        },
        "b": 0.6,
        "h": 1,
        "forma": "L"
       },
       {
        "eje": "6/O´",
        "centro": {
         "x": 8.46,
         "y": 5.2
        },
        "b": 0.6,
        "h": 1,
        "forma": "L"
       },
       {
        "eje": "3/M",
        "centro": {
         "x": 1.04,
         "y": 9.01
        },
        "b": 0.6,
        "h": 1,
        "forma": "T"
       },
       {
        "eje": "6/M",
        "centro": {
         "x": 8.46,
         "y": 9.01
        },
        "b": 0.6,
        "h": 1,
        "forma": "T"
       },
       {
        "eje": "3/J",
        "centro": {
         "x": 1.04,
         "y": 13.19
        },
        "b": 0.6,
        "h": 1,
        "forma": "T"
       },
       {
        "eje": "6/J",
        "centro": {
         "x": 8.47,
         "y": 13.19
        },
        "b": 0.6,
        "h": 1,
        "forma": "T"
       },
       {
        "eje": "3/G´",
        "centro": {
         "x": 1.04,
         "y": 17.28
        },
        "b": 0.6,
        "h": 1,
        "forma": "T"
       },
       {
        "eje": "6/G´",
        "centro": {
         "x": 8.47,
         "y": 17.28
        },
        "b": 0.6,
        "h": 1,
        "forma": "T"
       },
       {
        "eje": "3/E",
        "centro": {
         "x": 1.04,
         "y": 21.97
        },
        "b": 1.5,
        "h": 1,
        "forma": "L"
       },
       {
        "eje": "6/E",
        "centro": {
         "x": 8.47,
         "y": 21.97
        },
        "b": 1.5,
        "h": 1,
        "forma": "L"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    },
    {
     "id": "vista-02",
     "nivel": null,
     "categorias": {
      "ejes": [
       {
        "nombre": "J",
        "p": {
         "x": 0,
         "y": 13.21
        },
        "q": {
         "x": 9.4,
         "y": 13.21
        }
       },
       {
        "nombre": "G´",
        "p": {
         "x": 0,
         "y": 17.28
        },
        "q": {
         "x": 9.49,
         "y": 17.28
        }
       },
       {
        "nombre": "M",
        "p": {
         "x": 0,
         "y": 9.03
        },
        "q": {
         "x": 9.49,
         "y": 9.03
        }
       },
       {
        "nombre": "O´",
        "p": {
         "x": 0,
         "y": 5.22
        },
        "q": {
         "x": 9.49,
         "y": 5.22
        }
       },
       {
        "nombre": "U",
        "p": {
         "x": 0,
         "y": 0.96
        },
        "q": {
         "x": 9.49,
         "y": 0.96
        }
       },
       {
        "nombre": "E",
        "p": {
         "x": 0,
         "y": 21.97
        },
        "q": {
         "x": 9.49,
         "y": 21.98
        }
       },
       {
        "nombre": "3",
        "p": {
         "x": 1.04,
         "y": 22.93
        },
        "q": {
         "x": 1.04,
         "y": 0
        }
       },
       {
        "nombre": "6",
        "p": {
         "x": 8.47,
         "y": 22.93
        },
        "q": {
         "x": 8.46,
         "y": 0
        }
       }
      ],
      "columnas": [
       {
        "eje": "3/U",
        "centro": {
         "x": 1.04,
         "y": 0.96
        },
        "b": 1.5,
        "h": 0.5,
        "forma": "L"
       },
       {
        "eje": "6/U",
        "centro": {
         "x": 8.46,
         "y": 0.96
        },
        "b": 1.5,
        "h": 0.5,
        "forma": "L"
       },
       {
        "eje": "3/O´",
        "centro": {
         "x": 1.04,
         "y": 5.22
        },
        "b": 0.6,
        "h": 1,
        "forma": "L"
       },
       {
        "eje": "6/O´",
        "centro": {
         "x": 8.46,
         "y": 5.22
        },
        "b": 0.6,
        "h": 1,
        "forma": "L"
       },
       {
        "eje": "3/M",
        "centro": {
         "x": 1.04,
         "y": 9.03
        },
        "b": 0.6,
        "h": 1,
        "forma": "T"
       },
       {
        "eje": "6/M",
        "centro": {
         "x": 8.46,
         "y": 9.03
        },
        "b": 0.6,
        "h": 1,
        "forma": "T"
       },
       {
        "eje": "3/J",
        "centro": {
         "x": 1.04,
         "y": 13.21
        },
        "b": 0.6,
        "h": 1,
        "forma": "T"
       },
       {
        "eje": "6/J",
        "centro": {
         "x": 8.47,
         "y": 13.21
        },
        "b": 0.6,
        "h": 1,
        "forma": "T"
       },
       {
        "eje": "3/G´",
        "centro": {
         "x": 1.04,
         "y": 17.28
        },
        "b": 0.6,
        "h": 1,
        "forma": "T"
       },
       {
        "eje": "6/G´",
        "centro": {
         "x": 8.47,
         "y": 17.28
        },
        "b": 0.6,
        "h": 1,
        "forma": "T"
       },
       {
        "eje": "3/E",
        "centro": {
         "x": 1.04,
         "y": 21.97
        },
        "b": 1.5,
        "h": 1,
        "forma": "L"
       },
       {
        "eje": "6/E",
        "centro": {
         "x": 8.47,
         "y": 21.98
        },
        "b": 1.5,
        "h": 1,
        "forma": "L"
       },
       {
        "eje": null,
        "centro": {
         "x": 4.72,
         "y": 21.85
        },
        "b": 0.2,
        "h": 0.24,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 1.14,
         "y": 15.33
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 4.72,
         "y": 15.33
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 1.76,
         "y": 9.11
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 4.72,
         "y": 9.11
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.37,
         "y": 7.23
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 5.18,
         "y": 7.2
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 1.1,
         "y": 8.4
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 1.1,
         "y": 6.2
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 1.14,
         "y": 7.2
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 4.02,
         "y": 7.92
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 3.98,
         "y": 7.2
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 1.1,
         "y": 12.58
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 1.1,
         "y": 9.65
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 1.1,
         "y": 16.66
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 1.1,
         "y": 13.83
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 1.1,
         "y": 20.84
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 1.1,
         "y": 17.91
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.4,
         "y": 12.58
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.4,
         "y": 9.65
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.4,
         "y": 16.66
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.4,
         "y": 17.91
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.4,
         "y": 19.84
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 4.72,
         "y": 1.28
        },
        "b": 0.2,
        "h": 0.24,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 1.1,
         "y": 4.95
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 1.1,
         "y": 1.59
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 4.65,
         "y": 5.19
        },
        "b": 0.2,
        "h": 0.24,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 6.84,
         "y": 1.28
        },
        "b": 0.2,
        "h": 0.24,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 6.84,
         "y": 21.85
        },
        "b": 0.2,
        "h": 0.24,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 7.74,
         "y": 5.19
        },
        "b": 0.2,
        "h": 0.24,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 2.66,
         "y": 21.85
        },
        "b": 0.2,
        "h": 0.24,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 1.76,
         "y": 5.19
        },
        "b": 0.2,
        "h": 0.24,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 2.66,
         "y": 1.28
        },
        "b": 0.2,
        "h": 0.24,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 7.74,
         "y": 9.06
        },
        "b": 0.2,
        "h": 0.24,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 6.92,
         "y": 9.06
        },
        "b": 0.2,
        "h": 0.24,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 5.18,
         "y": 6.15
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 6.1,
         "y": 3.37
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 4.61,
         "y": 6.08
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    },
    {
     "id": "vista-03",
     "nivel": 2,
     "categorias": {
      "ejes": [
       {
        "nombre": "J",
        "p": {
         "x": 0,
         "y": 13.21
        },
        "q": {
         "x": 12.18,
         "y": 13.21
        }
       },
       {
        "nombre": "G´",
        "p": {
         "x": 0,
         "y": 17.28
        },
        "q": {
         "x": 12.27,
         "y": 17.28
        }
       },
       {
        "nombre": "M",
        "p": {
         "x": 0,
         "y": 9.03
        },
        "q": {
         "x": 12.27,
         "y": 9.03
        }
       },
       {
        "nombre": "O´",
        "p": {
         "x": 0,
         "y": 5.22
        },
        "q": {
         "x": 12.27,
         "y": 5.22
        }
       },
       {
        "nombre": "U",
        "p": {
         "x": 0,
         "y": 0.96
        },
        "q": {
         "x": 12.27,
         "y": 0.96
        }
       },
       {
        "nombre": "E",
        "p": {
         "x": 0,
         "y": 21.97
        },
        "q": {
         "x": 12.27,
         "y": 21.98
        }
       },
       {
        "nombre": "3",
        "p": {
         "x": 1.04,
         "y": 22.93
        },
        "q": {
         "x": 1.04,
         "y": 0
        }
       },
       {
        "nombre": "6",
        "p": {
         "x": 8.47,
         "y": 22.93
        },
        "q": {
         "x": 8.46,
         "y": 0
        }
       }
      ],
      "columnas": [
       {
        "eje": "3/U",
        "centro": {
         "x": 1.04,
         "y": 0.96
        },
        "b": 1.5,
        "h": 0.5,
        "forma": "L"
       },
       {
        "eje": "6/U",
        "centro": {
         "x": 8.46,
         "y": 0.96
        },
        "b": 1.5,
        "h": 0.5,
        "forma": "L"
       },
       {
        "eje": "3/O´",
        "centro": {
         "x": 1.04,
         "y": 5.22
        },
        "b": 0.6,
        "h": 1,
        "forma": "L"
       },
       {
        "eje": "6/O´",
        "centro": {
         "x": 8.46,
         "y": 5.22
        },
        "b": 0.6,
        "h": 1,
        "forma": "L"
       },
       {
        "eje": "3/M",
        "centro": {
         "x": 1.04,
         "y": 9.03
        },
        "b": 0.6,
        "h": 1,
        "forma": "T"
       },
       {
        "eje": "6/M",
        "centro": {
         "x": 8.46,
         "y": 9.03
        },
        "b": 0.6,
        "h": 1,
        "forma": "T"
       },
       {
        "eje": "3/J",
        "centro": {
         "x": 1.04,
         "y": 13.21
        },
        "b": 0.6,
        "h": 1,
        "forma": "T"
       },
       {
        "eje": "6/J",
        "centro": {
         "x": 8.47,
         "y": 13.21
        },
        "b": 0.6,
        "h": 1,
        "forma": "T"
       },
       {
        "eje": "3/G´",
        "centro": {
         "x": 1.04,
         "y": 17.28
        },
        "b": 0.6,
        "h": 1,
        "forma": "T"
       },
       {
        "eje": "6/G´",
        "centro": {
         "x": 8.47,
         "y": 17.28
        },
        "b": 0.6,
        "h": 1,
        "forma": "T"
       },
       {
        "eje": "3/E",
        "centro": {
         "x": 1.04,
         "y": 21.97
        },
        "b": 1.5,
        "h": 1,
        "forma": "L"
       },
       {
        "eje": "6/E",
        "centro": {
         "x": 8.47,
         "y": 21.98
        },
        "b": 1.5,
        "h": 1,
        "forma": "L"
       },
       {
        "eje": null,
        "centro": {
         "x": 4.72,
         "y": 21.85
        },
        "b": 0.2,
        "h": 0.24,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 1.14,
         "y": 15.33
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 4.72,
         "y": 15.33
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 1.76,
         "y": 9.11
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 4.72,
         "y": 9.11
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.37,
         "y": 7.23
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 5.18,
         "y": 7.2
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 1.1,
         "y": 8.4
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 1.1,
         "y": 6.2
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 1.14,
         "y": 7.2
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 4.02,
         "y": 7.92
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 3.99,
         "y": 7.2
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 1.1,
         "y": 12.58
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 1.1,
         "y": 9.65
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 1.1,
         "y": 16.66
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 1.1,
         "y": 13.83
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 1.1,
         "y": 20.84
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 1.1,
         "y": 17.91
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.4,
         "y": 12.58
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.4,
         "y": 9.65
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.4,
         "y": 16.66
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.4,
         "y": 17.91
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.4,
         "y": 19.84
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 4.72,
         "y": 1.28
        },
        "b": 0.2,
        "h": 0.24,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.59,
         "y": 1.23
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 10.84,
         "y": 1.26
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 10.84,
         "y": 4.85
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 10.84,
         "y": 5.07
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 10.84,
         "y": 8.89
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 10.84,
         "y": 12.71
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 10.84,
         "y": 16.53
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 10.84,
         "y": 20.35
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 10.84,
         "y": 8.67
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 10.84,
         "y": 12.49
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 10.84,
         "y": 16.31
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 10.84,
         "y": 20.13
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 10.84,
         "y": 21.88
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 1.1,
         "y": 4.95
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 1.1,
         "y": 1.59
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 4.65,
         "y": 5.19
        },
        "b": 0.2,
        "h": 0.24,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 6.84,
         "y": 1.28
        },
        "b": 0.2,
        "h": 0.24,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 6.84,
         "y": 21.85
        },
        "b": 0.2,
        "h": 0.24,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 7.74,
         "y": 5.19
        },
        "b": 0.2,
        "h": 0.24,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 2.66,
         "y": 21.85
        },
        "b": 0.2,
        "h": 0.24,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 1.76,
         "y": 5.19
        },
        "b": 0.2,
        "h": 0.24,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 2.66,
         "y": 1.28
        },
        "b": 0.2,
        "h": 0.24,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 7.74,
         "y": 9.06
        },
        "b": 0.2,
        "h": 0.24,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 6.92,
         "y": 9.06
        },
        "b": 0.2,
        "h": 0.24,
        "forma": "columneta"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    },
    {
     "id": "vista-04",
     "nivel": null,
     "categorias": {
      "ejes": [
       {
        "nombre": "J",
        "p": {
         "x": 0,
         "y": 13.21
        },
        "q": {
         "x": 12.18,
         "y": 13.21
        }
       },
       {
        "nombre": "M",
        "p": {
         "x": 0,
         "y": 9.03
        },
        "q": {
         "x": 12.27,
         "y": 9.03
        }
       },
       {
        "nombre": "G´",
        "p": {
         "x": 0,
         "y": 17.28
        },
        "q": {
         "x": 12.27,
         "y": 17.28
        }
       },
       {
        "nombre": "O´",
        "p": {
         "x": 0,
         "y": 5.22
        },
        "q": {
         "x": 12.27,
         "y": 5.22
        }
       },
       {
        "nombre": "U",
        "p": {
         "x": 0,
         "y": 0.96
        },
        "q": {
         "x": 12.27,
         "y": 0.96
        }
       },
       {
        "nombre": "E",
        "p": {
         "x": 0,
         "y": 21.97
        },
        "q": {
         "x": 12.27,
         "y": 21.98
        }
       },
       {
        "nombre": "3",
        "p": {
         "x": 1.04,
         "y": 22.93
        },
        "q": {
         "x": 1.04,
         "y": 0
        }
       },
       {
        "nombre": "6",
        "p": {
         "x": 8.47,
         "y": 22.93
        },
        "q": {
         "x": 8.46,
         "y": 0
        }
       }
      ],
      "columnas": [
       {
        "eje": "3/U",
        "centro": {
         "x": 1.04,
         "y": 0.96
        },
        "b": 1.5,
        "h": 0.5,
        "forma": "L"
       },
       {
        "eje": "6/U",
        "centro": {
         "x": 8.46,
         "y": 0.96
        },
        "b": 1.5,
        "h": 0.5,
        "forma": "L"
       },
       {
        "eje": "3/O´",
        "centro": {
         "x": 1.04,
         "y": 5.22
        },
        "b": 0.6,
        "h": 1,
        "forma": "L"
       },
       {
        "eje": "6/O´",
        "centro": {
         "x": 8.46,
         "y": 5.22
        },
        "b": 0.6,
        "h": 1,
        "forma": "L"
       },
       {
        "eje": "3/M",
        "centro": {
         "x": 1.04,
         "y": 9.03
        },
        "b": 0.6,
        "h": 1,
        "forma": "T"
       },
       {
        "eje": "6/M",
        "centro": {
         "x": 8.46,
         "y": 9.03
        },
        "b": 0.6,
        "h": 1,
        "forma": "T"
       },
       {
        "eje": "3/J",
        "centro": {
         "x": 1.04,
         "y": 13.21
        },
        "b": 0.6,
        "h": 1,
        "forma": "T"
       },
       {
        "eje": "6/J",
        "centro": {
         "x": 8.47,
         "y": 13.21
        },
        "b": 0.6,
        "h": 1,
        "forma": "T"
       },
       {
        "eje": "3/G´",
        "centro": {
         "x": 1.04,
         "y": 17.28
        },
        "b": 0.6,
        "h": 1,
        "forma": "T"
       },
       {
        "eje": "6/G´",
        "centro": {
         "x": 8.47,
         "y": 17.28
        },
        "b": 0.6,
        "h": 1,
        "forma": "T"
       },
       {
        "eje": "3/E",
        "centro": {
         "x": 1.04,
         "y": 21.97
        },
        "b": 1.5,
        "h": 1,
        "forma": "L"
       },
       {
        "eje": "6/E",
        "centro": {
         "x": 8.47,
         "y": 21.98
        },
        "b": 2.14,
        "h": 0.3,
        "forma": "rectangular"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    },
    {
     "id": "vista-05",
     "nivel": null,
     "categorias": {
      "ejes": [
       {
        "nombre": "J",
        "p": {
         "x": 0,
         "y": 13.21
        },
        "q": {
         "x": 13.02,
         "y": 13.21
        }
       },
       {
        "nombre": "M",
        "p": {
         "x": 0,
         "y": 9.03
        },
        "q": {
         "x": 13.11,
         "y": 9.03
        }
       },
       {
        "nombre": "G´",
        "p": {
         "x": 0,
         "y": 17.28
        },
        "q": {
         "x": 13.11,
         "y": 17.28
        }
       },
       {
        "nombre": "O´",
        "p": {
         "x": 0,
         "y": 5.22
        },
        "q": {
         "x": 13.11,
         "y": 5.22
        }
       },
       {
        "nombre": "U",
        "p": {
         "x": 0,
         "y": 0.96
        },
        "q": {
         "x": 13.11,
         "y": 0.96
        }
       },
       {
        "nombre": "E",
        "p": {
         "x": 0,
         "y": 21.97
        },
        "q": {
         "x": 13.11,
         "y": 21.98
        }
       },
       {
        "nombre": "3",
        "p": {
         "x": 1.88,
         "y": 22.93
        },
        "q": {
         "x": 1.88,
         "y": 0
        }
       },
       {
        "nombre": "6",
        "p": {
         "x": 9.31,
         "y": 22.93
        },
        "q": {
         "x": 9.31,
         "y": 0
        }
       }
      ],
      "columnas": [
       {
        "eje": "3/U",
        "centro": {
         "x": 1.88,
         "y": 0.96
        },
        "b": 1.5,
        "h": 0.5,
        "forma": "L"
       },
       {
        "eje": "6/U",
        "centro": {
         "x": 9.31,
         "y": 0.96
        },
        "b": 1.5,
        "h": 0.5,
        "forma": "L"
       },
       {
        "eje": "3/O´",
        "centro": {
         "x": 1.88,
         "y": 5.22
        },
        "b": 0.29,
        "h": 0.3,
        "forma": "rectangular"
       },
       {
        "eje": "6/O´",
        "centro": {
         "x": 9.31,
         "y": 5.22
        },
        "b": 0.6,
        "h": 1,
        "forma": "L"
       },
       {
        "eje": "3/M",
        "centro": {
         "x": 1.88,
         "y": 9.03
        },
        "b": 0.29,
        "h": 0.3,
        "forma": "rectangular"
       },
       {
        "eje": "6/M",
        "centro": {
         "x": 9.31,
         "y": 9.03
        },
        "b": 0.6,
        "h": 1,
        "forma": "T"
       },
       {
        "eje": "3/J",
        "centro": {
         "x": 1.88,
         "y": 13.21
        },
        "b": 0.29,
        "h": 0.3,
        "forma": "rectangular"
       },
       {
        "eje": "6/J",
        "centro": {
         "x": 9.31,
         "y": 13.21
        },
        "b": 0.6,
        "h": 1,
        "forma": "T"
       },
       {
        "eje": "3/G´",
        "centro": {
         "x": 1.88,
         "y": 17.28
        },
        "b": 0.29,
        "h": 0.3,
        "forma": "rectangular"
       },
       {
        "eje": "6/G´",
        "centro": {
         "x": 9.31,
         "y": 17.28
        },
        "b": 0.6,
        "h": 1,
        "forma": "T"
       },
       {
        "eje": "3/E",
        "centro": {
         "x": 1.88,
         "y": 21.97
        },
        "b": 0.29,
        "h": 0.3,
        "forma": "rectangular"
       },
       {
        "eje": "6/E",
        "centro": {
         "x": 9.31,
         "y": 21.98
        },
        "b": 1.98,
        "h": 0.3,
        "forma": "rectangular"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    }
   ]
  }
 },
 {
  "nombre": "vinchos:modulo-02",
  "grupo": "vinchos",
  "id": "modulo-02",
  "etiqueta": null,
  "rasgos": {
   "vista": "vista-01",
   "areaAbierta": false,
   "niveles": 3,
   "ejes": {
    "x": 7,
    "y": 2
   },
   "luces": {
    "x": [
     4.22,
     3.72,
     3.72,
     4.04,
     3.65,
     4.15
    ],
    "y": [
     7.43
    ]
   },
   "largo": 23.51,
   "ancho": 7.43,
   "area": 174.64,
   "luzLosa": 4.22,
   "luzMax": 7.43,
   "columnas": 14,
   "tipos": [
    {
     "nombre": "CT1",
     "forma": "T",
     "b": 1,
     "h": 0.6,
     "n": 9
    },
    {
     "nombre": "PL1",
     "forma": "L",
     "b": 1.5,
     "h": 1,
     "n": 3
    },
    {
     "nombre": "CT2",
     "forma": "T",
     "b": 1,
     "h": 0.6,
     "n": 1
    },
    {
     "nombre": "PL2",
     "forma": "rectangular",
     "b": 2.5,
     "h": 0.16,
     "n": 1
    }
   ],
   "placas": true,
   "columnetas": 33,
   "techoLiviano": true,
   "cubierta": true,
   "falsoCielo": true,
   "deportivo": false,
   "agua": false,
   "banos": true
  },
  "decisiones": {
   "cimentacion": "platea",
   "cimientoCorrido": true,
   "hz": 0.7,
   "df": 2,
   "losa": "aligerada",
   "espesorLosa": 0.2,
   "plantasDeLosa": 3,
   "vigas": [
    "30x60",
    "30x40"
   ],
   "fcColumnas": 210,
   "fcColumnetas": 175,
   "estribos": "3/8\": 1@.05, 10@.10",
   "porticos": 8,
   "mallaCimentacion": false,
   "columnasComoArquitectura": true,
   "losaDeTecho": true
  },
  "geometria": {
   "version": 1,
   "unidad": "m",
   "vistas": [
    {
     "id": "vista-01",
     "nivel": null,
     "categorias": {
      "ejes": [
       {
        "nombre": "7",
        "p": {
         "x": 9.04,
         "y": 10.3
        },
        "q": {
         "x": 9.04,
         "y": 0
        }
       },
       {
        "nombre": "5",
        "p": {
         "x": 5.32,
         "y": 10.3
        },
        "q": {
         "x": 5.32,
         "y": 0
        }
       },
       {
        "nombre": "4",
        "p": {
         "x": 1.09,
         "y": 10.3
        },
        "q": {
         "x": 1.09,
         "y": 0
        }
       },
       {
        "nombre": "9",
        "p": {
         "x": 12.76,
         "y": 10.3
        },
        "q": {
         "x": 12.76,
         "y": 0
        }
       },
       {
        "nombre": "11",
        "p": {
         "x": 16.8,
         "y": 10.3
        },
        "q": {
         "x": 16.8,
         "y": 0
        }
       },
       {
        "nombre": "12",
        "p": {
         "x": 20.45,
         "y": 10.3
        },
        "q": {
         "x": 20.45,
         "y": 0
        }
       },
       {
        "nombre": "13",
        "p": {
         "x": 24.6,
         "y": 10.3
        },
        "q": {
         "x": 24.6,
         "y": 0
        }
       },
       {
        "nombre": "D",
        "p": {
         "x": 0,
         "y": 1.44
        },
        "q": {
         "x": 25.7,
         "y": 1.44
        }
       },
       {
        "nombre": "B",
        "p": {
         "x": 0,
         "y": 8.87
        },
        "q": {
         "x": 25.7,
         "y": 8.87
        }
       }
      ],
      "columnas": [
       {
        "eje": "5/D",
        "centro": {
         "x": 5.32,
         "y": 1.44
        },
        "b": 1,
        "h": 0.6,
        "forma": "T"
       },
       {
        "eje": "7/D",
        "centro": {
         "x": 9.04,
         "y": 1.44
        },
        "b": 1,
        "h": 0.6,
        "forma": "T"
       },
       {
        "eje": "9/D",
        "centro": {
         "x": 12.76,
         "y": 1.44
        },
        "b": 1,
        "h": 0.6,
        "forma": "T"
       },
       {
        "eje": "11/D",
        "centro": {
         "x": 16.8,
         "y": 1.44
        },
        "b": 1,
        "h": 0.6,
        "forma": "T"
       },
       {
        "eje": "12/D",
        "centro": {
         "x": 20.45,
         "y": 1.44
        },
        "b": 1,
        "h": 0.6,
        "forma": "T"
       },
       {
        "eje": "4/D",
        "centro": {
         "x": 1.09,
         "y": 1.44
        },
        "b": 1,
        "h": 1.5,
        "forma": "L"
       },
       {
        "eje": "13/D",
        "centro": {
         "x": 24.6,
         "y": 1.44
        },
        "b": 1,
        "h": 1.5,
        "forma": "L"
       },
       {
        "eje": "4/B",
        "centro": {
         "x": 1.09,
         "y": 8.87
        },
        "b": 1,
        "h": 1.5,
        "forma": "L"
       },
       {
        "eje": "13/B",
        "centro": {
         "x": 24.6,
         "y": 8.87
        },
        "b": 1,
        "h": 1.5,
        "forma": "L"
       },
       {
        "eje": "5/B",
        "centro": {
         "x": 5.32,
         "y": 8.87
        },
        "b": 1,
        "h": 0.6,
        "forma": "T"
       },
       {
        "eje": "7/B",
        "centro": {
         "x": 9.04,
         "y": 8.87
        },
        "b": 1,
        "h": 0.6,
        "forma": "T"
       },
       {
        "eje": "9/B",
        "centro": {
         "x": 12.76,
         "y": 8.87
        },
        "b": 1,
        "h": 0.6,
        "forma": "T"
       },
       {
        "eje": "11/B",
        "centro": {
         "x": 16.8,
         "y": 8.87
        },
        "b": 1,
        "h": 0.6,
        "forma": "T"
       },
       {
        "eje": "12/B",
        "centro": {
         "x": 20.45,
         "y": 8.87
        },
        "b": 1,
        "h": 0.6,
        "forma": "T"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    },
    {
     "id": "vista-02",
     "nivel": 2,
     "categorias": {
      "ejes": [
       {
        "nombre": "7",
        "p": {
         "x": 9.33,
         "y": 11.76
        },
        "q": {
         "x": 9.33,
         "y": 0
        }
       },
       {
        "nombre": "11",
        "p": {
         "x": 17.08,
         "y": 11.76
        },
        "q": {
         "x": 17.08,
         "y": 0
        }
       },
       {
        "nombre": "5",
        "p": {
         "x": 5.6,
         "y": 11.76
        },
        "q": {
         "x": 5.6,
         "y": 0
        }
       },
       {
        "nombre": "9",
        "p": {
         "x": 13.04,
         "y": 11.76
        },
        "q": {
         "x": 13.04,
         "y": 0
        }
       },
       {
        "nombre": "13",
        "p": {
         "x": 24.88,
         "y": 11.76
        },
        "q": {
         "x": 24.88,
         "y": 0
        }
       },
       {
        "nombre": "4",
        "p": {
         "x": 1.38,
         "y": 11.76
        },
        "q": {
         "x": 1.38,
         "y": 0
        }
       },
       {
        "nombre": "12",
        "p": {
         "x": 20.73,
         "y": 11.76
        },
        "q": {
         "x": 20.73,
         "y": 0
        }
       },
       {
        "nombre": "B",
        "p": {
         "x": 0,
         "y": 10.81
        },
        "q": {
         "x": 26.06,
         "y": 10.81
        }
       },
       {
        "nombre": "D",
        "p": {
         "x": 0,
         "y": 3.38
        },
        "q": {
         "x": 26.09,
         "y": 3.38
        }
       }
      ],
      "columnas": [
       {
        "eje": "5/D",
        "centro": {
         "x": 5.6,
         "y": 3.38
        },
        "b": 1,
        "h": 0.6,
        "forma": "T"
       },
       {
        "eje": "7/D",
        "centro": {
         "x": 9.33,
         "y": 3.38
        },
        "b": 1,
        "h": 0.6,
        "forma": "T"
       },
       {
        "eje": "9/D",
        "centro": {
         "x": 13.04,
         "y": 3.38
        },
        "b": 1,
        "h": 0.6,
        "forma": "T"
       },
       {
        "eje": "11/D",
        "centro": {
         "x": 17.08,
         "y": 3.38
        },
        "b": 1,
        "h": 0.6,
        "forma": "T"
       },
       {
        "eje": "12/D",
        "centro": {
         "x": 20.73,
         "y": 3.38
        },
        "b": 1,
        "h": 0.6,
        "forma": "T"
       },
       {
        "eje": "4/D",
        "centro": {
         "x": 1.38,
         "y": 3.38
        },
        "b": 1,
        "h": 1.5,
        "forma": "L"
       },
       {
        "eje": "13/D",
        "centro": {
         "x": 24.88,
         "y": 3.38
        },
        "b": 1,
        "h": 1.5,
        "forma": "L"
       },
       {
        "eje": "4/B",
        "centro": {
         "x": 1.38,
         "y": 10.81
        },
        "b": 1,
        "h": 1.5,
        "forma": "L"
       },
       {
        "eje": "13/B",
        "centro": {
         "x": 24.88,
         "y": 10.81
        },
        "b": 1,
        "h": 1.5,
        "forma": "L"
       },
       {
        "eje": "5/B",
        "centro": {
         "x": 5.6,
         "y": 10.81
        },
        "b": 1,
        "h": 0.6,
        "forma": "T"
       },
       {
        "eje": "7/B",
        "centro": {
         "x": 9.33,
         "y": 10.81
        },
        "b": 1,
        "h": 0.6,
        "forma": "T"
       },
       {
        "eje": "9/B",
        "centro": {
         "x": 13.04,
         "y": 10.81
        },
        "b": 1,
        "h": 0.6,
        "forma": "T"
       },
       {
        "eje": "11/B",
        "centro": {
         "x": 17.08,
         "y": 10.81
        },
        "b": 1,
        "h": 0.6,
        "forma": "T"
       },
       {
        "eje": "12/B",
        "centro": {
         "x": 20.73,
         "y": 10.81
        },
        "b": 1,
        "h": 0.6,
        "forma": "T"
       },
       {
        "eje": null,
        "centro": {
         "x": 10.85,
         "y": 1.01
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 14.46,
         "y": 1.01
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 17.98,
         "y": 1.01
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 21.5,
         "y": 1.01
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 14.24,
         "y": 1.01
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 17.76,
         "y": 1.01
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 21.28,
         "y": 1.01
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 24.78,
         "y": 1.01
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 6.23,
         "y": 10.75
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 9.95,
         "y": 10.75
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 2.51,
         "y": 10.75
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 4.98,
         "y": 10.75
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.7,
         "y": 10.75
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 12.42,
         "y": 10.75
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.46,
         "y": 10.75
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 20.11,
         "y": 10.75
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 23.76,
         "y": 10.75
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.67,
         "y": 10.75
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 17.71,
         "y": 10.75
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 21.36,
         "y": 10.75
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 2.53,
         "y": 3.45
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 6.23,
         "y": 3.45
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 9.95,
         "y": 3.45
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.67,
         "y": 3.45
        },
        "b": 0.21,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 21.36,
         "y": 3.45
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 3.97,
         "y": 3.45
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 10.83,
         "y": 3.45
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.7,
         "y": 3.45
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.46,
         "y": 3.45
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 23.73,
         "y": 3.45
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 19.1,
         "y": 3.45
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 24.76,
         "y": 7.1
        },
        "b": 0.24,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 1.5,
         "y": 7.1
        },
        "b": 0.24,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 1.5,
         "y": 9.19
        },
        "b": 0.24,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 1.5,
         "y": 5.01
        },
        "b": 0.24,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 24.76,
         "y": 9.19
        },
        "b": 0.24,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 24.76,
         "y": 5.01
        },
        "b": 0.24,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 12.96,
         "y": 5.94
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 17.17,
         "y": 5.97
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 12.96,
         "y": 4.11
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 12.96,
         "y": 8.17
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 17.17,
         "y": 10.09
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 17.17,
         "y": 4.74
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 17.17,
         "y": 4.11
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    },
    {
     "id": "vista-03",
     "nivel": 1,
     "categorias": {
      "ejes": [
       {
        "nombre": "7",
        "p": {
         "x": 9.04,
         "y": 0
        },
        "q": {
         "x": 9.04,
         "y": 11.73
        }
       },
       {
        "nombre": "5",
        "p": {
         "x": 5.32,
         "y": 0
        },
        "q": {
         "x": 5.32,
         "y": 11.73
        }
       },
       {
        "nombre": "9",
        "p": {
         "x": 12.76,
         "y": 0
        },
        "q": {
         "x": 12.76,
         "y": 11.73
        }
       },
       {
        "nombre": "11",
        "p": {
         "x": 16.8,
         "y": 0
        },
        "q": {
         "x": 16.8,
         "y": 11.73
        }
       },
       {
        "nombre": "13",
        "p": {
         "x": 24.6,
         "y": 0
        },
        "q": {
         "x": 24.6,
         "y": 11.73
        }
       },
       {
        "nombre": "4",
        "p": {
         "x": 1.09,
         "y": 0
        },
        "q": {
         "x": 1.09,
         "y": 11.73
        }
       },
       {
        "nombre": "12",
        "p": {
         "x": 20.45,
         "y": 0
        },
        "q": {
         "x": 20.45,
         "y": 11.73
        }
       },
       {
        "nombre": "B",
        "p": {
         "x": 0,
         "y": 10.81
        },
        "q": {
         "x": 25.78,
         "y": 10.81
        }
       },
       {
        "nombre": "D",
        "p": {
         "x": 0,
         "y": 3.38
        },
        "q": {
         "x": 25.81,
         "y": 3.38
        }
       }
      ],
      "columnas": [
       {
        "eje": "4/D",
        "centro": {
         "x": 1.09,
         "y": 3.38
        },
        "b": 0.3,
        "h": 2.14,
        "forma": "rectangular"
       },
       {
        "eje": "13/D",
        "centro": {
         "x": 24.6,
         "y": 3.38
        },
        "b": 0.3,
        "h": 2.14,
        "forma": "rectangular"
       },
       {
        "eje": "5/D",
        "centro": {
         "x": 5.32,
         "y": 3.38
        },
        "b": 1,
        "h": 0.6,
        "forma": "T"
       },
       {
        "eje": "7/D",
        "centro": {
         "x": 9.04,
         "y": 3.38
        },
        "b": 1,
        "h": 0.6,
        "forma": "T"
       },
       {
        "eje": "9/D",
        "centro": {
         "x": 12.76,
         "y": 3.38
        },
        "b": 1,
        "h": 0.6,
        "forma": "T"
       },
       {
        "eje": "11/D",
        "centro": {
         "x": 16.8,
         "y": 3.38
        },
        "b": 1,
        "h": 0.6,
        "forma": "T"
       },
       {
        "eje": "12/D",
        "centro": {
         "x": 20.45,
         "y": 3.38
        },
        "b": 1,
        "h": 0.6,
        "forma": "T"
       },
       {
        "eje": "4/B",
        "centro": {
         "x": 1.09,
         "y": 10.81
        },
        "b": 1,
        "h": 1.5,
        "forma": "L"
       },
       {
        "eje": "13/B",
        "centro": {
         "x": 24.6,
         "y": 10.81
        },
        "b": 1,
        "h": 1.5,
        "forma": "L"
       },
       {
        "eje": "5/B",
        "centro": {
         "x": 5.32,
         "y": 10.81
        },
        "b": 1,
        "h": 0.6,
        "forma": "T"
       },
       {
        "eje": "7/B",
        "centro": {
         "x": 9.04,
         "y": 10.81
        },
        "b": 1,
        "h": 0.6,
        "forma": "T"
       },
       {
        "eje": "9/B",
        "centro": {
         "x": 12.76,
         "y": 10.81
        },
        "b": 1,
        "h": 0.6,
        "forma": "T"
       },
       {
        "eje": "11/B",
        "centro": {
         "x": 16.8,
         "y": 10.81
        },
        "b": 1,
        "h": 0.6,
        "forma": "T"
       },
       {
        "eje": "12/B",
        "centro": {
         "x": 20.45,
         "y": 10.81
        },
        "b": 1,
        "h": 0.6,
        "forma": "T"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    },
    {
     "id": "vista-04",
     "nivel": null,
     "categorias": {
      "ejes": [
       {
        "nombre": "7",
        "p": {
         "x": 8.92,
         "y": 0
        },
        "q": {
         "x": 8.92,
         "y": 9.78
        }
       },
       {
        "nombre": "5",
        "p": {
         "x": 5.19,
         "y": 0
        },
        "q": {
         "x": 5.19,
         "y": 9.78
        }
       },
       {
        "nombre": "9",
        "p": {
         "x": 12.63,
         "y": 0
        },
        "q": {
         "x": 12.63,
         "y": 9.78
        }
       },
       {
        "nombre": "11",
        "p": {
         "x": 16.68,
         "y": 0
        },
        "q": {
         "x": 16.68,
         "y": 9.78
        }
       },
       {
        "nombre": "13",
        "p": {
         "x": 24.48,
         "y": 0
        },
        "q": {
         "x": 24.48,
         "y": 9.78
        }
       },
       {
        "nombre": "4",
        "p": {
         "x": 0.97,
         "y": 0
        },
        "q": {
         "x": 0.97,
         "y": 9.78
        }
       },
       {
        "nombre": "12",
        "p": {
         "x": 20.33,
         "y": 0
        },
        "q": {
         "x": 20.33,
         "y": 9.78
        }
       },
       {
        "nombre": "B",
        "p": {
         "x": 0,
         "y": 8.64
        },
        "q": {
         "x": 25.65,
         "y": 8.64
        }
       },
       {
        "nombre": "D",
        "p": {
         "x": 0,
         "y": 1.21
        },
        "q": {
         "x": 25.69,
         "y": 1.21
        }
       }
      ],
      "columnas": [
       {
        "eje": "5/D",
        "centro": {
         "x": 5.19,
         "y": 1.21
        },
        "b": 1,
        "h": 0.6,
        "forma": "T"
       },
       {
        "eje": "7/D",
        "centro": {
         "x": 8.92,
         "y": 1.21
        },
        "b": 1,
        "h": 0.6,
        "forma": "T"
       },
       {
        "eje": "9/D",
        "centro": {
         "x": 12.63,
         "y": 1.21
        },
        "b": 1,
        "h": 0.6,
        "forma": "T"
       },
       {
        "eje": "11/D",
        "centro": {
         "x": 16.68,
         "y": 1.21
        },
        "b": 1,
        "h": 0.6,
        "forma": "T"
       },
       {
        "eje": "12/D",
        "centro": {
         "x": 20.33,
         "y": 1.21
        },
        "b": 1,
        "h": 0.6,
        "forma": "T"
       },
       {
        "eje": "4/D",
        "centro": {
         "x": 0.97,
         "y": 1.21
        },
        "b": 1,
        "h": 1.5,
        "forma": "L"
       },
       {
        "eje": "13/D",
        "centro": {
         "x": 24.48,
         "y": 1.21
        },
        "b": 1,
        "h": 1.5,
        "forma": "L"
       },
       {
        "eje": "4/B",
        "centro": {
         "x": 0.97,
         "y": 8.64
        },
        "b": 1,
        "h": 1.5,
        "forma": "L"
       },
       {
        "eje": "13/B",
        "centro": {
         "x": 24.48,
         "y": 8.64
        },
        "b": 1,
        "h": 1.5,
        "forma": "L"
       },
       {
        "eje": "5/B",
        "centro": {
         "x": 5.19,
         "y": 8.64
        },
        "b": 1,
        "h": 0.6,
        "forma": "T"
       },
       {
        "eje": "7/B",
        "centro": {
         "x": 8.92,
         "y": 8.64
        },
        "b": 1,
        "h": 0.6,
        "forma": "T"
       },
       {
        "eje": "9/B",
        "centro": {
         "x": 12.63,
         "y": 8.64
        },
        "b": 1,
        "h": 0.6,
        "forma": "T"
       },
       {
        "eje": "11/B",
        "centro": {
         "x": 16.68,
         "y": 8.64
        },
        "b": 1,
        "h": 0.6,
        "forma": "T"
       },
       {
        "eje": "12/B",
        "centro": {
         "x": 20.33,
         "y": 8.64
        },
        "b": 1,
        "h": 0.6,
        "forma": "T"
       },
       {
        "eje": null,
        "centro": {
         "x": 5.82,
         "y": 8.58
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 9.54,
         "y": 8.58
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 2.1,
         "y": 8.58
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 4.57,
         "y": 8.58
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.29,
         "y": 8.58
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 12.01,
         "y": 8.58
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.05,
         "y": 8.58
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 19.7,
         "y": 8.58
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 23.35,
         "y": 8.58
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.26,
         "y": 8.58
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 17.3,
         "y": 8.58
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 20.95,
         "y": 8.58
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 2.12,
         "y": 1.28
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 5.82,
         "y": 1.28
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 9.54,
         "y": 1.28
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.26,
         "y": 1.28
        },
        "b": 0.21,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 20.95,
         "y": 1.28
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 3.56,
         "y": 1.28
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 10.42,
         "y": 1.28
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.29,
         "y": 1.28
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.05,
         "y": 1.28
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 19.7,
         "y": 1.28
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 23.32,
         "y": 1.28
        },
        "b": 0.27,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 18.91,
         "y": 1.28
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 5.11,
         "y": 7.92
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 12.72,
         "y": 7.92
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 5.11,
         "y": 1.94
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 24.36,
         "y": 4.93
        },
        "b": 0.24,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 1.09,
         "y": 4.93
        },
        "b": 0.24,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 5.11,
         "y": 4.93
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 1.09,
         "y": 7.02
        },
        "b": 0.24,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 1.09,
         "y": 2.84
        },
        "b": 0.24,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 24.36,
         "y": 7.02
        },
        "b": 0.24,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 24.36,
         "y": 2.84
        },
        "b": 0.24,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 12.72,
         "y": 4.93
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 12.72,
         "y": 2.94
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.59,
         "y": 6.91
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.59,
         "y": 4.93
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.59,
         "y": 1.94
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    },
    {
     "id": "vista-05",
     "nivel": 3,
     "categorias": {
      "ejes": [
       {
        "nombre": "7",
        "p": {
         "x": 9.33,
         "y": 11.81
        },
        "q": {
         "x": 9.33,
         "y": 0
        }
       },
       {
        "nombre": "11",
        "p": {
         "x": 17.08,
         "y": 11.81
        },
        "q": {
         "x": 17.08,
         "y": 0
        }
       },
       {
        "nombre": "5",
        "p": {
         "x": 5.6,
         "y": 11.81
        },
        "q": {
         "x": 5.6,
         "y": 0
        }
       },
       {
        "nombre": "9",
        "p": {
         "x": 13.04,
         "y": 11.81
        },
        "q": {
         "x": 13.04,
         "y": 0
        }
       },
       {
        "nombre": "13",
        "p": {
         "x": 24.88,
         "y": 11.81
        },
        "q": {
         "x": 24.88,
         "y": 0
        }
       },
       {
        "nombre": "4",
        "p": {
         "x": 1.38,
         "y": 11.81
        },
        "q": {
         "x": 1.38,
         "y": 0
        }
       },
       {
        "nombre": "12",
        "p": {
         "x": 20.73,
         "y": 11.81
        },
        "q": {
         "x": 20.73,
         "y": 0
        }
       },
       {
        "nombre": "B",
        "p": {
         "x": 0,
         "y": 10.85
        },
        "q": {
         "x": 26.06,
         "y": 10.85
        }
       },
       {
        "nombre": "D",
        "p": {
         "x": 0,
         "y": 3.42
        },
        "q": {
         "x": 26.09,
         "y": 3.42
        }
       }
      ],
      "columnas": [
       {
        "eje": "5/D",
        "centro": {
         "x": 5.6,
         "y": 3.42
        },
        "b": 1,
        "h": 0.6,
        "forma": "T"
       },
       {
        "eje": "7/D",
        "centro": {
         "x": 9.33,
         "y": 3.42
        },
        "b": 1,
        "h": 0.6,
        "forma": "T"
       },
       {
        "eje": "9/D",
        "centro": {
         "x": 13.04,
         "y": 3.42
        },
        "b": 1,
        "h": 0.6,
        "forma": "T"
       },
       {
        "eje": "11/D",
        "centro": {
         "x": 17.08,
         "y": 3.42
        },
        "b": 1,
        "h": 0.6,
        "forma": "T"
       },
       {
        "eje": "12/D",
        "centro": {
         "x": 20.73,
         "y": 3.42
        },
        "b": 1,
        "h": 0.6,
        "forma": "T"
       },
       {
        "eje": "4/D",
        "centro": {
         "x": 1.38,
         "y": 3.42
        },
        "b": 1,
        "h": 1.5,
        "forma": "L"
       },
       {
        "eje": "13/D",
        "centro": {
         "x": 24.88,
         "y": 3.42
        },
        "b": 1,
        "h": 1.5,
        "forma": "L"
       },
       {
        "eje": "4/B",
        "centro": {
         "x": 1.38,
         "y": 10.85
        },
        "b": 1,
        "h": 1.5,
        "forma": "L"
       },
       {
        "eje": "13/B",
        "centro": {
         "x": 24.88,
         "y": 10.85
        },
        "b": 1,
        "h": 1.5,
        "forma": "L"
       },
       {
        "eje": "5/B",
        "centro": {
         "x": 5.6,
         "y": 10.85
        },
        "b": 1,
        "h": 0.6,
        "forma": "T"
       },
       {
        "eje": "7/B",
        "centro": {
         "x": 9.33,
         "y": 10.85
        },
        "b": 1,
        "h": 0.6,
        "forma": "T"
       },
       {
        "eje": "9/B",
        "centro": {
         "x": 13.04,
         "y": 10.85
        },
        "b": 1,
        "h": 0.6,
        "forma": "T"
       },
       {
        "eje": "11/B",
        "centro": {
         "x": 17.08,
         "y": 10.85
        },
        "b": 1,
        "h": 0.6,
        "forma": "T"
       },
       {
        "eje": "12/B",
        "centro": {
         "x": 20.73,
         "y": 10.85
        },
        "b": 1,
        "h": 0.6,
        "forma": "T"
       },
       {
        "eje": null,
        "centro": {
         "x": 10.85,
         "y": 1.05
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 14.46,
         "y": 1.05
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 17.98,
         "y": 1.05
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 21.5,
         "y": 1.05
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 14.24,
         "y": 1.05
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 17.76,
         "y": 1.05
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 21.28,
         "y": 1.05
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 24.78,
         "y": 1.05
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 6.23,
         "y": 10.78
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 9.95,
         "y": 10.78
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 2.51,
         "y": 10.78
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 4.98,
         "y": 10.78
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.7,
         "y": 10.78
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 12.42,
         "y": 10.78
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 20.11,
         "y": 10.78
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 23.76,
         "y": 10.78
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.67,
         "y": 10.78
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 17.71,
         "y": 10.78
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 21.36,
         "y": 10.78
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 2.53,
         "y": 3.49
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 6.23,
         "y": 3.49
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 9.95,
         "y": 3.49
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.67,
         "y": 3.49
        },
        "b": 0.21,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 21.36,
         "y": 3.49
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 3.97,
         "y": 3.49
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 10.83,
         "y": 3.48
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.7,
         "y": 3.49
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 20.11,
         "y": 3.49
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 23.73,
         "y": 3.49
        },
        "b": 0.26,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 18.71,
         "y": 3.49
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 12.96,
         "y": 10.12
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 5.52,
         "y": 4.14
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 24.76,
         "y": 7.13
        },
        "b": 0.24,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 1.5,
         "y": 7.13
        },
        "b": 0.24,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 5.52,
         "y": 7.13
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 1.5,
         "y": 9.22
        },
        "b": 0.24,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 1.5,
         "y": 5.04
        },
        "b": 0.24,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 24.76,
         "y": 9.22
        },
        "b": 0.24,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 24.76,
         "y": 5.04
        },
        "b": 0.24,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 12.96,
         "y": 6.97
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 12.96,
         "y": 5.15
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.01,
         "y": 9.59
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.01,
         "y": 6.97
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 5.52,
         "y": 10.12
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    },
    {
     "id": "vista-06",
     "nivel": 3,
     "categorias": {
      "ejes": [
       {
        "nombre": "7",
        "p": {
         "x": 9.04,
         "y": 0
        },
        "q": {
         "x": 9.04,
         "y": 13.01
        }
       },
       {
        "nombre": "11",
        "p": {
         "x": 16.8,
         "y": 0
        },
        "q": {
         "x": 16.8,
         "y": 13.01
        }
       },
       {
        "nombre": "5",
        "p": {
         "x": 5.32,
         "y": 0
        },
        "q": {
         "x": 5.32,
         "y": 13.01
        }
       },
       {
        "nombre": "9",
        "p": {
         "x": 12.76,
         "y": 0
        },
        "q": {
         "x": 12.76,
         "y": 13.01
        }
       },
       {
        "nombre": "13",
        "p": {
         "x": 24.6,
         "y": 0
        },
        "q": {
         "x": 24.6,
         "y": 13.01
        }
       },
       {
        "nombre": "4",
        "p": {
         "x": 1.09,
         "y": 0
        },
        "q": {
         "x": 1.09,
         "y": 13.01
        }
       },
       {
        "nombre": "12",
        "p": {
         "x": 20.45,
         "y": 0
        },
        "q": {
         "x": 20.45,
         "y": 13.01
        }
       },
       {
        "nombre": "B",
        "p": {
         "x": 0,
         "y": 11
        },
        "q": {
         "x": 25.78,
         "y": 11
        }
       },
       {
        "nombre": "D",
        "p": {
         "x": 0,
         "y": 3.57
        },
        "q": {
         "x": 25.81,
         "y": 3.57
        }
       }
      ],
      "columnas": [
       {
        "eje": "4/D",
        "centro": {
         "x": 1.09,
         "y": 3.57
        },
        "b": 0.3,
        "h": 1.93,
        "forma": "rectangular"
       },
       {
        "eje": "13/D",
        "centro": {
         "x": 24.6,
         "y": 3.57
        },
        "b": 0.3,
        "h": 1.93,
        "forma": "rectangular"
       },
       {
        "eje": "5/D",
        "centro": {
         "x": 5.32,
         "y": 3.57
        },
        "b": 1,
        "h": 0.6,
        "forma": "T"
       },
       {
        "eje": "7/D",
        "centro": {
         "x": 9.04,
         "y": 3.57
        },
        "b": 1,
        "h": 0.6,
        "forma": "T"
       },
       {
        "eje": "9/D",
        "centro": {
         "x": 12.76,
         "y": 3.57
        },
        "b": 1,
        "h": 0.6,
        "forma": "T"
       },
       {
        "eje": "11/D",
        "centro": {
         "x": 16.8,
         "y": 3.57
        },
        "b": 1,
        "h": 0.6,
        "forma": "T"
       },
       {
        "eje": "12/D",
        "centro": {
         "x": 20.45,
         "y": 3.57
        },
        "b": 1,
        "h": 0.6,
        "forma": "T"
       },
       {
        "eje": "4/B",
        "centro": {
         "x": 1.09,
         "y": 11
        },
        "b": 0.3,
        "h": 0.29,
        "forma": "rectangular"
       },
       {
        "eje": "5/B",
        "centro": {
         "x": 5.32,
         "y": 11
        },
        "b": 0.3,
        "h": 0.29,
        "forma": "rectangular"
       },
       {
        "eje": "7/B",
        "centro": {
         "x": 9.04,
         "y": 11
        },
        "b": 0.3,
        "h": 0.29,
        "forma": "rectangular"
       },
       {
        "eje": "9/B",
        "centro": {
         "x": 12.76,
         "y": 11
        },
        "b": 0.3,
        "h": 0.29,
        "forma": "rectangular"
       },
       {
        "eje": "11/B",
        "centro": {
         "x": 16.8,
         "y": 11
        },
        "b": 0.3,
        "h": 0.29,
        "forma": "rectangular"
       },
       {
        "eje": "12/B",
        "centro": {
         "x": 20.45,
         "y": 11
        },
        "b": 0.3,
        "h": 0.29,
        "forma": "rectangular"
       },
       {
        "eje": "13/B",
        "centro": {
         "x": 24.6,
         "y": 11
        },
        "b": 0.3,
        "h": 0.29,
        "forma": "rectangular"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    }
   ]
  }
 },
 {
  "nombre": "vinchos:modulo-03",
  "grupo": "vinchos",
  "id": "modulo-03",
  "etiqueta": null,
  "rasgos": {
   "vista": "vista-01",
   "areaAbierta": false,
   "niveles": 3,
   "ejes": {
    "x": 2,
    "y": 2
   },
   "luces": {
    "x": [
     4.16
    ],
    "y": [
     8.62
    ]
   },
   "largo": 8.62,
   "ancho": 4.16,
   "area": 35.87,
   "luzLosa": 4.16,
   "luzMax": 8.62,
   "columnas": 4,
   "tipos": [
    {
     "nombre": "PL1",
     "forma": "T",
     "b": 1.76,
     "h": 0.8,
     "n": 1
    },
    {
     "nombre": "PL2",
     "forma": "T",
     "b": 1.53,
     "h": 0.8,
     "n": 1
    },
    {
     "nombre": "PL3",
     "forma": "L",
     "b": 2.69,
     "h": 0.5,
     "n": 1
    },
    {
     "nombre": "C1",
     "forma": "rectangular",
     "b": 0.5,
     "h": 0.24,
     "n": 1
    }
   ],
   "placas": true,
   "columnetas": 9,
   "techoLiviano": true,
   "cubierta": true,
   "falsoCielo": true,
   "deportivo": false,
   "agua": false,
   "banos": true
  },
  "decisiones": {
   "cimentacion": "platea",
   "cimientoCorrido": true,
   "hz": 0.7,
   "df": 2,
   "losa": "aligerada",
   "espesorLosa": 0.2,
   "plantasDeLosa": 3,
   "vigas": [
    "24x60",
    "25x40"
   ],
   "fcColumnas": 210,
   "fcColumnetas": 175,
   "estribos": "3/8\": 1@.05, 10@.10",
   "porticos": 4,
   "mallaCimentacion": false,
   "columnasComoArquitectura": false,
   "losaDeTecho": true
  },
  "geometria": {
   "version": 1,
   "unidad": "m",
   "vistas": [
    {
     "id": "vista-01",
     "nivel": null,
     "categorias": {
      "ejes": [
       {
        "nombre": "A",
        "p": {
         "x": 0,
         "y": 9.96
        },
        "q": {
         "x": 6.92,
         "y": 9.96
        }
       },
       {
        "nombre": "D",
        "p": {
         "x": 0,
         "y": 1.34
        },
        "q": {
         "x": 6.92,
         "y": 1.34
        }
       },
       {
        "nombre": "14",
        "p": {
         "x": 1.33,
         "y": 11.35
        },
        "q": {
         "x": 1.33,
         "y": 0
        }
       },
       {
        "nombre": "17",
        "p": {
         "x": 5.49,
         "y": 11.35
        },
        "q": {
         "x": 5.49,
         "y": 0
        }
       }
      ],
      "columnas": [
       {
        "eje": "17/D",
        "centro": {
         "x": 5.49,
         "y": 1.34
        },
        "b": 0.24,
        "h": 0.5,
        "forma": "rectangular"
       },
       {
        "eje": "14/A",
        "centro": {
         "x": 1.33,
         "y": 9.96
        },
        "b": 1.76,
        "h": 0.8,
        "forma": "T"
       },
       {
        "eje": "17/A",
        "centro": {
         "x": 5.49,
         "y": 9.96
        },
        "b": 1.53,
        "h": 0.8,
        "forma": "T"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    },
    {
     "id": "vista-02",
     "nivel": null,
     "categorias": {
      "ejes": [
       {
        "nombre": "A",
        "p": {
         "x": 0,
         "y": 9.84
        },
        "q": {
         "x": 6.92,
         "y": 9.84
        }
       },
       {
        "nombre": "D",
        "p": {
         "x": 0,
         "y": 1.21
        },
        "q": {
         "x": 6.92,
         "y": 1.21
        }
       },
       {
        "nombre": "14",
        "p": {
         "x": 1.33,
         "y": 11.22
        },
        "q": {
         "x": 1.33,
         "y": 0
        }
       },
       {
        "nombre": "17",
        "p": {
         "x": 5.49,
         "y": 11.22
        },
        "q": {
         "x": 5.49,
         "y": 0
        }
       }
      ],
      "columnas": [
       {
        "eje": "17/D",
        "centro": {
         "x": 5.49,
         "y": 1.21
        },
        "b": 0.24,
        "h": 0.5,
        "forma": "rectangular"
       },
       {
        "eje": "14/A",
        "centro": {
         "x": 1.33,
         "y": 9.84
        },
        "b": 1.76,
        "h": 0.8,
        "forma": "T"
       },
       {
        "eje": "17/A",
        "centro": {
         "x": 5.49,
         "y": 9.84
        },
        "b": 1.53,
        "h": 0.8,
        "forma": "T"
       },
       {
        "eje": null,
        "centro": {
         "x": 3.49,
         "y": 4.38
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    },
    {
     "id": "vista-03",
     "nivel": 2,
     "categorias": {
      "ejes": [
       {
        "nombre": "A",
        "p": {
         "x": 0,
         "y": 11.97
        },
        "q": {
         "x": 6.92,
         "y": 11.97
        }
       },
       {
        "nombre": "D",
        "p": {
         "x": 0,
         "y": 3.34
        },
        "q": {
         "x": 6.92,
         "y": 3.34
        }
       },
       {
        "nombre": "14",
        "p": {
         "x": 1.33,
         "y": 13.35
        },
        "q": {
         "x": 1.33,
         "y": 0
        }
       },
       {
        "nombre": "17",
        "p": {
         "x": 5.49,
         "y": 13.35
        },
        "q": {
         "x": 5.49,
         "y": 0
        }
       }
      ],
      "columnas": [
       {
        "eje": "17/D",
        "centro": {
         "x": 5.49,
         "y": 3.34
        },
        "b": 0.24,
        "h": 0.5,
        "forma": "rectangular"
       },
       {
        "eje": "14/A",
        "centro": {
         "x": 1.33,
         "y": 11.97
        },
        "b": 1.76,
        "h": 0.8,
        "forma": "T"
       },
       {
        "eje": "17/A",
        "centro": {
         "x": 5.49,
         "y": 11.97
        },
        "b": 1.53,
        "h": 0.8,
        "forma": "T"
       },
       {
        "eje": null,
        "centro": {
         "x": 5.39,
         "y": 0.97
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 1.43,
         "y": 0.97
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    },
    {
     "id": "vista-04",
     "nivel": 1,
     "categorias": {
      "ejes": [
       {
        "nombre": "A",
        "p": {
         "x": 0,
         "y": 12.11
        },
        "q": {
         "x": 7.67,
         "y": 12.11
        }
       },
       {
        "nombre": "D",
        "p": {
         "x": 0,
         "y": 3.49
        },
        "q": {
         "x": 7.67,
         "y": 3.49
        }
       },
       {
        "nombre": "14",
        "p": {
         "x": 1.72,
         "y": 13.48
        },
        "q": {
         "x": 1.72,
         "y": 0
        }
       },
       {
        "nombre": "17",
        "p": {
         "x": 5.88,
         "y": 13.48
        },
        "q": {
         "x": 5.88,
         "y": 0
        }
       }
      ],
      "columnas": [
       {
        "eje": "14/D",
        "centro": {
         "x": 1.72,
         "y": 3.49
        },
        "b": 0.24,
        "h": 2.44,
        "forma": "rectangular"
       },
       {
        "eje": "17/D",
        "centro": {
         "x": 5.88,
         "y": 3.49
        },
        "b": 0.24,
        "h": 0.5,
        "forma": "rectangular"
       },
       {
        "eje": "14/A",
        "centro": {
         "x": 1.72,
         "y": 12.11
        },
        "b": 1.76,
        "h": 0.8,
        "forma": "T"
       },
       {
        "eje": "17/A",
        "centro": {
         "x": 5.88,
         "y": 12.11
        },
        "b": 1.53,
        "h": 0.8,
        "forma": "T"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    },
    {
     "id": "vista-05",
     "nivel": null,
     "categorias": {
      "ejes": [
       {
        "nombre": "A",
        "p": {
         "x": 0,
         "y": 12.11
        },
        "q": {
         "x": 7.67,
         "y": 12.11
        }
       },
       {
        "nombre": "D",
        "p": {
         "x": 0,
         "y": 3.49
        },
        "q": {
         "x": 7.67,
         "y": 3.49
        }
       },
       {
        "nombre": "14",
        "p": {
         "x": 1.72,
         "y": 14.25
        },
        "q": {
         "x": 1.72,
         "y": 0
        }
       },
       {
        "nombre": "17",
        "p": {
         "x": 5.88,
         "y": 14.25
        },
        "q": {
         "x": 5.88,
         "y": 0
        }
       }
      ],
      "columnas": [
       {
        "eje": "14/D",
        "centro": {
         "x": 1.72,
         "y": 3.49
        },
        "b": 0.24,
        "h": 2.23,
        "forma": "rectangular"
       },
       {
        "eje": "17/D",
        "centro": {
         "x": 5.88,
         "y": 3.49
        },
        "b": 0.24,
        "h": 0.5,
        "forma": "rectangular"
       },
       {
        "eje": "14/A",
        "centro": {
         "x": 1.72,
         "y": 12.11
        },
        "b": 0.24,
        "h": 0.59,
        "forma": "rectangular"
       },
       {
        "eje": "17/A",
        "centro": {
         "x": 5.88,
         "y": 12.11
        },
        "b": 0.24,
        "h": 0.59,
        "forma": "rectangular"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    },
    {
     "id": "vista-06",
     "nivel": 3,
     "categorias": {
      "ejes": [
       {
        "nombre": "A",
        "p": {
         "x": 0,
         "y": 11.92
        },
        "q": {
         "x": 6.92,
         "y": 11.92
        }
       },
       {
        "nombre": "D",
        "p": {
         "x": 0,
         "y": 3.29
        },
        "q": {
         "x": 6.92,
         "y": 3.29
        }
       },
       {
        "nombre": "14",
        "p": {
         "x": 1.33,
         "y": 13.13
        },
        "q": {
         "x": 1.33,
         "y": 0
        }
       },
       {
        "nombre": "17",
        "p": {
         "x": 5.49,
         "y": 13.13
        },
        "q": {
         "x": 5.49,
         "y": 0
        }
       }
      ],
      "columnas": [
       {
        "eje": "17/D",
        "centro": {
         "x": 5.49,
         "y": 3.29
        },
        "b": 0.24,
        "h": 0.5,
        "forma": "rectangular"
       },
       {
        "eje": "14/A",
        "centro": {
         "x": 1.33,
         "y": 11.92
        },
        "b": 1.76,
        "h": 0.8,
        "forma": "T"
       },
       {
        "eje": "17/A",
        "centro": {
         "x": 5.49,
         "y": 11.92
        },
        "b": 1.53,
        "h": 0.8,
        "forma": "T"
       },
       {
        "eje": null,
        "centro": {
         "x": 5.39,
         "y": 0.92
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 1.43,
         "y": 0.92
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 3.48,
         "y": 6.46
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    }
   ]
  }
 },
 {
  "nombre": "vinchos:modulo-04",
  "grupo": "vinchos",
  "id": "modulo-04",
  "etiqueta": null,
  "rasgos": {
   "vista": "vista-01",
   "areaAbierta": false,
   "niveles": 3,
   "ejes": {
    "x": 6,
    "y": 6
   },
   "luces": {
    "x": [
     2.82,
     0.92,
     3.81,
     0.65,
     2.08
    ],
    "y": [
     1.54,
     1.6,
     1.6,
     1.6,
     1.75
    ]
   },
   "largo": 10.28,
   "ancho": 8.09,
   "area": 83.15,
   "luzLosa": 1.75,
   "luzMax": 3.81,
   "columnas": 16,
   "tipos": [
    {
     "nombre": "C1",
     "forma": "rectangular",
     "b": 0.5,
     "h": 0.3,
     "n": 8
    },
    {
     "nombre": "PL1",
     "forma": "rectangular",
     "b": 1.8,
     "h": 0.3,
     "n": 2
    },
    {
     "nombre": "PL2",
     "forma": "rectangular",
     "b": 1.75,
     "h": 0.3,
     "n": 2
    },
    {
     "nombre": "PL3",
     "forma": "rectangular",
     "b": 1.99,
     "h": 0.3,
     "n": 1
    },
    {
     "nombre": "PL4",
     "forma": "rectangular",
     "b": 1.87,
     "h": 0.3,
     "n": 1
    },
    {
     "nombre": "PL5",
     "forma": "rectangular",
     "b": 1.9,
     "h": 0.3,
     "n": 1
    },
    {
     "nombre": "PL6",
     "forma": "rectangular",
     "b": 2.02,
     "h": 0.33,
     "n": 1
    }
   ],
   "placas": true,
   "columnetas": 4,
   "techoLiviano": true,
   "cubierta": true,
   "falsoCielo": true,
   "deportivo": false,
   "agua": false,
   "banos": true
  },
  "decisiones": {
   "cimentacion": "platea",
   "cimientoCorrido": true,
   "hz": null,
   "df": 2,
   "losa": "aligerada",
   "espesorLosa": 0.2,
   "plantasDeLosa": 3,
   "vigas": [
    "30x70",
    "30x40"
   ],
   "fcColumnas": 210,
   "fcColumnetas": 175,
   "estribos": "3/8\": 1@.05, 10@.10",
   "porticos": 7,
   "mallaCimentacion": true,
   "columnasComoArquitectura": true,
   "losaDeTecho": true
  },
  "geometria": {
   "version": 1,
   "unidad": "m",
   "vistas": [
    {
     "id": "vista-01",
     "nivel": null,
     "categorias": {
      "ejes": [
       {
        "nombre": "18",
        "p": {
         "x": 0.99,
         "y": 9.97
        },
        "q": {
         "x": 0.99,
         "y": 0
        }
       },
       {
        "nombre": "19",
        "p": {
         "x": 3.31,
         "y": 9.97
        },
        "q": {
         "x": 3.31,
         "y": 0
        }
       },
       {
        "nombre": "20",
        "p": {
         "x": 4.23,
         "y": 9.97
        },
        "q": {
         "x": 4.23,
         "y": 0
        }
       },
       {
        "nombre": "23",
        "p": {
         "x": 8.54,
         "y": 9.97
        },
        "q": {
         "x": 8.54,
         "y": 0
        }
       },
       {
        "nombre": "24",
        "p": {
         "x": 9.19,
         "y": 9.97
        },
        "q": {
         "x": 9.19,
         "y": 0
        }
       },
       {
        "nombre": "24´",
        "p": {
         "x": 11.27,
         "y": 9.97
        },
        "q": {
         "x": 11.27,
         "y": 0
        }
       },
       {
        "nombre": "B´",
        "p": {
         "x": 12.31,
         "y": 7.11
        },
        "q": {
         "x": 0,
         "y": 7.11
        }
       },
       {
        "nombre": "B´´",
        "p": {
         "x": 12.31,
         "y": 5.51
        },
        "q": {
         "x": 0,
         "y": 5.51
        }
       },
       {
        "nombre": "C",
        "p": {
         "x": 12.31,
         "y": 3.91
        },
        "q": {
         "x": 0,
         "y": 3.91
        }
       },
       {
        "nombre": "C´",
        "p": {
         "x": 12.31,
         "y": 2.31
        },
        "q": {
         "x": 0,
         "y": 2.31
        }
       },
       {
        "nombre": "D",
        "p": {
         "x": 12.31,
         "y": 0.77
        },
        "q": {
         "x": 0,
         "y": 0.77
        }
       },
       {
        "nombre": "B",
        "p": {
         "x": 12.31,
         "y": 8.86
        },
        "q": {
         "x": 0,
         "y": 8.86
        }
       }
      ],
      "columnas": [
       {
        "eje": "19/D",
        "centro": {
         "x": 3.31,
         "y": 0.77
        },
        "b": 1.99,
        "h": 0.3,
        "forma": "rectangular"
       },
       {
        "eje": "23/D",
        "centro": {
         "x": 8.54,
         "y": 0.77
        },
        "b": 1.8,
        "h": 0.3,
        "forma": "rectangular"
       },
       {
        "eje": "20/C´",
        "centro": {
         "x": 4.23,
         "y": 2.31
        },
        "b": 0.5,
        "h": 0.3,
        "forma": "rectangular"
       },
       {
        "eje": "24/C´",
        "centro": {
         "x": 9.19,
         "y": 2.31
        },
        "b": 0.5,
        "h": 0.3,
        "forma": "rectangular"
       },
       {
        "eje": "20/C",
        "centro": {
         "x": 4.23,
         "y": 3.91
        },
        "b": 0.5,
        "h": 0.3,
        "forma": "rectangular"
       },
       {
        "eje": "24/C",
        "centro": {
         "x": 9.19,
         "y": 3.91
        },
        "b": 0.5,
        "h": 0.3,
        "forma": "rectangular"
       },
       {
        "eje": "20/B´´",
        "centro": {
         "x": 4.23,
         "y": 5.51
        },
        "b": 0.5,
        "h": 0.3,
        "forma": "rectangular"
       },
       {
        "eje": "24/B´´",
        "centro": {
         "x": 9.19,
         "y": 5.51
        },
        "b": 0.5,
        "h": 0.3,
        "forma": "rectangular"
       },
       {
        "eje": "20/B´",
        "centro": {
         "x": 4.23,
         "y": 7.11
        },
        "b": 0.5,
        "h": 0.3,
        "forma": "rectangular"
       },
       {
        "eje": "24/B´",
        "centro": {
         "x": 9.19,
         "y": 7.11
        },
        "b": 0.5,
        "h": 0.3,
        "forma": "rectangular"
       },
       {
        "eje": "18/B´",
        "centro": {
         "x": 0.99,
         "y": 7.11
        },
        "b": 0.3,
        "h": 1.87,
        "forma": "rectangular"
       },
       {
        "eje": "19/B",
        "centro": {
         "x": 3.31,
         "y": 8.86
        },
        "b": 1.99,
        "h": 0.3,
        "forma": "rectangular"
       },
       {
        "eje": "23/B",
        "centro": {
         "x": 8.54,
         "y": 8.86
        },
        "b": 1.8,
        "h": 0.3,
        "forma": "rectangular"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    },
    {
     "id": "vista-02",
     "nivel": 1,
     "categorias": {
      "ejes": [
       {
        "nombre": "18",
        "p": {
         "x": 0.99,
         "y": 11.5
        },
        "q": {
         "x": 0.99,
         "y": 0
        }
       },
       {
        "nombre": "19",
        "p": {
         "x": 3.31,
         "y": 11.5
        },
        "q": {
         "x": 3.31,
         "y": 0
        }
       },
       {
        "nombre": "20",
        "p": {
         "x": 4.23,
         "y": 11.5
        },
        "q": {
         "x": 4.23,
         "y": 0
        }
       },
       {
        "nombre": "23",
        "p": {
         "x": 8.54,
         "y": 11.5
        },
        "q": {
         "x": 8.54,
         "y": 0
        }
       },
       {
        "nombre": "24",
        "p": {
         "x": 9.19,
         "y": 11.5
        },
        "q": {
         "x": 9.19,
         "y": 0
        }
       },
       {
        "nombre": "24´",
        "p": {
         "x": 11.27,
         "y": 11.5
        },
        "q": {
         "x": 11.27,
         "y": 0
        }
       },
       {
        "nombre": "B´",
        "p": {
         "x": 12.31,
         "y": 7.11
        },
        "q": {
         "x": 0,
         "y": 7.11
        }
       },
       {
        "nombre": "B´´",
        "p": {
         "x": 12.31,
         "y": 5.51
        },
        "q": {
         "x": 0,
         "y": 5.51
        }
       },
       {
        "nombre": "C",
        "p": {
         "x": 12.31,
         "y": 3.91
        },
        "q": {
         "x": 0,
         "y": 3.91
        }
       },
       {
        "nombre": "C´",
        "p": {
         "x": 12.31,
         "y": 2.31
        },
        "q": {
         "x": 0,
         "y": 2.31
        }
       },
       {
        "nombre": "D",
        "p": {
         "x": 12.31,
         "y": 0.77
        },
        "q": {
         "x": 0,
         "y": 0.77
        }
       },
       {
        "nombre": "B",
        "p": {
         "x": 12.31,
         "y": 8.86
        },
        "q": {
         "x": 0,
         "y": 8.86
        }
       }
      ],
      "columnas": [
       {
        "eje": "19/D",
        "centro": {
         "x": 3.31,
         "y": 0.77
        },
        "b": 1.99,
        "h": 0.3,
        "forma": "rectangular"
       },
       {
        "eje": "23/D",
        "centro": {
         "x": 8.54,
         "y": 0.77
        },
        "b": 1.8,
        "h": 0.3,
        "forma": "rectangular"
       },
       {
        "eje": "19/C´",
        "centro": {
         "x": 3.31,
         "y": 2.31
        },
        "b": 1.23,
        "h": 0.13,
        "forma": "rectangular"
       },
       {
        "eje": "24/C´",
        "centro": {
         "x": 9.19,
         "y": 2.31
        },
        "b": 0.5,
        "h": 0.3,
        "forma": "rectangular"
       },
       {
        "eje": "18/C",
        "centro": {
         "x": 0.99,
         "y": 3.91
        },
        "b": 0.24,
        "h": 1.91,
        "forma": "rectangular"
       },
       {
        "eje": "20/C",
        "centro": {
         "x": 4.23,
         "y": 3.91
        },
        "b": 0.5,
        "h": 0.3,
        "forma": "rectangular"
       },
       {
        "eje": "24/C",
        "centro": {
         "x": 9.19,
         "y": 3.91
        },
        "b": 0.5,
        "h": 0.3,
        "forma": "rectangular"
       },
       {
        "eje": "24´/C",
        "centro": {
         "x": 11.27,
         "y": 3.91
        },
        "b": 0.24,
        "h": 1.88,
        "forma": "rectangular"
       },
       {
        "eje": "19/B´´",
        "centro": {
         "x": 3.31,
         "y": 5.51
        },
        "b": 1.1,
        "h": 0.13,
        "forma": "rectangular"
       },
       {
        "eje": "24/B´´",
        "centro": {
         "x": 9.19,
         "y": 5.51
        },
        "b": 0.5,
        "h": 0.3,
        "forma": "rectangular"
       },
       {
        "eje": "18/B´´",
        "centro": {
         "x": 0.99,
         "y": 5.51
        },
        "b": 0.24,
        "h": 1.91,
        "forma": "rectangular"
       },
       {
        "eje": "24´/B´´",
        "centro": {
         "x": 11.27,
         "y": 5.51
        },
        "b": 0.24,
        "h": 1.91,
        "forma": "rectangular"
       },
       {
        "eje": "20/B´",
        "centro": {
         "x": 4.23,
         "y": 7.11
        },
        "b": 0.5,
        "h": 0.3,
        "forma": "rectangular"
       },
       {
        "eje": "24/B´",
        "centro": {
         "x": 9.19,
         "y": 7.11
        },
        "b": 0.5,
        "h": 0.3,
        "forma": "rectangular"
       },
       {
        "eje": "18/B´",
        "centro": {
         "x": 0.99,
         "y": 7.11
        },
        "b": 0.3,
        "h": 1.87,
        "forma": "rectangular"
       },
       {
        "eje": "19/B",
        "centro": {
         "x": 3.31,
         "y": 8.86
        },
        "b": 1.99,
        "h": 0.3,
        "forma": "rectangular"
       },
       {
        "eje": "23/B",
        "centro": {
         "x": 8.54,
         "y": 8.86
        },
        "b": 1.8,
        "h": 0.3,
        "forma": "rectangular"
       },
       {
        "eje": null,
        "centro": {
         "x": 4.93,
         "y": 8.8
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 4.93,
         "y": 8.63
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 7.51,
         "y": 8.63
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 7.51,
         "y": 8.8
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.81,
         "y": 7.03
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.81,
         "y": 7.2
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 10.84,
         "y": 7.03
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 10.84,
         "y": 7.2
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.81,
         "y": 5.43
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.81,
         "y": 5.6
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.81,
         "y": 3.83
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.81,
         "y": 4
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.81,
         "y": 2.23
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.81,
         "y": 2.4
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 10.9,
         "y": 3.83
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 10.9,
         "y": 4
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 5.1,
         "y": 7.2
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 5.1,
         "y": 7.03
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 5.1,
         "y": 5.6
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 5.1,
         "y": 5.43
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 5.1,
         "y": 4
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 5.1,
         "y": 3.83
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 5.1,
         "y": 2.4
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 5.1,
         "y": 2.23
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 4.93,
         "y": 0.84
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 7.51,
         "y": 0.84
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 10.84,
         "y": 0.84
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 1.11,
         "y": 2.65
        },
        "b": 0.24,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 1.11,
         "y": 6.87
        },
        "b": 0.24,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 1.11,
         "y": 4.76
        },
        "b": 0.24,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 2.89,
         "y": 8.44
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 4.35,
         "y": 5.43
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 4.35,
         "y": 5.6
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 3.05,
         "y": 5.43
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 3.05,
         "y": 5.6
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 2.89,
         "y": 5.25
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 2.89,
         "y": 2.43
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 4.35,
         "y": 2.23
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 4.35,
         "y": 2.4
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 2.92,
         "y": 2.23
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 9.56,
         "y": 7.2
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 9.56,
         "y": 7.03
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 9.56,
         "y": 4
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 9.56,
         "y": 3.83
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 11.15,
         "y": 2.65
        },
        "b": 0.24,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 11.15,
         "y": 6.84
        },
        "b": 0.24,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 11.15,
         "y": 4.72
        },
        "b": 0.24,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 1.07,
         "y": 8.99
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 11.19,
         "y": 8.99
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 7.78,
         "y": 10.46
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 4.48,
         "y": 10.46
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 1.11,
         "y": 10.46
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 11.15,
         "y": 10.46
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 1.42,
         "y": 2.23
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 2.7,
         "y": 2.23
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    },
    {
     "id": "vista-03",
     "nivel": 2,
     "categorias": {
      "ejes": [
       {
        "nombre": "B´´",
        "p": {
         "x": 12.31,
         "y": 7.97
        },
        "q": {
         "x": 0,
         "y": 7.97
        }
       },
       {
        "nombre": "C",
        "p": {
         "x": 12.31,
         "y": 6.37
        },
        "q": {
         "x": 0,
         "y": 6.37
        }
       },
       {
        "nombre": "C´",
        "p": {
         "x": 12.31,
         "y": 4.77
        },
        "q": {
         "x": 0,
         "y": 4.77
        }
       },
       {
        "nombre": "D",
        "p": {
         "x": 12.31,
         "y": 3.23
        },
        "q": {
         "x": 0,
         "y": 3.23
        }
       },
       {
        "nombre": "B´",
        "p": {
         "x": 12.31,
         "y": 9.57
        },
        "q": {
         "x": 0,
         "y": 9.57
        }
       },
       {
        "nombre": "B",
        "p": {
         "x": 12.31,
         "y": 11.32
        },
        "q": {
         "x": 0,
         "y": 11.32
        }
       },
       {
        "nombre": "18",
        "p": {
         "x": 0.99,
         "y": 13.96
        },
        "q": {
         "x": 0.99,
         "y": 0
        }
       },
       {
        "nombre": "19",
        "p": {
         "x": 3.31,
         "y": 13.96
        },
        "q": {
         "x": 3.31,
         "y": 0
        }
       },
       {
        "nombre": "20",
        "p": {
         "x": 4.23,
         "y": 13.96
        },
        "q": {
         "x": 4.23,
         "y": 0
        }
       },
       {
        "nombre": "23",
        "p": {
         "x": 8.54,
         "y": 13.96
        },
        "q": {
         "x": 8.54,
         "y": 0
        }
       },
       {
        "nombre": "24",
        "p": {
         "x": 9.19,
         "y": 13.96
        },
        "q": {
         "x": 9.19,
         "y": 0
        }
       },
       {
        "nombre": "24´",
        "p": {
         "x": 11.27,
         "y": 13.96
        },
        "q": {
         "x": 11.27,
         "y": 0
        }
       }
      ],
      "columnas": [
       {
        "eje": "19/D",
        "centro": {
         "x": 3.31,
         "y": 3.23
        },
        "b": 1.99,
        "h": 0.3,
        "forma": "rectangular"
       },
       {
        "eje": "23/D",
        "centro": {
         "x": 8.54,
         "y": 3.23
        },
        "b": 1.8,
        "h": 0.3,
        "forma": "rectangular"
       },
       {
        "eje": "19/C´",
        "centro": {
         "x": 3.31,
         "y": 4.77
        },
        "b": 1.23,
        "h": 0.13,
        "forma": "rectangular"
       },
       {
        "eje": "24/C´",
        "centro": {
         "x": 9.19,
         "y": 4.77
        },
        "b": 0.5,
        "h": 0.3,
        "forma": "rectangular"
       },
       {
        "eje": "18/C",
        "centro": {
         "x": 0.99,
         "y": 6.37
        },
        "b": 0.24,
        "h": 1.91,
        "forma": "rectangular"
       },
       {
        "eje": "20/C",
        "centro": {
         "x": 4.23,
         "y": 6.37
        },
        "b": 0.5,
        "h": 0.3,
        "forma": "rectangular"
       },
       {
        "eje": "24/C",
        "centro": {
         "x": 9.19,
         "y": 6.37
        },
        "b": 0.5,
        "h": 0.3,
        "forma": "rectangular"
       },
       {
        "eje": "24´/C",
        "centro": {
         "x": 11.27,
         "y": 6.37
        },
        "b": 0.24,
        "h": 1.88,
        "forma": "rectangular"
       },
       {
        "eje": "19/B´´",
        "centro": {
         "x": 3.31,
         "y": 7.97
        },
        "b": 1.1,
        "h": 0.13,
        "forma": "rectangular"
       },
       {
        "eje": "24/B´´",
        "centro": {
         "x": 9.19,
         "y": 7.97
        },
        "b": 0.5,
        "h": 0.3,
        "forma": "rectangular"
       },
       {
        "eje": "18/B´´",
        "centro": {
         "x": 0.99,
         "y": 7.97
        },
        "b": 0.24,
        "h": 1.91,
        "forma": "rectangular"
       },
       {
        "eje": "24´/B´´",
        "centro": {
         "x": 11.27,
         "y": 7.97
        },
        "b": 0.24,
        "h": 1.91,
        "forma": "rectangular"
       },
       {
        "eje": "20/B´",
        "centro": {
         "x": 4.23,
         "y": 9.57
        },
        "b": 0.5,
        "h": 0.3,
        "forma": "rectangular"
       },
       {
        "eje": "24/B´",
        "centro": {
         "x": 9.19,
         "y": 9.57
        },
        "b": 0.5,
        "h": 0.3,
        "forma": "rectangular"
       },
       {
        "eje": "18/B´",
        "centro": {
         "x": 0.99,
         "y": 9.57
        },
        "b": 0.3,
        "h": 1.87,
        "forma": "rectangular"
       },
       {
        "eje": "19/B",
        "centro": {
         "x": 3.31,
         "y": 11.32
        },
        "b": 1.99,
        "h": 0.3,
        "forma": "rectangular"
       },
       {
        "eje": "23/B",
        "centro": {
         "x": 8.54,
         "y": 11.32
        },
        "b": 1.8,
        "h": 0.3,
        "forma": "rectangular"
       },
       {
        "eje": null,
        "centro": {
         "x": 4.93,
         "y": 11.25
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 4.93,
         "y": 11.08
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 7.51,
         "y": 11.08
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 7.51,
         "y": 11.25
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.81,
         "y": 9.48
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.81,
         "y": 9.65
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 10.84,
         "y": 9.48
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 10.84,
         "y": 9.65
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.81,
         "y": 7.88
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.81,
         "y": 8.05
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.81,
         "y": 6.28
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.81,
         "y": 6.45
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.81,
         "y": 4.68
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.81,
         "y": 4.85
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 10.9,
         "y": 6.28
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 10.9,
         "y": 6.45
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 5.11,
         "y": 9.65
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 5.11,
         "y": 9.48
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 5.1,
         "y": 8.05
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 5.1,
         "y": 7.88
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 5.1,
         "y": 6.45
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 5.1,
         "y": 6.28
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 5.1,
         "y": 4.85
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 5.1,
         "y": 4.68
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 4.93,
         "y": 3.29
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 7.51,
         "y": 3.29
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 10.84,
         "y": 3.29
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 1.11,
         "y": 5.1
        },
        "b": 0.24,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 1.11,
         "y": 9.32
        },
        "b": 0.24,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 1.11,
         "y": 7.21
        },
        "b": 0.24,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 2.89,
         "y": 10.89
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 4.35,
         "y": 7.88
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 4.35,
         "y": 8.05
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 3.05,
         "y": 7.88
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 3.05,
         "y": 8.05
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 2.89,
         "y": 7.71
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 2.89,
         "y": 4.89
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 4.35,
         "y": 4.68
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 4.35,
         "y": 4.85
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 2.92,
         "y": 4.68
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 9.56,
         "y": 9.65
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 9.56,
         "y": 9.48
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 9.56,
         "y": 6.45
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 9.56,
         "y": 6.28
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 11.15,
         "y": 5.1
        },
        "b": 0.24,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 11.15,
         "y": 9.29
        },
        "b": 0.24,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 11.15,
         "y": 7.18
        },
        "b": 0.24,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 1.07,
         "y": 11.44
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 11.19,
         "y": 11.44
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 7.78,
         "y": 12.91
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 4.48,
         "y": 12.91
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 1.11,
         "y": 12.91
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 11.15,
         "y": 12.91
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 1.09,
         "y": 0.84
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 11.17,
         "y": 0.84
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 3.84,
         "y": 0.84
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.41,
         "y": 0.84
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 6.13,
         "y": 0.84
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.64,
         "y": 0.84
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 3.62,
         "y": 0.84
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    },
    {
     "id": "vista-04",
     "nivel": null,
     "categorias": {
      "ejes": [
       {
        "nombre": "B´",
        "p": {
         "x": 12.31,
         "y": 9.94
        },
        "q": {
         "x": 0,
         "y": 9.94
        }
       },
       {
        "nombre": "B´´",
        "p": {
         "x": 12.31,
         "y": 8.34
        },
        "q": {
         "x": 0,
         "y": 8.34
        }
       },
       {
        "nombre": "C",
        "p": {
         "x": 12.31,
         "y": 6.74
        },
        "q": {
         "x": 0,
         "y": 6.74
        }
       },
       {
        "nombre": "C´",
        "p": {
         "x": 12.31,
         "y": 5.14
        },
        "q": {
         "x": 0,
         "y": 5.14
        }
       },
       {
        "nombre": "D",
        "p": {
         "x": 12.31,
         "y": 3.6
        },
        "q": {
         "x": 0,
         "y": 3.6
        }
       },
       {
        "nombre": "B",
        "p": {
         "x": 12.31,
         "y": 11.69
        },
        "q": {
         "x": 0,
         "y": 11.69
        }
       },
       {
        "nombre": "18",
        "p": {
         "x": 0.99,
         "y": 14.79
        },
        "q": {
         "x": 0.99,
         "y": 0
        }
       },
       {
        "nombre": "19",
        "p": {
         "x": 3.31,
         "y": 14.79
        },
        "q": {
         "x": 3.31,
         "y": 0
        }
       },
       {
        "nombre": "20",
        "p": {
         "x": 4.23,
         "y": 14.79
        },
        "q": {
         "x": 4.23,
         "y": 0
        }
       },
       {
        "nombre": "23",
        "p": {
         "x": 8.54,
         "y": 14.79
        },
        "q": {
         "x": 8.54,
         "y": 0
        }
       },
       {
        "nombre": "24",
        "p": {
         "x": 9.19,
         "y": 14.79
        },
        "q": {
         "x": 9.19,
         "y": 0
        }
       },
       {
        "nombre": "24´",
        "p": {
         "x": 11.27,
         "y": 14.79
        },
        "q": {
         "x": 11.27,
         "y": 0
        }
       }
      ],
      "columnas": [
       {
        "eje": "18/D",
        "centro": {
         "x": 0.99,
         "y": 3.6
        },
        "b": 0.3,
        "h": 1.93,
        "forma": "rectangular"
       },
       {
        "eje": "24´/D",
        "centro": {
         "x": 11.27,
         "y": 3.6
        },
        "b": 0.3,
        "h": 1.93,
        "forma": "rectangular"
       },
       {
        "eje": "19/D",
        "centro": {
         "x": 3.31,
         "y": 3.6
        },
        "b": 1.99,
        "h": 0.3,
        "forma": "rectangular"
       },
       {
        "eje": "23/D",
        "centro": {
         "x": 8.54,
         "y": 3.6
        },
        "b": 1.8,
        "h": 0.3,
        "forma": "rectangular"
       },
       {
        "eje": "20/C´",
        "centro": {
         "x": 4.23,
         "y": 5.14
        },
        "b": 0.5,
        "h": 0.3,
        "forma": "rectangular"
       },
       {
        "eje": "24/C´",
        "centro": {
         "x": 9.19,
         "y": 5.14
        },
        "b": 0.5,
        "h": 0.3,
        "forma": "rectangular"
       },
       {
        "eje": "20/C",
        "centro": {
         "x": 4.23,
         "y": 6.74
        },
        "b": 0.5,
        "h": 0.3,
        "forma": "rectangular"
       },
       {
        "eje": "24/C",
        "centro": {
         "x": 9.19,
         "y": 6.74
        },
        "b": 0.5,
        "h": 0.3,
        "forma": "rectangular"
       },
       {
        "eje": "20/B´´",
        "centro": {
         "x": 4.23,
         "y": 8.34
        },
        "b": 0.5,
        "h": 0.3,
        "forma": "rectangular"
       },
       {
        "eje": "24/B´´",
        "centro": {
         "x": 9.19,
         "y": 8.34
        },
        "b": 0.5,
        "h": 0.3,
        "forma": "rectangular"
       },
       {
        "eje": "20/B´",
        "centro": {
         "x": 4.23,
         "y": 9.94
        },
        "b": 0.5,
        "h": 0.3,
        "forma": "rectangular"
       },
       {
        "eje": "24/B´",
        "centro": {
         "x": 9.19,
         "y": 9.94
        },
        "b": 0.5,
        "h": 0.3,
        "forma": "rectangular"
       },
       {
        "eje": "18/B´",
        "centro": {
         "x": 0.99,
         "y": 9.94
        },
        "b": 0.3,
        "h": 1.87,
        "forma": "rectangular"
       },
       {
        "eje": "19/B",
        "centro": {
         "x": 3.31,
         "y": 11.69
        },
        "b": 1.99,
        "h": 0.3,
        "forma": "rectangular"
       },
       {
        "eje": "23/B",
        "centro": {
         "x": 8.54,
         "y": 11.69
        },
        "b": 1.8,
        "h": 0.3,
        "forma": "rectangular"
       },
       {
        "eje": "18/B",
        "centro": {
         "x": 0.99,
         "y": 11.69
        },
        "b": 0.3,
        "h": 1.55,
        "forma": "rectangular"
       },
       {
        "eje": "24/B",
        "centro": {
         "x": 9.19,
         "y": 11.69
        },
        "b": 0.3,
        "h": 1.55,
        "forma": "rectangular"
       },
       {
        "eje": "24´/B",
        "centro": {
         "x": 11.27,
         "y": 11.69
        },
        "b": 0.3,
        "h": 1.55,
        "forma": "rectangular"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    },
    {
     "id": "vista-05",
     "nivel": 1,
     "categorias": {
      "ejes": [
       {
        "nombre": "18",
        "p": {
         "x": 0.99,
         "y": 11.5
        },
        "q": {
         "x": 0.99,
         "y": 0
        }
       },
       {
        "nombre": "19",
        "p": {
         "x": 3.31,
         "y": 11.5
        },
        "q": {
         "x": 3.31,
         "y": 0
        }
       },
       {
        "nombre": "20",
        "p": {
         "x": 4.23,
         "y": 11.5
        },
        "q": {
         "x": 4.23,
         "y": 0
        }
       },
       {
        "nombre": "23",
        "p": {
         "x": 8.54,
         "y": 11.5
        },
        "q": {
         "x": 8.54,
         "y": 0
        }
       },
       {
        "nombre": "24",
        "p": {
         "x": 9.19,
         "y": 11.5
        },
        "q": {
         "x": 9.19,
         "y": 0
        }
       },
       {
        "nombre": "24´",
        "p": {
         "x": 11.27,
         "y": 11.5
        },
        "q": {
         "x": 11.27,
         "y": 0
        }
       },
       {
        "nombre": "B´",
        "p": {
         "x": 12.31,
         "y": 7.11
        },
        "q": {
         "x": 0,
         "y": 7.11
        }
       },
       {
        "nombre": "B´´",
        "p": {
         "x": 12.31,
         "y": 5.51
        },
        "q": {
         "x": 0,
         "y": 5.51
        }
       },
       {
        "nombre": "C",
        "p": {
         "x": 12.31,
         "y": 3.91
        },
        "q": {
         "x": 0,
         "y": 3.91
        }
       },
       {
        "nombre": "C´",
        "p": {
         "x": 12.31,
         "y": 2.31
        },
        "q": {
         "x": 0,
         "y": 2.31
        }
       },
       {
        "nombre": "D",
        "p": {
         "x": 12.31,
         "y": 0.77
        },
        "q": {
         "x": 0,
         "y": 0.77
        }
       },
       {
        "nombre": "B",
        "p": {
         "x": 12.31,
         "y": 8.86
        },
        "q": {
         "x": 0,
         "y": 8.86
        }
       }
      ],
      "columnas": [
       {
        "eje": "19/D",
        "centro": {
         "x": 3.31,
         "y": 0.77
        },
        "b": 1.99,
        "h": 0.3,
        "forma": "rectangular"
       },
       {
        "eje": "23/D",
        "centro": {
         "x": 8.54,
         "y": 0.77
        },
        "b": 1.8,
        "h": 0.3,
        "forma": "rectangular"
       },
       {
        "eje": "24´/D",
        "centro": {
         "x": 11.27,
         "y": 0.77
        },
        "b": 1.53,
        "h": 0.3,
        "forma": "rectangular"
       },
       {
        "eje": "20/C´",
        "centro": {
         "x": 4.23,
         "y": 2.31
        },
        "b": 0.5,
        "h": 0.3,
        "forma": "rectangular"
       },
       {
        "eje": "24/C´",
        "centro": {
         "x": 9.19,
         "y": 2.31
        },
        "b": 0.5,
        "h": 0.3,
        "forma": "rectangular"
       },
       {
        "eje": "24´/C´",
        "centro": {
         "x": 11.27,
         "y": 2.31
        },
        "b": 1.53,
        "h": 0.3,
        "forma": "rectangular"
       },
       {
        "eje": "20/C",
        "centro": {
         "x": 4.23,
         "y": 3.91
        },
        "b": 0.5,
        "h": 0.3,
        "forma": "rectangular"
       },
       {
        "eje": "24/C",
        "centro": {
         "x": 9.19,
         "y": 3.91
        },
        "b": 0.5,
        "h": 0.3,
        "forma": "rectangular"
       },
       {
        "eje": "24´/C",
        "centro": {
         "x": 11.27,
         "y": 3.91
        },
        "b": 1.53,
        "h": 0.3,
        "forma": "rectangular"
       },
       {
        "eje": "20/B´´",
        "centro": {
         "x": 4.23,
         "y": 5.51
        },
        "b": 0.5,
        "h": 0.3,
        "forma": "rectangular"
       },
       {
        "eje": "24/B´´",
        "centro": {
         "x": 9.19,
         "y": 5.51
        },
        "b": 0.5,
        "h": 0.3,
        "forma": "rectangular"
       },
       {
        "eje": "24´/B´´",
        "centro": {
         "x": 11.27,
         "y": 5.51
        },
        "b": 1.53,
        "h": 0.3,
        "forma": "rectangular"
       },
       {
        "eje": "20/B´",
        "centro": {
         "x": 4.23,
         "y": 7.11
        },
        "b": 0.5,
        "h": 0.3,
        "forma": "rectangular"
       },
       {
        "eje": "24/B´",
        "centro": {
         "x": 9.19,
         "y": 7.11
        },
        "b": 0.5,
        "h": 0.3,
        "forma": "rectangular"
       },
       {
        "eje": "24´/B´",
        "centro": {
         "x": 11.27,
         "y": 7.11
        },
        "b": 1.53,
        "h": 0.3,
        "forma": "rectangular"
       },
       {
        "eje": "18/B´",
        "centro": {
         "x": 0.99,
         "y": 7.11
        },
        "b": 0.3,
        "h": 1.87,
        "forma": "rectangular"
       },
       {
        "eje": "19/B",
        "centro": {
         "x": 3.31,
         "y": 8.86
        },
        "b": 1.99,
        "h": 0.3,
        "forma": "rectangular"
       },
       {
        "eje": "23/B",
        "centro": {
         "x": 8.54,
         "y": 8.86
        },
        "b": 1.8,
        "h": 0.3,
        "forma": "rectangular"
       },
       {
        "eje": "18/B",
        "centro": {
         "x": 0.99,
         "y": 8.86
        },
        "b": 0.3,
        "h": 1.66,
        "forma": "rectangular"
       },
       {
        "eje": "24´/B",
        "centro": {
         "x": 11.27,
         "y": 8.86
        },
        "b": 0.3,
        "h": 1.66,
        "forma": "rectangular"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    }
   ]
  }
 },
 {
  "nombre": "vinchos:modulo-05",
  "grupo": "vinchos",
  "id": "modulo-05",
  "etiqueta": null,
  "rasgos": {
   "vista": "vista-01",
   "areaAbierta": false,
   "niveles": 3,
   "ejes": {
    "x": 6,
    "y": 2
   },
   "luces": {
    "x": [
     4.34,
     4.21,
     4.21,
     5.1,
     4.2
    ],
    "y": [
     7.43
    ]
   },
   "largo": 22.07,
   "ancho": 7.43,
   "area": 163.95,
   "luzLosa": 5.1,
   "luzMax": 7.43,
   "columnas": 12,
   "tipos": [
    {
     "nombre": "CT1",
     "forma": "T",
     "b": 1,
     "h": 0.6,
     "n": 6
    },
    {
     "nombre": "C1",
     "forma": "L",
     "b": 1,
     "h": 0.6,
     "n": 2
    },
    {
     "nombre": "PL1",
     "forma": "L",
     "b": 1.5,
     "h": 1,
     "n": 1
    },
    {
     "nombre": "PL2",
     "forma": "L",
     "b": 1.5,
     "h": 0.5,
     "n": 1
    },
    {
     "nombre": "PL3",
     "forma": "L",
     "b": 1.8,
     "h": 1,
     "n": 1
    },
    {
     "nombre": "PL4",
     "forma": "T",
     "b": 1.5,
     "h": 0.5,
     "n": 1
    }
   ],
   "placas": true,
   "columnetas": 50,
   "techoLiviano": true,
   "cubierta": true,
   "falsoCielo": true,
   "deportivo": false,
   "agua": false,
   "banos": true
  },
  "decisiones": {
   "cimentacion": "platea",
   "cimientoCorrido": true,
   "hz": 0.7,
   "df": 2,
   "losa": "aligerada y maciza",
   "espesorLosa": 0.2,
   "plantasDeLosa": 3,
   "vigas": [
    "30x60",
    "30x40"
   ],
   "fcColumnas": 210,
   "fcColumnetas": 175,
   "estribos": "3/8\": 1@.05, 10@.10",
   "porticos": 7,
   "mallaCimentacion": false,
   "columnasComoArquitectura": true,
   "losaDeTecho": true
  },
  "geometria": {
   "version": 1,
   "unidad": "m",
   "vistas": [
    {
     "id": "vista-01",
     "nivel": null,
     "categorias": {
      "ejes": [
       {
        "nombre": "25",
        "p": {
         "x": 1.11,
         "y": 0
        },
        "q": {
         "x": 1.11,
         "y": 9.63
        }
       },
       {
        "nombre": "28",
        "p": {
         "x": 5.46,
         "y": 0
        },
        "q": {
         "x": 5.46,
         "y": 9.63
        }
       },
       {
        "nombre": "30",
        "p": {
         "x": 9.67,
         "y": 0
        },
        "q": {
         "x": 9.67,
         "y": 9.63
        }
       },
       {
        "nombre": "31",
        "p": {
         "x": 13.88,
         "y": 0
        },
        "q": {
         "x": 13.88,
         "y": 9.63
        }
       },
       {
        "nombre": "33",
        "p": {
         "x": 18.97,
         "y": 0
        },
        "q": {
         "x": 18.97,
         "y": 9.63
        }
       },
       {
        "nombre": "34",
        "p": {
         "x": 23.18,
         "y": 0
        },
        "q": {
         "x": 23.18,
         "y": 9.63
        }
       },
       {
        "nombre": "D",
        "p": {
         "x": 0,
         "y": 1.18
        },
        "q": {
         "x": 24.72,
         "y": 1.18
        }
       },
       {
        "nombre": "B",
        "p": {
         "x": 24.72,
         "y": 8.61
        },
        "q": {
         "x": 0,
         "y": 8.61
        }
       }
      ],
      "columnas": [
       {
        "eje": "28/D",
        "centro": {
         "x": 5.46,
         "y": 1.18
        },
        "b": 1,
        "h": 0.6,
        "forma": "T"
       },
       {
        "eje": "30/D",
        "centro": {
         "x": 9.67,
         "y": 1.18
        },
        "b": 1,
        "h": 0.6,
        "forma": "T"
       },
       {
        "eje": "31/D",
        "centro": {
         "x": 13.88,
         "y": 1.18
        },
        "b": 1,
        "h": 0.6,
        "forma": "T"
       },
       {
        "eje": "33/D",
        "centro": {
         "x": 18.97,
         "y": 1.18
        },
        "b": 1,
        "h": 0.6,
        "forma": "L"
       },
       {
        "eje": "25/D",
        "centro": {
         "x": 1.11,
         "y": 1.18
        },
        "b": 1,
        "h": 1.8,
        "forma": "L"
       },
       {
        "eje": "34/D",
        "centro": {
         "x": 23.18,
         "y": 1.18
        },
        "b": 0.5,
        "h": 1.5,
        "forma": "T"
       },
       {
        "eje": "25/B",
        "centro": {
         "x": 1.11,
         "y": 8.61
        },
        "b": 1,
        "h": 1.5,
        "forma": "L"
       },
       {
        "eje": "34/B",
        "centro": {
         "x": 23.18,
         "y": 8.61
        },
        "b": 0.5,
        "h": 1.5,
        "forma": "L"
       },
       {
        "eje": "28/B",
        "centro": {
         "x": 5.46,
         "y": 8.61
        },
        "b": 1,
        "h": 0.6,
        "forma": "T"
       },
       {
        "eje": "30/B",
        "centro": {
         "x": 9.67,
         "y": 8.61
        },
        "b": 1,
        "h": 0.6,
        "forma": "T"
       },
       {
        "eje": "31/B",
        "centro": {
         "x": 13.88,
         "y": 8.61
        },
        "b": 1,
        "h": 0.6,
        "forma": "T"
       },
       {
        "eje": "33/B",
        "centro": {
         "x": 18.97,
         "y": 8.61
        },
        "b": 1,
        "h": 0.6,
        "forma": "L"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    },
    {
     "id": "vista-02",
     "nivel": 2,
     "categorias": {
      "ejes": [
       {
        "nombre": "25",
        "p": {
         "x": 0.81,
         "y": 8.39
        },
        "q": {
         "x": 0.81,
         "y": 0
        }
       },
       {
        "nombre": "28",
        "p": {
         "x": 3.71,
         "y": 8.39
        },
        "q": {
         "x": 3.71,
         "y": 0
        }
       },
       {
        "nombre": "30",
        "p": {
         "x": 6.51,
         "y": 8.39
        },
        "q": {
         "x": 6.51,
         "y": 0
        }
       },
       {
        "nombre": "31",
        "p": {
         "x": 9.32,
         "y": 8.39
        },
        "q": {
         "x": 9.32,
         "y": 0
        }
       },
       {
        "nombre": "33",
        "p": {
         "x": 12.72,
         "y": 8.39
        },
        "q": {
         "x": 12.72,
         "y": 0
        }
       },
       {
        "nombre": "34",
        "p": {
         "x": 15.52,
         "y": 8.39
        },
        "q": {
         "x": 15.52,
         "y": 0
        }
       },
       {
        "nombre": "B",
        "p": {
         "x": 0,
         "y": 7.49
        },
        "q": {
         "x": 16.34,
         "y": 7.49
        }
       },
       {
        "nombre": "D",
        "p": {
         "x": 0,
         "y": 2.53
        },
        "q": {
         "x": 16.34,
         "y": 2.53
        }
       }
      ],
      "columnas": [
       {
        "eje": "28/D",
        "centro": {
         "x": 3.71,
         "y": 2.53
        },
        "b": 0.67,
        "h": 0.4,
        "forma": "T"
       },
       {
        "eje": "30/D",
        "centro": {
         "x": 6.51,
         "y": 2.53
        },
        "b": 0.67,
        "h": 0.4,
        "forma": "T"
       },
       {
        "eje": "31/D",
        "centro": {
         "x": 9.32,
         "y": 2.53
        },
        "b": 0.67,
        "h": 0.4,
        "forma": "T"
       },
       {
        "eje": "33/D",
        "centro": {
         "x": 12.72,
         "y": 2.53
        },
        "b": 0.67,
        "h": 0.4,
        "forma": "L"
       },
       {
        "eje": "25/D",
        "centro": {
         "x": 0.81,
         "y": 2.53
        },
        "b": 0.67,
        "h": 1.2,
        "forma": "L"
       },
       {
        "eje": "34/D",
        "centro": {
         "x": 15.52,
         "y": 2.53
        },
        "b": 0.33,
        "h": 1,
        "forma": "T"
       },
       {
        "eje": "25/B",
        "centro": {
         "x": 0.81,
         "y": 7.49
        },
        "b": 0.67,
        "h": 1,
        "forma": "L"
       },
       {
        "eje": "28/B",
        "centro": {
         "x": 3.71,
         "y": 7.49
        },
        "b": 0.67,
        "h": 0.4,
        "forma": "T"
       },
       {
        "eje": "30/B",
        "centro": {
         "x": 6.51,
         "y": 7.49
        },
        "b": 0.67,
        "h": 0.4,
        "forma": "T"
       },
       {
        "eje": "31/B",
        "centro": {
         "x": 9.32,
         "y": 7.49
        },
        "b": 0.67,
        "h": 0.4,
        "forma": "T"
       },
       {
        "eje": "33/B",
        "centro": {
         "x": 12.72,
         "y": 7.49
        },
        "b": 0.67,
        "h": 0.4,
        "forma": "L"
       },
       {
        "eje": "34/B",
        "centro": {
         "x": 15.52,
         "y": 7.49
        },
        "b": 0.33,
        "h": 1,
        "forma": "L"
       },
       {
        "eje": null,
        "centro": {
         "x": 15.31,
         "y": 5.05
        },
        "b": 0.16,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 12.7,
         "y": 5.05
        },
        "b": 0.16,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 0.89,
         "y": 3.82
        },
        "b": 0.16,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 0.89,
         "y": 6.4
        },
        "b": 0.16,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 15.31,
         "y": 3.62
        },
        "b": 0.16,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 15.31,
         "y": 6.4
        },
        "b": 0.16,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 12.7,
         "y": 7
        },
        "b": 0.16,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 12.7,
         "y": 3.02
        },
        "b": 0.16,
        "h": 0.13,
        "forma": "columneta"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    },
    {
     "id": "vista-03",
     "nivel": 1,
     "categorias": {
      "ejes": [
       {
        "nombre": "34",
        "p": {
         "x": 15.86,
         "y": 8.44
        },
        "q": {
         "x": 15.86,
         "y": 0
        }
       },
       {
        "nombre": "30",
        "p": {
         "x": 6.85,
         "y": 8.44
        },
        "q": {
         "x": 6.85,
         "y": 0
        }
       },
       {
        "nombre": "25",
        "p": {
         "x": 1.15,
         "y": 8.44
        },
        "q": {
         "x": 1.15,
         "y": 0
        }
       },
       {
        "nombre": "28",
        "p": {
         "x": 4.04,
         "y": 8.44
        },
        "q": {
         "x": 4.04,
         "y": 0
        }
       },
       {
        "nombre": "31",
        "p": {
         "x": 9.65,
         "y": 8.44
        },
        "q": {
         "x": 9.65,
         "y": 0
        }
       },
       {
        "nombre": "33",
        "p": {
         "x": 13.05,
         "y": 8.44
        },
        "q": {
         "x": 13.05,
         "y": 0
        }
       },
       {
        "nombre": "D",
        "p": {
         "x": 16.87,
         "y": 2.56
        },
        "q": {
         "x": 0,
         "y": 2.56
        }
       },
       {
        "nombre": "B",
        "p": {
         "x": 16.87,
         "y": 7.51
        },
        "q": {
         "x": 0,
         "y": 7.51
        }
       }
      ],
      "columnas": [],
      "murosVanos": null,
      "losas": null
     }
    },
    {
     "id": "vista-04",
     "nivel": null,
     "categorias": {
      "ejes": [
       {
        "nombre": "25",
        "p": {
         "x": 1.22,
         "y": 10.15
        },
        "q": {
         "x": 1.22,
         "y": 0
        }
       },
       {
        "nombre": "28",
        "p": {
         "x": 5.56,
         "y": 10.15
        },
        "q": {
         "x": 5.56,
         "y": 0
        }
       },
       {
        "nombre": "30",
        "p": {
         "x": 9.77,
         "y": 10.15
        },
        "q": {
         "x": 9.77,
         "y": 0
        }
       },
       {
        "nombre": "31",
        "p": {
         "x": 13.98,
         "y": 10.15
        },
        "q": {
         "x": 13.98,
         "y": 0
        }
       },
       {
        "nombre": "33",
        "p": {
         "x": 19.08,
         "y": 10.15
        },
        "q": {
         "x": 19.08,
         "y": 0
        }
       },
       {
        "nombre": "34",
        "p": {
         "x": 23.28,
         "y": 10.15
        },
        "q": {
         "x": 23.28,
         "y": 0
        }
       },
       {
        "nombre": "B",
        "p": {
         "x": 0,
         "y": 8.79
        },
        "q": {
         "x": 24.5,
         "y": 8.79
        }
       },
       {
        "nombre": "D",
        "p": {
         "x": 0,
         "y": 1.36
        },
        "q": {
         "x": 24.5,
         "y": 1.36
        }
       }
      ],
      "columnas": [
       {
        "eje": "28/D",
        "centro": {
         "x": 5.56,
         "y": 1.36
        },
        "b": 1,
        "h": 0.6,
        "forma": "T"
       },
       {
        "eje": "30/D",
        "centro": {
         "x": 9.77,
         "y": 1.36
        },
        "b": 1,
        "h": 0.6,
        "forma": "T"
       },
       {
        "eje": "31/D",
        "centro": {
         "x": 13.98,
         "y": 1.36
        },
        "b": 1,
        "h": 0.6,
        "forma": "T"
       },
       {
        "eje": "33/D",
        "centro": {
         "x": 19.08,
         "y": 1.36
        },
        "b": 1,
        "h": 0.6,
        "forma": "L"
       },
       {
        "eje": "25/D",
        "centro": {
         "x": 1.22,
         "y": 1.36
        },
        "b": 1,
        "h": 1.8,
        "forma": "L"
       },
       {
        "eje": "34/D",
        "centro": {
         "x": 23.28,
         "y": 1.36
        },
        "b": 0.5,
        "h": 1.5,
        "forma": "T"
       },
       {
        "eje": "25/B",
        "centro": {
         "x": 1.22,
         "y": 8.79
        },
        "b": 1,
        "h": 1.5,
        "forma": "L"
       },
       {
        "eje": "34/B",
        "centro": {
         "x": 23.28,
         "y": 8.79
        },
        "b": 0.5,
        "h": 1.5,
        "forma": "L"
       },
       {
        "eje": "28/B",
        "centro": {
         "x": 5.56,
         "y": 8.79
        },
        "b": 1,
        "h": 0.6,
        "forma": "T"
       },
       {
        "eje": "30/B",
        "centro": {
         "x": 9.77,
         "y": 8.79
        },
        "b": 1,
        "h": 0.6,
        "forma": "T"
       },
       {
        "eje": "31/B",
        "centro": {
         "x": 13.98,
         "y": 8.79
        },
        "b": 1,
        "h": 0.6,
        "forma": "T"
       },
       {
        "eje": "33/B",
        "centro": {
         "x": 19.08,
         "y": 8.79
        },
        "b": 1,
        "h": 0.6,
        "forma": "L"
       },
       {
        "eje": null,
        "centro": {
         "x": 2.63,
         "y": 7.49
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 4.63,
         "y": 7.49
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 4.94,
         "y": 8.72
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 3.48,
         "y": 6.1
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 3.48,
         "y": 8.69
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 4.55,
         "y": 6.07
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 3.93,
         "y": 5.01
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 1.34,
         "y": 5.01
        },
        "b": 0.24,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.88,
         "y": 1.42
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 5.65,
         "y": 5.07
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 12.15,
         "y": 5.07
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 3.96,
         "y": 1.46
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 12.15,
         "y": 8.69
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 12.15,
         "y": 1.46
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 22.96,
         "y": 7.16
        },
        "b": 0.24,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 22.96,
         "y": 5.13
        },
        "b": 0.24,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 19.05,
         "y": 5.13
        },
        "b": 0.24,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 3.51,
         "y": 7.49
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 3.96,
         "y": 4.01
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 22.74,
         "y": 3.74
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 21.07,
         "y": 3.74
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 6.18,
         "y": 8.72
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 2.34,
         "y": 8.72
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 9.15,
         "y": 8.72
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 10.4,
         "y": 8.72
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.36,
         "y": 8.72
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 14.61,
         "y": 8.72
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 18.1,
         "y": 8.72
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 19.35,
         "y": 8.72
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 22.66,
         "y": 8.72
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 22.96,
         "y": 2.98
        },
        "b": 0.24,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 19.05,
         "y": 8.06
        },
        "b": 0.24,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 19.05,
         "y": 2.08
        },
        "b": 0.24,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 9.15,
         "y": 1.42
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.36,
         "y": 1.42
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 14.61,
         "y": 1.42
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 6.19,
         "y": 1.42
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 1.34,
         "y": 3.28
        },
        "b": 0.24,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 1.34,
         "y": 7.16
        },
        "b": 0.24,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 18.1,
         "y": 1.42
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 1.56,
         "y": 3.8
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    },
    {
     "id": "vista-05",
     "nivel": 3,
     "categorias": {
      "ejes": [
       {
        "nombre": "25",
        "p": {
         "x": 0.81,
         "y": 8.39
        },
        "q": {
         "x": 0.81,
         "y": 0
        }
       },
       {
        "nombre": "28",
        "p": {
         "x": 3.71,
         "y": 8.39
        },
        "q": {
         "x": 3.71,
         "y": 0
        }
       },
       {
        "nombre": "30",
        "p": {
         "x": 6.51,
         "y": 8.39
        },
        "q": {
         "x": 6.51,
         "y": 0
        }
       },
       {
        "nombre": "31",
        "p": {
         "x": 9.32,
         "y": 8.39
        },
        "q": {
         "x": 9.32,
         "y": 0
        }
       },
       {
        "nombre": "33",
        "p": {
         "x": 12.72,
         "y": 8.39
        },
        "q": {
         "x": 12.72,
         "y": 0
        }
       },
       {
        "nombre": "34",
        "p": {
         "x": 15.52,
         "y": 8.39
        },
        "q": {
         "x": 15.52,
         "y": 0
        }
       },
       {
        "nombre": "B",
        "p": {
         "x": 0,
         "y": 7.49
        },
        "q": {
         "x": 16.34,
         "y": 7.49
        }
       },
       {
        "nombre": "D",
        "p": {
         "x": 0,
         "y": 2.53
        },
        "q": {
         "x": 16.34,
         "y": 2.53
        }
       }
      ],
      "columnas": [
       {
        "eje": "28/D",
        "centro": {
         "x": 3.71,
         "y": 2.53
        },
        "b": 0.67,
        "h": 0.4,
        "forma": "T"
       },
       {
        "eje": "30/D",
        "centro": {
         "x": 6.51,
         "y": 2.53
        },
        "b": 0.67,
        "h": 0.4,
        "forma": "T"
       },
       {
        "eje": "31/D",
        "centro": {
         "x": 9.32,
         "y": 2.53
        },
        "b": 0.67,
        "h": 0.4,
        "forma": "T"
       },
       {
        "eje": "33/D",
        "centro": {
         "x": 12.72,
         "y": 2.53
        },
        "b": 0.67,
        "h": 0.4,
        "forma": "L"
       },
       {
        "eje": "25/D",
        "centro": {
         "x": 0.81,
         "y": 2.53
        },
        "b": 0.67,
        "h": 1.2,
        "forma": "L"
       },
       {
        "eje": "34/D",
        "centro": {
         "x": 15.52,
         "y": 2.53
        },
        "b": 0.33,
        "h": 1,
        "forma": "T"
       },
       {
        "eje": "25/B",
        "centro": {
         "x": 0.81,
         "y": 7.49
        },
        "b": 0.67,
        "h": 1,
        "forma": "L"
       },
       {
        "eje": "28/B",
        "centro": {
         "x": 3.71,
         "y": 7.49
        },
        "b": 0.67,
        "h": 0.4,
        "forma": "T"
       },
       {
        "eje": "30/B",
        "centro": {
         "x": 6.51,
         "y": 7.49
        },
        "b": 0.67,
        "h": 0.4,
        "forma": "T"
       },
       {
        "eje": "31/B",
        "centro": {
         "x": 9.32,
         "y": 7.49
        },
        "b": 0.67,
        "h": 0.4,
        "forma": "T"
       },
       {
        "eje": "33/B",
        "centro": {
         "x": 12.72,
         "y": 7.49
        },
        "b": 0.67,
        "h": 0.4,
        "forma": "L"
       },
       {
        "eje": "34/B",
        "centro": {
         "x": 15.52,
         "y": 7.49
        },
        "b": 0.33,
        "h": 1,
        "forma": "L"
       },
       {
        "eje": null,
        "centro": {
         "x": 0.89,
         "y": 6.4
        },
        "b": 0.16,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 15.31,
         "y": 5.05
        },
        "b": 0.16,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 12.7,
         "y": 5.05
        },
        "b": 0.16,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 0.89,
         "y": 3.82
        },
        "b": 0.16,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 12.7,
         "y": 3.02
        },
        "b": 0.16,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 15.31,
         "y": 3.62
        },
        "b": 0.16,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 12.7,
         "y": 7
        },
        "b": 0.16,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 15.31,
         "y": 6.4
        },
        "b": 0.16,
        "h": 0.13,
        "forma": "columneta"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    },
    {
     "id": "vista-06",
     "nivel": 3,
     "categorias": {
      "ejes": [
       {
        "nombre": "34",
        "p": {
         "x": 15.86,
         "y": 9.18
        },
        "q": {
         "x": 15.86,
         "y": 0
        }
       },
       {
        "nombre": "25",
        "p": {
         "x": 1.15,
         "y": 9.18
        },
        "q": {
         "x": 1.15,
         "y": 0
        }
       },
       {
        "nombre": "28",
        "p": {
         "x": 4.04,
         "y": 9.18
        },
        "q": {
         "x": 4.04,
         "y": 0
        }
       },
       {
        "nombre": "30",
        "p": {
         "x": 6.85,
         "y": 9.18
        },
        "q": {
         "x": 6.85,
         "y": 0
        }
       },
       {
        "nombre": "31",
        "p": {
         "x": 9.65,
         "y": 9.18
        },
        "q": {
         "x": 9.65,
         "y": 0
        }
       },
       {
        "nombre": "33",
        "p": {
         "x": 13.05,
         "y": 9.18
        },
        "q": {
         "x": 13.05,
         "y": 0
        }
       },
       {
        "nombre": "D",
        "p": {
         "x": 17.41,
         "y": 2.56
        },
        "q": {
         "x": 0,
         "y": 2.56
        }
       },
       {
        "nombre": "B",
        "p": {
         "x": 17.41,
         "y": 7.51
        },
        "q": {
         "x": 0,
         "y": 7.51
        }
       }
      ],
      "columnas": [],
      "murosVanos": null,
      "losas": null
     }
    }
   ]
  }
 },
 {
  "nombre": "vinchos:modulo-06",
  "grupo": "vinchos",
  "id": "modulo-06",
  "etiqueta": null,
  "rasgos": {
   "vista": "vista-01",
   "areaAbierta": false,
   "niveles": 2,
   "ejes": {
    "x": 3,
    "y": 2
   },
   "luces": {
    "x": [
     3.02,
     3.02
    ],
    "y": [
     5.99
    ]
   },
   "largo": 6.04,
   "ancho": 5.99,
   "area": 36.23,
   "luzLosa": 3.02,
   "luzMax": 5.99,
   "columnas": 6,
   "tipos": [
    {
     "nombre": "C1",
     "forma": "L",
     "b": 0.5,
     "h": 0.5,
     "n": 4
    },
    {
     "nombre": "CT1",
     "forma": "T",
     "b": 0.5,
     "h": 0.5,
     "n": 2
    }
   ],
   "placas": false,
   "columnetas": 3,
   "techoLiviano": true,
   "cubierta": true,
   "falsoCielo": true,
   "deportivo": true,
   "agua": false,
   "banos": true
  },
  "decisiones": {
   "cimentacion": "platea",
   "cimientoCorrido": true,
   "hz": 0.7,
   "df": 6,
   "losa": "aligerada y maciza",
   "espesorLosa": 0.2,
   "plantasDeLosa": 2,
   "vigas": [
    "40x70"
   ],
   "fcColumnas": 280,
   "fcColumnetas": 175,
   "estribos": "3/8\": 1@.05, 10@.10",
   "porticos": 0,
   "mallaCimentacion": true,
   "columnasComoArquitectura": true,
   "losaDeTecho": true
  },
  "geometria": {
   "version": 1,
   "unidad": "m",
   "vistas": [
    {
     "id": "vista-01",
     "nivel": null,
     "categorias": {
      "ejes": [
       {
        "nombre": "35",
        "p": {
         "x": 6.84,
         "y": 7.73
        },
        "q": {
         "x": 6.84,
         "y": 0
        }
       },
       {
        "nombre": "37´",
        "p": {
         "x": 3.83,
         "y": 7.73
        },
        "q": {
         "x": 3.83,
         "y": 0
        }
       },
       {
        "nombre": "33",
        "p": {
         "x": 0.82,
         "y": 7.73
        },
        "q": {
         "x": 0.82,
         "y": 0
        }
       },
       {
        "nombre": "H",
        "p": {
         "x": 7.75,
         "y": 0.86
        },
        "q": {
         "x": 0,
         "y": 0.86
        }
       },
       {
        "nombre": "E",
        "p": {
         "x": 7.75,
         "y": 6.85
        },
        "q": {
         "x": 0,
         "y": 6.85
        }
       }
      ],
      "columnas": [
       {
        "eje": "33/H",
        "centro": {
         "x": 0.82,
         "y": 0.86
        },
        "b": 0.5,
        "h": 0.5,
        "forma": "L"
       },
       {
        "eje": "37´/H",
        "centro": {
         "x": 3.83,
         "y": 0.86
        },
        "b": 0.5,
        "h": 0.5,
        "forma": "T"
       },
       {
        "eje": "35/H",
        "centro": {
         "x": 6.84,
         "y": 0.86
        },
        "b": 0.5,
        "h": 0.5,
        "forma": "L"
       },
       {
        "eje": "33/E",
        "centro": {
         "x": 0.82,
         "y": 6.85
        },
        "b": 0.5,
        "h": 0.5,
        "forma": "L"
       },
       {
        "eje": "37´/E",
        "centro": {
         "x": 3.83,
         "y": 6.85
        },
        "b": 0.5,
        "h": 0.5,
        "forma": "T"
       },
       {
        "eje": "35/E",
        "centro": {
         "x": 6.84,
         "y": 6.85
        },
        "b": 0.5,
        "h": 0.5,
        "forma": "L"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    },
    {
     "id": "vista-02",
     "nivel": 2,
     "categorias": {
      "ejes": [
       {
        "nombre": "35",
        "p": {
         "x": 6.84,
         "y": 7.73
        },
        "q": {
         "x": 6.84,
         "y": 0
        }
       },
       {
        "nombre": "37´",
        "p": {
         "x": 3.83,
         "y": 7.73
        },
        "q": {
         "x": 3.83,
         "y": 0
        }
       },
       {
        "nombre": "33",
        "p": {
         "x": 0.82,
         "y": 7.73
        },
        "q": {
         "x": 0.82,
         "y": 0
        }
       },
       {
        "nombre": "H",
        "p": {
         "x": 7.75,
         "y": 0.86
        },
        "q": {
         "x": 0,
         "y": 0.86
        }
       },
       {
        "nombre": "E",
        "p": {
         "x": 7.75,
         "y": 6.85
        },
        "q": {
         "x": 0,
         "y": 6.85
        }
       }
      ],
      "columnas": [
       {
        "eje": "33/H",
        "centro": {
         "x": 0.82,
         "y": 0.86
        },
        "b": 0.5,
        "h": 0.5,
        "forma": "L"
       },
       {
        "eje": "37´/H",
        "centro": {
         "x": 3.83,
         "y": 0.86
        },
        "b": 0.5,
        "h": 0.5,
        "forma": "T"
       },
       {
        "eje": "35/H",
        "centro": {
         "x": 6.84,
         "y": 0.86
        },
        "b": 0.5,
        "h": 0.5,
        "forma": "L"
       },
       {
        "eje": "33/E",
        "centro": {
         "x": 0.82,
         "y": 6.85
        },
        "b": 0.5,
        "h": 0.5,
        "forma": "L"
       },
       {
        "eje": "37´/E",
        "centro": {
         "x": 3.83,
         "y": 6.85
        },
        "b": 0.5,
        "h": 0.5,
        "forma": "T"
       },
       {
        "eje": "35/E",
        "centro": {
         "x": 6.84,
         "y": 6.85
        },
        "b": 0.5,
        "h": 0.5,
        "forma": "L"
       },
       {
        "eje": null,
        "centro": {
         "x": 6.72,
         "y": 3.82
        },
        "b": 0.24,
        "h": 0.3,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 1.44,
         "y": 6.79
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 3.46,
         "y": 6.79
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 4.21,
         "y": 6.79
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 5.21,
         "y": 6.79
        },
        "b": 0.19,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 6.72,
         "y": 6.18
        },
        "b": 0.24,
        "h": 0.3,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 6.72,
         "y": 1.53
        },
        "b": 0.24,
        "h": 0.3,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 1.44,
         "y": 0.92
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 5.21,
         "y": 0.92
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 1.16,
         "y": 4.58
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 3.84,
         "y": 4.58
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 0.94,
         "y": 3.83
        },
        "b": 0.24,
        "h": 0.3,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 0.94,
         "y": 6.18
        },
        "b": 0.24,
        "h": 0.3,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 0.94,
         "y": 1.53
        },
        "b": 0.24,
        "h": 0.3,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 6.5,
         "y": 4.58
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 4.21,
         "y": 0.92
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 3.46,
         "y": 0.92
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    },
    {
     "id": "vista-03",
     "nivel": 1,
     "categorias": {
      "ejes": [
       {
        "nombre": "H",
        "p": {
         "x": 7.75,
         "y": 2.54
        },
        "q": {
         "x": 0,
         "y": 2.54
        }
       },
       {
        "nombre": "E",
        "p": {
         "x": 7.75,
         "y": 8.54
        },
        "q": {
         "x": 0,
         "y": 8.54
        }
       },
       {
        "nombre": "35",
        "p": {
         "x": 6.84,
         "y": 9.42
        },
        "q": {
         "x": 6.84,
         "y": 0
        }
       },
       {
        "nombre": "37´",
        "p": {
         "x": 3.83,
         "y": 9.42
        },
        "q": {
         "x": 3.83,
         "y": 0
        }
       },
       {
        "nombre": "33",
        "p": {
         "x": 0.82,
         "y": 9.42
        },
        "q": {
         "x": 0.82,
         "y": 0
        }
       }
      ],
      "columnas": [
       {
        "eje": "33/H",
        "centro": {
         "x": 0.82,
         "y": 2.54
        },
        "b": 0.5,
        "h": 0.5,
        "forma": "L"
       },
       {
        "eje": "37´/H",
        "centro": {
         "x": 3.83,
         "y": 2.54
        },
        "b": 0.5,
        "h": 0.5,
        "forma": "T"
       },
       {
        "eje": "35/H",
        "centro": {
         "x": 6.84,
         "y": 2.54
        },
        "b": 0.5,
        "h": 0.5,
        "forma": "L"
       },
       {
        "eje": "33/E",
        "centro": {
         "x": 0.82,
         "y": 8.54
        },
        "b": 0.5,
        "h": 0.5,
        "forma": "L"
       },
       {
        "eje": "37´/E",
        "centro": {
         "x": 3.83,
         "y": 8.54
        },
        "b": 0.5,
        "h": 0.5,
        "forma": "T"
       },
       {
        "eje": "35/E",
        "centro": {
         "x": 6.84,
         "y": 8.54
        },
        "b": 0.5,
        "h": 0.5,
        "forma": "L"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    },
    {
     "id": "vista-04",
     "nivel": 2,
     "categorias": {
      "ejes": [
       {
        "nombre": "H",
        "p": {
         "x": 7.75,
         "y": 2.42
        },
        "q": {
         "x": 0,
         "y": 2.42
        }
       },
       {
        "nombre": "E",
        "p": {
         "x": 7.75,
         "y": 8.41
        },
        "q": {
         "x": 0,
         "y": 8.41
        }
       },
       {
        "nombre": "35",
        "p": {
         "x": 6.84,
         "y": 9.29
        },
        "q": {
         "x": 6.84,
         "y": 0
        }
       },
       {
        "nombre": "37´",
        "p": {
         "x": 3.83,
         "y": 9.29
        },
        "q": {
         "x": 3.83,
         "y": 0
        }
       },
       {
        "nombre": "33",
        "p": {
         "x": 0.82,
         "y": 9.29
        },
        "q": {
         "x": 0.82,
         "y": 0
        }
       }
      ],
      "columnas": [
       {
        "eje": "33/H",
        "centro": {
         "x": 0.82,
         "y": 2.42
        },
        "b": 0.5,
        "h": 0.5,
        "forma": "L"
       },
       {
        "eje": "37´/H",
        "centro": {
         "x": 3.83,
         "y": 2.42
        },
        "b": 0.5,
        "h": 0.5,
        "forma": "T"
       },
       {
        "eje": "35/H",
        "centro": {
         "x": 6.84,
         "y": 2.42
        },
        "b": 0.5,
        "h": 0.5,
        "forma": "L"
       },
       {
        "eje": "33/E",
        "centro": {
         "x": 0.82,
         "y": 8.41
        },
        "b": 0.5,
        "h": 0.5,
        "forma": "L"
       },
       {
        "eje": "37´/E",
        "centro": {
         "x": 3.83,
         "y": 8.41
        },
        "b": 0.5,
        "h": 0.5,
        "forma": "T"
       },
       {
        "eje": "35/E",
        "centro": {
         "x": 6.84,
         "y": 8.41
        },
        "b": 0.5,
        "h": 0.5,
        "forma": "L"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    },
    {
     "id": "vista-05",
     "nivel": null,
     "categorias": {
      "ejes": [
       {
        "nombre": "35",
        "p": {
         "x": 6.84,
         "y": 7.73
        },
        "q": {
         "x": 6.84,
         "y": 0
        }
       },
       {
        "nombre": "37´",
        "p": {
         "x": 3.83,
         "y": 7.73
        },
        "q": {
         "x": 3.83,
         "y": 0
        }
       },
       {
        "nombre": "33",
        "p": {
         "x": 0.82,
         "y": 7.73
        },
        "q": {
         "x": 0.82,
         "y": 0
        }
       },
       {
        "nombre": "H",
        "p": {
         "x": 7.75,
         "y": 0.86
        },
        "q": {
         "x": 0,
         "y": 0.86
        }
       },
       {
        "nombre": "E",
        "p": {
         "x": 7.75,
         "y": 6.85
        },
        "q": {
         "x": 0,
         "y": 6.85
        }
       }
      ],
      "columnas": [
       {
        "eje": "33/H",
        "centro": {
         "x": 0.82,
         "y": 0.86
        },
        "b": 0.5,
        "h": 0.5,
        "forma": "L"
       },
       {
        "eje": "37´/H",
        "centro": {
         "x": 3.83,
         "y": 0.86
        },
        "b": 0.5,
        "h": 0.5,
        "forma": "T"
       },
       {
        "eje": "35/H",
        "centro": {
         "x": 6.84,
         "y": 0.86
        },
        "b": 0.5,
        "h": 0.5,
        "forma": "L"
       },
       {
        "eje": "33/E",
        "centro": {
         "x": 0.82,
         "y": 6.85
        },
        "b": 0.5,
        "h": 0.5,
        "forma": "L"
       },
       {
        "eje": "37´/E",
        "centro": {
         "x": 3.83,
         "y": 6.85
        },
        "b": 0.5,
        "h": 0.5,
        "forma": "T"
       },
       {
        "eje": "35/E",
        "centro": {
         "x": 6.84,
         "y": 6.85
        },
        "b": 0.5,
        "h": 0.5,
        "forma": "L"
       },
       {
        "eje": null,
        "centro": {
         "x": 6.72,
         "y": 3.85
        },
        "b": 0.24,
        "h": 0.3,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 2.74,
         "y": 5.33
        },
        "b": 0.38,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 3.83,
         "y": 6.23
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 6.72,
         "y": 6.18
        },
        "b": 0.24,
        "h": 0.3,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 6.72,
         "y": 1.53
        },
        "b": 0.24,
        "h": 0.3,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 1.44,
         "y": 0.92
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 2.46,
         "y": 0.92
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 5.21,
         "y": 0.92
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 6.22,
         "y": 0.92
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 3.83,
         "y": 1.48
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 3.83,
         "y": 3.85
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 2.56,
         "y": 2.53
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 5.1,
         "y": 2.53
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 3.83,
         "y": 2.53
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 4.92,
         "y": 5.33
        },
        "b": 0.38,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 2.62,
         "y": 6.49
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 5.04,
         "y": 6.49
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    },
    {
     "id": "vista-06",
     "nivel": 1,
     "categorias": {
      "ejes": [
       {
        "nombre": "37´",
        "p": {
         "x": 3.83,
         "y": 7.73
        },
        "q": {
         "x": 3.83,
         "y": 0
        }
       },
       {
        "nombre": "33",
        "p": {
         "x": 0.82,
         "y": 7.73
        },
        "q": {
         "x": 0.82,
         "y": 0
        }
       },
       {
        "nombre": "H",
        "p": {
         "x": 7.75,
         "y": 0.86
        },
        "q": {
         "x": 0,
         "y": 0.86
        }
       },
       {
        "nombre": "E",
        "p": {
         "x": 7.75,
         "y": 6.85
        },
        "q": {
         "x": 0,
         "y": 6.85
        }
       },
       {
        "nombre": "35",
        "p": {
         "x": 7.54,
         "y": 7.73
        },
        "q": {
         "x": 6.84,
         "y": 0
        }
       }
      ],
      "columnas": [
       {
        "eje": "33/H",
        "centro": {
         "x": 0.82,
         "y": 0.86
        },
        "b": 0.5,
        "h": 0.5,
        "forma": "L"
       },
       {
        "eje": "37´/H",
        "centro": {
         "x": 3.83,
         "y": 0.86
        },
        "b": 0.5,
        "h": 0.5,
        "forma": "T"
       },
       {
        "eje": "35/H",
        "centro": {
         "x": 6.84,
         "y": 0.86
        },
        "b": 0.5,
        "h": 0.5,
        "forma": "L"
       },
       {
        "eje": "33/E",
        "centro": {
         "x": 0.82,
         "y": 6.85
        },
        "b": 0.5,
        "h": 0.5,
        "forma": "L"
       },
       {
        "eje": "37´/E",
        "centro": {
         "x": 3.83,
         "y": 6.85
        },
        "b": 0.5,
        "h": 0.5,
        "forma": "T"
       },
       {
        "eje": null,
        "centro": {
         "x": 6.72,
         "y": 3.85
        },
        "b": 0.24,
        "h": 0.3,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 2.74,
         "y": 5.33
        },
        "b": 0.38,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 3.83,
         "y": 6.23
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 6.72,
         "y": 6.18
        },
        "b": 0.24,
        "h": 0.3,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 6.72,
         "y": 1.53
        },
        "b": 0.24,
        "h": 0.3,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 1.44,
         "y": 0.92
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 2.46,
         "y": 0.92
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 5.21,
         "y": 0.92
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 6.22,
         "y": 0.92
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 3.83,
         "y": 1.48
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 3.83,
         "y": 3.85
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 2.56,
         "y": 2.53
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 5.1,
         "y": 2.53
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 3.83,
         "y": 2.53
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 4.92,
         "y": 5.33
        },
        "b": 0.38,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 2.62,
         "y": 6.49
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 5.04,
         "y": 6.49
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    }
   ]
  }
 },
 {
  "nombre": "vinchos:modulo-07",
  "grupo": "vinchos",
  "id": "modulo-07",
  "etiqueta": null,
  "rasgos": {
   "vista": "vista-01",
   "areaAbierta": false,
   "niveles": 1,
   "ejes": {
    "x": 2,
    "y": 8
   },
   "luces": {
    "x": [
     24.85
    ],
    "y": [
     4.7,
     4.55,
     4.55,
     4.55,
     4.55,
     4.55,
     4.61
    ]
   },
   "largo": 32.06,
   "ancho": 24.85,
   "area": 796.69,
   "luzLosa": 4.7,
   "luzMax": 24.85,
   "columnas": 16,
   "tipos": [
    {
     "nombre": "C1",
     "forma": "rectangular",
     "b": 0.7,
     "h": 0.5,
     "n": 16
    }
   ],
   "placas": false,
   "columnetas": 0,
   "techoLiviano": true,
   "cubierta": true,
   "falsoCielo": false,
   "deportivo": true,
   "agua": false,
   "banos": false
  },
  "decisiones": {
   "cimentacion": "zapatas",
   "cimientoCorrido": true,
   "hz": 0.7,
   "df": 2,
   "losa": null,
   "espesorLosa": null,
   "plantasDeLosa": 0,
   "vigas": [],
   "fcColumnas": 210,
   "fcColumnetas": 175,
   "estribos": "3/8\": 1@.05, 10@.10",
   "porticos": 5,
   "mallaCimentacion": true,
   "columnasComoArquitectura": true,
   "losaDeTecho": false
  },
  "geometria": {
   "version": 1,
   "unidad": "m",
   "vistas": [
    {
     "id": "vista-01",
     "nivel": null,
     "categorias": {
      "ejes": [
       {
        "nombre": "D",
        "p": {
         "x": 0,
         "y": 22.33
        },
        "q": {
         "x": 18.36,
         "y": 22.33
        }
       },
       {
        "nombre": "Y",
        "p": {
         "x": 0,
         "y": 0.95
        },
        "q": {
         "x": 18.36,
         "y": 0.95
        }
       },
       {
        "nombre": "F",
        "p": {
         "x": 0,
         "y": 19.25
        },
        "q": {
         "x": 18.36,
         "y": 19.25
        }
       },
       {
        "nombre": "H´",
        "p": {
         "x": 0,
         "y": 16.22
        },
        "q": {
         "x": 18.36,
         "y": 16.22
        }
       },
       {
        "nombre": "K",
        "p": {
         "x": 0,
         "y": 13.19
        },
        "q": {
         "x": 18.36,
         "y": 13.18
        }
       },
       {
        "nombre": "N",
        "p": {
         "x": 0,
         "y": 10.15
        },
        "q": {
         "x": 18.36,
         "y": 10.15
        }
       },
       {
        "nombre": "T",
        "p": {
         "x": 0,
         "y": 7.12
        },
        "q": {
         "x": 18.36,
         "y": 7.12
        }
       },
       {
        "nombre": "W",
        "p": {
         "x": 0,
         "y": 4.09
        },
        "q": {
         "x": 18.36,
         "y": 4.08
        }
       },
       {
        "nombre": "36",
        "p": {
         "x": 0.87,
         "y": 23.07
        },
        "q": {
         "x": 0.87,
         "y": 0
        }
       },
       {
        "nombre": "37",
        "p": {
         "x": 17.44,
         "y": 23.1
        },
        "q": {
         "x": 17.44,
         "y": 0
        }
       }
      ],
      "columnas": [
       {
        "eje": "36/Y",
        "centro": {
         "x": 0.87,
         "y": 0.95
        },
        "b": 0.47,
        "h": 0.33,
        "forma": "rectangular"
       },
       {
        "eje": "37/Y",
        "centro": {
         "x": 17.44,
         "y": 0.95
        },
        "b": 0.47,
        "h": 0.33,
        "forma": "rectangular"
       },
       {
        "eje": "36/W",
        "centro": {
         "x": 0.87,
         "y": 4.09
        },
        "b": 0.47,
        "h": 0.33,
        "forma": "rectangular"
       },
       {
        "eje": "37/W",
        "centro": {
         "x": 17.44,
         "y": 4.08
        },
        "b": 0.47,
        "h": 0.33,
        "forma": "rectangular"
       },
       {
        "eje": "36/T",
        "centro": {
         "x": 0.87,
         "y": 7.12
        },
        "b": 0.47,
        "h": 0.33,
        "forma": "rectangular"
       },
       {
        "eje": "37/T",
        "centro": {
         "x": 17.44,
         "y": 7.12
        },
        "b": 0.47,
        "h": 0.33,
        "forma": "rectangular"
       },
       {
        "eje": "36/N",
        "centro": {
         "x": 0.87,
         "y": 10.15
        },
        "b": 0.47,
        "h": 0.33,
        "forma": "rectangular"
       },
       {
        "eje": "37/N",
        "centro": {
         "x": 17.44,
         "y": 10.15
        },
        "b": 0.47,
        "h": 0.33,
        "forma": "rectangular"
       },
       {
        "eje": "36/K",
        "centro": {
         "x": 0.87,
         "y": 13.19
        },
        "b": 0.47,
        "h": 0.33,
        "forma": "rectangular"
       },
       {
        "eje": "37/K",
        "centro": {
         "x": 17.44,
         "y": 13.18
        },
        "b": 0.47,
        "h": 0.33,
        "forma": "rectangular"
       },
       {
        "eje": "36/H´",
        "centro": {
         "x": 0.87,
         "y": 16.22
        },
        "b": 0.47,
        "h": 0.33,
        "forma": "rectangular"
       },
       {
        "eje": "37/H´",
        "centro": {
         "x": 17.44,
         "y": 16.22
        },
        "b": 0.47,
        "h": 0.33,
        "forma": "rectangular"
       },
       {
        "eje": "36/F",
        "centro": {
         "x": 0.87,
         "y": 19.25
        },
        "b": 0.47,
        "h": 0.33,
        "forma": "rectangular"
       },
       {
        "eje": "37/F",
        "centro": {
         "x": 17.44,
         "y": 19.25
        },
        "b": 0.47,
        "h": 0.33,
        "forma": "rectangular"
       },
       {
        "eje": "36/D",
        "centro": {
         "x": 0.87,
         "y": 22.33
        },
        "b": 0.47,
        "h": 0.33,
        "forma": "rectangular"
       },
       {
        "eje": "37/D",
        "centro": {
         "x": 17.44,
         "y": 22.33
        },
        "b": 0.47,
        "h": 0.33,
        "forma": "rectangular"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    },
    {
     "id": "vista-02",
     "nivel": null,
     "categorias": {
      "ejes": [
       {
        "nombre": "D",
        "p": {
         "x": 0,
         "y": 22.33
        },
        "q": {
         "x": 18.36,
         "y": 22.33
        }
       },
       {
        "nombre": "Y",
        "p": {
         "x": 0,
         "y": 0.95
        },
        "q": {
         "x": 18.36,
         "y": 0.95
        }
       },
       {
        "nombre": "H´",
        "p": {
         "x": 0,
         "y": 16.22
        },
        "q": {
         "x": 18.36,
         "y": 16.22
        }
       },
       {
        "nombre": "K",
        "p": {
         "x": 0,
         "y": 13.19
        },
        "q": {
         "x": 18.36,
         "y": 13.18
        }
       },
       {
        "nombre": "N",
        "p": {
         "x": 0,
         "y": 10.15
        },
        "q": {
         "x": 18.36,
         "y": 10.15
        }
       },
       {
        "nombre": "W",
        "p": {
         "x": 0,
         "y": 4.09
        },
        "q": {
         "x": 18.36,
         "y": 4.08
        }
       },
       {
        "nombre": "F",
        "p": {
         "x": 0,
         "y": 19.25
        },
        "q": {
         "x": 18.36,
         "y": 19.25
        }
       },
       {
        "nombre": "T",
        "p": {
         "x": 0,
         "y": 7.12
        },
        "q": {
         "x": 18.36,
         "y": 7.12
        }
       },
       {
        "nombre": "36",
        "p": {
         "x": 0.87,
         "y": 23.07
        },
        "q": {
         "x": 0.87,
         "y": 0
        }
       },
       {
        "nombre": "37",
        "p": {
         "x": 17.44,
         "y": 23.1
        },
        "q": {
         "x": 17.44,
         "y": 0
        }
       }
      ],
      "columnas": [
       {
        "eje": "36/Y",
        "centro": {
         "x": 0.87,
         "y": 0.95
        },
        "b": 0.47,
        "h": 0.33,
        "forma": "rectangular"
       },
       {
        "eje": "37/Y",
        "centro": {
         "x": 17.44,
         "y": 0.95
        },
        "b": 0.47,
        "h": 0.33,
        "forma": "rectangular"
       },
       {
        "eje": "36/W",
        "centro": {
         "x": 0.87,
         "y": 4.09
        },
        "b": 0.47,
        "h": 0.33,
        "forma": "rectangular"
       },
       {
        "eje": "37/W",
        "centro": {
         "x": 17.44,
         "y": 4.08
        },
        "b": 0.47,
        "h": 0.33,
        "forma": "rectangular"
       },
       {
        "eje": "36/T",
        "centro": {
         "x": 0.87,
         "y": 7.12
        },
        "b": 0.47,
        "h": 0.33,
        "forma": "rectangular"
       },
       {
        "eje": "37/T",
        "centro": {
         "x": 17.44,
         "y": 7.12
        },
        "b": 0.47,
        "h": 0.33,
        "forma": "rectangular"
       },
       {
        "eje": "36/N",
        "centro": {
         "x": 0.87,
         "y": 10.15
        },
        "b": 0.47,
        "h": 0.33,
        "forma": "rectangular"
       },
       {
        "eje": "37/N",
        "centro": {
         "x": 17.44,
         "y": 10.15
        },
        "b": 0.47,
        "h": 0.33,
        "forma": "rectangular"
       },
       {
        "eje": "36/K",
        "centro": {
         "x": 0.87,
         "y": 13.19
        },
        "b": 0.47,
        "h": 0.33,
        "forma": "rectangular"
       },
       {
        "eje": "37/K",
        "centro": {
         "x": 17.44,
         "y": 13.18
        },
        "b": 0.47,
        "h": 0.33,
        "forma": "rectangular"
       },
       {
        "eje": "36/H´",
        "centro": {
         "x": 0.87,
         "y": 16.22
        },
        "b": 0.47,
        "h": 0.33,
        "forma": "rectangular"
       },
       {
        "eje": "37/H´",
        "centro": {
         "x": 17.44,
         "y": 16.22
        },
        "b": 0.47,
        "h": 0.33,
        "forma": "rectangular"
       },
       {
        "eje": "36/F",
        "centro": {
         "x": 0.87,
         "y": 19.25
        },
        "b": 0.47,
        "h": 0.33,
        "forma": "rectangular"
       },
       {
        "eje": "37/F",
        "centro": {
         "x": 17.44,
         "y": 19.25
        },
        "b": 0.47,
        "h": 0.33,
        "forma": "rectangular"
       },
       {
        "eje": "36/D",
        "centro": {
         "x": 0.87,
         "y": 22.33
        },
        "b": 0.47,
        "h": 0.33,
        "forma": "rectangular"
       },
       {
        "eje": "37/D",
        "centro": {
         "x": 17.44,
         "y": 22.33
        },
        "b": 0.47,
        "h": 0.33,
        "forma": "rectangular"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    },
    {
     "id": "vista-03",
     "nivel": null,
     "categorias": {
      "ejes": [
       {
        "nombre": "D",
        "p": {
         "x": 0,
         "y": 22.33
        },
        "q": {
         "x": 18.36,
         "y": 22.33
        }
       },
       {
        "nombre": "Y",
        "p": {
         "x": 0,
         "y": 0.95
        },
        "q": {
         "x": 18.36,
         "y": 0.95
        }
       },
       {
        "nombre": "H´",
        "p": {
         "x": 0,
         "y": 16.22
        },
        "q": {
         "x": 18.36,
         "y": 16.22
        }
       },
       {
        "nombre": "K",
        "p": {
         "x": 0,
         "y": 13.19
        },
        "q": {
         "x": 18.36,
         "y": 13.18
        }
       },
       {
        "nombre": "N",
        "p": {
         "x": 0,
         "y": 10.15
        },
        "q": {
         "x": 18.36,
         "y": 10.15
        }
       },
       {
        "nombre": "W",
        "p": {
         "x": 0,
         "y": 4.09
        },
        "q": {
         "x": 18.36,
         "y": 4.08
        }
       },
       {
        "nombre": "F",
        "p": {
         "x": 0,
         "y": 19.25
        },
        "q": {
         "x": 18.36,
         "y": 19.25
        }
       },
       {
        "nombre": "T",
        "p": {
         "x": 0,
         "y": 7.12
        },
        "q": {
         "x": 18.36,
         "y": 7.12
        }
       },
       {
        "nombre": "36",
        "p": {
         "x": 0.87,
         "y": 23.07
        },
        "q": {
         "x": 0.87,
         "y": 0
        }
       },
       {
        "nombre": "37",
        "p": {
         "x": 17.44,
         "y": 23.1
        },
        "q": {
         "x": 17.44,
         "y": 0
        }
       }
      ],
      "columnas": [
       {
        "eje": "36/Y",
        "centro": {
         "x": 0.87,
         "y": 0.95
        },
        "b": 0.47,
        "h": 0.33,
        "forma": "rectangular"
       },
       {
        "eje": "37/Y",
        "centro": {
         "x": 17.44,
         "y": 0.95
        },
        "b": 0.47,
        "h": 0.33,
        "forma": "rectangular"
       },
       {
        "eje": "36/W",
        "centro": {
         "x": 0.87,
         "y": 4.09
        },
        "b": 0.47,
        "h": 0.33,
        "forma": "rectangular"
       },
       {
        "eje": "37/W",
        "centro": {
         "x": 17.44,
         "y": 4.08
        },
        "b": 0.47,
        "h": 0.33,
        "forma": "rectangular"
       },
       {
        "eje": "36/T",
        "centro": {
         "x": 0.87,
         "y": 7.12
        },
        "b": 0.47,
        "h": 0.33,
        "forma": "rectangular"
       },
       {
        "eje": "37/T",
        "centro": {
         "x": 17.44,
         "y": 7.12
        },
        "b": 0.47,
        "h": 0.33,
        "forma": "rectangular"
       },
       {
        "eje": "36/N",
        "centro": {
         "x": 0.87,
         "y": 10.15
        },
        "b": 0.47,
        "h": 0.33,
        "forma": "rectangular"
       },
       {
        "eje": "37/N",
        "centro": {
         "x": 17.44,
         "y": 10.15
        },
        "b": 0.47,
        "h": 0.33,
        "forma": "rectangular"
       },
       {
        "eje": "36/K",
        "centro": {
         "x": 0.87,
         "y": 13.19
        },
        "b": 0.47,
        "h": 0.33,
        "forma": "rectangular"
       },
       {
        "eje": "37/K",
        "centro": {
         "x": 17.44,
         "y": 13.18
        },
        "b": 0.47,
        "h": 0.33,
        "forma": "rectangular"
       },
       {
        "eje": "36/H´",
        "centro": {
         "x": 0.87,
         "y": 16.22
        },
        "b": 0.47,
        "h": 0.33,
        "forma": "rectangular"
       },
       {
        "eje": "37/H´",
        "centro": {
         "x": 17.44,
         "y": 16.22
        },
        "b": 0.47,
        "h": 0.33,
        "forma": "rectangular"
       },
       {
        "eje": "36/F",
        "centro": {
         "x": 0.87,
         "y": 19.25
        },
        "b": 0.47,
        "h": 0.33,
        "forma": "rectangular"
       },
       {
        "eje": "37/F",
        "centro": {
         "x": 17.44,
         "y": 19.25
        },
        "b": 0.47,
        "h": 0.33,
        "forma": "rectangular"
       },
       {
        "eje": "36/D",
        "centro": {
         "x": 0.87,
         "y": 22.33
        },
        "b": 0.47,
        "h": 0.33,
        "forma": "rectangular"
       },
       {
        "eje": "37/D",
        "centro": {
         "x": 17.44,
         "y": 22.33
        },
        "b": 0.47,
        "h": 0.33,
        "forma": "rectangular"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    }
   ]
  }
 },
 {
  "nombre": "vinchos:modulo-08",
  "grupo": "vinchos",
  "id": "modulo-08",
  "etiqueta": null,
  "rasgos": {
   "vista": "vista-01",
   "areaAbierta": false,
   "niveles": 1,
   "ejes": {
    "x": 2,
    "y": 4
   },
   "luces": {
    "x": [
     4.49
    ],
    "y": [
     2.97,
     2.96,
     3.8
    ]
   },
   "largo": 9.73,
   "ancho": 4.49,
   "area": 43.63,
   "luzLosa": 3.8,
   "luzMax": 4.49,
   "columnas": 8,
   "tipos": [
    {
     "nombre": "C1",
     "forma": "rectangular",
     "b": 0.3,
     "h": 0.3,
     "n": 3
    },
    {
     "nombre": "C2",
     "forma": "L",
     "b": 0.5,
     "h": 0.5,
     "n": 2
    },
    {
     "nombre": "C3",
     "forma": "L",
     "b": 0.5,
     "h": 0.5,
     "n": 2
    },
    {
     "nombre": "C4",
     "forma": "rectangular",
     "b": 0.32,
     "h": 0.3,
     "n": 1
    }
   ],
   "placas": false,
   "columnetas": 19,
   "techoLiviano": true,
   "cubierta": true,
   "falsoCielo": true,
   "deportivo": false,
   "agua": false,
   "banos": true
  },
  "decisiones": {
   "cimentacion": "platea",
   "cimientoCorrido": true,
   "hz": 0.7,
   "df": 2.5,
   "losa": "aligerada",
   "espesorLosa": 0.2,
   "plantasDeLosa": 1,
   "vigas": [
    "30x40",
    "30x60"
   ],
   "fcColumnas": 210,
   "fcColumnetas": 175,
   "estribos": "1/4\": 1@.05, 4@.10",
   "porticos": 4,
   "mallaCimentacion": true,
   "columnasComoArquitectura": true,
   "losaDeTecho": true
  },
  "geometria": {
   "version": 1,
   "unidad": "m",
   "vistas": [
    {
     "id": "vista-01",
     "nivel": null,
     "categorias": {
      "ejes": [
       {
        "nombre": "O",
        "p": {
         "x": 0,
         "y": 11.26
        },
        "q": {
         "x": 8.01,
         "y": 11.26
        }
       },
       {
        "nombre": "S",
        "p": {
         "x": 0,
         "y": 7.46
        },
        "q": {
         "x": 8.01,
         "y": 7.46
        }
       },
       {
        "nombre": "U´",
        "p": {
         "x": 0,
         "y": 4.5
        },
        "q": {
         "x": 8.01,
         "y": 4.5
        }
       },
       {
        "nombre": "X",
        "p": {
         "x": 0,
         "y": 1.53
        },
        "q": {
         "x": 8.01,
         "y": 1.53
        }
       },
       {
        "nombre": "31´",
        "p": {
         "x": 1.81,
         "y": 12.73
        },
        "q": {
         "x": 1.81,
         "y": 0
        }
       },
       {
        "nombre": "33´",
        "p": {
         "x": 6.3,
         "y": 12.73
        },
        "q": {
         "x": 6.3,
         "y": 0
        }
       }
      ],
      "columnas": [
       {
        "eje": "31´/X",
        "centro": {
         "x": 1.81,
         "y": 1.53
        },
        "b": 0.5,
        "h": 0.5,
        "forma": "L"
       },
       {
        "eje": "33´/X",
        "centro": {
         "x": 6.3,
         "y": 1.53
        },
        "b": 0.5,
        "h": 0.5,
        "forma": "L"
       },
       {
        "eje": "31´/U´",
        "centro": {
         "x": 1.81,
         "y": 4.5
        },
        "b": 0.3,
        "h": 0.3,
        "forma": "rectangular"
       },
       {
        "eje": "33´/U´",
        "centro": {
         "x": 6.3,
         "y": 4.5
        },
        "b": 0.3,
        "h": 0.3,
        "forma": "rectangular"
       },
       {
        "eje": "31´/S",
        "centro": {
         "x": 1.81,
         "y": 7.46
        },
        "b": 0.3,
        "h": 0.3,
        "forma": "rectangular"
       },
       {
        "eje": "33´/S",
        "centro": {
         "x": 6.3,
         "y": 7.46
        },
        "b": 0.3,
        "h": 0.3,
        "forma": "rectangular"
       },
       {
        "eje": "31´/O",
        "centro": {
         "x": 1.81,
         "y": 11.26
        },
        "b": 0.5,
        "h": 0.5,
        "forma": "L"
       },
       {
        "eje": "33´/O",
        "centro": {
         "x": 6.3,
         "y": 11.26
        },
        "b": 0.5,
        "h": 0.5,
        "forma": "L"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    },
    {
     "id": "vista-02",
     "nivel": null,
     "categorias": {
      "ejes": [
       {
        "nombre": "O",
        "p": {
         "x": 0,
         "y": 11.12
        },
        "q": {
         "x": 7.82,
         "y": 11.12
        }
       },
       {
        "nombre": "S",
        "p": {
         "x": 0,
         "y": 7.32
        },
        "q": {
         "x": 7.82,
         "y": 7.32
        }
       },
       {
        "nombre": "U´",
        "p": {
         "x": 0,
         "y": 4.36
        },
        "q": {
         "x": 7.82,
         "y": 4.36
        }
       },
       {
        "nombre": "X",
        "p": {
         "x": 0,
         "y": 1.39
        },
        "q": {
         "x": 7.82,
         "y": 1.39
        }
       },
       {
        "nombre": "31´",
        "p": {
         "x": 1.75,
         "y": 12.47
        },
        "q": {
         "x": 1.75,
         "y": 0
        }
       },
       {
        "nombre": "33´",
        "p": {
         "x": 6.24,
         "y": 12.47
        },
        "q": {
         "x": 6.24,
         "y": 0
        }
       }
      ],
      "columnas": [
       {
        "eje": "31´/X",
        "centro": {
         "x": 1.75,
         "y": 1.39
        },
        "b": 0.5,
        "h": 0.5,
        "forma": "L"
       },
       {
        "eje": "33´/X",
        "centro": {
         "x": 6.24,
         "y": 1.39
        },
        "b": 0.5,
        "h": 0.5,
        "forma": "L"
       },
       {
        "eje": "31´/U´",
        "centro": {
         "x": 1.75,
         "y": 4.36
        },
        "b": 0.3,
        "h": 0.3,
        "forma": "rectangular"
       },
       {
        "eje": "33´/U´",
        "centro": {
         "x": 6.24,
         "y": 4.36
        },
        "b": 0.3,
        "h": 0.3,
        "forma": "rectangular"
       },
       {
        "eje": "31´/S",
        "centro": {
         "x": 1.75,
         "y": 7.32
        },
        "b": 0.3,
        "h": 0.3,
        "forma": "rectangular"
       },
       {
        "eje": "33´/S",
        "centro": {
         "x": 6.24,
         "y": 7.32
        },
        "b": 0.3,
        "h": 0.3,
        "forma": "rectangular"
       },
       {
        "eje": "31´/O",
        "centro": {
         "x": 1.75,
         "y": 11.12
        },
        "b": 0.5,
        "h": 0.5,
        "forma": "L"
       },
       {
        "eje": "33´/O",
        "centro": {
         "x": 6.24,
         "y": 11.12
        },
        "b": 0.5,
        "h": 0.5,
        "forma": "L"
       },
       {
        "eje": null,
        "centro": {
         "x": 2.38,
         "y": 11.06
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 5.61,
         "y": 11.06
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 1.82,
         "y": 10.5
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 1.82,
         "y": 7.62
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 6.17,
         "y": 10.39
        },
        "b": 0.13,
        "h": 0.4,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 1.82,
         "y": 7.02
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 1.82,
         "y": 4.64
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 6.17,
         "y": 7.05
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 1.82,
         "y": 2.02
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 1.82,
         "y": 4.09
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 6.17,
         "y": 2.02
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 2.38,
         "y": 1.46
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 2.18,
         "y": 4.36
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 5.81,
         "y": 4.36
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 2.18,
         "y": 7.24
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 5.81,
         "y": 7.24
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 1.82,
         "y": 9.1
        },
        "b": 0.13,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 6.14,
         "y": 9.1
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 3.96,
         "y": 9.1
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 3.57,
         "y": 7.2
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 3.48,
         "y": 4.36
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 3.57,
         "y": 6.77
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 3.48,
         "y": 5.34
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 3.48,
         "y": 3.35
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 6.17,
         "y": 5.65
        },
        "b": 0.13,
        "h": 0.22,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 6.17,
         "y": 3.08
        },
        "b": 0.13,
        "h": 0.21,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 4.9,
         "y": 1.46
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 5.62,
         "y": 1.51
        },
        "b": 0.23,
        "h": 0.24,
        "forma": "columneta"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    },
    {
     "id": "vista-03",
     "nivel": 1,
     "categorias": {
      "ejes": [
       {
        "nombre": "O",
        "p": {
         "x": 0,
         "y": 11.28
        },
        "q": {
         "x": 9.67,
         "y": 11.28
        }
       },
       {
        "nombre": "S",
        "p": {
         "x": 0,
         "y": 7.48
        },
        "q": {
         "x": 9.67,
         "y": 7.48
        }
       },
       {
        "nombre": "U´",
        "p": {
         "x": 0,
         "y": 4.52
        },
        "q": {
         "x": 9.67,
         "y": 4.52
        }
       },
       {
        "nombre": "X",
        "p": {
         "x": 0,
         "y": 1.55
        },
        "q": {
         "x": 9.67,
         "y": 1.55
        }
       },
       {
        "nombre": "31´",
        "p": {
         "x": 2.51,
         "y": 12.77
        },
        "q": {
         "x": 2.51,
         "y": 0
        }
       },
       {
        "nombre": "33´",
        "p": {
         "x": 6.99,
         "y": 12.77
        },
        "q": {
         "x": 6.99,
         "y": 0
        }
       }
      ],
      "columnas": [
       {
        "eje": "31´/X",
        "centro": {
         "x": 2.51,
         "y": 1.55
        },
        "b": 0.59,
        "h": 0.3,
        "forma": "rectangular"
       },
       {
        "eje": "33´/X",
        "centro": {
         "x": 6.99,
         "y": 1.55
        },
        "b": 0.5,
        "h": 0.5,
        "forma": "L"
       },
       {
        "eje": "31´/U´",
        "centro": {
         "x": 2.51,
         "y": 4.52
        },
        "b": 0.3,
        "h": 0.3,
        "forma": "rectangular"
       },
       {
        "eje": "33´/U´",
        "centro": {
         "x": 6.99,
         "y": 4.52
        },
        "b": 0.3,
        "h": 0.3,
        "forma": "rectangular"
       },
       {
        "eje": "31´/S",
        "centro": {
         "x": 2.51,
         "y": 7.48
        },
        "b": 0.3,
        "h": 0.3,
        "forma": "rectangular"
       },
       {
        "eje": "33´/S",
        "centro": {
         "x": 6.99,
         "y": 7.48
        },
        "b": 0.3,
        "h": 0.3,
        "forma": "rectangular"
       },
       {
        "eje": "31´/O",
        "centro": {
         "x": 2.51,
         "y": 11.28
        },
        "b": 0.59,
        "h": 0.3,
        "forma": "rectangular"
       },
       {
        "eje": "33´/O",
        "centro": {
         "x": 6.99,
         "y": 11.28
        },
        "b": 0.5,
        "h": 0.5,
        "forma": "L"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    }
   ]
  }
 },
 {
  "nombre": "vinchos:modulo-09",
  "grupo": "vinchos",
  "id": "modulo-09",
  "etiqueta": null,
  "rasgos": {
   "vista": "vista-01",
   "areaAbierta": false,
   "niveles": 2,
   "ejes": {
    "x": 4,
    "y": 2
   },
   "luces": {
    "x": [
     5.59,
     3.98,
     3.45
    ],
    "y": [
     6.09
    ]
   },
   "largo": 13.02,
   "ancho": 6.09,
   "area": 79.27,
   "luzLosa": 5.59,
   "luzMax": 6.09,
   "columnas": 8,
   "tipos": [
    {
     "nombre": "C1",
     "forma": "L",
     "b": 1,
     "h": 0.5,
     "n": 4
    },
    {
     "nombre": "CT1",
     "forma": "T",
     "b": 1,
     "h": 0.6,
     "n": 4
    }
   ],
   "placas": true,
   "columnetas": 19,
   "techoLiviano": true,
   "cubierta": true,
   "falsoCielo": true,
   "deportivo": false,
   "agua": false,
   "banos": true
  },
  "decisiones": {
   "cimentacion": "platea",
   "cimientoCorrido": true,
   "hz": 0.7,
   "df": 1.5,
   "losa": "aligerada",
   "espesorLosa": 0.2,
   "plantasDeLosa": 2,
   "vigas": [],
   "fcColumnas": 210,
   "fcColumnetas": 175,
   "estribos": "1/4\": 1@.05, 10@.10",
   "porticos": 5,
   "mallaCimentacion": null,
   "columnasComoArquitectura": true,
   "losaDeTecho": true
  },
  "geometria": {
   "version": 1,
   "unidad": "m",
   "vistas": [
    {
     "id": "vista-01",
     "nivel": null,
     "categorias": {
      "ejes": [
       {
        "nombre": "21",
        "p": {
         "x": 1.64,
         "y": 9.65
        },
        "q": {
         "x": 1.64,
         "y": 0
        }
       },
       {
        "nombre": "26´",
        "p": {
         "x": 7.24,
         "y": 9.65
        },
        "q": {
         "x": 7.24,
         "y": 0
        }
       },
       {
        "nombre": "29",
        "p": {
         "x": 14.66,
         "y": 9.65
        },
        "q": {
         "x": 14.66,
         "y": 0
        }
       },
       {
        "nombre": "28´",
        "p": {
         "x": 11.22,
         "y": 9.65
        },
        "q": {
         "x": 11.22,
         "y": 0
        }
       },
       {
        "nombre": "Z´´",
        "p": {
         "x": 16.3,
         "y": 1.96
        },
        "q": {
         "x": 0,
         "y": 1.96
        }
       },
       {
        "nombre": "Z",
        "p": {
         "x": 16.3,
         "y": 8.01
        },
        "q": {
         "x": 0,
         "y": 8.01
        }
       }
      ],
      "columnas": [
       {
        "eje": "21/Z´´",
        "centro": {
         "x": 1.64,
         "y": 1.96
        },
        "b": 0.5,
        "h": 1,
        "forma": "L"
       },
       {
        "eje": "26´/Z´´",
        "centro": {
         "x": 7.24,
         "y": 1.96
        },
        "b": 1,
        "h": 0.6,
        "forma": "T"
       },
       {
        "eje": "28´/Z´´",
        "centro": {
         "x": 11.22,
         "y": 1.96
        },
        "b": 1,
        "h": 0.6,
        "forma": "T"
       },
       {
        "eje": "29/Z´´",
        "centro": {
         "x": 14.66,
         "y": 1.96
        },
        "b": 0.5,
        "h": 1,
        "forma": "L"
       },
       {
        "eje": "21/Z",
        "centro": {
         "x": 1.64,
         "y": 8.01
        },
        "b": 0.5,
        "h": 1,
        "forma": "L"
       },
       {
        "eje": "26´/Z",
        "centro": {
         "x": 7.24,
         "y": 8.01
        },
        "b": 1,
        "h": 0.6,
        "forma": "T"
       },
       {
        "eje": "28´/Z",
        "centro": {
         "x": 11.22,
         "y": 8.01
        },
        "b": 1,
        "h": 0.6,
        "forma": "T"
       },
       {
        "eje": "29/Z",
        "centro": {
         "x": 14.66,
         "y": 8.01
        },
        "b": 0.5,
        "h": 1,
        "forma": "L"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    },
    {
     "id": "vista-02",
     "nivel": null,
     "categorias": {
      "ejes": [
       {
        "nombre": "21",
        "p": {
         "x": 1.64,
         "y": 9.13
        },
        "q": {
         "x": 1.64,
         "y": 0.21
        }
       },
       {
        "nombre": "29",
        "p": {
         "x": 14.66,
         "y": 9.13
        },
        "q": {
         "x": 14.66,
         "y": 0.21
        }
       },
       {
        "nombre": "26´",
        "p": {
         "x": 7.21,
         "y": 9.13
        },
        "q": {
         "x": 7.23,
         "y": 0
        }
       },
       {
        "nombre": "28´",
        "p": {
         "x": 11.21,
         "y": 9.17
        },
        "q": {
         "x": 11.21,
         "y": 0
        }
       },
       {
        "nombre": "Z",
        "p": {
         "x": 16.3,
         "y": 7.7
        },
        "q": {
         "x": 0,
         "y": 7.7
        }
       },
       {
        "nombre": "Z´´",
        "p": {
         "x": 16.3,
         "y": 1.64
        },
        "q": {
         "x": 0,
         "y": 1.64
        }
       }
      ],
      "columnas": [
       {
        "eje": "21/Z´´",
        "centro": {
         "x": 1.64,
         "y": 1.64
        },
        "b": 0.5,
        "h": 1,
        "forma": "L"
       },
       {
        "eje": "26´/Z´´",
        "centro": {
         "x": 7.23,
         "y": 1.64
        },
        "b": 1,
        "h": 0.6,
        "forma": "T"
       },
       {
        "eje": "28´/Z´´",
        "centro": {
         "x": 11.21,
         "y": 1.64
        },
        "b": 1,
        "h": 0.6,
        "forma": "T"
       },
       {
        "eje": "29/Z´´",
        "centro": {
         "x": 14.66,
         "y": 1.64
        },
        "b": 0.5,
        "h": 1,
        "forma": "L"
       },
       {
        "eje": "21/Z",
        "centro": {
         "x": 1.64,
         "y": 7.7
        },
        "b": 0.5,
        "h": 1,
        "forma": "L"
       },
       {
        "eje": "26´/Z",
        "centro": {
         "x": 7.22,
         "y": 7.7
        },
        "b": 1,
        "h": 0.6,
        "forma": "T"
       },
       {
        "eje": "28´/Z",
        "centro": {
         "x": 11.21,
         "y": 7.7
        },
        "b": 1,
        "h": 0.6,
        "forma": "T"
       },
       {
        "eje": "29/Z",
        "centro": {
         "x": 14.66,
         "y": 7.7
        },
        "b": 0.5,
        "h": 1,
        "forma": "L"
       },
       {
        "eje": null,
        "centro": {
         "x": 2.26,
         "y": 1.7
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 3.41,
         "y": 1.7
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 7.32,
         "y": 2.36
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 7.32,
         "y": 6.97
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 11.21,
         "y": 2.36
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 5.44,
         "y": 1.7
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 6.61,
         "y": 1.7
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 9.05,
         "y": 1.7
        },
        "b": 0.27,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 14.54,
         "y": 4.67
        },
        "b": 0.24,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 11.21,
         "y": 6.97
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 7.32,
         "y": 4.67
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 11.22,
         "y": 4.67
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 14.54,
         "y": 6.57
        },
        "b": 0.24,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 14.54,
         "y": 2.76
        },
        "b": 0.24,
        "h": 0.2,
        "forma": "columneta"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    },
    {
     "id": "vista-03",
     "nivel": null,
     "categorias": {
      "ejes": [
       {
        "nombre": "21",
        "p": {
         "x": 1.93,
         "y": 10.85
        },
        "q": {
         "x": 1.93,
         "y": 0
        }
       },
       {
        "nombre": "26´",
        "p": {
         "x": 7.52,
         "y": 10.85
        },
        "q": {
         "x": 7.52,
         "y": 0
        }
       },
       {
        "nombre": "29",
        "p": {
         "x": 14.95,
         "y": 10.85
        },
        "q": {
         "x": 14.95,
         "y": 0
        }
       },
       {
        "nombre": "28´",
        "p": {
         "x": 11.51,
         "y": 10.85
        },
        "q": {
         "x": 11.51,
         "y": 0
        }
       },
       {
        "nombre": "Z´´",
        "p": {
         "x": 16.79,
         "y": 3.15
        },
        "q": {
         "x": 0,
         "y": 3.15
        }
       },
       {
        "nombre": "Z",
        "p": {
         "x": 16.81,
         "y": 9.21
        },
        "q": {
         "x": 0,
         "y": 9.21
        }
       }
      ],
      "columnas": [
       {
        "eje": "21/Z´´",
        "centro": {
         "x": 1.93,
         "y": 3.15
        },
        "b": 0.3,
        "h": 1.2,
        "forma": "rectangular"
       },
       {
        "eje": "26´/Z´´",
        "centro": {
         "x": 7.52,
         "y": 3.15
        },
        "b": 0.3,
        "h": 1.2,
        "forma": "rectangular"
       },
       {
        "eje": "28´/Z´´",
        "centro": {
         "x": 11.51,
         "y": 3.15
        },
        "b": 0.3,
        "h": 1.2,
        "forma": "rectangular"
       },
       {
        "eje": "29/Z´´",
        "centro": {
         "x": 14.95,
         "y": 3.15
        },
        "b": 0.3,
        "h": 1.2,
        "forma": "rectangular"
       },
       {
        "eje": "21/Z",
        "centro": {
         "x": 1.93,
         "y": 9.21
        },
        "b": 0.5,
        "h": 1,
        "forma": "L"
       },
       {
        "eje": "26´/Z",
        "centro": {
         "x": 7.52,
         "y": 9.21
        },
        "b": 1,
        "h": 0.6,
        "forma": "T"
       },
       {
        "eje": "28´/Z",
        "centro": {
         "x": 11.51,
         "y": 9.21
        },
        "b": 1,
        "h": 0.6,
        "forma": "T"
       },
       {
        "eje": "29/Z",
        "centro": {
         "x": 14.95,
         "y": 9.21
        },
        "b": 0.5,
        "h": 1,
        "forma": "L"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    },
    {
     "id": "vista-04",
     "nivel": 2,
     "categorias": {
      "ejes": [
       {
        "nombre": "21",
        "p": {
         "x": 1.64,
         "y": 9.05
        },
        "q": {
         "x": 1.64,
         "y": 0.21
        }
       },
       {
        "nombre": "29",
        "p": {
         "x": 14.66,
         "y": 9.05
        },
        "q": {
         "x": 14.66,
         "y": 0.21
        }
       },
       {
        "nombre": "26´",
        "p": {
         "x": 7.21,
         "y": 9.05
        },
        "q": {
         "x": 7.23,
         "y": 0
        }
       },
       {
        "nombre": "28´",
        "p": {
         "x": 11.21,
         "y": 9.1
        },
        "q": {
         "x": 11.21,
         "y": 0
        }
       },
       {
        "nombre": "Z",
        "p": {
         "x": 16.3,
         "y": 7.7
        },
        "q": {
         "x": 0,
         "y": 7.7
        }
       },
       {
        "nombre": "Z´´",
        "p": {
         "x": 16.3,
         "y": 1.64
        },
        "q": {
         "x": 0,
         "y": 1.64
        }
       }
      ],
      "columnas": [
       {
        "eje": "21/Z´´",
        "centro": {
         "x": 1.64,
         "y": 1.64
        },
        "b": 0.5,
        "h": 1,
        "forma": "L"
       },
       {
        "eje": "26´/Z´´",
        "centro": {
         "x": 7.23,
         "y": 1.64
        },
        "b": 1,
        "h": 0.6,
        "forma": "T"
       },
       {
        "eje": "28´/Z´´",
        "centro": {
         "x": 11.21,
         "y": 1.64
        },
        "b": 1,
        "h": 0.6,
        "forma": "T"
       },
       {
        "eje": "29/Z´´",
        "centro": {
         "x": 14.66,
         "y": 1.64
        },
        "b": 0.5,
        "h": 1,
        "forma": "L"
       },
       {
        "eje": "21/Z",
        "centro": {
         "x": 1.64,
         "y": 7.7
        },
        "b": 0.5,
        "h": 1,
        "forma": "L"
       },
       {
        "eje": "26´/Z",
        "centro": {
         "x": 7.22,
         "y": 7.7
        },
        "b": 1,
        "h": 0.6,
        "forma": "T"
       },
       {
        "eje": "28´/Z",
        "centro": {
         "x": 11.21,
         "y": 7.7
        },
        "b": 1,
        "h": 0.6,
        "forma": "T"
       },
       {
        "eje": "29/Z",
        "centro": {
         "x": 14.66,
         "y": 7.7
        },
        "b": 0.5,
        "h": 1,
        "forma": "L"
       },
       {
        "eje": null,
        "centro": {
         "x": 2.26,
         "y": 1.7
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 7.24,
         "y": 2.36
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 7.24,
         "y": 6.97
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 6.61,
         "y": 1.7
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 7.86,
         "y": 1.7
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 11.84,
         "y": 1.7
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 7.24,
         "y": 4.67
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 2.26,
         "y": 7.63
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 5.61,
         "y": 7.63
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 7.86,
         "y": 7.63
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 10.59,
         "y": 7.63
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 11.84,
         "y": 7.63
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 14.54,
         "y": 4.67
        },
        "b": 0.24,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 14.54,
         "y": 6.57
        },
        "b": 0.24,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 14.54,
         "y": 2.76
        },
        "b": 0.24,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 1.7,
         "y": 6.57
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 1.7,
         "y": 2.76
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 1.7,
         "y": 4.67
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 12.53,
         "y": 7.63
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    },
    {
     "id": "vista-05",
     "nivel": null,
     "categorias": {
      "ejes": [
       {
        "nombre": "21",
        "p": {
         "x": 2.53,
         "y": 12.05
        },
        "q": {
         "x": 2.53,
         "y": 0
        }
       },
       {
        "nombre": "26´",
        "p": {
         "x": 8.12,
         "y": 12.05
        },
        "q": {
         "x": 8.12,
         "y": 0
        }
       },
       {
        "nombre": "29",
        "p": {
         "x": 15.55,
         "y": 12.05
        },
        "q": {
         "x": 15.55,
         "y": 0
        }
       },
       {
        "nombre": "28´",
        "p": {
         "x": 12.11,
         "y": 12.05
        },
        "q": {
         "x": 12.11,
         "y": 0
        }
       },
       {
        "nombre": "Z´´",
        "p": {
         "x": 0,
         "y": 3.15
        },
        "q": {
         "x": 18.08,
         "y": 3.15
        }
       },
       {
        "nombre": "Z",
        "p": {
         "x": 0,
         "y": 9.21
        },
        "q": {
         "x": 18.08,
         "y": 9.21
        }
       }
      ],
      "columnas": [
       {
        "eje": "26´/Z´´",
        "centro": {
         "x": 8.12,
         "y": 3.15
        },
        "b": 0.3,
        "h": 0.64,
        "forma": "rectangular"
       },
       {
        "eje": "28´/Z´´",
        "centro": {
         "x": 12.11,
         "y": 3.15
        },
        "b": 0.3,
        "h": 0.64,
        "forma": "rectangular"
       },
       {
        "eje": "21/Z´´",
        "centro": {
         "x": 2.53,
         "y": 3.15
        },
        "b": 0.4,
        "h": 0.3,
        "forma": "rectangular"
       },
       {
        "eje": "29/Z´´",
        "centro": {
         "x": 15.55,
         "y": 3.15
        },
        "b": 0.4,
        "h": 0.3,
        "forma": "rectangular"
       },
       {
        "eje": "21/Z",
        "centro": {
         "x": 2.53,
         "y": 9.21
        },
        "b": 0.4,
        "h": 0.3,
        "forma": "rectangular"
       },
       {
        "eje": "29/Z",
        "centro": {
         "x": 15.55,
         "y": 9.21
        },
        "b": 0.4,
        "h": 0.3,
        "forma": "rectangular"
       },
       {
        "eje": "26´/Z",
        "centro": {
         "x": 8.12,
         "y": 9.21
        },
        "b": 0.3,
        "h": 0.64,
        "forma": "rectangular"
       },
       {
        "eje": "28´/Z",
        "centro": {
         "x": 12.11,
         "y": 9.21
        },
        "b": 0.3,
        "h": 0.64,
        "forma": "rectangular"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    }
   ]
  }
 },
 {
  "nombre": "vinchos:modulo-10",
  "grupo": "vinchos",
  "id": "modulo-10",
  "etiqueta": null,
  "rasgos": {
   "vista": "vista-01",
   "areaAbierta": false,
   "niveles": 2,
   "ejes": {
    "x": 4,
    "y": 2
   },
   "luces": {
    "x": [
     3.6,
     4.61,
     3.47
    ],
    "y": [
     6.41
    ]
   },
   "largo": 11.68,
   "ancho": 6.41,
   "area": 74.92,
   "luzLosa": 4.61,
   "luzMax": 6.41,
   "columnas": 8,
   "tipos": [
    {
     "nombre": "C1",
     "forma": "rectangular",
     "b": 0.52,
     "h": 0.3,
     "n": 2
    },
    {
     "nombre": "C2",
     "forma": "rectangular",
     "b": 0.5,
     "h": 0.3,
     "n": 2
    },
    {
     "nombre": "C3",
     "forma": "rectangular",
     "b": 0.36,
     "h": 0.17,
     "n": 1
    },
    {
     "nombre": "PL1",
     "forma": "L",
     "b": 1.45,
     "h": 0.85,
     "n": 1
    },
    {
     "nombre": "PL2",
     "forma": "L",
     "b": 1.48,
     "h": 0.88,
     "n": 1
    },
    {
     "nombre": "C4",
     "forma": "L",
     "b": 0.85,
     "h": 0.68,
     "n": 1
    }
   ],
   "placas": true,
   "columnetas": 14,
   "techoLiviano": true,
   "cubierta": true,
   "falsoCielo": true,
   "deportivo": false,
   "agua": false,
   "banos": true
  },
  "decisiones": {
   "cimentacion": "platea",
   "cimientoCorrido": true,
   "hz": 0.7,
   "df": 2,
   "losa": "aligerada y maciza",
   "espesorLosa": 0.2,
   "plantasDeLosa": 2,
   "vigas": [
    "30x60",
    "30x40"
   ],
   "fcColumnas": 210,
   "fcColumnetas": 175,
   "estribos": "3/8\": 1@.05, 10@.10",
   "porticos": 6,
   "mallaCimentacion": false,
   "columnasComoArquitectura": true,
   "losaDeTecho": true
  },
  "geometria": {
   "version": 1,
   "unidad": "m",
   "vistas": [
    {
     "id": "vista-01",
     "nivel": null,
     "categorias": {
      "ejes": [
       {
        "nombre": "19",
        "p": {
         "x": 8,
         "y": 9.45
        },
        "q": {
         "x": 8,
         "y": 0
        }
       },
       {
        "nombre": "22",
        "p": {
         "x": 12.6,
         "y": 9.45
        },
        "q": {
         "x": 12.61,
         "y": 0
        }
       },
       {
        "nombre": "16",
        "p": {
         "x": 4.41,
         "y": 9.45
        },
        "q": {
         "x": 4.41,
         "y": 0
        }
       },
       {
        "nombre": "26",
        "p": {
         "x": 16.08,
         "y": 9.46
        },
        "q": {
         "x": 16.08,
         "y": 0
        }
       },
       {
        "nombre": "V",
        "p": {
         "x": 0,
         "y": 1.57
        },
        "q": {
         "x": 20.1,
         "y": 1.57
        }
       },
       {
        "nombre": "Q",
        "p": {
         "x": 0,
         "y": 7.97
        },
        "q": {
         "x": 20.1,
         "y": 7.97
        }
       }
      ],
      "columnas": [
       {
        "eje": "19/V",
        "centro": {
         "x": 8,
         "y": 1.57
        },
        "b": 0.3,
        "h": 0.5,
        "forma": "rectangular"
       },
       {
        "eje": "22/V",
        "centro": {
         "x": 12.61,
         "y": 1.57
        },
        "b": 0.3,
        "h": 0.5,
        "forma": "rectangular"
       },
       {
        "eje": "26/V",
        "centro": {
         "x": 16.08,
         "y": 1.57
        },
        "b": 0.85,
        "h": 0.68,
        "forma": "L"
       },
       {
        "eje": "26/Q",
        "centro": {
         "x": 16.08,
         "y": 7.97
        },
        "b": 0.85,
        "h": 1.45,
        "forma": "L"
       },
       {
        "eje": "16/Q",
        "centro": {
         "x": 4.41,
         "y": 7.97
        },
        "b": 0.85,
        "h": 0.68,
        "forma": "L"
       },
       {
        "eje": "19/Q",
        "centro": {
         "x": 8,
         "y": 7.97
        },
        "b": 0.3,
        "h": 0.52,
        "forma": "rectangular"
       },
       {
        "eje": "22/Q",
        "centro": {
         "x": 12.6,
         "y": 7.97
        },
        "b": 0.3,
        "h": 0.52,
        "forma": "rectangular"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    },
    {
     "id": "vista-02",
     "nivel": 1,
     "categorias": {
      "ejes": [
       {
        "nombre": "19",
        "p": {
         "x": 7,
         "y": 10.78
        },
        "q": {
         "x": 7,
         "y": 0
        }
       },
       {
        "nombre": "22",
        "p": {
         "x": 11.6,
         "y": 10.78
        },
        "q": {
         "x": 11.6,
         "y": 0
        }
       },
       {
        "nombre": "16",
        "p": {
         "x": 3.41,
         "y": 10.78
        },
        "q": {
         "x": 3.41,
         "y": 0
        }
       },
       {
        "nombre": "26",
        "p": {
         "x": 15.08,
         "y": 10.78
        },
        "q": {
         "x": 15.08,
         "y": 0
        }
       },
       {
        "nombre": "V",
        "p": {
         "x": 18.46,
         "y": 2.88
        },
        "q": {
         "x": 0.01,
         "y": 2.88
        }
       },
       {
        "nombre": "Q",
        "p": {
         "x": 18.46,
         "y": 9.28
        },
        "q": {
         "x": 0,
         "y": 9.28
        }
       }
      ],
      "columnas": [
       {
        "eje": "19/V",
        "centro": {
         "x": 7,
         "y": 2.88
        },
        "b": 0.3,
        "h": 0.62,
        "forma": "rectangular"
       },
       {
        "eje": "22/V",
        "centro": {
         "x": 11.6,
         "y": 2.88
        },
        "b": 0.3,
        "h": 0.62,
        "forma": "rectangular"
       },
       {
        "eje": "16/V",
        "centro": {
         "x": 3.41,
         "y": 2.88
        },
        "b": 1.73,
        "h": 0.3,
        "forma": "rectangular"
       },
       {
        "eje": "26/V",
        "centro": {
         "x": 15.08,
         "y": 2.88
        },
        "b": 1.73,
        "h": 0.3,
        "forma": "rectangular"
       },
       {
        "eje": "16/Q",
        "centro": {
         "x": 3.41,
         "y": 9.28
        },
        "b": 1.73,
        "h": 0.3,
        "forma": "rectangular"
       },
       {
        "eje": "22/Q",
        "centro": {
         "x": 11.6,
         "y": 9.28
        },
        "b": 2.48,
        "h": 0.3,
        "forma": "rectangular"
       },
       {
        "eje": "26/Q",
        "centro": {
         "x": 15.08,
         "y": 9.28
        },
        "b": 1.73,
        "h": 0.3,
        "forma": "rectangular"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    },
    {
     "id": "vista-03",
     "nivel": null,
     "categorias": {
      "ejes": [
       {
        "nombre": "19",
        "p": {
         "x": 5,
         "y": 10.4
        },
        "q": {
         "x": 5,
         "y": 0
        }
       },
       {
        "nombre": "22",
        "p": {
         "x": 9.6,
         "y": 10.4
        },
        "q": {
         "x": 9.6,
         "y": 0
        }
       },
       {
        "nombre": "16",
        "p": {
         "x": 1.41,
         "y": 10.4
        },
        "q": {
         "x": 1.41,
         "y": 0
        }
       },
       {
        "nombre": "26",
        "p": {
         "x": 13.08,
         "y": 10.4
        },
        "q": {
         "x": 13.08,
         "y": 0
        }
       },
       {
        "nombre": "V",
        "p": {
         "x": 0.01,
         "y": 2.5
        },
        "q": {
         "x": 14.42,
         "y": 2.5
        }
       },
       {
        "nombre": "Q",
        "p": {
         "x": 0,
         "y": 8.9
        },
        "q": {
         "x": 14.42,
         "y": 8.9
        }
       }
      ],
      "columnas": [
       {
        "eje": "19/V",
        "centro": {
         "x": 5,
         "y": 2.5
        },
        "b": 0.3,
        "h": 0.5,
        "forma": "rectangular"
       },
       {
        "eje": "22/V",
        "centro": {
         "x": 9.6,
         "y": 2.5
        },
        "b": 0.3,
        "h": 0.5,
        "forma": "rectangular"
       },
       {
        "eje": "26/V",
        "centro": {
         "x": 13.08,
         "y": 2.5
        },
        "b": 0.85,
        "h": 0.68,
        "forma": "L"
       },
       {
        "eje": "26/Q",
        "centro": {
         "x": 13.08,
         "y": 8.9
        },
        "b": 0.85,
        "h": 1.45,
        "forma": "L"
       },
       {
        "eje": "16/Q",
        "centro": {
         "x": 1.41,
         "y": 8.9
        },
        "b": 0.85,
        "h": 0.68,
        "forma": "L"
       },
       {
        "eje": "19/Q",
        "centro": {
         "x": 5,
         "y": 8.9
        },
        "b": 0.3,
        "h": 0.52,
        "forma": "rectangular"
       },
       {
        "eje": "22/Q",
        "centro": {
         "x": 9.6,
         "y": 8.9
        },
        "b": 0.3,
        "h": 0.52,
        "forma": "rectangular"
       },
       {
        "eje": null,
        "centro": {
         "x": 5.05,
         "y": 5.01
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 5.05,
         "y": 6.85
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 5.08,
         "y": 8.26
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 3.39,
         "y": 2.57
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 7.36,
         "y": 2.57
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 1.51,
         "y": 5.01
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 12.96,
         "y": 6.3
        },
        "b": 0.24,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 12.96,
         "y": 5.04
        },
        "b": 0.24,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 1.47,
         "y": 4.08
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 4.71,
         "y": 2.57
        },
        "b": 0.21,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 5.28,
         "y": 2.57
        },
        "b": 0.22,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 9.88,
         "y": 2.57
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 12.1,
         "y": 2.57
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 5.08,
         "y": 3.13
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 12.96,
         "y": 3.3
        },
        "b": 0.24,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 12.96,
         "y": 7.32
        },
        "b": 0.24,
        "h": 0.2,
        "forma": "columneta"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    },
    {
     "id": "vista-04",
     "nivel": 2,
     "categorias": {
      "ejes": [
       {
        "nombre": "19",
        "p": {
         "x": 7,
         "y": 9.4
        },
        "q": {
         "x": 7,
         "y": 0
        }
       },
       {
        "nombre": "22",
        "p": {
         "x": 11.6,
         "y": 9.4
        },
        "q": {
         "x": 11.6,
         "y": 0
        }
       },
       {
        "nombre": "16",
        "p": {
         "x": 3.41,
         "y": 9.4
        },
        "q": {
         "x": 3.41,
         "y": 0
        }
       },
       {
        "nombre": "26",
        "p": {
         "x": 15.08,
         "y": 9.4
        },
        "q": {
         "x": 15.08,
         "y": 0
        }
       },
       {
        "nombre": "V",
        "p": {
         "x": 0.01,
         "y": 1.5
        },
        "q": {
         "x": 18.47,
         "y": 1.5
        }
       },
       {
        "nombre": "Q",
        "p": {
         "x": 0,
         "y": 7.9
        },
        "q": {
         "x": 18.47,
         "y": 7.9
        }
       }
      ],
      "columnas": [
       {
        "eje": null,
        "centro": {
         "x": 7.08,
         "y": 5.03
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 7.08,
         "y": 2.13
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 3.47,
         "y": 5.04
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 5.23,
         "y": 1.6
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.11,
         "y": 7.8
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 9.63,
         "y": 4.7
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.91,
         "y": 1.56
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 5.89,
         "y": 6.24
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 3.51,
         "y": 6.24
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 17.04,
         "y": 7.8
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 17.04,
         "y": 1.6
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 1.44,
         "y": 1.6
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 3.47,
         "y": 7.09
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 7.08,
         "y": 7.26
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 7.08,
         "y": 6.27
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 1.44,
         "y": 4.69
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 1.44,
         "y": 7.8
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 17.04,
         "y": 4.69
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.1,
         "y": 7.83
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 9.55,
         "y": 7.83
        },
        "b": 0.29,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 3.51,
         "y": 3.85
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 7.05,
         "y": 3.85
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 14.96,
         "y": 4.31
        },
        "b": 0.24,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 3.28,
         "y": 1.56
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 4.38,
         "y": 1.57
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 7.28,
         "y": 1.57
        },
        "b": 0.22,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 6.71,
         "y": 1.57
        },
        "b": 0.21,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 11.88,
         "y": 1.57
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 11.33,
         "y": 1.57
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 15.2,
         "y": 1.56
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 14.1,
         "y": 1.57
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 11.88,
         "y": 7.83
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 11.33,
         "y": 7.83
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 4.38,
         "y": 7.83
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 6.72,
         "y": 7.83
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 14.96,
         "y": 2.3
        },
        "b": 0.24,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 14.96,
         "y": 6.32
        },
        "b": 0.24,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 9.63,
         "y": 1.6
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 4.54,
         "y": 2.89
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 5.23,
         "y": 2.85
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    },
    {
     "id": "vista-05",
     "nivel": 2,
     "categorias": {
      "ejes": [
       {
        "nombre": "19",
        "p": {
         "x": 7,
         "y": 10.56
        },
        "q": {
         "x": 7,
         "y": 0
        }
       },
       {
        "nombre": "22",
        "p": {
         "x": 11.6,
         "y": 10.56
        },
        "q": {
         "x": 11.6,
         "y": 0
        }
       },
       {
        "nombre": "16",
        "p": {
         "x": 3.41,
         "y": 10.56
        },
        "q": {
         "x": 3.41,
         "y": 0
        }
       },
       {
        "nombre": "26",
        "p": {
         "x": 15.08,
         "y": 10.56
        },
        "q": {
         "x": 15.08,
         "y": 0
        }
       },
       {
        "nombre": "V",
        "p": {
         "x": 18.46,
         "y": 2.67
        },
        "q": {
         "x": 0.01,
         "y": 2.67
        }
       },
       {
        "nombre": "Q",
        "p": {
         "x": 18.46,
         "y": 9.06
        },
        "q": {
         "x": 0,
         "y": 9.06
        }
       }
      ],
      "columnas": [
       {
        "eje": "16/V",
        "centro": {
         "x": 3.41,
         "y": 2.67
        },
        "b": 0.3,
        "h": 1,
        "forma": "rectangular"
       },
       {
        "eje": "19/V",
        "centro": {
         "x": 7,
         "y": 2.67
        },
        "b": 0.3,
        "h": 1,
        "forma": "rectangular"
       },
       {
        "eje": "22/V",
        "centro": {
         "x": 11.6,
         "y": 2.67
        },
        "b": 0.3,
        "h": 1,
        "forma": "rectangular"
       },
       {
        "eje": "26/V",
        "centro": {
         "x": 15.08,
         "y": 2.67
        },
        "b": 0.3,
        "h": 1,
        "forma": "rectangular"
       },
       {
        "eje": "16/Q",
        "centro": {
         "x": 3.41,
         "y": 9.06
        },
        "b": 1.53,
        "h": 0.3,
        "forma": "rectangular"
       },
       {
        "eje": "22/Q",
        "centro": {
         "x": 11.6,
         "y": 9.06
        },
        "b": 2.48,
        "h": 0.3,
        "forma": "rectangular"
       },
       {
        "eje": "26/Q",
        "centro": {
         "x": 15.08,
         "y": 9.06
        },
        "b": 1.53,
        "h": 0.3,
        "forma": "rectangular"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    }
   ]
  }
 },
 {
  "nombre": "vinchos:modulo-11",
  "grupo": "vinchos",
  "id": "modulo-11",
  "etiqueta": null,
  "rasgos": {
   "vista": "vista-01",
   "areaAbierta": false,
   "niveles": 1,
   "ejes": {
    "x": 2,
    "y": 4
   },
   "luces": {
    "x": [
     12.97
    ],
    "y": [
     5.65,
     5.15,
     5.65
    ]
   },
   "largo": 16.45,
   "ancho": 12.97,
   "area": 213.35,
   "luzLosa": 5.65,
   "luzMax": 12.97,
   "columnas": 8,
   "tipos": [
    {
     "nombre": "CT1",
     "forma": "T",
     "b": 1,
     "h": 0.85,
     "n": 4
    },
    {
     "nombre": "PL1",
     "forma": "L",
     "b": 1.5,
     "h": 1,
     "n": 2
    },
    {
     "nombre": "PL2",
     "forma": "L",
     "b": 1.5,
     "h": 1,
     "n": 2
    }
   ],
   "placas": true,
   "columnetas": 31,
   "techoLiviano": true,
   "cubierta": true,
   "falsoCielo": true,
   "deportivo": false,
   "agua": false,
   "banos": true
  },
  "decisiones": {
   "cimentacion": "zapatas",
   "cimientoCorrido": true,
   "hz": 0.7,
   "df": 2,
   "losa": "aligerada",
   "espesorLosa": 0.2,
   "plantasDeLosa": 1,
   "vigas": [],
   "fcColumnas": 210,
   "fcColumnetas": 175,
   "estribos": "3/8\": 1@.05, 10@.10",
   "porticos": 4,
   "mallaCimentacion": true,
   "columnasComoArquitectura": true,
   "losaDeTecho": true
  },
  "geometria": {
   "version": 1,
   "unidad": "m",
   "vistas": [
    {
     "id": "vista-01",
     "nivel": null,
     "categorias": {
      "ejes": [
       {
        "nombre": "F",
        "p": {
         "x": 0,
         "y": 18.21
        },
        "q": {
         "x": 16.46,
         "y": 18.21
        }
       },
       {
        "nombre": "I",
        "p": {
         "x": 0.04,
         "y": 12.56
        },
        "q": {
         "x": 16.53,
         "y": 12.56
        }
       },
       {
        "nombre": "P",
        "p": {
         "x": 0,
         "y": 1.76
        },
        "q": {
         "x": 16.53,
         "y": 1.76
        }
       },
       {
        "nombre": "L",
        "p": {
         "x": 0,
         "y": 7.42
        },
        "q": {
         "x": 16.53,
         "y": 7.42
        }
       },
       {
        "nombre": "15",
        "p": {
         "x": 2.01,
         "y": 19.85
        },
        "q": {
         "x": 2.01,
         "y": 0
        }
       },
       {
        "nombre": "27",
        "p": {
         "x": 14.98,
         "y": 19.85
        },
        "q": {
         "x": 14.98,
         "y": 0
        }
       }
      ],
      "columnas": [
       {
        "eje": "15/P",
        "centro": {
         "x": 2.01,
         "y": 1.76
        },
        "b": 1.5,
        "h": 1,
        "forma": "L"
       },
       {
        "eje": "27/P",
        "centro": {
         "x": 14.98,
         "y": 1.76
        },
        "b": 1.5,
        "h": 1,
        "forma": "L"
       },
       {
        "eje": "15/L",
        "centro": {
         "x": 2.01,
         "y": 7.42
        },
        "b": 0.85,
        "h": 1,
        "forma": "T"
       },
       {
        "eje": "27/L",
        "centro": {
         "x": 14.98,
         "y": 7.42
        },
        "b": 0.85,
        "h": 1,
        "forma": "T"
       },
       {
        "eje": "15/I",
        "centro": {
         "x": 2.01,
         "y": 12.56
        },
        "b": 0.85,
        "h": 1,
        "forma": "T"
       },
       {
        "eje": "27/I",
        "centro": {
         "x": 14.98,
         "y": 12.56
        },
        "b": 0.85,
        "h": 1,
        "forma": "T"
       },
       {
        "eje": "15/F",
        "centro": {
         "x": 2.01,
         "y": 18.21
        },
        "b": 1.5,
        "h": 1,
        "forma": "L"
       },
       {
        "eje": "27/F",
        "centro": {
         "x": 14.98,
         "y": 18.21
        },
        "b": 1.5,
        "h": 1,
        "forma": "L"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    },
    {
     "id": "vista-02",
     "nivel": null,
     "categorias": {
      "ejes": [
       {
        "nombre": "F",
        "p": {
         "x": 0.1,
         "y": 18.02
        },
        "q": {
         "x": 18.56,
         "y": 18.02
        }
       },
       {
        "nombre": "I",
        "p": {
         "x": 0.04,
         "y": 12.34
        },
        "q": {
         "x": 18.63,
         "y": 12.34
        }
       },
       {
        "nombre": "L",
        "p": {
         "x": 0,
         "y": 7.19
        },
        "q": {
         "x": 18.67,
         "y": 7.19
        }
       },
       {
        "nombre": "P",
        "p": {
         "x": 0,
         "y": 1.54
        },
        "q": {
         "x": 18.67,
         "y": 1.54
        }
       },
       {
        "nombre": "15",
        "p": {
         "x": 2.84,
         "y": 19.58
        },
        "q": {
         "x": 2.84,
         "y": 0
        }
       },
       {
        "nombre": "27",
        "p": {
         "x": 15.81,
         "y": 19.58
        },
        "q": {
         "x": 15.81,
         "y": 0
        }
       }
      ],
      "columnas": [
       {
        "eje": "15/P",
        "centro": {
         "x": 2.84,
         "y": 1.54
        },
        "b": 1.5,
        "h": 1,
        "forma": "L"
       },
       {
        "eje": "27/P",
        "centro": {
         "x": 15.81,
         "y": 1.54
        },
        "b": 1.5,
        "h": 1,
        "forma": "L"
       },
       {
        "eje": "15/L",
        "centro": {
         "x": 2.84,
         "y": 7.19
        },
        "b": 0.85,
        "h": 1,
        "forma": "T"
       },
       {
        "eje": "27/L",
        "centro": {
         "x": 15.81,
         "y": 7.19
        },
        "b": 0.85,
        "h": 1,
        "forma": "T"
       },
       {
        "eje": "15/I",
        "centro": {
         "x": 2.84,
         "y": 12.34
        },
        "b": 0.85,
        "h": 1,
        "forma": "T"
       },
       {
        "eje": "27/I",
        "centro": {
         "x": 15.81,
         "y": 12.34
        },
        "b": 0.85,
        "h": 1,
        "forma": "T"
       },
       {
        "eje": "15/F",
        "centro": {
         "x": 2.84,
         "y": 18.02
        },
        "b": 1.5,
        "h": 1,
        "forma": "L"
       },
       {
        "eje": "27/F",
        "centro": {
         "x": 15.81,
         "y": 18.02
        },
        "b": 1.5,
        "h": 1,
        "forma": "L"
       },
       {
        "eje": null,
        "centro": {
         "x": 6.9,
         "y": 17.95
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 11.76,
         "y": 17.95
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 4.47,
         "y": 17.95
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 14.19,
         "y": 17.95
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 2.91,
         "y": 16.89
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 2.91,
         "y": 14.35
        },
        "b": 0.13,
        "h": 0.24,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 2.91,
         "y": 12.99
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 2.91,
         "y": 11.74
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 2.91,
         "y": 10.63
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 2.91,
         "y": 5.08
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 2.91,
         "y": 6.59
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 2.91,
         "y": 2.69
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 2.91,
         "y": 9.61
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 15.75,
         "y": 16.89
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 15.75,
         "y": 14.35
        },
        "b": 0.13,
        "h": 0.24,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 15.75,
         "y": 12.99
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 15.75,
         "y": 11.74
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 15.75,
         "y": 10.63
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 15.75,
         "y": 9.61
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 15.75,
         "y": 2.69
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 4.47,
         "y": 1.63
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 7.11,
         "y": 1.63
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.19,
         "y": 1.63
        },
        "b": 0.13,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.18,
         "y": 1.63
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 9.59,
         "y": 1.63
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 9.33,
         "y": 17.95
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 2.91,
         "y": 15.7
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 2.91,
         "y": 3.75
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 15.75,
         "y": 3.75
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 15.75,
         "y": 15.7
        },
        "b": 0.13,
        "h": 0.2,
        "forma": "columneta"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    },
    {
     "id": "vista-03",
     "nivel": null,
     "categorias": {
      "ejes": [
       {
        "nombre": "15",
        "p": {
         "x": 5.33,
         "y": 22.56
        },
        "q": {
         "x": 5.33,
         "y": 0
        }
       },
       {
        "nombre": "F",
        "p": {
         "x": 23.51,
         "y": 19.08
        },
        "q": {
         "x": 0.1,
         "y": 19.08
        }
       },
       {
        "nombre": "I",
        "p": {
         "x": 23.57,
         "y": 13.4
        },
        "q": {
         "x": 0.04,
         "y": 13.4
        }
       },
       {
        "nombre": "L",
        "p": {
         "x": 23.61,
         "y": 8.25
        },
        "q": {
         "x": 0,
         "y": 8.25
        }
       },
       {
        "nombre": "P",
        "p": {
         "x": 23.61,
         "y": 2.6
        },
        "q": {
         "x": 0,
         "y": 2.6
        }
       }
      ],
      "columnas": [
       {
        "eje": "15/P",
        "centro": {
         "x": 5.33,
         "y": 2.6
        },
        "b": 1.83,
        "h": 0.3,
        "forma": "rectangular"
       },
       {
        "eje": "15/L",
        "centro": {
         "x": 5.33,
         "y": 8.25
        },
        "b": 0.85,
        "h": 1,
        "forma": "T"
       },
       {
        "eje": "15/I",
        "centro": {
         "x": 5.33,
         "y": 13.4
        },
        "b": 0.85,
        "h": 1,
        "forma": "T"
       },
       {
        "eje": "15/F",
        "centro": {
         "x": 5.33,
         "y": 19.08
        },
        "b": 0.3,
        "h": 0.71,
        "forma": "rectangular"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    }
   ]
  }
 },
 {
  "nombre": "vinchos:modulo-12",
  "grupo": "vinchos",
  "id": "modulo-12",
  "etiqueta": null,
  "rasgos": {
   "vista": "vista-01",
   "areaAbierta": false,
   "niveles": 1,
   "ejes": {
    "x": 2,
    "y": 2
   },
   "luces": {
    "x": [
     13.48
    ],
    "y": [
     5.99
    ]
   },
   "largo": 13.48,
   "ancho": 5.99,
   "area": 80.8,
   "luzLosa": 5.99,
   "luzMax": 13.48,
   "columnas": 4,
   "tipos": [
    {
     "nombre": "C1",
     "forma": "rectangular",
     "b": 0.6,
     "h": 0.6,
     "n": 3
    },
    {
     "nombre": "C2",
     "forma": "rectangular",
     "b": 0.63,
     "h": 0.63,
     "n": 1
    }
   ],
   "placas": false,
   "columnetas": 4,
   "techoLiviano": true,
   "cubierta": false,
   "falsoCielo": false,
   "deportivo": false,
   "agua": false,
   "banos": false
  },
  "decisiones": {
   "cimentacion": "zapatas",
   "cimientoCorrido": true,
   "hz": 0.7,
   "df": 2,
   "losa": null,
   "espesorLosa": null,
   "plantasDeLosa": 0,
   "vigas": [
    "47x90"
   ],
   "fcColumnas": 210,
   "fcColumnetas": 175,
   "estribos": "3/8\": 1@.05, 18@.10",
   "porticos": 2,
   "mallaCimentacion": false,
   "columnasComoArquitectura": true,
   "losaDeTecho": false
  },
  "geometria": {
   "version": 1,
   "unidad": "m",
   "vistas": [
    {
     "id": "vista-01",
     "nivel": null,
     "categorias": {
      "ejes": [
       {
        "nombre": "8",
        "p": {
         "x": 1.36,
         "y": 0
        },
        "q": {
         "x": 1.36,
         "y": 7.86
        }
       },
       {
        "nombre": "13",
        "p": {
         "x": 14.84,
         "y": 0
        },
        "q": {
         "x": 14.84,
         "y": 7.86
        }
       },
       {
        "nombre": "E´",
        "p": {
         "x": 16.21,
         "y": 6.97
        },
        "q": {
         "x": 0,
         "y": 6.97
        }
       },
       {
        "nombre": "H",
        "p": {
         "x": 16.21,
         "y": 0.98
        },
        "q": {
         "x": 0,
         "y": 0.98
        }
       }
      ],
      "columnas": [
       {
        "eje": "8/H",
        "centro": {
         "x": 1.36,
         "y": 0.98
        },
        "b": 0.6,
        "h": 0.6,
        "forma": "rectangular"
       },
       {
        "eje": "13/H",
        "centro": {
         "x": 14.84,
         "y": 0.98
        },
        "b": 0.6,
        "h": 0.6,
        "forma": "rectangular"
       },
       {
        "eje": "8/E´",
        "centro": {
         "x": 1.36,
         "y": 6.97
        },
        "b": 0.6,
        "h": 0.6,
        "forma": "rectangular"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    },
    {
     "id": "vista-02",
     "nivel": null,
     "categorias": {
      "ejes": [
       {
        "nombre": "8",
        "p": {
         "x": 1.36,
         "y": 0
        },
        "q": {
         "x": 1.36,
         "y": 8.27
        }
       },
       {
        "nombre": "13",
        "p": {
         "x": 14.84,
         "y": 0
        },
        "q": {
         "x": 14.84,
         "y": 8.27
        }
       },
       {
        "nombre": "E´",
        "p": {
         "x": 16.15,
         "y": 7.38
        },
        "q": {
         "x": 0,
         "y": 7.38
        }
       },
       {
        "nombre": "H",
        "p": {
         "x": 0,
         "y": 1.39
        },
        "q": {
         "x": 16.15,
         "y": 1.39
        }
       }
      ],
      "columnas": [
       {
        "eje": "8/H",
        "centro": {
         "x": 1.36,
         "y": 1.39
        },
        "b": 0.6,
        "h": 0.6,
        "forma": "rectangular"
       },
       {
        "eje": "13/H",
        "centro": {
         "x": 14.84,
         "y": 1.39
        },
        "b": 0.6,
        "h": 0.6,
        "forma": "rectangular"
       },
       {
        "eje": "8/E´",
        "centro": {
         "x": 1.36,
         "y": 7.38
        },
        "b": 0.6,
        "h": 0.6,
        "forma": "rectangular"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    },
    {
     "id": "vista-03",
     "nivel": null,
     "categorias": {
      "ejes": [
       {
        "nombre": "8",
        "p": {
         "x": 1.36,
         "y": 0
        },
        "q": {
         "x": 1.36,
         "y": 7.82
        }
       },
       {
        "nombre": "13",
        "p": {
         "x": 14.84,
         "y": 0
        },
        "q": {
         "x": 14.84,
         "y": 7.82
        }
       },
       {
        "nombre": "E´",
        "p": {
         "x": 16.21,
         "y": 6.91
        },
        "q": {
         "x": 0,
         "y": 6.91
        }
       },
       {
        "nombre": "H´",
        "p": {
         "x": 0,
         "y": 0.91
        },
        "q": {
         "x": 16.21,
         "y": 0.91
        }
       }
      ],
      "columnas": [
       {
        "eje": "8/H´",
        "centro": {
         "x": 1.36,
         "y": 0.91
        },
        "b": 0.6,
        "h": 0.6,
        "forma": "rectangular"
       },
       {
        "eje": "13/H´",
        "centro": {
         "x": 14.84,
         "y": 0.91
        },
        "b": 0.6,
        "h": 0.6,
        "forma": "rectangular"
       },
       {
        "eje": "8/E´",
        "centro": {
         "x": 1.36,
         "y": 6.91
        },
        "b": 0.6,
        "h": 0.6,
        "forma": "rectangular"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    }
   ]
  }
 },
 {
  "nombre": "vinchos:modulo-13",
  "grupo": "vinchos",
  "id": "modulo-13",
  "etiqueta": null,
  "rasgos": {
   "vista": "vista-01",
   "areaAbierta": false,
   "niveles": 1,
   "ejes": {
    "x": 2,
    "y": 2
   },
   "luces": {
    "x": [
     14.03
    ],
    "y": [
     5.99
    ]
   },
   "largo": 14.03,
   "ancho": 5.99,
   "area": 84.07,
   "luzLosa": 5.99,
   "luzMax": 14.03,
   "columnas": 4,
   "tipos": [
    {
     "nombre": "C1",
     "forma": "rectangular",
     "b": 0.6,
     "h": 0.6,
     "n": 4
    }
   ],
   "placas": false,
   "columnetas": 4,
   "techoLiviano": true,
   "cubierta": false,
   "falsoCielo": false,
   "deportivo": false,
   "agua": false,
   "banos": false
  },
  "decisiones": {
   "cimentacion": "zapatas",
   "cimientoCorrido": true,
   "hz": 0.7,
   "df": 2,
   "losa": null,
   "espesorLosa": null,
   "plantasDeLosa": 0,
   "vigas": [
    "47x90"
   ],
   "fcColumnas": 210,
   "fcColumnetas": 175,
   "estribos": "3/8\": 1@.05, 18@.10",
   "porticos": 2,
   "mallaCimentacion": false,
   "columnasComoArquitectura": true,
   "losaDeTecho": false
  },
  "geometria": {
   "version": 1,
   "unidad": "m",
   "vistas": [
    {
     "id": "vista-01",
     "nivel": null,
     "categorias": {
      "ejes": [
       {
        "nombre": "27´",
        "p": {
         "x": 1.52,
         "y": 8.74
        },
        "q": {
         "x": 1.52,
         "y": 0.01
        }
       },
       {
        "nombre": "32´",
        "p": {
         "x": 15.54,
         "y": 8.76
        },
        "q": {
         "x": 15.54,
         "y": 0
        }
       },
       {
        "nombre": "E´",
        "p": {
         "x": 0,
         "y": 7.32
        },
        "q": {
         "x": 16.67,
         "y": 7.32
        }
       },
       {
        "nombre": "H",
        "p": {
         "x": 0,
         "y": 1.33
        },
        "q": {
         "x": 16.67,
         "y": 1.33
        }
       }
      ],
      "columnas": [
       {
        "eje": "27´/H",
        "centro": {
         "x": 1.52,
         "y": 1.33
        },
        "b": 0.6,
        "h": 0.6,
        "forma": "rectangular"
       },
       {
        "eje": "32´/H",
        "centro": {
         "x": 15.54,
         "y": 1.33
        },
        "b": 0.6,
        "h": 0.6,
        "forma": "rectangular"
       },
       {
        "eje": "27´/E´",
        "centro": {
         "x": 1.52,
         "y": 7.32
        },
        "b": 0.6,
        "h": 0.6,
        "forma": "rectangular"
       },
       {
        "eje": "32´/E´",
        "centro": {
         "x": 15.54,
         "y": 7.32
        },
        "b": 0.6,
        "h": 0.6,
        "forma": "rectangular"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    },
    {
     "id": "vista-02",
     "nivel": null,
     "categorias": {
      "ejes": [
       {
        "nombre": "27´",
        "p": {
         "x": 1.52,
         "y": 8.74
        },
        "q": {
         "x": 1.52,
         "y": 0.01
        }
       },
       {
        "nombre": "32´",
        "p": {
         "x": 15.54,
         "y": 8.76
        },
        "q": {
         "x": 15.54,
         "y": 0
        }
       },
       {
        "nombre": "E´",
        "p": {
         "x": 16.67,
         "y": 7.32
        },
        "q": {
         "x": 0,
         "y": 7.32
        }
       },
       {
        "nombre": "H´´",
        "p": {
         "x": 16.67,
         "y": 1.33
        },
        "q": {
         "x": 0,
         "y": 1.33
        }
       }
      ],
      "columnas": [
       {
        "eje": "27´/H´´",
        "centro": {
         "x": 1.52,
         "y": 1.33
        },
        "b": 0.6,
        "h": 0.6,
        "forma": "rectangular"
       },
       {
        "eje": "32´/H´´",
        "centro": {
         "x": 15.54,
         "y": 1.33
        },
        "b": 0.6,
        "h": 0.6,
        "forma": "rectangular"
       },
       {
        "eje": "27´/E´",
        "centro": {
         "x": 1.52,
         "y": 7.32
        },
        "b": 0.6,
        "h": 0.6,
        "forma": "rectangular"
       },
       {
        "eje": "32´/E´",
        "centro": {
         "x": 15.54,
         "y": 7.32
        },
        "b": 0.6,
        "h": 0.6,
        "forma": "rectangular"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    },
    {
     "id": "vista-03",
     "nivel": null,
     "categorias": {
      "ejes": [
       {
        "nombre": "27´",
        "p": {
         "x": 1.52,
         "y": 8.74
        },
        "q": {
         "x": 1.52,
         "y": 0.01
        }
       },
       {
        "nombre": "32´",
        "p": {
         "x": 15.54,
         "y": 8.76
        },
        "q": {
         "x": 15.54,
         "y": 0
        }
       },
       {
        "nombre": "E´",
        "p": {
         "x": 0,
         "y": 7.32
        },
        "q": {
         "x": 16.67,
         "y": 7.32
        }
       },
       {
        "nombre": "H",
        "p": {
         "x": 0,
         "y": 1.33
        },
        "q": {
         "x": 16.67,
         "y": 1.33
        }
       }
      ],
      "columnas": [
       {
        "eje": "27´/H",
        "centro": {
         "x": 1.52,
         "y": 1.33
        },
        "b": 0.6,
        "h": 0.6,
        "forma": "rectangular"
       },
       {
        "eje": "32´/H",
        "centro": {
         "x": 15.54,
         "y": 1.33
        },
        "b": 0.6,
        "h": 0.6,
        "forma": "rectangular"
       },
       {
        "eje": "27´/E´",
        "centro": {
         "x": 1.52,
         "y": 7.32
        },
        "b": 0.6,
        "h": 0.6,
        "forma": "rectangular"
       },
       {
        "eje": "32´/E´",
        "centro": {
         "x": 15.54,
         "y": 7.32
        },
        "b": 0.6,
        "h": 0.6,
        "forma": "rectangular"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    }
   ]
  }
 },
 {
  "nombre": "vinchos:modulo-14",
  "grupo": "vinchos",
  "id": "modulo-14",
  "etiqueta": null,
  "rasgos": {
   "vista": "vista-01",
   "areaAbierta": false,
   "niveles": 1,
   "ejes": {
    "x": 2,
    "y": 2
   },
   "luces": {
    "x": [
     3.76
    ],
    "y": [
     2.52
    ]
   },
   "largo": 3.76,
   "ancho": 2.52,
   "area": 9.46,
   "luzLosa": 2.52,
   "luzMax": 3.76,
   "columnas": 4,
   "tipos": [
    {
     "nombre": "C1",
     "forma": "L",
     "b": 0.4,
     "h": 0.4,
     "n": 2
    },
    {
     "nombre": "C2",
     "forma": "L",
     "b": 0.51,
     "h": 0.43,
     "n": 1
    },
    {
     "nombre": "C3",
     "forma": "trapecio",
     "b": 0.38,
     "h": 0.25,
     "n": 1
    }
   ],
   "placas": false,
   "columnetas": 11,
   "techoLiviano": true,
   "cubierta": true,
   "falsoCielo": false,
   "deportivo": false,
   "agua": false,
   "banos": true
  },
  "decisiones": {
   "cimentacion": "platea",
   "cimientoCorrido": true,
   "hz": 0.7,
   "df": 2,
   "losa": "aligerada",
   "espesorLosa": 0.2,
   "plantasDeLosa": 1,
   "vigas": [],
   "fcColumnas": 210,
   "fcColumnetas": 175,
   "estribos": "3/8\": 1@.05, 9@.10",
   "porticos": 4,
   "mallaCimentacion": null,
   "columnasComoArquitectura": true,
   "losaDeTecho": true
  },
  "geometria": {
   "version": 1,
   "unidad": "m",
   "vistas": [
    {
     "id": "vista-01",
     "nivel": null,
     "categorias": {
      "ejes": [
       {
        "nombre": "10",
        "p": {
         "x": 9.85,
         "y": 10.69
        },
        "q": {
         "x": 9.85,
         "y": 0
        }
       },
       {
        "nombre": "8",
        "p": {
         "x": 2.4,
         "y": 10.69
        },
        "q": {
         "x": 2.4,
         "y": 0
        }
       },
       {
        "nombre": "Y´",
        "p": {
         "x": 0,
         "y": 8.39
        },
        "q": {
         "x": 11.84,
         "y": 8.39
        }
       },
       {
        "nombre": "Z´",
        "p": {
         "x": 0,
         "y": 4.75
        },
        "q": {
         "x": 11.84,
         "y": 2.49
        }
       }
      ],
      "columnas": [
       {
        "eje": "10/Z´",
        "centro": {
         "x": 9.85,
         "y": 2.49
        },
        "b": 0.5,
        "h": 0.75,
        "forma": "trapecio"
       },
       {
        "eje": "8/Z´",
        "centro": {
         "x": 2.4,
         "y": 4.75
        },
        "b": 0.86,
        "h": 1.02,
        "forma": "L"
       },
       {
        "eje": "8/Y´",
        "centro": {
         "x": 2.4,
         "y": 8.39
        },
        "b": 0.8,
        "h": 0.8,
        "forma": "L"
       },
       {
        "eje": "10/Y´",
        "centro": {
         "x": 9.85,
         "y": 8.39
        },
        "b": 0.8,
        "h": 0.8,
        "forma": "L"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    },
    {
     "id": "vista-02",
     "nivel": null,
     "categorias": {
      "ejes": [
       {
        "nombre": "10",
        "p": {
         "x": 9.61,
         "y": 10.46
        },
        "q": {
         "x": 9.61,
         "y": 0
        }
       },
       {
        "nombre": "8",
        "p": {
         "x": 2.15,
         "y": 10.46
        },
        "q": {
         "x": 2.15,
         "y": 0
        }
       },
       {
        "nombre": "Y´",
        "p": {
         "x": 0,
         "y": 8.13
        },
        "q": {
         "x": 11.97,
         "y": 8.13
        }
       },
       {
        "nombre": "Z´",
        "p": {
         "x": 0,
         "y": 4.49
        },
        "q": {
         "x": 11.97,
         "y": 2.23
        }
       }
      ],
      "columnas": [
       {
        "eje": "10/Z´",
        "centro": {
         "x": 9.61,
         "y": 2.23
        },
        "b": 0.5,
        "h": 0.75,
        "forma": "trapecio"
       },
       {
        "eje": "8/Z´",
        "centro": {
         "x": 2.15,
         "y": 4.49
        },
        "b": 0.86,
        "h": 1.02,
        "forma": "L"
       },
       {
        "eje": "8/Y´",
        "centro": {
         "x": 2.15,
         "y": 8.13
        },
        "b": 0.8,
        "h": 0.8,
        "forma": "L"
       },
       {
        "eje": "10/Y´",
        "centro": {
         "x": 9.61,
         "y": 8.13
        },
        "b": 0.8,
        "h": 0.8,
        "forma": "L"
       },
       {
        "eje": null,
        "centro": {
         "x": 2.28,
         "y": 7.08
        },
        "b": 0.26,
        "h": 0.4,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 9.48,
         "y": 7.07
        },
        "b": 0.26,
        "h": 0.43,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 2.28,
         "y": 5.55
        },
        "b": 0.26,
        "h": 0.4,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 9.48,
         "y": 3.23
        },
        "b": 0.26,
        "h": 0.4,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.58,
         "y": 8
        },
        "b": 0.35,
        "h": 0.26,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 6.34,
         "y": 7.93
        },
        "b": 0.26,
        "h": 0.4,
        "forma": "columneta"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    },
    {
     "id": "vista-03",
     "nivel": null,
     "categorias": {
      "ejes": [
       {
        "nombre": "10",
        "p": {
         "x": 11.96,
         "y": 10.57
        },
        "q": {
         "x": 11.96,
         "y": 0
        }
       },
       {
        "nombre": "8",
        "p": {
         "x": 4.51,
         "y": 10.57
        },
        "q": {
         "x": 4.51,
         "y": 0
        }
       },
       {
        "nombre": "Y´",
        "p": {
         "x": 0,
         "y": 8.26
        },
        "q": {
         "x": 16.62,
         "y": 8.26
        }
       },
       {
        "nombre": "Z´",
        "p": {
         "x": 0,
         "y": 4.62
        },
        "q": {
         "x": 16.62,
         "y": 2.36
        }
       }
      ],
      "columnas": [
       {
        "eje": "10/Z´",
        "centro": {
         "x": 11.96,
         "y": 2.36
        },
        "b": 0.5,
        "h": 0.75,
        "forma": "trapecio"
       },
       {
        "eje": "8/Z´",
        "centro": {
         "x": 4.51,
         "y": 4.62
        },
        "b": 0.86,
        "h": 1.02,
        "forma": "L"
       },
       {
        "eje": "8/Y´",
        "centro": {
         "x": 4.51,
         "y": 8.26
        },
        "b": 0.8,
        "h": 0.8,
        "forma": "L"
       },
       {
        "eje": "10/Y´",
        "centro": {
         "x": 11.96,
         "y": 8.26
        },
        "b": 0.8,
        "h": 0.8,
        "forma": "L"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    }
   ]
  }
 },
 {
  "nombre": "vinchos:modulo-15",
  "grupo": "vinchos",
  "id": "modulo-15",
  "etiqueta": null,
  "rasgos": {
   "vista": "vista-01",
   "areaAbierta": false,
   "niveles": 1,
   "ejes": {
    "x": 2,
    "y": 2
   },
   "luces": {
    "x": [
     3.23
    ],
    "y": [
     4.93
    ]
   },
   "largo": 4.93,
   "ancho": 3.23,
   "area": 15.92,
   "luzLosa": 3.23,
   "luzMax": 4.93,
   "columnas": 4,
   "tipos": [
    {
     "nombre": "C1",
     "forma": "L",
     "b": 0.7,
     "h": 0.7,
     "n": 4
    }
   ],
   "placas": false,
   "columnetas": 0,
   "techoLiviano": false,
   "cubierta": false,
   "falsoCielo": false,
   "deportivo": false,
   "agua": true,
   "banos": false
  },
  "decisiones": {
   "cimentacion": "platea",
   "cimientoCorrido": true,
   "hz": null,
   "df": 0.12,
   "losa": "aligerada y maciza",
   "espesorLosa": 0.2,
   "plantasDeLosa": 1,
   "vigas": [],
   "fcColumnas": 210,
   "fcColumnetas": 175,
   "estribos": "1/4\": 1@.05, 4@.10",
   "porticos": 4,
   "mallaCimentacion": false,
   "columnasComoArquitectura": true,
   "losaDeTecho": true
  },
  "geometria": {
   "version": 1,
   "unidad": "m",
   "vistas": [
    {
     "id": "vista-01",
     "nivel": null,
     "categorias": {
      "ejes": [
       {
        "nombre": "E",
        "p": {
         "x": 0,
         "y": 2.03
        },
        "q": {
         "x": 10.5,
         "y": 2.03
        }
       },
       {
        "nombre": "F´",
        "p": {
         "x": 0,
         "y": 11.89
        },
        "q": {
         "x": 10.5,
         "y": 11.89
        }
       },
       {
        "nombre": "3",
        "p": {
         "x": 8.47,
         "y": 0
        },
        "q": {
         "x": 8.47,
         "y": 13.93
        }
       },
       {
        "nombre": "2",
        "p": {
         "x": 2.01,
         "y": 0
        },
        "q": {
         "x": 2.01,
         "y": 13.93
        }
       }
      ],
      "columnas": [
       {
        "eje": "2/E",
        "centro": {
         "x": 2.01,
         "y": 2.03
        },
        "b": 1.4,
        "h": 1.4,
        "forma": "L"
       },
       {
        "eje": "3/E",
        "centro": {
         "x": 8.47,
         "y": 2.03
        },
        "b": 1.4,
        "h": 1.4,
        "forma": "L"
       },
       {
        "eje": "2/F´",
        "centro": {
         "x": 2.01,
         "y": 11.89
        },
        "b": 1.4,
        "h": 1.4,
        "forma": "L"
       },
       {
        "eje": "3/F´",
        "centro": {
         "x": 8.47,
         "y": 11.89
        },
        "b": 1.4,
        "h": 1.4,
        "forma": "L"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    },
    {
     "id": "vista-02",
     "nivel": null,
     "categorias": {
      "ejes": [
       {
        "nombre": "E",
        "p": {
         "x": 0,
         "y": 1.48
        },
        "q": {
         "x": 9.89,
         "y": 1.48
        }
       },
       {
        "nombre": "F´",
        "p": {
         "x": 0,
         "y": 11.34
        },
        "q": {
         "x": 9.89,
         "y": 11.34
        }
       },
       {
        "nombre": "3",
        "p": {
         "x": 8.16,
         "y": 0
        },
        "q": {
         "x": 8.16,
         "y": 13.08
        }
       },
       {
        "nombre": "2",
        "p": {
         "x": 1.7,
         "y": 0
        },
        "q": {
         "x": 1.7,
         "y": 13.08
        }
       }
      ],
      "columnas": [
       {
        "eje": "2/E",
        "centro": {
         "x": 1.7,
         "y": 1.48
        },
        "b": 1.4,
        "h": 1.4,
        "forma": "L"
       },
       {
        "eje": "3/E",
        "centro": {
         "x": 8.16,
         "y": 1.48
        },
        "b": 1.4,
        "h": 1.4,
        "forma": "L"
       },
       {
        "eje": "2/F´",
        "centro": {
         "x": 1.7,
         "y": 11.34
        },
        "b": 1.4,
        "h": 1.4,
        "forma": "L"
       },
       {
        "eje": "3/F´",
        "centro": {
         "x": 8.16,
         "y": 11.34
        },
        "b": 1.4,
        "h": 1.4,
        "forma": "L"
       },
       {
        "eje": null,
        "centro": {
         "x": 3.35,
         "y": 1.61
        },
        "b": 0.4,
        "h": 0.26,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 6.51,
         "y": 1.61
        },
        "b": 0.4,
        "h": 0.26,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.03,
         "y": 3.13
        },
        "b": 0.26,
        "h": 0.4,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.03,
         "y": 9.69
        },
        "b": 0.26,
        "h": 0.4,
        "forma": "columneta"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    },
    {
     "id": "vista-03",
     "nivel": null,
     "categorias": {
      "ejes": [
       {
        "nombre": "E",
        "p": {
         "x": 0,
         "y": 1.48
        },
        "q": {
         "x": 9.89,
         "y": 1.48
        }
       },
       {
        "nombre": "F´",
        "p": {
         "x": 0,
         "y": 11.34
        },
        "q": {
         "x": 9.89,
         "y": 11.34
        }
       },
       {
        "nombre": "3",
        "p": {
         "x": 8.16,
         "y": 0
        },
        "q": {
         "x": 8.16,
         "y": 13.08
        }
       },
       {
        "nombre": "2",
        "p": {
         "x": 1.7,
         "y": 0
        },
        "q": {
         "x": 1.7,
         "y": 13.08
        }
       }
      ],
      "columnas": [
       {
        "eje": "2/E",
        "centro": {
         "x": 1.7,
         "y": 1.48
        },
        "b": 1.4,
        "h": 1.4,
        "forma": "L"
       },
       {
        "eje": "3/E",
        "centro": {
         "x": 8.16,
         "y": 1.48
        },
        "b": 1.4,
        "h": 1.4,
        "forma": "L"
       },
       {
        "eje": "2/F´",
        "centro": {
         "x": 1.7,
         "y": 11.34
        },
        "b": 1.4,
        "h": 1.4,
        "forma": "L"
       },
       {
        "eje": "3/F´",
        "centro": {
         "x": 8.16,
         "y": 11.34
        },
        "b": 1.4,
        "h": 1.4,
        "forma": "L"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    },
    {
     "id": "vista-04",
     "nivel": null,
     "categorias": {
      "ejes": [
       {
        "nombre": "E",
        "p": {
         "x": 0,
         "y": 1.48
        },
        "q": {
         "x": 9.89,
         "y": 1.48
        }
       },
       {
        "nombre": "F´",
        "p": {
         "x": 0,
         "y": 11.34
        },
        "q": {
         "x": 9.89,
         "y": 11.34
        }
       },
       {
        "nombre": "3",
        "p": {
         "x": 8.16,
         "y": 0
        },
        "q": {
         "x": 8.16,
         "y": 13.08
        }
       },
       {
        "nombre": "2",
        "p": {
         "x": 1.7,
         "y": 0
        },
        "q": {
         "x": 1.7,
         "y": 13.08
        }
       }
      ],
      "columnas": [
       {
        "eje": "2/E",
        "centro": {
         "x": 1.7,
         "y": 1.48
        },
        "b": 1.4,
        "h": 1.4,
        "forma": "L"
       },
       {
        "eje": "3/E",
        "centro": {
         "x": 8.16,
         "y": 1.48
        },
        "b": 1.4,
        "h": 1.4,
        "forma": "L"
       },
       {
        "eje": "2/F´",
        "centro": {
         "x": 1.7,
         "y": 11.34
        },
        "b": 1.4,
        "h": 1.4,
        "forma": "L"
       },
       {
        "eje": "3/F´",
        "centro": {
         "x": 8.16,
         "y": 11.34
        },
        "b": 1.4,
        "h": 1.4,
        "forma": "L"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    },
    {
     "id": "vista-05",
     "nivel": 4,
     "categorias": {
      "ejes": [
       {
        "nombre": "E",
        "p": {
         "x": 0,
         "y": 1.48
        },
        "q": {
         "x": 9.89,
         "y": 1.48
        }
       },
       {
        "nombre": "F´",
        "p": {
         "x": 0,
         "y": 11.34
        },
        "q": {
         "x": 9.89,
         "y": 11.34
        }
       },
       {
        "nombre": "3",
        "p": {
         "x": 8.16,
         "y": 0
        },
        "q": {
         "x": 8.16,
         "y": 13.08
        }
       },
       {
        "nombre": "2",
        "p": {
         "x": 1.7,
         "y": 0
        },
        "q": {
         "x": 1.7,
         "y": 13.08
        }
       }
      ],
      "columnas": [
       {
        "eje": "2/E",
        "centro": {
         "x": 1.7,
         "y": 1.48
        },
        "b": 1.5,
        "h": 1.5,
        "forma": "L"
       },
       {
        "eje": "3/E",
        "centro": {
         "x": 8.16,
         "y": 1.48
        },
        "b": 1.5,
        "h": 1.5,
        "forma": "L"
       },
       {
        "eje": "2/F´",
        "centro": {
         "x": 1.7,
         "y": 11.34
        },
        "b": 1.5,
        "h": 1.5,
        "forma": "L"
       },
       {
        "eje": "3/F´",
        "centro": {
         "x": 8.16,
         "y": 11.34
        },
        "b": 1.5,
        "h": 1.5,
        "forma": "L"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    }
   ]
  }
 },
 {
  "nombre": "ilo:modulo-01",
  "grupo": "ilo",
  "id": "modulo-01",
  "etiqueta": null,
  "rasgos": {
   "vista": "vista-01",
   "areaAbierta": false,
   "niveles": 2,
   "ejes": {
    "x": 6,
    "y": 3
   },
   "luces": {
    "x": [
     12.18,
     5.4,
     5.7,
     5.71,
     5.69
    ],
    "y": [
     8.2,
     5.8
    ]
   },
   "largo": 34.68,
   "ancho": 14,
   "area": 485.49,
   "luzLosa": 8.2,
   "luzMax": 12.18,
   "columnas": 17,
   "tipos": [
    {
     "nombre": "C1",
     "forma": "rectangular",
     "b": 0.43,
     "h": 0.43,
     "n": 15
    },
    {
     "nombre": "PL1",
     "forma": "L",
     "b": 2.43,
     "h": 1.03,
     "n": 1
    },
    {
     "nombre": "PL2",
     "forma": "L",
     "b": 1.03,
     "h": 1.03,
     "n": 1
    }
   ],
   "placas": true,
   "columnetas": 70,
   "techoLiviano": false,
   "cubierta": true,
   "falsoCielo": false,
   "deportivo": false,
   "agua": false,
   "banos": true
  },
  "decisiones": {
   "cimentacion": "zapatas",
   "cimientoCorrido": true,
   "hz": 0.6,
   "df": 1.5,
   "losa": "aligerada y maciza",
   "espesorLosa": 0.2,
   "plantasDeLosa": 3,
   "vigas": [
    "30x50",
    "30x70"
   ],
   "fcColumnas": 280,
   "fcColumnetas": 175,
   "estribos": "3/8\": 1@.05, 10@.10",
   "porticos": 11,
   "mallaCimentacion": true,
   "columnasComoArquitectura": true,
   "losaDeTecho": true
  },
  "geometria": {
   "version": 1,
   "unidad": "m",
   "vistas": [
    {
     "id": "vista-01",
     "nivel": null,
     "categorias": {
      "ejes": [
       {
        "nombre": "J",
        "p": {
         "x": 5.39,
         "y": 11.41
        },
        "q": {
         "x": 5.39,
         "y": 0.35
        }
       },
       {
        "nombre": "I´",
        "p": {
         "x": 5.34,
         "y": 11.41
        },
        "q": {
         "x": 5.34,
         "y": 0.35
        }
       },
       {
        "nombre": "V",
        "p": {
         "x": 24.37,
         "y": 11.73
        },
        "q": {
         "x": 24.37,
         "y": 0.02
        }
       },
       {
        "nombre": "G",
        "p": {
         "x": 1.27,
         "y": 11.76
        },
        "q": {
         "x": 1.27,
         "y": 0
        }
       },
       {
        "nombre": "M",
        "p": {
         "x": 9.38,
         "y": 11.76
        },
        "q": {
         "x": 9.38,
         "y": 0
        }
       },
       {
        "nombre": "P",
        "p": {
         "x": 12.98,
         "y": 11.76
        },
        "q": {
         "x": 12.98,
         "y": 0
        }
       },
       {
        "nombre": "S",
        "p": {
         "x": 16.78,
         "y": 11.76
        },
        "q": {
         "x": 16.78,
         "y": 0
        }
       },
       {
        "nombre": "U",
        "p": {
         "x": 20.59,
         "y": 11.76
        },
        "q": {
         "x": 20.59,
         "y": 0
        }
       },
       {
        "nombre": "1",
        "p": {
         "x": 0.05,
         "y": 10.47
        },
        "q": {
         "x": 25.53,
         "y": 10.47
        }
       },
       {
        "nombre": "5",
        "p": {
         "x": 0,
         "y": 1.16
        },
        "q": {
         "x": 25.58,
         "y": 1.16
        }
       },
       {
        "nombre": "2",
        "p": {
         "x": 0,
         "y": 6.62
        },
        "q": {
         "x": 25.58,
         "y": 6.62
        }
       }
      ],
      "columnas": [
       {
        "eje": "5/G",
        "centro": {
         "x": 1.27,
         "y": 1.16
        },
        "b": 0.67,
        "h": 0.67,
        "forma": "L"
       },
       {
        "eje": "5/J",
        "centro": {
         "x": 5.33,
         "y": 1.16
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "5/M",
        "centro": {
         "x": 9.38,
         "y": 1.16
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "5/P",
        "centro": {
         "x": 12.98,
         "y": 1.16
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "5/S",
        "centro": {
         "x": 16.78,
         "y": 1.16
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "5/U",
        "centro": {
         "x": 20.59,
         "y": 1.16
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "5/V",
        "centro": {
         "x": 24.37,
         "y": 1.16
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "2/G",
        "centro": {
         "x": 1.27,
         "y": 6.62
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "2/J",
        "centro": {
         "x": 5.03,
         "y": 6.62
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "2/M",
        "centro": {
         "x": 9.38,
         "y": 6.62
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "2/P",
        "centro": {
         "x": 12.98,
         "y": 6.62
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "2/S",
        "centro": {
         "x": 16.78,
         "y": 6.62
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "2/U",
        "centro": {
         "x": 20.59,
         "y": 6.62
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "2/V",
        "centro": {
         "x": 24.37,
         "y": 6.62
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "1/V",
        "centro": {
         "x": 24.37,
         "y": 10.47
        },
        "b": 0.67,
        "h": 1.6,
        "forma": "L"
       },
       {
        "eje": "1/J",
        "centro": {
         "x": 5.32,
         "y": 10.47
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "1/M",
        "centro": {
         "x": 9.38,
         "y": 10.47
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "1/P",
        "centro": {
         "x": 12.98,
         "y": 10.47
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "1/S",
        "centro": {
         "x": 16.78,
         "y": 10.47
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "1/U",
        "centro": {
         "x": 20.59,
         "y": 10.47
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": null,
        "centro": {
         "x": 5.53,
         "y": 1.29
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "columneta"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    },
    {
     "id": "vista-02",
     "nivel": null,
     "categorias": {
      "ejes": [
       {
        "nombre": "V",
        "p": {
         "x": 24.67,
         "y": 12.85
        },
        "q": {
         "x": 24.67,
         "y": 0.02
        }
       },
       {
        "nombre": "G",
        "p": {
         "x": 1.57,
         "y": 12.87
        },
        "q": {
         "x": 1.57,
         "y": 0
        }
       },
       {
        "nombre": "M",
        "p": {
         "x": 9.68,
         "y": 12.87
        },
        "q": {
         "x": 9.68,
         "y": 0
        }
       },
       {
        "nombre": "P",
        "p": {
         "x": 13.28,
         "y": 12.87
        },
        "q": {
         "x": 13.28,
         "y": 0
        }
       },
       {
        "nombre": "S",
        "p": {
         "x": 17.08,
         "y": 12.87
        },
        "q": {
         "x": 17.08,
         "y": 0
        }
       },
       {
        "nombre": "U",
        "p": {
         "x": 20.88,
         "y": 12.87
        },
        "q": {
         "x": 20.88,
         "y": 0
        }
       },
       {
        "nombre": "1",
        "p": {
         "x": 0.05,
         "y": 10.74
        },
        "q": {
         "x": 26.19,
         "y": 10.74
        }
       },
       {
        "nombre": "5",
        "p": {
         "x": 0,
         "y": 1.43
        },
        "q": {
         "x": 26.24,
         "y": 1.43
        }
       },
       {
        "nombre": "2",
        "p": {
         "x": 0,
         "y": 6.88
        },
        "q": {
         "x": 26.24,
         "y": 6.88
        }
       }
      ],
      "columnas": [
       {
        "eje": "5/G",
        "centro": {
         "x": 1.57,
         "y": 1.43
        },
        "b": 0.67,
        "h": 0.67,
        "forma": "L"
       },
       {
        "eje": "5/M",
        "centro": {
         "x": 9.68,
         "y": 1.43
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "5/P",
        "centro": {
         "x": 13.28,
         "y": 1.43
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "5/S",
        "centro": {
         "x": 17.08,
         "y": 1.43
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "5/U",
        "centro": {
         "x": 20.88,
         "y": 1.43
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "5/V",
        "centro": {
         "x": 24.67,
         "y": 1.43
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "2/G",
        "centro": {
         "x": 1.57,
         "y": 6.88
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "2/M",
        "centro": {
         "x": 9.68,
         "y": 6.88
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "2/P",
        "centro": {
         "x": 13.28,
         "y": 6.88
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "2/S",
        "centro": {
         "x": 17.08,
         "y": 6.88
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "2/U",
        "centro": {
         "x": 20.88,
         "y": 6.88
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "2/V",
        "centro": {
         "x": 24.67,
         "y": 6.88
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "1/V",
        "centro": {
         "x": 24.67,
         "y": 10.74
        },
        "b": 0.67,
        "h": 1.6,
        "forma": "L"
       },
       {
        "eje": "1/M",
        "centro": {
         "x": 9.68,
         "y": 10.74
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "1/P",
        "centro": {
         "x": 13.28,
         "y": 10.74
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "1/S",
        "centro": {
         "x": 17.08,
         "y": 10.74
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "1/U",
        "centro": {
         "x": 20.88,
         "y": 10.74
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": null,
        "centro": {
         "x": 22.16,
         "y": 10.75
        },
        "b": 0.19,
        "h": 0.16,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 22.7,
         "y": 10.46
        },
        "b": 0.17,
        "h": 0.12,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 5.82,
         "y": 10.61
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 5.82,
         "y": 6.88
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 5.82,
         "y": 1.56
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 5.5,
         "y": 1.56
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "columneta"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    },
    {
     "id": "vista-03",
     "nivel": 2,
     "categorias": {
      "ejes": [
       {
        "nombre": "V",
        "p": {
         "x": 24.67,
         "y": 12.85
        },
        "q": {
         "x": 24.67,
         "y": 0.02
        }
       },
       {
        "nombre": "G",
        "p": {
         "x": 1.57,
         "y": 12.87
        },
        "q": {
         "x": 1.57,
         "y": 0
        }
       },
       {
        "nombre": "M",
        "p": {
         "x": 9.68,
         "y": 12.87
        },
        "q": {
         "x": 9.68,
         "y": 0
        }
       },
       {
        "nombre": "P",
        "p": {
         "x": 13.28,
         "y": 12.87
        },
        "q": {
         "x": 13.28,
         "y": 0
        }
       },
       {
        "nombre": "S",
        "p": {
         "x": 17.08,
         "y": 12.87
        },
        "q": {
         "x": 17.08,
         "y": 0
        }
       },
       {
        "nombre": "U",
        "p": {
         "x": 20.88,
         "y": 12.87
        },
        "q": {
         "x": 20.88,
         "y": 0
        }
       },
       {
        "nombre": "1",
        "p": {
         "x": 0.05,
         "y": 10.74
        },
        "q": {
         "x": 26.19,
         "y": 10.74
        }
       },
       {
        "nombre": "5",
        "p": {
         "x": 0,
         "y": 1.43
        },
        "q": {
         "x": 26.24,
         "y": 1.43
        }
       },
       {
        "nombre": "2",
        "p": {
         "x": 0,
         "y": 6.88
        },
        "q": {
         "x": 26.24,
         "y": 6.88
        }
       }
      ],
      "columnas": [
       {
        "eje": "5/G",
        "centro": {
         "x": 1.57,
         "y": 1.43
        },
        "b": 0.67,
        "h": 0.67,
        "forma": "L"
       },
       {
        "eje": "5/M",
        "centro": {
         "x": 9.68,
         "y": 1.43
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "5/P",
        "centro": {
         "x": 13.28,
         "y": 1.43
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "5/S",
        "centro": {
         "x": 17.08,
         "y": 1.43
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "5/U",
        "centro": {
         "x": 20.88,
         "y": 1.43
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "5/V",
        "centro": {
         "x": 24.67,
         "y": 1.43
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "2/G",
        "centro": {
         "x": 1.57,
         "y": 6.88
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "2/M",
        "centro": {
         "x": 9.68,
         "y": 6.88
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "2/P",
        "centro": {
         "x": 13.28,
         "y": 6.88
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "2/S",
        "centro": {
         "x": 17.08,
         "y": 6.88
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "2/U",
        "centro": {
         "x": 20.88,
         "y": 6.88
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "2/V",
        "centro": {
         "x": 24.67,
         "y": 6.88
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "1/V",
        "centro": {
         "x": 24.67,
         "y": 10.74
        },
        "b": 0.67,
        "h": 1.6,
        "forma": "L"
       },
       {
        "eje": "1/M",
        "centro": {
         "x": 9.68,
         "y": 10.74
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "1/P",
        "centro": {
         "x": 13.28,
         "y": 10.74
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "1/S",
        "centro": {
         "x": 17.08,
         "y": 10.74
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "1/U",
        "centro": {
         "x": 20.88,
         "y": 10.74
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": null,
        "centro": {
         "x": 5.82,
         "y": 10.61
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 5.82,
         "y": 6.88
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 5.82,
         "y": 1.56
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 5.5,
         "y": 1.56
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 19.44,
         "y": 10.72
        },
        "b": 0.14,
        "h": 0.18,
        "forma": "columneta"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    },
    {
     "id": "vista-04",
     "nivel": 3,
     "categorias": {
      "ejes": [
       {
        "nombre": "V",
        "p": {
         "x": 24.67,
         "y": 12.52
        },
        "q": {
         "x": 24.67,
         "y": 0.02
        }
       },
       {
        "nombre": "G",
        "p": {
         "x": 1.57,
         "y": 12.54
        },
        "q": {
         "x": 1.57,
         "y": 0
        }
       },
       {
        "nombre": "M",
        "p": {
         "x": 9.68,
         "y": 12.54
        },
        "q": {
         "x": 9.68,
         "y": 0
        }
       },
       {
        "nombre": "P",
        "p": {
         "x": 13.28,
         "y": 12.54
        },
        "q": {
         "x": 13.28,
         "y": 0
        }
       },
       {
        "nombre": "S",
        "p": {
         "x": 17.08,
         "y": 12.54
        },
        "q": {
         "x": 17.08,
         "y": 0
        }
       },
       {
        "nombre": "U",
        "p": {
         "x": 20.88,
         "y": 12.54
        },
        "q": {
         "x": 20.88,
         "y": 0
        }
       },
       {
        "nombre": "1",
        "p": {
         "x": 0.05,
         "y": 10.9
        },
        "q": {
         "x": 26.19,
         "y": 10.9
        }
       },
       {
        "nombre": "5",
        "p": {
         "x": 0,
         "y": 1.59
        },
        "q": {
         "x": 26.24,
         "y": 1.59
        }
       },
       {
        "nombre": "2",
        "p": {
         "x": 0,
         "y": 7.05
        },
        "q": {
         "x": 26.24,
         "y": 7.05
        }
       }
      ],
      "columnas": [
       {
        "eje": "5/M",
        "centro": {
         "x": 9.68,
         "y": 1.59
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "2/M",
        "centro": {
         "x": 9.68,
         "y": 7.05
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": null,
        "centro": {
         "x": 5.82,
         "y": 7.05
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 5.82,
         "y": 1.72
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "columneta"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    },
    {
     "id": "vista-05",
     "nivel": 1,
     "categorias": {
      "ejes": [
       {
        "nombre": "V",
        "p": {
         "x": 24.67,
         "y": 12.85
        },
        "q": {
         "x": 24.67,
         "y": 0.02
        }
       },
       {
        "nombre": "G",
        "p": {
         "x": 1.57,
         "y": 12.87
        },
        "q": {
         "x": 1.57,
         "y": 0
        }
       },
       {
        "nombre": "M",
        "p": {
         "x": 9.68,
         "y": 12.87
        },
        "q": {
         "x": 9.68,
         "y": 0
        }
       },
       {
        "nombre": "P",
        "p": {
         "x": 13.28,
         "y": 12.87
        },
        "q": {
         "x": 13.28,
         "y": 0
        }
       },
       {
        "nombre": "S",
        "p": {
         "x": 17.08,
         "y": 12.87
        },
        "q": {
         "x": 17.08,
         "y": 0
        }
       },
       {
        "nombre": "U",
        "p": {
         "x": 20.88,
         "y": 12.87
        },
        "q": {
         "x": 20.88,
         "y": 0
        }
       },
       {
        "nombre": "1",
        "p": {
         "x": 0.05,
         "y": 10.74
        },
        "q": {
         "x": 26.19,
         "y": 10.74
        }
       },
       {
        "nombre": "5",
        "p": {
         "x": 0,
         "y": 1.43
        },
        "q": {
         "x": 26.24,
         "y": 1.43
        }
       },
       {
        "nombre": "2",
        "p": {
         "x": 0,
         "y": 6.88
        },
        "q": {
         "x": 26.24,
         "y": 6.88
        }
       }
      ],
      "columnas": [
       {
        "eje": "5/G",
        "centro": {
         "x": 1.57,
         "y": 1.43
        },
        "b": 0.67,
        "h": 0.67,
        "forma": "L"
       },
       {
        "eje": "5/M",
        "centro": {
         "x": 9.68,
         "y": 1.43
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "5/P",
        "centro": {
         "x": 13.28,
         "y": 1.43
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "5/S",
        "centro": {
         "x": 17.08,
         "y": 1.43
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "5/U",
        "centro": {
         "x": 20.88,
         "y": 1.43
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "5/V",
        "centro": {
         "x": 24.67,
         "y": 1.43
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "2/G",
        "centro": {
         "x": 1.57,
         "y": 6.88
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "2/M",
        "centro": {
         "x": 9.68,
         "y": 6.88
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "2/P",
        "centro": {
         "x": 13.28,
         "y": 6.88
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "2/S",
        "centro": {
         "x": 17.08,
         "y": 6.88
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "2/U",
        "centro": {
         "x": 20.88,
         "y": 6.88
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "2/V",
        "centro": {
         "x": 24.67,
         "y": 6.88
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "1/V",
        "centro": {
         "x": 24.67,
         "y": 10.74
        },
        "b": 0.67,
        "h": 1.6,
        "forma": "L"
       },
       {
        "eje": "1/M",
        "centro": {
         "x": 9.68,
         "y": 10.74
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "1/P",
        "centro": {
         "x": 13.28,
         "y": 10.74
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "1/S",
        "centro": {
         "x": 17.08,
         "y": 10.74
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "1/U",
        "centro": {
         "x": 20.88,
         "y": 10.74
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": null,
        "centro": {
         "x": 5.82,
         "y": 10.61
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 5.82,
         "y": 6.88
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 5.82,
         "y": 1.56
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 5.5,
         "y": 1.56
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "columneta"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    },
    {
     "id": "vista-06",
     "nivel": 2,
     "categorias": {
      "ejes": [
       {
        "nombre": "V",
        "p": {
         "x": 24.67,
         "y": 12.85
        },
        "q": {
         "x": 24.67,
         "y": 0.02
        }
       },
       {
        "nombre": "G",
        "p": {
         "x": 1.57,
         "y": 12.87
        },
        "q": {
         "x": 1.57,
         "y": 0
        }
       },
       {
        "nombre": "M",
        "p": {
         "x": 9.68,
         "y": 12.87
        },
        "q": {
         "x": 9.68,
         "y": 0
        }
       },
       {
        "nombre": "P",
        "p": {
         "x": 13.28,
         "y": 12.87
        },
        "q": {
         "x": 13.28,
         "y": 0
        }
       },
       {
        "nombre": "S",
        "p": {
         "x": 17.08,
         "y": 12.87
        },
        "q": {
         "x": 17.08,
         "y": 0
        }
       },
       {
        "nombre": "U",
        "p": {
         "x": 20.88,
         "y": 12.87
        },
        "q": {
         "x": 20.88,
         "y": 0
        }
       },
       {
        "nombre": "1",
        "p": {
         "x": 0.05,
         "y": 10.74
        },
        "q": {
         "x": 26.19,
         "y": 10.74
        }
       },
       {
        "nombre": "5",
        "p": {
         "x": 0,
         "y": 1.43
        },
        "q": {
         "x": 26.24,
         "y": 1.43
        }
       },
       {
        "nombre": "2",
        "p": {
         "x": 0,
         "y": 6.88
        },
        "q": {
         "x": 26.24,
         "y": 6.88
        }
       }
      ],
      "columnas": [
       {
        "eje": "5/G",
        "centro": {
         "x": 1.57,
         "y": 1.43
        },
        "b": 0.67,
        "h": 0.67,
        "forma": "L"
       },
       {
        "eje": "5/M",
        "centro": {
         "x": 9.68,
         "y": 1.43
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "5/P",
        "centro": {
         "x": 13.28,
         "y": 1.43
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "5/S",
        "centro": {
         "x": 17.08,
         "y": 1.43
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "5/U",
        "centro": {
         "x": 20.88,
         "y": 1.43
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "5/V",
        "centro": {
         "x": 24.67,
         "y": 1.43
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "2/G",
        "centro": {
         "x": 1.57,
         "y": 6.88
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "2/M",
        "centro": {
         "x": 9.68,
         "y": 6.88
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "2/P",
        "centro": {
         "x": 13.28,
         "y": 6.88
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "2/S",
        "centro": {
         "x": 17.08,
         "y": 6.88
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "2/U",
        "centro": {
         "x": 20.88,
         "y": 6.88
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "2/V",
        "centro": {
         "x": 24.67,
         "y": 6.88
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "1/V",
        "centro": {
         "x": 24.67,
         "y": 10.74
        },
        "b": 0.67,
        "h": 1.6,
        "forma": "L"
       },
       {
        "eje": "1/M",
        "centro": {
         "x": 9.68,
         "y": 10.74
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "1/P",
        "centro": {
         "x": 13.28,
         "y": 10.74
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "1/S",
        "centro": {
         "x": 17.08,
         "y": 10.74
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "1/U",
        "centro": {
         "x": 20.88,
         "y": 10.74
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": null,
        "centro": {
         "x": 5.82,
         "y": 10.61
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 5.82,
         "y": 6.88
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 5.82,
         "y": 1.56
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 5.5,
         "y": 1.56
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "columneta"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    }
   ]
  }
 },
 {
  "nombre": "ilo:modulo-02",
  "grupo": "ilo",
  "id": "modulo-02",
  "etiqueta": null,
  "rasgos": {
   "vista": "vista-01",
   "areaAbierta": false,
   "niveles": 2,
   "ejes": {
    "x": 3,
    "y": 4
   },
   "luces": {
    "x": [
     11.26,
     8
    ],
    "y": [
     6.5,
     8.2,
     5.8
    ]
   },
   "largo": 20.5,
   "ancho": 19.26,
   "area": 394.79,
   "luzLosa": 8.2,
   "luzMax": 11.26,
   "columnas": 10,
   "tipos": [
    {
     "nombre": "C1",
     "forma": "rectangular",
     "b": 0.43,
     "h": 0.43,
     "n": 8
    },
    {
     "nombre": "C2",
     "forma": "rectangular",
     "b": 0.25,
     "h": 0.13,
     "n": 1
    },
    {
     "nombre": "PL1",
     "forma": "L",
     "b": 1.03,
     "h": 1.03,
     "n": 1
    }
   ],
   "placas": true,
   "columnetas": 92,
   "techoLiviano": false,
   "cubierta": true,
   "falsoCielo": false,
   "deportivo": false,
   "agua": false,
   "banos": true
  },
  "decisiones": {
   "cimentacion": "zapatas",
   "cimientoCorrido": true,
   "hz": 0.6,
   "df": 1.5,
   "losa": "aligerada y maciza",
   "espesorLosa": 0.2,
   "plantasDeLosa": 3,
   "vigas": [
    "30x70",
    "30x50"
   ],
   "fcColumnas": 280,
   "fcColumnetas": 175,
   "estribos": "3/8\": 1@.05, 10@.10",
   "porticos": 10,
   "mallaCimentacion": false,
   "columnasComoArquitectura": true,
   "losaDeTecho": true
  },
  "geometria": {
   "version": 1,
   "unidad": "m",
   "vistas": [
    {
     "id": "vista-01",
     "nivel": 2,
     "categorias": {
      "ejes": [
       {
        "nombre": "24",
        "p": {
         "x": 0,
         "y": 2.18
        },
        "q": {
         "x": 27.17,
         "y": 2.18
        }
       },
       {
        "nombre": "22",
        "p": {
         "x": 0,
         "y": 8.68
        },
        "q": {
         "x": 27.17,
         "y": 8.68
        }
       },
       {
        "nombre": "19",
        "p": {
         "x": 0,
         "y": 16.18
        },
        "q": {
         "x": 27.17,
         "y": 16.18
        }
       },
       {
        "nombre": "13",
        "p": {
         "x": 0,
         "y": 23.68
        },
        "q": {
         "x": 27.17,
         "y": 23.68
        }
       },
       {
        "nombre": "6",
        "p": {
         "x": 0,
         "y": 38.68
        },
        "q": {
         "x": 27.17,
         "y": 38.68
        }
       },
       {
        "nombre": "5",
        "p": {
         "x": 0,
         "y": 45.18
        },
        "q": {
         "x": 27.17,
         "y": 45.18
        }
       },
       {
        "nombre": "2",
        "p": {
         "x": 0,
         "y": 53.38
        },
        "q": {
         "x": 27.17,
         "y": 53.38
        }
       },
       {
        "nombre": "1",
        "p": {
         "x": 0,
         "y": 59.18
        },
        "q": {
         "x": 27.17,
         "y": 59.18
        }
       },
       {
        "nombre": "V´",
        "p": {
         "x": 2.25,
         "y": 61.25
        },
        "q": {
         "x": 2.2,
         "y": 0.08
        }
       },
       {
        "nombre": "Y",
        "p": {
         "x": 21.51,
         "y": 61.25
        },
        "q": {
         "x": 21.51,
         "y": 0
        }
       },
       {
        "nombre": "X",
        "p": {
         "x": 13.51,
         "y": 61.25
        },
        "q": {
         "x": 13.51,
         "y": 0
        }
       }
      ],
      "columnas": [
       {
        "eje": "24/X",
        "centro": {
         "x": 13.51,
         "y": 2.18
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "rectangular"
       },
       {
        "eje": "24/Y",
        "centro": {
         "x": 21.51,
         "y": 2.18
        },
        "b": 1.53,
        "h": 1.53,
        "forma": "L"
       },
       {
        "eje": "22/X",
        "centro": {
         "x": 13.51,
         "y": 8.68
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "rectangular"
       },
       {
        "eje": "22/Y",
        "centro": {
         "x": 21.51,
         "y": 8.68
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "rectangular"
       },
       {
        "eje": "19/X",
        "centro": {
         "x": 13.51,
         "y": 16.18
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "rectangular"
       },
       {
        "eje": "19/Y",
        "centro": {
         "x": 21.51,
         "y": 16.18
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "rectangular"
       },
       {
        "eje": "13/X",
        "centro": {
         "x": 13.51,
         "y": 23.68
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "rectangular"
       },
       {
        "eje": "13/Y",
        "centro": {
         "x": 21.51,
         "y": 23.68
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "rectangular"
       },
       {
        "eje": "6/X",
        "centro": {
         "x": 13.51,
         "y": 38.68
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "rectangular"
       },
       {
        "eje": "6/Y",
        "centro": {
         "x": 21.51,
         "y": 38.68
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "rectangular"
       },
       {
        "eje": "5/X",
        "centro": {
         "x": 13.51,
         "y": 45.18
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "rectangular"
       },
       {
        "eje": "5/Y",
        "centro": {
         "x": 21.51,
         "y": 45.18
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "rectangular"
       },
       {
        "eje": "5/V´",
        "centro": {
         "x": 2.25,
         "y": 45.18
        },
        "b": 1.03,
        "h": 1.03,
        "forma": "L"
       },
       {
        "eje": "2/V´",
        "centro": {
         "x": 2.25,
         "y": 53.38
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "rectangular"
       },
       {
        "eje": "2/X",
        "centro": {
         "x": 13.51,
         "y": 53.38
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "rectangular"
       },
       {
        "eje": "2/Y",
        "centro": {
         "x": 21.51,
         "y": 53.38
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "rectangular"
       },
       {
        "eje": "1/Y",
        "centro": {
         "x": 21.51,
         "y": 59.18
        },
        "b": 1.53,
        "h": 1.53,
        "forma": "L"
       },
       {
        "eje": "1/X",
        "centro": {
         "x": 13.51,
         "y": 59.18
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "rectangular"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.22,
         "y": 8.68
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.22,
         "y": 16.18
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.22,
         "y": 23.68
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.22,
         "y": 38.68
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.22,
         "y": 45.18
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.22,
         "y": 53.38
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.22,
         "y": 2.39
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 21.29,
         "y": 30.94
        },
        "b": 0.43,
        "h": 0.41,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 21.29,
         "y": 31.41
        },
        "b": 0.43,
        "h": 0.41,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.51,
         "y": 30.94
        },
        "b": 0.43,
        "h": 0.41,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.51,
         "y": 31.41
        },
        "b": 0.43,
        "h": 0.41,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 11.77,
         "y": 41.98
        },
        "b": 0.31,
        "h": 0.41,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 11.77,
         "y": 40.42
        },
        "b": 0.31,
        "h": 0.41,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 11.77,
         "y": 38.86
        },
        "b": 0.31,
        "h": 0.41,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 11.77,
         "y": 37.37
        },
        "b": 0.31,
        "h": 0.41,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 11.77,
         "y": 35.89
        },
        "b": 0.31,
        "h": 0.41,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 11.77,
         "y": 35.26
        },
        "b": 0.31,
        "h": 0.41,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 11.77,
         "y": 32.93
        },
        "b": 0.31,
        "h": 0.41,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 11.77,
         "y": 31.51
        },
        "b": 0.31,
        "h": 0.41,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 11.77,
         "y": 29.38
        },
        "b": 0.31,
        "h": 0.41,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 11.77,
         "y": 27.82
        },
        "b": 0.31,
        "h": 0.41,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 11.77,
         "y": 26.26
        },
        "b": 0.31,
        "h": 0.41,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 11.77,
         "y": 24.7
        },
        "b": 0.31,
        "h": 0.41,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 11.77,
         "y": 21.33
        },
        "b": 0.31,
        "h": 0.41,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 11.77,
         "y": 19.81
        },
        "b": 0.31,
        "h": 0.41,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 11.77,
         "y": 18.23
        },
        "b": 0.31,
        "h": 0.41,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 11.77,
         "y": 16.63
        },
        "b": 0.31,
        "h": 0.41,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 11.77,
         "y": 14.48
        },
        "b": 0.31,
        "h": 0.41,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 11.77,
         "y": 12.22
        },
        "b": 0.31,
        "h": 0.41,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 11.77,
         "y": 9.03
        },
        "b": 0.31,
        "h": 0.41,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 11.77,
         "y": 24.04
        },
        "b": 0.31,
        "h": 0.41,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 11.77,
         "y": 15.1
        },
        "b": 0.31,
        "h": 0.41,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 11.77,
         "y": 10.66
        },
        "b": 0.31,
        "h": 0.41,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.46,
         "y": 54.15
        },
        "b": 0.19,
        "h": 0.37,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.46,
         "y": 13.44
        },
        "b": 0.19,
        "h": 0.37,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.46,
         "y": 11.33
        },
        "b": 0.19,
        "h": 0.37,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.46,
         "y": 9.04
        },
        "b": 0.19,
        "h": 0.37,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.46,
         "y": 7.42
        },
        "b": 0.19,
        "h": 0.37,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.46,
         "y": 5.44
        },
        "b": 0.19,
        "h": 0.37,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.46,
         "y": 3.14
        },
        "b": 0.19,
        "h": 0.37,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.43,
         "y": 51.31
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.41,
         "y": 27.5
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 21.37,
         "y": 27.5
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.57,
         "y": 45.26
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.16,
         "y": 45.26
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.09,
         "y": 49.13
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.09,
         "y": 45.53
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.42,
         "y": 49.23
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 19.84,
         "y": 2.26
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.57,
         "y": 2.26
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.09,
         "y": 2.74
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.15,
         "y": 5.64
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.36,
         "y": 5.64
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.42,
         "y": 2.74
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 10.95,
         "y": 2.26
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 10.12,
         "y": 4.52
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.41,
         "y": 4.13
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 21.2,
         "y": 4.13
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.41,
         "y": 6.09
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 21.2,
         "y": 6.09
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.41,
         "y": 8.1
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 21.2,
         "y": 8.1
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.41,
         "y": 10.16
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 21.2,
         "y": 10.16
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.41,
         "y": 12.12
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 21.2,
         "y": 12.12
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.41,
         "y": 14.08
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 21.2,
         "y": 14.08
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.41,
         "y": 17.98
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 21.2,
         "y": 17.98
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.41,
         "y": 19.93
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 21.2,
         "y": 19.93
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.41,
         "y": 21.85
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 21.2,
         "y": 21.85
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.41,
         "y": 32.98
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 21.26,
         "y": 32.89
        },
        "b": 0.13,
        "h": 0.33,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.41,
         "y": 34.93
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 21.2,
         "y": 34.93
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.41,
         "y": 36.83
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 21.2,
         "y": 36.83
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.41,
         "y": 40.97
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 21.2,
         "y": 40.97
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.41,
         "y": 42.87
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 21.2,
         "y": 42.87
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.41,
         "y": 47.04
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 21.2,
         "y": 47.04
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.41,
         "y": 49.05
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 21.2,
         "y": 49.05
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.41,
         "y": 51.15
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 21.2,
         "y": 51.15
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.41,
         "y": 55.23
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 21.2,
         "y": 55.23
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.41,
         "y": 57.17
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 21.2,
         "y": 57.17
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.41,
         "y": 23.76
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.41,
         "y": 31.07
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.41,
         "y": 38.76
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.41,
         "y": 45.09
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.41,
         "y": 53.29
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 20.94,
         "y": 16.04
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 20.94,
         "y": 23.76
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 20.94,
         "y": 31.07
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 20.94,
         "y": 38.76
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 20.94,
         "y": 45.09
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 20.94,
         "y": 53.29
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 19.84,
         "y": 59.1
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 11.62,
         "y": 10.21
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.36,
         "y": 10.21
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 11.62,
         "y": 11.73
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.36,
         "y": 11.73
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 11.62,
         "y": 13.26
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.36,
         "y": 13.26
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 11.62,
         "y": 14.78
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.36,
         "y": 14.78
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 11.62,
         "y": 17.87
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.36,
         "y": 17.87
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 11.62,
         "y": 19.43
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.36,
         "y": 19.43
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 11.62,
         "y": 20.99
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.36,
         "y": 20.99
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 11.62,
         "y": 22.58
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.36,
         "y": 22.58
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 11.62,
         "y": 24.37
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.42,
         "y": 24.03
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 11.62,
         "y": 25.94
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.36,
         "y": 25.94
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 11.62,
         "y": 27.5
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.36,
         "y": 27.5
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 11.62,
         "y": 29.06
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.36,
         "y": 29.06
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 11.62,
         "y": 32.6
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.36,
         "y": 32.6
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 11.62,
         "y": 34.13
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.36,
         "y": 34.13
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 11.62,
         "y": 35.58
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.36,
         "y": 35.58
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 11.62,
         "y": 37.02
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.36,
         "y": 37.02
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 11.62,
         "y": 40.1
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.36,
         "y": 40.1
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 11.62,
         "y": 41.66
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.36,
         "y": 41.66
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 11.62,
         "y": 43.22
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.36,
         "y": 43.22
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 11.62,
         "y": 38.59
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 11.62,
         "y": 30.92
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 11.62,
         "y": 16.31
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.16,
         "y": 8.68
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.16,
         "y": 16.31
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.16,
         "y": 30.92
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.16,
         "y": 38.59
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.42,
         "y": 45.53
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.42,
         "y": 53.73
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.43,
         "y": 53.03
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.42,
         "y": 58.61
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.09,
         "y": 53.03
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 11.6,
         "y": 51.85
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.15,
         "y": 51.85
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 11.6,
         "y": 53.46
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 10.06,
         "y": 53.46
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 11.66,
         "y": 54.53
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.86,
         "y": 59.1
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.37,
         "y": 59.1
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 7.74,
         "y": 45.39
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.86,
         "y": 2.26
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.46,
         "y": 15.4
        },
        "b": 0.19,
        "h": 0.37,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.46,
         "y": 17.36
        },
        "b": 0.19,
        "h": 0.37,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.46,
         "y": 19.3
        },
        "b": 0.19,
        "h": 0.37,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.46,
         "y": 21.25
        },
        "b": 0.19,
        "h": 0.37,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.46,
         "y": 23.17
        },
        "b": 0.19,
        "h": 0.37,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.46,
         "y": 34.3
        },
        "b": 0.19,
        "h": 0.37,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.42,
         "y": 39.1
        },
        "b": 0.13,
        "h": 0.4,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.46,
         "y": 36.24
        },
        "b": 0.19,
        "h": 0.37,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.46,
         "y": 38.15
        },
        "b": 0.19,
        "h": 0.37,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.46,
         "y": 40.08
        },
        "b": 0.19,
        "h": 0.37,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.46,
         "y": 42.29
        },
        "b": 0.19,
        "h": 0.37,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.46,
         "y": 44.18
        },
        "b": 0.19,
        "h": 0.37,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.46,
         "y": 46.41
        },
        "b": 0.19,
        "h": 0.37,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.46,
         "y": 48.35
        },
        "b": 0.19,
        "h": 0.37,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.46,
         "y": 50.36
        },
        "b": 0.19,
        "h": 0.37,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.46,
         "y": 52.47
        },
        "b": 0.19,
        "h": 0.37,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.46,
         "y": 56.53
        },
        "b": 0.19,
        "h": 0.37,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 11.5,
         "y": 55.49
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.57,
         "y": 8.68
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 18.85,
         "y": 59.1
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.42,
         "y": 4.52
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.42,
         "y": 7.42
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 11.6,
         "y": 58.54
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.16,
         "y": 57.24
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    },
    {
     "id": "vista-02",
     "nivel": 1,
     "categorias": {
      "ejes": [
       {
        "nombre": "24",
        "p": {
         "x": 0,
         "y": 2.1
        },
        "q": {
         "x": 27.17,
         "y": 2.1
        }
       },
       {
        "nombre": "22",
        "p": {
         "x": 0,
         "y": 8.6
        },
        "q": {
         "x": 27.17,
         "y": 8.6
        }
       },
       {
        "nombre": "19",
        "p": {
         "x": 0,
         "y": 16.1
        },
        "q": {
         "x": 27.17,
         "y": 16.1
        }
       },
       {
        "nombre": "13",
        "p": {
         "x": 0,
         "y": 23.6
        },
        "q": {
         "x": 27.17,
         "y": 23.6
        }
       },
       {
        "nombre": "6",
        "p": {
         "x": 0,
         "y": 38.6
        },
        "q": {
         "x": 27.17,
         "y": 38.6
        }
       },
       {
        "nombre": "5",
        "p": {
         "x": 0,
         "y": 45.1
        },
        "q": {
         "x": 27.17,
         "y": 45.1
        }
       },
       {
        "nombre": "2",
        "p": {
         "x": 0,
         "y": 53.3
        },
        "q": {
         "x": 27.17,
         "y": 53.3
        }
       },
       {
        "nombre": "1",
        "p": {
         "x": 0,
         "y": 59.1
        },
        "q": {
         "x": 27.17,
         "y": 59.1
        }
       },
       {
        "nombre": "V´",
        "p": {
         "x": 2.25,
         "y": 61.18
        },
        "q": {
         "x": 2.2,
         "y": 0
        }
       },
       {
        "nombre": "Y",
        "p": {
         "x": 21.51,
         "y": 61.18
        },
        "q": {
         "x": 21.51,
         "y": 42.19
        }
       }
      ],
      "columnas": [
       {
        "eje": "24/V´",
        "centro": {
         "x": 2.2,
         "y": 2.1
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "rectangular"
       },
       {
        "eje": "6/Y",
        "centro": {
         "x": 21.51,
         "y": 38.6
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "rectangular"
       },
       {
        "eje": "5/Y",
        "centro": {
         "x": 21.51,
         "y": 45.1
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "rectangular"
       },
       {
        "eje": "5/V´",
        "centro": {
         "x": 2.25,
         "y": 45.1
        },
        "b": 1.03,
        "h": 1.03,
        "forma": "L"
       },
       {
        "eje": "2/V´",
        "centro": {
         "x": 2.25,
         "y": 53.3
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "rectangular"
       },
       {
        "eje": "2/Y",
        "centro": {
         "x": 21.51,
         "y": 53.3
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "rectangular"
       },
       {
        "eje": "1/Y",
        "centro": {
         "x": 21.51,
         "y": 59.1
        },
        "b": 1.53,
        "h": 1.53,
        "forma": "L"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.22,
         "y": 8.6
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.2,
         "y": 28.39
        },
        "b": 0.19,
        "h": 0.37,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.2,
         "y": 26.48
        },
        "b": 0.19,
        "h": 0.37,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.2,
         "y": 24.8
        },
        "b": 0.19,
        "h": 0.37,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.2,
         "y": 22.69
        },
        "b": 0.19,
        "h": 0.37,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.2,
         "y": 20.82
        },
        "b": 0.19,
        "h": 0.37,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.2,
         "y": 18.95
        },
        "b": 0.19,
        "h": 0.37,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.2,
         "y": 17.3
        },
        "b": 0.19,
        "h": 0.37,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.19,
         "y": 15.16
        },
        "b": 0.19,
        "h": 0.37,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.19,
         "y": 13.25
        },
        "b": 0.19,
        "h": 0.37,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.2,
         "y": 11.34
        },
        "b": 0.19,
        "h": 0.37,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.19,
         "y": 9.41
        },
        "b": 0.19,
        "h": 0.37,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.48,
         "y": 26.49
        },
        "b": 0.19,
        "h": 0.37,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.48,
         "y": 24.58
        },
        "b": 0.19,
        "h": 0.37,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.46,
         "y": 20.82
        },
        "b": 0.19,
        "h": 0.37,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.48,
         "y": 18.97
        },
        "b": 0.19,
        "h": 0.37,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.48,
         "y": 17.08
        },
        "b": 0.19,
        "h": 0.37,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.48,
         "y": 15.21
        },
        "b": 0.19,
        "h": 0.37,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.48,
         "y": 13.27
        },
        "b": 0.19,
        "h": 0.37,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.47,
         "y": 11.37
        },
        "b": 0.19,
        "h": 0.37,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.47,
         "y": 9.38
        },
        "b": 0.19,
        "h": 0.37,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.48,
         "y": 22.69
        },
        "b": 0.19,
        "h": 0.37,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.35,
         "y": 41.91
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.35,
         "y": 38.58
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 20.94,
         "y": 45.19
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.41,
         "y": 45.19
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.35,
         "y": 44.07
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 19.84,
         "y": 59.02
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.86,
         "y": 59.02
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.5,
         "y": 59.02
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 20.94,
         "y": 53.22
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 15.9,
         "y": 53.22
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 17.47,
         "y": 49.06
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 17.47,
         "y": 46.9
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.35,
         "y": 46.96
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.35,
         "y": 53.03
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 21.43,
         "y": 52.95
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.42,
         "y": 58.54
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.42,
         "y": 53.65
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.57,
         "y": 45.19
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.16,
         "y": 45.19
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 11.66,
         "y": 54.46
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 10,
         "y": 53.45
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 11.6,
         "y": 51.78
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.15,
         "y": 51.78
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.09,
         "y": 52.95
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 21.43,
         "y": 49.12
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.09,
         "y": 48.76
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.09,
         "y": 45.45
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.59,
         "y": 38.95
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.59,
         "y": 43.15
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.57,
         "y": 38.68
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.16,
         "y": 38.68
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 20.94,
         "y": 38.52
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.41,
         "y": 35.96
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 21.37,
         "y": 35.96
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.41,
         "y": 33.6
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 21.37,
         "y": 33.6
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.41,
         "y": 27.42
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 21.37,
         "y": 27.42
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.41,
         "y": 25.51
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 21.37,
         "y": 25.51
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.41,
         "y": 21.72
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 21.37,
         "y": 21.72
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.41,
         "y": 19.85
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 21.37,
         "y": 19.85
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.41,
         "y": 17.98
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 21.37,
         "y": 17.98
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.41,
         "y": 14.19
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 21.37,
         "y": 14.19
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.41,
         "y": 12.28
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 21.37,
         "y": 12.28
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.41,
         "y": 10.38
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 21.37,
         "y": 10.38
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.41,
         "y": 6.51
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 21.15,
         "y": 6.51
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.41,
         "y": 4.55
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 21.15,
         "y": 4.55
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 20.94,
         "y": 31
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 20.94,
         "y": 23.6
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 20.94,
         "y": 16.1
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 20.94,
         "y": 8.52
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 15.99,
         "y": 8.52
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.41,
         "y": 16.1
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.41,
         "y": 23.6
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.41,
         "y": 31
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.35,
         "y": 40.73
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.18,
         "y": 33.22
        },
        "b": 0.31,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.15,
         "y": 6.01
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.36,
         "y": 35.13
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.36,
         "y": 33.22
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.31,
         "y": 6.01
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.16,
         "y": 31.21
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.16,
         "y": 23.6
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.16,
         "y": 16.1
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.16,
         "y": 8.52
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.57,
         "y": 8.52
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.57,
         "y": 16.1
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.57,
         "y": 23.6
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 9.67,
         "y": 31.21
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.42,
         "y": 2.67
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 11.61,
         "y": 36.86
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.09,
         "y": 2.67
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 22.55,
         "y": 45.24
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 7.74,
         "y": 45.32
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.42,
         "y": 49.16
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.42,
         "y": 51.24
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 22.65,
         "y": 2.18
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 6.97,
         "y": 2.18
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 6.97,
         "y": 28.97
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 2.4,
         "y": 28.97
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 2.34,
         "y": 15.58
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 21.37,
         "y": 46.9
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 21.43,
         "y": 45.45
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 23.75,
         "y": 49.06
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 24.84,
         "y": 49
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 24.84,
         "y": 45.3
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 24.84,
         "y": 2.24
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 24.84,
         "y": 7.1
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 24.84,
         "y": 12.1
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 24.84,
         "y": 17.1
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 24.84,
         "y": 22.1
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 24.84,
         "y": 27.1
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 24.84,
         "y": 32.1
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 24.84,
         "y": 37.1
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 24.84,
         "y": 42.1
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 2.34,
         "y": 7.1
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 2.34,
         "y": 12.1
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 2.34,
         "y": 19.05
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 2.34,
         "y": 24.05
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 21.37,
         "y": 41.85
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.42,
         "y": 52.95
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.42,
         "y": 45.45
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 19.84,
         "y": 2.18
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 11.55,
         "y": 2.18
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.57,
         "y": 2.18
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 10.51,
         "y": 2.18
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 15.46,
         "y": 2.18
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.23,
         "y": 2.18
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 18.65,
         "y": 2.18
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.22,
         "y": 16.1
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.22,
         "y": 23.6
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.22,
         "y": 38.6
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.22,
         "y": 45.1
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.22,
         "y": 53.3
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.22,
         "y": 2.32
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.51,
         "y": 58.89
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.51,
         "y": 8.6
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.51,
         "y": 16.1
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.51,
         "y": 23.6
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.51,
         "y": 38.6
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.51,
         "y": 45.1
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.51,
         "y": 53.3
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.51,
         "y": 2.32
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 21.29,
         "y": 8.6
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 21.29,
         "y": 16.1
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 21.29,
         "y": 23.6
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 21.29,
         "y": 30.87
        },
        "b": 0.43,
        "h": 0.41,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 21.29,
         "y": 31.33
        },
        "b": 0.43,
        "h": 0.41,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.51,
         "y": 30.87
        },
        "b": 0.43,
        "h": 0.41,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.51,
         "y": 31.33
        },
        "b": 0.43,
        "h": 0.41,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.86,
         "y": 53.22
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.86,
         "y": 38.52
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.5,
         "y": 2.18
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.2,
         "y": 34.19
        },
        "b": 0.19,
        "h": 0.37,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.54,
         "y": 53.39
        },
        "b": 0.19,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.18,
         "y": 12.28
        },
        "b": 0.32,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.36,
         "y": 10.38
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.18,
         "y": 10.38
        },
        "b": 0.32,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.36,
         "y": 12.28
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.36,
         "y": 14.19
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.18,
         "y": 14.19
        },
        "b": 0.32,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.36,
         "y": 17.98
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.18,
         "y": 17.98
        },
        "b": 0.32,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.36,
         "y": 19.85
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.18,
         "y": 19.85
        },
        "b": 0.32,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.36,
         "y": 21.72
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.18,
         "y": 21.72
        },
        "b": 0.32,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.36,
         "y": 25.51
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.18,
         "y": 25.51
        },
        "b": 0.32,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.36,
         "y": 27.42
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.18,
         "y": 27.42
        },
        "b": 0.32,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.36,
         "y": 29.33
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.18,
         "y": 35.13
        },
        "b": 0.32,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.18,
         "y": 36.92
        },
        "b": 0.31,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.42,
         "y": 30.49
        },
        "b": 0.13,
        "h": 0.33,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 21.43,
         "y": 44.75
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 21.43,
         "y": 38.95
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.09,
         "y": 35.7
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 21.43,
         "y": 57.44
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 21.43,
         "y": 31.68
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 21.43,
         "y": 33.38
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 21.43,
         "y": 33.81
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 21.43,
         "y": 35.52
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.86,
         "y": 8.52
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 11.61,
         "y": 35.19
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.42,
         "y": 4.19
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.35,
         "y": 51.24
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.35,
         "y": 50.06
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    },
    {
     "id": "vista-03",
     "nivel": null,
     "categorias": {
      "ejes": [
       {
        "nombre": "9",
        "p": {
         "x": 31.79,
         "y": 24.33
        },
        "q": {
         "x": 31.79,
         "y": 0
        }
       },
       {
        "nombre": "6",
        "p": {
         "x": 24.33,
         "y": 24.33
        },
        "q": {
         "x": 24.33,
         "y": 0
        }
       },
       {
        "nombre": "2",
        "p": {
         "x": 9.63,
         "y": 24.33
        },
        "q": {
         "x": 9.63,
         "y": 0
        }
       },
       {
        "nombre": "1",
        "p": {
         "x": 3.84,
         "y": 24.33
        },
        "q": {
         "x": 3.84,
         "y": 0
        }
       },
       {
        "nombre": "5",
        "p": {
         "x": 17.83,
         "y": 24.33
        },
        "q": {
         "x": 17.83,
         "y": 0
        }
       },
       {
        "nombre": "Y",
        "p": {
         "x": 0.08,
         "y": 21.53
        },
        "q": {
         "x": 33.91,
         "y": 21.53
        }
       },
       {
        "nombre": "X",
        "p": {
         "x": 0.08,
         "y": 13.54
        },
        "q": {
         "x": 33.91,
         "y": 13.54
        }
       },
       {
        "nombre": "V´",
        "p": {
         "x": 0.08,
         "y": 2.31
        },
        "q": {
         "x": 33.91,
         "y": 2.31
        }
       },
       {
        "nombre": "W",
        "p": {
         "x": 0,
         "y": 8.61
        },
        "q": {
         "x": 33.99,
         "y": 8.61
        }
       },
       {
        "nombre": "W´",
        "p": {
         "x": 0,
         "y": 7.43
        },
        "q": {
         "x": 33.99,
         "y": 7.43
        }
       }
      ],
      "columnas": [
       {
        "eje": "2/V´",
        "centro": {
         "x": 9.63,
         "y": 2.31
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "5/V´",
        "centro": {
         "x": 17.83,
         "y": 2.31
        },
        "b": 1,
        "h": 1,
        "forma": "L"
       },
       {
        "eje": "2/W´",
        "centro": {
         "x": 9.63,
         "y": 7.43
        },
        "b": 1,
        "h": 1,
        "forma": "L"
       },
       {
        "eje": "5/W´",
        "centro": {
         "x": 17.83,
         "y": 7.43
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "2/W",
        "centro": {
         "x": 9.63,
         "y": 8.61
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "5/W",
        "centro": {
         "x": 17.83,
         "y": 8.61
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "6/W",
        "centro": {
         "x": 24.33,
         "y": 8.61
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "9/W",
        "centro": {
         "x": 31.79,
         "y": 8.61
        },
        "b": 1.5,
        "h": 1.5,
        "forma": "L"
       },
       {
        "eje": "1/X",
        "centro": {
         "x": 3.84,
         "y": 13.54
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "2/X",
        "centro": {
         "x": 9.63,
         "y": 13.54
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "5/X",
        "centro": {
         "x": 17.83,
         "y": 13.54
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "6/X",
        "centro": {
         "x": 24.33,
         "y": 13.54
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "9/X",
        "centro": {
         "x": 31.79,
         "y": 13.54
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "1/Y",
        "centro": {
         "x": 3.84,
         "y": 21.53
        },
        "b": 1.5,
        "h": 1.5,
        "forma": "L"
       },
       {
        "eje": "2/Y",
        "centro": {
         "x": 9.63,
         "y": 21.53
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "5/Y",
        "centro": {
         "x": 17.83,
         "y": 21.53
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "6/Y",
        "centro": {
         "x": 24.33,
         "y": 21.53
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "9/Y",
        "centro": {
         "x": 31.79,
         "y": 21.53
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    },
    {
     "id": "vista-04",
     "nivel": null,
     "categorias": {
      "ejes": [
       {
        "nombre": "9",
        "p": {
         "x": 16.22,
         "y": 1.47
        },
        "q": {
         "x": 0,
         "y": 1.47
        }
       },
       {
        "nombre": "6",
        "p": {
         "x": 16.22,
         "y": 6.44
        },
        "q": {
         "x": 0,
         "y": 6.44
        }
       },
       {
        "nombre": "2",
        "p": {
         "x": 16.22,
         "y": 16.24
        },
        "q": {
         "x": 0,
         "y": 16.24
        }
       },
       {
        "nombre": "1",
        "p": {
         "x": 16.22,
         "y": 20.1
        },
        "q": {
         "x": 0,
         "y": 20.1
        }
       },
       {
        "nombre": "5",
        "p": {
         "x": 16.22,
         "y": 10.77
        },
        "q": {
         "x": 0,
         "y": 10.77
        }
       },
       {
        "nombre": "Y",
        "p": {
         "x": 14.35,
         "y": 22.61
        },
        "q": {
         "x": 14.35,
         "y": 0.05
        }
       },
       {
        "nombre": "X",
        "p": {
         "x": 9.03,
         "y": 22.61
        },
        "q": {
         "x": 9.03,
         "y": 0.05
        }
       },
       {
        "nombre": "V´",
        "p": {
         "x": 1.54,
         "y": 22.61
        },
        "q": {
         "x": 1.54,
         "y": 0.05
        }
       },
       {
        "nombre": "W",
        "p": {
         "x": 5.74,
         "y": 22.66
        },
        "q": {
         "x": 5.74,
         "y": 0
        }
       },
       {
        "nombre": "W´",
        "p": {
         "x": 4.95,
         "y": 22.66
        },
        "q": {
         "x": 4.95,
         "y": 0
        }
       }
      ],
      "columnas": [
       {
        "eje": "9/X",
        "centro": {
         "x": 9.03,
         "y": 1.47
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "9/Y",
        "centro": {
         "x": 14.35,
         "y": 1.47
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "9/W",
        "centro": {
         "x": 5.74,
         "y": 1.47
        },
        "b": 1,
        "h": 1,
        "forma": "L"
       },
       {
        "eje": "6/W",
        "centro": {
         "x": 5.74,
         "y": 6.44
        },
        "b": 0.8,
        "h": 1.47,
        "forma": "rectangular"
       },
       {
        "eje": "6/X",
        "centro": {
         "x": 9.03,
         "y": 6.44
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "6/Y",
        "centro": {
         "x": 14.35,
         "y": 6.44
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "5/W´",
        "centro": {
         "x": 4.95,
         "y": 10.77
        },
        "b": 1,
        "h": 1,
        "forma": "rectangular"
       },
       {
        "eje": "5/W",
        "centro": {
         "x": 5.74,
         "y": 10.77
        },
        "b": 0.8,
        "h": 1.47,
        "forma": "rectangular"
       },
       {
        "eje": "5/X",
        "centro": {
         "x": 9.03,
         "y": 10.77
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "5/Y",
        "centro": {
         "x": 14.35,
         "y": 10.77
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "5/V´",
        "centro": {
         "x": 1.54,
         "y": 10.77
        },
        "b": 0.67,
        "h": 0.67,
        "forma": "L"
       },
       {
        "eje": "2/V´",
        "centro": {
         "x": 1.54,
         "y": 16.24
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "2/W´",
        "centro": {
         "x": 4.95,
         "y": 16.24
        },
        "b": 0.67,
        "h": 0.67,
        "forma": "L"
       },
       {
        "eje": "2/W",
        "centro": {
         "x": 5.74,
         "y": 16.24
        },
        "b": 1,
        "h": 1,
        "forma": "rectangular"
       },
       {
        "eje": "2/X",
        "centro": {
         "x": 9.03,
         "y": 16.24
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "2/Y",
        "centro": {
         "x": 14.35,
         "y": 16.24
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "1/Y",
        "centro": {
         "x": 14.35,
         "y": 20.1
        },
        "b": 1,
        "h": 1,
        "forma": "L"
       },
       {
        "eje": "1/X",
        "centro": {
         "x": 9.03,
         "y": 20.1
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    },
    {
     "id": "vista-05",
     "nivel": null,
     "categorias": {
      "ejes": [
       {
        "nombre": "9",
        "p": {
         "x": 16.22,
         "y": 1.47
        },
        "q": {
         "x": 0,
         "y": 1.47
        }
       },
       {
        "nombre": "6",
        "p": {
         "x": 16.22,
         "y": 6.44
        },
        "q": {
         "x": 0,
         "y": 6.44
        }
       },
       {
        "nombre": "2",
        "p": {
         "x": 16.22,
         "y": 16.24
        },
        "q": {
         "x": 0,
         "y": 16.24
        }
       },
       {
        "nombre": "1",
        "p": {
         "x": 16.22,
         "y": 20.1
        },
        "q": {
         "x": 0,
         "y": 20.1
        }
       },
       {
        "nombre": "5",
        "p": {
         "x": 16.22,
         "y": 10.77
        },
        "q": {
         "x": 0,
         "y": 10.77
        }
       },
       {
        "nombre": "Y",
        "p": {
         "x": 14.35,
         "y": 22.61
        },
        "q": {
         "x": 14.35,
         "y": 0.05
        }
       },
       {
        "nombre": "X",
        "p": {
         "x": 9.03,
         "y": 22.61
        },
        "q": {
         "x": 9.03,
         "y": 0.05
        }
       },
       {
        "nombre": "V´",
        "p": {
         "x": 1.54,
         "y": 22.61
        },
        "q": {
         "x": 1.54,
         "y": 0.05
        }
       },
       {
        "nombre": "W",
        "p": {
         "x": 5.74,
         "y": 22.66
        },
        "q": {
         "x": 5.74,
         "y": 0
        }
       },
       {
        "nombre": "W´",
        "p": {
         "x": 4.95,
         "y": 22.66
        },
        "q": {
         "x": 4.95,
         "y": 0
        }
       }
      ],
      "columnas": [
       {
        "eje": "9/X",
        "centro": {
         "x": 9.03,
         "y": 1.47
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "9/Y",
        "centro": {
         "x": 14.35,
         "y": 1.47
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "9/W",
        "centro": {
         "x": 5.74,
         "y": 1.47
        },
        "b": 1,
        "h": 1,
        "forma": "L"
       },
       {
        "eje": "6/W",
        "centro": {
         "x": 5.74,
         "y": 6.44
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "6/X",
        "centro": {
         "x": 9.03,
         "y": 6.44
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "6/Y",
        "centro": {
         "x": 14.35,
         "y": 6.44
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "5/W´",
        "centro": {
         "x": 4.95,
         "y": 10.77
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "5/W",
        "centro": {
         "x": 5.74,
         "y": 10.77
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "5/X",
        "centro": {
         "x": 9.03,
         "y": 10.77
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "5/Y",
        "centro": {
         "x": 14.35,
         "y": 10.77
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "5/V´",
        "centro": {
         "x": 1.54,
         "y": 10.77
        },
        "b": 0.67,
        "h": 0.67,
        "forma": "L"
       },
       {
        "eje": "2/V´",
        "centro": {
         "x": 1.54,
         "y": 16.24
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "2/W´",
        "centro": {
         "x": 4.95,
         "y": 16.24
        },
        "b": 0.67,
        "h": 0.67,
        "forma": "L"
       },
       {
        "eje": "2/W",
        "centro": {
         "x": 5.74,
         "y": 16.24
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "2/X",
        "centro": {
         "x": 9.03,
         "y": 16.24
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "2/Y",
        "centro": {
         "x": 14.35,
         "y": 16.24
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "1/Y",
        "centro": {
         "x": 14.35,
         "y": 20.1
        },
        "b": 1,
        "h": 1,
        "forma": "L"
       },
       {
        "eje": "1/X",
        "centro": {
         "x": 9.03,
         "y": 20.1
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": null,
        "centro": {
         "x": 5.5,
         "y": 16.48
        },
        "b": 0.23,
        "h": 0.18,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.79,
         "y": 19.96
        },
        "b": 0.17,
        "h": 0.24,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 6.66,
         "y": 17.67
        },
        "b": 0.15,
        "h": 0.15,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 7.76,
         "y": 18.84
        },
        "b": 0.15,
        "h": 0.15,
        "forma": "columneta"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    },
    {
     "id": "vista-06",
     "nivel": 2,
     "categorias": {
      "ejes": [
       {
        "nombre": "9",
        "p": {
         "x": 16.22,
         "y": 1.47
        },
        "q": {
         "x": 0,
         "y": 1.47
        }
       },
       {
        "nombre": "6",
        "p": {
         "x": 16.22,
         "y": 6.44
        },
        "q": {
         "x": 0,
         "y": 6.44
        }
       },
       {
        "nombre": "2",
        "p": {
         "x": 16.22,
         "y": 16.24
        },
        "q": {
         "x": 0,
         "y": 16.24
        }
       },
       {
        "nombre": "1",
        "p": {
         "x": 16.22,
         "y": 20.1
        },
        "q": {
         "x": 0,
         "y": 20.1
        }
       },
       {
        "nombre": "5",
        "p": {
         "x": 16.22,
         "y": 10.77
        },
        "q": {
         "x": 0,
         "y": 10.77
        }
       },
       {
        "nombre": "Y",
        "p": {
         "x": 14.35,
         "y": 22.61
        },
        "q": {
         "x": 14.35,
         "y": 0.05
        }
       },
       {
        "nombre": "X",
        "p": {
         "x": 9.03,
         "y": 22.61
        },
        "q": {
         "x": 9.03,
         "y": 0.05
        }
       },
       {
        "nombre": "V´",
        "p": {
         "x": 1.54,
         "y": 22.61
        },
        "q": {
         "x": 1.54,
         "y": 0.05
        }
       },
       {
        "nombre": "W",
        "p": {
         "x": 5.74,
         "y": 22.66
        },
        "q": {
         "x": 5.74,
         "y": 0
        }
       },
       {
        "nombre": "W´",
        "p": {
         "x": 4.95,
         "y": 22.66
        },
        "q": {
         "x": 4.95,
         "y": 0
        }
       }
      ],
      "columnas": [
       {
        "eje": "9/X",
        "centro": {
         "x": 9.03,
         "y": 1.47
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "9/Y",
        "centro": {
         "x": 14.35,
         "y": 1.47
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "9/W",
        "centro": {
         "x": 5.74,
         "y": 1.47
        },
        "b": 1,
        "h": 1,
        "forma": "L"
       },
       {
        "eje": "6/W",
        "centro": {
         "x": 5.74,
         "y": 6.44
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "6/X",
        "centro": {
         "x": 9.03,
         "y": 6.44
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "6/Y",
        "centro": {
         "x": 14.35,
         "y": 6.44
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "5/W´",
        "centro": {
         "x": 4.95,
         "y": 10.77
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "5/W",
        "centro": {
         "x": 5.74,
         "y": 10.77
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "5/X",
        "centro": {
         "x": 9.03,
         "y": 10.77
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "5/Y",
        "centro": {
         "x": 14.35,
         "y": 10.77
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "5/V´",
        "centro": {
         "x": 1.54,
         "y": 10.77
        },
        "b": 0.67,
        "h": 0.67,
        "forma": "L"
       },
       {
        "eje": "2/V´",
        "centro": {
         "x": 1.54,
         "y": 16.24
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "2/W´",
        "centro": {
         "x": 4.95,
         "y": 16.24
        },
        "b": 0.67,
        "h": 0.67,
        "forma": "L"
       },
       {
        "eje": "2/W",
        "centro": {
         "x": 5.74,
         "y": 16.24
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "2/X",
        "centro": {
         "x": 9.03,
         "y": 16.24
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "2/Y",
        "centro": {
         "x": 14.35,
         "y": 16.24
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "1/Y",
        "centro": {
         "x": 14.35,
         "y": 20.1
        },
        "b": 1,
        "h": 1,
        "forma": "L"
       },
       {
        "eje": "1/X",
        "centro": {
         "x": 9.03,
         "y": 20.1
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": null,
        "centro": {
         "x": 5.5,
         "y": 16.48
        },
        "b": 0.23,
        "h": 0.18,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.79,
         "y": 19.96
        },
        "b": 0.17,
        "h": 0.24,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 6.66,
         "y": 17.67
        },
        "b": 0.15,
        "h": 0.15,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 7.76,
         "y": 18.84
        },
        "b": 0.15,
        "h": 0.15,
        "forma": "columneta"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    },
    {
     "id": "vista-07",
     "nivel": 3,
     "categorias": {
      "ejes": [
       {
        "nombre": "9",
        "p": {
         "x": 16.69,
         "y": 1.47
        },
        "q": {
         "x": 0,
         "y": 1.47
        }
       },
       {
        "nombre": "6",
        "p": {
         "x": 16.69,
         "y": 6.44
        },
        "q": {
         "x": 0,
         "y": 6.44
        }
       },
       {
        "nombre": "2",
        "p": {
         "x": 16.69,
         "y": 16.24
        },
        "q": {
         "x": 0,
         "y": 16.24
        }
       },
       {
        "nombre": "1",
        "p": {
         "x": 16.69,
         "y": 20.1
        },
        "q": {
         "x": 0,
         "y": 20.1
        }
       },
       {
        "nombre": "5",
        "p": {
         "x": 16.69,
         "y": 10.77
        },
        "q": {
         "x": 0,
         "y": 10.77
        }
       },
       {
        "nombre": "V´",
        "p": {
         "x": 1.54,
         "y": 21.78
        },
        "q": {
         "x": 1.54,
         "y": 0.05
        }
       },
       {
        "nombre": "Y",
        "p": {
         "x": 14.35,
         "y": 0.05
        },
        "q": {
         "x": 14.35,
         "y": 21.78
        }
       },
       {
        "nombre": "X",
        "p": {
         "x": 9.03,
         "y": 0.05
        },
        "q": {
         "x": 9.03,
         "y": 21.78
        }
       },
       {
        "nombre": "W",
        "p": {
         "x": 5.74,
         "y": 21.83
        },
        "q": {
         "x": 5.74,
         "y": 0
        }
       },
       {
        "nombre": "W´",
        "p": {
         "x": 4.95,
         "y": 21.83
        },
        "q": {
         "x": 4.95,
         "y": 0
        }
       }
      ],
      "columnas": [
       {
        "eje": "5/W",
        "centro": {
         "x": 5.74,
         "y": 10.77
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "5/X",
        "centro": {
         "x": 9.03,
         "y": 10.77
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "2/W",
        "centro": {
         "x": 5.74,
         "y": 16.24
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "2/X",
        "centro": {
         "x": 9.03,
         "y": 16.24
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": null,
        "centro": {
         "x": 6.67,
         "y": 17.68
        },
        "b": 0.18,
        "h": 0.18,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 7.78,
         "y": 18.85
        },
        "b": 0.18,
        "h": 0.18,
        "forma": "columneta"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    },
    {
     "id": "vista-08",
     "nivel": null,
     "categorias": {
      "ejes": [
       {
        "nombre": "9",
        "p": {
         "x": 30.55,
         "y": 25.03
        },
        "q": {
         "x": 30.55,
         "y": 0
        }
       },
       {
        "nombre": "6",
        "p": {
         "x": 23.09,
         "y": 25.03
        },
        "q": {
         "x": 23.09,
         "y": 0
        }
       },
       {
        "nombre": "2",
        "p": {
         "x": 8.39,
         "y": 25.03
        },
        "q": {
         "x": 8.39,
         "y": 0
        }
       },
       {
        "nombre": "1",
        "p": {
         "x": 2.61,
         "y": 25.03
        },
        "q": {
         "x": 2.61,
         "y": 0
        }
       },
       {
        "nombre": "5",
        "p": {
         "x": 16.59,
         "y": 25.03
        },
        "q": {
         "x": 16.59,
         "y": 0
        }
       },
       {
        "nombre": "V´",
        "p": {
         "x": 0.08,
         "y": 2.31
        },
        "q": {
         "x": 32.67,
         "y": 2.31
        }
       },
       {
        "nombre": "Y",
        "p": {
         "x": 32.67,
         "y": 21.53
        },
        "q": {
         "x": 0.08,
         "y": 21.53
        }
       },
       {
        "nombre": "X",
        "p": {
         "x": 32.67,
         "y": 13.54
        },
        "q": {
         "x": 0.08,
         "y": 13.54
        }
       },
       {
        "nombre": "W",
        "p": {
         "x": 0,
         "y": 8.61
        },
        "q": {
         "x": 32.75,
         "y": 8.61
        }
       },
       {
        "nombre": "W´",
        "p": {
         "x": 0,
         "y": 7.43
        },
        "q": {
         "x": 32.75,
         "y": 7.43
        }
       }
      ],
      "columnas": [
       {
        "eje": "2/V´",
        "centro": {
         "x": 8.39,
         "y": 2.31
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "5/V´",
        "centro": {
         "x": 16.59,
         "y": 2.31
        },
        "b": 1,
        "h": 1,
        "forma": "L"
       },
       {
        "eje": "2/W´",
        "centro": {
         "x": 8.39,
         "y": 7.43
        },
        "b": 1,
        "h": 1,
        "forma": "L"
       },
       {
        "eje": "5/W´",
        "centro": {
         "x": 16.59,
         "y": 7.43
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "2/W",
        "centro": {
         "x": 8.39,
         "y": 8.61
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "5/W",
        "centro": {
         "x": 16.59,
         "y": 8.61
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "6/W",
        "centro": {
         "x": 23.09,
         "y": 8.61
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "9/W",
        "centro": {
         "x": 30.55,
         "y": 8.61
        },
        "b": 1.5,
        "h": 1.5,
        "forma": "L"
       },
       {
        "eje": "1/X",
        "centro": {
         "x": 2.61,
         "y": 13.54
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "2/X",
        "centro": {
         "x": 8.39,
         "y": 13.54
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "5/X",
        "centro": {
         "x": 16.59,
         "y": 13.54
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "6/X",
        "centro": {
         "x": 23.09,
         "y": 13.54
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "9/X",
        "centro": {
         "x": 30.55,
         "y": 13.54
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "1/Y",
        "centro": {
         "x": 2.61,
         "y": 21.53
        },
        "b": 1.5,
        "h": 1.5,
        "forma": "L"
       },
       {
        "eje": "2/Y",
        "centro": {
         "x": 8.39,
         "y": 21.53
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "5/Y",
        "centro": {
         "x": 16.59,
         "y": 21.53
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "6/Y",
        "centro": {
         "x": 23.09,
         "y": 21.53
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "9/Y",
        "centro": {
         "x": 30.55,
         "y": 21.53
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    },
    {
     "id": "vista-09",
     "nivel": 1,
     "categorias": {
      "ejes": [
       {
        "nombre": "9",
        "p": {
         "x": 16.69,
         "y": 1.47
        },
        "q": {
         "x": 0,
         "y": 1.47
        }
       },
       {
        "nombre": "6",
        "p": {
         "x": 16.69,
         "y": 6.44
        },
        "q": {
         "x": 0,
         "y": 6.44
        }
       },
       {
        "nombre": "2",
        "p": {
         "x": 16.69,
         "y": 16.24
        },
        "q": {
         "x": 0,
         "y": 16.24
        }
       },
       {
        "nombre": "1",
        "p": {
         "x": 16.69,
         "y": 20.1
        },
        "q": {
         "x": 0,
         "y": 20.1
        }
       },
       {
        "nombre": "5",
        "p": {
         "x": 16.69,
         "y": 10.77
        },
        "q": {
         "x": 0,
         "y": 10.77
        }
       },
       {
        "nombre": "V´",
        "p": {
         "x": 1.54,
         "y": 21.78
        },
        "q": {
         "x": 1.54,
         "y": 0.05
        }
       },
       {
        "nombre": "Y",
        "p": {
         "x": 14.35,
         "y": 0.05
        },
        "q": {
         "x": 14.35,
         "y": 21.78
        }
       },
       {
        "nombre": "X",
        "p": {
         "x": 9.03,
         "y": 0.05
        },
        "q": {
         "x": 9.03,
         "y": 21.78
        }
       },
       {
        "nombre": "W",
        "p": {
         "x": 5.74,
         "y": 21.83
        },
        "q": {
         "x": 5.74,
         "y": 0
        }
       },
       {
        "nombre": "W´",
        "p": {
         "x": 4.95,
         "y": 21.83
        },
        "q": {
         "x": 4.95,
         "y": 0
        }
       }
      ],
      "columnas": [
       {
        "eje": "9/X",
        "centro": {
         "x": 9.03,
         "y": 1.47
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "9/Y",
        "centro": {
         "x": 14.35,
         "y": 1.47
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "9/W",
        "centro": {
         "x": 5.74,
         "y": 1.47
        },
        "b": 1,
        "h": 1,
        "forma": "L"
       },
       {
        "eje": "6/W",
        "centro": {
         "x": 5.74,
         "y": 6.44
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "6/X",
        "centro": {
         "x": 9.03,
         "y": 6.44
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "6/Y",
        "centro": {
         "x": 14.35,
         "y": 6.44
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "5/W´",
        "centro": {
         "x": 4.95,
         "y": 10.77
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "5/W",
        "centro": {
         "x": 5.74,
         "y": 10.77
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "5/X",
        "centro": {
         "x": 9.03,
         "y": 10.77
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "5/Y",
        "centro": {
         "x": 14.35,
         "y": 10.77
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "5/V´",
        "centro": {
         "x": 1.54,
         "y": 10.77
        },
        "b": 0.67,
        "h": 0.67,
        "forma": "L"
       },
       {
        "eje": "2/V´",
        "centro": {
         "x": 1.54,
         "y": 16.24
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "2/W´",
        "centro": {
         "x": 4.95,
         "y": 16.24
        },
        "b": 0.67,
        "h": 0.67,
        "forma": "L"
       },
       {
        "eje": "2/W",
        "centro": {
         "x": 5.74,
         "y": 16.24
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "2/X",
        "centro": {
         "x": 9.03,
         "y": 16.24
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "2/Y",
        "centro": {
         "x": 14.35,
         "y": 16.24
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "1/Y",
        "centro": {
         "x": 14.35,
         "y": 20.1
        },
        "b": 1,
        "h": 1,
        "forma": "L"
       },
       {
        "eje": "1/X",
        "centro": {
         "x": 9.03,
         "y": 20.1
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    },
    {
     "id": "vista-10",
     "nivel": 2,
     "categorias": {
      "ejes": [
       {
        "nombre": "9",
        "p": {
         "x": 16.69,
         "y": 1.47
        },
        "q": {
         "x": 0,
         "y": 1.47
        }
       },
       {
        "nombre": "6",
        "p": {
         "x": 16.69,
         "y": 6.44
        },
        "q": {
         "x": 0,
         "y": 6.44
        }
       },
       {
        "nombre": "2",
        "p": {
         "x": 16.69,
         "y": 16.24
        },
        "q": {
         "x": 0,
         "y": 16.24
        }
       },
       {
        "nombre": "1",
        "p": {
         "x": 16.69,
         "y": 20.1
        },
        "q": {
         "x": 0,
         "y": 20.1
        }
       },
       {
        "nombre": "5",
        "p": {
         "x": 16.69,
         "y": 10.77
        },
        "q": {
         "x": 0,
         "y": 10.77
        }
       },
       {
        "nombre": "V´",
        "p": {
         "x": 1.54,
         "y": 21.78
        },
        "q": {
         "x": 1.54,
         "y": 0.05
        }
       },
       {
        "nombre": "Y",
        "p": {
         "x": 14.35,
         "y": 0.05
        },
        "q": {
         "x": 14.35,
         "y": 21.78
        }
       },
       {
        "nombre": "X",
        "p": {
         "x": 9.03,
         "y": 0.05
        },
        "q": {
         "x": 9.03,
         "y": 21.78
        }
       },
       {
        "nombre": "W",
        "p": {
         "x": 5.74,
         "y": 21.83
        },
        "q": {
         "x": 5.74,
         "y": 0
        }
       },
       {
        "nombre": "W´",
        "p": {
         "x": 4.95,
         "y": 21.83
        },
        "q": {
         "x": 4.95,
         "y": 0
        }
       }
      ],
      "columnas": [
       {
        "eje": "9/X",
        "centro": {
         "x": 9.03,
         "y": 1.47
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "9/Y",
        "centro": {
         "x": 14.35,
         "y": 1.47
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "9/W",
        "centro": {
         "x": 5.74,
         "y": 1.47
        },
        "b": 1,
        "h": 1,
        "forma": "L"
       },
       {
        "eje": "6/W",
        "centro": {
         "x": 5.74,
         "y": 6.44
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "6/X",
        "centro": {
         "x": 9.03,
         "y": 6.44
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "6/Y",
        "centro": {
         "x": 14.35,
         "y": 6.44
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "5/W´",
        "centro": {
         "x": 4.95,
         "y": 10.77
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "5/W",
        "centro": {
         "x": 5.74,
         "y": 10.77
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "5/X",
        "centro": {
         "x": 9.03,
         "y": 10.77
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "5/Y",
        "centro": {
         "x": 14.35,
         "y": 10.77
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "5/V´",
        "centro": {
         "x": 1.54,
         "y": 10.77
        },
        "b": 0.67,
        "h": 0.67,
        "forma": "L"
       },
       {
        "eje": "2/V´",
        "centro": {
         "x": 1.54,
         "y": 16.24
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "2/W´",
        "centro": {
         "x": 4.95,
         "y": 16.24
        },
        "b": 0.67,
        "h": 0.67,
        "forma": "L"
       },
       {
        "eje": "2/W",
        "centro": {
         "x": 5.74,
         "y": 16.24
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "2/X",
        "centro": {
         "x": 9.03,
         "y": 16.24
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "2/Y",
        "centro": {
         "x": 14.35,
         "y": 16.24
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "1/Y",
        "centro": {
         "x": 14.35,
         "y": 20.1
        },
        "b": 1,
        "h": 1,
        "forma": "L"
       },
       {
        "eje": "1/X",
        "centro": {
         "x": 9.03,
         "y": 20.1
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    },
    {
     "id": "vista-11",
     "nivel": null,
     "categorias": {
      "ejes": [
       {
        "nombre": "9",
        "p": {
         "x": 30.55,
         "y": 25.03
        },
        "q": {
         "x": 30.55,
         "y": 0
        }
       },
       {
        "nombre": "6",
        "p": {
         "x": 23.09,
         "y": 25.03
        },
        "q": {
         "x": 23.09,
         "y": 0
        }
       },
       {
        "nombre": "2",
        "p": {
         "x": 8.39,
         "y": 25.03
        },
        "q": {
         "x": 8.39,
         "y": 0
        }
       },
       {
        "nombre": "1",
        "p": {
         "x": 2.61,
         "y": 25.03
        },
        "q": {
         "x": 2.61,
         "y": 0
        }
       },
       {
        "nombre": "5",
        "p": {
         "x": 16.59,
         "y": 25.03
        },
        "q": {
         "x": 16.59,
         "y": 0
        }
       },
       {
        "nombre": "V´",
        "p": {
         "x": 0.08,
         "y": 2.31
        },
        "q": {
         "x": 32.67,
         "y": 2.31
        }
       },
       {
        "nombre": "Y",
        "p": {
         "x": 32.67,
         "y": 21.53
        },
        "q": {
         "x": 0.08,
         "y": 21.53
        }
       },
       {
        "nombre": "X",
        "p": {
         "x": 32.67,
         "y": 13.54
        },
        "q": {
         "x": 0.08,
         "y": 13.54
        }
       },
       {
        "nombre": "W",
        "p": {
         "x": 0,
         "y": 8.61
        },
        "q": {
         "x": 32.75,
         "y": 8.61
        }
       },
       {
        "nombre": "W´",
        "p": {
         "x": 0,
         "y": 7.43
        },
        "q": {
         "x": 32.75,
         "y": 7.43
        }
       }
      ],
      "columnas": [
       {
        "eje": "2/V´",
        "centro": {
         "x": 8.39,
         "y": 2.31
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "5/V´",
        "centro": {
         "x": 16.59,
         "y": 2.31
        },
        "b": 1,
        "h": 1,
        "forma": "L"
       },
       {
        "eje": "2/W´",
        "centro": {
         "x": 8.39,
         "y": 7.43
        },
        "b": 1,
        "h": 1,
        "forma": "L"
       },
       {
        "eje": "5/W´",
        "centro": {
         "x": 16.59,
         "y": 7.43
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "2/W",
        "centro": {
         "x": 8.39,
         "y": 8.61
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "5/W",
        "centro": {
         "x": 16.59,
         "y": 8.61
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "6/W",
        "centro": {
         "x": 23.09,
         "y": 8.61
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "9/W",
        "centro": {
         "x": 30.55,
         "y": 8.61
        },
        "b": 1.5,
        "h": 1.5,
        "forma": "L"
       },
       {
        "eje": "1/X",
        "centro": {
         "x": 2.61,
         "y": 13.54
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "2/X",
        "centro": {
         "x": 8.39,
         "y": 13.54
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "5/X",
        "centro": {
         "x": 16.59,
         "y": 13.54
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "6/X",
        "centro": {
         "x": 23.09,
         "y": 13.54
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "9/X",
        "centro": {
         "x": 30.55,
         "y": 13.54
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "1/Y",
        "centro": {
         "x": 2.61,
         "y": 21.53
        },
        "b": 1.5,
        "h": 1.5,
        "forma": "L"
       },
       {
        "eje": "2/Y",
        "centro": {
         "x": 8.39,
         "y": 21.53
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "5/Y",
        "centro": {
         "x": 16.59,
         "y": 21.53
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "6/Y",
        "centro": {
         "x": 23.09,
         "y": 21.53
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "9/Y",
        "centro": {
         "x": 30.55,
         "y": 21.53
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    }
   ]
  }
 },
 {
  "nombre": "ilo:modulo-03",
  "grupo": "ilo",
  "id": "modulo-03",
  "etiqueta": null,
  "rasgos": {
   "vista": "vista-01",
   "areaAbierta": false,
   "niveles": 2,
   "ejes": {
    "x": 3,
    "y": 6
   },
   "luces": {
    "x": [
     5.37,
     8.37
    ],
    "y": [
     6.65,
     5.51,
     5.16,
     5.22,
     6.72
    ]
   },
   "largo": 29.25,
   "ancho": 13.74,
   "area": 401.82,
   "luzLosa": 6.72,
   "luzMax": 8.37,
   "columnas": 18,
   "tipos": [
    {
     "nombre": "C1",
     "forma": "rectangular",
     "b": 0.43,
     "h": 0.43,
     "n": 14
    },
    {
     "nombre": "PL1",
     "forma": "L",
     "b": 1.23,
     "h": 1.23,
     "n": 4
    }
   ],
   "placas": true,
   "columnetas": 54,
   "techoLiviano": false,
   "cubierta": true,
   "falsoCielo": false,
   "deportivo": false,
   "agua": true,
   "banos": true
  },
  "decisiones": {
   "cimentacion": "zapatas",
   "cimientoCorrido": true,
   "hz": 0.6,
   "df": 1.5,
   "losa": "aligerada y maciza",
   "espesorLosa": 0.2,
   "plantasDeLosa": 2,
   "vigas": [
    "30x70",
    "30x50",
    "30x60"
   ],
   "fcColumnas": 280,
   "fcColumnetas": 175,
   "estribos": "3/8\": 1@.05, 10@.10",
   "porticos": 9,
   "mallaCimentacion": false,
   "columnasComoArquitectura": true,
   "losaDeTecho": true
  },
  "geometria": {
   "version": 1,
   "unidad": "m",
   "vistas": [
    {
     "id": "vista-01",
     "nivel": 1,
     "categorias": {
      "ejes": [
       {
        "nombre": "12",
        "p": {
         "x": 0,
         "y": 31.81
        },
        "q": {
         "x": 20.74,
         "y": 31.81
        }
       },
       {
        "nombre": "15",
        "p": {
         "x": 0,
         "y": 25.09
        },
        "q": {
         "x": 20.74,
         "y": 25.09
        }
       },
       {
        "nombre": "20",
        "p": {
         "x": 0,
         "y": 14.72
        },
        "q": {
         "x": 20.74,
         "y": 14.72
        }
       },
       {
        "nombre": "23",
        "p": {
         "x": 0,
         "y": 9.21
        },
        "q": {
         "x": 20.74,
         "y": 9.21
        }
       },
       {
        "nombre": "25",
        "p": {
         "x": 0,
         "y": 2.56
        },
        "q": {
         "x": 20.74,
         "y": 2.56
        }
       },
       {
        "nombre": "16",
        "p": {
         "x": 0,
         "y": 19.88
        },
        "q": {
         "x": 20.74,
         "y": 19.88
        }
       },
       {
        "nombre": "R",
        "p": {
         "x": 4.86,
         "y": 34.43
        },
        "q": {
         "x": 4.86,
         "y": 0
        }
       },
       {
        "nombre": "T",
        "p": {
         "x": 10.22,
         "y": 34.43
        },
        "q": {
         "x": 10.22,
         "y": 0
        }
       },
       {
        "nombre": "V",
        "p": {
         "x": 18.6,
         "y": 34.43
        },
        "q": {
         "x": 18.6,
         "y": 0
        }
       }
      ],
      "columnas": [
       {
        "eje": "25/T",
        "centro": {
         "x": 10.22,
         "y": 2.56
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "rectangular"
       },
       {
        "eje": "25/R",
        "centro": {
         "x": 4.86,
         "y": 2.56
        },
        "b": 1.23,
        "h": 1.23,
        "forma": "L"
       },
       {
        "eje": "25/V",
        "centro": {
         "x": 18.6,
         "y": 2.56
        },
        "b": 1.23,
        "h": 1.23,
        "forma": "L"
       },
       {
        "eje": "23/R",
        "centro": {
         "x": 4.86,
         "y": 9.21
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "rectangular"
       },
       {
        "eje": "23/T",
        "centro": {
         "x": 10.22,
         "y": 9.21
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "rectangular"
       },
       {
        "eje": "23/V",
        "centro": {
         "x": 18.6,
         "y": 9.21
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "rectangular"
       },
       {
        "eje": "20/R",
        "centro": {
         "x": 4.86,
         "y": 14.72
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "rectangular"
       },
       {
        "eje": "20/T",
        "centro": {
         "x": 10.22,
         "y": 14.72
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "rectangular"
       },
       {
        "eje": "20/V",
        "centro": {
         "x": 18.6,
         "y": 14.72
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "rectangular"
       },
       {
        "eje": "16/R",
        "centro": {
         "x": 4.86,
         "y": 19.88
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "rectangular"
       },
       {
        "eje": "16/T",
        "centro": {
         "x": 10.22,
         "y": 19.88
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "rectangular"
       },
       {
        "eje": "16/V",
        "centro": {
         "x": 18.6,
         "y": 19.88
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "rectangular"
       },
       {
        "eje": "15/R",
        "centro": {
         "x": 4.86,
         "y": 25.09
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "rectangular"
       },
       {
        "eje": "15/T",
        "centro": {
         "x": 10.22,
         "y": 25.09
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "rectangular"
       },
       {
        "eje": "15/V",
        "centro": {
         "x": 18.6,
         "y": 25.09
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "rectangular"
       },
       {
        "eje": "12/R",
        "centro": {
         "x": 4.86,
         "y": 31.81
        },
        "b": 1.23,
        "h": 1.23,
        "forma": "L"
       },
       {
        "eje": "12/V",
        "centro": {
         "x": 18.6,
         "y": 31.81
        },
        "b": 1.23,
        "h": 1.23,
        "forma": "L"
       },
       {
        "eje": "12/T",
        "centro": {
         "x": 10.22,
         "y": 31.81
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "rectangular"
       },
       {
        "eje": null,
        "centro": {
         "x": 4.94,
         "y": 30.45
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 4.94,
         "y": 25.44
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 5.42,
         "y": 19.79
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 5,
         "y": 18.22
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 7.44,
         "y": 18.28
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 7.44,
         "y": 19.79
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 6.06,
         "y": 22.4
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 7.44,
         "y": 22.4
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 10.24,
         "y": 22.4
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 10.3,
         "y": 24.74
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 10.57,
         "y": 25.18
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 18.52,
         "y": 25.44
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 18.52,
         "y": 30.45
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 18.52,
         "y": 20.23
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 18.52,
         "y": 19.55
        },
        "b": 0.13,
        "h": 0.21,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 18.52,
         "y": 15.07
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 18.52,
         "y": 9.56
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 18.52,
         "y": 3.92
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 17.23,
         "y": 2.64
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 10.6,
         "y": 2.64
        },
        "b": 0.3,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 10.31,
         "y": 3.12
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 10.31,
         "y": 8.86
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 10.31,
         "y": 9.56
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 10.31,
         "y": 14.37
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 10.31,
         "y": 5.56
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 4.94,
         "y": 20.23
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 5,
         "y": 5.57
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 4.94,
         "y": 7.5
        },
        "b": 0.13,
        "h": 0.27,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 4.94,
         "y": 8.86
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 18.52,
         "y": 8.86
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 14.63,
         "y": 25.18
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 4.94,
         "y": 3.92
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 9.87,
         "y": 14.63
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 6.43,
         "y": 9.29
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 10.31,
         "y": 11.96
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 9.88,
         "y": 9.29
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 5.42,
         "y": 14.63
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 12.72,
         "y": 2.64
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.97,
         "y": 2.64
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 10.3,
         "y": 20.23
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 10.3,
         "y": 19.53
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 10.3,
         "y": 18.28
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 15.92,
         "y": 25.18
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 18.46,
         "y": 22.4
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 18.03,
         "y": 25.18
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 14.69,
         "y": 22.46
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 15.92,
         "y": 23.79
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 18.46,
         "y": 23.79
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 15.86,
         "y": 22.46
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    },
    {
     "id": "vista-02",
     "nivel": null,
     "categorias": {
      "ejes": [
       {
        "nombre": "12",
        "p": {
         "x": 0,
         "y": 31.8
        },
        "q": {
         "x": 18.19,
         "y": 31.81
        }
       },
       {
        "nombre": "20",
        "p": {
         "x": 0,
         "y": 14.72
        },
        "q": {
         "x": 18.19,
         "y": 14.72
        }
       },
       {
        "nombre": "23",
        "p": {
         "x": 0,
         "y": 9.21
        },
        "q": {
         "x": 18.19,
         "y": 9.21
        }
       },
       {
        "nombre": "25",
        "p": {
         "x": 0,
         "y": 2.57
        },
        "q": {
         "x": 18.19,
         "y": 2.56
        }
       },
       {
        "nombre": "16",
        "p": {
         "x": 0,
         "y": 19.88
        },
        "q": {
         "x": 18.19,
         "y": 19.88
        }
       },
       {
        "nombre": "15",
        "p": {
         "x": 0,
         "y": 25.09
        },
        "q": {
         "x": 18.19,
         "y": 25.09
        }
       },
       {
        "nombre": "V",
        "p": {
         "x": 16.04,
         "y": 34.13
        },
        "q": {
         "x": 16.04,
         "y": 0.24
        }
       },
       {
        "nombre": "T",
        "p": {
         "x": 7.68,
         "y": 34.13
        },
        "q": {
         "x": 7.68,
         "y": 0.24
        }
       },
       {
        "nombre": "R",
        "p": {
         "x": 2.33,
         "y": 34.13
        },
        "q": {
         "x": 2.33,
         "y": 0.24
        }
       },
       {
        "nombre": "R",
        "p": {
         "x": 2.32,
         "y": 34.43
        },
        "q": {
         "x": 2.32,
         "y": 0
        }
       },
       {
        "nombre": "T",
        "p": {
         "x": 7.68,
         "y": 34.43
        },
        "q": {
         "x": 7.68,
         "y": 0
        }
       },
       {
        "nombre": "V",
        "p": {
         "x": 16.05,
         "y": 34.43
        },
        "q": {
         "x": 16.05,
         "y": 0
        }
       }
      ],
      "columnas": [
       {
        "eje": "25/T",
        "centro": {
         "x": 7.68,
         "y": 2.57
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "25/R",
        "centro": {
         "x": 2.32,
         "y": 2.57
        },
        "b": 1.2,
        "h": 1.2,
        "forma": "L"
       },
       {
        "eje": "25/V",
        "centro": {
         "x": 16.05,
         "y": 2.56
        },
        "b": 1.2,
        "h": 1.2,
        "forma": "L"
       },
       {
        "eje": "23/R",
        "centro": {
         "x": 2.28,
         "y": 9.21
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "23/T",
        "centro": {
         "x": 7.68,
         "y": 9.21
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "23/V",
        "centro": {
         "x": 16.09,
         "y": 9.21
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "20/R",
        "centro": {
         "x": 2.25,
         "y": 14.72
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "20/T",
        "centro": {
         "x": 7.68,
         "y": 14.72
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "20/V",
        "centro": {
         "x": 16.13,
         "y": 14.72
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "16/R",
        "centro": {
         "x": 2.24,
         "y": 19.88
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "16/T",
        "centro": {
         "x": 7.68,
         "y": 19.88
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "16/V",
        "centro": {
         "x": 16.13,
         "y": 19.88
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "15/R",
        "centro": {
         "x": 2.27,
         "y": 25.09
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "15/T",
        "centro": {
         "x": 7.68,
         "y": 25.09
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "15/V",
        "centro": {
         "x": 16.1,
         "y": 25.09
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "12/R",
        "centro": {
         "x": 2.32,
         "y": 31.8
        },
        "b": 1.2,
        "h": 1.2,
        "forma": "L"
       },
       {
        "eje": "12/V",
        "centro": {
         "x": 16.05,
         "y": 31.81
        },
        "b": 1.2,
        "h": 1.2,
        "forma": "L"
       },
       {
        "eje": "12/T",
        "centro": {
         "x": 7.68,
         "y": 31.8
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": null,
        "centro": {
         "x": 2.4,
         "y": 30.45
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 2.4,
         "y": 25.44
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 2.4,
         "y": 27.95
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 7.76,
         "y": 24.74
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 3.52,
         "y": 22.4
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 4.9,
         "y": 22.4
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 7.7,
         "y": 22.4
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 2.88,
         "y": 19.79
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 4.9,
         "y": 19.79
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 4.9,
         "y": 18.28
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 2.46,
         "y": 18.22
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 7.76,
         "y": 20.23
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 7.76,
         "y": 19.53
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 7.76,
         "y": 18.28
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 7.33,
         "y": 14.63
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 2.88,
         "y": 14.63
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 5.11,
         "y": 14.63
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 7.77,
         "y": 14.37
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 7.77,
         "y": 11.96
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 7.77,
         "y": 9.56
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 2.4,
         "y": 8.86
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 2.4,
         "y": 7.5
        },
        "b": 0.13,
        "h": 0.27,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 7.77,
         "y": 8.86
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 7.77,
         "y": 5.56
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 5.24,
         "y": 5.57
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 2.46,
         "y": 5.57
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 2.4,
         "y": 3.92
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 3.68,
         "y": 2.64
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 6.43,
         "y": 2.64
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 7.77,
         "y": 3.12
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.06,
         "y": 2.64
        },
        "b": 0.3,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 14.69,
         "y": 2.64
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 10.17,
         "y": 2.64
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 15.97,
         "y": 3.92
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 15.97,
         "y": 6.39
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 15.97,
         "y": 9.56
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 15.97,
         "y": 15.07
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 15.97,
         "y": 19.55
        },
        "b": 0.13,
        "h": 0.21,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 15.97,
         "y": 20.23
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 15.97,
         "y": 25.44
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 15.97,
         "y": 30.45
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 15.97,
         "y": 11.96
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 15.97,
         "y": 17.3
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 15.91,
         "y": 22.4
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 15.97,
         "y": 27.9
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.03,
         "y": 25.18
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 15.49,
         "y": 25.18
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 15.97,
         "y": 24.74
        },
        "b": 0.13,
        "h": 0.26,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 2.4,
         "y": 20.23
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 12.15,
         "y": 22.46
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 12.09,
         "y": 25.18
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 15.91,
         "y": 23.79
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.37,
         "y": 23.79
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 12.43,
         "y": 2.64
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 15.97,
         "y": 14.37
        },
        "b": 0.13,
        "h": 0.24,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 7.33,
         "y": 9.29
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 3.89,
         "y": 9.29
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 2.4,
         "y": 23.74
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 15.97,
         "y": 8.86
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.37,
         "y": 25.18
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    },
    {
     "id": "vista-03",
     "nivel": null,
     "categorias": {
      "ejes": [
       {
        "nombre": "12",
        "p": {
         "x": 2.52,
         "y": 32.29
        },
        "q": {
         "x": 20.69,
         "y": 32.3
        }
       },
       {
        "nombre": "20",
        "p": {
         "x": 2.52,
         "y": 15.21
        },
        "q": {
         "x": 20.69,
         "y": 15.21
        }
       },
       {
        "nombre": "23",
        "p": {
         "x": 2.52,
         "y": 9.7
        },
        "q": {
         "x": 20.69,
         "y": 9.7
        }
       },
       {
        "nombre": "25",
        "p": {
         "x": 2.52,
         "y": 3.07
        },
        "q": {
         "x": 20.69,
         "y": 3.05
        }
       },
       {
        "nombre": "16",
        "p": {
         "x": 2.52,
         "y": 20.37
        },
        "q": {
         "x": 20.69,
         "y": 20.37
        }
       },
       {
        "nombre": "15",
        "p": {
         "x": 2.52,
         "y": 25.58
        },
        "q": {
         "x": 20.69,
         "y": 25.58
        }
       },
       {
        "nombre": "12",
        "p": {
         "x": 20.89,
         "y": 32.29
        },
        "q": {
         "x": 0,
         "y": 32.3
        }
       },
       {
        "nombre": "20",
        "p": {
         "x": 20.89,
         "y": 15.21
        },
        "q": {
         "x": 0,
         "y": 15.21
        }
       },
       {
        "nombre": "23",
        "p": {
         "x": 20.89,
         "y": 9.7
        },
        "q": {
         "x": 0,
         "y": 9.7
        }
       },
       {
        "nombre": "25",
        "p": {
         "x": 20.89,
         "y": 3.07
        },
        "q": {
         "x": 0,
         "y": 3.05
        }
       },
       {
        "nombre": "16",
        "p": {
         "x": 20.89,
         "y": 20.37
        },
        "q": {
         "x": 0,
         "y": 20.37
        }
       },
       {
        "nombre": "15",
        "p": {
         "x": 20.89,
         "y": 25.58
        },
        "q": {
         "x": 0,
         "y": 25.58
        }
       },
       {
        "nombre": "V",
        "p": {
         "x": 18.56,
         "y": 34.62
        },
        "q": {
         "x": 18.56,
         "y": 0.74
        }
       },
       {
        "nombre": "T",
        "p": {
         "x": 10.2,
         "y": 34.62
        },
        "q": {
         "x": 10.2,
         "y": 0.74
        }
       },
       {
        "nombre": "R",
        "p": {
         "x": 4.85,
         "y": 34.62
        },
        "q": {
         "x": 4.85,
         "y": 0.74
        }
       },
       {
        "nombre": "R",
        "p": {
         "x": 4.83,
         "y": 34.97
        },
        "q": {
         "x": 4.83,
         "y": 0
        }
       },
       {
        "nombre": "T",
        "p": {
         "x": 10.2,
         "y": 34.97
        },
        "q": {
         "x": 10.2,
         "y": 0
        }
       },
       {
        "nombre": "V",
        "p": {
         "x": 18.57,
         "y": 34.97
        },
        "q": {
         "x": 18.57,
         "y": 0
        }
       }
      ],
      "columnas": [
       {
        "eje": "25/T",
        "centro": {
         "x": 10.2,
         "y": 3.07
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "25/R",
        "centro": {
         "x": 4.85,
         "y": 3.07
        },
        "b": 1.2,
        "h": 1.2,
        "forma": "L"
       },
       {
        "eje": "25/V",
        "centro": {
         "x": 18.56,
         "y": 3.05
        },
        "b": 1.2,
        "h": 1.2,
        "forma": "L"
       },
       {
        "eje": "23/R",
        "centro": {
         "x": 4.85,
         "y": 9.7
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "23/T",
        "centro": {
         "x": 10.2,
         "y": 9.7
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "23/V",
        "centro": {
         "x": 18.56,
         "y": 9.7
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "20/R",
        "centro": {
         "x": 4.85,
         "y": 15.21
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "20/T",
        "centro": {
         "x": 10.2,
         "y": 15.21
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "20/V",
        "centro": {
         "x": 18.56,
         "y": 15.21
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "16/R",
        "centro": {
         "x": 4.76,
         "y": 20.37
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "16/T",
        "centro": {
         "x": 10.2,
         "y": 20.37
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "16/V",
        "centro": {
         "x": 18.65,
         "y": 20.37
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "15/R",
        "centro": {
         "x": 4.79,
         "y": 25.58
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "15/T",
        "centro": {
         "x": 10.2,
         "y": 25.58
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "15/V",
        "centro": {
         "x": 18.61,
         "y": 25.58
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "12/R",
        "centro": {
         "x": 4.83,
         "y": 32.29
        },
        "b": 1.2,
        "h": 1.2,
        "forma": "L"
       },
       {
        "eje": "12/V",
        "centro": {
         "x": 18.57,
         "y": 32.3
        },
        "b": 1.2,
        "h": 1.2,
        "forma": "L"
       },
       {
        "eje": "12/T",
        "centro": {
         "x": 10.2,
         "y": 32.29
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": null,
        "centro": {
         "x": 4.91,
         "y": 30.94
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 4.91,
         "y": 25.93
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 4.91,
         "y": 28.45
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 18.49,
         "y": 30.94
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 18.49,
         "y": 25.93
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 18.49,
         "y": 28.39
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 10.55,
         "y": 25.67
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 18.01,
         "y": 25.67
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 14.28,
         "y": 25.67
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 5.4,
         "y": 25.67
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 9.85,
         "y": 25.67
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 7.62,
         "y": 25.67
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 10.28,
         "y": 20.72
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 10.28,
         "y": 25.23
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 10.28,
         "y": 22.98
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 10.28,
         "y": 20.02
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 10.28,
         "y": 17.79
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 10.28,
         "y": 15.56
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 4.91,
         "y": 20.02
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 4.91,
         "y": 17.36
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 5.4,
         "y": 15.12
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 9.85,
         "y": 15.12
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 7.62,
         "y": 15.12
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 10.28,
         "y": 14.86
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 10.28,
         "y": 10.05
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 10.28,
         "y": 12.46
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 6.4,
         "y": 9.79
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 4.91,
         "y": 9.35
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 4.91,
         "y": 8
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 4.91,
         "y": 4.42
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 10.28,
         "y": 3.62
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 10.28,
         "y": 9.35
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 10.28,
         "y": 6.48
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 6.22,
         "y": 3.13
        },
        "b": 0.3,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 9.85,
         "y": 3.13
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 10.57,
         "y": 3.13
        },
        "b": 0.3,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 17.21,
         "y": 3.13
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.88,
         "y": 3.13
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 18.49,
         "y": 4.42
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 18.49,
         "y": 6.88
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 18.49,
         "y": 10.05
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 18.49,
         "y": 15.56
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 18.49,
         "y": 20.04
        },
        "b": 0.13,
        "h": 0.21,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 18.49,
         "y": 20.72
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 18.49,
         "y": 25.23
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 18.49,
         "y": 12.46
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 18.49,
         "y": 17.79
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 18.49,
         "y": 22.98
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 4.91,
         "y": 20.72
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 4.91,
         "y": 25.23
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 4.91,
         "y": 22.98
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.02,
         "y": 3.13
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 4.91,
         "y": 6.21
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 9.85,
         "y": 9.79
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    },
    {
     "id": "vista-04",
     "nivel": null,
     "categorias": {
      "ejes": [
       {
        "nombre": "12",
        "p": {
         "x": 0.41,
         "y": 32.3
        },
        "q": {
         "x": 21.23,
         "y": 32.3
        }
       },
       {
        "nombre": "16",
        "p": {
         "x": 0.41,
         "y": 20.37
        },
        "q": {
         "x": 21.23,
         "y": 20.37
        }
       },
       {
        "nombre": "20",
        "p": {
         "x": 0.41,
         "y": 15.21
        },
        "q": {
         "x": 21.23,
         "y": 15.21
        }
       },
       {
        "nombre": "23",
        "p": {
         "x": 0.41,
         "y": 9.7
        },
        "q": {
         "x": 21.23,
         "y": 9.7
        }
       },
       {
        "nombre": "25",
        "p": {
         "x": 0.41,
         "y": 3.05
        },
        "q": {
         "x": 21.23,
         "y": 3.05
        }
       },
       {
        "nombre": "15",
        "p": {
         "x": 0.41,
         "y": 25.58
        },
        "q": {
         "x": 21.23,
         "y": 25.58
        }
       },
       {
        "nombre": "12",
        "p": {
         "x": 0,
         "y": 32.29
        },
        "q": {
         "x": 21.36,
         "y": 32.29
        }
       },
       {
        "nombre": "20",
        "p": {
         "x": 0,
         "y": 15.21
        },
        "q": {
         "x": 21.36,
         "y": 15.21
        }
       },
       {
        "nombre": "23",
        "p": {
         "x": 0,
         "y": 9.7
        },
        "q": {
         "x": 21.36,
         "y": 9.7
        }
       },
       {
        "nombre": "25",
        "p": {
         "x": 0,
         "y": 3.07
        },
        "q": {
         "x": 21.36,
         "y": 3.07
        }
       },
       {
        "nombre": "16",
        "p": {
         "x": 0,
         "y": 20.37
        },
        "q": {
         "x": 21.36,
         "y": 20.37
        }
       },
       {
        "nombre": "15",
        "p": {
         "x": 0,
         "y": 25.58
        },
        "q": {
         "x": 21.36,
         "y": 25.58
        }
       },
       {
        "nombre": "V",
        "p": {
         "x": 19.03,
         "y": 34.62
        },
        "q": {
         "x": 19.03,
         "y": 0.74
        }
       },
       {
        "nombre": "T",
        "p": {
         "x": 10.67,
         "y": 34.62
        },
        "q": {
         "x": 10.67,
         "y": 0.74
        }
       },
       {
        "nombre": "R",
        "p": {
         "x": 5.32,
         "y": 34.62
        },
        "q": {
         "x": 5.32,
         "y": 0.74
        }
       },
       {
        "nombre": "R",
        "p": {
         "x": 5.31,
         "y": 34.97
        },
        "q": {
         "x": 5.31,
         "y": 0
        }
       },
       {
        "nombre": "T",
        "p": {
         "x": 10.67,
         "y": 34.97
        },
        "q": {
         "x": 10.67,
         "y": 0
        }
       },
       {
        "nombre": "V",
        "p": {
         "x": 19.05,
         "y": 34.97
        },
        "q": {
         "x": 19.05,
         "y": 0
        }
       }
      ],
      "columnas": [
       {
        "eje": "25/R",
        "centro": {
         "x": 5.32,
         "y": 3.05
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "rectangular"
       },
       {
        "eje": "25/V",
        "centro": {
         "x": 19.03,
         "y": 3.05
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "rectangular"
       },
       {
        "eje": "23/R",
        "centro": {
         "x": 5.32,
         "y": 9.7
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "23/T",
        "centro": {
         "x": 10.67,
         "y": 9.7
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "20/R",
        "centro": {
         "x": 5.32,
         "y": 15.21
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "20/T",
        "centro": {
         "x": 10.67,
         "y": 15.21
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "16/R",
        "centro": {
         "x": 5.23,
         "y": 20.37
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "rectangular"
       },
       {
        "eje": "16/V",
        "centro": {
         "x": 19.12,
         "y": 20.37
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "rectangular"
       },
       {
        "eje": "12/R",
        "centro": {
         "x": 5.31,
         "y": 32.3
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "rectangular"
       },
       {
        "eje": "12/V",
        "centro": {
         "x": 19.05,
         "y": 32.3
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "rectangular"
       },
       {
        "eje": null,
        "centro": {
         "x": 5.39,
         "y": 29.16
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 5.39,
         "y": 26.16
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 5.39,
         "y": 23.16
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 2.48,
         "y": 20.45
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 18.97,
         "y": 29.16
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 18.97,
         "y": 26.16
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 18.97,
         "y": 23.16
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 18.97,
         "y": 17.16
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 18.97,
         "y": 14.16
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 18.97,
         "y": 11.16
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 18.97,
         "y": 8.16
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 18.97,
         "y": 5.16
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 5.33,
         "y": 7.95
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 2.48,
         "y": 7.95
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 15.91,
         "y": 3.14
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 5.39,
         "y": 5.54
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.33,
         "y": 32.22
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 11.33,
         "y": 32.22
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 14.33,
         "y": 32.22
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.68,
         "y": 32.22
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 12.91,
         "y": 3.14
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 9.91,
         "y": 3.14
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 7.68,
         "y": 3.14
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 10.76,
         "y": 10.05
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 10.32,
         "y": 9.79
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 5.87,
         "y": 9.79
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.1,
         "y": 9.79
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 10.7,
         "y": 13.32
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 7.04,
         "y": 13.32
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 6.98,
         "y": 10.99
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.87,
         "y": 13.32
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    },
    {
     "id": "vista-05",
     "nivel": null,
     "categorias": {
      "ejes": [
       {
        "nombre": "12",
        "p": {
         "x": 2.67,
         "y": 0
        },
        "q": {
         "x": 2.67,
         "y": 20.82
        }
       },
       {
        "nombre": "16",
        "p": {
         "x": 14.6,
         "y": 0
        },
        "q": {
         "x": 14.6,
         "y": 20.82
        }
       },
       {
        "nombre": "20",
        "p": {
         "x": 19.76,
         "y": 0
        },
        "q": {
         "x": 19.76,
         "y": 20.82
        }
       },
       {
        "nombre": "23",
        "p": {
         "x": 25.27,
         "y": 0
        },
        "q": {
         "x": 25.27,
         "y": 20.82
        }
       },
       {
        "nombre": "25",
        "p": {
         "x": 31.92,
         "y": 0
        },
        "q": {
         "x": 31.92,
         "y": 20.82
        }
       },
       {
        "nombre": "15",
        "p": {
         "x": 9.39,
         "y": 0
        },
        "q": {
         "x": 9.39,
         "y": 20.82
        }
       },
       {
        "nombre": "R",
        "p": {
         "x": 0,
         "y": 4.9
        },
        "q": {
         "x": 34.97,
         "y": 4.9
        }
       },
       {
        "nombre": "T",
        "p": {
         "x": 0,
         "y": 10.27
        },
        "q": {
         "x": 34.97,
         "y": 10.27
        }
       },
       {
        "nombre": "V",
        "p": {
         "x": 0,
         "y": 18.64
        },
        "q": {
         "x": 34.97,
         "y": 18.64
        }
       }
      ],
      "columnas": [
       {
        "eje": "20/R",
        "centro": {
         "x": 19.76,
         "y": 4.9
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "rectangular"
       },
       {
        "eje": "23/R",
        "centro": {
         "x": 25.27,
         "y": 4.9
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "rectangular"
       },
       {
        "eje": "20/T",
        "centro": {
         "x": 19.76,
         "y": 10.27
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "rectangular"
       },
       {
        "eje": "23/T",
        "centro": {
         "x": 25.27,
         "y": 10.27
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "rectangular"
       },
       {
        "eje": null,
        "centro": {
         "x": 24.92,
         "y": 10.35
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 25.18,
         "y": 5.47
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 25.18,
         "y": 9.92
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 21.65,
         "y": 10.29
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    },
    {
     "id": "vista-06",
     "nivel": null,
     "categorias": {
      "ejes": [
       {
        "nombre": "12",
        "p": {
         "x": 0,
         "y": 21.33
        },
        "q": {
         "x": 12.88,
         "y": 21.33
        }
       },
       {
        "nombre": "20",
        "p": {
         "x": 0,
         "y": 9.95
        },
        "q": {
         "x": 12.88,
         "y": 9.95
        }
       },
       {
        "nombre": "23",
        "p": {
         "x": 0,
         "y": 6.28
        },
        "q": {
         "x": 12.88,
         "y": 6.28
        }
       },
       {
        "nombre": "25",
        "p": {
         "x": 0,
         "y": 1.85
        },
        "q": {
         "x": 12.88,
         "y": 1.85
        }
       },
       {
        "nombre": "16",
        "p": {
         "x": 0,
         "y": 13.39
        },
        "q": {
         "x": 12.88,
         "y": 13.39
        }
       },
       {
        "nombre": "15",
        "p": {
         "x": 0,
         "y": 16.87
        },
        "q": {
         "x": 12.88,
         "y": 16.87
        }
       },
       {
        "nombre": "V",
        "p": {
         "x": 10.99,
         "y": 0
        },
        "q": {
         "x": 10.99,
         "y": 23.15
        }
       },
       {
        "nombre": "T",
        "p": {
         "x": 5.42,
         "y": 0
        },
        "q": {
         "x": 5.42,
         "y": 23.15
        }
       },
       {
        "nombre": "R",
        "p": {
         "x": 1.85,
         "y": 0
        },
        "q": {
         "x": 1.85,
         "y": 23.15
        }
       }
      ],
      "columnas": [
       {
        "eje": "25/R",
        "centro": {
         "x": 1.85,
         "y": 1.85
        },
        "b": 0.8,
        "h": 0.8,
        "forma": "L"
       },
       {
        "eje": "25/T",
        "centro": {
         "x": 5.42,
         "y": 1.85
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "25/V",
        "centro": {
         "x": 10.99,
         "y": 1.85
        },
        "b": 0.8,
        "h": 0.8,
        "forma": "L"
       },
       {
        "eje": "23/R",
        "centro": {
         "x": 1.85,
         "y": 6.28
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "23/T",
        "centro": {
         "x": 5.42,
         "y": 6.28
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "23/V",
        "centro": {
         "x": 10.99,
         "y": 6.28
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "20/R",
        "centro": {
         "x": 1.85,
         "y": 9.95
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "20/T",
        "centro": {
         "x": 5.42,
         "y": 9.95
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "20/V",
        "centro": {
         "x": 10.99,
         "y": 9.95
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "16/R",
        "centro": {
         "x": 1.85,
         "y": 13.39
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "16/T",
        "centro": {
         "x": 5.42,
         "y": 13.39
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "16/V",
        "centro": {
         "x": 10.99,
         "y": 13.39
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "15/R",
        "centro": {
         "x": 1.85,
         "y": 16.87
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "15/T",
        "centro": {
         "x": 5.42,
         "y": 16.87
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "15/V",
        "centro": {
         "x": 10.99,
         "y": 16.87
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "12/R",
        "centro": {
         "x": 1.85,
         "y": 21.33
        },
        "b": 0.8,
        "h": 0.8,
        "forma": "L"
       },
       {
        "eje": "12/T",
        "centro": {
         "x": 5.42,
         "y": 21.33
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "12/V",
        "centro": {
         "x": 10.99,
         "y": 21.33
        },
        "b": 0.8,
        "h": 0.8,
        "forma": "L"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    },
    {
     "id": "vista-07",
     "nivel": null,
     "categorias": {
      "ejes": [
       {
        "nombre": "12",
        "p": {
         "x": 0,
         "y": 21.03
        },
        "q": {
         "x": 12.25,
         "y": 21.03
        }
       },
       {
        "nombre": "20",
        "p": {
         "x": 0,
         "y": 9.65
        },
        "q": {
         "x": 12.25,
         "y": 9.65
        }
       },
       {
        "nombre": "23",
        "p": {
         "x": 0,
         "y": 5.98
        },
        "q": {
         "x": 12.25,
         "y": 5.98
        }
       },
       {
        "nombre": "25",
        "p": {
         "x": 0,
         "y": 1.55
        },
        "q": {
         "x": 12.25,
         "y": 1.55
        }
       },
       {
        "nombre": "16",
        "p": {
         "x": 0,
         "y": 13.09
        },
        "q": {
         "x": 12.25,
         "y": 13.09
        }
       },
       {
        "nombre": "15",
        "p": {
         "x": 0,
         "y": 16.57
        },
        "q": {
         "x": 12.25,
         "y": 16.57
        }
       },
       {
        "nombre": "V",
        "p": {
         "x": 10.69,
         "y": 22.59
        },
        "q": {
         "x": 10.69,
         "y": 0
        }
       },
       {
        "nombre": "T",
        "p": {
         "x": 5.12,
         "y": 22.59
        },
        "q": {
         "x": 5.12,
         "y": 0
        }
       },
       {
        "nombre": "R",
        "p": {
         "x": 1.55,
         "y": 22.59
        },
        "q": {
         "x": 1.55,
         "y": 0
        }
       }
      ],
      "columnas": [
       {
        "eje": "25/R",
        "centro": {
         "x": 1.55,
         "y": 1.55
        },
        "b": 0.8,
        "h": 0.8,
        "forma": "L"
       },
       {
        "eje": "25/T",
        "centro": {
         "x": 5.12,
         "y": 1.55
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "25/V",
        "centro": {
         "x": 10.69,
         "y": 1.55
        },
        "b": 0.8,
        "h": 0.8,
        "forma": "L"
       },
       {
        "eje": "23/R",
        "centro": {
         "x": 1.55,
         "y": 5.98
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "23/T",
        "centro": {
         "x": 5.12,
         "y": 5.98
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "23/V",
        "centro": {
         "x": 10.69,
         "y": 5.98
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "20/R",
        "centro": {
         "x": 1.55,
         "y": 9.65
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "20/T",
        "centro": {
         "x": 5.12,
         "y": 9.65
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "20/V",
        "centro": {
         "x": 10.69,
         "y": 9.65
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "16/R",
        "centro": {
         "x": 1.55,
         "y": 13.09
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "16/T",
        "centro": {
         "x": 5.12,
         "y": 13.09
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "16/V",
        "centro": {
         "x": 10.69,
         "y": 13.09
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "15/R",
        "centro": {
         "x": 1.55,
         "y": 16.57
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "15/T",
        "centro": {
         "x": 5.12,
         "y": 16.57
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "15/V",
        "centro": {
         "x": 10.69,
         "y": 16.57
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "12/R",
        "centro": {
         "x": 1.55,
         "y": 21.03
        },
        "b": 0.8,
        "h": 0.8,
        "forma": "L"
       },
       {
        "eje": "12/T",
        "centro": {
         "x": 5.12,
         "y": 21.03
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "12/V",
        "centro": {
         "x": 10.69,
         "y": 21.03
        },
        "b": 0.8,
        "h": 0.8,
        "forma": "L"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    },
    {
     "id": "vista-08",
     "nivel": 2,
     "categorias": {
      "ejes": [
       {
        "nombre": "12",
        "p": {
         "x": 0,
         "y": 21.03
        },
        "q": {
         "x": 12.25,
         "y": 21.03
        }
       },
       {
        "nombre": "20",
        "p": {
         "x": 0,
         "y": 9.65
        },
        "q": {
         "x": 12.25,
         "y": 9.65
        }
       },
       {
        "nombre": "23",
        "p": {
         "x": 0,
         "y": 5.98
        },
        "q": {
         "x": 12.25,
         "y": 5.98
        }
       },
       {
        "nombre": "25",
        "p": {
         "x": 0,
         "y": 1.55
        },
        "q": {
         "x": 12.25,
         "y": 1.55
        }
       },
       {
        "nombre": "16",
        "p": {
         "x": 0,
         "y": 13.09
        },
        "q": {
         "x": 12.25,
         "y": 13.09
        }
       },
       {
        "nombre": "15",
        "p": {
         "x": 0,
         "y": 16.57
        },
        "q": {
         "x": 12.25,
         "y": 16.57
        }
       },
       {
        "nombre": "V",
        "p": {
         "x": 10.69,
         "y": 22.59
        },
        "q": {
         "x": 10.69,
         "y": 0
        }
       },
       {
        "nombre": "T",
        "p": {
         "x": 5.12,
         "y": 22.59
        },
        "q": {
         "x": 5.12,
         "y": 0
        }
       },
       {
        "nombre": "R",
        "p": {
         "x": 1.55,
         "y": 22.59
        },
        "q": {
         "x": 1.55,
         "y": 0
        }
       }
      ],
      "columnas": [
       {
        "eje": "25/R",
        "centro": {
         "x": 1.55,
         "y": 1.55
        },
        "b": 0.8,
        "h": 0.8,
        "forma": "L"
       },
       {
        "eje": "25/T",
        "centro": {
         "x": 5.12,
         "y": 1.55
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "25/V",
        "centro": {
         "x": 10.69,
         "y": 1.55
        },
        "b": 0.8,
        "h": 0.8,
        "forma": "L"
       },
       {
        "eje": "23/R",
        "centro": {
         "x": 1.55,
         "y": 5.98
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "23/T",
        "centro": {
         "x": 5.12,
         "y": 5.98
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "23/V",
        "centro": {
         "x": 10.69,
         "y": 5.98
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "20/R",
        "centro": {
         "x": 1.55,
         "y": 9.65
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "20/T",
        "centro": {
         "x": 5.12,
         "y": 9.65
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "20/V",
        "centro": {
         "x": 10.69,
         "y": 9.65
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "16/R",
        "centro": {
         "x": 1.55,
         "y": 13.09
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "16/T",
        "centro": {
         "x": 5.12,
         "y": 13.09
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "16/V",
        "centro": {
         "x": 10.69,
         "y": 13.09
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "15/R",
        "centro": {
         "x": 1.55,
         "y": 16.57
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "15/T",
        "centro": {
         "x": 5.12,
         "y": 16.57
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "15/V",
        "centro": {
         "x": 10.69,
         "y": 16.57
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "12/R",
        "centro": {
         "x": 1.55,
         "y": 21.03
        },
        "b": 0.8,
        "h": 0.8,
        "forma": "L"
       },
       {
        "eje": "12/T",
        "centro": {
         "x": 5.12,
         "y": 21.03
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "12/V",
        "centro": {
         "x": 10.69,
         "y": 21.03
        },
        "b": 0.8,
        "h": 0.8,
        "forma": "L"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    },
    {
     "id": "vista-09",
     "nivel": 3,
     "categorias": {
      "ejes": [
       {
        "nombre": "12",
        "p": {
         "x": 0,
         "y": 21.03
        },
        "q": {
         "x": 14.24,
         "y": 21.03
        }
       },
       {
        "nombre": "20",
        "p": {
         "x": 0,
         "y": 9.65
        },
        "q": {
         "x": 14.24,
         "y": 9.65
        }
       },
       {
        "nombre": "23",
        "p": {
         "x": 0,
         "y": 5.98
        },
        "q": {
         "x": 14.24,
         "y": 5.98
        }
       },
       {
        "nombre": "25",
        "p": {
         "x": 0,
         "y": 1.55
        },
        "q": {
         "x": 14.24,
         "y": 1.55
        }
       },
       {
        "nombre": "16",
        "p": {
         "x": 0,
         "y": 13.09
        },
        "q": {
         "x": 14.24,
         "y": 13.09
        }
       },
       {
        "nombre": "15",
        "p": {
         "x": 0,
         "y": 16.57
        },
        "q": {
         "x": 14.24,
         "y": 16.57
        }
       },
       {
        "nombre": "V",
        "p": {
         "x": 12.69,
         "y": 22.59
        },
        "q": {
         "x": 12.69,
         "y": 0
        }
       },
       {
        "nombre": "T",
        "p": {
         "x": 7.12,
         "y": 22.59
        },
        "q": {
         "x": 7.12,
         "y": 0
        }
       },
       {
        "nombre": "R",
        "p": {
         "x": 3.55,
         "y": 22.59
        },
        "q": {
         "x": 3.55,
         "y": 0
        }
       }
      ],
      "columnas": [
       {
        "eje": "23/R",
        "centro": {
         "x": 3.55,
         "y": 5.98
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "23/T",
        "centro": {
         "x": 7.12,
         "y": 5.98
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "20/R",
        "centro": {
         "x": 3.55,
         "y": 9.65
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "20/T",
        "centro": {
         "x": 7.12,
         "y": 9.65
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    },
    {
     "id": "vista-10",
     "nivel": 1,
     "categorias": {
      "ejes": [
       {
        "nombre": "12",
        "p": {
         "x": 0,
         "y": 21.03
        },
        "q": {
         "x": 14.24,
         "y": 21.03
        }
       },
       {
        "nombre": "20",
        "p": {
         "x": 0,
         "y": 9.65
        },
        "q": {
         "x": 14.24,
         "y": 9.65
        }
       },
       {
        "nombre": "23",
        "p": {
         "x": 0,
         "y": 5.98
        },
        "q": {
         "x": 14.24,
         "y": 5.98
        }
       },
       {
        "nombre": "25",
        "p": {
         "x": 0,
         "y": 1.55
        },
        "q": {
         "x": 14.24,
         "y": 1.55
        }
       },
       {
        "nombre": "16",
        "p": {
         "x": 0,
         "y": 13.09
        },
        "q": {
         "x": 14.24,
         "y": 13.09
        }
       },
       {
        "nombre": "15",
        "p": {
         "x": 0,
         "y": 16.57
        },
        "q": {
         "x": 14.24,
         "y": 16.57
        }
       },
       {
        "nombre": "V",
        "p": {
         "x": 12.69,
         "y": 22.59
        },
        "q": {
         "x": 12.69,
         "y": 0
        }
       },
       {
        "nombre": "T",
        "p": {
         "x": 7.12,
         "y": 22.59
        },
        "q": {
         "x": 7.12,
         "y": 0
        }
       },
       {
        "nombre": "R",
        "p": {
         "x": 3.55,
         "y": 22.59
        },
        "q": {
         "x": 3.55,
         "y": 0
        }
       }
      ],
      "columnas": [
       {
        "eje": "25/R",
        "centro": {
         "x": 3.55,
         "y": 1.55
        },
        "b": 0.8,
        "h": 0.8,
        "forma": "L"
       },
       {
        "eje": "25/T",
        "centro": {
         "x": 7.12,
         "y": 1.55
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "25/V",
        "centro": {
         "x": 12.69,
         "y": 1.55
        },
        "b": 0.8,
        "h": 0.8,
        "forma": "L"
       },
       {
        "eje": "23/R",
        "centro": {
         "x": 3.55,
         "y": 5.98
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "23/T",
        "centro": {
         "x": 7.12,
         "y": 5.98
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "23/V",
        "centro": {
         "x": 12.69,
         "y": 5.98
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "20/R",
        "centro": {
         "x": 3.55,
         "y": 9.65
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "20/T",
        "centro": {
         "x": 7.12,
         "y": 9.65
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "20/V",
        "centro": {
         "x": 12.69,
         "y": 9.65
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "16/R",
        "centro": {
         "x": 3.55,
         "y": 13.09
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "16/T",
        "centro": {
         "x": 7.12,
         "y": 13.09
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "16/V",
        "centro": {
         "x": 12.69,
         "y": 13.09
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "15/R",
        "centro": {
         "x": 3.55,
         "y": 16.57
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "15/T",
        "centro": {
         "x": 7.12,
         "y": 16.57
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "15/V",
        "centro": {
         "x": 12.69,
         "y": 16.57
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "12/R",
        "centro": {
         "x": 3.55,
         "y": 21.03
        },
        "b": 0.8,
        "h": 0.8,
        "forma": "L"
       },
       {
        "eje": "12/T",
        "centro": {
         "x": 7.12,
         "y": 21.03
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "12/V",
        "centro": {
         "x": 12.69,
         "y": 21.03
        },
        "b": 0.8,
        "h": 0.8,
        "forma": "L"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    },
    {
     "id": "vista-11",
     "nivel": 1,
     "categorias": {
      "ejes": [
       {
        "nombre": "12",
        "p": {
         "x": 2.62,
         "y": 0
        },
        "q": {
         "x": 2.62,
         "y": 20.74
        }
       },
       {
        "nombre": "15",
        "p": {
         "x": 9.34,
         "y": 0
        },
        "q": {
         "x": 9.34,
         "y": 20.74
        }
       },
       {
        "nombre": "16",
        "p": {
         "x": 14.56,
         "y": 0
        },
        "q": {
         "x": 14.56,
         "y": 20.74
        }
       },
       {
        "nombre": "20",
        "p": {
         "x": 19.72,
         "y": 0
        },
        "q": {
         "x": 19.72,
         "y": 20.74
        }
       },
       {
        "nombre": "23",
        "p": {
         "x": 25.23,
         "y": 0
        },
        "q": {
         "x": 25.23,
         "y": 20.74
        }
       },
       {
        "nombre": "25",
        "p": {
         "x": 31.88,
         "y": 0
        },
        "q": {
         "x": 31.88,
         "y": 20.74
        }
       },
       {
        "nombre": "R",
        "p": {
         "x": 0,
         "y": 4.86
        },
        "q": {
         "x": 34.43,
         "y": 4.86
        }
       },
       {
        "nombre": "T",
        "p": {
         "x": 0,
         "y": 10.22
        },
        "q": {
         "x": 34.43,
         "y": 10.22
        }
       },
       {
        "nombre": "V",
        "p": {
         "x": 0,
         "y": 18.6
        },
        "q": {
         "x": 34.43,
         "y": 18.6
        }
       }
      ],
      "columnas": [
       {
        "eje": "15/R",
        "centro": {
         "x": 9.34,
         "y": 4.86
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "rectangular"
       },
       {
        "eje": "16/R",
        "centro": {
         "x": 14.56,
         "y": 4.86
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "rectangular"
       },
       {
        "eje": "20/R",
        "centro": {
         "x": 19.72,
         "y": 4.86
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "rectangular"
       },
       {
        "eje": "23/R",
        "centro": {
         "x": 25.23,
         "y": 4.86
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "rectangular"
       },
       {
        "eje": "12/R",
        "centro": {
         "x": 2.62,
         "y": 4.86
        },
        "b": 1.23,
        "h": 1.23,
        "forma": "L"
       },
       {
        "eje": "25/R",
        "centro": {
         "x": 31.88,
         "y": 4.86
        },
        "b": 1.23,
        "h": 1.23,
        "forma": "L"
       },
       {
        "eje": "12/T",
        "centro": {
         "x": 2.62,
         "y": 10.22
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "rectangular"
       },
       {
        "eje": "15/T",
        "centro": {
         "x": 9.34,
         "y": 10.22
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "rectangular"
       },
       {
        "eje": "16/T",
        "centro": {
         "x": 14.56,
         "y": 10.22
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "rectangular"
       },
       {
        "eje": "20/T",
        "centro": {
         "x": 19.72,
         "y": 10.22
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "rectangular"
       },
       {
        "eje": "23/T",
        "centro": {
         "x": 25.23,
         "y": 10.22
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "rectangular"
       },
       {
        "eje": "25/T",
        "centro": {
         "x": 31.88,
         "y": 10.22
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "rectangular"
       },
       {
        "eje": "12/V",
        "centro": {
         "x": 2.62,
         "y": 18.6
        },
        "b": 1.23,
        "h": 1.23,
        "forma": "L"
       },
       {
        "eje": "25/V",
        "centro": {
         "x": 31.88,
         "y": 18.6
        },
        "b": 1.23,
        "h": 1.23,
        "forma": "L"
       },
       {
        "eje": "15/V",
        "centro": {
         "x": 9.34,
         "y": 18.6
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "rectangular"
       },
       {
        "eje": "16/V",
        "centro": {
         "x": 14.56,
         "y": 18.6
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "rectangular"
       },
       {
        "eje": "20/V",
        "centro": {
         "x": 19.72,
         "y": 18.6
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "rectangular"
       },
       {
        "eje": "23/V",
        "centro": {
         "x": 25.23,
         "y": 18.6
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "rectangular"
       },
       {
        "eje": null,
        "centro": {
         "x": 3.99,
         "y": 4.94
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.99,
         "y": 4.94
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 14.64,
         "y": 5.42
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.21,
         "y": 5
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.15,
         "y": 7.44
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 14.64,
         "y": 7.44
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 12.03,
         "y": 6.06
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 12.03,
         "y": 7.44
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 12.03,
         "y": 10.29
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 9.69,
         "y": 10.3
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 9.26,
         "y": 10.57
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.99,
         "y": 18.52
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 3.99,
         "y": 18.52
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 14.21,
         "y": 18.52
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 14.89,
         "y": 18.52
        },
        "b": 0.21,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 19.37,
         "y": 18.52
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 24.88,
         "y": 18.52
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 30.51,
         "y": 18.52
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 31.8,
         "y": 17.23
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 31.8,
         "y": 10.6
        },
        "b": 0.13,
        "h": 0.3,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 31.31,
         "y": 10.31
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 25.58,
         "y": 10.31
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 28.87,
         "y": 7.79
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 24.88,
         "y": 10.31
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 20.07,
         "y": 10.31
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 28.87,
         "y": 10.31
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 14.21,
         "y": 4.94
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 28.87,
         "y": 5
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 26.94,
         "y": 4.94
        },
        "b": 0.27,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 25.58,
         "y": 4.94
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 25.58,
         "y": 18.52
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 9.26,
         "y": 14.63
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 20.06,
         "y": 18.52
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 30.51,
         "y": 4.94
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 19.8,
         "y": 9.87
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 25.14,
         "y": 6.43
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 22.47,
         "y": 10.31
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 25.14,
         "y": 9.88
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 19.8,
         "y": 5.42
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 31.8,
         "y": 12.72
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 31.8,
         "y": 8.97
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 14.21,
         "y": 10.3
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 14.91,
         "y": 10.3
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.15,
         "y": 10.3
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 9.26,
         "y": 15.92
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 12.03,
         "y": 18.46
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 9.26,
         "y": 18.03
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 11.97,
         "y": 14.69
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    },
    {
     "id": "vista-12",
     "nivel": 2,
     "categorias": {
      "ejes": [
       {
        "nombre": "25",
        "p": {
         "x": 31.92,
         "y": 20.69
        },
        "q": {
         "x": 31.92,
         "y": 0
        }
       },
       {
        "nombre": "12",
        "p": {
         "x": 2.67,
         "y": 20.69
        },
        "q": {
         "x": 2.67,
         "y": 0
        }
       },
       {
        "nombre": "15",
        "p": {
         "x": 9.39,
         "y": 20.69
        },
        "q": {
         "x": 9.39,
         "y": 0
        }
       },
       {
        "nombre": "16",
        "p": {
         "x": 14.6,
         "y": 20.69
        },
        "q": {
         "x": 14.6,
         "y": 0
        }
       },
       {
        "nombre": "20",
        "p": {
         "x": 19.76,
         "y": 20.69
        },
        "q": {
         "x": 19.76,
         "y": 0
        }
       },
       {
        "nombre": "23",
        "p": {
         "x": 25.27,
         "y": 20.69
        },
        "q": {
         "x": 25.27,
         "y": 0
        }
       },
       {
        "nombre": "R",
        "p": {
         "x": 0,
         "y": 4.83
        },
        "q": {
         "x": 34.97,
         "y": 4.83
        }
       },
       {
        "nombre": "T",
        "p": {
         "x": 0,
         "y": 10.2
        },
        "q": {
         "x": 34.97,
         "y": 10.2
        }
       },
       {
        "nombre": "V",
        "p": {
         "x": 0,
         "y": 18.57
        },
        "q": {
         "x": 34.97,
         "y": 18.57
        }
       }
      ],
      "columnas": [
       {
        "eje": "15/R",
        "centro": {
         "x": 9.39,
         "y": 4.83
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "rectangular"
       },
       {
        "eje": "16/R",
        "centro": {
         "x": 14.6,
         "y": 4.83
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "rectangular"
       },
       {
        "eje": "20/R",
        "centro": {
         "x": 19.76,
         "y": 4.83
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "rectangular"
       },
       {
        "eje": "23/R",
        "centro": {
         "x": 25.27,
         "y": 4.83
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "rectangular"
       },
       {
        "eje": "12/R",
        "centro": {
         "x": 2.67,
         "y": 4.83
        },
        "b": 1.23,
        "h": 1.23,
        "forma": "L"
       },
       {
        "eje": "25/R",
        "centro": {
         "x": 31.92,
         "y": 4.83
        },
        "b": 1.23,
        "h": 1.23,
        "forma": "L"
       },
       {
        "eje": "12/T",
        "centro": {
         "x": 2.67,
         "y": 10.2
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "rectangular"
       },
       {
        "eje": "15/T",
        "centro": {
         "x": 9.39,
         "y": 10.2
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "rectangular"
       },
       {
        "eje": "16/T",
        "centro": {
         "x": 14.6,
         "y": 10.2
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "rectangular"
       },
       {
        "eje": "20/T",
        "centro": {
         "x": 19.76,
         "y": 10.2
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "rectangular"
       },
       {
        "eje": "23/T",
        "centro": {
         "x": 25.27,
         "y": 10.2
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "rectangular"
       },
       {
        "eje": "25/T",
        "centro": {
         "x": 31.92,
         "y": 10.2
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "rectangular"
       },
       {
        "eje": "12/V",
        "centro": {
         "x": 2.67,
         "y": 18.57
        },
        "b": 1.23,
        "h": 1.23,
        "forma": "L"
       },
       {
        "eje": "25/V",
        "centro": {
         "x": 31.92,
         "y": 18.57
        },
        "b": 1.23,
        "h": 1.23,
        "forma": "L"
       },
       {
        "eje": "15/V",
        "centro": {
         "x": 9.39,
         "y": 18.57
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "rectangular"
       },
       {
        "eje": "16/V",
        "centro": {
         "x": 14.6,
         "y": 18.57
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "rectangular"
       },
       {
        "eje": "20/V",
        "centro": {
         "x": 19.76,
         "y": 18.57
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "rectangular"
       },
       {
        "eje": "23/V",
        "centro": {
         "x": 25.27,
         "y": 18.57
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "rectangular"
       },
       {
        "eje": null,
        "centro": {
         "x": 9.04,
         "y": 4.91
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 9.74,
         "y": 4.91
        },
        "b": 0.26,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 9.3,
         "y": 5.4
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 14.25,
         "y": 4.91
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 9.74,
         "y": 10.28
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 14.25,
         "y": 10.28
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 14.95,
         "y": 4.91
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 17.61,
         "y": 4.91
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 24.92,
         "y": 10.28
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 31.35,
         "y": 10.28
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 31.84,
         "y": 9.83
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 24.92,
         "y": 18.49
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 19.41,
         "y": 18.49
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 14.25,
         "y": 18.49
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 9.04,
         "y": 18.49
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 9.3,
         "y": 18.01
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 9.3,
         "y": 10.55
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 9.3,
         "y": 9.85
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 14.95,
         "y": 10.28
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 25.62,
         "y": 4.91
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 4.03,
         "y": 18.49
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 26.97,
         "y": 4.91
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 4.03,
         "y": 4.91
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 30.55,
         "y": 18.49
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 31.84,
         "y": 17.21
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 31.84,
         "y": 6.22
        },
        "b": 0.13,
        "h": 0.3,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 30.55,
         "y": 4.91
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 20.11,
         "y": 10.28
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 9.74,
         "y": 18.49
        },
        "b": 0.26,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 14.93,
         "y": 18.49
        },
        "b": 0.21,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 31.84,
         "y": 10.57
        },
        "b": 0.13,
        "h": 0.3,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 19.85,
         "y": 9.85
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 19.85,
         "y": 5.4
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 25.62,
         "y": 10.28
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 25.18,
         "y": 6.4
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 25.18,
         "y": 9.86
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    },
    {
     "id": "vista-13",
     "nivel": 2,
     "categorias": {
      "ejes": [
       {
        "nombre": "12",
        "p": {
         "x": 0,
         "y": 21.1
        },
        "q": {
         "x": 14.19,
         "y": 21.1
        }
       },
       {
        "nombre": "20",
        "p": {
         "x": 0,
         "y": 9.71
        },
        "q": {
         "x": 14.19,
         "y": 9.71
        }
       },
       {
        "nombre": "23",
        "p": {
         "x": 0,
         "y": 6.04
        },
        "q": {
         "x": 14.19,
         "y": 6.04
        }
       },
       {
        "nombre": "25",
        "p": {
         "x": 0,
         "y": 1.62
        },
        "q": {
         "x": 14.19,
         "y": 1.62
        }
       },
       {
        "nombre": "16",
        "p": {
         "x": 0,
         "y": 13.15
        },
        "q": {
         "x": 14.19,
         "y": 13.15
        }
       },
       {
        "nombre": "15",
        "p": {
         "x": 0,
         "y": 16.63
        },
        "q": {
         "x": 14.19,
         "y": 16.63
        }
       },
       {
        "nombre": "V",
        "p": {
         "x": 12.63,
         "y": 0
        },
        "q": {
         "x": 12.63,
         "y": 22.72
        }
       },
       {
        "nombre": "T",
        "p": {
         "x": 7.06,
         "y": 0
        },
        "q": {
         "x": 7.06,
         "y": 22.72
        }
       },
       {
        "nombre": "R",
        "p": {
         "x": 3.49,
         "y": 0
        },
        "q": {
         "x": 3.49,
         "y": 22.72
        }
       }
      ],
      "columnas": [
       {
        "eje": "25/R",
        "centro": {
         "x": 3.49,
         "y": 1.62
        },
        "b": 0.8,
        "h": 0.8,
        "forma": "L"
       },
       {
        "eje": "25/T",
        "centro": {
         "x": 7.06,
         "y": 1.62
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "25/V",
        "centro": {
         "x": 12.63,
         "y": 1.62
        },
        "b": 0.8,
        "h": 0.8,
        "forma": "L"
       },
       {
        "eje": "23/R",
        "centro": {
         "x": 3.49,
         "y": 6.04
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "23/T",
        "centro": {
         "x": 7.06,
         "y": 6.04
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "23/V",
        "centro": {
         "x": 12.63,
         "y": 6.04
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "20/R",
        "centro": {
         "x": 3.49,
         "y": 9.71
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "20/T",
        "centro": {
         "x": 7.06,
         "y": 9.71
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "20/V",
        "centro": {
         "x": 12.63,
         "y": 9.71
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "16/R",
        "centro": {
         "x": 3.49,
         "y": 13.15
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "16/T",
        "centro": {
         "x": 7.06,
         "y": 13.15
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "16/V",
        "centro": {
         "x": 12.63,
         "y": 13.15
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "15/R",
        "centro": {
         "x": 3.49,
         "y": 16.63
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "15/T",
        "centro": {
         "x": 7.06,
         "y": 16.63
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "15/V",
        "centro": {
         "x": 12.63,
         "y": 16.63
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "12/R",
        "centro": {
         "x": 3.49,
         "y": 21.1
        },
        "b": 0.8,
        "h": 0.8,
        "forma": "L"
       },
       {
        "eje": "12/T",
        "centro": {
         "x": 7.06,
         "y": 21.1
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "12/V",
        "centro": {
         "x": 12.63,
         "y": 21.1
        },
        "b": 0.8,
        "h": 0.8,
        "forma": "L"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    },
    {
     "id": "vista-14",
     "nivel": null,
     "categorias": {
      "ejes": [
       {
        "nombre": "23",
        "p": {
         "x": 7.26,
         "y": 8.19
        },
        "q": {
         "x": 7.26,
         "y": 0
        }
       },
       {
        "nombre": "20",
        "p": {
         "x": 1.31,
         "y": 8.19
        },
        "q": {
         "x": 1.31,
         "y": 0
        }
       },
       {
        "nombre": "R",
        "p": {
         "x": 0,
         "y": 1.1
        },
        "q": {
         "x": 8.57,
         "y": 1.1
        }
       },
       {
        "nombre": "T",
        "p": {
         "x": 0,
         "y": 6.88
        },
        "q": {
         "x": 8.57,
         "y": 6.88
        }
       }
      ],
      "columnas": [
       {
        "eje": "20/R",
        "centro": {
         "x": 1.31,
         "y": 1.1
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "rectangular"
       },
       {
        "eje": "23/R",
        "centro": {
         "x": 7.26,
         "y": 1.1
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "rectangular"
       },
       {
        "eje": "20/T",
        "centro": {
         "x": 1.31,
         "y": 6.88
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "rectangular"
       },
       {
        "eje": "23/T",
        "centro": {
         "x": 7.26,
         "y": 6.88
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "rectangular"
       },
       {
        "eje": null,
        "centro": {
         "x": 1.22,
         "y": 1.69
        },
        "b": 0.14,
        "h": 0.27,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 1.22,
         "y": 6.5
        },
        "b": 0.14,
        "h": 0.27,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 1.22,
         "y": 4.1
        },
        "b": 0.14,
        "h": 0.27,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 7.35,
         "y": 1.69
        },
        "b": 0.14,
        "h": 0.27,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 7.35,
         "y": 6.5
        },
        "b": 0.14,
        "h": 0.27,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 7.35,
         "y": 4.48
        },
        "b": 0.14,
        "h": 0.27,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 7.35,
         "y": 5.5
        },
        "b": 0.14,
        "h": 0.27,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 1.69,
         "y": 1.22
        },
        "b": 0.27,
        "h": 0.14,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 4.29,
         "y": 1.22
        },
        "b": 0.27,
        "h": 0.14,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 6.88,
         "y": 1.22
        },
        "b": 0.27,
        "h": 0.14,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 1.69,
         "y": 6.97
        },
        "b": 0.27,
        "h": 0.14,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 4.29,
         "y": 6.97
        },
        "b": 0.27,
        "h": 0.14,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 6.88,
         "y": 6.97
        },
        "b": 0.27,
        "h": 0.14,
        "forma": "columneta"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    }
   ]
  }
 },
 {
  "nombre": "ilo:modulo-04",
  "grupo": "ilo",
  "id": "modulo-04",
  "etiqueta": null,
  "rasgos": {
   "vista": "vista-01",
   "areaAbierta": false,
   "niveles": 2,
   "ejes": {
    "x": 5,
    "y": 3
   },
   "luces": {
    "x": [
     5.63,
     5.36,
     3.24,
     3.73
    ],
    "y": [
     10.5,
     6.5
    ]
   },
   "largo": 17.96,
   "ancho": 17,
   "area": 305.4,
   "luzLosa": 5.63,
   "luzMax": 10.5,
   "columnas": 15,
   "tipos": [
    {
     "nombre": "C1",
     "forma": "rectangular",
     "b": 0.63,
     "h": 0.33,
     "n": 11
    },
    {
     "nombre": "PL1",
     "forma": "rectangular",
     "b": 1.43,
     "h": 0.33,
     "n": 2
    },
    {
     "nombre": "PL2",
     "forma": "L",
     "b": 1.53,
     "h": 1.53,
     "n": 2
    }
   ],
   "placas": true,
   "columnetas": 72,
   "techoLiviano": false,
   "cubierta": true,
   "falsoCielo": false,
   "deportivo": false,
   "agua": false,
   "banos": true
  },
  "decisiones": {
   "cimentacion": "zapatas",
   "cimientoCorrido": true,
   "hz": 0.6,
   "df": 1.5,
   "losa": "aligerada y maciza",
   "espesorLosa": 0.2,
   "plantasDeLosa": 2,
   "vigas": [
    "30x85",
    "30x50",
    "30x40"
   ],
   "fcColumnas": 280,
   "fcColumnetas": 175,
   "estribos": "3/8\": 1@.05, 17@.10",
   "porticos": 8,
   "mallaCimentacion": false,
   "columnasComoArquitectura": true,
   "losaDeTecho": true
  },
  "geometria": {
   "version": 1,
   "unidad": "m",
   "vistas": [
    {
     "id": "vista-01",
     "nivel": 2,
     "categorias": {
      "ejes": [
       {
        "nombre": "I",
        "p": {
         "x": 8.8,
         "y": 30.6
        },
        "q": {
         "x": 8.8,
         "y": 7.6
        }
       },
       {
        "nombre": "L",
        "p": {
         "x": 14.16,
         "y": 30.6
        },
        "q": {
         "x": 14.16,
         "y": 7.6
        }
       },
       {
        "nombre": "O",
        "p": {
         "x": 17.4,
         "y": 30.6
        },
        "q": {
         "x": 17.4,
         "y": 7.6
        }
       },
       {
        "nombre": "Q",
        "p": {
         "x": 21.13,
         "y": 30.6
        },
        "q": {
         "x": 21.13,
         "y": 7.6
        }
       },
       {
        "nombre": "25",
        "p": {
         "x": 0,
         "y": 10.6
        },
        "q": {
         "x": 24.3,
         "y": 10.6
        }
       },
       {
        "nombre": "18",
        "p": {
         "x": 0,
         "y": 27.6
        },
        "q": {
         "x": 24.3,
         "y": 27.6
        }
       },
       {
        "nombre": "21",
        "p": {
         "x": 0,
         "y": 21.1
        },
        "q": {
         "x": 24.3,
         "y": 21.1
        }
       },
       {
        "nombre": "G",
        "p": {
         "x": 3.17,
         "y": 0
        },
        "q": {
         "x": 3.17,
         "y": 30.6
        }
       }
      ],
      "columnas": [
       {
        "eje": "25/G",
        "centro": {
         "x": 3.17,
         "y": 10.6
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "rectangular"
       },
       {
        "eje": "25/I",
        "centro": {
         "x": 8.8,
         "y": 10.6
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "rectangular"
       },
       {
        "eje": "25/Q",
        "centro": {
         "x": 21.13,
         "y": 10.6
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "rectangular"
       },
       {
        "eje": "21/I",
        "centro": {
         "x": 8.8,
         "y": 21.1
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "rectangular"
       },
       {
        "eje": "18/G",
        "centro": {
         "x": 3.17,
         "y": 27.6
        },
        "b": 1.43,
        "h": 0.33,
        "forma": "rectangular"
       },
       {
        "eje": "18/I",
        "centro": {
         "x": 8.8,
         "y": 27.6
        },
        "b": 0.33,
        "h": 0.63,
        "forma": "rectangular"
       },
       {
        "eje": "18/Q",
        "centro": {
         "x": 21.13,
         "y": 27.6
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "rectangular"
       },
       {
        "eje": null,
        "centro": {
         "x": 4.73,
         "y": 27.35
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.49,
         "y": 27.35
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 3.31,
         "y": 23.79
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.65,
         "y": 23.79
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.71,
         "y": 26.83
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 9.09,
         "y": 27.52
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 12.09,
         "y": 27.52
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 15.09,
         "y": 27.52
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 18.09,
         "y": 27.52
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 21.05,
         "y": 25.47
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 21.05,
         "y": 23.47
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 21.05,
         "y": 17.05
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 21.05,
         "y": 13.98
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 18.09,
         "y": 10.68
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 15.09,
         "y": 10.68
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 12.09,
         "y": 10.68
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 6.09,
         "y": 10.68
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 4.16,
         "y": 21.19
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.71,
         "y": 23.59
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 3.25,
         "y": 26.13
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    },
    {
     "id": "vista-02",
     "nivel": 2,
     "categorias": {
      "ejes": [
       {
        "nombre": "G",
        "p": {
         "x": 3.17,
         "y": 23
        },
        "q": {
         "x": 3.17,
         "y": 0
        }
       },
       {
        "nombre": "I",
        "p": {
         "x": 8.8,
         "y": 23
        },
        "q": {
         "x": 8.8,
         "y": 0
        }
       },
       {
        "nombre": "L",
        "p": {
         "x": 14.16,
         "y": 23
        },
        "q": {
         "x": 14.16,
         "y": 0
        }
       },
       {
        "nombre": "O",
        "p": {
         "x": 17.4,
         "y": 23
        },
        "q": {
         "x": 17.4,
         "y": 0
        }
       },
       {
        "nombre": "Q",
        "p": {
         "x": 21.13,
         "y": 23
        },
        "q": {
         "x": 21.13,
         "y": 0
        }
       },
       {
        "nombre": "25",
        "p": {
         "x": 0,
         "y": 3
        },
        "q": {
         "x": 24.3,
         "y": 3
        }
       },
       {
        "nombre": "18",
        "p": {
         "x": 0,
         "y": 20
        },
        "q": {
         "x": 24.3,
         "y": 20
        }
       },
       {
        "nombre": "21",
        "p": {
         "x": 0,
         "y": 13.5
        },
        "q": {
         "x": 24.3,
         "y": 13.5
        }
       }
      ],
      "columnas": [
       {
        "eje": "25/I",
        "centro": {
         "x": 8.8,
         "y": 3
        },
        "b": 0.33,
        "h": 0.63,
        "forma": "rectangular"
       },
       {
        "eje": "25/L",
        "centro": {
         "x": 14.16,
         "y": 3
        },
        "b": 0.33,
        "h": 0.63,
        "forma": "rectangular"
       },
       {
        "eje": "25/O",
        "centro": {
         "x": 17.4,
         "y": 3
        },
        "b": 0.33,
        "h": 0.63,
        "forma": "rectangular"
       },
       {
        "eje": "25/Q",
        "centro": {
         "x": 21.13,
         "y": 3
        },
        "b": 1.43,
        "h": 0.33,
        "forma": "rectangular"
       },
       {
        "eje": "25/G",
        "centro": {
         "x": 3.17,
         "y": 3
        },
        "b": 1.53,
        "h": 1.53,
        "forma": "L"
       },
       {
        "eje": "21/G",
        "centro": {
         "x": 3.17,
         "y": 13.5
        },
        "b": 0.33,
        "h": 0.63,
        "forma": "rectangular"
       },
       {
        "eje": "21/I",
        "centro": {
         "x": 8.8,
         "y": 13.5
        },
        "b": 0.33,
        "h": 0.63,
        "forma": "rectangular"
       },
       {
        "eje": "21/L",
        "centro": {
         "x": 14.16,
         "y": 13.5
        },
        "b": 0.33,
        "h": 0.63,
        "forma": "rectangular"
       },
       {
        "eje": "21/O",
        "centro": {
         "x": 17.4,
         "y": 13.5
        },
        "b": 0.33,
        "h": 0.63,
        "forma": "rectangular"
       },
       {
        "eje": "21/Q",
        "centro": {
         "x": 21.13,
         "y": 13.5
        },
        "b": 0.33,
        "h": 0.63,
        "forma": "rectangular"
       },
       {
        "eje": "18/Q",
        "centro": {
         "x": 21.13,
         "y": 20
        },
        "b": 1.53,
        "h": 1.53,
        "forma": "L"
       },
       {
        "eje": "18/G",
        "centro": {
         "x": 3.17,
         "y": 20
        },
        "b": 1.43,
        "h": 0.33,
        "forma": "rectangular"
       },
       {
        "eje": "18/I",
        "centro": {
         "x": 8.8,
         "y": 20
        },
        "b": 0.33,
        "h": 0.63,
        "forma": "rectangular"
       },
       {
        "eje": "18/L",
        "centro": {
         "x": 14.16,
         "y": 20
        },
        "b": 0.33,
        "h": 0.63,
        "forma": "rectangular"
       },
       {
        "eje": "18/O",
        "centro": {
         "x": 17.4,
         "y": 20
        },
        "b": 0.33,
        "h": 0.63,
        "forma": "rectangular"
       },
       {
        "eje": null,
        "centro": {
         "x": 19.56,
         "y": 3.08
        },
        "b": 0.28,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 21.05,
         "y": 12.98
        },
        "b": 0.13,
        "h": 0.38,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 21.05,
         "y": 8.27
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 14.24,
         "y": 3.76
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 21.05,
         "y": 3.46
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 19.76,
         "y": 13.41
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 17.7,
         "y": 13.41
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 17.1,
         "y": 13.41
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 14.46,
         "y": 13.41
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.71,
         "y": 7.64
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 9.09,
         "y": 3.08
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.71,
         "y": 3.76
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 6.25,
         "y": 3.14
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.86,
         "y": 3.08
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 3.25,
         "y": 4.66
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 4.73,
         "y": 19.75
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.49,
         "y": 19.75
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 9.09,
         "y": 19.92
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 4.32,
         "y": 16.19
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.65,
         "y": 16.19
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.71,
         "y": 19.23
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.86,
         "y": 19.92
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 14.46,
         "y": 19.92
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 17.1,
         "y": 19.92
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 17.7,
         "y": 19.92
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 19.47,
         "y": 19.92
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.71,
         "y": 13.95
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 5.29,
         "y": 9.4
        },
        "b": 0.13,
        "h": 0.33,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 6.89,
         "y": 9.4
        },
        "b": 0.13,
        "h": 0.33,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 4.83,
         "y": 3.08
        },
        "b": 0.24,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.49,
         "y": 3.08
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 6.25,
         "y": 9.24
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 5.23,
         "y": 10.56
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 6.95,
         "y": 10.56
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 3.31,
         "y": 10.56
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 3.25,
         "y": 13.05
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 20.02,
         "y": 14.79
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 21.05,
         "y": 14.73
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 21.05,
         "y": 13.95
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 15.57,
         "y": 19.86
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 15.57,
         "y": 14.9
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 19.73,
         "y": 9.87
        },
        "b": 0.32,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 20.06,
         "y": 8.21
        },
        "b": 0.32,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 20.97,
         "y": 9.87
        },
        "b": 0.3,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 14.17,
         "y": 9.87
        },
        "b": 0.32,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.65,
         "y": 10.56
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.77,
         "y": 11.12
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 18.48,
         "y": 3.14
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 7.47,
         "y": 6.04
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.65,
         "y": 6.04
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 12.58,
         "y": 8.21
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 15.92,
         "y": 8.21
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 14.24,
         "y": 8.15
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 14.46,
         "y": 3.08
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 11.73,
         "y": 13.58
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 9.09,
         "y": 13.58
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 11.79,
         "y": 11.18
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 14.07,
         "y": 13.05
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 14.13,
         "y": 14.84
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 17.14,
         "y": 14.84
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 14.07,
         "y": 11.27
        },
        "b": 0.13,
        "h": 0.43,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 17.7,
         "y": 8.21
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 18.48,
         "y": 8.15
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.71,
         "y": 13.06
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.71,
         "y": 12.34
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    },
    {
     "id": "vista-03",
     "nivel": 1,
     "categorias": {
      "ejes": [
       {
        "nombre": "G",
        "p": {
         "x": 3.17,
         "y": 23
        },
        "q": {
         "x": 3.17,
         "y": 0
        }
       },
       {
        "nombre": "I",
        "p": {
         "x": 8.8,
         "y": 23
        },
        "q": {
         "x": 8.8,
         "y": 0
        }
       },
       {
        "nombre": "L",
        "p": {
         "x": 14.16,
         "y": 23
        },
        "q": {
         "x": 14.16,
         "y": 0
        }
       },
       {
        "nombre": "O",
        "p": {
         "x": 17.4,
         "y": 23
        },
        "q": {
         "x": 17.4,
         "y": 0
        }
       },
       {
        "nombre": "Q",
        "p": {
         "x": 21.13,
         "y": 23
        },
        "q": {
         "x": 21.13,
         "y": 0
        }
       },
       {
        "nombre": "25",
        "p": {
         "x": 0,
         "y": 3
        },
        "q": {
         "x": 24.3,
         "y": 3
        }
       },
       {
        "nombre": "18",
        "p": {
         "x": 0,
         "y": 20
        },
        "q": {
         "x": 24.3,
         "y": 20
        }
       },
       {
        "nombre": "21",
        "p": {
         "x": 0,
         "y": 13.5
        },
        "q": {
         "x": 24.3,
         "y": 13.5
        }
       }
      ],
      "columnas": [
       {
        "eje": "25/I",
        "centro": {
         "x": 8.8,
         "y": 3
        },
        "b": 0.33,
        "h": 0.63,
        "forma": "rectangular"
       },
       {
        "eje": "25/L",
        "centro": {
         "x": 14.16,
         "y": 3
        },
        "b": 0.33,
        "h": 0.63,
        "forma": "rectangular"
       },
       {
        "eje": "25/O",
        "centro": {
         "x": 17.4,
         "y": 3
        },
        "b": 0.33,
        "h": 0.63,
        "forma": "rectangular"
       },
       {
        "eje": "25/Q",
        "centro": {
         "x": 21.13,
         "y": 3
        },
        "b": 1.43,
        "h": 0.33,
        "forma": "rectangular"
       },
       {
        "eje": "25/G",
        "centro": {
         "x": 3.17,
         "y": 3
        },
        "b": 1.53,
        "h": 1.53,
        "forma": "L"
       },
       {
        "eje": "21/G",
        "centro": {
         "x": 3.17,
         "y": 13.5
        },
        "b": 0.33,
        "h": 0.63,
        "forma": "rectangular"
       },
       {
        "eje": "21/I",
        "centro": {
         "x": 8.8,
         "y": 13.5
        },
        "b": 0.33,
        "h": 0.63,
        "forma": "rectangular"
       },
       {
        "eje": "21/L",
        "centro": {
         "x": 14.16,
         "y": 13.5
        },
        "b": 0.33,
        "h": 0.63,
        "forma": "rectangular"
       },
       {
        "eje": "21/O",
        "centro": {
         "x": 17.4,
         "y": 13.5
        },
        "b": 0.33,
        "h": 0.63,
        "forma": "rectangular"
       },
       {
        "eje": "21/Q",
        "centro": {
         "x": 21.13,
         "y": 13.5
        },
        "b": 0.33,
        "h": 0.63,
        "forma": "rectangular"
       },
       {
        "eje": "18/Q",
        "centro": {
         "x": 21.13,
         "y": 20
        },
        "b": 1.53,
        "h": 1.53,
        "forma": "L"
       },
       {
        "eje": "18/G",
        "centro": {
         "x": 3.17,
         "y": 20
        },
        "b": 1.43,
        "h": 0.33,
        "forma": "rectangular"
       },
       {
        "eje": "18/I",
        "centro": {
         "x": 8.8,
         "y": 20
        },
        "b": 0.33,
        "h": 0.63,
        "forma": "rectangular"
       },
       {
        "eje": "18/L",
        "centro": {
         "x": 14.16,
         "y": 20
        },
        "b": 0.33,
        "h": 0.63,
        "forma": "rectangular"
       },
       {
        "eje": "18/O",
        "centro": {
         "x": 17.4,
         "y": 20
        },
        "b": 0.33,
        "h": 0.63,
        "forma": "rectangular"
       },
       {
        "eje": null,
        "centro": {
         "x": 19.54,
         "y": 3.08
        },
        "b": 0.31,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 12.31,
         "y": 3.14
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 11.31,
         "y": 7.76
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 14.82,
         "y": 7.64
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 17.48,
         "y": 7.64
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 17.48,
         "y": 3.76
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 20.67,
         "y": 13.41
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 17.1,
         "y": 13.41
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 14.46,
         "y": 13.41
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.86,
         "y": 13.41
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 9.1,
         "y": 13.41
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 3.63,
         "y": 13.41
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.71,
         "y": 7.64
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.71,
         "y": 3.76
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 4.83,
         "y": 3.08
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 14.46,
         "y": 3.08
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 15.33,
         "y": 3.08
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 3.25,
         "y": 4.66
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 4.73,
         "y": 19.75
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.49,
         "y": 19.75
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 9.09,
         "y": 19.92
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.65,
         "y": 16.19
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.71,
         "y": 19.23
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.86,
         "y": 19.92
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 14.46,
         "y": 19.92
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 17.1,
         "y": 19.92
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 17.7,
         "y": 19.92
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 19.47,
         "y": 19.92
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 3.25,
         "y": 13.05
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 10.52,
         "y": 3.08
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 12.31,
         "y": 7.64
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 21.05,
         "y": 15.75
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 6.69,
         "y": 13.41
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 21.05,
         "y": 6.04
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 21.05,
         "y": 6.72
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 19.51,
         "y": 13.41
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 21.05,
         "y": 13.05
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 3.31,
         "y": 16.19
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 3.25,
         "y": 13.95
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    },
    {
     "id": "vista-04",
     "nivel": null,
     "categorias": {
      "ejes": [
       {
        "nombre": "G",
        "p": {
         "x": 2.08,
         "y": 0
        },
        "q": {
         "x": 2.08,
         "y": 21.13
        }
       },
       {
        "nombre": "P",
        "p": {
         "x": 20.02,
         "y": 0
        },
        "q": {
         "x": 20.02,
         "y": 21.13
        }
       },
       {
        "nombre": "I",
        "p": {
         "x": 7.69,
         "y": 0
        },
        "q": {
         "x": 7.69,
         "y": 21.13
        }
       },
       {
        "nombre": "L",
        "p": {
         "x": 13.06,
         "y": 0
        },
        "q": {
         "x": 13.06,
         "y": 21.13
        }
       },
       {
        "nombre": "O",
        "p": {
         "x": 16.3,
         "y": 0
        },
        "q": {
         "x": 16.3,
         "y": 21.13
        }
       },
       {
        "nombre": "18",
        "p": {
         "x": 22.1,
         "y": 19.05
        },
        "q": {
         "x": 0,
         "y": 19.05
        }
       },
       {
        "nombre": "25",
        "p": {
         "x": 22.1,
         "y": 2.08
        },
        "q": {
         "x": 0,
         "y": 2.08
        }
       },
       {
        "nombre": "21",
        "p": {
         "x": 22.1,
         "y": 12.57
        },
        "q": {
         "x": 0,
         "y": 12.57
        }
       }
      ],
      "columnas": [
       {
        "eje": "25/I",
        "centro": {
         "x": 7.69,
         "y": 2.08
        },
        "b": 0.3,
        "h": 0.6,
        "forma": "rectangular"
       },
       {
        "eje": "25/L",
        "centro": {
         "x": 13.06,
         "y": 2.08
        },
        "b": 0.3,
        "h": 0.6,
        "forma": "rectangular"
       },
       {
        "eje": "25/O",
        "centro": {
         "x": 16.3,
         "y": 2.08
        },
        "b": 0.3,
        "h": 0.6,
        "forma": "rectangular"
       },
       {
        "eje": "25/P",
        "centro": {
         "x": 20.02,
         "y": 2.08
        },
        "b": 1.4,
        "h": 0.3,
        "forma": "rectangular"
       },
       {
        "eje": "25/G",
        "centro": {
         "x": 2.08,
         "y": 2.08
        },
        "b": 1.5,
        "h": 1.5,
        "forma": "L"
       },
       {
        "eje": "21/G",
        "centro": {
         "x": 2.08,
         "y": 12.57
        },
        "b": 0.3,
        "h": 0.6,
        "forma": "rectangular"
       },
       {
        "eje": "21/I",
        "centro": {
         "x": 7.69,
         "y": 12.57
        },
        "b": 0.3,
        "h": 0.6,
        "forma": "rectangular"
       },
       {
        "eje": "21/L",
        "centro": {
         "x": 13.06,
         "y": 12.57
        },
        "b": 0.3,
        "h": 0.6,
        "forma": "rectangular"
       },
       {
        "eje": "21/O",
        "centro": {
         "x": 16.3,
         "y": 12.57
        },
        "b": 0.3,
        "h": 0.6,
        "forma": "rectangular"
       },
       {
        "eje": "21/P",
        "centro": {
         "x": 20.02,
         "y": 12.57
        },
        "b": 0.3,
        "h": 0.6,
        "forma": "rectangular"
       },
       {
        "eje": "18/P",
        "centro": {
         "x": 20.02,
         "y": 19.05
        },
        "b": 1.5,
        "h": 1.5,
        "forma": "L"
       },
       {
        "eje": "18/G",
        "centro": {
         "x": 2.08,
         "y": 19.05
        },
        "b": 1.4,
        "h": 0.3,
        "forma": "rectangular"
       },
       {
        "eje": "18/I",
        "centro": {
         "x": 7.69,
         "y": 19.05
        },
        "b": 0.3,
        "h": 0.6,
        "forma": "rectangular"
       },
       {
        "eje": "18/L",
        "centro": {
         "x": 13.06,
         "y": 19.05
        },
        "b": 0.3,
        "h": 0.6,
        "forma": "rectangular"
       },
       {
        "eje": "18/O",
        "centro": {
         "x": 16.3,
         "y": 19.05
        },
        "b": 0.3,
        "h": 0.6,
        "forma": "rectangular"
       },
       {
        "eje": null,
        "centro": {
         "x": 19.95,
         "y": 14.82
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 18.37,
         "y": 18.99
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.6,
         "y": 18.99
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16,
         "y": 18.99
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.36,
         "y": 18.99
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 12.76,
         "y": 18.99
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 7.99,
         "y": 18.99
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 10.37,
         "y": 18.99
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 7.39,
         "y": 18.82
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 3.63,
         "y": 18.82
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 5.51,
         "y": 18.82
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 7.61,
         "y": 18.3
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 4.88,
         "y": 15.26
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 19.57,
         "y": 12.48
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16,
         "y": 12.48
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.36,
         "y": 12.48
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 12.76,
         "y": 12.48
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 7.99,
         "y": 12.48
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 10.27,
         "y": 12.48
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 19.95,
         "y": 12.12
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 19.95,
         "y": 8.64
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 19.95,
         "y": 2.53
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.38,
         "y": 6.7
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.72,
         "y": 6.76
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 7.61,
         "y": 6.7
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 11.21,
         "y": 2.21
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 11.21,
         "y": 4.52
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.72,
         "y": 4.52
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.38,
         "y": 4.52
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 9.41,
         "y": 2.15
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 15.09,
         "y": 2.15
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 18.43,
         "y": 2.15
        },
        "b": 0.31,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 7.99,
         "y": 2.15
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 3.73,
         "y": 2.15
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 5.59,
         "y": 2.15
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 7.61,
         "y": 2.83
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 7.61,
         "y": 4.8
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 10.21,
         "y": 6.82
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 2.15,
         "y": 3.73
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 2.15,
         "y": 12.12
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 2.15,
         "y": 6.57
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 2.15,
         "y": 9.28
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.38,
         "y": 2.83
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 2.53,
         "y": 12.48
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 5.59,
         "y": 12.48
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 19.95,
         "y": 17.4
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 7.55,
         "y": 15.26
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 2.21,
         "y": 15.26
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 11.21,
         "y": 6.7
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 18.4,
         "y": 12.48
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 10.21,
         "y": 9.68
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    },
    {
     "id": "vista-05",
     "nivel": null,
     "categorias": {
      "ejes": [
       {
        "nombre": "I",
        "p": {
         "x": 8.8,
         "y": 23
        },
        "q": {
         "x": 8.8,
         "y": 0
        }
       },
       {
        "nombre": "L",
        "p": {
         "x": 14.16,
         "y": 23
        },
        "q": {
         "x": 14.16,
         "y": 0
        }
       },
       {
        "nombre": "O",
        "p": {
         "x": 17.4,
         "y": 23
        },
        "q": {
         "x": 17.4,
         "y": 0
        }
       },
       {
        "nombre": "Q",
        "p": {
         "x": 21.13,
         "y": 23
        },
        "q": {
         "x": 21.13,
         "y": 0
        }
       },
       {
        "nombre": "25",
        "p": {
         "x": 0,
         "y": 3
        },
        "q": {
         "x": 24.3,
         "y": 3
        }
       },
       {
        "nombre": "18",
        "p": {
         "x": 0,
         "y": 20
        },
        "q": {
         "x": 24.3,
         "y": 20
        }
       },
       {
        "nombre": "21",
        "p": {
         "x": 0,
         "y": 13.5
        },
        "q": {
         "x": 24.3,
         "y": 13.5
        }
       }
      ],
      "columnas": [
       {
        "eje": "25/I",
        "centro": {
         "x": 8.8,
         "y": 3
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "rectangular"
       },
       {
        "eje": "25/Q",
        "centro": {
         "x": 21.13,
         "y": 3
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "rectangular"
       },
       {
        "eje": "21/I",
        "centro": {
         "x": 8.8,
         "y": 13.5
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "rectangular"
       },
       {
        "eje": "18/I",
        "centro": {
         "x": 8.8,
         "y": 20
        },
        "b": 0.33,
        "h": 0.63,
        "forma": "rectangular"
       },
       {
        "eje": "18/Q",
        "centro": {
         "x": 21.13,
         "y": 20
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "rectangular"
       },
       {
        "eje": null,
        "centro": {
         "x": 4.73,
         "y": 19.75
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.49,
         "y": 19.75
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 3.31,
         "y": 16.19
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.65,
         "y": 16.19
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.71,
         "y": 19.23
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 9.09,
         "y": 19.92
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 12.09,
         "y": 19.92
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 15.09,
         "y": 19.92
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 18.09,
         "y": 19.92
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 21.05,
         "y": 17.86
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 21.05,
         "y": 15.87
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 21.05,
         "y": 9.45
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 21.05,
         "y": 6.37
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 18.09,
         "y": 3.08
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 15.09,
         "y": 3.08
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 12.09,
         "y": 3.08
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 6.09,
         "y": 3.08
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 4.16,
         "y": 13.58
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.71,
         "y": 15.98
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 3.31,
         "y": 3.08
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 3.25,
         "y": 18.53
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    },
    {
     "id": "vista-06",
     "nivel": 2,
     "categorias": {
      "ejes": [
       {
        "nombre": "G",
        "p": {
         "x": 2.08,
         "y": 0
        },
        "q": {
         "x": 2.08,
         "y": 21.13
        }
       },
       {
        "nombre": "P",
        "p": {
         "x": 20.02,
         "y": 0
        },
        "q": {
         "x": 20.02,
         "y": 21.13
        }
       },
       {
        "nombre": "I",
        "p": {
         "x": 7.69,
         "y": 0
        },
        "q": {
         "x": 7.69,
         "y": 21.13
        }
       },
       {
        "nombre": "L",
        "p": {
         "x": 13.06,
         "y": 0
        },
        "q": {
         "x": 13.06,
         "y": 21.13
        }
       },
       {
        "nombre": "O",
        "p": {
         "x": 16.3,
         "y": 0
        },
        "q": {
         "x": 16.3,
         "y": 21.13
        }
       },
       {
        "nombre": "18",
        "p": {
         "x": 22.1,
         "y": 19.05
        },
        "q": {
         "x": 0,
         "y": 19.05
        }
       },
       {
        "nombre": "25",
        "p": {
         "x": 22.1,
         "y": 2.08
        },
        "q": {
         "x": 0,
         "y": 2.08
        }
       },
       {
        "nombre": "21",
        "p": {
         "x": 22.1,
         "y": 12.57
        },
        "q": {
         "x": 0,
         "y": 12.57
        }
       }
      ],
      "columnas": [
       {
        "eje": "25/I",
        "centro": {
         "x": 7.69,
         "y": 2.08
        },
        "b": 0.3,
        "h": 0.6,
        "forma": "rectangular"
       },
       {
        "eje": "25/L",
        "centro": {
         "x": 13.06,
         "y": 2.08
        },
        "b": 0.3,
        "h": 0.6,
        "forma": "rectangular"
       },
       {
        "eje": "25/O",
        "centro": {
         "x": 16.3,
         "y": 2.08
        },
        "b": 0.3,
        "h": 0.6,
        "forma": "rectangular"
       },
       {
        "eje": "25/P",
        "centro": {
         "x": 20.02,
         "y": 2.08
        },
        "b": 1.4,
        "h": 0.3,
        "forma": "rectangular"
       },
       {
        "eje": "25/G",
        "centro": {
         "x": 2.08,
         "y": 2.08
        },
        "b": 1.5,
        "h": 1.5,
        "forma": "L"
       },
       {
        "eje": "21/G",
        "centro": {
         "x": 2.08,
         "y": 12.57
        },
        "b": 0.3,
        "h": 0.6,
        "forma": "rectangular"
       },
       {
        "eje": "21/I",
        "centro": {
         "x": 7.69,
         "y": 12.57
        },
        "b": 0.3,
        "h": 0.6,
        "forma": "rectangular"
       },
       {
        "eje": "21/L",
        "centro": {
         "x": 13.06,
         "y": 12.57
        },
        "b": 0.3,
        "h": 0.6,
        "forma": "rectangular"
       },
       {
        "eje": "21/O",
        "centro": {
         "x": 16.3,
         "y": 12.57
        },
        "b": 0.3,
        "h": 0.6,
        "forma": "rectangular"
       },
       {
        "eje": "21/P",
        "centro": {
         "x": 20.02,
         "y": 12.57
        },
        "b": 0.3,
        "h": 0.6,
        "forma": "rectangular"
       },
       {
        "eje": "18/P",
        "centro": {
         "x": 20.02,
         "y": 19.05
        },
        "b": 1.5,
        "h": 1.5,
        "forma": "L"
       },
       {
        "eje": "18/G",
        "centro": {
         "x": 2.08,
         "y": 19.05
        },
        "b": 1.4,
        "h": 0.3,
        "forma": "rectangular"
       },
       {
        "eje": "18/I",
        "centro": {
         "x": 7.69,
         "y": 19.05
        },
        "b": 0.3,
        "h": 0.6,
        "forma": "rectangular"
       },
       {
        "eje": "18/L",
        "centro": {
         "x": 13.06,
         "y": 19.05
        },
        "b": 0.3,
        "h": 0.6,
        "forma": "rectangular"
       },
       {
        "eje": "18/O",
        "centro": {
         "x": 16.3,
         "y": 19.05
        },
        "b": 0.3,
        "h": 0.6,
        "forma": "rectangular"
       },
       {
        "eje": null,
        "centro": {
         "x": 18.37,
         "y": 18.99
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.6,
         "y": 18.99
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16,
         "y": 18.99
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.36,
         "y": 18.99
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 12.76,
         "y": 18.99
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 7.99,
         "y": 18.99
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 10.37,
         "y": 18.99
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 7.39,
         "y": 18.82
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 3.63,
         "y": 18.82
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 5.51,
         "y": 18.82
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 19.95,
         "y": 13.02
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 18.92,
         "y": 13.86
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 19.89,
         "y": 13.86
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.6,
         "y": 12.48
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16,
         "y": 12.48
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.36,
         "y": 12.48
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.03,
         "y": 13.91
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.04,
         "y": 13.91
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 14.47,
         "y": 13.97
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 14.47,
         "y": 18.93
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 14.47,
         "y": 16.45
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 19.95,
         "y": 17.4
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 19.95,
         "y": 15.6
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 7.61,
         "y": 18.3
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 3.22,
         "y": 15.26
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 5.44,
         "y": 15.26
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 7.61,
         "y": 15.32
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 7.61,
         "y": 13.02
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 7.99,
         "y": 12.65
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 10.63,
         "y": 12.65
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 10.69,
         "y": 10.19
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 7.67,
         "y": 10.19
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 12.97,
         "y": 12.12
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 12.97,
         "y": 10.64
        },
        "b": 0.13,
        "h": 0.43,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.03,
         "y": 8.94
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 18.66,
         "y": 8.94
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.38,
         "y": 8.94
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.38,
         "y": 9.67
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 19.87,
         "y": 8.94
        },
        "b": 0.3,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 19.95,
         "y": 2.53
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 19.95,
         "y": 7.34
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 18.92,
         "y": 7.28
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 18.45,
         "y": 2.15
        },
        "b": 0.28,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.6,
         "y": 2.15
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 17.38,
         "y": 2.21
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 17.38,
         "y": 7.22
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 17.38,
         "y": 4.71
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 19.95,
         "y": 4.93
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.6,
         "y": 7.28
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 11.48,
         "y": 7.28
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 14.82,
         "y": 7.28
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.14,
         "y": 2.83
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.14,
         "y": 7.28
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.14,
         "y": 5.08
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 7.61,
         "y": 2.83
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 7.61,
         "y": 5.11
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 5.85,
         "y": 9.63
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 7.61,
         "y": 9.63
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 7.61,
         "y": 7.37
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 6.37,
         "y": 5.11
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.36,
         "y": 2.15
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 12.76,
         "y": 2.15
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 7.99,
         "y": 2.15
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 10.37,
         "y": 2.15
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 7.39,
         "y": 2.15
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 3.73,
         "y": 2.15
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 5.15,
         "y": 2.21
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 4.19,
         "y": 8.47
        },
        "b": 0.13,
        "h": 0.33,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 5.79,
         "y": 8.47
        },
        "b": 0.13,
        "h": 0.33,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 5.15,
         "y": 8.31
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 5.15,
         "y": 5.26
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 4.13,
         "y": 9.63
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 2.15,
         "y": 12.12
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 2.21,
         "y": 9.63
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 3.73,
         "y": 5.21
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 2.21,
         "y": 5.21
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 2.15,
         "y": 7.42
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 2.15,
         "y": 3.73
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 19.95,
         "y": 12.05
        },
        "b": 0.13,
        "h": 0.38,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 18.66,
         "y": 12.48
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    },
    {
     "id": "vista-07",
     "nivel": null,
     "categorias": {
      "ejes": [
       {
        "nombre": "G",
        "p": {
         "x": 2.08,
         "y": 0
        },
        "q": {
         "x": 2.08,
         "y": 21.43
        }
       },
       {
        "nombre": "P",
        "p": {
         "x": 20.02,
         "y": 0
        },
        "q": {
         "x": 20.02,
         "y": 21.43
        }
       },
       {
        "nombre": "I",
        "p": {
         "x": 7.69,
         "y": 0
        },
        "q": {
         "x": 7.69,
         "y": 21.43
        }
       },
       {
        "nombre": "L",
        "p": {
         "x": 13.06,
         "y": 0
        },
        "q": {
         "x": 13.06,
         "y": 21.43
        }
       },
       {
        "nombre": "O",
        "p": {
         "x": 16.3,
         "y": 0
        },
        "q": {
         "x": 16.3,
         "y": 21.43
        }
       },
       {
        "nombre": "18",
        "p": {
         "x": 22.1,
         "y": 19.35
        },
        "q": {
         "x": 0,
         "y": 19.35
        }
       },
       {
        "nombre": "25",
        "p": {
         "x": 22.1,
         "y": 2.38
        },
        "q": {
         "x": 0,
         "y": 2.38
        }
       },
       {
        "nombre": "21",
        "p": {
         "x": 22.1,
         "y": 12.87
        },
        "q": {
         "x": 0,
         "y": 12.87
        }
       }
      ],
      "columnas": [
       {
        "eje": "25/I",
        "centro": {
         "x": 7.69,
         "y": 2.38
        },
        "b": 0.3,
        "h": 0.6,
        "forma": "rectangular"
       },
       {
        "eje": "25/L",
        "centro": {
         "x": 13.06,
         "y": 2.38
        },
        "b": 0.3,
        "h": 0.6,
        "forma": "rectangular"
       },
       {
        "eje": "25/O",
        "centro": {
         "x": 16.3,
         "y": 2.38
        },
        "b": 0.3,
        "h": 0.6,
        "forma": "rectangular"
       },
       {
        "eje": "25/P",
        "centro": {
         "x": 20.02,
         "y": 2.38
        },
        "b": 1.4,
        "h": 0.3,
        "forma": "rectangular"
       },
       {
        "eje": "25/G",
        "centro": {
         "x": 2.08,
         "y": 2.38
        },
        "b": 1.5,
        "h": 1.5,
        "forma": "L"
       },
       {
        "eje": "21/G",
        "centro": {
         "x": 2.08,
         "y": 12.87
        },
        "b": 0.3,
        "h": 0.6,
        "forma": "rectangular"
       },
       {
        "eje": "21/I",
        "centro": {
         "x": 7.69,
         "y": 12.87
        },
        "b": 0.3,
        "h": 0.6,
        "forma": "rectangular"
       },
       {
        "eje": "21/L",
        "centro": {
         "x": 13.06,
         "y": 12.87
        },
        "b": 0.3,
        "h": 0.6,
        "forma": "rectangular"
       },
       {
        "eje": "21/O",
        "centro": {
         "x": 16.3,
         "y": 12.87
        },
        "b": 0.3,
        "h": 0.6,
        "forma": "rectangular"
       },
       {
        "eje": "21/P",
        "centro": {
         "x": 20.02,
         "y": 12.87
        },
        "b": 0.3,
        "h": 0.6,
        "forma": "rectangular"
       },
       {
        "eje": "18/P",
        "centro": {
         "x": 20.02,
         "y": 19.35
        },
        "b": 1.5,
        "h": 1.5,
        "forma": "L"
       },
       {
        "eje": "18/G",
        "centro": {
         "x": 2.08,
         "y": 19.35
        },
        "b": 1.4,
        "h": 0.3,
        "forma": "rectangular"
       },
       {
        "eje": "18/I",
        "centro": {
         "x": 7.69,
         "y": 19.35
        },
        "b": 0.3,
        "h": 0.6,
        "forma": "rectangular"
       },
       {
        "eje": "18/L",
        "centro": {
         "x": 13.06,
         "y": 19.35
        },
        "b": 0.3,
        "h": 0.6,
        "forma": "rectangular"
       },
       {
        "eje": "18/O",
        "centro": {
         "x": 16.3,
         "y": 19.35
        },
        "b": 0.3,
        "h": 0.6,
        "forma": "rectangular"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    },
    {
     "id": "vista-08",
     "nivel": null,
     "categorias": {
      "ejes": [
       {
        "nombre": "G",
        "p": {
         "x": 2.08,
         "y": 0
        },
        "q": {
         "x": 2.08,
         "y": 21.13
        }
       },
       {
        "nombre": "P",
        "p": {
         "x": 20.02,
         "y": 0
        },
        "q": {
         "x": 20.02,
         "y": 21.13
        }
       },
       {
        "nombre": "I",
        "p": {
         "x": 7.69,
         "y": 0
        },
        "q": {
         "x": 7.69,
         "y": 21.13
        }
       },
       {
        "nombre": "L",
        "p": {
         "x": 13.06,
         "y": 0
        },
        "q": {
         "x": 13.06,
         "y": 21.13
        }
       },
       {
        "nombre": "O",
        "p": {
         "x": 16.3,
         "y": 0
        },
        "q": {
         "x": 16.3,
         "y": 21.13
        }
       },
       {
        "nombre": "18",
        "p": {
         "x": 22.1,
         "y": 19.05
        },
        "q": {
         "x": 0,
         "y": 19.05
        }
       },
       {
        "nombre": "25",
        "p": {
         "x": 22.1,
         "y": 2.08
        },
        "q": {
         "x": 0,
         "y": 2.08
        }
       },
       {
        "nombre": "21",
        "p": {
         "x": 22.1,
         "y": 12.57
        },
        "q": {
         "x": 0,
         "y": 12.57
        }
       }
      ],
      "columnas": [
       {
        "eje": "25/I",
        "centro": {
         "x": 7.69,
         "y": 2.08
        },
        "b": 0.3,
        "h": 0.6,
        "forma": "rectangular"
       },
       {
        "eje": "25/L",
        "centro": {
         "x": 13.06,
         "y": 2.08
        },
        "b": 0.3,
        "h": 0.6,
        "forma": "rectangular"
       },
       {
        "eje": "25/O",
        "centro": {
         "x": 16.3,
         "y": 2.08
        },
        "b": 0.3,
        "h": 0.6,
        "forma": "rectangular"
       },
       {
        "eje": "25/P",
        "centro": {
         "x": 20.02,
         "y": 2.08
        },
        "b": 1.4,
        "h": 0.3,
        "forma": "rectangular"
       },
       {
        "eje": "25/G",
        "centro": {
         "x": 2.08,
         "y": 2.08
        },
        "b": 1.5,
        "h": 1.5,
        "forma": "L"
       },
       {
        "eje": "21/G",
        "centro": {
         "x": 2.08,
         "y": 12.57
        },
        "b": 0.3,
        "h": 0.6,
        "forma": "rectangular"
       },
       {
        "eje": "21/I",
        "centro": {
         "x": 7.69,
         "y": 12.57
        },
        "b": 0.3,
        "h": 0.6,
        "forma": "rectangular"
       },
       {
        "eje": "21/L",
        "centro": {
         "x": 13.06,
         "y": 12.57
        },
        "b": 0.3,
        "h": 0.6,
        "forma": "rectangular"
       },
       {
        "eje": "21/O",
        "centro": {
         "x": 16.3,
         "y": 12.57
        },
        "b": 0.3,
        "h": 0.6,
        "forma": "rectangular"
       },
       {
        "eje": "21/P",
        "centro": {
         "x": 20.02,
         "y": 12.57
        },
        "b": 0.3,
        "h": 0.6,
        "forma": "rectangular"
       },
       {
        "eje": "18/P",
        "centro": {
         "x": 20.02,
         "y": 19.05
        },
        "b": 1.5,
        "h": 1.5,
        "forma": "L"
       },
       {
        "eje": "18/G",
        "centro": {
         "x": 2.08,
         "y": 19.05
        },
        "b": 1.4,
        "h": 0.3,
        "forma": "rectangular"
       },
       {
        "eje": "18/I",
        "centro": {
         "x": 7.69,
         "y": 19.05
        },
        "b": 0.3,
        "h": 0.6,
        "forma": "rectangular"
       },
       {
        "eje": "18/L",
        "centro": {
         "x": 13.06,
         "y": 19.05
        },
        "b": 0.3,
        "h": 0.6,
        "forma": "rectangular"
       },
       {
        "eje": "18/O",
        "centro": {
         "x": 16.3,
         "y": 19.05
        },
        "b": 0.3,
        "h": 0.6,
        "forma": "rectangular"
       },
       {
        "eje": null,
        "centro": {
         "x": 19.95,
         "y": 14.82
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 18.37,
         "y": 18.99
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.6,
         "y": 18.99
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16,
         "y": 18.99
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.36,
         "y": 18.99
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 12.76,
         "y": 18.99
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 7.99,
         "y": 18.99
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 10.37,
         "y": 18.99
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 7.39,
         "y": 18.82
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 3.63,
         "y": 18.82
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 5.51,
         "y": 18.82
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 7.61,
         "y": 18.3
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 4.88,
         "y": 15.26
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 19.57,
         "y": 12.48
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16,
         "y": 12.48
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.36,
         "y": 12.48
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 12.76,
         "y": 12.48
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 7.99,
         "y": 12.48
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 10.27,
         "y": 12.48
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 19.95,
         "y": 12.12
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 19.95,
         "y": 8.64
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 19.95,
         "y": 2.53
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.38,
         "y": 6.7
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.72,
         "y": 6.76
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 7.61,
         "y": 6.7
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 11.21,
         "y": 2.21
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 11.21,
         "y": 4.52
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.72,
         "y": 4.52
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.38,
         "y": 4.52
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 9.41,
         "y": 2.15
        },
        "b": 0.2,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 15.09,
         "y": 2.15
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 18.43,
         "y": 2.15
        },
        "b": 0.31,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 7.99,
         "y": 2.15
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 3.73,
         "y": 2.15
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 5.59,
         "y": 2.15
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 7.61,
         "y": 2.83
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 7.61,
         "y": 4.8
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 10.21,
         "y": 6.82
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 2.15,
         "y": 3.73
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 2.15,
         "y": 12.12
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 2.15,
         "y": 6.57
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 2.15,
         "y": 9.28
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.38,
         "y": 2.83
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 2.53,
         "y": 12.48
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 5.59,
         "y": 12.48
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 19.95,
         "y": 17.4
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 7.55,
         "y": 15.26
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 2.21,
         "y": 15.26
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 11.21,
         "y": 6.7
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 18.4,
         "y": 12.48
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 10.21,
         "y": 9.68
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    },
    {
     "id": "vista-09",
     "nivel": 2,
     "categorias": {
      "ejes": [
       {
        "nombre": "G",
        "p": {
         "x": 2.08,
         "y": 0
        },
        "q": {
         "x": 2.08,
         "y": 21.13
        }
       },
       {
        "nombre": "P",
        "p": {
         "x": 20.02,
         "y": 0
        },
        "q": {
         "x": 20.02,
         "y": 21.13
        }
       },
       {
        "nombre": "I",
        "p": {
         "x": 7.69,
         "y": 0
        },
        "q": {
         "x": 7.69,
         "y": 21.13
        }
       },
       {
        "nombre": "L",
        "p": {
         "x": 13.06,
         "y": 0
        },
        "q": {
         "x": 13.06,
         "y": 21.13
        }
       },
       {
        "nombre": "O",
        "p": {
         "x": 16.3,
         "y": 0
        },
        "q": {
         "x": 16.3,
         "y": 21.13
        }
       },
       {
        "nombre": "18",
        "p": {
         "x": 22.1,
         "y": 19.05
        },
        "q": {
         "x": 0,
         "y": 19.05
        }
       },
       {
        "nombre": "25",
        "p": {
         "x": 22.1,
         "y": 2.08
        },
        "q": {
         "x": 0,
         "y": 2.08
        }
       },
       {
        "nombre": "21",
        "p": {
         "x": 22.1,
         "y": 12.57
        },
        "q": {
         "x": 0,
         "y": 12.57
        }
       }
      ],
      "columnas": [
       {
        "eje": "25/I",
        "centro": {
         "x": 7.69,
         "y": 2.08
        },
        "b": 0.3,
        "h": 0.6,
        "forma": "rectangular"
       },
       {
        "eje": "25/L",
        "centro": {
         "x": 13.06,
         "y": 2.08
        },
        "b": 0.3,
        "h": 0.6,
        "forma": "rectangular"
       },
       {
        "eje": "25/O",
        "centro": {
         "x": 16.3,
         "y": 2.08
        },
        "b": 0.3,
        "h": 0.6,
        "forma": "rectangular"
       },
       {
        "eje": "25/P",
        "centro": {
         "x": 20.02,
         "y": 2.08
        },
        "b": 1.4,
        "h": 0.3,
        "forma": "rectangular"
       },
       {
        "eje": "25/G",
        "centro": {
         "x": 2.08,
         "y": 2.08
        },
        "b": 1.5,
        "h": 1.5,
        "forma": "L"
       },
       {
        "eje": "21/G",
        "centro": {
         "x": 2.08,
         "y": 12.57
        },
        "b": 0.3,
        "h": 0.6,
        "forma": "rectangular"
       },
       {
        "eje": "21/I",
        "centro": {
         "x": 7.69,
         "y": 12.57
        },
        "b": 0.3,
        "h": 0.6,
        "forma": "rectangular"
       },
       {
        "eje": "21/L",
        "centro": {
         "x": 13.06,
         "y": 12.57
        },
        "b": 0.3,
        "h": 0.6,
        "forma": "rectangular"
       },
       {
        "eje": "21/O",
        "centro": {
         "x": 16.3,
         "y": 12.57
        },
        "b": 0.3,
        "h": 0.6,
        "forma": "rectangular"
       },
       {
        "eje": "21/P",
        "centro": {
         "x": 20.02,
         "y": 12.57
        },
        "b": 0.3,
        "h": 0.6,
        "forma": "rectangular"
       },
       {
        "eje": "18/P",
        "centro": {
         "x": 20.02,
         "y": 19.05
        },
        "b": 1.5,
        "h": 1.5,
        "forma": "L"
       },
       {
        "eje": "18/G",
        "centro": {
         "x": 2.08,
         "y": 19.05
        },
        "b": 1.4,
        "h": 0.3,
        "forma": "rectangular"
       },
       {
        "eje": "18/I",
        "centro": {
         "x": 7.69,
         "y": 19.05
        },
        "b": 0.3,
        "h": 0.6,
        "forma": "rectangular"
       },
       {
        "eje": "18/L",
        "centro": {
         "x": 13.06,
         "y": 19.05
        },
        "b": 0.3,
        "h": 0.6,
        "forma": "rectangular"
       },
       {
        "eje": "18/O",
        "centro": {
         "x": 16.3,
         "y": 19.05
        },
        "b": 0.3,
        "h": 0.6,
        "forma": "rectangular"
       },
       {
        "eje": null,
        "centro": {
         "x": 18.37,
         "y": 18.99
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.6,
         "y": 18.99
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16,
         "y": 18.99
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.36,
         "y": 18.99
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 12.76,
         "y": 18.99
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 7.99,
         "y": 18.99
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 10.37,
         "y": 18.99
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 7.39,
         "y": 18.82
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 3.63,
         "y": 18.82
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 5.51,
         "y": 18.82
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 19.95,
         "y": 13.02
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 18.92,
         "y": 13.86
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 19.89,
         "y": 13.86
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.6,
         "y": 12.48
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16,
         "y": 12.48
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.36,
         "y": 12.48
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.03,
         "y": 13.91
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.04,
         "y": 13.91
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 14.47,
         "y": 13.97
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 14.47,
         "y": 18.93
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 14.47,
         "y": 16.45
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 19.95,
         "y": 17.4
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 19.95,
         "y": 15.6
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 7.61,
         "y": 18.3
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 3.22,
         "y": 15.26
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 5.44,
         "y": 15.26
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 7.61,
         "y": 15.32
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 7.61,
         "y": 13.02
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 7.99,
         "y": 12.65
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 10.63,
         "y": 12.65
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 10.69,
         "y": 10.19
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 7.67,
         "y": 10.19
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 12.97,
         "y": 12.12
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 12.97,
         "y": 10.64
        },
        "b": 0.13,
        "h": 0.43,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.03,
         "y": 8.94
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 18.66,
         "y": 8.94
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.38,
         "y": 8.94
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.38,
         "y": 9.67
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 19.87,
         "y": 8.94
        },
        "b": 0.3,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 19.95,
         "y": 2.53
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 19.95,
         "y": 7.34
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 18.92,
         "y": 7.28
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 18.45,
         "y": 2.15
        },
        "b": 0.28,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.6,
         "y": 2.15
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 17.38,
         "y": 2.21
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 17.38,
         "y": 7.22
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 17.38,
         "y": 4.71
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 19.95,
         "y": 4.93
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.6,
         "y": 7.28
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 11.48,
         "y": 7.28
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 14.82,
         "y": 7.28
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.14,
         "y": 2.83
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.14,
         "y": 7.28
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.14,
         "y": 5.08
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 7.61,
         "y": 2.83
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 7.61,
         "y": 5.11
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 5.85,
         "y": 9.63
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 7.61,
         "y": 9.63
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 7.61,
         "y": 7.37
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 6.37,
         "y": 5.11
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.36,
         "y": 2.15
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 12.76,
         "y": 2.15
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 7.99,
         "y": 2.15
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 10.37,
         "y": 2.15
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 7.39,
         "y": 2.15
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 3.73,
         "y": 2.15
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 5.15,
         "y": 2.21
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 4.19,
         "y": 8.47
        },
        "b": 0.13,
        "h": 0.33,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 5.79,
         "y": 8.47
        },
        "b": 0.13,
        "h": 0.33,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 5.15,
         "y": 8.31
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 5.15,
         "y": 5.26
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 4.13,
         "y": 9.63
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 2.15,
         "y": 12.12
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 2.21,
         "y": 9.63
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 3.73,
         "y": 5.21
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 2.21,
         "y": 5.21
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 2.15,
         "y": 7.42
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 2.15,
         "y": 3.73
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 19.95,
         "y": 12.05
        },
        "b": 0.13,
        "h": 0.38,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 18.66,
         "y": 12.48
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    },
    {
     "id": "vista-10",
     "nivel": 3,
     "categorias": {
      "ejes": [
       {
        "nombre": "G",
        "p": {
         "x": 2.08,
         "y": 0
        },
        "q": {
         "x": 2.08,
         "y": 21.13
        }
       },
       {
        "nombre": "P",
        "p": {
         "x": 20.02,
         "y": 0
        },
        "q": {
         "x": 20.02,
         "y": 21.13
        }
       },
       {
        "nombre": "I",
        "p": {
         "x": 7.69,
         "y": 0
        },
        "q": {
         "x": 7.69,
         "y": 21.13
        }
       },
       {
        "nombre": "L",
        "p": {
         "x": 13.06,
         "y": 0
        },
        "q": {
         "x": 13.06,
         "y": 21.13
        }
       },
       {
        "nombre": "O",
        "p": {
         "x": 16.3,
         "y": 0
        },
        "q": {
         "x": 16.3,
         "y": 21.13
        }
       },
       {
        "nombre": "18",
        "p": {
         "x": 22.1,
         "y": 19.05
        },
        "q": {
         "x": 0,
         "y": 19.05
        }
       },
       {
        "nombre": "25",
        "p": {
         "x": 22.1,
         "y": 2.08
        },
        "q": {
         "x": 0,
         "y": 2.08
        }
       },
       {
        "nombre": "21",
        "p": {
         "x": 22.1,
         "y": 12.57
        },
        "q": {
         "x": 0,
         "y": 12.57
        }
       }
      ],
      "columnas": [
       {
        "eje": "25/G",
        "centro": {
         "x": 2.08,
         "y": 2.08
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "rectangular"
       },
       {
        "eje": "25/P",
        "centro": {
         "x": 20.02,
         "y": 2.08
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "rectangular"
       },
       {
        "eje": "21/G",
        "centro": {
         "x": 2.08,
         "y": 12.57
        },
        "b": 0.3,
        "h": 0.6,
        "forma": "rectangular"
       },
       {
        "eje": "21/I",
        "centro": {
         "x": 7.69,
         "y": 12.57
        },
        "b": 0.3,
        "h": 0.6,
        "forma": "rectangular"
       },
       {
        "eje": "18/G",
        "centro": {
         "x": 2.08,
         "y": 19.05
        },
        "b": 1.4,
        "h": 0.3,
        "forma": "rectangular"
       },
       {
        "eje": "18/I",
        "centro": {
         "x": 7.69,
         "y": 19.05
        },
        "b": 0.3,
        "h": 0.6,
        "forma": "rectangular"
       },
       {
        "eje": "18/P",
        "centro": {
         "x": 20.02,
         "y": 19.05
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "rectangular"
       },
       {
        "eje": null,
        "centro": {
         "x": 5.21,
         "y": 2.15
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.21,
         "y": 2.15
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 11.21,
         "y": 2.15
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 14.21,
         "y": 2.15
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 17.21,
         "y": 2.15
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 19.95,
         "y": 5.16
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 19.95,
         "y": 13.84
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 19.95,
         "y": 16.38
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 3.07,
         "y": 12.65
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 5.3,
         "y": 12.65
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 3.01,
         "y": 15.2
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 7.56,
         "y": 15.26
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 7.41,
         "y": 18.82
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 3.65,
         "y": 18.82
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 5.53,
         "y": 18.82
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 7.62,
         "y": 18.3
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 7.62,
         "y": 13.02
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 2.16,
         "y": 17.6
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 2.16,
         "y": 15.32
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 5.26,
         "y": 15.26
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 7.41,
         "y": 12.65
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.01,
         "y": 18.99
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 11.01,
         "y": 18.99
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 14.01,
         "y": 18.99
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 17.01,
         "y": 18.99
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    },
    {
     "id": "vista-11",
     "nivel": 1,
     "categorias": {
      "ejes": [
       {
        "nombre": "G",
        "p": {
         "x": 2.08,
         "y": 0
        },
        "q": {
         "x": 2.08,
         "y": 21.13
        }
       },
       {
        "nombre": "P",
        "p": {
         "x": 20.02,
         "y": 0
        },
        "q": {
         "x": 20.02,
         "y": 21.13
        }
       },
       {
        "nombre": "I",
        "p": {
         "x": 7.69,
         "y": 0
        },
        "q": {
         "x": 7.69,
         "y": 21.13
        }
       },
       {
        "nombre": "L",
        "p": {
         "x": 13.06,
         "y": 0
        },
        "q": {
         "x": 13.06,
         "y": 21.13
        }
       },
       {
        "nombre": "O",
        "p": {
         "x": 16.3,
         "y": 0
        },
        "q": {
         "x": 16.3,
         "y": 21.13
        }
       },
       {
        "nombre": "18",
        "p": {
         "x": 22.1,
         "y": 19.05
        },
        "q": {
         "x": 0,
         "y": 19.05
        }
       },
       {
        "nombre": "25",
        "p": {
         "x": 22.1,
         "y": 2.08
        },
        "q": {
         "x": 0,
         "y": 2.08
        }
       },
       {
        "nombre": "21",
        "p": {
         "x": 22.1,
         "y": 12.57
        },
        "q": {
         "x": 0,
         "y": 12.57
        }
       }
      ],
      "columnas": [
       {
        "eje": "25/I",
        "centro": {
         "x": 7.69,
         "y": 2.08
        },
        "b": 0.3,
        "h": 0.6,
        "forma": "rectangular"
       },
       {
        "eje": "25/L",
        "centro": {
         "x": 13.06,
         "y": 2.08
        },
        "b": 0.3,
        "h": 0.6,
        "forma": "rectangular"
       },
       {
        "eje": "25/O",
        "centro": {
         "x": 16.3,
         "y": 2.08
        },
        "b": 0.3,
        "h": 0.6,
        "forma": "rectangular"
       },
       {
        "eje": "25/P",
        "centro": {
         "x": 20.02,
         "y": 2.08
        },
        "b": 1.4,
        "h": 0.3,
        "forma": "rectangular"
       },
       {
        "eje": "25/G",
        "centro": {
         "x": 2.08,
         "y": 2.08
        },
        "b": 1.5,
        "h": 1.5,
        "forma": "L"
       },
       {
        "eje": "21/G",
        "centro": {
         "x": 2.08,
         "y": 12.57
        },
        "b": 0.3,
        "h": 0.6,
        "forma": "rectangular"
       },
       {
        "eje": "21/I",
        "centro": {
         "x": 7.69,
         "y": 12.57
        },
        "b": 0.3,
        "h": 0.6,
        "forma": "rectangular"
       },
       {
        "eje": "21/L",
        "centro": {
         "x": 13.06,
         "y": 12.57
        },
        "b": 0.3,
        "h": 0.6,
        "forma": "rectangular"
       },
       {
        "eje": "21/O",
        "centro": {
         "x": 16.3,
         "y": 12.57
        },
        "b": 0.3,
        "h": 0.6,
        "forma": "rectangular"
       },
       {
        "eje": "21/P",
        "centro": {
         "x": 20.02,
         "y": 12.57
        },
        "b": 0.3,
        "h": 0.6,
        "forma": "rectangular"
       },
       {
        "eje": "18/P",
        "centro": {
         "x": 20.02,
         "y": 19.05
        },
        "b": 1.5,
        "h": 1.5,
        "forma": "L"
       },
       {
        "eje": "18/G",
        "centro": {
         "x": 2.08,
         "y": 19.05
        },
        "b": 1.4,
        "h": 0.3,
        "forma": "rectangular"
       },
       {
        "eje": "18/I",
        "centro": {
         "x": 7.69,
         "y": 19.05
        },
        "b": 0.3,
        "h": 0.6,
        "forma": "rectangular"
       },
       {
        "eje": "18/L",
        "centro": {
         "x": 13.06,
         "y": 19.05
        },
        "b": 0.3,
        "h": 0.6,
        "forma": "rectangular"
       },
       {
        "eje": "18/O",
        "centro": {
         "x": 16.3,
         "y": 19.05
        },
        "b": 0.3,
        "h": 0.6,
        "forma": "rectangular"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    },
    {
     "id": "vista-12",
     "nivel": 2,
     "categorias": {
      "ejes": [
       {
        "nombre": "G",
        "p": {
         "x": 2.08,
         "y": 0
        },
        "q": {
         "x": 2.08,
         "y": 21.13
        }
       },
       {
        "nombre": "P",
        "p": {
         "x": 20.02,
         "y": 0
        },
        "q": {
         "x": 20.02,
         "y": 21.13
        }
       },
       {
        "nombre": "I",
        "p": {
         "x": 7.69,
         "y": 0
        },
        "q": {
         "x": 7.69,
         "y": 21.13
        }
       },
       {
        "nombre": "L",
        "p": {
         "x": 13.06,
         "y": 0
        },
        "q": {
         "x": 13.06,
         "y": 21.13
        }
       },
       {
        "nombre": "O",
        "p": {
         "x": 16.3,
         "y": 0
        },
        "q": {
         "x": 16.3,
         "y": 21.13
        }
       },
       {
        "nombre": "18",
        "p": {
         "x": 22.1,
         "y": 19.05
        },
        "q": {
         "x": 0,
         "y": 19.05
        }
       },
       {
        "nombre": "25",
        "p": {
         "x": 22.1,
         "y": 2.08
        },
        "q": {
         "x": 0,
         "y": 2.08
        }
       },
       {
        "nombre": "21",
        "p": {
         "x": 22.1,
         "y": 12.57
        },
        "q": {
         "x": 0,
         "y": 12.57
        }
       }
      ],
      "columnas": [
       {
        "eje": "25/I",
        "centro": {
         "x": 7.69,
         "y": 2.08
        },
        "b": 0.3,
        "h": 0.6,
        "forma": "rectangular"
       },
       {
        "eje": "25/L",
        "centro": {
         "x": 13.06,
         "y": 2.08
        },
        "b": 0.3,
        "h": 0.6,
        "forma": "rectangular"
       },
       {
        "eje": "25/O",
        "centro": {
         "x": 16.3,
         "y": 2.08
        },
        "b": 0.3,
        "h": 0.6,
        "forma": "rectangular"
       },
       {
        "eje": "25/P",
        "centro": {
         "x": 20.02,
         "y": 2.08
        },
        "b": 1.4,
        "h": 0.3,
        "forma": "rectangular"
       },
       {
        "eje": "25/G",
        "centro": {
         "x": 2.08,
         "y": 2.08
        },
        "b": 1.5,
        "h": 1.5,
        "forma": "L"
       },
       {
        "eje": "21/G",
        "centro": {
         "x": 2.08,
         "y": 12.57
        },
        "b": 0.3,
        "h": 0.6,
        "forma": "rectangular"
       },
       {
        "eje": "21/I",
        "centro": {
         "x": 7.69,
         "y": 12.57
        },
        "b": 0.3,
        "h": 0.6,
        "forma": "rectangular"
       },
       {
        "eje": "21/L",
        "centro": {
         "x": 13.06,
         "y": 12.57
        },
        "b": 0.3,
        "h": 0.6,
        "forma": "rectangular"
       },
       {
        "eje": "21/O",
        "centro": {
         "x": 16.3,
         "y": 12.57
        },
        "b": 0.3,
        "h": 0.6,
        "forma": "rectangular"
       },
       {
        "eje": "21/P",
        "centro": {
         "x": 20.02,
         "y": 12.57
        },
        "b": 0.3,
        "h": 0.6,
        "forma": "rectangular"
       },
       {
        "eje": "18/P",
        "centro": {
         "x": 20.02,
         "y": 19.05
        },
        "b": 1.5,
        "h": 1.5,
        "forma": "L"
       },
       {
        "eje": "18/G",
        "centro": {
         "x": 2.08,
         "y": 19.05
        },
        "b": 1.4,
        "h": 0.3,
        "forma": "rectangular"
       },
       {
        "eje": "18/I",
        "centro": {
         "x": 7.69,
         "y": 19.05
        },
        "b": 0.3,
        "h": 0.6,
        "forma": "rectangular"
       },
       {
        "eje": "18/L",
        "centro": {
         "x": 13.06,
         "y": 19.05
        },
        "b": 0.3,
        "h": 0.6,
        "forma": "rectangular"
       },
       {
        "eje": "18/O",
        "centro": {
         "x": 16.3,
         "y": 19.05
        },
        "b": 0.3,
        "h": 0.6,
        "forma": "rectangular"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    }
   ]
  }
 },
 {
  "nombre": "ilo:modulo-05",
  "grupo": "ilo",
  "id": "modulo-05",
  "etiqueta": null,
  "rasgos": {
   "vista": "vista-01",
   "areaAbierta": false,
   "niveles": 2,
   "ejes": {
    "x": 5,
    "y": 2
   },
   "luces": {
    "x": [
     4.74,
     4.32,
     4.32,
     4.58
    ],
    "y": [
     12.27
    ]
   },
   "largo": 17.96,
   "ancho": 12.27,
   "area": 220.41,
   "luzLosa": 4.74,
   "luzMax": 12.27,
   "columnas": 10,
   "tipos": [
    {
     "nombre": "C1",
     "forma": "rectangular",
     "b": 1.03,
     "h": 0.33,
     "n": 8
    },
    {
     "nombre": "PL1",
     "forma": "L",
     "b": 1.53,
     "h": 1.53,
     "n": 2
    }
   ],
   "placas": true,
   "columnetas": 34,
   "techoLiviano": false,
   "cubierta": true,
   "falsoCielo": false,
   "deportivo": false,
   "agua": false,
   "banos": false
  },
  "decisiones": {
   "cimentacion": "platea",
   "cimientoCorrido": true,
   "hz": 0.6,
   "df": 1.5,
   "losa": "aligerada y maciza",
   "espesorLosa": 0.2,
   "plantasDeLosa": 2,
   "vigas": [
    "30x40",
    "30x50",
    "30x85"
   ],
   "fcColumnas": 280,
   "fcColumnetas": 175,
   "estribos": "3/8\": 1@.05, 10@.10",
   "porticos": 7,
   "mallaCimentacion": false,
   "columnasComoArquitectura": true,
   "losaDeTecho": true
  },
  "geometria": {
   "version": 1,
   "unidad": "m",
   "vistas": [
    {
     "id": "vista-01",
     "nivel": null,
     "categorias": {
      "ejes": [
       {
        "nombre": "G",
        "p": {
         "x": 2.56,
         "y": 18.32
        },
        "q": {
         "x": 2.56,
         "y": 0
        }
       },
       {
        "nombre": "11",
        "p": {
         "x": 0,
         "y": 14.9
        },
        "q": {
         "x": 2.56,
         "y": 14.9
        }
       },
       {
        "nombre": "17",
        "p": {
         "x": 0,
         "y": 2.63
        },
        "q": {
         "x": 2.56,
         "y": 2.63
        }
       }
      ],
      "columnas": [
       {
        "eje": "17/G",
        "centro": {
         "x": 2.56,
         "y": 2.63
        },
        "b": 1.53,
        "h": 1.53,
        "forma": "L"
       },
       {
        "eje": "11/G",
        "centro": {
         "x": 2.56,
         "y": 14.9
        },
        "b": 0.33,
        "h": 1.03,
        "forma": "rectangular"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    },
    {
     "id": "vista-02",
     "nivel": null,
     "categorias": {
      "ejes": [
       {
        "nombre": "G",
        "p": {
         "x": 2.1,
         "y": 14.84
        },
        "q": {
         "x": 2.1,
         "y": 0
        }
       },
       {
        "nombre": "Q",
        "p": {
         "x": 20.03,
         "y": 14.84
        },
        "q": {
         "x": 20.03,
         "y": 0
        }
       },
       {
        "nombre": "H",
        "p": {
         "x": 6.82,
         "y": 14.84
        },
        "q": {
         "x": 6.82,
         "y": 0
        }
       },
       {
        "nombre": "K",
        "p": {
         "x": 11.14,
         "y": 14.84
        },
        "q": {
         "x": 11.14,
         "y": 0
        }
       },
       {
        "nombre": "N",
        "p": {
         "x": 15.46,
         "y": 14.84
        },
        "q": {
         "x": 15.46,
         "y": 0
        }
       },
       {
        "nombre": "11",
        "p": {
         "x": 0,
         "y": 13.54
        },
        "q": {
         "x": 21.27,
         "y": 13.54
        }
       },
       {
        "nombre": "17",
        "p": {
         "x": 0,
         "y": 1.3
        },
        "q": {
         "x": 21.27,
         "y": 1.3
        }
       },
       {
        "nombre": "11´",
        "p": {
         "x": 0,
         "y": 7.85
        },
        "q": {
         "x": 21.27,
         "y": 7.85
        }
       }
      ],
      "columnas": [
       {
        "eje": "17/G",
        "centro": {
         "x": 2.1,
         "y": 1.3
        },
        "b": 1.5,
        "h": 1.5,
        "forma": "L"
       },
       {
        "eje": "17/H",
        "centro": {
         "x": 6.82,
         "y": 1.3
        },
        "b": 0.3,
        "h": 1,
        "forma": "rectangular"
       },
       {
        "eje": "17/K",
        "centro": {
         "x": 11.14,
         "y": 1.3
        },
        "b": 0.3,
        "h": 1,
        "forma": "rectangular"
       },
       {
        "eje": "17/N",
        "centro": {
         "x": 15.46,
         "y": 1.3
        },
        "b": 0.3,
        "h": 1,
        "forma": "rectangular"
       },
       {
        "eje": "17/Q",
        "centro": {
         "x": 20.03,
         "y": 1.3
        },
        "b": 0.3,
        "h": 1,
        "forma": "rectangular"
       },
       {
        "eje": "11´/G",
        "centro": {
         "x": 2.1,
         "y": 7.85
        },
        "b": 0.3,
        "h": 0.3,
        "forma": "rectangular"
       },
       {
        "eje": "11´/Q",
        "centro": {
         "x": 20.03,
         "y": 7.85
        },
        "b": 0.3,
        "h": 0.3,
        "forma": "rectangular"
       },
       {
        "eje": "11/G",
        "centro": {
         "x": 2.1,
         "y": 13.54
        },
        "b": 0.3,
        "h": 1,
        "forma": "rectangular"
       },
       {
        "eje": "11/H",
        "centro": {
         "x": 6.82,
         "y": 13.54
        },
        "b": 0.3,
        "h": 1,
        "forma": "rectangular"
       },
       {
        "eje": "11/K",
        "centro": {
         "x": 11.14,
         "y": 13.54
        },
        "b": 0.3,
        "h": 1,
        "forma": "rectangular"
       },
       {
        "eje": "11/N",
        "centro": {
         "x": 15.46,
         "y": 13.54
        },
        "b": 0.3,
        "h": 1,
        "forma": "rectangular"
       },
       {
        "eje": "11/Q",
        "centro": {
         "x": 20.03,
         "y": 13.54
        },
        "b": 1.5,
        "h": 1.5,
        "forma": "L"
       },
       {
        "eje": null,
        "centro": {
         "x": 4.64,
         "y": 7.85
        },
        "b": 0.3,
        "h": 0.3,
        "forma": "columneta"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    },
    {
     "id": "vista-03",
     "nivel": null,
     "categorias": {
      "ejes": [
       {
        "nombre": "G",
        "p": {
         "x": 1.24,
         "y": 15.89
        },
        "q": {
         "x": 1.24,
         "y": 0
        }
       },
       {
        "nombre": "Q",
        "p": {
         "x": 19.18,
         "y": 15.89
        },
        "q": {
         "x": 19.18,
         "y": 0
        }
       },
       {
        "nombre": "H",
        "p": {
         "x": 5.97,
         "y": 15.89
        },
        "q": {
         "x": 5.97,
         "y": 0
        }
       },
       {
        "nombre": "K",
        "p": {
         "x": 10.29,
         "y": 15.89
        },
        "q": {
         "x": 10.29,
         "y": 0
        }
       },
       {
        "nombre": "N",
        "p": {
         "x": 14.61,
         "y": 15.89
        },
        "q": {
         "x": 14.61,
         "y": 0
        }
       },
       {
        "nombre": "11",
        "p": {
         "x": 0,
         "y": 13.54
        },
        "q": {
         "x": 20.42,
         "y": 13.54
        }
       },
       {
        "nombre": "17",
        "p": {
         "x": 0,
         "y": 1.3
        },
        "q": {
         "x": 20.42,
         "y": 1.3
        }
       },
       {
        "nombre": "11´",
        "p": {
         "x": 0,
         "y": 7.85
        },
        "q": {
         "x": 20.42,
         "y": 7.85
        }
       }
      ],
      "columnas": [
       {
        "eje": "17/G",
        "centro": {
         "x": 1.24,
         "y": 1.3
        },
        "b": 1.5,
        "h": 1.5,
        "forma": "L"
       },
       {
        "eje": "17/H",
        "centro": {
         "x": 5.97,
         "y": 1.3
        },
        "b": 0.3,
        "h": 1,
        "forma": "rectangular"
       },
       {
        "eje": "17/K",
        "centro": {
         "x": 10.29,
         "y": 1.3
        },
        "b": 0.3,
        "h": 1,
        "forma": "rectangular"
       },
       {
        "eje": "17/N",
        "centro": {
         "x": 14.61,
         "y": 1.3
        },
        "b": 0.3,
        "h": 1,
        "forma": "rectangular"
       },
       {
        "eje": "17/Q",
        "centro": {
         "x": 19.18,
         "y": 1.3
        },
        "b": 0.3,
        "h": 1,
        "forma": "rectangular"
       },
       {
        "eje": "11´/G",
        "centro": {
         "x": 1.24,
         "y": 7.85
        },
        "b": 0.3,
        "h": 0.3,
        "forma": "rectangular"
       },
       {
        "eje": "11´/Q",
        "centro": {
         "x": 19.18,
         "y": 7.85
        },
        "b": 0.3,
        "h": 0.3,
        "forma": "rectangular"
       },
       {
        "eje": "11/G",
        "centro": {
         "x": 1.24,
         "y": 13.54
        },
        "b": 0.3,
        "h": 1,
        "forma": "rectangular"
       },
       {
        "eje": "11/H",
        "centro": {
         "x": 5.97,
         "y": 13.54
        },
        "b": 0.3,
        "h": 1,
        "forma": "rectangular"
       },
       {
        "eje": "11/K",
        "centro": {
         "x": 10.29,
         "y": 13.54
        },
        "b": 0.3,
        "h": 1,
        "forma": "rectangular"
       },
       {
        "eje": "11/N",
        "centro": {
         "x": 14.61,
         "y": 13.54
        },
        "b": 0.3,
        "h": 1,
        "forma": "rectangular"
       },
       {
        "eje": "11/Q",
        "centro": {
         "x": 19.18,
         "y": 13.54
        },
        "b": 1.5,
        "h": 1.5,
        "forma": "L"
       },
       {
        "eje": null,
        "centro": {
         "x": 2.89,
         "y": 1.37
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 3.87,
         "y": 9.54
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 3.81,
         "y": 10.65
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 5.67,
         "y": 1.37
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 6.27,
         "y": 1.37
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 9.99,
         "y": 1.37
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 10.59,
         "y": 1.37
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 14.91,
         "y": 1.37
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 14.31,
         "y": 1.37
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 18.73,
         "y": 1.37
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 19.11,
         "y": 2.45
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 19.11,
         "y": 11.89
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 19.11,
         "y": 5
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 19.11,
         "y": 10.03
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.13,
         "y": 1.37
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 12.45,
         "y": 1.37
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.82,
         "y": 1.37
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 3.87,
         "y": 8.15
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 3.78,
         "y": 7.85
        },
        "b": 0.3,
        "h": 0.3,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 19.11,
         "y": 7.55
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 19.11,
         "y": 8.15
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 1.37,
         "y": 10.65
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 1.37,
         "y": 8.9
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 3.81,
         "y": 8.9
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 3.87,
         "y": 7.55
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 3.81,
         "y": 6.32
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 1.37,
         "y": 6.32
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 1.31,
         "y": 7.55
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 1.37,
         "y": 4.2
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 3.87,
         "y": 4.26
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 1.31,
         "y": 5.3
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 15.72,
         "y": 13.48
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 14.91,
         "y": 13.48
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 14.32,
         "y": 13.31
        },
        "b": 0.24,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 10.58,
         "y": 13.31
        },
        "b": 0.24,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 9.99,
         "y": 13.31
        },
        "b": 0.24,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 6.26,
         "y": 13.31
        },
        "b": 0.24,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 5.67,
         "y": 13.48
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 1.69,
         "y": 13.48
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 3.93,
         "y": 13.48
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    },
    {
     "id": "vista-04",
     "nivel": 2,
     "categorias": {
      "ejes": [
       {
        "nombre": "G",
        "p": {
         "x": 1.24,
         "y": 15.89
        },
        "q": {
         "x": 1.24,
         "y": 0
        }
       },
       {
        "nombre": "Q",
        "p": {
         "x": 19.18,
         "y": 15.89
        },
        "q": {
         "x": 19.18,
         "y": 0
        }
       },
       {
        "nombre": "H",
        "p": {
         "x": 5.97,
         "y": 15.89
        },
        "q": {
         "x": 5.97,
         "y": 0
        }
       },
       {
        "nombre": "K",
        "p": {
         "x": 10.29,
         "y": 15.89
        },
        "q": {
         "x": 10.29,
         "y": 0
        }
       },
       {
        "nombre": "N",
        "p": {
         "x": 14.61,
         "y": 15.89
        },
        "q": {
         "x": 14.61,
         "y": 0
        }
       },
       {
        "nombre": "11",
        "p": {
         "x": 0,
         "y": 13.54
        },
        "q": {
         "x": 20.42,
         "y": 13.54
        }
       },
       {
        "nombre": "17",
        "p": {
         "x": 0,
         "y": 1.3
        },
        "q": {
         "x": 20.42,
         "y": 1.3
        }
       },
       {
        "nombre": "11´",
        "p": {
         "x": 0,
         "y": 7.85
        },
        "q": {
         "x": 20.42,
         "y": 7.85
        }
       }
      ],
      "columnas": [
       {
        "eje": "17/G",
        "centro": {
         "x": 1.24,
         "y": 1.3
        },
        "b": 1.5,
        "h": 1.5,
        "forma": "L"
       },
       {
        "eje": "17/H",
        "centro": {
         "x": 5.97,
         "y": 1.3
        },
        "b": 0.3,
        "h": 1,
        "forma": "rectangular"
       },
       {
        "eje": "17/K",
        "centro": {
         "x": 10.29,
         "y": 1.3
        },
        "b": 0.3,
        "h": 1,
        "forma": "rectangular"
       },
       {
        "eje": "17/N",
        "centro": {
         "x": 14.61,
         "y": 1.3
        },
        "b": 0.3,
        "h": 1,
        "forma": "rectangular"
       },
       {
        "eje": "17/Q",
        "centro": {
         "x": 19.18,
         "y": 1.3
        },
        "b": 0.3,
        "h": 1,
        "forma": "rectangular"
       },
       {
        "eje": "11´/G",
        "centro": {
         "x": 1.24,
         "y": 7.85
        },
        "b": 0.3,
        "h": 0.3,
        "forma": "rectangular"
       },
       {
        "eje": "11´/Q",
        "centro": {
         "x": 19.18,
         "y": 7.85
        },
        "b": 0.3,
        "h": 0.3,
        "forma": "rectangular"
       },
       {
        "eje": "11/G",
        "centro": {
         "x": 1.24,
         "y": 13.54
        },
        "b": 0.3,
        "h": 1,
        "forma": "rectangular"
       },
       {
        "eje": "11/H",
        "centro": {
         "x": 5.97,
         "y": 13.54
        },
        "b": 0.3,
        "h": 1,
        "forma": "rectangular"
       },
       {
        "eje": "11/K",
        "centro": {
         "x": 10.29,
         "y": 13.54
        },
        "b": 0.3,
        "h": 1,
        "forma": "rectangular"
       },
       {
        "eje": "11/N",
        "centro": {
         "x": 14.61,
         "y": 13.54
        },
        "b": 0.3,
        "h": 1,
        "forma": "rectangular"
       },
       {
        "eje": "11/Q",
        "centro": {
         "x": 19.18,
         "y": 13.54
        },
        "b": 1.5,
        "h": 1.5,
        "forma": "L"
       },
       {
        "eje": null,
        "centro": {
         "x": 17.53,
         "y": 13.48
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 3.81,
         "y": 6.29
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 1.31,
         "y": 2.95
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 1.37,
         "y": 10.14
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 5.67,
         "y": 1.37
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 6.27,
         "y": 1.37
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 9.99,
         "y": 1.37
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 10.59,
         "y": 1.37
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 14.91,
         "y": 1.37
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 14.31,
         "y": 1.37
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 18.73,
         "y": 1.37
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.13,
         "y": 1.37
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 12.45,
         "y": 1.37
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.82,
         "y": 1.37
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 1.31,
         "y": 9.02
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 1.31,
         "y": 11.26
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 3.87,
         "y": 11.75
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 1.31,
         "y": 5.17
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 3.48,
         "y": 7.77
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 3.87,
         "y": 8.15
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 3.81,
         "y": 10.14
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 3.87,
         "y": 7.55
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 3.78,
         "y": 7.85
        },
        "b": 0.3,
        "h": 0.3,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 2.89,
         "y": 1.37
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 3.87,
         "y": 1.43
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 3.87,
         "y": 3.89
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 1.69,
         "y": 7.77
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 1.31,
         "y": 8.15
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 19.11,
         "y": 2.45
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 19.11,
         "y": 11.89
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 19.11,
         "y": 5
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 19.11,
         "y": 10.03
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 19.11,
         "y": 7.55
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 19.11,
         "y": 8.15
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 3.87,
         "y": 13.42
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 5.67,
         "y": 13.48
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 14.32,
         "y": 13.31
        },
        "b": 0.24,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 9.99,
         "y": 13.31
        },
        "b": 0.24,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 10.58,
         "y": 13.31
        },
        "b": 0.24,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 6.26,
         "y": 13.31
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 14.91,
         "y": 13.48
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 1.69,
         "y": 13.48
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    },
    {
     "id": "vista-05",
     "nivel": 3,
     "categorias": {
      "ejes": [
       {
        "nombre": "G",
        "p": {
         "x": 1.24,
         "y": 15.89
        },
        "q": {
         "x": 1.24,
         "y": 0
        }
       },
       {
        "nombre": "Q",
        "p": {
         "x": 19.18,
         "y": 15.89
        },
        "q": {
         "x": 19.18,
         "y": 0
        }
       },
       {
        "nombre": "H",
        "p": {
         "x": 5.97,
         "y": 15.89
        },
        "q": {
         "x": 5.97,
         "y": 0
        }
       },
       {
        "nombre": "K",
        "p": {
         "x": 10.29,
         "y": 15.89
        },
        "q": {
         "x": 10.29,
         "y": 0
        }
       },
       {
        "nombre": "N",
        "p": {
         "x": 14.61,
         "y": 15.89
        },
        "q": {
         "x": 14.61,
         "y": 0
        }
       },
       {
        "nombre": "11",
        "p": {
         "x": 0,
         "y": 13.54
        },
        "q": {
         "x": 20.42,
         "y": 13.54
        }
       },
       {
        "nombre": "17",
        "p": {
         "x": 0,
         "y": 1.3
        },
        "q": {
         "x": 20.42,
         "y": 1.3
        }
       },
       {
        "nombre": "11´",
        "p": {
         "x": 0,
         "y": 7.85
        },
        "q": {
         "x": 20.42,
         "y": 7.85
        }
       }
      ],
      "columnas": [
       {
        "eje": "17/Q",
        "centro": {
         "x": 19.18,
         "y": 1.3
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "rectangular"
       },
       {
        "eje": "11/G",
        "centro": {
         "x": 1.24,
         "y": 13.54
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "rectangular"
       },
       {
        "eje": "11/K",
        "centro": {
         "x": 10.29,
         "y": 13.54
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "rectangular"
       },
       {
        "eje": "11/Q",
        "centro": {
         "x": 19.18,
         "y": 13.54
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "rectangular"
       },
       {
        "eje": null,
        "centro": {
         "x": 4.37,
         "y": 13.48
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 7.37,
         "y": 13.48
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.37,
         "y": 13.48
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.37,
         "y": 13.48
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 19.11,
         "y": 10.35
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 19.11,
         "y": 7.35
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 19.11,
         "y": 4.35
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    },
    {
     "id": "vista-06",
     "nivel": 1,
     "categorias": {
      "ejes": [
       {
        "nombre": "G",
        "p": {
         "x": 1.24,
         "y": 15.89
        },
        "q": {
         "x": 1.24,
         "y": 0
        }
       },
       {
        "nombre": "Q",
        "p": {
         "x": 19.18,
         "y": 15.89
        },
        "q": {
         "x": 19.18,
         "y": 0
        }
       },
       {
        "nombre": "H",
        "p": {
         "x": 5.97,
         "y": 15.89
        },
        "q": {
         "x": 5.97,
         "y": 0
        }
       },
       {
        "nombre": "K",
        "p": {
         "x": 10.29,
         "y": 15.89
        },
        "q": {
         "x": 10.29,
         "y": 0
        }
       },
       {
        "nombre": "N",
        "p": {
         "x": 14.61,
         "y": 15.89
        },
        "q": {
         "x": 14.61,
         "y": 0
        }
       },
       {
        "nombre": "11",
        "p": {
         "x": 0,
         "y": 13.54
        },
        "q": {
         "x": 20.42,
         "y": 13.54
        }
       },
       {
        "nombre": "17",
        "p": {
         "x": 0,
         "y": 1.3
        },
        "q": {
         "x": 20.42,
         "y": 1.3
        }
       },
       {
        "nombre": "11´",
        "p": {
         "x": 0,
         "y": 7.85
        },
        "q": {
         "x": 20.42,
         "y": 7.85
        }
       }
      ],
      "columnas": [
       {
        "eje": "17/G",
        "centro": {
         "x": 1.24,
         "y": 1.3
        },
        "b": 1.5,
        "h": 1.5,
        "forma": "L"
       },
       {
        "eje": "17/H",
        "centro": {
         "x": 5.97,
         "y": 1.3
        },
        "b": 0.3,
        "h": 1,
        "forma": "rectangular"
       },
       {
        "eje": "17/K",
        "centro": {
         "x": 10.29,
         "y": 1.3
        },
        "b": 0.3,
        "h": 1,
        "forma": "rectangular"
       },
       {
        "eje": "17/N",
        "centro": {
         "x": 14.61,
         "y": 1.3
        },
        "b": 0.3,
        "h": 1,
        "forma": "rectangular"
       },
       {
        "eje": "17/Q",
        "centro": {
         "x": 19.18,
         "y": 1.3
        },
        "b": 0.3,
        "h": 1,
        "forma": "rectangular"
       },
       {
        "eje": "11´/G",
        "centro": {
         "x": 1.24,
         "y": 7.85
        },
        "b": 0.3,
        "h": 0.3,
        "forma": "rectangular"
       },
       {
        "eje": "11´/Q",
        "centro": {
         "x": 19.18,
         "y": 7.85
        },
        "b": 0.3,
        "h": 0.3,
        "forma": "rectangular"
       },
       {
        "eje": "11/G",
        "centro": {
         "x": 1.24,
         "y": 13.54
        },
        "b": 0.3,
        "h": 1,
        "forma": "rectangular"
       },
       {
        "eje": "11/H",
        "centro": {
         "x": 5.97,
         "y": 13.54
        },
        "b": 0.3,
        "h": 1,
        "forma": "rectangular"
       },
       {
        "eje": "11/K",
        "centro": {
         "x": 10.29,
         "y": 13.54
        },
        "b": 0.3,
        "h": 1,
        "forma": "rectangular"
       },
       {
        "eje": "11/N",
        "centro": {
         "x": 14.61,
         "y": 13.54
        },
        "b": 0.3,
        "h": 1,
        "forma": "rectangular"
       },
       {
        "eje": "11/Q",
        "centro": {
         "x": 19.18,
         "y": 13.54
        },
        "b": 1.5,
        "h": 1.5,
        "forma": "L"
       },
       {
        "eje": null,
        "centro": {
         "x": 3.78,
         "y": 7.85
        },
        "b": 0.3,
        "h": 0.3,
        "forma": "columneta"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    },
    {
     "id": "vista-07",
     "nivel": 2,
     "categorias": {
      "ejes": [
       {
        "nombre": "G",
        "p": {
         "x": 1.24,
         "y": 15.89
        },
        "q": {
         "x": 1.24,
         "y": 0
        }
       },
       {
        "nombre": "Q",
        "p": {
         "x": 19.18,
         "y": 15.89
        },
        "q": {
         "x": 19.18,
         "y": 0
        }
       },
       {
        "nombre": "H",
        "p": {
         "x": 5.97,
         "y": 15.89
        },
        "q": {
         "x": 5.97,
         "y": 0
        }
       },
       {
        "nombre": "K",
        "p": {
         "x": 10.29,
         "y": 15.89
        },
        "q": {
         "x": 10.29,
         "y": 0
        }
       },
       {
        "nombre": "N",
        "p": {
         "x": 14.61,
         "y": 15.89
        },
        "q": {
         "x": 14.61,
         "y": 0
        }
       },
       {
        "nombre": "11",
        "p": {
         "x": 0,
         "y": 13.54
        },
        "q": {
         "x": 20.42,
         "y": 13.54
        }
       },
       {
        "nombre": "17",
        "p": {
         "x": 0,
         "y": 1.3
        },
        "q": {
         "x": 20.42,
         "y": 1.3
        }
       },
       {
        "nombre": "11´",
        "p": {
         "x": 0,
         "y": 7.85
        },
        "q": {
         "x": 20.42,
         "y": 7.85
        }
       }
      ],
      "columnas": [
       {
        "eje": "17/G",
        "centro": {
         "x": 1.24,
         "y": 1.3
        },
        "b": 1.5,
        "h": 1.5,
        "forma": "L"
       },
       {
        "eje": "17/H",
        "centro": {
         "x": 5.97,
         "y": 1.3
        },
        "b": 0.3,
        "h": 1,
        "forma": "rectangular"
       },
       {
        "eje": "17/K",
        "centro": {
         "x": 10.29,
         "y": 1.3
        },
        "b": 0.3,
        "h": 1,
        "forma": "rectangular"
       },
       {
        "eje": "17/N",
        "centro": {
         "x": 14.61,
         "y": 1.3
        },
        "b": 0.3,
        "h": 1,
        "forma": "rectangular"
       },
       {
        "eje": "17/Q",
        "centro": {
         "x": 19.18,
         "y": 1.3
        },
        "b": 0.3,
        "h": 1,
        "forma": "rectangular"
       },
       {
        "eje": "11´/G",
        "centro": {
         "x": 1.24,
         "y": 7.85
        },
        "b": 0.3,
        "h": 0.3,
        "forma": "rectangular"
       },
       {
        "eje": "11´/Q",
        "centro": {
         "x": 19.18,
         "y": 7.85
        },
        "b": 0.3,
        "h": 0.3,
        "forma": "rectangular"
       },
       {
        "eje": "11/G",
        "centro": {
         "x": 1.24,
         "y": 13.54
        },
        "b": 0.3,
        "h": 1,
        "forma": "rectangular"
       },
       {
        "eje": "11/H",
        "centro": {
         "x": 5.97,
         "y": 13.54
        },
        "b": 0.3,
        "h": 1,
        "forma": "rectangular"
       },
       {
        "eje": "11/K",
        "centro": {
         "x": 10.29,
         "y": 13.54
        },
        "b": 0.3,
        "h": 1,
        "forma": "rectangular"
       },
       {
        "eje": "11/N",
        "centro": {
         "x": 14.61,
         "y": 13.54
        },
        "b": 0.3,
        "h": 1,
        "forma": "rectangular"
       },
       {
        "eje": "11/Q",
        "centro": {
         "x": 19.18,
         "y": 13.54
        },
        "b": 1.5,
        "h": 1.5,
        "forma": "L"
       },
       {
        "eje": null,
        "centro": {
         "x": 3.78,
         "y": 7.85
        },
        "b": 0.3,
        "h": 0.3,
        "forma": "columneta"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    },
    {
     "id": "vista-08",
     "nivel": null,
     "categorias": {
      "ejes": [
       {
        "nombre": "N",
        "p": {
         "x": 13.37,
         "y": 19.13
        },
        "q": {
         "x": 13.37,
         "y": 0.04
        }
       },
       {
        "nombre": "K",
        "p": {
         "x": 9.05,
         "y": 19.13
        },
        "q": {
         "x": 9.05,
         "y": 0.04
        }
       },
       {
        "nombre": "Q",
        "p": {
         "x": 17.96,
         "y": 19.13
        },
        "q": {
         "x": 17.96,
         "y": 0.04
        }
       },
       {
        "nombre": "H",
        "p": {
         "x": 4.69,
         "y": 19.17
        },
        "q": {
         "x": 4.69,
         "y": 0
        }
       },
       {
        "nombre": "17",
        "p": {
         "x": 20.67,
         "y": 3.45
        },
        "q": {
         "x": 0,
         "y": 3.45
        }
       },
       {
        "nombre": "11",
        "p": {
         "x": 20.67,
         "y": 15.72
        },
        "q": {
         "x": 0,
         "y": 15.72
        }
       }
      ],
      "columnas": [
       {
        "eje": "17/H",
        "centro": {
         "x": 4.74,
         "y": 3.45
        },
        "b": 0.33,
        "h": 1.03,
        "forma": "rectangular"
       },
       {
        "eje": "17/K",
        "centro": {
         "x": 9.05,
         "y": 3.45
        },
        "b": 0.33,
        "h": 1.03,
        "forma": "rectangular"
       },
       {
        "eje": "17/N",
        "centro": {
         "x": 13.37,
         "y": 3.45
        },
        "b": 0.33,
        "h": 1.03,
        "forma": "rectangular"
       },
       {
        "eje": "17/Q",
        "centro": {
         "x": 17.96,
         "y": 3.45
        },
        "b": 0.33,
        "h": 1.03,
        "forma": "rectangular"
       },
       {
        "eje": "11/H",
        "centro": {
         "x": 4.74,
         "y": 15.72
        },
        "b": 0.33,
        "h": 1.03,
        "forma": "rectangular"
       },
       {
        "eje": "11/K",
        "centro": {
         "x": 9.05,
         "y": 15.72
        },
        "b": 0.33,
        "h": 1.03,
        "forma": "rectangular"
       },
       {
        "eje": "11/N",
        "centro": {
         "x": 13.37,
         "y": 15.72
        },
        "b": 0.33,
        "h": 1.03,
        "forma": "rectangular"
       },
       {
        "eje": "11/Q",
        "centro": {
         "x": 17.96,
         "y": 15.72
        },
        "b": 0.33,
        "h": 1.03,
        "forma": "rectangular"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    }
   ]
  }
 },
 {
  "nombre": "ilo:modulo-06",
  "grupo": "ilo",
  "id": "modulo-06",
  "etiqueta": null,
  "rasgos": {
   "vista": "vista-01",
   "areaAbierta": false,
   "niveles": 2,
   "ejes": {
    "x": 4,
    "y": 3
   },
   "luces": {
    "x": [
     3.07,
     7.13,
     3.1
    ],
    "y": [
     6.64,
     3.86
    ]
   },
   "largo": 13.3,
   "ancho": 10.5,
   "area": 139.7,
   "luzLosa": 6.64,
   "luzMax": 7.13,
   "columnas": 9,
   "tipos": [
    {
     "nombre": "C1",
     "forma": "rectangular",
     "b": 0.43,
     "h": 0.43,
     "n": 6
    },
    {
     "nombre": "PL1",
     "forma": "L",
     "b": 1.23,
     "h": 1.23,
     "n": 1
    },
    {
     "nombre": "C2",
     "forma": "rectangular",
     "b": 0.25,
     "h": 0.13,
     "n": 1
    },
    {
     "nombre": "PL2",
     "forma": "L",
     "b": 1.23,
     "h": 1.23,
     "n": 1
    }
   ],
   "placas": true,
   "columnetas": 20,
   "techoLiviano": true,
   "cubierta": true,
   "falsoCielo": false,
   "deportivo": false,
   "agua": false,
   "banos": false
  },
  "decisiones": {
   "cimentacion": "zapatas",
   "cimientoCorrido": true,
   "hz": 0.6,
   "df": 1.5,
   "losa": "aligerada y maciza",
   "espesorLosa": 0.2,
   "plantasDeLosa": 2,
   "vigas": [
    "30x60",
    "30x80",
    "30x85"
   ],
   "fcColumnas": 280,
   "fcColumnetas": 175,
   "estribos": "3/8\": 1@.05, 17@.10",
   "porticos": 6,
   "mallaCimentacion": false,
   "columnasComoArquitectura": true,
   "losaDeTecho": true
  },
  "geometria": {
   "version": 1,
   "unidad": "m",
   "vistas": [
    {
     "id": "vista-01",
     "nivel": 2,
     "categorias": {
      "ejes": [
       {
        "nombre": "B",
        "p": {
         "x": 7.19,
         "y": 0
        },
        "q": {
         "x": 7.19,
         "y": 15.72
        }
       },
       {
        "nombre": "A",
        "p": {
         "x": 4.13,
         "y": 0
        },
        "q": {
         "x": 4.13,
         "y": 15.72
        }
       },
       {
        "nombre": "E",
        "p": {
         "x": 14.33,
         "y": 0
        },
        "q": {
         "x": 14.33,
         "y": 15.72
        }
       },
       {
        "nombre": "F",
        "p": {
         "x": 17.43,
         "y": 0
        },
        "q": {
         "x": 17.43,
         "y": 15.72
        }
       },
       {
        "nombre": "23",
        "p": {
         "x": 0,
         "y": 9.25
        },
        "q": {
         "x": 20.21,
         "y": 9.25
        }
       },
       {
        "nombre": "21",
        "p": {
         "x": 0,
         "y": 13.11
        },
        "q": {
         "x": 20.21,
         "y": 13.11
        }
       },
       {
        "nombre": "25",
        "p": {
         "x": 0,
         "y": 2.61
        },
        "q": {
         "x": 3.5,
         "y": 2.61
        }
       }
      ],
      "columnas": [
       {
        "eje": "25/A",
        "centro": {
         "x": 4.13,
         "y": 2.61
        },
        "b": 1.23,
        "h": 1.23,
        "forma": "L"
       },
       {
        "eje": "23/A",
        "centro": {
         "x": 4.13,
         "y": 9.25
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "rectangular"
       },
       {
        "eje": "21/F",
        "centro": {
         "x": 17.43,
         "y": 13.11
        },
        "b": 1.23,
        "h": 1.23,
        "forma": "L"
       },
       {
        "eje": "21/B",
        "centro": {
         "x": 7.19,
         "y": 13.11
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "rectangular"
       },
       {
        "eje": "21/E",
        "centro": {
         "x": 14.33,
         "y": 13.11
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "rectangular"
       },
       {
        "eje": null,
        "centro": {
         "x": 7.19,
         "y": 2.83
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 17.21,
         "y": 2.83
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 14.33,
         "y": 2.83
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 7.53,
         "y": 2.69
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 17.35,
         "y": 10.33
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 5.49,
         "y": 2.69
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 6.85,
         "y": 2.69
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 7.54,
         "y": 13.03
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 17.35,
         "y": 11.75
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 17.35,
         "y": 3.18
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.92,
         "y": 13.03
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 14.3,
         "y": 10.37
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 14.24,
         "y": 7.83
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.76,
         "y": 6.71
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 17.29,
         "y": 6.71
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 14.24,
         "y": 12.55
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 14.24,
         "y": 11.49
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 12.64,
         "y": 9.44
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 12.64,
         "y": 7.55
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 12.64,
         "y": 2.75
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 14.68,
         "y": 2.69
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.97,
         "y": 2.69
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.86,
         "y": 2.69
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 12.64,
         "y": 12.97
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    },
    {
     "id": "vista-02",
     "nivel": 1,
     "categorias": {
      "ejes": [
       {
        "nombre": "B",
        "p": {
         "x": 7.19,
         "y": 0
        },
        "q": {
         "x": 7.19,
         "y": 15.72
        }
       },
       {
        "nombre": "A",
        "p": {
         "x": 4.13,
         "y": 0
        },
        "q": {
         "x": 4.13,
         "y": 15.72
        }
       },
       {
        "nombre": "E",
        "p": {
         "x": 14.33,
         "y": 0
        },
        "q": {
         "x": 14.33,
         "y": 15.72
        }
       },
       {
        "nombre": "F",
        "p": {
         "x": 17.43,
         "y": 0
        },
        "q": {
         "x": 17.43,
         "y": 15.72
        }
       },
       {
        "nombre": "23",
        "p": {
         "x": 0,
         "y": 9.25
        },
        "q": {
         "x": 20.21,
         "y": 9.25
        }
       },
       {
        "nombre": "25",
        "p": {
         "x": 0,
         "y": 2.61
        },
        "q": {
         "x": 20.21,
         "y": 2.61
        }
       },
       {
        "nombre": "21",
        "p": {
         "x": 0,
         "y": 13.11
        },
        "q": {
         "x": 20.21,
         "y": 13.11
        }
       }
      ],
      "columnas": [
       {
        "eje": "25/B",
        "centro": {
         "x": 7.19,
         "y": 2.61
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "rectangular"
       },
       {
        "eje": "25/E",
        "centro": {
         "x": 14.33,
         "y": 2.61
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "rectangular"
       },
       {
        "eje": "25/F",
        "centro": {
         "x": 17.43,
         "y": 2.61
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "rectangular"
       },
       {
        "eje": "25/A",
        "centro": {
         "x": 4.13,
         "y": 2.61
        },
        "b": 1.23,
        "h": 1.23,
        "forma": "L"
       },
       {
        "eje": "23/E",
        "centro": {
         "x": 14.33,
         "y": 9.25
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "rectangular"
       },
       {
        "eje": "23/A",
        "centro": {
         "x": 4.13,
         "y": 9.25
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "rectangular"
       },
       {
        "eje": "21/F",
        "centro": {
         "x": 17.43,
         "y": 13.11
        },
        "b": 1.23,
        "h": 1.23,
        "forma": "L"
       },
       {
        "eje": "21/B",
        "centro": {
         "x": 7.19,
         "y": 13.11
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "rectangular"
       },
       {
        "eje": "21/E",
        "centro": {
         "x": 14.33,
         "y": 13.11
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "rectangular"
       },
       {
        "eje": null,
        "centro": {
         "x": 7.53,
         "y": 2.69
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.84,
         "y": 2.69
        },
        "b": 0.3,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 14.24,
         "y": 6.82
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 17.35,
         "y": 10.33
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 5.49,
         "y": 2.69
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 6.85,
         "y": 2.69
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 7.54,
         "y": 13.03
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.98,
         "y": 13.03
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 17.35,
         "y": 11.75
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.83,
         "y": 10.37
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 17.35,
         "y": 3.18
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 14.24,
         "y": 10.33
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 14.75,
         "y": 10.37
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 14.24,
         "y": 12.55
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 14.24,
         "y": 3.18
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 14.7,
         "y": 2.69
        },
        "b": 0.3,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 10.11,
         "y": 2.69
        },
        "b": 0.37,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.01,
         "y": 2.69
        },
        "b": 0.37,
        "h": 0.13,
        "forma": "columneta"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    },
    {
     "id": "vista-03",
     "nivel": null,
     "categorias": {
      "ejes": [
       {
        "nombre": "B",
        "p": {
         "x": 7.19,
         "y": 0
        },
        "q": {
         "x": 7.19,
         "y": 15.72
        }
       },
       {
        "nombre": "A",
        "p": {
         "x": 4.13,
         "y": 0
        },
        "q": {
         "x": 4.13,
         "y": 15.72
        }
       },
       {
        "nombre": "E",
        "p": {
         "x": 14.33,
         "y": 0
        },
        "q": {
         "x": 14.33,
         "y": 15.72
        }
       },
       {
        "nombre": "F",
        "p": {
         "x": 17.43,
         "y": 0
        },
        "q": {
         "x": 17.43,
         "y": 15.72
        }
       },
       {
        "nombre": "23",
        "p": {
         "x": 0,
         "y": 9.25
        },
        "q": {
         "x": 20.21,
         "y": 9.25
        }
       },
       {
        "nombre": "25",
        "p": {
         "x": 0,
         "y": 2.61
        },
        "q": {
         "x": 20.21,
         "y": 2.61
        }
       },
       {
        "nombre": "21",
        "p": {
         "x": 0,
         "y": 13.11
        },
        "q": {
         "x": 20.21,
         "y": 13.11
        }
       }
      ],
      "columnas": [],
      "murosVanos": null,
      "losas": null
     }
    },
    {
     "id": "vista-04",
     "nivel": null,
     "categorias": {
      "ejes": [
       {
        "nombre": "B",
        "p": {
         "x": 5.98,
         "y": 14.22
        },
        "q": {
         "x": 5.98,
         "y": 0
        }
       },
       {
        "nombre": "A",
        "p": {
         "x": 2.93,
         "y": 14.22
        },
        "q": {
         "x": 2.93,
         "y": 0
        }
       },
       {
        "nombre": "F",
        "p": {
         "x": 16.2,
         "y": 14.22
        },
        "q": {
         "x": 16.2,
         "y": 0
        }
       },
       {
        "nombre": "E",
        "p": {
         "x": 13.11,
         "y": 14.22
        },
        "q": {
         "x": 13.11,
         "y": 0
        }
       },
       {
        "nombre": "25",
        "p": {
         "x": 0.16,
         "y": 1.51
        },
        "q": {
         "x": 17.7,
         "y": 1.51
        }
       },
       {
        "nombre": "21",
        "p": {
         "x": 0,
         "y": 11.98
        },
        "q": {
         "x": 17.86,
         "y": 11.98
        }
       }
      ],
      "columnas": [
       {
        "eje": "25/B",
        "centro": {
         "x": 5.98,
         "y": 1.51
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "25/E",
        "centro": {
         "x": 13.11,
         "y": 1.51
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "25/F",
        "centro": {
         "x": 16.2,
         "y": 1.51
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "25/A",
        "centro": {
         "x": 2.93,
         "y": 1.51
        },
        "b": 1.2,
        "h": 1.2,
        "forma": "L"
       },
       {
        "eje": "21/F",
        "centro": {
         "x": 16.2,
         "y": 11.98
        },
        "b": 1.2,
        "h": 1.2,
        "forma": "L"
       },
       {
        "eje": "21/B",
        "centro": {
         "x": 5.98,
         "y": 11.98
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "21/E",
        "centro": {
         "x": 13.11,
         "y": 11.98
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": null,
        "centro": {
         "x": 3.13,
         "y": 8.13
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "columneta"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    },
    {
     "id": "vista-05",
     "nivel": 1,
     "categorias": {
      "ejes": [
       {
        "nombre": "B",
        "p": {
         "x": 5.98,
         "y": 13.48
        },
        "q": {
         "x": 5.98,
         "y": 0
        }
       },
       {
        "nombre": "A",
        "p": {
         "x": 2.93,
         "y": 13.48
        },
        "q": {
         "x": 2.93,
         "y": 0
        }
       },
       {
        "nombre": "F",
        "p": {
         "x": 16.2,
         "y": 13.48
        },
        "q": {
         "x": 16.2,
         "y": 0
        }
       },
       {
        "nombre": "E",
        "p": {
         "x": 13.11,
         "y": 13.48
        },
        "q": {
         "x": 13.11,
         "y": 0
        }
       },
       {
        "nombre": "25",
        "p": {
         "x": 0.16,
         "y": 1.51
        },
        "q": {
         "x": 17.7,
         "y": 1.51
        }
       },
       {
        "nombre": "21",
        "p": {
         "x": 0,
         "y": 11.98
        },
        "q": {
         "x": 17.86,
         "y": 11.98
        }
       }
      ],
      "columnas": [
       {
        "eje": "25/B",
        "centro": {
         "x": 5.98,
         "y": 1.51
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "25/E",
        "centro": {
         "x": 13.11,
         "y": 1.51
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "25/F",
        "centro": {
         "x": 16.2,
         "y": 1.51
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "25/A",
        "centro": {
         "x": 2.93,
         "y": 1.51
        },
        "b": 1.2,
        "h": 1.2,
        "forma": "L"
       },
       {
        "eje": "21/F",
        "centro": {
         "x": 16.2,
         "y": 11.98
        },
        "b": 1.2,
        "h": 1.2,
        "forma": "L"
       },
       {
        "eje": "21/B",
        "centro": {
         "x": 5.98,
         "y": 11.98
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "21/E",
        "centro": {
         "x": 13.11,
         "y": 11.98
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": null,
        "centro": {
         "x": 6.33,
         "y": 11.92
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 12.76,
         "y": 11.92
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 9.55,
         "y": 11.92
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.03,
         "y": 11.43
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.14,
         "y": 10.63
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.14,
         "y": 2.06
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.14,
         "y": 6.86
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.03,
         "y": 2.06
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 6.33,
         "y": 1.57
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 4.28,
         "y": 1.57
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 5.63,
         "y": 1.57
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 5.63,
         "y": 11.76
        },
        "b": 0.25,
        "h": 0.39,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 3.1,
         "y": 8.49
        },
        "b": 0.32,
        "h": 0.28,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.49,
         "y": 1.57
        },
        "b": 0.3,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 15.63,
         "y": 1.57
        },
        "b": 0.3,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.03,
         "y": 5.71
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.03,
         "y": 3.88
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.03,
         "y": 7.79
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.14,
         "y": 4.52
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 4.38,
         "y": 10.1
        },
        "b": 0.26,
        "h": 0.28,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 3.13,
         "y": 8.13
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.33,
         "y": 1.57
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    },
    {
     "id": "vista-06",
     "nivel": 2,
     "categorias": {
      "ejes": [
       {
        "nombre": "B",
        "p": {
         "x": 5.98,
         "y": 13.48
        },
        "q": {
         "x": 5.98,
         "y": 0
        }
       },
       {
        "nombre": "A",
        "p": {
         "x": 2.93,
         "y": 13.48
        },
        "q": {
         "x": 2.93,
         "y": 0
        }
       },
       {
        "nombre": "F",
        "p": {
         "x": 16.2,
         "y": 13.48
        },
        "q": {
         "x": 16.2,
         "y": 0
        }
       },
       {
        "nombre": "E",
        "p": {
         "x": 13.11,
         "y": 13.48
        },
        "q": {
         "x": 13.11,
         "y": 0
        }
       },
       {
        "nombre": "25",
        "p": {
         "x": 0.16,
         "y": 1.51
        },
        "q": {
         "x": 17.7,
         "y": 1.51
        }
       },
       {
        "nombre": "21",
        "p": {
         "x": 0,
         "y": 11.98
        },
        "q": {
         "x": 17.86,
         "y": 11.98
        }
       }
      ],
      "columnas": [
       {
        "eje": "25/B",
        "centro": {
         "x": 5.98,
         "y": 1.51
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "25/E",
        "centro": {
         "x": 13.11,
         "y": 1.51
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "25/F",
        "centro": {
         "x": 16.2,
         "y": 1.51
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "25/A",
        "centro": {
         "x": 2.93,
         "y": 1.51
        },
        "b": 1.2,
        "h": 1.2,
        "forma": "L"
       },
       {
        "eje": "21/F",
        "centro": {
         "x": 16.2,
         "y": 11.98
        },
        "b": 1.2,
        "h": 1.2,
        "forma": "L"
       },
       {
        "eje": "21/B",
        "centro": {
         "x": 5.98,
         "y": 11.98
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "21/E",
        "centro": {
         "x": 13.11,
         "y": 11.98
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": null,
        "centro": {
         "x": 4.28,
         "y": 1.57
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 5.63,
         "y": 1.57
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 6.33,
         "y": 1.57
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 11.43,
         "y": 1.63
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 11.43,
         "y": 6.44
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 12.76,
         "y": 1.57
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.46,
         "y": 1.57
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 15.65,
         "y": 1.57
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.08,
         "y": 5.6
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.14,
         "y": 2.06
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.14,
         "y": 10.63
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.08,
         "y": 9.26
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.19,
         "y": 6.72
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.14,
         "y": 7.43
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.14,
         "y": 3.86
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 5.63,
         "y": 11.76
        },
        "b": 0.25,
        "h": 0.39,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 3.1,
         "y": 8.49
        },
        "b": 0.32,
        "h": 0.28,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 4.38,
         "y": 10.1
        },
        "b": 0.26,
        "h": 0.28,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 3.13,
         "y": 8.13
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.46,
         "y": 11.92
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 14.85,
         "y": 11.92
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 12.55,
         "y": 5.6
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.25,
         "y": 9.26
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 11.37,
         "y": 9.26
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 11.43,
         "y": 8.33
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 9.68,
         "y": 9.26
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.19,
         "y": 10.38
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.19,
         "y": 11.43
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.91,
         "y": 1.57
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 11.43,
         "y": 4.04
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    },
    {
     "id": "vista-07",
     "nivel": 3,
     "categorias": {
      "ejes": [
       {
        "nombre": "B",
        "p": {
         "x": 5.98,
         "y": 13.48
        },
        "q": {
         "x": 5.98,
         "y": 0
        }
       },
       {
        "nombre": "A",
        "p": {
         "x": 2.93,
         "y": 13.48
        },
        "q": {
         "x": 2.93,
         "y": 0
        }
       },
       {
        "nombre": "F",
        "p": {
         "x": 16.2,
         "y": 13.48
        },
        "q": {
         "x": 16.2,
         "y": 0
        }
       },
       {
        "nombre": "E",
        "p": {
         "x": 13.11,
         "y": 13.48
        },
        "q": {
         "x": 13.11,
         "y": 0
        }
       },
       {
        "nombre": "25",
        "p": {
         "x": 0.16,
         "y": 1.51
        },
        "q": {
         "x": 17.7,
         "y": 1.51
        }
       },
       {
        "nombre": "21",
        "p": {
         "x": 0,
         "y": 11.98
        },
        "q": {
         "x": 17.86,
         "y": 11.98
        }
       }
      ],
      "columnas": [
       {
        "eje": "25/A",
        "centro": {
         "x": 2.93,
         "y": 1.51
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "rectangular"
       },
       {
        "eje": "25/B",
        "centro": {
         "x": 5.98,
         "y": 1.51
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "rectangular"
       },
       {
        "eje": "25/E",
        "centro": {
         "x": 13.11,
         "y": 1.51
        },
        "b": 1.82,
        "h": 0.13,
        "forma": "rectangular"
       },
       {
        "eje": "25/F",
        "centro": {
         "x": 16.2,
         "y": 1.51
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "rectangular"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.93,
         "y": 1.57
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 11.93,
         "y": 1.57
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 14.01,
         "y": 1.57
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 2.99,
         "y": 4.92
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 2.99,
         "y": 8.21
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    },
    {
     "id": "vista-08",
     "nivel": 1,
     "categorias": {
      "ejes": [
       {
        "nombre": "B",
        "p": {
         "x": 5.98,
         "y": 13.48
        },
        "q": {
         "x": 5.98,
         "y": 0
        }
       },
       {
        "nombre": "A",
        "p": {
         "x": 2.93,
         "y": 13.48
        },
        "q": {
         "x": 2.93,
         "y": 0
        }
       },
       {
        "nombre": "F",
        "p": {
         "x": 16.2,
         "y": 13.48
        },
        "q": {
         "x": 16.2,
         "y": 0
        }
       },
       {
        "nombre": "E",
        "p": {
         "x": 13.11,
         "y": 13.48
        },
        "q": {
         "x": 13.11,
         "y": 0
        }
       },
       {
        "nombre": "25",
        "p": {
         "x": 0.16,
         "y": 1.51
        },
        "q": {
         "x": 17.7,
         "y": 1.51
        }
       },
       {
        "nombre": "21",
        "p": {
         "x": 0,
         "y": 11.98
        },
        "q": {
         "x": 17.86,
         "y": 11.98
        }
       }
      ],
      "columnas": [
       {
        "eje": "25/B",
        "centro": {
         "x": 5.98,
         "y": 1.51
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "25/E",
        "centro": {
         "x": 13.11,
         "y": 1.51
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "25/F",
        "centro": {
         "x": 16.2,
         "y": 1.51
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "25/A",
        "centro": {
         "x": 2.93,
         "y": 1.51
        },
        "b": 1.2,
        "h": 1.2,
        "forma": "L"
       },
       {
        "eje": "21/F",
        "centro": {
         "x": 16.2,
         "y": 11.98
        },
        "b": 1.2,
        "h": 1.2,
        "forma": "L"
       },
       {
        "eje": "21/B",
        "centro": {
         "x": 5.98,
         "y": 11.98
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "21/E",
        "centro": {
         "x": 13.11,
         "y": 11.98
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": null,
        "centro": {
         "x": 3.13,
         "y": 8.13
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "columneta"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    },
    {
     "id": "vista-09",
     "nivel": null,
     "categorias": {
      "ejes": [
       {
        "nombre": "B",
        "p": {
         "x": 5.98,
         "y": 13.48
        },
        "q": {
         "x": 5.98,
         "y": 0
        }
       },
       {
        "nombre": "A",
        "p": {
         "x": 2.93,
         "y": 13.48
        },
        "q": {
         "x": 2.93,
         "y": 0
        }
       },
       {
        "nombre": "F",
        "p": {
         "x": 16.2,
         "y": 13.48
        },
        "q": {
         "x": 16.2,
         "y": 0
        }
       },
       {
        "nombre": "E",
        "p": {
         "x": 13.11,
         "y": 13.48
        },
        "q": {
         "x": 13.11,
         "y": 0
        }
       },
       {
        "nombre": "25",
        "p": {
         "x": 0.16,
         "y": 1.51
        },
        "q": {
         "x": 17.7,
         "y": 1.51
        }
       },
       {
        "nombre": "21",
        "p": {
         "x": 0,
         "y": 11.98
        },
        "q": {
         "x": 17.86,
         "y": 11.98
        }
       }
      ],
      "columnas": [
       {
        "eje": "25/B",
        "centro": {
         "x": 5.98,
         "y": 1.51
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "25/E",
        "centro": {
         "x": 13.11,
         "y": 1.51
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "25/F",
        "centro": {
         "x": 16.2,
         "y": 1.51
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "25/A",
        "centro": {
         "x": 2.93,
         "y": 1.51
        },
        "b": 1.2,
        "h": 1.2,
        "forma": "L"
       },
       {
        "eje": "21/F",
        "centro": {
         "x": 16.2,
         "y": 11.98
        },
        "b": 1.2,
        "h": 1.2,
        "forma": "L"
       },
       {
        "eje": "21/B",
        "centro": {
         "x": 5.98,
         "y": 11.98
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "21/E",
        "centro": {
         "x": 13.11,
         "y": 11.98
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": null,
        "centro": {
         "x": 3.13,
         "y": 8.13
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 6.33,
         "y": 11.92
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 12.76,
         "y": 11.92
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 9.55,
         "y": 11.92
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.03,
         "y": 11.43
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.14,
         "y": 10.63
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.14,
         "y": 2.06
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.14,
         "y": 6.86
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.03,
         "y": 2.06
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 6.33,
         "y": 1.57
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 4.28,
         "y": 1.57
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 5.63,
         "y": 1.57
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 5.63,
         "y": 11.76
        },
        "b": 0.25,
        "h": 0.39,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 3.1,
         "y": 8.49
        },
        "b": 0.32,
        "h": 0.28,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.49,
         "y": 1.57
        },
        "b": 0.3,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 15.63,
         "y": 1.57
        },
        "b": 0.3,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.03,
         "y": 5.71
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.03,
         "y": 3.88
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.03,
         "y": 7.79
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.14,
         "y": 4.52
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 4.38,
         "y": 10.1
        },
        "b": 0.26,
        "h": 0.28,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.33,
         "y": 1.57
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    },
    {
     "id": "vista-10",
     "nivel": 2,
     "categorias": {
      "ejes": [
       {
        "nombre": "B",
        "p": {
         "x": 5.98,
         "y": 13.48
        },
        "q": {
         "x": 5.98,
         "y": 0
        }
       },
       {
        "nombre": "A",
        "p": {
         "x": 2.93,
         "y": 13.48
        },
        "q": {
         "x": 2.93,
         "y": 0
        }
       },
       {
        "nombre": "F",
        "p": {
         "x": 16.2,
         "y": 13.48
        },
        "q": {
         "x": 16.2,
         "y": 0
        }
       },
       {
        "nombre": "E",
        "p": {
         "x": 13.11,
         "y": 13.48
        },
        "q": {
         "x": 13.11,
         "y": 0
        }
       },
       {
        "nombre": "25",
        "p": {
         "x": 0.16,
         "y": 1.51
        },
        "q": {
         "x": 17.7,
         "y": 1.51
        }
       },
       {
        "nombre": "21",
        "p": {
         "x": 0,
         "y": 11.98
        },
        "q": {
         "x": 17.86,
         "y": 11.98
        }
       }
      ],
      "columnas": [
       {
        "eje": "25/B",
        "centro": {
         "x": 5.98,
         "y": 1.51
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "25/E",
        "centro": {
         "x": 13.11,
         "y": 1.51
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "25/F",
        "centro": {
         "x": 16.2,
         "y": 1.51
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "25/A",
        "centro": {
         "x": 2.93,
         "y": 1.51
        },
        "b": 1.2,
        "h": 1.2,
        "forma": "L"
       },
       {
        "eje": "21/F",
        "centro": {
         "x": 16.2,
         "y": 11.98
        },
        "b": 1.2,
        "h": 1.2,
        "forma": "L"
       },
       {
        "eje": "21/B",
        "centro": {
         "x": 5.98,
         "y": 11.98
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "21/E",
        "centro": {
         "x": 13.11,
         "y": 11.98
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": null,
        "centro": {
         "x": 3.13,
         "y": 8.13
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "columneta"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    }
   ]
  }
 },
 {
  "nombre": "ilo:modulo-07",
  "grupo": "ilo",
  "id": "modulo-07",
  "etiqueta": null,
  "rasgos": {
   "vista": "vista-01",
   "areaAbierta": false,
   "niveles": 2,
   "ejes": {
    "x": 4,
    "y": 4
   },
   "luces": {
    "x": [
     4.2,
     6,
     3.1
    ],
    "y": [
     13,
     7.3,
     6.7
    ]
   },
   "largo": 27,
   "ancho": 13.3,
   "area": 359.18,
   "luzLosa": 6,
   "luzMax": 13,
   "columnas": 13,
   "tipos": [
    {
     "nombre": "C1",
     "forma": "rectangular",
     "b": 0.43,
     "h": 0.43,
     "n": 10
    },
    {
     "nombre": "C2",
     "forma": "rectangular",
     "b": 0.43,
     "h": 0.41,
     "n": 1
    },
    {
     "nombre": "PL1",
     "forma": "L",
     "b": 1.23,
     "h": 1.23,
     "n": 1
    },
    {
     "nombre": "PL2",
     "forma": "L",
     "b": 1.03,
     "h": 1.03,
     "n": 1
    }
   ],
   "placas": true,
   "columnetas": 42,
   "techoLiviano": false,
   "cubierta": true,
   "falsoCielo": false,
   "deportivo": false,
   "agua": false,
   "banos": true
  },
  "decisiones": {
   "cimentacion": "zapatas",
   "cimientoCorrido": true,
   "hz": 0.6,
   "df": 1.5,
   "losa": "aligerada y maciza",
   "espesorLosa": 0.2,
   "plantasDeLosa": 2,
   "vigas": [
    "30x40",
    "30x50",
    "30x75"
   ],
   "fcColumnas": 280,
   "fcColumnetas": 175,
   "estribos": "3/8\": 1@.05, 10@.10",
   "porticos": 10,
   "mallaCimentacion": true,
   "columnasComoArquitectura": true,
   "losaDeTecho": true
  },
  "geometria": {
   "version": 1,
   "unidad": "m",
   "vistas": [
    {
     "id": "vista-01",
     "nivel": 1,
     "categorias": {
      "ejes": [
       {
        "nombre": "8",
        "p": {
         "x": 0,
         "y": 29.18
        },
        "q": {
         "x": 18.62,
         "y": 29.18
        }
       },
       {
        "nombre": "10",
        "p": {
         "x": 0,
         "y": 22.48
        },
        "q": {
         "x": 18.62,
         "y": 22.48
        }
       },
       {
        "nombre": "14",
        "p": {
         "x": 0,
         "y": 15.18
        },
        "q": {
         "x": 18.62,
         "y": 15.18
        }
       },
       {
        "nombre": "F",
        "p": {
         "x": 16.48,
         "y": 0
        },
        "q": {
         "x": 16.48,
         "y": 31.27
        }
       },
       {
        "nombre": "E",
        "p": {
         "x": 13.38,
         "y": 31.27
        },
        "q": {
         "x": 13.38,
         "y": 0
        }
       },
       {
        "nombre": "A",
        "p": {
         "x": 3.18,
         "y": 0
        },
        "q": {
         "x": 3.18,
         "y": 31.27
        }
       },
       {
        "nombre": "C",
        "p": {
         "x": 7.38,
         "y": 0
        },
        "q": {
         "x": 7.38,
         "y": 31.27
        }
       },
       {
        "nombre": "14",
        "p": {
         "x": 18.62,
         "y": 2.18
        },
        "q": {
         "x": 16.48,
         "y": 2.18
        }
       }
      ],
      "columnas": [
       {
        "eje": "14/F",
        "centro": {
         "x": 16.48,
         "y": 2.18
        },
        "b": 1.03,
        "h": 1.03,
        "forma": "L"
       },
       {
        "eje": "14/A",
        "centro": {
         "x": 3.18,
         "y": 15.18
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "rectangular"
       },
       {
        "eje": "14/C",
        "centro": {
         "x": 7.38,
         "y": 15.18
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "rectangular"
       },
       {
        "eje": "14/E",
        "centro": {
         "x": 13.38,
         "y": 15.18
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "rectangular"
       },
       {
        "eje": "14/F",
        "centro": {
         "x": 16.48,
         "y": 15.18
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "rectangular"
       },
       {
        "eje": "10/A",
        "centro": {
         "x": 3.18,
         "y": 22.48
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "rectangular"
       },
       {
        "eje": "10/C",
        "centro": {
         "x": 7.38,
         "y": 22.48
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "rectangular"
       },
       {
        "eje": "10/E",
        "centro": {
         "x": 13.38,
         "y": 22.48
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "rectangular"
       },
       {
        "eje": "10/F",
        "centro": {
         "x": 16.48,
         "y": 22.48
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "rectangular"
       },
       {
        "eje": "8/E",
        "centro": {
         "x": 13.38,
         "y": 29.18
        },
        "b": 1.23,
        "h": 1.23,
        "forma": "L"
       },
       {
        "eje": "8/A",
        "centro": {
         "x": 3.18,
         "y": 29.18
        },
        "b": 0.43,
        "h": 0.41,
        "forma": "rectangular"
       },
       {
        "eje": "8/C",
        "centro": {
         "x": 7.38,
         "y": 29.18
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "rectangular"
       },
       {
        "eje": "8/F",
        "centro": {
         "x": 16.48,
         "y": 29.18
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "rectangular"
       },
       {
        "eje": null,
        "centro": {
         "x": 7.38,
         "y": 8.89
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.27,
         "y": 8.89
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.38,
         "y": 8.89
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 12.18,
         "y": 29.1
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 7.73,
         "y": 29.1
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 7.46,
         "y": 28.61
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 7.46,
         "y": 22.83
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 7.46,
         "y": 22.13
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.4,
         "y": 21.4
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.4,
         "y": 19.75
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.4,
         "y": 17.59
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 12.34,
         "y": 12.39
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 11.9,
         "y": 11.61
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 11.9,
         "y": 9.53
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 7.46,
         "y": 25.07
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 10.8,
         "y": 21.4
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 10.8,
         "y": 19.75
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 10.8,
         "y": 17.59
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 10.8,
         "y": 12.45
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.46,
         "y": 14.83
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.46,
         "y": 12.45
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.03,
         "y": 8.76
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 7.46,
         "y": 21.4
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 3.74,
         "y": 29.1
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 7.38,
         "y": 2.39
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.27,
         "y": 8.41
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 4.54,
         "y": 8.76
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 7.03,
         "y": 8.76
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.46,
         "y": 15.53
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 7.73,
         "y": 8.76
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.46,
         "y": 20.77
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.4,
         "y": 26.07
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.4,
         "y": 24.29
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 10.3,
         "y": 25.07
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.46,
         "y": 25.51
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 10.36,
         "y": 24.29
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 10.36,
         "y": 26.07
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.46,
         "y": 27.81
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.46,
         "y": 27.19
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.46,
         "y": 23.73
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 6.12,
         "y": 29.1
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 10.8,
         "y": 15.14
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    },
    {
     "id": "vista-02",
     "nivel": 2,
     "categorias": {
      "ejes": [
       {
        "nombre": "8",
        "p": {
         "x": 0,
         "y": 29.18
        },
        "q": {
         "x": 18.62,
         "y": 29.18
        }
       },
       {
        "nombre": "10",
        "p": {
         "x": 0,
         "y": 22.48
        },
        "q": {
         "x": 18.62,
         "y": 22.48
        }
       },
       {
        "nombre": "14",
        "p": {
         "x": 0,
         "y": 15.18
        },
        "q": {
         "x": 18.62,
         "y": 15.18
        }
       },
       {
        "nombre": "F",
        "p": {
         "x": 16.48,
         "y": 0
        },
        "q": {
         "x": 16.48,
         "y": 31.27
        }
       },
       {
        "nombre": "E",
        "p": {
         "x": 13.38,
         "y": 31.27
        },
        "q": {
         "x": 13.38,
         "y": 0
        }
       },
       {
        "nombre": "A",
        "p": {
         "x": 3.18,
         "y": 0
        },
        "q": {
         "x": 3.18,
         "y": 31.27
        }
       },
       {
        "nombre": "C",
        "p": {
         "x": 7.38,
         "y": 0
        },
        "q": {
         "x": 7.38,
         "y": 31.27
        }
       }
      ],
      "columnas": [
       {
        "eje": "14/A",
        "centro": {
         "x": 3.18,
         "y": 15.18
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "rectangular"
       },
       {
        "eje": "14/C",
        "centro": {
         "x": 7.38,
         "y": 15.18
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "rectangular"
       },
       {
        "eje": "14/E",
        "centro": {
         "x": 13.38,
         "y": 15.18
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "rectangular"
       },
       {
        "eje": "14/F",
        "centro": {
         "x": 16.48,
         "y": 15.18
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "rectangular"
       },
       {
        "eje": "10/A",
        "centro": {
         "x": 3.18,
         "y": 22.48
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "rectangular"
       },
       {
        "eje": "10/C",
        "centro": {
         "x": 7.38,
         "y": 22.48
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "rectangular"
       },
       {
        "eje": "10/E",
        "centro": {
         "x": 13.38,
         "y": 22.48
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "rectangular"
       },
       {
        "eje": "10/F",
        "centro": {
         "x": 16.48,
         "y": 22.48
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "rectangular"
       },
       {
        "eje": "8/E",
        "centro": {
         "x": 13.38,
         "y": 29.18
        },
        "b": 1.23,
        "h": 1.23,
        "forma": "L"
       },
       {
        "eje": "8/A",
        "centro": {
         "x": 3.18,
         "y": 29.18
        },
        "b": 0.43,
        "h": 0.41,
        "forma": "rectangular"
       },
       {
        "eje": "8/C",
        "centro": {
         "x": 7.38,
         "y": 29.18
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "rectangular"
       },
       {
        "eje": "8/F",
        "centro": {
         "x": 16.48,
         "y": 29.18
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "rectangular"
       },
       {
        "eje": null,
        "centro": {
         "x": 7.36,
         "y": 8.89
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.25,
         "y": 8.89
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.36,
         "y": 8.89
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 3.73,
         "y": 29.1
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 12.16,
         "y": 29.1
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 7.71,
         "y": 29.1
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 7.01,
         "y": 29.1
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 7.36,
         "y": 2.39
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.25,
         "y": 8.41
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.45,
         "y": 27.81
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.45,
         "y": 8.49
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 4.53,
         "y": 8.76
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 7.01,
         "y": 8.76
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.45,
         "y": 2.34
        },
        "b": 0.13,
        "h": 0.3,
        "forma": "columneta"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    },
    {
     "id": "vista-03",
     "nivel": null,
     "categorias": {
      "ejes": [
       {
        "nombre": "10",
        "p": {
         "x": 0,
         "y": 22.48
        },
        "q": {
         "x": 19.07,
         "y": 22.48
        }
       },
       {
        "nombre": "14",
        "p": {
         "x": 0,
         "y": 15.18
        },
        "q": {
         "x": 19.07,
         "y": 15.18
        }
       },
       {
        "nombre": "F",
        "p": {
         "x": 16.78,
         "y": 31.27
        },
        "q": {
         "x": 16.78,
         "y": 0
        }
       },
       {
        "nombre": "E",
        "p": {
         "x": 13.68,
         "y": 31.27
        },
        "q": {
         "x": 13.68,
         "y": 0
        }
       },
       {
        "nombre": "A",
        "p": {
         "x": 3.48,
         "y": 31.27
        },
        "q": {
         "x": 3.48,
         "y": 0
        }
       },
       {
        "nombre": "C",
        "p": {
         "x": 7.68,
         "y": 31.27
        },
        "q": {
         "x": 7.68,
         "y": 0
        }
       }
      ],
      "columnas": [],
      "murosVanos": null,
      "losas": null
     }
    },
    {
     "id": "vista-04",
     "nivel": null,
     "categorias": {
      "ejes": [
       {
        "nombre": "17",
        "p": {
         "x": 11.82,
         "y": 5.86
        },
        "q": {
         "x": 0.35,
         "y": 5.86
        }
       },
       {
        "nombre": "18",
        "p": {
         "x": 11.82,
         "y": 5.81
        },
        "q": {
         "x": 0.35,
         "y": 5.81
        }
       },
       {
        "nombre": "18´",
        "p": {
         "x": 11.98,
         "y": 1.53
        },
        "q": {
         "x": 0.19,
         "y": 1.53
        }
       },
       {
        "nombre": "10",
        "p": {
         "x": 11.98,
         "y": 15.05
        },
        "q": {
         "x": 0.19,
         "y": 15.05
        }
       },
       {
        "nombre": "14",
        "p": {
         "x": 11.98,
         "y": 10.18
        },
        "q": {
         "x": 0.19,
         "y": 10.18
        }
       },
       {
        "nombre": "8",
        "p": {
         "x": 12.17,
         "y": 19.51
        },
        "q": {
         "x": 0,
         "y": 19.51
        }
       },
       {
        "nombre": "F",
        "p": {
         "x": 10.88,
         "y": 21.02
        },
        "q": {
         "x": 10.88,
         "y": 0
        }
       },
       {
        "nombre": "E",
        "p": {
         "x": 8.82,
         "y": 21.02
        },
        "q": {
         "x": 8.82,
         "y": 0
        }
       },
       {
        "nombre": "C",
        "p": {
         "x": 4.82,
         "y": 21.02
        },
        "q": {
         "x": 4.82,
         "y": 0
        }
       },
       {
        "nombre": "A",
        "p": {
         "x": 2.03,
         "y": 21.02
        },
        "q": {
         "x": 2.03,
         "y": 0
        }
       }
      ],
      "columnas": [
       {
        "eje": "18´/C",
        "centro": {
         "x": 4.82,
         "y": 1.53
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "18´/F",
        "centro": {
         "x": 10.88,
         "y": 1.53
        },
        "b": 0.67,
        "h": 0.67,
        "forma": "L"
       },
       {
        "eje": "17/A",
        "centro": {
         "x": 2.03,
         "y": 5.73
        },
        "b": 0.8,
        "h": 0.8,
        "forma": "L"
       },
       {
        "eje": "17/C",
        "centro": {
         "x": 4.82,
         "y": 5.52
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "17/E",
        "centro": {
         "x": 8.82,
         "y": 5.63
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "17/F",
        "centro": {
         "x": 10.88,
         "y": 5.79
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "14/A",
        "centro": {
         "x": 2.03,
         "y": 10.18
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "14/C",
        "centro": {
         "x": 4.82,
         "y": 10.18
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "14/E",
        "centro": {
         "x": 8.82,
         "y": 10.18
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "14/F",
        "centro": {
         "x": 10.88,
         "y": 10.18
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "10/A",
        "centro": {
         "x": 2.03,
         "y": 15.05
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "10/C",
        "centro": {
         "x": 4.82,
         "y": 15.05
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "10/E",
        "centro": {
         "x": 8.82,
         "y": 15.05
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "10/F",
        "centro": {
         "x": 10.88,
         "y": 15.05
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "8/A",
        "centro": {
         "x": 2.03,
         "y": 19.51
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "8/C",
        "centro": {
         "x": 4.82,
         "y": 19.51
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "8/E",
        "centro": {
         "x": 8.82,
         "y": 19.51
        },
        "b": 0.8,
        "h": 0.8,
        "forma": "L"
       },
       {
        "eje": "8/F",
        "centro": {
         "x": 10.88,
         "y": 19.51
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": null,
        "centro": {
         "x": 10.74,
         "y": 5.67
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "columneta"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    },
    {
     "id": "vista-05",
     "nivel": 1,
     "categorias": {
      "ejes": [
       {
        "nombre": "18",
        "p": {
         "x": 11.82,
         "y": 5.51
        },
        "q": {
         "x": 0.35,
         "y": 5.51
        }
       },
       {
        "nombre": "17",
        "p": {
         "x": 0.35,
         "y": 5.56
        },
        "q": {
         "x": 11.82,
         "y": 5.56
        }
       },
       {
        "nombre": "18´",
        "p": {
         "x": 11.98,
         "y": 1.23
        },
        "q": {
         "x": 0.19,
         "y": 1.23
        }
       },
       {
        "nombre": "10",
        "p": {
         "x": 0.19,
         "y": 14.75
        },
        "q": {
         "x": 11.98,
         "y": 14.75
        }
       },
       {
        "nombre": "14",
        "p": {
         "x": 0.19,
         "y": 9.88
        },
        "q": {
         "x": 11.98,
         "y": 9.88
        }
       },
       {
        "nombre": "8",
        "p": {
         "x": 0,
         "y": 19.21
        },
        "q": {
         "x": 12.17,
         "y": 19.21
        }
       },
       {
        "nombre": "F",
        "p": {
         "x": 10.88,
         "y": 0
        },
        "q": {
         "x": 10.88,
         "y": 20.42
        }
       },
       {
        "nombre": "E",
        "p": {
         "x": 8.82,
         "y": 0
        },
        "q": {
         "x": 8.82,
         "y": 20.42
        }
       },
       {
        "nombre": "C",
        "p": {
         "x": 4.82,
         "y": 0
        },
        "q": {
         "x": 4.82,
         "y": 20.42
        }
       },
       {
        "nombre": "A",
        "p": {
         "x": 2.03,
         "y": 0
        },
        "q": {
         "x": 2.03,
         "y": 20.42
        }
       }
      ],
      "columnas": [
       {
        "eje": "18´/C",
        "centro": {
         "x": 4.82,
         "y": 1.23
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "18´/F",
        "centro": {
         "x": 10.88,
         "y": 1.23
        },
        "b": 0.67,
        "h": 0.67,
        "forma": "L"
       },
       {
        "eje": "18/A",
        "centro": {
         "x": 2.03,
         "y": 5.63
        },
        "b": 0.8,
        "h": 0.8,
        "forma": "L"
       },
       {
        "eje": "18/C",
        "centro": {
         "x": 4.82,
         "y": 5.84
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "18/E",
        "centro": {
         "x": 8.82,
         "y": 5.73
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "18/F",
        "centro": {
         "x": 10.88,
         "y": 5.58
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "14/A",
        "centro": {
         "x": 2.03,
         "y": 9.88
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "14/C",
        "centro": {
         "x": 4.82,
         "y": 9.88
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "14/E",
        "centro": {
         "x": 8.82,
         "y": 9.88
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "14/F",
        "centro": {
         "x": 10.88,
         "y": 9.88
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "10/A",
        "centro": {
         "x": 2.03,
         "y": 14.75
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "10/C",
        "centro": {
         "x": 4.82,
         "y": 14.75
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "10/E",
        "centro": {
         "x": 8.82,
         "y": 14.75
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "10/F",
        "centro": {
         "x": 10.88,
         "y": 14.75
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "8/A",
        "centro": {
         "x": 2.03,
         "y": 19.21
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "8/C",
        "centro": {
         "x": 4.82,
         "y": 19.21
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "8/E",
        "centro": {
         "x": 8.82,
         "y": 19.21
        },
        "b": 0.8,
        "h": 0.8,
        "forma": "L"
       },
       {
        "eje": "8/F",
        "centro": {
         "x": 10.88,
         "y": 19.21
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": null,
        "centro": {
         "x": 10.74,
         "y": 5.37
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 2.08,
         "y": 13.97
        },
        "b": 0.26,
        "h": 0.21,
        "forma": "columneta"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    },
    {
     "id": "vista-06",
     "nivel": 2,
     "categorias": {
      "ejes": [
       {
        "nombre": "18",
        "p": {
         "x": 11.82,
         "y": 5.51
        },
        "q": {
         "x": 0.35,
         "y": 5.51
        }
       },
       {
        "nombre": "17",
        "p": {
         "x": 0.35,
         "y": 5.56
        },
        "q": {
         "x": 11.82,
         "y": 5.56
        }
       },
       {
        "nombre": "18´",
        "p": {
         "x": 11.98,
         "y": 1.23
        },
        "q": {
         "x": 0.19,
         "y": 1.23
        }
       },
       {
        "nombre": "10",
        "p": {
         "x": 0.19,
         "y": 14.75
        },
        "q": {
         "x": 11.98,
         "y": 14.75
        }
       },
       {
        "nombre": "14",
        "p": {
         "x": 0.19,
         "y": 9.88
        },
        "q": {
         "x": 11.98,
         "y": 9.88
        }
       },
       {
        "nombre": "8",
        "p": {
         "x": 0,
         "y": 19.21
        },
        "q": {
         "x": 12.17,
         "y": 19.21
        }
       },
       {
        "nombre": "F",
        "p": {
         "x": 10.88,
         "y": 0
        },
        "q": {
         "x": 10.88,
         "y": 20.42
        }
       },
       {
        "nombre": "E",
        "p": {
         "x": 8.82,
         "y": 0
        },
        "q": {
         "x": 8.82,
         "y": 20.42
        }
       },
       {
        "nombre": "C",
        "p": {
         "x": 4.82,
         "y": 0
        },
        "q": {
         "x": 4.82,
         "y": 20.42
        }
       },
       {
        "nombre": "A",
        "p": {
         "x": 2.03,
         "y": 0
        },
        "q": {
         "x": 2.03,
         "y": 20.42
        }
       }
      ],
      "columnas": [
       {
        "eje": "18´/C",
        "centro": {
         "x": 4.82,
         "y": 1.23
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "18´/F",
        "centro": {
         "x": 10.88,
         "y": 1.23
        },
        "b": 0.67,
        "h": 0.67,
        "forma": "L"
       },
       {
        "eje": "18/F",
        "centro": {
         "x": 10.88,
         "y": 5.58
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "18/A",
        "centro": {
         "x": 2.03,
         "y": 5.63
        },
        "b": 0.8,
        "h": 0.8,
        "forma": "L"
       },
       {
        "eje": "18/C",
        "centro": {
         "x": 4.82,
         "y": 5.84
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "18/E",
        "centro": {
         "x": 8.82,
         "y": 5.73
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "14/A",
        "centro": {
         "x": 2.03,
         "y": 9.88
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "14/C",
        "centro": {
         "x": 4.82,
         "y": 9.88
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "14/E",
        "centro": {
         "x": 8.82,
         "y": 9.88
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "14/F",
        "centro": {
         "x": 10.88,
         "y": 9.88
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "10/A",
        "centro": {
         "x": 2.03,
         "y": 14.75
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "10/C",
        "centro": {
         "x": 4.82,
         "y": 14.75
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "10/E",
        "centro": {
         "x": 8.82,
         "y": 14.75
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "10/F",
        "centro": {
         "x": 10.88,
         "y": 14.75
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "8/A",
        "centro": {
         "x": 2.03,
         "y": 19.21
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "8/C",
        "centro": {
         "x": 4.82,
         "y": 19.21
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "8/E",
        "centro": {
         "x": 8.82,
         "y": 19.21
        },
        "b": 0.8,
        "h": 0.8,
        "forma": "L"
       },
       {
        "eje": "8/F",
        "centro": {
         "x": 10.88,
         "y": 19.21
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": null,
        "centro": {
         "x": 10.74,
         "y": 5.69
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "columneta"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    },
    {
     "id": "vista-07",
     "nivel": 3,
     "categorias": {
      "ejes": [
       {
        "nombre": "18",
        "p": {
         "x": 11.82,
         "y": 5.51
        },
        "q": {
         "x": 0.35,
         "y": 5.51
        }
       },
       {
        "nombre": "17",
        "p": {
         "x": 0.35,
         "y": 5.56
        },
        "q": {
         "x": 11.82,
         "y": 5.56
        }
       },
       {
        "nombre": "18´",
        "p": {
         "x": 11.98,
         "y": 1.23
        },
        "q": {
         "x": 0.19,
         "y": 1.23
        }
       },
       {
        "nombre": "10",
        "p": {
         "x": 0.19,
         "y": 14.75
        },
        "q": {
         "x": 11.98,
         "y": 14.75
        }
       },
       {
        "nombre": "14",
        "p": {
         "x": 0.19,
         "y": 9.88
        },
        "q": {
         "x": 11.98,
         "y": 9.88
        }
       },
       {
        "nombre": "8",
        "p": {
         "x": 0,
         "y": 19.21
        },
        "q": {
         "x": 12.17,
         "y": 19.21
        }
       },
       {
        "nombre": "F",
        "p": {
         "x": 10.88,
         "y": 0
        },
        "q": {
         "x": 10.88,
         "y": 20.42
        }
       },
       {
        "nombre": "E",
        "p": {
         "x": 8.82,
         "y": 0
        },
        "q": {
         "x": 8.82,
         "y": 20.42
        }
       },
       {
        "nombre": "C",
        "p": {
         "x": 4.82,
         "y": 0
        },
        "q": {
         "x": 4.82,
         "y": 20.42
        }
       },
       {
        "nombre": "A",
        "p": {
         "x": 2.03,
         "y": 0
        },
        "q": {
         "x": 2.03,
         "y": 20.42
        }
       }
      ],
      "columnas": [],
      "murosVanos": null,
      "losas": null
     }
    },
    {
     "id": "vista-08",
     "nivel": 2,
     "categorias": {
      "ejes": [
       {
        "nombre": "18",
        "p": {
         "x": 11.82,
         "y": 5.51
        },
        "q": {
         "x": 0.35,
         "y": 5.51
        }
       },
       {
        "nombre": "17",
        "p": {
         "x": 0.35,
         "y": 5.56
        },
        "q": {
         "x": 11.82,
         "y": 5.56
        }
       },
       {
        "nombre": "18´",
        "p": {
         "x": 11.98,
         "y": 1.23
        },
        "q": {
         "x": 0.19,
         "y": 1.23
        }
       },
       {
        "nombre": "10",
        "p": {
         "x": 0.19,
         "y": 14.75
        },
        "q": {
         "x": 11.98,
         "y": 14.75
        }
       },
       {
        "nombre": "14",
        "p": {
         "x": 0.19,
         "y": 9.88
        },
        "q": {
         "x": 11.98,
         "y": 9.88
        }
       },
       {
        "nombre": "8",
        "p": {
         "x": 0,
         "y": 19.21
        },
        "q": {
         "x": 12.17,
         "y": 19.21
        }
       },
       {
        "nombre": "F",
        "p": {
         "x": 10.88,
         "y": 0
        },
        "q": {
         "x": 10.88,
         "y": 20.42
        }
       },
       {
        "nombre": "E",
        "p": {
         "x": 8.82,
         "y": 0
        },
        "q": {
         "x": 8.82,
         "y": 20.42
        }
       },
       {
        "nombre": "C",
        "p": {
         "x": 4.82,
         "y": 0
        },
        "q": {
         "x": 4.82,
         "y": 20.42
        }
       },
       {
        "nombre": "A",
        "p": {
         "x": 2.03,
         "y": 0
        },
        "q": {
         "x": 2.03,
         "y": 20.42
        }
       }
      ],
      "columnas": [
       {
        "eje": "18´/C",
        "centro": {
         "x": 4.82,
         "y": 1.23
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "18´/F",
        "centro": {
         "x": 10.88,
         "y": 1.23
        },
        "b": 0.67,
        "h": 0.67,
        "forma": "L"
       },
       {
        "eje": "18/A",
        "centro": {
         "x": 2.03,
         "y": 5.63
        },
        "b": 0.8,
        "h": 0.8,
        "forma": "L"
       },
       {
        "eje": "18/C",
        "centro": {
         "x": 4.82,
         "y": 5.84
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "18/E",
        "centro": {
         "x": 8.82,
         "y": 5.73
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "18/F",
        "centro": {
         "x": 10.88,
         "y": 5.58
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "14/A",
        "centro": {
         "x": 2.03,
         "y": 9.88
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "14/C",
        "centro": {
         "x": 4.82,
         "y": 9.88
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "14/E",
        "centro": {
         "x": 8.82,
         "y": 9.88
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "14/F",
        "centro": {
         "x": 10.88,
         "y": 9.88
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "10/A",
        "centro": {
         "x": 2.03,
         "y": 14.75
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "10/C",
        "centro": {
         "x": 4.82,
         "y": 14.75
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "10/E",
        "centro": {
         "x": 8.82,
         "y": 14.75
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "10/F",
        "centro": {
         "x": 10.88,
         "y": 14.75
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "8/A",
        "centro": {
         "x": 2.03,
         "y": 19.21
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "8/C",
        "centro": {
         "x": 4.82,
         "y": 19.21
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "8/E",
        "centro": {
         "x": 8.82,
         "y": 19.21
        },
        "b": 0.8,
        "h": 0.8,
        "forma": "L"
       },
       {
        "eje": "8/F",
        "centro": {
         "x": 10.88,
         "y": 19.21
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": null,
        "centro": {
         "x": 10.74,
         "y": 5.37
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "columneta"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    },
    {
     "id": "vista-09",
     "nivel": 2,
     "categorias": {
      "ejes": [
       {
        "nombre": "18",
        "p": {
         "x": 11.82,
         "y": 5.51
        },
        "q": {
         "x": 0.35,
         "y": 5.51
        }
       },
       {
        "nombre": "17",
        "p": {
         "x": 0.35,
         "y": 5.56
        },
        "q": {
         "x": 11.82,
         "y": 5.56
        }
       },
       {
        "nombre": "18´",
        "p": {
         "x": 11.98,
         "y": 1.23
        },
        "q": {
         "x": 0.19,
         "y": 1.23
        }
       },
       {
        "nombre": "10",
        "p": {
         "x": 0.19,
         "y": 14.75
        },
        "q": {
         "x": 11.98,
         "y": 14.75
        }
       },
       {
        "nombre": "14",
        "p": {
         "x": 0.19,
         "y": 9.88
        },
        "q": {
         "x": 11.98,
         "y": 9.88
        }
       },
       {
        "nombre": "8",
        "p": {
         "x": 0,
         "y": 19.21
        },
        "q": {
         "x": 12.17,
         "y": 19.21
        }
       },
       {
        "nombre": "F",
        "p": {
         "x": 10.88,
         "y": 0
        },
        "q": {
         "x": 10.88,
         "y": 20.42
        }
       },
       {
        "nombre": "E",
        "p": {
         "x": 8.82,
         "y": 0
        },
        "q": {
         "x": 8.82,
         "y": 20.42
        }
       },
       {
        "nombre": "C",
        "p": {
         "x": 4.82,
         "y": 0
        },
        "q": {
         "x": 4.82,
         "y": 20.42
        }
       },
       {
        "nombre": "A",
        "p": {
         "x": 2.03,
         "y": 0
        },
        "q": {
         "x": 2.03,
         "y": 20.42
        }
       }
      ],
      "columnas": [
       {
        "eje": "18´/C",
        "centro": {
         "x": 4.82,
         "y": 1.23
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "18´/F",
        "centro": {
         "x": 10.88,
         "y": 1.23
        },
        "b": 0.67,
        "h": 0.67,
        "forma": "L"
       },
       {
        "eje": "18/A",
        "centro": {
         "x": 2.03,
         "y": 5.63
        },
        "b": 0.8,
        "h": 0.8,
        "forma": "L"
       },
       {
        "eje": "18/C",
        "centro": {
         "x": 4.82,
         "y": 5.84
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "18/E",
        "centro": {
         "x": 8.82,
         "y": 5.73
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "18/F",
        "centro": {
         "x": 10.88,
         "y": 5.58
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "14/A",
        "centro": {
         "x": 2.03,
         "y": 9.88
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "14/C",
        "centro": {
         "x": 4.82,
         "y": 9.88
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "14/E",
        "centro": {
         "x": 8.82,
         "y": 9.88
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "14/F",
        "centro": {
         "x": 10.88,
         "y": 9.88
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "10/A",
        "centro": {
         "x": 2.03,
         "y": 14.75
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "10/C",
        "centro": {
         "x": 4.82,
         "y": 14.75
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "10/E",
        "centro": {
         "x": 8.82,
         "y": 14.75
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "10/F",
        "centro": {
         "x": 10.88,
         "y": 14.75
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "8/A",
        "centro": {
         "x": 2.03,
         "y": 19.21
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "8/C",
        "centro": {
         "x": 4.82,
         "y": 19.21
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": "8/E",
        "centro": {
         "x": 8.82,
         "y": 19.21
        },
        "b": 0.8,
        "h": 0.8,
        "forma": "L"
       },
       {
        "eje": "8/F",
        "centro": {
         "x": 10.88,
         "y": 19.21
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "rectangular"
       },
       {
        "eje": null,
        "centro": {
         "x": 10.74,
         "y": 5.37
        },
        "b": 0.27,
        "h": 0.27,
        "forma": "columneta"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    }
   ]
  }
 },
 {
  "nombre": "ilo:modulo-08",
  "grupo": "ilo",
  "id": "modulo-08",
  "etiqueta": null,
  "rasgos": {
   "vista": "vista-01",
   "areaAbierta": false,
   "niveles": 2,
   "ejes": {
    "x": 4,
    "y": 3
   },
   "luces": {
    "x": [
     5.5,
     4.7,
     3.1
    ],
    "y": [
     7.03,
     6.75
    ]
   },
   "largo": 13.78,
   "ancho": 13.3,
   "area": 183.38,
   "luzLosa": 5.5,
   "luzMax": 7.03,
   "columnas": 9,
   "tipos": [
    {
     "nombre": "C1",
     "forma": "rectangular",
     "b": 0.43,
     "h": 0.43,
     "n": 6
    },
    {
     "nombre": "C2",
     "forma": "trapecio",
     "b": 0.61,
     "h": 0.43,
     "n": 1
    },
    {
     "nombre": "PL1",
     "forma": "L",
     "b": 1.7,
     "h": 1.26,
     "n": 1
    },
    {
     "nombre": "C3",
     "forma": "rectangular",
     "b": 0.43,
     "h": 0.41,
     "n": 1
    }
   ],
   "placas": true,
   "columnetas": 29,
   "techoLiviano": false,
   "cubierta": true,
   "falsoCielo": false,
   "deportivo": false,
   "agua": false,
   "banos": true
  },
  "decisiones": {
   "cimentacion": "zapatas",
   "cimientoCorrido": true,
   "hz": 0.6,
   "df": 1.5,
   "losa": "aligerada y maciza",
   "espesorLosa": 0.2,
   "plantasDeLosa": 3,
   "vigas": [
    "30x50",
    "30x60"
   ],
   "fcColumnas": 280,
   "fcColumnetas": 175,
   "estribos": "3/8\": 1@.05, 10@.10",
   "porticos": 8,
   "mallaCimentacion": false,
   "columnasComoArquitectura": true,
   "losaDeTecho": true
  },
  "geometria": {
   "version": 1,
   "unidad": "m",
   "vistas": [
    {
     "id": "vista-01",
     "nivel": null,
     "categorias": {
      "ejes": [
       {
        "nombre": "3",
        "p": {
         "x": 0,
         "y": 16.56
        },
        "q": {
         "x": 17.48,
         "y": 16.56
        }
       },
       {
        "nombre": "5",
        "p": {
         "x": 0,
         "y": 9.42
        },
        "q": {
         "x": 17.48,
         "y": 9.42
        }
       },
       {
        "nombre": "7",
        "p": {
         "x": 0,
         "y": 1.5
        },
        "q": {
         "x": 17.48,
         "y": 1.5
        }
       },
       {
        "nombre": "F",
        "p": {
         "x": 15.98,
         "y": 0
        },
        "q": {
         "x": 15.98,
         "y": 24.83
        }
       },
       {
        "nombre": "E",
        "p": {
         "x": 12.9,
         "y": 24.83
        },
        "q": {
         "x": 12.9,
         "y": 0
        }
       },
       {
        "nombre": "A",
        "p": {
         "x": 2.71,
         "y": 24.83
        },
        "q": {
         "x": 2.71,
         "y": 0
        }
       },
       {
        "nombre": "D",
        "p": {
         "x": 8.2,
         "y": 0
        },
        "q": {
         "x": 8.2,
         "y": 24.83
        }
       },
       {
        "nombre": "1´",
        "p": {
         "x": 17.48,
         "y": 20.73
        },
        "q": {
         "x": 16.26,
         "y": 20.73
        }
       }
      ],
      "columnas": [
       {
        "eje": "7/D",
        "centro": {
         "x": 8.2,
         "y": 1.5
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "7/E",
        "centro": {
         "x": 12.9,
         "y": 1.5
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "7/F",
        "centro": {
         "x": 15.98,
         "y": 1.5
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "5/A",
        "centro": {
         "x": 2.71,
         "y": 9.42
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "5/D",
        "centro": {
         "x": 8.2,
         "y": 9.42
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "5/E",
        "centro": {
         "x": 12.9,
         "y": 9.42
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "5/F",
        "centro": {
         "x": 15.98,
         "y": 9.42
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "3/A",
        "centro": {
         "x": 2.71,
         "y": 16.56
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "3/D",
        "centro": {
         "x": 8.2,
         "y": 16.56
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "3/E",
        "centro": {
         "x": 12.9,
         "y": 16.56
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "3/F",
        "centro": {
         "x": 15.98,
         "y": 16.56
        },
        "b": 1.22,
        "h": 1.66,
        "forma": "L"
       },
       {
        "eje": null,
        "centro": {
         "x": 6.39,
         "y": 16.53
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.11,
         "y": 16.91
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 6.41,
         "y": 21.53
        },
        "b": 0.18,
        "h": 0.22,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 2.78,
         "y": 22.46
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.25,
         "y": 16.47
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 6.39,
         "y": 20.3
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.22,
         "y": 15.26
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.28,
         "y": 9.76
        },
        "b": 0.13,
        "h": 0.24,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.55,
         "y": 9.5
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 12.55,
         "y": 9.5
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 12.98,
         "y": 9.07
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 12.98,
         "y": 7.06
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 11.7,
         "y": 9.5
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 3.28,
         "y": 22.88
        },
        "b": 0.28,
        "h": 0.24,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 12.98,
         "y": 3.06
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 7.98,
         "y": 20.9
        },
        "b": 0.28,
        "h": 0.22,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.62,
         "y": 20.63
        },
        "b": 0.28,
        "h": 0.22,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 12.68,
         "y": 18.92
        },
        "b": 0.28,
        "h": 0.22,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.32,
         "y": 18.65
        },
        "b": 0.28,
        "h": 0.22,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 14.71,
         "y": 18.07
        },
        "b": 0.28,
        "h": 0.22,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 10.65,
         "y": 19.78
        },
        "b": 0.28,
        "h": 0.22,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.11,
         "y": 20.34
        },
        "b": 0.13,
        "h": 0.33,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 2.72,
         "y": 20.61
        },
        "b": 0.25,
        "h": 0.22,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 6.63,
         "y": 15.26
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 2.75,
         "y": 15.3
        },
        "b": 0.35,
        "h": 0.21,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 12.81,
         "y": 18.41
        },
        "b": 0.13,
        "h": 0.24,
        "forma": "columneta"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    },
    {
     "id": "vista-02",
     "nivel": 1,
     "categorias": {
      "ejes": [
       {
        "nombre": "3",
        "p": {
         "x": 0,
         "y": 16.88
        },
        "q": {
         "x": 18.62,
         "y": 16.88
        }
       },
       {
        "nombre": "5",
        "p": {
         "x": 0,
         "y": 9.85
        },
        "q": {
         "x": 18.62,
         "y": 9.85
        }
       },
       {
        "nombre": "F",
        "p": {
         "x": 16.48,
         "y": 25.91
        },
        "q": {
         "x": 16.48,
         "y": 0
        }
       },
       {
        "nombre": "E",
        "p": {
         "x": 13.38,
         "y": 25.91
        },
        "q": {
         "x": 13.38,
         "y": 0
        }
       },
       {
        "nombre": "D",
        "p": {
         "x": 8.68,
         "y": 25.91
        },
        "q": {
         "x": 8.68,
         "y": 0
        }
       },
       {
        "nombre": "A",
        "p": {
         "x": 3.18,
         "y": 25.91
        },
        "q": {
         "x": 3.18,
         "y": 0
        }
       },
       {
        "nombre": "1",
        "p": {
         "x": 0,
         "y": 23.63
        },
        "q": {
         "x": 3.18,
         "y": 23.63
        }
       }
      ],
      "columnas": [
       {
        "eje": "5/A",
        "centro": {
         "x": 3.18,
         "y": 9.85
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "rectangular"
       },
       {
        "eje": "5/D",
        "centro": {
         "x": 8.68,
         "y": 9.84
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "rectangular"
       },
       {
        "eje": "5/E",
        "centro": {
         "x": 13.38,
         "y": 9.85
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "rectangular"
       },
       {
        "eje": "5/F",
        "centro": {
         "x": 16.48,
         "y": 9.85
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "rectangular"
       },
       {
        "eje": "3/A",
        "centro": {
         "x": 3.18,
         "y": 16.88
        },
        "b": 0.43,
        "h": 0.41,
        "forma": "rectangular"
       },
       {
        "eje": "3/D",
        "centro": {
         "x": 8.68,
         "y": 16.88
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "rectangular"
       },
       {
        "eje": "3/E",
        "centro": {
         "x": 13.38,
         "y": 16.88
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "rectangular"
       },
       {
        "eje": "3/F",
        "centro": {
         "x": 16.48,
         "y": 16.88
        },
        "b": 1.26,
        "h": 1.7,
        "forma": "L"
       },
       {
        "eje": "1/A",
        "centro": {
         "x": 3.18,
         "y": 23.63
        },
        "b": 0.43,
        "h": 0.61,
        "forma": "trapecio"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.68,
         "y": 2.14
        },
        "b": 0.43,
        "h": 0.41,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.38,
         "y": 2.14
        },
        "b": 0.43,
        "h": 0.41,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.59,
         "y": 17.33
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.33,
         "y": 16.9
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.7,
         "y": 15.69
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 7.11,
         "y": 15.69
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.76,
         "y": 10.2
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 12.18,
         "y": 9.93
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.46,
         "y": 7.49
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 6.87,
         "y": 16.96
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 9.03,
         "y": 9.93
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.76,
         "y": 13.67
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.76,
         "y": 13.12
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 16.27,
         "y": 2.14
        },
        "b": 0.43,
        "h": 0.41,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.46,
         "y": 3.49
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.73,
         "y": 16.9
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.29,
         "y": 17.33
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.46,
         "y": 9.5
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.03,
         "y": 9.93
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 15.2,
         "y": 18.5
        },
        "b": 0.28,
        "h": 0.22,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 3.26,
         "y": 22.89
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.59,
         "y": 20.83
        },
        "b": 0.13,
        "h": 0.21,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 9.09,
         "y": 21.06
        },
        "b": 0.28,
        "h": 0.22,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.46,
         "y": 21.33
        },
        "b": 0.28,
        "h": 0.22,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.16,
         "y": 19.35
        },
        "b": 0.28,
        "h": 0.22,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.8,
         "y": 19.08
        },
        "b": 0.28,
        "h": 0.22,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.29,
         "y": 18.83
        },
        "b": 0.13,
        "h": 0.21,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 6.87,
         "y": 21.85
        },
        "b": 0.13,
        "h": 0.21,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 3.23,
         "y": 15.73
        },
        "b": 0.35,
        "h": 0.21,
        "forma": "columneta"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    },
    {
     "id": "vista-03",
     "nivel": null,
     "categorias": {
      "ejes": [
       {
        "nombre": "1",
        "p": {
         "x": 0,
         "y": 23.44
        },
        "q": {
         "x": 18.77,
         "y": 23.44
        }
       },
       {
        "nombre": "3",
        "p": {
         "x": 0,
         "y": 16.69
        },
        "q": {
         "x": 18.77,
         "y": 16.69
        }
       },
       {
        "nombre": "5",
        "p": {
         "x": 0,
         "y": 9.44
        },
        "q": {
         "x": 18.77,
         "y": 9.44
        }
       },
       {
        "nombre": "D",
        "p": {
         "x": 8.83,
         "y": 25.18
        },
        "q": {
         "x": 8.83,
         "y": 0
        }
       },
       {
        "nombre": "F",
        "p": {
         "x": 16.63,
         "y": 25.18
        },
        "q": {
         "x": 16.63,
         "y": 0
        }
       },
       {
        "nombre": "E",
        "p": {
         "x": 13.53,
         "y": 25.18
        },
        "q": {
         "x": 13.53,
         "y": 0
        }
       },
       {
        "nombre": "A",
        "p": {
         "x": 3.33,
         "y": 25.18
        },
        "q": {
         "x": 3.33,
         "y": 0
        }
       }
      ],
      "columnas": [],
      "murosVanos": null,
      "losas": null
     }
    },
    {
     "id": "vista-04",
     "nivel": null,
     "categorias": {
      "ejes": [
       {
        "nombre": "3",
        "p": {
         "x": 0,
         "y": 16.56
        },
        "q": {
         "x": 17.48,
         "y": 16.56
        }
       },
       {
        "nombre": "5",
        "p": {
         "x": 0,
         "y": 9.42
        },
        "q": {
         "x": 17.48,
         "y": 9.42
        }
       },
       {
        "nombre": "7",
        "p": {
         "x": 0,
         "y": 1.5
        },
        "q": {
         "x": 17.48,
         "y": 1.5
        }
       },
       {
        "nombre": "F",
        "p": {
         "x": 15.98,
         "y": 0
        },
        "q": {
         "x": 15.98,
         "y": 24.83
        }
       },
       {
        "nombre": "E",
        "p": {
         "x": 12.9,
         "y": 24.83
        },
        "q": {
         "x": 12.9,
         "y": 0
        }
       },
       {
        "nombre": "A",
        "p": {
         "x": 2.71,
         "y": 24.83
        },
        "q": {
         "x": 2.71,
         "y": 0
        }
       },
       {
        "nombre": "D",
        "p": {
         "x": 8.2,
         "y": 0
        },
        "q": {
         "x": 8.2,
         "y": 24.83
        }
       },
       {
        "nombre": "1´",
        "p": {
         "x": 17.48,
         "y": 20.73
        },
        "q": {
         "x": 16.26,
         "y": 20.73
        }
       }
      ],
      "columnas": [
       {
        "eje": "7/D",
        "centro": {
         "x": 8.2,
         "y": 1.5
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "7/E",
        "centro": {
         "x": 12.9,
         "y": 1.5
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "7/F",
        "centro": {
         "x": 15.98,
         "y": 1.5
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "5/A",
        "centro": {
         "x": 2.71,
         "y": 9.42
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "5/D",
        "centro": {
         "x": 8.2,
         "y": 9.42
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "5/E",
        "centro": {
         "x": 12.9,
         "y": 9.42
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "5/F",
        "centro": {
         "x": 15.98,
         "y": 9.42
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "3/A",
        "centro": {
         "x": 2.71,
         "y": 16.56
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "3/D",
        "centro": {
         "x": 8.2,
         "y": 16.56
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "3/E",
        "centro": {
         "x": 12.9,
         "y": 16.56
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "3/F",
        "centro": {
         "x": 15.98,
         "y": 16.56
        },
        "b": 1.22,
        "h": 1.66,
        "forma": "L"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    },
    {
     "id": "vista-05",
     "nivel": 2,
     "categorias": {
      "ejes": [
       {
        "nombre": "3",
        "p": {
         "x": 0,
         "y": 16.56
        },
        "q": {
         "x": 17.48,
         "y": 16.56
        }
       },
       {
        "nombre": "5",
        "p": {
         "x": 0,
         "y": 9.42
        },
        "q": {
         "x": 17.48,
         "y": 9.42
        }
       },
       {
        "nombre": "7",
        "p": {
         "x": 0,
         "y": 1.5
        },
        "q": {
         "x": 17.48,
         "y": 1.5
        }
       },
       {
        "nombre": "F",
        "p": {
         "x": 15.98,
         "y": 0
        },
        "q": {
         "x": 15.98,
         "y": 24.83
        }
       },
       {
        "nombre": "E",
        "p": {
         "x": 12.9,
         "y": 24.83
        },
        "q": {
         "x": 12.9,
         "y": 0
        }
       },
       {
        "nombre": "A",
        "p": {
         "x": 2.71,
         "y": 24.83
        },
        "q": {
         "x": 2.71,
         "y": 0
        }
       },
       {
        "nombre": "D",
        "p": {
         "x": 8.2,
         "y": 0
        },
        "q": {
         "x": 8.2,
         "y": 24.83
        }
       },
       {
        "nombre": "1´",
        "p": {
         "x": 17.48,
         "y": 20.73
        },
        "q": {
         "x": 16.26,
         "y": 20.73
        }
       }
      ],
      "columnas": [
       {
        "eje": "7/D",
        "centro": {
         "x": 8.2,
         "y": 1.5
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "7/E",
        "centro": {
         "x": 12.9,
         "y": 1.5
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "7/F",
        "centro": {
         "x": 15.98,
         "y": 1.5
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "5/A",
        "centro": {
         "x": 2.71,
         "y": 9.42
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "5/D",
        "centro": {
         "x": 8.2,
         "y": 9.42
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "5/E",
        "centro": {
         "x": 12.9,
         "y": 9.42
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "5/F",
        "centro": {
         "x": 15.98,
         "y": 9.42
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "3/A",
        "centro": {
         "x": 2.71,
         "y": 16.56
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "3/D",
        "centro": {
         "x": 8.2,
         "y": 16.56
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "3/E",
        "centro": {
         "x": 12.9,
         "y": 16.56
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "3/F",
        "centro": {
         "x": 15.98,
         "y": 16.56
        },
        "b": 1.22,
        "h": 1.66,
        "forma": "L"
       },
       {
        "eje": null,
        "centro": {
         "x": 6.39,
         "y": 16.53
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.11,
         "y": 16.91
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 6.41,
         "y": 21.53
        },
        "b": 0.18,
        "h": 0.22,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 2.78,
         "y": 22.46
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.25,
         "y": 16.47
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 6.39,
         "y": 20.03
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.22,
         "y": 15.26
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.28,
         "y": 9.76
        },
        "b": 0.13,
        "h": 0.24,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.55,
         "y": 9.5
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 12.55,
         "y": 9.5
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 12.98,
         "y": 9.07
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 12.98,
         "y": 7.06
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 11.7,
         "y": 9.5
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 3.28,
         "y": 22.88
        },
        "b": 0.28,
        "h": 0.24,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 12.98,
         "y": 3.06
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 7.98,
         "y": 20.9
        },
        "b": 0.28,
        "h": 0.22,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.62,
         "y": 20.63
        },
        "b": 0.28,
        "h": 0.22,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 12.68,
         "y": 18.92
        },
        "b": 0.28,
        "h": 0.22,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.32,
         "y": 18.65
        },
        "b": 0.28,
        "h": 0.22,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 10.65,
         "y": 19.78
        },
        "b": 0.28,
        "h": 0.22,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.11,
         "y": 20.4
        },
        "b": 0.13,
        "h": 0.21,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 12.81,
         "y": 18.41
        },
        "b": 0.13,
        "h": 0.24,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 2.72,
         "y": 20.61
        },
        "b": 0.25,
        "h": 0.22,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 6.72,
         "y": 15.26
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 2.79,
         "y": 15.3
        },
        "b": 0.44,
        "h": 0.21,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 12.98,
         "y": 5.27
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 14.71,
         "y": 18.07
        },
        "b": 0.28,
        "h": 0.22,
        "forma": "columneta"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    },
    {
     "id": "vista-06",
     "nivel": 2,
     "categorias": {
      "ejes": [
       {
        "nombre": "3",
        "p": {
         "x": 0,
         "y": 16.56
        },
        "q": {
         "x": 17.48,
         "y": 16.56
        }
       },
       {
        "nombre": "5",
        "p": {
         "x": 0,
         "y": 9.42
        },
        "q": {
         "x": 17.48,
         "y": 9.42
        }
       },
       {
        "nombre": "7",
        "p": {
         "x": 0,
         "y": 1.5
        },
        "q": {
         "x": 17.48,
         "y": 1.5
        }
       },
       {
        "nombre": "F",
        "p": {
         "x": 15.98,
         "y": 0
        },
        "q": {
         "x": 15.98,
         "y": 24.83
        }
       },
       {
        "nombre": "E",
        "p": {
         "x": 12.9,
         "y": 24.83
        },
        "q": {
         "x": 12.9,
         "y": 0
        }
       },
       {
        "nombre": "A",
        "p": {
         "x": 2.71,
         "y": 24.83
        },
        "q": {
         "x": 2.71,
         "y": 0
        }
       },
       {
        "nombre": "D",
        "p": {
         "x": 8.2,
         "y": 0
        },
        "q": {
         "x": 8.2,
         "y": 24.83
        }
       },
       {
        "nombre": "1´",
        "p": {
         "x": 17.48,
         "y": 20.73
        },
        "q": {
         "x": 16.26,
         "y": 20.73
        }
       }
      ],
      "columnas": [
       {
        "eje": "7/D",
        "centro": {
         "x": 8.2,
         "y": 1.5
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "7/E",
        "centro": {
         "x": 12.9,
         "y": 1.5
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "7/F",
        "centro": {
         "x": 15.98,
         "y": 1.5
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "5/A",
        "centro": {
         "x": 2.71,
         "y": 9.42
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "5/D",
        "centro": {
         "x": 8.2,
         "y": 9.42
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "5/E",
        "centro": {
         "x": 12.9,
         "y": 9.42
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "5/F",
        "centro": {
         "x": 15.98,
         "y": 9.42
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "3/A",
        "centro": {
         "x": 2.71,
         "y": 16.56
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "3/D",
        "centro": {
         "x": 8.2,
         "y": 16.56
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "3/E",
        "centro": {
         "x": 12.9,
         "y": 16.56
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "3/F",
        "centro": {
         "x": 15.98,
         "y": 16.56
        },
        "b": 1.22,
        "h": 1.66,
        "forma": "L"
       },
       {
        "eje": null,
        "centro": {
         "x": 6.39,
         "y": 16.53
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.11,
         "y": 16.91
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 6.41,
         "y": 21.53
        },
        "b": 0.18,
        "h": 0.22,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 2.78,
         "y": 22.46
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 6.39,
         "y": 20.03
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 12.98,
         "y": 16.91
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 10.59,
         "y": 19.78
        },
        "b": 0.18,
        "h": 0.22,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 10.68,
         "y": 16.64
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 9.72,
         "y": 17.7
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 10.56,
         "y": 17.76
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 9.5,
         "y": 16.64
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.55,
         "y": 16.64
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 7.85,
         "y": 9.5
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 6.78,
         "y": 9.56
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 3.26,
         "y": 9.5
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.55,
         "y": 9.5
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 12.55,
         "y": 9.5
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.03,
         "y": 14.6
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.03,
         "y": 13.27
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.32,
         "y": 18.65
        },
        "b": 0.28,
        "h": 0.22,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 12.68,
         "y": 18.92
        },
        "b": 0.28,
        "h": 0.22,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.62,
         "y": 20.63
        },
        "b": 0.28,
        "h": 0.22,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 7.98,
         "y": 20.9
        },
        "b": 0.28,
        "h": 0.22,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 3.28,
         "y": 22.88
        },
        "b": 0.28,
        "h": 0.24,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 12.98,
         "y": 9.07
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 12.98,
         "y": 2.05
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 12.98,
         "y": 18.3
        },
        "b": 0.13,
        "h": 0.33,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 12.55,
         "y": 16.64
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 7.39,
         "y": 14.71
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 2.72,
         "y": 20.61
        },
        "b": 0.25,
        "h": 0.22,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 6.25,
         "y": 14.71
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 10.55,
         "y": 9.5
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 14.71,
         "y": 18.07
        },
        "b": 0.28,
        "h": 0.22,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 12.98,
         "y": 7.02
        },
        "b": 0.13,
        "h": 0.18,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 12.98,
         "y": 4.55
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.11,
         "y": 20.4
        },
        "b": 0.13,
        "h": 0.21,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 3.73,
         "y": 14.71
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    },
    {
     "id": "vista-07",
     "nivel": 3,
     "categorias": {
      "ejes": [
       {
        "nombre": "3",
        "p": {
         "x": 0,
         "y": 16.56
        },
        "q": {
         "x": 17.48,
         "y": 16.56
        }
       },
       {
        "nombre": "5",
        "p": {
         "x": 0,
         "y": 9.42
        },
        "q": {
         "x": 17.48,
         "y": 9.42
        }
       },
       {
        "nombre": "7",
        "p": {
         "x": 0,
         "y": 1.5
        },
        "q": {
         "x": 17.48,
         "y": 1.5
        }
       },
       {
        "nombre": "F",
        "p": {
         "x": 15.98,
         "y": 0
        },
        "q": {
         "x": 15.98,
         "y": 24.83
        }
       },
       {
        "nombre": "E",
        "p": {
         "x": 12.9,
         "y": 24.83
        },
        "q": {
         "x": 12.9,
         "y": 0
        }
       },
       {
        "nombre": "A",
        "p": {
         "x": 2.71,
         "y": 24.83
        },
        "q": {
         "x": 2.71,
         "y": 0
        }
       },
       {
        "nombre": "D",
        "p": {
         "x": 8.2,
         "y": 0
        },
        "q": {
         "x": 8.2,
         "y": 24.83
        }
       },
       {
        "nombre": "1´",
        "p": {
         "x": 17.48,
         "y": 20.73
        },
        "q": {
         "x": 16.26,
         "y": 20.73
        }
       }
      ],
      "columnas": [
       {
        "eje": "7/A",
        "centro": {
         "x": 2.71,
         "y": 1.5
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "rectangular"
       },
       {
        "eje": "7/F",
        "centro": {
         "x": 15.98,
         "y": 1.5
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "rectangular"
       },
       {
        "eje": null,
        "centro": {
         "x": 2.78,
         "y": 20.05
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 2.78,
         "y": 17.05
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 2.78,
         "y": 14.05
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 2.78,
         "y": 11.05
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 2.78,
         "y": 8.05
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 2.78,
         "y": 5.05
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 15.92,
         "y": 11.88
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 15.92,
         "y": 8.88
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 15.92,
         "y": 5.88
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 15.92,
         "y": 3.76
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 6.53,
         "y": 21.51
        },
        "b": 0.28,
        "h": 0.22,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.08,
         "y": 20.85
        },
        "b": 0.28,
        "h": 0.22,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 11,
         "y": 19.63
        },
        "b": 0.28,
        "h": 0.22,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 13.77,
         "y": 18.47
        },
        "b": 0.28,
        "h": 0.22,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 2.78,
         "y": 23.05
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 15.87,
         "y": 17.57
        },
        "b": 0.23,
        "h": 0.22,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 6.55,
         "y": 20.19
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.11,
         "y": 20.19
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 4.63,
         "y": 22.3
        },
        "b": 0.28,
        "h": 0.22,
        "forma": "columneta"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    },
    {
     "id": "vista-08",
     "nivel": 1,
     "categorias": {
      "ejes": [
       {
        "nombre": "3",
        "p": {
         "x": 0,
         "y": 16.56
        },
        "q": {
         "x": 17.48,
         "y": 16.56
        }
       },
       {
        "nombre": "5",
        "p": {
         "x": 0,
         "y": 9.42
        },
        "q": {
         "x": 17.48,
         "y": 9.42
        }
       },
       {
        "nombre": "7",
        "p": {
         "x": 0,
         "y": 1.5
        },
        "q": {
         "x": 17.48,
         "y": 1.5
        }
       },
       {
        "nombre": "F",
        "p": {
         "x": 15.98,
         "y": 0
        },
        "q": {
         "x": 15.98,
         "y": 24.83
        }
       },
       {
        "nombre": "E",
        "p": {
         "x": 12.9,
         "y": 24.83
        },
        "q": {
         "x": 12.9,
         "y": 0
        }
       },
       {
        "nombre": "A",
        "p": {
         "x": 2.71,
         "y": 24.83
        },
        "q": {
         "x": 2.71,
         "y": 0
        }
       },
       {
        "nombre": "D",
        "p": {
         "x": 8.2,
         "y": 0
        },
        "q": {
         "x": 8.2,
         "y": 24.83
        }
       },
       {
        "nombre": "1´",
        "p": {
         "x": 17.48,
         "y": 20.73
        },
        "q": {
         "x": 16.26,
         "y": 20.73
        }
       }
      ],
      "columnas": [
       {
        "eje": "7/D",
        "centro": {
         "x": 8.2,
         "y": 1.5
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "7/E",
        "centro": {
         "x": 12.9,
         "y": 1.5
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "7/F",
        "centro": {
         "x": 15.98,
         "y": 1.5
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "7/A",
        "centro": {
         "x": 2.71,
         "y": 1.5
        },
        "b": 0.59,
        "h": 1.14,
        "forma": "trapecio"
       },
       {
        "eje": "5/A",
        "centro": {
         "x": 2.71,
         "y": 9.42
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "5/D",
        "centro": {
         "x": 8.2,
         "y": 9.42
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "5/E",
        "centro": {
         "x": 12.9,
         "y": 9.42
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "5/F",
        "centro": {
         "x": 15.98,
         "y": 9.42
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "3/A",
        "centro": {
         "x": 2.71,
         "y": 16.56
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "3/D",
        "centro": {
         "x": 8.2,
         "y": 16.56
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "3/E",
        "centro": {
         "x": 12.9,
         "y": 16.56
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "3/F",
        "centro": {
         "x": 15.98,
         "y": 16.56
        },
        "b": 1.22,
        "h": 1.66,
        "forma": "L"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    },
    {
     "id": "vista-09",
     "nivel": 2,
     "categorias": {
      "ejes": [
       {
        "nombre": "3",
        "p": {
         "x": 0,
         "y": 16.56
        },
        "q": {
         "x": 17.48,
         "y": 16.56
        }
       },
       {
        "nombre": "5",
        "p": {
         "x": 0,
         "y": 9.42
        },
        "q": {
         "x": 17.48,
         "y": 9.42
        }
       },
       {
        "nombre": "7",
        "p": {
         "x": 0,
         "y": 1.5
        },
        "q": {
         "x": 17.48,
         "y": 1.5
        }
       },
       {
        "nombre": "F",
        "p": {
         "x": 15.98,
         "y": 0
        },
        "q": {
         "x": 15.98,
         "y": 24.83
        }
       },
       {
        "nombre": "E",
        "p": {
         "x": 12.9,
         "y": 24.83
        },
        "q": {
         "x": 12.9,
         "y": 0
        }
       },
       {
        "nombre": "A",
        "p": {
         "x": 2.71,
         "y": 24.83
        },
        "q": {
         "x": 2.71,
         "y": 0
        }
       },
       {
        "nombre": "D",
        "p": {
         "x": 8.2,
         "y": 0
        },
        "q": {
         "x": 8.2,
         "y": 24.83
        }
       },
       {
        "nombre": "1´",
        "p": {
         "x": 17.48,
         "y": 20.73
        },
        "q": {
         "x": 16.26,
         "y": 20.73
        }
       }
      ],
      "columnas": [
       {
        "eje": "7/A",
        "centro": {
         "x": 2.71,
         "y": 1.5
        },
        "b": 1.05,
        "h": 0.3,
        "forma": "rectangular"
       },
       {
        "eje": "7/D",
        "centro": {
         "x": 8.2,
         "y": 1.5
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "7/E",
        "centro": {
         "x": 12.9,
         "y": 1.5
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "7/F",
        "centro": {
         "x": 15.98,
         "y": 1.5
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "5/A",
        "centro": {
         "x": 2.71,
         "y": 9.42
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "5/D",
        "centro": {
         "x": 8.2,
         "y": 9.42
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "5/E",
        "centro": {
         "x": 12.9,
         "y": 9.42
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "5/F",
        "centro": {
         "x": 15.98,
         "y": 9.42
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "3/A",
        "centro": {
         "x": 2.71,
         "y": 16.56
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "3/D",
        "centro": {
         "x": 8.2,
         "y": 16.56
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "3/E",
        "centro": {
         "x": 12.9,
         "y": 16.56
        },
        "b": 0.4,
        "h": 0.4,
        "forma": "rectangular"
       },
       {
        "eje": "3/F",
        "centro": {
         "x": 15.98,
         "y": 16.56
        },
        "b": 1.22,
        "h": 1.66,
        "forma": "L"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    }
   ]
  }
 },
 {
  "nombre": "ilo:modulo-09",
  "grupo": "ilo",
  "id": "modulo-09",
  "etiqueta": null,
  "rasgos": {
   "vista": "vista-01",
   "areaAbierta": false,
   "niveles": 1,
   "ejes": {
    "x": 2,
    "y": 2
   },
   "luces": {
    "x": [
     4
    ],
    "y": [
     2.03
    ]
   },
   "largo": 4,
   "ancho": 2.03,
   "area": 8.12,
   "luzLosa": 2.03,
   "luzMax": 4,
   "columnas": 4,
   "tipos": [
    {
     "nombre": "C1",
     "forma": "rectangular",
     "b": 0.28,
     "h": 0.28,
     "n": 4
    }
   ],
   "placas": false,
   "columnetas": 8,
   "techoLiviano": false,
   "cubierta": false,
   "falsoCielo": false,
   "deportivo": false,
   "agua": false,
   "banos": false
  },
  "decisiones": {
   "cimentacion": "zapatas",
   "cimientoCorrido": true,
   "hz": 0.6,
   "df": 1.5,
   "losa": "aligerada",
   "espesorLosa": 0.2,
   "plantasDeLosa": 1,
   "vigas": [
    "25x25"
   ],
   "fcColumnas": 280,
   "fcColumnetas": 175,
   "estribos": "3/8\": 1@.05, 10@.10",
   "porticos": 4,
   "mallaCimentacion": false,
   "columnasComoArquitectura": null,
   "losaDeTecho": true
  },
  "geometria": {
   "version": 1,
   "unidad": "m",
   "vistas": [
    {
     "id": "vista-01",
     "nivel": null,
     "categorias": {
      "ejes": [
       {
        "nombre": "H",
        "p": {
         "x": 26.43,
         "y": 67.63
        },
        "q": {
         "x": 26.43,
         "y": 0
        }
       },
       {
        "nombre": "K",
        "p": {
         "x": 30.74,
         "y": 67.63
        },
        "q": {
         "x": 30.74,
         "y": 0
        }
       },
       {
        "nombre": "L",
        "p": {
         "x": 32.67,
         "y": 67.63
        },
        "q": {
         "x": 32.67,
         "y": 0
        }
       },
       {
        "nombre": "M",
        "p": {
         "x": 33.86,
         "y": 67.63
        },
        "q": {
         "x": 33.86,
         "y": 0
        }
       },
       {
        "nombre": "N",
        "p": {
         "x": 35.06,
         "y": 67.63
        },
        "q": {
         "x": 35.06,
         "y": 0
        }
       },
       {
        "nombre": "O",
        "p": {
         "x": 35.91,
         "y": 67.63
        },
        "q": {
         "x": 35.91,
         "y": 0
        }
       },
       {
        "nombre": "Q",
        "p": {
         "x": 39.65,
         "y": 67.63
        },
        "q": {
         "x": 39.65,
         "y": 0
        }
       },
       {
        "nombre": "R",
        "p": {
         "x": 42.63,
         "y": 67.63
        },
        "q": {
         "x": 42.63,
         "y": 0
        }
       },
       {
        "nombre": "S",
        "p": {
         "x": 44.96,
         "y": 67.63
        },
        "q": {
         "x": 44.96,
         "y": 0
        }
       },
       {
        "nombre": "Y",
        "p": {
         "x": 75.66,
         "y": 67.63
        },
        "q": {
         "x": 75.66,
         "y": 0
        }
       },
       {
        "nombre": "J",
        "p": {
         "x": 27.86,
         "y": 67.63
        },
        "q": {
         "x": 27.86,
         "y": 0
        }
       },
       {
        "nombre": "A",
        "p": {
         "x": 8.33,
         "y": 67.63
        },
        "q": {
         "x": 8.33,
         "y": 0
        }
       },
       {
        "nombre": "E",
        "p": {
         "x": 18.53,
         "y": 67.63
        },
        "q": {
         "x": 18.53,
         "y": 0
        }
       },
       {
        "nombre": "D",
        "p": {
         "x": 13.83,
         "y": 67.63
        },
        "q": {
         "x": 13.83,
         "y": 0
        }
       },
       {
        "nombre": "B",
        "p": {
         "x": 11.4,
         "y": 0
        },
        "q": {
         "x": 11.4,
         "y": 67.63
        }
       },
       {
        "nombre": "C",
        "p": {
         "x": 12.53,
         "y": 0
        },
        "q": {
         "x": 12.53,
         "y": 67.63
        }
       },
       {
        "nombre": "F",
        "p": {
         "x": 21.19,
         "y": 67.63
        },
        "q": {
         "x": 21.19,
         "y": 0
        }
       },
       {
        "nombre": "G",
        "p": {
         "x": 21.88,
         "y": 67.63
        },
        "q": {
         "x": 21.88,
         "y": 0
        }
       },
       {
        "nombre": "T",
        "p": {
         "x": 47.99,
         "y": 67.63
        },
        "q": {
         "x": 47.99,
         "y": 0
        }
       },
       {
        "nombre": "U",
        "p": {
         "x": 50.67,
         "y": 67.63
        },
        "q": {
         "x": 50.67,
         "y": 0
        }
       },
       {
        "nombre": "V",
        "p": {
         "x": 56.36,
         "y": 67.63
        },
        "q": {
         "x": 56.36,
         "y": 0
        }
       },
       {
        "nombre": "W",
        "p": {
         "x": 62.16,
         "y": 67.63
        },
        "q": {
         "x": 62.16,
         "y": 0
        }
       },
       {
        "nombre": "X",
        "p": {
         "x": 67.66,
         "y": 67.63
        },
        "q": {
         "x": 67.66,
         "y": 0
        }
       },
       {
        "nombre": "7",
        "p": {
         "x": 0.01,
         "y": 41.05
        },
        "q": {
         "x": 83.95,
         "y": 41.05
        }
       },
       {
        "nombre": "23",
        "p": {
         "x": 0.01,
         "y": 9.65
        },
        "q": {
         "x": 83.95,
         "y": 9.65
        }
       },
       {
        "nombre": "25",
        "p": {
         "x": 0.01,
         "y": 3.01
        },
        "q": {
         "x": 83.95,
         "y": 3.01
        }
       },
       {
        "nombre": "4",
        "p": {
         "x": 0,
         "y": 52.46
        },
        "q": {
         "x": 83.96,
         "y": 52.46
        }
       },
       {
        "nombre": "6",
        "p": {
         "x": 0,
         "y": 41.81
        },
        "q": {
         "x": 83.96,
         "y": 41.81
        }
       },
       {
        "nombre": "9",
        "p": {
         "x": 0,
         "y": 34.31
        },
        "q": {
         "x": 83.96,
         "y": 34.31
        }
       },
       {
        "nombre": "22",
        "p": {
         "x": 0,
         "y": 11.81
        },
        "q": {
         "x": 83.96,
         "y": 11.81
        }
       },
       {
        "nombre": "3",
        "p": {
         "x": 0,
         "y": 55.56
        },
        "q": {
         "x": 83.96,
         "y": 55.56
        }
       },
       {
        "nombre": "5",
        "p": {
         "x": 0,
         "y": 48.31
        },
        "q": {
         "x": 83.96,
         "y": 48.31
        }
       },
       {
        "nombre": "8",
        "p": {
         "x": 0,
         "y": 40.24
        },
        "q": {
         "x": 83.96,
         "y": 40.24
        }
       },
       {
        "nombre": "14",
        "p": {
         "x": 0,
         "y": 26.56
        },
        "q": {
         "x": 83.96,
         "y": 26.56
        }
       },
       {
        "nombre": "17",
        "p": {
         "x": 0,
         "y": 20.55
        },
        "q": {
         "x": 83.96,
         "y": 20.55
        }
       },
       {
        "nombre": "18",
        "p": {
         "x": 0,
         "y": 19.69
        },
        "q": {
         "x": 83.96,
         "y": 19.69
        }
       },
       {
        "nombre": "21",
        "p": {
         "x": 0,
         "y": 13.51
        },
        "q": {
         "x": 83.96,
         "y": 13.51
        }
       },
       {
        "nombre": "2",
        "p": {
         "x": 0,
         "y": 56.51
        },
        "q": {
         "x": 83.96,
         "y": 56.51
        }
       },
       {
        "nombre": "15",
        "p": {
         "x": 0,
         "y": 25.54
        },
        "q": {
         "x": 83.96,
         "y": 25.54
        }
       },
       {
        "nombre": "20",
        "p": {
         "x": 0,
         "y": 15.16
        },
        "q": {
         "x": 83.96,
         "y": 15.16
        }
       },
       {
        "nombre": "19",
        "p": {
         "x": 0,
         "y": 19.02
        },
        "q": {
         "x": 83.96,
         "y": 19.02
        }
       },
       {
        "nombre": "16",
        "p": {
         "x": 0,
         "y": 21.23
        },
        "q": {
         "x": 83.96,
         "y": 21.23
        }
       },
       {
        "nombre": "24",
        "p": {
         "x": 0,
         "y": 5.31
        },
        "q": {
         "x": 83.96,
         "y": 5.31
        }
       },
       {
        "nombre": "11",
        "p": {
         "x": 0,
         "y": 32.77
        },
        "q": {
         "x": 83.96,
         "y": 32.77
        }
       },
       {
        "nombre": "12",
        "p": {
         "x": 0,
         "y": 31.93
        },
        "q": {
         "x": 83.96,
         "y": 31.93
        }
       },
       {
        "nombre": "13",
        "p": {
         "x": 0,
         "y": 27.26
        },
        "q": {
         "x": 83.96,
         "y": 27.26
        }
       },
       {
        "nombre": "1",
        "p": {
         "x": 0,
         "y": 62.31
        },
        "q": {
         "x": 83.96,
         "y": 62.31
        }
       },
       {
        "nombre": "10",
        "p": {
         "x": 0,
         "y": 33.86
        },
        "q": {
         "x": 83.64,
         "y": 33.86
        }
       },
       {
        "nombre": "9",
        "p": {
         "x": 83.96,
         "y": 33.86
        },
        "q": {
         "x": 0.33,
         "y": 33.86
        }
       },
       {
        "nombre": "I",
        "p": {
         "x": 27.31,
         "y": 67.63
        },
        "q": {
         "x": 27.31,
         "y": 0.33
        }
       },
       {
        "nombre": "P",
        "p": {
         "x": 39.26,
         "y": 67.63
        },
        "q": {
         "x": 39.65,
         "y": 0.33
        }
       },
       {
        "nombre": "J",
        "p": {
         "x": 27.31,
         "y": 0
        },
        "q": {
         "x": 27.31,
         "y": 67.31
        }
       },
       {
        "nombre": "Q",
        "p": {
         "x": 39.26,
         "y": 0
        },
        "q": {
         "x": 39.65,
         "y": 67.31
        }
       }
      ],
      "columnas": [
       {
        "eje": "25/B",
        "centro": {
         "x": 11.4,
         "y": 3.01
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "rectangular"
       },
       {
        "eje": "25/E",
        "centro": {
         "x": 18.53,
         "y": 3.01
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "rectangular"
       },
       {
        "eje": "25/F",
        "centro": {
         "x": 21.19,
         "y": 3.01
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "rectangular"
       },
       {
        "eje": "25/A",
        "centro": {
         "x": 8.33,
         "y": 3.01
        },
        "b": 1.2,
        "h": 1.2,
        "forma": "L"
       },
       {
        "eje": "23/A",
        "centro": {
         "x": 8.33,
         "y": 9.65
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "rectangular"
       },
       {
        "eje": "21/F",
        "centro": {
         "x": 21.19,
         "y": 13.51
        },
        "b": 1.23,
        "h": 1.23,
        "forma": "L"
       },
       {
        "eje": "21/B",
        "centro": {
         "x": 11.4,
         "y": 13.51
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "rectangular"
       },
       {
        "eje": "21/E",
        "centro": {
         "x": 18.53,
         "y": 13.51
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "rectangular"
       },
       {
        "eje": "1/Y",
        "centro": {
         "x": 75.66,
         "y": 62.31
        },
        "b": 0.28,
        "h": 0.28,
        "forma": "rectangular"
       },
       {
        "eje": null,
        "centro": {
         "x": 5.47,
         "y": 0.62
        },
        "b": 0.28,
        "h": 0.28,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 5.47,
         "y": 2.82
        },
        "b": 0.28,
        "h": 0.28,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.52,
         "y": 2.82
        },
        "b": 0.28,
        "h": 0.28,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.52,
         "y": 0.62
        },
        "b": 0.28,
        "h": 0.28,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 79.55,
         "y": 60.42
        },
        "b": 0.28,
        "h": 0.28,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 75.83,
         "y": 60.42
        },
        "b": 0.28,
        "h": 0.28,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 11.78,
         "y": 13.43
        },
        "b": 0.32,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 18.15,
         "y": 13.43
        },
        "b": 0.32,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 11.02,
         "y": 3.09
        },
        "b": 0.32,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 18.62,
         "y": 3.57
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 17.28,
         "y": 3.09
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 14.82,
         "y": 6.03
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 18.62,
         "y": 6.03
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 18.45,
         "y": 10.45
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 11.11,
         "y": 13.34
        },
        "b": 0.15,
        "h": 0.28,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.48,
         "y": 9.97
        },
        "b": 0.25,
        "h": 0.19,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 18.96,
         "y": 10.39
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 21.04,
         "y": 10.39
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 18.96,
         "y": 6.09
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 21.04,
         "y": 6.09
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 11.74,
         "y": 3.09
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 21.56,
         "y": 3.57
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 21.56,
         "y": 7.86
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 9.73,
         "y": 3.09
        },
        "b": 0.32,
        "h": 0.13,
        "forma": "columneta"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    },
    {
     "id": "vista-02",
     "nivel": null,
     "categorias": {
      "ejes": [
       {
        "nombre": "Y´",
        "p": {
         "x": 1.72,
         "y": 7.44
        },
        "q": {
         "x": 1.72,
         "y": 0
        }
       },
       {
        "nombre": "Z",
        "p": {
         "x": 9.66,
         "y": 7.44
        },
        "q": {
         "x": 9.66,
         "y": 0
        }
       },
       {
        "nombre": "1",
        "p": {
         "x": 0,
         "y": 5.72
        },
        "q": {
         "x": 11.37,
         "y": 5.72
        }
       },
       {
        "nombre": "1´",
        "p": {
         "x": 0,
         "y": 1.72
        },
        "q": {
         "x": 11.37,
         "y": 1.72
        }
       }
      ],
      "columnas": [
       {
        "eje": "1´/Y´",
        "centro": {
         "x": 1.72,
         "y": 1.72
        },
        "b": 0.5,
        "h": 0.5,
        "forma": "rectangular"
       },
       {
        "eje": "1´/Z",
        "centro": {
         "x": 9.66,
         "y": 1.72
        },
        "b": 0.5,
        "h": 0.5,
        "forma": "rectangular"
       },
       {
        "eje": "1/Y´",
        "centro": {
         "x": 1.72,
         "y": 5.72
        },
        "b": 0.5,
        "h": 0.5,
        "forma": "rectangular"
       },
       {
        "eje": "1/Z",
        "centro": {
         "x": 9.66,
         "y": 5.72
        },
        "b": 0.5,
        "h": 0.5,
        "forma": "rectangular"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    },
    {
     "id": "vista-03",
     "nivel": null,
     "categorias": {
      "ejes": [
       {
        "nombre": "Y´",
        "p": {
         "x": 1.72,
         "y": 7.44
        },
        "q": {
         "x": 1.72,
         "y": 0
        }
       },
       {
        "nombre": "Z",
        "p": {
         "x": 9.66,
         "y": 7.44
        },
        "q": {
         "x": 9.66,
         "y": 0
        }
       },
       {
        "nombre": "1",
        "p": {
         "x": 0,
         "y": 5.72
        },
        "q": {
         "x": 11.37,
         "y": 5.72
        }
       },
       {
        "nombre": "1´",
        "p": {
         "x": 0,
         "y": 1.72
        },
        "q": {
         "x": 11.37,
         "y": 1.72
        }
       }
      ],
      "columnas": [
       {
        "eje": "1´/Y´",
        "centro": {
         "x": 1.72,
         "y": 1.72
        },
        "b": 0.5,
        "h": 0.5,
        "forma": "rectangular"
       },
       {
        "eje": "1´/Z",
        "centro": {
         "x": 9.66,
         "y": 1.72
        },
        "b": 0.5,
        "h": 0.5,
        "forma": "rectangular"
       },
       {
        "eje": "1/Y´",
        "centro": {
         "x": 1.72,
         "y": 5.72
        },
        "b": 0.5,
        "h": 0.5,
        "forma": "rectangular"
       },
       {
        "eje": "1/Z",
        "centro": {
         "x": 9.66,
         "y": 5.72
        },
        "b": 0.5,
        "h": 0.5,
        "forma": "rectangular"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    },
    {
     "id": "vista-04",
     "nivel": null,
     "categorias": {
      "ejes": [
       {
        "nombre": "Y´",
        "p": {
         "x": 1.99,
         "y": 0
        },
        "q": {
         "x": 1.99,
         "y": 9.44
        }
       },
       {
        "nombre": "Z",
        "p": {
         "x": 9.93,
         "y": 9.44
        },
        "q": {
         "x": 9.93,
         "y": 0
        }
       },
       {
        "nombre": "1",
        "p": {
         "x": 0,
         "y": 6.72
        },
        "q": {
         "x": 11.92,
         "y": 6.72
        }
       },
       {
        "nombre": "1´",
        "p": {
         "x": 0,
         "y": 2.72
        },
        "q": {
         "x": 11.92,
         "y": 2.72
        }
       }
      ],
      "columnas": [
       {
        "eje": "1´/Y´",
        "centro": {
         "x": 1.99,
         "y": 2.72
        },
        "b": 0.5,
        "h": 0.5,
        "forma": "rectangular"
       },
       {
        "eje": "1´/Z",
        "centro": {
         "x": 9.93,
         "y": 2.72
        },
        "b": 0.5,
        "h": 0.5,
        "forma": "rectangular"
       },
       {
        "eje": "1/Y´",
        "centro": {
         "x": 1.99,
         "y": 6.72
        },
        "b": 0.5,
        "h": 0.5,
        "forma": "rectangular"
       },
       {
        "eje": "1/Z",
        "centro": {
         "x": 9.93,
         "y": 6.72
        },
        "b": 0.5,
        "h": 0.5,
        "forma": "rectangular"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    }
   ]
  }
 },
 {
  "nombre": "ilo:modulo-10",
  "grupo": "ilo",
  "id": "modulo-10",
  "etiqueta": null,
  "rasgos": {
   "vista": "vista-01",
   "areaAbierta": false,
   "niveles": 1,
   "ejes": {
    "x": 2,
    "y": 2
   },
   "luces": {
    "x": [
     3.33
    ],
    "y": [
     2.5
    ]
   },
   "largo": 3.33,
   "ancho": 2.5,
   "area": 8.33,
   "luzLosa": 2.5,
   "luzMax": 3.33,
   "columnas": 4,
   "tipos": [
    {
     "nombre": "C1",
     "forma": "rectangular",
     "b": 0.28,
     "h": 0.28,
     "n": 4
    }
   ],
   "placas": false,
   "columnetas": 10,
   "techoLiviano": false,
   "cubierta": false,
   "falsoCielo": false,
   "deportivo": false,
   "agua": false,
   "banos": false
  },
  "decisiones": {
   "cimentacion": "zapatas",
   "cimientoCorrido": true,
   "hz": 0.6,
   "df": 1.5,
   "losa": "aligerada",
   "espesorLosa": 0.2,
   "plantasDeLosa": 1,
   "vigas": [
    "25x25"
   ],
   "fcColumnas": 280,
   "fcColumnetas": 175,
   "estribos": "3/8\": 1@.05, 10@.10",
   "porticos": 4,
   "mallaCimentacion": null,
   "columnasComoArquitectura": null,
   "losaDeTecho": true
  },
  "geometria": {
   "version": 1,
   "unidad": "m",
   "vistas": [
    {
     "id": "vista-01",
     "nivel": null,
     "categorias": {
      "ejes": [
       {
        "nombre": "H",
        "p": {
         "x": 26.43,
         "y": 67.63
        },
        "q": {
         "x": 26.43,
         "y": 0
        }
       },
       {
        "nombre": "K",
        "p": {
         "x": 30.74,
         "y": 67.63
        },
        "q": {
         "x": 30.74,
         "y": 0
        }
       },
       {
        "nombre": "L",
        "p": {
         "x": 32.67,
         "y": 67.63
        },
        "q": {
         "x": 32.67,
         "y": 0
        }
       },
       {
        "nombre": "M",
        "p": {
         "x": 33.86,
         "y": 67.63
        },
        "q": {
         "x": 33.86,
         "y": 0
        }
       },
       {
        "nombre": "N",
        "p": {
         "x": 35.06,
         "y": 67.63
        },
        "q": {
         "x": 35.06,
         "y": 0
        }
       },
       {
        "nombre": "O",
        "p": {
         "x": 35.91,
         "y": 67.63
        },
        "q": {
         "x": 35.91,
         "y": 0
        }
       },
       {
        "nombre": "Q",
        "p": {
         "x": 39.65,
         "y": 67.63
        },
        "q": {
         "x": 39.65,
         "y": 0
        }
       },
       {
        "nombre": "R",
        "p": {
         "x": 42.63,
         "y": 67.63
        },
        "q": {
         "x": 42.63,
         "y": 0
        }
       },
       {
        "nombre": "S",
        "p": {
         "x": 44.96,
         "y": 67.63
        },
        "q": {
         "x": 44.96,
         "y": 0
        }
       },
       {
        "nombre": "Y",
        "p": {
         "x": 75.66,
         "y": 67.63
        },
        "q": {
         "x": 75.66,
         "y": 0
        }
       },
       {
        "nombre": "J",
        "p": {
         "x": 27.86,
         "y": 67.63
        },
        "q": {
         "x": 27.86,
         "y": 0
        }
       },
       {
        "nombre": "A",
        "p": {
         "x": 8.33,
         "y": 67.63
        },
        "q": {
         "x": 8.33,
         "y": 0
        }
       },
       {
        "nombre": "E",
        "p": {
         "x": 18.53,
         "y": 67.63
        },
        "q": {
         "x": 18.53,
         "y": 0
        }
       },
       {
        "nombre": "D",
        "p": {
         "x": 13.83,
         "y": 67.63
        },
        "q": {
         "x": 13.83,
         "y": 0
        }
       },
       {
        "nombre": "B",
        "p": {
         "x": 11.4,
         "y": 0
        },
        "q": {
         "x": 11.4,
         "y": 67.63
        }
       },
       {
        "nombre": "C",
        "p": {
         "x": 12.53,
         "y": 0
        },
        "q": {
         "x": 12.53,
         "y": 67.63
        }
       },
       {
        "nombre": "F",
        "p": {
         "x": 21.19,
         "y": 67.63
        },
        "q": {
         "x": 21.19,
         "y": 0
        }
       },
       {
        "nombre": "G",
        "p": {
         "x": 21.88,
         "y": 67.63
        },
        "q": {
         "x": 21.88,
         "y": 0
        }
       },
       {
        "nombre": "T",
        "p": {
         "x": 47.99,
         "y": 67.63
        },
        "q": {
         "x": 47.99,
         "y": 0
        }
       },
       {
        "nombre": "U",
        "p": {
         "x": 50.67,
         "y": 67.63
        },
        "q": {
         "x": 50.67,
         "y": 0
        }
       },
       {
        "nombre": "V",
        "p": {
         "x": 56.36,
         "y": 67.63
        },
        "q": {
         "x": 56.36,
         "y": 0
        }
       },
       {
        "nombre": "W",
        "p": {
         "x": 62.16,
         "y": 67.63
        },
        "q": {
         "x": 62.16,
         "y": 0
        }
       },
       {
        "nombre": "X",
        "p": {
         "x": 67.66,
         "y": 67.63
        },
        "q": {
         "x": 67.66,
         "y": 0
        }
       },
       {
        "nombre": "7",
        "p": {
         "x": 0.01,
         "y": 41.05
        },
        "q": {
         "x": 83.95,
         "y": 41.05
        }
       },
       {
        "nombre": "23",
        "p": {
         "x": 0.01,
         "y": 9.65
        },
        "q": {
         "x": 83.95,
         "y": 9.65
        }
       },
       {
        "nombre": "25",
        "p": {
         "x": 0.01,
         "y": 3.01
        },
        "q": {
         "x": 83.95,
         "y": 3.01
        }
       },
       {
        "nombre": "4",
        "p": {
         "x": 0,
         "y": 52.46
        },
        "q": {
         "x": 83.96,
         "y": 52.46
        }
       },
       {
        "nombre": "6",
        "p": {
         "x": 0,
         "y": 41.81
        },
        "q": {
         "x": 83.96,
         "y": 41.81
        }
       },
       {
        "nombre": "9",
        "p": {
         "x": 0,
         "y": 34.31
        },
        "q": {
         "x": 83.96,
         "y": 34.31
        }
       },
       {
        "nombre": "22",
        "p": {
         "x": 0,
         "y": 11.81
        },
        "q": {
         "x": 83.96,
         "y": 11.81
        }
       },
       {
        "nombre": "3",
        "p": {
         "x": 0,
         "y": 55.56
        },
        "q": {
         "x": 83.96,
         "y": 55.56
        }
       },
       {
        "nombre": "5",
        "p": {
         "x": 0,
         "y": 48.31
        },
        "q": {
         "x": 83.96,
         "y": 48.31
        }
       },
       {
        "nombre": "8",
        "p": {
         "x": 0,
         "y": 40.24
        },
        "q": {
         "x": 83.96,
         "y": 40.24
        }
       },
       {
        "nombre": "14",
        "p": {
         "x": 0,
         "y": 26.56
        },
        "q": {
         "x": 83.96,
         "y": 26.56
        }
       },
       {
        "nombre": "17",
        "p": {
         "x": 0,
         "y": 20.55
        },
        "q": {
         "x": 83.96,
         "y": 20.55
        }
       },
       {
        "nombre": "18",
        "p": {
         "x": 0,
         "y": 19.69
        },
        "q": {
         "x": 83.96,
         "y": 19.69
        }
       },
       {
        "nombre": "21",
        "p": {
         "x": 0,
         "y": 13.51
        },
        "q": {
         "x": 83.96,
         "y": 13.51
        }
       },
       {
        "nombre": "2",
        "p": {
         "x": 0,
         "y": 56.51
        },
        "q": {
         "x": 83.96,
         "y": 56.51
        }
       },
       {
        "nombre": "15",
        "p": {
         "x": 0,
         "y": 25.54
        },
        "q": {
         "x": 83.96,
         "y": 25.54
        }
       },
       {
        "nombre": "20",
        "p": {
         "x": 0,
         "y": 15.16
        },
        "q": {
         "x": 83.96,
         "y": 15.16
        }
       },
       {
        "nombre": "19",
        "p": {
         "x": 0,
         "y": 19.02
        },
        "q": {
         "x": 83.96,
         "y": 19.02
        }
       },
       {
        "nombre": "16",
        "p": {
         "x": 0,
         "y": 21.23
        },
        "q": {
         "x": 83.96,
         "y": 21.23
        }
       },
       {
        "nombre": "24",
        "p": {
         "x": 0,
         "y": 5.31
        },
        "q": {
         "x": 83.96,
         "y": 5.31
        }
       },
       {
        "nombre": "11",
        "p": {
         "x": 0,
         "y": 32.77
        },
        "q": {
         "x": 83.96,
         "y": 32.77
        }
       },
       {
        "nombre": "12",
        "p": {
         "x": 0,
         "y": 31.93
        },
        "q": {
         "x": 83.96,
         "y": 31.93
        }
       },
       {
        "nombre": "13",
        "p": {
         "x": 0,
         "y": 27.26
        },
        "q": {
         "x": 83.96,
         "y": 27.26
        }
       },
       {
        "nombre": "1",
        "p": {
         "x": 0,
         "y": 62.31
        },
        "q": {
         "x": 83.96,
         "y": 62.31
        }
       },
       {
        "nombre": "10",
        "p": {
         "x": 0,
         "y": 33.86
        },
        "q": {
         "x": 83.64,
         "y": 33.86
        }
       },
       {
        "nombre": "9",
        "p": {
         "x": 83.96,
         "y": 33.86
        },
        "q": {
         "x": 0.33,
         "y": 33.86
        }
       },
       {
        "nombre": "I",
        "p": {
         "x": 27.31,
         "y": 67.63
        },
        "q": {
         "x": 27.31,
         "y": 0.33
        }
       },
       {
        "nombre": "P",
        "p": {
         "x": 39.26,
         "y": 67.63
        },
        "q": {
         "x": 39.65,
         "y": 0.33
        }
       },
       {
        "nombre": "J",
        "p": {
         "x": 27.31,
         "y": 0
        },
        "q": {
         "x": 27.31,
         "y": 67.31
        }
       },
       {
        "nombre": "Q",
        "p": {
         "x": 39.26,
         "y": 0
        },
        "q": {
         "x": 39.65,
         "y": 67.31
        }
       }
      ],
      "columnas": [
       {
        "eje": "25/B",
        "centro": {
         "x": 11.4,
         "y": 3.01
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "rectangular"
       },
       {
        "eje": "25/E",
        "centro": {
         "x": 18.53,
         "y": 3.01
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "rectangular"
       },
       {
        "eje": "25/F",
        "centro": {
         "x": 21.19,
         "y": 3.01
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "rectangular"
       },
       {
        "eje": "25/A",
        "centro": {
         "x": 8.33,
         "y": 3.01
        },
        "b": 1.2,
        "h": 1.2,
        "forma": "L"
       },
       {
        "eje": "23/A",
        "centro": {
         "x": 8.33,
         "y": 9.65
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "rectangular"
       },
       {
        "eje": "21/F",
        "centro": {
         "x": 21.19,
         "y": 13.51
        },
        "b": 1.23,
        "h": 1.23,
        "forma": "L"
       },
       {
        "eje": "21/B",
        "centro": {
         "x": 11.4,
         "y": 13.51
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "rectangular"
       },
       {
        "eje": "21/E",
        "centro": {
         "x": 18.53,
         "y": 13.51
        },
        "b": 0.43,
        "h": 0.43,
        "forma": "rectangular"
       },
       {
        "eje": "1/Y",
        "centro": {
         "x": 75.66,
         "y": 62.31
        },
        "b": 0.28,
        "h": 0.28,
        "forma": "rectangular"
       },
       {
        "eje": null,
        "centro": {
         "x": 5.47,
         "y": 0.62
        },
        "b": 0.28,
        "h": 0.28,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 5.47,
         "y": 2.82
        },
        "b": 0.28,
        "h": 0.28,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.52,
         "y": 2.82
        },
        "b": 0.28,
        "h": 0.28,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.52,
         "y": 0.62
        },
        "b": 0.28,
        "h": 0.28,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 79.55,
         "y": 60.42
        },
        "b": 0.28,
        "h": 0.28,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 75.83,
         "y": 60.42
        },
        "b": 0.28,
        "h": 0.28,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 11.78,
         "y": 13.43
        },
        "b": 0.32,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 18.15,
         "y": 13.43
        },
        "b": 0.32,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 11.02,
         "y": 3.09
        },
        "b": 0.32,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 18.62,
         "y": 3.57
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 17.28,
         "y": 3.09
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 14.82,
         "y": 6.03
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 18.62,
         "y": 6.03
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 18.45,
         "y": 10.45
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 11.11,
         "y": 13.34
        },
        "b": 0.15,
        "h": 0.28,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 8.48,
         "y": 9.97
        },
        "b": 0.25,
        "h": 0.19,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 18.96,
         "y": 10.39
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 21.04,
         "y": 10.39
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 18.96,
         "y": 6.09
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 21.04,
         "y": 6.09
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 11.74,
         "y": 3.09
        },
        "b": 0.25,
        "h": 0.13,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 21.56,
         "y": 3.57
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 21.56,
         "y": 7.86
        },
        "b": 0.13,
        "h": 0.25,
        "forma": "columneta"
       },
       {
        "eje": null,
        "centro": {
         "x": 9.73,
         "y": 3.09
        },
        "b": 0.32,
        "h": 0.13,
        "forma": "columneta"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    },
    {
     "id": "vista-02",
     "nivel": null,
     "categorias": {
      "ejes": [
       {
        "nombre": "25´",
        "p": {
         "x": 10.04,
         "y": 0
        },
        "q": {
         "x": 0,
         "y": 0
        }
       },
       {
        "nombre": "A´",
        "p": {
         "x": 1.72,
         "y": 1.69
        },
        "q": {
         "x": 1.72,
         "y": 0.31
        }
       },
       {
        "nombre": "A",
        "p": {
         "x": 8.32,
         "y": 1.69
        },
        "q": {
         "x": 8.32,
         "y": 0.31
        }
       }
      ],
      "columnas": [],
      "murosVanos": null,
      "losas": null
     }
    },
    {
     "id": "vista-03",
     "nivel": null,
     "categorias": {
      "ejes": [
       {
        "nombre": "25´",
        "p": {
         "x": 10.04,
         "y": 0
        },
        "q": {
         "x": 0,
         "y": 0
        }
       },
       {
        "nombre": "A´",
        "p": {
         "x": 1.72,
         "y": 1.69
        },
        "q": {
         "x": 1.72,
         "y": 0.31
        }
       },
       {
        "nombre": "A",
        "p": {
         "x": 8.32,
         "y": 1.69
        },
        "q": {
         "x": 8.32,
         "y": 0.31
        }
       }
      ],
      "columnas": [],
      "murosVanos": null,
      "losas": null
     }
    },
    {
     "id": "vista-04",
     "nivel": null,
     "categorias": {
      "ejes": [
       {
        "nombre": "26",
        "p": {
         "x": 10.04,
         "y": 1.69
        },
        "q": {
         "x": 0,
         "y": 1.69
        }
       },
       {
        "nombre": "80",
        "p": {
         "x": 1.72,
         "y": 0
        },
        "q": {
         "x": 1.72,
         "y": 1.38
        }
       },
       {
        "nombre": "80",
        "p": {
         "x": 8.32,
         "y": 0
        },
        "q": {
         "x": 8.32,
         "y": 1.38
        }
       }
      ],
      "columnas": [],
      "murosVanos": null,
      "losas": null
     }
    },
    {
     "id": "vista-05",
     "nivel": null,
     "categorias": {
      "ejes": [
       {
        "nombre": "26",
        "p": {
         "x": 10.04,
         "y": 1.69
        },
        "q": {
         "x": 0,
         "y": 1.69
        }
       },
       {
        "nombre": "80",
        "p": {
         "x": 1.72,
         "y": 0
        },
        "q": {
         "x": 1.72,
         "y": 1.38
        }
       },
       {
        "nombre": "80",
        "p": {
         "x": 8.32,
         "y": 0
        },
        "q": {
         "x": 8.32,
         "y": 1.38
        }
       }
      ],
      "columnas": [
       {
        "eje": "26/80",
        "centro": {
         "x": 1.72,
         "y": 1.69
        },
        "b": 0.5,
        "h": 0.5,
        "forma": "rectangular"
       },
       {
        "eje": "26/80",
        "centro": {
         "x": 8.32,
         "y": 1.69
        },
        "b": 0.5,
        "h": 0.5,
        "forma": "rectangular"
       }
      ],
      "murosVanos": null,
      "losas": null
     }
    }
   ]
  }
 },
 {
  "nombre": "ilo:modulo-11",
  "grupo": "ilo",
  "id": "modulo-11",
  "etiqueta": null,
  "rasgos": {
   "vista": "vista-01",
   "areaAbierta": false,
   "niveles": 1,
   "ejes": {
    "x": 2,
    "y": 12
   },
   "luces": {
    "x": [
     3.8
    ],
    "y": [
     2.32,
     2.24,
     2.24,
     2.24,
     2.24,
     2.24,
     2.24,
     2.24,
     2.24,
     2.24,
     2.32
    ]
   },
   "largo": 24.79,
   "ancho": 3.8,
   "area": 94.11,
   "luzLosa": 2.32,
   "luzMax": 3.8,
   "columnas": 0,
   "tipos": [],
   "placas": false,
   "columnetas": 0,
   "techoLiviano": true,
   "cubierta": true,
   "falsoCielo": false,
   "deportivo": false,
   "agua": false,
   "banos": false
  },
  "decisiones": {
   "cimentacion": "cimiento corrido",
   "cimientoCorrido": true,
   "hz": null,
   "df": null,
   "losa": null,
   "espesorLosa": null,
   "plantasDeLosa": 0,
   "vigas": [],
   "fcColumnas": null,
   "fcColumnetas": null,
   "estribos": null,
   "porticos": 0,
   "mallaCimentacion": null,
   "columnasComoArquitectura": null,
   "losaDeTecho": false
  },
  "geometria": {
   "version": 1,
   "unidad": "m",
   "vistas": [
    {
     "id": "vista-01",
     "nivel": null,
     "categorias": {
      "ejes": [
       {
        "nombre": "1",
        "p": {
         "x": 1.05,
         "y": 4.77
        },
        "q": {
         "x": 1.05,
         "y": 0
        }
       },
       {
        "nombre": "2",
        "p": {
         "x": 2.6,
         "y": 4.77
        },
        "q": {
         "x": 2.6,
         "y": 0
        }
       },
       {
        "nombre": "3",
        "p": {
         "x": 4.09,
         "y": 4.77
        },
        "q": {
         "x": 4.09,
         "y": 0
        }
       },
       {
        "nombre": "4",
        "p": {
         "x": 5.58,
         "y": 4.77
        },
        "q": {
         "x": 5.58,
         "y": 0
        }
       },
       {
        "nombre": "5",
        "p": {
         "x": 7.08,
         "y": 4.77
        },
        "q": {
         "x": 7.08,
         "y": 0
        }
       },
       {
        "nombre": "6",
        "p": {
         "x": 8.57,
         "y": 4.77
        },
        "q": {
         "x": 8.57,
         "y": 0
        }
       },
       {
        "nombre": "7",
        "p": {
         "x": 10.06,
         "y": 4.77
        },
        "q": {
         "x": 10.06,
         "y": 0
        }
       },
       {
        "nombre": "8",
        "p": {
         "x": 11.56,
         "y": 4.77
        },
        "q": {
         "x": 11.56,
         "y": 0
        }
       },
       {
        "nombre": "9",
        "p": {
         "x": 13.05,
         "y": 4.77
        },
        "q": {
         "x": 13.05,
         "y": 0
        }
       },
       {
        "nombre": "10",
        "p": {
         "x": 14.54,
         "y": 4.77
        },
        "q": {
         "x": 14.54,
         "y": 0
        }
       },
       {
        "nombre": "11",
        "p": {
         "x": 16.04,
         "y": 4.77
        },
        "q": {
         "x": 16.04,
         "y": 0
        }
       },
       {
        "nombre": "12",
        "p": {
         "x": 17.58,
         "y": 4.77
        },
        "q": {
         "x": 17.58,
         "y": 0
        }
       },
       {
        "nombre": "B",
        "p": {
         "x": 0,
         "y": 1.19
        },
        "q": {
         "x": 18.63,
         "y": 1.19
        }
       },
       {
        "nombre": "A",
        "p": {
         "x": 0,
         "y": 3.58
        },
        "q": {
         "x": 18.63,
         "y": 3.58
        }
       }
      ],
      "columnas": [],
      "murosVanos": null,
      "losas": null
     }
    },
    {
     "id": "vista-02",
     "nivel": null,
     "categorias": {
      "ejes": [
       {
        "nombre": "1",
        "p": {
         "x": 1.22,
         "y": 0
        },
        "q": {
         "x": 1.22,
         "y": 4.92
        }
       },
       {
        "nombre": "2",
        "p": {
         "x": 2.77,
         "y": 0
        },
        "q": {
         "x": 2.77,
         "y": 4.92
        }
       },
       {
        "nombre": "3",
        "p": {
         "x": 4.26,
         "y": 0
        },
        "q": {
         "x": 4.26,
         "y": 4.92
        }
       },
       {
        "nombre": "4",
        "p": {
         "x": 5.75,
         "y": 0
        },
        "q": {
         "x": 5.75,
         "y": 4.92
        }
       },
       {
        "nombre": "5",
        "p": {
         "x": 7.25,
         "y": 0
        },
        "q": {
         "x": 7.25,
         "y": 4.92
        }
       },
       {
        "nombre": "6",
        "p": {
         "x": 8.74,
         "y": 0
        },
        "q": {
         "x": 8.74,
         "y": 4.92
        }
       },
       {
        "nombre": "7",
        "p": {
         "x": 10.23,
         "y": 0
        },
        "q": {
         "x": 10.23,
         "y": 4.92
        }
       },
       {
        "nombre": "8",
        "p": {
         "x": 11.73,
         "y": 0
        },
        "q": {
         "x": 11.73,
         "y": 4.92
        }
       },
       {
        "nombre": "9",
        "p": {
         "x": 13.22,
         "y": 0
        },
        "q": {
         "x": 13.22,
         "y": 4.92
        }
       },
       {
        "nombre": "10",
        "p": {
         "x": 14.71,
         "y": 0
        },
        "q": {
         "x": 14.71,
         "y": 4.92
        }
       },
       {
        "nombre": "11",
        "p": {
         "x": 16.21,
         "y": 0
        },
        "q": {
         "x": 16.21,
         "y": 4.92
        }
       },
       {
        "nombre": "12",
        "p": {
         "x": 17.75,
         "y": 0
        },
        "q": {
         "x": 17.75,
         "y": 4.92
        }
       },
       {
        "nombre": "B",
        "p": {
         "x": 0,
         "y": 1.34
        },
        "q": {
         "x": 19.04,
         "y": 1.34
        }
       },
       {
        "nombre": "A",
        "p": {
         "x": 0,
         "y": 3.73
        },
        "q": {
         "x": 19.04,
         "y": 3.73
        }
       }
      ],
      "columnas": [],
      "murosVanos": null,
      "losas": null
     }
    },
    {
     "id": "vista-03",
     "nivel": null,
     "categorias": {
      "ejes": [
       {
        "nombre": "1",
        "p": {
         "x": 1.22,
         "y": 0
        },
        "q": {
         "x": 1.22,
         "y": 4.89
        }
       },
       {
        "nombre": "2",
        "p": {
         "x": 2.76,
         "y": 0
        },
        "q": {
         "x": 2.76,
         "y": 4.89
        }
       },
       {
        "nombre": "3",
        "p": {
         "x": 4.25,
         "y": 0
        },
        "q": {
         "x": 4.25,
         "y": 4.89
        }
       },
       {
        "nombre": "4",
        "p": {
         "x": 5.75,
         "y": 0
        },
        "q": {
         "x": 5.75,
         "y": 4.89
        }
       },
       {
        "nombre": "5",
        "p": {
         "x": 7.24,
         "y": 0
        },
        "q": {
         "x": 7.24,
         "y": 4.89
        }
       },
       {
        "nombre": "6",
        "p": {
         "x": 8.73,
         "y": 0
        },
        "q": {
         "x": 8.73,
         "y": 4.89
        }
       },
       {
        "nombre": "7",
        "p": {
         "x": 10.23,
         "y": 0
        },
        "q": {
         "x": 10.23,
         "y": 4.89
        }
       },
       {
        "nombre": "8",
        "p": {
         "x": 11.72,
         "y": 0
        },
        "q": {
         "x": 11.72,
         "y": 4.89
        }
       },
       {
        "nombre": "9",
        "p": {
         "x": 13.21,
         "y": 0
        },
        "q": {
         "x": 13.21,
         "y": 4.89
        }
       },
       {
        "nombre": "10",
        "p": {
         "x": 14.71,
         "y": 0
        },
        "q": {
         "x": 14.71,
         "y": 4.89
        }
       },
       {
        "nombre": "11",
        "p": {
         "x": 16.2,
         "y": 0
        },
        "q": {
         "x": 16.2,
         "y": 4.89
        }
       },
       {
        "nombre": "12",
        "p": {
         "x": 17.74,
         "y": 0
        },
        "q": {
         "x": 17.74,
         "y": 4.89
        }
       },
       {
        "nombre": "B",
        "p": {
         "x": 0,
         "y": 1.31
        },
        "q": {
         "x": 19.03,
         "y": 1.31
        }
       },
       {
        "nombre": "A",
        "p": {
         "x": 0,
         "y": 3.7
        },
        "q": {
         "x": 19.03,
         "y": 3.7
        }
       }
      ],
      "columnas": [],
      "murosVanos": null,
      "losas": null
     }
    }
   ]
  }
 }
];
// Correcciones del ingeniero registradas en el uso (se suman a las del servidor y la sesión).
export const EVENTOS_USO = [
 {
  "tipo": "confirmacion",
  "clave": "cimentacion",
  "valor": "platea",
  "rasgos": {
   "niveles": 3,
   "luzLosa": 5.1,
   "luzMax": 7.43,
   "largo": 22.07,
   "ancho": 7.43,
   "area": 163.95,
   "columnas": 12,
   "columnetas": 50,
   "placas": true,
   "techoLiviano": true,
   "cubierta": true,
   "falsoCielo": true,
   "deportivo": false,
   "agua": false,
   "banos": true
  }
 },
 {
  "tipo": "confirmacion",
  "clave": "losa",
  "valor": "aligerada y maciza",
  "rasgos": {
   "niveles": 3,
   "luzLosa": 5.1,
   "luzMax": 7.43,
   "largo": 22.07,
   "ancho": 7.43,
   "area": 163.95,
   "columnas": 12,
   "columnetas": 50,
   "placas": true,
   "techoLiviano": true,
   "cubierta": true,
   "falsoCielo": true,
   "deportivo": false,
   "agua": false,
   "banos": true
  }
 },
 {
  "tipo": "correccion",
  "clave": "cimentacion",
  "valor": "zapatas",
  "rasgos": {
   "niveles": 3,
   "luzLosa": 5.1,
   "luzMax": 7.43,
   "largo": 22.07,
   "ancho": 7.43,
   "area": 163.95,
   "columnas": 12,
   "columnetas": 50,
   "placas": true,
   "techoLiviano": true,
   "cubierta": true,
   "falsoCielo": true,
   "deportivo": false,
   "agua": false,
   "banos": true
  }
 },
 {
  "tipo": "confirmacion",
  "clave": "losa",
  "valor": "aligerada y maciza",
  "rasgos": {
   "niveles": 3,
   "luzLosa": 5.1,
   "luzMax": 7.43,
   "largo": 22.07,
   "ancho": 7.43,
   "area": 163.95,
   "columnas": 12,
   "columnetas": 50,
   "placas": true,
   "techoLiviano": true,
   "cubierta": true,
   "falsoCielo": true,
   "deportivo": false,
   "agua": false,
   "banos": true
  }
 },
 {
  "tipo": "confirmacion",
  "clave": "cimentacion",
  "valor": "platea",
  "rasgos": {
   "niveles": 1,
   "luzLosa": 3.8,
   "luzMax": 4.49,
   "largo": 9.73,
   "ancho": 4.49,
   "area": 43.63,
   "columnas": 8,
   "columnetas": 19,
   "placas": false,
   "techoLiviano": true,
   "cubierta": true,
   "falsoCielo": true,
   "deportivo": false,
   "agua": false,
   "banos": true
  }
 },
 {
  "tipo": "confirmacion",
  "clave": "losa",
  "valor": "aligerada",
  "rasgos": {
   "niveles": 1,
   "luzLosa": 3.8,
   "luzMax": 4.49,
   "largo": 9.73,
   "ancho": 4.49,
   "area": 43.63,
   "columnas": 8,
   "columnetas": 19,
   "placas": false,
   "techoLiviano": true,
   "cubierta": true,
   "falsoCielo": true,
   "deportivo": false,
   "agua": false,
   "banos": true
  }
 },
 {
  "tipo": "confirmacion",
  "clave": "losaDeTecho",
  "valor": true,
  "rasgos": {
   "niveles": 1,
   "luzLosa": 3.8,
   "luzMax": 4.49,
   "largo": 9.73,
   "ancho": 4.49,
   "area": 43.63,
   "columnas": 8,
   "columnetas": 19,
   "placas": false,
   "techoLiviano": true,
   "cubierta": true,
   "falsoCielo": true,
   "deportivo": false,
   "agua": false,
   "banos": true
  }
 },
 {
  "tipo": "confirmacion",
  "clave": "cimentacion",
  "valor": "platea",
  "rasgos": {
   "niveles": 1,
   "luzLosa": 3.8,
   "luzMax": 4.49,
   "largo": 9.73,
   "ancho": 4.49,
   "area": 43.63,
   "columnas": 8,
   "columnetas": 19,
   "placas": false,
   "techoLiviano": true,
   "cubierta": true,
   "falsoCielo": true,
   "deportivo": false,
   "agua": false,
   "banos": true
  }
 },
 {
  "tipo": "confirmacion",
  "clave": "losa",
  "valor": "aligerada",
  "rasgos": {
   "niveles": 1,
   "luzLosa": 3.8,
   "luzMax": 4.49,
   "largo": 9.73,
   "ancho": 4.49,
   "area": 43.63,
   "columnas": 8,
   "columnetas": 19,
   "placas": false,
   "techoLiviano": true,
   "cubierta": true,
   "falsoCielo": true,
   "deportivo": false,
   "agua": false,
   "banos": true
  }
 },
 {
  "tipo": "confirmacion",
  "clave": "losaDeTecho",
  "valor": true,
  "rasgos": {
   "niveles": 1,
   "luzLosa": 3.8,
   "luzMax": 4.49,
   "largo": 9.73,
   "ancho": 4.49,
   "area": 43.63,
   "columnas": 8,
   "columnetas": 19,
   "placas": false,
   "techoLiviano": true,
   "cubierta": true,
   "falsoCielo": true,
   "deportivo": false,
   "agua": false,
   "banos": true
  }
 },
 {
  "tipo": "confirmacion",
  "clave": "cimentacion",
  "valor": "platea",
  "rasgos": {
   "niveles": 1,
   "luzLosa": 3.8,
   "luzMax": 4.49,
   "largo": 9.73,
   "ancho": 4.49,
   "area": 43.63,
   "columnas": 8,
   "columnetas": 19,
   "placas": false,
   "techoLiviano": true,
   "cubierta": true,
   "falsoCielo": true,
   "deportivo": false,
   "agua": false,
   "banos": true
  }
 },
 {
  "tipo": "confirmacion",
  "clave": "losa",
  "valor": "aligerada",
  "rasgos": {
   "niveles": 1,
   "luzLosa": 3.8,
   "luzMax": 4.49,
   "largo": 9.73,
   "ancho": 4.49,
   "area": 43.63,
   "columnas": 8,
   "columnetas": 19,
   "placas": false,
   "techoLiviano": true,
   "cubierta": true,
   "falsoCielo": true,
   "deportivo": false,
   "agua": false,
   "banos": true
  }
 },
 {
  "tipo": "confirmacion",
  "clave": "losaDeTecho",
  "valor": true,
  "rasgos": {
   "niveles": 1,
   "luzLosa": 3.8,
   "luzMax": 4.49,
   "largo": 9.73,
   "ancho": 4.49,
   "area": 43.63,
   "columnas": 8,
   "columnetas": 19,
   "placas": false,
   "techoLiviano": true,
   "cubierta": true,
   "falsoCielo": true,
   "deportivo": false,
   "agua": false,
   "banos": true
  }
 },
 {
  "tipo": "confirmacion",
  "clave": "losa",
  "valor": "aligerada",
  "rasgos": {
   "niveles": 1,
   "luzLosa": 3.8,
   "luzMax": 4.49,
   "largo": 9.73,
   "ancho": 4.49,
   "area": 43.63,
   "columnas": 8,
   "columnetas": 19,
   "placas": false,
   "techoLiviano": true,
   "cubierta": true,
   "falsoCielo": true,
   "deportivo": false,
   "agua": false,
   "banos": true
  }
 },
 {
  "tipo": "confirmacion",
  "clave": "losaDeTecho",
  "valor": true,
  "rasgos": {
   "niveles": 1,
   "luzLosa": 3.8,
   "luzMax": 4.49,
   "largo": 9.73,
   "ancho": 4.49,
   "area": 43.63,
   "columnas": 8,
   "columnetas": 19,
   "placas": false,
   "techoLiviano": true,
   "cubierta": true,
   "falsoCielo": true,
   "deportivo": false,
   "agua": false,
   "banos": true
  }
 },
 {
  "tipo": "correccion",
  "clave": "hz",
  "valor": 0.6,
  "rasgos": {
   "niveles": 1,
   "luzLosa": 3.8,
   "luzMax": 4.49,
   "largo": 9.73,
   "ancho": 4.49,
   "area": 43.63,
   "columnas": 8,
   "columnetas": 19,
   "placas": false,
   "techoLiviano": true,
   "cubierta": true,
   "falsoCielo": true,
   "deportivo": false,
   "agua": false,
   "banos": true
  }
 },
 {
  "tipo": "confirmacion",
  "clave": "cimentacion",
  "valor": "platea",
  "rasgos": {
   "niveles": 1,
   "luzLosa": 3.8,
   "luzMax": 4.49,
   "largo": 9.73,
   "ancho": 4.49,
   "area": 43.63,
   "columnas": 8,
   "columnetas": 19,
   "placas": false,
   "techoLiviano": true,
   "cubierta": true,
   "falsoCielo": true,
   "deportivo": false,
   "agua": false,
   "banos": true
  }
 },
 {
  "tipo": "confirmacion",
  "clave": "losa",
  "valor": "aligerada",
  "rasgos": {
   "niveles": 1,
   "luzLosa": 3.8,
   "luzMax": 4.49,
   "largo": 9.73,
   "ancho": 4.49,
   "area": 43.63,
   "columnas": 8,
   "columnetas": 19,
   "placas": false,
   "techoLiviano": true,
   "cubierta": true,
   "falsoCielo": true,
   "deportivo": false,
   "agua": false,
   "banos": true
  }
 },
 {
  "tipo": "confirmacion",
  "clave": "losaDeTecho",
  "valor": true,
  "rasgos": {
   "niveles": 1,
   "luzLosa": 3.8,
   "luzMax": 4.49,
   "largo": 9.73,
   "ancho": 4.49,
   "area": 43.63,
   "columnas": 8,
   "columnetas": 19,
   "placas": false,
   "techoLiviano": true,
   "cubierta": true,
   "falsoCielo": true,
   "deportivo": false,
   "agua": false,
   "banos": true
  }
 },
 {
  "tipo": "confirmacion",
  "clave": "cimentacion",
  "valor": "platea",
  "rasgos": {
   "niveles": 3,
   "luzLosa": 4.22,
   "luzMax": 7.43,
   "largo": 23.51,
   "ancho": 7.43,
   "area": 174.64,
   "columnas": 14,
   "columnetas": 33,
   "placas": true,
   "techoLiviano": true,
   "cubierta": true,
   "falsoCielo": true,
   "deportivo": false,
   "agua": false,
   "banos": true
  }
 },
 {
  "tipo": "correccion",
  "clave": "columnasComoArquitectura",
  "valor": true,
  "rasgos": {
   "niveles": 3,
   "luzLosa": 4.22,
   "luzMax": 7.43,
   "largo": 23.51,
   "ancho": 7.43,
   "area": 174.64,
   "columnas": 14,
   "columnetas": 33,
   "placas": true,
   "techoLiviano": true,
   "cubierta": true,
   "falsoCielo": true,
   "deportivo": false,
   "agua": false,
   "banos": true
  }
 },
 {
  "tipo": "correccion",
  "clave": "losaDeTecho",
  "valor": true,
  "rasgos": {
   "niveles": 3,
   "luzLosa": 4.22,
   "luzMax": 7.43,
   "largo": 23.51,
   "ancho": 7.43,
   "area": 174.64,
   "columnas": 14,
   "columnetas": 33,
   "placas": true,
   "techoLiviano": true,
   "cubierta": true,
   "falsoCielo": true,
   "deportivo": false,
   "agua": false,
   "banos": true
  }
 },
 {
  "tipo": "correccion",
  "clave": "estribos",
  "valor": "3/8\": 1@.05, 10@.10",
  "rasgos": {
   "niveles": 3,
   "luzLosa": 4.22,
   "luzMax": 7.43,
   "largo": 23.51,
   "ancho": 7.43,
   "area": 174.64,
   "columnas": 14,
   "columnetas": 33,
   "placas": true,
   "techoLiviano": true,
   "cubierta": true,
   "falsoCielo": true,
   "deportivo": false,
   "agua": false,
   "banos": true
  }
 },
 {
  "tipo": "correccion",
  "clave": "fcColumnas",
  "valor": 210,
  "rasgos": {
   "niveles": 3,
   "luzLosa": 4.22,
   "luzMax": 7.43,
   "largo": 23.51,
   "ancho": 7.43,
   "area": 174.64,
   "columnas": 14,
   "columnetas": 33,
   "placas": true,
   "techoLiviano": true,
   "cubierta": true,
   "falsoCielo": true,
   "deportivo": false,
   "agua": false,
   "banos": true
  }
 },
 {
  "tipo": "correccion",
  "clave": "fcColumnetas",
  "valor": 175,
  "rasgos": {
   "niveles": 3,
   "luzLosa": 4.22,
   "luzMax": 7.43,
   "largo": 23.51,
   "ancho": 7.43,
   "area": 174.64,
   "columnas": 14,
   "columnetas": 33,
   "placas": true,
   "techoLiviano": true,
   "cubierta": true,
   "falsoCielo": true,
   "deportivo": false,
   "agua": false,
   "banos": true
  }
 },
 {
  "tipo": "correccion",
  "clave": "losa",
  "valor": "aligerada",
  "rasgos": {
   "niveles": 3,
   "luzLosa": 4.22,
   "luzMax": 7.43,
   "largo": 23.51,
   "ancho": 7.43,
   "area": 174.64,
   "columnas": 14,
   "columnetas": 33,
   "placas": true,
   "techoLiviano": true,
   "cubierta": true,
   "falsoCielo": true,
   "deportivo": false,
   "agua": false,
   "banos": true
  }
 },
 {
  "tipo": "correccion",
  "clave": "espesorLosa",
  "valor": 0.2,
  "rasgos": {
   "niveles": 3,
   "luzLosa": 4.22,
   "luzMax": 7.43,
   "largo": 23.51,
   "ancho": 7.43,
   "area": 174.64,
   "columnas": 14,
   "columnetas": 33,
   "placas": true,
   "techoLiviano": true,
   "cubierta": true,
   "falsoCielo": true,
   "deportivo": false,
   "agua": false,
   "banos": true
  }
 },
 {
  "tipo": "confirmacion",
  "clave": "cimentacion",
  "valor": "platea",
  "rasgos": {
   "niveles": 3,
   "luzLosa": 4.22,
   "luzMax": 7.43,
   "largo": 23.51,
   "ancho": 7.43,
   "area": 174.64,
   "columnas": 14,
   "columnetas": 33,
   "placas": true,
   "techoLiviano": true,
   "cubierta": true,
   "falsoCielo": true,
   "deportivo": false,
   "agua": false,
   "banos": true
  }
 },
 {
  "tipo": "confirmacion",
  "clave": "cimentacion",
  "valor": "platea",
  "rasgos": {
   "niveles": 3,
   "luzLosa": 5.1,
   "luzMax": 7.43,
   "largo": 22.07,
   "ancho": 7.43,
   "area": 163.95,
   "columnas": 12,
   "columnetas": 50,
   "placas": true,
   "techoLiviano": true,
   "cubierta": true,
   "falsoCielo": true,
   "deportivo": false,
   "agua": false,
   "banos": true
  }
 },
 {
  "tipo": "confirmacion",
  "clave": "losa",
  "valor": "aligerada y maciza",
  "rasgos": {
   "niveles": 3,
   "luzLosa": 5.1,
   "luzMax": 7.43,
   "largo": 22.07,
   "ancho": 7.43,
   "area": 163.95,
   "columnas": 12,
   "columnetas": 50,
   "placas": true,
   "techoLiviano": true,
   "cubierta": true,
   "falsoCielo": true,
   "deportivo": false,
   "agua": false,
   "banos": true
  }
 },
 {
  "tipo": "confirmacion",
  "clave": "losa",
  "valor": "aligerada y maciza",
  "rasgos": {
   "niveles": 3,
   "luzLosa": 5.1,
   "luzMax": 7.43,
   "largo": 22.07,
   "ancho": 7.43,
   "area": 163.95,
   "columnas": 12,
   "columnetas": 50,
   "placas": true,
   "techoLiviano": true,
   "cubierta": true,
   "falsoCielo": true,
   "deportivo": false,
   "agua": false,
   "banos": true
  }
 },
 {
  "tipo": "confirmacion",
  "clave": "cimentacion",
  "valor": "platea",
  "rasgos": {
   "niveles": 3,
   "luzLosa": 5.1,
   "luzMax": 7.43,
   "largo": 22.07,
   "ancho": 7.43,
   "area": 163.95,
   "columnas": 12,
   "columnetas": 50,
   "placas": true,
   "techoLiviano": true,
   "cubierta": true,
   "falsoCielo": true,
   "deportivo": false,
   "agua": false,
   "banos": true
  }
 },
 {
  "tipo": "confirmacion",
  "clave": "losa",
  "valor": "aligerada y maciza",
  "rasgos": {
   "niveles": 3,
   "luzLosa": 5.1,
   "luzMax": 7.43,
   "largo": 22.07,
   "ancho": 7.43,
   "area": 163.95,
   "columnas": 12,
   "columnetas": 50,
   "placas": true,
   "techoLiviano": true,
   "cubierta": true,
   "falsoCielo": true,
   "deportivo": false,
   "agua": false,
   "banos": true
  }
 },
 {
  "tipo": "confirmacion",
  "clave": "cimentacion",
  "valor": "platea",
  "rasgos": {
   "niveles": 1,
   "luzLosa": 2.52,
   "luzMax": 3.76,
   "largo": 3.76,
   "ancho": 2.52,
   "area": 9.46,
   "columnas": 4,
   "columnetas": 11,
   "placas": false,
   "techoLiviano": true,
   "cubierta": true,
   "falsoCielo": false,
   "deportivo": false,
   "agua": false,
   "banos": true
  }
 },
 {
  "tipo": "confirmacion",
  "clave": "losaDeTecho",
  "valor": true,
  "rasgos": {
   "niveles": 1,
   "luzLosa": 2.52,
   "luzMax": 3.76,
   "largo": 3.76,
   "ancho": 2.52,
   "area": 9.46,
   "columnas": 4,
   "columnetas": 11,
   "placas": false,
   "techoLiviano": true,
   "cubierta": true,
   "falsoCielo": false,
   "deportivo": false,
   "agua": false,
   "banos": true
  }
 },
 {
  "tipo": "confirmacion",
  "clave": "cimentacion",
  "valor": "platea",
  "rasgos": {
   "niveles": 3,
   "luzLosa": 4.22,
   "luzMax": 7.43,
   "largo": 23.51,
   "ancho": 7.43,
   "area": 174.64,
   "columnas": 14,
   "columnetas": 33,
   "placas": true,
   "techoLiviano": true,
   "cubierta": true,
   "falsoCielo": true,
   "deportivo": false,
   "agua": false,
   "banos": true
  }
 },
 {
  "tipo": "confirmacion",
  "clave": "cimentacion",
  "valor": "platea",
  "rasgos": {
   "niveles": 1,
   "luzLosa": 3.8,
   "luzMax": 4.49,
   "largo": 9.73,
   "ancho": 4.49,
   "area": 43.63,
   "columnas": 8,
   "columnetas": 19,
   "placas": false,
   "techoLiviano": true,
   "cubierta": true,
   "falsoCielo": true,
   "deportivo": false,
   "agua": false,
   "banos": true
  }
 },
 {
  "tipo": "confirmacion",
  "clave": "losa",
  "valor": "aligerada",
  "rasgos": {
   "niveles": 1,
   "luzLosa": 3.8,
   "luzMax": 4.49,
   "largo": 9.73,
   "ancho": 4.49,
   "area": 43.63,
   "columnas": 8,
   "columnetas": 19,
   "placas": false,
   "techoLiviano": true,
   "cubierta": true,
   "falsoCielo": true,
   "deportivo": false,
   "agua": false,
   "banos": true
  }
 },
 {
  "tipo": "confirmacion",
  "clave": "losaDeTecho",
  "valor": true,
  "rasgos": {
   "niveles": 1,
   "luzLosa": 3.8,
   "luzMax": 4.49,
   "largo": 9.73,
   "ancho": 4.49,
   "area": 43.63,
   "columnas": 8,
   "columnetas": 19,
   "placas": false,
   "techoLiviano": true,
   "cubierta": true,
   "falsoCielo": true,
   "deportivo": false,
   "agua": false,
   "banos": true
  }
 },
 {
  "tipo": "confirmacion",
  "clave": "losa",
  "valor": "aligerada",
  "rasgos": {
   "niveles": 1,
   "luzLosa": 3.8,
   "luzMax": 4.49,
   "largo": 9.73,
   "ancho": 4.49,
   "area": 43.63,
   "columnas": 8,
   "columnetas": 19,
   "placas": false,
   "techoLiviano": true,
   "cubierta": true,
   "falsoCielo": true,
   "deportivo": false,
   "agua": false,
   "banos": true
  }
 },
 {
  "tipo": "confirmacion",
  "clave": "losaDeTecho",
  "valor": true,
  "rasgos": {
   "niveles": 1,
   "luzLosa": 3.8,
   "luzMax": 4.49,
   "largo": 9.73,
   "ancho": 4.49,
   "area": 43.63,
   "columnas": 8,
   "columnetas": 19,
   "placas": false,
   "techoLiviano": true,
   "cubierta": true,
   "falsoCielo": true,
   "deportivo": false,
   "agua": false,
   "banos": true
  }
 },
 {
  "tipo": "confirmacion",
  "clave": "cimentacion",
  "valor": "platea",
  "rasgos": {
   "niveles": 1,
   "luzLosa": 3.8,
   "luzMax": 4.49,
   "largo": 9.73,
   "ancho": 4.49,
   "area": 43.63,
   "columnas": 8,
   "columnetas": 19,
   "placas": false,
   "techoLiviano": true,
   "cubierta": true,
   "falsoCielo": true,
   "deportivo": false,
   "agua": false,
   "banos": true
  }
 },
 {
  "tipo": "confirmacion",
  "clave": "losa",
  "valor": "aligerada",
  "rasgos": {
   "niveles": 1,
   "luzLosa": 3.8,
   "luzMax": 4.49,
   "largo": 9.73,
   "ancho": 4.49,
   "area": 43.63,
   "columnas": 8,
   "columnetas": 19,
   "placas": false,
   "techoLiviano": true,
   "cubierta": true,
   "falsoCielo": true,
   "deportivo": false,
   "agua": false,
   "banos": true
  }
 },
 {
  "tipo": "confirmacion",
  "clave": "losaDeTecho",
  "valor": true,
  "rasgos": {
   "niveles": 1,
   "luzLosa": 3.8,
   "luzMax": 4.49,
   "largo": 9.73,
   "ancho": 4.49,
   "area": 43.63,
   "columnas": 8,
   "columnetas": 19,
   "placas": false,
   "techoLiviano": true,
   "cubierta": true,
   "falsoCielo": true,
   "deportivo": false,
   "agua": false,
   "banos": true
  }
 },
 {
  "tipo": "confirmacion",
  "clave": "cimentacion",
  "valor": "platea",
  "rasgos": {
   "niveles": 1,
   "luzLosa": 2.52,
   "luzMax": 3.76,
   "largo": 3.76,
   "ancho": 2.52,
   "area": 9.46,
   "columnas": 4,
   "columnetas": 11,
   "placas": false,
   "techoLiviano": true,
   "cubierta": true,
   "falsoCielo": false,
   "deportivo": false,
   "agua": false,
   "banos": true
  }
 },
 {
  "tipo": "confirmacion",
  "clave": "losaDeTecho",
  "valor": true,
  "rasgos": {
   "niveles": 1,
   "luzLosa": 2.52,
   "luzMax": 3.76,
   "largo": 3.76,
   "ancho": 2.52,
   "area": 9.46,
   "columnas": 4,
   "columnetas": 11,
   "placas": false,
   "techoLiviano": true,
   "cubierta": true,
   "falsoCielo": false,
   "deportivo": false,
   "agua": false,
   "banos": true
  }
 },
 {
  "tipo": "confirmacion",
  "clave": "losaDeTecho",
  "valor": true,
  "rasgos": {
   "niveles": 1,
   "luzLosa": 2.52,
   "luzMax": 3.76,
   "largo": 3.76,
   "ancho": 2.52,
   "area": 9.46,
   "columnas": 4,
   "columnetas": 11,
   "placas": false,
   "techoLiviano": true,
   "cubierta": true,
   "falsoCielo": false,
   "deportivo": false,
   "agua": false,
   "banos": true
  }
 },
 {
  "tipo": "confirmacion",
  "clave": "losaDeTecho",
  "valor": true,
  "rasgos": {
   "niveles": 1,
   "luzLosa": 2.52,
   "luzMax": 3.76,
   "largo": 3.76,
   "ancho": 2.52,
   "area": 9.46,
   "columnas": 4,
   "columnetas": 11,
   "placas": false,
   "techoLiviano": true,
   "cubierta": true,
   "falsoCielo": false,
   "deportivo": false,
   "agua": false,
   "banos": true
  }
 },
 {
  "tipo": "confirmacion",
  "clave": "cimentacion",
  "valor": "platea",
  "rasgos": {
   "niveles": 1,
   "luzLosa": 2.52,
   "luzMax": 3.76,
   "largo": 3.76,
   "ancho": 2.52,
   "area": 9.46,
   "columnas": 4,
   "columnetas": 11,
   "placas": false,
   "techoLiviano": true,
   "cubierta": true,
   "falsoCielo": false,
   "deportivo": false,
   "agua": false,
   "banos": true
  }
 },
 {
  "tipo": "confirmacion",
  "clave": "losaDeTecho",
  "valor": true,
  "rasgos": {
   "niveles": 1,
   "luzLosa": 2.52,
   "luzMax": 3.76,
   "largo": 3.76,
   "ancho": 2.52,
   "area": 9.46,
   "columnas": 4,
   "columnetas": 11,
   "placas": false,
   "techoLiviano": true,
   "cubierta": true,
   "falsoCielo": false,
   "deportivo": false,
   "agua": false,
   "banos": true
  }
 },
 {
  "tipo": "confirmacion",
  "clave": "cimentacion",
  "valor": "platea",
  "rasgos": {
   "niveles": 1,
   "luzLosa": 2.52,
   "luzMax": 3.76,
   "largo": 3.76,
   "ancho": 2.52,
   "area": 9.46,
   "columnas": 4,
   "columnetas": 11,
   "placas": false,
   "techoLiviano": true,
   "cubierta": true,
   "falsoCielo": false,
   "deportivo": false,
   "agua": false,
   "banos": true
  }
 },
 {
  "tipo": "confirmacion",
  "clave": "losaDeTecho",
  "valor": true,
  "rasgos": {
   "niveles": 1,
   "luzLosa": 2.52,
   "luzMax": 3.76,
   "largo": 3.76,
   "ancho": 2.52,
   "area": 9.46,
   "columnas": 4,
   "columnetas": 11,
   "placas": false,
   "techoLiviano": true,
   "cubierta": true,
   "falsoCielo": false,
   "deportivo": false,
   "agua": false,
   "banos": true
  }
 },
 {
  "tipo": "confirmacion",
  "clave": "cimentacion",
  "valor": "platea",
  "rasgos": {
   "niveles": 1,
   "luzLosa": 2.52,
   "luzMax": 3.76,
   "largo": 3.76,
   "ancho": 2.52,
   "area": 9.46,
   "columnas": 4,
   "columnetas": 11,
   "placas": false,
   "techoLiviano": true,
   "cubierta": true,
   "falsoCielo": false,
   "deportivo": false,
   "agua": false,
   "banos": true
  }
 },
 {
  "tipo": "confirmacion",
  "clave": "losaDeTecho",
  "valor": true,
  "rasgos": {
   "niveles": 1,
   "luzLosa": 2.52,
   "luzMax": 3.76,
   "largo": 3.76,
   "ancho": 2.52,
   "area": 9.46,
   "columnas": 4,
   "columnetas": 11,
   "placas": false,
   "techoLiviano": true,
   "cubierta": true,
   "falsoCielo": false,
   "deportivo": false,
   "agua": false,
   "banos": true
  }
 },
 {
  "tipo": "confirmacion",
  "clave": "cimentacion",
  "valor": "platea",
  "rasgos": {
   "niveles": 1,
   "luzLosa": 2.52,
   "luzMax": 3.76,
   "largo": 3.76,
   "ancho": 2.52,
   "area": 9.46,
   "columnas": 4,
   "columnetas": 11,
   "placas": false,
   "techoLiviano": true,
   "cubierta": true,
   "falsoCielo": false,
   "deportivo": false,
   "agua": false,
   "banos": true
  }
 },
 {
  "tipo": "confirmacion",
  "clave": "losaDeTecho",
  "valor": true,
  "rasgos": {
   "niveles": 1,
   "luzLosa": 2.52,
   "luzMax": 3.76,
   "largo": 3.76,
   "ancho": 2.52,
   "area": 9.46,
   "columnas": 4,
   "columnetas": 11,
   "placas": false,
   "techoLiviano": true,
   "cubierta": true,
   "falsoCielo": false,
   "deportivo": false,
   "agua": false,
   "banos": true
  }
 },
 {
  "tipo": "confirmacion",
  "clave": "cimentacion",
  "valor": "platea",
  "rasgos": {
   "niveles": 1,
   "luzLosa": 3.8,
   "luzMax": 4.49,
   "largo": 9.73,
   "ancho": 4.49,
   "area": 43.63,
   "columnas": 8,
   "columnetas": 19,
   "placas": false,
   "techoLiviano": true,
   "cubierta": true,
   "falsoCielo": true,
   "deportivo": false,
   "agua": false,
   "banos": true
  }
 },
 {
  "tipo": "confirmacion",
  "clave": "losa",
  "valor": "aligerada",
  "rasgos": {
   "niveles": 1,
   "luzLosa": 3.8,
   "luzMax": 4.49,
   "largo": 9.73,
   "ancho": 4.49,
   "area": 43.63,
   "columnas": 8,
   "columnetas": 19,
   "placas": false,
   "techoLiviano": true,
   "cubierta": true,
   "falsoCielo": true,
   "deportivo": false,
   "agua": false,
   "banos": true
  }
 },
 {
  "tipo": "confirmacion",
  "clave": "losaDeTecho",
  "valor": true,
  "rasgos": {
   "niveles": 1,
   "luzLosa": 3.8,
   "luzMax": 4.49,
   "largo": 9.73,
   "ancho": 4.49,
   "area": 43.63,
   "columnas": 8,
   "columnetas": 19,
   "placas": false,
   "techoLiviano": true,
   "cubierta": true,
   "falsoCielo": true,
   "deportivo": false,
   "agua": false,
   "banos": true
  }
 },
 {
  "tipo": "confirmacion",
  "clave": "cimentacion",
  "valor": "platea",
  "rasgos": {
   "niveles": 2,
   "luzLosa": 4.61,
   "luzMax": 6.41,
   "largo": 11.68,
   "ancho": 6.41,
   "area": 74.92,
   "columnas": 8,
   "columnetas": 14,
   "placas": true,
   "techoLiviano": true,
   "cubierta": true,
   "falsoCielo": true,
   "deportivo": false,
   "agua": false,
   "banos": true
  }
 },
 {
  "tipo": "confirmacion",
  "clave": "losa",
  "valor": "aligerada y maciza",
  "rasgos": {
   "niveles": 2,
   "luzLosa": 4.61,
   "luzMax": 6.41,
   "largo": 11.68,
   "ancho": 6.41,
   "area": 74.92,
   "columnas": 8,
   "columnetas": 14,
   "placas": true,
   "techoLiviano": true,
   "cubierta": true,
   "falsoCielo": true,
   "deportivo": false,
   "agua": false,
   "banos": true
  }
 },
 {
  "tipo": "confirmacion",
  "clave": "losa",
  "valor": "aligerada",
  "rasgos": {
   "niveles": 1,
   "luzLosa": 3.8,
   "luzMax": 4.49,
   "largo": 9.73,
   "ancho": 4.49,
   "area": 43.63,
   "columnas": 8,
   "columnetas": 19,
   "placas": false,
   "techoLiviano": true,
   "cubierta": true,
   "falsoCielo": true,
   "deportivo": false,
   "agua": false,
   "banos": true
  }
 },
 {
  "tipo": "confirmacion",
  "clave": "losaDeTecho",
  "valor": false,
  "rasgos": {
   "niveles": 1,
   "luzLosa": 4.7,
   "luzMax": 24.85,
   "largo": 32.06,
   "ancho": 24.85,
   "area": 796.69,
   "columnas": 16,
   "columnetas": 0,
   "placas": false,
   "techoLiviano": true,
   "cubierta": true,
   "falsoCielo": false,
   "deportivo": true,
   "agua": false,
   "banos": false
  }
 },
 {
  "tipo": "confirmacion",
  "clave": "techoDosAguas",
  "valor": true,
  "rasgos": {
   "niveles": 1,
   "luzLosa": 4.7,
   "luzMax": 24.85,
   "largo": 32.06,
   "ancho": 24.85,
   "area": 796.69,
   "columnas": 16,
   "columnetas": 0,
   "placas": false,
   "techoLiviano": true,
   "cubierta": true,
   "falsoCielo": false,
   "deportivo": true,
   "agua": false,
   "banos": false
  }
 }
];
