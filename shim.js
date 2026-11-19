/* Standalone replacement for the claude.ai runtime: question bank + optional own Gemini key, browser speech, local downloads. */
(function(){
const KEY='ielts_gemini_key',MOD='ielts_model',pickR=a=>a[Math.floor(Math.random()*a.length)],clone=o=>JSON.parse(JSON.stringify(o));
if(!localStorage.getItem('ielts2.mode'))localStorage.setItem('ielts2.mode','device');
let bank=null;async function getBank(){if(bank)return bank;try{bank=await(await fetch('data/questions.json',{cache:'no-cache'})).json()}catch(e){bank={}}return bank}
const skillOf=p=>/Score this/.test(p)?'score':/reading passage/.test(p)?'reading':/spoken script/.test(p)?'listening':/vocabulary questions/.test(p)?'vocab':/grammar questions/.test(p)?'grammar':/writing task/.test(p)?'writing':/speaking task/.test(p)?'speaking':'';
const stageOf=p=>{const m=p.match(/Learner level: (.+?), target IELTS band/);const i=m?ST.findIndex(s=>s.c==m[1]):0;return i<0?0:i};
function parse(t){t=String(t).replace(/```json|```/g,'').trim();const m=t.match(/[\[{][\s\S]*[\]}]/);return JSON.parse(m?m[0]:t)}
async function gemini(prompt,key){const model=localStorage.getItem(MOD)||'gemini-2.5-flash';
 const r=await fetch('https://generativelanguage.googleapis.com/v1beta/models/'+encodeURIComponent(model)+':generateContent',{method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':key},body:JSON.stringify({contents:[{parts:[{text:prompt}]}],generationConfig:{responseMimeType:'application/json'}})});
 if(!r.ok){const e=new Error('AI request failed');e.code='ai_'+r.status;throw e}
 const j=await r.json();return parse(j.candidates[0].content.parts[0].text)}
function fallback(sk){const S_=SAMPLE;const m={reading:()=>S_.reading.d,listening:()=>S_.listening.d,writing:()=>pickR([S_.w1.d,S_.w2.d]),speaking:()=>pickR([S_.s1.d,S_.s2.d,S_.s3.d])}[sk];if(!m){const e=new Error('empty');e.code='question_bank_empty';throw e}return clone(m())}
const sample={async json(prompt){const sk=skillOf(prompt),key=localStorage.getItem(KEY);
 if(key){try{return await gemini(prompt,key)}catch(e){if(sk=='score')throw e}}
 if(sk=='score'){const e=new Error('key');e.code='add_AI_key_in_Settings';throw e}
 const b=await getBank(),by=b[sk]||{},pool=[...(by[stageOf(prompt)]||[]),...(by.all||[])];
 return pool.length?clone(pickR(pool)):fallback(sk)}};
function dict(){const SR=window.SpeechRecognition||window.webkitSpeechRecognition;if(!SR)return null;let r=null,f=()=>{},p=()=>{},s=()=>{};
 return{onFinal(x){f=x},onPartial(x){p=x},onState(x){s=x},async start(){r=new SR();r.lang='en-GB';r.interimResults=true;r.continuous=true;r.onresult=e=>{for(let i=e.resultIndex;i<e.results.length;i++){const t=e.results[i][0].transcript;e.results[i].isFinal?f({text:t}):p({text:t})}};r.onstart=()=>s({state:'listening'});r.onend=()=>s({state:'idle'});r.onerror=()=>s({state:'idle'});r.start()},async stop(){try{r&&r.stop()}catch(e){}}}}
const downloads={async save({filename,data}){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([data],{type:filename.endsWith('.ics')?'text/calendar':'application/json'}));a.download=filename;document.body.appendChild(a);a.click();setTimeout(()=>{a.remove();URL.revokeObjectURL(a.href)},500)}};
window.claude={use:async n=>({sample,dictation:dict(),downloads})[n]||null};
window.saveAI=()=>{const k=document.querySelector('#gk').value.trim();if(k)localStorage.setItem(KEY,k);localStorage.setItem(MOD,document.querySelector('#gm').value.trim());flash('AI settings saved on this device.');vToday()};
window.exportData=()=>downloads.save({filename:'ielts-progress.json',data:localStorage.getItem('ielts2')||'{}'});
window.importData=()=>{const i=document.createElement('input');i.type='file';i.accept='.json';i.onchange=async()=>{try{const t=await i.files[0].text();JSON.parse(t);localStorage.setItem('ielts2',t);location.reload()}catch(e){flash('That file is not valid progress data.')}};i.click()};
})();
