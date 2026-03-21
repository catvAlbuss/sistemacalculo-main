var G=[],$=[],H=[];function U(b){var o=[["Piso 1","","","","","",""]],y=b,A=new Handsontable(y,{data:o,rowHeaders:!0,colHeaders:!0,height:"auto",autoWrapRow:!0,autoWrapCol:!0,colWidths:100,nestedHeaders:[["Nivel","Vx Piso","Vx Elemento","Ratio","Verif. de Redundancia","Vy Piso","Vy Elemento","Ratio","Verif. de Redundancia"],["","(Ton)","(Ton)","(Vx)","(Vx)","(Ton)","(Ton)","(Vy)","(Vy)"]],columns:[{type:"text",readOnly:!0},{type:"numeric"},{type:"numeric"},{type:"numeric",readOnly:!0},{type:"text",readOnly:!0},{type:"numeric"},{type:"numeric"},{type:"numeric",readOnly:!0},{type:"text",readOnly:!0}],minSpareRows:1,beforePaste:function(x,m){var u=x.length+m[0].startRow;A.countRows<u&&A.alter("insert_row_above",u-A.countRows(),x.length)},afterChange:function(x,m){if(m==="edit"){var u=this;x.forEach(function(a){var i=a[0],e=a[1];if(e===1||e===2){var s=u.getDataAtCell(i,1),t=u.getDataAtCell(i,2),r=t!==0?t/s:0;u.setDataAtCell(i,3,r.toFixed(2));var n=r>=.3?"Diseñar para el 125% del Sismo":"No Diseñar para el 125% del Sismo";u.setDataAtCell(i,4,n)}if(e===5||e===6){var c=u.getDataAtCell(i,5),l=u.getDataAtCell(i,6),g=l!==0?l/c:0;u.setDataAtCell(i,7,g.toFixed(2));var d=g>=.3?"Diseñar para el 125% del Sismo":"No Diseñar para el 125% del Sismo";u.setDataAtCell(i,8,d)}})}},afterPaste:function(x,m){var u=x.length+m[0].startRow,a=A.countRows()-1;if(a<u)for(var i=m[0].startRow;i<u;i++){var e=i+1;A.setDataAtCell(i,0,"Piso "+e)}console.log(x),console.log(m),x.forEach(function(s,t){var r=m[0].startRow;m[0].endRow;var n=m[0].startCol,c=m[0].endCol,l=n===c;l?(n===1||n===2||n===5||n===6)&&C(r+t,s,n):C(r+t,s,n,c)})},licenseKey:"non-commercial-and-evaluation"});function C(x,m,u,a=0){a===0?A.setDataAtCell(x,u,m[0]):(A.setDataAtCell(x,u,m[0]),A.setDataAtCell(x,a,m[1]))}document.getElementById("saveDataBtn1").addEventListener("click",v);function v(){if(G=A.getData(),console.log("Datos de la tabla 1:",G),G.length>1){var x=document.getElementById("solicitudCargaT2");G.pop(),ee(x,G.length)}}}function ee(b,o){var y=b,A=[];for(let m=1;m<=o;m++){var C=[[m,"PL-01","1.40CM+1.70CV"],[m,"PL-01","1.25(CM+CV)+CSx Max"],[m,"PL-01","1.25(CM+CV)+CSx Min"],[m,"PL-01","1.25(CM+CV)+CSy Max"],[m,"PL-01","1.25(CM+CV)+CSy Min"],[m,"PL-01","1.25(CM+CV)-CSx Max"],[m,"PL-01","1.25(CM+CV)-CSx Min"],[m,"PL-01","1.25(CM+CV)-CSy Max"],[m,"PL-01","1.25(CM+CV)-CSy Min"],[m,"PL-01","0.90CM+CSx Max"],[m,"PL-01","0.90CM+CSx Min"],[m,"PL-01","0.90CM+CSy Max"],[m,"PL-01","0.90CM+CSy Min"],[m,"PL-01","0.90CM-CSx Max"],[m,"PL-01","0.90CM-CSx Min"],[m,"PL-01","0.90CM-CSy Max"],[m,"PL-01","0.90CM-CSy Min"]];C.map(u=>A.push(u))}var v=new Handsontable(y,{data:A,rowHeaders:!0,colHeaders:!0,height:"auto",autoWrapRow:!0,autoWrapCol:!0,colWidths:100,nestedHeaders:[["Piso","Placa","Combinaciones","Pu","V2","V3","T","M2","M3 ","Pux","Vux","Mux","Puy","Vuy","Muy"],["","","Carga","(Ton)","(Ton)","(Ton)","(Ton.m)","(Ton.m)","(Ton.m)","(Ton)","(Ton)","(Ton.m)","(Ton)","(Ton)","(Ton.m)"]],columns:[{type:"text"},{type:"text",readOnly:!0},{type:"text"},{type:"numeric"},{type:"numeric"},{type:"numeric"},{type:"numeric"},{type:"numeric"},{type:"numeric"},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0}],afterChange:function(m,u){if(u==="edit"){var a=this;m.forEach(function(i){var e=i[0],s=i[1];s===3&&(a.setDataAtCell(e,9,-a.getDataAtCell(e,s)),a.setDataAtCell(e,12,-a.getDataAtCell(e,s))),s===4&&a.setDataAtCell(e,10,a.getDataAtCell(e,s)),s===5&&a.setDataAtCell(e,13,a.getDataAtCell(e,s)),s===7&&a.setDataAtCell(e,14,a.getDataAtCell(e,s)),s===8&&a.setDataAtCell(e,11,a.getDataAtCell(e,s))})}},afterPaste:function(m,u){m.forEach(function(a,i){var e=u[0].startRow;u[0].endRow;var s=u[0].startCol,t=u[0].endCol;let r=0;for(let n=s;n<=t;n++)v.setDataAtCell(e+i,n,a[r]),r++})},licenseKey:"non-commercial-and-evaluation"});document.getElementById("saveDataBtn2").addEventListener("click",x);function x(){$=v.getData(),$=$.map(u=>u.slice(-6));var m=document.getElementById("solicitudCargaT3");te(m,$,$.length)}}function te(b,o){var y=b,A=[],C=0,v=0,x=0,m=0,u=0;o.map((e,s)=>{if(C=Math.max(C,e[0]),v=Math.max(v,e[1]),x=Math.max(x,e[2]),m=Math.max(m,e[4]),u=Math.max(u,e[5]),(s+1)%17==0){var t=[];t.push("Piso "+(s+1)/17),t.push(C),t.push(v),t.push(x),t.push(m),t.push(u),console.log(t),A.push(t),C=0,v=0,x=0,m=0,u=0}});var a=new Handsontable(y,{data:A,rowHeaders:!0,colHeaders:!0,height:"auto",autoWrapRow:!0,autoWrapCol:!0,colWidths:100,nestedHeaders:[["Nivel","Pu máx","Vux máx","Mux máx","Vuy máx","Muy máx"],["","(Ton)","(Ton)","(Ton.m)","(Ton)","(Ton.m)"]],columns:[{type:"text",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0}],licenseKey:"non-commercial-and-evaluation"});function i(){H=a.getData(),console.log("Datos de la tabla 3:",H)}setTimeout(i,1e3)}function ae(){const b=document.getElementById("toggleButton"),o=document.getElementById("contenedor_dcc"),y=document.getElementById("calccargars"),A=document.getElementById("contenedor_cc");b.addEventListener("click",function(){o.style.display=o.style.display==="block"?"none":"block";const C=b.querySelector("i");o.style.display==="block"?(C.classList.remove("fa-eye-slash"),C.classList.add("fa-eye")):(C.classList.remove("fa-eye"),C.classList.add("fa-eye-slash"))}),y.addEventListener("click",function(){A.style.display=A.style.display==="block"?"none":"block";const C=y.querySelector("i");A.style.display==="block"?(C.classList.remove("fa-eye-slash"),C.classList.add("fa-eye")):(C.classList.remove("fa-eye"),C.classList.add("fa-eye-slash"))})}var Y=[],X=[],W=[];function ne(b,o,y){var A=b,C=[];for(let u=0;u<o.length;u++){var v=[`Piso ${u+1}`,y.lxDF,"","","","","",o[u][3],"",""];C.push(v)}var x=new Handsontable(A,{data:C,rowHeaders:!0,colHeaders:!0,height:"auto",autoWrapRow:!0,autoWrapCol:!0,colWidths:100,nestedHeaders:[["Nivel","lm","h","hm","hm/lm","Tipo","Tipo","Mu","z","As"],["","(m)","(m)","(m)","","Muro","Falla Muro","(Ton.m)","(m)","(cm²)"]],columns:[{type:"text",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric"},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"text",readOnly:!0},{type:"text",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0}],afterChange:function(u,a){if(a==="edit"){var i=this;u.forEach(function(e){var s=e[0],t=e[1],r=e[3];if(t===2){var n=r,c=0;for(let p=0;p<i.countRows();p++)c+=i.getDataAtCell(p,2);s==0?i.setDataAtCell(s,3,c):(i.setDataAtCell(0,3,c),i.setDataAtCell(s,3,i.getDataAtCell(s-1,3)-n))}if(t===3){s+1<i.countRows()&&i.setDataAtCell(s+1,3,i.getDataAtCell(s,3)-i.getDataAtCell(s+1,2));var l=r/i.getDataAtCell(s,1);i.setDataAtCell(s,4,l)}if(t==4){var g=r>1?"Muro Esbelto":"Muro No Esbelto";i.setDataAtCell(s,5,g);var d=r>1?"Por Flexión":"Por Corte";i.setDataAtCell(s,6,d);var D=0;r>1?D=.9*i.getDataAtCell(s,1):.5<=r&&r<=1?D=.4*i.getDataAtCell(s,1)*(1+r):D=1.2*i.getDataAtCell(s,2),i.setDataAtCell(s,8,D)}if(t==7){var f=r*Math.pow(10,5)/(y.designDF*y.fyDF*i.getDataAtCell(s,8)*100);i.setDataAtCell(s,9,f)}if(t==8){var f=i.getDataAtCell(s,7)*Math.pow(10,5)/(y.designDF*y.fyDF*r*100);i.setDataAtCell(s,9,f)}})}},afterPaste:function(u,a){console.log(u),console.log(a),u.forEach(function(i,e){var s=a[0].startRow,t=a[0].startCol,r=a[0].endCol;let n=0;for(let c=t;c<=r;c++)x.setDataAtCell(s+e,c,i[n]),n++})},licenseKey:"non-commercial-and-evaluation"});document.getElementById("saveDataBtnDF1X").addEventListener("click",m);function m(){var u=!0;W=x.getData();for(var a=0;a<W.length;a++){for(var i=0;i<W[a].length;i++)if(W[a][i]===null||W[a][i]===""){u=!1;break}if(!u)break}if(u){console.log("Datos de la tabla T1X:",W);var e=document.getElementById("flexDesingT2X");le(e,W);var s=document.getElementById("flexDesingT3X");re(s,W,y)}else alert("Hay celdas vacías")}}function le(b,o){var y=b,A=[];for(let m=0;m<o.length;m++){var C=[`Piso ${m+1}`,'ø3/4"',1.9,2.84,30,0,0,0,0,0,"No Cumple, verificar",'18ø5/8"'];A.push(C)}var v=new Handsontable(y,{data:A,rowHeaders:!0,colHeaders:!0,height:"auto",autoWrapRow:!0,autoWrapCol:!0,colWidths:100,colHeaders:["Nivel","Acero","D (cm)","Área (cm²)","N° Acero",'Ø1/2"','Ø5/8"','Ø3/4"','Ø1"',"Ascolocado (cm²)","Verificación de Acero Colocado","Distribución de Refuerzo Final en la Zona de Confinamiento"],columns:[{type:"text",readOnly:!0},{type:"dropdown",source:["6 mm","8 mm",'ø3/8"',"12 mm",'ø1/2"','ø5/8"','ø3/4"','ø7/8"','ø1"','ø1 3/8"']},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric"},{type:"numeric"},{type:"numeric"},{type:"numeric"},{type:"numeric",readOnly:!0},{type:"text",readOnly:!0},{type:"text",readOnly:!0}],afterChange:function(m,u){if(u==="edit"){var a=this;m.forEach(function(i){var e=i[0],s=i[1],t=i[3];if(s===1){var r=t,n=0,c=0;r=="6 mm"?(n=.6,c=.28):r=="8 mm"?(n=.8,c=.5):r=='ø3/8"'?(n=.95,c=.71):r=="12 mm"?(n=1.2,c=1.13):r=='ø1/2"'?(n=1.27,c=1.29):r=='ø5/8"'?(n=1.59,c=2):r=='ø3/4"'?(n=1.9,c=2.84):r=='ø7/8"'?(n=2.22,c=3.87):r=='ø1"'?(n=2.54,c=5.1):(n=3.49,c=1.01),a.setDataAtCell(e,2,n),a.setDataAtCell(e,3,c)}if(s==3){var l=Math.ceil(o[e][9]/t);a.setDataAtCell(e,4,l)}if(s==5&&(a.setDataAtCell(e,9,1.267*t+1.979*a.getDataAtCell(e,6)+2.85*a.getDataAtCell(e,7)+5.067*a.getDataAtCell(e,8)),t!=0&&a.setDataAtCell(e,11,`${t}Ø1/2"`)),s==6&&(a.setDataAtCell(e,9,1.267*a.getDataAtCell(e,5)+1.979*t+2.85*a.getDataAtCell(e,7)+5.067*a.getDataAtCell(e,8)),t!=0&&a.setDataAtCell(e,11,`${t}Ø5/8"`)),s==7&&(a.setDataAtCell(e,9,1.267*a.getDataAtCell(e,5)+1.979*a.getDataAtCell(e,6)+2.85*t+5.067*a.getDataAtCell(e,8)),t!=0&&a.setDataAtCell(e,11,`${t}Ø3/4"`)),s==8&&(a.setDataAtCell(e,9,1.267*a.getDataAtCell(e,5)+1.979*a.getDataAtCell(e,6)+2.85*a.getDataAtCell(e,7)+5.067*t),t!=0&&a.setDataAtCell(e,11,`${t}Ø1"`)),s==9){var g=a.getDataAtCell(e,9)>o[e][9]?"Sí cumple":"No cumple, verificar";a.setDataAtCell(e,10,g)}})}},afterPaste:function(m,u){m.forEach(function(a,i){var e=u[0].startRow,s=u[0].startCol,t=u[0].endCol;let r=0;for(let n=s;n<=t;n++)v.setDataAtCell(e+i,n,a[r]),r++})},licenseKey:"non-commercial-and-evaluation"});document.getElementById("saveDataBtnDF2X").addEventListener("click",x);function x(){var m=!0;Y=v.getData();for(var u=0;u<Y.length;u++){for(var a=0;a<Y[u].length;a++)if(Y[u][a]===null||Y[u][a]===""){m=!1;break}if(!m)break}m&&alert("Guardado")}}function re(b,o,y){var A=b,C=[];for(let n=0;n<o.length;n++){var v=parseFloat((Math.ceil(o[n][2]/25/.05)*.05).toFixed(2)),x=Math.max(v,.15),m=y.exDF>x?"Sí cumple":"No cumple, verificar",u=.0025,a=y.exDF>=.2?2:1,i=u*y.lnucxDF*100*y.exDF*100,e=.71,s=Math.ceil(y.lnucxDF*100*e/(i/a)/5)*5,t=[`Piso ${n+1}`,v,m,u,a,i,'ø3/8"',.95,.71,s,`$ø3/8" @ ${s} cm`];C.push(t)}var r=new Handsontable(A,{data:C,rowHeaders:!0,colHeaders:!0,height:"auto",autoWrapRow:!0,autoWrapCol:!0,colWidths:100,nestedHeaders:[["","emín","Verificación","ρinicial","N°","As inicial","Acero","D","Área","s","Distribución de Refuerzo"],["","(m)","Espesor Mínimo","","Capas","(cm²)","","(cm)","(cm²)","(cm)","Inicial en el Núcleo"]],columns:[{type:"text",readOnly:!0},{type:"numeric",readOnly:!0},{type:"text",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric"},{type:"numeric"},{type:"dropdown",source:["6 mm","8 mm",'ø3/8"',"12 mm",'ø1/2"','ø5/8"','ø3/4"','ø7/8"','ø1"','ø1 3/8"']},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"text",readOnly:!0}],afterChange:function(n,c){if(c==="edit"){var l=this;n.forEach(function(g){var d=g[0],D=g[1],f=g[3];if(D===6){var p=f,F=0,E=0;p=="6 mm"?(F=.6,E=.28):p=="8 mm"?(F=.8,E=.5):p=='ø3/8"'?(F=.95,E=.71):p=="12 mm"?(F=1.2,E=1.13):p=='ø1/2"'?(F=1.27,E=1.29):p=='ø5/8"'?(F=1.59,E=2):p=='ø3/4"'?(F=1.9,E=2.84):p=='ø7/8"'?(F=2.22,E=3.87):p=='ø1"'?(F=2.54,E=5.1):(F=3.49,E=1.01),l.setDataAtCell(d,7,F),l.setDataAtCell(d,8,E)}D==8&&l.setDataAtCell(d,9,Math.ceil(y.lnucxDF*100*f/(l.getDataAtCell(d,5)/l.getDataAtCell(d,4))/5)*5),D==9&&l.setDataAtCell(d,10,`${l.getDataAtCell(d,6)} @ ${l.getDataAtCell(d,9)} cm`)})}},afterPaste:function(n,c){n.forEach(function(l,g){var d=c[0].startRow,D=c[0].startCol,f=c[0].endCol;let p=0;for(let F=D;F<=f;F++)r.setDataAtCell(d+g,F,l[p]),p++})},licenseKey:"non-commercial-and-evaluation"})}function ie(b,o,y){var A=b,C=[];for(let u=0;u<o.length;u++){var v=[`Piso ${u+1}`,y.lyDF,"","","","","",o[u][5],"",""];C.push(v)}var x=new Handsontable(A,{data:C,rowHeaders:!0,colHeaders:!0,height:"auto",autoWrapRow:!0,autoWrapCol:!0,colWidths:100,nestedHeaders:[["Nivel","lm","h","hm","hm/lm","Tipo","Tipo","Mu","z","As"],["","(m)","(m)","(m)","","Muro","Falla Muro","(Ton.m)","(m)","(cm²)"]],columns:[{type:"text",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric"},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"text",readOnly:!0},{type:"text",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0}],afterChange:function(u,a){if(a==="edit"){var i=this;u.forEach(function(e){var s=e[0],t=e[1],r=e[3];if(t===2){var n=r,c=0;for(let p=0;p<i.countRows();p++)c+=i.getDataAtCell(p,2);s==0?i.setDataAtCell(s,3,c):(i.setDataAtCell(0,3,c),i.setDataAtCell(s,3,i.getDataAtCell(s-1,3)-n))}if(t===3){s+1<i.countRows()&&i.setDataAtCell(s+1,3,i.getDataAtCell(s,3)-i.getDataAtCell(s+1,2));var l=r/i.getDataAtCell(s,1);i.setDataAtCell(s,4,l)}if(t==4){var g=r>1?"Muro Esbelto":"Muro No Esbelto";i.setDataAtCell(s,5,g);var d=r>1?"Por Flexión":"Por Corte";i.setDataAtCell(s,6,d);var D=0;r>1?D=.9*i.getDataAtCell(s,1):.5<=r&&r<=1?D=.4*i.getDataAtCell(s,1)*(1+r):D=1.2*i.getDataAtCell(s,2),i.setDataAtCell(s,8,D)}if(t==7){var f=r*Math.pow(10,5)/(y.designDF*y.fyDF*i.getDataAtCell(s,8)*100);i.setDataAtCell(s,9,f)}if(t==8){var f=i.getDataAtCell(s,7)*Math.pow(10,5)/(y.designDF*y.fyDF*r*100);i.setDataAtCell(s,9,f)}})}},afterPaste:function(u,a){u.forEach(function(i,e){var s=a[0].startRow,t=a[0].startCol,r=a[0].endCol;let n=0;for(let c=t;c<=r;c++)x.setDataAtCell(s+e,c,i[n]),n++})},licenseKey:"non-commercial-and-evaluation"});document.getElementById("saveDataBtnDF1Y").addEventListener("click",m);function m(){for(var u=!0,a=x.getData(),i=0;i<a.length;i++){for(var e=0;e<a[i].length;e++)if(a[i][e]===null||a[i][e]===""){u=!1;break}if(!u)break}if(u){console.log("Datos de la tabla T1Y:",a);var s=document.getElementById("flexDesingT2Y");ue(s,a);var t=document.getElementById("flexDesingT3Y");ce(t,a,y)}else alert("Hay celdas vacías")}}function ue(b,o){var y=b,A=[];for(let m=0;m<o.length;m++){var C=[`Piso ${m+1}`,'ø3/4"',1.9,2.84,1,0,0,0,0,0,"No Cumple, verificar",'18ø5/8"'];A.push(C)}var v=new Handsontable(y,{data:A,rowHeaders:!0,colHeaders:!0,height:"auto",autoWrapRow:!0,autoWrapCol:!0,colWidths:100,nestedHeaders:[["Nivel","Acero","D","Área","N°",'Ø1/2"','Ø5/8"','Ø3/4"','Ø1"',"Ascolocado","Verificación","Distribución de Refuerzo"],["","","(cm)","(cm²)","Acero","","","","","(cm²)","Acero Colocado","Final en la Zona de Confinamiento"]],columns:[{type:"text",readOnly:!0},{type:"dropdown",source:["6 mm","8 mm",'ø3/8"',"12 mm",'ø1/2"','ø5/8"','ø3/4"','ø7/8"','ø1"','ø1 3/8"']},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric"},{type:"numeric"},{type:"numeric"},{type:"numeric"},{type:"numeric",readOnly:!0},{type:"text",readOnly:!0},{type:"text",readOnly:!0}],afterChange:function(m,u){if(u==="edit"){var a=this;m.forEach(function(i){var e=i[0],s=i[1],t=i[3];if(s===1){var r=t,n=0,c=0;r=="6 mm"?(n=.6,c=.28):r=="8 mm"?(n=.8,c=.5):r=='ø3/8"'?(n=.95,c=.71):r=="12 mm"?(n=1.2,c=1.13):r=='ø1/2"'?(n=1.27,c=1.29):r=='ø5/8"'?(n=1.59,c=2):r=='ø3/4"'?(n=1.9,c=2.84):r=='ø7/8"'?(n=2.22,c=3.87):r=='ø1"'?(n=2.54,c=5.1):(n=3.49,c=1.01),a.setDataAtCell(e,2,n),a.setDataAtCell(e,3,c)}if(s==3){var l=Math.ceil(o[e][9]/t);a.setDataAtCell(e,4,l)}if(s==5&&(a.setDataAtCell(e,9,1.267*t+1.979*a.getDataAtCell(e,6)+2.85*a.getDataAtCell(e,7)+5.067*a.getDataAtCell(e,8)),t!=0&&a.setDataAtCell(e,11,`${t}Ø1/2"`)),s==6&&(a.setDataAtCell(e,9,1.267*a.getDataAtCell(e,5)+1.979*t+2.85*a.getDataAtCell(e,7)+5.067*a.getDataAtCell(e,8)),t!=0&&a.setDataAtCell(e,11,`${t}Ø5/8"`)),s==7&&(a.setDataAtCell(e,9,1.267*a.getDataAtCell(e,5)+1.979*a.getDataAtCell(e,6)+2.85*t+5.067*a.getDataAtCell(e,8)),t!=0&&a.setDataAtCell(e,11,`${t}Ø3/4"`)),s==8&&(a.setDataAtCell(e,9,1.267*a.getDataAtCell(e,5)+1.979*a.getDataAtCell(e,6)+2.85*a.getDataAtCell(e,7)+5.067*t),t!=0&&a.setDataAtCell(e,11,`${t}Ø1"`)),s==9){var g=a.getDataAtCell(e,9)>o[e][9]?"Sí cumple":"No cumple, verificar";a.setDataAtCell(e,10,g)}})}},afterPaste:function(m,u){console.log(m),console.log(u),m.forEach(function(a,i){var e=u[0].startRow;u[0].endRow;var s=u[0].startCol,t=u[0].endCol;let r=0;for(let n=s;n<=t;n++)v.setDataAtCell(e+i,n,a[r]),r++})},licenseKey:"non-commercial-and-evaluation"});document.getElementById("saveDataBtnDF2Y").addEventListener("click",x);function x(){var m=!0;X=v.getData();for(var u=0;u<X.length;u++){for(var a=0;a<X[u].length;a++)if(X[u][a]===null||X[u][a]===""){m=!1;break}if(!m)break}m&&alert("Guardado")}}function ce(b,o,y){var A=b,C=[];for(let n=0;n<o.length;n++){var v=parseFloat((Math.ceil(o[n][2]/25/.05)*.05).toFixed(2)),x=Math.max(v,.15),m=y.eyDF>x?"Sí cumple":"No cumple, verificar",u=.0025,a=y.eyDF>=.2?2:1,i=u*y.lnucyDF*100*y.eyDF*100,e=.71,s=Math.ceil(y.lnucyDF*100*e/(i/a)/5)*5,t=[`Piso ${n+1}`,v,m,u,a,i,'ø3/8"',.95,.71,s,`$ø3/8" @ ${s} cm`];C.push(t)}var r=new Handsontable(A,{data:C,rowHeaders:!0,colHeaders:!0,height:"auto",autoWrapRow:!0,autoWrapCol:!0,colWidths:100,nestedHeaders:[["Nivel","emín","Verificación","ρinicial","N°","As inicial","Acero","D","Área","s","Distribución de Refuerzo"],["","(m)","Espesor Mínimo","","Capas","(cm²)","","(cm)","(cm²)","(cm)","Inicial en el Núcleo"]],columns:[{type:"text",readOnly:!0},{type:"numeric",readOnly:!0},{type:"text",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric"},{type:"numeric"},{type:"dropdown",source:["6 mm","8 mm",'ø3/8"',"12 mm",'ø1/2"','ø5/8"','ø3/4"','ø7/8"','ø1"','ø1 3/8"']},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"text",readOnly:!0}],afterChange:function(n,c){if(c==="edit"){var l=this;n.forEach(function(g){var d=g[0],D=g[1],f=g[3];if(D===6){var p=f,F=0,E=0;p=="6 mm"?(F=.6,E=.28):p=="8 mm"?(F=.8,E=.5):p=='ø3/8"'?(F=.95,E=.71):p=="12 mm"?(F=1.2,E=1.13):p=='ø1/2"'?(F=1.27,E=1.29):p=='ø5/8"'?(F=1.59,E=2):p=='ø3/4"'?(F=1.9,E=2.84):p=='ø7/8"'?(F=2.22,E=3.87):p=='ø1"'?(F=2.54,E=5.1):(F=3.49,E=1.01),l.setDataAtCell(d,7,F),l.setDataAtCell(d,8,E)}D==8&&l.setDataAtCell(d,9,Math.ceil(y.lnucyDF*100*f/(l.getDataAtCell(d,5)/l.getDataAtCell(d,4))/5)*5),D==9&&l.setDataAtCell(d,10,`${l.getDataAtCell(d,6)} @ ${l.getDataAtCell(d,9)} cm`)})}},afterPaste:function(n,c){console.log(n),console.log(c),n.forEach(function(l,g){var d=c[0].startRow;c[0].endRow;var D=c[0].startCol,f=c[0].endCol;let p=0;for(let F=D;F<=f;F++)r.setDataAtCell(d+g,F,l[p]),p++})},licenseKey:"non-commercial-and-evaluation"})}var L=[],R=[],h=[];function se(b,o,y){var A=b,C=[],v=6;for(let a=0;a<o.length;a++){var x=[`Piso ${a+1}`,y.lxDF,"","","",o[a][2],o[a][3],"","","","","","","","","-","-",""];C.push(x)}var m=new Handsontable(A,{data:C,rowHeaders:!0,colHeaders:!0,height:"auto",autoWrapRow:!0,autoWrapCol:!0,colWidths:100,nestedHeaders:[["Nivel","lm","h","hm acumulado","hm","Vua","Mua","Cociente","¿Aplica criterio?","Mnx","Mnx/Mua","Vux","hm/lm","αc","Vcx máx","Nu","β","Vcx"],["","(m)","(m)","(m)","(m)","(Ton)","(Ton.m)","","","","","","","","","","",""]],columns:[{type:"text",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric"},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"text",readOnly:!0},{type:"numeric"},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric"},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0}],afterChange:function(a,i){if(i==="edit"){var e=this;a.forEach(function(s){var t=s[0],r=s[1],n=s[3];if(r===2){var c=n,l=0;for(let F=0;F<e.countRows();F++)l+=e.getDataAtCell(F,2);t==0?(e.setDataAtCell(t,4,l),e.setDataAtCell(t,3,c)):(e.setDataAtCell(t,3,c+e.getDataAtCell(t-1,3)),e.setDataAtCell(0,4,l),e.setDataAtCell(t,4,e.getDataAtCell(t-1,3)-c));var g=0;t==0&&(g=Math.max(e.getDataAtCell(t,1),n+e.getDataAtCell(1,2),.25*(e.getDataAtCell(0,6)/e.getDataAtCell(0,5)))),t==1?g=Math.max(e.getDataAtCell(t,1),e.getDataAtCell(0,2)+n,.25*(e.getDataAtCell(0,6)/e.getDataAtCell(0,5))):g=Math.max(e.getDataAtCell(t,1),e.getDataAtCell(0,2)+e.getDataAtCell(1,2),.25*(e.getDataAtCell(0,6)/e.getDataAtCell(0,5))),e.setDataAtCell(t,7,g)}if(r===3){t+1<e.countRows()&&e.setDataAtCell(t+1,3,n+e.getDataAtCell(t+1,2));var d=e.getDataAtCell(0,3),D=parseFloat((n-d).toFixed(2))<e.getDataAtCell(t,7)?"Sí aplica":"No aplica";e.setDataAtCell(t,8,D)}if(r===4){t+1<e.countRows()&&e.setDataAtCell(t+1,4,n-e.getDataAtCell(t+1,2));var f=n/e.getDataAtCell(t,1);e.setDataAtCell(t,12,f)}if(r==7){var d=e.getDataAtCell(0,3),p=e.getDataAtCell(t,3),D=parseFloat((p-d).toFixed(2))<n?"Sí aplica":"No aplica";e.setDataAtCell(t,8,D)}r==8&&e.setDataAtCell(t,11,n=="Sí aplica"?e.getDataAtCell(t,5)*e.getDataAtCell(t,10):e.getDataAtCell(t,5)),r==9&&e.setDataAtCell(t,10,n=="-"?"-":Math.min(n/e.getDataAtCell(t,6),v)),r==10&&e.setDataAtCell(t,11,e.getDataAtCell(t,8)=="Sí aplica"?e.getDataAtCell(t,5)*n:e.getDataAtCell(t,5)),r==12&&e.setDataAtCell(t,13,n<=1.5?.8:n>=2?.53:.53-(.53-.8)*(2-n)/(2-1.5)),r==13&&e.setDataAtCell(t,14,y.acwxDC*Math.sqrt(y.fcDF)*n*10),r==14&&e.setDataAtCell(t,17,e.getDataAtCell(t,15)=="-"?n:n*e.getDataAtCell(t,16)),r==15&&(e.setDataAtCell(t,16,n=="-"?"-":1-n/(35*y.exDF*e.getDataAtCell(t,1)*10)),e.setDataAtCell(t,17,n=="-"?e.getDataAtCell(t,14):e.getDataAtCell(t,14)*e.getDataAtCell(t,16))),r==16&&e.setDataAtCell(t,17,n=="-"?e.getDataAtCell(t,14):e.getDataAtCell(t,14)*n)})}},afterPaste:function(a,i){console.log(a),console.log(i),a.forEach(function(e,s){var t=i[0].startRow,r=i[0].startCol,n=i[0].endCol;let c=0;for(let l=r;l<=n;l++)m.setDataAtCell(t+s,l,e[c]),c++})},licenseKey:"non-commercial-and-evaluation"});document.getElementById("saveDataBtnDC1X").addEventListener("click",u);function u(){var a=!0;L=m.getData();for(var i=0;i<L.length;i++){for(var e=0;e<L[i].length;e++)if(L[i][e]===null||L[i][e]===""){a=!1;break}if(!a)break}if(a){console.log("Datos de la tabla DC T1X:",L);var s=document.getElementById("cutDesingT2X");de(s,y)}else alert("Hay celdas vacías")}}function de(b,o){var y=b,A=L,C=[];for(let D=0;D<A.length;D++){var v=Math.max(A[D][11]/o.designDC-A[D][17],0),x=2.1*Math.sqrt(o.fcDF)*o.exDF*o.dxDF*10,m=o.acwxDC*Math.pow(100,2),u=A[D][11]>.53*m*Math.sqrt(o.fcDF)/1e3||o.exDF>.2?2:1,a=.27*Math.sqrt(o.fcDF)*o.exDF*o.dxDF*10,i=A[D][11]<a?.002:.0025,e=Math.max(i,v/(o.exDF*o.lxDF*o.fyDF*10)),s=o.exDF*o.lxDF*e*o.fyDF*10,t=o.designDC*(A[D][17]+s),r=o.acwxDC*Math.sqrt(o.fcDF)*2.6*10,n=t<=r?"Sí cumple":"No cumple, verificar",c=t>=A[D][11]?"Sí cumple":"No cumple, verificar",l=[`Piso ${D+1}`,v,x,v<=x?"Sí cumple":"No cumple, verificar",m,u,a,i,e,s,t,r,n,c];C.push(l)}var g=new Handsontable(y,{data:C,rowHeaders:!0,colHeaders:!0,height:"auto",autoWrapRow:!0,autoWrapCol:!0,colWidths:100,nestedHeaders:[["Nivel","Vs","Vs máx","Verificación","Acv","N°","Vu máx","ρh mín","ρh","Vs final","Vn","Vn máx","Verificación","Verificación"],["","(Ton)","(Ton)","Cortante del Acero Máximo","(cm²)","Capas","(Ton)","","","(Ton)","(Ton)","(Ton)","(Ton)","Resistencia al Cortante"]],columns:[{type:"text",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"text",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"text",readOnly:!0},{type:"text",readOnly:!0}],licenseKey:"non-commercial-and-evaluation"});document.getElementById("saveDataBtnDC2X").addEventListener("click",d);function d(){R=g.getData();var D=document.getElementById("cutDesingT3X");oe(D,o)}}function oe(b,o){var y=b,A=[];for(let l=0;l<L.length;l++){var C=L[l][11]<R[l][6]?.0015:.0025,v=R[l][8],x=Math.min(Math.max(.0025+.5*(2.5-L[l][12])*(R[l][8]-.0025),C),v),m=x<=v?"Sí cumple":"No cumple, verificar",u=.71,a=Math.ceil(R[l][5]*u/(o.exDF*100*R[l][8])/2.5)*2.5,i=Math.ceil(R[l][5]*u/(o.exDF*100*x)/2.5)*2.5,e=Math.min(3*o.exDF*100,40),s=a<e?"Sí cumple":"No cumple, verificar",t=i<e?"Sí cumple":"No cumple, verificar",r=[`Piso ${l+1}`,C,v,x,m,'ø3/8"',.95,u,a,e,s,'ø3/8"',.95,u,i,e,t];A.push(r)}var n=new Handsontable(y,{data:A,rowHeaders:!0,colHeaders:!0,height:"auto",autoWrapRow:!0,autoWrapCol:!0,colWidths:100,nestedHeaders:[["Nivel","ρv mín","ρv máx","ρv","Verificación","Acero","D","Área","s","smáx","Distribución de Refuerzo","Acero","D","Área","s","smáx","Distribución de Refuerzo"],["","","","","Cuantía Vertical Máxima","","(cm)","(cm²)","(cm)","(cm)","Inicial en el Núcleo","","(cm)","(cm²)","(cm)","(cm)","Inicial en el Núcleo"]],columns:[{type:"text",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"text",readOnly:!0},{type:"dropdown",source:["6 mm","8 mm",'ø3/8"',"12 mm",'ø1/2"','ø5/8"','ø3/4"','ø7/8"','ø1"','ø1 3/8"']},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"text"},{type:"dropdown",source:["6 mm","8 mm",'ø3/8"',"12 mm",'ø1/2"','ø5/8"','ø3/4"','ø7/8"','ø1"','ø1 3/8"']},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"text",readOnly:!0}],afterChange:function(l,g){if(g==="edit"){var d=this;l.forEach(function(D){var f=D[0],p=D[1],F=D[3];if(p===5){var E=F,O=0,w=0;E=="6 mm"?(O=.6,w=.28):E=="8 mm"?(O=.8,w=.5):E=='ø3/8"'?(O=.95,w=.71):E=="12 mm"?(O=1.2,w=1.13):E=='ø1/2"'?(O=1.27,w=1.29):E=='ø5/8"'?(O=1.59,w=2):E=='ø3/4"'?(O=1.9,w=2.84):E=='ø7/8"'?(O=2.22,w=3.87):E=='ø1"'?(O=2.54,w=5.1):(O=3.49,w=1.01),d.setDataAtCell(f,6,O),d.setDataAtCell(f,7,w)}if(p==7&&d.setDataAtCell(f,8,Math.ceil(R[f][5]*F/(o.exDF*100*R[f][8])/2.5)*2.5),p==8&&d.setDataAtCell(f,10,F<=d.getDataAtCell(f,9)?"Sí cumple":"No cumple, verificar"),p===11){var E=F,O=0,w=0;E=="6 mm"?(O=.6,w=.28):E=="8 mm"?(O=.8,w=.5):E=='ø3/8"'?(O=.95,w=.71):E=="12 mm"?(O=1.2,w=1.13):E=='ø1/2"'?(O=1.27,w=1.29):E=='ø5/8"'?(O=1.59,w=2):E=='ø3/4"'?(O=1.9,w=2.84):E=='ø7/8"'?(O=2.22,w=3.87):E=='ø1"'?(O=2.54,w=5.1):(O=3.49,w=1.01),d.setDataAtCell(f,12,O),d.setDataAtCell(f,13,w)}p==13&&d.setDataAtCell(f,14,Math.ceil(R[f][5]*F/(o.exDF*100*d.getDataAtCell(f,3))/2.5)*2.5),p==14&&d.setDataAtCell(f,16,F<=d.getDataAtCell(f,15)?"Sí cumple":"No cumple, verificar")})}},licenseKey:"non-commercial-and-evaluation"});document.getElementById("saveDataBtnDC3X").addEventListener("click",c);function c(){h=n.getData();var l=document.getElementById("cutDesingT4X");me(l)}}function me(b){var o=b,y=[];for(let C=0;C<L.length;C++){var A=[`Piso ${C+1}`,R[C][5],h[C][5],"@",h[C][8],R[C][5],h[C][11],"@",h[C][14]];y.push(A)}new Handsontable(o,{data:y,rowHeaders:!0,colHeaders:!0,height:"auto",autoWrapRow:!0,autoWrapCol:!0,colWidths:100,colHeaders:["Nivel","Capas","Acero","","s (cm)","Capas","Acero","","s (cm)"],columns:[{type:"text",readOnly:!0},{type:"numeric",readOnly:!0},{type:"text",readOnly:!0},{type:"text",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"text",readOnly:!0},{type:"text",readOnly:!0},{type:"numeric",readOnly:!0}],licenseKey:"non-commercial-and-evaluation"})}var N=[],V=[],S=[];function ye(b,o,y){var A=b,C=[],v=6;for(let a=0;a<o.length;a++){var x=[`Piso ${a+1}`,y.lyDF,"","","",o[a][4],o[a][5],"","","","","","","","","-","-",""];C.push(x)}var m=new Handsontable(A,{data:C,rowHeaders:!0,colHeaders:!0,height:"auto",autoWrapRow:!0,autoWrapCol:!0,colWidths:100,nestedHeaders:[["Nivel","lm","h","hm acumulado","hm","Vua","Mua","Cociente","¿Aplica criterio?","Mny","Mny/Mua","Vuy","hm/lm","αc","Vcy máx","Nu","β","Vcy"],["","(m)","(m)","(m)","(m)","(Ton)","(Ton.m)","","","(Ton.m)","","(Ton)","","","(Ton)","(Ton)","","(Ton)"]],columns:[{type:"text",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric"},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"text",readOnly:!0},{type:"numeric"},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric"},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0}],afterChange:function(a,i){if(i==="edit"){var e=this;a.forEach(function(s){var t=s[0],r=s[1],n=s[3];if(r===2){var c=n,l=0;for(let F=0;F<e.countRows();F++)l+=e.getDataAtCell(F,2);t==0?(e.setDataAtCell(t,4,l),e.setDataAtCell(t,3,c)):(e.setDataAtCell(t,3,c+e.getDataAtCell(t-1,3)),e.setDataAtCell(0,4,l),e.setDataAtCell(t,4,e.getDataAtCell(t-1,3)-c));var g=0;t==0&&(g=Math.max(e.getDataAtCell(t,1),n+e.getDataAtCell(1,2),.25*(e.getDataAtCell(0,6)/e.getDataAtCell(0,5)))),t==1?g=Math.max(e.getDataAtCell(t,1),e.getDataAtCell(0,2)+n,.25*(e.getDataAtCell(0,6)/e.getDataAtCell(0,5))):g=Math.max(e.getDataAtCell(t,1),e.getDataAtCell(0,2)+e.getDataAtCell(1,2),.25*(e.getDataAtCell(0,6)/e.getDataAtCell(0,5))),e.setDataAtCell(t,7,g)}if(r===3){t+1<e.countRows()&&e.setDataAtCell(t+1,3,n+e.getDataAtCell(t+1,2));var d=e.getDataAtCell(0,3),D=parseFloat((n-d).toFixed(2))<e.getDataAtCell(t,7)?"Sí aplica":"No aplica";e.setDataAtCell(t,8,D)}if(r===4){t+1<e.countRows()&&e.setDataAtCell(t+1,4,n-e.getDataAtCell(t+1,2));var f=n/e.getDataAtCell(t,1);e.setDataAtCell(t,12,f)}if(r==7){var d=e.getDataAtCell(0,3),p=e.getDataAtCell(t,3),D=parseFloat((p-d).toFixed(2))<n?"Sí aplica":"No aplica";e.setDataAtCell(t,8,D)}r==8&&e.setDataAtCell(t,11,n=="Sí aplica"?e.getDataAtCell(t,5)*e.getDataAtCell(t,10):e.getDataAtCell(t,5)),r==9&&e.setDataAtCell(t,10,n=="-"?"-":Math.min(n/e.getDataAtCell(t,6),v)),r==10&&e.setDataAtCell(t,11,e.getDataAtCell(t,8)=="Sí aplica"?e.getDataAtCell(t,5)*n:e.getDataAtCell(t,5)),r==12&&e.setDataAtCell(t,13,n<=1.5?.8:n>=2?.53:.53-(.53-.8)*(2-n)/(2-1.5)),r==13&&e.setDataAtCell(t,14,y.acwyDC*Math.sqrt(y.fcDF)*n*10),r==14&&e.setDataAtCell(t,17,e.getDataAtCell(t,15)=="-"?n:n*e.getDataAtCell(t,16)),r==15&&(e.setDataAtCell(t,16,n=="-"?"-":1-n/(35*y.eyDF*e.getDataAtCell(t,1)*10)),e.setDataAtCell(t,17,n=="-"?e.getDataAtCell(t,14):e.getDataAtCell(t,14)*e.getDataAtCell(t,16))),r==16&&e.setDataAtCell(t,17,n=="-"?e.getDataAtCell(t,14):e.getDataAtCell(t,14)*n)})}},afterPaste:function(a,i){console.log(a),console.log(i),a.forEach(function(e,s){var t=i[0].startRow,r=i[0].startCol,n=i[0].endCol;let c=0;for(let l=r;l<=n;l++)m.setDataAtCell(t+s,l,e[c]),c++})},licenseKey:"non-commercial-and-evaluation"});document.getElementById("saveDataBtnDC1Y").addEventListener("click",u);function u(){var a=!0;N=m.getData();for(var i=0;i<N.length;i++){for(var e=0;e<N[i].length;e++)if(N[i][e]===null||N[i][e]===""){a=!1;break}if(!a)break}if(a){console.log("Datos de la tabla DC T1X:",N);var s=document.getElementById("cutDesingT2Y");ve(s,y)}else alert("Hay celdas vacías")}}function ve(b,o){var y=b,A=N,C=[];for(let D=0;D<A.length;D++){var v=Math.max(A[D][11]/o.designDC-A[D][17],0),x=2.1*Math.sqrt(o.fcDF)*o.eyDF*o.dyDF*10,m=o.acwyDC*Math.pow(100,2),u=A[D][11]>.53*m*Math.sqrt(o.fcDF)/1e3||o.eyDF>.2?2:1,a=.27*Math.sqrt(o.fcDF)*o.eyDF*o.dyDF*10,i=A[D][11]<a?.002:.0025,e=Math.max(i,v/(o.eyDF*o.lyDF*o.fyDF*10)),s=o.eyDF*o.lyDF*e*o.fyDF*10,t=o.designDC*(A[D][17]+s),r=o.acwyDC*Math.sqrt(o.fcDF)*2.6*10,n=t<=r?"Sí cumple":"No cumple, verificar",c=t>=A[D][11]?"Sí cumple":"No cumple, verificar",l=[`Piso ${D+1}`,v,x,v<=x?"Sí cumple":"No cumple, verificar",m,u,a,i,e,s,t,r,n,c];C.push(l)}var g=new Handsontable(y,{data:C,rowHeaders:!0,colHeaders:!0,height:"auto",autoWrapRow:!0,autoWrapCol:!0,colWidths:100,nestedHeaders:[["Nivel","Vs","Vs máx","Verificación","Acv","N°","Vu máx","ρh mín","ρh","Vs final","Vn","Vn máx","Verificación","Verificación"],["","(Ton)","(Ton)","Cortante del Acero Máximo","(cm²)","Capas","(Ton)","","","(Ton)","(Ton)","(Ton)",'"Vn máx"',"Resistencia al Cortante"]],columns:[{type:"text",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"text",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"text",readOnly:!0},{type:"text",readOnly:!0}],licenseKey:"non-commercial-and-evaluation"});document.getElementById("saveDataBtnDC2Y").addEventListener("click",d);function d(){V=g.getData();var D=document.getElementById("cutDesingT3Y");pe(D,o)}}function pe(b,o){var y=b,A=[];for(let l=0;l<N.length;l++){var C=N[l][11]<V[l][6]?.0015:.0025,v=V[l][8],x=Math.min(Math.max(.0025+.5*(2.5-N[l][12])*(V[l][8]-.0025),C),v),m=x<=v?"Sí cumple":"No cumple, verificar",u=.71,a=Math.ceil(V[l][5]*u/(o.eyDF*100*V[l][8])/2.5)*2.5,i=Math.ceil(V[l][5]*u/(o.eyDF*100*x)/2.5)*2.5,e=Math.min(3*o.eyDF*100,40),s=a<e?"Sí cumple":"No cumple, verificar",t=i<e?"Sí cumple":"No cumple, verificar",r=[`Piso ${l+1}`,C,v,x,m,'ø3/8"',.95,u,a,e,s,'ø3/8"',.95,u,i,e,t];A.push(r)}var n=new Handsontable(y,{data:A,rowHeaders:!0,colHeaders:!0,height:"auto",autoWrapRow:!0,autoWrapCol:!0,colWidths:100,nestedHeaders:[["Nivel","ρv mín","ρv máx","ρv","Verificación","Acero","D","Área","s","smáx","Distribución de Refuerzo","Acero","D","Área","s","smáx","Distribución de Refuerzo"],["","","","","Cuantía Vertical Máxima","","(cm)","(cm²)","(cm)","(cm)","Inicial en el Núcleo","","(cm)","(cm²)","(cm)","(cm)","Inicial en el Núcleo"]],columns:[{type:"text",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"text",readOnly:!0},{type:"dropdown",source:["6 mm","8 mm",'ø3/8"',"12 mm",'ø1/2"','ø5/8"','ø3/4"','ø7/8"','ø1"','ø1 3/8"']},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"text"},{type:"dropdown",source:["6 mm","8 mm",'ø3/8"',"12 mm",'ø1/2"','ø5/8"','ø3/4"','ø7/8"','ø1"','ø1 3/8"']},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"text",readOnly:!0}],afterChange:function(l,g){if(g==="edit"){var d=this;l.forEach(function(D){var f=D[0],p=D[1],F=D[3];if(p===5){var E=F,O=0,w=0;E=="6 mm"?(O=.6,w=.28):E=="8 mm"?(O=.8,w=.5):E=='ø3/8"'?(O=.95,w=.71):E=="12 mm"?(O=1.2,w=1.13):E=='ø1/2"'?(O=1.27,w=1.29):E=='ø5/8"'?(O=1.59,w=2):E=='ø3/4"'?(O=1.9,w=2.84):E=='ø7/8"'?(O=2.22,w=3.87):E=='ø1"'?(O=2.54,w=5.1):(O=3.49,w=1.01),d.setDataAtCell(f,6,O),d.setDataAtCell(f,7,w)}if(p==7&&d.setDataAtCell(f,8,Math.ceil(V[f][5]*F/(o.eyDF*100*V[f][8])/2.5)*2.5),p==8&&d.setDataAtCell(f,10,F<=d.getDataAtCell(f,9)?"Sí cumple":"No cumple, verificar"),p===11){var E=F,O=0,w=0;E=="6 mm"?(O=.6,w=.28):E=="8 mm"?(O=.8,w=.5):E=='ø3/8"'?(O=.95,w=.71):E=="12 mm"?(O=1.2,w=1.13):E=='ø1/2"'?(O=1.27,w=1.29):E=='ø5/8"'?(O=1.59,w=2):E=='ø3/4"'?(O=1.9,w=2.84):E=='ø7/8"'?(O=2.22,w=3.87):E=='ø1"'?(O=2.54,w=5.1):(O=3.49,w=1.01),d.setDataAtCell(f,12,O),d.setDataAtCell(f,13,w)}p==13&&d.setDataAtCell(f,14,Math.ceil(V[f][5]*F/(o.eyDF*100*d.getDataAtCell(f,3))/2.5)*2.5),p==14&&d.setDataAtCell(f,16,F<=d.getDataAtCell(f,15)?"Sí cumple":"No cumple, verificar")})}},licenseKey:"non-commercial-and-evaluation"});document.getElementById("saveDataBtnDC3Y").addEventListener("click",c);function c(){S=n.getData();var l=document.getElementById("cutDesingT4Y");fe(l)}}function fe(b){var o=b,y=[];for(let C=0;C<N.length;C++){var A=[`Piso ${C+1}`,V[C][5],S[C][5],"@",S[C][8],V[C][5],S[C][11],"@",S[C][14]];y.push(A)}new Handsontable(o,{data:y,rowHeaders:!0,colHeaders:!0,height:"auto",autoWrapRow:!0,autoWrapCol:!0,colWidths:100,colHeaders:["Nivel","Capas","Acero","","s (cm)","Capas","Acero","","s (cm)"],columns:[{type:"text",readOnly:!0},{type:"numeric",readOnly:!0},{type:"text",readOnly:!0},{type:"text",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"text",readOnly:!0},{type:"text",readOnly:!0},{type:"numeric",readOnly:!0}],licenseKey:"non-commercial-and-evaluation"})}var q=[],z=[],Ce={};function ge(b,o,y,A,C,v){var x=b,m=[];for(let O=0;O<1;O++){var u=v.lxDF;console.log(A);var a=y[O][4];console.log(a);var i=A[O][9],e=0,s=o[O][1],t=C[O][3],r=(s*1e3+i*v.fyDF+t*v.ezcxDF*100*v.lxDF*100*v.fyDF-e*v.fyDF)/(.85*v.fcDF*v.ezcxDF*100*v.β1DF+2*t*v.ezcxDF*100*v.fyDF),n=0,c=0,l=n==0?0:v.ƐcDF*v.lxDF*100/(v.ƐcDF+n),g=Math.max(r,c,l),d=.2374764,D=u/(600*Math.max(d/a,.005))*100,f=g>=D?"Requiere ser confinado":"No requiere ser confinado",p=[u,a,i,e,s,t,r,c,n,l,g,d,D,f];m.push(p)}var F=new Handsontable(x,{data:m,rowHeaders:!0,colHeaders:!0,height:"auto",autoWrapRow:!0,autoWrapCol:!0,colWidths:100,nestedHeaders:[["lm","hm","As","A's","Pu","pv","c1","c2","Ɛs","c3","c","δu","C limite","Confinamiento"],["(m)","(m)","(cm²)","(cm²)","(Ton)","","(cm)","(cm)","","(cm)","(cm)","(m)","(cm)","elemento de borde"]],columns:[{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric"},{type:"numeric"},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric"},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0}],afterChange:function(O,w){if(w==="edit"){var M=this;O.forEach(function(P){var I=P[0],T=P[1],B=P[3];T===7&&M.setDataAtCell(I,10,Math.max(M.getDataAtCell(I,6),M.getDataAtCell(I,7),M.getDataAtCell(I,9))),T===8&&M.setDataAtCell(I,9,B==0?0:v.ƐcDF*v.lxDF*100/(v.ezcxDF+B)),T===9&&M.setDataAtCell(I,10,Math.max(M.getDataAtCell(I,6),M.getDataAtCell(I,7),M.newValue)),T===10&&M.setDataAtCell(I,13,B>=M.getDataAtCell(I,12)?"Requiere ser confinado":"No requiere ser confinado"),T===11&&M.setDataAtCell(I,12,M.getDataAtCell(I,0)/(600*Math.max(M.getDataAtCell(I,11)/M.getDataAtCell(I,1),.005))*100),T===12&&M.setDataAtCell(I,13,M.getDataAtCell(I,10)>=B?"Requiere ser confinado":"No requiere ser confinado")})}},afterPaste:function(O,w){console.log(O),console.log(w),O.forEach(function(M,P){var I=w[0].startRow,T=w[0].startCol,B=w[0].endCol;let K=0;for(let k=T;k<=B;k++)F.setDataAtCell(I+P,k,M[K]),K++})},licenseKey:"non-commercial-and-evaluation"});document.getElementById("saveDataBtnDI1X").addEventListener("click",E);function E(){q=F.getData();var O=document.getElementById("diT2X");De(O,o,y,A,v);var w=document.getElementById("diT3X");Ae(w,v)}}function De(b,o,y,A,C){var v=b,x=[];for(let p=0;p<1;p++){var m=C.zcxDF,u=y[p][11],a=o[p][3],i=q[p][0],e=.25*(a/u),s=Math.max(i,e),t=Math.max(q[p][10]/100-.1*q[p][0],0),r=q[p][10]/2/100,n=Math.max(t,r),c=m>n?"Sí cumple":"No cumple, verificar",l=10*A[p][2],g=Math.min(C.zcxDF,C.ezcxDF)*100,d=25,D=Math.floor(Math.min(l,d)/2.5)*2.5,f=[m,u,a,i,e,s,t,r,n,c,l,g,d,D];x.push(f)}new Handsontable(v,{data:x,rowHeaders:!0,colHeaders:!0,height:"auto",autoWrapRow:!0,autoWrapCol:!0,colWidths:100,nestedHeaders:[["zc","Vu máx","Mu máx","Lo máx","Lo máx","Lo máx","zcmáx 1","zcmáx 2","zcmáx","Artículo 21.9.7.6.a. Verificación","s1","s2","s3","s"],["(m)","(Ton)","(Ton.m)","(m)","(m)","(m)","(m)","(m)","(m)","Espesor de la Zona de Confinamiento","(cm)","(cm)","(cm)","(cm)"]],columns:[{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"text",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0}],licenseKey:"non-commercial-and-evaluation"})}function Ae(b,o){var y=b,A=[];for(let a=0;a<1;a++){var C=o.lyDF,v=q[a][1],x=.1*v,m=C<=x?"Diseñar con ala completa":"Diseñar solo con ancho efectivo del ala",u=[C,v,x,m];A.push(u)}new Handsontable(y,{data:A,rowHeaders:!0,colHeaders:!0,height:"auto",autoWrapRow:!0,autoWrapCol:!0,colWidths:100,nestedHeaders:[["Ly","hm","Ly calculado","Verificación"],["(m)","(m)","(m)","ancho efectivo del Ala"]],columns:[{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"text",readOnly:!0}],licenseKey:"non-commercial-and-evaluation"})}function xe(b,o,y,A,C,v){var x=b,m=[];for(let O=0;O<1;O++){var u=v.lxDF,a=y[O][4],i=A[O][9],e=0,s=o[O][1],t=C[O][3],r=(s*1e3+i*v.fyDF+t*v.ezcyDF*100*v.lyDF*100*v.fyDF-e*v.fyDF)/(.85*v.fcDF*v.ezcyDF*100*v.β1DF+2*t*v.ezcyDF*100*v.fyDF),n=0,c=0,l=n==0?0:v.ƐcDF*v.lxDF*100/(v.ƐcDF+n),g=Math.max(r,c,l),d=.2374764,D=u/(600*Math.max(d/a,.005))*100,f=g>=D?"Requiere ser confinado":"No requiere ser confinado",p=[u,a,i,e,s,t,r,c,n,l,g,d,D,f];m.push(p)}var F=new Handsontable(x,{data:m,rowHeaders:!0,colHeaders:!0,height:"auto",autoWrapRow:!0,autoWrapCol:!0,colWidths:100,nestedHeaders:[["lm","hm","As","A's","Pu","pv","c1","c2","Ɛs","c3","c","δu","C limite","Confinamiento"],["(m)","(m)","(cm²)","(cm²)","(Ton)","","(cm)","(cm)","","(cm)","(cm)","(m)","(cm)","elemento de borde"]],columns:[{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric"},{type:"numeric"},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric"},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0}],afterChange:function(O,w){if(w==="edit"){var M=this;O.forEach(function(P){var I=P[0],T=P[1],B=P[3];T===7&&M.setDataAtCell(I,10,Math.max(M.getDataAtCell(I,6),M.getDataAtCell(I,7),M.getDataAtCell(I,9))),T===8&&M.setDataAtCell(I,9,B==0?0:v.ƐcDF*v.lxDF*100/(v.ezcxDF+B)),T===9&&M.setDataAtCell(I,10,Math.max(M.getDataAtCell(I,6),M.getDataAtCell(I,7),M.newValue)),T===10&&M.setDataAtCell(I,13,B>=M.getDataAtCell(I,12)?"Requiere ser confinado":"No requiere ser confinado"),T===11&&M.setDataAtCell(I,12,M.getDataAtCell(I,0)/(600*Math.max(M.getDataAtCell(I,11)/M.getDataAtCell(I,1),.005))*100),T===12&&M.setDataAtCell(I,13,M.getDataAtCell(I,10)>=B?"Requiere ser confinado":"No requiere ser confinado")})}},afterPaste:function(O,w){console.log(O),console.log(w),O.forEach(function(M,P){var I=w[0].startRow,T=w[0].startCol,B=w[0].endCol;let K=0;for(let k=T;k<=B;k++)F.setDataAtCell(I+P,k,M[K]),K++})},licenseKey:"non-commercial-and-evaluation"});document.getElementById("saveDataBtnDI1Y").addEventListener("click",E);function E(){z=F.getData();var O=document.getElementById("diT2Y");Oe(O,o,y,A,v);var w=document.getElementById("diT3Y");Fe(w,v)}}function Oe(b,o,y,A,C){var v=b,x=[];for(let p=0;p<1;p++){var m=C.zcyDF;console.log(m);var u=y[p][11],a=o[p][3],i=z[p][0],e=.25*(a/u),s=Math.max(i,e),t=Math.max(z[p][10]/100-.1*z[p][0],0),r=z[p][10]/2/100,n=Math.max(t,r),c=m>n?"Sí cumple":"No cumple, verificar",l=10*A[p][2],g=Math.min(C.zcyDF,C.ezcyDF)*100,d=25,D=Math.floor(Math.min(l,d)/2.5)*2.5,f=[m,u,a,i,e,s,t,r,n,c,l,g,d,D];x.push(f)}new Handsontable(v,{data:x,rowHeaders:!0,colHeaders:!0,height:"auto",autoWrapRow:!0,autoWrapCol:!0,colWidths:100,nestedHeaders:[["zc","Vu máx","Mu máx","Lo máx","Lo máx","Lo máx","zcmáx 1","zcmáx 2","zcmáx","Artículo 21.9.7.6.a. Verificación","s1","s2","s3","s"],["(m)","(Ton)","(Ton.m)","(m)","(m)","(m)","(m)","(m)","(m)","Espesor de la Zona de Confinamiento","(cm)","(cm)","(cm)","(cm)"]],columns:[{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"text",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0}],licenseKey:"non-commercial-and-evaluation"})}function Fe(b,o){var y=b,A=[];for(let a=0;a<1;a++){var C=o.lxDF,v=z[a][1],x=.1*v,m=C<=x?"Diseñar con ala completa":"Diseñar solo con ancho efectivo del ala",u=[C,v,x,m];A.push(u)}new Handsontable(y,{data:A,rowHeaders:!0,colHeaders:!0,height:"auto",autoWrapRow:!0,autoWrapCol:!0,colWidths:100,nestedHeaders:[["Lx","hm","Ly calculado","Verificación"],["(m)","(m)","(m)","ancho efectivo del Ala"]],columns:[{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"text",readOnly:!0}],licenseKey:"non-commercial-and-evaluation"})}function be(b){var o=0,y=b.length;for(let D=1;D<=y/17;D=D+2){o++;var A=b.slice(0,17),C=b.slice(17,34);b=b.slice(34);var v=document.createElement("div"),x=document.createElement("div"),m=document.createElement("div"),u=document.createElement("div"),a=document.createElement("div"),i=document.createElement("div"),e=document.createElement("div"),s=document.createElement("div"),t=document.createElement("button");t.textContent="Generar gráfico Izquierdo";var r=document.createElement("div"),n=document.createElement("div"),c=document.createElement("div"),l=document.createElement("div"),g=document.createElement("button");g.textContent="Generar gráfico Derecho",a.id=`hotTableContainerISC${o}`,a.classList.add("mr-1"),r.id=`hotTableContainerDSC${o}`,e.id=`hotTableContainerIDI${o}`,t.id=`buttonIDI${o}`,c.id=`hotTableContainerDDI${o}`,g.id=`buttonDDI${o}`,v.classList.add("d-flex","flex-column"),x.classList.add("d-flex"),m.classList.add("row"),u.classList.add("d-flex","flex-wrap"),i.classList="col-md-5",n.classList="col-md-5",v.id=`diagramsContainer${o}`;var d=document.getElementById("diagramsContainer");d.appendChild(v),v.appendChild(x),v.appendChild(m),v.appendChild(u),x.appendChild(a),i.appendChild(e),i.appendChild(s),i.appendChild(t),m.appendChild(i),x.appendChild(r),n.appendChild(c),n.appendChild(l),n.appendChild(g),m.appendChild(n),j(a,A),j(r,C),Z(e,t,u,A,C,o,"Izq",s),Z(c,g,u,A,C,o,"Der",l)}}function j(b,o){var y=["Combinación 01","Combinación 02 Max","Combinación 02 Min","Combinación 03 Max","Combinación 03 Min","Combinación 04 Max","Combinación 04 Min","Combinación 05 Max","Combinación 05 Min","Combinación 06 Max","Combinación 06 Min","Combinación 07 Max","Combinación 07 Min","Combinación 08 Max","Combinación 08 Min","Combinación 09 Max","Combinación 09 Min"],A=o.map((C,v)=>[y[v],...C]);Handsontable(b,{data:A,rowHeaders:!0,colHeaders:!0,height:"auto",autoWrapRow:!0,autoWrapCol:!0,colWidths:100,nestedHeaders:[["Combinaciones","Pu","Mux","Muy"],["Carga","(Ton)","(Ton.m)","(Ton.m)"]],columns:[{type:"text",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0}],licenseKey:"non-commercial-and-evaluation"})}function Z(b,o,y,A,C,v,x,m){var u=x=="Izq"?"Dirección X-X":"Dirección Y-Y",a=[[1,0,0,0,0,0,0],[2,0,0,0,0,0,0],[3,0,0,0,0,0,0],[4,0,0,0,0,0,0],[5,0,0,0,0,0,0],[6,0,0,0,0,0,0],[7,0,0,0,0,0,0],[8,0,0,0,0,0,0],[9,0,0,0,0,0,0],[10,0,0,0,0,0,0],[11,0,0,0,0,0,0]],i=Handsontable(b,{data:a,rowHeaders:!0,colHeaders:!0,height:"auto",autoWrapRow:!0,autoWrapCol:!0,colWidths:100,nestedHeaders:[["Incluido "+u],["Puntos","P","M2","M3","P","M2","M3"],["","(Ton)","(Ton.m)","(Ton.m)","(Ton)","(Ton.m)","(Ton.m)"]],columns:[{type:"numeric",readOnly:!0},{type:"numeric"},{type:"numeric"},{type:"numeric"},{type:"numeric"},{type:"numeric"},{type:"numeric"}],afterPaste:function(r,n){r.forEach(function(c,l){var g=n[0].startRow,d=n[0].startCol,D=n[0].endCol;let f=0;for(let p=d;p<=D;p++)i.setDataAtCell(g+l,p,c[f]),f++})},licenseKey:"non-commercial-and-evaluation"}),e=[[1,0,0,0,0,0,0],[2,0,0,0,0,0,0],[3,0,0,0,0,0,0],[4,0,0,0,0,0,0],[5,0,0,0,0,0,0],[6,0,0,0,0,0,0],[7,0,0,0,0,0,0],[8,0,0,0,0,0,0],[9,0,0,0,0,0,0],[10,0,0,0,0,0,0],[11,0,0,0,0,0,0]],s=Handsontable(m,{data:e,rowHeaders:!0,colHeaders:!0,height:"auto",autoWrapRow:!0,autoWrapCol:!0,colWidths:100,nestedHeaders:[["Excluido "+u],["Puntos","P","M2","M3","P","M2","M3"],["","(Ton)","(Ton.m)","(Ton.m)","(Ton)","(Ton.m)","(Ton.m)"]],columns:[{type:"numeric",readOnly:!0},{type:"numeric"},{type:"numeric"},{type:"numeric"},{type:"numeric"},{type:"numeric"},{type:"numeric"}],afterPaste:function(r,n){r.forEach(function(c,l){var g=n[0].startRow,d=n[0].startCol,D=n[0].endCol;let f=0;for(let p=d;p<=D;p++)s.setDataAtCell(g+l,p,c[f]),f++})},licenseKey:"non-commercial-and-evaluation"});o.addEventListener("click",t);function t(){for(var r=!0,n=i.getData(),c=s.getData(),l=0;l<n.length;l++){for(var g=0;g<n[l].length;g++)if(n[l][g]===null||n[l][g]===""){r=!1;break}if(!r)break}r?(console.log("Datos de la tabla graph1 HOT:",c),Ee(y,A,C,n,v,x,c)):alert("Hay celdas vacías")}}function Ee(b,o,y,A,C,v,x){var m=document.createElement("div"),u=[],a=[];v=="Izq"?(u=o.map(c=>[c[0],c[1]]),a=y.map(c=>[c[0],c[1]])):(u=o.map(c=>[c[0],c[2]]),a=y.map(c=>[c[0],c[2]]));var i=A.map(c=>[c[4],c[6]]),e=A.map(c=>[c[1],c[3]]),s=x.map(c=>[c[4],c[6]]),t=x.map(c=>[c[1],c[3]]),r=`graph${v}${C}`;if(document.getElementById(r))we(r,u,a,i,e,s,t);else{var n=document.createElement("canvas");n.id=r,n.width=400,n.height=400,m.appendChild(n),b.appendChild(m),Me(r,n,u,a,i,e,s,t,C,v)}}function we(b,o,y,A,C,v,x){var m=Ce[b];m&&(m.data.datasets[0].data=o.map(function(u){return{x:u[1],y:u[0]}}),m.data.datasets[1].data=y.map(function(u){return{x:u[1],y:u[0]}}),m.data.datasets[2].data=A.map(function(u){return{x:u[1],y:u[0]}}),m.data.datasets[3].data=C.map(function(u){return{x:u[1],y:u[0]}}),m.data.datasets[4].data=v.map(function(u){return{x:u[1],y:u[0]}}),m.data.datasets[5].data=x.map(function(u){return{x:u[1],y:u[0]}}),m.update())}function Me(b,o,y,i,e,s,t,r,u,a){y=y.map(function(l){return{x:l[1],y:l[0]}});var i=i.map(function(l){return{x:l[1],y:l[0]}}),e=e.map(function(l){return{x:l[1],y:l[0]}}),s=s.map(function(l){return{x:l[1],y:l[0]}}),t=t.map(function(l){return{x:l[1],y:l[0]}}),r=r.map(function(l){return{x:l[1],y:l[0]}}),n={type:"scatter",data:{datasets:[{label:`SC Piso ${u*2-1} (Mux, Pu)`,data:y,borderColor:"blue",backgroundColor:"blue",borderWidth:1},{label:`SC Piso ${u*2} (Mux, Pu)`,data:i,borderColor:"green",backgroundColor:"green",borderWidth:1},{label:"DI Incluido X-X",data:e,borderColor:a=="Izq"?"red":"blue",backgroundColor:a=="Izq"?"red":"blue",borderWidth:0,fill:!1,type:"line"},{label:"DI Incluido Y-Y",data:s,borderColor:a=="Izq"?"red":"blue",backgroundColor:a=="Izq"?"red":"blue",borderWidth:0,fill:!1,type:"line"},{label:"DI Excluido X-X",data:t,borderColor:"green",backgroundColor:"green",borderWidth:0,fill:!1,type:"line"},{label:"DI Excluido Y-Y",data:r,borderColor:"yellow",backgroundColor:"yellow",borderWidth:0,fill:!1,type:"line"}]},options:{responsive:!0,plugins:{title:{display:!0,text:"DIAGRAMA DE INTERACCIÓN"}},scales:{x:{type:"linear",min:-6e3,max:6e3,position:"bottom",title:{display:!0,text:"Eje X"}},y:{type:"linear",min:-1500,max:3500,position:"left",title:{display:!0,text:"Eje Y"}}}}},c=new Chart(o,n);charts.canvaId=c}function Ie(b,o,y){var A=b,C=[];for(let t=0;t<o.length;t++){var v=y.agVA,x=y.lgxVA,m=3,u=o[t][1],a=x/m*(2*Math.sqrt(y.fcDF*10)+u/v),i=1.2*a,e=[`Piso ${t+1}`,v,x,m,u,a,i,"","",""];C.push(e)}var s=new Handsontable(A,{data:C,rowHeaders:!0,colHeaders:!0,height:"auto",autoWrapRow:!0,autoWrapCol:!0,colWidths:100,nestedHeaders:[["Nivel","Ag","Lgx","Ycg","Pu","Mcr","1.2 x Mucr","Mnx","Mn/Mcr","Verificación"],["","(m²)","(m4)","(m)","(Ton)","(Ton.m)","(Ton.m)","(Ton.m)","","Agrietamiento"]],columns:[{type:"text",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric"},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric"},{type:"text",readOnly:!0}],afterChange:function(t,r){if(r==="edit"){var n=this;t.forEach(function(c){var l=c[0],g=c[1],d=c[3];g===3&&n.setDataAtCell(l,5,n.getDataAtCell(l,2)/d*(2*Math.sqrt(y.fcDF*10)+n.getDataAtCell(l,4)/n.getDataAtCell(l,1))),g==5&&n.setDataAtCell(l,6,1.2*d),g==6&&n.setDataAtCell(l,9,n.getDataAtCell(l,7)>=d?"Sí cumple":"No cumple, verificar"),g===7&&(n.setDataAtCell(l,8,d/n.getDataAtCell(l,5)),n.setDataAtCell(l,9,d>=n.getDataAtCell(l,6)?"Sí cumple":"No cumple, verificar"))})}},afterPaste:function(t,r){t.forEach(function(n,c){var l=r[0].startRow,g=r[0].startCol,d=r[0].endCol;let D=0;for(let f=g;f<=d;f++)s.setDataAtCell(l+c,f,n[D]),D++})},licenseKey:"non-commercial-and-evaluation"})}function Te(b,o,y){var A=b,C=[];for(let t=0;t<o.length;t++){var v=y.agVA,x=y.lgyVA,m=3,u=o[t][1],a=x/m*(2*Math.sqrt(y.fcDF*10)+u/v),i=1.2*a,e=[`Piso ${t+1}`,v,x,m,u,a,i,"","",""];C.push(e)}var s=new Handsontable(A,{data:C,rowHeaders:!0,colHeaders:!0,height:"auto",autoWrapRow:!0,autoWrapCol:!0,colWidths:100,nestedHeaders:[["Nivel","Ag","Lgy","Xcg","Pu","Mcr","1.2 x Mucr","Mny","Mn/Mcr","Verificación"],["","(m²)","(m4)","(m)","(Ton)","(Ton.m)","(Ton.m)","(Ton.m)","","Agrietamiento"]],columns:[{type:"text",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric"},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric"},{type:"text",readOnly:!0}],afterChange:function(t,r){if(r==="edit"){var n=this;t.forEach(function(c){var l=c[0],g=c[1],d=c[3];g===3&&n.setDataAtCell(l,5,n.getDataAtCell(l,2)/d*(2*Math.sqrt(y.fcDF*10)+n.getDataAtCell(l,4)/n.getDataAtCell(l,1))),g==5&&n.setDataAtCell(l,6,1.2*d),g==6&&n.setDataAtCell(l,9,n.getDataAtCell(l,7)>=d?"Sí cumple":"No cumple, verificar"),g===7&&(n.setDataAtCell(l,8,d/n.getDataAtCell(l,5)),n.setDataAtCell(l,9,d>=n.getDataAtCell(l,6)?"Sí cumple":"No cumple, verificar"))})}},afterPaste:function(t,r){t.forEach(function(n,c){var l=r[0].startRow,g=r[0].startCol,d=r[0].endCol;let D=0;for(let f=g;f<=d;f++)s.setDataAtCell(l+c,f,n[D]),D++})},licenseKey:"non-commercial-and-evaluation"})}function Le(b,o,y,A){var C=b,v=[];for(let r=0;r<o.length;r++){var x=A[r][2],m=y.exDF,u=y.agVA,a=1,i=.55*y.designCP*y.fcDF*10*u*(1-Math.pow(a*x/(32*m),2)),e=o[r][1],s=i>=e?"Sí cumple":"No cumple, verificar",t=[`Piso ${r+1}`,x,m,u,"Muros Arriostrados No Restringidos",a,i,e,s];v.push(t)}new Handsontable(C,{data:v,rowHeaders:!0,colHeaders:!0,height:"auto",autoWrapRow:!0,autoWrapCol:!0,colWidths:100,nestedHeaders:[["Nivel","lc","t","Ag","Casos para Definir","k","ØPn","Pu","Verificación"],["","(m)","(m)","(m²)",'Factor de Longitud Efectiva "k"',"","(Ton)","(Ton)","Compresión Pura"]],columns:[{type:"text",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"dropdown",source:["Muros Arriostrados Restringidos","Muros Arriostrados No Restringidos","Muros No Arriostrados"]},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"text"}],afterChange:function(r,n){if(n==="edit"){var c=this;r.forEach(function(l){var g=l[0],d=l[1],D=l[3];if(d===4){var f=D,p=0;f=="Muros Arriostrados Restringidos"?p=.8:f=="Muros Arriostrados No Restringidos"?p=1:f=="Muros No Arriostrados"&&(p=2),c.setDataAtCell(g,5,p)}d==5&&c.setDataAtCell(g,6,.55*y.designCP*y.fcDF*10*c.getDataAtCell(g,3)*(1-Math.pow(D*c.getDataAtCell(g,1)/(32*c.getDataAtCell(g,2)),2))),d==6&&c.setDataAtCell(g,8,D>=c.getDataAtCell(g,7)?"Sí cumple":"No cumple, verificar")})}},licenseKey:"non-commercial-and-evaluation"})}function Be(b,o,y,A){var C=b,v=[];for(let r=0;r<o.length;r++){var x=A[r][2],m=y.eyDF,u=y.agVA,a=1,i=.55*y.designCP*y.fcDF*10*u*(1-Math.pow(a*x/(32*m),2)),e=o[r][1],s=i>=e?"Sí cumple":"No cumple, verificar",t=[`Piso ${r+1}`,x,m,u,"Muros Arriostrados No Restringidos",a,i,e,s];v.push(t)}new Handsontable(C,{data:v,rowHeaders:!0,colHeaders:!0,height:"auto",autoWrapRow:!0,autoWrapCol:!0,colWidths:100,nestedHeaders:[["Nivel","lc","t","Ag","Casos para Definir","k","ØPn","Pu","Verificación"],["","(m)","(m)","(m²)",'Factor de Longitud Efectiva "k"',"","(Ton)","(Ton)","Compresión Pura"]],columns:[{type:"text",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"dropdown",source:["Muros Arriostrados Restringidos","Muros Arriostrados No Restringidos","Muros No Arriostrados"]},,{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"text"}],afterChange:function(r,n){if(n==="edit"){var c=this;r.forEach(function(l){var g=l[0],d=l[1],D=l[3];if(d===4){var f=D,p=0;f=="Muros Arriostrados Restringidos"?p=.8:f=="Muros Arriostrados No Restringidos"?p=1:f=="Muros No Arriostrados"&&(p=2),c.setDataAtCell(g,5,p)}d==5&&c.setDataAtCell(g,6,.55*y.designCP*y.fcDF*10*c.getDataAtCell(g,3)*(1-Math.pow(D*c.getDataAtCell(g,1)/(32*c.getDataAtCell(g,2)),2))),d==6&&c.setDataAtCell(g,8,D>=c.getDataAtCell(g,7)?"Sí cumple":"No cumple, verificar")})}},licenseKey:"non-commercial-and-evaluation"})}var _=[];function He(b,o,y,A,C){var v=b,x=[];for(let s=0;s<o.length;s++){var m=1,u=.6,a=[`Piso ${s+1}`,"Peso Normal",m,"Caso III",u,"","",A[s][3],A[s][3]*y.exDF*100*100,""];x.push(a)}var i=new Handsontable(v,{data:x,rowHeaders:!0,colHeaders:!0,height:"auto",autoWrapRow:!0,autoWrapCol:!0,colWidths:100,nestedHeaders:[["Nivel","Tipo","λ","Casos según","μ","Pcm","Nu","ρv","Av","ØVn"],["","Concreto",""," Artículo 11.7.4.3.","","(Ton)","(Ton)","","(cm²)","(Ton)"]],columns:[{type:"text",readOnly:!0},{type:"dropdown",source:["Peso Normal","Liviano - Arena de Peso Normal","Liviano"]},{type:"numeric",readOnly:!0},{type:"dropdown",source:["Caso I","Caso II","Caso III","Caso IV"]},{type:"numeric",readOnly:!0},{type:"numeric"},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0}],afterChange:function(s,t){if(t==="edit"){var r=this;s.forEach(function(n){var c=n[0],l=n[1],g=n[3];if(l===1){var d=g,D=0;d=="Peso Normal"?D=1:d=="Liviano - Arena de Peso Normal"?D=.75:d=="Liviano"&&(D=.85),r.setDataAtCell(c,2,D)}if(l==2){var D=g,f=r.getDataAtCell(c,3),p=0;f=="Caso I"?p=1.4*D:f=="Caso II"?p=D:f=="Caso III"?p=.6*D:f=="Caso IV"&&(p=.7*D),r.setDataAtCell(c,4,p)}if(l==3){var f=g,p=0;f=="Caso I"?p=1.4*r.getDataAtCell(c,2):f=="Caso II"?p=r.getDataAtCell(c,2):f=="Caso III"?p=.6*r.getDataAtCell(c,2):f=="Caso IV"&&(p=.7*r.getDataAtCell(c,2)),r.setDataAtCell(c,4,p)}l==4&&r.setDataAtCell(c,9,y.designDC*g*(r.getDataAtCell(c,6)+r.getDataAtCell(c,8)*y.fyDF/1e3)),l==5&&r.setDataAtCell(c,6,.9*g),l==6&&r.setDataAtCell(c,9,y.designDC*r.getDataAtCell(c,4)*(g+r.getDataAtCell(c,8)*y.fyDF/1e3)),l==8&&r.setDataAtCell(c,9,y.designDC*r.getDataAtCell(c,4)*(r.getDataAtCell(c,6)+g*y.fyDF/1e3))})}},afterPaste:function(s,t){console.log(s),console.log(t),s.forEach(function(r,n){var c=t[0].startRow,l=t[0].startCol,g=t[0].endCol;let d=0;for(let D=l;D<=g;D++)i.setDataAtCell(c+n,D,r[d]),d++})},licenseKey:"non-commercial-and-evaluation"});document.getElementById("saveDataBtnDD1X").addEventListener("click",e);function e(){_=i.getData();var s=document.getElementById("ddT2X");Ne(s,o,_,y);var t=document.getElementById("ddT1Y");Re(t,o,y,_,C)}}function Ne(b,o,y,A){var C=b,v=[];for(let r=0;r<o.length;r++){var x=A.agVA,m=.2*A.fcDF*x*10,u=55*x,a=Math.min(m,u),i=a>=y[r][9]?"Sí cumple":"No cumple, verificar",e=Math.min(y[r][9],a),s=e>=o[r][2]?"Sí cumple, no hay deslizamiento":"No cumple, verificar",t=[`Piso ${r+1}`,x,m,u,a,i,e,o[r][2],s];v.push(t)}new Handsontable(C,{data:v,rowHeaders:!0,colHeaders:!0,height:"auto",autoWrapRow:!0,autoWrapCol:!0,colWidths:100,nestedHeaders:[["Nivel","Ac","Vn máx 1","Vn máx 2","Vn máx","Verificación","ØVn","Vu máx","Juntas"],["","(m²)","(Ton)","(Ton)","(Ton)",'"Vn" Máximo',"(Ton)","(Ton)","Construcción"]],columns:[{type:"text",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"text",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"text",readOnly:!0}],licenseKey:"non-commercial-and-evaluation"})}var J=[];function Re(b,o,y,A,C){var v=b,x=[];for(let l=0;l<o.length;l++){var m=1,u=.6,a=A[l][5],i=.9*A[l][5],e=C[l][3],s=e*y.eyDF*100*100,t=y.designDC*u*(i+s*y.fyDF/1e3),r=[`Piso ${l+1}`,"Peso Normal",m,"Caso III",u,a,i,e,s,t];x.push(r)}var n=new Handsontable(v,{data:x,rowHeaders:!0,colHeaders:!0,height:"auto",autoWrapRow:!0,autoWrapCol:!0,colWidths:100,nestedHeaders:[["Nivel","Tipo","λ","Casos","μ","Pcm","Nu","ρv","Av","ØVn"],["","Concreto","","Artículo 11.7.4.3.","","(Ton)","(Ton)","","(cm²)","(Ton)"]],columns:[{type:"text",readOnly:!0},{type:"dropdown",source:["Peso Normal","Liviano - Arena de Peso Normal","Liviano"]},{type:"numeric",readOnly:!0},{type:"dropdown",source:["Caso I","Caso II","Caso III","Caso IV"]},{type:"numeric",readOnly:!0},{type:"numeric"},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0}],afterChange:function(l,g){if(g==="edit"){var d=this;l.forEach(function(D){var f=D[0],p=D[1],F=D[3];if(p===1){var E=F,O=0;E=="Peso Normal"?O=1:E=="Liviano - Arena de Peso Normal"?O=.75:E=="Liviano"&&(O=.85),d.setDataAtCell(f,2,O)}if(p==2){var O=F,w=d.getDataAtCell(f,3),M=0;w=="Caso I"?M=1.4*O:w=="Caso II"?M=O:w=="Caso III"?M=.6*O:w=="Caso IV"&&(M=.7*O),d.setDataAtCell(f,4,M)}if(p==3){var w=F,M=0;w=="Caso I"?M=1.4*d.getDataAtCell(f,2):w=="Caso II"?M=d.getDataAtCell(f,2):w=="Caso III"?M=.6*d.getDataAtCell(f,2):w=="Caso IV"&&(M=.7*d.getDataAtCell(f,2)),d.setDataAtCell(f,4,M)}p==4&&d.setDataAtCell(f,9,y.designDC*F*(d.getDataAtCell(f,6)+d.getDataAtCell(f,8)*y.fyDF/1e3)),p==5&&d.setDataAtCell(f,6,.9*F),p==6&&d.setDataAtCell(f,9,y.designDC*d.getDataAtCell(f,4)*(F+d.getDataAtCell(f,8)*y.fyDF/1e3)),p==8&&d.setDataAtCell(f,9,y.designDC*d.getDataAtCell(f,4)*(d.getDataAtCell(f,6)+F*y.fyDF/1e3))})}},afterPaste:function(l,g){console.log(l),console.log(g),l.forEach(function(d,D){var f=g[0].startRow,p=g[0].startCol,F=g[0].endCol;let E=0;for(let O=p;O<=F;O++)n.setDataAtCell(f+D,O,d[E]),E++})},licenseKey:"non-commercial-and-evaluation"});document.getElementById("saveDataBtnDD1Y").addEventListener("click",c);function c(){J=n.getData();var l=document.getElementById("ddT2Y");Ve(l,o,J,y)}}function Ve(b,o,y,A){var C=b,v=[];for(let r=0;r<o.length;r++){var x=A.agVA,m=.2*A.fcDF*x*10,u=55*x,a=Math.min(m,u),i=a>=y[r][9]?"Sí cumple":"No cumple, verificar",e=Math.min(y[r][9],a),s=e>=o[r][4]?"Sí cumple, no hay deslizamiento":"No cumple, verificar",t=[`Piso ${r+1}`,x,m,u,a,i,e,o[r][4],s];v.push(t)}new Handsontable(C,{data:v,rowHeaders:!0,colHeaders:!0,height:"auto",autoWrapRow:!0,autoWrapCol:!0,colWidths:100,nestedHeaders:[["Nivel","Ac","Vn máx 1","Vn máx 2","Vn máx","Verificación","ØVn","Vu máx","Juntas"],["","(m²)","(Ton)","(Ton)","(Ton)",'"Vn" Máximo',"(Ton)","(Ton)","Construcción"]],columns:[{type:"text",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"text",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"text",readOnly:!0}],licenseKey:"non-commercial-and-evaluation"})}var Q=[];function Pe(b,o,y){var A=b,C=[];for(let l=0;l<y.length;l++){var v=y[l][2],x=.3,m=1,u=.3,a=u+4*x,i=a*x,e=.55*o.designCP*o.fcDF*i*Math.pow(100,2)*(1-Math.pow(m*v/(32*x),2))/1e3,s=118.09,t=e>=s?"Sí cumple":"No cumple, verificar",r=[`Piso ${l+1}`,v,x,"Muros Arriostrados No Restringidos",m,u,a,i,e,s,t];C.push(r)}var n=new Handsontable(A,{data:C,rowHeaders:!0,colHeaders:!0,height:"auto",autoWrapRow:!0,autoWrapCol:!0,colWidths:100,nestedHeaders:[["Nivel","lc","emuro","Casos para Definir","k","Bviga","Befectivo","Ag","ØPn","Pu","Verificación"],["","(m)","(m)",'Factor de Longitud Efectiva "k"',"","(m)","(m)","(m²)","(Ton)","(Ton)","Espesor del Muro"]],columns:[{type:"text",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric"},{type:"dropdown",source:["Muros Arriostrados Restringidos","Muros Arriostrados No Restringidos","Muros No Arriostrados"]},{type:"numeric",readOnly:!0},{type:"numeric"},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric",readOnly:!0},{type:"numeric"},{type:"text",readOnly:!0}],afterChange:function(l,g){if(g==="edit"){var d=this;l.forEach(function(D){var f=D[0],p=D[1],F=D[3];if(p==2&&d.setDataAtCell(f,6,d.getDataAtCell(f,5)+4*F),p==3){var E=F,O=0;E=="Muros Arriostrados Restringidos"?O=.8:E=="Muros Arriostrados No Restringidos"?O=1:E=="Muros No Arriostrados"&&(O=2),d.setDataAtCell(f,4,O)}p==4&&d.setDataAtCell(f,8,.55*o.designCP*o.fcDF*d.getDataAtCell(f,7)*Math.pow(100,2)*(1-Math.pow(F*d.getDataAtCell(f,1)/(32*d.getDataAtCell(f,2)),2))/1e3),p==5&&d.setDataAtCell(f,6,F+4*d.getDataAtCell(f,2)),p==6&&d.setDataAtCell(f,7,F*d.getDataAtCell(f,2)),p==7&&d.setDataAtCell(f,8,.55*o.designCP*o.fcDF*F*Math.pow(100,2)*(1-Math.pow(d.getDataAtCell(f,4)*d.getDataAtCell(f,1)/(32*d.getDataAtCell(f,2)),2))/1e3),p==8&&d.setDataAtCell(f,10,F>=d.getDataAtCell(f,9)?"Sí cumple":"No cumple, verificar"),p==9&&d.setDataAtCell(f,10,d.getDataAtCell(f,8)>=F?"Sí cumple":"No cumple, verificar")})}},afterPaste:function(l,g){console.log(l),console.log(g),l.forEach(function(d,D){var f=g[0].startRow,p=g[0].startCol,F=g[0].endCol;let E=0;for(let O=p;O<=F;O++)n.setDataAtCell(f+D,O,d[E]),E++})},licenseKey:"non-commercial-and-evaluation"});document.getElementById("saveDataBtnEL1X").addEventListener("click",c);function c(){Q=n.getData();var l=document.getElementById("elT2");We(l,Q)}}function We(b,o){var y=b,A=[];for(let a=0;a<o.length;a++){var C="Sí",v=C=="Sí"?o[a][5]+.1:"-",x=C=="Sí"?"Diseña Sección como si Fuera una Columna":"No Diseñar y/o Verificar",m=[`Piso ${a+1}`,C,v,x];A.push(m)}var u=new Handsontable(y,{data:A,rowHeaders:!0,colHeaders:!0,height:"auto",autoWrapRow:!0,autoWrapCol:!0,colWidths:100,colHeaders:["Nivel","¿Se Aplica Diseño?","Bcol (m)","Aplicación del Diseño según Artículo 21.9.3.5."],columns:[{type:"text",readOnly:!0},{type:"dropdown",source:["Sí","No"]},{type:"numeric",readOnly:!0},{type:"text",readOnly:!0}],afterChange:function(a,i){if(i==="edit"){var e=this;a.forEach(function(s){var t=s[0],r=s[1],n=s[3];if(r==1){var c=n,l=0,g="";c=="Sí"?(l=o[t][5]+.1,g="Diseña Sección como si Fuera una Columna"):c=="No"&&(l="-",g="No Diseñar y/o Verificar"),e.setDataAtCell(t,2,l),e.setDataAtCell(t,3,g)}})}},afterPaste:function(a,i){console.log(a),console.log(i),a.forEach(function(e,s){var t=i[0].startRow,r=i[0].startCol,n=i[0].endCol;let c=0;for(let l=r;l<=n;l++)u.setDataAtCell(t+s,l,e[c]),c++})},licenseKey:"non-commercial-and-evaluation"})}document.addEventListener("DOMContentLoaded",function(){var b=document.getElementsByClassName("collapsible-btn"),o;for(o=0;o<b.length;o++)b[o].addEventListener("click",function(){var l=this.getAttribute("data-target"),g=document.getElementById(l);g&&g.classList.toggle("d-none")});var y=document.getElementById("solicitudCargaT1");U(y);var A=280,C=.9,v=1500*Math.sqrt(A),x=2.1*Math.pow(10,6),m=.003,u=.85,a=`<form id="generalForm" class="mt-2" met   d="post">
    <div class="col-md-12 mx-auto text-center">
      <label class="text-gray-950 dark:text-white" for="generalSelect">Cargar hoja</label>
      <div class="input-group mb-2">
        <select
          name="generalSelect"
          id="generalSelect"
          class="form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
        >
          <option value="0.9" selected>Flexión</option>
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
      <div class="text-gray-950 dark:text-white" id="generalSelectText">Ø ${C}</div>
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
            placeholder="${v}"
            min="0"
            step="any"
            value="${v}"
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
            placeholder="${x}"
            min="0"
            step="any"
            value="${x}"
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
      <div class="col-md-12 mx-auto text-center">
        <label for="β1DF">β1</label>
        <div class="input-group mb-2">
          <input
            type="number"
            name="β1DF"
            class="form-control text-center"
            id="β1DF"
            placeholder="${u}"
            min="0"
            step="any"
            value="${u}"
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
  </form>`;function i(){const l=document.getElementById("toggleFormButton"),g=document.getElementById("formContainer"),d=document.getElementById("formColumn"),D=document.getElementById("resultadosContainer"),f=l.querySelector("i");function p(){d.classList.toggle("col-md-2"),d.classList.toggle("col-md-1"),D.classList.toggle("col-md-10"),D.classList.toggle("col-md-11"),f.classList.toggle("fa-chevron-left"),f.classList.toggle("fa-chevron-right")}function F(){g.style.display="none",f.classList.add("d-none"),d.classList.contains("col-md-2")&&p()}function E(){setTimeout(function(){g.style.display="block",f.classList.remove("d-none"),p()},100)}l.addEventListener("click",function(){g.style.display=g.style.display==="none"?"block":"none",p()}),window.addEventListener("beforeprint",F),window.addEventListener("afterprint",E)}i();var e=document.getElementById("formContainer");e.innerHTML=a;var s=document.getElementById("lxDF");s.addEventListener("input",function(l){document.getElementById("dxDF").value=(.8*parseFloat(this.value)).toFixed(2),document.getElementById("lnucxDF").value=(parseFloat(this.value)-2*parseFloat(document.getElementById("zcxDF").value)).toFixed(2)});var t=document.getElementById("lyDF");t.addEventListener("input",function(l){document.getElementById("dyDF").value=(.8*parseFloat(this.value)).toFixed(2),document.getElementById("lnucyDF").value=(parseFloat(this.value)-2*parseFloat(document.getElementById("zCyDF").value)).toFixed(2)});var r=document.getElementById("generalSelect");r.addEventListener("change",function(l){document.getElementById("generalSelectText").innerHTML=`Ø ${this.value}`,C=parseFloat(this.value),C==.85?(document.getElementById("acwyDC").classList.remove("d-none"),document.getElementById("acwxDC").classList.remove("d-none")):(document.getElementById("acwyDC").classList.add("d-none"),document.getElementById("acwxDC").classList.add("d-none"))});var n=document.getElementById("fcDF");n.addEventListener("input",function(l){document.getElementById("ecDF").value=(15e3*Math.sqrt(parseFloat(this.value))).toFixed(2),document.getElementById("β1DF").value=(parseFloat(this.value)<=280?.85:parseFloat(this.value)<=350?.8:parseFloat(this.value)<=420?.75:parseFloat(this.value)<=490?.7:.65).toFixed(2)}),ae();var c=document.getElementById("generalForm");c.addEventListener("submit",function(l){l.preventDefault();var g=new FormData(this),d={};for(var D of g.entries())d[D[0]]=D[1];var f=$.map(O=>[O[0],O[2],O[5]]);if(d.generalSelect==.9){var p=document.getElementById("flexDesingT1X"),F=document.getElementById("flexDesingT1Y");ne(p,H,d),ie(F,H,d),document.getElementById("content2").classList.remove("d-none"),document.getElementById("content3").classList.add("d-none"),document.getElementById("content4").classList.add("d-none"),document.getElementById("content5").classList.add("d-none"),document.getElementById("content6").classList.add("d-none"),document.getElementById("content7").classList.add("d-none"),document.getElementById("content8").classList.add("d-none")}else if(d.generalSelect==.85){var p=document.getElementById("cutDesingT1X"),F=document.getElementById("cutDesingT1Y");se(p,H,d),ye(F,H,d),document.getElementById("content2").classList.add("d-none"),document.getElementById("content3").classList.remove("d-none"),document.getElementById("content4").classList.add("d-none"),document.getElementById("content5").classList.add("d-none"),document.getElementById("content6").classList.add("d-none"),document.getElementById("content7").classList.add("d-none"),document.getElementById("content8").classList.add("d-none")}else if(d.generalSelect==0){var p=document.getElementById("diT1X"),F=document.getElementById("diT1Y");if(L==[]){alert("Llene datos en la tabla 1 X-X de diseño corte");return}if(N==[]){alert("Llene datos en la tabla 1 Y-Y de diseño corte");return}if(Y==[]){alert("Llene datos en la tabla 2 X-X de diseño flexión");return}if(X==[]){alert("Llene datos en la tabla 2 Y-Y de diseño flexión");return}if(h==[]){alert("Llene datos en la tabla 3 X-X de diseño corte");return}if(S==[]){alert("Llene datos en la tabla 3 Y-Y de diseño corte");return}ge(p,H,L,Y,h,d),xe(F,H,N,X,S,d),be(f),document.getElementById("content2").classList.add("d-none"),document.getElementById("content3").classList.add("d-none"),document.getElementById("content4").classList.remove("d-none"),document.getElementById("content5").classList.add("d-none"),document.getElementById("content6").classList.add("d-none"),document.getElementById("content7").classList.add("d-none"),document.getElementById("content8").classList.add("d-none")}else if(d.generalSelect==1){document.getElementById("content2").classList.add("d-none"),document.getElementById("content3").classList.add("d-none"),document.getElementById("content4").classList.add("d-none"),document.getElementById("content5").classList.remove("d-none"),document.getElementById("content6").classList.add("d-none"),document.getElementById("content7").classList.add("d-none"),document.getElementById("content8").classList.add("d-none");var p=document.getElementById("vaT1X"),F=document.getElementById("vaT1Y");Ie(p,H,d),Te(F,H,d)}else if(d.generalSelect==2){document.getElementById("content2").classList.add("d-none"),document.getElementById("content3").classList.add("d-none"),document.getElementById("content4").classList.add("d-none"),document.getElementById("content5").classList.add("d-none"),document.getElementById("content6").classList.remove("d-none"),document.getElementById("content7").classList.add("d-none"),document.getElementById("content8").classList.add("d-none");var p=document.getElementById("dcpT1X"),F=document.getElementById("dcpT1Y");Le(p,H,d,L),Be(F,H,d,L)}else if(d.generalSelect==3){var p=document.getElementById("ddT1X"),F=document.getElementById("ddT1Y");document.getElementById("content2").classList.add("d-none"),document.getElementById("content3").classList.add("d-none"),document.getElementById("content4").classList.add("d-none"),document.getElementById("content5").classList.add("d-none"),document.getElementById("content6").classList.add("d-none"),document.getElementById("content7").classList.remove("d-none"),document.getElementById("content8").classList.add("d-none"),He(p,H,d,h,S)}else if(d.generalSelect==4){var E=document.getElementById("elT1");document.getElementById("content2").classList.add("d-none"),document.getElementById("content3").classList.add("d-none"),document.getElementById("content4").classList.add("d-none"),document.getElementById("content5").classList.add("d-none"),document.getElementById("content6").classList.add("d-none"),document.getElementById("content7").classList.add("d-none"),document.getElementById("content8").classList.remove("d-none"),Pe(E,d,L)}})});
