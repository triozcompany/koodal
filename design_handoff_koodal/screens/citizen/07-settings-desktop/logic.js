// render-vals.js line 67
      resetDemo:()=>{CP.act('reset');this.setState({f:{region:'near',cat:[],stage:[],sev:[]},q:'',an:null,mountTs:Date.now()});this.go('home',{cur:SHOW});this.toast('Demo reset');},

// render-vals.js line 103
      sceneStreet:CP.SCENES[S.scene].street,meName:CP.ME.name,meArea:CP.ME.area,mePhone:CP.ME.phone,

// render-vals.js line 184
    const meName=me.name||CP.ME.name,meArea=me.area||CP.ME.area,meI=meName.split(' ').filter(Boolean).map(s=>s[0]).join('').slice(0,2).toUpperCase();

// render-vals.js line 280
      drawerRows:[['ph-camera','My reports','Posts you created',myReports.length,'reports'],['ph-arrow-fat-up','Supported','Reports you back',supported.length,'supported'],['ph-bank','My cases','In the government workflow',myCases.length,'cases'],['ph-clock-counter-clockwise','Activity','Comments, support, updates','','activity'],['ph-gear-six','Settings & theme','Profile, privacy, appearance','','settings']].map(([icon,l,sub,n,k],j)=>({icon,l,sub,n:n===''?'':String(n),d:(j*0.04)+'s',go:()=>{this.buzz(6);this.setState({pDrawer:false});if(k==='settings')this.go('settings',{pName:meName,pArea:meArea});else this.go('profile',{profTab:k});}})),

// render-vals.js line 437
      setToggles:[tg(!!me.anonDefault,'anon','Post anonymously by default','Neighbours won\'t see your name','ph-detective',()=>CP.act('setMe',{anonDefault:!me.anonDefault})),

// render-vals.js line 442
      langSeg:[['en','English'],['ta','தமிழ்']].map(([k,l])=>{const on=(S.lang||'en')===k;return {l,bg:on?'var(--cp-surface)':'transparent',sh:on?'0 1px 2px rgb(0 0 0 / .1)':'none',pick:()=>{this.buzz(5);this.setState({lang:k});if(k==='ta')this.toast('Tamil interface coming soon');}};}),

// render-vals.js line 443
      pEditOpen:!!S.pEdit,togglePEdit:()=>{this.buzz(5);this.setState({pEdit:!S.pEdit,pName:meName,pArea:meArea});},pEditL:S.pEdit?'Close':'Edit',pEditIcon:S.pEdit?'ph-x':'ph-pencil-simple',

// render-vals.js line 444
      saveProfile:()=>{CP.act('setMe',{name:S.pName.trim()||meName,area:S.pArea.trim()||meArea});this.buzz([8,30,8]);this.setState({pEdit:false});this.toast('Profile saved');},

// render-vals.js line 445
      logout:()=>{this.buzz([10,30,10]);CP.act('setMe',{signedIn:false});this.setState({authStep:'intro',auSlide:0,authMode:'login',pDrawer:false});},

// render-vals.js line 446
      deleteAcct:()=>{this.buzz(14);this.toast('Demo: account deletion needs OTP confirmation');},helpT:()=>this.toast('Help centre · support@koodal.in'),aboutT:()=>this.toast('Koodal v1.0 · made in Tamil Nadu'),

// render-vals.js line 478
      meName,meArea,meI,meFirst:meName.split(' ')[0],meVerified:!!me.verified,mePhone:CP.ME.phone,verifiedLine:'Aadhaar e-KYC (mock) · verified '+new Date(me.verifiedAt||now).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}),

// render-vals.js line 479
      goProfile:()=>this.go('profile'),goSettings:()=>this.go('settings',{pName:meName,pArea:meArea}),profBack:()=>this.goBack(),

// render-vals.js line 485
      deskFeed:!mob&&view==='feed',deskSearch:!mob&&view==='search',deskSettings:!mob&&view==='settings',

// render-vals.js line 510
      pName:S.pName,pArea:S.pArea,onPName:e=>this.setState({pName:e.target.value}),onPArea:e=>this.setState({pArea:e.target.value}),

// render-vals.js line 511
      saveProfile:()=>{CP.act('setMe',{name:S.pName.trim()||meName,area:S.pArea.trim()||meArea});this.buzz([8,30,8]);this.toast('Profile saved');},