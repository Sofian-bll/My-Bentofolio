/**
 * Bentofolio — Project Data Types
 * 
 * Contrat unique pour toutes les données projet.
 * Consommé par le site public ET le dashboard admin.
 */

// ─── Catégories ──────────────────────────────────────────────
export type CategoryId =
  | 'dev'
  | 'webdesign'
  | '3d'
  | 'ai'
  | 'tools'
  | 'devops';

export interface Category {
  id: CategoryId;
  label: string;
  icon: string;       // nom d'icône dans icons.svg
  color: string;      // hex ou var CSS
}

// ─── Technologies / Tags ─────────────────────────────────────
export interface Tech {
  id: string;         // ex: 'go', 'laravel', 'vue'
  label: string;      // ex: 'Go', 'Laravel', 'Vue.js'
  category: CategoryId;
  color?: string;     // override couleur pill (optionnel)
}

// ─── Projet ──────────────────────────────────────────────────
export interface ProjectHighlight {
  text: string;
}

export interface ProjectLink {
  label: string;
  url: string;
  type: 'github' | 'live' | 'figma' | 'other';
}

export interface ProjectImage {
  src: string;        // chemin relatif depuis projects/[nom]/images/
  alt: string;
  caption?: string;
}

export interface Project {
  /** Identifiant unique = nom du dossier */
  slug: string;

  /** Titre affiché */
  title: string;

  /** Sous-titre ou tagline courte */
  subtitle: string;

  /** Catégorie principale (affichage dans filtre "All") */
  category: CategoryId;

  /** Catégories secondaires pour filtrage croisé */
  secondaryCategories?: CategoryId[];

  /** Technologies utilisées */
  techs: string[];    // ids correspondant à Tech.id

  /** Période ou année */
  period: string;

  /** Durée estimée (ex: '3 mois', 'En cours') */
  duration?: string;

  /** Rôle dans le projet */
  role: string;

  /** Bullet points CV / résumé */
  highlights: ProjectHighlight[];

  /** Liens externes */
  links?: ProjectLink[];

  /** Images / mockups du projet */
  images?: ProjectImage[];

  /** Contenu long (markdown) — chargé lazy depuis README.md */
  caseStudyPath?: string;

  /** Projet mis en avant sur la home */
  featured?: boolean;

  /** Statut du projet */
  status: 'completed' | 'in-progress' | 'archived';
}

// ─── Registre global ─────────────────────────────────────────
export interface ProjectRegistry {
  categories: Record<CategoryId, Category>;
  techs: Record<string, Tech>;
  projects: Project[];
}
