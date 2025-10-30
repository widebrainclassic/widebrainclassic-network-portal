import React, { useState, useEffect } from "react";

export default function App() {
  const COMPANIES = [
    "Widebrain Classic",
    "Famesoul",
    "GreenHeart Picture",
    "Tembea Kenya Adventures",
  ];

  const initialForm = {
    fullName: "",
    email: "",
    phone: "",
    company: COMPANIES[0],
    role: "",
    bio: "",
    files: [],
  };

  const [view, setView] = useState("register");
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [members, setMembers] = useState([]);
  const [filterCompany, setFilterCompany] = useState("All");
  const [query, setQuery] = useState("");

  useEffect(() => {
    // fetch members from API if available
    fetch('/api/members').then(r=>r.json()).then(data=>{ if(Array.isArray(data)) setMembers(data) }).catch(()=> {
      const saved = localStorage.getItem("wb_members_v1");
      if (saved) setMembers(JSON.parse(saved));
    });
  }, []);

  useEffect(() => {
    localStorage.setItem("wb_members_v1", JSON.stringify(members));
  }, [members]);

  function handleFileChange(e) {
    const files = Array.from(e.target.files).slice(0, 5);
    const mapped = files.map((f) => ({ name: f.name, size: f.size, type: f.type }));
    setForm((s) => ({ ...s, files: mapped }));
  }

  function validate() {
    const e = {};
    if (!form.fullName.trim()) e.fullName = "Required";
    if (!form.email.trim() || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) e.email = "Valid email required";
    if (!form.phone.trim()) e.phone = "Required";
    if (!form.role.trim()) e.role = "Role or talent required";
    return e;
  }

  async function handleSubmit(ev) {
    ev.preventDefault();
    const v = validate();
    setErrors(v);
    if (Object.keys(v).length > 0) return;

    // try POST to backend
    try {
      const res = await fetch('/api/members', {
        method:'POST',
        headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        const saved = await res.json();
        setMembers(m=> [saved, ...m]);
        setForm(initialForm);
        setView('members');
        return;
      }
    } catch(e) {
      // ignore, fallback to local storage
    }

    const newMember = {
      id: Date.now(),
      ...form,
      registeredAt: new Date().toISOString(),
      verified: false,
    };
    setMembers((m) => [newMember, ...m]);
    setForm(initialForm);
    setView("members");
  }

  function toggleVerify(id) {
    setMembers((m) => m.map((x) => (x._id === id || x.id === id ? { ...x, verified: !x.verified } : x)));
  }

  function deleteMember(id) {
    if (!confirm("Delete this member?")) return;
    setMembers((m) => m.filter((x) => !(x._id === id || x.id === id)));
  }

  function exportCSV() {
    const rows = members.map((m) => [m.fullName, m.email, m.phone, m.company, m.role, m.registeredAt, m.verified]);
    const header = ["Full Name", "Email", "Phone", "Company", "Role", "Registered At", "Verified"];
    const csv = [header, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "widebrain_members.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  const filtered = members.filter((m) => {
    if (filterCompany !== "All" && m.company !== filterCompany) return false;
    if (query && !(`${m.fullName} ${m.email} ${m.role}`.toLowerCase().includes(query.toLowerCase()))) return false;
    return true;
  });

  return (
    <div className="container">
      <header style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12}}>
        <div>
          <h1 style={{margin:0}}>Widebrain Classic Network Portal</h1>
          <div style={{fontSize:13, color:'#6b7280'}}>Multi-company registration for your creative brands</div>
        </div>
        <nav>
          <button onClick={() => setView('register')} style={{marginRight:6}}>Register</button>
          <button onClick={() => setView('members')} style={{marginRight:6}}>Members</button>
          <button onClick={() => setView('admin')}>Admin</button>
        </nav>
      </header>

      {view === 'register' && (
        <section>
          <h2>Member Registration</h2>
          <form onSubmit={handleSubmit} style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
            <div>
              <label>Full name</label>
              <input value={form.fullName} onChange={(e)=> setForm({...form, fullName:e.target.value})} />
              {errors.fullName && <div style={{color:'red', fontSize:12}}>{errors.fullName}</div>}
            </div>
            <div>
              <label>Email</label>
              <input value={form.email} onChange={(e)=> setForm({...form, email:e.target.value})} />
              {errors.email && <div style={{color:'red', fontSize:12}}>{errors.email}</div>}
            </div>
            <div>
              <label>Phone</label>
              <input value={form.phone} onChange={(e)=> setForm({...form, phone:e.target.value})} />
              {errors.phone && <div style={{color:'red', fontSize:12}}>{errors.phone}</div>}
            </div>
            <div>
              <label>Company</label>
              <select value={form.company} onChange={(e)=> setForm({...form, company:e.target.value})}>
                {COMPANIES.map(c=> <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label>Role / Talent</label>
              <input value={form.role} onChange={(e)=> setForm({...form, role:e.target.value})} />
              {errors.role && <div style={{color:'red', fontSize:12}}>{errors.role}</div>}
            </div>
            <div>
              <label>Short bio</label>
              <textarea value={form.bio} onChange={(e)=> setForm({...form, bio:e.target.value})} rows={3} />
            </div>
            <div style={{gridColumn:'1 / span 2'}}>
              <label>Portfolio / Photos (up to 5 files)</label>
              <input type="file" onChange={handleFileChange} multiple />
            </div>
            <div style={{gridColumn:'1 / span 2', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
              <div style={{fontSize:12, color:'#6b7280'}}>By registering you agree to the portal terms (demo)</div>
              <div>
                <button type="button" onClick={()=> setForm(initialForm)}>Reset</button>
                <button type="submit" style={{marginLeft:8}}>Submit registration</button>
              </div>
            </div>
          </form>
        </section>
      )}

      {view === 'members' && (
        <section>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            <h2>Members</h2>
            <div>
              <select value={filterCompany} onChange={(e)=> setFilterCompany(e.target.value)}>
                <option>All</option>
                {COMPANIES.map(c=> <option key={c}>{c}</option>)}
              </select>
              <input placeholder="Search name, email, role" value={query} onChange={(e)=> setQuery(e.target.value)} style={{marginLeft:8}} />
              <button onClick={()=> { setQuery(''); setFilterCompany('All'); }} style={{marginLeft:8}}>Clear</button>
            </div>
          </div>

          <table style={{width:'100%', borderCollapse:'collapse', marginTop:12}}>
            <thead style={{textAlign:'left', borderBottom:'1px solid #e5e7eb'}}>
              <tr>
                <th style={{padding:8}}>Name</th>
                <th>Company</th>
                <th>Role</th>
                <th>Email</th>
                <th>Registered</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && <tr><td colSpan={6} style={{padding:12, textAlign:'center', color:'#6b7280'}}>No members yet</td></tr>}
              {filtered.map(m=> (
                <tr key={m._id || m.id} style={{borderBottom:'1px solid #f3f4f6'}}>
                  <td style={{padding:8}}><div style={{fontWeight:600}}>{m.fullName}</div><div style={{fontSize:12,color:'#6b7280'}}>{m.phone}</div></td>
                  <td>{m.company}</td>
                  <td>{m.role}</td>
                  <td>{m.email}</td>
                  <td>{new Date(m.registeredAt).toLocaleString()}</td>
                  <td>
                    <button onClick={()=> toggleVerify(m._id || m.id)} style={{marginRight:6}}>{m.verified ? 'Verified' : 'Verify'}</button>
                    <button onClick={()=> { navigator.clipboard?.writeText(JSON.stringify(m)); alert('Member copied as JSON to clipboard') }} style={{marginRight:6}}>Copy JSON</button>
                    <button onClick={()=> deleteMember(m._id || m.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {view === 'admin' && (
        <section>
          <h2>Admin Dashboard (Demo)</h2>
          <div style={{display:'flex', gap:12, marginTop:12}}>
            <div style={{padding:12, border:'1px solid #e5e7eb', borderRadius:6}}>
              <div style={{fontSize:12, color:'#6b7280'}}>Total members</div>
              <div style={{fontSize:22, fontWeight:700}}>{members.length}</div>
            </div>
            <div style={{padding:12, border:'1px solid #e5e7eb', borderRadius:6}}>
              <div style={{fontSize:12, color:'#6b7280'}}>Verified</div>
              <div style={{fontSize:22, fontWeight:700}}>{members.filter(m=>m.verified).length}</div>
            </div>
            <div style={{padding:12, border:'1px solid #e5e7eb', borderRadius:6}}>
              <div style={{fontSize:12, color:'#6b7280'}}>Companies</div>
              <div style={{fontSize:22, fontWeight:700}}>{COMPANIES.length}</div>
            </div>
          </div>

          <div style={{marginTop:12}}>
            <button onClick={()=> { if(confirm('Clear all members?')) setMembers([]) }} style={{marginRight:8}}>Clear all</button>
            <button onClick={exportCSV}>Export CSV</button>
          </div>

          <div style={{marginTop:12, fontSize:12, color:'#6b7280'}}>Notes: This is a UI prototype. To persist data online connect to a backend (API + DB) and replace localStorage logic.</div>
        </section>
      )}
    </div>
  );
}