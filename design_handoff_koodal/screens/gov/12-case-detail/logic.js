// render-vals.js line 3
    const S=this.state,P=S.prefs,w=S.w,mob=w<720,desk=w>=1100,notMob=!mob;

// render-vals.js line 19
    const base={theme,tr,toast:S.toast,langOpts,mob,notMob,desk,notDesk:!desk,pad:mob?'18px 16px 28px':`26px ${lp}px 64px`,padX:lp+'px',negPad:-lp+'px',h1:mob?'30px':'38px',h1d:mob?'28px':'36px',kpiMin:mob?'140px':'170px',corpL,me:ME};

// render-vals.js line 75
      dept:src=>DEPTS.filter(d=>src.some(r=>r.dn===d[0])).map(d=>({k:d[0],l:d[0],sub:d[1],n:src.filter(r=>r.dn===d[0]).length,icon:d[2]})),

// render-vals.js line 99
    let d=null;const ci=S.cur&&CP.find(S.cur);

// render-vals.js line 107
      d={...r,mosaic:[0,1,2,3,4].map(k=>({gc:k===0?'1':k===1||k===3?'2':'3',gr:k===0?'1 / span 2':k<3?'1':'2',cap:k<st.photos?'photo '+(k+1):'',ang:ang(k),open:openAt(k)})),openAll:()=>this.setState({tour:true}),

// render-vals.js line 108
        carousel:Array.from({length:Math.min(12,st.photos)},(_,k)=>({cap:'photo '+(k+1),ang:ang(k),open:openAt(k)})),carN:String(Math.min(12,st.photos)),carScroll:e=>{const el=e.currentTarget;const ix=Math.round(el.scrollLeft/Math.max(1,el.clientWidth));if(ix!==(this.state.carI||0))this.setState({carI:ix});},

// render-vals.js line 235
      scrim:mob?'var(--cp-scrim)':'rgb(0 0 0 / .22)',l:mob?'0':dpL+'px',r:mob?'0':'auto',t:mob?'auto':(S.dpY||80)+'px',b:mob?'0':'auto',w:mob?'auto':dpW+'px',maxH:mob?'90vh':`calc(100vh - ${(S.dpY||80)+16}px)`,pad:mob?'18px 16px 22px':'24px 28px',rad:mob?'26px 26px 0 0':'28px',anim:mob?'cp-sheet .4s cubic-bezier(.2,.9,.3,1.1) both':'cp-pop2 .22s both',

// render-vals.js line 315
      isHome:tab==='home',isCases:tab==='cases',isCase:tab==='case'&&!!d,isMap:tab==='map',isIns:tab==='insights',isSearch:tab==='search',isProfile:tab==='profile',isSettings:tab==='settings',

// render-vals.js line 327
      toggleFull:()=>this.setState(s=>({mapFull:!s.mapFull,mapSel:null})),fullTip:full?'Exit full screen':'Full screen map',fullIcon:full?'ph-arrows-in-simple':'ph-arrows-out-simple',mobChrome:mob,__x:!full,sheetTop:'24%',

// render-vals.js line 330
      galH:desk?'440px':'340px',carN:String((S.carI||0)+1),tourOpen:tab==='case'&&!!S.tour&&!!d,closeTour:()=>this.setState({tour:false}),tourPad:mob?'12px':'24px',dp,

// render-vals.js line 331
      d:d||{},back:()=>this.go(S.from||'cases'),backL:tr[S.from]||'Cases',copyLink:()=>{try{navigator.clipboard.writeText(location.href.split('#')[0]+'#'+(d&&d.ref));}catch(e){}this.toast('Case link copied');},detailCols:desk?'minmax(0,1fr) 380px':'minmax(0,1fr)',asidePos:desk?'sticky':'static',