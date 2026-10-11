import {readFileSync,writeFileSync,mkdirSync,rmSync,copyFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(fileURLToPath(new URL('../',import.meta.url)));
const out=path.join(root,'docs');rmSync(out,{recursive:true,force:true});mkdirSync(out);
const assets=['style.css','monogram.svg','memory-1.svg','memory-2.svg','memory-3.svg'];for(const file of assets)copyFileSync(path.join(root,'public',file),path.join(out,file));
let html=readFileSync(path.join(root,'public/index.html'),'utf8');html=html.replace('<body class="film-layout">','<body class="film-layout" data-demo="true">').replace(/(href|src)="\/(?!\/)/g,'$1="./').replace('</header>','</header><aside class="demo-banner" role="note">BẢN DEMO GIAO DIỆN · Xác nhận tham dự và lời chúc chưa được gửi hoặc lưu.</aside>');writeFileSync(path.join(out,'index.html'),html);
let js=readFileSync(path.join(root,'public/app.js'),'utf8');js=js.replace("fetch('/api/content')","fetch('./content.json')").replace('`/memory-${n}.svg`','`./memory-${n}.svg`');writeFileSync(path.join(out,'app.js'),js);
const content=JSON.parse(readFileSync(path.join(root,'public/content.json'),'utf8'));for(const m of content.memories)if(m.src.startsWith('/')&&!m.src.startsWith('//'))m.src='.'+m.src;writeFileSync(path.join(out,'content.json'),JSON.stringify(content,null,2)+'\n');writeFileSync(path.join(out,'.nojekyll'),'');console.log('GitHub Pages demo built in docs/');
