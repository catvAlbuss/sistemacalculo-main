import '../../css/analysis-sheet.css';
import '../jquery_setup.js';
import Plotly from 'plotly.js-dist-min';
import { readPlotPalette, themedPlotLayout, plotColorbar } from './plotTheme.js';

// Presentation only: never modifies trace values or engineering calculations.
document.addEventListener('DOMContentLoaded',()=>{
  const root=document.querySelector('[data-analysis-sheet]');
  if(!root)return;
  // Keep the editor usable even if the external icon font has not loaded.
  const toolNames={arrows:'Mover',pencil:'Línea',scissors:'Eliminar',copy:'Copiar',anchor:'Ajuste a grilla',crosshairs:'Editar punto',undo:'Deshacer',redo:'Rehacer',refresh:'Limpiar'};
  for(const [id,label] of Object.entries(toolNames)){
    const tool=root.querySelector('.analysis-editor #'+id);
    if(!tool)continue;
    tool.dataset.analysisTool='';tool.setAttribute('role','button');tool.tabIndex=0;tool.setAttribute('aria-label',label);
    const text=document.createElement('span');text.className='analysis-tool-label';text.textContent=label;tool.append(text);
    tool.addEventListener('keydown',event=>{if(event.target===tool && ['Enter',' '].includes(event.key)){event.preventDefault();tool.click();}});
  }
  const bound=new WeakSet();const applying=new WeakSet();let frame=0;
  const theme=graph=>{
    if(!graph._fullLayout || applying.has(graph))return;
    const palette=readPlotPalette(graph);
    const bars=graph.data?.every(trace=>(!trace.colorbar || trace.colorbar.tickfont?.color===palette.text)
      && (!trace.marker?.colorbar || trace.marker.colorbar.tickfont?.color===palette.text));
    if(graph._fullLayout.paper_bgcolor===palette.panel && graph._fullLayout.plot_bgcolor===palette.panel && graph.layout.font?.color===palette.text && bars)return;
    applying.add(graph);
    let update=Promise.resolve(Plotly.relayout(graph,themedPlotLayout(graph.layout,palette)));
    graph.data?.forEach((trace,index)=>{
      if(trace.colorbar)update=update.then(()=>Plotly.restyle(graph,{colorbar:[plotColorbar(trace.colorbar,palette)]},[index]));
      if(trace.marker?.colorbar)update=update.then(()=>Plotly.restyle(graph,{'marker.colorbar':[plotColorbar(trace.marker.colorbar,palette)]},[index]));
    });
    update.catch(()=>{}).finally(()=>applying.delete(graph));
  };
  const sizes=new WeakMap();
  const resize=new ResizeObserver(entries=>entries.forEach(({target,contentRect})=>{
    if(contentRect.width<=0 || sizes.get(target)===contentRect.width)return;
    sizes.set(target,contentRect.width);
    if(target._fullLayout)Promise.resolve(Plotly.Plots.resize(target)).catch(()=>{});
  }));
  const refresh=()=>{
    frame=0;
    root.querySelectorAll('.js-plotly-plot').forEach(graph=>{
      if(!bound.has(graph)){bound.add(graph);graph.on?.('plotly_afterplot',()=>theme(graph));resize.observe(graph);}
      theme(graph);
    });
  };
  new MutationObserver(()=>{if(!frame)frame=requestAnimationFrame(refresh);}).observe(root,{childList:true,subtree:true});
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change',refresh);
  refresh();
});
