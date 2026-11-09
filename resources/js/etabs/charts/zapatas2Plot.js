import Plotly from 'plotly.js-dist-min';
import {buildZapatas2PlotData} from './zapatas2PlotData.js';
import {readPlotPalette} from '../../sheets/plotTheme.js';
export {buildZapatas2PlotData,flattenNumeric,limitPlotPoints,getZValuesForCombo,formatZapatas2Value} from './zapatas2PlotData.js';

const plots=new WeakMap();
const pending=new WeakMap();

export async function renderZapatas2Plot(element,results,comboIndex,options={}) {
    if(!element)throw new Error('No se encontro el contenedor del grafico.');
    let state=plots.get(element);
    if(!state){
        state={active:true,version:0,queue:pending.get(element)||Promise.resolve(),frame:null,width:0};
        state.media=matchMedia('(prefers-color-scheme: dark)');
        state.theme=()=>{if(element.isConnected)renderZapatas2Plot(element,state.results,state.combo,state.options).catch(console.error);};
        state.media.addEventListener('change',state.theme);
        state.observer=new ResizeObserver(()=>resizeZapatas2Plot(element));
        state.observer.observe(element);plots.set(element,state);
    }
    Object.assign(state,{results,combo:comboIndex,options});
    const version=++state.version;
    state.queue=state.queue.catch(()=>{}).then(async()=>{
        if(!state.active||version!==state.version||!element.isConnected)return;
        const {data,layout,config}=buildZapatas2PlotData(results,comboIndex,{...options,palette:options.palette||readPlotPalette(element)});
        await Plotly.react(element,data,layout,config);
    });
    pending.set(element,state.queue);
    return state.queue;
}

export function purgeZapatas2Plot(element) {
    if(!element)return;
    const state=plots.get(element);
    if(state){
        state.active=false;state.version++;
        state.observer.disconnect();state.media.removeEventListener('change',state.theme);
        if(state.frame!==null)cancelAnimationFrame(state.frame);
        state.queue.then(()=>{if(!plots.has(element))Plotly.purge(element);},()=>{if(!plots.has(element))Plotly.purge(element);});
        plots.delete(element);
    }else Plotly.purge(element);
}

export function resizeZapatas2Plot(element) {
    const state=plots.get(element);
    if(!state||state.frame!==null)return;
    state.frame=requestAnimationFrame(()=>{
        state.frame=null;
        if(!state.active||!element.isConnected||!element.clientWidth||state.width===element.clientWidth)return;
        state.width=element.clientWidth;
        Plotly.Plots.resize(element).catch(()=>{});
    });
}
