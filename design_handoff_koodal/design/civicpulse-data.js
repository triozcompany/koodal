/* CivicPulse demo store — shared by Citizen + Government pages via localStorage (syncs across tabs). */
(function(){
const KEY='civicpulse-demo-v4', H=3600e3, D=24*H;
const CATS={
  road:{l:'Roads',icon:'ph-road-horizon',dept:'Roads & Bridges'},
  drain:{l:'Drains',icon:'ph-waves',dept:'Storm Water Drains'},
  garbage:{l:'Garbage',icon:'ph-trash',dept:'Solid Waste Mgmt'},
  light:{l:'Streetlights',icon:'ph-lightbulb',dept:'Electrical'},
  water:{l:'Water & sewage',icon:'ph-drop',dept:'Water & Sewerage'},
  tree:{l:'Trees',icon:'ph-tree',dept:'Parks & Trees'},
  footpath:{l:'Footpaths',icon:'ph-person-simple-walk',dept:'Roads & Bridges'}
};
const CITY={
  Chennai:{corp:'Greater Chennai Corp.',code:'CHN',water:'Metrowater (CMWSSB)',officers:['JE Priya Natarajan','JE Karthik Rajan','AE Farida Begum']},
  Coimbatore:{corp:'Coimbatore City Corp.',code:'CBE',officers:['JE Suresh Babu','JE Nithya Krishnan']},
  Madurai:{corp:'Madurai Corporation',code:'MDU',officers:['JE Muthu Pandian','JE Selvi Arumugam']}
};
const STAGES={
  reported:{l:'New',step:0},community:{l:'Gathering support',step:1},review:{l:'With govt',step:1},
  verified:{l:'Official case',step:2},assigned:{l:'Assigned',step:2},progress:{l:'In progress',step:3},
  resolved:{l:'Fixed · confirm',step:4},closed:{l:'Closed',step:4},rejected:{l:'Rejected',step:0}
};
const SEVW={critical:40,high:30,medium:20,low:10};
const USERS=['Karthik S','Priya M','Arun K','Meena V','Senthil R','Lakshmi N','Farhan A','Revathi P','Vignesh B','Anitha J','Suresh T','Kavya R'];
const ME={name:'Divya Raghavan',short:'DR',area:'Velachery, Chennai',phone:'+91 98401 23456'};
const VERIFIER='AE R. Ganesan';
const deptFor=(cat,city)=>cat==='water'&&CITY[city].water?CITY[city].water:CATS[cat].dept;
const corp=i=>CITY[i.city].corp;

// id, cat, sev, city, area, street, title, stage, sup, conf, hoursAgo, by(-1=me), anon, x, y, km, extra
const ROWS=[
 ['CP-2107','water','critical','Chennai','Velachery','100 Feet Rd, near Vijayanagar bus stand','Sewage overflowing onto 100 Feet Road','community',41,76,30,0,false,49,46,0.2,{
   summary:'Sewage overflowing from a manhole across the carriageway near the bus stand. Health hazard; commuters wading through.',
   voice:{lang:'Tamil',text:'“ரோட்டுல முழுசா சாக்கடை தண்ணி ஓடுது, ஸ்மெல் தாங்க முடியல”',en:'Sewage is running all over the road, the smell is unbearable'},
   merged:[{by:'Anonymous',h:22,text:'“Drainage overflow aagudhu, bike la poga mudiyala”',sim:96},{by:'Meena V',h:9,text:'Manhole leaking dirty water on main road',sim:93},{by:'Arun K',h:4,text:'Bus stop flooded with drain water',sim:91}],
   history:'Same manhole desilted on 2 Jul 2026. Recurred in under 3 months — check the trunk sewer.'}],
 ['CP-2111','road','high','Chennai','Velachery','Taramani Link Rd, Phoenix signal','Deep pothole near the Phoenix signal','community',28,64,20,2,false,60,38,0.9,{voice:{lang:'Tanglish',text:'“Signal kitta periya pallam, night la theriyave illa”',en:'Big pit near the signal, you can\'t see it at night'}}],
 ['CP-2098','light','medium','Chennai','Velachery','Bharathi Nagar 3rd St','Four streetlights dark on Bharathi Nagar 3rd St','community',9,38,6,-1,false,34,28,0.6,{}],
 ['CP-2089','garbage','high','Chennai','Velachery','Velachery Main Rd, below MRTS','Garbage dumped below Velachery MRTS pillar','review',63,84,52,4,false,56,62,1.1,{voice:{lang:'Tanglish',text:'“Moonu naala garbage edukkala, naai ellam kizhikudhu”',en:'Garbage not collected for three days, dogs are tearing it apart'}}],
 ['CP-2045','drain','critical','Chennai','Velachery','Vijayanagar 4th Main Rd','Open manhole without cover on a school route','resolved',66,91,190,5,false,42,56,0.5,{caseId:'CP-CHN-24790',assignee:'JE Priya Natarajan',prio:'P1',due:-1*D,confirms:18,needed:25}],
 ['CP-2112','road','low','Chennai','Velachery','Dhandeeswaram Nagar Main Rd','Speed breaker paint faded, bikes skidding','reported',3,22,5,6,false,72,30,0.7,{}],
 ['CP-2109','water','medium','Chennai','Velachery','Ram Nagar North, 5th St','Low-pressure drinking water for a week','community',19,55,40,-1,true,30,64,0.8,{voice:{lang:'Tamil',text:'“ஒரு வாரமா தண்ணி சரியா வரல”',en:'Water hasn\'t come properly for a week'}}],
 ['CP-2091','footpath','medium','Chennai','Velachery','Velachery Bypass Rd','Encroached footpath, walkers forced onto road','community',17,44,70,7,false,78,52,1.2,{}],
 ['CP-2106','drain','high','Chennai','Madipakkam','Madipakkam Main Rd junction','Rainwater stagnating at Madipakkam junction','community',33,71,28,8,false,62,76,2.2,{}],
 ['CP-2064','drain','high','Chennai','Pallikaranai','200 Feet Rd, marsh edge','Storm drain choked with plastic','verified',52,88,120,9,false,82,72,3.4,{caseId:'CP-CHN-24802',assignee:'AE Farida Begum',prio:'P1',due:3*D}],
 ['CP-2051','road','medium','Chennai','Adyar','LB Road, near Adyar depot','Road cut left unpatched after Metrowater work','progress',47,86,260,10,false,22,22,4.2,{caseId:'CP-CHN-24755',assignee:'JE Karthik Rajan',prio:'P2',due:1*D}],
 ['CP-2033','tree','medium','Chennai','Adyar','Gandhi Nagar 2nd Main Rd','Fallen gulmohar branch blocking footpath','closed',31,83,400,11,false,14,40,4.6,{caseId:'CP-CHN-24711',assignee:'JE Karthik Rajan',prio:'P2',due:-6*D,confirms:25,needed:25}],
 ['CP-2102','footpath','medium','Chennai','T. Nagar','Pondy Bazaar pedestrian plaza','Broken footpath tiles, tripping hazard','community',22,58,33,1,false,10,14,8.1,{}],
 ['CP-2095','water','high','Chennai','Mylapore','Kutchery Rd, near the temple tank','Metrowater pipe leaking for 3 days','review',58,86,60,3,false,26,12,9.0,{voice:{lang:'Tanglish',text:'“Moonu naala pipe leak, thanni waste aagudhu”',en:'Pipe leaking for three days, water is being wasted'}}],
 ['CP-2080','garbage','medium','Chennai','Anna Nagar','2nd Avenue, near Tower Park','Overflowing bins near Tower Park','progress',39,84,150,2,false,20,8,14,{caseId:'CP-CHN-24766',assignee:'AE Farida Begum',prio:'P2',due:-1*D}],
 ['CP-2071','light','high','Chennai','Chromepet','GST Rd service lane','Service lane completely dark after 7 PM','review',44,82,44,5,false,40,88,11,{voice:{lang:'Tanglish',text:'“Street full-a dark, ladies nadakka bayapadranga”',en:'Street is fully dark, women are afraid to walk'}}],
 ['CP-2076','road','high','Chennai','Guindy','Kathipara junction underpass','Waterlogging and potholes under Kathipara underpass','assigned',71,90,110,6,false,16,30,5.1,{caseId:'CP-CHN-24781',assignee:'JE Karthik Rajan',prio:'P1',due:-2*D}],
 ['CP-2040','garbage','low','Chennai','Besant Nagar','Elliot\'s Beach front','Broken bins along Elliot\'s Beach','closed',24,81,500,7,false,30,20,6.5,{caseId:'CP-CHN-24690',assignee:'AE Farida Begum',prio:'P3',due:-10*D,confirms:20,needed:20}],
 ['CP-2085','light','critical','Chennai','Saidapet','Jones Rd junction box','Exposed live wire at junction box, Jones Road','review',37,90,3,9,false,12,34,6.0,{}],
 ['CP-2060','drain','high','Chennai','Perungudi','OMR, near Perungudi toll','Storm drain work left open without barricade','progress',45,85,96,10,false,70,82,3.0,{caseId:'CP-CHN-24770',assignee:'AE Farida Begum',prio:'P1',due:0.5*D}],
 ['CP-2104','water','high','Chennai','Tambaram','Mudichur Rd','Sewage mixing with stormwater canal','review',36,81,26,0,false,56,90,9.8,{}],
 ['CP-3021','road','high','Coimbatore','RS Puram','DB Road, near head post office','Potholes along DB Road','review',49,83,36,1,false,40,40,0,{}],
 ['CP-3017','garbage','medium','Coimbatore','Gandhipuram','Cross Cut Rd, behind bus stand','Garbage piling behind Gandhipuram bus stand','progress',57,88,130,2,false,56,30,0,{caseId:'CP-CBE-24744',assignee:'JE Suresh Babu',prio:'P2',due:2*D}],
 ['CP-3009','light','low','Coimbatore','Peelamedu','Avinashi Rd service lane','Streetlights flickering on Avinashi Rd service lane','community',14,48,18,3,false,72,46,0,{}],
 ['CP-3004','water','high','Coimbatore','Singanallur','Trichy Rd','Drinking water mixed with sewage','verified',38,87,80,4,false,78,66,0,{caseId:'CP-CBE-24799',assignee:'JE Nithya Krishnan',prio:'P1',due:4*D}],
 ['CP-4012','road','high','Madurai','Goripalayam','Goripalayam junction','Crater-size pothole at Goripalayam junction','review',61,88,30,5,false,46,40,0,{voice:{lang:'Tamil',text:'“ஜங்ஷன்ல பெரிய குழி, பஸ் கூட ஆடுது”',en:'Huge pit at the junction, even buses shake'}}],
 ['CP-4008','drain','medium','Madurai','Anna Nagar','80 Feet Rd bus stop','Drain overflow near Anna Nagar bus stop','community',26,66,22,6,false,64,56,0,{}],
 ['CP-4003','garbage','high','Madurai','Simmakkal','Vaigai riverbank','Waste dumped on the Vaigai riverbank','assigned',44,86,100,7,false,34,30,0,{caseId:'CP-MDU-24760',assignee:'JE Muthu Pandian',prio:'P1',due:-1*D}],
 ['CP-4001','tree','low','Madurai','Tallakulam','Alagar Kovil Rd','Tree leaning on a power line','resolved',22,82,170,8,false,58,20,0,{caseId:'CP-MDU-24712',assignee:'JE Selvi Arumugam',prio:'P2',due:-2*D,confirms:11,needed:20}]
];
const TAGS={road:['pothole','road-safety','two-wheeler'],drain:['monsoon','waterlogging','drainage'],garbage:['garbage','swachh','smell'],light:['streetlight','night-safety','women-safety'],water:['sewage','health-hazard','metrowater'],tree:['tree-fall','footpath'],footpath:['walkability','footpath','encroachment']};
const TEXT={road:'Getting worse every day. Two-wheelers are swerving into traffic to avoid it.',drain:'Water has been standing for two days after the rain. Mosquitoes everywhere now.',garbage:'Not collected for days. Stray dogs are spreading it across the road.',light:'The whole stretch is pitch dark after 7 PM. Feels unsafe walking back from the bus stop.',water:'The smell is unbearable and it keeps coming back after every rain.',tree:'Blocking the footpath — people with prams have to walk on the road.',footpath:'Senior citizens and kids are forced to walk on the main road.'};
const CPOOL=['Same issue near our street too.','Inga daily ippadi dhaan irukku, yaarum kandukala.','Reported this last month also. Hope it moves this time.','நேத்து ராத்திரி ஒரு பைக் இங்க விழுந்துச்சு.','Added a photo from this morning.','Councillor office-ku call panni sonnen, they said they will check.','Kids walk to school through here. Please prioritise.','Seriously dangerous at night.','Passed by it today, still the same.','Corporation van vandhuchu, but nothing done yet.'];
const ini=n=>n.split(' ').map(s=>s[0]).join('');
function mkEvidence(sup,anon,name,by,created,h){const people=Math.max(1,Math.round(sup*0.28)),photos=Math.min(48,people+Math.round(people*0.75)),out=[];
  for(let k=0;k<photos;k++){const p=k<people?k:(k*7)%people;out.push({by:p===0?(anon?'AN':ini(name)):ini(USERS[(p*3+by+12)%12]),uid:p===0?(by===-1?'me':'r'):'u'+p,ts:created+k*(h*H/(photos+1))});}return out;}
function mkComments(id,created,h){const s=parseInt(id.slice(3))||0,n=s%4+1,out=[];for(let k=0;k<n;k++)out.push({by:USERS[(k*5+s)%12],text:CPOOL[(k*3+s)%CPOOL.length],ts:created+(k+1)*(h*H/(n+2))});return out;}
const ORDER=['reported','community','review','verified','assigned','progress','resolved','closed'];

function build(r,now){
  const [id,cat,sev,city,area,street,title,stage,sup,conf,h,by,anon,x,y,km,ex]=r;
  const created=now-h*H, name=by===-1?ME.name:USERS[by%USERS.length];
  const i={id,cat,sev,city,area,street,title,stage,sup,conf,created,x,y,km,anon,mine:by===-1,by:anon?'Anonymous':name,
    dept:deptFor(cat,city),summary:ex.summary||'',voice:ex.voice||null,merged:ex.merged||[],history:ex.history||'',
    caseId:ex.caseId||null,assignee:ex.assignee||null,prio:ex.prio||null,due:ex.due!=null?now+ex.due:null,
    confirms:ex.confirms||0,needed:ex.needed||25,valYes:Math.round(sup*0.7),valNo:Math.max(1,Math.round(sup*0.05)),
    evidence:mkEvidence(sup,anon,name,by,created,h),
    events:[],reject:null};
  if(!i.summary)i.summary=`${CATS[cat].l==='Streetlights'?'Streetlights out':title} at ${street}, ${area}. AI rates it ${sev}; routed to ${i.dept}.`;
  i.text=ex.text||(ex.voice?ex.voice.en:TEXT[cat]);i.tags=ex.tags||[...TAGS[cat].slice(0,2),area.toLowerCase().replace(/[^a-z]+/g,'-').replace(/^-|-$/g,'')];
  if(i.caseId&&!i.merged.length)i.merged=[{by:USERS[(Math.abs(by)+3)%12],h:Math.max(1,Math.round(h*0.8)),text:TEXT[cat],sim:92},{by:'Anonymous',h:Math.max(1,Math.round(h*0.6)),text:CPOOL[(parseInt(id.slice(3))||0)%CPOOL.length],sim:88}];
  i.opp=Math.round(sup*0.06);i.shares=Math.round(sup*0.4);i.comments=mkComments(id,created,h);
  const at=ORDER.indexOf(stage), span=h*H, t=f=>created+span*f;
  const E=(f,title,sub,icon,kind,photo)=>i.events.push({ts:t(f),title,sub:sub||'',icon,kind,photo:photo||''});
  E(0,`${i.by} reported it`,'','ph-camera','citizen');
  if(at>=1)E(.15,`${Math.max(4,Math.round(sup*.6))} neighbours joined`,`${i.evidence.length} photos · ${i.valYes} validations`,'ph-users-three','community');
  if(at>=2)E(.3,`Community verified · ${Math.min(conf,84)}%`,`Sent to ${CITY[city].corp}`,'ph-shield-check','community');
  if(at>=3){E(.4,`Verified by ${CITY[city].corp}`,`Inspected by ${VERIFIER}`,'ph-seal-check','gov');E(.41,`Official case ${i.caseId}`,`${i.dept} · ${i.prio}`,'ph-bank','gov');}
  if(at>=4)E(.5,`Assigned to ${i.assignee}`,'','ph-user-circle-check','gov');
  if(at>=5)E(.65,'Work started on site','Crew deployed','ph-hard-hat','gov','crew on site');
  if(at>=6)E(.85,'Marked fixed by department','Proof photo attached','ph-check','fix','after photo');
  if(at>=7)E(.97,'Closed · confirmed by citizens',`${i.confirms} of ${i.needed} confirmed`,'ph-seal-check','fix');
  return i;
}
function seed(){
  const now=Date.now();
  return {v:4,issues:ROWS.map(r=>build(r,now)),my:{support:{'CP-2051':true,'CP-2045':true,'CP-2091':true,'CP-2102':true,'CP-2033':true,'CP-2089':true},validated:{},confirmed:{},opposed:{'CP-2112':true},contrib:{'CP-2098':true,'CP-2109':true}},
    me:{verified:true,anonDefault:false,verifiedAt:now-40*D,name:ME.name,area:ME.area},seq:2113,caseSeq:24817};
}
function load(){try{const s=JSON.parse(localStorage.getItem(KEY));if(s&&s.v===4)return s;}catch(e){}const s=seed();try{localStorage.setItem(KEY,JSON.stringify(s));}catch(e){}return s;}
let S=load();const subs=new Set();
if(!S.gov){S.gov=1;const now=Date.now(),p=(id,f)=>{const i=S.issues.find(x=>x.id===id);i&&f(i);};
 p('CP-2080',i=>{i.reopened=1;i.disputes=5;i.events.push({ts:now-40*H,title:'Marked fixed by department',sub:'Proof photo attached',icon:'ph-check',kind:'fix',photo:'after photo'},{ts:now-20*H,title:'Reopened by citizens',sub:'5 citizens said: Half done',icon:'ph-arrow-counter-clockwise',kind:'citizen',photo:''});});
 p('CP-2045',i=>{i.disputes=1;});p('CP-4001',i=>{i.disputes=2;});
 p('CP-2060',i=>{i.history='Same stretch barricaded in March 2026 and reopened by residents.';});
 try{localStorage.setItem(KEY,JSON.stringify(S));}catch(e){}}
function save(){try{localStorage.setItem(KEY,JSON.stringify(S));}catch(e){}subs.forEach(f=>f(S));}
let last=null;window.addEventListener('storage',e=>{if(e.key!==KEY||!e.newValue||e.newValue===last)return;last=e.newValue;try{const s=JSON.parse(e.newValue);if(s&&s.v===4){S=s;subs.forEach(f=>f(S));}}catch(err){}});
const find=id=>S.issues.find(x=>x.id===id);
const ev=(i,title,sub,icon,kind,photo)=>i.events.push({ts:Date.now(),title,sub:sub||'',icon,kind,photo:photo||''});
const initials=()=>S.me.anonDefault?'AN':ini(S.me.name||ME.name);const myName=()=>S.me.name||ME.name;const M=k=>(S.my[k]=S.my[k]||{});
function bump(i,n){
  const before=i.conf;i.conf=Math.max(5,Math.min(97,i.conf+n));
  if(i.stage==='reported'&&i.sup>=5)i.stage='community';
  if(before<80&&i.conf>=80&&(i.stage==='community'||i.stage==='reported')){i.stage='review';ev(i,`Community verified · ${i.conf}%`,`Sent to ${corp(i)} for verification`,'ph-shield-check','community');return true;}
  return false;
}

// ---- mock AI ----
const SCENES={
  sewage:{cat:'water',sev:'critical',label:'Sewage overflow',p:95,title:'Sewage overflowing onto the road',size:'~15 m stretch',risk:'Health hazard · bus stop 30 m',street:'100 Feet Rd, Vijayanagar',x:48,y:47,
    voice:{lang:'Tanglish',text:'“Bus stand pakkathula drainage overflow, romba naala ippadi dhaan irukku”',en:'Drainage overflowing near the bus stand, it has been like this for days'}},
  pothole:{cat:'road',sev:'high',label:'Pothole',p:96,title:'Deep pothole on the carriageway',size:'~1.1 × 0.7 m',risk:'Two-wheeler route · signal 40 m',street:'Taramani Link Rd',x:58,y:40,
    voice:{lang:'Tamil',text:'“ரொம்ப பெரிய பள்ளம், நைட்ல பைக் விழுது”',en:'Very big pit, bikes fall at night'}},
  garbage:{cat:'garbage',sev:'high',label:'Garbage dump',p:93,title:'Uncollected garbage heap',size:'~3 m² heap',risk:'Near market · stray dogs',street:'Velachery Main Rd',x:41,y:66,
    voice:{lang:'Tanglish',text:'“Three days-a garbage edukkala, smell romba jaasthi”',en:'Garbage not collected for three days, the smell is terrible'}},
  light:{cat:'light',sev:'medium',label:'Streetlight out',p:91,title:'Streetlights not working',size:'3 poles dark',risk:'Women walk here after work',street:'Balaji Nagar 2nd St',x:74,y:70,
    voice:{lang:'Tanglish',text:'“Street full-a dark, ladies nadakka bayapadranga”',en:'The street is fully dark, women are afraid to walk'}}
};
function analyze(scene){
  const sc=SCENES[scene];
  const matches=S.issues.filter(i=>i.city==='Chennai'&&i.cat===sc.cat&&!['closed','rejected'].includes(i.stage)&&i.km<3)
    .map(i=>{const m=Math.hypot(i.x-sc.x,i.y-sc.y)*30;return {id:i.id,title:i.title,dist:Math.round(m),score:Math.max(0,Math.round(98-m/20)),sup:i.sup,by:i.by,h:Math.round((Date.now()-i.created)/H),stage:i.stage}})
    .filter(m=>m.dist<700).sort((a,b)=>b.score-a.score);
  return {...sc,scene,dept:deptFor(sc.cat,'Chennai'),corp:CITY.Chennai.corp,catLabel:CATS[sc.cat].l,icon:CATS[sc.cat].icon,
    summary:`${sc.label} at ${sc.street}, Velachery. ${sc.risk}.`,matches,strong:matches[0]&&matches[0].score>=85?matches[0]:null};
}

const A={
  support(id){if(S.my.support[id])return {};const i=find(id);if(M('opposed')[id]){delete S.my.opposed[id];i.opp=Math.max(0,i.opp-1);i.conf=Math.min(97,i.conf+3);}S.my.support[id]=true;i.sup++;const crossed=bump(i,2);save();return {crossed};},
  unsupport(id){const i=find(id);if(!S.my.support[id]||i.mine)return;delete S.my.support[id];i.sup--;i.conf=Math.max(5,i.conf-2);save();},
  oppose(id){const i=find(id);if(i.mine)return {};const O=M('opposed');if(O[id]){delete O[id];i.opp=Math.max(0,i.opp-1);i.conf=Math.min(97,i.conf+3);save();return {};}if(S.my.support[id]){delete S.my.support[id];i.sup--;i.conf=Math.max(5,i.conf-2);}O[id]=true;i.opp=(i.opp||0)+1;i.conf=Math.max(5,i.conf-3);save();return {};},
  removeEvidence(id,idx){const i=find(id);if(!i||i.caseId||!['reported','community'].includes(i.stage))return {};const e=i.evidence[idx];if(!e||e.uid!=='me')return {};i.evidence.splice(idx,1);let left=i.evidence.some(x=>x.uid==='me');if(!left&&!i.mine){const C=M('contrib');if(C[id]){delete C[id];i.conf=Math.max(5,i.conf-1);}ev(i,'Evidence withdrawn',S.me.anonDefault?'Anonymous':myName(),'ph-image','citizen');}save();return {left};},
  comment(id,text,anon){const i=find(id);(i.comments=i.comments||[]).push({by:anon?'Anonymous':myName(),text,ts:Date.now(),me:true});save();},
  removePhoto(id,ts){const i=find(id);if(!i)return;i.evidence=i.evidence.filter(e=>!(e.uid==='me'&&e.ts===ts));save();},
  share(id){const i=find(id);i.shares=(i.shares||0)+1;save();},
  editReport(id,p){const i=find(id);if(!i||!i.mine)return;Object.assign(i,p);ev(i,'Report edited by author','','ph-pencil-simple','citizen');save();},
  deleteReport(id){const i=find(id);if(!i||!i.mine)return;S.issues=S.issues.filter(x=>x.id!==id);['support','opposed','contrib','confirmed','validated'].forEach(k=>S.my[k]&&delete S.my[k][id]);save();},
  evidence(id){const i=find(id);const C=M('contrib');let crossed=false;const first=!C[id];if(!S.my.support[id]){if(M('opposed')[id]){delete S.my.opposed[id];i.opp=Math.max(0,i.opp-1);}S.my.support[id]=true;i.sup++;crossed=bump(i,2);}if(first){C[id]=true;crossed=bump(i,1)||crossed;ev(i,'New evidence contributor',S.me.anonDefault?'Anonymous':myName(),'ph-image','citizen');}i.evidence.push({by:initials(),uid:'me',ts:Date.now()});save();return {crossed,first};},
  validate(id,yes){const i=find(id);if(S.my.validated[id])return {};S.my.validated[id]=yes?1:-1;let crossed=false;if(yes){i.valYes++;crossed=bump(i,1);}else{i.valNo++;i.conf=Math.max(5,i.conf-3);}save();return {crossed,conf:i.conf};},
  report({scene,anon,joinId,text,tags,voice,photos}){
    const PN=Math.max(1,Math.min(10,photos||1));
    const a=analyze(scene);const who=anon?'Anonymous':myName();tags=tags||[];M('contrib');
    if(joinId){const i=find(joinId);i.tags=[...new Set([...(i.tags||[]),...tags])];S.my.contrib[joinId]=true;i.merged.push({by:who,h:0,text:text||(voice?voice.text:a.summary),sim:(a.matches.find(m=>m.id===joinId)||{}).score||90,me:true});
      let crossed=false;if(!S.my.support[joinId]){S.my.support[joinId]=true;i.sup++;crossed=bump(i,2);}
      for(let k=0;k<PN;k++)i.evidence.push({by:anon?'AN':ini(myName()),uid:'me',ts:Date.now()+k});crossed=bump(i,1)||crossed;ev(i,`${who} joined with a photo`,'AI merged a duplicate report','ph-intersect','citizen');save();return {id:joinId,crossed};}
    const id='CP-'+(S.seq++);const now=Date.now();
    const i={id,cat:a.cat,sev:a.sev,city:'Chennai',area:'Velachery',street:a.street,title:a.title,stage:'reported',sup:1,conf:24,created:now,x:a.x,y:a.y,km:0.1,anon:!!anon,mine:true,by:who,
      dept:a.dept,summary:a.summary,voice:voice||null,text:text||'',tags:tags.length?tags:[...TAGS[a.cat].slice(0,2),'velachery'],comments:[],opp:0,shares:0,merged:[],history:'',caseId:null,assignee:null,prio:null,due:null,confirms:0,needed:25,valYes:0,valNo:0,
      evidence:Array.from({length:PN},(_,k)=>({by:anon?'AN':ini(myName()),uid:'me',ts:now+k})),events:[{ts:now,title:`${anon?'Anonymous':'You'} reported it`,sub:`AI: ${a.label} · ${a.sev}`,icon:'ph-camera',kind:'citizen',photo:''}],reject:null};
    S.issues.unshift(i);S.my.support[id]=true;S.my.contrib[id]=true;save();return {id,crossed:false};
  },
  verify(id,{assignee,prio}){const i=find(id);const days={P1:5,P2:10,P3:21}[prio]||5;i.caseId=`CP-${CITY[i.city].code}-${S.caseSeq++}`;i.prio=prio;i.assignee=assignee;i.due=Date.now()+days*D;i.stage='assigned';
    ev(i,`Verified by ${corp(i)}`,`Inspected by ${VERIFIER}`,'ph-seal-check','gov');ev(i,`Official case ${i.caseId}`,`${i.dept} · ${days}-day SLA`,'ph-bank','gov');ev(i,`Assigned to ${assignee}`,'','ph-user-circle-check','gov');save();return i.caseId;},
  reject(id,reason){const i=find(id);i.stage='rejected';i.reject=reason;ev(i,'Not accepted by '+corp(i),`Reason: ${reason}`,'ph-x-circle','gov');save();},
  inspect(id){const i=find(id);ev(i,'Field inspection scheduled','Within 24 hours','ph-binoculars','gov');save();},
  note(id,title,sub){const i=find(id);ev(i,title,sub||'','ph-megaphone','gov');save();},
  setStatus(id,st){const i=find(id);if(!i||i.stage===st)return;i.stage=st;
    if(st==='assigned')ev(i,`Assigned to ${i.assignee||CITY[i.city].officers[0]}`,'','ph-user-circle-check','gov');
    if(st==='progress')ev(i,'Work started on site','Crew deployed','ph-hard-hat','gov','crew on site');
    if(st==='resolved'){i.confirms=Math.max(i.confirms,Math.round(i.needed*0.7));ev(i,'Marked fixed by department','Proof photo attached · citizens asked to confirm','ph-check','fix','after photo');}
    if(st==='closed')ev(i,'Case closed',`${i.confirms} of ${i.needed} citizens confirmed`,'ph-seal-check','fix');
    if(st==='verified')ev(i,'Moved back to verified','','ph-arrow-counter-clockwise','gov');
    save();},
  confirm(id,fixed,reason){const i=find(id);if(S.my.confirmed[id])return {};S.my.confirmed[id]=fixed?1:-1;
    if(fixed){i.confirms++;ev(i,'A citizen confirmed the fix',`${i.confirms} of ${i.needed}`,'ph-thumbs-up','citizen');if(i.confirms>=i.needed){i.stage='closed';ev(i,'Case closed',`${i.confirms} of ${i.needed} citizens confirmed`,'ph-seal-check','fix');}}
    else{i.disputes=(i.disputes||0)+1;ev(i,'Citizen says: not fixed',reason||'','ph-thumbs-down','citizen');if(i.stage==='resolved'&&i.disputes>=3){i.stage='progress';i.reopened=(i.reopened||0)+1;ev(i,'Reopened by citizens',`${i.disputes} citizens said not fixed`,'ph-arrow-counter-clockwise','citizen');}}
    save();return {closed:i.stage==='closed'};},
  approve(id,{dept,team,due,note}){const i=find(id);i.dept=dept;i.team=team;i.assignee=team;i.due=due;i.prio=null;i.caseId=`CP-${CITY[i.city].code}-${S.caseSeq++}`;i.stage='assigned';
    const dd=new Date(due).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'});
    ev(i,`Verified by ${corp(i)}`,`Reviewed by ${VERIFIER}`,'ph-seal-check','gov');ev(i,`Official case ${i.caseId}`,`${dept} · target ${dd}`,'ph-bank','gov');ev(i,`Assigned to ${team}`,`Target date ${dd}`,'ph-users-three','gov');
    if(note)ev(i,'Update from '+corp(i),note,'ph-megaphone','gov');save();return i.caseId;},
  editAssign(id,{dept,team,due}){const i=find(id);const ch=i.team!==team||i.dept!==dept;i.dept=dept;i.team=team;i.assignee=team;i.due=due;const dd=new Date(due).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'});ev(i,ch?`Moved to ${team}`:'Target date updated',`${dept} · target ${dd}`,'ph-calendar-check','gov');save();},
  rejectCase(id,{reason,note,proof,ref}){const i=find(id);i.stage='rejected';i.reject=reason;i.rejectNote=note;i.rejectProof=proof||[];i.rejectRef=ref||'';i.rejectedAt=Date.now();ev(i,'Not accepted by '+corp(i),`Reason: ${reason}`,'ph-x-circle','gov');save();},
  markFixed(id,{note,proof}){const i=find(id);i.fixProof=proof||[];i.fixNote=note||'';i.stage='resolved';i.disputes=0;i.confirms=i.reopened?0:Math.max(i.confirms,Math.round(i.needed*0.7));ev(i,'Marked fixed by department',note||'Proof photo attached · citizens asked to confirm','ph-check','fix','after photo');save();},
  reassign(id,assignee){const i=find(id);i.assignee=assignee;ev(i,`Reassigned to ${assignee}`,'','ph-user-switch','gov');save();},
  govAdvance(id){const i=find(id);const next={reported:'community',community:'review',review:'verify',verified:'assigned',assigned:'progress',progress:'resolved'}[i.stage];if(!next)return null;
    if(next==='community'){i.sup=Math.max(i.sup,6);i.stage='community';i.conf=Math.max(i.conf,60);ev(i,'Neighbours joined','','ph-users-three','community');save();}
    else if(next==='review'){i.conf=79;bump(i,1);save();}
    else if(next==='verify')A.verify(id,{assignee:CITY[i.city].officers[0],prio:i.sev==='critical'||i.sev==='high'?'P1':'P2'});
    else A.setStatus(id,next);return find(id).stage;},
  setMe(p){Object.assign(S.me,p);save();},
  reset(){S=seed();save();}
};
window.CP={get:()=>S,find,act:(n,...a)=>A[n](...a),subscribe:f=>{subs.add(f);return ()=>subs.delete(f);},analyze,
  CATS,CITY,STAGES,SCENES,ME,VERIFIER,SEVW,ORDER,H,D,
  step:st=>STAGES[st].step,
  stats:i=>({citizens:i.sup,contributors:new Set(i.evidence.map(e=>e.uid||e.by)).size,photos:i.evidence.length}),
  score:i=>Math.min(99,Math.round(SEVW[i.sev]+i.conf*0.4+Math.min(i.sup,60)*0.3)),
  ago(ts){const m=Math.max(1,Math.round((Date.now()-ts)/60000));return m<60?m+'m':m<1440?Math.round(m/60)+'h':Math.round(m/1440)+'d';},
  date(ts){return new Date(ts).toLocaleString('en-IN',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit',hour12:false}).toUpperCase().replace(',',' ·');},
  slaLeft(i){if(!i.due)return '';const d=i.due-Date.now(),a=Math.abs(d),dd=Math.floor(a/D),hh=Math.floor((a%D)/H);const s=dd?`${dd}d ${hh}h`:`${hh}h`;return d<0?`Overdue ${s}`:`${s} left`;},
  slaRisk(i){if(!i.due||['resolved','closed'].includes(i.stage))return 0;const d=i.due-Date.now();return d<0?2:d<D?1:0;},
  corp
};
})();
