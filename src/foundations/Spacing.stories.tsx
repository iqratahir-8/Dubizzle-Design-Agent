import type { Meta, StoryObj } from '@storybook/react';
import { FoundationsPage, Section } from './swatch';

const meta: Meta = {
  title: 'Foundations/Spacing',
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj;

const SPACING = [
  ['space-0', '0', '0px'],
  ['space-1', '0.4rem', '4px'],
  ['space-2', '0.8rem', '8px — content padding'],
  ['space-3', '1.2rem', '12px'],
  ['space-4', '1.6rem', '16px — primary'],
  ['space-5', '2rem', '20px — section margin'],
  ['space-6', '2.4rem', '24px — large'],
  ['space-7', '3.2rem', '32px'],
  ['space-8', '4rem', '40px'],
  ['space-9', '4.8rem', '48px'],
  ['space-10', '6.4rem', '64px'],
] as const;

export const AllSpacing: Story = {
  render: () => (
    <FoundationsPage title="Spacing">
      <p style={{ color: 'var(--gray-05)', fontSize: '1.4rem' }}>4px base unit.</p>
      <Section title="Scale">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
          {SPACING.map(([name, value, note]) => (
            <div key={name} style={{ display: 'flex', alignItems: 'center', gap: '1.6rem' }}>
              <span style={{ width: '9rem', fontSize: '1.2rem', fontFamily: 'monospace', color: 'var(--gray-06)' }}>
                --{name}
              </span>
              <span style={{ width: '6rem', fontSize: '1.2rem', color: 'var(--gray-05)' }}>{note}</span>
              <span style={{ height: '1.6rem', width: value, background: 'var(--red-05)', borderRadius: '0.2rem' }} />
            </div>
          ))}
        </div>
      </Section>
    </FoundationsPage>
  ),
};
