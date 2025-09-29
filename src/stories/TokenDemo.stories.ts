import type { Meta, StoryObj } from '@storybook/angular';

const meta: Meta = {
  title: 'Tokens/Live demo',
};
export default meta;

type Story = StoryObj;

export const Playground: Story = {
  render: () => ({
    template: `
      <style>
        .token-card {
          background: var(--color-surface-surface-primary, #eee);
          color: var(--color-text-text-primary, #111);
          border: 1px solid var(--color-border-border-primary, #ccc);
          padding: var(--spacing-primitives-2x, 12px);
          border-radius: var(--radius-md, 8px);
          margin: 16px;
        }
        .row { display: flex; align-items: center; gap: 12px; margin-top: 10px; }
        .label { width: 230px; opacity: .85; font-size: 12px; }
        .swatch {
          width: 64px; height: 32px; border-radius: 6px;
          border: 1px solid var(--color-border-border-primary, #0003);
          box-shadow: inset 0 0 0 1px #00000014;
        }
        .value { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12px; opacity: .8; }
        .token-button {
          /* BRAND TOKENS — cambian con el selector de Brand */
          background: var(--brand-primary, rebeccapurple);
          border: 2px solid var(--brand-secondary-100, transparent);
          box-shadow: 0 0 0 3px var(--brand-primary-opacity-10, transparent);
          /* MODE TOKENS — cambian con el selector de Mode */
          color: var(--color-text-text-primary-invert, #fff);
          padding: var(--spacing-primitives-1x, 8px) var(--spacing-primitives-2x, 12px);
          border-radius: var(--radius-sm, 6px);
          cursor: pointer;
        }
      </style>

      <div class="token-card">
        <p>Brand &amp; Mode toggles are applied on <code>&lt;html&gt;</code>.</p>
        <button class="token-button">Hello tokens</button>

        <div class="row">
          <div class="label">brand-primary</div>
          <div class="swatch" style="background: var(--brand-primary)"></div>
          <div class="value" data-token="--brand-primary"></div>
        </div>
        <div class="row">
          <div class="label">brand-secondary-100</div>
          <div class="swatch" style="background: var(--brand-secondary-100)"></div>
          <div class="value" data-token="--brand-secondary-100"></div>
        </div>
        <div class="row">
          <div class="label">brand-tertiary</div>
          <div class="swatch" style="background: var(--brand-tertiary)"></div>
          <div class="value" data-token="--brand-tertiary"></div>
        </div>

        <div class="row">
          <div class="label">surface-primary</div>
          <div class="swatch" style="background: var(--color-surface-surface-primary)"></div>
          <div class="value" data-token="--color-surface-surface-primary"></div>
        </div>
        <div class="row">
          <div class="label">text-primary sample</div>
          <div style="
            padding: 4px 8px;
            background: var(--color-surface-surface-primary);
            color: var(--color-text-text-primary);
            border: 1px solid var(--color-border-border-primary);
            border-radius: 6px;"
          >Sample text</div>
        </div>
      </div>
    `,
  }),
  // Muestra los valores efectivos de las vars (útil para ver que sí cambia con el Brand/Mode)
  play: async ({ canvasElement }) => {
    const getVar = (name: string) =>
      getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    canvasElement.querySelectorAll<HTMLElement>('[data-token]').forEach(el => {
      const varName = (el as HTMLElement).dataset['token'] ?? '';
      el.textContent = getVar(varName) || '(no value)';
    });
  },
};
