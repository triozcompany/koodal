// render-vals.js line 3
    const mob=S.w<720,wide=S.w>=1100;const common={theme,toast:S.toast,ready:S.ready,isMobile:mob,isDesk:!mob,railW:wide?'232px':'76px',railLabels:wide,

// render-vals.js line 347
      rpOpen:S.rpIdx!=null,closeRp:()=>this.setState({rpIdx:null}),rp:{...rpC,n:rpI+1,total:lk0.length,ai:rpC.by==='Anonymous'?'AN':rpC.by.split(' ').map(s=>s[0]).join('').slice(0,2)},

// render-vals.js line 348
      rpPrev:()=>{if(rpI>0)this.setState({rpIdx:rpI-1});},rpNext:()=>{if(rpI<lk0.length-1)this.setState({rpIdx:rpI+1});},rpPrevO:rpI>0?1:.4,rpNextO:rpI<lk0.length-1?1:.4,

// render-vals.js line 489
      shTop:mob?'auto':'0',shMax:mob?'88%':'100%',shR:mob?'26px 26px 0 0':'0',