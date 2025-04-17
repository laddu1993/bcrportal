import { Injectable } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Inject, PLATFORM_ID } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PdfService {
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  generatePDF(content: HTMLElement, fileName: string = 'document.pdf') {
    // Check if we are in a browser environment
    if (isPlatformBrowser(this.platformId)) {
      // Dynamically import the html2pdf.js library
      import('html2pdf.js').then((module) => {
        const html2pdf = module.default || module;

        if (!content) {
          console.error('Element not found!');
          return;
        }

        // Configure html2pdf options
        const options = {
          margin: 1,
          filename: fileName,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { unit: 'cm', format: 'a4', orientation: 'portrait'},
        };

        // Generate PDF from the provided content
        html2pdf().from(content).set(options).output('dataurlnewwindow');
        
      }).catch((error) => {
        console.error('Error loading html2pdf:', error);
      });
    } else {
      console.error('html2pdf cannot be used in SSR environment');
    }
    // content.style.display = 'none';
  }
}
