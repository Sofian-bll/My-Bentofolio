/**
 * Bentofolio — Project Registry
 * 
 * Agrège tous les projets et fournit le registre global.
 * Ajouter un nouveau projet = créer son dossier + l'importer ici.
 */

import type { ProjectRegistry, Category } from './types';
import sshk from './sshk/project.data';

// ─── Catégories ──────────────────────────────────────────────
const categories: Record<string, Category> = {
  dev: {
    id: 'dev',
    label: 'Développement',
    icon: 'code',
    color: '#6366f1',
  },
  webdesign: {
    id: 'webdesign',
    label: 'Web Design',
    icon: 'palette',
    color: '#ec4899',
  },
  '3d': {
    id: '3d',
    label: '3D & Motion',
    icon: 'cube',
    color: '#f59e0b',
  },
  ai: {
    id: 'ai',
    label: 'IA & Data',
    icon: 'brain',
    color: '#10b981',
  },
  tools: {
    id: 'tools',
    label: 'Outils',
    icon: 'wrench',
    color: '#8b5cf6',
  },
  devops: {
    id: 'devops',
    label: 'DevOps',
    icon: 'server',
    color: '#06b6d4',
  },
};

// ─── Technologies ────────────────────────────────────────────
const techs = {
  bash:      { id: 'bash',      label: 'Bash',       category: 'devops' as const },
  linux:     { id: 'linux',     label: 'Linux',      category: 'devops' as const },
  git:       { id: 'git',       label: 'Git',        category: 'tools' as const },
  laravel:   { id: 'laravel',   label: 'Laravel',    category: 'dev' as const },
  vue:       { id: 'vue',       label: 'Vue.js',     category: 'dev' as const },
  java:      { id: 'java',      label: 'Java',       category: 'dev' as const },
  go:        { id: 'go',        label: 'Go',         category: 'dev' as const },
  tailwind:  { id: 'tailwind',  label: 'Tailwind',   category: 'webdesign' as const },
  shadcn:    { id: 'shadcn',    label: 'shadcn/ui',  category: 'webdesign' as const },
  mysql:     { id: 'mysql',     label: 'MySQL',      category: 'dev' as const },
  docker:    { id: 'docker',    label: 'Docker',     category: 'devops' as const },
  sops:      { id: 'sops',      label: 'SOPS',       category: 'devops' as const },
  figma:     { id: 'figma',     label: 'Figma',      category: 'webdesign' as const },
  framer:    { id: 'framer',    label: 'Framer',     category: 'webdesign' as const },
  blender:   { id: 'blender',   label: 'Blender',    category: '3d' as const },
  three:     { id: 'three',     label: 'Three.js',   category: '3d' as const },
  python:    { id: 'python',    label: 'Python',     category: 'ai' as const },
  rag:       { id: 'rag',       label: 'RAG',        category: 'ai' as const },
  n8n:       { id: 'n8n',       label: 'n8n',        category: 'ai' as const },
  nvim:      { id: 'nvim',      label: 'Neovim',     category: 'tools' as const },
  soft:      { id: 'soft',      label: 'Soft Skills', category: 'tools' as const },
};

// ─── Projets ─────────────────────────────────────────────────
const projects = [
  sshk,
  // Ajouter les nouveaux projets ici :
  // monProjet,
];

// ─── Registre exporté ────────────────────────────────────────
export const registry: ProjectRegistry = {
  categories: categories as ProjectRegistry['categories'],
  techs,
  projects,
};

// Helpers pour consommation directe
export const getProject = (slug: string) =>
  registry.projects.find((p) => p.slug === slug);

export const getProjectsByCategory = (categoryId: string) =>
  registry.projects.filter(
    (p) =>
      p.category === categoryId ||
      p.secondaryCategories?.includes(categoryId as any)
  );

export const getFeaturedProjects = () =>
  registry.projects.filter((p) => p.featured);

export default registry;
