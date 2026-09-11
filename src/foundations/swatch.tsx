import type { CSSProperties, ReactNode } from 'react';

const page: CSSProperties = { fontFamily: 'var(--font-primary)', color: 'var(--gray-06)' };
const sectionTitle: CSSProperties = {
  fontSize: '1.8rem',
  fontWeight: 700,
  marginBottom: '1.2rem',
  marginTop: '3.2rem',
};
const grid: CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: '1.2rem' };

export function FoundationsPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div style={page}>
      <h1 style={{ fontSize: '2.4rem', fontWeight: 700, marginBottom: '0.4rem' }}>{title}</h1>
      {children}
    </div>
  );
}

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 style={sectionTitle}>{title}</h2>
      <div style={grid}>{children}</div>
    </section>
  );
}

export function ColorSwatch({ name, varName, hex }: { name: string; varName: string; hex: string }) {
  return (
    <div style={{ width: '13.2rem' }}>
      <div
        style={{
          height: '6.4rem',
          borderRadius: 'var(--radius-md)',
          background: `var(${varName})`,
          border: '1px solid var(--gray-02)',
        }}
      />
      <div style={{ fontSize: '1.2rem', fontWeight: 600, marginTop: '0.6rem' }}>{name}</div>
      <div style={{ fontSize: '1.1rem', color: 'var(--gray-05)', fontFamily: 'monospace' }}>{varName}</div>
      <div style={{ fontSize: '1.1rem', color: 'var(--gray-04)', fontFamily: 'monospace' }}>{hex}</div>
    </div>
  );
}
