// render-vals.js line 70
      isHome:mob&&scr==='home',isSearch:mob&&scr==='search',isDetail:mob&&scr==='detail',isReport:scr==='report',isAi:scr==='ai',isSimilar:scr==='similar',isValidate:scr==='validate',isCase:scr==='case',isTimeline:mob&&scr==='timeline',isVerify:scr==='verify',isCases:mob&&scr==='cases',isProfile:mob&&scr==='profile',

// render-vals.js line 103
      sceneStreet:CP.SCENES[S.scene].street,meName:CP.ME.name,meArea:CP.ME.area,mePhone:CP.ME.phone,

// render-vals.js line 148
      meVerified:me.verified,meUnverified:!me.verified,openId:()=>this.setState({idOpen:true,idStep:0,otp:0,afterId:null}),

// render-vals.js line 184
    const meName=me.name||CP.ME.name,meArea=me.area||CP.ME.area,meI=meName.split(' ').filter(Boolean).map(s=>s[0]).join('').slice(0,2).toUpperCase();

// render-vals.js line 200
        comment:(e)=>{e&&e.stopPropagation&&e.stopPropagation();if(mob)this.setState({commentsFor:i.id,cDraft:''});else this.open(i.id);},

// render-vals.js line 230
    const sendC=()=>{const t=S.cDraft.trim();if(!t||!cI)return;CP.act('comment',cI.id,t,me.anonDefault);this.buzz([6,20,6]);this.setState({cDraft:''});};

// render-vals.js line 262
        comment:e=>{e&&e.stopPropagation&&e.stopPropagation();this.buzz(6);if(mob)this.setState({commentsFor:i.id,cDraft:''});else this.setState({commentsFor:S.commentsFor===i.id?null:i.id,cModal:false,cDraft:''});}})),

// render-vals.js line 263
      stop:e=>e.stopPropagation(),

// render-vals.js line 280
      drawerRows:[['ph-camera','My reports','Posts you created',myReports.length,'reports'],['ph-arrow-fat-up','Supported','Reports you back',supported.length,'supported'],['ph-bank','My cases','In the government workflow',myCases.length,'cases'],['ph-clock-counter-clockwise','Activity','Comments, support, updates','','activity'],['ph-gear-six','Settings & theme','Profile, privacy, appearance','','settings']].map(([icon,l,sub,n,k],j)=>({icon,l,sub,n:n===''?'':String(n),d:(j*0.04)+'s',go:()=>{this.buzz(6);this.setState({pDrawer:false});if(k==='settings')this.go('settings',{pName:meName,pArea:meArea});else this.go('profile',{profTab:k});}})),

// render-vals.js line 281
      pTabs:[tabT('reports','ph-camera','Reports',myReports.length),tabT('supported','ph-arrow-fat-up','Backed',supported.length),tabT('cases','ph-bank','Cases',myCases.length),{...tabT('activity','ph-clock-counter-clockwise','Activity',acts.length),n:''}],

// render-vals.js line 282
      pShowRows:['reports','supported'].includes(S.profTab),pShowCases:S.profTab==='cases',pShowAct:S.profTab==='activity',

// render-vals.js line 283
      pActs:acts.slice(0,20).map(a=>({...a,ago:CP.ago(a.ts),open:()=>this.open(a.id)})),

// render-vals.js line 284
      pEmpty:S.profTab==='activity'?!acts.length:!pSrc.length,

// render-vals.js line 309
      cViews:[['list','List','ph-rows'],['grid','Grid','ph-squares-four']].map(([k,l,icon])=>{const on=(S.cView||'list')===k;return {l,icon,bg:on?'var(--cp-surface)':'transparent',fg:on?'var(--cp-ink)':'var(--cp-ink-2)',sh:on?'0 2px 6px -2px rgb(0 0 0 / .2)':'none',pick:()=>{this.buzz(5);this.setState({cView:k});}};}),cvList:(S.cView||'list')==='list',cvGrid:S.cView==='grid',gridCols:mob?'minmax(0,1fr)':'repeat(auto-fill,minmax(360px,1fr))',

// render-vals.js line 310
      pTabs:X5.pTabs.slice(0,2),pShowCases:false,pShowAct:false,pShowRows:true,pEmpty:!(S.profTab==='supported'?supported:myReports).length,

// render-vals.js line 311
      pRows:(S.profTab==='supported'?supported:myReports).map(post),pStats:[{v:myReports.length,l:'Reports'},{v:supported.length,l:'Supported'},{v:D.issues.filter(i=>(i.mine||my.support[i.id])&&['resolved','closed'].includes(i.stage)).length,l:'Fixed'}],

// render-vals.js line 332
      pTabs:[['reports','ph-squares-four','Reports',myReports.length],['activity','ph-lightning','Activity',actFeed.length]].map(([k,icon,l,n])=>{const on=(S.profTab==='activity')===(k==='activity');return {l,n:String(n),icon:(on?'ph-fill ':'ph-bold ')+icon,c:on?'var(--cp-ink)':'var(--cp-ink-3)',bar:on?'var(--cp-ink)':'transparent',pick:()=>{this.buzz(5);this.setState({profTab:k});}};}),

// render-vals.js line 333
      pShowTiles:S.profTab!=='activity',pShowFeed:S.profTab==='activity',pTiles:myReports.map(tile),

// render-vals.js line 334
      pFeed:actFeed.map(i=>({...post(i),why:i.caseId?(i.mine?'Your report became official case '+i.caseId:'You follow official case '+i.caseId):'You supported this',cOpen:!mob&&S.commentsFor===i.id&&!S.cModal,cmts:[],cMore:''})),

// render-vals.js line 335
      pEmpty:S.profTab==='activity'?!actFeed.length:!myReports.length,pEmptyTxt:S.profTab==='activity'?'Reports you support and cases you follow show up here.':'You haven\'t reported anything yet.',

// render-vals.js line 380
      pCols:mob?'minmax(0,1fr)':((S.railCollapsed||S.railHidden)&&(S.w||0)>=1100?'repeat(3,minmax(0,1fr))':'repeat(2,minmax(0,1fr))'),pShowMine:S.profTab!=='activity',pShowFeed:S.profTab==='activity',

// render-vals.js line 381
      pMine:mineRep.map(i=>({...post(i),notMine:false,why:i.caseId?'Your report is now official case '+i.caseId:(i.anon?'Posted anonymously':''),cOpen:!mob&&S.commentsFor===i.id&&!S.cModal,cmts:[],cMore:''})),

// render-vals.js line 382
      pFeed:actShown.map(i=>({...post(i),notMine:!i.mine,why:i.caseId?relOf(i)+' · official case '+i.caseId+' · '+((i.merged||[]).length+1)+' reports combined':'You supported this report',cOpen:!mob&&S.commentsFor===i.id&&!S.cModal,cmts:[],cMore:''})),

// render-vals.js line 478
      meName,meArea,meI,meFirst:meName.split(' ')[0],meVerified:!!me.verified,mePhone:CP.ME.phone,verifiedLine:'Aadhaar e-KYC (mock) · verified '+new Date(me.verifiedAt||now).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}),

// render-vals.js line 479
      goProfile:()=>this.go('profile'),goSettings:()=>this.go('settings',{pName:meName,pArea:meArea}),profBack:()=>this.goBack(),

// render-vals.js line 498
      feedPosts:feed.map(post),feedEmpty:!feed.length,postR:mob?'0':'22px',postB:mob?'none':'2px solid var(--cp-edge)',postSh:mob?'none':'0 4px 0 var(--cp-edge)',postGap:mob?'8px':'16px',

// render-vals.js line 505
      gridCols:mob?'minmax(0,1fr)':'repeat(auto-fill,minmax(320px,1fr))',

// render-vals.js line 506
      pStats:[{v:myReports.length,l:'Reports'},{v:supported.length,l:'Supported'},{v:myCases.length,l:'Cases'},{v:D.issues.filter(i=>(i.mine||my.support[i.id])&&['resolved','closed'].includes(i.stage)).length,l:'Fixed'}],

// render-vals.js line 508
      pRows:S.profTab!=='cases'?pSrc.map(post):[],pCases:S.profTab==='cases'?pSrc.map(post):[],pShowRows:S.profTab!=='cases',pShowCases:S.profTab==='cases',pEmpty:!pSrc.length,

// render-vals.js line 509
      pEmptyTxt:{reports:'You haven\'t reported anything yet.',supported:'Reports you support show up here.',cases:'No official cases yet.'}[S.profTab],

// render-vals.js line 526
      cDraft:S.cDraft,onCDraft:e=>this.setState({cDraft:e.target.value}),onCKey:e=>{if(e.key==='Enter'){e.preventDefault();sendC();}},sendC,cSendO:S.cDraft.trim()?1:.45,