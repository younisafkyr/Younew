import Link from "next/link";
import { waLink } from "@/components/WhatsAppButton";

export const metadata = { title: "Merci" };

export default async function Merci({ searchParams }: { searchParams: Promise<{ ref?: string }> }) {
  const { ref } = await searchParams;
  return (
    <div className="container">
      <div className="thanks">
        <div className="check">✓</div>
        <h1>شكراً! توصلنا بالطلب ديالك</h1>
        <p>غادي نتاصلو بيك فأقرب وقت باش نأكدو الطلب.</p>
        {ref && <p>رقم الطلب: <strong dir="ltr">{ref}</strong></p>}
        <p style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", marginTop: 24 }}>
          <a className="btn brand" href={waLink(`السلام، درت طلب رقم ${ref || ""}`)} target="_blank" rel="noopener">أكدي فالواتساب</a>
          <Link className="btn" href="/">رجوع للمتجر</Link>
        </p>
      </div>
    </div>
  );
}
