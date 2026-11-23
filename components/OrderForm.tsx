"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type City = { id: string; name: string };

export default function OrderForm(props: { productId: number; price: number; sizes: string[]; colors: string[] }) {
  const router = useRouter();
  const [size, setSize] = useState(props.sizes[0] || "");
  const [color, setColor] = useState(props.colors[0] || "");
  const [qty, setQty] = useState(1);
  const [cities, setCities] = useState<City[]>([]);
  const [form, setForm] = useState({ name: "", phone: "", city: "", address: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/ozon/cities").then((r) => r.json()).then(setCities).catch(() => {});
  }, []);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm({ ...form, [k]: e.target.value });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (props.sizes.length && !size) return setError("اختاري المقاس");
    setLoading(true);
    const city = cities.find((c) => c.name === form.city);
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        cityId: city?.id || null,
        items: [{ productId: props.productId, quantity: qty, size, color }],
      }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) return setError(data.error || "وقع مشكل، عاودي المحاولة");
    router.push(`/merci?ref=${encodeURIComponent(data.reference)}`);
  }

  return (
    <form className="order-box" onSubmit={submit}>
      <h3>للطلب عمري المعلومات ديالك 👇</h3>

      {props.sizes.length > 0 && (
        <>
          <strong>المقاس</strong>
          <div className="choice">
            {props.sizes.map((s) => (
              <button type="button" key={s} className={s === size ? "on" : ""} onClick={() => setSize(s)}>{s}</button>
            ))}
          </div>
        </>
      )}
      {props.colors.length > 0 && (
        <>
          <strong>اللون</strong>
          <div className="choice">
            {props.colors.map((c) => (
              <button type="button" key={c} className={c === color ? "on" : ""} onClick={() => setColor(c)}>{c}</button>
            ))}
          </div>
        </>
      )}

      <label className="field"><input required placeholder="الاسم الكامل" value={form.name} onChange={set("name")} /></label>
      <label className="field">
        <input required type="tel" inputMode="tel" placeholder="رقم الهاتف 06XXXXXXXX" value={form.phone} onChange={set("phone")} dir="ltr" style={{ textAlign: "right" }} />
      </label>
      <label className="field">
        <input required list="yn-cities" placeholder="المدينة" value={form.city} onChange={set("city")} autoComplete="off" />
        <datalist id="yn-cities">{cities.map((c) => <option key={c.name} value={c.name} />)}</datalist>
      </label>
      <label className="field"><input required placeholder="العنوان (الحي، الزنقة، الرقم)" value={form.address} onChange={set("address")} /></label>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "6px 0 14px" }}>
        <strong>الكمية</strong>
        <div className="qty">
          <button type="button" onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
          <span>{qty}</span>
          <button type="button" onClick={() => setQty(Math.min(10, qty + 1))}>+</button>
        </div>
      </div>

      {error && <p className="error">{error}</p>}
      <button className="btn brand block" disabled={loading}>
        {loading ? "..." : `اطلبي دابا — ${(props.price * qty).toFixed(0)} درهم`}
      </button>
      <div className="trust">
        <div>🚚<br />توصيل لجميع المدن</div>
        <div>💵<br />الدفع عند الاستلام</div>
        <div>🔄<br />إمكانية التبديل</div>
      </div>
    </form>
  );
}
