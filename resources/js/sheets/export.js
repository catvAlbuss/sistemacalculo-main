export function cloneSheetResults(node) {
  const clone = node.cloneNode(true);
  const originals = node.querySelectorAll('input,select,textarea');
  clone.querySelectorAll('input,select,textarea').forEach((field,index) => {
    const original = originals[index];
    if (field.tagName === 'SELECT') {
      [...field.options].forEach((option,i) => { option.selected=original.options[i].selected; option.toggleAttribute('selected',option.selected); });
    } else if (field.type === 'checkbox' || field.type === 'radio') {
      field.toggleAttribute('checked',original.checked);
    } else {
      field.value=original.value; field.setAttribute('value',original.value);
      if (field.tagName === 'TEXTAREA') field.textContent=original.value;
    }
  });
  // The capture endpoint keeps its existing public contract and root selector.
  clone.id = 'vigasgn';
  return clone;
}

export function bindImageExport(root,{buttonId,targetId,state,filename='resultado_vigas'}) {
  const button=root.querySelector('#'+buttonId);
  if (!button) return;
  button.addEventListener('click',async () => {
    if (!state.isCurrent() || button.disabled) return;
    const label=button.textContent;
    state.setBusy(button,true); button.textContent='Generando imagen…';
    try {
      const node=root.querySelector('#'+targetId);
      if (!node) throw Error('No se encontraron resultados para exportar.');
      const response=await fetch('/capturar-viga-fragmento',{
        method:'POST',headers:{'Content-Type':'application/json','Accept':'image/png, application/json','X-CSRF-TOKEN':document.querySelector('meta[name="csrf-token"]')?.content || ''},
        body:JSON.stringify({html:cloneSheetResults(node).outerHTML,
          stylesheets:[...document.querySelectorAll('link[rel="stylesheet"]')].map(link=>link.href),
          inlineStyles:[...document.querySelectorAll('style')].map(style=>style.outerHTML).join('\n'),
          theme:matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'}),
      });
      if (!response.ok) {
        const error=await response.json().catch(()=>null);
        throw Error(error?.message || 'No se pudo generar la imagen. Intenta nuevamente.');
      }
      const blob=await response.blob();
      const link=document.createElement('a'); const url=URL.createObjectURL(blob);
      link.href=url;link.download=filename+'_'+new Date().toISOString().replaceAll(/[:.]/g,'-')+'.png';
      document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
    } catch(error) { state.error(error.message || 'No se pudo generar la imagen.'); }
    finally { button.textContent=label;state.setBusy(button,false); }
  });
}
