// render-vals.js line 8
    const langOpts=seg([['en','English'],['ta','தமிழ்']],P.lang,k=>this.setP('lang',k));

// render-vals.js line 9
    if(!S.ready)return {ready:false,theme,showLogin:false,showApp:false,toast:S.toast};

// render-vals.js line 19
    const base={theme,tr,toast:S.toast,langOpts,mob,notMob,desk,notDesk:!desk,pad:mob?'18px 16px 28px':`26px ${lp}px 64px`,padX:lp+'px',negPad:-lp+'px',h1:mob?'30px':'38px',h1d:mob?'28px':'36px',kpiMin:mob?'140px':'170px',corpL,me:ME};

// render-vals.js line 22
    if(!S.authed){const lf=(k)=>e=>this.setState({[k]:k==='otp'?e.target.value.replace(/\D/g,'').slice(0,6):e.target.value,lerr:''});

// render-vals.js line 23
      return {...base,showLogin:true,showApp:false,loginCols:desk?'minmax(0,1.1fr) minmax(0,1fr)':'minmax(0,1fr)',loginSide:desk,loginMobHead:!desk,

// render-vals.js line 24
        loginStats:[{v:pend.length,l:'awaiting decision',c:'var(--cp-marigold)'},{v:active.length,l:'active cases',c:'#f5f5f5'},{v:by('closed').length,l:'closed by citizens',c:'var(--cp-leaf)'}],

// render-vals.js line 25
        lId:S.lstep==='id',lOtp:S.lstep==='otp',empId:S.empId,pwd:S.pwd,otp:S.otp,lerr:S.lerr,onEmp:lf('empId'),onPwd:lf('pwd'),onOtp:lf('otp'),

// render-vals.js line 26
        onIdKey:e=>{if(e.key==='Enter')this.signIn();},onOtpKey:e=>{if(e.key==='Enter')this.verifyOtp();},signIn:this.signIn,verifyOtp:this.verifyOtp,otpO:S.otp.length===6?1:.5,backId:()=>this.setState({lstep:'id',lerr:''})};}

// render-vals.js line 311
    return {...base,showLogin:false,showApp:true,showRail:!mob&&!full,nav,