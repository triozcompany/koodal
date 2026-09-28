// render-vals.js line 3
    const mob=S.w<720,wide=S.w>=1100;const common={theme,toast:S.toast,ready:S.ready,isMobile:mob,isDesk:!mob,railW:wide?'232px':'76px',railLabels:wide,

// render-vals.js line 405
    const finish=()=>{CP.act('setMe',{signedIn:true,verified:true,verifiedAt:Date.now(),...(mode==='signup'?{name:(S.auName||'').trim()||CP.ME.name,area:(S.auArea||'').trim()||CP.ME.area,anonDefault:!!S.auAnon}:{})});this.buzz([10,40,20]);this.setState({authStep:'intro',auSlide:0,otpN:0,auAdOk:false});this.go('feed');this.toast(mode==='login'?'Welcome back':'Welcome to Koodal');};

// render-vals.js line 413
    else if(au==='aadhaar'){const ok=ad.length===12&&S.auConsent;priL=S.auAdOk?'Continue':S.auBusy?'Verifying…':'Verify identity';priO=(ok||S.auAdOk)?1:.4;pri=()=>{if(S.auAdOk){this.setState({authStep:'profile'});return;}if(!ok||S.auBusy){this.buzz(14);return;}this.setState({auBusy:true});this.later(()=>{this.setState({auBusy:false,auAdOk:true});this.buzz([10,40,20]);},1100);};}

// render-vals.js line 421
      authOpen:!me.signedIn,auCols:mob?'minmax(0,1fr)':'minmax(0,1.1fr) minmax(0,1fr)',auPad:mob?'16px 20px 24px':'40px 48px',

// render-vals.js line 422
      auIntro:au==='intro',auPhone:au==='phone',auOtp:au==='otp',auAad:au==='aadhaar',auProf:au==='profile',auPerm:au==='perm',

// render-vals.js line 423
      auCanBack:au!=='intro',auBack:()=>{this.buzz(5);const pv=si<=0?'intro':steps[si-1];this.setState({authStep:pv});},auSkip:()=>this.setState({authStep:'phone',authMode:'signup'}),

// render-vals.js line 424
      auProg:au==='intro'?SL.map((x,k)=>({c:k<=sl?'var(--cp-ink)':'var(--cp-line)'})):steps.map((x,k)=>({c:k<=si?'var(--cp-ink)':'var(--cp-line)'})),

// render-vals.js line 425
      auSlides:SL.map((x,k)=>({...x,o:au==='intro'?(k===sl?1:.45):1})),auS:SL[sl],auSlideK:'s'+sl,auArt:mob?'4/4':'16/11',

// render-vals.js line 426
      auPhoneT:mode==='login'?'Welcome back':'What\'s your number?',auPh:ph,onAuPh:e=>this.setState({auPh:e.target.value.replace(/\D/g,'').slice(0,10)}),auPhOk:ph.length===10,auPhBd:ph.length===10?'var(--cp-leaf)':'var(--cp-line)',auFillPh:()=>this.setState({auPh:'9840123456'}),

// render-vals.js line 427
      auPhF:ph.slice(0,5)+' '+ph.slice(5),otpBoxes6:OTPD.split('').map((v,k)=>{const on=k<(S.otpN||0);return {v:on?v:'',bd:on?'var(--cp-ink)':(k===(S.otpN||0)?'var(--cp-pulse)':'var(--cp-line)'),bg:on?'var(--cp-surface-2)':'var(--cp-surface)',an:on?'cp-pop .25s both':'none'};}),

// render-vals.js line 428
      auOtpNote:(S.otpN||0)>=6?'Code auto-filled from SMS':'Reading code from SMS… · Resend in 0:24',

// render-vals.js line 429
      auAdF:ad.replace(/(\d{4})(?=\d)/g,'$1 '),onAuAd:e=>this.setState({auAd:e.target.value.replace(/\D/g,'').slice(0,12),auAdOk:false}),auAdBd:ad.length===12?'var(--cp-leaf)':'var(--cp-line)',auFillAd:()=>this.setState({auAd:'234567891234',auAdOk:false}),

// render-vals.js line 430
      auToggleConsent:()=>{this.buzz(5);this.setState({auConsent:!S.auConsent});},auCBd:S.auConsent?'var(--cp-ink)':'var(--cp-ink-3)',auCBg:S.auConsent?'var(--cp-ink)':'transparent',auCO:S.auConsent?1:0,auAdOk:!!S.auAdOk,

// render-vals.js line 431
      auName:S.auName||'',onAuName:e=>this.setState({auName:e.target.value}),auInit:ini2,auArea:S.auArea||'',onAuArea:e=>this.setState({auArea:e.target.value}),

// render-vals.js line 432
      auAreas:areasA.filter(a=>!aq||a.toLowerCase().includes(aq)).slice(0,12).map(a=>{const on=S.auArea===a;return {l:a,bg:on?'var(--cp-ink)':'var(--cp-surface)',fg:on?'var(--cp-bg)':'var(--cp-ink)',bd:on?'var(--cp-ink)':'var(--cp-line)',pick:()=>{this.buzz(5);this.setState({auArea:a});}};}),

// render-vals.js line 433
      auToggleAnon:()=>{this.buzz(6);this.setState({auAnon:!S.auAnon});},auAnonBg:S.auAnon?'var(--cp-leaf)':'var(--cp-line)',auAnonT:S.auAnon?'translateX(18px)':'none',

// render-vals.js line 434
      auPri:pri,auPriL:priL,auPriO:priO,auSecL:secL,auSec:sec,auBusy:!!S.auBusy,auLegal:au==='phone'||au==='intro',