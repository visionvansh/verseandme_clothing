// src/components/LayoutWrapper.tsx
"use client";

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="min-h-screen bg-black relative overflow-hidden">
        <div className="fixed inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#2b1e1e]/25 via-black to-[#1a0f0b]/15" />
          <div
            className="absolute inset-0 opacity-[0.15]"
            style={{
              backgroundImage: `
                linear-gradient(rgba(226, 194, 153, 0.35) 1px, transparent 1px),
                linear-gradient(90deg, rgba(226, 194, 153, 0.35) 1px, transparent 1px)
              `,
              backgroundSize: "60px 60px",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-transparent" />
        </div>

        {children}
      </div>

      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:wght@400;600;700;800&display=swap");

        ::-webkit-scrollbar {
          width: 10px;
        }

        ::-webkit-scrollbar-track {
          background: #1a0f0b;
        }

        ::-webkit-scrollbar-thumb {
          background: #e2c299;
          border-radius: 5px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: #d4b589;
        }

        html {
          scroll-behavior: smooth;
        }

        body {
          background: black;
        }
      `}</style>
    </>
  );
}