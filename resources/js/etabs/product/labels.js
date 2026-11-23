// Solo vocabulario de interfaz. Identificadores, aliases y palabras clave del
// motor permanecen iguales; no se reescriben nombres ni copyrights de terceros.
export const NOVACAD_LABELS = {
  main:{
    mainMenu:{new:'Nuevo plano',open:'Abrir un plano',exportMenu:'Entregar plano',about:'Acerca de NovaCad'},
    ribbon:{
      tab:{home:'Trazado',insert:'Recursos',review:'Revisión',measurement:'Mediciones'},
      group:{draw:'Geometría',modify:'Edición',layer:'Organización',properties:'Atributos',utilities:'Gestión del plano',annotation:'Documentación',reference:'Referencias del proyecto'},
    },
  },
};
export function installNovaCadLabels({i18n,AcApI18n}) {
  i18n.global.mergeLocaleMessage('en',NOVACAD_LABELS);
  AcApI18n.mergeLocaleMessage('en',NOVACAD_LABELS);
}
