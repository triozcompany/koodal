// render-vals.js line 77
      chips:[['all','All','ph-squares-four'],...Object.entries(CP.CATS).map(([k,c])=>[k,c.l,c.icon])].map(([k,label,icon])=>{const on=k==='all'?!f.cat.length:(f.cat.length===1&&f.cat[0]===k);return {label,icon,bg:on?'var(--cp-ink)':'var(--cp-surface)',fg:on?'var(--cp-bg)':'var(--cp-ink)',bd:on?'var(--cp-ink)':'var(--cp-line)',pick:()=>{this.buzz(5);this.setState(s=>({f:{...s.f,cat:k==='all'?[]:[k]}}));}};}),

// render-vals.js line 81
        {title:'REGION',nice:'Where',chips:true,opts:[['near','Near me'],['Chennai','Chennai'],['Coimbatore','Coimbatore'],['Madurai','Madurai']].map(([k,l])=>chipOpt(f.region===k,l,()=>this.setState(s=>({f:{...s.f,region:k}}))))},

// render-vals.js line 82
        {title:'CATEGORY',nice:'Problem type',chips:false,tiles:true,opts:Object.entries(CP.CATS).map(([k,c])=>({...chipOpt(f.cat.includes(k),c.l,()=>toggleIn('cat',k)),icon:c.icon,tb:f.cat.includes(k)?'2px solid var(--cp-ink)':'1px solid var(--cp-line)',tbg:f.cat.includes(k)?'var(--cp-surface-2)':'var(--cp-surface)'}))},

// render-vals.js line 163
    const src=list;const sel=src.find(i=>i.id===S.selId);

// render-vals.js line 167
      deskHome:view==='home',deskDetail:view==='detail',deskCases:view==='cases',deskProfile:view==='profile',

// render-vals.js line 168
      listW:W>=1280?'420px':'350px',detailCols:W>=1040?'minmax(0,1fr) 380px':'minmax(0,1fr)',asidePos:W>=1040?'sticky':'static',

// render-vals.js line 171
      dqRef:this.dqRef,dTitle:S.f.region==='near'?'Nearby':S.f.region,dCount:src.length+' issues',

// render-vals.js line 174
      dlist:src.map(i=>{const on=S.selId===i.id;return {...this.card(i,D),rowBg:on?'var(--cp-bg)':'transparent',bar:on?'var(--cp-pulse)':'transparent',hover:()=>{if(this.state.selId!==i.id)this.setState({selId:i.id});}};}),

// render-vals.js line 175
      dEmpty:!src.length,showMe:S.f.region==='near'&&!qt,mapCity:qt?'TAMIL NADU':S.f.region==='near'?'VELACHERY':S.f.region.toUpperCase(),

// render-vals.js line 176
      dpins:src.map(i=>{const on=S.selId===i.id;return {x:i.x+'%',y:(i.y*0.8+10)+'%',icon:CP.CATS[i.cat].icon,c:PIN[i.stage][0],fg:PIN[i.stage][1],hot:i.stage==='review'||(i.stage==='community'&&i.conf>=70),n:i.sup,pb:on?'var(--cp-ink)':'var(--cp-surface)',pf:on?'var(--cp-bg)':'var(--cp-ink)',sc:on?1.12:1,s:on?'46px':'36px',is:on?'21px':'17px',z:on?6:1,pick:()=>this.setState({selId:i.id})};}),

// render-vals.js line 177
      hasSel:!!sel,sel:sel?(()=>{const c=this.card(sel,D);return {...c,conf:sel.conf,sbD:D.my.support[sel.id]?'var(--cp-pulse)':'#1e1e1e'};})():{},closeSel:()=>this.setState({selId:null}),

// render-vals.js line 179
      legend:[['Gathering','var(--cp-marigold)'],['Official','var(--cp-peacock)'],['In progress','var(--cp-pulse)'],['Fixed','var(--cp-leaf)']].map(([l,c])=>({l,c}))};

// render-vals.js line 243
    const cb=(k,list,label)=>{const sel=S[k],q=S[k+'Q']||'';const opts=list.filter(x=>!q||x.a.toLowerCase().includes(q.toLowerCase()));const open=!!S[k+'Open'];return {label,sel:sel||'',ph:sel||('Any '+label.toLowerCase()),q,open,none:!opts.length,bd:open?'var(--cp-ink-3)':'var(--cp-line)',rot:open?'rotate(180deg)':'none',

// render-vals.js line 299
      regionPill:{l:f.region==='near'?'Velachery':f.region,open:()=>{this.buzz(6);this.setState({locOpen:true});}},locOpen:!!S.locOpen,locOpenM:mob&&!!S.locOpen,locOpenD:!mob&&!!S.locOpen,locScrim:mob?'var(--cp-scrim)':'transparent',closeLoc:()=>this.setState({locOpen:false}),

// render-vals.js line 371
      locRows:locF.slice(0,40).map(x=>{const on=curK===x.k;return {l:x.l,sub:x.sub,icon:x.icon,on,bg:on?'var(--cp-surface-2)':'transparent',bd:on?'2px solid var(--cp-ink)':'1px solid var(--cp-line)',ibg:on?'var(--cp-pulse)':'var(--cp-surface-2)',ifg:on?'#fff':'var(--cp-ink)',pick:()=>{this.buzz([6,20,6]);this.setState(s=>({f:{...s.f,region:x.region},fArea:x.area,locOpen:false,locQ:'',panX:0,panY:0}));}};}),

// render-vals.js line 372
      regionPill:{l:S.fArea||(f.region==='near'?'Velachery':f.region),open:()=>{this.buzz(6);this.setState({locOpen:true});}},isAiM:mob&&S.screen==='ai',isAiD:!mob&&S.screen==='ai',isSimM:mob&&S.screen==='similar',isSimD:!mob&&S.screen==='similar',thM:mob&&!!S.threshold,thD:!mob&&!!S.threshold,hasMSel:mob&&!!S.sheetHidden&&!!S.mSelId&&!!CP.find(S.mSelId),msel:S.mSelId&&CP.find(S.mSelId)?{...this.card(CP.find(S.mSelId),D),n:CP.find(S.mSelId).sup}:{},closeMSel:e=>{e&&e.stopPropagation&&e.stopPropagation();this.setState({mSelId:null});},regionName:S.fArea||(f.region==='near'?'Velachery':f.region),

// render-vals.js line 375
      dlist:mob?[]:(dk.dlist||[]).filter(c=>areaOk(CP.find(c.id))),dpins:mob?[]:(dk.dpins||[]).map((p,k)=>({...p,id:dk.dlist[k]&&dk.dlist[k].id,pick:wrapPick(p.pick)})).filter(p=>areaOk(CP.find(p.id))),

// render-vals.js line 376
      panX:(S.panX||0)+'px',panY:(S.panY||0)+'px',zoom:S.zoom||1,pinInv:(1/(S.zoom||1)).toFixed(3),mapTr:S.mapDrag?'none':'transform .35s cubic-bezier(.2,.9,.3,1)',mapCur:S.mapDrag?'grabbing':'grab',

// render-vals.js line 377
      mapDown:this.mapDown,mapWheel:this.mapWheel,zoomIn:()=>{this.buzz(5);this.setState({zoom:Math.min(3,(S.zoom||1)*1.3)});},zoomOut:()=>{this.buzz(5);this.setState({zoom:Math.max(.7,(S.zoom||1)/1.3)});},recenter:()=>{this.buzz([6,20,6]);this.setState({zoom:1,panX:0,panY:0});},

// render-vals.js line 465
      listHidden:!mob&&!!S.listHidden,mapFull:mob?!!S.sheetHidden:!!S.listHidden,mapFullIcon:(mob?S.sheetHidden:S.listHidden)?'ph-arrows-in-simple':'ph-arrows-out-simple',mapFullTip:(mob?S.sheetHidden:S.listHidden)?'Exit full screen':'Full screen map',toggleMapFull:()=>{this.buzz([6,20,6]);if(mob)this.setState({sheetHidden:!S.sheetHidden});else{const v=!S.listHidden;this.setState({listHidden:v,railHidden:v});}},toggleList:()=>{this.buzz(6);this.setState({listHidden:!S.listHidden});},listW:S.listHidden?'0px':(W>=1280?'420px':'350px'),

// render-vals.js line 491
      fpills,regionPill:fpills[0],regionName:f.region==='near'?'Velachery':f.region,sheetGroups:o.fGroups.filter(g=>!S.sheetGroup||g.title===S.sheetGroup),

// render-vals.js line 496
      showMe:f.region==='near',