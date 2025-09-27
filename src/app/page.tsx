# 1) Go into the repo folder
cd ~/magazinify-ai
git status   # should show "On branch main"

# 2) Create the required Next.js files
mkdir -p src/app
cat > src/app/layout.tsx << 'EOF'
export const metadata = { title: "Magazinify AI™" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>
        {children}
      </body>
    </html>
  );
}
EOF

cat > src/app/page.tsx << 'EOF'
export default function Page() {
  return (
    <main style={{ padding: 24 }}>
      <h1>Magazinify AI™</h1>
      <p>Baseline is live. 🎉</p>
      <p><a href="/api/ok">Health check</a></p>
    </main>
  );
}
EOF

# (Optional) health probe
mkdir -p src/app/api/ok
cat > src/app/api/ok/route.ts << 'EOF'
import { NextResponse } from "next/server";
export async function GET() { return NextResponse.json({ ok: true, ts: Date.now() }); }
EOF

# 3) Commit & push
git add src/app/layout.tsx src/app/page.tsx src/app/api/ok/route.ts 2>/dev/null || git add src/app/*
git commit -m "feat: add App Router baseline (layout/page) + /api/ok"
git push origin main
