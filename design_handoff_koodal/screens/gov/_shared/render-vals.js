  renderVals(){

    const S=this.state,P=S.prefs,w=S.w,mob=w<720,desk=w>=1100,notMob=!mob;
    const sysDark=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme='light';
    const tr=T[P.lang]||T.en;
    const seg=(opts,cur,pick)=>opts.map(([k,l,icon])=>({l,icon,pick:()=>pick(k),bg:cur===k?'var(--cp-surface)':'transparent',fg:cur===k?'var(--cp-ink)':'var(--cp-ink-2)',sh:cur===k?'0 2px 6px -2px rgb(0 0 0 / .2)':'none'}));
    const langOpts=seg([['en','English'],['ta','தமிழ்']],P.lang,k=>this.setP('lang',k));
    if(!S.ready)return {ready:false,theme,showLogin:false,showApp:false,toast:S.toast};
    const now=Date.now(),scope=this.props.scope??'Chennai';
    const all=CP.get().issues.filter(i=>scope==='All'||i.city===scope);
    const cases=all.filter(isCase);
    const corpL=scope==='All'?'All corporations':CP.CITY[scope].corp;
    const by=g=>cases.filter(i=>gs(i)===g);
    const pend=by('pending'),reop=by('reopened'),od=cases.filter(overdue),fixedL=by('fixed'),active=cases.filter(i=>['assigned','progress','reopened'].includes(gs(i)));
    const resArr=cases.filter(fixTs).map(i=>fixTs(i)-crossedAt(i)),avgRes=resArr.length?resArr.reduce((a,b)=>a+b,0)/resArr.length:0;
    const decArr=cases.filter(decTs).map(i=>decTs(i)-crossedAt(i)),avgDec=decArr.length?decArr.reduce((a,b)=>a+b,0)/decArr.length:0;
    const lp=mob?16:desk?36:24;
    const base={theme,tr,toast:S.toast,langOpts,mob,notMob,desk,notDesk:!desk,pad:mob?'18px 16px 28px':`26px ${lp}px 64px`,padX:lp+'px',negPad:-lp+'px',h1:mob?'30px':'38px',h1d:mob?'28px':'36px',kpiMin:mob?'140px':'170px',corpL,me:ME};

    // ---- login
    if(!S.authed){const lf=(k)=>e=>this.setState({[k]:k==='otp'?e.target.value.replace(/\D/g,'').slice(0,6):e.target.value,lerr:''});
      return {...base,showLogin:true,showApp:false,loginCols:desk?'minmax(0,1.1fr) minmax(0,1fr)':'minmax(0,1fr)',loginSide:desk,loginMobHead:!desk,
        loginStats:[{v:pend.length,l:'awaiting decision',c:'var(--cp-marigold)'},{v:active.length,l:'active cases',c:'#f5f5f5'},{v:by('closed').length,l:'closed by citizens',c:'var(--cp-leaf)'}],
        lId:S.lstep==='id',lOtp:S.lstep==='otp',empId:S.empId,pwd:S.pwd,otp:S.otp,lerr:S.lerr,onEmp:lf('empId'),onPwd:lf('pwd'),onOtp:lf('otp'),
        onIdKey:e=>{if(e.key==='Enter')this.signIn();},onOtpKey:e=>{if(e.key==='Enter')this.verifyOtp();},signIn:this.signIn,verifyOtp:this.verifyOtp,otpO:S.otp.length===6?1:.5,backId:()=>this.setState({lstep:'id',lerr:''})};}

    const tab=S.tab;
    const navDef=[['home','ph-house'],['cases','ph-folders'],['map','ph-map-trifold'],['insights','ph-chart-line-up'],['search','ph-magnifying-glass']];
    const activeTab=tab==='case'?S.from:tab;
    const nav=navDef.map(([k,ic])=>{const on=activeTab===k;return {l:tr[k],icon:(on?'ph-fill ':'ph-bold ')+ic,go:()=>this.go(k,k==='cases'?{}:{}),bg:on&&!mob?'var(--cp-surface-2)':'transparent',c:on?'#fff':'#8a8a8a',badge:k==='cases'&&pend.length?pend.length:null,bp:(desk&&!P.railC)?'static':'absolute'};});
    const R=i=>this.row(i);
    const sortCase=(a,b)=>CP.score(b)-CP.score(a);

    // ---- home
    const ageStr=ts=>CP.ago(ts);
    const kpis=[
      {icon:'ph-fill ph-hourglass-medium',ibg:'var(--cp-marigold)',ifg:'var(--cp-on-marigold)',v:pend.length,l:'Pending approval',s:'Crossed community threshold',go:()=>this.go('cases',{cSt:[],cCity:[],cArea:[],cDept:[],cCat:[],cq:'',cSt:['pending']})},
      {icon:'ph-bold ph-hard-hat',ibg:'var(--cp-peacock-soft)',ifg:'var(--cp-peacock)',v:active.length,l:'Active cases',s:'Assigned or in progress',go:()=>this.go('cases',{cSt:[],cCity:[],cArea:[],cDept:[],cCat:[],cq:''})},
      {icon:'ph-bold ph-alarm',ibg:'var(--cp-pulse)',ifg:'#fff',v:od.length,l:'Overdue',s:'Past SLA deadline',go:()=>this.go('cases',{cSt:[],cCity:[],cArea:[],cDept:[],cCat:[],cq:'',cSt:['overdue']})},
      {icon:'ph-bold ph-arrow-counter-clockwise',ibg:'var(--cp-pulse-soft)',ifg:'var(--cp-pulse-deep)',v:reop.length,l:'Reopened',s:'Citizens rejected the fix',go:()=>this.go('cases',{cSt:[],cCity:[],cArea:[],cDept:[],cCat:[],cq:'',cSt:['reopened']})},
      {icon:'ph-bold ph-check',ibg:'var(--cp-leaf-soft)',ifg:'var(--cp-leaf)',v:fixedL.length,l:'Awaiting confirmation',s:'Fixed · citizens verifying',go:()=>this.go('cases',{cSt:[],cCity:[],cArea:[],cDept:[],cCat:[],cq:'',cSt:['fixed']})},
      {icon:'ph-bold ph-timer',ibg:'var(--cp-surface-2)',ifg:'var(--cp-ink)',v:avgRes?dur(avgRes):'—',l:'Avg. resolution',s:'Threshold → fixed',go:()=>this.go('insights')}];
    const riskL=[...reop,...od.filter(i=>!i.reopened)].sort((a,b)=>(a.due||0)-(b.due||0));
    const weeks=Array.from({length:12},(_,k)=>{const end=now-(11-k)*7*D,start=end-7*D;const n=HN[k]+cases.filter(i=>{const t=crossedAt(i);return t>start&&t<=end;}).length,c=HC[k]+cases.filter(i=>{const t=fixTs(i);return t&&t>start&&t<=end;}).length;return {n,c,l:sdate(start)};});
    const wMax=Math.max(...weeks.map(x=>Math.max(x.n,x.c)),1);
    const mkTrend=hgt=>weeks.map(x=>({l:x.l,n:x.n,nh:Math.max(3,x.n/wMax*hgt)+'px',ch:Math.max(3,x.c/wMax*hgt)+'px',nt:`${x.n} opened`,ct:`${x.c} fixed`}));
    const areas={};cases.forEach(i=>{const a=areas[i.area]=areas[i.area]||{area:i.area,city:i.city,n:0,open:0,sup:0,xs:0,ys:0,cats:{}};a.n++;if(!['closed','rejected'].includes(i.stage))a.open++;a.sup+=i.sup;a.xs+=i.x;a.ys+=i.y;a.cats[i.cat]=(a.cats[i.cat]||0)+1;});
    const emA={};all.filter(i=>['reported','community'].includes(i.stage)).forEach(i=>{const a=emA[i.city+'|'+i.area]=emA[i.city+'|'+i.area]||{area:i.area,city:i.city,n:0,xs:0,ys:0};a.n++;a.xs+=i.x;a.ys+=i.y;});
    const hot=Object.values(areas).filter(a=>a.open>0).map(a=>{const tc=Object.entries(a.cats).sort((x,y)=>y[1]-x[1])[0][0];const em=(emA[a.city+'|'+a.area]||{}).n||0;return {...a,x:a.xs/a.n,y:a.ys/a.n,top:CP.CATS[tc].l,em,score:a.open*10+a.sup/4+em*3};}).sort((a,b)=>b.score-a.score);
    const hMax=Math.max(...hot.map(h=>h.score),1);
    const activity=[];cases.forEach(i=>i.events.forEach(e=>{if(/reported it$|joined|New evidence|Evidence withdrawn|neighbours joined/.test(e.title))return;activity.push({e,i});}));
    activity.sort((a,b)=>b.e.ts-a.e.ts);
    const KC={gov:['var(--cp-peacock-soft)','var(--cp-peacock)'],fix:['var(--cp-leaf-soft)','var(--cp-leaf)'],community:['var(--cp-marigold-soft)','var(--cp-ink)'],citizen:['var(--cp-surface-2)','var(--cp-ink)']};
    const firstName=a=>a.replace(/^(JE|AE|EE)\s+/,'');

    // ---- cases list
    const tabCount=k=>k==='overdue'?od.length:by(k).length;
    const q=S.cq.trim().toLowerCase();
    const cOther=i=>(!S.cCity.length||S.cCity.includes(i.city))&&(!S.cArea.length||S.cArea.includes(i.area))&&(!S.cDept.length||S.cDept.includes(DN(i)))&&(!S.cCat.length||S.cCat.includes(i.cat))&&(!q||[i.id,i.caseId,i.title,i.street,i.area,DN(i),TM(i)].join(' ').toLowerCase().includes(q));
    const cStF=i=>!S.cSt.length||S.cSt.some(k=>k==='overdue'?overdue(i):gs(i)===k);
    const SF={score:sortCase,newest:(a,b)=>crossedAt(b)-crossedAt(a),sla:(a,b)=>(a.due||crossedAt(a)+48*H)-(b.due||crossedAt(b)+48*H),support:(a,b)=>b.sup-a.sup};
    const L=cases.filter(i=>cStF(i)&&cOther(i)).sort(SF[S.sort]);
    const Lb=cases.filter(cOther).sort(SF[S.sort]);
    const uniq=f=>[...new Set(cases.map(f).filter(Boolean))].sort();
    const catKeys=[...new Set(cases.map(i=>i.cat))];
    const combo=(key,label,icon,opts,sel,set,o={})=>{const open=S.cbOpen===key,qq=open?(S.cbQ||'').toLowerCase():'';const f=opts.filter(x=>!qq||(x.l+' '+(x.sub||'')).toLowerCase().includes(qq));const sl=opts.filter(x=>sel.includes(x.k)).map(x=>x.l);const abs=!!o.abs;
      return {label,icon,open,showL:!!o.panel,z:open?40:1,rot:open?'180deg':'0deg',bd:open?'var(--cp-ink)':sel.length?'var(--cp-ink-3)':'var(--cp-line)',sh:open?'0 0 0 4px color-mix(in oklch,var(--cp-ink) 8%,transparent)':'none',
        summary:sl.length?(sl.length<=2?sl.join(', '):`${sl[0]}, ${sl[1]} +${sl.length-2}`):(o.single?label:`All ${label.toLowerCase()}s`),phC:sl.length?'var(--cp-ink)':'var(--cp-ink-3)',n:sel.length>1&&!o.single?String(sel.length):'',
        pos:abs?'absolute':'relative',top:abs?'100%':'auto',minW:abs&&!mob?'260px':'0',mt:abs?'6px':'0',q:open?S.cbQ:'',qph:`Search ${label.toLowerCase()}s`,onQ:e=>this.setState({cbQ:e.target.value}),
        toggle:()=>this.setState({cbOpen:open?null:key,cbQ:''}),close:()=>this.setState({cbOpen:null,cbQ:''}),clear:()=>set([]),none:!f.length,
        opts:f.map(x=>{const on=sel.includes(x.k);return {l:x.l,sub:x.sub||'',icon:x.icon||'',n:x.n==null?'':String(x.n),on,bg:on?'var(--cp-surface-2)':'transparent',cbg:on?'var(--cp-ink)':'var(--cp-surface)',cbd:on?'var(--cp-ink)':'var(--cp-edge)',ck:on?'var(--cp-bg)':'transparent',rad:o.single?'50%':'6px',pick:()=>{set(o.single?[x.k]:on?sel.filter(y=>y!==x.k):[...sel,x.k]);if(o.single)this.setState({cbOpen:null});}};})};};
    const O={city:src=>[...new Set(src.map(r=>r.city))].sort().map(c=>({k:c,l:c,sub:CP.CITY[c].corp,n:src.filter(r=>r.city===c).length,icon:'ph-city'})),
      area:src=>[...new Set(src.map(r=>r.area))].sort().map(a=>({k:a,l:a,sub:[...new Set(src.filter(r=>r.area===a).map(r=>r.city))].join(', '),n:src.filter(r=>r.area===a).length,icon:'ph-map-pin'})),
      dept:src=>DEPTS.filter(d=>src.some(r=>r.dn===d[0])).map(d=>({k:d[0],l:d[0],sub:d[1],n:src.filter(r=>r.dn===d[0]).length,icon:d[2]})),
      cat:src=>Object.keys(CP.CATS).filter(k=>src.some(r=>r.cat===k)).map(k=>({k,l:CP.CATS[k].l,n:src.filter(r=>r.cat===k).length,icon:CP.CATS[k].icon}))};
    const asR=i=>({city:i.city,area:i.area,cat:i.cat,dn:DN(i)});
    const cSrc=cases.map(asR);
    const cCombos=[scope==='All'&&combo('c-city','Region','ph-city',O.city(cSrc),S.cCity,v=>this.setState({cCity:v}),{panel:true}),combo('c-area','Area','ph-map-pin',O.area(cSrc.filter(r=>!S.cCity.length||S.cCity.includes(r.city))),S.cArea,v=>this.setState({cArea:v}),{panel:true}),combo('c-dept','Department','ph-buildings',O.dept(cSrc),S.cDept,v=>this.setState({cDept:v}),{panel:true}),combo('c-cat','Problem type','ph-squares-four',O.cat(cSrc),S.cCat,v=>this.setState({cCat:v}),{panel:true})].filter(Boolean);
    const STL=Object.fromEntries(STF);
    const rmv=(key,v)=>()=>this.setState(st=>({[key]:st[key].filter(x=>x!==v)}));
    const activeF=[...S.cSt.map(v=>({k:'Status',l:STL[v],clear:rmv('cSt',v)})),...S.cCity.map(v=>({k:'Region',l:v,clear:rmv('cCity',v)})),...S.cArea.map(v=>({k:'Area',l:v,clear:rmv('cArea',v)})),...S.cDept.map(v=>({k:'Dept',l:v,clear:rmv('cDept',v)})),...S.cCat.map(v=>({k:'Type',l:CP.CATS[v].l,clear:rmv('cCat',v)}))];
    const tiles=(list,sel,key,cn)=>list.map(([k,l])=>{const on=sel.includes(k);return {l,n:String(cn(k)),dot:k==='overdue'?'var(--cp-pulse)':PINC[k],on,bd:on?'var(--cp-ink)':'var(--cp-line)',bg:on?'var(--cp-surface-2)':'var(--cp-surface)',pick:()=>this.setState(st=>({[key]:on?st[key].filter(x=>x!==k):[...st[key],k]}))};});
    const SORTI={score:'ph-lightning',newest:'ph-clock',sla:'ph-calendar-check',support:'ph-users-three'};
    const vw=P.view||'list';
    const views=[['list','List','ph-rows'],['grid','Grid','ph-squares-four'],['board','Board','ph-kanban']].map(([k,l,icon])=>{const on=vw===k;return {l,icon,showL:desk,px:desk?'14px':'11px',bg:on?'var(--cp-surface)':'transparent',fg:on?'var(--cp-ink)':'var(--cp-ink-2)',sh:on?'0 2px 6px -2px rgb(0 0 0 / .2)':'none',pick:()=>this.setP('view',k)};});
    const dragI=S.dragId&&CP.find(S.dragId),dragG=dragI?gs(dragI):null;
    const board=BOARD.filter(([k])=>!S.cSt.length||S.cSt.includes(k)).map(([k,l,hint])=>{const cs=Lb.filter(i=>gs(i)===k);const over=S.dragOver===k&&!!dragG;const ok=!!dragG&&(ALLOW[dragG]||[]).includes(k);
      return {l,n:cs.length,dot:PINC[k],hint:dragG?(k===dragG?'':ok?ACTL[dragG+'>'+k]:'Not allowed'):hint,
        bg:over?(ok?'var(--cp-leaf-soft)':'var(--cp-pulse-soft)'):(ok?'color-mix(in oklch,var(--cp-leaf-soft) 55%,var(--cp-surface-2))':'var(--cp-surface-2)'),bd:over?(ok?'var(--cp-leaf)':'var(--cp-pulse)'):(ok?'var(--cp-leaf)':'transparent'),
        over:e=>{e.preventDefault();if(this.state.dragOver!==k)this.setState({dragOver:k});},drop:e=>{e.preventDefault();const id=this.dragId;this.dragId=null;this.setState({dragId:null,dragOver:null});if(id)this.moveTo(id,k);},
        empty:!cs.length,emptyL:ok?'Drop here':'No cases',
        cards:cs.map(i=>{const r=R(i),can=!!ALLOW[gs(i)],dr=S.dragId===i.id;return {...r,area:i.area,dg:can?'true':'false',cur:can?'grab':'pointer',op:dr?.45:1,tf:dr?'rotate(2deg) scale(.97)':'none',
          drag:e=>{if(!can){e.preventDefault();return;}try{e.dataTransfer.setData('text/plain',i.id);e.dataTransfer.effectAllowed='move';}catch(x){}this.dragId=i.id;this.buzz(8);setTimeout(()=>this.setState({dragId:i.id}),0);},dragEnd:()=>{this.dragId=null;this.setState({dragId:null,dragOver:null});}};})};});
    const fsCases={eyebrow:'Cases',title:'Filters',stHint:'Select any',status:tiles(STF.slice(1),S.cSt,'cSt',tabCount),combos:cCombos,hasSort:true,hasLayers:false,layers:[],
      sorts:SORTS.map(([k,l])=>({l,icon:SORTI[k],bd:S.sort===k?'var(--cp-ink)':'var(--cp-edge)',dotC:S.sort===k?'var(--cp-ink)':'transparent',pick:()=>this.setState({sort:k})})),
      cta:tab==='search'?'Show results':`Show ${vw==='board'?Lb.length:L.length} cases`,close:()=>this.setState({cfOpen:false,cbOpen:null}),reset:()=>this.setState({cSt:[],cCity:[],cArea:[],cDept:[],cCat:[],sort:'score'}),bodyClick:e=>e.stopPropagation()};
    // ---- case detail
    let d=null;const ci=S.cur&&CP.find(S.cur);
    if(ci){const i=ci,r=R(i),g=gs(i),li=LI[g],st=CP.stats(i),ca=crossedAt(i);
      const lifeTs=[ca,ca,evTs(i,/^Assigned to|^Verified by/),evTs(i,/^Work started/),fixTs(i),evTs(i,/closed/i)];
      if(g==='rejected')lifeTs[1]=decTs(i);
      const tl=i.events.slice().reverse().map((e,k,arr)=>{let t=e.title,s=e.sub;if(/reported it$/.test(t)){t='First report received';s='';}else if(/joined with a photo/.test(t)){t='Duplicate report merged';s='AI matched a nearby report';}else if(t==='New evidence contributor'){t='New evidence added';s='';}else if(t==='Evidence withdrawn'||/edited by author/.test(t)){s='';}else if(t==='Citizen says: not fixed'){s=s?`Reason: ${s}`:'';}
        const kc=KC[e.kind]||KC.citizen;return {t,s,icon:e.icon,bg:kc[0],fg:kc[1],date:CP.date(e.ts),lineD:k===arr.length-1?'none':'block'};});
      const pc=Math.min(11,st.photos);const off=CP.CITY[i.city].officers;
      const ang=k=>((135+k*27)%360)+'deg';const openAt=k=>()=>this.setState({tour:true});
      d={...r,mosaic:[0,1,2,3,4].map(k=>({gc:k===0?'1':k===1||k===3?'2':'3',gr:k===0?'1 / span 2':k<3?'1':'2',cap:k<st.photos?'photo '+(k+1):'',ang:ang(k),open:openAt(k)})),openAll:()=>this.setState({tour:true}),
        carousel:Array.from({length:Math.min(12,st.photos)},(_,k)=>({cap:'photo '+(k+1),ang:ang(k),open:openAt(k)})),carN:String(Math.min(12,st.photos)),carScroll:e=>{const el=e.currentTarget;const ix=Math.round(el.scrollLeft/Math.max(1,el.clientWidth));if(ix!==(this.state.carI||0))this.setState({carI:ix});},
        tour:i.evidence.map((ev,k)=>({span:k%3===0?'1 / -1':'auto',ar:k%3===0?'16 / 10':'1 / 1',cap:'photo '+(k+1),ago:CP.ago(ev.ts)+' ago',ang:ang(k)})),
        id:i.id,catL:CP.CATS[i.cat].l,place:`${i.street}, ${i.area}, ${i.city}`,summary:i.summary,tags:(i.tags||[]).map(t=>({t})),history:i.history||'',recurring:!!i.history,
        sup:i.sup,photoN:st.photos,contribN:st.contributors,crossedAgo:CP.ago(ca),confW:i.conf+'%',
        signals:[{icon:'ph-check-circle',v:i.valYes,l:'validated on site'},{icon:'ph-thumbs-down',v:i.opp||0,l:'said not an issue'},{icon:'ph-users',v:st.contributors,l:'added evidence'},{icon:'ph-images',v:st.photos,l:'photos'},{icon:'ph-intersect',v:(i.merged||[]).length,l:'duplicates merged'},{icon:'ph-chat-circle',v:(i.comments||[]).length,l:'comments'}],
        photos:Array.from({length:pc},(_,k)=>({cap:'photo '+(k+1),ago:CP.ago(i.evidence[k].ts)})),moreP:st.photos>pc?'+'+(st.photos-pc):'',
        life:LIFE.map(([l,icon],k)=>{const done=k<li,cur=k===li,rej=g==='rejected'&&k===1;return {l:rej?'Rejected':l,icon:rej?'ph-x':done?'ph-check':icon,bg:rej?'var(--cp-ink-3)':done?SEG[k]:cur?'var(--cp-ink)':'var(--cp-surface-2)',fg:done||cur||rej?(done&&k<2?'var(--cp-on-marigold)':'#fff'):'var(--cp-ink-3)',ring:cur&&!rej?'0 0 0 4px color-mix(in oklch,var(--cp-ink) 14%,transparent)':'none',lc:k<=li?'var(--cp-ink)':'var(--cp-ink-3)',line:k<li?SEG[k+1]:'var(--cp-line)',lineD:k===5?'none':'block',date:(k<=li&&lifeTs[k])?sdate(lifeTs[k]):''};}),
        timeline:tl,od:overdue(i),reopened:!!i.reopened&&g==='reopened',disputes:i.disputes||0,confirms:i.confirms,needed:i.needed,cfW:Math.min(100,i.confirms/i.needed*100)+'%',
        decLeft:(()=>{const left=ca+(this.props.decisionSla??48)*H-now;return left<0?`${dur(-left)} ago`:`in ${dur(left)}`;})(),
        resTime:fixTs(i)?dur(fixTs(i)-ca):'—',reject:i.reject||'',rejectNote:i.rejectNote||'',rejectRef:i.rejectRef||'',rejectProof:(i.rejectProof||[]).map(l=>({l})),
        aPending:g==='pending',aAssigned:g==='assigned',aWork:g==='progress'||g==='reopened',aFixed:g==='fixed',aClosed:g==='closed',aRejected:g==='rejected',
        pin:PINC[g],onMap:()=>this.go('map',{mapCity:i.city,mapSel:i.id,mArea:[],pvI:0,panX:(50-i.x)*6,panY:(50-i.y)*5,zoom:1.5}),
        approve:()=>this.openModal('approve',i),reject:()=>this.openModal('reject',i),inspect:()=>{CP.act('inspect',i.id);this.toast('Field inspection scheduled within 24 h');},
        start:()=>{CP.act('setStatus',i.id,'progress');this.toast('Work started · citizens notified');},fix:()=>this.openModal('fix',i),reassign:()=>this.openModal('assign',i),update:()=>this.openModal('update',i),
        info:[{k:'Case ID',v:i.caseId||'Issued on approval'},{k:'Signal ID',v:i.id},{k:'Department',v:i.caseId?DN(i):'Set on approval'},{k:'Team',v:i.caseId?TM(i):'Set on approval'},{k:'Target date',v:i.due?`${fdate(i.due)} · ${CP.slaLeft(i)}`:'Set on approval'},{k:'First reported',v:CP.date(i.created)},{k:'Threshold crossed',v:CP.date(ca)},{k:'AI severity',v:SEVL[i.sev][0]}]};}

    // ---- map
    const mapCity=scope==='All'?S.mapCity:scope;
    const inCity=cases.filter(i=>i.city===mapCity);
    const R1=S.mArea.length===1?S.mArea[0]:null;
    const inReg=inCity.filter(i=>(!S.mArea.length||S.mArea.includes(i.area))&&(!S.mDept.length||S.mDept.includes(DN(i)))&&(!S.mCat.length||S.mCat.includes(i.cat)));
    const stMatch=i=>!S.mSt.length||S.mSt.some(k=>k==='fixed'?['fixed','closed'].includes(gs(i)):gs(i)===k);
    const mapL=inReg.filter(stMatch).sort(sortCase);
    const shownPins=S.layers.cases?mapL:[];
    const pins=shownPins.map(i=>{const g=gs(i),sel=S.mapSel===i.id,hov=S.hoverId===i.id;return {title:i.title,x:i.x+'%',y:i.y+'%',sc:sel?1.15:hov?1.08:1,z:sel?7:hov?6:(overdue(i)||g==='reopened'?4:3),bg:sel?'var(--cp-ink)':'var(--cp-surface)',fg:sel?'var(--cp-bg)':'var(--cp-ink)',bd:sel?'var(--cp-ink)':'var(--cp-line)',dot:PINC[g],icon:CP.CATS[i.cat].icon,sup:i.sup,alarm:overdue(i)||g==='reopened'||g==='pending',pick:()=>{if(this.moved)return;this.setState({mapSel:i.id,pvI:0,mListOpen:false});}};});
    const hotC=hot.filter(h=>h.city===mapCity&&(!S.mArea.length||S.mArea.includes(h.area)));
    const heat=S.layers.hot?hotC.map(h=>({area:h.area,x:h.x+'%',y:h.y+'%',s:(70+h.open*26)+'px'})):[];
    const emC=Object.values(emA).filter(a=>a.city===mapCity&&(!S.mArea.length||S.mArea.includes(a.area)));
    const emerg=S.layers.emerging&&(this.props.showEmerging??true)?emC.map(a=>({n:a.n,t:`${a.n} emerging signals in ${a.area}`,x:a.xs/a.n+'%',y:a.ys/a.n+'%',s:(34+a.n*10)+'px'})):[];
    const msI=S.mapSel&&CP.find(S.mapSel);
    const layerOpts=[['cases','Cases','ph-map-pin',mapL.length],['hot','Hotspots','ph-fire',hotC.length],['emerging','Emerging','ph-circle-dashed',emC.reduce((a,e)=>a+e.n,0)]].map(([k,l,icon,n])=>{const on=S.layers[k];return {l,icon,n,pick:()=>this.setState(s=>({layers:{...s.layers,[k]:!s.layers[k]}})),bg:on?'var(--cp-ink)':'var(--cp-surface)',fg:on?'var(--cp-bg)':'var(--cp-ink)',bd:on?'var(--cp-ink)':'var(--cp-line)'};});
    const stChips=[['pending','Pending'],['assigned','Assigned'],['progress','In progress'],['reopened','Reopened'],['fixed','Fixed · closed']].map(([k,l])=>{const on=S.mapSt===k;const n=inReg.filter(i=>k==='fixed'?['fixed','closed'].includes(gs(i)):gs(i)===k).length;return {k,l,n,dot:PINC[k],pick:()=>this.setState({mapSt:on?null:k,mapSel:null}),bg:on?'var(--cp-ink)':'var(--cp-surface)',fg:on?'var(--cp-bg)':'var(--cp-ink)',bd:on?'var(--cp-ink)':'var(--cp-line)'};}).filter(c=>c.n||S.mapSt===c.k);
    const focus=(x,y,z)=>({panX:(50-x)*6,panY:(50-y)*5,zoom:z});
    const mapRows=mapL.map(i=>{const r=R(i),on=S.mapSel===i.id;return {...r,openCase:()=>this.open(i.id),hot:r.od||gs(i)==='reopened'||gs(i)==='pending',rowBg:on?'var(--cp-bg)':'transparent',rowBar:on?'var(--cp-pulse)':'transparent',pick:()=>this.setState({mapSel:i.id,pvI:0,mListOpen:false,...focus(i.x,i.y,Math.max(S.zoom,1.3))}),hover:()=>{if(S.hoverId!==i.id)this.setState({hoverId:i.id});},unhover:()=>this.setState({hoverId:null})};});
    const areasC=[...new Set(inCity.map(i=>i.area))].sort();
    const rq=(S.regQ||'').toLowerCase();
    const regAll=[{k:null,l:'All areas',sub:`${CP.CITY[mapCity].corp} · ${inCity.length} cases`,icon:'ph-buildings'},...areasC.map(a=>({k:a,l:a,sub:`${inCity.filter(i=>i.area===a).length} case${inCity.filter(i=>i.area===a).length===1?'':'s'} · ${inCity.filter(i=>i.area===a&&!['closed','rejected'].includes(i.stage)).length} open`,icon:'ph-map-pin'}))];
    const cityRows=scope==='All'?['Chennai','Coimbatore','Madurai'].filter(c=>c!==mapCity).map(c=>({k:'city:'+c,l:c,sub:CP.CITY[c].corp,icon:'ph-city'})):[];
    const regF=[...regAll,...cityRows].filter(x=>!rq||(x.l+' '+x.sub).toLowerCase().includes(rq));
    const pvTotal=msI?Math.max(1,CP.stats(msI).photos):1,pvI=Math.min(S.pvI||0,pvTotal-1);
    const pv=msI?{n:pvI+1,total:pvTotal,ago:CP.ago(msI.evidence[pvI]?msI.evidence[pvI].ts:msI.created),ang:(135+pvI*25)+'deg',prevO:pvI>0?1:.35,nextO:pvI<pvTotal-1?1:.35,
      thumbs:Array.from({length:Math.min(6,pvTotal)},(_,k)=>({bd:k===pvI?'#fff':'transparent',o:k===pvI?1:.6,pick:()=>this.setState({pvI:k})})),more:pvTotal>6?'+'+(pvTotal-6):''}:{};
    let ms={};if(msI){const r=R(msI),st=CP.stats(msI);ms={...r,photoN:st.photos,contribN:st.contributors,slaFgD:r.od||r.slaBg==='var(--cp-pulse)'?'#fb923c':'#bdbdbd',approve:()=>this.openModal('approve',msI),reject:()=>this.openModal('reject',msI)};}
    const listOn=!mob&&S.mapList!==false&&!S.mapFull;
    const full=tab==='map'&&!!S.mapFull;
    const mSrc=inCity.map(asR);
    const LAY=[['cases','Case pins','Every community case as a pin','ph-map-pin','var(--cp-ink)','var(--cp-bg)',mapL.length],['hot','Hotspots','Areas with the most open cases','ph-fire','var(--cp-pulse-soft)','var(--cp-pulse-deep)',hotC.length],['emerging','Emerging signals','Still gathering support · counts only','ph-circle-dashed','var(--cp-marigold-soft)','var(--cp-ink)',emC.reduce((a,e)=>a+e.n,0)]];
    const fsMap={eyebrow:'Map',title:'Filters',hasLayers:true,layers:LAY.map(([k,l,sub,icon,ibg,ifg,n])=>{const on=S.layers[k];return {l:`${l} · ${n}`,s:sub,icon,ibg,ifg,tbg:on?'var(--cp-leaf)':'var(--cp-line)',tx:on?'21px':'3px',pick:()=>this.setState(st=>({layers:{...st.layers,[k]:!st.layers[k]}}))};}),
      stHint:'Select any',status:tiles([['pending','Pending'],['assigned','Assigned'],['progress','In progress'],['reopened','Reopened'],['fixed','Fixed · closed']],S.mSt,'mSt',k=>inCity.filter(i=>k==='fixed'?['fixed','closed'].includes(gs(i)):gs(i)===k).length),
      combos:[scope==='All'&&combo('m-city','Region','ph-city',O.city(cSrc),[mapCity],v=>{if(v[0])this.setState({mapCity:v[0],mArea:[],mapSel:null,panX:0,panY:0,zoom:1});},{panel:true,single:true}),combo('m-area','Area','ph-map-pin',O.area(mSrc),S.mArea,v=>this.setState({mArea:v,mapSel:null}),{panel:true}),combo('m-dept','Department','ph-buildings',O.dept(mSrc),S.mDept,v=>this.setState({mDept:v,mapSel:null}),{panel:true}),combo('m-cat','Problem type','ph-squares-four',O.cat(mSrc),S.mCat,v=>this.setState({mCat:v,mapSel:null}),{panel:true})].filter(Boolean),
      hasSort:false,sorts:[],cta:`Show ${mapL.length} cases`,close:()=>this.setState({mfOpen:false,cbOpen:null}),reset:()=>this.setState({layers:{cases:true,hot:true,emerging:true},mSt:[],mArea:[],mDept:[],mCat:[]}),bodyClick:e=>e.stopPropagation()};
    const mfN=(S.layers.cases?0:1)+(S.layers.hot?0:1)+(S.layers.emerging?0:1)+S.mSt.length+S.mArea.length+S.mDept.length+S.mCat.length;
    const cfN=activeF.length;
    // ---- insights
    if(!this.hist)this.hist=genHist();
    const recReal=cases.map(i=>({city:i.city,area:i.area,cat:i.cat,dn:DN(i),created:crossedAt(i),dec:decTs(i),approved:!!i.caseId,fixed:fixTs(i),closed:i.stage==='closed'?(evTs(i,/closed/i)||fixTs(i)):null,reop:!!i.reopened,due:i.due}));
    const recAll=[...this.hist.filter(r=>scope==='All'||r.city===scope),...recReal];
    const recF=recAll.filter(r=>(!S.iCity.length||S.iCity.includes(r.city))&&(!S.iArea.length||S.iArea.includes(r.area))&&(!S.iDept.length||S.iDept.includes(r.dn))&&(!S.iCat.length||S.iCat.includes(r.cat)));
    const sod=t=>{const x=new Date(t);x.setHours(0,0,0,0);return x.getTime();};
    const RGS=[['today','Today',0],['yday','Yesterday',1],['7d','7 days',6],['30d','30 days',29],['mtd','This month',0],['90d','90 days',89],['12m','12 months',364],['custom','Custom']];
    let r0,r1=now;const rg=RGS.find(x=>x[0]===S.range)||RGS[3];
    if(S.range==='custom'){r0=S.from?pd(S.from):sod(now)-29*D;r1=Math.min(now,S.to?pd(S.to)+D-1:now);}else if(S.range==='yday'){r0=sod(now)-D;r1=sod(now)-1;}else if(S.range==='mtd'){const x=new Date(now);x.setDate(1);x.setHours(0,0,0,0);r0=x.getTime();}else r0=sod(now)-rg[2]*D;
    const len=Math.max(H,r1-r0),p0=r0-len,p1=r0-1;
    const inR=(t,a,b)=>!!t&&t>=a&&t<=b;
    const calc=(a,b)=>{const op=recF.filter(r=>inR(r.created,a,b)),fx=recF.filter(r=>inR(r.fixed,a,b)),cl=recF.filter(r=>inR(r.closed,a,b));const ot=fx.filter(r=>r.due&&r.fixed<=r.due).length,ro=fx.filter(r=>r.reop).length;
      return {op,fx,opened:op.length,fixed:fx.length,closed:cl.length,reopN:ro,res:fx.length?fx.reduce((x,r)=>x+(r.fixed-r.created),0)/fx.length/D:null,sla:fx.length?ot/fx.length*100:null,reopen:fx.length?ro/fx.length*100:null};};
    const cur=calc(r0,r1),prev=calc(p0,p1);
    const gran=len<=1.6*D?'hour':len<=45*D?'day':len<=200*D?'week':'month';
    const bks=[];{let t=gran==='hour'?sod(r0):sod(r0);if(gran==='month'){const x=new Date(r0);x.setDate(1);x.setHours(0,0,0,0);t=x.getTime();}
      while(t<=r1&&bks.length<60){let e;if(gran==='hour')e=t+H;else if(gran==='day')e=t+D;else if(gran==='week')e=t+7*D;else{const x=new Date(t);x.setMonth(x.getMonth()+1);e=x.getTime();}bks.push({a:t,b:e-1});t=e;}}
    const bv=bks.map(k=>calc(k.a,k.b));
    const MS=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const hh=t=>String(new Date(t).getHours()).padStart(2,'0')+':00';
    const bl=k=>gran==='hour'?hh(k.a):gran==='month'?MS[new Date(k.a).getMonth()]:sdate(k.a);
    const blFull=k=>gran==='hour'?`${sdate(k.a)} · ${hh(k.a)}–${hh(k.b+1)}`:gran==='day'?new Date(k.a).toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'short'}):gran==='week'?`${sdate(k.a)} – ${sdate(Math.min(k.b,r1))}`:new Date(k.a).toLocaleDateString('en-IN',{month:'long',year:'numeric'});
    const SER={opened:['Opened','var(--cp-marigold)'],fixed:['Fixed','var(--cp-leaf)'],reopN:['Reopened','var(--cp-pulse)'],closed:['Closed by citizens','var(--cp-peacock)'],res:['Avg. resolution','var(--cp-ink)'],sla:['On-time fixes','var(--cp-peacock)'],reopen:['Reopen rate','var(--cp-pulse)']};
    const mt=S.metric,skeys=mt==='overview'?['opened','fixed','reopN']:[mt],vis=mt==='overview'?skeys.filter(k=>S.series[k]!==false):skeys;
    const unit=mt==='res'?'d':(mt==='sla'||mt==='reopen')?'%':'';
    const fv=(v,u=unit)=>v==null?'—':u==='d'?v.toFixed(1)+'d':u==='%'?Math.round(v)+'%':String(v);
    const nice=v=>{const p=Math.pow(10,Math.floor(Math.log10(v)));const m=v/p;return (m<=1?1:m<=2?2:m<=5?5:10)*p;};
    let mx=Math.max(1,...vis.flatMap(k=>bv.map(b=>b[k]||0)));mx=unit==='%'?100:nice(mx);
    const NB=bks.length,every=Math.ceil(NB/(mob?6:desk?14:9)),line=S.chartT==='line',hB=S.hB!=null&&S.hB<NB?S.hB:null;
    const cols=bks.map((k,idx)=>({l:idx%every===0?bl(k):'',hbg:hB===idx?'var(--cp-surface-2)':'transparent',cur:gran==='hour'?'default':'zoom-in',
      enter:()=>{if(this.state.hB!==idx)this.setState({hB:idx});},pick:()=>{if(gran==='hour')return;this.buzz(6);this.setState({range:'custom',from:isoD(k.a),to:isoD(Math.min(k.b,now)),hB:null});},
      bars:line?[]:vis.map(sk=>({h:((bv[idx][sk]||0)/mx*100)+'%',c:SER[sk][1],o:hB==null||hB===idx?1:.4})),dots:line&&hB===idx?vis.map(sk=>({p:(bv[idx][sk]||0)/mx*100,c:SER[sk][1]})):[]}));
    const svg=line&&NB?React.createElement('svg',{viewBox:`0 0 ${NB} 100`,preserveAspectRatio:'none',style:{width:'100%',height:'100%',display:'block',overflow:'visible'}},vis.map((sk,si)=>{const pts=bv.map((b,i)=>`${i+.5},${100-(b[sk]||0)/mx*100}`).join(' ');
      return React.createElement('g',{key:sk},si===0?React.createElement('polygon',{points:`0.5,100 ${pts} ${NB-.5},100`,style:{fill:SER[sk][1],opacity:.1}}):null,React.createElement('polyline',{points:pts,vectorEffect:'non-scaling-stroke',style:{fill:'none',stroke:SER[sk][1],strokeWidth:2.5,strokeLinejoin:'round',strokeLinecap:'round'}}));})):null;
    const granL={hour:'Hourly',day:'Daily',week:'Weekly',month:'Monthly'}[gran];
    const rangeL=S.range==='today'?'Today':S.range==='yday'?'Yesterday':S.range==='mtd'?'This month':S.range==='custom'?(isoD(r0)===isoD(r1)?fdate(r0):`${sdate(r0)} – ${fdate(r1)}`):`Last ${rg[1]}`;
    const KP=[['opened','Cases opened','var(--cp-marigold)',false,''],['fixed','Fixed','var(--cp-leaf)',false,''],['closed','Closed by citizens','var(--cp-peacock)',false,''],['res','Avg. resolution','var(--cp-ink)',true,'d'],['sla','On-time fixes','var(--cp-peacock)',false,'%'],['reopen','Reopen rate','var(--cp-pulse)',true,'%']];
    const kpisI=KP.map(([k,l,c,low,u])=>{const a=cur[k],b=prev[k];let d='—',good=null;if(a!=null&&b!=null){if(u===''){if(b>0){const p=(a-b)/b*100;d=(p>=0?'+':'')+Math.round(p)+'%';good=p===0?null:(p>0)!==low;}else if(a>0){d='new';good=!low;}}else{const df=a-b;d=(df>=0?'+':'')+(u==='d'?df.toFixed(1)+'d':Math.round(df)+'pt');good=Math.abs(df)<.05?null:(df>0)!==low;}}
      const on=S.metric===k;const sp=bv.slice(-18).map(x=>x[k]||0);const sm=Math.max(1,...sp);
      return {l,v:fv(a,u),d,dBg:good==null?'var(--cp-surface-2)':good?'var(--cp-leaf-soft)':'var(--cp-pulse-soft)',dFg:good==null?'var(--cp-ink-2)':good?'var(--cp-leaf)':'var(--cp-pulse-deep)',dIcon:d.startsWith('-')?'ph-arrow-down-right':'ph-arrow-up-right',
        on,bg:on?'var(--cp-ink)':'var(--cp-surface)',fg:on?'var(--cp-bg)':'var(--cp-ink)',bd:on?'var(--cp-ink)':'var(--cp-line)',sh:on?'0 16px 30px -18px rgb(0 0 0 / .6)':'none',sc:on?'var(--cp-bg)':c,
        spark:sp.map(v=>({h:Math.max(8,v/sm*100)+'%',o:v?1:.25})),pick:()=>this.setState({metric:on?'overview':k,hB:null})};});
    const ticks=[0,.25,.5,.75,1].map(f=>({p:f*100,l:unit==='d'?(mx*f).toFixed(mx<4?1:0)+'d':unit==='%'?Math.round(mx*f)+'%':String(Math.round(mx*f))}));
    const tip=hB!=null?{x:((hB+.5)/NB*100)+'%',tx:hB<NB*.2?'-12%':hB>NB*.8?'-88%':'-50%',l:blFull(bks[hB]),rows:vis.map(sk=>({l:SER[sk][0],c:SER[sk][1],v:fv(bv[hB][sk])})),drill:gran==='hour'?'':gran}:null;
    const tgl=(key,v)=>()=>this.setState(st=>({[key]:st[key].includes(v)?st[key].filter(x=>x!==v):[...st[key],v]}));
    const catI={};cur.op.forEach(r=>{const x=catI[r.cat]=catI[r.cat]||{n:0,f:0};x.n++;if(r.fixed)x.f++;});
    const areaI={};cur.op.forEach(r=>{const x=areaI[r.area]=areaI[r.area]||{n:0,f:0};x.n++;if(r.fixed)x.f++;});
    const bMax=o=>Math.max(1,...Object.values(o).map(x=>x.n));
    const brow=(o,key,getL,getIcon,limit)=>{const m=bMax(o);return Object.entries(o).sort((a,b)=>b[1].n-a[1].n).slice(0,limit).map(([k,x])=>{const on=S[key].includes(k);return {l:getL(k),icon:getIcon(k),on,off:!on,bg:on?'var(--cp-surface-2)':'transparent',w1:x.f/m*100+'%',w2:(x.n-x.f)/m*100+'%',c1:'var(--cp-leaf)',c2:'var(--cp-marigold)',v:`${x.n} · ${Math.round(x.f/x.n*100)}% fixed`,go:tgl(key,k)};});};
    const LEG=[{l:'Fixed',c:'var(--cp-leaf)'},{l:'Still open',c:'var(--cp-marigold)'}];
    const DI=Object.fromEntries(DEPTS.map(d=>[d[0],d[2]]));
    const dAgg=DEPTS.map(([dn])=>{const op=cur.op.filter(r=>r.dn===dn),fx=cur.fx.filter(r=>r.dn===dn);return {dn,n:op.length,open:op.filter(r=>!r.fixed).length,res:fx.length?fx.reduce((a,r)=>a+(r.fixed-r.created),0)/fx.length/D:null,ot:fx.length?fx.filter(r=>r.due&&r.fixed<=r.due).length/fx.length*100:null,ro:fx.length?fx.filter(r=>r.reop).length/fx.length*100:null};}).filter(x=>x.n||x.res!=null);
    const DH=[['dn','Department'],['n','Cases'],['open','Open'],['res','Avg fix time'],['ot','On time'],['ro','Reopened']];
    dAgg.sort((a,b)=>S.dSort==='dn'?a.dn.localeCompare(b.dn):(b[S.dSort]??-1)-(a[S.dSort]??-1));
    const cm=k=>Math.max(1,...dAgg.map(x=>x[k]||0));
    const CELL=[['n','',v=>String(v),'var(--cp-marigold)'],['open','',v=>String(v),'var(--cp-pulse)'],['res','d',v=>v==null?'—':v.toFixed(1)+'d','var(--cp-ink-3)'],['ot','%',v=>v==null?'—':Math.round(v)+'%','var(--cp-leaf)'],['ro','%',v=>v==null?'—':Math.round(v)+'%','var(--cp-pulse)']];
    const resD=cur.fx.map(r=>(r.fixed-r.created)/D);const BIN=[['< 1 day',0,1,'var(--cp-leaf)'],['1–3 days',1,3,'var(--cp-leaf)'],['3–7 days',3,7,'var(--cp-peacock)'],['1–2 weeks',7,14,'var(--cp-marigold)'],['2+ weeks',14,1e9,'var(--cp-pulse)']];
    const binN=BIN.map(b=>resD.filter(v=>v>=b[1]&&v<b[2]).length),binM=Math.max(1,...binN);
    const hmAreas=Object.entries(areaI).sort((a,b)=>b[1].n-a[1].n).slice(0,7).map(x=>x[0]);const hmCats=Object.keys(CP.CATS).filter(k=>catI[k]);
    const hmV={};cur.op.forEach(r=>{const k=r.area+'|'+r.cat;hmV[k]=(hmV[k]||0)+1;});const hmM=Math.max(1,...Object.values(hmV));
    const op=cur.op,apN=op.filter(r=>r.approved).length,fxN=op.filter(r=>r.fixed).length,clN=op.filter(r=>r.closed).length;
    const cm0=(()=>{const x=new Date(now);x.setDate(1);x.setHours(0,0,0,0);return x.getTime();})();const addM=(t,n)=>{const x=new Date(t);x.setMonth(x.getMonth()+n);return x.getTime();};
    const nM=mob?1:2,dpBase=S.dpMonth||addM(cm0,-(nM-1));const A=S.dpA?pd(S.dpA):null,B=S.dpB?pd(S.dpB):null;
    const mkMonth=(ms,idx)=>{const d0=new Date(ms),y=d0.getFullYear(),mo=d0.getMonth(),first=new Date(y,mo,1).getDay(),nd=new Date(y,mo+1,0).getDate(),days=[];for(let k=0;k<first;k++)days.push({n:'',dis:true,band:'transparent',bandR:'0',bg:'transparent',fg:'transparent',cur:'default',td:'none',ring:'none',pick:()=>{}});
      for(let dd=1;dd<=nd;dd++){const t=new Date(y,mo,dd).getTime(),fut=t>sod(now),isA=A===t,isB=B===t,inRg=A!=null&&B!=null&&t>A&&t<B,end=isA||isB,wd=(first+dd-1)%7,hasR=A!=null&&B!=null&&A!==B&&(isA||isB||inRg);
        let bandR='0';if(hasR){if(isA)bandR='22px 0 0 22px';else if(isB)bandR='0 22px 22px 0';else bandR=wd===0?'22px 0 0 22px':wd===6?'0 22px 22px 0':dd===1?'22px 0 0 22px':dd===nd?'0 22px 22px 0':'0';}
        days.push({n:String(dd),dis:fut,band:hasR?'var(--cp-surface-2)':'transparent',bandR,bg:end?'var(--cp-ink)':'transparent',fg:end?'var(--cp-bg)':fut?'var(--cp-ink-3)':'var(--cp-ink)',td:fut?'line-through':'none',cur:fut?'not-allowed':'pointer',ring:t===sod(now)&&!end?'inset 0 0 0 1.5px var(--cp-ink-3)':'none',
          pick:()=>{if(fut)return;this.buzz(5);const iso=isoD(t);this.setState(st=>{if(!st.dpA||st.dpB)return {dpA:iso,dpB:null};if(t<pd(st.dpA))return {dpA:iso};return {dpB:iso};});}});}
      return {title:d0.toLocaleDateString('en-IN',{month:'long',year:'numeric'}),showPrev:idx===0,noPrev:idx!==0,showNext:idx===nM-1,days};};
    const lastShown=addM(dpBase,nM-1);
    const dpW=Math.min(mob?w:760,w-(mob?0:32)),dpL=Math.max(16,Math.min(S.dpX||16,w-dpW-16));
    const dpTab=S.dpTab||'dates';
    const dp={open:!!S.dpOpen,bd:S.dpOpen?'var(--cp-ink)':'var(--cp-line)',sh:S.dpOpen?'0 10px 26px -14px rgb(0 0 0 / .4)':'0 2px 0 var(--cp-edge)',
      toggle:e=>{const rc=e.currentTarget.getBoundingClientRect();this.setState({dpOpen:!S.dpOpen,dpX:rc.left,dpY:rc.bottom+10,dpA:isoD(r0),dpB:isoD(r1),dpMonth:null,dpMonths:[]});},close:()=>this.setState({dpOpen:false}),
      scrim:mob?'var(--cp-scrim)':'rgb(0 0 0 / .22)',l:mob?'0':dpL+'px',r:mob?'0':'auto',t:mob?'auto':(S.dpY||80)+'px',b:mob?'0':'auto',w:mob?'auto':dpW+'px',maxH:mob?'90vh':`calc(100vh - ${(S.dpY||80)+16}px)`,pad:mob?'18px 16px 22px':'24px 28px',rad:mob?'26px 26px 0 0':'28px',anim:mob?'cp-sheet .4s cubic-bezier(.2,.9,.3,1.1) both':'cp-pop2 .22s both',
      tabs:[['dates','Dates'],['quick','Quick select']].map(([k,l])=>{const on=dpTab===k;return {l,bg:on?'var(--cp-surface)':'transparent',fg:on?'var(--cp-ink)':'var(--cp-ink-2)',sh:on?'0 2px 8px -2px rgb(0 0 0 / .2)':'none',pick:()=>this.setState({dpTab:k})};}),
      isDates:dpTab==='dates',isQuick:dpTab==='quick',cols:`repeat(${nM},minmax(0,1fr))`,wd:['S','M','T','W','T','F','S'].map(l=>({l})),months:Array.from({length:nM},(_,k)=>mkMonth(addM(dpBase,k),k)),
      prev:()=>this.setState({dpMonth:addM(dpBase,-1)}),next:()=>{if(lastShown<cm0)this.setState({dpMonth:addM(dpBase,1)});},nextDis:lastShown>=cm0,
      boxes:[['From',A],['To',B]].map(([l,v],k)=>{const act=k===0?(!S.dpA||!!S.dpB):(!!S.dpA&&!S.dpB);return {l,v:v?fdate(v):'Add date',c:v?'var(--cp-ink)':'var(--cp-ink-3)',sh:act?'inset 0 0 0 2px var(--cp-ink)':'none'};}),
      quick:[['today','Today'],['yday','Yesterday'],['7d','Last 7 days'],['30d','Last 30 days'],['mtd','This month'],['90d','Last 90 days'],['12m','Last 12 months']].map(([k,l])=>{const on=S.range===k;return {l,bd:on?'var(--cp-ink)':'var(--cp-line)',bg:on?'var(--cp-surface-2)':'var(--cp-surface)',pick:()=>{this.buzz(6);this.setState({range:k,dpOpen:false,hB:null});}};}),
      monthsQ:Array.from({length:12},(_,k)=>{const t=addM(cm0,-k),x=new Date(t),key=isoD(t).slice(0,7),on=(S.dpMonths||[]).includes(key);return {m:x.toLocaleDateString('en-IN',{month:'long'}),y:String(x.getFullYear()),icon:on?'ph-calendar-check':'ph-calendar-blank',bd:on?'2px solid var(--cp-ink)':'1.5px solid var(--cp-line)',bg:on?'var(--cp-surface-2)':'var(--cp-surface)',pick:()=>{this.buzz(5);this.setState(st=>{const L0=st.dpMonths||[];return {dpMonths:L0.includes(key)?L0.filter(z=>z!==key):[...L0,key]};});}};}),
      hint:dpTab==='dates'?(S.dpA&&!S.dpB?'Now pick an end date':A&&B?`${Math.round((B-A)/D)+1} days selected`:'Pick a start date'):((S.dpMonths||[]).length?`${S.dpMonths.length} month${S.dpMonths.length>1?'s':''} selected`:'Choose a preset or months'),
      clear:()=>this.setState({dpA:null,dpB:null,dpMonths:[]}),
      apply:()=>{this.buzz([8,20,8]);if(dpTab==='quick'&&(S.dpMonths||[]).length){const ks=S.dpMonths.slice().sort();const [y1,m1]=ks[0].split('-').map(Number),[y2,m2]=ks[ks.length-1].split('-').map(Number);this.setState({range:'custom',from:isoD(new Date(y1,m1-1,1).getTime()),to:isoD(Math.min(now,new Date(y2,m2,0).getTime())),dpOpen:false,hB:null});return;}if(S.dpA)this.setState({range:'custom',from:S.dpA,to:S.dpB||S.dpA,dpOpen:false,hB:null});else this.setState({dpOpen:false});}};
    const ins={rangeL,recN:cur.opened,custom:S.range==='custom',fromV:isoD(r0),toV:isoD(r1),maxV:isoD(now),
      onFrom:e=>{if(e.target.value)this.setState({from:e.target.value,hB:null});},onTo:e=>{if(e.target.value)this.setState({to:e.target.value,hB:null});},
      ranges:RGS.map(([k,l])=>{const on=S.range===k;return {l,bg:on?'var(--cp-surface)':'transparent',fg:on?'var(--cp-ink)':'var(--cp-ink-2)',sh:on?'0 2px 6px -2px rgb(0 0 0 / .2)':'none',pick:()=>this.setState(k==='custom'?{range:'custom',from:isoD(r0),to:isoD(r1),hB:null}:{range:k,hB:null})};}),
      combos:[scope==='All'&&combo('i-city','Region','ph-city',O.city(recAll),S.iCity,v=>this.setState({iCity:v}),{abs:true}),combo('i-area','Area','ph-map-pin',O.area(recAll.filter(r=>!S.iCity.length||S.iCity.includes(r.city))),S.iArea,v=>this.setState({iArea:v}),{abs:true}),combo('i-dept','Department','ph-buildings',O.dept(recAll),S.iDept,v=>this.setState({iDept:v}),{abs:true}),combo('i-cat','Problem type','ph-squares-four',O.cat(recAll),S.iCat,v=>this.setState({iCat:v}),{abs:true})].filter(Boolean),
      anyF:!!(S.iCity.length||S.iArea.length||S.iDept.length||S.iCat.length),resetF:()=>this.setState({iCity:[],iArea:[],iDept:[],iCat:[]}),
      kpis:kpisI,leave:()=>{if(this.state.hB!=null)this.setState({hB:null});},tip,
      ch:{title:mt==='overview'?'Opened vs fixed':SER[mt][0]+' over time',sub:`${granL} · ${rangeL}${gran!=='hour'?' · click a bar to zoom in':''}`,ticks,cols,svg,gap:line?'0px':NB>40?'2px':'6px',bw:NB>40?'8px':'20px',
        legend:mt==='overview'?skeys.map(k=>({l:SER[k][0],c:SER[k][1],v:String(cur[k]),bd:'var(--cp-line)',o:S.series[k]===false?.4:1,pick:()=>this.setState(st=>({series:{...st.series,[k]:st.series[k]===false}}))})):[]},
      types:[['bars','Bars','ph-chart-bar'],['line','Line','ph-chart-line']].map(([k,l,icon])=>{const on=S.chartT===k;return {l,icon,bg:on?'var(--cp-surface)':'transparent',fg:on?'var(--cp-ink)':'var(--cp-ink-2)',sh:on?'0 2px 6px -2px rgb(0 0 0 / .2)':'none',pick:()=>this.setState({chartT:k})};}),
      breakdowns:[{t:'Problem types',s:'Cases opened in this period · click to filter',legend:LEG,empty:!Object.keys(catI).length,rows:brow(catI,'iCat',k=>CP.CATS[k].l,k=>CP.CATS[k].icon,10)},{t:'Areas',s:'Top areas by cases opened · click to filter',legend:LEG,empty:!Object.keys(areaI).length,rows:brow(areaI,'iArea',k=>k,()=>'ph-map-pin',8)}],
      dHead:DH.map(([k,l],ci)=>({l,jc:ci?'flex-end':'flex-start',c:S.dSort===k?'var(--cp-ink)':'var(--cp-ink-3)',icon:S.dSort===k?(k==='dn'?'ph-arrow-up':'ph-arrow-down'):'ph-caret-up-down',pick:()=>this.setState({dSort:k})})),
      dRows:dAgg.map(x=>({l:x.dn,icon:DI[x.dn],bg:S.iDept.includes(x.dn)?'var(--cp-surface-2)':'transparent',go:tgl('iDept',x.dn),cells:CELL.map(([k,u,f,bc])=>({v:f(x[k]),w:u==='%'?(x[k]||0)+'%':((x[k]||0)/cm(k)*100)+'%',bc,c:(k==='ot'&&x[k]!=null&&x[k]<70)||(k==='ro'&&x[k]>12)?'var(--cp-pulse-deep)':'var(--cp-ink)'}))})),
      fixedN:cur.fixed,hist:BIN.map((b,k)=>({l:b[0],c:b[3],h:Math.max(4,binN[k]/binM*120)+'px',pct:cur.fixed?Math.round(binN[k]/cur.fixed*100)+'%':'—',t:`${binN[k]} cases`})),
      funnel:[['Crossed threshold',op.length,'var(--cp-marigold)'],['Approved',apN,'var(--cp-peacock)'],['Fixed',fxN,'var(--cp-leaf)'],['Closed by citizens',clN,'var(--cp-ink)']].map(([l,v,c])=>({l,v:String(v),c,w:(op.length?v/op.length*100:0)+'%',p:op.length?Math.round(v/op.length*100)+'%':'—'})),
      hmN:hmCats.length,hmCols:hmCats.map(k=>({l:CP.CATS[k].l,icon:CP.CATS[k].icon})),hmRows:hmAreas.map(a=>({l:a,cells:hmCats.map(c=>{const v=hmV[a+'|'+c]||0,t=v/hmM;return {v:v?String(v):'',t:`${a} · ${CP.CATS[c].l}: ${v}`,bg:v?`color-mix(in oklch,var(--cp-pulse) ${Math.round(12+78*t)}%,var(--cp-surface-2))`:'var(--cp-surface-2)',fg:t>.5?'#fff':'var(--cp-ink)',pick:()=>this.setState({iArea:[a],iCat:[c]})};})})),
      export:()=>this.toast(`Exported ${cur.opened} cases · ${rangeL}`)};
    const areaCat={};all.forEach(i=>{const k=i.area+'|'+i.cat;areaCat[k]=(areaCat[k]||0)+1;});
    const recurring=cases.filter(i=>i.history||areaCat[i.area+'|'+i.cat]>1);
    const lrow=i=>{const r=R(i);return {title:i.title,sub:`${r.ref} · ${i.area} · ${DN(i)}`,sl:r.slShort,sbg:r.sbg,sfg:r.sfg,open:r.open};};
    const listCards=[{icon:'ph-repeat',t:'Recurring cases',s:'Same problem, same place — consider a permanent fix',rows:recurring.map(lrow),empty:recurring.length?'':'No recurring locations.'},{icon:'ph-arrow-counter-clockwise',t:'Reopened by citizens',s:'Fix was not accepted by the community',rows:cases.filter(i=>i.reopened).map(lrow),empty:cases.some(i=>i.reopened)?'':'No reopened cases.'}];

    // ---- search
    const sq=S.sq.trim().toLowerCase(),toks=sq.split(/\s+/).filter(Boolean);
    const hay=i=>[i.id,i.caseId,i.title,i.street,i.area,i.city,DN(i),TM(i),CP.CATS[i.cat].l,GS[gs(i)][0],overdue(i)?'overdue':'',...(i.tags||[])].join(' ').toLowerCase();
    const sFil=activeF.length>0;const sRes=(toks.length||sFil)?cases.filter(i=>cStF(i)&&(!S.cCity.length||S.cCity.includes(i.city))&&(!S.cArea.length||S.cArea.includes(i.area))&&(!S.cDept.length||S.cDept.includes(DN(i)))&&(!S.cCat.length||S.cCat.includes(i.cat))&&toks.every(t=>hay(i).includes(t))).sort(SF[S.sort]):[];
    const sA=toks.length?[...uniq(i=>i.area).filter(a=>a.toLowerCase().includes(sq)).map(a=>({l:a,icon:'ph-map-pin',n:cases.filter(i=>i.area===a).length,go:()=>this.go('cases',{cSt:[],cCity:[],cArea:[],cDept:[],cCat:[],cq:'',cArea:[a]})})),...uniq(i=>DN(i)).filter(a=>a.toLowerCase().includes(sq)).map(a=>({l:a,icon:'ph-buildings',n:cases.filter(i=>DN(i)===a).length,go:()=>this.go('cases',{cSt:[],cCity:[],cArea:[],cDept:[],cCat:[],cq:'',cDept:[a]})}))]:[];
    const pickQ=v=>this.setState(s=>({sq:v,recent:[v,...s.recent.filter(x=>x!==v)].slice(0,6)}));

    // ---- modal
    let mc={};const mi=S.modal&&CP.find(S.m.id);
    if(mi){const m=S.m;
      const chip=(on)=>({bd:on?'var(--cp-ink)':'var(--cp-line)',bg:on?'var(--cp-ink)':'var(--cp-surface)',fg:on?'var(--cp-bg)':'var(--cp-ink)'});
      const proof=(m.proof||[]).map((p,k)=>({...p,del:()=>this.mset({proof:m.proof.filter((_,j)=>j!==k)})}));
      const addPhoto=()=>this.mset({proof:[...(m.proof||[]),{l:`Site photo ${(m.proof||[]).filter(p=>p.icon==='ph-camera').length+1}`,icon:'ph-camera'}]});
      const addDoc=()=>this.mset({proof:[...(m.proof||[]),{l:'Inspection report.pdf',icon:'ph-file-text'}]});
      const onNote=e=>this.mset({note:e.target.value});
      const ref=mi.caseId||mi.id;const common={ref,case:mi.title,note:m.note,onNote,proof,addPhoto,addDoc};
      if(S.modal==='approve'||S.modal==='assign'){const ap=S.modal==='approve';const t0=new Date(new Date().setHours(18,0,0,0)).getTime();
        const q=[['In 3 days',3],['In 1 week',7],['In 2 weeks',14],['In 30 days',30]];
        mc={...common,title:ap?'Approve & assign':'Edit assignment',dept:true,combos:[combo('a-dept','Department','ph-buildings',DEPTS.map(([dn,tm,icon])=>({k:dn,l:dn,sub:tm,icon})),m.dept?[m.dept]:[],v=>{const r=DEPTS.find(x=>x[0]===v[0]);this.mset(r?{dept:r[0],team:r[1]}:{dept:null,team:null});},{panel:true,abs:true,single:true}),combo('a-team','Team','ph-users-three',DEPTS.map(([dn,tm])=>({k:tm,l:tm,sub:dn,icon:'ph-users-three'})),m.team?[m.team]:[],v=>this.mset({team:v[0]||null}),{panel:true,abs:true,single:true})],
          cal:(()=>{const now=new Date(),tod=new Date(now.getFullYear(),now.getMonth(),now.getDate()).getTime(),dd=new Date(m.due||Date.now()),off=m.calOff||0,base=new Date(dd.getFullYear(),dd.getMonth()+off,1),y=base.getFullYear(),mo=base.getMonth(),lead=(base.getDay()+6)%7,nd=new Date(y,mo+1,0).getDate(),canP=new Date(y,mo,1).getTime()>new Date(now.getFullYear(),now.getMonth(),1).getTime();const days=[];for(let k=0;k<lead;k++)days.push({n:'',vis:'hidden',dis:true,bd:'transparent',bg:'transparent',fg:'inherit',cur:'default',op:1,td:'none',pick:()=>{}});for(let n=1;n<=nd;n++){const t=new Date(y,mo,n).getTime(),on=isoD(t)===isoD(m.due),past=t<tod,today=t===tod;days.push({n:String(n),vis:'visible',dis:past,bd:today&&!on?'var(--cp-ink-3)':'transparent',bg:on?'var(--cp-ink)':'transparent',fg:on?'var(--cp-bg)':'var(--cp-ink)',cur:past?'default':'pointer',op:past?.3:1,td:past?'line-through':'none',pick:()=>{if(!past)this.mset({due:new Date(y,mo,n,18).getTime()});}});}const dl=Math.round((new Date(dd.getFullYear(),dd.getMonth(),dd.getDate()).getTime()-tod)/864e5);return {label:base.toLocaleDateString('en-IN',{month:'long',year:'numeric'}),pOp:canP?1:.35,prev:()=>{if(canP)this.mset({calOff:off-1});},next:()=>this.mset({calOff:off+1}),dows:['M','T','W','T','F','S','S'],days,sel:dd.toLocaleDateString('en-IN',{weekday:'short',day:'2-digit',month:'short',year:'numeric'}),rel:dl===0?'Today':dl===1?'Tomorrow':`in ${dl} days`};})(),
          date:true,quick:q.map(([l,n])=>({l,...chip(isoD(m.due)===isoD(t0+n*D)),pick:()=>this.mset({due:t0+n*D,calOff:0})})),dueV:isoD(m.due),minV:isoD(Date.now()),onDue:e=>{const v=e.target.value;if(v){const [y,mo,da]=v.split('-').map(Number);this.mset({due:new Date(y,mo-1,da,18).getTime()});}},
          path:true,pDept:m.dept,pTeam:m.team,pDate:fdate(m.due),
          noteOn:ap,noteL:'Message to citizens · optional',noteP:'e.g. Team will inspect the manhole tomorrow morning.',visible:ap?'An official case ID is issued. Every supporter sees the department, team and target date.':'Supporters see the change on the case timeline.',
          cta:'var(--cp-ink)',ctaFg:'var(--cp-bg)',ctaIcon:ap?'ph-check-circle':'ph-floppy-disk',ctaL:ap?'Approve & assign':'Save assignment',disabled:!(m.dept&&m.team&&m.due),
          submit:()=>{if(ap){const cid=CP.act('approve',mi.id,{dept:m.dept,team:m.team,due:m.due,note:m.note.trim()});this.setState({modal:null});this.toast(`Approved · ${cid} → ${m.team} · ${fdate(m.due)}`);}else{CP.act('editAssign',mi.id,{dept:m.dept,team:m.team,due:m.due});this.setState({modal:null});this.toast(`Assignment updated · ${m.team} · ${fdate(m.due)}`);}}};}
      else if(S.modal==='reject'){const okR=!!m.reason,okN=m.note.trim().length>=15,okP=(m.proof||[]).length>0;
        mc={...common,title:'Reject this case',reasons:true,reasonL:REASONS.map(([l,icon])=>({l,icon,on:m.reason===l,bd:m.reason===l?'var(--cp-ink)':'var(--cp-line)',bg:m.reason===l?'var(--cp-surface-2)':'var(--cp-surface)',pick:()=>this.mset({reason:l})})),
          needRef:m.reason===REASONS[0][0],refV:m.ref,onRef:e=>this.mset({ref:e.target.value}),
          noteOn:true,noteL:'Explanation · required',noteP:'Explain what the inspection found, in plain words citizens will understand.',proofOn:true,proofL:'Supporting proof · required',docOk:true,
          checks:true,checkL:[[okR,'Reason selected'],[okN,'Explanation (15+ characters)'],[okP,'At least one proof attached']].map(([ok,l])=>({l,icon:ok?'ph-fill ph-check-circle':'ph-bold ph-circle',c:ok?'var(--cp-ink)':'var(--cp-ink-3)'})),
          visible:'The reason, explanation and proof are shown to every citizen who supported this case.',cta:'var(--cp-pulse)',ctaFg:'#fff',ctaIcon:'ph-x-circle',ctaL:'Reject case',disabled:!(okR&&okN&&okP),
          submit:()=>{if(!(okR&&okN&&okP))return;CP.act('rejectCase',mi.id,{reason:m.reason,note:m.note.trim(),proof:m.proof.map(p=>p.l),ref:m.ref.trim()});this.setState({modal:null});this.toast('Case rejected · supporters notified with reason');}};}
      else if(S.modal==='fix'){const okP=(m.proof||[]).length>0;
        mc={...common,title:'Mark as fixed',proofOn:true,proofL:'After photo · required',docOk:false,noteOn:true,noteL:'Work summary · optional',noteP:'e.g. Manhole cover replaced, road surface patched.',
          visible:`Citizens will be asked to confirm. ${mi.needed} confirmations close the case; 3 “not fixed” responses reopen it.`,cta:'var(--cp-leaf)',ctaFg:'#fff',ctaIcon:'ph-check-circle',ctaL:'Send for citizen confirmation',disabled:!okP,
          submit:()=>{if(!okP)return;CP.act('markFixed',mi.id,{note:m.note.trim(),proof:m.proof.map(p=>p.l)});this.setState({modal:null});this.toast('Marked fixed · citizens asked to confirm');}};}
      else if(S.modal==='update'){mc={...common,title:'Post an update',noteOn:true,noteL:'Message to citizens',noteP:'e.g. Material has arrived, work resumes Monday.',visible:'Posted on the public case timeline and sent to all supporters.',cta:'var(--cp-ink)',ctaFg:'var(--cp-bg)',ctaIcon:'ph-megaphone',ctaL:'Post update',disabled:m.note.trim().length<5,
          submit:()=>{if(m.note.trim().length<5)return;CP.act('note',mi.id,'Update from '+CP.corp(mi),m.note.trim());this.setState({modal:null});this.toast('Update posted to citizens');}};}}

    // ---- profile/settings
    const myDec=cases.filter(i=>decTs(i)).length;
    const NT=[['threshold','New case crosses threshold','Instant alert when community support hits 80%'],['sla','SLA about to breach','24 hours before the deadline'],['reopen','Case reopened by citizens','When 3 citizens say not fixed'],['dispute','Citizen disputes a fix','Every “not fixed” response'],['digest','Daily digest','7:00 AM summary of your area']];
    const tog=(obj,k)=>({...obj,[k]:!obj[k]});
    const sessions=[{icon:'ph-desktop',l:'Chrome · Ripon Building office',s:'Chennai · active now',cur:true,other:false},{icon:'ph-device-mobile',l:'Koodal Gov · Android',s:'Chennai · 2h ago',cur:false,other:!S.ended.m,end:()=>{this.setState(s=>({ended:{...s.ended,m:1}}));this.toast('Signed out of Android session');}}].filter(s=>s.cur||s.other);

    return {...base,showLogin:false,showApp:true,showRail:!mob&&!full,nav,
      railW:desk&&!P.railC?'236px':'76px',railLabels:desk&&!P.railC,toggleRail:()=>{if(desk)this.setP('railC',!P.railC);},logoIn:()=>this.setState({logoH:true}),logoOut:()=>this.setState({logoH:false}),railTip:!desk?'Koodal':P.railC?'Expand sidebar':'Collapse sidebar',logoBg:S.logoH&&desk?'#141414':'transparent',logoCur:desk?'pointer':'default',markO:desk&&P.railC&&S.logoH?0:1,markS:desk&&P.railC&&S.logoH?.4:1,sideO:desk&&P.railC&&S.logoH?1:0,sideS:desk&&P.railC&&S.logoH?1:.4,collO:S.logoH?1:.5,
      goSettings:()=>this.go('settings'),goProfile:()=>this.go('profile'),setBg:tab==='settings'&&!mob?'var(--cp-surface-2)':'transparent',setC:tab==='settings'?'#fff':'#8a8a8a',profBg:tab==='profile'?'var(--cp-surface-2)':'transparent',
      mainPb:mob?'84px':'0',markF:theme==='dark'?'none':'invert(1)',popOpen:!!S.pop||(tab==='insights'&&!!S.cbOpen),closePop:()=>this.setState({pop:null,cbOpen:null}),
      isHome:tab==='home',isCases:tab==='cases',isCase:tab==='case'&&!!d,isMap:tab==='map',isIns:tab==='insights',isSearch:tab==='search',isProfile:tab==='profile',isSettings:tab==='settings',
      todayL:new Date().toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long'}),goSearch:()=>this.go('search'),goMap:()=>this.go('map'),goPending:()=>this.go('cases',{cSt:[],cCity:[],cArea:[],cDept:[],cCat:[],cq:'',cSt:['pending']}),goOverdue:()=>this.go('cases',{cSt:[],cCity:[],cArea:[],cDept:[],cCat:[],cq:'',cSt:[od.length?'overdue':'reopened']}),
      hasAlert:od.length+reop.length>0,alertT:`${od.length} overdue · ${reop.length} reopened`,alertS:'Citizens can see SLA breaches on the public case timeline.',
      kpis,homeCols:desk?'minmax(0,1.55fr) minmax(320px,1fr)':'minmax(0,1fr)',pendN:pend.length,pendRows:pend.sort(sortCase).slice(0,5).map(R),pendEmpty:!pend.length,
      riskN:riskL.length,riskRows:riskL.slice(0,5).map(R),riskEmpty:!riskL.length,trend:mkTrend(110),
      hotMini:hot.filter(h=>h.city===(scope==='All'?'Chennai':scope)).map(h=>({x:h.x+'%',y:h.y+'%',s:(30+h.open*18)+'px'})),
      hotRows:hot.slice(0,5).map((h,k)=>({n:k+1,area:h.area,top:h.top,open:h.open,w:h.score/hMax*100+'%',go:()=>this.go('cases',{cSt:[],cCity:[],cArea:[],cDept:[],cCat:[],cq:'',cArea:[h.area]})})),
      activity:activity.slice(0,7).map(({e,i})=>{const kc=KC[e.kind]||KC.citizen;return {t:e.title,icon:e.icon,bg:kc[0],fg:kc[1],ref:i.caseId||i.id,case:i.title,ago:CP.ago(e.ts),open:()=>this.open(i.id)};}),
      casesTotal:cases.length,cq:S.cq,onCq:e=>this.setState({cq:e.target.value}),clearCq:()=>this.setState({cq:''}),clearF:()=>this.setState({cSt:[],cCity:[],cArea:[],cDept:[],cCat:[],cq:''}),
      openCF:()=>this.setState({cfOpen:true,fsBig:false}),fsHt:mob?(S.fsBig?'92vh':'70vh'):'auto',fsScroll:e=>{if(mob&&!this.state.fsBig&&e.currentTarget.scrollTop>6)this.setState({fsBig:true});},mScroll:e=>{if(mob&&!this.state.mBig&&e.currentTarget.scrollTop>6)this.setState({mBig:true});},cfN:cfN?String(cfN):'',cfBd:cfN?'var(--cp-ink)':'var(--cp-line)',cfBg:cfN?'var(--cp-ink)':'var(--cp-surface)',cfFg:cfN?'var(--cp-bg)':'var(--cp-ink)',activeF,hasActiveF:activeF.length>0,
      openMF:()=>this.setState({mfOpen:true,fsBig:false}),mfN:mfN?String(mfN):'',mfBd:mfN?'var(--cp-ink)':'var(--cp-line)',mfBg:mfN?'var(--cp-ink)':'var(--cp-surface)',mfFg:mfN?'var(--cp-bg)':'var(--cp-ink)',
      fsOpen:!!(S.cfOpen||S.mfOpen),fs:S.mfOpen?fsMap:fsCases,fsL:mob?'0':'auto',fsR:mob?'0':'12px',fsT:mob?'auto':'12px',fsB:mob?'0':'12px',fsW:mob?'auto':'440px',fsMaxH:mob?'92vh':'none',fsRad:mob?'26px 26px 0 0':'26px',fsAnim:mob?'cp-sheet .4s cubic-bezier(.2,.9,.3,1.1) both':'cp-side .4s cubic-bezier(.2,.9,.3,1.05) both',fsScrim:mob?'var(--cp-scrim)':'rgb(0 0 0 / .18)',
      toggleFull:()=>this.setState(s=>({mapFull:!s.mapFull,mapSel:null})),fullTip:full?'Exit full screen':'Full screen map',fullIcon:full?'ph-arrows-in-simple':'ph-arrows-out-simple',mobChrome:mob,__x:!full,sheetTop:'24%',
      listN:vw==='board'?Lb.length:L.length,sortL:SORTS.find(x=>x[0]===S.sort)[1].toLowerCase(),rows:L.map(R),listEmpty:vw!=='board'&&!L.length,views,vTable:vw==='list'&&desk,vRows:vw==='list'&&!desk,vGrid:vw==='grid',vBoard:vw==='board',board,colW:mob?'82vw':'300px',boardH:mob?'calc(100vh - 330px)':'calc(100vh - 250px)',gridMin:mob?'100%':'280px',casesMax:vw==='board'?'100%':'1320px',boardHint:vw==='board'&&!mob?' · drag cards to move them through the workflow':'',
      mobSub:mob&&['case','profile','settings'].includes(tab),hdrPos:['case','profile','settings'].includes(tab)?'sticky':'relative',sH1:mob?'28px':'32px',cfBgS:cfN?'var(--cp-ink)':'linear-gradient(180deg,var(--cp-surface),var(--cp-surface-2))',mobMain:!(mob&&['case','profile','settings'].includes(tab)),mobTitle:tab==='case'&&d?d.ref:tr[tab]||'',mobSubT:tab==='case'&&d?d.sl:'',mobAct:tab==='case',mobNoAct:tab!=='case',mobBack:()=>tab==='case'?this.go(S.from||'cases'):this.go(S.back0||'home'),
      galH:desk?'440px':'340px',carN:String((S.carI||0)+1),tourOpen:tab==='case'&&!!S.tour&&!!d,closeTour:()=>this.setState({tour:false}),tourPad:mob?'12px':'24px',dp,
      d:d||{},back:()=>this.go(S.from||'cases'),backL:tr[S.from]||'Cases',copyLink:()=>{try{navigator.clipboard.writeText(location.href.split('#')[0]+'#'+(d&&d.ref));}catch(e){}this.toast('Case link copied');},detailCols:desk?'minmax(0,1fr) 380px':'minmax(0,1fr)',asidePos:desk?'sticky':'static',
      mapCols:mob?'minmax(0,1fr)':listOn?(desk?'380px minmax(0,1fr)':'340px minmax(0,1fr)'):'0px minmax(0,1fr)',listBd:listOn?'1px solid var(--cp-line)':'none',mapH:mob?'calc(100vh - 60px - 76px)':'100vh',mapPinN:mapL.length,
      regionTitle:R1||(S.mArea.length>1?`${S.mArea.length} areas`:mapCity),regionSub:S.mArea.length?`${S.mArea.join(', ')} · ${mapCity}`:`${CP.CITY[mapCity].corp} · all areas`,regionL:R1?`${R1}, ${mapCity}`:S.mArea.length?`${S.mArea.length} areas · ${mapCity}`:`${mapCity} · All areas`,
      mapRows,mapEmpty:!mapRows.length,toggleList:()=>mob?this.setState(s=>({mListOpen:!s.mListOpen,mMax:false,mapSel:null})):this.setState(s=>s.mapFull?{mapFull:false,mapList:true}:{mapList:s.mapList===false}),listHidden:!mob&&!listOn,
      mobListBtn:mob&&!S.mListOpen&&!msI&&!full,listBtnL:`Show list · ${mapL.length}`,mobListOpen:mob&&!!S.mListOpen&&!full,sheetH:`calc(${S.mMax?'100%':'70%'} - ${S.sheetDrag||0}px)`,sheetTr:S.sheetDrag?'none':'height .38s cubic-bezier(.2,.9,.3,1),border-radius .3s',sheetR:S.mMax&&!S.sheetDrag?'0':'26px 26px 0 0',sheetBd:S.mMax?'var(--cp-line)':'transparent',sheetDown:this.sheetDown,sheetScroll:e=>{if(!this.state.mMax&&e.currentTarget.scrollTop>6)this.setState({mMax:true});},sheetWheel:e=>{if(this.state.mMax&&e.currentTarget.scrollTop<=0&&e.deltaY<-4)this.setState({mMax:false});},
      openRegion:()=>this.setState({regOpen:true,regQ:''}),closeRegion:()=>this.setState({regOpen:false}),regOpen:!!S.regOpen,regQ:S.regQ||'',onRegQ:e=>this.setState({regQ:e.target.value}),regNone:!regF.length,
      regRows:regF.map(x=>{const on=x.k===(R1||null);return {...x,on,bd:on?'2px solid var(--cp-ink)':'1px solid var(--cp-line)',bg:on?'var(--cp-surface-2)':'var(--cp-surface)',ibg:on?'var(--cp-ink)':'var(--cp-surface-2)',ifg:on?'var(--cp-bg)':'var(--cp-ink)',
        pick:()=>{if(x.k&&x.k.startsWith('city:')){this.setState({mapCity:x.k.slice(5),mArea:[],regOpen:false,mapSel:null,panX:0,panY:0,zoom:1});return;}if(!x.k){this.setState({mArea:[],regOpen:false,mapSel:null,panX:0,panY:0,zoom:1});return;}const pts=inCity.filter(i=>i.area===x.k);const cx=pts.reduce((a,i)=>a+i.x,0)/pts.length,cy=pts.reduce((a,i)=>a+i.y,0)/pts.length;this.setState({mArea:[x.k],regOpen:false,mapSel:null,...focus(cx,cy,1.7)});}};}),
      layerOpts,stChips,
      mapDown:this.mapDown,mapWheel:this.mapWheel,mapCur:S.mapDrag?'grabbing':'grab',panXp:S.panX+'px',panYp:S.panY+'px',zoom:S.zoom,mapTr:S.mapDrag?'none':'transform .45s cubic-bezier(.2,.9,.3,1)',
      heat,emerg,pins,zoomIn:()=>this.setState(s=>({zoom:Math.min(3,s.zoom*1.3)})),zoomOut:()=>this.setState(s=>({zoom:Math.max(.7,s.zoom/1.3)})),recenter:()=>this.setState({panX:0,panY:0,zoom:1}),
      hasMapSel:!!msI,ms,pv,pvPrev:()=>this.setState({pvI:Math.max(0,pvI-1)}),pvNext:()=>this.setState({pvI:Math.min(pvTotal-1,pvI+1)}),closeSel:()=>this.setState({mapSel:null}),
      selR:mob?'10px':'20px',selL:mob?'10px':'auto',selB:mob?'10px':'20px',selW:mob?'auto':'340px',pvMax:mob?'120px':'150px',
      ins,listCards,insCols:desk?'repeat(2,minmax(0,1fr))':'minmax(0,1fr)',chartH:mob?'240px':'300px',insTop:'12px',insZ:S.cbOpen&&tab==='insights'?30:20,cbMin:mob?'140px':'190px',
      sRef:this.sRef,sq:S.sq,onSq:e=>this.setState({sq:e.target.value}),onSqKey:e=>{if(e.key==='Enter'&&S.sq.trim())pickQ(S.sq.trim());},clearSq:()=>this.setState({sq:''}),
      sEmpty:!toks.length&&!sFil,sHas:toks.length>0||sFil,recentL:S.recent.map(l=>({l,pick:()=>pickQ(l)})),
      trySugg:[['overdue','ph-alarm'],['sewage','ph-drop'],['Roads Team','ph-users-three'],['Sanitation','ph-buildings'],['CP-CHN-24781','ph-hash']].map(([l,icon])=>({l,icon,pick:()=>pickQ(l)})),
      sCount:`${sRes.length} case${sRes.length===1?'':'s'}${sA.length?` · ${sA.length} areas & departments`:''}`,sAreasHas:sA.length>0,sAreas:sA,sCasesHas:sRes.length>0,sRows:sRes.map(R),sNone:(toks.length>0||sFil)&&!sRes.length&&!sA.length,
      myStats:[{v:myDec,l:'Decisions made',s:'Approvals and rejections'},{v:avgDec?dur(avgDec):'—',l:'Avg. time to decide',s:`Target ${this.props.decisionSla??48}h`},{v:pend.length,l:'Waiting on you',s:'Pending approval'},{v:by('closed').length,l:'Closed by citizens',s:'In your jurisdiction'}],
      meInfo:[{k:'Role',v:ME.role},{k:'Designation',v:ME.title},{k:'Department',v:ME.dept},{k:'Corporation',v:corpL},{k:'Employee ID',v:ME.empId},{k:'Reports to',v:ME.reports},{k:'Office phone',v:ME.phone}],
      meAreas:uniq(i=>i.area).map(a=>({l:a,n:cases.filter(i=>i.area===a).length,go:()=>this.go('cases',{cSt:[],cCity:[],cArea:[],cDept:[],cCat:[],cq:'',cArea:[a]})})),
      notifs:NT.map(([k,l,s])=>{const on=P.notif[k];return {l,s,bg:on?'var(--cp-leaf)':'var(--cp-line)',x:on?'23px':'3px',toggle:()=>this.setP('notif',tog(P.notif,k))};}),
      chans:[['push','Push','ph-device-mobile'],['email','Email','ph-envelope-simple'],['sms','SMS','ph-chat-text']].map(([k,l,icon])=>{const on=P.ch[k];return {l,icon,bd:on?'var(--cp-ink)':'var(--cp-line)',bg:on?'var(--cp-ink)':'var(--cp-surface)',fg:on?'var(--cp-bg)':'var(--cp-ink)',toggle:()=>this.setP('ch',tog(P.ch,k))};}),
      setCols:'minmax(0,1fr)',
      toOpts:seg([['15 min','15m'],['30 min','30m'],['60 min','60m']],P.timeout,k=>this.setP('timeout',k)),sessions,changePwd:()=>this.toast('Password reset link sent to your official email'),
      acctInfo:[{k:'Name',v:ME.name},{k:'Official email',v:ME.email},{k:'Employee ID',v:ME.empId},{k:'Access level',v:'Review, assign & close-out · '+corpL}],exportLog:()=>this.toast('Action log (CSV) prepared for download'),signOut:this.signOut,
      modalOpen:!!mi,closeModal:()=>this.setState({modal:null}),stop:e=>e.stopPropagation(),mAlign:mob?'flex-end':'stretch',mJust:mob?'center':'flex-end',mMaxW:mob?'100%':'440px',mPad:mob?'0':'12px',mMax:mob?(S.mBig?'92vh':'70vh'):'calc(100vh - 24px)',mR:mob?'26px 26px 0 0':'26px',mAnim:mob?'cp-sheet .4s cubic-bezier(.2,.9,.3,1.1) both':'cp-side .42s cubic-bezier(.2,.9,.3,1.05) both',mc};
  }
}