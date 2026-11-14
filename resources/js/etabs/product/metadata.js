export function novaCadMetadata(root = document.getElementById('cad-viewer-app')) {
  return {
    name:'NovaCad',
    provider:root?.dataset.provider || 'Rizabal & Asociados',
    ruc:root?.dataset.providerRuc || '',
    email:root?.dataset.supportEmail || '',
    phone:root?.dataset.supportPhone || '',
  };
}
