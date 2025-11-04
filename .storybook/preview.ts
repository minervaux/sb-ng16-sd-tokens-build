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

// -----------------------------------------------------------
//  Injecta los CSS de la brand y del modo dentro del iframe
// -----------------------------------------------------------
function injectThemeCss(brand: string, mode: string) {
  const iframe = document.getElementById('storybook-preview-iframe') as HTMLIFrameElement;
  if (!iframe?.contentDocument) return;

  const doc = iframe.contentDocument;
  const existing = doc.querySelectorAll('link[data-token-theme]');
  existing.forEach((el) => el.remove());

  const cssFiles = [
    `/styles/tokens/brand-${brand}.css`,
    `/styles/tokens/mode-${mode}.css`,
  ];

  cssFiles.forEach((href) => {
    const link = doc.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.dataset['tokenTheme'] = 'true';
    doc.head.appendChild(link);
  });
}

// -----------------------------------------------------------
//  Actualiza clases HTML y aplica los temas
// -----------------------------------------------------------
const applyGlobals = (globals: any) => {
  const html = document.documentElement;
  html.classList.remove(
    'brand-alivi', 'brand-green', 'brand-purple', 'brand-red',
    'mode-light', 'mode-dark'
  );
  html.classList.add(`brand-${globals.brand || 'alivi'}`);
  html.classList.add(`mode-${globals.mode || 'light'}`);
  injectThemeCss(globals.brand || 'alivi', globals.mode || 'light');
};

const withGlobals = (Story: any, context: any) => {
  applyGlobals(context.globals);
  return Story();
};

export const decorators = [withGlobals];

const preview: Preview = {
  parameters: {
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
    globals: { brand: 'alivi', mode: 'light' },
  },
};

export default preview;
