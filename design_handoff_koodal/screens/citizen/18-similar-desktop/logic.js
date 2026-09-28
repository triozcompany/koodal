// render-vals.js line 28
      mergedN:d.merged.length||'',merged:d.merged.map(m=>({i:m.by==='Anonymous'?'AN':m.by.split(' ').map(s=>s[0]).join(''),by:m.me?(m.by==='Anonymous'?'You · anonymous':'You'):m.by,ago:m.h?m.h+'h ago':'just now',text:m.text,sim:m.sim})),

// render-vals.js line 50
    const m=an.strong||an.matches[0]||{title:'',by:'',h:0,score:0,dist:0,sup:0,id:null};const mIssue=m.id?CP.find(m.id):null;

// render-vals.js line 115
      m,simTitle:an.strong?'Already on the map.':'Same issue?',joining:S.joining,simOthers:mIssue&&mIssue.merged.length?mIssue.merged.length:'',

// render-vals.js line 116
      mineTag:S.anon?'Anonymous · now':'You · now',badgeBg:an.strong?'var(--cp-marigold)':'var(--cp-surface-2)',

// render-vals.js line 118
      simPLabel:an.strong?(S.joining?`Joined · ${m.sup+1} neighbours`:`Join ${m.sup} neighbours`):'Post as new issue',simPIcon:an.strong?'ph-arrow-fat-up':'ph-paper-plane-tilt',

// render-vals.js line 119
      simSLabel:an.strong?'Mine is different':'Join this one instead',

// render-vals.js line 120
      simPrimary:()=>an.strong?this.join(m.id):this.postNew(),simSecondary:()=>an.strong?this.postNew():this.join(m.id),goAiBack:()=>this.go('report'),

// render-vals.js line 161
    if(mob)return {showStage:(true)||(!mob&&!!S.locOpen),stL:'0',stT:'0',stW:'100%',stH:'100%',stTf:'none',stR:'0',stShadow:'none',closeFlow:()=>this.go('home')};

// render-vals.js line 166
      closeFlow:()=>{this.clearT();this.setState({threshold:false,idOpen:false});this.go(S.base||'home');},

// render-vals.js line 276
      closeFlow:()=>{this.clearT();this.setState({threshold:false,idOpen:false,editFor:null,filterOpen:false,commentsFor:null,cModal:false});if(FLOW.includes(scr))this.go(S.base||'home');},

// render-vals.js line 372
      regionPill:{l:S.fArea||(f.region==='near'?'Velachery':f.region),open:()=>{this.buzz(6);this.setState({locOpen:true});}},isAiM:mob&&S.screen==='ai',isAiD:!mob&&S.screen==='ai',isSimM:mob&&S.screen==='similar',isSimD:!mob&&S.screen==='similar',thM:mob&&!!S.threshold,thD:!mob&&!!S.threshold,hasMSel:mob&&!!S.sheetHidden&&!!S.mSelId&&!!CP.find(S.mSelId),msel:S.mSelId&&CP.find(S.mSelId)?{...this.card(CP.find(S.mSelId),D),n:CP.find(S.mSelId).sup}:{},closeMSel:e=>{e&&e.stopPropagation&&e.stopPropagation();this.setState({mSelId:null});},regionName:S.fArea||(f.region==='near'?'Velachery':f.region),

// render-vals.js line 447
      simSLabel:an.strong?'Different':'Same issue'

// render-vals.js line 536
    if(S.w>=720&&__o.showStage){const onlyF=S.filterOpen&&!S.editFor&&!S.threshold&&!S.idOpen&&S.rpIdx==null&&!(S.cModal&&S.commentsFor)&&!FLOW.includes(S.screen);const W0='min(460px, calc(100vw - 24px))';if(!onlyF)Object.assign(__o,{isAiM:__o.isAiM||__o.isAiD,isAiD:false,isSimM:__o.isSimM||__o.isSimD,isSimD:false,thM:__o.thM||__o.thD,thD:false,cPadX:'16px',camH:S.captured?'30%':__o.camH});