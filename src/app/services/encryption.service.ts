import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root'
})
export class EncryptionService {

  private key = CryptoJS.enc.Utf8.parse('6629908583421085'); // Use a 16-byte key for AES
  private iv = CryptoJS.enc.Utf8.parse('3528143269456882'); // Use a 16-byte IV for AES

  constructor() {}

  // Encrypt a string
  encrypt(value: string): string {
    const encrypted = CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(value), this.key, {
      keySize: 128 / 8,
      iv: this.iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
    return encrypted.toString();
  }

  decrypt(encryptedValue: string): string | null {
    if (!encryptedValue) {
      console.error('No value provided for decryption.');
      return null;
    }

    const decrypted = CryptoJS.AES.decrypt(encryptedValue, this.key, {
      keySize: 128 / 8,
      iv: this.iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });

    const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);
    
    // Check if decryption was successful
    if (!decryptedText) {
      console.error('Decryption returned an empty value for:', encryptedValue);
      return null; // Return null or handle it as needed
    }

    return decryptedText;
  }

}