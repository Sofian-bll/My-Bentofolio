export default {
  id: "sshk",
  name: "sshk",
  categories: [
  "tooling"
],
  featured: true,
  techs: [
  {
    "label": "Bash",
    "tech": "bash"
  },
  {
    "label": "OpenSSH",
    "tech": "linux"
  }
],
  role: "Solo",
  period: "2026",
  duration: "En cours",
  description: "CLI Bash zéro dépendance pour créer, organiser et révoquer des clés SSH.",
  highlights: [
  "CLI Bash zéro dépendance — create, list, grant, revoke en une commande",
  "Arborescence prévisible par projet/serveur, rotation de clés simplifiée",
  "Installation curl | bash, compatible Linux/macOS sans runtime externe"
],
  caseStudy: `## Contexte

Utilitaire CLI en Bash pur pour centraliser la gestion des clés SSH. Chaque commande mappe une action (create, list, grant, revoke) avec une arborescence prévisible par projet et serveur. Zéro dépendance, installation en un curl pipe, compatible tout Unix.

## Points clés

- CLI Bash zéro dépendance — create, list, grant, revoke en une commande
- Arborescence prévisible par projet/serveur, rotation de clés simplifiée
- Installation curl | bash, compatible Linux/macOS sans runtime externe

## Stack

- Bash
- OpenSSH`,
  demoUrl: "",
  repoUrl: "https://github.com/Sofian-bll/sshk",
  image: "sshk-mockup.svg",
}
