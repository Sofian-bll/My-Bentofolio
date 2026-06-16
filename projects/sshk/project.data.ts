import type { Project } from '../types';

const sshk: Project = {
  slug: 'sshk',
  title: 'Sshk',
  subtitle: 'CLI Bash pour gestion SSH multi-serveurs',
  category: 'devops',
  secondaryCategories: ['tools', 'dev'],
  techs: ['bash', 'linux', 'git'],
  period: '2025',
  duration: 'En cours',
  role: 'Créateur & mainteneur',
  highlights: [
    { text: 'CLI Bash zéro dépendance — create, list, grant, revoke en une commande' },
    { text: 'Arborescence prévisible par projet/serveur, rotation de clés simplifiée' },
    { text: 'Installation curl | bash, compatible Linux/macOS sans runtime externe' },
  ],
  links: [
    { label: 'GitHub', url: 'https://github.com/Sofian-bll/sshk', type: 'github' },
  ],
  images: [
    {
      src: 'app/assets/sshk-mockup.svg',
      alt: 'Terminal montrant les commandes sshk create, list et grant',
      caption: 'Interface CLI Sshk — workflow complet en 3 commandes',
    },
  ],
  caseStudyPath: 'README.md',
  featured: true,
  status: 'completed',
};

export default sshk;
