import type { Meta, StoryObj } from '@storybook/react';
import { ColorSwatch, FoundationsPage, Section } from './swatch';

const meta: Meta = {
  title: 'Foundations/Colors',
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj;

const RED = [
  ['Red 01', '--red-01', '#fef5f5'],
  ['Red 02', '--red-02', '#fbe0e0'],
  ['Red 03', '--red-03', '#f6b3b3'],
  ['Red 04', '--red-04', '#f08080'],
  ['Red 05 (Primary)', '--red-05', '#e00000'],
  ['Red 06', '--red-06', '#ba0000'],
  ['Red 07', '--red-07', '#930100'],
] as const;

const GRAY = [
  ['Gray 00', '--gray-00', '#f6f6f6'],
  ['Gray 01', '--gray-01', '#f0f0f0'],
  ['Gray 02', '--gray-02', '#e0e0e0'],
  ['Gray 03', '--gray-03', '#dadbdb'],
  ['Gray 04', '--gray-04', '#919395'],
  ['Gray 05', '--gray-05', '#464c55'],
  ['Gray 06', '--gray-06', '#23262a'],
  ['Gray 07', '--gray-07', '#17191c'],
] as const;

const BLUE = [
  ['Blue 01', '--blue-01', '#f7fafe'],
  ['Blue 02', '--blue-02', '#e7f1fd'],
  ['Blue 03', '--blue-03', '#c4dbfa'],
  ['Blue 04', '--blue-04', '#85b5f5'],
  ['Blue 05', '--blue-05', '#3a88ef'],
  ['Blue 06', '--blue-06', '#0f5dc4'],
  ['Blue 07', '--blue-07', '#173660'],
] as const;

const YELLOW = [
  ['Yellow 01', '--yellow-01', '#fefbf5'],
  ['Yellow 02', '--yellow-02', '#fff5da'],
  ['Yellow 03', '--yellow-03', '#ffe8ad'],
  ['Yellow 04', '--yellow-04', '#faca73'],
  ['Yellow 05', '--yellow-05', '#ffba3c'],
  ['Yellow 06', '--yellow-06', '#e39e00'],
  ['Yellow 07', '--yellow-07', '#9f6e00'],
] as const;

const GREEN = [
  ['Green 01', '--green-01', '#f8fcf7'],
  ['Green 02', '--green-02', '#e8f7e8'],
  ['Green 03', '--green-03', '#c7ebc5'],
  ['Green 05', '--green-05', '#059e00'],
  ['Green 06', '--green-06', '#137310'],
] as const;

const SEMANTIC = [
  ['Primary', '--color-primary', '#e00000'],
  ['Primary Hover', '--color-primary-hover', '#ba0000'],
  ['Secondary', '--color-secondary', '#3a88ef'],
  ['Success', '--color-success', '#059e00'],
  ['Warning', '--color-warning', '#ffba3c'],
  ['Error', '--color-error', '#e00000'],
  ['Info', '--color-info', '#3a88ef'],
] as const;

function Palette(rows: readonly (readonly [string, string, string])[]) {
  return (
    <>
      {rows.map(([name, varName, hex]) => (
        <ColorSwatch key={varName} name={name} varName={varName} hex={hex} />
      ))}
    </>
  );
}

export const AllColors: Story = {
  render: () => (
    <FoundationsPage title="Colors">
      <p style={{ color: 'var(--gray-05)', fontSize: '1.4rem' }}>
        Red-primary palette with supporting Gray, Blue, Yellow, and Green scales. Every component consumes these
        through the semantic aliases below rather than the raw scale.
      </p>
      <Section title="Semantic aliases">{Palette(SEMANTIC)}</Section>
      <Section title="Red — primary">{Palette(RED)}</Section>
      <Section title="Gray — neutral">{Palette(GRAY)}</Section>
      <Section title="Blue">{Palette(BLUE)}</Section>
      <Section title="Yellow">{Palette(YELLOW)}</Section>
      <Section title="Green">{Palette(GREEN)}</Section>
    </FoundationsPage>
  ),
};
