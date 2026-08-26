"""Flag --actualizar: regenera los golden files de esperado/ en vez de compararlos.

Sin esta bandera, un test que falla FALLA — la tentación de "arreglar" a mano
el JSON esperado en vez de correr con --actualizar rompe la red (se pierde el
rastro de si el cambio fue intencional). Ver project_regression_net_plan en
memoria.
"""

def pytest_addoption(parser):
    parser.addoption(
        "--actualizar",
        action="store_true",
        default=False,
        help="Regenera los golden files de esperado/ en vez de compararlos contra los existentes.",
    )
