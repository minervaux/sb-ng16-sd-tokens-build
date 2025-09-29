# SbNg16Scss

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 16.2.16.

A quick guide to add Storybook to an Angular 16 project and align TypeScript for compatibility.

1) Install Storybook
Use the specific version you need:

npx storybook@8.4.16 init --type angular

This generates the .storybook/ folder and sample stories.

2) Pin a Compatible TypeScript Version
Angular 16 supports up to TypeScript 5.1.x. Install and pin:

npm install --save-dev typescript@5.1.6

Then update your tsconfig.json:

{
  "compilerOptions": {
    "skipLibCheck": true
  }
}


This prevents type conflicts (e.g., Webpack/Node types) during Storybook builds.

3) Run Storybook

npm run storybook

(If the script wasn’t added, run npx storybook dev -p 6006.)

Notes
Ensure you run the init command from the Angular workspace root (where angular.json lives).
If you use a different Node/TS combo, keep TypeScript ≤ 5.1.x for Angular 16 to avoid build/type errors.

Tokens + Style Dictionary Setup
1. Install Style Dictionary
Use version 4.x (works with Node 20):

npm i -D style-dictionary@4.1.2

2. Tokens folder
Export tokens from Figma (multiple files) and place them in the project root.

3. Style Dictionary config:

Create scripts/build-tokens.mjs

4. Build tokens
npm run tokens:build