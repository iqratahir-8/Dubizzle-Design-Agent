import type { Meta, StoryObj } from '@storybook/react';
import { CandidateCard } from './CandidateCard';

const meta: Meta<typeof CandidateCard> = {
  title: 'Agency Portal/CandidateCard',
  component: CandidateCard,
  tags: ['autodocs'],
  parameters: { docs: { description: { component: 'Applicant card on Candidates, measured on live. Names are fixtures.' } } },
  decorators: [(S) => <div style={{ width: 1312 }}><S /></div>],
  args: { name: 'Mona S.', location: 'Smouha, Alexandria', tags: ['Current Job: Project engineer', 'Experience: 5-10 Years', "Bachelor's Degree"], appliedOn: '16/7/2026', isNew: true },
};
export default meta;
type Story = StoryObj<typeof CandidateCard>;
export const Default: Story = {};
