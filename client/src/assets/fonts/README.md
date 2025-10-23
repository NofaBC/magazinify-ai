# Magazinify AI Fonts

This directory contains custom fonts used in the Magazinify AI application.

## Default Font

The primary font used in the application is **Inter**, which is loaded from Google Fonts in the index.html file:
```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
```

## Using Custom Fonts

To add a custom font to the application:

1. Place the font files (.woff, .woff2, etc.) in this directory
2. Create a CSS file in the `../styles` directory to define the font-face
3. Import the CSS file in your component

Example:
```css
@font-face {
  font-family: 'CustomFont';
  src: url('../fonts/CustomFont.woff2') format('woff2'),
       url('../fonts/CustomFont.woff') format('woff');
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}
```

## Included Fonts

(Currently using Google Fonts only. Add any bundled custom fonts here.)
