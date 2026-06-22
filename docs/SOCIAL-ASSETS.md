# Social Assets Workflow

Assets de partage social pour Bentofolio — OG images, LinkedIn cover.

## Fichiers

| Fichier | Dimensions | Usage |
|---|---|---|
| `public/media/social/bentofolio-og-dark.png` | 1200×630 | OG image par défaut (dark) |
| `public/media/social/bentofolio-og-light.png` | 1200×630 | OG image alternative (light) |
| `public/media/social/linkedin-cover.png` | 1600×400 | Bannière LinkedIn |

## Référence dans index.html

L'image dark est utilisée comme référence. Path dans les meta tags :

```html
<meta property="og:image" content="https://sofianbll.dev/media/social/bentofolio-og-dark.png" />
<meta name="twitter:image" content="https://sofianbll.dev/media/social/bentofolio-og-dark.png" />
```

À mettre à jour avec l'URL absolue du déploiement si le domaine change.

## Contenu actuel

Copie sur les assets :

**OG image (dark & light)**
- Eyebrow : Bentofolio | Portfolio
- Nom : Sofian.Bll (dot indigo #6366f1)
- Rôle : Creative Developer | Full Stack Dev
- URL : sofianbll.dev

**LinkedIn cover**
- CV/header-inspired, 1600×400
- Alternance info, role, bio courte

## Règles visuelles Bentofolio

Pour tout nouvel asset social, respecter :

- **Font display** : Syne (weight 800 pour le nom, 600 pour le rôle)
- **Font mono** : JetBrains Mono (labels, URLs)
- **Font body** : SF Pro Display / system-ui (optionnel)
- **Palette dark** : bg `#0a0a0c`, card `rgba(22,22,26,0.65)`, text `#ededef`, text2 `#8a8a96`, border `rgba(255,255,255,0.08)`, brand `#6366f1`
- **Palette light** : bg `#f0f0f3`, card `#ffffff`, text `#111113`, text2 `#6b6b76`, border `#dcdce0`, brand `#6366f1`
- **Mesh background** : reprendre les radial gradients exacts de `app/styles.css` (dark: blue + purple blobs, light: gray blobs)
- **Card style** : `border-radius: 14px`, `backdrop-filter: blur(14px)`, border subtil, padding proportionnel
- **Pas de** : grid overlay inventé, pills tech sur OG, taglines longues, contenu dans une petite box centrée — le contenu doit remplir l'image

## Process de génération

Pour (re)générer un asset social :

1. Créer un fichier HTML/CSS temporaire aux dimensions exactes (ex: `/tmp/og-dark.html`)
2. Reprendre les tokens visuels ci-dessus, pas d'invention
3. Rendre avec Playwright :

```js
const { chromium } = require('playwright');
const browser = await chromium.launch();
const page = await browser.newPage();
await page.setViewportSize({ width: 1200, height: 630 });
await page.goto('file:///tmp/og-dark.html', { waitUntil: 'networkidle' });
await page.waitForTimeout(3000); // laisser les webfonts charger
await page.screenshot({ path: 'output.png', clip: { x: 0, y: 0, width: 1200, height: 630 } });
await browser.close();
```

4. Vérifier les dimensions :

```bash
sips -g pixelWidth -g pixelHeight output.png
```

5. Copier dans `public/media/social/`

## Futur

Idées d'intégration dans Bentofolio :
- Génération automatique depuis l'admin (bouton "Generate OG image")
- Pull du nom/rôle/bio depuis `DATA.profile`
- Toggle dark/light
- Réutilisation des tokens CSS live du site
