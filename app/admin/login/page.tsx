"use client";
import { useState } from "react";

export default function Login() {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const r = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: pw }) });
    if (r.ok) window.location.href = "/admin/commandes";
    else setErr((await r.json().catch(() => ({}))).error || "Erreur");
  }
  return (
    <div className="login">
      <form onSubmit={submit}>
        <h2 style={{ letterSpacing: 3, marginTop: 0 }}>YOUNEW <small style={{ fontSize: 11, color: "#888" }}>ADMIN</small></h2>
        {err && <div className="flash err">{err}</div>}
        <input className="in" type="password" placeholder="Mot de passe" value={pw} onChange={(e) => setPw(e.target.value)} autoFocus />
        <button className="ab dark" style={{ width: "100%", justifyContent: "center", marginTop: 12, padding: 11 }}>Se connecter</button>
      </form>
    </div>
  );
}
