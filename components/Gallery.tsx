"use client";
import { useState } from "react";

export default function Gallery({ images, alt }: { images: string[]; alt: string }) {
  const [i, setI] = useState(0);
  if (!images.length) return <div className="gallery-main" />;
  return (
    <div>
      <div className="gallery-main"><img src={images[i]} alt={alt} /></div>
      {images.length > 1 && (
        <div className="thumbs">
          {images.map((src, k) => (
            <button key={src + k} className={k === i ? "on" : ""} onClick={() => setI(k)} aria-label={`Image ${k + 1}`}>
              <img src={src} alt="" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
