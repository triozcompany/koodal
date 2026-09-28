// render-vals.js line 67
      resetDemo:()=>{CP.act('reset');this.setState({f:{region:'near',cat:[],stage:[],sev:[]},q:'',an:null,mountTs:Date.now()});this.go('home',{cur:SHOW});this.toast('Demo reset');},

// render-vals.js line 72
      goHome:()=>this.go('home'),goSearch:()=>this.go('search'),goReport:()=>this.go('report'),goCase:()=>this.go('case'),goTimeline:()=>this.go('timeline'),goVerify:()=>this.go('verify'),goDetail:()=>{const hs=this.state.hist||[];const t=hs[hs.length-1];if(t&&t.s==='detail')this.goBack();else this.go('detail');},goCases:()=>this.go('cases'),

// render-vals.js line 88
      qRef:this.qRef,q:S.q,onQ:(e)=>this.setState({q:e.target.value}),clearQ:()=>this.setState({q:''}),qEmpty:!qt,qCount:qMatch.length,qNone:!!qt&&!qMatch.length,

// render-vals.js line 89
      qResults:qMatch.slice(0,40).map(i=>this.card(i,D)),qSuggest:['Velachery','sewage','pothole','Coimbatore','streetlight','Madurai','CP-2107'].map(l=>({l,pick:()=>this.setState({q:l})})),

// render-vals.js line 171
      dqRef:this.dqRef,dTitle:S.f.region==='near'?'Nearby':S.f.region,dCount:src.length+' issues',

// render-vals.js line 210
    const topTags=Object.entries(tc).sort((a,b)=>b[1]-a[1]).slice(0,10).map(([t,n])=>({t,n,pick:()=>{this.setState({q:t});if(!(scr==='search'||view==='search'))this.go('search');}}));

// render-vals.js line 244
      onQ:e=>this.setState({[k+'Q']:e.target.value,[k+'Open']:true}),openIt:()=>this.setState({[k+'Open']:true}),toggle:()=>this.setState({[k+'Open']:!open}),clear:e=>{e&&e.stopPropagation&&e.stopPropagation();this.setState({[k]:null,[k+'Q']:''});},

// render-vals.js line 267
      mFilterOpen:!!S.filterOpen,openFilters:()=>this.setState({filterOpen:true,sheetGroup:null,fCtx:'search'}),openCaseFilters:()=>this.setState({filterOpen:true,sheetGroup:null,fCtx:'cases'}),

// render-vals.js line 272
      fN:act.length?String(act.length):'',activeF:act,resN:ctx==='cases'?cSrc.length:sRes.length,fBtnL:ctx==='cases'||qt?'Show '+(ctx==='cases'?cSrc.length:sRes.length)+' results':'Apply filters',

// render-vals.js line 273
      sortL:lab(S.sSort||'relevant',SO.search),cycleSort:cyc(SO.search,S.sSort||'relevant','sSort'),cSortL:lab(S.cSort||'recent',SO.cases),cycleCSort:cyc(SO.cases,S.cSort||'recent','cSort'),

// render-vals.js line 291
      onQ:e=>this.setState({fRegionQ:e.target.value,fRegionOpen:true}),openIt:()=>this.setState({fRegionOpen:true}),toggle:()=>this.setState({fRegionOpen:!rOpen}),clear:e=>{e&&e.stopPropagation&&e.stopPropagation();this.setState(s=>({f:{...s.f,region:'near'},fRegionQ:''}));},

// render-vals.js line 309
      cViews:[['list','List','ph-rows'],['grid','Grid','ph-squares-four']].map(([k,l,icon])=>{const on=(S.cView||'list')===k;return {l,icon,bg:on?'var(--cp-surface)':'transparent',fg:on?'var(--cp-ink)':'var(--cp-ink-2)',sh:on?'0 2px 6px -2px rgb(0 0 0 / .2)':'none',pick:()=>{this.buzz(5);this.setState({cView:k});}};}),cvList:(S.cView||'list')==='list',cvGrid:S.cView==='grid',gridCols:mob?'minmax(0,1fr)':'repeat(auto-fill,minmax(360px,1fr))',

// render-vals.js line 319
    const showRes=toks.length>0||!!S.fTag;

// render-vals.js line 331
      tileCols:mob?'repeat(2,minmax(0,1fr))':'repeat(auto-fill,minmax(220px,1fr))',

// render-vals.js line 338
      showIdle:!showRes,showRes,qCount:sAll.length,qNone:showRes&&!sAll.length,sCases:sC.map(caseCard),sReports:sR.map(tile),hasSC:!!sC.length,hasSR:!!sR.length,sCN:String(sC.length),sRN:String(sR.length),

// render-vals.js line 339
      latestNear:D.issues.filter(i=>i.city==='Chennai'&&i.km<3&&i.stage!=='rejected').sort((a,b)=>lastAct(b)-lastAct(a)).slice(0,mob?4:8).map(tile),

// render-vals.js line 340
      topTags:topTags.map(x=>({...x,pick:()=>{this.buzz(5);this.setState({fTag:S.fTag===x.t?null:x.t});if(!(scr==='search'||view==='search'))this.go('search');}})),

// render-vals.js line 341
      activeF:actX,fN:actX.length?String(actX.length):'',resN:ctx==='cases'?caseBase.length:sAll.length,fBtnL:ctx==='cases'||showRes?'Show '+(ctx==='cases'?caseBase.length:sAll.length)+' results':'Apply filters',

// render-vals.js line 393
      sortOpen:!!S.sortOpen,toggleSort:()=>{this.buzz(5);this.setState({sortOpen:!S.sortOpen});},closeSort:()=>this.setState({sortOpen:false}),sortRot:S.sortOpen?'rotate(180deg)':'none',sddL:mob?'16px':'0',

// render-vals.js line 394
      sortOpts:SO.search.map(([k,l])=>{const on=(S.sSort||'relevant')===k;return {l,icon:SOI[k]||'ph-sort-ascending',on,bg:on?'var(--cp-surface-2)':'transparent',pick:()=>{this.buzz(5);this.setState({sSort:k,sortOpen:false});}};}),

// render-vals.js line 480
      goReport:()=>this.go('report',{desc:'',tags:[],tagDraft:'',descMode:'text',voice:'idle',an:null}),

// render-vals.js line 485
      deskFeed:!mob&&view==='feed',deskSearch:!mob&&view==='search',deskSettings:!mob&&view==='settings',

// render-vals.js line 499
      feedCols:W>=1100?'minmax(0,1fr) 300px':'minmax(0,1fr)',feedSide:W>=1100,trending,topTags,

// render-vals.js line 500
      sResults:sRes.map(i=>this.card(i,D)),qCount:sRes.length,qNone:!!qt&&!sRes.length,sPad:mob?'8px 16px':'4px 0',

// render-vals.js line 501
      latestNear:D.issues.filter(i=>i.city==='Chennai'&&i.km<3&&i.stage!=='rejected').sort(byAct).slice(0,5).map(i=>this.card(i,D)),

// render-vals.js line 505
      gridCols:mob?'minmax(0,1fr)':'repeat(auto-fill,minmax(320px,1fr))',