// render-vals.js line 3
    const S=this.state,P=S.prefs,w=S.w,mob=w<720,desk=w>=1100,notMob=!mob;

// render-vals.js line 19
    const base={theme,tr,toast:S.toast,langOpts,mob,notMob,desk,notDesk:!desk,pad:mob?'18px 16px 28px':`26px ${lp}px 64px`,padX:lp+'px',negPad:-lp+'px',h1:mob?'30px':'38px',h1d:mob?'28px':'36px',kpiMin:mob?'140px':'170px',corpL,me:ME};

// render-vals.js line 324
      openCF:()=>this.setState({cfOpen:true,fsBig:false}),fsHt:mob?(S.fsBig?'92vh':'70vh'):'auto',fsScroll:e=>{if(mob&&!this.state.fsBig&&e.currentTarget.scrollTop>6)this.setState({fsBig:true});},mScroll:e=>{if(mob&&!this.state.mBig&&e.currentTarget.scrollTop>6)this.setState({mBig:true});},cfN:cfN?String(cfN):'',cfBd:cfN?'var(--cp-ink)':'var(--cp-line)',cfBg:cfN?'var(--cp-ink)':'var(--cp-surface)',cfFg:cfN?'var(--cp-bg)':'var(--cp-ink)',activeF,hasActiveF:activeF.length>0,

// render-vals.js line 326
      fsOpen:!!(S.cfOpen||S.mfOpen),fs:S.mfOpen?fsMap:fsCases,fsL:mob?'0':'auto',fsR:mob?'0':'12px',fsT:mob?'auto':'12px',fsB:mob?'0':'12px',fsW:mob?'auto':'440px',fsMaxH:mob?'92vh':'none',fsRad:mob?'26px 26px 0 0':'26px',fsAnim:mob?'cp-sheet .4s cubic-bezier(.2,.9,.3,1.1) both':'cp-side .4s cubic-bezier(.2,.9,.3,1.05) both',fsScrim:mob?'var(--cp-scrim)':'rgb(0 0 0 / .18)',

// render-vals.js line 327
      toggleFull:()=>this.setState(s=>({mapFull:!s.mapFull,mapSel:null})),fullTip:full?'Exit full screen':'Full screen map',fullIcon:full?'ph-arrows-in-simple':'ph-arrows-out-simple',mobChrome:mob,__x:!full,sheetTop:'24%',