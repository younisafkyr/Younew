"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function BlockedManager({ list }: { list: { id: number; phone: string; reason: string; date: string }[] }) {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [reason, setReason] = useState("");
  async function add(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/admin/blocked", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ phone, reason }) });
    setPhone(""); setReason("");
    router.refresh();
  }
  async function del(id: number) {
    await fetch(`/api/admin/blocked?id=${id}`, { method: "DELETE" });
    router.refresh();
  }
  return (
    <div className="panel" style={{ maxWidth: 720 }}>
      <form className="row" onSubmit={add} style={{ marginBottom: 12 }}>
        <input className="in" style={{ width: 180 }} required placeholder="06XXXXXXXX" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <input className="in" style={{ flex: 1 }} placeholder="Raison (optionnel)" value={reason} onChange={(e) => setReason(e.target.value)} />
        <button className="ab dark">Bloquer</button>
      </form>
      <table className="t">
        <tbody>
          {list.map((b) => (
            <tr key={b.id}>
              <td className="mono">{b.phone}</td><td>{b.reason}</td><td className="muted">{b.date}</td>
              <td style={{ textAlign: "right" }}><button className="ab" onClick={() => del(b.id)}>Débloquer</button></td>
            </tr>
          ))}
          {!list.length && <tr><td className="muted">Aucun numéro bloqué</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
