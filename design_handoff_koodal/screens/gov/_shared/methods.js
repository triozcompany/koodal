// Koodal Government.dc.html — class Component methods except renderVals
class Component extends DCLogic {
  state={ready:false,w:window.innerWidth,authed:false,lstep:'id',empId:ME.empId,pwd:'koodal-demo',otp:'',lerr:'',tab:'home',cur:null,from:'home',cSt:[],cCity:[],cArea:[],cDept:[],cCat:[],cq:'',sort:'score',mSt:[],mArea:[],mDept:[],mCat:[],iCity:[],iArea:[],iDept:[],iCat:[],range:'90d',from:null,to:null,metric:'overview',chartT:'bars',series:{},hB:null,dSort:'n',cbOpen:null,cbQ:'',dragId:null,dragOver:null,pop:null,modal:null,m:{},panX:0,panY:0,zoom:1,mapDrag:false,mapSel:null,layers:{cases:true,hot:true,emerging:true},mapCity:'Chennai',sq:'',recent:['Velachery','CP-CHN-24781','Storm Water Drains'],prefs:DEF,toast:null,ended:{}};
  sRef=React.createRef();
  componentDidMount(){
    this.rip=e=>{const b=e.target&&e.target.closest&&e.target.closest('button');if(!b||b.disabled)return;this.buzz(5);const cs=getComputedStyle(b);const m=(cs.backgroundColor||'').match(/\d+(\.\d+)?/g);if(!m)return;const L=(+m[0]*.3+ +m[1]*.59+ +m[2]*.11)/255,a=m[3]===undefined?1:+m[3];if(a<.5||L>.45)return;const r=b.getBoundingClientRect(),d=Math.max(r.width,r.height)*2.2,s=document.createElement('span');s.className='cp-rip';s.style.cssText='width:'+d+'px;height:'+d+'px;left:'+(e.clientX-r.left-d/2)+'px;top:'+(e.clientY-r.top-d/2)+'px';if(cs.overflow==='visible')b.style.overflow='hidden';b.appendChild(s);setTimeout(()=>s.remove(),650);};
    document.addEventListener('pointerdown',this.rip,true);
    this.fit=()=>this.setState({w:window.innerWidth});window.addEventListener('resize',this.fit);
    let p=DEF,a=false;try{p={...DEF,...JSON.parse(localStorage.getItem(PKEY)||'{}')};a=localStorage.getItem(AKEY)==='1';}catch(e){}
    this.setState({prefs:p,authed:a});
    this.key=e=>{const t=(document.activeElement||{}).tagName||'';if(e.key==='/'&&!/INPUT|TEXTAREA/.test(t)&&this.state.authed){e.preventDefault();this.go('search');}if(e.key==='Escape')this.setState({tour:false,dpOpen:false,cbOpen:null,modal:null,pop:null,cfOpen:false,mfOpen:false,regOpen:false,mapSel:null});};window.addEventListener('keydown',this.key);
    const hook=()=>{if(window.CP){this.unsub=CP.subscribe(()=>this.forceUpdate());this.setState({ready:true},()=>{const q=new URLSearchParams(location.search),t=q.get('tab'),c=q.get('cur');if(!t)return;this.setState({authed:true},()=>c?this.open(c):this.go(t));});}else this.hk=setTimeout(hook,40);};hook();
  }
  componentWillUnmount(){document.removeEventListener('pointerdown',this.rip,true);window.removeEventListener('resize',this.fit);window.removeEventListener('keydown',this.key);clearTimeout(this.hk);clearTimeout(this.tt);this.unsub&&this.unsub();}
  buzz(p){if(this.props.haptics===false)return;try{navigator.vibrate&&navigator.vibrate(p);}catch(e){}}
  moveTo(id,k){const i=CP.find(id);if(!i)return;const g=gs(i);if(g===k)return;const key=g+'>'+k;
    if(key==='pending>assigned')return this.openModal('approve',i);if(key==='pending>rejected')return this.openModal('reject',i);
    if(key==='assigned>progress'){CP.act('setStatus',id,'progress');this.buzz([8,30,8]);return this.toast('Work started · citizens notified');}
    if(key==='progress>fixed'||key==='reopened>fixed')return this.openModal('fix',i);
    this.buzz([20,40,20]);this.toast(k==='closed'?'Only citizens can close a case — they confirm after you mark it fixed':k==='reopened'?'Cases reopen automatically when 3 citizens say it isn’t fixed':`Can’t move a case from ${GS[g][4]} to ${GS[k][4]}`);}
  toast(m){this.setState({toast:m});clearTimeout(this.tt);this.tt=setTimeout(()=>this.setState({toast:null}),2600);}
  setP(k,v){const prefs={...this.state.prefs,[k]:v};this.setState({prefs});try{localStorage.setItem(PKEY,JSON.stringify(prefs));}catch(e){}}
  go(tab,extra){const SUB=['profile','settings'];this.setState(s=>({tab,cur:null,pop:null,mapSel:null,mListOpen:false,mMax:false,tour:false,back0:SUB.includes(tab)&&!SUB.includes(s.tab)?(s.tab==='case'?s.from:s.tab):s.back0,...(extra||{})}));window.scrollTo(0,0);if(tab==='search')setTimeout(()=>this.sRef.current&&this.sRef.current.focus(),250);}
  open(id){this.setState(s=>({tab:'case',cur:id,from:s.tab==='case'?s.from:s.tab,pop:null,modal:null,carI:0,tour:false}));window.scrollTo(0,0);}
  mset(p){this.setState(s=>({m:{...s.m,...p}}));}
  openModal(kind,i){const base={id:i.id,note:'',proof:[]};const dd={critical:5,high:5,medium:10,low:14}[i.sev]||7;
    if(kind==='approve')Object.assign(base,{dept:DN(i),team:TM(i),due:new Date(new Date().setHours(18,0,0,0)).getTime()+dd*D});
    if(kind==='assign')Object.assign(base,{dept:DN(i),team:TM(i),due:i.due||Date.now()+dd*D});
    if(kind==='reject')Object.assign(base,{reason:null,ref:''});
    this.setState({modal:kind,m:base,mBig:false});}
  sheetDown=(e)=>{const y0=e.clientY;let dy=0;const mv=ev=>{dy=ev.clientY-y0;this.setState({sheetDrag:dy});};const up=()=>{window.removeEventListener('pointermove',mv);window.removeEventListener('pointerup',up);this.setState({sheetDrag:0});if(Math.abs(dy)<6){this.buzz(5);this.setState(s=>({mMax:!s.mMax}));return;}if(dy>70){this.buzz(8);this.setState(s=>s.mMax?{mMax:false}:{mListOpen:false});}else if(dy<-40){this.buzz(8);this.setState({mMax:true});}};window.addEventListener('pointermove',mv);window.addEventListener('pointerup',up);};
  mapDown=(e)=>{this.moved=false;if(e.target.closest&&e.target.closest('button'))return;const x0=e.clientX,y0=e.clientY,px=this.state.panX,py=this.state.panY;const mv=ev=>{const dx=ev.clientX-x0,dy=ev.clientY-y0;if(!this.moved&&Math.hypot(dx,dy)<5)return;this.moved=true;const L=500*this.state.zoom;this.setState({mapDrag:true,panX:Math.max(-L,Math.min(L,px+dx)),panY:Math.max(-L,Math.min(L,py+dy))});};const up=()=>{window.removeEventListener('pointermove',mv);window.removeEventListener('pointerup',up);this.setState({mapDrag:false});};window.addEventListener('pointermove',mv);window.addEventListener('pointerup',up);};
  mapWheel=(e)=>{const z=Math.max(.7,Math.min(3,this.state.zoom*(1-e.deltaY*0.0015)));this.setState({zoom:z,mapDrag:true});clearTimeout(this.wz);this.wz=setTimeout(()=>this.setState({mapDrag:false}),120);};
  signIn=()=>{const S=this.state;if(!S.empId.trim()||!S.pwd){this.setState({lerr:'Enter your employee ID and password.'});return;}this.setState({lstep:'otp',lerr:'',otp:''});};
  verifyOtp=()=>{if(this.state.otp.length!==6){this.setState({lerr:'Enter all six digits.'});return;}try{localStorage.setItem(AKEY,'1');}catch(e){}this.setState({authed:true,lstep:'id',lerr:'',tab:'home'});this.toast('Signed in · session secured with OTP');};
  signOut=()=>{try{localStorage.removeItem(AKEY);}catch(e){}this.setState({authed:false,lstep:'id',otp:'',modal:null});};

  row(i){const g=gs(i),G=GS[g],od=overdue(i),c=CP.CATS[i.cat],now=Date.now(),ca=crossedAt(i),dsla=(this.props.decisionSla??48)*H;
    let sla='—',slaBg='var(--cp-surface-2)',slaFg='var(--cp-ink-2)';
    if(g==='pending'){const left=ca+dsla-now;sla=left<0?`Decision late ${dur(-left)}`:`Decide in ${dur(left)}`;if(left<0){slaBg='var(--cp-pulse)';slaFg='#fff';}else if(left<12*H)slaBg='var(--cp-marigold-soft)';}
    else if(['assigned','progress','reopened'].includes(g)){sla=CP.slaLeft(i);if(od){slaBg='var(--cp-pulse)';slaFg='#fff';}else if(CP.slaRisk(i)===1)slaBg='var(--cp-marigold-soft)';}
    else if(g==='fixed'){sla=`${i.confirms}/${i.needed} confirmed`;slaBg='var(--cp-leaf-soft)';slaFg='var(--cp-ink)';}
    else if(g==='closed')sla='Met';else if(g==='rejected')sla='—';
    const sv=SEVL[i.sev],li=LI[g];
    return {id:i.id,ref:i.caseId||i.id,title:i.title,street:i.street,meta:`${i.area} · ${c.l}`,icon:c.icon,sl:G[0],slShort:G[4],sbg:G[1],sfg:G[2],sico:G[3],sup:i.sup,conf:i.conf,confW:i.conf+'%',dept:DN(i),assignee:i.caseId?TM(i):'Not assigned',prio:i.due?'Target '+sdate(i.due):'Target set on approval',photoN:CP.stats(i).photos,contribN:CP.stats(i).contributors,ang:(135+(parseInt(i.id.slice(3))%4)*20)+'deg',dot:PINC[g],sla,slaBg,slaFg,od,
      bar:od||g==='reopened'?'var(--cp-pulse)':g==='pending'?'var(--cp-marigold)':'transparent',sevL:sv[0],sevBg:sv[1],sevFg:sv[2],pending:g==='pending',riskL:g==='reopened'?'Reopened':sla,
      segs:LIFE.map(([l],k)=>({l,c:k<=li?(g==='rejected'&&k===1?'var(--cp-ink-3)':SEG[k]):'var(--cp-line)',lc:k===li?'var(--cp-ink)':'var(--cp-ink-3)'})),
      open:()=>this.open(i.id),approve:e=>{e.stopPropagation();this.openModal('approve',i);},reject:e=>{e.stopPropagation();this.openModal('reject',i);}};}

}