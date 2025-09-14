import dynamic from 'next/dynamic';

const Aladin = dynamic(() => import('@/components/Aladin'), {
  ssr: false,
});

export default function HomePage() {
  return (
    <main style={{ display: 'flex', height: '100vh' }}>
      <aside style={{ width: '200px', borderRight: '1px solid #ccc' }}>
        <h2>Sidebar</h2>
      </aside>
      <section style={{ flex: 1 }}>
        <Aladin />
      </section>
    </main>
  );
}
