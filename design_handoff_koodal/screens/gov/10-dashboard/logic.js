// render-vals.js line 3
    const S=this.state,P=S.prefs,w=S.w,mob=w<720,desk=w>=1100,notMob=!mob;

// render-vals.js line 13
    const corpL=scope==='All'?'All corporations':CP.CITY[scope].corp;

// render-vals.js line 19
    const base={theme,tr,toast:S.toast,langOpts,mob,notMob,desk,notDesk:!desk,pad:mob?'18px 16px 28px':`26px ${lp}px 64px`,padX:lp+'px',negPad:-lp+'px',h1:mob?'30px':'38px',h1d:mob?'28px':'36px',kpiMin:mob?'140px':'170px',corpL,me:ME};

// render-vals.js line 37
    const kpis=[

// render-vals.js line 52
    const activity=[];cases.forEach(i=>i.events.forEach(e=>{if(/reported it$|joined|New evidence|Evidence withdrawn|neighbours joined/.test(e.title))return;activity.push({e,i});}));

// render-vals.js line 235
      scrim:mob?'var(--cp-scrim)':'rgb(0 0 0 / .22)',l:mob?'0':dpL+'px',r:mob?'0':'auto',t:mob?'auto':(S.dpY||80)+'px',b:mob?'0':'auto',w:mob?'auto':dpW+'px',maxH:mob?'90vh':`calc(100vh - ${(S.dpY||80)+16}px)`,pad:mob?'18px 16px 22px':'24px 28px',rad:mob?'26px 26px 0 0':'28px',anim:mob?'cp-sheet .4s cubic-bezier(.2,.9,.3,1.1) both':'cp-pop2 .22s both',

// render-vals.js line 250
      kpis:kpisI,leave:()=>{if(this.state.hB!=null)this.setState({hB:null});},tip,

// render-vals.js line 315
      isHome:tab==='home',isCases:tab==='cases',isCase:tab==='case'&&!!d,isMap:tab==='map',isIns:tab==='insights',isSearch:tab==='search',isProfile:tab==='profile',isSettings:tab==='settings',

// render-vals.js line 316
      todayL:new Date().toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long'}),goSearch:()=>this.go('search'),goMap:()=>this.go('map'),goPending:()=>this.go('cases',{cSt:[],cCity:[],cArea:[],cDept:[],cCat:[],cq:'',cSt:['pending']}),goOverdue:()=>this.go('cases',{cSt:[],cCity:[],cArea:[],cDept:[],cCat:[],cq:'',cSt:[od.length?'overdue':'reopened']}),

// render-vals.js line 317
      hasAlert:od.length+reop.length>0,alertT:`${od.length} overdue · ${reop.length} reopened`,alertS:'Citizens can see SLA breaches on the public case timeline.',

// render-vals.js line 318
      kpis,homeCols:desk?'minmax(0,1.55fr) minmax(320px,1fr)':'minmax(0,1fr)',pendN:pend.length,pendRows:pend.sort(sortCase).slice(0,5).map(R),pendEmpty:!pend.length,

// render-vals.js line 319
      riskN:riskL.length,riskRows:riskL.slice(0,5).map(R),riskEmpty:!riskL.length,trend:mkTrend(110),

// render-vals.js line 320
      hotMini:hot.filter(h=>h.city===(scope==='All'?'Chennai':scope)).map(h=>({x:h.x+'%',y:h.y+'%',s:(30+h.open*18)+'px'})),

// render-vals.js line 321
      hotRows:hot.slice(0,5).map((h,k)=>({n:k+1,area:h.area,top:h.top,open:h.open,w:h.score/hMax*100+'%',go:()=>this.go('cases',{cSt:[],cCity:[],cArea:[],cDept:[],cCat:[],cq:'',cArea:[h.area]})})),

// render-vals.js line 322
      activity:activity.slice(0,7).map(({e,i})=>{const kc=KC[e.kind]||KC.citizen;return {t:e.title,icon:e.icon,bg:kc[0],fg:kc[1],ref:i.caseId||i.id,case:i.title,ago:CP.ago(e.ts),open:()=>this.open(i.id)};}),

// render-vals.js line 350
      meInfo:[{k:'Role',v:ME.role},{k:'Designation',v:ME.title},{k:'Department',v:ME.dept},{k:'Corporation',v:corpL},{k:'Employee ID',v:ME.empId},{k:'Reports to',v:ME.reports},{k:'Office phone',v:ME.phone}],