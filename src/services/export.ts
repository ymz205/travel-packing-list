import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';
import { TripRecord, PackingItem } from '../types';

export async function exportAsPDF(record: TripRecord): Promise<void> {
  const tempContainer = document.createElement('div');
  tempContainer.style.cssText = `
    position: fixed;
    top: -9999px;
    left: -9999px;
    width: 600px;
    background: white;
    padding: 40px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  `;
  
  const categoryNames: Record<string, string> = {
    clothing: '衣物类',
    toiletries: '洗护类',
    medicine: '药品类',
    electronics: '电子类',
    custom: '自定义',
  };

  const grouped = record.items.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, PackingItem[]>);

  let htmlContent = `
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="font-size: 24px; font-weight: bold; color: #333; margin-bottom: 10px;">${record.name}</h1>
      <p style="font-size: 14px; color: #666;">${record.config.destination} · ${record.config.days}天</p>
    </div>
  `;

  Object.entries(grouped).forEach(([category, items]) => {
    htmlContent += `
      <div style="margin-bottom: 20px;">
        <h2 style="font-size: 16px; font-weight: bold; color: #4285F4; border-bottom: 2px solid #4285F4; padding-bottom: 5px; margin-bottom: 10px;">
          ${categoryNames[category] || category}
        </h2>
        <ul style="list-style: none; padding: 0; margin: 0;">
          ${items.map(item => `
            <li style="font-size: 14px; color: ${item.packed ? '#999' : '#333'}; text-decoration: ${item.packed ? 'line-through' : 'none'}; margin-bottom: 8px;">
              ${item.packed ? '✓' : '○'} ${item.name} ×${item.quantity}
              ${item.remark ? `<span style="color: #666; font-size: 12px;"> - ${item.remark}</span>` : ''}
            </li>
          `).join('')}
        </ul>
      </div>
    `;
  });

  htmlContent += `
    <div style="text-align: center; margin-top: 40px; font-size: 12px; color: #999; border-top: 1px solid #eee; padding-top: 15px;">
      旅行极简行李AI清单 · 已打包 ${record.items.filter(i => i.packed).length}/${record.items.length}
    </div>
  `;

  tempContainer.innerHTML = htmlContent;
  document.body.appendChild(tempContainer);

  try {
    const canvas = await html2canvas(tempContainer, {
      scale: 2,
      backgroundColor: '#ffffff',
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    const imgX = (pdfWidth - imgWidth * ratio) / 2;
    const imgY = 10;

    pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
    pdf.save(`${record.name}.pdf`);
  } finally {
    document.body.removeChild(tempContainer);
  }
}

export function exportAsExcel(record: TripRecord): void {
  const categoryNames: Record<string, string> = {
    clothing: '衣物类',
    toiletries: '洗护类',
    medicine: '药品类',
    electronics: '电子类',
    custom: '自定义',
  };

  const data = record.items.map(item => ({
    '分类': categoryNames[item.category] || item.category,
    '物品名称': item.name,
    '数量': item.quantity,
    '已打包': item.packed ? '是' : '否',
    '备注': item.remark,
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, '行李清单');

  // Set column widths
  ws['!cols'] = [
    { wch: 10 },
    { wch: 20 },
    { wch: 8 },
    { wch: 10 },
    { wch: 20 },
  ];

  XLSX.writeFile(wb, `${record.name}.xlsx`);
}

export async function generateShareImage(elementId: string): Promise<string> {
  const element = document.getElementById(elementId);
  if (!element) throw new Error('Element not found');
  
  const canvas = await html2canvas(element, {
    backgroundColor: '#ffffff',
    scale: 2,
  });
  
  return canvas.toDataURL('image/png');
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}