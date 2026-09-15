"""
Shim de compatibilidad: el motor sísmico se dividió en el paquete `seismic/`
(utils / inputs / solver / report / pipeline). Este módulo re-exporta toda la
API pública para que `import seismic_analysis as sa` (app.py) y
`from seismic_analysis import ...` (tests) sigan funcionando sin cambios.

El código real vive en:
  seismic/utils.py     — helpers puros (floats, espectro).
  seismic/inputs.py    — ENTRADAS: parseo de espectros, diafragmas, masa, modelo.
  seismic/solver.py    — CÁLCULO: modal, RSA, derivas, cortantes, frame forces.
  seismic/report.py    — RESPUESTA: tablas tipo ETABS, calidad, animación.
  seismic/pipeline.py  — orquestador run_full_seismic_analysis.
"""

import os


os.environ.setdefault("OPENBLAS_NUM_THREADS", "1")
os.environ.setdefault("OMP_NUM_THREADS", "1")
os.environ.setdefault("MKL_NUM_THREADS", "1")

from seismic import *          # noqa: F401,F403  (API pública)
from seismic.utils import *    # noqa: F401,F403
from seismic.inputs import *   # noqa: F401,F403
from seismic.solver import *   # noqa: F401,F403
from seismic.report import *   # noqa: F401,F403
from seismic.pipeline import *  # noqa: F401,F403
