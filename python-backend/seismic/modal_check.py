# -*- coding: utf-8 -*-
"""seismic.modal_check — la masa participante alcanza el mínimo de la norma?

POR QUÉ EXISTE
    La E.030 (art. 29.1.2) exige que la suma de masas efectivas sea **al menos
    el 90 %** de la masa total en cada dirección. Si no llega, el análisis
    subestima las fuerzas y no cumple: no es una advertencia estética.

    Se corría sin chequearlo. Medido en MODULO 6, que necesita MUCHOS modos
    porque la masa está muy repartida:

        modos   SumUX    SumUY      FY (tonf)
          15    98.09 %  43.48 %     1.3534     <- lo que pedía la app
          20    98.51 %  87.30 %     1.7554
          30    99.75 %  93.48 %     1.7657
        ETABS (30 modos) 98.95 % 93.19 %  1.6860

    Con 15 modos el cortante en Y salía **20 % bajo** y la masa participante en
    43 %, o sea menos de la mitad del mínimo — y nada lo decía. ETABS usa 30
    modos en ese modelo.

QUÉ NO HACE
    No sube el número de modos solo. Cuántos correr es decisión del usuario
    (cuesta tiempo, y en un modelo con miles de GDL no es gratis); lo que no
    puede pasar es que no se entere.
"""

__all__ = ["revisar_masa_participante", "MINIMO_NORMA"]

MINIMO_NORMA = 90.0


def revisar_masa_participante(modal_info, minimo=MINIMO_NORMA):
    """Avisos por dirección que no llega al mínimo. Lista vacía = todo bien.

    `modal_info` es la lista que devuelve `run_modal_analysis`; se lee el
    ACUMULADO del último modo, que es el total alcanzado.
    """
    if not modal_info:
        return []

    ultimo = modal_info[-1]
    avisos = []
    for clave, eje in (("cumulative_participation_x", "X"),
                       ("cumulative_participation_y", "Y")):
        try:
            valor = float(ultimo.get(clave) or 0.0)
        except (TypeError, ValueError):
            continue
        if valor < minimo:
            avisos.append({
                "direccion": eje,
                "acumulado": round(valor, 2),
                "minimo": minimo,
                "modos": len(modal_info),
                "mensaje": (
                    f"La masa participante en {eje} llega a {valor:.1f} % con "
                    f"{len(modal_info)} modos; la E.030 exige {minimo:.0f} %. "
                    f"Las fuerzas sísmicas salen SUBESTIMADAS — hay que subir "
                    f"el número de modos."
                ),
            })
    return avisos
