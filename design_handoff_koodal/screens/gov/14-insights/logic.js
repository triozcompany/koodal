// render-vals.js line 6
    const tr=T[P.lang]||T.en;

// render-vals.js line 19
    const base={theme,tr,toast:S.toast,langOpts,mob,notMob,desk,notDesk:!desk,pad:mob?'18px 16px 28px':`26px ${lp}px 64px`,padX:lp+'px',negPad:-lp+'px',h1:mob?'30px':'38px',h1d:mob?'28px':'36px',kpiMin:mob?'140px':'170px',corpL,me:ME};

// render-vals.js line 233
    const dp={open:!!S.dpOpen,bd:S.dpOpen?'var(--cp-ink)':'var(--cp-line)',sh:S.dpOpen?'0 10px 26px -14px rgb(0 0 0 / .4)':'0 2px 0 var(--cp-edge)',

// render-vals.js line 235
      scrim:mob?'var(--cp-scrim)':'rgb(0 0 0 / .22)',l:mob?'0':dpL+'px',r:mob?'0':'auto',t:mob?'auto':(S.dpY||80)+'px',b:mob?'0':'auto',w:mob?'auto':dpW+'px',maxH:mob?'90vh':`calc(100vh - ${(S.dpY||80)+16}px)`,pad:mob?'18px 16px 22px':'24px 28px',rad:mob?'26px 26px 0 0':'28px',anim:mob?'cp-sheet .4s cubic-bezier(.2,.9,.3,1.1) both':'cp-pop2 .22s both',

// render-vals.js line 245
    const ins={rangeL,recN:cur.opened,custom:S.range==='custom',fromV:isoD(r0),toV:isoD(r1),maxV:isoD(now),

// render-vals.js line 264
    const listCards=[{icon:'ph-repeat',t:'Recurring cases',s:'Same problem, same place — consider a permanent fix',rows:recurring.map(lrow),empty:recurring.length?'':'No recurring locations.'},{icon:'ph-arrow-counter-clockwise',t:'Reopened by citizens',s:'Fix was not accepted by the community',rows:cases.filter(i=>i.reopened).map(lrow),empty:cases.some(i=>i.reopened)?'':'No reopened cases.'}];

// render-vals.js line 315
      isHome:tab==='home',isCases:tab==='cases',isCase:tab==='case'&&!!d,isMap:tab==='map',isIns:tab==='insights',isSearch:tab==='search',isProfile:tab==='profile',isSettings:tab==='settings',

// render-vals.js line 330
      galH:desk?'440px':'340px',carN:String((S.carI||0)+1),tourOpen:tab==='case'&&!!S.tour&&!!d,closeTour:()=>this.setState({tour:false}),tourPad:mob?'12px':'24px',dp,

// render-vals.js line 344
      ins,listCards,insCols:desk?'repeat(2,minmax(0,1fr))':'minmax(0,1fr)',chartH:mob?'240px':'300px',insTop:'12px',insZ:S.cbOpen&&tab==='insights'?30:20,cbMin:mob?'140px':'190px',