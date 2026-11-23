import {readFileSync,readdirSync,existsSync} from 'node:fs';
import {resolve,join} from 'node:path';

const workerPackages=['@mlightcad/data-model','@mlightcad/cad-simple-viewer','@mlightcad/libredwg-converter','@mlightcad/libredwg-web'];
export function packageRootForModule(id) {
  const path=id.replaceAll('\\','/').split('?')[0];
  const matches=[...path.matchAll(/\/node_modules\/((?:@[^/]+\/)?[^/]+)/g)];
  const match=matches.at(-1);
  if(!match)return null;
  return path.slice(0,match.index)+'/node_modules/'+match[1];
}

export function buildThirdPartyNotices(roots,{root=process.cwd()}={}) {
  const assets=new Map(), packages=[];
  const gplFile=join(root,'node_modules/@mlightcad/libredwg-converter/LICENSE');
  for(const folder of [...new Set([...roots].map(path=>resolve(path)))].sort()){
    const json=join(folder,'package.json');if(!existsSync(json))continue;
    const info=JSON.parse(readFileSync(json,'utf8'));
    const slug=(info.name+'-'+info.version).replace(/[^a-zA-Z0-9._-]/g,'_');
    const names=readdirSync(folder,{withFileTypes:true}).filter(f=>f.isFile()&&/^(licen[cs]e(?:[._-].*)?|copying(?:[._-].*)?|notice(?:[._-].*)?|copyright(?:[._-].*)?|authors(?:[._-].*)?)$/i.test(f.name)).map(f=>f.name);
    const files=[];
    for(const name of names){
      const file='licenses/texts/'+slug+'/'+name;
      const content=readFileSync(join(folder,name),'utf8');assets.set(file,content);files.push({name,url:'/build/'+file});
    }
    // Algunos paquetes conservan el aviso en la cabecera del módulo principal.
    // Se copia literalmente; un aviso parcial no sustituye la licencia ausente.
    if(!names.length){
      const sources=new Set([info.main,...readdirSync(folder).filter(name=>/\.js$/i.test(name)&&!name.endsWith('.min.js'))].filter(name=>typeof name==='string'));
      for(const source of sources){
      const main=resolve(folder,source);
      if(main.startsWith(folder+'/')||main.startsWith(folder+'\\')){
        if(existsSync(main)){
          const header=readFileSync(main,'utf8').match(/^\s*(\/\*[\s\S]*?\*\/)/)?.[1];
          if(header&&/copyright|license|licence/i.test(header)){
            const name=source.replace(/[^a-zA-Z0-9._-]/g,'_')+'-NOTICE.txt';
            const file='licenses/texts/'+slug+'/'+name;
            assets.set(file,header+'\n');files.push({name,url:'/build/'+file});
          }
        }
      }
      }
    }
    const license=typeof info.license==='string'?info.license:info.license?.type||'NOASSERTION';
    // Algunos paquetes WASM publican solo README y metadatos. Se conserva la
    // GPL canónica, indicando que no sustituye los avisos específicos faltantes.
    if(!files.length&&license.startsWith('GPL-3.0')&&existsSync(gplFile)){
      const file='licenses/texts/'+slug+'/GPL-3.0.txt';assets.set(file,readFileSync(gplFile,'utf8'));files.push({name:'GPL-3.0.txt',url:'/build/'+file});
    }
    const repository=typeof info.repository==='string'?info.repository:info.repository?.url;
    packages.push({name:info.name,version:info.version,license,repository:repository?.replace(/^git\+/,'').replace(/\.git$/,''),files,
      reviewRequired:/GPL|AGPL|NOASSERTION/.test(license)||!names.length,
      missingPackageNotices:!names.length});
  }
  packages.sort((a,b)=>a.name.localeCompare(b.name)||a.version.localeCompare(b.version));
  const inventory={product:'NovaCad',scope:'Paquetes identificados en los chunks de esta compilación y sus workers copiados; las dependencias embebidas por proveedores requieren también revisión de sus avisos.',
    legalStatus:'Inventario y avisos; no constituye una certificación de cumplimiento.',packages};
  const notices=['NOVACAD — AVISOS DE COMPONENTES DE TERCEROS','La interfaz e integración NovaCad corresponden a Rizabal & Asociados. Los componentes de terceros conservan sus autores y licencias.','La inclusión de textos de licencia no sustituye las obligaciones sobre código fuente correspondiente u otras condiciones de redistribución.',''];
  for(const pkg of packages){
    notices.push('='.repeat(72),`${pkg.name} ${pkg.version} — ${pkg.license}`,pkg.repository||'');
    for(const f of pkg.files)notices.push('\n'+f.name+'\n',assets.get(f.url.replace('/build/','')));
    if(pkg.missingPackageNotices)notices.push('Revisar avisos específicos del paquete: no incluidos en la raíz del paquete npm instalado.');
  }
  assets.set('licenses/inventory.json',JSON.stringify(inventory,null,2)+'\n');
  assets.set('licenses/THIRD-PARTY-NOTICES.txt',notices.join('\n')+'\n');
  return {assets,inventory};
}

export function novaCadNoticesPlugin({root=process.cwd()}={}) {
  return {name:'novacad-third-party-notices',apply:'build',generateBundle(_options,bundle){
    const roots=new Set(workerPackages.map(name=>resolve(root,'node_modules',name)));
    for(const chunk of Object.values(bundle))if(chunk.type==='chunk')for(const id of Object.keys(chunk.modules)){const folder=packageRootForModule(id);if(folder)roots.add(folder);}
    const {assets,inventory}=buildThirdPartyNotices(roots,{root});
    for(const [fileName,source] of assets)this.emitFile({type:'asset',fileName,source});
    const pending=inventory.packages.filter(p=>p.reviewRequired);
    if(pending.length)this.warn('NovaCad: '+pending.length+' paquetes requieren revisión de licencias/avisos antes de distribución; ver build/licenses/inventory.json.');
  }};
}
