export default {
  id: "sidecar-patcher",
  name: "SidecarPatcher",
  categories: [
  "tooling"
],
  featured: false,
  techs: [
  {
    "label": "Python",
    "tech": "python"
  },
  {
    "label": "Reverse",
    "tech": "bash"
  }
],
  role: "Solo",
  period: "2025",
  duration: "Quelques jours",
  description: "Patch binaire du framework macOS SidecarCore — reverse engineering et modification bas niveau.",
  highlights: [
  "Recherche automatique de signatures machine dans le binaire.",
  "Patch assembleur (MOV EAX, 1; RET) avec backup automatique.",
  "Projet éducatif de reverse engineering bas niveau."
],
  caseStudy: `## Contexte

Utilitaire en ligne de commande appliquant un patch binaire minimaliste au framework macOS SidecarCore pour désactiver la vérification de compatibilité. Reverse engineering éducatif — recherche de signatures, patch assembleur, sauvegarde.

## Points clés

- Recherche automatique de signatures machine dans le binaire.
- Patch assembleur (MOV EAX, 1; RET) avec backup automatique.
- Projet éducatif de reverse engineering bas niveau.

## Stack

- Python
- Reverse`,
  demoUrl: "",
  repoUrl: "https://github.com/Sofian-bll/SidecarPatcher",
  image: "",
}
