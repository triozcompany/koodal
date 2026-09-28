// render-vals.js line 75
      dept:src=>DEPTS.filter(d=>src.some(r=>r.dn===d[0])).map(d=>({k:d[0],l:d[0],sub:d[1],n:src.filter(r=>r.dn===d[0]).length,icon:d[2]})),

// render-vals.js line 99
    let d=null;const ci=S.cur&&CP.find(S.cur);

// render-vals.js line 107
      d={...r,mosaic:[0,1,2,3,4].map(k=>({gc:k===0?'1':k===1||k===3?'2':'3',gr:k===0?'1 / span 2':k<3?'1':'2',cap:k<st.photos?'photo '+(k+1):'',ang:ang(k),open:openAt(k)})),openAll:()=>this.setState({tour:true}),

// render-vals.js line 330
      galH:desk?'440px':'340px',carN:String((S.carI||0)+1),tourOpen:tab==='case'&&!!S.tour&&!!d,closeTour:()=>this.setState({tour:false}),tourPad:mob?'12px':'24px',dp,