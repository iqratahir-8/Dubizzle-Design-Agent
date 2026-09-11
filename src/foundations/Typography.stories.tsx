import type { CSSProperties } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { FoundationsPage, Section } from './swatch';

const meta: Meta = {
  title: 'Foundations/Typography',
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj;

const SIZES = [
  ['xs', '--text-xs', '1.2rem'],
  ['sm', '--text-sm', '1.4rem'],
  ['md', '--text-md', '1.6rem'],
  ['lg', '--text-lg', '1.8rem'],
  ['xl', '--text-xl', '2rem'],
  ['2xl', '--text-2xl', '2.4rem'],
  ['3xl', '--text-3xl', '3.2rem'],
] as const;

const WEIGHTS = [
  ['Thin', '--weight-thin', 100],
  ['Light', '--weight-light', 300],
  ['Regular', '--weight-regular', 400],
  ['Semibold', '--weight-semibold', 600],
  ['Bold', '--weight-bold', 700],
  ['Black', '--weight-black', 900],
] as const;

export const AllTypography: Story = {
  render: () => (
    <FoundationsPage title="Typography">
      <p style={{ color: 'var(--gray-05)', fontSize: '1.4rem' }}>
        Proxima Nova (LTR) / GESS (Arabic, RTL). Base unit is 1rem = 10px, matching the codebase convention.
      </p>

      <Section title="Font size scale">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', width: '100%' }}>
          {SIZES.map(([, varName, px]) => (
            <div key={varName} style={{ display: 'flex', alignItems: 'baseline', gap: '1.6rem' }}>
              <span style={{ width: '16rem', fontSize: '1.2rem', color: 'var(--gray-05)', fontFamily: 'monospace' }}>
                {varName} ({px})
              </span>
              <span style={{ fontSize: `var(${varName})`, fontWeight: 600 }}>Post your ad in minutes</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Font weights">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', width: '100%' }}>
          {WEIGHTS.map(([name, varName, value]) => (
            <div key={varName} style={{ display: 'flex', alignItems: 'baseline', gap: '1.6rem' }}>
              <span style={{ width: '16rem', fontSize: '1.2rem', color: 'var(--gray-05)', fontFamily: 'monospace' }}>
                {varName} ({value})
              </span>
              <span style={{ fontSize: '1.8rem', fontWeight: `var(${varName})` } as CSSProperties}>{name} weight</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Arabic (GESS)">
        <span style={{ fontFamily: 'var(--font-arabic)', fontSize: '2rem', fontWeight: 700 }}>
          استكشف أكبر سوق في مصر
        </span>
      </Section>
    </FoundationsPage>
  ),
};
