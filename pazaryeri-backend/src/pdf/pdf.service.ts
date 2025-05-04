import { Injectable } from '@nestjs/common';
import { UpdatePdfDto } from './dto/update-pdf.dto';
import * as PDFDocument from 'pdfkit';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class PdfService {
  async generateInvoicePdf(invoiceData: any): Promise<Buffer> {
    return new Promise((resolve) => {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
        info: {
          Title: `Fatura #${invoiceData.invoiceNumber}`,
          Author: 'Pazaryeri Sistemi',
          Subject: 'E-Fatura'
        }
      });

      // Register Open Sans fonts
      const fontPath = path.join(process.cwd(), 'assets/fonts');
      doc.registerFont('OpenSans', path.join(fontPath, 'OpenSans-VariableFont_wdth,wght.ttf'));

      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });

      // Logo ve Başlık
      const pageWidth = doc.page.width;
      doc.fontSize(24).font('OpenSans').fillColor('#1a237e')
        .text('FATURA', { align: 'center' });
      doc.moveDown(0.5);

      // Fatura bilgileri kutusu
      const infoBoxY = doc.y;
      doc.rect(50, infoBoxY, pageWidth - 100, 70)
        .fillAndStroke('#f5f5f5', '#e0e0e0');

      doc.fillColor('#000000').fontSize(10).font('OpenSans');
      doc.text(`Fatura No: ${invoiceData.invoiceNumber}`, 60, infoBoxY + 10);
      doc.text(`Tarih: ${new Date(invoiceData.issuedAt).toLocaleDateString('tr-TR')}`, 60, infoBoxY + 30);
      doc.text(`Sipariş No: ${invoiceData.order.orderNumber || 'N/A'}`, 60, infoBoxY + 50);

      // Sağ tarafta ödeme detayları
      doc.text('Ödeme Tarihi:', pageWidth - 250, infoBoxY + 10);
      doc.text(`${new Date(invoiceData.paidAt).toLocaleDateString('tr-TR')}`, pageWidth - 150, infoBoxY + 10);
      doc.text('Ödeme Durumu:', pageWidth - 250, infoBoxY + 30);
      doc.text('Ödenmiş', pageWidth - 150, infoBoxY + 30, { color: '#4caf50' });

      doc.moveDown(3);

      // İki sütunlu bir düzen (sol: mağaza, sağ: müşteri)
      const columnStart = doc.y;
      const leftColWidth = (pageWidth - 100) / 2 - 10;

      // Mağaza Bilgileri (Sol sütun)
      doc.rect(50, columnStart, leftColWidth, 95)
        .fillAndStroke('#f5f5f5', '#e0e0e0');

      doc.fillColor('#1a237e').fontSize(12).font('OpenSans')
        .text('Satıcı Bilgileri', 60, columnStart + 10);

      doc.fillColor('#000000').fontSize(10).font('OpenSans');
      const storeInfo = invoiceData.order.items[0].store;
      doc.text(`Mağaza Adı: ${storeInfo.name || 'N/A'}`, 60, columnStart + 30);
      doc.text(`Vergi Numarası: ${storeInfo.taxNumber || 'N/A'}`, 60, columnStart + 45);
      doc.text(`Tel: ${storeInfo.phone || 'N/A'}`, 60, columnStart + 75);

      // Müşteri Bilgileri (Sağ sütun)
      doc.rect(50 + leftColWidth + 20, columnStart, leftColWidth, 95)
        .fillAndStroke('#f5f5f5', '#e0e0e0');

      doc.fillColor('#1a237e').fontSize(12).font('OpenSans')
        .text('Müşteri Bilgileri', 60 + leftColWidth + 20, columnStart + 10);

      doc.fillColor('#000000').fontSize(10).font('OpenSans');
      doc.text(`Ad Soyad: ${invoiceData.order.user.firstName} ${invoiceData.order.user.lastName}`,
        60 + leftColWidth + 20, columnStart + 30);
      doc.text(`E-posta: ${invoiceData.order.user.email || 'N/A'}`,
        60 + leftColWidth + 20, columnStart + 45);

      // Teslimat Adresi
      if (invoiceData.order.address) {
        doc.text(`Adres: ${invoiceData.order.address.fullAddress || 'N/A'}`,
          60 + leftColWidth + 20, columnStart + 60);
        doc.text(`${invoiceData.order.address.district}/${invoiceData.order.address.city}`,
          60 + leftColWidth + 20, columnStart + 75);
      }

      doc.moveDown(5);

      // Ürünler Tablosu
      const productsTableTop = doc.y + 10;

      // Tablo Başlığı
      doc.fillColor('#1a237e').fontSize(14).font('OpenSans')
        .text('Fatura Detayları', 50, productsTableTop);

      // Tablo başlıkları
      const tableTop = productsTableTop + 25;
      doc.rect(50, tableTop - 5, pageWidth - 100, 20)
        .fillAndStroke('#1a237e', '#1a237e');

      doc.fillColor('white').fontSize(10).font('OpenSans');
      doc.text('Ürün Açıklaması', 60, tableTop);
      doc.text('Adet', 320, tableTop);
      doc.text('KDV %', 360, tableTop);
      doc.text('Birim Fiyat', 410, tableTop);
      doc.text('Toplam', 480, tableTop);

      // Tablo içeriği
      let tablePosition = tableTop + 25;

      // Satır renklendirme için kullanılacak
      let isAlternate = false;

      invoiceData.items.forEach((item, i) => {
        // Alternatif satır renklendirme
        if (isAlternate) {
          doc.rect(50, tablePosition - 5, pageWidth - 100, 20)
            .fillAndStroke('#f5f5f5', '#f5f5f5');
        }

        doc.fillColor('#000000').fontSize(10).font('OpenSans');

        // Uzun ürün açıklamaları için metin kırpma
        doc.text(item.description.substring(0, 30) + (item.description.length > 30 ? '...' : ''),
          60, tablePosition, { width: 250 });

        doc.text(item.quantity.toString(), 320, tablePosition);
        doc.text(`%${Number(item.vatRate).toFixed(2)}`, 360, tablePosition);
        doc.text(`${Number(item.unitPrice).toFixed(2)} TL`, 410, tablePosition);
        doc.text(`${Number(item.totalPrice).toFixed(2)} TL`, 480, tablePosition);

        tablePosition += 20;
        isAlternate = !isAlternate;
      });

      // Alt Toplam, KDV ve Toplam bilgileri
      const summaryY = tablePosition + 20;

      // Özet kutusu
      doc.rect(350, summaryY, pageWidth - 400, 85)
        .fillAndStroke('#f5f5f5', '#e0e0e0');

      doc.fillColor('#000000').fontSize(10).font('OpenSans');
      doc.text('Ara Toplam:', 360, summaryY + 10);
      doc.text(`${Number(Number(invoiceData.amount) - Number(invoiceData.taxAmount)).toFixed(2)} TL`, 480, summaryY + 10);

      doc.text('KDV:', 360, summaryY + 30);
      doc.text(`${Number(invoiceData.taxAmount).toFixed(2)} TL`, 480, summaryY + 30);

      // Çizgi
      doc.moveTo(350, summaryY + 50).lineTo(pageWidth - 50, summaryY + 50).stroke();

      // Genel toplam
      const totalWithTax = Number(invoiceData.amount);
      doc.fillColor('#1a237e').fontSize(12).font('OpenSans');
      doc.text('Genel Toplam:', 360, summaryY + 60);
      doc.text(`${totalWithTax.toFixed(2)} TL`, 480, summaryY + 60);

      // Alt not ve yasal açıklama
      const footerY = doc.page.height - 100;
      doc.rect(50, footerY, pageWidth - 100, 50)
        .fillAndStroke('#f5f5f5', '#e0e0e0');

      doc.fillColor('#555555').fontSize(9).font('OpenSans');
      doc.text('Bu bir elektronik faturadır. 6563 sayılı Elektronik Ticaretin Düzenlenmesi Hakkında Kanun uyarınca düzenlenmiştir.',
        60, footerY + 10, { width: pageWidth - 120, align: 'center' });

      // Tarih ve imza
      doc.text(`Düzenlenme Tarihi: ${new Date(invoiceData.issuedAt).toLocaleDateString('tr-TR')}`,
        60, footerY + 30, { width: pageWidth - 120, align: 'center' });

      doc.end();
    });
  }

  // Other methods remain unchanged
}