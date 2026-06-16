/* =============================================
   BENTOFOLIO — DATA BRIDGE (ES module)
   ============================================= */

import { DATA } from './data.js';

const extraCategories = {
  ai:     { label: 'IA & Data',  color: 'var(--cat-ai)',     glyph: 'brain' },
  tools:  { label: 'Outils',     color: 'var(--cat-tools)',  glyph: 'wrench' },
  devops: { label: 'DevOps',     color: 'var(--cat-devops)', glyph: 'server' },
};

Object.assign(DATA.categories, extraCategories);

if (DATA.categories.tooling && !DATA.categories.tools) {
  DATA.categories.tools = DATA.categories.tooling;
}

const migratedProjects = [
  {
    id: 'sshk',
    name: 'Sshk',
    subtitle: 'CLI Bash pour gestion SSH multi-serveurs',
    categories: ['devops', 'tools', 'dev'],
    featured: true,
    techs: [
      { label: 'Bash', tech: 'bash' },
      { label: 'Linux', tech: 'linux' },
      { label: 'Git', tech: 'git' },
    ],
    role: 'Créateur & mainteneur',
    period: '2025',
    duration: 'En cours',
    description: 'CLI Bash pour gestion SSH multi-serveurs',
    highlights: [
      'CLI Bash zéro dépendance — create, list, grant, revoke en une commande',
      'Arborescence prévisible par projet/serveur, rotation de clés simplifiée',
      'Installation curl | bash, compatible Linux/macOS sans runtime externe',
    ],
    caseStudy: 'README.md',
    image: 'app/assets/sshk-mockup.svg',
    demoUrl: '',
    repoUrl: 'https://github.com/Sofian-bll/sshk',
  },
];

const existingIds = new Set(migratedProjects.map(p => p.id));
const keptProjects = DATA.projects.filter(p => !existingIds.has(p.id));
DATA.projects = [...migratedProjects, ...keptProjects];

console.log('[data-bridge] Categories merged:', Object.keys(extraCategories).join(', '));
console.log('[data-bridge] Projects migrated:', migratedProjects.map(p => p.id).join(', '));
