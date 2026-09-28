// render-vals.js line 299
      regionPill:{l:f.region==='near'?'Velachery':f.region,open:()=>{this.buzz(6);this.setState({locOpen:true});}},locOpen:!!S.locOpen,locOpenM:mob&&!!S.locOpen,locOpenD:!mob&&!!S.locOpen,locScrim:mob?'var(--cp-scrim)':'transparent',closeLoc:()=>this.setState({locOpen:false}),

// render-vals.js line 300
      locRows:RG.map(x=>{const on=f.region===x[0];const n=D.issues.filter(i=>x[0]==='near'?(i.city==='Chennai'&&i.km<=1.5):i.city===x[0]).length;return {l:x[1],sub:x[2]+' · '+n+' issues',icon:x[3],on,bg:on?'var(--cp-surface-2)':'transparent',bd:on?'2px solid var(--cp-ink)':'1px solid var(--cp-line)',ibg:on?'var(--cp-pulse)':'var(--cp-surface-2)',ifg:on?'#fff':'var(--cp-ink)',pick:()=>{this.buzz([6,20,6]);this.setState(s=>({f:{...s.f,region:x[0]},locOpen:false}));}};}),

// render-vals.js line 370
      locQ:S.locQ||'',onLocQ:e=>this.setState({locQ:e.target.value}),clearLocQ:()=>this.setState({locQ:''}),locNone:!locF.length,

// render-vals.js line 371
      locRows:locF.slice(0,40).map(x=>{const on=curK===x.k;return {l:x.l,sub:x.sub,icon:x.icon,on,bg:on?'var(--cp-surface-2)':'transparent',bd:on?'2px solid var(--cp-ink)':'1px solid var(--cp-line)',ibg:on?'var(--cp-pulse)':'var(--cp-surface-2)',ifg:on?'#fff':'var(--cp-ink)',pick:()=>{this.buzz([6,20,6]);this.setState(s=>({f:{...s.f,region:x.region},fArea:x.area,locOpen:false,locQ:'',panX:0,panY:0}));}};}),