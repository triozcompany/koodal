// render-vals.js line 18
    const d=d0,dst=CP.step(d.stage),[dpc,dpfg,dpl]=PILL[d.stage];const supported=!!my.support[d.id];

// render-vals.js line 91
      d:dv,threshold:S.threshold,thDeg:(S.thP/100*360)+'deg',thNum:Math.round(S.thP),sparks:SPARKS,closeThreshold:()=>{this.setState({threshold:false});this.go('case');},

// render-vals.js line 129
      vSummary:S.vres.map((r,i)=>{const it=CP.find(r.id);return {icon:CP.CATS[it.cat].icon,title:it.title,d:(i*0.08)+'s',open:()=>this.open(r.id),

// render-vals.js line 372
      regionPill:{l:S.fArea||(f.region==='near'?'Velachery':f.region),open:()=>{this.buzz(6);this.setState({locOpen:true});}},isAiM:mob&&S.screen==='ai',isAiD:!mob&&S.screen==='ai',isSimM:mob&&S.screen==='similar',isSimD:!mob&&S.screen==='similar',thM:mob&&!!S.threshold,thD:!mob&&!!S.threshold,hasMSel:mob&&!!S.sheetHidden&&!!S.mSelId&&!!CP.find(S.mSelId),msel:S.mSelId&&CP.find(S.mSelId)?{...this.card(CP.find(S.mSelId),D),n:CP.find(S.mSelId).sup}:{},closeMSel:e=>{e&&e.stopPropagation&&e.stopPropagation();this.setState({mSelId:null});},regionName:S.fArea||(f.region==='near'?'Velachery':f.region),

// render-vals.js line 536
    if(S.w>=720&&__o.showStage){const onlyF=S.filterOpen&&!S.editFor&&!S.threshold&&!S.idOpen&&S.rpIdx==null&&!(S.cModal&&S.commentsFor)&&!FLOW.includes(S.screen);const W0='min(460px, calc(100vw - 24px))';if(!onlyF)Object.assign(__o,{isAiM:__o.isAiM||__o.isAiD,isAiD:false,isSimM:__o.isSimM||__o.isSimD,isSimD:false,thM:__o.thM||__o.thD,thD:false,cPadX:'16px',camH:S.captured?'30%':__o.camH});