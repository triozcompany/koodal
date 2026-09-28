// render-vals.js line 31
    const nav=navDef.map(([k,ic])=>{const on=activeTab===k;return {l:tr[k],icon:(on?'ph-fill ':'ph-bold ')+ic,go:()=>this.go(k,k==='cases'?{}:{}),bg:on&&!mob?'var(--cp-surface-2)':'transparent',c:on?'#fff':'#8a8a8a',badge:k==='cases'&&pend.length?pend.length:null,bp:(desk&&!P.railC)?'static':'absolute'};});

// render-vals.js line 311
    return {...base,showLogin:false,showApp:true,showRail:!mob&&!full,nav,

// render-vals.js line 327
      toggleFull:()=>this.setState(s=>({mapFull:!s.mapFull,mapSel:null})),fullTip:full?'Exit full screen':'Full screen map',fullIcon:full?'ph-arrows-in-simple':'ph-arrows-out-simple',mobChrome:mob,__x:!full,sheetTop:'24%',