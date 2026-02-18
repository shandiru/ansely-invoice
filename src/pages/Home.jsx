import { useState, useRef, useEffect } from "react";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DEPOSITS = {
  "React Lite": ["React Lite – Deposit 1","React Lite – Deposit 2","React Lite – Deposit 3"],
  "React Pro":  ["React Pro – Deposit 1","React Pro – Deposit 2","React Pro – Deposit 3"],
};
const C = {
  orange:"#E8621A", navy:"#1A263C", light:"#FDF6F1",
  border:"#E8D5C4", grey:"#F4F1EE", white:"#FFFFFF"
};

function MultiDropdown({ label, options, selected, onToggle }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  return (
    <div ref={ref} style={{ position:"relative", marginBottom:10 }}>
      <div onClick={()=>setOpen(o=>!o)} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 16px", borderRadius:10, cursor:"pointer", userSelect:"none", border:`2px solid ${open ? C.orange : C.border}`, background:C.white }}>
        <span style={{ fontSize:13, color:selected.length?C.navy:"#aaa", fontWeight:selected.length?600:400 }}>
          {selected.length===0?`Select ${label}...`:`${selected.length} selected`}
        </span>
        <span style={{ fontSize:10, color:"#aaa", transition:"0.2s", transform:open?"rotate(180deg)":"none" }}>▼</span>
      </div>
      {open && (
        <div style={{ position:"absolute", top:"calc(100% + 4px)", left:0, right:0, zIndex:999, background:C.white, borderRadius:10, border:`2px solid ${C.orange}`, boxShadow:"0 8px 24px rgba(0,0,0,0.12)", overflow:"hidden" }}>
          {options.map(opt => {
            const on = selected.includes(opt);
            return (
              <div key={opt} onClick={()=>onToggle(opt)} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 14px", cursor:"pointer", background:on?C.light:C.white, borderBottom:`1px solid ${C.grey}` }}>
                <div style={{ width:18, height:18, borderRadius:5, flexShrink:0, border:`2px solid ${on?C.orange:"#ccc"}`, background:on?C.orange:C.white, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  {on && <span style={{ color:C.white, fontSize:11, fontWeight:900 }}>✓</span>}
                </div>
                <span style={{ fontSize:13, fontWeight:on?700:400, color:on?C.navy:"#555" }}>{opt}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function AnselyInvoice() {
  const [invoiceNo,setInvoiceNo]=useState(""); const [date,setDate]=useState(""); const [custName,setCustName]=useState(""); const [custAddr,setCustAddr]=useState(""); const [activeTab,setActiveTab]=useState("Monthly");
  const [selMonths,setSelMonths]=useState([]); const [selLite,setSelLite]=useState([]); const [selPro,setSelPro]=useState([]);
  const [lineItems,setLineItems]=useState([]);
  const [discountPercent, setDiscountPercent] = useState("");

  const nextId=useRef(1); const getId=()=>String(nextId.current++);
  const inp=(ex={})=>({ border:`1px solid ${C.border}`,borderRadius:6,padding:"6px 10px",fontSize:13,outline:"none",background:C.white,...ex });
  const catColor=cat=>cat==="Monthly"?C.navy:cat==="React Lite"?"#B34A10":cat==="React Pro"?C.orange:"#888";

  const toggleMonth = (m) => {
    setSelMonths(prev => {
      const isSelected = prev.includes(m);
      if (isSelected) {
        setLineItems(li => li.filter(x => !(x.label === `Monthly – ${m}` && !x.manual)));
        return prev.filter(x => x !== m);
      } else {
        setLineItems(li => {
          const alreadyExists = li.some(x => x.label === `Monthly – ${m}` && !x.manual);
          if (alreadyExists) return li;
          return [...li, { id: getId(), label: `Monthly – ${m}`, category: "Monthly", qty: 1, amount: "", manual: false }];
        });
        return [...prev, m];
      }
    });
  };

  const toggleLite = (lbl) => {
    setSelLite(prev => {
      const isSelected = prev.includes(lbl);
      if (isSelected) {
        setLineItems(li => li.filter(x => !(x.label === lbl && !x.manual)));
        return prev.filter(x => x !== lbl);
      } else {
        setLineItems(li => {
          const alreadyExists = li.some(x => x.label === lbl && !x.manual);
          if (alreadyExists) return li;
          return [...li, { id: getId(), label: lbl, category: "React Lite", qty: 1, amount: "", manual: false }];
        });
        return [...prev, lbl];
      }
    });
  };

  const togglePro = (lbl) => {
    setSelPro(prev => {
      const isSelected = prev.includes(lbl);
      if (isSelected) {
        setLineItems(li => li.filter(x => !(x.label === lbl && !x.manual)));
        return prev.filter(x => x !== lbl);
      } else {
        setLineItems(li => {
          const alreadyExists = li.some(x => x.label === lbl && !x.manual);
          if (alreadyExists) return li;
          return [...li, { id: getId(), label: lbl, category: "React Pro", qty: 1, amount: "", manual: false }];
        });
        return [...prev, lbl];
      }
    });
  };

  const updateItem=(id,field,value)=>setLineItems(prev=>prev.map(item=>item.id===id?{...item,[field]:value}:item));
  const removeItem=id=>{
    const item=lineItems.find(x=>x.id===id); if(!item)return;
    if(!item.manual){
      if(item.category==="Monthly")setSelMonths(p=>p.filter(x=>x!==item.label.replace("Monthly – ","")));
      else if(item.category==="React Lite")setSelLite(p=>p.filter(x=>x!==item.label));
      else if(item.category==="React Pro")setSelPro(p=>p.filter(x=>x!==item.label));
    }
    setLineItems(prev=>prev.filter(x=>x.id!==id));
  };
  const addManualItem=()=>setLineItems(prev=>[...prev,{id:getId(),label:"",category:activeTab,qty:1,amount:"",manual:true}]);

  const subtotal = lineItems.reduce((s,l)=>s+(parseFloat(l.amount)||0)*(parseFloat(l.qty)||1),0);
  const discountAmount = subtotal * ((parseFloat(discountPercent) || 0) / 100);
  const finalTotal = subtotal - discountAmount;

  const handleDownload=()=>{
    const s=document.createElement("script");
    s.src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
    s.onload=()=>{
      const {jsPDF}=window.jspdf;
      const doc=new jsPDF({unit:"mm",format:"a4"});
      const W=210, H=297, margin=18;

      doc.setFillColor(255,255,255);
      doc.rect(0,0,W,H,"F");

      doc.setFillColor(245,185,122); 
      doc.circle(W+10, -10, 70, "F");
      doc.setFillColor(248,210,170);
      doc.circle(W+8, -8, 52, "F");

      doc.setFont("helvetica","bold");
      doc.setFontSize(30);
      doc.setTextColor(232,98,26);
      doc.text("ANSELY", margin, 22);

      doc.setFontSize(26);
      doc.setFont("helvetica","bold");
      doc.setTextColor(26,38,60);
      doc.text("INVOICE", W-margin, 20, {align:"right"});

      doc.setFontSize(10);
      doc.setFont("helvetica","normal");
      doc.setTextColor(80,80,80);
      doc.text(`Number: ${invoiceNo||"—"}`, W-margin, 28, {align:"right"});
      doc.text(`Date: ${date||"—"}`, W-margin, 34, {align:"right"});
      doc.text(`Name: ${custName||"—"}`, W-margin, 40, {align:"right"});
      doc.text(`Address: ${custAddr||"—"}`, W-margin, 46, {align:"right"});

      doc.setDrawColor(220,220,220);
      doc.setLineWidth(0.4);
      doc.line(margin, 54, W-margin, 54);
      let y = 62;
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(26, 38, 60);
      
      doc.text("PAYABLE TO", margin, y);
      doc.text("BANK DETAILS", margin + 150, y);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(70, 70, 70);
      doc.setFontSize(10);
      doc.text("Ansely Digital", margin, y + 7);

      const bankX = margin + 172;
      doc.text("Ansely Digital", bankX, y + 7,{align:"right"});
      doc.text("Sort code: 04-00-03", bankX, y + 13,{align:"right"});
      doc.text("Account number: 10369354", bankX, y + 19,{align:"right"});
      
      y = 96;
      doc.setFillColor(232,98,26);
      doc.roundedRect(margin, y, W-margin*2, 11, 3, 3, "F");
      doc.setFillColor(245,164,80);
      doc.roundedRect(W/2, y, W/2-margin, 11, 3, 3, "F");

      doc.setFontSize(8);
      doc.setFont("helvetica","bold");
      doc.setTextColor(255,255,255);
      doc.text("ITEM DESCRIPTION", margin+4, y+7.5);
      doc.text("QTY", margin+115, y+7.5, {align:"center"});
      doc.text("TOTAL", W-margin-4, y+7.5, {align:"right"});

      y += 15;
      doc.setFontSize(10);
      lineItems.forEach((item, idx) => {
        if (y > 230) { doc.addPage(); y = 20; }
        if (idx % 2 === 0) {
          doc.setFillColor(252,248,245);
          doc.rect(margin, y-5, W-margin*2, 11, "F");
        }
        doc.setFont("helvetica","normal");
        doc.setTextColor(51,51,51);
        doc.text(item.label||"(custom item)", margin+4, y+1.5);
        doc.setTextColor(100,100,100);
        doc.text(String(item.qty||1), margin+115, y+1.5, {align:"center"});
        const lt = (parseFloat(item.amount)||0)*(parseFloat(item.qty)||1);
        doc.setFont("helvetica","bold");
        doc.setTextColor(26,38,60);
        doc.text(`£${lt.toFixed(2)}`, W-margin-4, y+1.5, {align:"right"});
        y += 12;
      });

      // Percentage Discount in PDF
      if (parseFloat(discountPercent) > 0) {
        y += 4;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text("Subtotal:", W - margin - 52, y);
        doc.text(`£${subtotal.toFixed(2)}`, W - margin - 4, y, { align: "right" });
        y += 7;
        doc.setTextColor(232, 98, 26);
        doc.text(`Discount (${discountPercent}%):`, W - margin - 52, y);
        doc.text(`-£${discountAmount.toFixed(2)}`, W - margin - 4, y, { align: "right" });
        y += 8;
      } else {
        y += 10;
      }

      doc.setFillColor(26,38,60);
      doc.roundedRect(W-margin-70, y-6, 70, 14, 3, 3, "F");
      doc.setFontSize(10);
      doc.setFont("helvetica","bold");
      doc.setTextColor(255,255,255);
      doc.text("TOTAL:", W-margin-52, y+4);
      doc.setTextColor(232,98,26);
      doc.setFontSize(13);
      doc.text(`£${finalTotal.toFixed(2)}`, W-margin-4, y+4, {align:"right"});

      doc.setFillColor(245, 185, 122);
      doc.rect(0, H - 34, W, 6, "F"); 
      doc.setFillColor(26, 38, 60);
      doc.roundedRect(margin, H - 22, W - margin * 2, 14, 5, 5, "F");
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(255, 255, 255);
      const footerY = H - 13;
      doc.text("07380909597       www.ansely.co.uk", W / 2, footerY, { align: "center" });

      doc.save(`Ansely-Invoice-${invoiceNo || "draft"}.pdf`);
    };
    document.head.appendChild(s);
  };

  return (
    <div style={{ minHeight:"100vh",background:"#F0EBE5",fontFamily:"Arial,sans-serif",padding:"24px 12px" }}>
      <div style={{ maxWidth:820,margin:"0 auto",background:C.white,borderRadius:18,boxShadow:"0 10px 48px rgba(0,0,0,0.12)" }}>
        <div style={{ height:6,background:`linear-gradient(90deg,${C.orange},#F5A450)`,borderRadius:"18px 18px 0 0" }}/>

        <div style={{ padding:"26px 32px 0",display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:16 }}>
          <div>
            <div style={{ fontSize:36,fontWeight:900,color:C.orange,letterSpacing:4,lineHeight:1 }}>ANSELY</div>
            <div style={{ fontSize:11,color:"#bbb",marginTop:3 }}>Ansely Digital</div>
          </div>
          <div>
            <div style={{ fontSize:30,fontWeight:900,color:C.navy,letterSpacing:4,textAlign:"right",marginBottom:10 }}>INVOICE</div>
            {[{lbl:"Number",val:invoiceNo,set:setInvoiceNo,type:"text",w:90},{lbl:"Date",val:date,set:setDate,type:"date",w:150},{lbl:"Name",val:custName,set:setCustName,type:"text",w:150,ph:"Customer Name"},{lbl:"Address",val:custAddr,set:setCustAddr,type:"text",w:170,ph:"Address"}].map(({lbl,val,set,type,w,ph})=>(
              <div key={lbl} style={{ display:"flex",alignItems:"center",gap:6,fontSize:12,color:"#666",marginBottom:6,justifyContent:"flex-end" }}>
                <span style={{ fontWeight:700 }}>{lbl}:</span>
                <input type={type} value={val} onChange={e=>set(e.target.value)} placeholder={ph} style={inp({width:w})}/>
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding:"18px 32px 0",display:"flex",gap:48,flexWrap:"wrap" }}>
          <div><div style={{ fontSize:10,fontWeight:800,color:C.navy,letterSpacing:1,marginBottom:4 }}>PAYABLE TO</div><div style={{ fontSize:13,color:"#444" }}>Ansely Digital</div></div>
          <div><div style={{ fontSize:10,fontWeight:800,color:C.navy,letterSpacing:1,marginBottom:4 }}>BANK DETAILS</div>
            <div style={{ fontSize:12,color:"#444",lineHeight:1.9 }}><div>Ansely Digital</div><div>Sort code: 04-00-03</div><div>Account number: 10369354</div></div>
          </div>
        </div>

        <div style={{ margin:"20px 32px 0",background:C.light,border:`1px solid ${C.border}`,borderRadius:14,padding:"16px 20px" }}>
          <div style={{ fontSize:11,fontWeight:800,color:C.navy,letterSpacing:1,marginBottom:12 }}>ADD ITEMS TO INVOICE</div>
          <div style={{ display:"flex",gap:6,marginBottom:14 }}>
            {["Monthly","React Lite","React Pro"].map(t=>(
              <button key={t} onClick={()=>setActiveTab(t)} style={{ padding:"7px 18px",borderRadius:22,fontWeight:700,fontSize:12,cursor:"pointer",border:"none",background:activeTab===t?catColor(t):C.grey,color:activeTab===t?C.white:"#888",boxShadow:activeTab===t?`0 3px 12px ${catColor(t)}55`:"none" }}>{t}</button>
            ))}
          </div>
          {activeTab==="Monthly"&&<MultiDropdown label="months" options={MONTHS} selected={selMonths} onToggle={toggleMonth}/>}
          {activeTab==="React Lite"&&<MultiDropdown label="deposits" options={DEPOSITS["React Lite"]} selected={selLite} onToggle={toggleLite}/>}
          {activeTab==="React Pro"&&<MultiDropdown label="deposits" options={DEPOSITS["React Pro"]} selected={selPro} onToggle={togglePro}/>}
        </div>

        <div style={{ padding:"16px 32px 0" }}>
          <div style={{ background:`linear-gradient(90deg,${C.orange},#F5A450)`,borderRadius:10,padding:"10px 16px",display:"grid",gridTemplateColumns:"3fr 1.2fr 0.7fr 1.2fr 36px",gap:8,alignItems:"center" }}>
            <span style={{ color:C.white,fontWeight:800,fontSize:10,letterSpacing:1 }}>ITEM DESCRIPTION</span>
            <span style={{ color:C.white,fontWeight:800,fontSize:10,letterSpacing:1 }}>CATEGORY</span>
            <span style={{ color:C.white,fontWeight:800,fontSize:10,letterSpacing:1,textAlign:"center" }}>QTY</span>
            <span style={{ color:C.white,fontWeight:800,fontSize:10,letterSpacing:1,textAlign:"right" }}>AMOUNT (£)</span>
            <span/>
          </div>
        </div>

        <div style={{ padding:"4px 32px 0" }}>
          {lineItems.length===0?(
            <div style={{ textAlign:"center",color:"#ccc",fontSize:13,padding:"28px 0" }}>No items selected</div>
          ):lineItems.map((item,idx)=>(
            <div key={item.id} style={{ display:"grid",gridTemplateColumns:"3fr 1.2fr 0.7fr 1.2fr 36px",gap:8,alignItems:"center",padding:"8px 4px",borderBottom:`1px solid ${C.grey}`,background:idx%2===0?C.white:"#FDFAF8" }}>
              {item.manual?(<input value={item.label} onChange={e=>updateItem(item.id,"label",e.target.value)} placeholder="Item description..." style={inp({width:"100%",fontSize:13})}/>):(<span style={{ fontSize:13,color:"#333",fontWeight:500 }}>{item.label}</span>)}
              {item.manual?(
                <select value={item.category} onChange={e=>updateItem(item.id,"category",e.target.value)} style={inp({fontSize:11,padding:"5px 6px",width:"100%"})}>
                  <option>Monthly</option><option>React Lite</option><option>React Pro</option>
                </select>
              ):(
                <span style={{ display:"inline-block",fontSize:10,fontWeight:700,color:C.white,background:catColor(item.category),borderRadius:20,padding:"3px 8px",whiteSpace:"nowrap" }}>{item.category}</span>
              )}
              <input type="number" min="1" value={item.qty} onChange={e=>updateItem(item.id,"qty",e.target.value)} style={inp({width:"100%",textAlign:"center",fontWeight:600})}/>
              <div style={{ display:"flex",alignItems:"center",gap:4 }}>
                <span style={{ color:"#aaa",fontSize:12,flexShrink:0 }}>£</span>
                <input type="number" min="0" step="0.01" placeholder="0.00" value={item.amount} onChange={e=>updateItem(item.id,"amount",e.target.value)} style={inp({flex:1,textAlign:"right",fontWeight:700,color:C.navy,fontSize:14,minWidth:0})}/>
              </div>
              <div onClick={()=>removeItem(item.id)} style={{ width:26,height:26,borderRadius:"50%",background:"#fee2e2",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:16,color:"#ef4444",fontWeight:900 }}>×</div>
            </div>
          ))}

          <div style={{ padding:"12px 0 6px" }}>
            <button onClick={addManualItem} style={{ display:"flex",alignItems:"center",gap:8,background:"transparent",border:`2px dashed ${C.orange}`,borderRadius:10,padding:"10px 20px",cursor:"pointer",color:C.orange,fontWeight:700,fontSize:13,width:"100%",justifyContent:"center" }}>
              <span style={{ fontSize:20 }}>+</span> Add Item Manually
            </button>
          </div>
        </div>

        <div style={{ padding:"8px 32px 0",display:"flex",justifyContent:"flex-end" }}>
          <div style={{ width:310 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"4px 18px", fontSize:13 }}>
               <span style={{ fontWeight:700, color:"#666" }}>Discount (%):</span>
               <div style={{ display:"flex", alignItems:"center", gap:4 }}>
                  <input type="number" value={discountPercent} onChange={e=>setDiscountPercent(e.target.value)} placeholder="0" style={inp({ width:80, textAlign:"right", fontWeight:700, color:C.orange })} />
                  <span style={{ fontWeight:900, color:C.orange }}>%</span>
               </div>
            </div>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:8,background:C.navy,borderRadius:12,padding:"14px 18px" }}>
              <span style={{ color:C.white,fontWeight:800,fontSize:13,letterSpacing:1 }}>TOTAL:</span>
              <span style={{ color:C.orange,fontWeight:900,fontSize:24 }}>£{finalTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div style={{ marginTop:40,background:"linear-gradient(180deg,#F5B97A,#F5D0A8)",height:20 }}/>
        <div style={{ background:C.navy,margin:"0 20px 20px",borderRadius:30,padding:"14px 28px",display:"flex",justifyContent:"center",gap:48,alignItems:"center" }}>
          <span style={{ color:C.white,fontSize:13 }}>📞 07380909597</span>
          <span style={{ color:C.white,fontSize:13 }}>🌐 www.ansely.co.uk</span>
        </div>
      </div>

      <div style={{ textAlign:"center",marginTop:24 }}>
        <button onClick={handleDownload} style={{ background:`linear-gradient(90deg,${C.orange},#F5A450)`,color:C.white,border:"none",borderRadius:30,padding:"14px 52px",fontSize:15,fontWeight:800,letterSpacing:2,cursor:"pointer",boxShadow:"0 4px 20px rgba(232,98,26,0.4)" }}>
          ↓ DOWNLOAD PDF
        </button>
      </div>
    </div>
  );
}