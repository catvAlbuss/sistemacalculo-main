import {memoriacalculo} from '../../resources/js/muros-contencion/memoriacalculo.js';
import {pressureChartTheme} from '../../resources/js/muros-contencion/chartPresentation.js';
import {Desing} from '../../resources/js/muros-contencion/desingConcretoArmado.js';
import {Dimensionamiento} from '../../resources/js/muros-contencion/dimensionamiento.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import {createSystemState} from '../../resources/js/muros-contencion/systemState.js';
import {MainSystem} from '../../resources/js/muros-contencion/mainSystem.js';
import {Predimensionamiento} from '../../resources/js/muros-contencion/predimensionamiento.js';
import {NotificationManager} from '../../resources/js/muros-contencion/utils/notifications.js';

function storage() {
 const entries=new Map();globalThis.localStorage={getItem:k=>entries.get(k)??null,setItem:(k,v)=>entries.set(k,v)};
 return entries;
}
test('wall stages persist without deleting other stages or navigation, and restore the same calculated state',()=>{
 storage();localStorage.setItem('murosContencionData',JSON.stringify({activeTab:'cargas',cargas:{test:123},systemState:{custom:true}}));
 const state=createSystemState();state.cargarDeLocalStorage();
 const predim={isCalculated:true,inputValues:{B18:6.4},resultados:{Ht:7.4}};
 state.setResultadosPredimensionamiento(new Proxy(predim,{}));
 state.setResultadosDimensionamiento({isCalculated:true,resultados:{value:99}});
 predim.resultados.Ht=99;
 const restored=createSystemState();restored.cargarDeLocalStorage();
 assert.equal(restored.resultadosPredimensionamiento.resultados.Ht,7.4);
 assert.equal(restored.dimensionamientoCompleto,true);
 const saved=JSON.parse(localStorage.getItem('murosContencionData'));assert.deepEqual(saved.cargas,{test:123});assert.equal(saved.activeTab,'cargas');assert.equal(saved.systemState.custom,true);
 const main=MainSystem();main.loadStoredState();assert.equal(main.activeTab,'cargas');assert.equal(main.getTabStatus('cargas'),'available');assert.equal(main.getTabStatus('predimensionamiento'),'completed');
 localStorage.setItem('murosContencionData','broken-json');assert.doesNotThrow(()=>restored.cargarDeLocalStorage());
});
test('predimensioning keeps its baseline dimensions, rejects invalid height, and publishes one completion',async()=>{
 storage();const state=createSystemState(),stores={systemState:state};
 globalThis.Alpine={store:(key,value)=>value===undefined?stores[key]:(stores[key]=value)};
 globalThis.document=new EventTarget();let completions=0;document.addEventListener('predimensionamiento-calculated',()=>completions++);
 for(const name of ['showLoading','hideLoading','showSuccess','showError']) NotificationManager[name]=()=>{};
 const vm=Predimensionamiento();vm.$nextTick=callback=>callback();vm.graficopredimensionamiento=()=>{};
 assert.equal(vm.tieneResultados,false);await vm.calcular();await new Promise(r=>setTimeout(r,140));
 assert.equal(completions,1);assert.equal(vm.resultados.Ht,7.4);assert.equal(vm.resultados.espesor_base_pantalla,.74);assert.ok(Math.abs(vm.resultados.ancho_zapata-5.18)<1e-10);assert.equal(vm.tieneResultados,true);assert.equal(vm.inputsChanged,false);
 const graph=vm.calculopuntosmuros(6.4);assert.equal(graph.muro.length,9);assert.deepEqual(graph.muro[0],graph.muro.at(-1));
 vm.datosinput.B18=Infinity;await vm.calcular();await new Promise(r=>setTimeout(r,140));assert.equal(completions,1);assert.ok(vm.errors.length>0);assert.equal(vm.isCalculating,false);
});

test('dimensioning receives the crown width and restores finite geometry from the calculated stage',()=>{
 storage();const state=createSystemState();globalThis.Alpine={store:()=>state};globalThis.document=new EventTarget();
 const predim=Predimensionamiento();predim.calcularDimensiones();
 const vm=Dimensionamiento();vm.predimData={inputValues:{...predim.datosinput},resultados:{...predim.resultados}};vm.actualizarCamposConPredimensionamiento();
 assert.equal(vm.datosdim.A82,'0.54');assert.equal(vm.datosdim.E86,'0.74');
 const result=vm.calcularEstructural();assert.ok(Object.keys(result).length>20);assert.equal(vm.errors.length,0);
 for(const [key,value] of Object.entries(result)){if(typeof value==='number')assert.ok(Number.isFinite(value),key);if(typeof value==='string')assert.doesNotMatch(value,/NaN|Infinity/,key);}
});

test('reinforcement receives actual project material and dimensions without an automatic sample overwrite',()=>{
 const components={};globalThis.Alpine={data:(name,factory)=>{components[name]=factory},store:()=>({})};
 globalThis.document=new EventTarget();const container={innerHTML:''};document.getElementById=()=>container;
 const vm=Desing();vm.init();let received;document.addEventListener('predimensionamiento-updated',event=>{received=event.detail});
 document.dispatchEvent(new CustomEvent('predimensionamiento-calculated',{detail:{inputValues:{B7:280,B8:5000,B21:8,D45:.25},resultados:{espesor_base_pantalla:.8,peralte_zapata:.8,Ht:8}}}));
 assert.equal(received.materiales.B7,280);assert.equal(received.materiales.B8,5000);assert.equal(received.resultados.espesor_base_pantalla,.8);
 const pantalla=components.pantallaModule();pantalla.datos=pantalla.getValoresDefecto();pantalla.actualizarDatosSegunPredim();assert.equal(pantalla.datos.t,80);assert.equal(pantalla.datos.Fc,280);assert.equal(pantalla.datos.Fy,5000);
 assert.ok(!container.innerHTML.includes('x-init="init()"'));vm.destroy();
});

test('pressure chart axes, legend and tooltips follow the theme without changing series',()=>{
 for(const palette of [{panel:'#fff',text:'#172b43',line:'#dce4ee'},{panel:'#172538',text:'#e1eaf6',line:'#2c4058'}]){
  const theme=pressureChartTheme(palette);assert.equal(theme.backgroundColor,palette.panel);assert.equal(theme.xAxis.axisLabel.color,palette.text);assert.equal(theme.yAxis.nameTextStyle.color,palette.text);assert.equal(theme.legend.textStyle.color,palette.text);assert.equal(theme.tooltip.backgroundColor,palette.panel);assert.equal(theme.series,undefined);
 }
});

test('verification summary tolerates reinforcement that has not initialized after reload',()=>{
 const vm=Dimensionamiento();assert.doesNotThrow(()=>vm.actualizarAccesoriosDesdeVerificaciones({estabilidadVolteo:[],estabilidadDeslizamiento:[],presionesAdmisibles:[]}));
 assert.equal(vm.verfsismo.accesorios.find(a=>a.tipo==='Pantalla').max,'-');
});
test('report accepts pending data and keeps concrete resistance and steel yield in their proper fields',()=>{
 const vm=memoriacalculo();vm.predimData={};assert.doesNotThrow(()=>vm.getStructuredData());
 vm.predimData={inputValues:{B7:280,B8:5000,B21:8}};const data=vm.getStructuredData();assert.equal(data.materiales.fc,280);assert.equal(data.materiales.fy,5000);assert.equal(data.geometria.altura,8);
});
