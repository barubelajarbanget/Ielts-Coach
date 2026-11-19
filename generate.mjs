// Adds fresh question sets to data/questions.json using the Gemini API. Run by GitHub Actions; key comes from a repo secret.
import fs from 'node:fs';
const KEY=process.env.GEMINI_API_KEY,MODEL=process.env.GEMINI_MODEL||'gemini-2.5-flash',CALLS=+(process.env.CALLS||16),KEEP=40,FILE='data/questions.json';
if(!KEY){console.log('No GEMINI_API_KEY secret; skipping.');process.exit(0)}
const ST=['A1–A2 (beginner)','B1 (pre-intermediate)','B1+ (intermediate)','B2 (upper-intermediate)','B2+ / C1','C1'];
const TOPICS=['education','environment','technology','health','urban life','work and careers','travel','science','culture','media','business','sport','food','history','housing','energy','language learning','social media','transport','economics'];
const pick=a=>a[Math.floor(Math.random()*a.length)],sleep=ms=>new Promise(r=>setTimeout(r,ms));
const M='{"title":"..","text":"..","questions":[{"q":"..","options":["..",".."],"answer":0,"why":"short English explanation"}]}';
const P={
reading:l=>`Write an IELTS-style reading passage (200-350 words) in "text", then 6 questions mixing 4-option multiple choice and True/False/Not Given (options exactly ["True","False","Not Given"]). Level ${l}. Schema: ${M}`,
listening:l=>`Write a natural spoken script (dialogue or monologue, 150-250 words) in "text", then 5 multiple-choice detail questions. Level ${l}. Schema: ${M}`,
vocab:l=>`Create 8 vocabulary questions (word in context, synonyms, collocations) for level ${l}; "text" is a one-line instruction. Schema: ${M}`,
grammar:l=>`Create 8 grammar questions (error choice, tenses, articles, prepositions) for level ${l}; "text" is a one-line instruction. Schema: ${M}`,
writing:l=>`Create one IELTS-style writing task for level ${l}. Schema: {"title":"..","text":"task prompt","words":150}`,
speaking:l=>`Create one IELTS speaking task for level ${l} (Part 1 questions, or a Part 2 cue card for B2+). Schema: {"title":"..","text":"prompt","words":100}`};
const ok=(sk,d)=>d&&typeof d=='object'&&(['writing','speaking'].includes(sk)?!!d.text:Array.isArray(d.questions)&&d.questions.length>=4&&d.questions.every(q=>q&&Array.isArray(q.options)&&q.options.length>1&&Number.isInteger(q.answer)&&q.answer>=0&&q.answer<q.options.length));
const bank=JSON.parse(fs.readFileSync(FILE,'utf8'));let added=0;
for(let i=0;i<CALLS;i++){const sk=pick(Object.keys(P)),st=Math.floor(Math.random()*ST.length);
 const prompt=`You are an expert IELTS examiner. Topic: ${pick(TOPICS)}. Seed ${Math.random()}. Return ONLY valid JSON. ${P[sk](ST[st])}`;
 try{const r=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,{method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':KEY},body:JSON.stringify({contents:[{parts:[{text:prompt}]}],generationConfig:{responseMimeType:'application/json'}})});
  if(!r.ok){console.log('HTTP',r.status,sk,st);if(r.status==429)await sleep(30000);continue}
  const j=await r.json(),d=JSON.parse(String(j.candidates[0].content.parts[0].text).replace(/```json|```/g,'').trim());
  if(!ok(sk,d)){console.log('invalid',sk,st);continue}
  bank[sk]=bank[sk]||{};bank[sk][st]=[...(bank[sk][st]||[]),d].slice(-KEEP);added++;console.log('added',sk,st)}catch(e){console.log('error',sk,st,e.message)}
 await sleep(7000)}
fs.writeFileSync(FILE,JSON.stringify(bank));console.log('done, added',added);
