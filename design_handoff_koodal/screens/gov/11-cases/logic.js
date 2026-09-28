// render-vals.js line 3
    const S=this.state,P=S.prefs,w=S.w,mob=w<720,desk=w>=1100,notMob=!mob;

// render-vals.js line 6
    const tr=T[P.lang]||T.en;

// render-vals.js line 13
    const corpL=scope==='All'?'All corporations':CP.CITY[scope].corp;

// render-vals.js line 19
    const base={theme,tr,toast:S.toast,langOpts,mob,notMob,desk,notDesk:!desk,pad:mob?'18px 16px 28px':`26px ${lp}px 64px`,padX:lp+'px',negPad:-lp+'px',h1:mob?'30px':'38px',h1d:mob?'28px':'36px',kpiMin:mob?'140px':'170px',corpL,me:ME};

// render-vals.js line 38
      {icon:'ph-fill ph-hourglass-medium',ibg:'var(--cp-marigold)',ifg:'var(--cp-on-marigold)',v:pend.length,l:'Pending approval',s:'Crossed community threshold',go:()=>this.go('cases',{cSt:[],cCity:[],cArea:[],cDept:[],cCat:[],cq:'',cSt:['pending']})},

// render-vals.js line 39
      {icon:'ph-bold ph-hard-hat',ibg:'var(--cp-peacock-soft)',ifg:'var(--cp-peacock)',v:active.length,l:'Active cases',s:'Assigned or in progress',go:()=>this.go('cases',{cSt:[],cCity:[],cArea:[],cDept:[],cCat:[],cq:''})},

// render-vals.js line 40
      {icon:'ph-bold ph-alarm',ibg:'var(--cp-pulse)',ifg:'#fff',v:od.length,l:'Overdue',s:'Past SLA deadline',go:()=>this.go('cases',{cSt:[],cCity:[],cArea:[],cDept:[],cCat:[],cq:'',cSt:['overdue']})},

// render-vals.js line 82
    const activeF=[...S.cSt.map(v=>({k:'Status',l:STL[v],clear:rmv('cSt',v)})),...S.cCity.map(v=>({k:'Region',l:v,clear:rmv('cCity',v)})),...S.cArea.map(v=>({k:'Area',l:v,clear:rmv('cArea',v)})),...S.cDept.map(v=>({k:'Dept',l:v,clear:rmv('cDept',v)})),...S.cCat.map(v=>({k:'Type',l:CP.CATS[v].l,clear:rmv('cCat',v)}))];

// render-vals.js line 86
    const views=[['list','List','ph-rows'],['grid','Grid','ph-squares-four'],['board','Board','ph-kanban']].map(([k,l,icon])=>{const on=vw===k;return {l,icon,showL:desk,px:desk?'14px':'11px',bg:on?'var(--cp-surface)':'transparent',fg:on?'var(--cp-ink)':'var(--cp-ink-2)',sh:on?'0 2px 6px -2px rgb(0 0 0 / .2)':'none',pick:()=>this.setP('view',k)};});

// render-vals.js line 88
    const board=BOARD.filter(([k])=>!S.cSt.length||S.cSt.includes(k)).map(([k,l,hint])=>{const cs=Lb.filter(i=>gs(i)===k);const over=S.dragOver===k&&!!dragG;const ok=!!dragG&&(ALLOW[dragG]||[]).includes(k);

// render-vals.js line 160
    const cfN=activeF.length;

// render-vals.js line 204
    const tip=hB!=null?{x:((hB+.5)/NB*100)+'%',tx:hB<NB*.2?'-12%':hB>NB*.8?'-88%':'-50%',l:blFull(bks[hB]),rows:vis.map(sk=>({l:SER[sk][0],c:SER[sk][1],v:fv(bv[hB][sk])})),drill:gran==='hour'?'':gran}:null;

// render-vals.js line 235
      scrim:mob?'var(--cp-scrim)':'rgb(0 0 0 / .22)',l:mob?'0':dpL+'px',r:mob?'0':'auto',t:mob?'auto':(S.dpY||80)+'px',b:mob?'0':'auto',w:mob?'auto':dpW+'px',maxH:mob?'90vh':`calc(100vh - ${(S.dpY||80)+16}px)`,pad:mob?'18px 16px 22px':'24px 28px',rad:mob?'26px 26px 0 0':'28px',anim:mob?'cp-sheet .4s cubic-bezier(.2,.9,.3,1.1) both':'cp-pop2 .22s both',

// render-vals.js line 254
      breakdowns:[{t:'Problem types',s:'Cases opened in this period · click to filter',legend:LEG,empty:!Object.keys(catI).length,rows:brow(catI,'iCat',k=>CP.CATS[k].l,k=>CP.CATS[k].icon,10)},{t:'Areas',s:'Top areas by cases opened · click to filter',legend:LEG,empty:!Object.keys(areaI).length,rows:brow(areaI,'iArea',k=>k,()=>'ph-map-pin',8)}],

// render-vals.js line 264
    const listCards=[{icon:'ph-repeat',t:'Recurring cases',s:'Same problem, same place — consider a permanent fix',rows:recurring.map(lrow),empty:recurring.length?'':'No recurring locations.'},{icon:'ph-arrow-counter-clockwise',t:'Reopened by citizens',s:'Fix was not accepted by the community',rows:cases.filter(i=>i.reopened).map(lrow),empty:cases.some(i=>i.reopened)?'':'No reopened cases.'}];

// render-vals.js line 315
      isHome:tab==='home',isCases:tab==='cases',isCase:tab==='case'&&!!d,isMap:tab==='map',isIns:tab==='insights',isSearch:tab==='search',isProfile:tab==='profile',isSettings:tab==='settings',

// render-vals.js line 323
      casesTotal:cases.length,cq:S.cq,onCq:e=>this.setState({cq:e.target.value}),clearCq:()=>this.setState({cq:''}),clearF:()=>this.setState({cSt:[],cCity:[],cArea:[],cDept:[],cCat:[],cq:''}),

// render-vals.js line 324
      openCF:()=>this.setState({cfOpen:true,fsBig:false}),fsHt:mob?(S.fsBig?'92vh':'70vh'):'auto',fsScroll:e=>{if(mob&&!this.state.fsBig&&e.currentTarget.scrollTop>6)this.setState({fsBig:true});},mScroll:e=>{if(mob&&!this.state.mBig&&e.currentTarget.scrollTop>6)this.setState({mBig:true});},cfN:cfN?String(cfN):'',cfBd:cfN?'var(--cp-ink)':'var(--cp-line)',cfBg:cfN?'var(--cp-ink)':'var(--cp-surface)',cfFg:cfN?'var(--cp-bg)':'var(--cp-ink)',activeF,hasActiveF:activeF.length>0,

// render-vals.js line 328
      listN:vw==='board'?Lb.length:L.length,sortL:SORTS.find(x=>x[0]===S.sort)[1].toLowerCase(),rows:L.map(R),listEmpty:vw!=='board'&&!L.length,views,vTable:vw==='list'&&desk,vRows:vw==='list'&&!desk,vGrid:vw==='grid',vBoard:vw==='board',board,colW:mob?'82vw':'300px',boardH:mob?'calc(100vh - 330px)':'calc(100vh - 250px)',gridMin:mob?'100%':'280px',casesMax:vw==='board'?'100%':'1320px',boardHint:vw==='board'&&!mob?' · drag cards to move them through the workflow':'',

// render-vals.js line 350
      meInfo:[{k:'Role',v:ME.role},{k:'Designation',v:ME.title},{k:'Department',v:ME.dept},{k:'Corporation',v:corpL},{k:'Employee ID',v:ME.empId},{k:'Reports to',v:ME.reports},{k:'Office phone',v:ME.phone}],