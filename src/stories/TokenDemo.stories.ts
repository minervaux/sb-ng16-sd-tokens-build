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
        /* ====== Card & layout ====== */
        .token-card {
          background: var(--color-surface-surface-primary, #fff);
          color: var(--color-text-text-primary, #111);
          border: 1px solid var(--color-border-border-primary, #d0d0d0);
          padding: 24px;
          border-radius: var(--radius-md, 8px);
          margin: 24px;
          box-shadow: 0 1px 0 rgba(0,0,0,.04);
          font-family: var(--text-font-family-primary, Lato, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial);
          font-size: var(--text-size-body-medium, 16px);
          line-height: 1.5;
        }

        .hstack { display: flex; align-items: center; gap: 12px; margin-top: 12px; }
        .label  { width: 240px; opacity: .85; font-size: var(--text-size-body-small, 14px); }
        .swatch {
          width: 64px; height: 32px; border-radius: 8px;
          border: 1px solid var(--color-border-border-primary, #0002);
          box-shadow: inset 0 0 0 1px #00000014;
          flex: 0 0 auto;
        }
        .value {
          font-family: var(--text-font-family-secondary, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New");
          font-size: var(--text-size-tag, 12px);
          opacity: .85;
        }

        /* ====== Brand-aware button (demuestra brand + mode) ====== */
        .token-button {
          background: var(--surface-brand-primary);
          border: 2px solid var(--brand-secondary-100, transparent);
          box-shadow: 0 0 0 3px var(--brand-primary-opacity-10, transparent);
          color: var(--color-text-text-brand-primary, #fff);
          padding: 8px 12px;
          border-radius: var(--radius-sm, 6px);
          cursor: pointer;
          font-weight: var(--text-font-weight-700-bold, 700);
        }

        /* ====== Mini guía tipográfica con tokens semánticos ====== */
        .typo { display: grid; gap: 8px; margin-top: 16px; }
        .h1 {
          font-size: var(--text-size-desktop-h1, 54px);
          font-weight: var(--text-font-weight-700-bold, 700);
          letter-spacing: .2px;
        }
        .h2 {
          font-size: var(--text-size-desktop-h2, 32px);
          font-weight: var(--text-font-weight-700-bold, 700);
        }
        .body-lg  { font-size: var(--text-size-body-large, 18px); }
        .body-md  { font-size: var(--text-size-body-medium, 16px); }
        .body-sm  { font-size: var(--text-size-body-small, 14px); }
        .mono    {
          font-family: var(--text-font-family-secondary, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New");
          font-size: var(--text-size-tag, 12px);
        }
      </style>

      <div class="token-card">
        <p>Brand &amp; Mode toggles are applied on <code>&lt;html&gt;</code>.</p>

        <button class="token-button">Hello tokens</button>

        <!-- Brand colors -->
        <div class="hstack">
          <div class="label">brand-primary</div>
          <div class="swatch" style="background: var(--brand-primary)"></div>
          <div class="value" data-token="--brand-primary"></div>
        </div>
        <div class="hstack">
          <div class="label">brand-secondary-100</div>
          <div class="swatch" style="background: var(--brand-secondary-100)"></div>
          <div class="value" data-token="--brand-secondary-100"></div>
        </div>
        <div class="hstack">
          <div class="label">brand-tertiary</div>
          <div class="swatch" style="background: var(--brand-tertiary)"></div>
          <div class="value" data-token="--brand-tertiary"></div>
        </div>

        <!-- Surface / text sample -->
        <div class="hstack">
          <div class="label">surface-primary</div>
          <div class="swatch" style="background: var(--color-surface-surface-primary)"></div>
          <div class="value" data-token="--color-surface-surface-primary"></div>
        </div>
        <div class="hstack">
          <div class="label">text-primary sample</div>
          <div style="
            padding: 4px 8px;
            background: var(--color-surface-surface-primary);
            color: var(--color-text-text-primary);
            border: 1px solid var(--color-border-border-primary);
            border-radius: 6px;">
            Sample text
          </div>
        </div>

        <!-- Typography with tokens -->
        <div class="typo">
          <div class="h1">Desktop H1</div>
          <div class="h2">Desktop H2</div>
          <div class="body-lg">Body large — primary family</div>
          <div class="body-md mono">Code sample — secondary/mono family</div>
        </div>

        <!-- Expose font families -->
        <div class="hstack">
          <div class="label">font-family primary</div>
          <div class="value" data-token="--text-font-family-primary"></div>
        </div>
        <div class="hstack">
          <div class="label">font-family secondary</div>
          <div class="value" data-token="--text-font-family-secondary"></div>
        </div>
      </div>
    `,
  }),
  /** Pinta el valor efectivo de cada var (útil para verificar Brand/Mode/Familias) */
  play: async ({ canvasElement }) => {
  const getVar = (name: string) =>
    getComputedStyle(document.documentElement).getPropertyValue(name).trim();

    canvasElement.querySelectorAll<HTMLElement>('[data-token]').forEach((el) => {
    // ✅ usar acceso por corchetes en dataset
    const varName = (el.dataset?.['token'] as string) ?? '';
    el.textContent = getVar(varName) || '(no value)';
    });
  },
};
