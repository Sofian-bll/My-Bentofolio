import { describe, expect, test } from 'bun:test';
import { CV_PDF_VARIANTS, CV_PDF_DEFAULT, cvPdfUrl } from './cv-pdf-files.js';

describe('cv-pdf-files', () => {
  test('has exactly 3 variants', () => {
    expect(CV_PDF_VARIANTS).toHaveLength(3);
  });

  test('each variant has id, label, file', () => {
    for (const v of CV_PDF_VARIANTS) {
      expect(v.id).toBeString();
      expect(v.label).toBeString();
      expect(v.file).toBeString();
      expect(v.file).toEndWith('.pdf');
    }
  });

  test('default is mono', () => {
    expect(CV_PDF_DEFAULT).toBe('mono');
  });

  test('cvPdfUrl returns correct path for known variant', () => {
    expect(cvPdfUrl('mono')).toBe('/cv/cv-sofian-bll-mono.pdf');
    expect(cvPdfUrl('couleur')).toBe('/cv/cv-sofian-bll-couleur.pdf');
    expect(cvPdfUrl('sombre')).toBe('/cv/cv-sofian-bll-sombre.pdf');
  });

  test('cvPdfUrl falls back to default for unknown variant', () => {
    expect(cvPdfUrl('nope')).toBe('/cv/cv-sofian-bll-mono.pdf');
    expect(cvPdfUrl(null)).toBe('/cv/cv-sofian-bll-mono.pdf');
    expect(cvPdfUrl(undefined)).toBe('/cv/cv-sofian-bll-mono.pdf');
  });

  test('all file names are unique', () => {
    const files = CV_PDF_VARIANTS.map(v => v.file);
    expect(new Set(files).size).toBe(files.length);
  });
});
