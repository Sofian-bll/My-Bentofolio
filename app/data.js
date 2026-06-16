/* =============================================
   BENTOFOLIO — DATA (ES module)
   ============================================= */

const personalInfo = {
    firstName: 'Sofian',
    lastName: 'BELLOUL',
    role: 'Développeur Web Full Stack',
    bio: `Designer Framer reconverti dev — Laravel, Vue.js, Java. Mon TDAH me pousse à tout optimiser : workflows, archis complexes, et en ce moment ma transition vers un workflow full terminal. Je suis aussi à l'aise à monter une API REST qu'à mixer devant 1 200 personnes.`,
    alternance: { start: 'sept. 2026', duration: '14 mois', rythme: '6/2 sem.' },
  };

  const contactInfos = [
    { key: 'Âge', value: '22 ans' },
    { key: 'Localisation', value: 'Île-de-France' },
    { key: 'Téléphone', value: '07 67 54 62 09' },
    { key: 'Email', value: 'sofian.belloul@epitech.eu' },
  ];

  const socialLinks = [
    { icon: 'linkedin', label: 'in/sofianbll', href: 'https://www.linkedin.com/in/sofianbll/' },
    { icon: 'github', label: 'Sofian-bll', href: 'https://github.com/Sofian-bll' },
  ];

  const skillGroups = [
    { category: 'Dev Web', skills: [
      { label: 'PHP / Laravel', tech: 'laravel' }, { label: 'Vue 3 / Vite', tech: 'vue' },
      { label: 'Java SE', tech: 'java' }, { label: 'Go', tech: 'go' },
      { label: 'Tailwind', tech: 'tailwind' }, { label: 'shadcn-vue', tech: 'shadcn' },
      { label: 'MySQL', tech: 'mysql' },
    ]},
    { category: 'DevOps', skills: [
      { label: 'Docker / Sail', tech: 'docker' }, { label: 'Git / GitHub', tech: 'git' },
      { label: 'Linux (Arch)', tech: 'linux' }, { label: 'CI/CD', tech: 'bash' },
      { label: 'SOPS / Age', tech: 'sops' },
    ]},
    { category: 'Design & IA', skills: [
      { label: 'Figma', tech: 'figma' }, { label: 'Framer', tech: 'framer' },
      { label: 'Blender', tech: 'blender' }, { label: 'Three.js', tech: 'three' },
      { label: 'Python', tech: 'python' }, { label: 'RAG / LLMs', tech: 'rag' },
      { label: 'n8n', tech: 'n8n' },
    ]},
    { category: 'Outils & CLI', skills: [
      { label: 'Bash / Shell', tech: 'bash' }, { label: 'Neovim / tmux', tech: 'nvim' },
      { label: 'SSH', tech: 'linux' },
    ]},
    { category: 'Soft Skills', skills: [
      { label: 'Prise de parole', tech: 'soft' }, { label: 'Vulgarisation', tech: 'soft' },
      { label: 'Leadership', tech: 'soft' },
    ]},
  ];

  const formations = [
    {
      title: 'Développeur-Intégrateur Web', badge: 'BAC+2 RNCP',
      where: 'Web@cademie by EPITECH — Paris · Depuis 2024',
      description: 'Java, PHP Laravel, Vue 3. Pédagogie par projets. Prise de parole et présentations professionnelles.',
    },
  ];

  const interests = [
    { emoji: '🎧', title: 'DJ & Producteur', detail: '+100k écoutes · Live devant +1 200 pers.' },
    { emoji: '⌨️', title: 'CLI & Productivité', detail: 'Arch, Neovim, tmux, PKM Obsidian' },
    { emoji: '🔬', title: 'Science', detail: 'Physique quantique, cybersécurité' },
  ];

  /* ─── CATEGORIES ─── */
  const categories = {
    dev:        { label: 'Dev',        color: 'var(--cat-dev)',        glyph: 'code' },
    webdesign:  { label: 'Webdesign',  color: 'var(--cat-webdesign)',  glyph: 'layout' },
    '3d':       { label: '3D',         color: 'var(--cat-3d)',         glyph: 'cube' },
    animation:  { label: 'Animation',  color: 'var(--cat-animation)',  glyph: 'play' },
    logo:       { label: 'Logo & Charte', color: 'var(--cat-logo)',    glyph: 'pen' },
    tooling:    { label: 'Outils',     color: 'var(--cat-tooling)',    glyph: 'tool' },
    devops:     { label: 'DevOps',     color: 'var(--cat-devops)',     glyph: 'server' },
  };

  /* ─── PROJECTS ─── (rich schema) */
  const projects = [
    {
      id: 'connect-in', name: "Connect'IN", categories: ['dev'], featured: true,
      techs: [{ label: 'Laravel', tech: 'laravel' }, { label: 'Sanctum', tech: 'laravel' }, { label: 'MySQL', tech: 'mysql' }, { label: 'Vue 3', tech: 'vue' }],
      role: 'Binôme', period: '2025', duration: '3 sem.',
      description: 'Réseau social full-stack — API REST Laravel, auth Sanctum, relations SQL, tests unitaires.',
      highlights: [
        'API REST sécurisée par tokens Sanctum (auth, fil d\u2019actualité).',
        'Relations many-to-many (follows, likes) sous MySQL avec tests.',
        'Architecture full-stack Laravel + Vue 3 pensée pour scaler.',
      ],
      caseStudy: 'Réseau social complet : authentification par tokens Sanctum, fil d\u2019actualité, relations many-to-many (follows, likes), et une suite de tests unitaires couvrant les endpoints critiques. Frontend Vue 3 avec composants shadcn-vue.',
      demoUrl: '', repoUrl: 'https://github.com/Sofian-bll',
    },
    {
      id: 'connect-in-java', name: "Connect'IN V2", categories: ['dev'], featured: true,
      techs: [{ label: 'Java', tech: 'java' }, { label: 'Vue 3', tech: 'vue' }, { label: 'MySQL', tech: 'mysql' }],
      role: 'Binôme', period: '2026', duration: '3 sem.',
      description: 'Réseau social — réécriture complète de Connect\u2019IN en Java avec le même frontend Vue 3.',
      highlights: [
        'Migration complète du backend Laravel vers Java.',
        'Mêmes fonctionnalités : auth, follows, likes, fil d\u2019actualité.',
        'Architecture fullstack Java + Vue 3.',
      ],
      caseStudy: 'Deuxième itération du réseau social Connect\u2019IN, porté de Laravel (PHP) vers Java. Fonctionnalités identiques (authentification, fil d\u2019actualité, follows, likes) réimplémentées dans une stack Java + Vue 3.',
      demoUrl: '', repoUrl: 'https://github.com/Sofian-bll',
    },
    {
      id: 'my-cinema', name: 'My Cinema', categories: ['dev'], featured: true,
      techs: [{ label: 'PHP MVC', tech: 'rag' }, { label: 'MySQL', tech: 'mysql' }, { label: 'Vue 3', tech: 'vue' }],
      role: 'Solo', period: '2025', duration: '2 sem.',
      description: 'Framework MVC maison from scratch — SoftDeletes, anti-chevauchement, back-office cinéma.',
      highlights: [
        'Framework MVC complet développé sans aucune dépendance externe.',
        'Suppression logique (SoftDeletes) et algorithme anti-chevauchement.',
        'Frontend Vue 3 + Tailwind, back-office de gestion de séances.',
      ],
      caseStudy: 'Back-office de gestion de séances de cinéma avec un framework MVC conçu from scratch. Aucune dépendance — routing, ORM, templating, SoftDeletes et algorithme anti-chevauchement des séances par salle.',
      demoUrl: '', repoUrl: 'https://github.com/Sofian-bll',
    },
    {
      id: 'piscine-java', name: 'Piscine Java', categories: ['dev'], featured: true,
      techs: [{ label: 'Java SE', tech: 'java' }],
      role: 'Solo', period: '2025', duration: '2 sem.',
      description: 'Design Patterns, Génériques, Réflexion, framework de test maison.',
      highlights: [
        'Design patterns classiques (Factory, Observer, Strategy\u2026).',
        'Programmation générique avec introspection par réflexion.',
        'Framework de test unitaire construit de A à Z.',
      ],
      caseStudy: 'Bootcamp intensif Java : implémentation de design patterns classiques, programmation générique, introspection par réflexion, et un framework de test maison complet.',
      demoUrl: '', repoUrl: 'https://github.com/Sofian-bll',
    },
    {
      id: 'freelance-web', name: 'Freelance Web', categories: ['webdesign', 'dev'], featured: true,
      techs: [{ label: 'Framer', tech: 'framer' }, { label: 'Shopify', tech: 'shopify' }],
      role: 'Indépendant', period: '2022 – 2024', duration: '2 ans',
      description: 'Sites e-commerce et vitrines haut de gamme, Shopify × Framer.',
      highlights: [
        'Sites vitrines et e-commerce haut de gamme conçus et intégrés.',
        'Direction artistique et prototypage sous Framer.',
        'Boutiques Shopify sur-mesure livrées sur 2 ans d\u2019activité.',
      ],
      caseStudy: 'Deux ans d\u2019activité freelance : conception et intégration de sites vitrines et e-commerce haut de gamme. Direction artistique, prototypage Framer, et boutiques Shopify sur-mesure.',
      demoUrl: '', repoUrl: '',
    },
    {
      id: 'klivio', name: 'Klivio', categories: ['webdesign'], featured: false,
      techs: [{ label: 'Tailwind', tech: 'tailwind' }, { label: 'HTML/CSS', tech: 'default' }],
      role: 'Solo', period: '2025', duration: '1 sem.',
      description: 'Landing page SaaS, intégration pixel-perfect en Tailwind.',
      highlights: [
        'Landing page SaaS intégrée en pixel-perfect.',
        'Système d\u2019espacement cohérent en Tailwind.',
        'Fidélité maquette \u2192 code maximale.',
      ],
      caseStudy: 'Landing page d\u2019un produit SaaS fictif, du design à l\u2019intégration. Exercice de fidélité maquette \u2192 code et de système d\u2019espacement cohérent en Tailwind.',
      demoUrl: 'https://sofian-bll.github.io/klivio-tailwind/', repoUrl: 'https://github.com/Sofian-bll/klivio-tailwind',
    },
    {
      id: 'sshk', name: 'sshk', categories: ['tooling'], featured: true,
      techs: [{ label: 'Bash', tech: 'bash' }, { label: 'OpenSSH', tech: 'linux' }],
      role: 'Solo', period: '2026', duration: 'En cours',
      description: 'CLI Bash zéro dépendance pour créer, organiser et révoquer des clés SSH.',
      highlights: [
        'CLI Bash zéro dépendance — create, list, grant, revoke en une commande',
        'Arborescence prévisible par projet/serveur, rotation de clés simplifiée',
        'Installation curl | bash, compatible Linux/macOS sans runtime externe',
      ],
      caseStudy: 'Utilitaire CLI en Bash pur pour centraliser la gestion des clés SSH. Chaque commande mappe une action (create, list, grant, revoke) avec une arborescence prévisible par projet et serveur. Zéro dépendance, installation en un curl pipe, compatible tout Unix.',
      image: 'sshk-mockup.svg',
      demoUrl: '', repoUrl: 'https://github.com/Sofian-bll/sshk',
    },
    {
      id: 'rage-ui', name: 'Rage-UI', categories: ['tooling', 'devops'], featured: true,
      techs: [{ label: 'JavaScript', tech: 'js' }, { label: 'SOPS', tech: 'docker' }, { label: 'Age', tech: 'linux' }],
      role: 'Solo', period: '2026', duration: 'En cours',
      description: 'Secrets Manager local-first — chiffrement SOPS + Age, injection GitOps, interface web.',
      highlights: [
        'Coffre-fort central pour secrets globaux et par projet.',
        'Injection automatique via templates .env.template \u2192 .env.',
        'Interface web pour gestion et injection en un clic.',
      ],
      caseStudy: 'Manager de secrets local-first avec interface web. Chiffrement SOPS + Age, organisation en coffre-fort global et templates par projet. Un changement de token ? Une seule modification, injection partout.',
      demoUrl: '', repoUrl: 'https://github.com/Sofian-bll/Rage-UI',
    },
    {
      id: 'epitalk', name: 'Epitalk', categories: ['dev'], featured: true,
      techs: [{ label: 'JavaScript', tech: 'js' }, { label: 'Node.js', tech: 'node' }],
      role: 'Équipe (3)', period: '2025', duration: '4 jours',
      description: 'Chatbot intelligent pour Epitech — design system, authentification, générateur de cartes.',
      highlights: [
        'Chatbot interactif avec design system sur mesure.',
        'Système d\u2019authentification complet.',
        '2 releases (v1.0, v1.1), démo live sur GitHub Pages.',
      ],
      caseStudy: 'Projet web interactif réalisé en équipe de 3 en 4 jours pour centraliser l\u2019accès aux informations Epitech. Développement du chatbot et design system. Déploiement continu avec 2 releases taguées.',
      demoUrl: 'https://sofian-bll.github.io/Epitalk/', repoUrl: 'https://github.com/Sofian-bll/Epitalk',
    },
    {
      id: 'jeuvideops', name: 'JeuVideOps', categories: ['devops', 'dev'], featured: true,
      techs: [{ label: 'Docker', tech: 'docker' }, { label: 'CI/CD', tech: 'git' }, { label: 'Playwright', tech: 'python' }, { label: 'Allure', tech: 'default' }],
      role: 'Équipe', period: '2026', duration: '3 sem.',
      description: 'Pipeline CI/CD complet — PR Gates, tests E2E Playwright, rapports Allure, GitHub Pages.',
      highlights: [
        'Pipeline PR Gate avec tests Playwright et rapports Allure.',
        'Déploiement automatique de la plateforme sur GitHub Pages.',
        'Badges CI visibles, workflow DevSecOps complet.',
      ],
      caseStudy: 'Projet DevOps/DevSecOps complet : pipeline CI/CD automatisé avec gates de PR, tests E2E Playwright, rapports Allure, et déploiement continu sur GitHub Pages. Automatiser plus pour travailler moins.',
      demoUrl: 'https://jeuvideops.github.io/jeuvideops/', repoUrl: 'https://github.com/jeuvideops/jeuvideops',
    },
    {
      id: 'appstore-scraper', name: 'AppStore Scraper', categories: ['tooling'], featured: true,
      techs: [{ label: 'Python', tech: 'python' }],
      role: 'Solo', period: '2025', duration: 'Quelques jours',
      description: 'Scraper de l\u2019App Store Apple — comparaison de prix multi-régions pour trouver le tarif le plus bas.',
      highlights: [
        'Scraping multi-régions de l\u2019App Store Apple.',
        'Comparaison automatique des prix par pays.',
        'Format exportable pour analyse.',
      ],
      caseStudy: 'Outil Python de scraping de l\u2019App Store Apple permettant de comparer les prix d\u2019une application à travers toutes les régions et d\u2019identifier le tarif le plus avantageux.',
      demoUrl: '', repoUrl: 'https://github.com/Sofian-bll/AppStore-Scraper',
    },
    {
      id: 'soundcloud-downloader', name: 'Soundcloud DL', categories: ['tooling'], featured: false,
      techs: [{ label: 'Python', tech: 'python' }],
      role: 'Solo', period: '2025', duration: 'Quelques jours',
      description: 'Téléchargeur de playlists SoundCloud en WAV — extraction propre par playlist.',
      highlights: [
        'Téléchargement par playlist complète en WAV.',
        'Interface CLI simple et efficace.',
        'Conversion propre pour qualité maximale.',
      ],
      caseStudy: 'Script Python pour télécharger des playlists SoundCloud entières au format WAV. Utilitaire pratique pour DJs et producteurs souhaitant archiver leurs sets en haute qualité.',
      demoUrl: '', repoUrl: 'https://github.com/Sofian-bll/Soundcloud_Wav_Playlist',
    },
    {
      id: 'sidecar-patcher', name: 'SidecarPatcher', categories: ['tooling'], featured: true,
      techs: [{ label: 'Python', tech: 'python' }, { label: 'Reverse', tech: 'bash' }],
      role: 'Solo', period: '2025', duration: 'Quelques jours',
      description: 'Patch binaire du framework macOS SidecarCore — reverse engineering et modification bas niveau.',
      highlights: [
        'Recherche automatique de signatures machine dans le binaire.',
        'Patch assembleur (MOV EAX, 1; RET) avec backup automatique.',
        'Projet éducatif de reverse engineering bas niveau.',
      ],
      caseStudy: 'Utilitaire en ligne de commande appliquant un patch binaire minimaliste au framework macOS SidecarCore pour désactiver la vérification de compatibilité. Reverse engineering éducatif — recherche de signatures, patch assembleur, sauvegarde.',
      demoUrl: '', repoUrl: 'https://github.com/Sofian-bll/SidecarPatcher',
    },
    {
      id: 'seahorse-3d', name: 'Seahorse 3D', categories: ['3d', 'animation', 'webdesign'], featured: true,
      techs: [{ label: 'Three.js', tech: 'three' }, { label: 'Blender', tech: 'blender' }, { label: 'After Effects', tech: 'ae' }],
      role: 'Solo', period: '2026', duration: 'En cours',
      description: 'Animation 3D interactive — pipeline créatif complet de Photoshop à Three.js en passant par Blender.',
      highlights: [
        'Pipeline créatif : Photoshop \u2192 After Effects \u2192 Blender \u2192 Three.js.',
        'Modèle 3D généré par IA Google puis affiné dans Blender.',
        'Animation interactive et rendu temps réel dans le navigateur.',
      ],
      caseStudy: 'Projet créatif mêlant design graphique (Photoshop, After Effects), modélisation 3D (Blender, IA générative Google 3D) et développement web (Three.js) pour créer une animation 3D interactive d\u2019un hippocampe.',
      demoUrl: '', repoUrl: '',
    },
    {
      id: 'nojs-ui', name: 'NoJS-UI', categories: ['dev', 'webdesign'], featured: false,
      techs: [{ label: 'TypeScript', tech: 'ts' }, { label: 'Gemini AI', tech: 'rag' }],
      role: 'Solo', period: '2025', duration: 'En cours',
      description: 'Composants UI sans JavaScript — bibliothèque générée par IA, approche minimaliste et performante.',
      highlights: [
        'Composants UI fonctionnels sans JavaScript côté client.',
        'Génération de code par Gemini AI.',
        'Approche radicale de performance web.',
      ],
      caseStudy: 'Expérimentation d\u2019une bibliothèque de composants UI générés par IA ne nécessitant aucun JavaScript côté client. Une approche radicale de la performance web.',
      demoUrl: '', repoUrl: 'https://github.com/Sofian-bll/NoJS-Ui',
    },
    {
      id: 'media-pipeline', name: 'Media Pipeline', categories: ['tooling', 'dev'], featured: false,
      techs: [{ label: 'Go', tech: 'go' }, { label: 'n8n', tech: 'n8n' }],
      role: 'Solo', period: '2026', duration: 'En cours',
      description: 'Pipeline automatisé de traitement média — worker pool en Go, watcher, orchestré via n8n.',
      highlights: [
        'Architecture worker pool en Go pour traitement parallèle.',
        'Watcher de fichiers pour déclenchement automatique.',
        'Orchestration des workflows via n8n.',
      ],
      caseStudy: 'Pipeline de traitement média automatisé combinant un worker pool en Go, un watcher de fichiers pour le déclenchement, et n8n pour l\u2019orchestration des workflows de bout en bout.',
      demoUrl: '', repoUrl: '',
    },
  ];

export const DATA = { personalInfo, contactInfos, socialLinks, skillGroups, formations, interests, categories, projects };

/* ─── CMS overrides (admin localStorage) ─── */
(function applyCmsOverrides() {
  try {
    const cms = JSON.parse(localStorage.getItem('bentofolio.cms') || 'null');
    if (cms) {
      if (cms.projects)    DATA.projects    = cms.projects;
      if (cms.socialLinks) DATA.socialLinks = cms.socialLinks;
    }
    const photo = localStorage.getItem('bentofolio.photo');
    if (photo) DATA.personalInfo.photoUrl = photo;
  } catch(e) {}
})();

/* Category helpers */
export function projCats(p) {
  if (!p) return [];
  if (Array.isArray(p.categories) && p.categories.length) return p.categories;
  return p.category ? [p.category] : [];
}
export function primaryCat(p) { return projCats(p)[0]; }
