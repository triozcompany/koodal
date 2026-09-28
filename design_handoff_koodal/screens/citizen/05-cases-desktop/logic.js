// render-vals.js line 167
      deskHome:view==='home',deskDetail:view==='detail',deskCases:view==='cases',deskProfile:view==='profile',

// render-vals.js line 267
      mFilterOpen:!!S.filterOpen,openFilters:()=>this.setState({filterOpen:true,sheetGroup:null,fCtx:'search'}),openCaseFilters:()=>this.setState({filterOpen:true,sheetGroup:null,fCtx:'cases'}),

// render-vals.js line 272
      fN:act.length?String(act.length):'',activeF:act,resN:ctx==='cases'?cSrc.length:sRes.length,fBtnL:ctx==='cases'||qt?'Show '+(ctx==='cases'?cSrc.length:sRes.length)+' results':'Apply filters',

// render-vals.js line 273
      sortL:lab(S.sSort||'relevant',SO.search),cycleSort:cyc(SO.search,S.sSort||'relevant','sSort'),cSortL:lab(S.cSort||'recent',SO.cases),cycleCSort:cyc(SO.cases,S.cSort||'recent','cSort'),

// render-vals.js line 305
      caseRows:cSrc.filter(i=>!S.cStage||i.stage===S.cStage).map(i=>{const p=post(i),ix=stIdx(i.stage),col=CST[ix][2];return {photoN:CP.stats(i).photos,...p,area:i.area+', '+i.city,oi:(i.assignee||'—').replace(/^(JE|AE) /,'').split(' ').map(s=>s[0]).join('').slice(0,2),stBg:col,stFg:ix===1?'var(--cp-on-marigold)':'#fff',

// render-vals.js line 307
      casesEmpty:!cSrc.filter(i=>!S.cStage||i.stage===S.cStage).length,cShownN:String(cSrc.filter(i=>!S.cStage||i.stage===S.cStage).length),cQ:S.cQ||'',onCQ:e=>this.setState({cQ:e.target.value}),clearCQ:()=>this.setState({cQ:''}),

// render-vals.js line 308
      cTabs:[['following','Following',followed.length],['all','All in '+(f.region==='near'?'Chennai':f.region),allCases.length]].map(([k,l,n])=>{const on=(S.casesTab==='all'?'all':'following')===k;return {l,n:String(n),bg:on?'var(--cp-surface)':'transparent',fg:on?'var(--cp-ink)':'var(--cp-ink-2)',sh:on?'0 2px 6px -2px rgb(0 0 0 / .2)':'none',pick:()=>{this.buzz(5);this.setState({casesTab:k});}};}),

// render-vals.js line 309
      cViews:[['list','List','ph-rows'],['grid','Grid','ph-squares-four']].map(([k,l,icon])=>{const on=(S.cView||'list')===k;return {l,icon,bg:on?'var(--cp-surface)':'transparent',fg:on?'var(--cp-ink)':'var(--cp-ink-2)',sh:on?'0 2px 6px -2px rgb(0 0 0 / .2)':'none',pick:()=>{this.buzz(5);this.setState({cView:k});}};}),cvList:(S.cView||'list')==='list',cvGrid:S.cView==='grid',gridCols:mob?'minmax(0,1fr)':'repeat(auto-fill,minmax(360px,1fr))',

// render-vals.js line 341
      activeF:actX,fN:actX.length?String(actX.length):'',resN:ctx==='cases'?caseBase.length:sAll.length,fBtnL:ctx==='cases'||showRes?'Show '+(ctx==='cases'?caseBase.length:sAll.length)+' results':'Apply filters',

// render-vals.js line 344
      caseRows:caseList.map(caseCard),casesEmpty:!caseList.length,casesEmptyTxt:'No cases match these filters.',

// render-vals.js line 399
      caseRows:allCasesL.map(caseCard),casesEmpty:!allCasesL.length,

// render-vals.js line 503
      cTabs:seg([['following','Following',followed.length],['all','All cases',allCases.length]],S.casesTab==='all'?'all':'following','casesTab'),

// render-vals.js line 504
      caseRows:cSrc.map(post),casesEmpty:!cSrc.length,casesEmptyTxt:S.casesTab==='all'?'No official cases in this region yet.':'Support a report — when it becomes an official case, you\'ll follow it here.',

// render-vals.js line 505
      gridCols:mob?'minmax(0,1fr)':'repeat(auto-fill,minmax(320px,1fr))',