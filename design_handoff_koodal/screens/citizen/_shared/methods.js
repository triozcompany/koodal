// Koodal Citizen.dc.html — class Component methods except renderVals
class Component extends DCLogic {
  state={ready:false,screen:'home',prev:'home',cur:SHOW,theme:null,f:{region:'near',cat:[],stage:[],sev:[]},filterOpen:false,q:'',pop:null,sheetTop:null,sheetDrag:false,
    holdP:0,threshold:false,thP:0,scene:'sewage',captured:false,flash:false,voice:'idle',anon:false,slideX:0,sliding:false,an:null,aiStep:0,joining:false,
    deck:[],vi:0,vdrag:0,vdragging:false,vout:0,vres:[],stamp:false,notify:true,split:52,verdict:null,reason:null,casesTab:'mine',idOpen:false,idStep:0,otp:0,afterId:null,toast:null,w:window.innerWidth,h:window.innerHeight,base:'home',selId:null,dFilters:false,mountTs:Date.now(),pDrawer:false,cModal:false,fCtx:'search',sSort:'relevant',cSort:'recent',fArea:null,fAreaQ:'',fAreaOpen:false,fDept:null,fDeptQ:'',fDeptOpen:false,feedSort:'nearby',sheetGroup:null,commentsFor:null,cDraft:'',editFor:null,eTitle:'',eText:'',eTags:[],eTag:'',delAsk:false,profTab:'reports',casesTab:'following',descMode:'text',desc:'',tags:[],tagDraft:'',pName:'',pArea:''};
  qRef=React.createRef();dqRef=React.createRef();
  componentDidMount(){
    this.rip=e=>{const b=e.target&&e.target.closest&&e.target.closest('button');if(!b||b.disabled)return;const cs=getComputedStyle(b);const m=(cs.backgroundColor||'').match(/\d+(\.\d+)?/g);if(!m)return;const L=(+m[0]*.3+ +m[1]*.59+ +m[2]*.11)/255,a=m[3]===undefined?1:+m[3];if(a<.5||L>.45)return;const r=b.getBoundingClientRect(),d=Math.max(r.width,r.height)*2.2,s=document.createElement('span');s.className='cp-rip';s.style.cssText='width:'+d+'px;height:'+d+'px;left:'+(e.clientX-r.left-d/2)+'px;top:'+(e.clientY-r.top-d/2)+'px';if(cs.overflow==='visible')b.style.overflow='hidden';b.appendChild(s);setTimeout(()=>s.remove(),650);};
    document.addEventListener('pointerdown',this.rip,true);
    this.fit=()=>this.setState({w:window.innerWidth,h:window.innerHeight});this.fit();window.addEventListener('resize',this.fit);
    const hook=()=>{if(window.CP){this.stages={};CP.get().issues.forEach(i=>this.stages[i.id]=i.stage);this.unsub=CP.subscribe(()=>this.onStore());this.setState({ready:true,anon:CP.get().me.anonDefault},()=>{const q=new URLSearchParams(location.search),s=q.get('screen'),c=q.get('cur');if(!s)return;if(s==='ai'){this.setState({scene:q.get('scene')||'sewage'},()=>this.submitReport());}else this.go(s,c?{cur:c}:undefined);});}else this.hk=setTimeout(hook,40);};hook();
  }
  mapDown=(e)=>{const x0=e.clientX,y0=e.clientY,px=this.state.panX||0,py=this.state.panY||0;this.mapMoved=false;const mv=ev=>{const dx=ev.clientX-x0,dy=ev.clientY-y0;if(!this.mapMoved&&Math.hypot(dx,dy)<5)return;this.mapMoved=true;const L=500*(this.state.zoom||1);this.setState({mapDrag:true,panX:Math.max(-L,Math.min(L,px+dx)),panY:Math.max(-L,Math.min(L,py+dy))});};const up=()=>{window.removeEventListener('pointermove',mv);window.removeEventListener('pointerup',up);this.setState({mapDrag:false});setTimeout(()=>{this.mapMoved=false;},0);};window.addEventListener('pointermove',mv);window.addEventListener('pointerup',up);};
  mapWheel=(e)=>{const z=Math.max(.7,Math.min(3,(this.state.zoom||1)*(1-e.deltaY*0.0015)));this.setState({zoom:z,mapDrag:true});clearTimeout(this.wz);this.wz=setTimeout(()=>this.setState({mapDrag:false}),120);};
  componentWillUnmount(){window.removeEventListener('resize',this.fit);this.clearT();clearTimeout(this.hk);this.unsub&&this.unsub();}
  onStore(){const cur=CP.find(this.state.cur);if(cur&&this.stages[cur.id]&&this.stages[cur.id]!==cur.stage){this.toast(`Update · ${PILL[cur.stage][2]}`);this.buzz([8,30,8]);if(this.state.screen==='case'&&cur.caseId&&!this.state.stamp)this.later(()=>this.setState({stamp:true}),300);}
    this.stages={};CP.get().issues.forEach(i=>this.stages[i.id]=i.stage);this.forceUpdate();}
  clearT(){(this.t||[]).forEach(clearTimeout);this.t=[];cancelAnimationFrame(this.raf);}
  later(f,ms){(this.t=this.t||[]).push(setTimeout(f,ms));}
  buzz(p){if(this.props.haptics===false||this.state.hapticsOff)return;try{navigator.vibrate&&navigator.vibrate(p)}catch(e){}}
  toast(m){this.setState({toast:m});clearTimeout(this.tt);this.tt=setTimeout(()=>this.setState({toast:null}),2400);}
  go(s,extra){this.clearT();if(this.state.w>=720){if(s==='timeline')s='detail';if(s==='search')setTimeout(()=>this.dqRef.current&&this.dqRef.current.focus(),250);}const base={report:{captured:false,flash:false,voice:'idle',shots:0,slideX:0,sliding:false,anon:CP.get().me.anonDefault},ai:{aiStep:0},similar:{joining:false},detail:{holdP:0,threshold:false,thP:0},case:{stamp:false},verify:{split:52,verdict:null,reason:null},search:{},validate:{vi:0,vdrag:0,vout:0,vres:[]}}[s]||{};
    const isBack=extra&&extra.__back;if(extra)delete extra.__back;
    this.setState(st=>{const TABS=['home','feed','search','cases'];let hist=(st.hist||[]).slice();
      if(!isBack){if(TABS.includes(s))hist=[];else if(st.screen!==s||st.cur!==(extra&&extra.cur)){if(!FLOW.includes(st.screen)&&st.screen!=='settings'||s!=='profile')hist.push({s:st.screen,cur:st.cur});}}
      hist=hist.filter(e=>!FLOW.includes(e.s)).slice(-20);const top=hist[hist.length-1];
      return {screen:s,hist,prev:top?top.s:(FLOW.includes(st.screen)?st.prev:st.screen),base:FLOW.includes(s)?st.base:s,...base,...(extra||{}),filterOpen:false};},()=>this.enter(s));}
  goBack(){const hist=(this.state.hist||[]).slice();let e=hist.pop();while(e&&(FLOW.includes(e.s)||(e.s===this.state.screen&&e.cur===this.state.cur)))e=hist.pop();this.setState({hist});if(!e){this.go('home',{__back:true});return;}this.go(e.s,{__back:true,cur:e.cur});}
  enter(s){
    if(s==='ai'){if(!this.state.an)this.setState({an:CP.analyze(this.state.scene)});[1,2,3,4,5,6].forEach((n,i)=>this.later(()=>{this.setState({aiStep:n});this.buzz(6)},600+i*650));}
    if(s==='case'){const i=CP.find(this.state.cur);if(i&&i.caseId)this.later(()=>{this.setState({stamp:true});this.buzz([10,40,20])},500);}
    if(s==='search')this.later(()=>this.qRef.current&&this.qRef.current.focus(),200);
    if(s==='validate'){const D=CP.get();this.setState({deck:D.issues.filter(i=>i.city==='Chennai'&&i.km<3&&['community','review'].includes(i.stage)&&!i.mine&&!D.my.validated[i.id]).slice(0,4).map(i=>i.id)});}
    if(s==='detail'&&this.state.pendingThreshold){this.setState({pendingThreshold:false});this.later(()=>this.fireThreshold(),900);}
  }
  open(id){this.go('detail',{cur:id});}
  fireThreshold(){this.setState({threshold:true,thP:0});this.buzz([15,60,15,60,40]);const target=CP.find(this.state.cur).conf;const t0=performance.now();const tick=()=>{const k=Math.min(1,(performance.now()-t0)/1100);this.setState({thP:(1-Math.pow(1-k,3))*target});if(k<1)this.raf=requestAnimationFrame(tick);};this.raf=requestAnimationFrame(tick);}
  holdStart=()=>{const id=this.state.cur;if(CP.get().my.support[id])return;this.buzz(8);const t0=performance.now();const tick=()=>{const p=Math.min(1,(performance.now()-t0)/800);this.setState({holdP:p});if(p<1)this.raf=requestAnimationFrame(tick);else{this.buzz([12,50,30]);const r=CP.act('support',id);this.setState({holdP:0});if(r.crossed)this.later(()=>this.fireThreshold(),700);}};this.raf=requestAnimationFrame(tick);};
  holdEnd=()=>{if(CP.get().my.support[this.state.cur])return;cancelAnimationFrame(this.raf);this.setState({holdP:0});};
  drag(e,onMove,onUp){const el=e.currentTarget;const sc=(el.getBoundingClientRect().width/el.offsetWidth)||1;const x0=e.clientX,y0=e.clientY;const mv=ev=>onMove((ev.clientX-x0)/sc,(ev.clientY-y0)/sc);const up=()=>{window.removeEventListener('pointermove',mv);window.removeEventListener('pointerup',up);onUp();};window.addEventListener('pointermove',mv);window.addEventListener('pointerup',up);}
  sheetDown=(e)=>{const H=this.state.h,S0=[96,Math.round(H*0.3),H-230];const t0=this.state.sheetTop??S0[1];let moved=false;this.drag(e,(dx,dy)=>{if(Math.abs(dy)>4)moved=true;this.setState({sheetDrag:true,sheetTop:Math.max(S0[0],Math.min(H-60,t0+dy))});},()=>{const cur=this.state.sheetTop;if(moved&&cur>S0[2]+50){this.setState({sheetDrag:false,sheetHidden:true,sheetTop:null});this.buzz([6,20,6]);return;}const snap=!moved?(t0>S0[0]+40?S0[0]:S0[1]):S0.reduce((a,b)=>Math.abs(b-cur)<Math.abs(a-cur)?b:a);this.setState({sheetDrag:false,sheetTop:snap});this.buzz(6);});};
  slideDown=(e)=>{const track=e.currentTarget.parentElement;const max=track.offsetWidth-68;this.setState({sliding:true});this.drag(e,dx=>this.setState({slideX:Math.max(0,Math.min(max,dx))}),()=>{if(this.state.slideX>max*0.85){this.setState({sliding:false,slideX:max});this.buzz([10,30,40]);this.later(()=>this.submitReport(),350);}else this.setState({sliding:false,slideX:0});});};
  submitReport(){const an=CP.analyze(this.state.scene);this.setState({an});this.go('ai');}
  vDown=(e)=>{if(this.state.vout)return;this.setState({vdragging:true});this.drag(e,dx=>this.setState({vdrag:dx}),()=>{const d=this.state.vdrag;this.setState({vdragging:false});if(d>90)this.vote(1);else if(d<-90)this.vote(-1);else this.setState({vdrag:0});});};
  vote=(dir)=>{const S=this.state;if(S.vout||S.vi>=S.deck.length)return;const id=S.deck[S.vi];this.buzz(dir>0?[10,30,20]:14);let r={};if(dir)r=CP.act('validate',id,dir>0);this.setState({vout:dir||2});
    this.later(()=>this.setState(s=>({vi:s.vi+1,vout:0,vdrag:0,vres:[...s.vres,{id,dir,crossed:!!r.crossed,conf:r.conf}]})),340);};
  splitDown=(e)=>{const el=e.currentTarget;const set=ev=>{const b=el.getBoundingClientRect();this.setState({split:Math.max(3,Math.min(97,(ev.clientX-b.left)/b.width*100))});};set(e);const up=()=>{window.removeEventListener('pointermove',set);window.removeEventListener('pointerup',up);};window.addEventListener('pointermove',set);window.addEventListener('pointerup',up);};
  join(id){if(this.state.joining)return;this.buzz([10,40,30]);this.setState({joining:true});this.later(()=>{const r=CP.act('report',{scene:this.state.scene,anon:this.state.anon,joinId:id,...this.draft()});this.setState({an:null});this.go('detail',{cur:id,pendingThreshold:r.crossed});this.toast('Your photo was added as evidence');},1400);}
  postNew(){const r=CP.act('report',{scene:this.state.scene,anon:this.state.anon,...this.draft()});this.buzz([10,30,10]);this.setState({an:null});this.go('detail',{cur:r.id});this.toast(this.state.anon?'Posted anonymously':'Posted · neighbours can support it');}

  card(i,D){const st=CP.step(i.stage),[pc,pfg,pl]=PILL[i.stage],on=!!D.my.support[i.id];const dist=i.city==='Chennai'&&i.km<3?(i.km<1?Math.round(i.km*1000)+' m':i.km+' km'):i.city;
    return {id:i.id,icon:CP.CATS[i.cat].icon,title:i.title,meta:`${i.area} · ${dist} · ${CP.ago(i.created)}`,pc,pfg,pl,sevHot:i.sev==='critical',anonTag:i.mine&&i.anon,needsYou:i.stage==='resolved'&&!D.my.confirmed[i.id],
      segs:[0,1,2,3,4].map(j=>({c:i.stage==='rejected'?'var(--cp-line)':j<=st?SEGC[st]:'var(--cp-line)'})),
      n:i.sup,sb:on?'var(--cp-pulse)':'var(--cp-surface)',sf:on?'#fff':'var(--cp-ink)',si:on?'ph-fill ph-arrow-fat-up':'ph-bold ph-arrow-fat-up',st:this.state.pop===i.id?'scale(1.12)':'none',
      open:()=>this.open(i.id),
      support:(e)=>{e.stopPropagation();if(on){if(i.mine)return;CP.act('unsupport',i.id);this.buzz(6);return;}this.buzz([8,24,12]);const r=CP.act('support',i.id);this.setState({pop:i.id});setTimeout(()=>this.setState({pop:null}),220);if(r.crossed){this.go('detail',{cur:i.id});this.later(()=>this.fireThreshold(),700);}}};}

  draft(){const S=this.state;const sc=CP.SCENES[S.scene];const v=S.descMode==='voice'&&S.voice==='done';return {text:v?sc.voice.en:S.desc.trim(),voice:v?sc.voice:null,tags:S.tags,photos:S.shots||1};}
  openEdit(id){const i=CP.find(id);if(!i)return;this.setState({editFor:id,eTitle:i.title,eText:i.text||'',eTags:[...(i.tags||[])],eTag:'',delAsk:false});}
}