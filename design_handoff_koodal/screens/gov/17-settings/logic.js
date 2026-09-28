// render-vals.js line 6
    const tr=T[P.lang]||T.en;

// render-vals.js line 8
    const langOpts=seg([['en','English'],['ta','தமிழ்']],P.lang,k=>this.setP('lang',k));

// render-vals.js line 19
    const base={theme,tr,toast:S.toast,langOpts,mob,notMob,desk,notDesk:!desk,pad:mob?'18px 16px 28px':`26px ${lp}px 64px`,padX:lp+'px',negPad:-lp+'px',h1:mob?'30px':'38px',h1d:mob?'28px':'36px',kpiMin:mob?'140px':'170px',corpL,me:ME};

// render-vals.js line 235
      scrim:mob?'var(--cp-scrim)':'rgb(0 0 0 / .22)',l:mob?'0':dpL+'px',r:mob?'0':'auto',t:mob?'auto':(S.dpY||80)+'px',b:mob?'0':'auto',w:mob?'auto':dpW+'px',maxH:mob?'90vh':`calc(100vh - ${(S.dpY||80)+16}px)`,pad:mob?'18px 16px 22px':'24px 28px',rad:mob?'26px 26px 0 0':'28px',anim:mob?'cp-sheet .4s cubic-bezier(.2,.9,.3,1.1) both':'cp-pop2 .22s both',

// render-vals.js line 309
    const sessions=[{icon:'ph-desktop',l:'Chrome · Ripon Building office',s:'Chennai · active now',cur:true,other:false},{icon:'ph-device-mobile',l:'Koodal Gov · Android',s:'Chennai · 2h ago',cur:false,other:!S.ended.m,end:()=>{this.setState(s=>({ended:{...s.ended,m:1}}));this.toast('Signed out of Android session');}}].filter(s=>s.cur||s.other);

// render-vals.js line 315
      isHome:tab==='home',isCases:tab==='cases',isCase:tab==='case'&&!!d,isMap:tab==='map',isIns:tab==='insights',isSearch:tab==='search',isProfile:tab==='profile',isSettings:tab==='settings',

// render-vals.js line 352
      notifs:NT.map(([k,l,s])=>{const on=P.notif[k];return {l,s,bg:on?'var(--cp-leaf)':'var(--cp-line)',x:on?'23px':'3px',toggle:()=>this.setP('notif',tog(P.notif,k))};}),

// render-vals.js line 353
      chans:[['push','Push','ph-device-mobile'],['email','Email','ph-envelope-simple'],['sms','SMS','ph-chat-text']].map(([k,l,icon])=>{const on=P.ch[k];return {l,icon,bd:on?'var(--cp-ink)':'var(--cp-line)',bg:on?'var(--cp-ink)':'var(--cp-surface)',fg:on?'var(--cp-bg)':'var(--cp-ink)',toggle:()=>this.setP('ch',tog(P.ch,k))};}),

// render-vals.js line 354
      setCols:'minmax(0,1fr)',

// render-vals.js line 355
      toOpts:seg([['15 min','15m'],['30 min','30m'],['60 min','60m']],P.timeout,k=>this.setP('timeout',k)),sessions,changePwd:()=>this.toast('Password reset link sent to your official email'),

// render-vals.js line 356
      acctInfo:[{k:'Name',v:ME.name},{k:'Official email',v:ME.email},{k:'Employee ID',v:ME.empId},{k:'Access level',v:'Review, assign & close-out · '+corpL}],exportLog:()=>this.toast('Action log (CSV) prepared for download'),signOut:this.signOut,