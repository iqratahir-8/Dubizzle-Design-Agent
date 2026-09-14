import type { StorybookConfig } from '@storybook/react-vite';
import { join } from 'node:path';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-essentials'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  staticDirs: [
    { from: join(__dirname, '../src/assets'), to: '/assets' },
    // design-kit icons, for stories that show real category imagery (QuickLinks)
    { from: join(__dirname, '../design-kit/icons'), to: '/icons' },
  ],
};

export default config;
