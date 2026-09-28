// render-vals.js line 3
    const S=this.state,P=S.prefs,w=S.w,mob=w<720,desk=w>=1100,notMob=!mob;

// render-vals.js line 6
    const tr=T[P.lang]||T.en;

// render-vals.js line 19
    const base={theme,tr,toast:S.toast,langOpts,mob,notMob,desk,notDesk:!desk,pad:mob?'18px 16px 28px':`26px ${lp}px 64px`,padX:lp+'px',negPad:-lp+'px',h1:mob?'30px':'38px',h1d:mob?'28px':'36px',kpiMin:mob?'140px':'170px',corpL,me:ME};

// render-vals.js line 82
    const activeF=[...S.cSt.map(v=>({k:'Status',l:STL[v],clear:rmv('cSt',v)})),...S.cCity.map(v=>({k:'Region',l:v,clear:rmv('cCity',v)})),...S.cArea.map(v=>({k:'Area',l:v,clear:rmv('cArea',v)})),...S.cDept.map(v=>({k:'Dept',l:v,clear:rmv('cDept',v)})),...S.cCat.map(v=>({k:'Type',l:CP.CATS[v].l,clear:rmv('cCat',v)}))];

// render-vals.js line 160
    const cfN=activeF.length;

// render-vals.js line 235
      scrim:mob?'var(--cp-scrim)':'rgb(0 0 0 / .22)',l:mob?'0':dpL+'px',r:mob?'0':'auto',t:mob?'auto':(S.dpY||80)+'px',b:mob?'0':'auto',w:mob?'auto':dpW+'px',maxH:mob?'90vh':`calc(100vh - ${(S.dpY||80)+16}px)`,pad:mob?'18px 16px 22px':'24px 28px',rad:mob?'26px 26px 0 0':'28px',anim:mob?'cp-sheet .4s cubic-bezier(.2,.9,.3,1.1) both':'cp-pop2 .22s both',

// render-vals.js line 267
    const sq=S.sq.trim().toLowerCase(),toks=sq.split(/\s+/).filter(Boolean);

// render-vals.js line 271
    const pickQ=v=>this.setState(s=>({sq:v,recent:[v,...s.recent.filter(x=>x!==v)].slice(0,6)}));

// render-vals.js line 315
      isHome:tab==='home',isCases:tab==='cases',isCase:tab==='case'&&!!d,isMap:tab==='map',isIns:tab==='insights',isSearch:tab==='search',isProfile:tab==='profile',isSettings:tab==='settings',

// render-vals.js line 323
      casesTotal:cases.length,cq:S.cq,onCq:e=>this.setState({cq:e.target.value}),clearCq:()=>this.setState({cq:''}),clearF:()=>this.setState({cSt:[],cCity:[],cArea:[],cDept:[],cCat:[],cq:''}),

// render-vals.js line 324
      openCF:()=>this.setState({cfOpen:true,fsBig:false}),fsHt:mob?(S.fsBig?'92vh':'70vh'):'auto',fsScroll:e=>{if(mob&&!this.state.fsBig&&e.currentTarget.scrollTop>6)this.setState({fsBig:true});},mScroll:e=>{if(mob&&!this.state.mBig&&e.currentTarget.scrollTop>6)this.setState({mBig:true});},cfN:cfN?String(cfN):'',cfBd:cfN?'var(--cp-ink)':'var(--cp-line)',cfBg:cfN?'var(--cp-ink)':'var(--cp-surface)',cfFg:cfN?'var(--cp-bg)':'var(--cp-ink)',activeF,hasActiveF:activeF.length>0,

// render-vals.js line 329
      mobSub:mob&&['case','profile','settings'].includes(tab),hdrPos:['case','profile','settings'].includes(tab)?'sticky':'relative',sH1:mob?'28px':'32px',cfBgS:cfN?'var(--cp-ink)':'linear-gradient(180deg,var(--cp-surface),var(--cp-surface-2))',mobMain:!(mob&&['case','profile','settings'].includes(tab)),mobTitle:tab==='case'&&d?d.ref:tr[tab]||'',mobSubT:tab==='case'&&d?d.sl:'',mobAct:tab==='case',mobNoAct:tab!=='case',mobBack:()=>tab==='case'?this.go(S.from||'cases'):this.go(S.back0||'home'),

// render-vals.js line 345
      sRef:this.sRef,sq:S.sq,onSq:e=>this.setState({sq:e.target.value}),onSqKey:e=>{if(e.key==='Enter'&&S.sq.trim())pickQ(S.sq.trim());},clearSq:()=>this.setState({sq:''}),

// render-vals.js line 346
      sEmpty:!toks.length&&!sFil,sHas:toks.length>0||sFil,recentL:S.recent.map(l=>({l,pick:()=>pickQ(l)})),

// render-vals.js line 347
      trySugg:[['overdue','ph-alarm'],['sewage','ph-drop'],['Roads Team','ph-users-three'],['Sanitation','ph-buildings'],['CP-CHN-24781','ph-hash']].map(([l,icon])=>({l,icon,pick:()=>pickQ(l)})),

// render-vals.js line 348
      sCount:`${sRes.length} case${sRes.length===1?'':'s'}${sA.length?` · ${sA.length} areas & departments`:''}`,sAreasHas:sA.length>0,sAreas:sA,sCasesHas:sRes.length>0,sRows:sRes.map(R),sNone:(toks.length>0||sFil)&&!sRes.length&&!sA.length,