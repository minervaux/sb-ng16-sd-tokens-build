// .storybook/preview.ts
import type { Preview } from '@storybook/angular';
import { setCompodocJson } from '@storybook/addon-docs/angular';
import docJson from '../documentation.json';
setCompodocJson(docJson);

export const globalTypes = {
  brand: {
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
    toolbar: {
      icon: 'contrast',
      items: [
        { value: 'light', title: 'Light' },
        { value: 'dark', title: 'Dark' },
      ],
    },
  },
};

const applyGlobals = (globals: any) => {
  const html = document.documentElement;
  html.classList.remove(
    'brand-alivi','brand-green','brand-purple','brand-red',
    'mode-light','mode-dark'
  );
  html.classList.add(`brand-${globals?.brand || 'red'}`);
  html.classList.add(`mode-${globals?.mode || 'light'}`);
};

// 👇 sin imports raros; sin implicit-any
const withGlobals = (Story: any, context: any) => {
  applyGlobals(context.globals);
  return Story();
};

export const decorators = [withGlobals];

const preview: Preview = {
  parameters: {
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
    globals: { brand: 'red', mode: 'light' },
  },
};

export default preview;
