// render-vals.js line 10
    const list=D.issues.filter(i=>i.stage!=='rejected'&&inRegion(i)&&(!f.cat.length||f.cat.includes(i.cat))&&(!f.sev.length||f.sev.includes(i.sev))&&(!f.stage.length||f.stage.some(k=>STG[k].includes(i.stage))));

// render-vals.js line 70
      isHome:mob&&scr==='home',isSearch:mob&&scr==='search',isDetail:mob&&scr==='detail',isReport:scr==='report',isAi:scr==='ai',isSimilar:scr==='similar',isValidate:scr==='validate',isCase:scr==='case',isTimeline:mob&&scr==='timeline',isVerify:scr==='verify',isCases:mob&&scr==='cases',isProfile:mob&&scr==='profile',

// render-vals.js line 76
      list:cards,listCount:list.length,listEmpty:!list.length,regionTitle:f.region==='near'?'Nearby':f.region,fCount:fCount||'',

// render-vals.js line 77
      chips:[['all','All','ph-squares-four'],...Object.entries(CP.CATS).map(([k,c])=>[k,c.l,c.icon])].map(([k,label,icon])=>{const on=k==='all'?!f.cat.length:(f.cat.length===1&&f.cat[0]===k);return {label,icon,bg:on?'var(--cp-ink)':'var(--cp-surface)',fg:on?'var(--cp-bg)':'var(--cp-ink)',bd:on?'var(--cp-ink)':'var(--cp-line)',pick:()=>{this.buzz(5);this.setState(s=>({f:{...s.f,cat:k==='all'?[]:[k]}}));}};}),

// render-vals.js line 78
      sheetTopPx:(S.sheetTop??Math.round(S.h*0.3))+'px',mapH:'100%',noop:()=>{},sheetTrans:S.sheetDrag?'none':'top .45s cubic-bezier(.2,.9,.3,1.15)',sheetDown:this.sheetDown,

// render-vals.js line 79
      filterOpen:S.filterOpen,openFilter:()=>this.setState({filterOpen:true}),closeFilter:()=>this.setState({filterOpen:false}),clearFilters:()=>this.setState({f:{region:'near',cat:[],stage:[],sev:[]}}),

// render-vals.js line 81
        {title:'REGION',nice:'Where',chips:true,opts:[['near','Near me'],['Chennai','Chennai'],['Coimbatore','Coimbatore'],['Madurai','Madurai']].map(([k,l])=>chipOpt(f.region===k,l,()=>this.setState(s=>({f:{...s.f,region:k}}))))},

// render-vals.js line 82
        {title:'CATEGORY',nice:'Problem type',chips:false,tiles:true,opts:Object.entries(CP.CATS).map(([k,c])=>({...chipOpt(f.cat.includes(k),c.l,()=>toggleIn('cat',k)),icon:c.icon,tb:f.cat.includes(k)?'2px solid var(--cp-ink)':'1px solid var(--cp-line)',tbg:f.cat.includes(k)?'var(--cp-surface-2)':'var(--cp-surface)'}))},

// render-vals.js line 148
      meVerified:me.verified,meUnverified:!me.verified,openId:()=>this.setState({idOpen:true,idStep:0,otp:0,afterId:null}),

// render-vals.js line 158
    const __d=this.deskVals({S,D,list,qMatch,qt,mob,scr,needConfirm});return {...__o,dfGroups:__o.fGroups.slice(1),...__d,...this.v4Vals({S,D,list,qt,mob,scr,dv,events,an,needConfirm,o:__o,dk:__d})};

// render-vals.js line 175
      dEmpty:!src.length,showMe:S.f.region==='near'&&!qt,mapCity:qt?'TAMIL NADU':S.f.region==='near'?'VELACHERY':S.f.region.toUpperCase(),

// render-vals.js line 184
    const meName=me.name||CP.ME.name,meArea=me.area||CP.ME.area,meI=meName.split(' ').filter(Boolean).map(s=>s[0]).join('').slice(0,2).toUpperCase();

// render-vals.js line 269
      clearFilters:()=>{this.buzz(8);this.setState({f:{region:'near',cat:[],stage:[],sev:[]},fArea:null,fDept:null,fAreaQ:'',fDeptQ:''});},

// render-vals.js line 277
      pDrawer:S.pDrawer,openDrawer:()=>{this.buzz(8);this.setState({pDrawer:!S.pDrawer});},closeDrawer:()=>this.setState({pDrawer:false}),

// render-vals.js line 299
      regionPill:{l:f.region==='near'?'Velachery':f.region,open:()=>{this.buzz(6);this.setState({locOpen:true});}},locOpen:!!S.locOpen,locOpenM:mob&&!!S.locOpen,locOpenD:!mob&&!!S.locOpen,locScrim:mob?'var(--cp-scrim)':'transparent',closeLoc:()=>this.setState({locOpen:false}),

// render-vals.js line 343
      clearFilters:()=>{this.buzz(8);this.setState({f:{region:'near',cat:[],stage:[],sev:[]},fArea:null,fDept:null,fAreaQ:'',fDeptQ:'',fTag:null,cScope:'all'});},

// render-vals.js line 371
      locRows:locF.slice(0,40).map(x=>{const on=curK===x.k;return {l:x.l,sub:x.sub,icon:x.icon,on,bg:on?'var(--cp-surface-2)':'transparent',bd:on?'2px solid var(--cp-ink)':'1px solid var(--cp-line)',ibg:on?'var(--cp-pulse)':'var(--cp-surface-2)',ifg:on?'#fff':'var(--cp-ink)',pick:()=>{this.buzz([6,20,6]);this.setState(s=>({f:{...s.f,region:x.region},fArea:x.area,locOpen:false,locQ:'',panX:0,panY:0}));}};}),

// render-vals.js line 372
      regionPill:{l:S.fArea||(f.region==='near'?'Velachery':f.region),open:()=>{this.buzz(6);this.setState({locOpen:true});}},isAiM:mob&&S.screen==='ai',isAiD:!mob&&S.screen==='ai',isSimM:mob&&S.screen==='similar',isSimD:!mob&&S.screen==='similar',thM:mob&&!!S.threshold,thD:!mob&&!!S.threshold,hasMSel:mob&&!!S.sheetHidden&&!!S.mSelId&&!!CP.find(S.mSelId),msel:S.mSelId&&CP.find(S.mSelId)?{...this.card(CP.find(S.mSelId),D),n:CP.find(S.mSelId).sup}:{},closeMSel:e=>{e&&e.stopPropagation&&e.stopPropagation();this.setState({mSelId:null});},regionName:S.fArea||(f.region==='near'?'Velachery':f.region),

// render-vals.js line 373
      list:listA,listCount:listA.length,listEmpty:!listA.length,

// render-vals.js line 374
      mpins:list.filter(areaOk).map(i=>({x:i.x+'%',y:(i.y*0.62+10)+'%',icon:CP.CATS[i.cat].icon,c:PIN[i.stage][0],fg:PIN[i.stage][1],hot:i.stage==='review'||(i.stage==='community'&&i.conf>=70),n:i.sup,pb:S.mSelId===i.id&&S.sheetHidden?'var(--cp-ink)':'var(--cp-surface)',pf:S.mSelId===i.id&&S.sheetHidden?'var(--cp-bg)':'var(--cp-ink)',sc:S.mSelId===i.id&&S.sheetHidden?1.12:1,s:'36px',is:'17px',z:1,pick:wrapPick(()=>{if(mob&&S.sheetHidden){this.buzz(8);this.setState({mSelId:i.id});}else this.open(i.id);})})),

// render-vals.js line 376
      panX:(S.panX||0)+'px',panY:(S.panY||0)+'px',zoom:S.zoom||1,pinInv:(1/(S.zoom||1)).toFixed(3),mapTr:S.mapDrag?'none':'transform .35s cubic-bezier(.2,.9,.3,1)',mapCur:S.mapDrag?'grabbing':'grab',

// render-vals.js line 377
      mapDown:this.mapDown,mapWheel:this.mapWheel,zoomIn:()=>{this.buzz(5);this.setState({zoom:Math.min(3,(S.zoom||1)*1.3)});},zoomOut:()=>{this.buzz(5);this.setState({zoom:Math.max(.7,(S.zoom||1)/1.3)});},recenter:()=>{this.buzz([6,20,6]);this.setState({zoom:1,panX:0,panY:0});},

// render-vals.js line 458
      sheetScroll:e=>{const t=this.state.sheetTop??Math.round(this.state.h*0.3);if(t>110&&e.currentTarget.scrollTop>6){this.buzz(5);this.setState({sheetTop:96});}},sheetWheel:e=>{const t=this.state.sheetTop??Math.round(this.state.h*0.3);if(t<=110&&e.currentTarget.scrollTop<=0&&e.deltaY<-4)this.setState({sheetTop:Math.round(this.state.h*0.3)});},

// render-vals.js line 463
      sheetHidden:mob&&!!S.sheetHidden,hideSheet:e=>{e&&e.stopPropagation&&e.stopPropagation();this.buzz(6);this.setState({sheetHidden:true});},showSheet:()=>{this.buzz(6);this.setState({sheetHidden:false,sheetTop:null});},

// render-vals.js line 464
      sheetTopPx:S.sheetHidden?(S.h+40)+'px':(S.sheetTop??Math.round(S.h*0.3))+'px',sheetTrans:S.sheetDrag?'none':'top .45s cubic-bezier(.2,.9,.3,1.1)',

// render-vals.js line 465
      listHidden:!mob&&!!S.listHidden,mapFull:mob?!!S.sheetHidden:!!S.listHidden,mapFullIcon:(mob?S.sheetHidden:S.listHidden)?'ph-arrows-in-simple':'ph-arrows-out-simple',mapFullTip:(mob?S.sheetHidden:S.listHidden)?'Exit full screen':'Full screen map',toggleMapFull:()=>{this.buzz([6,20,6]);if(mob)this.setState({sheetHidden:!S.sheetHidden});else{const v=!S.listHidden;this.setState({listHidden:v,railHidden:v});}},toggleList:()=>{this.buzz(6);this.setState({listHidden:!S.listHidden});},listW:S.listHidden?'0px':(W>=1280?'420px':'350px'),

// render-vals.js line 470
      sheetGone:S.w<720&&!!S.sheetHidden&&S.screen==='home',sheetHidden:false,sheetTopPx:S.sheetHidden?(S.h+40)+'px':(S.sheetTop??Math.round(S.h*0.3))+'px',railShown:!(S.screen==='home'&&S.railHidden),railHid:false,

// render-vals.js line 478
      meName,meArea,meI,meFirst:meName.split(' ')[0],meVerified:!!me.verified,mePhone:CP.ME.phone,verifiedLine:'Aadhaar e-KYC (mock) · verified '+new Date(me.verifiedAt||now).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}),

// render-vals.js line 491
      fpills,regionPill:fpills[0],regionName:f.region==='near'?'Velachery':f.region,sheetGroups:o.fGroups.filter(g=>!S.sheetGroup||g.title===S.sheetGroup),

// render-vals.js line 495
      mpins:list.map(i=>({x:i.x+'%',y:(i.y*0.62+10)+'%',icon:CP.CATS[i.cat].icon,c:PIN[i.stage][0],fg:PIN[i.stage][1],hot:i.stage==='review'||(i.stage==='community'&&i.conf>=70),n:i.sup,pb:S.mSelId===i.id&&S.sheetHidden?'var(--cp-ink)':'var(--cp-surface)',pf:S.mSelId===i.id&&S.sheetHidden?'var(--cp-bg)':'var(--cp-ink)',sc:S.mSelId===i.id&&S.sheetHidden?1.12:1,s:'36px',is:'17px',z:1,pick:()=>this.open(i.id)})),

// render-vals.js line 496
      showMe:f.region==='near',