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

// render-vals.js line 161
    if(mob)return {showStage:(true)||(!mob&&!!S.locOpen),stL:'0',stT:'0',stW:'100%',stH:'100%',stTf:'none',stR:'0',stShadow:'none',closeFlow:()=>this.go('home')};

// render-vals.js line 166
      closeFlow:()=>{this.clearT();this.setState({threshold:false,idOpen:false});this.go(S.base||'home');},

// render-vals.js line 276
      closeFlow:()=>{this.clearT();this.setState({threshold:false,idOpen:false,editFor:null,filterOpen:false,commentsFor:null,cModal:false});if(FLOW.includes(scr))this.go(S.base||'home');},

// render-vals.js line 372
      regionPill:{l:S.fArea||(f.region==='near'?'Velachery':f.region),open:()=>{this.buzz(6);this.setState({locOpen:true});}},isAiM:mob&&S.screen==='ai',isAiD:!mob&&S.screen==='ai',isSimM:mob&&S.screen==='similar',isSimD:!mob&&S.screen==='similar',thM:mob&&!!S.threshold,thD:!mob&&!!S.threshold,hasMSel:mob&&!!S.sheetHidden&&!!S.mSelId&&!!CP.find(S.mSelId),msel:S.mSelId&&CP.find(S.mSelId)?{...this.card(CP.find(S.mSelId),D),n:CP.find(S.mSelId).sup}:{},closeMSel:e=>{e&&e.stopPropagation&&e.stopPropagation();this.setState({mSelId:null});},regionName:S.fArea||(f.region==='near'?'Velachery':f.region),

// render-vals.js line 514
      retake:()=>this.setState({captured:false,voice:'idle',shots:0}),addShot:()=>{this.buzz(12);this.setState(s=>({flash:true,shots:Math.min(10,(s.shots||1)+1)}));this.later(()=>this.setState({flash:false}),250);},shotList:Array.from({length:S.captured?Math.max(1,S.shots||1):0},(_,k)=>({n:k+1,icon:CP.CATS[CP.SCENES[S.scene].cat].icon,rm:e=>{e&&e.stopPropagation&&e.stopPropagation();this.buzz(8);const n=Math.max(1,S.shots||1)-1;this.setState(n?{shots:n}:{captured:false,shots:0,voice:'idle'});}})),shotN:Math.max(1,S.shots||1),canAddShot:(S.shots||1)<10,

// render-vals.js line 521
      aiRows:o.aiRows.map((r,k)=>k===1?descRow:r),

// render-vals.js line 536
    if(S.w>=720&&__o.showStage){const onlyF=S.filterOpen&&!S.editFor&&!S.threshold&&!S.idOpen&&S.rpIdx==null&&!(S.cModal&&S.commentsFor)&&!FLOW.includes(S.screen);const W0='min(460px, calc(100vw - 24px))';if(!onlyF)Object.assign(__o,{isAiM:__o.isAiM||__o.isAiD,isAiD:false,isSimM:__o.isSimM||__o.isSimD,isSimD:false,thM:__o.thM||__o.thD,thD:false,cPadX:'16px',camH:S.captured?'30%':__o.camH});