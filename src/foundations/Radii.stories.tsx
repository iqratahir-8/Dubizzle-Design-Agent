import type { Meta, StoryObj } from '@storybook/react';
import { FoundationsPage, Section } from './swatch';

const meta: Meta = {
  title: 'Foundations/Radii & Shadows',
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj;

const RADII = [
  ['radius-sm', '0.4rem', 'small elements, pill base'],
  ['radius-md', '0.6rem', 'inputs, buttons, compact ad cards'],
  ['radius-lg', '0.8rem', 'ad cards, sections, filters, modals'],
  ['radius-xl', '1.2rem', 'user dropdown'],
  ['radius-pill', '2rem', 'pills, tags'],
  ['radius-full', '9999px', 'circle'],
] as const;

const SHADOWS = [
  ['shadow-card', 'card at rest'],
  ['shadow-card-hover', 'card hover'],
  ['shadow-dropdown', 'dropdown menus'],
  ['shadow-header', 'sticky header'],
  ['shadow-search-input', 'search field'],
] as const;

export const RadiiAndShadows: Story = {
  render: () => (
    <FoundationsPage title="Radii & Shadows">
      <Section title="Border radius">
        {RADII.map(([name, value, note]) => (
          <div key={name} style={{ width: '15rem' }}>
            <div
              style={{
                height: '8rem',
                background: 'var(--gray-01)',
                border: '1px solid var(--gray-02)',
                borderRadius: `var(--${name})`,
              }}
            />
            <div style={{ fontSize: '1.2rem', fontWeight: 600, marginTop: '0.6rem', fontFamily: 'monospace' }}>
              --{name}
            </div>
            <div style={{ fontSize: '1.1rem', color: 'var(--gray-05)' }}>
              {value} · {note}
            </div>
          </div>
        ))}
      </Section>

      <Section title="Shadows">
        {SHADOWS.map(([name, note]) => (
          <div key={name} style={{ width: '18rem' }}>
            <div
              style={{
                height: '8rem',
                background: 'var(--white)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: `var(--${name})`,
                margin: '0.8rem',
              }}
            />
            <div style={{ fontSize: '1.2rem', fontWeight: 600, marginTop: '0.6rem', fontFamily: 'monospace' }}>
              --{name}
            </div>
            <div style={{ fontSize: '1.1rem', color: 'var(--gray-05)' }}>{note}</div>
          </div>
        ))}
      </Section>
    </FoundationsPage>
  ),
};
