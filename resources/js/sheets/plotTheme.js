export const LIGHT_PLOT_PALETTE={panel:'#fff',soft:'#f8fafc',text:'#172b43',line:'#dce4ee',accent:'#1959b8'};

export function readPlotPalette(element) {
  const root=element?.closest?.('[data-analysis-sheet]') || document.querySelector('[data-analysis-sheet]');
  if(!root)return LIGHT_PLOT_PALETTE;
  const css=getComputedStyle(root);
  return Object.fromEntries(Object.entries({panel:'--pr-panel',soft:'--pr-soft',text:'--pr-text',line:'--pr-line',accent:'--pr-blue'})
    .map(([key,token])=>[key,css.getPropertyValue(token).trim()||LIGHT_PLOT_PALETTE[key]]));
}

const textTitle=(title,color)=>({...(typeof title==='string'?{text:title}:title),font:{...(typeof title==='object'?title?.font:{}),color}});
export const plotColorbar=(colorbar={},palette)=>({...colorbar,
  bgcolor:palette.panel,outlinecolor:palette.line,
  tickfont:{...colorbar.tickfont,color:palette.text},
  title:textTitle(colorbar.title,palette.text),
});

export function themedPlotLayout(layout={},palette=LIGHT_PLOT_PALETTE) {
  const axis=original=>({...original,gridcolor:palette.line,linecolor:palette.line,zerolinecolor:palette.line,
    tickfont:{...original?.tickfont,color:palette.text},title:textTitle(original?.title,palette.text)});
  return {...layout,paper_bgcolor:palette.panel,plot_bgcolor:palette.panel,
    font:{family:'Figtree, system-ui, sans-serif',...layout.font,color:palette.text},
    title:textTitle(layout.title,palette.text),xaxis:axis(layout.xaxis),yaxis:axis(layout.yaxis),
    legend:{...layout.legend,bgcolor:palette.panel,font:{...layout.legend?.font,color:palette.text}},
    hoverlabel:{...layout.hoverlabel,bgcolor:palette.soft,bordercolor:palette.line,font:{...layout.hoverlabel?.font,color:palette.text}},
    modebar:{...layout.modebar,bgcolor:palette.panel,color:palette.text,activecolor:palette.accent},
  };
}
