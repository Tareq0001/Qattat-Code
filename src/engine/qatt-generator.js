/**
 * قطّاط البرمجة - المحرك الرياضي لتوليد أنماط القط العسيري
 * Mathematical Generative Engine for Asiri Qatt Murals
 * Author: 🏛️ أ. طارق ابوعشي
 */

export const ASIRI_COLORS = {
  crimson: '#c22b26', // أحمر قاني
  ochre: '#e5a912',   // أصفر شمسي
  green: '#15803d',   // أخضر بري
  blue: '#1d4ed8',    // أزرق نيلي
  black: '#18181b',   // أسود كاحل
  plaster: '#faf9f6'  // جص أبيض
};

export class QattGenerator {
  constructor() {
    this.defaultColors = [
      ASIRI_COLORS.crimson,
      ASIRI_COLORS.ochre,
      ASIRI_COLORS.green,
      ASIRI_COLORS.blue
    ];
  }

  generateSvg(options = {}) {
    const patternType = options.patternType || 'grand-mural';
    const rows = Math.min(Math.max(options.rows || 3, 1), 8);
    const cols = Math.min(Math.max(options.cols || 8, 2), 24);
    const cellW = options.cellW || 48;
    const cellH = options.cellH || 56;
    const width = cols * cellW + 40;
    const height = rows * cellH + 80;
    const strokeWidth = options.strokeWidth || 1.5;
    const symmetry = options.symmetry || 'horizontal';

    let content = '';

    // 1. Background plaster surface
    content += `<rect width="${width}" height="${height}" fill="#faf9f6" rx="8"/>`;

    // 2. Khetam (Outer Border Frame)
    content += this._generateKhetamFrame(width, height, strokeWidth);

    // 3. Central decorative bands
    const startY = 40;
    for (let r = 0; r < rows; r++) {
      const y = startY + r * cellH;
      const rowPattern = (patternType === 'grand-mural') 
        ? this._getMuralRowPattern(r, rows) 
        : patternType;

      content += this._generateRowPattern(rowPattern, cols, cellW, cellH, 20, y, r, strokeWidth, symmetry);
    }

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="100%" style="display:block;">${content}</svg>`;
  }

  _getMuralRowPattern(r, totalRows) {
    const seq = ['khetam-border', 'bana', 'misht', 'mihrab', 'sakranah', 'bana'];
    return seq[r % seq.length];
  }

  _generateKhetamFrame(w, h, stroke) {
    let svg = '';
    // Double outer border
    svg += `<rect x="6" y="6" width="${w - 12}" height="${h - 12}" fill="none" stroke="${ASIRI_COLORS.black}" stroke-width="${stroke * 2}"/>`;
    svg += `<rect x="12" y="12" width="${w - 24}" height="${h - 24}" fill="none" stroke="${ASIRI_COLORS.ochre}" stroke-width="${stroke}"/>`;

    // Top & Bottom small saw-teeth triangles
    const toothW = 12;
    const count = Math.floor((w - 24) / toothW);
    for (let i = 0; i < count; i++) {
      const x1 = 12 + i * toothW;
      const x2 = x1 + toothW;
      const xMid = x1 + toothW / 2;
      const color = (i % 2 === 0) ? ASIRI_COLORS.crimson : ASIRI_COLORS.green;
      svg += `<polygon points="${x1},12 ${x2},12 ${xMid},20" fill="${color}" stroke="${ASIRI_COLORS.black}" stroke-width="0.5"/>`;
      svg += `<polygon points="${x1},${h - 12} ${x2},${h - 12} ${xMid},${h - 20}" fill="${color}" stroke="${ASIRI_COLORS.black}" stroke-width="0.5"/>`;
    }

    return svg;
  }

  _generateRowPattern(type, cols, cw, ch, startX, startY, rowIdx, stroke, symmetry) {
    let svg = `<g class="qatt-row-${rowIdx}" transform="translate(${startX}, ${startY})">`;

    // Row divider line
    svg += `<line x1="0" y1="${ch}" x2="${cols * cw}" y2="${ch}" stroke="${ASIRI_COLORS.black}" stroke-width="${stroke}"/>`;

    for (let c = 0; c < cols; c++) {
      const x = c * cw;
      const colorIdx = (c + rowIdx) % this.defaultColors.length;
      const color = this.defaultColors[colorIdx];
      const altColor = this.defaultColors[(colorIdx + 2) % this.defaultColors.length];

      switch (type) {
        case 'bana':
          // Opposing triangles (البَنَة)
          svg += `
            <polygon points="${x},${ch} ${x + cw / 2},0 ${x + cw},${ch}" fill="${color}" stroke="${ASIRI_COLORS.black}" stroke-width="${stroke}"/>
            <polygon points="${x + cw / 4},${ch} ${x + cw / 2},${ch / 2} ${x + (3 * cw) / 4},${ch}" fill="${ASIRI_COLORS.ochre}" stroke="${ASIRI_COLORS.black}" stroke-width="0.75"/>
          `;
          break;

        case 'misht':
          // Comb-like vertical teeth (المشط)
          const teethCount = 3;
          const toothStep = cw / teethCount;
          for (let t = 0; t < teethCount; t++) {
            const tx = x + t * toothStep;
            const tHeight = (t % 2 === 0) ? ch * 0.8 : ch * 0.5;
            const tColor = (t % 2 === 0) ? color : altColor;
            svg += `<rect x="${tx + 2}" y="${ch - tHeight}" width="${toothStep - 4}" height="${tHeight}" fill="${tColor}" stroke="${ASIRI_COLORS.black}" stroke-width="${stroke}" rx="1"/>`;
          }
          break;

        case 'sakranah':
          // Checker diamonds (السكرانة)
          svg += `
            <polygon points="${x + cw / 2},4 ${x + cw - 4},${ch / 2} ${x + cw / 2},${ch - 4} ${x + 4},${ch / 2}" fill="${color}" stroke="${ASIRI_COLORS.black}" stroke-width="${stroke}"/>
            <circle cx="${x + cw / 2}" cy="${ch / 2}" r="${cw / 6}" fill="${ASIRI_COLORS.ochre}" stroke="${ASIRI_COLORS.black}" stroke-width="0.75"/>
          `;
          break;

        case 'mihrab':
          // Parabolic arches & crown (المحاريب)
          svg += `
            <path d="M${x + 4},${ch} L${x + 4},${ch * 0.4} Q${x + cw / 2},0 ${x + cw - 4},${ch * 0.4} L${x + cw - 4},${ch} Z" fill="${color}" stroke="${ASIRI_COLORS.black}" stroke-width="${stroke}"/>
            <path d="M${x + cw * 0.25},${ch} L${x + cw * 0.25},${ch * 0.55} Q${x + cw / 2},${ch * 0.25} ${x + cw * 0.75},${ch * 0.55} L${x + cw * 0.75},${ch} Z" fill="${ASIRI_COLORS.ochre}"/>
          `;
          break;

        default:
          // Geometric strip
          svg += `<rect x="${x}" y="4" width="${cw - 2}" height="${ch - 8}" fill="${color}" stroke="${ASIRI_COLORS.black}" stroke-width="${stroke}"/>`;
          break;
      }
    }

    svg += '</g>';
    return svg;
  }

  generateCodeSnippet(options = {}) {
    const { patternType = 'bana', rows = 3, cols = 8 } = options;
    return `// كود التوليد الرياضي لجدارية القط العسيري
import { QattGenerator } from './engine/qatt-generator.js';

const generator = new QattGenerator();
const muralSvg = generator.generateSvg({
  patternType: '${patternType}',
  rows: ${rows},
  cols: ${cols},
  symmetry: 'horizontal',
  strokeWidth: 1.5
});

document.getElementById('mural-container').innerHTML = muralSvg;`;
  }
}
