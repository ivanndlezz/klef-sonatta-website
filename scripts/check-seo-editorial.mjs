import { readFileSync, existsSync } from 'node:fs';
import assert from 'node:assert/strict';
const html=readFileSync('blog/esta-muriendo-el-seo-en-2026/index.html','utf8');
const js=readFileSync('assets/scripts/seo-editorial-v2.js','utf8');
const css=readFileSync('assets/styles/seo-editorial-v2.css','utf8');
for(const asset of ['../../assets/styles/seo-editorial-v2.css','../../assets/scripts/seo-editorial-v2.js'])assert.ok(html.includes(asset), 'Missing asset: '+asset);
assert.ok(!html.includes('seo-visual-essay.js'), 'Legacy enhancement still loaded');
assert.ok(!html.includes('seo-visual-essay.css'), 'Legacy stylesheet still loaded');
for(const field of ['rel="canonical"','application/ld+json','og:image','twitter:card','<h1>','<div class="klef-blog-prose">'])assert.ok(html.includes(field), 'Missing article metadata/content: '+field);
for(const heading of ['La trampa del titular alarmista','Primero, los números','El nuevo sistema: cuatro capas','Qué debería hacer un negocio','Conclusión','Fuentes'])assert.ok(html.includes(heading), 'Missing article section: '+heading);
for(const component of ['seo-editorial-cover','seo-thesis','seo-reading-map','seo-compare-grid','seo-system-control','seo-timeline','seo-pullquote']){assert.ok(js.includes(component), 'Missing component in JS: '+component);assert.ok(css.includes(component), 'Missing component styling: '+component)}
assert.ok(js.includes('aria-pressed'), 'Missing accessible interaction state');
assert.ok(css.includes('prefers-reduced-motion'), 'Missing reduced-motion preference');
assert.ok(css.includes('@media(max-width:760px)'), 'Missing mobile breakpoint');
assert.ok(existsSync('assets/images/blog/ivanklef/seo-2026.webp'), 'Original image missing');
console.log('SEO editorial structural checks passed');
