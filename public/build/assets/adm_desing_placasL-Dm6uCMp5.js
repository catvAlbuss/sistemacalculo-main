import{h as re}from"./html2canvas.esm-5Cw11iw4.js";var J=[],j=[],X=[];function le(E){var c=[["Piso 1","","","","","",""]],p=E,D=new Handsontable(p,{data:c,rowHeaders:!1,colHeaders:!0,height:"auto",autoWrapRow:!0,autoWrapCol:!0,colWidths:[90,90,90,90,150,90,90,90,150],renderAllRows:!1,renderAllColumns:!0,viewportRowRenderingOffset:15,viewportColumnRenderingOffset:15,sanitizer:C=>C,nestedHeaders:[["Nivel","Vx Piso","Vx Elemento","Ratio","Verif. de Redundancia","Vy Piso","Vy Elemento","Ratio","Verif. de Redundancia"],["","(Ton)","(Ton)","(Vx)","(Vx)","(Ton)","(Ton)","(Vy)","(Vy)"]],columns:[{type:"text",readOnly:!0},{type:"numeric"},{type:"numeric"},{type:"numeric",readOnly:!0},{type:"text",readOnly:!0},{type:"numeric"},{type:"numeric"},{type:"numeric",readOnly:!0},{type:"text",readOnly:!0}],minSpareRows:1,beforePaste:function(C,O){var f=C.length+O[0].startRow;D.countRows()<f&&D.alter("insert_row_above",f-D.countRows(),C.length)},afterChange:function(C,O){if(O==="edit"||O==="paste"){var f=this,m=[];C.forEach(function(a){var i=a[0],e=a[1];if(e===1||e===2){var y=f.getDataAtCell(i,1),v=f.getDataAtCell(i,2),s=y!==0&&y!==null?v/y:0,d=s>=.3?"Diseñar para el 125% del Sismo":"No Diseñar para el 125% del Sismo";m.push([i,3,parseFloat(s.toFixed(2))]),m.push([i,4,d])}if(e===5||e===6){var u=f.getDataAtCell(i,5),o=f.getDataAtCell(i,6),g=u!==0&&u!==null?o/u:0,n=g>=.3?"Diseñar para el 125% del Sismo":"No Diseñar para el 125% del Sismo";m.push([i,7,parseFloat(g.toFixed(2))]),m.push([i,8,n])}}),m.length>0&&f.setDataAtCell(m,"internal")}},afterPaste:function(C,O){var f=this,m=O[0].startRow,a=O[0].startCol;f.suspendRender();try{f.populateFromArray(m,a,C,null,null,"paste");var i=C.length+m,e=f.countRows()-1;if(e<i){for(var y=[],v=m;v<i;v++)y.push([v,0,"Piso "+(v+1)]);y.length>0&&f.setDataAtCell(y,"internal")}}finally{f.resumeRender()}},licenseKey:"non-commercial-and-evaluation"});setTimeout(()=>{D.render()},100),document.getElementById("saveDataBtn1").addEventListener("click",x);function x(){if(J=D.getData(),console.log("Datos de la tabla 1:",J),J.length>1){var C=document.getElementById("solicitudCargaT2");J.pop(),ie(C,J.length)}}}function ie(E,c){var p=E,D=[];for(let f=1;f<=c;f++){var x=[[f,"PL-01","1.40CM+1.70CV"],[f,"PL-01","1.25(CM+CV)+CSx Max"],[f,"PL-01","1.25(CM+CV)+CSx Min"],[f,"PL-01","1.25(CM+CV)+CSy Max"],[f,"PL-01","1.25(CM+CV)+CSy Min"],[f,"PL-01","1.25(CM+CV)-CSx Max"],[f,"PL-01","1.25(CM+CV)-CSx Min"],[f,"PL-01","1.25(CM+CV)-CSy Max"],[f,"PL-01","1.25(CM+CV)-CSy Min"],[f,"PL-01","0.90CM+CSx Max"],[f,"PL-01","0.90CM+CSx Min"],[f,"PL-01","0.90CM+CSy Max"],[f,"PL-01","0.90CM+CSy Min"],[f,"PL-01","0.90CM-CSx Max"],[f,"PL-01","0.90CM-CSx Min"],[f,"PL-01","0.90CM-CSy Max"],[f,"PL-01","0.90CM-CSy Min"]];x.map(m=>D.push(m))}var C=new Handsontable(p,{data:D,rowHeaders:!1,colHeaders:!0,height:"auto",autoWrapRow:!0,autoWrapCol:!0,colWidths:[70,90,220,90,90,90,90,90,90,90,90,90,90,90,90],renderAllRows:!1,renderAllColumns:!0,viewportRowRenderingOffset:15,viewportColumnRenderingOffset:15,sanitizer:f=>f,nestedHeaders:[["Piso","Placa","Combinaciones","Pu","V2","V3","T","M2","M3 ","Pux","Vux","Mux","Puy","Vuy","Muy"],["","","Carga","(Ton)","(Ton)","(Ton)","(Ton.m)","(Ton.m)","(Ton.m)","(Ton)","(Ton)","(Ton.m)","(Ton)","(Ton)","(Ton.m)"]],columns:[{type:"text"},{type:"text",readOnly:!0},{type:"text"},{type:"numeric"},{type:"numeric"},{type:"numeric"},{type:"numeric"},{type:"numeric"},{type:"numeric"},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0}],afterChange:function(f,m){if(m==="edit"||m==="paste"){var a=this,i=[];f.forEach(function(e){var y=e[0],v=e[1],s=e[3];v===3&&(i.push([y,9,s!==null?-s:null]),i.push([y,12,s!==null?-s:null])),v===4&&i.push([y,10,s]),v===5&&i.push([y,13,s]),v===7&&i.push([y,14,s]),v===8&&i.push([y,11,s])}),i.length>0&&a.setDataAtCell(i,"internal")}},afterPaste:function(f,m){var a=this,i=m[0].startRow,e=m[0].startCol;a.suspendRender();try{a.populateFromArray(i,e,f,null,null,"paste")}finally{a.resumeRender()}},licenseKey:"non-commercial-and-evaluation"});document.getElementById("saveDataBtn2").addEventListener("click",O);function O(){j=C.getData(),j=j.map(m=>m.slice(-6));var f=document.getElementById("solicitudCargaT3");se(f,j,j.length)}}function se(E,c){var p=E,D=[],x=0,C=0,O=0,f=0,m=0;c.map((e,y)=>{if(x=Math.max(x,e[0]),C=Math.max(C,e[1]),O=Math.max(O,e[2]),f=Math.max(f,e[4]),m=Math.max(m,e[5]),(y+1)%17==0){var v=[];v.push("Piso "+(y+1)/17),v.push(x),v.push(C),v.push(O),v.push(f),v.push(m),console.log(v),D.push(v),x=0,C=0,O=0,f=0,m=0}});var a=new Handsontable(p,{data:D,rowHeaders:!1,colHeaders:!0,height:"auto",autoWrapRow:!0,autoWrapCol:!0,colWidths:[90,90,90,90,90,90],renderAllRows:!1,renderAllColumns:!0,viewportRowRenderingOffset:15,viewportColumnRenderingOffset:15,sanitizer:e=>e,nestedHeaders:[["Nivel","Pu máx","Vux máx","Mux máx","Vuy máx","Muy máx"],["","(Ton)","(Ton)","(Ton.m)","(Ton)","(Ton.m)"]],columns:[{type:"text",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0}],licenseKey:"non-commercial-and-evaluation"});function i(){X=a.getData(),console.log("Datos de la tabla 3:",X)}setTimeout(i,1e3)}function oe(){const E=document.getElementById("toggleButton"),c=document.getElementById("contenedor_dcc"),p=document.getElementById("calccargars"),D=document.getElementById("contenedor_cc");E.addEventListener("click",function(){c.style.display=c.style.display==="block"?"none":"block";const x=E.querySelector("i");c.style.display==="block"?(x.classList.remove("fa-eye-slash"),x.classList.add("fa-eye")):(x.classList.remove("fa-eye"),x.classList.add("fa-eye-slash"))}),p.addEventListener("click",function(){D.style.display=D.style.display==="block"?"none":"block";const x=p.querySelector("i");D.style.display==="block"?(x.classList.remove("fa-eye-slash"),x.classList.add("fa-eye")):(x.classList.remove("fa-eye"),x.classList.add("fa-eye-slash"))})}var _=[],G=[],K=[];function ue(E,c,p){if(!E)return;var D=E;D.innerHTML="";var x=[];for(let m=0;m<c.length;m++){var C=[`Piso ${m+1}`,p.lxDF,"","","","","",c[m][3],"",""];x.push(C)}var O=new Handsontable(D,{data:x,rowHeaders:!1,colHeaders:!0,height:"auto",autoWrapRow:!0,autoWrapCol:!0,colWidths:[90,90,90,90,150,90,90,90,150,150],renderAllRows:!1,viewportRowRenderingOffset:15,nestedHeaders:[["Nivel","lm","h","hm","hm/lm","Tipo de","Tipo de","Mu","z","As"],["","(m)","(m)","(m)","","Muro","Falla Muro","(Ton.m)","(m)","(cm²)"]],columns:[{type:"text",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric"},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"text",readOnly:!0},{type:"text",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0}],afterChange:function(m,a){if(a==="edit"){var i=this;i.suspendRender();try{m.forEach(function(e){var y=e[0],v=e[1],s=e[3];if(v===2){var d=s,u=0;for(let l=0;l<i.countRows();l++)u+=i.getDataAtCell(l,2);y==0?i.setDataAtCell(y,3,u):(i.setDataAtCell(0,3,u),i.setDataAtCell(y,3,i.getDataAtCell(y-1,3)-d))}if(v===3){y+1<i.countRows()&&i.setDataAtCell(y+1,3,i.getDataAtCell(y,3)-i.getDataAtCell(y+1,2));var o=s/i.getDataAtCell(y,1);i.setDataAtCell(y,4,o)}if(v==4){var g=s>1?"Muro Esbelto":"Muro No Esbelto";i.setDataAtCell(y,5,g);var n=s>1?"Por Flexión":"Por Corte";i.setDataAtCell(y,6,n);var t=0;s>1?t=.9*i.getDataAtCell(y,1):.5<=s&&s<=1?t=.4*i.getDataAtCell(y,1)*(1+s):t=1.2*i.getDataAtCell(y,2),i.setDataAtCell(y,8,t)}if(v==7){var r=s*Math.pow(10,5)/(p.designDF*p.fyDF*i.getDataAtCell(y,8)*100);i.setDataAtCell(y,9,r)}if(v==8){var r=i.getDataAtCell(y,7)*Math.pow(10,5)/(p.designDF*p.fyDF*s*100);i.setDataAtCell(y,9,r)}})}finally{i.resumeRender()}}},afterPaste:function(m,a){var i=this,e=a[0].startRow,y=a[0].startCol;i.suspendRender();try{i.populateFromArray(e,y,m,null,null,"paste")}finally{i.resumeRender()}},licenseKey:"non-commercial-and-evaluation"});document.getElementById("saveDataBtnDF1X").addEventListener("click",f);function f(){var m=!0;K=O.getData();for(var a=0;a<K.length;a++){for(var i=0;i<K[a].length;i++)if(K[a][i]===null||K[a][i]===""){m=!1;break}if(!m)break}if(m){console.log("Datos de la tabla T1X:",K);var e=document.getElementById("flexDesingT2X");ce(e,K);var y=document.getElementById("flexDesingT3X");de(y,K,p)}else alert("Hay celdas vacías")}}function ce(E,c){if(!E)return;var p=E;p.innerHTML="";var D=[];for(let f=0;f<c.length;f++){var x=[`Piso ${f+1}`,'ø3/4"',1.9,2.84,30,0,0,0,0,0,"No Cumple, verificar",'18ø5/8"'];D.push(x)}var C=new Handsontable(p,{data:D,rowHeaders:!1,colHeaders:!0,height:"auto",autoWrapRow:!0,autoWrapCol:!0,colWidths:[90,90,90,90,90,90,90,90,90,120,150,200],renderAllRows:!1,viewportRowRenderingOffset:15,nestedHeaders:[["Nivel","Acero","D","Área","N°",'Ø1/2"','Ø5/8"','Ø3/4"','Ø1"',"Ascolocado","Verificación","Distribución de Refuerzo"],["","","(cm)","(cm²)","Acero","","","","","(cm²)","Acero Colocado","Final en la Zona de Confinamiento"]],columns:[{type:"text",readOnly:!0},{type:"dropdown",source:["6 mm","8 mm",'ø3/8"',"12 mm",'ø1/2"','ø5/8"','ø3/4"','ø7/8"','ø1"','ø1 3/8"']},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric"},{type:"numeric"},{type:"numeric"},{type:"numeric"},{type:"numeric",readOnly:!0},{type:"text",readOnly:!0},{type:"text",readOnly:!0}],afterChange:function(f,m){if(m==="edit"){var a=this;a.suspendRender();try{f.forEach(function(i){var e=i[0],y=i[1],v=i[3];if(y===1){var s=v,d=0,u=0;s=="6 mm"?(d=.6,u=.28):s=="8 mm"?(d=.8,u=.5):s=='ø3/8"'?(d=.95,u=.71):s=="12 mm"?(d=1.2,u=1.13):s=='ø1/2"'?(d=1.27,u=1.29):s=='ø5/8"'?(d=1.59,u=2):s=='ø3/4"'?(d=1.9,u=2.84):s=='ø7/8"'?(d=2.22,u=3.87):s=='ø1"'?(d=2.54,u=5.1):(d=3.49,u=1.01),a.setDataAtCell(e,2,d),a.setDataAtCell(e,3,u)}if(y==3){var o=Math.ceil(c[e][9]/v);a.setDataAtCell(e,4,o)}if(y==5&&(a.setDataAtCell(e,9,1.267*v+1.979*a.getDataAtCell(e,6)+2.85*a.getDataAtCell(e,7)+5.067*a.getDataAtCell(e,8)),v!=0&&a.setDataAtCell(e,11,`${v}Ø1/2"`)),y==6&&(a.setDataAtCell(e,9,1.267*a.getDataAtCell(e,5)+1.979*v+2.85*a.getDataAtCell(e,7)+5.067*a.getDataAtCell(e,8)),v!=0&&a.setDataAtCell(e,11,`${v}Ø5/8"`)),y==7&&(a.setDataAtCell(e,9,1.267*a.getDataAtCell(e,5)+1.979*a.getDataAtCell(e,6)+2.85*v+5.067*a.getDataAtCell(e,8)),v!=0&&a.setDataAtCell(e,11,`${v}Ø3/4"`)),y==8&&(a.setDataAtCell(e,9,1.267*a.getDataAtCell(e,5)+1.979*a.getDataAtCell(e,6)+2.85*a.getDataAtCell(e,7)+5.067*v),v!=0&&a.setDataAtCell(e,11,`${v}Ø1"`)),y==9){var g=a.getDataAtCell(e,9)>c[e][9]?"Sí cumple":"No cumple, verificar";a.setDataAtCell(e,10,g)}})}finally{a.resumeRender()}}},afterPaste:function(f,m){var a=this,i=m[0].startRow,e=m[0].startCol;a.suspendRender();try{a.populateFromArray(i,e,f,null,null,"paste")}finally{a.resumeRender()}},licenseKey:"non-commercial-and-evaluation"});document.getElementById("saveDataBtnDF2X").addEventListener("click",O);function O(){var f=!0;_=C.getData();for(var m=0;m<_.length;m++){for(var a=0;a<_[m].length;a++)if(_[m][a]===null||_[m][a]===""){f=!1;break}if(!f)break}f&&alert("Guardado")}}function de(E,c,p){if(E){var D=E;D.innerHTML="";var x=[];for(let s=0;s<c.length;s++){var C=parseFloat((Math.ceil(c[s][2]/25/.05)*.05).toFixed(2)),O=Math.max(C,.15),f=p.exDF>O?"Sí cumple":"No cumple, verificar",m=.0025,a=p.exDF>=.2?2:1,i=m*p.lnucxDF*100*p.exDF*100,e=.71,y=Math.ceil(p.lnucxDF*100*e/(i/a)/5)*5,v=[`Piso ${s+1}`,C,f,m,a,i,'ø3/8"',.95,.71,y,`$ø3/8" @ ${y} cm`];x.push(v)}new Handsontable(D,{data:x,rowHeaders:!1,colHeaders:!0,height:"auto",autoWrapRow:!0,autoWrapCol:!0,colWidths:[90,90,90,90,90,90,90,90,90,90,120],renderAllRows:!1,viewportRowRenderingOffset:15,nestedHeaders:[["Nivel","emín","Verificación","ρinicial","N°","As inicial","Acero","D","Área","s","Distribución de Refuerzo"],["","(m)","Espesor Mínimo","","Capas","(cm²)","","(cm)","(cm²)","(cm)","Inicial en el Núcleo"]],columns:[{type:"text",readOnly:!0},{type:"numeric",readOnly:!0},{type:"text",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric"},{type:"numeric"},{type:"dropdown",source:["6 mm","8 mm",'ø3/8"',"12 mm",'ø1/2"','ø5/8"','ø3/4"','ø7/8"','ø1"','ø1 3/8"']},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"text",readOnly:!0}],afterChange:function(s,d){if(d==="edit"){var u=this;u.suspendRender();try{s.forEach(function(o){var g=o[0],n=o[1],t=o[3];if(n===6){var r=t,l=0,w=0;r=="6 mm"?(l=.6,w=.28):r=="8 mm"?(l=.8,w=.5):r=='ø3/8"'?(l=.95,w=.71):r=="12 mm"?(l=1.2,w=1.13):r=='ø1/2"'?(l=1.27,w=1.29):r=='ø5/8"'?(l=1.59,w=2):r=='ø3/4"'?(l=1.9,w=2.84):r=='ø7/8"'?(l=2.22,w=3.87):r=='ø1"'?(l=2.54,w=5.1):(l=3.49,w=1.01),u.setDataAtCell(g,7,l),u.setDataAtCell(g,8,w)}n==8&&u.setDataAtCell(g,9,Math.ceil(p.lnucxDF*100*t/(u.getDataAtCell(g,5)/u.getDataAtCell(g,4))/5)*5),n==9&&u.setDataAtCell(g,10,`${u.getDataAtCell(g,6)} @ ${u.getDataAtCell(g,9)} cm`)})}finally{u.resumeRender()}}},afterPaste:function(s,d){var u=this,o=d[0].startRow,g=d[0].startCol;u.suspendRender();try{u.populateFromArray(o,g,s,null,null,"paste")}finally{u.resumeRender()}},licenseKey:"non-commercial-and-evaluation"})}}function me(E,c,p){if(!E)return;var D=E;D.innerHTML="";var x=[];for(let m=0;m<c.length;m++){var C=[`Piso ${m+1}`,p.lyDF,"","","","","",c[m][5],"",""];x.push(C)}var O=new Handsontable(D,{data:x,rowHeaders:!1,colHeaders:!0,height:"auto",autoWrapRow:!0,autoWrapCol:!0,colWidths:[90,90,90,90,150,90,90,90,150,150],renderAllRows:!1,viewportRowRenderingOffset:15,nestedHeaders:[["Nivel","lm","h","hm","hm/lm","Tipo","Tipo","Mu","z","As"],["","(m)","(m)","(m)","","Muro","Falla Muro","(Ton.m)","(m)","(cm²)"]],columns:[{type:"text",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric"},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"text",readOnly:!0},{type:"text",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0}],afterChange:function(m,a){if(a==="edit"){var i=this;i.suspendRender();try{m.forEach(function(e){var y=e[0],v=e[1],s=e[3];if(v===2){var d=s,u=0;for(let l=0;l<i.countRows();l++)u+=i.getDataAtCell(l,2);y==0?i.setDataAtCell(y,3,u):(i.setDataAtCell(0,3,u),i.setDataAtCell(y,3,i.getDataAtCell(y-1,3)-d))}if(v===3){y+1<i.countRows()&&i.setDataAtCell(y+1,3,i.getDataAtCell(y,3)-i.getDataAtCell(y+1,2));var o=s/i.getDataAtCell(y,1);i.setDataAtCell(y,4,o)}if(v==4){var g=s>1?"Muro Esbelto":"Muro No Esbelto";i.setDataAtCell(y,5,g);var n=s>1?"Por Flexión":"Por Corte";i.setDataAtCell(y,6,n);var t=0;s>1?t=.9*i.getDataAtCell(y,1):.5<=s&&s<=1?t=.4*i.getDataAtCell(y,1)*(1+s):t=1.2*i.getDataAtCell(y,2),i.setDataAtCell(y,8,t)}if(v==7){var r=s*Math.pow(10,5)/(p.designDF*p.fyDF*i.getDataAtCell(y,8)*100);i.setDataAtCell(y,9,r)}if(v==8){var r=i.getDataAtCell(y,7)*Math.pow(10,5)/(p.designDF*p.fyDF*s*100);i.setDataAtCell(y,9,r)}})}finally{i.resumeRender()}}},afterPaste:function(m,a){var i=this,e=a[0].startRow,y=a[0].startCol;i.suspendRender();try{i.populateFromArray(e,y,m,null,null,"paste")}finally{i.resumeRender()}},licenseKey:"non-commercial-and-evaluation"});document.getElementById("saveDataBtnDF1Y").addEventListener("click",f);function f(){for(var m=!0,a=O.getData(),i=0;i<a.length;i++){for(var e=0;e<a[i].length;e++)if(a[i][e]===null||a[i][e]===""){m=!1;break}if(!m)break}if(m){console.log("Datos de la tabla T1Y:",a);var y=document.getElementById("flexDesingT2Y");ye(y,a);var v=document.getElementById("flexDesingT3Y");pe(v,a,p)}else alert("Hay celdas vacías")}}function ye(E,c){if(!E)return;var p=E;p.innerHTML="";var D=[];for(let f=0;f<c.length;f++){var x=[`Piso ${f+1}`,'ø3/4"',1.9,2.84,1,0,0,0,0,0,"No Cumple, verificar",'18ø5/8"'];D.push(x)}var C=new Handsontable(p,{data:D,rowHeaders:!1,colHeaders:!0,height:"auto",autoWrapRow:!0,autoWrapCol:!0,colWidths:[90,90,90,90,90,90,90,90,90,120,150,200],renderAllRows:!1,viewportRowRenderingOffset:15,nestedHeaders:[["Nivel","Acero","D","Área","N°",'Ø1/2"','Ø5/8"','Ø3/4"','Ø1"',"Ascolocado","Verificación","Distribución de Refuerzo"],["","","(cm)","(cm²)","Acero","","","","","(cm²)","Acero Colocado","Final en la Zona de Confinamiento"]],columns:[{type:"text",readOnly:!0},{type:"dropdown",source:["6 mm","8 mm",'ø3/8"',"12 mm",'ø1/2"','ø5/8"','ø3/4"','ø7/8"','ø1"','ø1 3/8"']},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric"},{type:"numeric"},{type:"numeric"},{type:"numeric"},{type:"numeric",readOnly:!0},{type:"text",readOnly:!0},{type:"text",readOnly:!0}],afterChange:function(f,m){if(m==="edit"){var a=this;a.suspendRender();try{f.forEach(function(i){var e=i[0],y=i[1],v=i[3];if(y===1){var s=v,d=0,u=0;s=="6 mm"?(d=.6,u=.28):s=="8 mm"?(d=.8,u=.5):s=='ø3/8"'?(d=.95,u=.71):s=="12 mm"?(d=1.2,u=1.13):s=='ø1/2"'?(d=1.27,u=1.29):s=='ø5/8"'?(d=1.59,u=2):s=='ø3/4"'?(d=1.9,u=2.84):s=='ø7/8"'?(d=2.22,u=3.87):s=='ø1"'?(d=2.54,u=5.1):(d=3.49,u=1.01),a.setDataAtCell(e,2,d),a.setDataAtCell(e,3,u)}if(y==3){var o=Math.ceil(c[e][9]/v);a.setDataAtCell(e,4,o)}if(y==5&&(a.setDataAtCell(e,9,1.267*v+1.979*a.getDataAtCell(e,6)+2.85*a.getDataAtCell(e,7)+5.067*a.getDataAtCell(e,8)),v!=0&&a.setDataAtCell(e,11,`${v}Ø1/2"`)),y==6&&(a.setDataAtCell(e,9,1.267*a.getDataAtCell(e,5)+1.979*v+2.85*a.getDataAtCell(e,7)+5.067*a.getDataAtCell(e,8)),v!=0&&a.setDataAtCell(e,11,`${v}Ø5/8"`)),y==7&&(a.setDataAtCell(e,9,1.267*a.getDataAtCell(e,5)+1.979*a.getDataAtCell(e,6)+2.85*v+5.067*a.getDataAtCell(e,8)),v!=0&&a.setDataAtCell(e,11,`${v}Ø3/4"`)),y==8&&(a.setDataAtCell(e,9,1.267*a.getDataAtCell(e,5)+1.979*a.getDataAtCell(e,6)+2.85*a.getDataAtCell(e,7)+5.067*v),v!=0&&a.setDataAtCell(e,11,`${v}Ø1"`)),y==9){var g=a.getDataAtCell(e,9)>c[e][9]?"Sí cumple":"No cumple, verificar";a.setDataAtCell(e,10,g)}})}finally{a.resumeRender()}}},afterPaste:function(f,m){var a=this,i=m[0].startRow,e=m[0].startCol;a.suspendRender();try{a.populateFromArray(i,e,f,null,null,"paste")}finally{a.resumeRender()}},licenseKey:"non-commercial-and-evaluation"});document.getElementById("saveDataBtnDF2Y").addEventListener("click",O);function O(){var f=!0;G=C.getData();for(var m=0;m<G.length;m++){for(var a=0;a<G[m].length;a++)if(G[m][a]===null||G[m][a]===""){f=!1;break}if(!f)break}f&&alert("Guardado")}}function pe(E,c,p){if(E){var D=E;D.innerHTML="";var x=[];for(let s=0;s<c.length;s++){var C=parseFloat((Math.ceil(c[s][2]/25/.05)*.05).toFixed(2)),O=Math.max(C,.15),f=p.eyDF>O?"Sí cumple":"No cumple, verificar",m=.0025,a=p.eyDF>=.2?2:1,i=m*p.lnucyDF*100*p.eyDF*100,e=.71,y=Math.ceil(p.lnucyDF*100*e/(i/a)/5)*5,v=[`Piso ${s+1}`,C,f,m,a,i,'ø3/8"',.95,.71,y,`$ø3/8" @ ${y} cm`];x.push(v)}new Handsontable(D,{data:x,rowHeaders:!1,colHeaders:!0,height:"auto",autoWrapRow:!0,autoWrapCol:!0,colWidths:[90,90,90,90,90,90,90,90,90,90,120],renderAllRows:!1,viewportRowRenderingOffset:15,nestedHeaders:[["Nivel","emín","Verificación","ρinicial","N°","As inicial","Acero","D","Área","s","Distribución de Refuerzo"],["","(m)","Espesor Mínimo","","Capas","(cm²)","","(cm)","(cm²)","(cm)","Inicial en el Núcleo"]],columns:[{type:"text",readOnly:!0},{type:"numeric",readOnly:!0},{type:"text",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric"},{type:"numeric"},{type:"dropdown",source:["6 mm","8 mm",'ø3/8"',"12 mm",'ø1/2"','ø5/8"','ø3/4"','ø7/8"','ø1"','ø1 3/8"']},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"text",readOnly:!0}],afterChange:function(s,d){if(d==="edit"){var u=this;u.suspendRender();try{s.forEach(function(o){var g=o[0],n=o[1],t=o[3];if(n===6){var r=t,l=0,w=0;r=="6 mm"?(l=.6,w=.28):r=="8 mm"?(l=.8,w=.5):r=='ø3/8"'?(l=.95,w=.71):r=="12 mm"?(l=1.2,w=1.13):r=='ø1/2"'?(l=1.27,w=1.29):r=='ø5/8"'?(l=1.59,w=2):r=='ø3/4"'?(l=1.9,w=2.84):r=='ø7/8"'?(l=2.22,w=3.87):r=='ø1"'?(l=2.54,w=5.1):(l=3.49,w=1.01),u.setDataAtCell(g,7,l),u.setDataAtCell(g,8,w)}n==8&&u.setDataAtCell(g,9,Math.ceil(p.lnucyDF*100*t/(u.getDataAtCell(g,5)/u.getDataAtCell(g,4))/5)*5),n==9&&u.setDataAtCell(g,10,`${u.getDataAtCell(g,6)} @ ${u.getDataAtCell(g,9)} cm`)})}finally{u.resumeRender()}}},afterPaste:function(s,d){var u=this,o=d[0].startRow,g=d[0].startCol;u.suspendRender();try{u.populateFromArray(o,g,s,null,null,"paste")}finally{u.resumeRender()}},licenseKey:"non-commercial-and-evaluation"})}}var N=[],Y=[],q=[];function ve(E,c,p){if(!E)return;var D=E;D.innerHTML="";var x=[],C=6;for(let a=0;a<c.length;a++){var O=[`Piso ${a+1}`,p.lxDF,"","","",c[a][2],c[a][3],"","","","","","","","","-","-",""];x.push(O)}var f=new Handsontable(D,{data:x,rowHeaders:!1,colHeaders:!0,height:"auto",autoWrapRow:!0,autoWrapCol:!0,colWidths:[90,50,50,90,50,50,50,50,90,50,170,150,150,50,150,50,150,150],nestedHeaders:[["Nivel","lm","h","hm acumulado","hm","Vua","Mua","Cociente","¿Aplica criterio?","Mnx","Mnx/Mua","Vux","hm/lm","αc","Vcx máx","Nu","β","Vcx"],["","(m)","(m)","(m)","(m)","(Ton)","(Ton.m)","","","","","","","","","","",""]],columns:[{type:"text",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric"},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"text",readOnly:!0},{type:"numeric"},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric"},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0}],afterChange:function(a,i){if(i==="edit"||i==="CopyPaste.paste"){var e=this,y=a.filter(n=>n[1]===2);if(a.filter(n=>n[1]!==2),y.length>0){var v=0;for(let n=0;n<e.countRows();n++){var s=e.getDataAtCell(n,2);v+=s!==null&&s!==""?parseFloat(s):0}var d=[],u=0;for(let n=0;n<e.countRows();n++){var o=e.getDataAtCell(n,2);o===null||o===""||(o=parseFloat(o),u+=o,d.push([n,3,u]))}var g=0;for(let n=0;n<e.countRows();n++){var o=e.getDataAtCell(n,2);o===null||o===""||(o=parseFloat(o),n===0?d.push([0,4,v]):d.push([n,4,g-o]),g+=o)}y.forEach(function(n){var t=n[0],r=parseFloat(n[3]),l=0;if(t==0){var w=parseFloat(e.getDataAtCell(1,2))||0;l=Math.max(e.getDataAtCell(t,1),r+w,.25*(e.getDataAtCell(0,6)/e.getDataAtCell(0,5)))}else if(t==1)l=Math.max(e.getDataAtCell(t,1),parseFloat(e.getDataAtCell(0,2))+r,.25*(e.getDataAtCell(0,6)/e.getDataAtCell(0,5)));else{var F=parseFloat(e.getDataAtCell(0,2))||0,w=parseFloat(e.getDataAtCell(1,2))||0;l=Math.max(e.getDataAtCell(t,1),F+w,.25*(e.getDataAtCell(0,6)/e.getDataAtCell(0,5)))}d.push([t,7,l]);var A=d.find(B=>B[0]===t&&B[1]===3),T=A?A[2]:e.getDataAtCell(t,3),b=d.find(B=>B[0]===0&&B[1]===3),I=b?b[2]:e.getDataAtCell(0,3),M=parseFloat((T-I).toFixed(2))<l?"Sí aplica":"No aplica";d.push([t,8,M]);var H=d.find(B=>B[0]===t&&B[1]===4),h=H?H[2]:e.getDataAtCell(t,4),L=h/e.getDataAtCell(t,1);d.push([t,12,L]);var R=L<=1.5?.8:L>=2?.53:.53-(.53-.8)*(2-L)/(2-1.5);d.push([t,13,R]);var S=p.acwxDC*Math.sqrt(p.fcDF)*R*10;d.push([t,14,S]);var k=e.getDataAtCell(t,15);if(e.getDataAtCell(t,16),k=="-")d.push([t,17,S]);else{var Z=1-parseFloat(k)/(35*p.exDF*e.getDataAtCell(t,1)*10);d.push([t,16,Z]),d.push([t,17,S*Z])}}),y.forEach(function(n){var t=n[0],r=d.filter(A=>A[0]===t&&A[1]===8),l=r.length>0?r[r.length-1][2]:e.getDataAtCell(t,8),w=e.getDataAtCell(t,10),F=e.getDataAtCell(t,5);d.push([t,11,l=="Sí aplica"?F*w:F])}),e.setDataAtCell(d,"internal_update");return}a.forEach(function(n){var t=n[0],r=n[1],l=n[3];if(r===3){t+1<e.countRows()&&e.setDataAtCell(t+1,3,l+e.getDataAtCell(t+1,2));var w=e.getDataAtCell(0,3),F=parseFloat((l-w).toFixed(2))<e.getDataAtCell(t,7)?"Sí aplica":"No aplica";e.setDataAtCell(t,8,F)}if(r===4){t+1<e.countRows()&&e.setDataAtCell(t+1,4,l-e.getDataAtCell(t+1,2));var A=l/e.getDataAtCell(t,1);e.setDataAtCell(t,12,A)}if(r==7){var w=e.getDataAtCell(0,3),T=e.getDataAtCell(t,3),F=parseFloat((T-w).toFixed(2))<l?"Sí aplica":"No aplica";e.setDataAtCell(t,8,F)}r==8&&e.setDataAtCell(t,11,l=="Sí aplica"?e.getDataAtCell(t,5)*e.getDataAtCell(t,10):e.getDataAtCell(t,5)),r==9&&e.setDataAtCell(t,10,l=="-"?"-":Math.min(l/e.getDataAtCell(t,6),C)),r==10&&e.setDataAtCell(t,11,e.getDataAtCell(t,8)=="Sí aplica"?e.getDataAtCell(t,5)*l:e.getDataAtCell(t,5)),r==12&&e.setDataAtCell(t,13,l<=1.5?.8:l>=2?.53:.53-(.53-.8)*(2-l)/(2-1.5)),r==13&&e.setDataAtCell(t,14,p.acwxDC*Math.sqrt(p.fcDF)*l*10),r==14&&e.setDataAtCell(t,17,e.getDataAtCell(t,15)=="-"?l:l*e.getDataAtCell(t,16)),r==15&&(e.setDataAtCell(t,16,l=="-"?"-":1-l/(35*p.exDF*e.getDataAtCell(t,1)*10)),e.setDataAtCell(t,17,l=="-"?e.getDataAtCell(t,14):e.getDataAtCell(t,14)*e.getDataAtCell(t,16))),r==16&&e.setDataAtCell(t,17,l=="-"?e.getDataAtCell(t,14):e.getDataAtCell(t,14)*l)})}},afterPaste:function(a,i){console.log(a),console.log(i);var e=this,y=i[0].startRow,v=i[0].startCol,s=i[0].endCol;if(v<=2&&s>=2){var d=[];a.forEach(function(u,o){let g=0;for(let n=v;n<=s;n++)d.push([y+o,n,u[g]]),g++}),e.setDataAtCell(d,"CopyPaste.paste")}else a.forEach(function(u,o){var g=0;for(let n=v;n<=s;n++)e.setDataAtCell(y+o,n,u[g]),g++})},licenseKey:"non-commercial-and-evaluation"});document.getElementById("saveDataBtnDC1X").addEventListener("click",m);function m(){var a=!0;N=f.getData();for(var i=0;i<N.length;i++){for(var e=0;e<N[i].length;e++)if(N[i][e]===null||N[i][e]===""){a=!1;break}if(!a)break}if(a){console.log("Datos de la tabla DC T1X:",N);var y=document.getElementById("cutDesingT2X");fe(y,p)}else alert("Hay celdas vacías")}}function fe(E,c){if(!E)return;var p=E;p.innerHTML="";var D=N,x=[];for(let t=0;t<D.length;t++){var C=Math.max(D[t][11]/c.designDC-D[t][17],0),O=2.1*Math.sqrt(c.fcDF)*c.exDF*c.dxDF*10,f=c.acwxDC*Math.pow(100,2),m=D[t][11]>.53*f*Math.sqrt(c.fcDF)/1e3||c.exDF>.2?2:1,a=.27*Math.sqrt(c.fcDF)*c.exDF*c.dxDF*10,i=D[t][11]<a?.002:.0025,e=Math.max(i,C/(c.exDF*c.lxDF*c.fyDF*10)),y=c.exDF*c.lxDF*e*c.fyDF*10,v=c.designDC*(D[t][17]+y),s=c.acwxDC*Math.sqrt(c.fcDF)*2.6*10,d=v<=s?"Sí cumple":"No cumple, verificar",u=v>=D[t][11]?"Sí cumple":"No cumple, verificar",o=[`Piso ${t+1}`,C,O,C<=O?"Sí cumple":"No cumple, verificar",f,m,a,i,e,y,v,s,d,u];x.push(o)}var g=new Handsontable(p,{data:x,rowHeaders:!1,colHeaders:!0,height:"auto",autoWrapRow:!0,autoWrapCol:!0,colWidths:[90,90,150,90,90,90,150,90,90,90,150,150,90,90],nestedHeaders:[["Nivel","Vs","Vs máx","Verificación","Acv","N°","Vu máx","ρh mín","ρh","Vs final","Vn","Vn máx","Verificación","Verificación"],["","(Ton)","(Ton)","Cortante del Acero Máximo","(cm²)","Capas","(Ton)","","","(Ton)","(Ton)","(Ton)","(Ton)","Resistencia al Cortante"]],columns:[{type:"text",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"text",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"text",readOnly:!0},{type:"text",readOnly:!0}],licenseKey:"non-commercial-and-evaluation"});document.getElementById("saveDataBtnDC2X").addEventListener("click",n);function n(){Y=g.getData();var t=document.getElementById("cutDesingT3X");ge(t,c)}}function ge(E,c){if(!E)return;var p=E;p.innerHTML="";var D=[];for(let o=0;o<N.length;o++){var x=N[o][11]<Y[o][6]?.0015:.0025,C=Y[o][8],O=Math.min(Math.max(.0025+.5*(2.5-N[o][12])*(Y[o][8]-.0025),x),C),f=O<=C?"Sí cumple":"No cumple, verificar",m=.71,a=Math.ceil(Y[o][5]*m/(c.exDF*100*Y[o][8])/2.5)*2.5,i=Math.ceil(Y[o][5]*m/(c.exDF*100*O)/2.5)*2.5,e=Math.min(3*c.exDF*100,40),y=a<e?"Sí cumple":"No cumple, verificar",v=i<e?"Sí cumple":"No cumple, verificar",s=[`Piso ${o+1}`,x,C,O,f,'ø3/8"',.95,m,a,e,y,'ø3/8"',.95,m,i,e,v];D.push(s)}var d=new Handsontable(p,{data:D,rowHeaders:!1,colHeaders:!0,height:"auto",autoWrapRow:!0,autoWrapCol:!0,colWidths:[90,90,90,170,90,90,90,90,90,90,90,90,90,90,90,90,90],nestedHeaders:[["Nivel","ρv mín","ρv máx","ρv","Verificación","Acero","D","Área","s","smáx","Distribución de Refuerzo","Acero","D","Área","s","smáx","Distribución de Refuerzo"],["","","","","Cuantía Vertical Máxima","","(cm)","(cm²)","(cm)","(cm)","Inicial en el Núcleo","","(cm)","(cm²)","(cm)","(cm)","Inicial en el Núcleo"]],columns:[{type:"text",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"text",readOnly:!0},{type:"dropdown",source:["6 mm","8 mm",'ø3/8"',"12 mm",'ø1/2"','ø5/8"','ø3/4"','ø7/8"','ø1"','ø1 3/8"']},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"text"},{type:"dropdown",source:["6 mm","8 mm",'ø3/8"',"12 mm",'ø1/2"','ø5/8"','ø3/4"','ø7/8"','ø1"','ø1 3/8"']},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"text",readOnly:!0}],afterChange:function(o,g){if(g==="edit"){var n=this;o.forEach(function(t){var r=t[0],l=t[1],w=t[3];if(l===5){var F=w,A=0,T=0;F=="6 mm"?(A=.6,T=.28):F=="8 mm"?(A=.8,T=.5):F=='ø3/8"'?(A=.95,T=.71):F=="12 mm"?(A=1.2,T=1.13):F=='ø1/2"'?(A=1.27,T=1.29):F=='ø5/8"'?(A=1.59,T=2):F=='ø3/4"'?(A=1.9,T=2.84):F=='ø7/8"'?(A=2.22,T=3.87):F=='ø1"'?(A=2.54,T=5.1):(A=3.49,T=1.01),n.setDataAtCell(r,6,A),n.setDataAtCell(r,7,T)}if(l==7&&n.setDataAtCell(r,8,Math.ceil(Y[r][5]*w/(c.exDF*100*Y[r][8])/2.5)*2.5),l==8&&n.setDataAtCell(r,10,w<=n.getDataAtCell(r,9)?"Sí cumple":"No cumple, verificar"),l===11){var F=w,A=0,T=0;F=="6 mm"?(A=.6,T=.28):F=="8 mm"?(A=.8,T=.5):F=='ø3/8"'?(A=.95,T=.71):F=="12 mm"?(A=1.2,T=1.13):F=='ø1/2"'?(A=1.27,T=1.29):F=='ø5/8"'?(A=1.59,T=2):F=='ø3/4"'?(A=1.9,T=2.84):F=='ø7/8"'?(A=2.22,T=3.87):F=='ø1"'?(A=2.54,T=5.1):(A=3.49,T=1.01),n.setDataAtCell(r,12,A),n.setDataAtCell(r,13,T)}l==13&&n.setDataAtCell(r,14,Math.ceil(Y[r][5]*w/(c.exDF*100*n.getDataAtCell(r,3))/2.5)*2.5),l==14&&n.setDataAtCell(r,16,w<=n.getDataAtCell(r,15)?"Sí cumple":"No cumple, verificar")})}},licenseKey:"non-commercial-and-evaluation"});document.getElementById("saveDataBtnDC3X").addEventListener("click",u);function u(){q=d.getData();var o=document.getElementById("cutDesingT4X");Ce(o)}}function Ce(E){if(E){var c=E;c.innerHTML="";var p=[];for(let x=0;x<N.length;x++){var D=[`Piso ${x+1}`,Y[x][5],q[x][5],"@",q[x][8],Y[x][5],q[x][11],"@",q[x][14]];p.push(D)}new Handsontable(c,{data:p,rowHeaders:!1,colHeaders:!0,height:"auto",autoWrapRow:!0,autoWrapCol:!0,colWidths:[90,90,90,50,90,90,90,50,90],colHeaders:["Nivel","Capas","Acero","","s (cm)","Capas","Acero","","s (cm)"],columns:[{type:"text",readOnly:!0},{type:"numeric",readOnly:!0},{type:"text",readOnly:!0},{type:"text",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"text",readOnly:!0},{type:"text",readOnly:!0},{type:"numeric",readOnly:!0}],licenseKey:"non-commercial-and-evaluation"})}}var W=[],$=[],z=[];function De(E,c,p){if(!E)return;var D=E;D.innerHTML="";var x=[],C=6;for(let a=0;a<c.length;a++){var O=[`Piso ${a+1}`,p.lyDF,"","","",c[a][4],c[a][5],"","","","","","","","","-","-",""];x.push(O)}var f=new Handsontable(D,{data:x,rowHeaders:!1,colHeaders:!0,height:"auto",autoWrapRow:!0,autoWrapCol:!0,colWidths:[90,50,50,90,50,50,50,50,90,50,170,150,150,50,150,50,150,150],nestedHeaders:[["Nivel","lm","h","hm acumulado","hm","Vua","Mua","Cociente","¿Aplica criterio?","Mny","Mny/Mua","Vuy","hm/lm","αc","Vcy máx","Nu","β","Vcy"],["","(m)","(m)","(m)","(m)","(Ton)","(Ton.m)","","","(Ton.m)","","(Ton)","","","(Ton)","(Ton)","","(Ton)"]],columns:[{type:"text",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric"},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"text",readOnly:!0},{type:"numeric"},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric"},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0}],afterChange:function(a,i){if(i==="edit"||i==="CopyPaste.paste"){var e=this,y=a.filter(n=>n[1]===2);if(a.filter(n=>n[1]!==2),y.length>0){var v=0;for(let n=0;n<e.countRows();n++){var s=e.getDataAtCell(n,2);v+=s!==null&&s!==""?parseFloat(s):0}var d=[],u=0;for(let n=0;n<e.countRows();n++){var o=e.getDataAtCell(n,2);o===null||o===""||(o=parseFloat(o),u+=o,d.push([n,3,u]))}var g=0;for(let n=0;n<e.countRows();n++){var o=e.getDataAtCell(n,2);o===null||o===""||(o=parseFloat(o),n===0?d.push([0,4,v]):d.push([n,4,g-o]),g+=o)}y.forEach(function(n){var t=n[0],r=parseFloat(n[3]),l=0;if(t==0){var w=parseFloat(e.getDataAtCell(1,2))||0;l=Math.max(e.getDataAtCell(t,1),r+w,.25*(e.getDataAtCell(0,6)/e.getDataAtCell(0,5)))}else if(t==1)l=Math.max(e.getDataAtCell(t,1),parseFloat(e.getDataAtCell(0,2))+r,.25*(e.getDataAtCell(0,6)/e.getDataAtCell(0,5)));else{var F=parseFloat(e.getDataAtCell(0,2))||0,w=parseFloat(e.getDataAtCell(1,2))||0;l=Math.max(e.getDataAtCell(t,1),F+w,.25*(e.getDataAtCell(0,6)/e.getDataAtCell(0,5)))}d.push([t,7,l]);var A=d.find(B=>B[0]===t&&B[1]===3),T=A?A[2]:e.getDataAtCell(t,3),b=d.find(B=>B[0]===0&&B[1]===3),I=b?b[2]:e.getDataAtCell(0,3),M=parseFloat((T-I).toFixed(2))<l?"Sí aplica":"No aplica";d.push([t,8,M]);var H=d.find(B=>B[0]===t&&B[1]===4),h=H?H[2]:e.getDataAtCell(t,4),L=h/e.getDataAtCell(t,1);d.push([t,12,L]);var R=L<=1.5?.8:L>=2?.53:.53-(.53-.8)*(2-L)/(2-1.5);d.push([t,13,R]);var S=p.acwyDC*Math.sqrt(p.fcDF)*R*10;d.push([t,14,S]);var k=e.getDataAtCell(t,15);if(k=="-")d.push([t,17,S]);else{var Z=1-parseFloat(k)/(35*p.eyDF*e.getDataAtCell(t,1)*10);d.push([t,16,Z]),d.push([t,17,S*Z])}}),y.forEach(function(n){var t=n[0],r=d.filter(A=>A[0]===t&&A[1]===8),l=r.length>0?r[r.length-1][2]:e.getDataAtCell(t,8),w=e.getDataAtCell(t,10),F=e.getDataAtCell(t,5);d.push([t,11,l=="Sí aplica"?F*w:F])}),e.setDataAtCell(d,"internal_update");return}a.forEach(function(n){var t=n[0],r=n[1],l=n[3];if(r===3){t+1<e.countRows()&&e.setDataAtCell(t+1,3,l+e.getDataAtCell(t+1,2));var w=e.getDataAtCell(0,3),F=parseFloat((l-w).toFixed(2))<e.getDataAtCell(t,7)?"Sí aplica":"No aplica";e.setDataAtCell(t,8,F)}if(r===4){t+1<e.countRows()&&e.setDataAtCell(t+1,4,l-e.getDataAtCell(t+1,2));var A=l/e.getDataAtCell(t,1);e.setDataAtCell(t,12,A)}if(r==7){var w=e.getDataAtCell(0,3),T=e.getDataAtCell(t,3),F=parseFloat((T-w).toFixed(2))<l?"Sí aplica":"No aplica";e.setDataAtCell(t,8,F)}r==8&&e.setDataAtCell(t,11,l=="Sí aplica"?e.getDataAtCell(t,5)*e.getDataAtCell(t,10):e.getDataAtCell(t,5)),r==9&&e.setDataAtCell(t,10,l=="-"?"-":Math.min(l/e.getDataAtCell(t,6),C)),r==10&&e.setDataAtCell(t,11,e.getDataAtCell(t,8)=="Sí aplica"?e.getDataAtCell(t,5)*l:e.getDataAtCell(t,5)),r==12&&e.setDataAtCell(t,13,l<=1.5?.8:l>=2?.53:.53-(.53-.8)*(2-l)/(2-1.5)),r==13&&e.setDataAtCell(t,14,p.acwyDC*Math.sqrt(p.fcDF)*l*10),r==14&&e.setDataAtCell(t,17,e.getDataAtCell(t,15)=="-"?l:l*e.getDataAtCell(t,16)),r==15&&(e.setDataAtCell(t,16,l=="-"?"-":1-l/(35*p.eyDF*e.getDataAtCell(t,1)*10)),e.setDataAtCell(t,17,l=="-"?e.getDataAtCell(t,14):e.getDataAtCell(t,14)*e.getDataAtCell(t,16))),r==16&&e.setDataAtCell(t,17,l=="-"?e.getDataAtCell(t,14):e.getDataAtCell(t,14)*l)})}},afterPaste:function(a,i){console.log(a),console.log(i);var e=this,y=i[0].startRow,v=i[0].startCol,s=i[0].endCol;if(v<=2&&s>=2){var d=[];a.forEach(function(u,o){let g=0;for(let n=v;n<=s;n++)d.push([y+o,n,u[g]]),g++}),e.setDataAtCell(d,"CopyPaste.paste")}else a.forEach(function(u,o){var g=0;for(let n=v;n<=s;n++)e.setDataAtCell(y+o,n,u[g]),g++})},licenseKey:"non-commercial-and-evaluation"});document.getElementById("saveDataBtnDC1Y").addEventListener("click",m);function m(){var a=!0;W=f.getData();for(var i=0;i<W.length;i++){for(var e=0;e<W[i].length;e++)if(W[i][e]===null||W[i][e]===""){a=!1;break}if(!a)break}if(a){console.log("Datos de la tabla DC T1X:",W);var y=document.getElementById("cutDesingT2Y");xe(y,p)}else alert("Hay celdas vacías")}}function xe(E,c){if(!E)return;var p=E;p.innerHTML="";var D=W,x=[];for(let t=0;t<D.length;t++){var C=Math.max(D[t][11]/c.designDC-D[t][17],0),O=2.1*Math.sqrt(c.fcDF)*c.eyDF*c.dyDF*10,f=c.acwyDC*Math.pow(100,2),m=D[t][11]>.53*f*Math.sqrt(c.fcDF)/1e3||c.eyDF>.2?2:1,a=.27*Math.sqrt(c.fcDF)*c.eyDF*c.dyDF*10,i=D[t][11]<a?.002:.0025,e=Math.max(i,C/(c.eyDF*c.lyDF*c.fyDF*10)),y=c.eyDF*c.lyDF*e*c.fyDF*10,v=c.designDC*(D[t][17]+y),s=c.acwyDC*Math.sqrt(c.fcDF)*2.6*10,d=v<=s?"Sí cumple":"No cumple, verificar",u=v>=D[t][11]?"Sí cumple":"No cumple, verificar",o=[`Piso ${t+1}`,C,O,C<=O?"Sí cumple":"No cumple, verificar",f,m,a,i,e,y,v,s,d,u];x.push(o)}var g=new Handsontable(p,{data:x,rowHeaders:!1,colHeaders:!0,height:"auto",autoWrapRow:!0,autoWrapCol:!0,colWidths:[90,90,150,90,90,90,150,90,90,90,150,150,90,90],nestedHeaders:[["Nivel","Vs","Vs máx","Verificación","Acv","N°","Vu máx","ρh mín","ρh","Vs final","Vn","Vn máx","Verificación","Verificación"],["","(Ton)","(Ton)","Cortante del Acero Máximo","(cm²)","Capas","(Ton)","","","(Ton)","(Ton)","(Ton)",'"Vn máx"',"Resistencia al Cortante"]],columns:[{type:"text",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"text",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"text",readOnly:!0},{type:"text",readOnly:!0}],licenseKey:"non-commercial-and-evaluation"});document.getElementById("saveDataBtnDC2Y").addEventListener("click",n);function n(){$=g.getData();var t=document.getElementById("cutDesingT3Y");Ae(t,c)}}function Ae(E,c){if(!E)return;var p=E;p.innerHTML="";var D=[];for(let o=0;o<W.length;o++){var x=W[o][11]<$[o][6]?.0015:.0025,C=$[o][8],O=Math.min(Math.max(.0025+.5*(2.5-W[o][12])*($[o][8]-.0025),x),C),f=O<=C?"Sí cumple":"No cumple, verificar",m=.71,a=Math.ceil($[o][5]*m/(c.eyDF*100*$[o][8])/2.5)*2.5,i=Math.ceil($[o][5]*m/(c.eyDF*100*O)/2.5)*2.5,e=Math.min(3*c.eyDF*100,40),y=a<e?"Sí cumple":"No cumple, verificar",v=i<e?"Sí cumple":"No cumple, verificar",s=[`Piso ${o+1}`,x,C,O,f,'ø3/8"',.95,m,a,e,y,'ø3/8"',.95,m,i,e,v];D.push(s)}var d=new Handsontable(p,{data:D,rowHeaders:!1,colHeaders:!0,height:"auto",autoWrapRow:!0,autoWrapCol:!0,colWidths:[90,90,90,170,90,90,90,90,90,90,90,90,90,90,90,90,90],nestedHeaders:[["Nivel","ρv mín","ρv máx","ρv","Verificación","Acero","D","Área","s","smáx","Distribución de Refuerzo","Acero","D","Área","s","smáx","Distribución de Refuerzo"],["","","","","Cuantía Vertical Máxima","","(cm)","(cm²)","(cm)","(cm)","Inicial en el Núcleo","","(cm)","(cm²)","(cm)","(cm)","Inicial en el Núcleo"]],columns:[{type:"text",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"text",readOnly:!0},{type:"dropdown",source:["6 mm","8 mm",'ø3/8"',"12 mm",'ø1/2"','ø5/8"','ø3/4"','ø7/8"','ø1"','ø1 3/8"']},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"text"},{type:"dropdown",source:["6 mm","8 mm",'ø3/8"',"12 mm",'ø1/2"','ø5/8"','ø3/4"','ø7/8"','ø1"','ø1 3/8"']},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"text",readOnly:!0}],afterChange:function(o,g){if(g==="edit"){var n=this;o.forEach(function(t){var r=t[0],l=t[1],w=t[3];if(l===5){var F=w,A=0,T=0;F=="6 mm"?(A=.6,T=.28):F=="8 mm"?(A=.8,T=.5):F=='ø3/8"'?(A=.95,T=.71):F=="12 mm"?(A=1.2,T=1.13):F=='ø1/2"'?(A=1.27,T=1.29):F=='ø5/8"'?(A=1.59,T=2):F=='ø3/4"'?(A=1.9,T=2.84):F=='ø7/8"'?(A=2.22,T=3.87):F=='ø1"'?(A=2.54,T=5.1):(A=3.49,T=1.01),n.setDataAtCell(r,6,A),n.setDataAtCell(r,7,T)}if(l==7&&n.setDataAtCell(r,8,Math.ceil($[r][5]*w/(c.eyDF*100*$[r][8])/2.5)*2.5),l==8&&n.setDataAtCell(r,10,w<=n.getDataAtCell(r,9)?"Sí cumple":"No cumple, verificar"),l===11){var F=w,A=0,T=0;F=="6 mm"?(A=.6,T=.28):F=="8 mm"?(A=.8,T=.5):F=='ø3/8"'?(A=.95,T=.71):F=="12 mm"?(A=1.2,T=1.13):F=='ø1/2"'?(A=1.27,T=1.29):F=='ø5/8"'?(A=1.59,T=2):F=='ø3/4"'?(A=1.9,T=2.84):F=='ø7/8"'?(A=2.22,T=3.87):F=='ø1"'?(A=2.54,T=5.1):(A=3.49,T=1.01),n.setDataAtCell(r,12,A),n.setDataAtCell(r,13,T)}l==13&&n.setDataAtCell(r,14,Math.ceil($[r][5]*w/(c.eyDF*100*n.getDataAtCell(r,3))/2.5)*2.5),l==14&&n.setDataAtCell(r,16,w<=n.getDataAtCell(r,15)?"Sí cumple":"No cumple, verificar")})}},licenseKey:"non-commercial-and-evaluation"});document.getElementById("saveDataBtnDC3Y").addEventListener("click",u);function u(){z=d.getData();var o=document.getElementById("cutDesingT4Y");we(o)}}function we(E){if(E){var c=E;c.innerHTML="";var p=[];for(let x=0;x<W.length;x++){var D=[`Piso ${x+1}`,$[x][5],z[x][5],"@",z[x][8],$[x][5],z[x][11],"@",z[x][14]];p.push(D)}new Handsontable(c,{data:p,rowHeaders:!1,colHeaders:!0,height:"auto",autoWrapRow:!0,autoWrapCol:!0,colWidths:[90,90,90,50,90,90,90,50,90],colHeaders:["Nivel","Capas","Acero","","s (cm)","Capas","Acero","","s (cm)"],columns:[{type:"text",readOnly:!0},{type:"numeric",readOnly:!0},{type:"text",readOnly:!0},{type:"text",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"text",readOnly:!0},{type:"text",readOnly:!0},{type:"numeric",readOnly:!0}],licenseKey:"non-commercial-and-evaluation"})}}var P=[],V=[],ne={};function Oe(E,c,p,D,x,C){if(!p||p.length===0){console.warn("diT1X: tableData1DC está vacío o no definido.");return}if(!D||D.length===0){console.warn("diT1X: dataTable2xDF está vacío o no definido.");return}if(!x||x.length===0){console.warn("diT1X: tableData3DC está vacío o no definido.");return}if(!C){console.warn("diT1X: formData no está definido.");return}var O=E,f=[];for(let b=0;b<1;b++){if(!p[b]||p[b].length<=4){console.warn(`diT1X: tableData1DC[${b}] no tiene índice 4.`);continue}if(!D[b]||D[b].length<=9){console.warn(`diT1X: dataTable2xDF[${b}] no tiene índice 9.`);continue}if(!x[b]||x[b].length<=3){console.warn(`diT1X: tableData3DC[${b}] no tiene índice 3.`);continue}var m=C.lxDF,a=p[b][4],i=D[b][9],e=0,y=c[b][1],v=x[b][3],s=.85*C.fcDF*C.ezcxDF*100*C.β1DF+2*v*C.ezcxDF*100*C.fyDF,d=s!==0?(y*1e3+i*C.fyDF+v*C.ezcxDF*100*C.lxDF*100*C.fyDF-e*C.fyDF)/s:0,u=0,o=0,g=u==0?0:C.ƐcDF*C.lxDF*100/(C.ƐcDF+u),n=Math.max(d,o,g),t=.2374764,r=m/(600*Math.max(t/a,.005))*100,l=n>=r?"Requiere ser confinado":"No requiere ser confinado",w=[m,a,i,e,y,v,d,o,u,g,n,t,r,l];f.push(w)}if(f.length===0){console.warn("diT1X: No se generaron datos.");return}var F=new Handsontable(O,{data:f,rowHeaders:!0,colHeaders:!0,height:"auto",autoWrapRow:!0,autoWrapCol:!0,colWidths:100,nestedHeaders:[["lm","hm","As","A's","Pu","pv","c1","c2","Ɛs","c3","c","δu","C limite","Confinamiento"],["(m)","(m)","(cm²)","(cm²)","(Ton)","","(cm)","(cm)","","(cm)","(cm)","(m)","(cm)","elemento de borde"]],columns:[{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric"},{type:"numeric"},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric"},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0}],afterChange:function(b,I){if(I==="edit"){var M=this;b.forEach(function(H){var h=H[0],L=H[1],R=H[3];L===7&&M.setDataAtCell(h,10,Math.max(M.getDataAtCell(h,6),M.getDataAtCell(h,7),M.getDataAtCell(h,9))),L===8&&M.setDataAtCell(h,9,R==0?0:C.ƐcDF*C.lxDF*100/(C.ezcxDF+R)),L===9&&M.setDataAtCell(h,10,Math.max(M.getDataAtCell(h,6),M.getDataAtCell(h,7),M.newValue)),L===10&&M.setDataAtCell(h,13,R>=M.getDataAtCell(h,12)?"Requiere ser confinado":"No requiere ser confinado"),L===11&&M.setDataAtCell(h,12,M.getDataAtCell(h,0)/(600*Math.max(M.getDataAtCell(h,11)/M.getDataAtCell(h,1),.005))*100),L===12&&M.setDataAtCell(h,13,M.getDataAtCell(h,10)>=R?"Requiere ser confinado":"No requiere ser confinado")})}},afterPaste:function(b,I){console.log(b),console.log(I),b.forEach(function(M,H){var h=I[0].startRow,L=I[0].startCol,R=I[0].endCol;let S=0;for(let k=L;k<=R;k++)F.setDataAtCell(h+H,k,M[S]),S++})},licenseKey:"non-commercial-and-evaluation"}),A=document.getElementById("saveDataBtnDI1X");A?A.addEventListener("click",T):console.warn("diT1X: No se encontró el botón saveDataBtnDI1X");function T(){P=F.getData();var b=document.getElementById("diT2X");b?Fe(b,c,p,D,C):console.warn("No se encontró el contenedor diT2X");var I=document.getElementById("diT3X");I?Ee(I,C):console.warn("No se encontró el contenedor diT3X")}}function Fe(E,c,p,D,x){if(!P||P.length===0){console.warn("diT2X: tableDI1X está vacío. Asegúrese de haber guardado los datos en diT1X.");return}var C=E,O=[];for(let l=0;l<1;l++){if(!P[l]||P[l].length<=10){console.warn(`diT2X: tableDI1X[${l}] no tiene índice 10.`);continue}if(!p[l]||p[l].length<=11){console.warn(`diT2X: tableData1DC[${l}] no tiene índice 11.`);continue}if(!c[l]||c[l].length<=3){console.warn(`diT2X: solicitaciones[${l}] no tiene índice 3.`);continue}if(!D[l]||D[l].length<=2){console.warn(`diT2X: dataTable2xDF[${l}] no tiene índice 2.`);continue}var f=x.zcxDF,m=p[l][11],a=c[l][3],i=P[l][0],e=.25*(a/m),y=Math.max(i,e),v=Math.max(P[l][10]/100-.1*P[l][0],0),s=P[l][10]/2/100,d=Math.max(v,s),u=f>d?"Sí cumple":"No cumple, verificar",o=10*D[l][2],g=Math.min(x.zcxDF,x.ezcxDF)*100,n=25,t=Math.floor(Math.min(o,n)/2.5)*2.5,r=[f,m,a,i,e,y,v,s,d,u,o,g,n,t];O.push(r)}O.length!==0&&new Handsontable(C,{data:O,rowHeaders:!0,colHeaders:!0,height:"auto",autoWrapRow:!0,autoWrapCol:!0,colWidths:100,nestedHeaders:[["zc","Vu máx","Mu máx","Lo máx","Lo máx","Lo máx","zcmáx 1","zcmáx 2","zcmáx","Artículo 21.9.7.6.a. Verificación","s1","s2","s3","s"],["(m)","(Ton)","(Ton.m)","(m)","(m)","(m)","(m)","(m)","(m)","Espesor de la Zona de Confinamiento","(cm)","(cm)","(cm)","(cm)"]],columns:[{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"text",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0}],licenseKey:"non-commercial-and-evaluation"})}function Ee(E,c){if(!P||P.length===0){console.warn("diT3X: tableDI1X está vacío.");return}var p=E,D=[];for(let a=0;a<1;a++){if(!P[a]||P[a].length<=1){console.warn(`diT3X: tableDI1X[${a}] no tiene índice 1.`);continue}var x=c.lyDF,C=P[a][1],O=.1*C,f=x<=O?"Diseñar con ala completa":"Diseñar solo con ancho efectivo del ala",m=[x,C,O,f];D.push(m)}D.length!==0&&new Handsontable(p,{data:D,rowHeaders:!0,colHeaders:!0,height:"auto",autoWrapRow:!0,autoWrapCol:!0,colWidths:100,nestedHeaders:[["Ly","hm","Ly calculado","Verificación"],["(m)","(m)","(m)","ancho efectivo del Ala"]],columns:[{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"text",readOnly:!0}],licenseKey:"non-commercial-and-evaluation"})}function Te(E,c,p,D,x,C){if(!p||p.length===0){console.warn("diT1Y: tableData1DC está vacío o no definido.");return}if(!D||D.length===0){console.warn("diT1Y: dataTable2yDF está vacío o no definido.");return}if(!x||x.length===0){console.warn("diT1Y: tableData3DC está vacío o no definido.");return}if(!C){console.warn("diT1Y: formData no está definido.");return}var O=E,f=[];for(let b=0;b<1;b++){if(!p[b]||p[b].length<=4){console.warn(`diT1Y: tableData1DC[${b}] no tiene índice 4.`);continue}if(!D[b]||D[b].length<=9){console.warn(`diT1Y: dataTable2yDF[${b}] no tiene índice 9.`);continue}if(!x[b]||x[b].length<=3){console.warn(`diT1Y: tableData3DC[${b}] no tiene índice 3.`);continue}var m=C.lxDF,a=p[b][4],i=D[b][9],e=0,y=c[b][1],v=x[b][3],s=.85*C.fcDF*C.ezcyDF*100*C.β1DF+2*v*C.ezcyDF*100*C.fyDF,d=s!==0?(y*1e3+i*C.fyDF+v*C.ezcyDF*100*C.lyDF*100*C.fyDF-e*C.fyDF)/s:0,u=0,o=0,g=u==0?0:C.ƐcDF*C.lxDF*100/(C.ƐcDF+u),n=Math.max(d,o,g),t=.2374764,r=m/(600*Math.max(t/a,.005))*100,l=n>=r?"Requiere ser confinado":"No requiere ser confinado",w=[m,a,i,e,y,v,d,o,u,g,n,t,r,l];f.push(w)}if(f.length===0){console.warn("diT1Y: No se generaron datos.");return}var F=new Handsontable(O,{data:f,rowHeaders:!0,colHeaders:!0,height:"auto",autoWrapRow:!0,autoWrapCol:!0,colWidths:100,nestedHeaders:[["lm","hm","As","A's","Pu","pv","c1","c2","Ɛs","c3","c","δu","C limite","Confinamiento"],["(m)","(m)","(cm²)","(cm²)","(Ton)","","(cm)","(cm)","","(cm)","(cm)","(m)","(cm)","elemento de borde"]],columns:[{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric"},{type:"numeric"},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric"},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0}],afterChange:function(b,I){if(I==="edit"){var M=this;b.forEach(function(H){var h=H[0],L=H[1],R=H[3];L===7&&M.setDataAtCell(h,10,Math.max(M.getDataAtCell(h,6),M.getDataAtCell(h,7),M.getDataAtCell(h,9))),L===8&&M.setDataAtCell(h,9,R==0?0:C.ƐcDF*C.lxDF*100/(C.ezcxDF+R)),L===9&&M.setDataAtCell(h,10,Math.max(M.getDataAtCell(h,6),M.getDataAtCell(h,7),M.newValue)),L===10&&M.setDataAtCell(h,13,R>=M.getDataAtCell(h,12)?"Requiere ser confinado":"No requiere ser confinado"),L===11&&M.setDataAtCell(h,12,M.getDataAtCell(h,0)/(600*Math.max(M.getDataAtCell(h,11)/M.getDataAtCell(h,1),.005))*100),L===12&&M.setDataAtCell(h,13,M.getDataAtCell(h,10)>=R?"Requiere ser confinado":"No requiere ser confinado")})}},afterPaste:function(b,I){console.log(b),console.log(I),b.forEach(function(M,H){var h=I[0].startRow,L=I[0].startCol,R=I[0].endCol;let S=0;for(let k=L;k<=R;k++)F.setDataAtCell(h+H,k,M[S]),S++})},licenseKey:"non-commercial-and-evaluation"}),A=document.getElementById("saveDataBtnDI1Y");A?A.addEventListener("click",T):console.warn("diT1Y: No se encontró el botón saveDataBtnDI1Y");function T(){V=F.getData();var b=document.getElementById("diT2Y");b?be(b,c,p,D,C):console.warn("No se encontró el contenedor diT2Y");var I=document.getElementById("diT3Y");I?Me(I,C):console.warn("No se encontró el contenedor diT3Y")}}function be(E,c,p,D,x){if(!V||V.length===0){console.warn("diT2Y: tableDI1Y está vacío.");return}var C=E,O=[];for(let l=0;l<1;l++){if(!V[l]||V[l].length<=10){console.warn(`diT2Y: tableDI1Y[${l}] no tiene índice 10.`);continue}if(!p[l]||p[l].length<=11){console.warn(`diT2Y: tableData1DC[${l}] no tiene índice 11.`);continue}if(!c[l]||c[l].length<=3){console.warn(`diT2Y: solicitaciones[${l}] no tiene índice 3.`);continue}if(!D[l]||D[l].length<=2){console.warn(`diT2Y: dataTable2yDF[${l}] no tiene índice 2.`);continue}var f=x.zcyDF,m=p[l][11],a=c[l][3],i=V[l][0],e=.25*(a/m),y=Math.max(i,e),v=Math.max(V[l][10]/100-.1*V[l][0],0),s=V[l][10]/2/100,d=Math.max(v,s),u=f>d?"Sí cumple":"No cumple, verificar",o=10*D[l][2],g=Math.min(x.zcyDF,x.ezcyDF)*100,n=25,t=Math.floor(Math.min(o,n)/2.5)*2.5,r=[f,m,a,i,e,y,v,s,d,u,o,g,n,t];O.push(r)}O.length!==0&&new Handsontable(C,{data:O,rowHeaders:!0,colHeaders:!0,height:"auto",autoWrapRow:!0,autoWrapCol:!0,colWidths:100,nestedHeaders:[["zc","Vu máx","Mu máx","Lo máx","Lo máx","Lo máx","zcmáx 1","zcmáx 2","zcmáx","Artículo 21.9.7.6.a. Verificación","s1","s2","s3","s"],["(m)","(Ton)","(Ton.m)","(m)","(m)","(m)","(m)","(m)","(m)","Espesor de la Zona de Confinamiento","(cm)","(cm)","(cm)","(cm)"]],columns:[{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"text",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0}],licenseKey:"non-commercial-and-evaluation"})}function Me(E,c){if(!V||V.length===0){console.warn("diT3Y: tableDI1Y está vacío.");return}var p=E,D=[];for(let a=0;a<1;a++){if(!V[a]||V[a].length<=1){console.warn(`diT3Y: tableDI1Y[${a}] no tiene índice 1.`);continue}var x=c.lxDF,C=V[a][1],O=.1*C,f=x<=O?"Diseñar con ala completa":"Diseñar solo con ancho efectivo del ala",m=[x,C,O,f];D.push(m)}D.length!==0&&new Handsontable(p,{data:D,rowHeaders:!0,colHeaders:!0,height:"auto",autoWrapRow:!0,autoWrapCol:!0,colWidths:100,nestedHeaders:[["Lx","hm","Ly calculado","Verificación"],["(m)","(m)","(m)","ancho efectivo del Ala"]],columns:[{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"text",readOnly:!0}],licenseKey:"non-commercial-and-evaluation"})}function he(E){if(!E||E.length===0){console.warn("diagramI: No hay datos de solicitaciones.");return}var c=0,p=E.length;for(let t=1;t<=p/17;t=t+2){c++;var D=E.slice(0,17),x=E.slice(17,34);if(E=E.slice(34),D.length===0||x.length===0){console.warn("diagramI: No hay suficientes datos para crear el gráfico.");break}var C=document.createElement("div"),O=document.createElement("div"),f=document.createElement("div"),m=document.createElement("div"),a=document.createElement("div"),i=document.createElement("div"),e=document.createElement("div"),y=document.createElement("div"),v=document.createElement("button");v.textContent="Generar gráfico Izquierdo";var s=document.createElement("div"),d=document.createElement("div"),u=document.createElement("div"),o=document.createElement("div"),g=document.createElement("button");g.textContent="Generar gráfico Derecho",a.id=`hotTableContainerISC${c}`,a.classList.add("mr-1"),s.id=`hotTableContainerDSC${c}`,e.id=`hotTableContainerIDI${c}`,v.id=`buttonIDI${c}`,u.id=`hotTableContainerDDI${c}`,g.id=`buttonDDI${c}`,C.classList.add("d-flex","flex-column"),O.classList.add("d-flex"),f.classList.add("row"),m.classList.add("d-flex","flex-wrap"),i.classList="col-md-5",d.classList="col-md-5",C.id=`diagramsContainer${c}`;var n=document.getElementById("diagramsContainer");if(!n){console.warn("diagramI: No se encontró el contenedor 'diagramsContainer'.");return}n.appendChild(C),C.appendChild(O),C.appendChild(f),C.appendChild(m),O.appendChild(a),i.appendChild(e),i.appendChild(y),i.appendChild(v),f.appendChild(i),O.appendChild(s),d.appendChild(u),d.appendChild(o),d.appendChild(g),f.appendChild(d),U(a,D),U(s,x),ee(e,v,m,D,x,c,"Izq",y),ee(u,g,m,D,x,c,"Der",o)}}function U(E,c){if(!(!c||c.length===0)){var p=["Combinación 01","Combinación 02 Max","Combinación 02 Min","Combinación 03 Max","Combinación 03 Min","Combinación 04 Max","Combinación 04 Min","Combinación 05 Max","Combinación 05 Min","Combinación 06 Max","Combinación 06 Min","Combinación 07 Max","Combinación 07 Min","Combinación 08 Max","Combinación 08 Min","Combinación 09 Max","Combinación 09 Min"],D=c.map((x,C)=>[p[C],...x]);Handsontable(E,{data:D,rowHeaders:!0,colHeaders:!0,height:"auto",autoWrapRow:!0,autoWrapCol:!0,colWidths:100,nestedHeaders:[["Combinaciones","Pu","Mux","Muy"],["Carga","(Ton)","(Ton.m)","(Ton.m)"]],columns:[{type:"text",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0}],licenseKey:"non-commercial-and-evaluation"})}}function ee(E,c,p,D,x,C,O,f){var m=O=="Izq"?"Dirección X-X":"Dirección Y-Y",a=[[1,0,0,0,0,0,0],[2,0,0,0,0,0,0],[3,0,0,0,0,0,0],[4,0,0,0,0,0,0],[5,0,0,0,0,0,0],[6,0,0,0,0,0,0],[7,0,0,0,0,0,0],[8,0,0,0,0,0,0],[9,0,0,0,0,0,0],[10,0,0,0,0,0,0],[11,0,0,0,0,0,0]],i=Handsontable(E,{data:a,rowHeaders:!0,colHeaders:!0,height:"auto",autoWrapRow:!0,autoWrapCol:!0,colWidths:100,nestedHeaders:[["Incluido "+m],["Puntos","P","M2","M3","P","M2","M3"],["","(Ton)","(Ton.m)","(Ton.m)","(Ton)","(Ton.m)","(Ton.m)"]],columns:[{type:"numeric",readOnly:!0},{type:"numeric"},{type:"numeric"},{type:"numeric"},{type:"numeric"},{type:"numeric"},{type:"numeric"}],afterPaste:function(s,d){s.forEach(function(u,o){var g=d[0].startRow,n=d[0].startCol,t=d[0].endCol;let r=0;for(let l=n;l<=t;l++)i.setDataAtCell(g+o,l,u[r]),r++})},licenseKey:"non-commercial-and-evaluation"}),e=[[1,0,0,0,0,0,0],[2,0,0,0,0,0,0],[3,0,0,0,0,0,0],[4,0,0,0,0,0,0],[5,0,0,0,0,0,0],[6,0,0,0,0,0,0],[7,0,0,0,0,0,0],[8,0,0,0,0,0,0],[9,0,0,0,0,0,0],[10,0,0,0,0,0,0],[11,0,0,0,0,0,0]],y=Handsontable(f,{data:e,rowHeaders:!0,colHeaders:!0,height:"auto",autoWrapRow:!0,autoWrapCol:!0,colWidths:100,nestedHeaders:[["Excluido "+m],["Puntos","P","M2","M3","P","M2","M3"],["","(Ton)","(Ton.m)","(Ton.m)","(Ton)","(Ton.m)","(Ton.m)"]],columns:[{type:"numeric",readOnly:!0},{type:"numeric"},{type:"numeric"},{type:"numeric"},{type:"numeric"},{type:"numeric"},{type:"numeric"}],afterPaste:function(s,d){s.forEach(function(u,o){var g=d[0].startRow,n=d[0].startCol,t=d[0].endCol;let r=0;for(let l=n;l<=t;l++)y.setDataAtCell(g+o,l,u[r]),r++})},licenseKey:"non-commercial-and-evaluation"});c.addEventListener("click",v);function v(){for(var s=!0,d=i.getData(),u=y.getData(),o=0;o<d.length;o++){for(var g=0;g<d[o].length;g++)if(d[o][g]===null||d[o][g]===""){s=!1;break}if(!s)break}s?Ie(p,D,x,d,C,O,u):alert("Hay celdas vacías")}}function Ie(E,c,p,D,x,C,O){var f=document.createElement("div"),m=[],a=[];C=="Izq"?(m=c.map(u=>[u[0],u[1]]),a=p.map(u=>[u[0],u[1]])):(m=c.map(u=>[u[0],u[2]]),a=p.map(u=>[u[0],u[2]]));var i=D.map(u=>[u[4],u[6]]),e=D.map(u=>[u[1],u[3]]),y=O.map(u=>[u[4],u[6]]),v=O.map(u=>[u[1],u[3]]),s=`graph${C}${x}`;if(document.getElementById(s))Le(s,m,a,i,e,y,v);else{var d=document.createElement("canvas");d.id=s,d.width=400,d.height=400,f.appendChild(d),E.appendChild(f),Re(s,d,m,a,i,e,y,v,x,C)}}function Le(E,c,p,D,x,C,O){var f=ne[E];f&&(f.data.datasets[0].data=c.map(m=>({x:m[1],y:m[0]})),f.data.datasets[1].data=p.map(m=>({x:m[1],y:m[0]})),f.data.datasets[2].data=D.map(m=>({x:m[1],y:m[0]})),f.data.datasets[3].data=x.map(m=>({x:m[1],y:m[0]})),f.data.datasets[4].data=C.map(m=>({x:m[1],y:m[0]})),f.data.datasets[5].data=O.map(m=>({x:m[1],y:m[0]})),f.update())}function Re(E,c,p,D,x,C,O,f,m,a){var i=p.map(g=>({x:g[1],y:g[0]})),e=D.map(g=>({x:g[1],y:g[0]})),y=x.map(g=>({x:g[1],y:g[0]})),v=C.map(g=>({x:g[1],y:g[0]})),s=O.map(g=>({x:g[1],y:g[0]})),d=f.map(g=>({x:g[1],y:g[0]})),u={type:"scatter",data:{datasets:[{label:`SC Piso ${m*2-1} (Mux, Pu)`,data:i,borderColor:"blue",backgroundColor:"blue",borderWidth:1},{label:`SC Piso ${m*2} (Mux, Pu)`,data:e,borderColor:"green",backgroundColor:"green",borderWidth:1},{label:"DI Incluido X-X",data:y,borderColor:a=="Izq"?"red":"blue",backgroundColor:a=="Izq"?"red":"blue",borderWidth:0,fill:!1,type:"line"},{label:"DI Incluido Y-Y",data:v,borderColor:a=="Izq"?"red":"blue",backgroundColor:a=="Izq"?"red":"blue",borderWidth:0,fill:!1,type:"line"},{label:"DI Excluido X-X",data:s,borderColor:"green",backgroundColor:"green",borderWidth:0,fill:!1,type:"line"},{label:"DI Excluido Y-Y",data:d,borderColor:"yellow",backgroundColor:"yellow",borderWidth:0,fill:!1,type:"line"}]},options:{responsive:!0,plugins:{title:{display:!0,text:"DIAGRAMA DE INTERACCIÓN"}},scales:{x:{type:"linear",min:-6e3,max:6e3,position:"bottom",title:{display:!0,text:"Eje X"}},y:{type:"linear",min:-1500,max:3500,position:"left",title:{display:!0,text:"Eje Y"}}}}},o=new Chart(c,u);ne[E]=o}function He(E,c,p){if(E){var D=E;D.innerHTML="";var x=[];for(let v=0;v<c.length;v++){var C=p.agVA,O=p.lgxVA,f=3,m=c[v][1],a=O/f*(2*Math.sqrt(p.fcDF*10)+m/C),i=1.2*a,e=[`Piso ${v+1}`,C,O,f,m,a,i,"","",""];x.push(e)}var y=new Handsontable(D,{data:x,rowHeaders:!0,colHeaders:!0,height:"auto",autoWrapRow:!0,autoWrapCol:!0,colWidths:100,nestedHeaders:[["Nivel","Ag","Lgx","Ycg","Pu","Mcr","1.2 x Mucr","Mnx","Mn/Mcr","Verificación"],["","(m²)","(m4)","(m)","(Ton)","(Ton.m)","(Ton.m)","(Ton.m)","","Agrietamiento"]],columns:[{type:"text",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric"},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric"},{type:"text",readOnly:!0}],afterChange:function(v,s){if(s==="edit"){var d=this;v.forEach(function(u){var o=u[0],g=u[1],n=u[3];g===3&&d.setDataAtCell(o,5,d.getDataAtCell(o,2)/n*(2*Math.sqrt(p.fcDF*10)+d.getDataAtCell(o,4)/d.getDataAtCell(o,1))),g==5&&d.setDataAtCell(o,6,1.2*n),g==6&&d.setDataAtCell(o,9,d.getDataAtCell(o,7)>=n?"Sí cumple":"No cumple, verificar"),g===7&&(d.setDataAtCell(o,8,n/d.getDataAtCell(o,5)),d.setDataAtCell(o,9,n>=d.getDataAtCell(o,6)?"Sí cumple":"No cumple, verificar"))})}},afterPaste:function(v,s){v.forEach(function(d,u){var o=s[0].startRow,g=s[0].startCol,n=s[0].endCol;let t=0;for(let r=g;r<=n;r++)y.setDataAtCell(o+u,r,d[t]),t++})},licenseKey:"non-commercial-and-evaluation"})}}function Be(E,c,p){if(E){var D=E;D.innerHTML="";var x=[];for(let v=0;v<c.length;v++){var C=p.agVA,O=p.lgyVA,f=3,m=c[v][1],a=O/f*(2*Math.sqrt(p.fcDF*10)+m/C),i=1.2*a,e=[`Piso ${v+1}`,C,O,f,m,a,i,"","",""];x.push(e)}var y=new Handsontable(D,{data:x,rowHeaders:!0,colHeaders:!0,height:"auto",autoWrapRow:!0,autoWrapCol:!0,colWidths:100,nestedHeaders:[["Nivel","Ag","Lgy","Xcg","Pu","Mcr","1.2 x Mucr","Mny","Mn/Mcr","Verificación"],["","(m²)","(m4)","(m)","(Ton)","(Ton.m)","(Ton.m)","(Ton.m)","","Agrietamiento"]],columns:[{type:"text",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric"},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric"},{type:"text",readOnly:!0}],afterChange:function(v,s){if(s==="edit"){var d=this;v.forEach(function(u){var o=u[0],g=u[1],n=u[3];g===3&&d.setDataAtCell(o,5,d.getDataAtCell(o,2)/n*(2*Math.sqrt(p.fcDF*10)+d.getDataAtCell(o,4)/d.getDataAtCell(o,1))),g==5&&d.setDataAtCell(o,6,1.2*n),g==6&&d.setDataAtCell(o,9,d.getDataAtCell(o,7)>=n?"Sí cumple":"No cumple, verificar"),g===7&&(d.setDataAtCell(o,8,n/d.getDataAtCell(o,5)),d.setDataAtCell(o,9,n>=d.getDataAtCell(o,6)?"Sí cumple":"No cumple, verificar"))})}},afterPaste:function(v,s){v.forEach(function(d,u){var o=s[0].startRow,g=s[0].startCol,n=s[0].endCol;let t=0;for(let r=g;r<=n;r++)y.setDataAtCell(o+u,r,d[t]),t++})},licenseKey:"non-commercial-and-evaluation"})}}function Ne(E,c,p,D){if(E){var x=E;if(x.innerHTML="",!D||D.length===0){alert("Debe completar el diseño por corte en X-X primero");return}var C=[];for(let s=0;s<c.length;s++){var O=D[s][2],f=p.exDF,m=p.agVA,a=1,i=.55*p.designCP*p.fcDF*10*m*(1-Math.pow(a*O/(32*f),2)),e=c[s][1],y=i>=e?"Sí cumple":"No cumple, verificar",v=[`Piso ${s+1}`,O,f,m,"Muros Arriostrados No Restringidos",a,i,e,y];C.push(v)}new Handsontable(x,{data:C,rowHeaders:!0,colHeaders:!0,height:"auto",autoWrapRow:!0,autoWrapCol:!0,colWidths:100,nestedHeaders:[["Nivel","lc","t","Ag","Casos para Definir","k","ØPn","Pu","Verificación"],["","(m)","(m)","(m²)",'Factor de Longitud Efectiva "k"',"","(Ton)","(Ton)","Compresión Pura"]],columns:[{type:"text",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"dropdown",source:["Muros Arriostrados Restringidos","Muros Arriostrados No Restringidos","Muros No Arriostrados"]},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"text"}],afterChange:function(s,d){if(d==="edit"){var u=this;s.forEach(function(o){var g=o[0],n=o[1],t=o[3];if(n===4){var r=t,l=0;r=="Muros Arriostrados Restringidos"?l=.8:r=="Muros Arriostrados No Restringidos"?l=1:r=="Muros No Arriostrados"&&(l=2),u.setDataAtCell(g,5,l)}n==5&&u.setDataAtCell(g,6,.55*p.designCP*p.fcDF*10*u.getDataAtCell(g,3)*(1-Math.pow(t*u.getDataAtCell(g,1)/(32*u.getDataAtCell(g,2)),2))),n==6&&u.setDataAtCell(g,8,t>=u.getDataAtCell(g,7)?"Sí cumple":"No cumple, verificar")})}},licenseKey:"non-commercial-and-evaluation"})}}function Pe(E,c,p,D){if(E){var x=E;if(x.innerHTML="",!D||D.length===0){alert("Debe completar el diseño por corte en Y-Y primero");return}var C=[];for(let s=0;s<c.length;s++){var O=D[s][2],f=p.eyDF,m=p.agVA,a=1,i=.55*p.designCP*p.fcDF*10*m*(1-Math.pow(a*O/(32*f),2)),e=c[s][1],y=i>=e?"Sí cumple":"No cumple, verificar",v=[`Piso ${s+1}`,O,f,m,"Muros Arriostrados No Restringidos",a,i,e,y];C.push(v)}new Handsontable(x,{data:C,rowHeaders:!0,colHeaders:!0,height:"auto",autoWrapRow:!0,autoWrapCol:!0,colWidths:100,nestedHeaders:[["Nivel","lc","t","Ag","Casos para Definir","k","ØPn","Pu","Verificación"],["","(m)","(m)","(m²)",'Factor de Longitud Efectiva "k"',"","(Ton)","(Ton)","Compresión Pura"]],columns:[{type:"text",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"dropdown",source:["Muros Arriostrados Restringidos","Muros Arriostrados No Restringidos","Muros No Arriostrados"]},,{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"text"}],afterChange:function(s,d){if(d==="edit"){var u=this;s.forEach(function(o){var g=o[0],n=o[1],t=o[3];if(n===4){var r=t,l=0;r=="Muros Arriostrados Restringidos"?l=.8:r=="Muros Arriostrados No Restringidos"?l=1:r=="Muros No Arriostrados"&&(l=2),u.setDataAtCell(g,5,l)}n==5&&u.setDataAtCell(g,6,.55*p.designCP*p.fcDF*10*u.getDataAtCell(g,3)*(1-Math.pow(t*u.getDataAtCell(g,1)/(32*u.getDataAtCell(g,2)),2))),n==6&&u.setDataAtCell(g,8,t>=u.getDataAtCell(g,7)?"Sí cumple":"No cumple, verificar")})}},licenseKey:"non-commercial-and-evaluation"})}}var Q=[];function Ve(E,c,p,D,x){if(!E)return;var C=E;if(C.innerHTML="",!D||D.length===0){alert("Debe completar el diseño por flexión en X-X primero");return}var O=[];for(let y=0;y<c.length;y++){var f=1,m=.6,a=[`Piso ${y+1}`,"Peso Normal",f,"Caso III",m,"","",D[y][3],D[y][3]*p.exDF*100*100,""];O.push(a)}var i=new Handsontable(C,{data:O,rowHeaders:!0,colHeaders:!0,height:"auto",autoWrapRow:!0,autoWrapCol:!0,colWidths:100,nestedHeaders:[["Nivel","Tipo","λ","Casos según","μ","Pcm","Nu","ρv","Av","ØVn"],["","Concreto",""," Artículo 11.7.4.3.","","(Ton)","(Ton)","","(cm²)","(Ton)"]],columns:[{type:"text",readOnly:!0},{type:"dropdown",source:["Peso Normal","Liviano - Arena de Peso Normal","Liviano"]},{type:"numeric",readOnly:!0},{type:"dropdown",source:["Caso I","Caso II","Caso III","Caso IV"]},{type:"numeric",readOnly:!0},{type:"numeric"},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0}],afterChange:function(y,v){if(v==="edit"){var s=this;y.forEach(function(d){var u=d[0],o=d[1],g=d[3];if(o===1){var n=g,t=0;n=="Peso Normal"?t=1:n=="Liviano - Arena de Peso Normal"?t=.75:n=="Liviano"&&(t=.85),s.setDataAtCell(u,2,t)}if(o==2){var t=g,r=s.getDataAtCell(u,3),l=0;r=="Caso I"?l=1.4*t:r=="Caso II"?l=t:r=="Caso III"?l=.6*t:r=="Caso IV"&&(l=.7*t),s.setDataAtCell(u,4,l)}if(o==3){var r=g,l=0;r=="Caso I"?l=1.4*s.getDataAtCell(u,2):r=="Caso II"?l=s.getDataAtCell(u,2):r=="Caso III"?l=.6*s.getDataAtCell(u,2):r=="Caso IV"&&(l=.7*s.getDataAtCell(u,2)),s.setDataAtCell(u,4,l)}o==4&&s.setDataAtCell(u,9,p.designDC*g*(s.getDataAtCell(u,6)+s.getDataAtCell(u,8)*p.fyDF/1e3)),o==5&&s.setDataAtCell(u,6,.9*g),o==6&&s.setDataAtCell(u,9,p.designDC*s.getDataAtCell(u,4)*(g+s.getDataAtCell(u,8)*p.fyDF/1e3)),o==8&&s.setDataAtCell(u,9,p.designDC*s.getDataAtCell(u,4)*(s.getDataAtCell(u,6)+g*p.fyDF/1e3))})}},afterPaste:function(y,v){console.log(y),console.log(v),y.forEach(function(s,d){var u=v[0].startRow,o=v[0].startCol,g=v[0].endCol;let n=0;for(let t=o;t<=g;t++)i.setDataAtCell(u+d,t,s[n]),n++})},licenseKey:"non-commercial-and-evaluation"});document.getElementById("saveDataBtnDD1X").addEventListener("click",e);function e(){Q=i.getData();var y=document.getElementById("ddT2X");We(y,c,Q,p);var v=document.getElementById("ddT1Y");Se(v,c,p,Q,x)}}function We(E,c,p,D){var x=E,C=[];for(let s=0;s<c.length;s++){var O=D.agVA,f=.2*D.fcDF*O*10,m=55*O,a=Math.min(f,m),i=a>=p[s][9]?"Sí cumple":"No cumple, verificar",e=Math.min(p[s][9],a),y=e>=c[s][2]?"Sí cumple, no hay deslizamiento":"No cumple, verificar",v=[`Piso ${s+1}`,O,f,m,a,i,e,c[s][2],y];C.push(v)}new Handsontable(x,{data:C,rowHeaders:!0,colHeaders:!0,height:"auto",autoWrapRow:!0,autoWrapCol:!0,colWidths:100,nestedHeaders:[["Nivel","Ac","Vn máx 1","Vn máx 2","Vn máx","Verificación","ØVn","Vu máx","Juntas"],["","(m²)","(Ton)","(Ton)","(Ton)",'"Vn" Máximo',"(Ton)","(Ton)","Construcción"]],columns:[{type:"text",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"text",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"text",readOnly:!0}],licenseKey:"non-commercial-and-evaluation"})}var te=[];function Se(E,c,p,D,x){if(!E)return;var C=E;C.innerHTML="";var O=[];for(let o=0;o<c.length;o++){var f=1,m=.6,a=D[o][5],i=.9*D[o][5],e=x[o][3],y=e*p.eyDF*100*100,v=p.designDC*m*(i+y*p.fyDF/1e3),s=[`Piso ${o+1}`,"Peso Normal",f,"Caso III",m,a,i,e,y,v];O.push(s)}var d=new Handsontable(C,{data:O,rowHeaders:!0,colHeaders:!0,height:"auto",autoWrapRow:!0,autoWrapCol:!0,colWidths:100,nestedHeaders:[["Nivel","Tipo","λ","Casos","μ","Pcm","Nu","ρv","Av","ØVn"],["","Concreto","","Artículo 11.7.4.3.","","(Ton)","(Ton)","","(cm²)","(Ton)"]],columns:[{type:"text",readOnly:!0},{type:"dropdown",source:["Peso Normal","Liviano - Arena de Peso Normal","Liviano"]},{type:"numeric",readOnly:!0},{type:"dropdown",source:["Caso I","Caso II","Caso III","Caso IV"]},{type:"numeric",readOnly:!0},{type:"numeric"},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0}],afterChange:function(o,g){if(g==="edit"){var n=this;o.forEach(function(t){var r=t[0],l=t[1],w=t[3];if(l===1){var F=w,A=0;F=="Peso Normal"?A=1:F=="Liviano - Arena de Peso Normal"?A=.75:F=="Liviano"&&(A=.85),n.setDataAtCell(r,2,A)}if(l==2){var A=w,T=n.getDataAtCell(r,3),b=0;T=="Caso I"?b=1.4*A:T=="Caso II"?b=A:T=="Caso III"?b=.6*A:T=="Caso IV"&&(b=.7*A),n.setDataAtCell(r,4,b)}if(l==3){var T=w,b=0;T=="Caso I"?b=1.4*n.getDataAtCell(r,2):T=="Caso II"?b=n.getDataAtCell(r,2):T=="Caso III"?b=.6*n.getDataAtCell(r,2):T=="Caso IV"&&(b=.7*n.getDataAtCell(r,2)),n.setDataAtCell(r,4,b)}l==4&&n.setDataAtCell(r,9,p.designDC*w*(n.getDataAtCell(r,6)+n.getDataAtCell(r,8)*p.fyDF/1e3)),l==5&&n.setDataAtCell(r,6,.9*w),l==6&&n.setDataAtCell(r,9,p.designDC*n.getDataAtCell(r,4)*(w+n.getDataAtCell(r,8)*p.fyDF/1e3)),l==8&&n.setDataAtCell(r,9,p.designDC*n.getDataAtCell(r,4)*(n.getDataAtCell(r,6)+w*p.fyDF/1e3))})}},afterPaste:function(o,g){console.log(o),console.log(g),o.forEach(function(n,t){var r=g[0].startRow,l=g[0].startCol,w=g[0].endCol;let F=0;for(let A=l;A<=w;A++)d.setDataAtCell(r+t,A,n[F]),F++})},licenseKey:"non-commercial-and-evaluation"});document.getElementById("saveDataBtnDD1Y").addEventListener("click",u);function u(){te=d.getData();var o=document.getElementById("ddT2Y");ke(o,c,te,p)}}function ke(E,c,p,D){var x=E,C=[];for(let s=0;s<c.length;s++){var O=D.agVA,f=.2*D.fcDF*O*10,m=55*O,a=Math.min(f,m),i=a>=p[s][9]?"Sí cumple":"No cumple, verificar",e=Math.min(p[s][9],a),y=e>=c[s][4]?"Sí cumple, no hay deslizamiento":"No cumple, verificar",v=[`Piso ${s+1}`,O,f,m,a,i,e,c[s][4],y];C.push(v)}new Handsontable(x,{data:C,rowHeaders:!0,colHeaders:!0,height:"auto",autoWrapRow:!0,autoWrapCol:!0,colWidths:100,nestedHeaders:[["Nivel","Ac","Vn máx 1","Vn máx 2","Vn máx","Verificación","ØVn","Vu máx","Juntas"],["","(m²)","(Ton)","(Ton)","(Ton)",'"Vn" Máximo',"(Ton)","(Ton)","Construcción"]],columns:[{type:"text",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"text",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"text",readOnly:!0}],licenseKey:"non-commercial-and-evaluation"})}var ae=[];function Xe(E,c,p){if(!E)return;var D=E;D.innerHTML="";var x=[];for(let o=0;o<p.length;o++){var C=p[o][2],O=.3,f=1,m=.3,a=m+4*O,i=a*O,e=.55*c.designCP*c.fcDF*i*Math.pow(100,2)*(1-Math.pow(f*C/(32*O),2))/1e3,y=118.09,v=e>=y?"Sí cumple":"No cumple, verificar",s=[`Piso ${o+1}`,C,O,"Muros Arriostrados No Restringidos",f,m,a,i,e,y,v];x.push(s)}var d=new Handsontable(D,{data:x,rowHeaders:!0,colHeaders:!0,height:"auto",autoWrapRow:!0,autoWrapCol:!0,colWidths:100,nestedHeaders:[["Nivel","lc","emuro","Casos para Definir","k","Bviga","Befectivo","Ag","ØPn","Pu","Verificación"],["","(m)","(m)",'Factor de Longitud Efectiva "k"',"","(m)","(m)","(m²)","(Ton)","(Ton)","Espesor del Muro"]],columns:[{type:"text",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric"},{type:"dropdown",source:["Muros Arriostrados Restringidos","Muros Arriostrados No Restringidos","Muros No Arriostrados"]},{type:"numeric",readOnly:!0},{type:"numeric"},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric"},{type:"text",readOnly:!0}],afterChange:function(o,g){if(g==="edit"){var n=this;o.forEach(function(t){var r=t[0],l=t[1],w=t[3];if(l==2&&n.setDataAtCell(r,6,n.getDataAtCell(r,5)+4*w),l==3){var F=w,A=0;F=="Muros Arriostrados Restringidos"?A=.8:F=="Muros Arriostrados No Restringidos"?A=1:F=="Muros No Arriostrados"&&(A=2),n.setDataAtCell(r,4,A)}l==4&&n.setDataAtCell(r,8,.55*c.designCP*c.fcDF*n.getDataAtCell(r,7)*Math.pow(100,2)*(1-Math.pow(w*n.getDataAtCell(r,1)/(32*n.getDataAtCell(r,2)),2))/1e3),l==5&&n.setDataAtCell(r,6,w+4*n.getDataAtCell(r,2)),l==6&&n.setDataAtCell(r,7,w*n.getDataAtCell(r,2)),l==7&&n.setDataAtCell(r,8,.55*c.designCP*c.fcDF*w*Math.pow(100,2)*(1-Math.pow(n.getDataAtCell(r,4)*n.getDataAtCell(r,1)/(32*n.getDataAtCell(r,2)),2))/1e3),l==8&&n.setDataAtCell(r,10,w>=n.getDataAtCell(r,9)?"Sí cumple":"No cumple, verificar"),l==9&&n.setDataAtCell(r,10,n.getDataAtCell(r,8)>=w?"Sí cumple":"No cumple, verificar")})}},afterPaste:function(o,g){console.log(o),console.log(g),o.forEach(function(n,t){var r=g[0].startRow,l=g[0].startCol,w=g[0].endCol;let F=0;for(let A=l;A<=w;A++)d.setDataAtCell(r+t,A,n[F]),F++})},licenseKey:"non-commercial-and-evaluation"});document.getElementById("saveDataBtnEL1X").addEventListener("click",u);function u(){ae=d.getData();var o=document.getElementById("elT2");Ye(o,ae)}}function Ye(E,c){var p=E,D=[];for(let a=0;a<c.length;a++){var x="Sí",C=x=="Sí"?c[a][5]+.1:"-",O=x=="Sí"?"Diseña Sección como si Fuera una Columna":"No Diseñar y/o Verificar",f=[`Piso ${a+1}`,x,C,O];D.push(f)}var m=new Handsontable(p,{data:D,rowHeaders:!0,colHeaders:!0,height:"auto",autoWrapRow:!0,autoWrapCol:!0,colWidths:100,colHeaders:["Nivel","¿Se Aplica Diseño?","Bcol (m)","Aplicación del Diseño según Artículo 21.9.3.5."],columns:[{type:"text",readOnly:!0},{type:"dropdown",source:["Sí","No"]},{type:"numeric",readOnly:!0},{type:"text",readOnly:!0}],afterChange:function(a,i){if(i==="edit"){var e=this;a.forEach(function(y){var v=y[0],s=y[1],d=y[3];if(s==1){var u=d,o=0,g="";u=="Sí"?(o=c[v][5]+.1,g="Diseña Sección como si Fuera una Columna"):u=="No"&&(o="-",g="No Diseñar y/o Verificar"),e.setDataAtCell(v,2,o),e.setDataAtCell(v,3,g)}})}},afterPaste:function(a,i){console.log(a),console.log(i),a.forEach(function(e,y){var v=i[0].startRow,s=i[0].startCol,d=i[0].endCol;let u=0;for(let o=s;o<=d;o++)m.setDataAtCell(v+y,o,e[u]),u++})},licenseKey:"non-commercial-and-evaluation"})}document.addEventListener("DOMContentLoaded",function(){var E=document.getElementsByClassName("collapsible-btn"),c;for(c=0;c<E.length;c++)E[c].addEventListener("click",function(){var n=this.getAttribute("data-target"),t=document.getElementById(n);t&&t.classList.toggle("d-none")});var p=document.getElementById("solicitudCargaT1");le(p);var D=280,x=.9,C=1500*Math.sqrt(D),O=2.1*Math.pow(10,6),f=.003,m=.85,a=`<form id="generalForm" class="mt-2" met   d="post">
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
      <div class="text-gray-950 dark:text-white" id="generalSelectText">Ø ${x}</div>
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
            placeholder="${f}"
            min="0"
            step="any"
            value="${f}"
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
            placeholder="${m}"
            min="0"
            step="any"
            value="${m}"
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
  </form>`;function i(){const n=document.getElementById("toggleFormButton"),t=document.getElementById("formContainer"),r=document.getElementById("formColumn"),l=document.getElementById("resultadosContainer"),w=n.querySelector("i");function F(){r.classList.toggle("col-md-2"),r.classList.toggle("col-md-1"),l.classList.toggle("col-md-10"),l.classList.toggle("col-md-11"),w.classList.toggle("fa-chevron-left"),w.classList.toggle("fa-chevron-right")}function A(){t.style.display="none",w.classList.add("d-none"),r.classList.contains("col-md-2")&&F()}function T(){setTimeout(function(){t.style.display="block",w.classList.remove("d-none"),F()},100)}n.addEventListener("click",function(){t.style.display=t.style.display==="none"?"block":"none",F()}),window.addEventListener("beforeprint",A),window.addEventListener("afterprint",T)}i();var e=document.getElementById("formContainer");e.innerHTML=a;var y=document.getElementById("lxDF");y.addEventListener("input",function(n){document.getElementById("dxDF").value=(.8*parseFloat(this.value)).toFixed(2),document.getElementById("lnucxDF").value=(parseFloat(this.value)-2*parseFloat(document.getElementById("zcxDF").value)).toFixed(2)});var v=document.getElementById("lyDF");v.addEventListener("input",function(n){document.getElementById("dyDF").value=(.8*parseFloat(this.value)).toFixed(2),document.getElementById("lnucyDF").value=(parseFloat(this.value)-2*parseFloat(document.getElementById("zCyDF").value)).toFixed(2)});var s=document.getElementById("generalSelect");s.addEventListener("change",function(n){document.getElementById("generalSelectText").innerHTML=`Ø ${this.value}`,x=parseFloat(this.value),x==.85?(document.getElementById("acwyDC").classList.remove("d-none"),document.getElementById("acwxDC").classList.remove("d-none")):(document.getElementById("acwyDC").classList.add("d-none"),document.getElementById("acwxDC").classList.add("d-none"))});var d=document.getElementById("fcDF");d.addEventListener("input",function(n){document.getElementById("ecDF").value=(15e3*Math.sqrt(parseFloat(this.value))).toFixed(2),document.getElementById("β1DF").value=(parseFloat(this.value)<=280?.85:parseFloat(this.value)<=350?.8:parseFloat(this.value)<=420?.75:parseFloat(this.value)<=490?.7:.65).toFixed(2)}),oe();var u=document.getElementById("generalForm");u.addEventListener("submit",function(n){n.preventDefault();var t=new FormData(this),r={};for(var l of t.entries())r[l[0]]=l[1];var w=j.map(I=>[I[0],I[2],I[5]]);if(r.generalSelect==.9){var F=document.getElementById("flexDesingT1X"),A=document.getElementById("flexDesingT1Y");ue(F,X,r),me(A,X,r),document.getElementById("content2").classList.remove("d-none"),document.getElementById("content3").classList.add("d-none"),document.getElementById("content4").classList.add("d-none"),document.getElementById("content5").classList.add("d-none"),document.getElementById("content6").classList.add("d-none"),document.getElementById("content7").classList.add("d-none"),document.getElementById("content8").classList.add("d-none")}else if(r.generalSelect==.85){var F=document.getElementById("cutDesingT1X"),A=document.getElementById("cutDesingT1Y");ve(F,X,r),De(A,X,r),document.getElementById("content2").classList.add("d-none"),document.getElementById("content3").classList.remove("d-none"),document.getElementById("content4").classList.add("d-none"),document.getElementById("content5").classList.add("d-none"),document.getElementById("content6").classList.add("d-none"),document.getElementById("content7").classList.add("d-none"),document.getElementById("content8").classList.add("d-none")}else if(r.generalSelect==0){var F=document.getElementById("diT1X"),A=document.getElementById("diT1Y");if(!N||N.length===0){alert("Llene datos en la tabla 1 X-X de diseño corte");return}if(!W||W.length===0){alert("Llene datos en la tabla 1 Y-Y de diseño corte");return}if(!_||_.length===0){alert("Llene datos en la tabla 2 X-X de diseño flexión");return}if(!G||G.length===0){alert("Llene datos en la tabla 2 Y-Y de diseño flexión");return}if(!q||q.length===0){alert("Llene datos en la tabla 3 X-X de diseño corte");return}if(!z||z.length===0){alert("Llene datos en la tabla 3 Y-Y de diseño corte");return}Oe(F,X,N,_,q,r),Te(A,X,W,G,z,r),he(w);var T=document.getElementById("diagramsCard");T&&(T.style.display=w&&w.length>0?"block":"none"),document.getElementById("content2").classList.add("d-none"),document.getElementById("content3").classList.add("d-none"),document.getElementById("content4").classList.remove("d-none"),document.getElementById("content5").classList.add("d-none"),document.getElementById("content6").classList.add("d-none"),document.getElementById("content7").classList.add("d-none"),document.getElementById("content8").classList.add("d-none")}else if(r.generalSelect==1){document.getElementById("content2").classList.add("d-none"),document.getElementById("content3").classList.add("d-none"),document.getElementById("content4").classList.add("d-none"),document.getElementById("content5").classList.remove("d-none"),document.getElementById("content6").classList.add("d-none"),document.getElementById("content7").classList.add("d-none"),document.getElementById("content8").classList.add("d-none");var F=document.getElementById("vaT1X"),A=document.getElementById("vaT1Y");He(F,X,r),Be(A,X,r)}else if(r.generalSelect==2){document.getElementById("content2").classList.add("d-none"),document.getElementById("content3").classList.add("d-none"),document.getElementById("content4").classList.add("d-none"),document.getElementById("content5").classList.add("d-none"),document.getElementById("content6").classList.remove("d-none"),document.getElementById("content7").classList.add("d-none"),document.getElementById("content8").classList.add("d-none");var F=document.getElementById("dcpT1X"),A=document.getElementById("dcpT1Y");Ne(F,X,r,N),Pe(A,X,r,N)}else if(r.generalSelect==3){var F=document.getElementById("ddT1X"),A=document.getElementById("ddT1Y");document.getElementById("content2").classList.add("d-none"),document.getElementById("content3").classList.add("d-none"),document.getElementById("content4").classList.add("d-none"),document.getElementById("content5").classList.add("d-none"),document.getElementById("content6").classList.add("d-none"),document.getElementById("content7").classList.remove("d-none"),document.getElementById("content8").classList.add("d-none"),Ve(F,X,r,q,z)}else if(r.generalSelect==4){var b=document.getElementById("elT1");document.getElementById("content2").classList.add("d-none"),document.getElementById("content3").classList.add("d-none"),document.getElementById("content4").classList.add("d-none"),document.getElementById("content5").classList.add("d-none"),document.getElementById("content6").classList.add("d-none"),document.getElementById("content7").classList.add("d-none"),document.getElementById("content8").classList.remove("d-none"),Xe(b,r,N)}});function o(n){const t=n.cloneNode(!0),r=n.querySelectorAll("input, select, textarea"),l=t.querySelectorAll("input, select, textarea");return r.forEach((w,F)=>{const A=l[F];A&&(w.tagName==="INPUT"&&(A.value=w.value,A.setAttribute("value",w.value),(w.type==="checkbox"||w.type==="radio")&&(A.checked=w.checked,w.checked?A.setAttribute("checked","checked"):A.removeAttribute("checked"))),w.tagName==="TEXTAREA"&&(A.value=w.value,A.textContent=w.value),w.tagName==="SELECT"&&(A.value=w.value,Array.from(A.options).forEach(T=>{T.value===w.value?(T.selected=!0,T.setAttribute("selected","selected")):(T.selected=!1,T.removeAttribute("selected"))})))}),t}async function g(n,t){const r=document.getElementById(n);if(!r){alert(`No existe el bloque con id "${n}"`);return}if(r.innerHTML.trim()===""){alert("El bloque está vacío.");return}const l=r.classList.contains("hidden")||r.classList.contains("d-none")||getComputedStyle(r).display==="none";l&&(r.classList.remove("hidden","d-none"),r.style.display="block"),await new Promise(A=>setTimeout(A,400));const w=o(r);w.querySelectorAll("button").forEach(A=>{A.style.display="none"});const F=document.createElement("div");F.style.position="fixed",F.style.left="-99999px",F.style.top="0",F.style.background="#ffffff",F.style.padding="16px",F.style.zIndex="-1",F.style.width="max-content",F.style.height="auto",F.style.overflow="visible",w.style.display="block",w.style.maxHeight="none",w.style.height="auto",w.style.overflow="visible",w.style.maxWidth="none",w.style.width="max-content",w.style.backgroundColor="#ffffff",w.style.color="#000000",w.querySelectorAll("*").forEach(A=>{A.style.maxHeight="none",A.style.height="auto",A.style.overflow="visible",A.style.maxWidth="none"}),w.querySelectorAll(".wtBorder").forEach(A=>{A.style.display="none"}),w.querySelectorAll(".handsontable, .ht_master, .wtHolder, .wtHider, .wtSpreader, .table-container").forEach(A=>{A.style.overflow="visible",A.style.height="auto",A.style.maxHeight="none",A.style.maxWidth="none",A.style.width="max-content",A.style.backgroundColor="#111827"}),w.querySelectorAll("td, th, .htCore td, .htCore th").forEach(A=>{A.style.borderColor="#374151"}),w.querySelectorAll("table").forEach(A=>{A.style.width="max-content",A.style.maxWidth="none",A.style.tableLayout="auto",A.style.borderCollapse="collapse"}),F.appendChild(w),document.body.appendChild(F);try{await new Promise(b=>setTimeout(b,500));const A=await re(F,{scale:2.5,useCORS:!0,backgroundColor:"#ffffff",logging:!1,scrollX:0,scrollY:0,windowWidth:F.scrollWidth,windowHeight:F.scrollHeight}),T=document.createElement("a");T.href=A.toDataURL("image/png"),T.download=`${t}.png`,document.body.appendChild(T),T.click(),document.body.removeChild(T)}catch(A){console.error(A),alert("Error al capturar.")}finally{document.body.removeChild(F),l&&(r.style.display="",r.classList.add("d-none"))}}document.querySelectorAll(".btn-captura-bloque").forEach(n=>{n.addEventListener("click",async function(){const t=this.dataset.target,r=this.dataset.name,l=this.textContent;try{this.disabled=!0,this.textContent="Generando...",await g(t,r)}finally{this.disabled=!1,this.textContent=l}})})});
