export const TABS_CONFIG = [
    {
        id: 'predimensionamiento',
        name: 'PREDIMENSIONAMIENTO',
        icon: 'fa-ruler-combined',
        description: 'Cálculo inicial de dimensiones',
        requiredState: null,
        dependsOn: null,
        container: 'predimensionamiento-content'
    },
    {
        id: 'dimensionamiento',
        name: 'DIMENSIONAMIENTO',
        icon: 'fa-check-double',
        description: 'Verificación de dimensiones',
        requiredState: 'predimensionamientoCalculado',
        dependsOn: 'predimensionamiento',
        container: 'dimensionamiento-content'
    },
    {
        id: 'cargas',
        name: 'CARGAS',
        icon: 'fa-weight-hanging',
        description: 'Análisis de cargas',
        requiredState: 'dimensionamientoCalculado',
        dependsOn: 'dimensionamiento',
        container: 'cargas-content'
    },
    {
        id: 'verificaciones',
        name: 'VERIFICACIONES',
        icon: 'fa-compress-arrows-alt',
        description: 'Verificaciones de estabilidad',
        requiredState: 'dimensionamientoCalculado',
        dependsOn: 'dimensionamiento',
        container: 'verificaciones-content'
    },
    // {
    //     id: 'esquemacargas',
    //     name: 'ESQUEMA DE CARGAS',
    //     icon: 'fa-project-diagram',
    //     description: 'Esquema de cargas',
    //     requiredState: 'dimensionamientoCalculado',
    //     dependsOn: 'dimensionamiento',
    //     container: 'esquemacargas-content'
    // },
    {
        id: 'analisisEstructuras',
        name: 'ANÁLISIS ESTRUCTURAL',
        icon: 'fa-calculator',
        description: 'Análisis estructural',
        requiredState: 'dimensionamientoCalculado',
        dependsOn: 'dimensionamiento',
        container: 'analisisEstructuras-content'
    },
    {
        id: 'concretoArmado',
        name: 'DISEÑO',
        icon: 'fa-drafting-compass',
        description: 'Diseño de concreto armado',
        requiredState: 'dimensionamientoCalculado',
        dependsOn: 'dimensionamiento',
        container: 'concretoArmado-content'
    },
    {
        id: 'dibujo',
        name: 'PLANOS',
        icon: 'fa-draw-polygon',
        description: 'Planos y dibujos',
        requiredState: 'dimensionamientoCalculado',
        dependsOn: 'dimensionamiento',
        container: 'dibujo-content'
    },
    {
        id: 'metrado',
        name: 'METRADO',
        icon: 'fa-list-ol',
        description: 'Metrado de materiales',
        requiredState: 'dimensionamientoCalculado',
        dependsOn: 'dimensionamiento',
        container: 'metrado-content'
    },
    {
        id: 'memoriacalculo',
        name: 'MEMORIA DE CALCULO',
        icon: 'fa-list-ol',
        description: 'memoria de calculo',
        requiredState: 'dimensionamientoCalculado',
        dependsOn: 'dimensionamiento',
        container: 'memoriacalculo-content'
    }
]