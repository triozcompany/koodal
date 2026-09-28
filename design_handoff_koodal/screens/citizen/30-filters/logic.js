// render-vals.js line 3
    const mob=S.w<720,wide=S.w>=1100;const common={theme,toast:S.toast,ready:S.ready,isMobile:mob,isDesk:!mob,railW:wide?'232px':'76px',railLabels:wide,

// render-vals.js line 79
      filterOpen:S.filterOpen,openFilter:()=>this.setState({filterOpen:true}),closeFilter:()=>this.setState({filterOpen:false}),clearFilters:()=>this.setState({f:{region:'near',cat:[],stage:[],sev:[]}}),

// render-vals.js line 267
      mFilterOpen:!!S.filterOpen,openFilters:()=>this.setState({filterOpen:true,sheetGroup:null,fCtx:'search'}),openCaseFilters:()=>this.setState({filterOpen:true,sheetGroup:null,fCtx:'cases'}),

// render-vals.js line 268
      closeFilter:()=>this.setState({filterOpen:false,fAreaOpen:false,fDeptOpen:false}),

// render-vals.js line 269
      clearFilters:()=>{this.buzz(8);this.setState({f:{region:'near',cat:[],stage:[],sev:[]},fArea:null,fDept:null,fAreaQ:'',fDeptQ:''});},

// render-vals.js line 270
      sheetGroups:o.fGroups,combos:[cb('fArea',uniqN('area'),'AREA'),cb('fDept',uniqN('dept'),'DEPARTMENT')],

// render-vals.js line 272
      fN:act.length?String(act.length):'',activeF:act,resN:ctx==='cases'?cSrc.length:sRes.length,fBtnL:ctx==='cases'||qt?'Show '+(ctx==='cases'?cSrc.length:sRes.length)+' results':'Apply filters',

// render-vals.js line 296
    const X6={combos:[regionCb,...X5.combos.map((c,k)=>({...c,stopClose:closeOthers(k?'fDept':'fArea')}))],sheetGroups:o.fGroups.filter(g=>g.title!=='REGION'),

// render-vals.js line 297
      closeCombos:()=>{if(S.fRegionOpen||S.fAreaOpen||S.fDeptOpen)this.setState({fRegionOpen:false,fAreaOpen:false,fDeptOpen:false});},

// render-vals.js line 298
      closeFilter:()=>this.setState({filterOpen:false,fAreaOpen:false,fDeptOpen:false,fRegionOpen:false}),

// render-vals.js line 341
      activeF:actX,fN:actX.length?String(actX.length):'',resN:ctx==='cases'?caseBase.length:sAll.length,fBtnL:ctx==='cases'||showRes?'Show '+(ctx==='cases'?caseBase.length:sAll.length)+' results':'Apply filters',

// render-vals.js line 342
      sheetGroups:ctx==='cases'?[scopeG,...X6.sheetGroups]:X6.sheetGroups,

// render-vals.js line 343
      clearFilters:()=>{this.buzz(8);this.setState({f:{region:'near',cat:[],stage:[],sev:[]},fArea:null,fDept:null,fAreaQ:'',fDeptQ:'',fTag:null,cScope:'all'});},

// render-vals.js line 395
      combos:[{label:'SORT BY',sel:'',ph:(SO[ctx].find(x=>x[0]===sk)||SO[ctx][0])[1],q:'',open:!!S.fSortOpen,none:false,bd:S.fSortOpen?'var(--cp-ink-3)':'var(--cp-line)',rot:S.fSortOpen?'rotate(180deg)':'none',

// render-vals.js line 398
      closeCombos:()=>{if(S.fRegionOpen||S.fAreaOpen||S.fDeptOpen||S.fSortOpen)this.setState({fRegionOpen:false,fAreaOpen:false,fDeptOpen:false,fSortOpen:false});},

// render-vals.js line 489
      shTop:mob?'auto':'0',shMax:mob?'88%':'100%',shR:mob?'26px 26px 0 0':'0',

// render-vals.js line 493
      fpanel:!mob&&S.filterOpen,mFilterOpen:mob&&S.filterOpen,resN,