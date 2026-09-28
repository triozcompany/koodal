// render-vals.js line 3
    const S=this.state,P=S.prefs,w=S.w,mob=w<720,desk=w>=1100,notMob=!mob;

// render-vals.js line 19
    const base={theme,tr,toast:S.toast,langOpts,mob,notMob,desk,notDesk:!desk,pad:mob?'18px 16px 28px':`26px ${lp}px 64px`,padX:lp+'px',negPad:-lp+'px',h1:mob?'30px':'38px',h1d:mob?'28px':'36px',kpiMin:mob?'140px':'170px',corpL,me:ME};

// render-vals.js line 233
    const dp={open:!!S.dpOpen,bd:S.dpOpen?'var(--cp-ink)':'var(--cp-line)',sh:S.dpOpen?'0 10px 26px -14px rgb(0 0 0 / .4)':'0 2px 0 var(--cp-edge)',

// render-vals.js line 327
      toggleFull:()=>this.setState(s=>({mapFull:!s.mapFull,mapSel:null})),fullTip:full?'Exit full screen':'Full screen map',fullIcon:full?'ph-arrows-in-simple':'ph-arrows-out-simple',mobChrome:mob,__x:!full,sheetTop:'24%',

// render-vals.js line 330
      galH:desk?'440px':'340px',carN:String((S.carI||0)+1),tourOpen:tab==='case'&&!!S.tour&&!!d,closeTour:()=>this.setState({tour:false}),tourPad:mob?'12px':'24px',dp,

// render-vals.js line 357
      modalOpen:!!mi,closeModal:()=>this.setState({modal:null}),stop:e=>e.stopPropagation(),mAlign:mob?'flex-end':'stretch',mJust:mob?'center':'flex-end',mMaxW:mob?'100%':'440px',mPad:mob?'0':'12px',mMax:mob?(S.mBig?'92vh':'70vh'):'calc(100vh - 24px)',mR:mob?'26px 26px 0 0':'26px',mAnim:mob?'cp-sheet .4s cubic-bezier(.2,.9,.3,1.1) both':'cp-side .42s cubic-bezier(.2,.9,.3,1.05) both',mc};