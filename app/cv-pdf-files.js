export const CV_PDF_VARIANTS = [
  { id: 'couleur', label: 'Couleur', file: 'cv-sofian-bll-couleur.pdf' },
  { id: 'sombre', label: 'Sombre', file: 'cv-sofian-bll-sombre.pdf' },
  { id: 'mono', label: 'Mono', file: 'cv-sofian-bll-mono.pdf' },
];

export const CV_PDF_DEFAULT = 'mono';

export function cvPdfUrl(id) {
  const v = CV_PDF_VARIANTS.find(v => v.id === id);
  return v
    ? `/cv/${v.file}`
    : `/cv/${CV_PDF_VARIANTS.find(v => v.id === CV_PDF_DEFAULT).file}`;
}
