'use strict';
const products = [
 {id:'compound',name:'Rubber compounds',image:'mixing',categories:['industrial'],summary:'Natural and synthetic formulations, developed for your material and processing needs.',description:'Custom rubber compounds supported by mixing, property adjustment, cure optimization and trial batches. Development begins with your application, process and target performance.',examples:['Natural rubber','Synthetic elastomers','Custom formulations','Trial batches'],inquiry:'Rubber compounds'},
 {id:'molded',name:'Custom molded components',image:'components',categories:['industrial'],summary:'Precision in every requirement. Molded parts made to your drawing or sample.',description:'Compression and injection molding for customer-specific components across automotive, electronics, oil and gas, household and general industrial applications.',examples:['Seals & gaskets','Boots & bellows','Bushings & pads','Diaphragms','Rubber-metal bonded parts','Silicone molded parts'],inquiry:'Custom molded components'},
 {id:'extrusion',name:'Extruded rubber profiles',image:'extrusion',categories:['industrial'],summary:'Continuous profiles, tubes and strips shaped around your application.',description:'Rubber extrusion for profiles, hoses, tubes, cords and strips. Share your cross-section, dimensions and material requirements to discuss development.',examples:['Custom profiles','Tubes & cords','Hoses','Rubber strips','Sealing profiles'],inquiry:'Extruded rubber profiles'},
 {id:'footwear',name:'Footwear outsoles & foxing',image:'footwear',categories:['footwear'],summary:'Distinctive soles and footwear components, from concept to collection.',description:'PT Semesta Olah Lestari develops rubber outsoles and foxing to suit footwear brands’ requirements. Material, hardness, color, pattern and performance can be developed for each project.',examples:['Sports footwear','Casual footwear','Safety footwear','Military footwear','Sandal soles','Foxing'],inquiry:'Footwear outsoles & foxing'},
 {id:'marine',name:'Marine fenders & bumpers',image:'fenders',categories:['marine','industrial'],summary:'Impact protection for ports, warehouses and heavy industrial applications.',description:'Rubber fenders and protection products developed to suit the application. The group’s range includes marine fenders, warehouse bumpers, pier support pads and rubber rolls.',examples:['V / Arch','D type','Cell','Cone','Cylindrical','Square','Pneumatic','Warehouse bumpers'],inquiry:'Marine fenders & bumpers'},
 {id:'recycled',name:'Recycled rubber & surfaces',image:'recycling',categories:['recycled'],summary:'Powder, granules and surface applications that put rubber back to work.',description:'Recovered rubber processed into powder and granules for reuse in secondary applications, including Grade-C compounds, rubber paving, tiles and recreational surfaces.',examples:['Rubber powder','Rubber granules','Rubber tiles','Paving','Jogging tracks','Futsal surfaces','Playground surfaces'],inquiry:'Recycled rubber & surfaces'}
];
const companies = {
 srf:{abbr:'SRF',name:'Santo Rubber Factory',description:'The group’s foundation in rubber processing. Active since 1994, FA Santo brings together compound expertise and the manufacture of molded, injection-molded and extruded rubber products.',tags:['Compound development','Custom rubber products','Since 1994'],link:'https://www.industrikaret.com/',label:'Visit Santo Rubber Factory'},
 baik:{abbr:'BAIK',name:'PT Basuki Aneka Inti Karet',description:'Recycled rubber and surface applications within the group’s product range, including rubber powder, granules, paving and tiles for industrial, sport and recreational use.',tags:['Rubber recycling','Powder & granules','Tiles & surfaces'],link:'#products',label:'Explore recycled products',filter:'recycled'},
 sol:{abbr:'SOL',name:'PT Semesta Olah Lestari',description:'Established in November 2022 in Tangerang, SOL specializes in rubber footwear outsoles, foxing and mats. Development supports local and international brands with materials and designs tailored to their requirements.',tags:['Footwear development','Outsoles & foxing','Since 2022'],link:'https://bit.ly/PT-SOL',label:'Visit PT Semesta Olah Lestari'},
 sip:{abbr:'SIP',name:'SIP Rubber',description:'Founded in 2014 and based in Tangerang, SIP Rubber is part of Santo Rubber Group. Its industrial product and service range includes rubber rolls, sheets, molding, extrusion, conveyor belts and lining.',tags:['Industrial products','Custom requirements','Since 2014'],link:'https://www.siprubber.com/',label:'Visit SIP Rubber'}
};
const facilities = [
 {name:'Cengkareng Plant 1',location:'JAKARTA',image:'cengkareng1',title:'Where the compound begins.',description:'Dedicated to the production of rubber compounds. Located in the Cengkareng industrial and warehouse area, around 5 km from Soekarno-Hatta International Airport.',tags:['Rubber compounds','Mixing']},
 {name:'Cengkareng Plant 2',location:'JAKARTA',image:'cengkareng2',title:'From formulation to form.',description:'Specialized production of molded, injection-molded and extruded rubber products in the Cengkareng industrial and warehouse area.',tags:['Molding','Injection','Extrusion']},
 {name:'Pasar Kemis Plant',location:'TANGERANG',image:'pasarkemis',title:'A new role for recovered rubber.',description:'Focused on rubber recycling, with powder and granules for reuse in Grade-C compounds and applications such as jogging tracks, futsal fields and playground surfaces.',tags:['Recycling','Powder','Granules']},
 {name:'Rajeg Plant',location:'TANGERANG',image:'rajeg',title:'Footwear and protection.',description:'Specialized in shoe and sandal outsoles, alongside rubber tiles and fenders for surface applications, protection and impact absorption.',tags:['Footwear','Tiles','Fenders']}
];
const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const pills = (items) => '<div class="pill-row">'+items.map(x=>'<span>'+x+'</span>').join('')+'</div>';
function renderProducts(filter='all') {
 const list=products.filter(p=>filter==='all'||p.categories.includes(filter));
 $('#product-grid').innerHTML=list.map(p=>`<button class="product" data-open-product="${p.id}" aria-label="Explore ${p.name}"><div class="product-image"><img src="assets/${p.image}.webp" alt="${p.name} featured in the Santo Rubber Group company profiles" loading="lazy"><span class="product-num">0${products.indexOf(p)+1}</span></div><div class="product-copy"><h3>${p.name}</h3><p>${p.summary}</p><span class="product-more">Explore capability <b aria-hidden="true">+</b></span></div></button>`).join('');
 $$('.filters button').forEach(b=>{let active=b.dataset.filter===filter;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});
 $('#product-count').textContent=`Showing ${list.length} of ${products.length} capabilities`;
}
function renderCompany(key='srf') {
 const c=companies[key];
 $$('.company-list button').forEach(b=>{let active=b.dataset.company===key;b.setAttribute('aria-selected',String(active));b.tabIndex=active?0:-1;b.querySelector('b').textContent=active?'−':'+';});
 $('#company-panel').setAttribute('aria-labelledby','company-'+key);
 $('#company-panel').innerHTML=`<div class="company-abbr">${c.abbr}</div><h3>${c.name}</h3><p>${c.description}</p>${pills(c.tags)}<a class="text-link dark" href="${c.link}" ${c.filter?'data-group-filter="'+c.filter+'"':'target="_blank" rel="noopener"'}>${c.label}</a>`;
}
function renderFacility(index=0) {
 const f=facilities[index];
 $$('.facility-tabs button').forEach(b=>{let active=Number(b.dataset.facility)===index;b.setAttribute('aria-selected',String(active));b.tabIndex=active?0:-1;});
 $('#facility-panel').setAttribute('aria-labelledby','facility-'+index);
 $('#facility-panel').innerHTML=`<img src="assets/${f.image}.webp" alt="${f.name} exterior" loading="lazy"><div><div class="eyebrow">${f.name.toUpperCase()} / ${f.location}</div><h3>${f.title}</h3><p>${f.description}</p>${pills(f.tags)}</div>`;
}
let dialogTrigger=null;
function openProduct(id,trigger) {
 const p=products.find(p=>p.id===id);if(!p)return;
 dialogTrigger=trigger;
 $('#dialog-content').innerHTML=`<img class="dialog-image" src="assets/${p.image}.webp" alt="${p.name}"><div class="dialog-body"><div class="eyebrow">SANTO RUBBER GROUP / CAPABILITIES</div><h2 id="dialog-title">${p.name}</h2><p>${p.description}</p><h3>Products & applications</h3>${pills(p.examples)}<div class="actions"><button class="button" data-inquire="${p.id}">Discuss this product</button><a class="text-link dark" href="assets/${p.id==='footwear'?'pt-sol-profile.pdf':'santo-rubber-group-profile.pdf'}" target="_blank" rel="noopener">View company profile</a></div></div>`;
 $('#product-dialog').showModal();
}
function closeDialog(){ $('#product-dialog').close(); }
$('#product-dialog').addEventListener('close',()=>{if(dialogTrigger?.isConnected)dialogTrigger.focus({preventScroll:true});});
$('.dialog-close').addEventListener('click',closeDialog);
$('#product-dialog').addEventListener('click',e=>{if(e.target===$('#product-dialog')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeDialog();}});
document.addEventListener('click',e=>{
 const filter=e.target.closest('[data-filter]');if(filter)renderProducts(filter.dataset.filter);
 const product=e.target.closest('[data-open-product]');if(product)openProduct(product.dataset.openProduct,product);
 const company=e.target.closest('[data-company]');if(company)renderCompany(company.dataset.company);
 const facility=e.target.closest('[data-facility]');if(facility)renderFacility(Number(facility.dataset.facility));
 const groupFilter=e.target.closest('[data-group-filter]');if(groupFilter)renderProducts(groupFilter.dataset.groupFilter);
 const inquire=e.target.closest('[data-inquire]');if(inquire){const p=products.find(p=>p.id===inquire.dataset.inquire);dialogTrigger=null;closeDialog();$('#inquiry-interest').value=p.inquiry;$('#contact').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});$('#inquiry-form input').focus({preventScroll:true});}
});
$$('[role="tablist"]').forEach(list=>list.addEventListener('keydown',e=>{
 const vertical=list.getAttribute('aria-orientation')==='vertical';const keys=vertical?['ArrowUp','ArrowDown']:['ArrowLeft','ArrowRight'];if(![...keys,'Home','End'].includes(e.key))return;
 const buttons=[...list.querySelectorAll('[role="tab"]')];let i=buttons.indexOf(document.activeElement);if(i<0)return;e.preventDefault();
 i=e.key==='Home'?0:e.key==='End'?buttons.length-1:(i+(e.key===keys[0]?-1:1)+buttons.length)%buttons.length;buttons[i].click();buttons[i].focus();
}));
$('.menu').addEventListener('click',()=>{let open=$('#navigation').classList.toggle('open');$('.menu').setAttribute('aria-expanded',String(open));$('.menu').setAttribute('aria-label',open?'Close menu':'Open menu');$('.menu').textContent=open?'×':'☰';});
function closeMenu(){$('#navigation').classList.remove('open');$('.menu').setAttribute('aria-expanded','false');$('.menu').setAttribute('aria-label','Open menu');$('.menu').textContent='☰';}
$$('#navigation a').forEach(a=>a.addEventListener('click',closeMenu));
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&$('#navigation').classList.contains('open')){closeMenu();$('.menu').focus();}});
let preparedMessage='';
$('#inquiry-form').addEventListener('submit',e=>{
 e.preventDefault();const form=e.currentTarget;if(!form.reportValidity())return;
 const data=new FormData(form);const interest=data.get('interest');
 preparedMessage=`Hello Santo Rubber Group,\n\nI would like to discuss: ${interest}.\n\nName: ${data.get('name')}\nCompany: ${data.get('company')||'Not specified'}\nEmail: ${data.get('email')}\n\nProject details:\n${data.get('message')}\n\nThank you.`;
 const channel=e.submitter?.value||'email';
 if(channel==='whatsapp'){
  const target=interest==='SIP Rubber products'?'628561117498':'6281807261518';
  window.open(`https://wa.me/${target}?text=${encodeURIComponent(preparedMessage)}`,'_blank','noopener,noreferrer');
  $('#inquiry-status').textContent='Your message is ready in WhatsApp. Review it and press Send there.';$('#email-fallback').hidden=true;
 }else{
  const to=interest==='Footwear outsoles & foxing'?'semesta.olahlestari@gmail.com':interest==='SIP Rubber products'?'sales@siprubber.com':'sales@industrikaret.com';
  window.location.href=`mailto:${to}?subject=${encodeURIComponent('Product inquiry — '+interest)}&body=${encodeURIComponent(preparedMessage)}`;
  $('#inquiry-status').textContent='Your email draft to '+to+' is ready. Review and send it from your email app.';$('#email-fallback').hidden=false;$('#prepared-inquiry').value=preparedMessage;
 }
});
$('#copy-inquiry').addEventListener('click',async()=>{
 try{await navigator.clipboard.writeText(preparedMessage);$('#inquiry-status').textContent='Inquiry copied. Paste it into your email.';}catch{const t=$('#prepared-inquiry');t.hidden=false;t.focus();t.select();$('#inquiry-status').textContent='Select and copy the prepared inquiry below.';}
});
$('#year').textContent=new Date().getFullYear();
renderProducts();renderCompany();renderFacility();
