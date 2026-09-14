import type { Meta, StoryObj } from '@storybook/react';
import { MobileHeader } from './MobileHeader';
import type { MobileHeaderProps } from './MobileHeader';

const meta: Meta<typeof MobileHeader> = {
  title: 'Mobile/MobileHeader',
  component: MobileHeader,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Mobile web header as it appears on dubizzle.com.eg at 390px. **Home / Motors** scroll through three states: 1 `full` (tiles with icons, search, location), 2 `minimized` (labels only), 3 `search` (search field only — Motors; Home stops at minimized). **Property** (listing pages) uses the back + search + filter bar header.',
      },
    },
  },
  argTypes: {
    page: { control: 'inline-radio', options: ['home', 'motors', 'property'] },
    state: { control: 'inline-radio', options: ['full', 'minimized', 'search'] },
  },
};
export default meta;

type Story = StoryObj<typeof MobileHeader>;

const frame = (args: Story['args']) => (
  <div style={{ width: 390, background: 'var(--gray-00)' }}>
    <MobileHeader {...(args as MobileHeaderProps)} />
  </div>
);

export const HomeFull: Story = { args: { page: 'home', state: 'full' }, render: frame };
export const HomeMinimized: Story = { args: { page: 'home', state: 'minimized' }, render: frame };
export const HomeSearch: Story = { args: { page: 'home', state: 'search' }, render: frame };
export const MotorsFull: Story = { args: { page: 'motors', state: 'full' }, render: frame };
export const MotorsMinimized: Story = { args: { page: 'motors', state: 'minimized' }, render: frame };
export const MotorsSearch: Story = { args: { page: 'motors', state: 'search' }, render: frame };
export const Property: Story = { args: { page: 'property', adCount: '200,000+ ads' }, render: frame };

export const AllStates: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 390px)', gap: 24, alignItems: 'start' }}>
      {(['home', 'motors'] as const).flatMap((page) =>
        (['full', 'minimized', 'search'] as const).map((state) => (
          <figure key={`${page}-${state}`} style={{ margin: 0 }}>
            <figcaption style={{ font: '12px sans-serif', marginBottom: 4 }}>{`${page} — ${state}`}</figcaption>
            {frame({ page, state })}
          </figure>
        )),
      )}
      <figure style={{ margin: 0 }}>
        <figcaption style={{ font: '12px sans-serif', marginBottom: 4 }}>property — listing header</figcaption>
        {frame({ page: 'property', adCount: '200,000+ ads' })}
      </figure>
    </div>
  ),
};
