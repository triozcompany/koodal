// render-vals.js line 3
    const mob=S.w<720,wide=S.w>=1100;const common={theme,toast:S.toast,ready:S.ready,isMobile:mob,isDesk:!mob,railW:wide?'232px':'76px',railLabels:wide,

// render-vals.js line 103
      sceneStreet:CP.SCENES[S.scene].street,meName:CP.ME.name,meArea:CP.ME.area,mePhone:CP.ME.phone,

// render-vals.js line 148
      meVerified:me.verified,meUnverified:!me.verified,openId:()=>this.setState({idOpen:true,idStep:0,otp:0,afterId:null}),

// render-vals.js line 184
    const meName=me.name||CP.ME.name,meArea=me.area||CP.ME.area,meI=meName.split(' ').filter(Boolean).map(s=>s[0]).join('').slice(0,2).toUpperCase();

// render-vals.js line 277
      pDrawer:S.pDrawer,openDrawer:()=>{this.buzz(8);this.setState({pDrawer:!S.pDrawer});},closeDrawer:()=>this.setState({pDrawer:false}),

// render-vals.js line 278
      goProfilePage:()=>{this.setState({pDrawer:false});this.go('profile');},

// render-vals.js line 279
      drTop:mob?'0':'72px',drLeft:mob?'0':'auto',drRight:mob?'0':'22px',drW:mob?'auto':'360px',drR:mob?'0 0 28px 28px':'22px',drPad:mob?'18px 16px 14px':'14px',drAnim:mob?'cp-drop .38s cubic-bezier(.2,.9,.3,1.05) both':'cp-pop2 .2s ease-out both',drScrim:mob?'var(--cp-scrim)':'transparent',drBlur:mob?'blur(6px) saturate(120%)':'none',

// render-vals.js line 280
      drawerRows:[['ph-camera','My reports','Posts you created',myReports.length,'reports'],['ph-arrow-fat-up','Supported','Reports you back',supported.length,'supported'],['ph-bank','My cases','In the government workflow',myCases.length,'cases'],['ph-clock-counter-clockwise','Activity','Comments, support, updates','','activity'],['ph-gear-six','Settings & theme','Profile, privacy, appearance','','settings']].map(([icon,l,sub,n,k],j)=>({icon,l,sub,n:n===''?'':String(n),d:(j*0.04)+'s',go:()=>{this.buzz(6);this.setState({pDrawer:false});if(k==='settings')this.go('settings',{pName:meName,pArea:meArea});else this.go('profile',{profTab:k});}})),

// render-vals.js line 303
      goProfilePage:()=>{this.setState({pDrawer:false});this.go('profile',{profTab:['reports','supported'].includes(S.profTab)?S.profTab:'reports'});},

// render-vals.js line 312
      drawerRows:X5.drawerRows.filter(r=>!['My cases','Activity'].includes(r.l))

// render-vals.js line 336
      drawerRows:X6.drawerRows.map(r=>r.l==='Supported'?{...r,l:'Activity',sub:'Backed reports & followed cases',n:String(actFeed.length),go:()=>{this.setState({pDrawer:false});this.go('profile',{profTab:'activity'});}}:r.l==='My reports'?{...r,go:()=>{this.setState({pDrawer:false});this.go('profile',{profTab:'reports'});}}:r),

// render-vals.js line 337
      goProfilePage:()=>{this.setState({pDrawer:false});this.go('profile',{profTab:S.profTab==='activity'?'activity':'reports'});},

// render-vals.js line 478
      meName,meArea,meI,meFirst:meName.split(' ')[0],meVerified:!!me.verified,mePhone:CP.ME.phone,verifiedLine:'Aadhaar e-KYC (mock) · verified '+new Date(me.verifiedAt||now).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}),