import{h as ne}from"./html2canvas.esm-5Cw11iw4.js";var J=[],X=[];function re(F){if(!F)return;var y=[["Piso 1","","","","","",""]],m=F;m.innerHTML="";var D=new Handsontable(m,{data:y,rowHeaders:!1,colHeaders:!0,height:"auto",autoWrapRow:!0,autoWrapCol:!0,colWidths:[90,90,90,90,150,90,90,90,150],renderAllRows:!1,renderAllColumns:!0,viewportRowRenderingOffset:15,viewportColumnRenderingOffset:15,sanitizer:C=>C,nestedHeaders:[["Nivel","Vx Piso","Vx Elemento","Ratio","Verif. de Redundancia","Vy Piso","Vy Elemento","Ratio","Verif. de Redundancia"],["","(Ton)","(Ton)","(Vx)","(Vx)","(Ton)","(Ton)","(Vy)","(Vy)"]],columns:[{type:"text",readOnly:!0},{type:"numeric"},{type:"numeric"},{type:"numeric",readOnly:!0},{type:"text",readOnly:!0},{type:"numeric"},{type:"numeric"},{type:"numeric",readOnly:!0},{type:"text",readOnly:!0}],minSpareRows:1,beforePaste:function(C,O){var A=C.length+O[0].startRow;D.countRows()<A&&D.alter("insert_row_above",A-D.countRows(),C.length)},afterChange:function(C,O){if(O==="edit"||O==="paste"){var A=this,d=[];C.forEach(function(t){var i=t[0],e=t[1];if(e===1||e===2){var v=A.getDataAtCell(i,1),p=A.getDataAtCell(i,2),s=v!==0&&v!==null?p/v:0,o=s>=.3?"Diseñar para el 125% del Sismo":"No Diseñar para el 125% del Sismo";d.push([i,3,parseFloat(s.toFixed(2))]),d.push([i,4,o])}if(e===5||e===6){var c=A.getDataAtCell(i,5),u=A.getDataAtCell(i,6),f=c!==0&&c!==null?u/c:0,n=f>=.3?"Diseñar para el 125% del Sismo":"No Diseñar para el 125% del Sismo";d.push([i,7,parseFloat(f.toFixed(2))]),d.push([i,8,n])}}),d.length>0&&A.setDataAtCell(d,"internal")}},afterPaste:function(C,O){var A=this,d=O[0].startRow,t=O[0].startCol;A.suspendRender();try{A.populateFromArray(d,t,C,null,null,"paste");for(var i=A.getData(),e=[],v=0,p=0;p<i.length;p++){for(var s=!1,o=0;o<i[p].length;o++)if(i[p][o]!==null&&i[p][o]!==""&&i[p][o]!==void 0){s=!0;break}s&&(e.push([p,0,"Piso "+(v+1)]),v++)}e.length>0&&A.setDataAtCell(e)}finally{A.resumeRender()}},licenseKey:"non-commercial-and-evaluation"});setTimeout(()=>{D.render()},100),document.getElementById("saveDataBtn1").addEventListener("click",g);function g(){var C=D.getData();console.log("Raw data from table:",C);for(var O=[],A=0;A<C.length;A++)C[A]&&C[A][0]&&String(C[A][0]).trim()!==""&&O.push(C[A]);if(console.log("Filtered pisoData:",O),console.log("Cantidad de pisos:",O.length),O.length>=1){var d=document.getElementById("solicitudCargaT2");le(d,O)}}}function le(F,y){if(!F)return;var m=F;m.innerHTML="";var D=[];for(let d=0;d<y.length;d++){var g=y[d][0]||"Piso "+(d+1),C=[[g,"PL-01","1.40CM+1.70CV"],[g,"PL-01","1.25(CM+CV)+CSx Max"],[g,"PL-01","1.25(CM+CV)+CSx Min"],[g,"PL-01","1.25(CM+CV)+CSy Max"],[g,"PL-01","1.25(CM+CV)+CSy Min"],[g,"PL-01","1.25(CM+CV)-CSx Max"],[g,"PL-01","1.25(CM+CV)-CSx Min"],[g,"PL-01","1.25(CM+CV)-CSy Max"],[g,"PL-01","1.25(CM+CV)-CSy Min"],[g,"PL-01","0.90CM+CSx Max"],[g,"PL-01","0.90CM+CSx Min"],[g,"PL-01","0.90CM+CSy Max"],[g,"PL-01","0.90CM+CSy Min"],[g,"PL-01","0.90CM-CSx Max"],[g,"PL-01","0.90CM-CSx Min"],[g,"PL-01","0.90CM-CSy Max"],[g,"PL-01","0.90CM-CSy Min"]];C.map(t=>D.push(t))}var O=new Handsontable(m,{data:D,rowHeaders:!1,colHeaders:!0,height:"auto",autoWrapRow:!0,autoWrapCol:!0,colWidths:[70,90,220,90,90,90,90,90,90,90,90,90,90,90,90],renderAllRows:!1,renderAllColumns:!0,viewportRowRenderingOffset:15,viewportColumnRenderingOffset:15,sanitizer:d=>d,nestedHeaders:[["Piso","Placa","Combinaciones","Pu","V2","V3","T","M2","M3 ","Pux","Vux","Mux","Puy","Vuy","Muy"],["","","Carga","(Ton)","(Ton)","(Ton)","(Ton.m)","(Ton.m)","(Ton.m)","(Ton)","(Ton)","(Ton.m)","(Ton)","(Ton)","(Ton.m)"]],columns:[{type:"text"},{type:"text",readOnly:!0},{type:"text"},{type:"numeric"},{type:"numeric"},{type:"numeric"},{type:"numeric"},{type:"numeric"},{type:"numeric"},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0}],afterChange:function(d,t){if(t==="edit"||t==="paste"){var i=this,e=[];d.forEach(function(v){var p=v[0],s=v[1],o=v[3];s===3&&(e.push([p,9,o!==null?-o:null]),e.push([p,12,o!==null?-o:null])),s===4&&e.push([p,10,o]),s===5&&e.push([p,13,o]),s===7&&e.push([p,14,o]),s===8&&e.push([p,11,o])}),e.length>0&&i.setDataAtCell(e,"internal")}},afterPaste:function(d,t){var i=this,e=t[0].startRow,v=t[0].startCol;i.suspendRender();try{i.populateFromArray(e,v,d,null,null,"paste")}finally{i.resumeRender()}},licenseKey:"non-commercial-and-evaluation"});document.getElementById("saveDataBtn2").addEventListener("click",A);function A(){for(var d=O.getData(),t=[],i=0;i<d.length;i++)d[i]&&d[i][0]&&String(d[i][0]).trim()!==""&&t.push(d[i]);console.log("Filtered pisoData T2:",t),J=t.map(v=>v.slice(-6));var e=document.getElementById("solicitudCargaT3");ie(e,J,J.length)}}function ie(F,y){if(!F)return;var m=F;m.innerHTML="";var D=[],g=0,C=0,O=0,A=0,d=0,t=0,i=0;y.map((p,s)=>{if(g=Math.max(g,p[0]),C=Math.max(C,p[1]),O=Math.max(O,p[2]),A=Math.max(A,p[4]),d=Math.max(d,p[5]),i++,i%17==0){t++;var o=[];o.push("Piso "+t),o.push(g),o.push(C),o.push(O),o.push(A),o.push(d),console.log(o),D.push(o),g=0,C=0,O=0,A=0,d=0}});var e=new Handsontable(m,{data:D,rowHeaders:!1,colHeaders:!0,height:"auto",autoWrapRow:!0,autoWrapCol:!0,colWidths:[90,90,90,90,90,90],renderAllRows:!1,renderAllColumns:!0,viewportRowRenderingOffset:15,viewportColumnRenderingOffset:15,sanitizer:p=>p,nestedHeaders:[["Nivel","Pu máx","Vux máx","Mux máx","Vuy máx","Muy máx"],["","(Ton)","(Ton)","(Ton.m)","(Ton)","(Ton.m)"]],columns:[{type:"text",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0}],licenseKey:"non-commercial-and-evaluation"});function v(){X=e.getData(),console.log("Datos de la tabla 3:",X)}setTimeout(v,1e3)}function se(){const F=document.getElementById("toggleButton"),y=document.getElementById("contenedor_dcc"),m=document.getElementById("calccargars"),D=document.getElementById("contenedor_cc");F.addEventListener("click",function(){y.style.display=y.style.display==="block"?"none":"block";const g=F.querySelector("i");y.style.display==="block"?(g.classList.remove("fa-eye-slash"),g.classList.add("fa-eye")):(g.classList.remove("fa-eye"),g.classList.add("fa-eye-slash"))}),m.addEventListener("click",function(){D.style.display=D.style.display==="block"?"none":"block";const g=m.querySelector("i");D.style.display==="block"?(g.classList.remove("fa-eye-slash"),g.classList.add("fa-eye")):(g.classList.remove("fa-eye"),g.classList.add("fa-eye-slash"))})}var G=[],_=[],K=[];function oe(F,y,m){if(!F)return;var D=F;D.innerHTML="";var g=[];for(let d=0;d<y.length;d++){var C=[`Piso ${d+1}`,m.lxDF,"","","","","",y[d][3],"",""];g.push(C)}var O=new Handsontable(D,{data:g,rowHeaders:!1,colHeaders:!0,height:"auto",autoWrapRow:!0,autoWrapCol:!0,colWidths:[90,90,90,90,150,90,90,90,150,150],renderAllRows:!1,viewportRowRenderingOffset:15,nestedHeaders:[["Nivel","lm","h","hm","hm/lm","Tipo de","Tipo de","Mu","z","As"],["","(m)","(m)","(m)","","Muro","Falla Muro","(Ton.m)","(m)","(cm²)"]],columns:[{type:"text",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric"},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"text",readOnly:!0},{type:"text",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0}],afterChange:function(d,t){if(t==="edit"){var i=this;i.suspendRender();try{d.forEach(function(e){var v=e[0],p=e[1],s=e[3];if(p===2){var o=s,c=0;for(let l=0;l<i.countRows();l++)c+=i.getDataAtCell(l,2);v==0?i.setDataAtCell(v,3,c):(i.setDataAtCell(0,3,c),i.setDataAtCell(v,3,i.getDataAtCell(v-1,3)-o))}if(p===3){v+1<i.countRows()&&i.setDataAtCell(v+1,3,i.getDataAtCell(v,3)-i.getDataAtCell(v+1,2));var u=s/i.getDataAtCell(v,1);i.setDataAtCell(v,4,u)}if(p==4){var f=s>1?"Muro Esbelto":"Muro No Esbelto";i.setDataAtCell(v,5,f);var n=s>1?"Por Flexión":"Por Corte";i.setDataAtCell(v,6,n);var a=0;s>1?a=.9*i.getDataAtCell(v,1):.5<=s&&s<=1?a=.4*i.getDataAtCell(v,1)*(1+s):a=1.2*i.getDataAtCell(v,2),i.setDataAtCell(v,8,a)}if(p==7){var r=s*Math.pow(10,5)/(m.designDF*m.fyDF*i.getDataAtCell(v,8)*100);i.setDataAtCell(v,9,r)}if(p==8){var r=i.getDataAtCell(v,7)*Math.pow(10,5)/(m.designDF*m.fyDF*s*100);i.setDataAtCell(v,9,r)}})}finally{i.resumeRender()}}},afterPaste:function(d,t){var i=this,e=t[0].startRow,v=t[0].startCol;i.suspendRender();try{i.populateFromArray(e,v,d,null,null,"paste")}finally{i.resumeRender()}},licenseKey:"non-commercial-and-evaluation"});document.getElementById("saveDataBtnDF1X").addEventListener("click",A);function A(){var d=!0;K=O.getData();for(var t=0;t<K.length;t++){for(var i=0;i<K[t].length;i++)if(K[t][i]===null||K[t][i]===""){d=!1;break}if(!d)break}if(d){console.log("Datos de la tabla T1X:",K);var e=document.getElementById("flexDesingT2X");ue(e,K);var v=document.getElementById("flexDesingT3X");ce(v,K,m)}else alert("Hay celdas vacías")}}function ue(F,y){if(!F)return;var m=F;m.innerHTML="";var D=[];for(let A=0;A<y.length;A++){var g=[`Piso ${A+1}`,'ø3/4"',1.9,2.84,30,0,0,0,0,0,"No Cumple, verificar",'18ø5/8"'];D.push(g)}var C=new Handsontable(m,{data:D,rowHeaders:!1,colHeaders:!0,height:"auto",autoWrapRow:!0,autoWrapCol:!0,colWidths:[90,90,90,90,90,90,90,90,90,120,150,200],renderAllRows:!1,viewportRowRenderingOffset:15,nestedHeaders:[["Nivel","Acero","D","Área","N°",'Ø1/2"','Ø5/8"','Ø3/4"','Ø1"',"Ascolocado","Verificación","Distribución de Refuerzo"],["","","(cm)","(cm²)","Acero","","","","","(cm²)","Acero Colocado","Final en la Zona de Confinamiento"]],columns:[{type:"text",readOnly:!0},{type:"dropdown",source:["6 mm","8 mm",'ø3/8"',"12 mm",'ø1/2"','ø5/8"','ø3/4"','ø7/8"','ø1"','ø1 3/8"']},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric"},{type:"numeric"},{type:"numeric"},{type:"numeric"},{type:"numeric",readOnly:!0},{type:"text",readOnly:!0},{type:"text",readOnly:!0}],afterChange:function(A,d){if(d==="edit"){var t=this;t.suspendRender();try{A.forEach(function(i){var e=i[0],v=i[1],p=i[3];if(v===1){var s=p,o=0,c=0;s=="6 mm"?(o=.6,c=.28):s=="8 mm"?(o=.8,c=.5):s=='ø3/8"'?(o=.95,c=.71):s=="12 mm"?(o=1.2,c=1.13):s=='ø1/2"'?(o=1.27,c=1.29):s=='ø5/8"'?(o=1.59,c=2):s=='ø3/4"'?(o=1.9,c=2.84):s=='ø7/8"'?(o=2.22,c=3.87):s=='ø1"'?(o=2.54,c=5.1):(o=3.49,c=1.01),t.setDataAtCell(e,2,o),t.setDataAtCell(e,3,c)}if(v==3){var u=Math.ceil(y[e][9]/p);t.setDataAtCell(e,4,u)}if(v==5&&(t.setDataAtCell(e,9,1.267*p+1.979*t.getDataAtCell(e,6)+2.85*t.getDataAtCell(e,7)+5.067*t.getDataAtCell(e,8)),p!=0&&t.setDataAtCell(e,11,`${p}Ø1/2"`)),v==6&&(t.setDataAtCell(e,9,1.267*t.getDataAtCell(e,5)+1.979*p+2.85*t.getDataAtCell(e,7)+5.067*t.getDataAtCell(e,8)),p!=0&&t.setDataAtCell(e,11,`${p}Ø5/8"`)),v==7&&(t.setDataAtCell(e,9,1.267*t.getDataAtCell(e,5)+1.979*t.getDataAtCell(e,6)+2.85*p+5.067*t.getDataAtCell(e,8)),p!=0&&t.setDataAtCell(e,11,`${p}Ø3/4"`)),v==8&&(t.setDataAtCell(e,9,1.267*t.getDataAtCell(e,5)+1.979*t.getDataAtCell(e,6)+2.85*t.getDataAtCell(e,7)+5.067*p),p!=0&&t.setDataAtCell(e,11,`${p}Ø1"`)),v==9){var f=t.getDataAtCell(e,9)>y[e][9]?"Sí cumple":"No cumple, verificar";t.setDataAtCell(e,10,f)}})}finally{t.resumeRender()}}},afterPaste:function(A,d){var t=this,i=d[0].startRow,e=d[0].startCol;t.suspendRender();try{t.populateFromArray(i,e,A,null,null,"paste")}finally{t.resumeRender()}},licenseKey:"non-commercial-and-evaluation"});document.getElementById("saveDataBtnDF2X").addEventListener("click",O);function O(){var A=!0;G=C.getData();for(var d=0;d<G.length;d++){for(var t=0;t<G[d].length;t++)if(G[d][t]===null||G[d][t]===""){A=!1;break}if(!A)break}A&&alert("Guardado")}}function ce(F,y,m){if(F){var D=F;D.innerHTML="";var g=[];for(let s=0;s<y.length;s++){var C=parseFloat((Math.ceil(y[s][2]/25/.05)*.05).toFixed(2)),O=Math.max(C,.15),A=m.exDF>O?"Sí cumple":"No cumple, verificar",d=.0025,t=m.exDF>=.2?2:1,i=d*m.lnucxDF*100*m.exDF*100,e=.71,v=Math.ceil(m.lnucxDF*100*e/(i/t)/5)*5,p=[`Piso ${s+1}`,C,A,d,t,i,'ø3/8"',.95,.71,v,`$ø3/8" @ ${v} cm`];g.push(p)}new Handsontable(D,{data:g,rowHeaders:!1,colHeaders:!0,height:"auto",autoWrapRow:!0,autoWrapCol:!0,colWidths:[90,90,90,90,90,90,90,90,90,90,120],renderAllRows:!1,viewportRowRenderingOffset:15,nestedHeaders:[["Nivel","emín","Verificación","ρinicial","N°","As inicial","Acero","D","Área","s","Distribución de Refuerzo"],["","(m)","Espesor Mínimo","","Capas","(cm²)","","(cm)","(cm²)","(cm)","Inicial en el Núcleo"]],columns:[{type:"text",readOnly:!0},{type:"numeric",readOnly:!0},{type:"text",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric"},{type:"numeric"},{type:"dropdown",source:["6 mm","8 mm",'ø3/8"',"12 mm",'ø1/2"','ø5/8"','ø3/4"','ø7/8"','ø1"','ø1 3/8"']},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"text",readOnly:!0}],afterChange:function(s,o){if(o==="edit"){var c=this;c.suspendRender();try{s.forEach(function(u){var f=u[0],n=u[1],a=u[3];if(n===6){var r=a,l=0,w=0;r=="6 mm"?(l=.6,w=.28):r=="8 mm"?(l=.8,w=.5):r=='ø3/8"'?(l=.95,w=.71):r=="12 mm"?(l=1.2,w=1.13):r=='ø1/2"'?(l=1.27,w=1.29):r=='ø5/8"'?(l=1.59,w=2):r=='ø3/4"'?(l=1.9,w=2.84):r=='ø7/8"'?(l=2.22,w=3.87):r=='ø1"'?(l=2.54,w=5.1):(l=3.49,w=1.01),c.setDataAtCell(f,7,l),c.setDataAtCell(f,8,w)}n==8&&c.setDataAtCell(f,9,Math.ceil(m.lnucxDF*100*a/(c.getDataAtCell(f,5)/c.getDataAtCell(f,4))/5)*5),n==9&&c.setDataAtCell(f,10,`${c.getDataAtCell(f,6)} @ ${c.getDataAtCell(f,9)} cm`)})}finally{c.resumeRender()}}},afterPaste:function(s,o){var c=this,u=o[0].startRow,f=o[0].startCol;c.suspendRender();try{c.populateFromArray(u,f,s,null,null,"paste")}finally{c.resumeRender()}},licenseKey:"non-commercial-and-evaluation"})}}function de(F,y,m){if(!F)return;var D=F;D.innerHTML="";var g=[];for(let d=0;d<y.length;d++){var C=[`Piso ${d+1}`,m.lyDF,"","","","","",y[d][5],"",""];g.push(C)}var O=new Handsontable(D,{data:g,rowHeaders:!1,colHeaders:!0,height:"auto",autoWrapRow:!0,autoWrapCol:!0,colWidths:[90,90,90,90,150,90,90,90,150,150],renderAllRows:!1,viewportRowRenderingOffset:15,nestedHeaders:[["Nivel","lm","h","hm","hm/lm","Tipo","Tipo","Mu","z","As"],["","(m)","(m)","(m)","","Muro","Falla Muro","(Ton.m)","(m)","(cm²)"]],columns:[{type:"text",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric"},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"text",readOnly:!0},{type:"text",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0}],afterChange:function(d,t){if(t==="edit"){var i=this;i.suspendRender();try{d.forEach(function(e){var v=e[0],p=e[1],s=e[3];if(p===2){var o=s,c=0;for(let l=0;l<i.countRows();l++)c+=i.getDataAtCell(l,2);v==0?i.setDataAtCell(v,3,c):(i.setDataAtCell(0,3,c),i.setDataAtCell(v,3,i.getDataAtCell(v-1,3)-o))}if(p===3){v+1<i.countRows()&&i.setDataAtCell(v+1,3,i.getDataAtCell(v,3)-i.getDataAtCell(v+1,2));var u=s/i.getDataAtCell(v,1);i.setDataAtCell(v,4,u)}if(p==4){var f=s>1?"Muro Esbelto":"Muro No Esbelto";i.setDataAtCell(v,5,f);var n=s>1?"Por Flexión":"Por Corte";i.setDataAtCell(v,6,n);var a=0;s>1?a=.9*i.getDataAtCell(v,1):.5<=s&&s<=1?a=.4*i.getDataAtCell(v,1)*(1+s):a=1.2*i.getDataAtCell(v,2),i.setDataAtCell(v,8,a)}if(p==7){var r=s*Math.pow(10,5)/(m.designDF*m.fyDF*i.getDataAtCell(v,8)*100);i.setDataAtCell(v,9,r)}if(p==8){var r=i.getDataAtCell(v,7)*Math.pow(10,5)/(m.designDF*m.fyDF*s*100);i.setDataAtCell(v,9,r)}})}finally{i.resumeRender()}}},afterPaste:function(d,t){var i=this,e=t[0].startRow,v=t[0].startCol;i.suspendRender();try{i.populateFromArray(e,v,d,null,null,"paste")}finally{i.resumeRender()}},licenseKey:"non-commercial-and-evaluation"});document.getElementById("saveDataBtnDF1Y").addEventListener("click",A);function A(){for(var d=!0,t=O.getData(),i=0;i<t.length;i++){for(var e=0;e<t[i].length;e++)if(t[i][e]===null||t[i][e]===""){d=!1;break}if(!d)break}if(d){console.log("Datos de la tabla T1Y:",t);var v=document.getElementById("flexDesingT2Y");me(v,t);var p=document.getElementById("flexDesingT3Y");ye(p,t,m)}else alert("Hay celdas vacías")}}function me(F,y){if(!F)return;var m=F;m.innerHTML="";var D=[];for(let A=0;A<y.length;A++){var g=[`Piso ${A+1}`,'ø3/4"',1.9,2.84,1,0,0,0,0,0,"No Cumple, verificar",'18ø5/8"'];D.push(g)}var C=new Handsontable(m,{data:D,rowHeaders:!1,colHeaders:!0,height:"auto",autoWrapRow:!0,autoWrapCol:!0,colWidths:[90,90,90,90,90,90,90,90,90,120,150,200],renderAllRows:!1,viewportRowRenderingOffset:15,nestedHeaders:[["Nivel","Acero","D","Área","N°",'Ø1/2"','Ø5/8"','Ø3/4"','Ø1"',"Ascolocado","Verificación","Distribución de Refuerzo"],["","","(cm)","(cm²)","Acero","","","","","(cm²)","Acero Colocado","Final en la Zona de Confinamiento"]],columns:[{type:"text",readOnly:!0},{type:"dropdown",source:["6 mm","8 mm",'ø3/8"',"12 mm",'ø1/2"','ø5/8"','ø3/4"','ø7/8"','ø1"','ø1 3/8"']},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric"},{type:"numeric"},{type:"numeric"},{type:"numeric"},{type:"numeric",readOnly:!0},{type:"text",readOnly:!0},{type:"text",readOnly:!0}],afterChange:function(A,d){if(d==="edit"){var t=this;t.suspendRender();try{A.forEach(function(i){var e=i[0],v=i[1],p=i[3];if(v===1){var s=p,o=0,c=0;s=="6 mm"?(o=.6,c=.28):s=="8 mm"?(o=.8,c=.5):s=='ø3/8"'?(o=.95,c=.71):s=="12 mm"?(o=1.2,c=1.13):s=='ø1/2"'?(o=1.27,c=1.29):s=='ø5/8"'?(o=1.59,c=2):s=='ø3/4"'?(o=1.9,c=2.84):s=='ø7/8"'?(o=2.22,c=3.87):s=='ø1"'?(o=2.54,c=5.1):(o=3.49,c=1.01),t.setDataAtCell(e,2,o),t.setDataAtCell(e,3,c)}if(v==3){var u=Math.ceil(y[e][9]/p);t.setDataAtCell(e,4,u)}if(v==5&&(t.setDataAtCell(e,9,1.267*p+1.979*t.getDataAtCell(e,6)+2.85*t.getDataAtCell(e,7)+5.067*t.getDataAtCell(e,8)),p!=0&&t.setDataAtCell(e,11,`${p}Ø1/2"`)),v==6&&(t.setDataAtCell(e,9,1.267*t.getDataAtCell(e,5)+1.979*p+2.85*t.getDataAtCell(e,7)+5.067*t.getDataAtCell(e,8)),p!=0&&t.setDataAtCell(e,11,`${p}Ø5/8"`)),v==7&&(t.setDataAtCell(e,9,1.267*t.getDataAtCell(e,5)+1.979*t.getDataAtCell(e,6)+2.85*p+5.067*t.getDataAtCell(e,8)),p!=0&&t.setDataAtCell(e,11,`${p}Ø3/4"`)),v==8&&(t.setDataAtCell(e,9,1.267*t.getDataAtCell(e,5)+1.979*t.getDataAtCell(e,6)+2.85*t.getDataAtCell(e,7)+5.067*p),p!=0&&t.setDataAtCell(e,11,`${p}Ø1"`)),v==9){var f=t.getDataAtCell(e,9)>y[e][9]?"Sí cumple":"No cumple, verificar";t.setDataAtCell(e,10,f)}})}finally{t.resumeRender()}}},afterPaste:function(A,d){var t=this,i=d[0].startRow,e=d[0].startCol;t.suspendRender();try{t.populateFromArray(i,e,A,null,null,"paste")}finally{t.resumeRender()}},licenseKey:"non-commercial-and-evaluation"});document.getElementById("saveDataBtnDF2Y").addEventListener("click",O);function O(){var A=!0;_=C.getData();for(var d=0;d<_.length;d++){for(var t=0;t<_[d].length;t++)if(_[d][t]===null||_[d][t]===""){A=!1;break}if(!A)break}A&&alert("Guardado")}}function ye(F,y,m){if(F){var D=F;D.innerHTML="";var g=[];for(let s=0;s<y.length;s++){var C=parseFloat((Math.ceil(y[s][2]/25/.05)*.05).toFixed(2)),O=Math.max(C,.15),A=m.eyDF>O?"Sí cumple":"No cumple, verificar",d=.0025,t=m.eyDF>=.2?2:1,i=d*m.lnucyDF*100*m.eyDF*100,e=.71,v=Math.ceil(m.lnucyDF*100*e/(i/t)/5)*5,p=[`Piso ${s+1}`,C,A,d,t,i,'ø3/8"',.95,.71,v,`$ø3/8" @ ${v} cm`];g.push(p)}new Handsontable(D,{data:g,rowHeaders:!1,colHeaders:!0,height:"auto",autoWrapRow:!0,autoWrapCol:!0,colWidths:[90,90,90,90,90,90,90,90,90,90,120],renderAllRows:!1,viewportRowRenderingOffset:15,nestedHeaders:[["Nivel","emín","Verificación","ρinicial","N°","As inicial","Acero","D","Área","s","Distribución de Refuerzo"],["","(m)","Espesor Mínimo","","Capas","(cm²)","","(cm)","(cm²)","(cm)","Inicial en el Núcleo"]],columns:[{type:"text",readOnly:!0},{type:"numeric",readOnly:!0},{type:"text",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric"},{type:"numeric"},{type:"dropdown",source:["6 mm","8 mm",'ø3/8"',"12 mm",'ø1/2"','ø5/8"','ø3/4"','ø7/8"','ø1"','ø1 3/8"']},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"text",readOnly:!0}],afterChange:function(s,o){if(o==="edit"){var c=this;c.suspendRender();try{s.forEach(function(u){var f=u[0],n=u[1],a=u[3];if(n===6){var r=a,l=0,w=0;r=="6 mm"?(l=.6,w=.28):r=="8 mm"?(l=.8,w=.5):r=='ø3/8"'?(l=.95,w=.71):r=="12 mm"?(l=1.2,w=1.13):r=='ø1/2"'?(l=1.27,w=1.29):r=='ø5/8"'?(l=1.59,w=2):r=='ø3/4"'?(l=1.9,w=2.84):r=='ø7/8"'?(l=2.22,w=3.87):r=='ø1"'?(l=2.54,w=5.1):(l=3.49,w=1.01),c.setDataAtCell(f,7,l),c.setDataAtCell(f,8,w)}n==8&&c.setDataAtCell(f,9,Math.ceil(m.lnucyDF*100*a/(c.getDataAtCell(f,5)/c.getDataAtCell(f,4))/5)*5),n==9&&c.setDataAtCell(f,10,`${c.getDataAtCell(f,6)} @ ${c.getDataAtCell(f,9)} cm`)})}finally{c.resumeRender()}}},afterPaste:function(s,o){var c=this,u=o[0].startRow,f=o[0].startCol;c.suspendRender();try{c.populateFromArray(u,f,s,null,null,"paste")}finally{c.resumeRender()}},licenseKey:"non-commercial-and-evaluation"})}}var V=[],Y=[],q=[];function ve(F,y,m){if(!F)return;var D=F;D.innerHTML="";var g=[],C=6;for(let t=0;t<y.length;t++){var O=[`Piso ${t+1}`,m.lxDF,"","","",y[t][2],y[t][3],"","","","","","","","","-","-",""];g.push(O)}var A=new Handsontable(D,{data:g,rowHeaders:!1,colHeaders:!0,height:"auto",autoWrapRow:!0,autoWrapCol:!0,colWidths:[90,50,50,90,50,50,50,50,90,50,170,150,150,50,150,50,150,150],nestedHeaders:[["Nivel","lm","h","hm acumulado","hm","Vua","Mua","Cociente","¿Aplica criterio?","Mnx","Mnx/Mua","Vux","hm/lm","αc","Vcx máx","Nu","β","Vcx"],["","(m)","(m)","(m)","(m)","(Ton)","(Ton.m)","","","","","","","","","","",""]],columns:[{type:"text",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric"},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"text",readOnly:!0},{type:"numeric"},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric"},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0}],afterChange:function(t,i){if(i==="edit"||i==="CopyPaste.paste"){var e=this,v=t.filter(n=>n[1]===2);if(t.filter(n=>n[1]!==2),v.length>0){var p=0;for(let n=0;n<e.countRows();n++){var s=e.getDataAtCell(n,2);p+=s!==null&&s!==""?parseFloat(s):0}var o=[],c=0;for(let n=0;n<e.countRows();n++){var u=e.getDataAtCell(n,2);u===null||u===""||(u=parseFloat(u),c+=u,o.push([n,3,c]))}var f=0;for(let n=0;n<e.countRows();n++){var u=e.getDataAtCell(n,2);u===null||u===""||(u=parseFloat(u),n===0?o.push([0,4,p]):o.push([n,4,f-u]),f+=u)}v.forEach(function(n){var a=n[0],r=parseFloat(n[3]),l=0;if(a==0){var w=parseFloat(e.getDataAtCell(1,2))||0;l=Math.max(e.getDataAtCell(a,1),r+w,.25*(e.getDataAtCell(0,6)/e.getDataAtCell(0,5)))}else if(a==1)l=Math.max(e.getDataAtCell(a,1),parseFloat(e.getDataAtCell(0,2))+r,.25*(e.getDataAtCell(0,6)/e.getDataAtCell(0,5)));else{var E=parseFloat(e.getDataAtCell(0,2))||0,w=parseFloat(e.getDataAtCell(1,2))||0;l=Math.max(e.getDataAtCell(a,1),E+w,.25*(e.getDataAtCell(0,6)/e.getDataAtCell(0,5)))}o.push([a,7,l]);var x=o.find(P=>P[0]===a&&P[1]===3),T=x?x[2]:e.getDataAtCell(a,3),b=o.find(P=>P[0]===0&&P[1]===3),I=b?b[2]:e.getDataAtCell(0,3),M=parseFloat((T-I).toFixed(2))<l?"Sí aplica":"No aplica";o.push([a,8,M]);var R=o.find(P=>P[0]===a&&P[1]===4),h=R?R[2]:e.getDataAtCell(a,4),L=h/e.getDataAtCell(a,1);o.push([a,12,L]);var H=L<=1.5?.8:L>=2?.53:.53-(.53-.8)*(2-L)/(2-1.5);o.push([a,13,H]);var k=m.acwxDC*Math.sqrt(m.fcDF)*H*10;o.push([a,14,k]);var S=e.getDataAtCell(a,15);if(e.getDataAtCell(a,16),S=="-")o.push([a,17,k]);else{var Z=1-parseFloat(S)/(35*m.exDF*e.getDataAtCell(a,1)*10);o.push([a,16,Z]),o.push([a,17,k*Z])}}),v.forEach(function(n){var a=n[0],r=o.filter(x=>x[0]===a&&x[1]===8),l=r.length>0?r[r.length-1][2]:e.getDataAtCell(a,8),w=e.getDataAtCell(a,10),E=e.getDataAtCell(a,5);o.push([a,11,l=="Sí aplica"?E*w:E])}),e.setDataAtCell(o,"internal_update");return}t.forEach(function(n){var a=n[0],r=n[1],l=n[3];if(r===3){a+1<e.countRows()&&e.setDataAtCell(a+1,3,l+e.getDataAtCell(a+1,2));var w=e.getDataAtCell(0,3),E=parseFloat((l-w).toFixed(2))<e.getDataAtCell(a,7)?"Sí aplica":"No aplica";e.setDataAtCell(a,8,E)}if(r===4){a+1<e.countRows()&&e.setDataAtCell(a+1,4,l-e.getDataAtCell(a+1,2));var x=l/e.getDataAtCell(a,1);e.setDataAtCell(a,12,x)}if(r==7){var w=e.getDataAtCell(0,3),T=e.getDataAtCell(a,3),E=parseFloat((T-w).toFixed(2))<l?"Sí aplica":"No aplica";e.setDataAtCell(a,8,E)}r==8&&e.setDataAtCell(a,11,l=="Sí aplica"?e.getDataAtCell(a,5)*e.getDataAtCell(a,10):e.getDataAtCell(a,5)),r==9&&e.setDataAtCell(a,10,l=="-"?"-":Math.min(l/e.getDataAtCell(a,6),C)),r==10&&e.setDataAtCell(a,11,e.getDataAtCell(a,8)=="Sí aplica"?e.getDataAtCell(a,5)*l:e.getDataAtCell(a,5)),r==12&&e.setDataAtCell(a,13,l<=1.5?.8:l>=2?.53:.53-(.53-.8)*(2-l)/(2-1.5)),r==13&&e.setDataAtCell(a,14,m.acwxDC*Math.sqrt(m.fcDF)*l*10),r==14&&e.setDataAtCell(a,17,e.getDataAtCell(a,15)=="-"?l:l*e.getDataAtCell(a,16)),r==15&&(e.setDataAtCell(a,16,l=="-"?"-":1-l/(35*m.exDF*e.getDataAtCell(a,1)*10)),e.setDataAtCell(a,17,l=="-"?e.getDataAtCell(a,14):e.getDataAtCell(a,14)*e.getDataAtCell(a,16))),r==16&&e.setDataAtCell(a,17,l=="-"?e.getDataAtCell(a,14):e.getDataAtCell(a,14)*l)})}},afterPaste:function(t,i){console.log(t),console.log(i);var e=this,v=i[0].startRow,p=i[0].startCol,s=i[0].endCol;if(p<=2&&s>=2){var o=[];t.forEach(function(c,u){let f=0;for(let n=p;n<=s;n++)o.push([v+u,n,c[f]]),f++}),e.setDataAtCell(o,"CopyPaste.paste")}else t.forEach(function(c,u){var f=0;for(let n=p;n<=s;n++)e.setDataAtCell(v+u,n,c[f]),f++})},licenseKey:"non-commercial-and-evaluation"});document.getElementById("saveDataBtnDC1X").addEventListener("click",d);function d(){var t=!0;V=A.getData();for(var i=0;i<V.length;i++){for(var e=0;e<V[i].length;e++)if(V[i][e]===null||V[i][e]===""){t=!1;break}if(!t)break}if(t){console.log("Datos de la tabla DC T1X:",V);var v=document.getElementById("cutDesingT2X");pe(v,m)}else alert("Hay celdas vacías")}}function pe(F,y){if(!F)return;var m=F;m.innerHTML="";var D=V,g=[];for(let a=0;a<D.length;a++){var C=Math.max(D[a][11]/y.designDC-D[a][17],0),O=2.1*Math.sqrt(y.fcDF)*y.exDF*y.dxDF*10,A=y.acwxDC*Math.pow(100,2),d=D[a][11]>.53*A*Math.sqrt(y.fcDF)/1e3||y.exDF>.2?2:1,t=.27*Math.sqrt(y.fcDF)*y.exDF*y.dxDF*10,i=D[a][11]<t?.002:.0025,e=Math.max(i,C/(y.exDF*y.lxDF*y.fyDF*10)),v=y.exDF*y.lxDF*e*y.fyDF*10,p=y.designDC*(D[a][17]+v),s=y.acwxDC*Math.sqrt(y.fcDF)*2.6*10,o=p<=s?"Sí cumple":"No cumple, verificar",c=p>=D[a][11]?"Sí cumple":"No cumple, verificar",u=[`Piso ${a+1}`,C,O,C<=O?"Sí cumple":"No cumple, verificar",A,d,t,i,e,v,p,s,o,c];g.push(u)}var f=new Handsontable(m,{data:g,rowHeaders:!1,colHeaders:!0,height:"auto",autoWrapRow:!0,autoWrapCol:!0,colWidths:[90,90,150,90,90,90,150,90,90,90,150,150,90,90],nestedHeaders:[["Nivel","Vs","Vs máx","Verificación","Acv","N°","Vu máx","ρh mín","ρh","Vs final","Vn","Vn máx","Verificación","Verificación"],["","(Ton)","(Ton)","Cortante del Acero Máximo","(cm²)","Capas","(Ton)","","","(Ton)","(Ton)","(Ton)","(Ton)","Resistencia al Cortante"]],columns:[{type:"text",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"text",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"text",readOnly:!0},{type:"text",readOnly:!0}],licenseKey:"non-commercial-and-evaluation"});document.getElementById("saveDataBtnDC2X").addEventListener("click",n);function n(){Y=f.getData();var a=document.getElementById("cutDesingT3X");fe(a,y)}}function fe(F,y){if(!F)return;var m=F;m.innerHTML="";var D=[];for(let u=0;u<V.length;u++){var g=V[u][11]<Y[u][6]?.0015:.0025,C=Y[u][8],O=Math.min(Math.max(.0025+.5*(2.5-V[u][12])*(Y[u][8]-.0025),g),C),A=O<=C?"Sí cumple":"No cumple, verificar",d=.71,t=Math.ceil(Y[u][5]*d/(y.exDF*100*Y[u][8])/2.5)*2.5,i=Math.ceil(Y[u][5]*d/(y.exDF*100*O)/2.5)*2.5,e=Math.min(3*y.exDF*100,40),v=t<e?"Sí cumple":"No cumple, verificar",p=i<e?"Sí cumple":"No cumple, verificar",s=[`Piso ${u+1}`,g,C,O,A,'ø3/8"',.95,d,t,e,v,'ø3/8"',.95,d,i,e,p];D.push(s)}var o=new Handsontable(m,{data:D,rowHeaders:!1,colHeaders:!0,height:"auto",autoWrapRow:!0,autoWrapCol:!0,colWidths:[90,90,90,170,90,90,90,90,90,90,90,90,90,90,90,90,90],nestedHeaders:[["Nivel","ρv mín","ρv máx","ρv","Verificación","Acero","D","Área","s","smáx","Distribución de Refuerzo","Acero","D","Área","s","smáx","Distribución de Refuerzo"],["","","","","Cuantía Vertical Máxima","","(cm)","(cm²)","(cm)","(cm)","Inicial en el Núcleo","","(cm)","(cm²)","(cm)","(cm)","Inicial en el Núcleo"]],columns:[{type:"text",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"text",readOnly:!0},{type:"dropdown",source:["6 mm","8 mm",'ø3/8"',"12 mm",'ø1/2"','ø5/8"','ø3/4"','ø7/8"','ø1"','ø1 3/8"']},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"text"},{type:"dropdown",source:["6 mm","8 mm",'ø3/8"',"12 mm",'ø1/2"','ø5/8"','ø3/4"','ø7/8"','ø1"','ø1 3/8"']},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"text",readOnly:!0}],afterChange:function(u,f){if(f==="edit"){var n=this;u.forEach(function(a){var r=a[0],l=a[1],w=a[3];if(l===5){var E=w,x=0,T=0;E=="6 mm"?(x=.6,T=.28):E=="8 mm"?(x=.8,T=.5):E=='ø3/8"'?(x=.95,T=.71):E=="12 mm"?(x=1.2,T=1.13):E=='ø1/2"'?(x=1.27,T=1.29):E=='ø5/8"'?(x=1.59,T=2):E=='ø3/4"'?(x=1.9,T=2.84):E=='ø7/8"'?(x=2.22,T=3.87):E=='ø1"'?(x=2.54,T=5.1):(x=3.49,T=1.01),n.setDataAtCell(r,6,x),n.setDataAtCell(r,7,T)}if(l==7&&n.setDataAtCell(r,8,Math.ceil(Y[r][5]*w/(y.exDF*100*Y[r][8])/2.5)*2.5),l==8&&n.setDataAtCell(r,10,w<=n.getDataAtCell(r,9)?"Sí cumple":"No cumple, verificar"),l===11){var E=w,x=0,T=0;E=="6 mm"?(x=.6,T=.28):E=="8 mm"?(x=.8,T=.5):E=='ø3/8"'?(x=.95,T=.71):E=="12 mm"?(x=1.2,T=1.13):E=='ø1/2"'?(x=1.27,T=1.29):E=='ø5/8"'?(x=1.59,T=2):E=='ø3/4"'?(x=1.9,T=2.84):E=='ø7/8"'?(x=2.22,T=3.87):E=='ø1"'?(x=2.54,T=5.1):(x=3.49,T=1.01),n.setDataAtCell(r,12,x),n.setDataAtCell(r,13,T)}l==13&&n.setDataAtCell(r,14,Math.ceil(Y[r][5]*w/(y.exDF*100*n.getDataAtCell(r,3))/2.5)*2.5),l==14&&n.setDataAtCell(r,16,w<=n.getDataAtCell(r,15)?"Sí cumple":"No cumple, verificar")})}},licenseKey:"non-commercial-and-evaluation"});document.getElementById("saveDataBtnDC3X").addEventListener("click",c);function c(){q=o.getData();var u=document.getElementById("cutDesingT4X");ge(u)}}function ge(F){if(F){var y=F;y.innerHTML="";var m=[];for(let g=0;g<V.length;g++){var D=[`Piso ${g+1}`,Y[g][5],q[g][5],"@",q[g][8],Y[g][5],q[g][11],"@",q[g][14]];m.push(D)}new Handsontable(y,{data:m,rowHeaders:!1,colHeaders:!0,height:"auto",autoWrapRow:!0,autoWrapCol:!0,colWidths:[90,90,90,50,90,90,90,50,90],colHeaders:["Nivel","Capas","Acero","","s (cm)","Capas","Acero","","s (cm)"],columns:[{type:"text",readOnly:!0},{type:"numeric",readOnly:!0},{type:"text",readOnly:!0},{type:"text",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"text",readOnly:!0},{type:"text",readOnly:!0},{type:"numeric",readOnly:!0}],licenseKey:"non-commercial-and-evaluation"})}}var W=[],$=[],z=[];function Ce(F,y,m){if(!F)return;var D=F;D.innerHTML="";var g=[],C=6;for(let t=0;t<y.length;t++){var O=[`Piso ${t+1}`,m.lyDF,"","","",y[t][4],y[t][5],"","","","","","","","","-","-",""];g.push(O)}var A=new Handsontable(D,{data:g,rowHeaders:!1,colHeaders:!0,height:"auto",autoWrapRow:!0,autoWrapCol:!0,colWidths:[90,50,50,90,50,50,50,50,90,50,170,150,150,50,150,50,150,150],nestedHeaders:[["Nivel","lm","h","hm acumulado","hm","Vua","Mua","Cociente","¿Aplica criterio?","Mny","Mny/Mua","Vuy","hm/lm","αc","Vcy máx","Nu","β","Vcy"],["","(m)","(m)","(m)","(m)","(Ton)","(Ton.m)","","","(Ton.m)","","(Ton)","","","(Ton)","(Ton)","","(Ton)"]],columns:[{type:"text",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric"},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"text",readOnly:!0},{type:"numeric"},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric"},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0}],afterChange:function(t,i){if(i==="edit"||i==="CopyPaste.paste"){var e=this,v=t.filter(n=>n[1]===2);if(t.filter(n=>n[1]!==2),v.length>0){var p=0;for(let n=0;n<e.countRows();n++){var s=e.getDataAtCell(n,2);p+=s!==null&&s!==""?parseFloat(s):0}var o=[],c=0;for(let n=0;n<e.countRows();n++){var u=e.getDataAtCell(n,2);u===null||u===""||(u=parseFloat(u),c+=u,o.push([n,3,c]))}var f=0;for(let n=0;n<e.countRows();n++){var u=e.getDataAtCell(n,2);u===null||u===""||(u=parseFloat(u),n===0?o.push([0,4,p]):o.push([n,4,f-u]),f+=u)}v.forEach(function(n){var a=n[0],r=parseFloat(n[3]),l=0;if(a==0){var w=parseFloat(e.getDataAtCell(1,2))||0;l=Math.max(e.getDataAtCell(a,1),r+w,.25*(e.getDataAtCell(0,6)/e.getDataAtCell(0,5)))}else if(a==1)l=Math.max(e.getDataAtCell(a,1),parseFloat(e.getDataAtCell(0,2))+r,.25*(e.getDataAtCell(0,6)/e.getDataAtCell(0,5)));else{var E=parseFloat(e.getDataAtCell(0,2))||0,w=parseFloat(e.getDataAtCell(1,2))||0;l=Math.max(e.getDataAtCell(a,1),E+w,.25*(e.getDataAtCell(0,6)/e.getDataAtCell(0,5)))}o.push([a,7,l]);var x=o.find(P=>P[0]===a&&P[1]===3),T=x?x[2]:e.getDataAtCell(a,3),b=o.find(P=>P[0]===0&&P[1]===3),I=b?b[2]:e.getDataAtCell(0,3),M=parseFloat((T-I).toFixed(2))<l?"Sí aplica":"No aplica";o.push([a,8,M]);var R=o.find(P=>P[0]===a&&P[1]===4),h=R?R[2]:e.getDataAtCell(a,4),L=h/e.getDataAtCell(a,1);o.push([a,12,L]);var H=L<=1.5?.8:L>=2?.53:.53-(.53-.8)*(2-L)/(2-1.5);o.push([a,13,H]);var k=m.acwyDC*Math.sqrt(m.fcDF)*H*10;o.push([a,14,k]);var S=e.getDataAtCell(a,15);if(S=="-")o.push([a,17,k]);else{var Z=1-parseFloat(S)/(35*m.eyDF*e.getDataAtCell(a,1)*10);o.push([a,16,Z]),o.push([a,17,k*Z])}}),v.forEach(function(n){var a=n[0],r=o.filter(x=>x[0]===a&&x[1]===8),l=r.length>0?r[r.length-1][2]:e.getDataAtCell(a,8),w=e.getDataAtCell(a,10),E=e.getDataAtCell(a,5);o.push([a,11,l=="Sí aplica"?E*w:E])}),e.setDataAtCell(o,"internal_update");return}t.forEach(function(n){var a=n[0],r=n[1],l=n[3];if(r===3){a+1<e.countRows()&&e.setDataAtCell(a+1,3,l+e.getDataAtCell(a+1,2));var w=e.getDataAtCell(0,3),E=parseFloat((l-w).toFixed(2))<e.getDataAtCell(a,7)?"Sí aplica":"No aplica";e.setDataAtCell(a,8,E)}if(r===4){a+1<e.countRows()&&e.setDataAtCell(a+1,4,l-e.getDataAtCell(a+1,2));var x=l/e.getDataAtCell(a,1);e.setDataAtCell(a,12,x)}if(r==7){var w=e.getDataAtCell(0,3),T=e.getDataAtCell(a,3),E=parseFloat((T-w).toFixed(2))<l?"Sí aplica":"No aplica";e.setDataAtCell(a,8,E)}r==8&&e.setDataAtCell(a,11,l=="Sí aplica"?e.getDataAtCell(a,5)*e.getDataAtCell(a,10):e.getDataAtCell(a,5)),r==9&&e.setDataAtCell(a,10,l=="-"?"-":Math.min(l/e.getDataAtCell(a,6),C)),r==10&&e.setDataAtCell(a,11,e.getDataAtCell(a,8)=="Sí aplica"?e.getDataAtCell(a,5)*l:e.getDataAtCell(a,5)),r==12&&e.setDataAtCell(a,13,l<=1.5?.8:l>=2?.53:.53-(.53-.8)*(2-l)/(2-1.5)),r==13&&e.setDataAtCell(a,14,m.acwyDC*Math.sqrt(m.fcDF)*l*10),r==14&&e.setDataAtCell(a,17,e.getDataAtCell(a,15)=="-"?l:l*e.getDataAtCell(a,16)),r==15&&(e.setDataAtCell(a,16,l=="-"?"-":1-l/(35*m.eyDF*e.getDataAtCell(a,1)*10)),e.setDataAtCell(a,17,l=="-"?e.getDataAtCell(a,14):e.getDataAtCell(a,14)*e.getDataAtCell(a,16))),r==16&&e.setDataAtCell(a,17,l=="-"?e.getDataAtCell(a,14):e.getDataAtCell(a,14)*l)})}},afterPaste:function(t,i){console.log(t),console.log(i);var e=this,v=i[0].startRow,p=i[0].startCol,s=i[0].endCol;if(p<=2&&s>=2){var o=[];t.forEach(function(c,u){let f=0;for(let n=p;n<=s;n++)o.push([v+u,n,c[f]]),f++}),e.setDataAtCell(o,"CopyPaste.paste")}else t.forEach(function(c,u){var f=0;for(let n=p;n<=s;n++)e.setDataAtCell(v+u,n,c[f]),f++})},licenseKey:"non-commercial-and-evaluation"});document.getElementById("saveDataBtnDC1Y").addEventListener("click",d);function d(){var t=!0;W=A.getData();for(var i=0;i<W.length;i++){for(var e=0;e<W[i].length;e++)if(W[i][e]===null||W[i][e]===""){t=!1;break}if(!t)break}if(t){console.log("Datos de la tabla DC T1X:",W);var v=document.getElementById("cutDesingT2Y");De(v,m)}else alert("Hay celdas vacías")}}function De(F,y){if(!F)return;var m=F;m.innerHTML="";var D=W,g=[];for(let a=0;a<D.length;a++){var C=Math.max(D[a][11]/y.designDC-D[a][17],0),O=2.1*Math.sqrt(y.fcDF)*y.eyDF*y.dyDF*10,A=y.acwyDC*Math.pow(100,2),d=D[a][11]>.53*A*Math.sqrt(y.fcDF)/1e3||y.eyDF>.2?2:1,t=.27*Math.sqrt(y.fcDF)*y.eyDF*y.dyDF*10,i=D[a][11]<t?.002:.0025,e=Math.max(i,C/(y.eyDF*y.lyDF*y.fyDF*10)),v=y.eyDF*y.lyDF*e*y.fyDF*10,p=y.designDC*(D[a][17]+v),s=y.acwyDC*Math.sqrt(y.fcDF)*2.6*10,o=p<=s?"Sí cumple":"No cumple, verificar",c=p>=D[a][11]?"Sí cumple":"No cumple, verificar",u=[`Piso ${a+1}`,C,O,C<=O?"Sí cumple":"No cumple, verificar",A,d,t,i,e,v,p,s,o,c];g.push(u)}var f=new Handsontable(m,{data:g,rowHeaders:!1,colHeaders:!0,height:"auto",autoWrapRow:!0,autoWrapCol:!0,colWidths:[90,90,150,90,90,90,150,90,90,90,150,150,90,90],nestedHeaders:[["Nivel","Vs","Vs máx","Verificación","Acv","N°","Vu máx","ρh mín","ρh","Vs final","Vn","Vn máx","Verificación","Verificación"],["","(Ton)","(Ton)","Cortante del Acero Máximo","(cm²)","Capas","(Ton)","","","(Ton)","(Ton)","(Ton)",'"Vn máx"',"Resistencia al Cortante"]],columns:[{type:"text",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"text",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"text",readOnly:!0},{type:"text",readOnly:!0}],licenseKey:"non-commercial-and-evaluation"});document.getElementById("saveDataBtnDC2Y").addEventListener("click",n);function n(){$=f.getData();var a=document.getElementById("cutDesingT3Y");xe(a,y)}}function xe(F,y){if(!F)return;var m=F;m.innerHTML="";var D=[];for(let u=0;u<W.length;u++){var g=W[u][11]<$[u][6]?.0015:.0025,C=$[u][8],O=Math.min(Math.max(.0025+.5*(2.5-W[u][12])*($[u][8]-.0025),g),C),A=O<=C?"Sí cumple":"No cumple, verificar",d=.71,t=Math.ceil($[u][5]*d/(y.eyDF*100*$[u][8])/2.5)*2.5,i=Math.ceil($[u][5]*d/(y.eyDF*100*O)/2.5)*2.5,e=Math.min(3*y.eyDF*100,40),v=t<e?"Sí cumple":"No cumple, verificar",p=i<e?"Sí cumple":"No cumple, verificar",s=[`Piso ${u+1}`,g,C,O,A,'ø3/8"',.95,d,t,e,v,'ø3/8"',.95,d,i,e,p];D.push(s)}var o=new Handsontable(m,{data:D,rowHeaders:!1,colHeaders:!0,height:"auto",autoWrapRow:!0,autoWrapCol:!0,colWidths:[90,90,90,170,90,90,90,90,90,90,90,90,90,90,90,90,90],nestedHeaders:[["Nivel","ρv mín","ρv máx","ρv","Verificación","Acero","D","Área","s","smáx","Distribución de Refuerzo","Acero","D","Área","s","smáx","Distribución de Refuerzo"],["","","","","Cuantía Vertical Máxima","","(cm)","(cm²)","(cm)","(cm)","Inicial en el Núcleo","","(cm)","(cm²)","(cm)","(cm)","Inicial en el Núcleo"]],columns:[{type:"text",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"text",readOnly:!0},{type:"dropdown",source:["6 mm","8 mm",'ø3/8"',"12 mm",'ø1/2"','ø5/8"','ø3/4"','ø7/8"','ø1"','ø1 3/8"']},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"text"},{type:"dropdown",source:["6 mm","8 mm",'ø3/8"',"12 mm",'ø1/2"','ø5/8"','ø3/4"','ø7/8"','ø1"','ø1 3/8"']},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"text",readOnly:!0}],afterChange:function(u,f){if(f==="edit"){var n=this;u.forEach(function(a){var r=a[0],l=a[1],w=a[3];if(l===5){var E=w,x=0,T=0;E=="6 mm"?(x=.6,T=.28):E=="8 mm"?(x=.8,T=.5):E=='ø3/8"'?(x=.95,T=.71):E=="12 mm"?(x=1.2,T=1.13):E=='ø1/2"'?(x=1.27,T=1.29):E=='ø5/8"'?(x=1.59,T=2):E=='ø3/4"'?(x=1.9,T=2.84):E=='ø7/8"'?(x=2.22,T=3.87):E=='ø1"'?(x=2.54,T=5.1):(x=3.49,T=1.01),n.setDataAtCell(r,6,x),n.setDataAtCell(r,7,T)}if(l==7&&n.setDataAtCell(r,8,Math.ceil($[r][5]*w/(y.eyDF*100*$[r][8])/2.5)*2.5),l==8&&n.setDataAtCell(r,10,w<=n.getDataAtCell(r,9)?"Sí cumple":"No cumple, verificar"),l===11){var E=w,x=0,T=0;E=="6 mm"?(x=.6,T=.28):E=="8 mm"?(x=.8,T=.5):E=='ø3/8"'?(x=.95,T=.71):E=="12 mm"?(x=1.2,T=1.13):E=='ø1/2"'?(x=1.27,T=1.29):E=='ø5/8"'?(x=1.59,T=2):E=='ø3/4"'?(x=1.9,T=2.84):E=='ø7/8"'?(x=2.22,T=3.87):E=='ø1"'?(x=2.54,T=5.1):(x=3.49,T=1.01),n.setDataAtCell(r,12,x),n.setDataAtCell(r,13,T)}l==13&&n.setDataAtCell(r,14,Math.ceil($[r][5]*w/(y.eyDF*100*n.getDataAtCell(r,3))/2.5)*2.5),l==14&&n.setDataAtCell(r,16,w<=n.getDataAtCell(r,15)?"Sí cumple":"No cumple, verificar")})}},licenseKey:"non-commercial-and-evaluation"});document.getElementById("saveDataBtnDC3Y").addEventListener("click",c);function c(){z=o.getData();var u=document.getElementById("cutDesingT4Y");Ae(u)}}function Ae(F){if(F){var y=F;y.innerHTML="";var m=[];for(let g=0;g<W.length;g++){var D=[`Piso ${g+1}`,$[g][5],z[g][5],"@",z[g][8],$[g][5],z[g][11],"@",z[g][14]];m.push(D)}new Handsontable(y,{data:m,rowHeaders:!1,colHeaders:!0,height:"auto",autoWrapRow:!0,autoWrapCol:!0,colWidths:[90,90,90,50,90,90,90,50,90],colHeaders:["Nivel","Capas","Acero","","s (cm)","Capas","Acero","","s (cm)"],columns:[{type:"text",readOnly:!0},{type:"numeric",readOnly:!0},{type:"text",readOnly:!0},{type:"text",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"text",readOnly:!0},{type:"text",readOnly:!0},{type:"numeric",readOnly:!0}],licenseKey:"non-commercial-and-evaluation"})}}var B=[],N=[],ae={};function we(F,y,m,D,g,C){if(!F)return;if(O=F,O.innerHTML="",!m||m.length===0){console.warn("diT1X: tableData1DC está vacío o no definido.");return}if(!D||D.length===0){console.warn("diT1X: dataTable2xDF está vacío o no definido.");return}if(!g||g.length===0){console.warn("diT1X: tableData3DC está vacío o no definido.");return}if(!C){console.warn("diT1X: formData no está definido.");return}var O=F,A=[];for(let b=0;b<1;b++){if(!m[b]||m[b].length<=4){console.warn(`diT1X: tableData1DC[${b}] no tiene índice 4.`);continue}if(!D[b]||D[b].length<=9){console.warn(`diT1X: dataTable2xDF[${b}] no tiene índice 9.`);continue}if(!g[b]||g[b].length<=3){console.warn(`diT1X: tableData3DC[${b}] no tiene índice 3.`);continue}var d=C.lxDF,t=m[b][4],i=D[b][9],e=0,v=y[b][1],p=g[b][3],s=.85*C.fcDF*C.ezcxDF*100*C.β1DF+2*p*C.ezcxDF*100*C.fyDF,o=s!==0?(v*1e3+i*C.fyDF+p*C.ezcxDF*100*C.lxDF*100*C.fyDF-e*C.fyDF)/s:0,c=0,u=0,f=c==0?0:C.ƐcDF*C.lxDF*100/(C.ƐcDF+c),n=Math.max(o,u,f),a=.2374764,r=d/(600*Math.max(a/t,.005))*100,l=n>=r?"Requiere ser confinado":"No requiere ser confinado",w=[d,t,i,e,v,p,o,u,c,f,n,a,r,l];A.push(w)}if(A.length===0){console.warn("diT1X: No se generaron datos.");return}var E=new Handsontable(O,{data:A,rowHeaders:!0,colHeaders:!0,height:"auto",autoWrapRow:!0,autoWrapCol:!0,colWidths:100,nestedHeaders:[["lm","hm","As","A's","Pu","pv","c1","c2","Ɛs","c3","c","δu","C limite","Confinamiento"],["(m)","(m)","(cm²)","(cm²)","(Ton)","","(cm)","(cm)","","(cm)","(cm)","(m)","(cm)","elemento de borde"]],columns:[{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric"},{type:"numeric"},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric"},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0}],afterChange:function(b,I){if(I==="edit"){var M=this;b.forEach(function(R){var h=R[0],L=R[1],H=R[3];L===7&&M.setDataAtCell(h,10,Math.max(M.getDataAtCell(h,6),M.getDataAtCell(h,7),M.getDataAtCell(h,9))),L===8&&M.setDataAtCell(h,9,H==0?0:C.ƐcDF*C.lxDF*100/(C.ezcxDF+H)),L===9&&M.setDataAtCell(h,10,Math.max(M.getDataAtCell(h,6),M.getDataAtCell(h,7),M.newValue)),L===10&&M.setDataAtCell(h,13,H>=M.getDataAtCell(h,12)?"Requiere ser confinado":"No requiere ser confinado"),L===11&&M.setDataAtCell(h,12,M.getDataAtCell(h,0)/(600*Math.max(M.getDataAtCell(h,11)/M.getDataAtCell(h,1),.005))*100),L===12&&M.setDataAtCell(h,13,M.getDataAtCell(h,10)>=H?"Requiere ser confinado":"No requiere ser confinado")})}},afterPaste:function(b,I){console.log(b),console.log(I),b.forEach(function(M,R){var h=I[0].startRow,L=I[0].startCol,H=I[0].endCol;let k=0;for(let S=L;S<=H;S++)E.setDataAtCell(h+R,S,M[k]),k++})},licenseKey:"non-commercial-and-evaluation"}),x=document.getElementById("saveDataBtnDI1X");x?x.addEventListener("click",T):console.warn("diT1X: No se encontró el botón saveDataBtnDI1X");function T(){B=E.getData();var b=document.getElementById("diT2XContainer"),I=document.getElementById("diT2X");b&&I&&(Oe(I,y,m,D,C),b.style.display=B&&B.length>0?"block":"none");var M=document.getElementById("diT3XContainer"),R=document.getElementById("diT3X");M&&R&&(Fe(R,C),M.style.display=B&&B.length>0?"block":"none")}}function Oe(F,y,m,D,g){if(!B||B.length===0){console.warn("diT2X: tableDI1X está vacío. Asegúrese de haber guardado los datos en diT1X.");return}var C=F,O=[];for(let l=0;l<1;l++){if(!B[l]||B[l].length<=10){console.warn(`diT2X: tableDI1X[${l}] no tiene índice 10.`);continue}if(!m[l]||m[l].length<=11){console.warn(`diT2X: tableData1DC[${l}] no tiene índice 11.`);continue}if(!y[l]||y[l].length<=3){console.warn(`diT2X: solicitaciones[${l}] no tiene índice 3.`);continue}if(!D[l]||D[l].length<=2){console.warn(`diT2X: dataTable2xDF[${l}] no tiene índice 2.`);continue}var A=g.zcxDF,d=m[l][11],t=y[l][3],i=B[l][0],e=.25*(t/d),v=Math.max(i,e),p=Math.max(B[l][10]/100-.1*B[l][0],0),s=B[l][10]/2/100,o=Math.max(p,s),c=A>o?"Sí cumple":"No cumple, verificar",u=10*D[l][2],f=Math.min(g.zcxDF,g.ezcxDF)*100,n=25,a=Math.floor(Math.min(u,n)/2.5)*2.5,r=[A,d,t,i,e,v,p,s,o,c,u,f,n,a];O.push(r)}O.length!==0&&new Handsontable(C,{data:O,rowHeaders:!0,colHeaders:!0,height:"auto",autoWrapRow:!0,autoWrapCol:!0,colWidths:100,nestedHeaders:[["zc","Vu máx","Mu máx","Lo máx","Lo máx","Lo máx","zcmáx 1","zcmáx 2","zcmáx","Artículo 21.9.7.6.a. Verificación","s1","s2","s3","s"],["(m)","(Ton)","(Ton.m)","(m)","(m)","(m)","(m)","(m)","(m)","Espesor de la Zona de Confinamiento","(cm)","(cm)","(cm)","(cm)"]],columns:[{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"text",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0}],licenseKey:"non-commercial-and-evaluation"})}function Fe(F,y){if(!B||B.length===0){console.warn("diT3X: tableDI1X está vacío.");return}var m=F,D=[];for(let t=0;t<1;t++){if(!B[t]||B[t].length<=1){console.warn(`diT3X: tableDI1X[${t}] no tiene índice 1.`);continue}var g=y.lyDF,C=B[t][1],O=.1*C,A=g<=O?"Diseñar con ala completa":"Diseñar solo con ancho efectivo del ala",d=[g,C,O,A];D.push(d)}D.length!==0&&new Handsontable(m,{data:D,rowHeaders:!0,colHeaders:!0,height:"auto",autoWrapRow:!0,autoWrapCol:!0,colWidths:100,nestedHeaders:[["Ly","hm","Ly calculado","Verificación"],["(m)","(m)","(m)","ancho efectivo del Ala"]],columns:[{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"text",readOnly:!0}],licenseKey:"non-commercial-and-evaluation"})}function Ee(F,y,m,D,g,C){if(!F)return;if(O=F,O.innerHTML="",!m||m.length===0){console.warn("diT1Y: tableData1DC está vacío o no definido.");return}if(!D||D.length===0){console.warn("diT1Y: dataTable2yDF está vacío o no definido.");return}if(!g||g.length===0){console.warn("diT1Y: tableData3DC está vacío o no definido.");return}if(!C){console.warn("diT1Y: formData no está definido.");return}var O=F,A=[];for(let b=0;b<1;b++){if(!m[b]||m[b].length<=4){console.warn(`diT1Y: tableData1DC[${b}] no tiene índice 4.`);continue}if(!D[b]||D[b].length<=9){console.warn(`diT1Y: dataTable2yDF[${b}] no tiene índice 9.`);continue}if(!g[b]||g[b].length<=3){console.warn(`diT1Y: tableData3DC[${b}] no tiene índice 3.`);continue}var d=C.lxDF,t=m[b][4],i=D[b][9],e=0,v=y[b][1],p=g[b][3],s=.85*C.fcDF*C.ezcyDF*100*C.β1DF+2*p*C.ezcyDF*100*C.fyDF,o=s!==0?(v*1e3+i*C.fyDF+p*C.ezcyDF*100*C.lyDF*100*C.fyDF-e*C.fyDF)/s:0,c=0,u=0,f=c==0?0:C.ƐcDF*C.lxDF*100/(C.ƐcDF+c),n=Math.max(o,u,f),a=.2374764,r=d/(600*Math.max(a/t,.005))*100,l=n>=r?"Requiere ser confinado":"No requiere ser confinado",w=[d,t,i,e,v,p,o,u,c,f,n,a,r,l];A.push(w)}if(A.length===0){console.warn("diT1Y: No se generaron datos.");return}var E=new Handsontable(O,{data:A,rowHeaders:!0,colHeaders:!0,height:"auto",autoWrapRow:!0,autoWrapCol:!0,colWidths:100,nestedHeaders:[["lm","hm","As","A's","Pu","pv","c1","c2","Ɛs","c3","c","δu","C limite","Confinamiento"],["(m)","(m)","(cm²)","(cm²)","(Ton)","","(cm)","(cm)","","(cm)","(cm)","(m)","(cm)","elemento de borde"]],columns:[{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric"},{type:"numeric"},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric"},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0}],afterChange:function(b,I){if(I==="edit"){var M=this;b.forEach(function(R){var h=R[0],L=R[1],H=R[3];L===7&&M.setDataAtCell(h,10,Math.max(M.getDataAtCell(h,6),M.getDataAtCell(h,7),M.getDataAtCell(h,9))),L===8&&M.setDataAtCell(h,9,H==0?0:C.ƐcDF*C.lxDF*100/(C.ezcxDF+H)),L===9&&M.setDataAtCell(h,10,Math.max(M.getDataAtCell(h,6),M.getDataAtCell(h,7),M.newValue)),L===10&&M.setDataAtCell(h,13,H>=M.getDataAtCell(h,12)?"Requiere ser confinado":"No requiere ser confinado"),L===11&&M.setDataAtCell(h,12,M.getDataAtCell(h,0)/(600*Math.max(M.getDataAtCell(h,11)/M.getDataAtCell(h,1),.005))*100),L===12&&M.setDataAtCell(h,13,M.getDataAtCell(h,10)>=H?"Requiere ser confinado":"No requiere ser confinado")})}},afterPaste:function(b,I){console.log(b),console.log(I),b.forEach(function(M,R){var h=I[0].startRow,L=I[0].startCol,H=I[0].endCol;let k=0;for(let S=L;S<=H;S++)E.setDataAtCell(h+R,S,M[k]),k++})},licenseKey:"non-commercial-and-evaluation"}),x=document.getElementById("saveDataBtnDI1Y");x?x.addEventListener("click",T):console.warn("diT1Y: No se encontró el botón saveDataBtnDI1Y");function T(){N=E.getData();var b=document.getElementById("diT2YContainer"),I=document.getElementById("diT2Y");b&&I&&(Te(I,y,m,D,C),b.style.display=N&&N.length>0?"block":"none");var M=document.getElementById("diT3YContainer"),R=document.getElementById("diT3Y");M&&R&&(be(R,C),M.style.display=N&&N.length>0?"block":"none")}}function Te(F,y,m,D,g){if(!N||N.length===0){console.warn("diT2Y: tableDI1Y está vacío.");return}var C=F,O=[];for(let l=0;l<1;l++){if(!N[l]||N[l].length<=10){console.warn(`diT2Y: tableDI1Y[${l}] no tiene índice 10.`);continue}if(!m[l]||m[l].length<=11){console.warn(`diT2Y: tableData1DC[${l}] no tiene índice 11.`);continue}if(!y[l]||y[l].length<=3){console.warn(`diT2Y: solicitaciones[${l}] no tiene índice 3.`);continue}if(!D[l]||D[l].length<=2){console.warn(`diT2Y: dataTable2yDF[${l}] no tiene índice 2.`);continue}var A=g.zcyDF,d=m[l][11],t=y[l][3],i=N[l][0],e=.25*(t/d),v=Math.max(i,e),p=Math.max(N[l][10]/100-.1*N[l][0],0),s=N[l][10]/2/100,o=Math.max(p,s),c=A>o?"Sí cumple":"No cumple, verificar",u=10*D[l][2],f=Math.min(g.zcyDF,g.ezcyDF)*100,n=25,a=Math.floor(Math.min(u,n)/2.5)*2.5,r=[A,d,t,i,e,v,p,s,o,c,u,f,n,a];O.push(r)}O.length!==0&&new Handsontable(C,{data:O,rowHeaders:!0,colHeaders:!0,height:"auto",autoWrapRow:!0,autoWrapCol:!0,colWidths:100,nestedHeaders:[["zc","Vu máx","Mu máx","Lo máx","Lo máx","Lo máx","zcmáx 1","zcmáx 2","zcmáx","Artículo 21.9.7.6.a. Verificación","s1","s2","s3","s"],["(m)","(Ton)","(Ton.m)","(m)","(m)","(m)","(m)","(m)","(m)","Espesor de la Zona de Confinamiento","(cm)","(cm)","(cm)","(cm)"]],columns:[{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"text",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0}],licenseKey:"non-commercial-and-evaluation"})}function be(F,y){if(!N||N.length===0){console.warn("diT3Y: tableDI1Y está vacío.");return}var m=F,D=[];for(let t=0;t<1;t++){if(!N[t]||N[t].length<=1){console.warn(`diT3Y: tableDI1Y[${t}] no tiene índice 1.`);continue}var g=y.lxDF,C=N[t][1],O=.1*C,A=g<=O?"Diseñar con ala completa":"Diseñar solo con ancho efectivo del ala",d=[g,C,O,A];D.push(d)}D.length!==0&&new Handsontable(m,{data:D,rowHeaders:!0,colHeaders:!0,height:"auto",autoWrapRow:!0,autoWrapCol:!0,colWidths:100,nestedHeaders:[["Lx","hm","Ly calculado","Verificación"],["(m)","(m)","(m)","ancho efectivo del Ala"]],columns:[{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"text",readOnly:!0}],licenseKey:"non-commercial-and-evaluation"})}function Me(F){if(!F||F.length===0){console.warn("diagramI: No hay datos de solicitaciones.");var m=document.getElementById("diagramsCard");m&&(m.style.display="none");return}var y=document.getElementById("diagramsContainer");if(!y){console.warn("diagramI: No se encontró el contenedor 'diagramsContainer'.");return}var m=document.getElementById("diagramsCard");m&&(m.style.display="block"),y.innerHTML="";var D=0,g=F.length,C=Math.ceil(g/34),O=C>1;for(let b=0;b<C;b++){D++;var A=b*34,d=F.slice(A,A+17),t=F.slice(A+17,A+34);if(d.length===0||t.length===0){console.warn("diagramI: No hay suficientes datos para crear el gráfico.");break}var i=document.createElement("div"),e=document.createElement("div"),v=document.createElement("div"),p=document.createElement("div"),s=document.createElement("div"),o=document.createElement("div"),c=document.createElement("div"),u=document.createElement("div"),f=document.createElement("button");f.textContent="Generar gráfico Izquierdo";var n=document.createElement("div"),a=document.createElement("div"),r=document.createElement("div"),l=document.createElement("div"),w=document.createElement("button");if(w.textContent="Generar gráfico Derecho",s.id=`hotTableContainerISC${D}`,s.classList.add("mr-1"),n.id=`hotTableContainerDSC${D}`,c.id=`hotTableContainerIDI${D}`,f.id=`buttonIDI${D}`,r.id=`hotTableContainerDDI${D}`,w.id=`buttonDDI${D}`,i.classList.add("d-flex","flex-column"),e.classList.add("d-flex"),v.classList.add("row"),p.classList.add("d-flex","flex-wrap"),o.classList="col-md-5",a.classList="col-md-5",i.id=`diagramsContainer${D}`,O){var E=document.createElement("h5");E.className="text-gray-950 dark:text-white text-center mt-3 mb-2",E.textContent=`Grupo ${D} - Pisos ${(D-1)*2+1} y ${(D-1)*2+2}`,i.appendChild(E)}y.appendChild(i),i.appendChild(e),i.appendChild(v),i.appendChild(p),e.appendChild(s),o.appendChild(c),o.appendChild(u),o.appendChild(f),v.appendChild(o),e.appendChild(n),a.appendChild(r),a.appendChild(l),a.appendChild(w),v.appendChild(a),Q(s,d),Q(n,t),U(c,f,p,d,t,D,"Izq",u),U(r,w,p,d,t,D,"Der",l)}if(C===1&&g>0){var x=document.createElement("div");x.className="text-center text-gray-950 dark:text-white mb-2",x.innerHTML="<strong>Diagrama de Interacción - Datos y Gráfica</strong>",y.insertBefore(x,y.firstChild)}if(C>1){var T=document.createElement("div");T.className="text-center text-gray-950 dark:text-white mb-2",T.innerHTML="<strong>Diagramas de Interacción - Datos y Gráficas</strong>",y.insertBefore(T,y.firstChild)}}function Q(F,y){if(!(!y||y.length===0)){var m=["Combinación 01","Combinación 02 Max","Combinación 02 Min","Combinación 03 Max","Combinación 03 Min","Combinación 04 Max","Combinación 04 Min","Combinación 05 Max","Combinación 05 Min","Combinación 06 Max","Combinación 06 Min","Combinación 07 Max","Combinación 07 Min","Combinación 08 Max","Combinación 08 Min","Combinación 09 Max","Combinación 09 Min"],D=y.map((g,C)=>[m[C],...g]);Handsontable(F,{data:D,rowHeaders:!0,colHeaders:!0,height:"auto",autoWrapRow:!0,autoWrapCol:!0,colWidths:100,nestedHeaders:[["Combinaciones","Pu","Mux","Muy"],["Carga","(Ton)","(Ton.m)","(Ton.m)"]],columns:[{type:"text",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0}],licenseKey:"non-commercial-and-evaluation"})}}function U(F,y,m,D,g,C,O,A){var d=O=="Izq"?"Dirección X-X":"Dirección Y-Y",t=[[1,0,0,0,0,0,0],[2,0,0,0,0,0,0],[3,0,0,0,0,0,0],[4,0,0,0,0,0,0],[5,0,0,0,0,0,0],[6,0,0,0,0,0,0],[7,0,0,0,0,0,0],[8,0,0,0,0,0,0],[9,0,0,0,0,0,0],[10,0,0,0,0,0,0],[11,0,0,0,0,0,0]],i=Handsontable(F,{data:t,rowHeaders:!0,colHeaders:!0,height:"auto",autoWrapRow:!0,autoWrapCol:!0,colWidths:100,nestedHeaders:[["Incluido "+d],["Puntos","P","M2","M3","P","M2","M3"],["","(Ton)","(Ton.m)","(Ton.m)","(Ton)","(Ton.m)","(Ton.m)"]],columns:[{type:"numeric",readOnly:!0},{type:"numeric"},{type:"numeric"},{type:"numeric"},{type:"numeric"},{type:"numeric"},{type:"numeric"}],afterPaste:function(s,o){s.forEach(function(c,u){var f=o[0].startRow,n=o[0].startCol,a=o[0].endCol;let r=0;for(let l=n;l<=a;l++)i.setDataAtCell(f+u,l,c[r]),r++})},licenseKey:"non-commercial-and-evaluation"}),e=[[1,0,0,0,0,0,0],[2,0,0,0,0,0,0],[3,0,0,0,0,0,0],[4,0,0,0,0,0,0],[5,0,0,0,0,0,0],[6,0,0,0,0,0,0],[7,0,0,0,0,0,0],[8,0,0,0,0,0,0],[9,0,0,0,0,0,0],[10,0,0,0,0,0,0],[11,0,0,0,0,0,0]],v=Handsontable(A,{data:e,rowHeaders:!0,colHeaders:!0,height:"auto",autoWrapRow:!0,autoWrapCol:!0,colWidths:100,nestedHeaders:[["Excluido "+d],["Puntos","P","M2","M3","P","M2","M3"],["","(Ton)","(Ton.m)","(Ton.m)","(Ton)","(Ton.m)","(Ton.m)"]],columns:[{type:"numeric",readOnly:!0},{type:"numeric"},{type:"numeric"},{type:"numeric"},{type:"numeric"},{type:"numeric"},{type:"numeric"}],afterPaste:function(s,o){s.forEach(function(c,u){var f=o[0].startRow,n=o[0].startCol,a=o[0].endCol;let r=0;for(let l=n;l<=a;l++)v.setDataAtCell(f+u,l,c[r]),r++})},licenseKey:"non-commercial-and-evaluation"});y.addEventListener("click",p);function p(){for(var s=!0,o=i.getData(),c=v.getData(),u=0;u<o.length;u++){for(var f=0;f<o[u].length;f++)if(o[u][f]===null||o[u][f]===""){s=!1;break}if(!s)break}s?he(m,D,g,o,C,O,c):alert("Hay celdas vacías")}}function he(F,y,m,D,g,C,O){var A=document.createElement("div"),d=[],t=[];C=="Izq"?(d=y.map(c=>[c[0],c[1]]),t=m.map(c=>[c[0],c[1]])):(d=y.map(c=>[c[0],c[2]]),t=m.map(c=>[c[0],c[2]]));var i=D.map(c=>[c[4],c[6]]),e=D.map(c=>[c[1],c[3]]),v=O.map(c=>[c[4],c[6]]),p=O.map(c=>[c[1],c[3]]),s=`graph${C}${g}`;if(document.getElementById(s))Ie(s,d,t,i,e,v,p);else{var o=document.createElement("canvas");o.id=s,o.width=400,o.height=400,A.appendChild(o),F.appendChild(A),Le(s,o,d,t,i,e,v,p,g,C)}}function Ie(F,y,m,D,g,C,O){var A=ae[F];A&&(A.data.datasets[0].data=y.map(d=>({x:d[1],y:d[0]})),A.data.datasets[1].data=m.map(d=>({x:d[1],y:d[0]})),A.data.datasets[2].data=D.map(d=>({x:d[1],y:d[0]})),A.data.datasets[3].data=g.map(d=>({x:d[1],y:d[0]})),A.data.datasets[4].data=C.map(d=>({x:d[1],y:d[0]})),A.data.datasets[5].data=O.map(d=>({x:d[1],y:d[0]})),A.update())}function Le(F,y,m,D,g,C,O,A,d,t){var i=m.map(f=>({x:f[1],y:f[0]})),e=D.map(f=>({x:f[1],y:f[0]})),v=g.map(f=>({x:f[1],y:f[0]})),p=C.map(f=>({x:f[1],y:f[0]})),s=O.map(f=>({x:f[1],y:f[0]})),o=A.map(f=>({x:f[1],y:f[0]})),c={type:"scatter",data:{datasets:[{label:`SC Piso ${d*2-1} (Mux, Pu)`,data:i,borderColor:"blue",backgroundColor:"blue",borderWidth:1},{label:`SC Piso ${d*2} (Mux, Pu)`,data:e,borderColor:"green",backgroundColor:"green",borderWidth:1},{label:"DI Incluido X-X",data:v,borderColor:t=="Izq"?"red":"blue",backgroundColor:t=="Izq"?"red":"blue",borderWidth:0,fill:!1,type:"line"},{label:"DI Incluido Y-Y",data:p,borderColor:t=="Izq"?"red":"blue",backgroundColor:t=="Izq"?"red":"blue",borderWidth:0,fill:!1,type:"line"},{label:"DI Excluido X-X",data:s,borderColor:"green",backgroundColor:"green",borderWidth:0,fill:!1,type:"line"},{label:"DI Excluido Y-Y",data:o,borderColor:"yellow",backgroundColor:"yellow",borderWidth:0,fill:!1,type:"line"}]},options:{responsive:!0,plugins:{title:{display:!0,text:"DIAGRAMA DE INTERACCIÓN"}},scales:{x:{type:"linear",min:-6e3,max:6e3,position:"bottom",title:{display:!0,text:"Eje X"}},y:{type:"linear",min:-1500,max:3500,position:"left",title:{display:!0,text:"Eje Y"}}}}},u=new Chart(y,c);ae[F]=u}function Re(F,y,m){if(F){var D=F;D.innerHTML="";var g=[];for(let p=0;p<y.length;p++){var C=m.agVA,O=m.lgxVA,A=3,d=y[p][1],t=O/A*(2*Math.sqrt(m.fcDF*10)+d/C),i=1.2*t,e=[`Piso ${p+1}`,C,O,A,d,t,i,"","",""];g.push(e)}var v=new Handsontable(D,{data:g,rowHeaders:!0,colHeaders:!0,height:"auto",autoWrapRow:!0,autoWrapCol:!0,colWidths:100,nestedHeaders:[["Nivel","Ag","Lgx","Ycg","Pu","Mcr","1.2 x Mucr","Mnx","Mn/Mcr","Verificación"],["","(m²)","(m4)","(m)","(Ton)","(Ton.m)","(Ton.m)","(Ton.m)","","Agrietamiento"]],columns:[{type:"text",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric"},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric"},{type:"text",readOnly:!0}],afterChange:function(p,s){if(s==="edit"){var o=this;p.forEach(function(c){var u=c[0],f=c[1],n=c[3];f===3&&o.setDataAtCell(u,5,o.getDataAtCell(u,2)/n*(2*Math.sqrt(m.fcDF*10)+o.getDataAtCell(u,4)/o.getDataAtCell(u,1))),f==5&&o.setDataAtCell(u,6,1.2*n),f==6&&o.setDataAtCell(u,9,o.getDataAtCell(u,7)>=n?"Sí cumple":"No cumple, verificar"),f===7&&(o.setDataAtCell(u,8,n/o.getDataAtCell(u,5)),o.setDataAtCell(u,9,n>=o.getDataAtCell(u,6)?"Sí cumple":"No cumple, verificar"))})}},afterPaste:function(p,s){p.forEach(function(o,c){var u=s[0].startRow,f=s[0].startCol,n=s[0].endCol;let a=0;for(let r=f;r<=n;r++)v.setDataAtCell(u+c,r,o[a]),a++})},licenseKey:"non-commercial-and-evaluation"})}}function He(F,y,m){if(F){var D=F;D.innerHTML="";var g=[];for(let p=0;p<y.length;p++){var C=m.agVA,O=m.lgyVA,A=3,d=y[p][1],t=O/A*(2*Math.sqrt(m.fcDF*10)+d/C),i=1.2*t,e=[`Piso ${p+1}`,C,O,A,d,t,i,"","",""];g.push(e)}var v=new Handsontable(D,{data:g,rowHeaders:!0,colHeaders:!0,height:"auto",autoWrapRow:!0,autoWrapCol:!0,colWidths:100,nestedHeaders:[["Nivel","Ag","Lgy","Xcg","Pu","Mcr","1.2 x Mucr","Mny","Mn/Mcr","Verificación"],["","(m²)","(m4)","(m)","(Ton)","(Ton.m)","(Ton.m)","(Ton.m)","","Agrietamiento"]],columns:[{type:"text",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric"},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric"},{type:"text",readOnly:!0}],afterChange:function(p,s){if(s==="edit"){var o=this;p.forEach(function(c){var u=c[0],f=c[1],n=c[3];f===3&&o.setDataAtCell(u,5,o.getDataAtCell(u,2)/n*(2*Math.sqrt(m.fcDF*10)+o.getDataAtCell(u,4)/o.getDataAtCell(u,1))),f==5&&o.setDataAtCell(u,6,1.2*n),f==6&&o.setDataAtCell(u,9,o.getDataAtCell(u,7)>=n?"Sí cumple":"No cumple, verificar"),f===7&&(o.setDataAtCell(u,8,n/o.getDataAtCell(u,5)),o.setDataAtCell(u,9,n>=o.getDataAtCell(u,6)?"Sí cumple":"No cumple, verificar"))})}},afterPaste:function(p,s){p.forEach(function(o,c){var u=s[0].startRow,f=s[0].startCol,n=s[0].endCol;let a=0;for(let r=f;r<=n;r++)v.setDataAtCell(u+c,r,o[a]),a++})},licenseKey:"non-commercial-and-evaluation"})}}function Be(F,y,m,D){if(F){var g=F;if(g.innerHTML="",!D||D.length===0){alert("Debe completar el diseño por corte en X-X primero");return}var C=[];for(let s=0;s<y.length;s++){var O=D[s][2],A=m.exDF,d=m.agVA,t=1,i=.55*m.designCP*m.fcDF*10*d*(1-Math.pow(t*O/(32*A),2)),e=y[s][1],v=i>=e?"Sí cumple":"No cumple, verificar",p=[`Piso ${s+1}`,O,A,d,"Muros Arriostrados No Restringidos",t,i,e,v];C.push(p)}new Handsontable(g,{data:C,rowHeaders:!0,colHeaders:!0,height:"auto",autoWrapRow:!0,autoWrapCol:!0,colWidths:100,nestedHeaders:[["Nivel","lc","t","Ag","Casos para Definir","k","ØPn","Pu","Verificación"],["","(m)","(m)","(m²)",'Factor de Longitud Efectiva "k"',"","(Ton)","(Ton)","Compresión Pura"]],columns:[{type:"text",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"dropdown",source:["Muros Arriostrados Restringidos","Muros Arriostrados No Restringidos","Muros No Arriostrados"]},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"text"}],afterChange:function(s,o){if(o==="edit"){var c=this;s.forEach(function(u){var f=u[0],n=u[1],a=u[3];if(n===4){var r=a,l=0;r=="Muros Arriostrados Restringidos"?l=.8:r=="Muros Arriostrados No Restringidos"?l=1:r=="Muros No Arriostrados"&&(l=2),c.setDataAtCell(f,5,l)}n==5&&c.setDataAtCell(f,6,.55*m.designCP*m.fcDF*10*c.getDataAtCell(f,3)*(1-Math.pow(a*c.getDataAtCell(f,1)/(32*c.getDataAtCell(f,2)),2))),n==6&&c.setDataAtCell(f,8,a>=c.getDataAtCell(f,7)?"Sí cumple":"No cumple, verificar")})}},licenseKey:"non-commercial-and-evaluation"})}}function Ne(F,y,m,D){if(F){var g=F;if(g.innerHTML="",!D||D.length===0){alert("Debe completar el diseño por corte en Y-Y primero");return}var C=[];for(let s=0;s<y.length;s++){var O=D[s][2],A=m.eyDF,d=m.agVA,t=1,i=.55*m.designCP*m.fcDF*10*d*(1-Math.pow(t*O/(32*A),2)),e=y[s][1],v=i>=e?"Sí cumple":"No cumple, verificar",p=[`Piso ${s+1}`,O,A,d,"Muros Arriostrados No Restringidos",t,i,e,v];C.push(p)}new Handsontable(g,{data:C,rowHeaders:!0,colHeaders:!0,height:"auto",autoWrapRow:!0,autoWrapCol:!0,colWidths:100,nestedHeaders:[["Nivel","lc","t","Ag","Casos para Definir","k","ØPn","Pu","Verificación"],["","(m)","(m)","(m²)",'Factor de Longitud Efectiva "k"',"","(Ton)","(Ton)","Compresión Pura"]],columns:[{type:"text",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"dropdown",source:["Muros Arriostrados Restringidos","Muros Arriostrados No Restringidos","Muros No Arriostrados"]},,{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"text"}],afterChange:function(s,o){if(o==="edit"){var c=this;s.forEach(function(u){var f=u[0],n=u[1],a=u[3];if(n===4){var r=a,l=0;r=="Muros Arriostrados Restringidos"?l=.8:r=="Muros Arriostrados No Restringidos"?l=1:r=="Muros No Arriostrados"&&(l=2),c.setDataAtCell(f,5,l)}n==5&&c.setDataAtCell(f,6,.55*m.designCP*m.fcDF*10*c.getDataAtCell(f,3)*(1-Math.pow(a*c.getDataAtCell(f,1)/(32*c.getDataAtCell(f,2)),2))),n==6&&c.setDataAtCell(f,8,a>=c.getDataAtCell(f,7)?"Sí cumple":"No cumple, verificar")})}},licenseKey:"non-commercial-and-evaluation"})}}var j=[];function Pe(F,y,m,D,g){if(!F)return;var C=F;if(C.innerHTML="",!D||D.length===0){alert("Debe completar el diseño por flexión en X-X primero");return}var O=[];for(let v=0;v<y.length;v++){var A=1,d=.6,t=[`Piso ${v+1}`,"Peso Normal",A,"Caso III",d,"","",D[v][3],D[v][3]*m.exDF*100*100,""];O.push(t)}var i=new Handsontable(C,{data:O,rowHeaders:!0,colHeaders:!0,height:"auto",autoWrapRow:!0,autoWrapCol:!0,colWidths:100,nestedHeaders:[["Nivel","Tipo","λ","Casos según","μ","Pcm","Nu","ρv","Av","ØVn"],["","Concreto",""," Artículo 11.7.4.3.","","(Ton)","(Ton)","","(cm²)","(Ton)"]],columns:[{type:"text",readOnly:!0},{type:"dropdown",source:["Peso Normal","Liviano - Arena de Peso Normal","Liviano"]},{type:"numeric",readOnly:!0},{type:"dropdown",source:["Caso I","Caso II","Caso III","Caso IV"]},{type:"numeric",readOnly:!0},{type:"numeric"},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0}],afterChange:function(v,p){if(p==="edit"){var s=this;v.forEach(function(o){var c=o[0],u=o[1],f=o[3];if(u===1){var n=f,a=0;n=="Peso Normal"?a=1:n=="Liviano - Arena de Peso Normal"?a=.75:n=="Liviano"&&(a=.85),s.setDataAtCell(c,2,a)}if(u==2){var a=f,r=s.getDataAtCell(c,3),l=0;r=="Caso I"?l=1.4*a:r=="Caso II"?l=a:r=="Caso III"?l=.6*a:r=="Caso IV"&&(l=.7*a),s.setDataAtCell(c,4,l)}if(u==3){var r=f,l=0;r=="Caso I"?l=1.4*s.getDataAtCell(c,2):r=="Caso II"?l=s.getDataAtCell(c,2):r=="Caso III"?l=.6*s.getDataAtCell(c,2):r=="Caso IV"&&(l=.7*s.getDataAtCell(c,2)),s.setDataAtCell(c,4,l)}u==4&&s.setDataAtCell(c,9,m.designDC*f*(s.getDataAtCell(c,6)+s.getDataAtCell(c,8)*m.fyDF/1e3)),u==5&&s.setDataAtCell(c,6,.9*f),u==6&&s.setDataAtCell(c,9,m.designDC*s.getDataAtCell(c,4)*(f+s.getDataAtCell(c,8)*m.fyDF/1e3)),u==8&&s.setDataAtCell(c,9,m.designDC*s.getDataAtCell(c,4)*(s.getDataAtCell(c,6)+f*m.fyDF/1e3))})}},afterPaste:function(v,p){console.log(v),console.log(p),v.forEach(function(s,o){var c=p[0].startRow,u=p[0].startCol,f=p[0].endCol;let n=0;for(let a=u;a<=f;a++)i.setDataAtCell(c+o,a,s[n]),n++})},licenseKey:"non-commercial-and-evaluation"});document.getElementById("saveDataBtnDD1X").addEventListener("click",e);function e(){j=i.getData();var v=document.getElementById("ddT2X");Ve(v,y,j,m);var p=document.getElementById("ddT1Y");We(p,y,m,j,g)}}function Ve(F,y,m,D){var g=F,C=[];for(let s=0;s<y.length;s++){var O=D.agVA,A=.2*D.fcDF*O*10,d=55*O,t=Math.min(A,d),i=t>=m[s][9]?"Sí cumple":"No cumple, verificar",e=Math.min(m[s][9],t),v=e>=y[s][2]?"Sí cumple, no hay deslizamiento":"No cumple, verificar",p=[`Piso ${s+1}`,O,A,d,t,i,e,y[s][2],v];C.push(p)}new Handsontable(g,{data:C,rowHeaders:!0,colHeaders:!0,height:"auto",autoWrapRow:!0,autoWrapCol:!0,colWidths:100,nestedHeaders:[["Nivel","Ac","Vn máx 1","Vn máx 2","Vn máx","Verificación","ØVn","Vu máx","Juntas"],["","(m²)","(Ton)","(Ton)","(Ton)",'"Vn" Máximo',"(Ton)","(Ton)","Construcción"]],columns:[{type:"text",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"text",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"text",readOnly:!0}],licenseKey:"non-commercial-and-evaluation"})}var ee=[];function We(F,y,m,D,g){if(!F)return;var C=F;C.innerHTML="";var O=[];for(let u=0;u<y.length;u++){var A=1,d=.6,t=D[u][5],i=.9*D[u][5],e=g[u][3],v=e*m.eyDF*100*100,p=m.designDC*d*(i+v*m.fyDF/1e3),s=[`Piso ${u+1}`,"Peso Normal",A,"Caso III",d,t,i,e,v,p];O.push(s)}var o=new Handsontable(C,{data:O,rowHeaders:!0,colHeaders:!0,height:"auto",autoWrapRow:!0,autoWrapCol:!0,colWidths:100,nestedHeaders:[["Nivel","Tipo","λ","Casos","μ","Pcm","Nu","ρv","Av","ØVn"],["","Concreto","","Artículo 11.7.4.3.","","(Ton)","(Ton)","","(cm²)","(Ton)"]],columns:[{type:"text",readOnly:!0},{type:"dropdown",source:["Peso Normal","Liviano - Arena de Peso Normal","Liviano"]},{type:"numeric",readOnly:!0},{type:"dropdown",source:["Caso I","Caso II","Caso III","Caso IV"]},{type:"numeric",readOnly:!0},{type:"numeric"},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0}],afterChange:function(u,f){if(f==="edit"){var n=this;u.forEach(function(a){var r=a[0],l=a[1],w=a[3];if(l===1){var E=w,x=0;E=="Peso Normal"?x=1:E=="Liviano - Arena de Peso Normal"?x=.75:E=="Liviano"&&(x=.85),n.setDataAtCell(r,2,x)}if(l==2){var x=w,T=n.getDataAtCell(r,3),b=0;T=="Caso I"?b=1.4*x:T=="Caso II"?b=x:T=="Caso III"?b=.6*x:T=="Caso IV"&&(b=.7*x),n.setDataAtCell(r,4,b)}if(l==3){var T=w,b=0;T=="Caso I"?b=1.4*n.getDataAtCell(r,2):T=="Caso II"?b=n.getDataAtCell(r,2):T=="Caso III"?b=.6*n.getDataAtCell(r,2):T=="Caso IV"&&(b=.7*n.getDataAtCell(r,2)),n.setDataAtCell(r,4,b)}l==4&&n.setDataAtCell(r,9,m.designDC*w*(n.getDataAtCell(r,6)+n.getDataAtCell(r,8)*m.fyDF/1e3)),l==5&&n.setDataAtCell(r,6,.9*w),l==6&&n.setDataAtCell(r,9,m.designDC*n.getDataAtCell(r,4)*(w+n.getDataAtCell(r,8)*m.fyDF/1e3)),l==8&&n.setDataAtCell(r,9,m.designDC*n.getDataAtCell(r,4)*(n.getDataAtCell(r,6)+w*m.fyDF/1e3))})}},afterPaste:function(u,f){console.log(u),console.log(f),u.forEach(function(n,a){var r=f[0].startRow,l=f[0].startCol,w=f[0].endCol;let E=0;for(let x=l;x<=w;x++)o.setDataAtCell(r+a,x,n[E]),E++})},licenseKey:"non-commercial-and-evaluation"});document.getElementById("saveDataBtnDD1Y").addEventListener("click",c);function c(){ee=o.getData();var u=document.getElementById("ddT2Y");ke(u,y,ee,m)}}function ke(F,y,m,D){var g=F,C=[];for(let s=0;s<y.length;s++){var O=D.agVA,A=.2*D.fcDF*O*10,d=55*O,t=Math.min(A,d),i=t>=m[s][9]?"Sí cumple":"No cumple, verificar",e=Math.min(m[s][9],t),v=e>=y[s][4]?"Sí cumple, no hay deslizamiento":"No cumple, verificar",p=[`Piso ${s+1}`,O,A,d,t,i,e,y[s][4],v];C.push(p)}new Handsontable(g,{data:C,rowHeaders:!0,colHeaders:!0,height:"auto",autoWrapRow:!0,autoWrapCol:!0,colWidths:100,nestedHeaders:[["Nivel","Ac","Vn máx 1","Vn máx 2","Vn máx","Verificación","ØVn","Vu máx","Juntas"],["","(m²)","(Ton)","(Ton)","(Ton)",'"Vn" Máximo',"(Ton)","(Ton)","Construcción"]],columns:[{type:"text",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"text",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"text",readOnly:!0}],licenseKey:"non-commercial-and-evaluation"})}var te=[];function Se(F,y,m){if(!F)return;var D=F;D.innerHTML="";var g=[];for(let u=0;u<m.length;u++){var C=m[u][2],O=.3,A=1,d=.3,t=d+4*O,i=t*O,e=.55*y.designCP*y.fcDF*i*Math.pow(100,2)*(1-Math.pow(A*C/(32*O),2))/1e3,v=118.09,p=e>=v?"Sí cumple":"No cumple, verificar",s=[`Piso ${u+1}`,C,O,"Muros Arriostrados No Restringidos",A,d,t,i,e,v,p];g.push(s)}var o=new Handsontable(D,{data:g,rowHeaders:!0,colHeaders:!0,height:"auto",autoWrapRow:!0,autoWrapCol:!0,colWidths:100,nestedHeaders:[["Nivel","lc","emuro","Casos para Definir","k","Bviga","Befectivo","Ag","ØPn","Pu","Verificación"],["","(m)","(m)",'Factor de Longitud Efectiva "k"',"","(m)","(m)","(m²)","(Ton)","(Ton)","Espesor del Muro"]],columns:[{type:"text",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric"},{type:"dropdown",source:["Muros Arriostrados Restringidos","Muros Arriostrados No Restringidos","Muros No Arriostrados"]},{type:"numeric",readOnly:!0},{type:"numeric"},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric"},{type:"text",readOnly:!0}],afterChange:function(u,f){if(f==="edit"){var n=this;u.forEach(function(a){var r=a[0],l=a[1],w=a[3];if(l==2&&n.setDataAtCell(r,6,n.getDataAtCell(r,5)+4*w),l==3){var E=w,x=0;E=="Muros Arriostrados Restringidos"?x=.8:E=="Muros Arriostrados No Restringidos"?x=1:E=="Muros No Arriostrados"&&(x=2),n.setDataAtCell(r,4,x)}l==4&&n.setDataAtCell(r,8,.55*y.designCP*y.fcDF*n.getDataAtCell(r,7)*Math.pow(100,2)*(1-Math.pow(w*n.getDataAtCell(r,1)/(32*n.getDataAtCell(r,2)),2))/1e3),l==5&&n.setDataAtCell(r,6,w+4*n.getDataAtCell(r,2)),l==6&&n.setDataAtCell(r,7,w*n.getDataAtCell(r,2)),l==7&&n.setDataAtCell(r,8,.55*y.designCP*y.fcDF*w*Math.pow(100,2)*(1-Math.pow(n.getDataAtCell(r,4)*n.getDataAtCell(r,1)/(32*n.getDataAtCell(r,2)),2))/1e3),l==8&&n.setDataAtCell(r,10,w>=n.getDataAtCell(r,9)?"Sí cumple":"No cumple, verificar"),l==9&&n.setDataAtCell(r,10,n.getDataAtCell(r,8)>=w?"Sí cumple":"No cumple, verificar")})}},afterPaste:function(u,f){console.log(u),console.log(f),u.forEach(function(n,a){var r=f[0].startRow,l=f[0].startCol,w=f[0].endCol;let E=0;for(let x=l;x<=w;x++)o.setDataAtCell(r+a,x,n[E]),E++})},licenseKey:"non-commercial-and-evaluation"});document.getElementById("saveDataBtnEL1X").addEventListener("click",c);function c(){te=o.getData();var u=document.getElementById("elT2");Xe(u,te)}}function Xe(F,y){var m=F,D=[];for(let t=0;t<y.length;t++){var g="Sí",C=g=="Sí"?y[t][5]+.1:"-",O=g=="Sí"?"Diseña Sección como si Fuera una Columna":"No Diseñar y/o Verificar",A=[`Piso ${t+1}`,g,C,O];D.push(A)}var d=new Handsontable(m,{data:D,rowHeaders:!0,colHeaders:!0,height:"auto",autoWrapRow:!0,autoWrapCol:!0,colWidths:100,colHeaders:["Nivel","¿Se Aplica Diseño?","Bcol (m)","Aplicación del Diseño según Artículo 21.9.3.5."],columns:[{type:"text",readOnly:!0},{type:"dropdown",source:["Sí","No"]},{type:"numeric",readOnly:!0},{type:"text",readOnly:!0}],afterChange:function(t,i){if(i==="edit"){var e=this;t.forEach(function(v){var p=v[0],s=v[1],o=v[3];if(s==1){var c=o,u=0,f="";c=="Sí"?(u=y[p][5]+.1,f="Diseña Sección como si Fuera una Columna"):c=="No"&&(u="-",f="No Diseñar y/o Verificar"),e.setDataAtCell(p,2,u),e.setDataAtCell(p,3,f)}})}},afterPaste:function(t,i){console.log(t),console.log(i),t.forEach(function(e,v){var p=i[0].startRow,s=i[0].startCol,o=i[0].endCol;let c=0;for(let u=s;u<=o;u++)d.setDataAtCell(p+v,u,e[c]),c++})},licenseKey:"non-commercial-and-evaluation"})}document.addEventListener("DOMContentLoaded",function(){var F=document.getElementsByClassName("collapsible-btn"),y;for(y=0;y<F.length;y++)F[y].addEventListener("click",function(){var n=this.getAttribute("data-target"),a=document.getElementById(n);a&&a.classList.toggle("d-none")});var m=document.getElementById("solicitudCargaT1");re(m);var D=280,g=.9,C=1500*Math.sqrt(D),O=2.1*Math.pow(10,6),A=.003,d=.85,t=`<form id="generalForm" class="mt-2" met   d="post">
    <div class="col-md-12 mx-auto text-center">
      <label class="text-gray-950 dark:text-white" for="generalSelect">Cargar hoja</label>
      <div class="input-group mb-2">
        <select
          name="generalSelect"
          id="generalSelect"
          class="form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
        >
          <option value="0.9"selected>Flexión</option>
          <option value="0.85">Corte</option>
          <option value="0">Interacción</option>
          <option value="1">Agrietamiento</option>
          <option value="2">Compresión</option>
          <option value="3">Deslizamiento</option>
          <option value="4">Carga Puntual</option>
          <option value="0.75">Flexo - Comprensión Normal</option>
          <option value="0.7">Columna con Estribos</option>
          <option value="0.75">Columna con Espirales</option>
        </select>
      </div>
      <div class="text-gray-950 dark:text-white" id="generalSelectText">Ø ${g}</div>
    </div>
    <h5 class="text-center text-gray-950 dark:text-white">
      <strong>Propiedades Geométricas</strong
      ><button
        type="button"
        id="toggleButton"
        style="border: none; background: none"
      >
        <i class="fas fa-eye"></i>
      </button>
    </h5>
    <div class="contenedor mb-5" id="contenedor_dcc" style="display: none;">
      <div class="col-md-12 mx-auto text-center">
        <label for="exDF">ex</label>
        <div class="form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md">
          <input
            type="number"
            name="exDF"
            class="form-control text-center"
            id="exDF"
            placeholder="0.30"
            min="0"
            value="0.3"
            step="any"
            required
          />
          <div class="input-group-append">
            <span class="input-group-text">m</span>
          </div>
        </div>
      </div>
      <div class="col-md-12 mx-auto text-center">
        <label for="eyDF">ey</label>
        <div class="input-group mb-2">
          <input
            type="number"
            name="eyDF"
            class="form-control text-center"
            id="eyDF"
            placeholder="0.30"
            min="0"
            value="0.3"
            step="any"
            required
          />
          <div class="input-group-append">
            <span class="input-group-text">m</span>
          </div>
        </div>
      </div>
      <div class="col-md-12 mx-auto text-center">
        <label for="lxDF">Lx</label>
        <div class="input-group mb-2">
          <input
            type="number"
            name="lxDF"
            class="form-control text-center"
            id="lxDF"
            placeholder="6"
            min="0"
            step="any"
            value="6"
            required
          />
          <div class="input-group-append">
            <span class="input-group-text">m</span>
          </div>
        </div>
      </div>
      <div class="col-md-12 mx-auto text-center">
        <label for="lyDF">Ly</label>
        <div class="input-group mb-2">
          <input
            type="number"
            name="lyDF"
            class="form-control text-center"
            id="lyDF"
            placeholder="6"
            min="0"
            step="any"
            value="6"
            required
          />
          <div class="input-group-append">
            <span class="input-group-text">m</span>
          </div>
        </div>
      </div>
      <div class="col-md-12 mx-auto text-center">
        <label for="dxDF">dx</label>
        <div class="input-group mb-2">
          <input
            type="number"
            name="dxDF"
            class="form-control text-center"
            id="dxDF"
            placeholder="4.8"
            min="0"
            step="any"
            value="4.8"
            required
          />
          <div class="input-group-append">
            <span class="input-group-text">m</span>
          </div>
        </div>
      </div>
      <div class="col-md-12 mx-auto text-center">
        <label for="dyDF">dy</label>
        <div class="input-group mb-2">
          <input
            type="number"
            name="dyDF"
            class="form-control text-center"
            id="dyDF"
            placeholder="4.8"
            min="0"
            step="any"
            value="4.8"
            required
          />
          <div class="input-group-append">
            <span class="input-group-text">m</span>
          </div>
        </div>
      </div>
      <div class="col-md-12 mx-auto text-center">
        <label for="zcxDF">zCx</label>
        <div class="input-group mb-2">
          <input
            type="number"
            name="zcxDF"
            class="form-control text-center"
            id="zcxDF"
            placeholder="1.20"
            min="0"
            step="any"
            value="1.2"
            required
          />
          <div class="input-group-append">
            <span class="input-group-text">m</span>
          </div>
        </div>
      </div>
      <div class="col-md-12 mx-auto text-center">
        <label for="zCyDF">zCy</label>
        <div class="input-group mb-2">
          <input
            type="number"
            name="zCyDF"
            class="form-control text-center"
            id="zCyDF"
            placeholder="1.20"
            min="0"
            step="any"
            value="1.2"
            required
          />
          <div class="input-group-append">
            <span class="input-group-text">m</span>
          </div>
        </div>
      </div>
      <div class="col-md-12 mx-auto text-center">
        <label for="ezcxDF">ezcx</label>
        <div class="input-group mb-2">
          <input
            type="number"
            name="ezcxDF"
            class="form-control text-center"
            id="ezcxDF"
            placeholder="0.30"
            min="0"
            step="any"
            value="0.3"
            required
          />
          <div class="input-group-append">
            <span class="input-group-text">m</span>
          </div>
        </div>
      </div>
      <div class="col-md-12 mx-auto text-center">
        <label for="ezcyDF">ezcy</label>
        <div class="input-group mb-2">
          <input
            type="number"
            name="ezcyDF"
            class="form-control text-center"
            id="ezcyDF"
            placeholder="0.30"
            min="0"
            step="any"
            value="0.3"
            required
          />
          <div class="input-group-append">
            <span class="input-group-text">m</span>
          </div>
        </div>
      </div>
      <div class="col-md-12 mx-auto text-center">
        <label for="lnucxDF">Lnúcleo x</label>
        <div class="input-group mb-2">
          <input
            type="number"
            name="lnucxDF"
            class="form-control text-center"
            id="lnucxDF"
            placeholder="3.60"
            min="0"
            step="any"
            value="3.6"
            required
          />
          <div class="input-group-append">
            <span class="input-group-text">m</span>
          </div>
        </div>
      </div>
      <div class="col-md-12 mx-auto text-center">
        <label for="lnucyDF">Lnúcleo y</label>
        <div class="input-group mb-2">
          <input
            type="number"
            name="lnucyDF"
            class="form-control text-center"
            id="lnucyDF"
            placeholder="3.60"
            min="0"
            step="any"
            value="3.6"
            required
          />
          <div class="input-group-append">
            <span class="input-group-text">m</span>
          </div>
        </div>
      </div>
      <div class="col-md-12 mx-auto text-center d-none">
        <label for="acwxDC">Acwx</label>
        <div class="input-group mb-2">
          <input
            type="number"
            name="acwxDC"
            class="form-control text-center"
            id="acwxDC"
            placeholder="1.44"
            min="0"
            step="any"
            value="1.44"
            required
          />
          <div class="input-group-append">
            <span class="input-group-text">m²</span>
          </div>
        </div>
      </div>
      <div class="col-md-12 mx-auto text-center d-none">
        <label for="acwyDC">Acwy</label>
        <div class="input-group mb-2">
          <input
            type="number"
            name="acwyDC"
            class="form-control text-center"
            id="acwyDC"
            placeholder="1.44"
            min="0"
            step="any"
            value="1.44"
            required
          />
          <div class="input-group-append">
            <span class="input-group-text">m²</span>
          </div>
        </div>
      </div>
    </div>
    <h5 class="text-center text-gray-800 dark:text-gray-200">
      <strong>Propiedades Mecánicas</strong
      ><button
        type="button"
        id="calccargars"
        style="border: none; background: none"
      >
        <i class="fas fa-eye"></i>
      </button>
    </h5>
    <div class="contenedor_cc" id="contenedor_cc" style="display: none;">
      <div class="col-md-12 mx-auto text-center">
        <label for="fcDF">f'c</label>
        <div class="input-group mb-2">
          <input
            type="number"
            name="fcDF"
            class="form-control text-center"
            id="fcDF"
            placeholder="280"
            min="0"
            step="any"
            value="280"
          />
          <div class="input-group-append">
            <span class="input-group-text">kg/cm²</span>
          </div>
        </div>
      </div>
      <div class="col-md-12 mx-auto text-center">
        <label for="fyDF">fy</label>
        <div class="input-group mb-2">
          <input
            type="number"
            name="fyDF"
            class="form-control text-center"
            id="fyDF"
            placeholder="4200"
            min="0"
            step="any"
            value="4200"
          />
          <div class="input-group-append">
            <span class="input-group-text">kg/cm²</span>
          </div>
        </div>
      </div>
  
      <div class="col-md-12 mx-auto text-center d-none">
        <div class="input-group mb-2">
          <input
            type="number"
            name="designDF"
            class="form-control text-center"
            id="designDF"
            min="0"
            step="any"
            value="0.9"
          />
        </div>
      </div>
      <div class="col-md-12 mx-auto text-center d-none">
        <label for="designDC"></label>
        <div class="input-group mb-2">
          <input
            type="number"
            name="designDC"
            class="form-control text-center"
            id="designDC"
            min="0"
            step="any"
            value="0.85"
          />
        </div>
      </div>
      <div class="col-md-12 mx-auto text-center d-none">
        <div class="input-group mb-2">
          <input
            type="number"
            name="designDFCN"
            class="form-control text-center"
            id="designDFCN"
            min="0"
            step="any"
            value="0.75"
          />
        </div>
      </div>
      <div class="col-md-12 mx-auto text-center d-none">
        <div class="input-group mb-2">
          <input
            type="number"
            name="designDCEst"
            class="form-control text-center"
            id="designDCEst"
            min="0"
            step="any"
            value="0.7"
          />
        </div>
      </div>
      <div class="col-md-12 mx-auto text-center d-none">
        <div class="input-group mb-2">
          <input
            type="number"
            name="designDCEsp"
            class="form-control text-center"
            id="designDCEsp"
            min="0"
            step="any"
            value="0.75"
          />
        </div>
      </div>
      <div class="col-md-12 mx-auto text-center d-none">
        <div class="input-group mb-2">
          <input
            type="number"
            name="designCP"
            class="form-control text-center"
            id="designCP"
            min="0"
            step="any"
            value="0.7"
          />
        </div>
      </div>
      <div class="col-md-12 mx-auto text-center d-none">
        <div class="input-group mb-2">
          <input
            type="number"
            name="agVA"
            class="form-control text-center"
            id="agVA"
            min="0"
            step="any"
            value="2.4"
          />
        </div>
      </div>
      <div class="col-md-12 mx-auto text-center d-none">
        <div class="input-group mb-2">
          <input
            type="number"
            name="lgxVA"
            class="form-control text-center"
            id="lgxVA"
            min="0"
            step="any"
            value="7.2"
          />
        </div>
      </div>
      <div class="col-md-12 mx-auto text-center d-none">
        <div class="input-group mb-2">
          <input
            type="number"
            name="lgyVA"
            class="form-control text-center"
            id="lgyVA"
            min="0"
            step="any"
            value="7.2"
          />
        </div>
      </div>
      <div class="col-md-12 mx-auto text-center">
        <label for="ecDF">Ec</label>
        <div class="input-group mb-2">
          <input
            type="number"
            name="ecDF"
            class="form-control text-center"
            id="ecDF"
            placeholder="${C}"
            min="0"
            step="any"
            value="${C}"
          />
          <div class="input-group-append">
            <span class="input-group-text">kg/cm²</span>
          </div>
        </div>
      </div>
      <div class="col-md-12 mx-auto text-center">
        <label for="esDF">Es</label>
        <div class="input-group mb-2">
          <input
            type="number"
            name="esDF"
            class="form-control text-center"
            id="esDF"
            placeholder="${O}"
            min="0"
            step="any"
            value="${O}"
          />
          <div class="input-group-append">
            <span class="input-group-text">kg/cm²</span>
          </div>
        </div>
      </div>
      <div class="col-md-12 mx-auto text-center">
        <label for="ƐcDF">Ɛc</label>
        <div class="input-group mb-2">
          <input
            type="number"
            name="ƐcDF"
            class="form-control text-center"
            id="ƐcDF"
            placeholder="${A}"
            min="0"
            step="any"
            value="${A}"
          />
          <div class="input-group-append">
            <span class="input-group-text">-</span>
          </div>
        </div>
      </div>
      <div class="col-md-12 mx-auto text-center">
        <label for="β1DF">β1</label>
        <div class="input-group mb-2">
          <input
            type="number"
            name="β1DF"
            class="form-control text-center"
            id="β1DF"
            placeholder="${d}"
            min="0"
            step="any"
            value="${d}"
          />
          <div class="input-group-append">
            <span class="input-group-text">-</span>
          </div>
        </div>
      </div>
    </div>
    <!-- Button Submit para Empezar a Diseñar el DOCUMENTO -->
    <div class="d-flex justify-content-center">
      <button class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800" type="submit">DISEÑAR</button>
    </div>
  </form>`;function i(){const n=document.getElementById("toggleFormButton"),a=document.getElementById("formContainer"),r=document.getElementById("formColumn"),l=document.getElementById("resultadosContainer"),w=n.querySelector("i");function E(){r.classList.toggle("col-md-2"),r.classList.toggle("col-md-1"),l.classList.toggle("col-md-10"),l.classList.toggle("col-md-11"),w.classList.toggle("fa-chevron-left"),w.classList.toggle("fa-chevron-right")}function x(){a.style.display="none",w.classList.add("d-none"),r.classList.contains("col-md-2")&&E()}function T(){setTimeout(function(){a.style.display="block",w.classList.remove("d-none"),E()},100)}n.addEventListener("click",function(){a.style.display=a.style.display==="none"?"block":"none",E()}),window.addEventListener("beforeprint",x),window.addEventListener("afterprint",T)}i();var e=document.getElementById("formContainer");e.innerHTML=t;var v=document.getElementById("lxDF");v.addEventListener("input",function(n){document.getElementById("dxDF").value=(.8*parseFloat(this.value)).toFixed(2),document.getElementById("lnucxDF").value=(parseFloat(this.value)-2*parseFloat(document.getElementById("zcxDF").value)).toFixed(2)});var p=document.getElementById("lyDF");p.addEventListener("input",function(n){document.getElementById("dyDF").value=(.8*parseFloat(this.value)).toFixed(2),document.getElementById("lnucyDF").value=(parseFloat(this.value)-2*parseFloat(document.getElementById("zCyDF").value)).toFixed(2)});var s=document.getElementById("generalSelect");s.addEventListener("change",function(n){document.getElementById("generalSelectText").innerHTML=`Ø ${this.value}`,g=parseFloat(this.value),g==.85?(document.getElementById("acwyDC").classList.remove("d-none"),document.getElementById("acwxDC").classList.remove("d-none")):(document.getElementById("acwyDC").classList.add("d-none"),document.getElementById("acwxDC").classList.add("d-none"))});var o=document.getElementById("fcDF");o.addEventListener("input",function(n){document.getElementById("ecDF").value=(15e3*Math.sqrt(parseFloat(this.value))).toFixed(2),document.getElementById("β1DF").value=(parseFloat(this.value)<=280?.85:parseFloat(this.value)<=350?.8:parseFloat(this.value)<=420?.75:parseFloat(this.value)<=490?.7:.65).toFixed(2)}),se();var c=document.getElementById("generalForm");c.addEventListener("submit",function(n){n.preventDefault();var a=new FormData(this),r={};for(var l of a.entries())r[l[0]]=l[1];var w=J.map(I=>[I[0],I[2],I[5]]);if(r.generalSelect==.9){var E=document.getElementById("flexDesingT1X"),x=document.getElementById("flexDesingT1Y");oe(E,X,r),de(x,X,r),document.getElementById("content2").classList.remove("d-none"),document.getElementById("content3").classList.add("d-none"),document.getElementById("content4").classList.add("d-none"),document.getElementById("content5").classList.add("d-none"),document.getElementById("content6").classList.add("d-none"),document.getElementById("content7").classList.add("d-none"),document.getElementById("content8").classList.add("d-none")}else if(r.generalSelect==.85){var E=document.getElementById("cutDesingT1X"),x=document.getElementById("cutDesingT1Y");ve(E,X,r),Ce(x,X,r),document.getElementById("content2").classList.add("d-none"),document.getElementById("content3").classList.remove("d-none"),document.getElementById("content4").classList.add("d-none"),document.getElementById("content5").classList.add("d-none"),document.getElementById("content6").classList.add("d-none"),document.getElementById("content7").classList.add("d-none"),document.getElementById("content8").classList.add("d-none")}else if(r.generalSelect==0){var E=document.getElementById("diT1X"),x=document.getElementById("diT1Y");if(!V||V.length===0){alert("Llene datos en la tabla 1 X-X de diseño corte");return}if(!W||W.length===0){alert("Llene datos en la tabla 1 Y-Y de diseño corte");return}if(!G||G.length===0){alert("Llene datos en la tabla 2 X-X de diseño flexión");return}if(!_||_.length===0){alert("Llene datos en la tabla 2 Y-Y de diseño flexión");return}if(!q||q.length===0){alert("Llene datos en la tabla 3 X-X de diseño corte");return}if(!z||z.length===0){alert("Llene datos en la tabla 3 Y-Y de diseño corte");return}we(E,X,V,G,q,r),Ee(x,X,W,_,z,r),Me(w);var T=document.getElementById("diagramsCard");T&&(T.style.display=w&&w.length>0?"block":"none"),document.getElementById("content2").classList.add("d-none"),document.getElementById("content3").classList.add("d-none"),document.getElementById("content4").classList.remove("d-none"),document.getElementById("content5").classList.add("d-none"),document.getElementById("content6").classList.add("d-none"),document.getElementById("content7").classList.add("d-none"),document.getElementById("content8").classList.add("d-none")}else if(r.generalSelect==1){document.getElementById("content2").classList.add("d-none"),document.getElementById("content3").classList.add("d-none"),document.getElementById("content4").classList.add("d-none"),document.getElementById("content5").classList.remove("d-none"),document.getElementById("content6").classList.add("d-none"),document.getElementById("content7").classList.add("d-none"),document.getElementById("content8").classList.add("d-none");var E=document.getElementById("vaT1X"),x=document.getElementById("vaT1Y");Re(E,X,r),He(x,X,r)}else if(r.generalSelect==2){document.getElementById("content2").classList.add("d-none"),document.getElementById("content3").classList.add("d-none"),document.getElementById("content4").classList.add("d-none"),document.getElementById("content5").classList.add("d-none"),document.getElementById("content6").classList.remove("d-none"),document.getElementById("content7").classList.add("d-none"),document.getElementById("content8").classList.add("d-none");var E=document.getElementById("dcpT1X"),x=document.getElementById("dcpT1Y");Be(E,X,r,V),Ne(x,X,r,V)}else if(r.generalSelect==3){var E=document.getElementById("ddT1X"),x=document.getElementById("ddT1Y");document.getElementById("content2").classList.add("d-none"),document.getElementById("content3").classList.add("d-none"),document.getElementById("content4").classList.add("d-none"),document.getElementById("content5").classList.add("d-none"),document.getElementById("content6").classList.add("d-none"),document.getElementById("content7").classList.remove("d-none"),document.getElementById("content8").classList.add("d-none"),Pe(E,X,r,q,z)}else if(r.generalSelect==4){var b=document.getElementById("elT1");document.getElementById("content2").classList.add("d-none"),document.getElementById("content3").classList.add("d-none"),document.getElementById("content4").classList.add("d-none"),document.getElementById("content5").classList.add("d-none"),document.getElementById("content6").classList.add("d-none"),document.getElementById("content7").classList.add("d-none"),document.getElementById("content8").classList.remove("d-none"),Se(b,r,V)}});function u(n){const a=n.cloneNode(!0),r=n.querySelectorAll("input, select, textarea"),l=a.querySelectorAll("input, select, textarea");return r.forEach((w,E)=>{const x=l[E];x&&(w.tagName==="INPUT"&&(x.value=w.value,x.setAttribute("value",w.value),(w.type==="checkbox"||w.type==="radio")&&(x.checked=w.checked,w.checked?x.setAttribute("checked","checked"):x.removeAttribute("checked"))),w.tagName==="TEXTAREA"&&(x.value=w.value,x.textContent=w.value),w.tagName==="SELECT"&&(x.value=w.value,Array.from(x.options).forEach(T=>{T.value===w.value?(T.selected=!0,T.setAttribute("selected","selected")):(T.selected=!1,T.removeAttribute("selected"))})))}),a}async function f(n,a){const r=document.getElementById(n);if(!r){alert(`No existe el bloque con id "${n}"`);return}if(r.innerHTML.trim()===""){alert("El bloque está vacío.");return}const l=r.classList.contains("hidden")||r.classList.contains("d-none")||getComputedStyle(r).display==="none";l&&(r.classList.remove("hidden","d-none"),r.style.display="block"),await new Promise(x=>setTimeout(x,400));const w=u(r);w.querySelectorAll("button").forEach(x=>{x.style.display="none"});const E=document.createElement("div");E.style.position="fixed",E.style.left="-99999px",E.style.top="0",E.style.background="#ffffff",E.style.padding="16px",E.style.zIndex="-1",E.style.width="max-content",E.style.height="auto",E.style.overflow="visible",w.style.display="block",w.style.maxHeight="none",w.style.height="auto",w.style.overflow="visible",w.style.maxWidth="none",w.style.width="max-content",w.style.backgroundColor="#ffffff",w.style.color="#000000",w.querySelectorAll("*").forEach(x=>{x.style.maxHeight="none",x.style.height="auto",x.style.overflow="visible",x.style.maxWidth="none"}),w.querySelectorAll(".wtBorder").forEach(x=>{x.style.display="none"}),w.querySelectorAll(".handsontable, .ht_master, .wtHolder, .wtHider, .wtSpreader, .table-container").forEach(x=>{x.style.overflow="visible",x.style.height="auto",x.style.maxHeight="none",x.style.maxWidth="none",x.style.width="max-content",x.style.backgroundColor="#111827"}),w.querySelectorAll("td, th, .htCore td, .htCore th").forEach(x=>{x.style.borderColor="#374151"}),w.querySelectorAll("table").forEach(x=>{x.style.width="max-content",x.style.maxWidth="none",x.style.tableLayout="auto",x.style.borderCollapse="collapse"}),E.appendChild(w),document.body.appendChild(E);try{await new Promise(b=>setTimeout(b,500));const x=await ne(E,{scale:2.5,useCORS:!0,backgroundColor:"#ffffff",logging:!1,scrollX:0,scrollY:0,windowWidth:E.scrollWidth,windowHeight:E.scrollHeight}),T=document.createElement("a");T.href=x.toDataURL("image/png"),T.download=`${a}.png`,document.body.appendChild(T),T.click(),document.body.removeChild(T)}catch(x){console.error(x),alert("Error al capturar.")}finally{document.body.removeChild(E),l&&(r.style.display="",r.classList.add("d-none"))}}document.querySelectorAll(".btn-captura-bloque").forEach(n=>{n.addEventListener("click",async function(){const a=this.dataset.target,r=this.dataset.name,l=this.textContent;try{this.disabled=!0,this.textContent="Generando...",await f(a,r)}finally{this.disabled=!1,this.textContent=l}})})});
