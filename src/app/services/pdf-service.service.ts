import { Injectable } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Inject, PLATFORM_ID } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PdfService {
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  generatePDF(content: HTMLElement, fileName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!isPlatformBrowser(this.platformId)) {
        console.error('html2pdf cannot be used in SSR environment');
        reject('SSR environment');
        return;
      }

      import('html2pdf.js').then((module) => {
        const html2pdf = module.default || module;

        if (!content) {
          console.error('Element not found!');
          reject('No content provided');
          return;
        }

        const options = {
          margin: 0.5,
          filename: fileName, // 👈 Dynamic filename used here
          image: { type: 'jpeg', quality: 0.75 },
          html2canvas: {
            scale: 1.5,
            useCORS: true,
            allowTaint: false,
            logging: false
          },
          jsPDF: {
            unit: 'cm',
            format: 'a4',
            orientation: 'portrait'
          },
          pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
        };

        html2pdf()
          .set(options)
          .from(content)
          .save()
          .then(() => resolve())
          .catch((error: any) => reject(error));
      }).catch((error) => {
        console.error('Error loading html2pdf:', error);
        reject(error);
      });
    });
  }
}
