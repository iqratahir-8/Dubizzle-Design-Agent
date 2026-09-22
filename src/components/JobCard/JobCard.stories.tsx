import type { Meta, StoryObj } from '@storybook/react';
import { JobCard } from './JobCard';

const meta: Meta<typeof JobCard> = {
  title: 'Agency Portal/JobCard',
  component: JobCard,
  tags: ['autodocs'],
  parameters: { docs: { description: { component: 'Job selector card on Candidates. Repo `agencyJobCard.tsx`; measured on live.' } } },
  args: { title: 'Civil Engineer', location: 'Abd Al Aziz Al Taqi St., Amreya, Alexandria', workplace: 'On Site', expires: '12 Aug 2026', candidates: 13, newCandidates: 13, selected: true },
};
export default meta;
type Story = StoryObj<typeof JobCard>;
export const Selected: Story = {};
export const Resting: Story = { args: { title: 'Software Engineer', location: '6th District, Nasr City, Cairo', workplace: 'Hybrid', expires: '15 Aug 2026', candidates: 1, newCandidates: 1, selected: false } };
