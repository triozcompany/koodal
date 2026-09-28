// render-vals.js line 19
    const base={theme,tr,toast:S.toast,langOpts,mob,notMob,desk,notDesk:!desk,pad:mob?'18px 16px 28px':`26px ${lp}px 64px`,padX:lp+'px',negPad:-lp+'px',h1:mob?'30px':'38px',h1d:mob?'28px':'36px',kpiMin:mob?'140px':'170px',corpL,me:ME};

// render-vals.js line 313
      goSettings:()=>this.go('settings'),goProfile:()=>this.go('profile'),setBg:tab==='settings'&&!mob?'var(--cp-surface-2)':'transparent',setC:tab==='settings'?'#fff':'#8a8a8a',profBg:tab==='profile'?'var(--cp-surface-2)':'transparent',

// render-vals.js line 314
      mainPb:mob?'84px':'0',markF:theme==='dark'?'none':'invert(1)',popOpen:!!S.pop||(tab==='insights'&&!!S.cbOpen),closePop:()=>this.setState({pop:null,cbOpen:null}),

// render-vals.js line 327
      toggleFull:()=>this.setState(s=>({mapFull:!s.mapFull,mapSel:null})),fullTip:full?'Exit full screen':'Full screen map',fullIcon:full?'ph-arrows-in-simple':'ph-arrows-out-simple',mobChrome:mob,__x:!full,sheetTop:'24%',

// render-vals.js line 329
      mobSub:mob&&['case','profile','settings'].includes(tab),hdrPos:['case','profile','settings'].includes(tab)?'sticky':'relative',sH1:mob?'28px':'32px',cfBgS:cfN?'var(--cp-ink)':'linear-gradient(180deg,var(--cp-surface),var(--cp-surface-2))',mobMain:!(mob&&['case','profile','settings'].includes(tab)),mobTitle:tab==='case'&&d?d.ref:tr[tab]||'',mobSubT:tab==='case'&&d?d.sl:'',mobAct:tab==='case',mobNoAct:tab!=='case',mobBack:()=>tab==='case'?this.go(S.from||'cases'):this.go(S.back0||'home'),

// render-vals.js line 331
      d:d||{},back:()=>this.go(S.from||'cases'),backL:tr[S.from]||'Cases',copyLink:()=>{try{navigator.clipboard.writeText(location.href.split('#')[0]+'#'+(d&&d.ref));}catch(e){}this.toast('Case link copied');},detailCols:desk?'minmax(0,1fr) 380px':'minmax(0,1fr)',asidePos:desk?'sticky':'static',