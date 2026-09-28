// render-vals.js line 3
    const S=this.state,P=S.prefs,w=S.w,mob=w<720,desk=w>=1100,notMob=!mob;

// render-vals.js line 19
    const base={theme,tr,toast:S.toast,langOpts,mob,notMob,desk,notDesk:!desk,pad:mob?'18px 16px 28px':`26px ${lp}px 64px`,padX:lp+'px',negPad:-lp+'px',h1:mob?'30px':'38px',h1d:mob?'28px':'36px',kpiMin:mob?'140px':'170px',corpL,me:ME};

// render-vals.js line 119
        pin:PINC[g],onMap:()=>this.go('map',{mapCity:i.city,mapSel:i.id,mArea:[],pvI:0,panX:(50-i.x)*6,panY:(50-i.y)*5,zoom:1.5}),

// render-vals.js line 132
    const pins=shownPins.map(i=>{const g=gs(i),sel=S.mapSel===i.id,hov=S.hoverId===i.id;return {title:i.title,x:i.x+'%',y:i.y+'%',sc:sel?1.15:hov?1.08:1,z:sel?7:hov?6:(overdue(i)||g==='reopened'?4:3),bg:sel?'var(--cp-ink)':'var(--cp-surface)',fg:sel?'var(--cp-bg)':'var(--cp-ink)',bd:sel?'var(--cp-ink)':'var(--cp-line)',dot:PINC[g],icon:CP.CATS[i.cat].icon,sup:i.sup,alarm:overdue(i)||g==='reopened'||g==='pending',pick:()=>{if(this.moved)return;this.setState({mapSel:i.id,pvI:0,mListOpen:false});}};});

// render-vals.js line 134
    const heat=S.layers.hot?hotC.map(h=>({area:h.area,x:h.x+'%',y:h.y+'%',s:(70+h.open*26)+'px'})):[];

// render-vals.js line 136
    const emerg=S.layers.emerging&&(this.props.showEmerging??true)?emC.map(a=>({n:a.n,t:`${a.n} emerging signals in ${a.area}`,x:a.xs/a.n+'%',y:a.ys/a.n+'%',s:(34+a.n*10)+'px'})):[];

// render-vals.js line 140
    const focus=(x,y,z)=>({panX:(50-x)*6,panY:(50-y)*5,zoom:z});

// render-vals.js line 141
    const mapRows=mapL.map(i=>{const r=R(i),on=S.mapSel===i.id;return {...r,openCase:()=>this.open(i.id),hot:r.od||gs(i)==='reopened'||gs(i)==='pending',rowBg:on?'var(--cp-bg)':'transparent',rowBar:on?'var(--cp-pulse)':'transparent',pick:()=>this.setState({mapSel:i.id,pvI:0,mListOpen:false,...focus(i.x,i.y,Math.max(S.zoom,1.3))}),hover:()=>{if(S.hoverId!==i.id)this.setState({hoverId:i.id});},unhover:()=>this.setState({hoverId:null})};});

// render-vals.js line 150
    let ms={};if(msI){const r=R(msI),st=CP.stats(msI);ms={...r,photoN:st.photos,contribN:st.contributors,slaFgD:r.od||r.slaBg==='var(--cp-pulse)'?'#fb923c':'#bdbdbd',approve:()=>this.openModal('approve',msI),reject:()=>this.openModal('reject',msI)};}

// render-vals.js line 157
      combos:[scope==='All'&&combo('m-city','Region','ph-city',O.city(cSrc),[mapCity],v=>{if(v[0])this.setState({mapCity:v[0],mArea:[],mapSel:null,panX:0,panY:0,zoom:1});},{panel:true,single:true}),combo('m-area','Area','ph-map-pin',O.area(mSrc),S.mArea,v=>this.setState({mArea:v,mapSel:null}),{panel:true}),combo('m-dept','Department','ph-buildings',O.dept(mSrc),S.mDept,v=>this.setState({mDept:v,mapSel:null}),{panel:true}),combo('m-cat','Problem type','ph-squares-four',O.cat(mSrc),S.mCat,v=>this.setState({mCat:v,mapSel:null}),{panel:true})].filter(Boolean),

// render-vals.js line 159
    const mfN=(S.layers.cases?0:1)+(S.layers.hot?0:1)+(S.layers.emerging?0:1)+S.mSt.length+S.mArea.length+S.mDept.length+S.mCat.length;

// render-vals.js line 224
    const mkMonth=(ms,idx)=>{const d0=new Date(ms),y=d0.getFullYear(),mo=d0.getMonth(),first=new Date(y,mo,1).getDay(),nd=new Date(y,mo+1,0).getDate(),days=[];for(let k=0;k<first;k++)days.push({n:'',dis:true,band:'transparent',bandR:'0',bg:'transparent',fg:'transparent',cur:'default',td:'none',ring:'none',pick:()=>{}});

// render-vals.js line 315
      isHome:tab==='home',isCases:tab==='cases',isCase:tab==='case'&&!!d,isMap:tab==='map',isIns:tab==='insights',isSearch:tab==='search',isProfile:tab==='profile',isSettings:tab==='settings',

// render-vals.js line 325
      openMF:()=>this.setState({mfOpen:true,fsBig:false}),mfN:mfN?String(mfN):'',mfBd:mfN?'var(--cp-ink)':'var(--cp-line)',mfBg:mfN?'var(--cp-ink)':'var(--cp-surface)',mfFg:mfN?'var(--cp-bg)':'var(--cp-ink)',

// render-vals.js line 327
      toggleFull:()=>this.setState(s=>({mapFull:!s.mapFull,mapSel:null})),fullTip:full?'Exit full screen':'Full screen map',fullIcon:full?'ph-arrows-in-simple':'ph-arrows-out-simple',mobChrome:mob,__x:!full,sheetTop:'24%',

// render-vals.js line 332
      mapCols:mob?'minmax(0,1fr)':listOn?(desk?'380px minmax(0,1fr)':'340px minmax(0,1fr)'):'0px minmax(0,1fr)',listBd:listOn?'1px solid var(--cp-line)':'none',mapH:mob?'calc(100vh - 60px - 76px)':'100vh',mapPinN:mapL.length,

// render-vals.js line 333
      regionTitle:R1||(S.mArea.length>1?`${S.mArea.length} areas`:mapCity),regionSub:S.mArea.length?`${S.mArea.join(', ')} · ${mapCity}`:`${CP.CITY[mapCity].corp} · all areas`,regionL:R1?`${R1}, ${mapCity}`:S.mArea.length?`${S.mArea.length} areas · ${mapCity}`:`${mapCity} · All areas`,

// render-vals.js line 334
      mapRows,mapEmpty:!mapRows.length,toggleList:()=>mob?this.setState(s=>({mListOpen:!s.mListOpen,mMax:false,mapSel:null})):this.setState(s=>s.mapFull?{mapFull:false,mapList:true}:{mapList:s.mapList===false}),listHidden:!mob&&!listOn,

// render-vals.js line 335
      mobListBtn:mob&&!S.mListOpen&&!msI&&!full,listBtnL:`Show list · ${mapL.length}`,mobListOpen:mob&&!!S.mListOpen&&!full,sheetH:`calc(${S.mMax?'100%':'70%'} - ${S.sheetDrag||0}px)`,sheetTr:S.sheetDrag?'none':'height .38s cubic-bezier(.2,.9,.3,1),border-radius .3s',sheetR:S.mMax&&!S.sheetDrag?'0':'26px 26px 0 0',sheetBd:S.mMax?'var(--cp-line)':'transparent',sheetDown:this.sheetDown,sheetScroll:e=>{if(!this.state.mMax&&e.currentTarget.scrollTop>6)this.setState({mMax:true});},sheetWheel:e=>{if(this.state.mMax&&e.currentTarget.scrollTop<=0&&e.deltaY<-4)this.setState({mMax:false});},

// render-vals.js line 336
      openRegion:()=>this.setState({regOpen:true,regQ:''}),closeRegion:()=>this.setState({regOpen:false}),regOpen:!!S.regOpen,regQ:S.regQ||'',onRegQ:e=>this.setState({regQ:e.target.value}),regNone:!regF.length,

// render-vals.js line 337
      regRows:regF.map(x=>{const on=x.k===(R1||null);return {...x,on,bd:on?'2px solid var(--cp-ink)':'1px solid var(--cp-line)',bg:on?'var(--cp-surface-2)':'var(--cp-surface)',ibg:on?'var(--cp-ink)':'var(--cp-surface-2)',ifg:on?'var(--cp-bg)':'var(--cp-ink)',

// render-vals.js line 338
        pick:()=>{if(x.k&&x.k.startsWith('city:')){this.setState({mapCity:x.k.slice(5),mArea:[],regOpen:false,mapSel:null,panX:0,panY:0,zoom:1});return;}if(!x.k){this.setState({mArea:[],regOpen:false,mapSel:null,panX:0,panY:0,zoom:1});return;}const pts=inCity.filter(i=>i.area===x.k);const cx=pts.reduce((a,i)=>a+i.x,0)/pts.length,cy=pts.reduce((a,i)=>a+i.y,0)/pts.length;this.setState({mArea:[x.k],regOpen:false,mapSel:null,...focus(cx,cy,1.7)});}};}),

// render-vals.js line 340
      mapDown:this.mapDown,mapWheel:this.mapWheel,mapCur:S.mapDrag?'grabbing':'grab',panXp:S.panX+'px',panYp:S.panY+'px',zoom:S.zoom,mapTr:S.mapDrag?'none':'transform .45s cubic-bezier(.2,.9,.3,1)',

// render-vals.js line 341
      heat,emerg,pins,zoomIn:()=>this.setState(s=>({zoom:Math.min(3,s.zoom*1.3)})),zoomOut:()=>this.setState(s=>({zoom:Math.max(.7,s.zoom/1.3)})),recenter:()=>this.setState({panX:0,panY:0,zoom:1}),

// render-vals.js line 342
      hasMapSel:!!msI,ms,pv,pvPrev:()=>this.setState({pvI:Math.max(0,pvI-1)}),pvNext:()=>this.setState({pvI:Math.min(pvTotal-1,pvI+1)}),closeSel:()=>this.setState({mapSel:null}),

// render-vals.js line 343
      selR:mob?'10px':'20px',selL:mob?'10px':'auto',selB:mob?'10px':'20px',selW:mob?'auto':'340px',pvMax:mob?'120px':'150px',

// render-vals.js line 357
      modalOpen:!!mi,closeModal:()=>this.setState({modal:null}),stop:e=>e.stopPropagation(),mAlign:mob?'flex-end':'stretch',mJust:mob?'center':'flex-end',mMaxW:mob?'100%':'440px',mPad:mob?'0':'12px',mMax:mob?(S.mBig?'92vh':'70vh'):'calc(100vh - 24px)',mR:mob?'26px 26px 0 0':'26px',mAnim:mob?'cp-sheet .4s cubic-bezier(.2,.9,.3,1.1) both':'cp-side .42s cubic-bezier(.2,.9,.3,1.05) both',mc};