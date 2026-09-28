// render-vals.js line 6
    const tr=T[P.lang]||T.en;

// render-vals.js line 19
    const base={theme,tr,toast:S.toast,langOpts,mob,notMob,desk,notDesk:!desk,pad:mob?'18px 16px 28px':`26px ${lp}px 64px`,padX:lp+'px',negPad:-lp+'px',h1:mob?'30px':'38px',h1d:mob?'28px':'36px',kpiMin:mob?'140px':'170px',corpL,me:ME};

// render-vals.js line 31
    const nav=navDef.map(([k,ic])=>{const on=activeTab===k;return {l:tr[k],icon:(on?'ph-fill ':'ph-bold ')+ic,go:()=>this.go(k,k==='cases'?{}:{}),bg:on&&!mob?'var(--cp-surface-2)':'transparent',c:on?'#fff':'#8a8a8a',badge:k==='cases'&&pend.length?pend.length:null,bp:(desk&&!P.railC)?'static':'absolute'};});

// render-vals.js line 311
    return {...base,showLogin:false,showApp:true,showRail:!mob&&!full,nav,

// render-vals.js line 312
      railW:desk&&!P.railC?'236px':'76px',railLabels:desk&&!P.railC,toggleRail:()=>{if(desk)this.setP('railC',!P.railC);},logoIn:()=>this.setState({logoH:true}),logoOut:()=>this.setState({logoH:false}),railTip:!desk?'Koodal':P.railC?'Expand sidebar':'Collapse sidebar',logoBg:S.logoH&&desk?'#141414':'transparent',logoCur:desk?'pointer':'default',markO:desk&&P.railC&&S.logoH?0:1,markS:desk&&P.railC&&S.logoH?.4:1,sideO:desk&&P.railC&&S.logoH?1:0,sideS:desk&&P.railC&&S.logoH?1:.4,collO:S.logoH?1:.5,

// render-vals.js line 313
      goSettings:()=>this.go('settings'),goProfile:()=>this.go('profile'),setBg:tab==='settings'&&!mob?'var(--cp-surface-2)':'transparent',setC:tab==='settings'?'#fff':'#8a8a8a',profBg:tab==='profile'?'var(--cp-surface-2)':'transparent',