// render-vals.js line 3
    const mob=S.w<720,wide=S.w>=1100;const common={theme,toast:S.toast,ready:S.ready,isMobile:mob,isDesk:!mob,railW:wide?'232px':'76px',railLabels:wide,

// render-vals.js line 72
      goHome:()=>this.go('home'),goSearch:()=>this.go('search'),goReport:()=>this.go('report'),goCase:()=>this.go('case'),goTimeline:()=>this.go('timeline'),goVerify:()=>this.go('verify'),goDetail:()=>{const hs=this.state.hist||[];const t=hs[hs.length-1];if(t&&t.s==='detail')this.goBack();else this.go('detail');},goCases:()=>this.go('cases'),

// render-vals.js line 169
      dnav:[['home','Nearby','ph-map-trifold',''],['cases','Cases','ph-briefcase',needConfirm?String(needConfirm):''],['validate','Validate','ph-cards',''],['profile','You','ph-user','']].map(([k,l,icon,badge])=>{const on=k==='validate'?scr==='validate':(!FLOW.includes(scr)||k!=='validate')&&(view===k||(k==='home'&&view==='detail'&&S.prev!=='cases'&&S.prev!=='profile')||(k==='cases'&&view==='detail'&&S.prev==='cases'));return {l,badge,bp:W>=1100?'static':'absolute',icon:(on?'ph-fill ':'ph-bold ')+icon,bg:on?'var(--cp-surface-2)':'transparent',c:on?'var(--cp-ink)':'var(--cp-ink-3)',go:()=>this.go(k)};}),

// render-vals.js line 184
    const meName=me.name||CP.ME.name,meArea=me.area||CP.ME.area,meI=meName.split(' ').filter(Boolean).map(s=>s[0]).join('').slice(0,2).toUpperCase();

// render-vals.js line 278
      goProfilePage:()=>{this.setState({pDrawer:false});this.go('profile');},

// render-vals.js line 301
      railW:wideR?'232px':'76px',railLabels:wideR,wideRail:W>=1100,railIcon:S.railCollapsed?'ph-caret-double-right':'ph-caret-double-left',railTip:S.railCollapsed?'Expand sidebar':'Collapse sidebar',toggleRail:()=>{this.buzz(5);this.setState({railCollapsed:!S.railCollapsed});},

// render-vals.js line 302
      profNavBg:view==='profile'?'var(--cp-surface-2)':'transparent',profRing:view==='profile'?'var(--cp-ink)':'transparent',

// render-vals.js line 303
      goProfilePage:()=>{this.setState({pDrawer:false});this.go('profile',{profTab:['reports','supported'].includes(S.profTab)?S.profTab:'reports'});},

// render-vals.js line 337
      goProfilePage:()=>{this.setState({pDrawer:false});this.go('profile',{profTab:S.profTab==='activity'?'activity':'reports'});},

// render-vals.js line 466
      railShown:!S.railHidden,railHid:!mob&&!!S.railHidden,hideRail:()=>{this.buzz(6);this.setState({railHidden:true});},showRail:()=>{this.buzz(6);this.setState({railHidden:false});}

// render-vals.js line 470
      sheetGone:S.w<720&&!!S.sheetHidden&&S.screen==='home',sheetHidden:false,sheetTopPx:S.sheetHidden?(S.h+40)+'px':(S.sheetTop??Math.round(S.h*0.3))+'px',railShown:!(S.screen==='home'&&S.railHidden),railHid:false,

// render-vals.js line 471
      toggleRail:()=>{this.buzz(6);this.setState({railCollapsed:!S.railCollapsed});},

// render-vals.js line 472
      logoIn:()=>this.setState({logoHover:true}),logoOut:()=>this.setState({logoHover:false}),

// render-vals.js line 473
      logoBg:lh?'var(--cp-surface-2)':'transparent',logoCur:'pointer',logoMark:lh?'var(--cp-surface)':'var(--cp-pulse)',logoScale:lh?'scale(1.06)':'none',

// render-vals.js line 474
      dotO:lh?0:1,dotS:lh?.4:1,icoO:lh?1:0,icoT:lh?'rotate(0deg) scale(1)':'rotate(-90deg) scale(.5)',sideX:lh?'0':'-6px',

// render-vals.js line 475
      railIcon:S.railCollapsed?'ph-caret-double-right':'ph-caret-double-left',railTip:W>=1100?(S.railCollapsed?'Expand sidebar':'Collapse sidebar'):'Koodal'

// render-vals.js line 478
      meName,meArea,meI,meFirst:meName.split(' ')[0],meVerified:!!me.verified,mePhone:CP.ME.phone,verifiedLine:'Aadhaar e-KYC (mock) · verified '+new Date(me.verifiedAt||now).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}),

// render-vals.js line 480
      goReport:()=>this.go('report',{desc:'',tags:[],tagDraft:'',descMode:'text',voice:'idle',an:null}),

// render-vals.js line 486
      dnav:[['home','Nearby','ph-map-trifold'],['feed','Feed','ph-newspaper'],['search','Search','ph-magnifying-glass'],['cases','Cases','ph-briefcase']].map(([k,l,icon])=>{const on=view===k||(view==='detail'&&S.prev===k);return {l,badge:k==='cases'&&needConfirm?String(needConfirm):'',bp:W>=1100?'static':'absolute',icon:(on?'ph-fill ':'ph-bold ')+icon,bg:on?'var(--cp-surface-2)':'transparent',c:on?'var(--cp-ink)':'var(--cp-ink-3)',go:()=>this.go(k)};}),