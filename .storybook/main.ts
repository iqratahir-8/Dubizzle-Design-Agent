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
    // The page templates themselves — Templates/Pages stories frame these exact files, so
    // Storybook and the design kit can never show different versions of a page.
    { from: join(__dirname, '../design-kit/templates'), to: '/templates' },
    // Hand-built templates link ../../tokens and ../../patterns, which resolve to these.
    { from: join(__dirname, '../design-kit/tokens'), to: '/tokens' },
    { from: join(__dirname, '../design-kit/patterns'), to: '/patterns' },
  ],
};

export default config;
