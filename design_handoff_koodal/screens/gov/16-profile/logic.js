// render-vals.js line 6
    const tr=T[P.lang]||T.en;

// render-vals.js line 13
    const corpL=scope==='All'?'All corporations':CP.CITY[scope].corp;

// render-vals.js line 19
    const base={theme,tr,toast:S.toast,langOpts,mob,notMob,desk,notDesk:!desk,pad:mob?'18px 16px 28px':`26px ${lp}px 64px`,padX:lp+'px',negPad:-lp+'px',h1:mob?'30px':'38px',h1d:mob?'28px':'36px',kpiMin:mob?'140px':'170px',corpL,me:ME};

// render-vals.js line 235
      scrim:mob?'var(--cp-scrim)':'rgb(0 0 0 / .22)',l:mob?'0':dpL+'px',r:mob?'0':'auto',t:mob?'auto':(S.dpY||80)+'px',b:mob?'0':'auto',w:mob?'auto':dpW+'px',maxH:mob?'90vh':`calc(100vh - ${(S.dpY||80)+16}px)`,pad:mob?'18px 16px 22px':'24px 28px',rad:mob?'26px 26px 0 0':'28px',anim:mob?'cp-sheet .4s cubic-bezier(.2,.9,.3,1.1) both':'cp-pop2 .22s both',

// render-vals.js line 313
      goSettings:()=>this.go('settings'),goProfile:()=>this.go('profile'),setBg:tab==='settings'&&!mob?'var(--cp-surface-2)':'transparent',setC:tab==='settings'?'#fff':'#8a8a8a',profBg:tab==='profile'?'var(--cp-surface-2)':'transparent',

// render-vals.js line 315
      isHome:tab==='home',isCases:tab==='cases',isCase:tab==='case'&&!!d,isMap:tab==='map',isIns:tab==='insights',isSearch:tab==='search',isProfile:tab==='profile',isSettings:tab==='settings',

// render-vals.js line 344
      ins,listCards,insCols:desk?'repeat(2,minmax(0,1fr))':'minmax(0,1fr)',chartH:mob?'240px':'300px',insTop:'12px',insZ:S.cbOpen&&tab==='insights'?30:20,cbMin:mob?'140px':'190px',

// render-vals.js line 349
      myStats:[{v:myDec,l:'Decisions made',s:'Approvals and rejections'},{v:avgDec?dur(avgDec):'—',l:'Avg. time to decide',s:`Target ${this.props.decisionSla??48}h`},{v:pend.length,l:'Waiting on you',s:'Pending approval'},{v:by('closed').length,l:'Closed by citizens',s:'In your jurisdiction'}],

// render-vals.js line 350
      meInfo:[{k:'Role',v:ME.role},{k:'Designation',v:ME.title},{k:'Department',v:ME.dept},{k:'Corporation',v:corpL},{k:'Employee ID',v:ME.empId},{k:'Reports to',v:ME.reports},{k:'Office phone',v:ME.phone}],

// render-vals.js line 351
      meAreas:uniq(i=>i.area).map(a=>({l:a,n:cases.filter(i=>i.area===a).length,go:()=>this.go('cases',{cSt:[],cCity:[],cArea:[],cDept:[],cCat:[],cq:'',cArea:[a]})})),