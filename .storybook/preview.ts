// .storybook/preview.ts
import type { Preview } from '@storybook/angular';
import { setCompodocJson } from '@storybook/addon-docs/angular';
import docJson from '../documentation.json';
setCompodocJson(docJson);

export const globalTypes = {
  brand: {
    name: 'Brand',
    defaultValue: 'alivi',
    toolbar: {
      icon: 'paintbrush',
      items: [
        { value: 'alivi', title: 'Alivi' },
        { value: 'green', title: 'Green' },
        { value: 'purple', title: 'Purple' },
        { value: 'red', title: 'Red' },
      ],
    },
  },
  mode: {
    name: 'Mode',
    defaultValue: 'light',
    toolbar: {
      icon: 'mirror',
      items: [
        { value: 'light', title: 'Light' },
        { value: 'dark', title: 'Dark' },
      ],
    },
  },
};

const withBrandAndMode = (Story: any, context: any) => {
  const root = document.documentElement;
  root.classList.remove(
    'brand-alivi','brand-green','brand-purple','brand-red',
    'mode-light','mode-dark'
  );
  root.classList.add(`brand-${context.globals.brand}`, `mode-${context.globals.mode}`);
  return Story();
};

const preview: Preview = {
  decorators: [withBrandAndMode],
  parameters: {
    backgrounds: { disable: true },
    controls: {
      matchers: { color: /(background|color)$/i, date: /Date$/i },
    },
  },
};

export default preview;
