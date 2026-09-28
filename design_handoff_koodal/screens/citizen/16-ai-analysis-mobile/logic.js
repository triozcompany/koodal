// render-vals.js line 45
    const an=S.an||CP.analyze(S.scene);

// render-vals.js line 67
      resetDemo:()=>{CP.act('reset');this.setState({f:{region:'near',cat:[],stage:[],sev:[]},q:'',an:null,mountTs:Date.now()});this.go('home',{cur:SHOW});this.toast('Demo reset');},

// render-vals.js line 69
        go:()=>{if(k==='ai'||k==='similar'){this.setState({scene:'sewage',an:CP.analyze('sewage'),anon:false});this.go(k,k==='ai'?{}:{});}else if(['detail','case','timeline','verify'].includes(k))this.go(k,{cur:SHOW});else this.go(k);}};}),

// render-vals.js line 111
      an,aiTitle:S.aiStep>=6?'Got it.':'Understanding…',aiScanning:S.aiStep<2,aiBox:S.aiStep>=1,aiRows:aiAll.slice(0,Math.min(5,S.aiStep)).map(r=>({...r,sub:r.sub||''})),aiThinking:S.aiStep<6,aiDone:S.aiStep>=6,

// render-vals.js line 112
      aiBtnLabel:an.strong?'1 match nearby · See it':an.matches.length?'Similar nearby · Compare':'Post as new issue',aiBtnIcon:an.matches.length?'ph-intersect':'ph-paper-plane-tilt',

// render-vals.js line 113
      aiBtnBg:an.matches.length?'var(--cp-marigold)':'var(--cp-pulse)',aiBtnFg:an.matches.length?'var(--cp-on-marigold)':'#fff',aiNext:()=>an.matches.length?this.go('similar'):this.postNew(),

// render-vals.js line 372
      regionPill:{l:S.fArea||(f.region==='near'?'Velachery':f.region),open:()=>{this.buzz(6);this.setState({locOpen:true});}},isAiM:mob&&S.screen==='ai',isAiD:!mob&&S.screen==='ai',isSimM:mob&&S.screen==='similar',isSimD:!mob&&S.screen==='similar',thM:mob&&!!S.threshold,thD:!mob&&!!S.threshold,hasMSel:mob&&!!S.sheetHidden&&!!S.mSelId&&!!CP.find(S.mSelId),msel:S.mSelId&&CP.find(S.mSelId)?{...this.card(CP.find(S.mSelId),D),n:CP.find(S.mSelId).sup}:{},closeMSel:e=>{e&&e.stopPropagation&&e.stopPropagation();this.setState({mSelId:null});},regionName:S.fArea||(f.region==='near'?'Velachery':f.region),

// render-vals.js line 521
      aiRows:o.aiRows.map((r,k)=>k===1?descRow:r),

// render-vals.js line 536
    if(S.w>=720&&__o.showStage){const onlyF=S.filterOpen&&!S.editFor&&!S.threshold&&!S.idOpen&&S.rpIdx==null&&!(S.cModal&&S.commentsFor)&&!FLOW.includes(S.screen);const W0='min(460px, calc(100vw - 24px))';if(!onlyF)Object.assign(__o,{isAiM:__o.isAiM||__o.isAiD,isAiD:false,isSimM:__o.isSimM||__o.isSimD,isSimD:false,thM:__o.thM||__o.thD,thD:false,cPadX:'16px',camH:S.captured?'30%':__o.camH});