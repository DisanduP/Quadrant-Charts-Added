#!/usr/bin/env node

const fs = require('fs');
const { program } = require('commander');
const { create } = require('xmlbuilder2');

// --- Configuration ---
const CANVAS_SIZE = 600; // 600x600 pixels for the chart area
const PADDING = 100;     // Increased to 100px to fix cramping/overlap
const TOTAL_WIDTH = CANVAS_SIZE + (PADDING * 2);
const TOTAL_HEIGHT = CANVAS_SIZE + (PADDING * 2);

// --- 1. The Parser ---
function parseMermaid(content) {
  const lines = content.split('\n').map(l => l.trim()).filter(l => l);
  
  const data = {
    title: 'Quadrant Chart',
    xAxis: { left: '', right: '' },
    yAxis: { bottom: '', top: '' },
    quadrants: { q1: '', q2: '', q3: '', q4: '' },
    points: []
  };

  lines.forEach(line => {
    if (line.startsWith('%%')) return;

    if (line.startsWith('title')) {
      data.title = line.replace('title', '').trim();
    }
    else if (line.startsWith('x-axis')) {
      const parts = line.replace('x-axis', '').split('-->');
      if (parts.length === 2) {
        data.xAxis.left = parts[0].trim();
        data.xAxis.right = parts[1].trim();
      }
    }
    else if (line.startsWith('y-axis')) {
      const parts = line.replace('y-axis', '').split('-->');
      if (parts.length === 2) {
        data.yAxis.bottom = parts[0].trim();
        data.yAxis.top = parts[1].trim();
      }
    }
    else if (line.startsWith('quadrant-1')) data.quadrants.q1 = line.replace('quadrant-1', '').trim();
    else if (line.startsWith('quadrant-2')) data.quadrants.q2 = line.replace('quadrant-2', '').trim();
    else if (line.startsWith('quadrant-3')) data.quadrants.q3 = line.replace('quadrant-3', '').trim();
    else if (line.startsWith('quadrant-4')) data.quadrants.q4 = line.replace('quadrant-4', '').trim();
    
    else if (line.includes(':') && line.includes('[') && line.includes(']')) {
      const match = line.match(/(.+):\s*\[([\d\.]+),\s*([\d\.]+)\]/);
      if (match) {
        data.points.push({
          label: match[1].trim(),
          x: Math.min(Math.max(parseFloat(match[2]), 0), 1), 
          y: Math.min(Math.max(parseFloat(match[3]), 0), 1)
        });
      }
    }
  });

  return data;
}

// --- 2. The XML Generator ---
function generateDrawioXml(data) {
  const doc = create({ version: '1.0', encoding: 'UTF-8' })
    .ele('mxfile', { host: 'Electron', modified: new Date().toISOString(), agent: 'MermaidCLI', type: 'device' })
      .ele('diagram', { id: 'mermaid-diagram' })
        .ele('mxGraphModel', { dx: '1000', dy: '1000', grid: '1', gridSize: '10', guides: '1', tooltips: '1', connect: '1', arrows: '1', fold: '1', page: '1', pageScale: '1', pageWidth: '827', pageHeight: '1169', math: '0', shadow: '0' })
          .ele('root');

  doc.ele('mxCell', { id: '0' });
  doc.ele('mxCell', { id: '1', parent: '0' });

  let idCounter = 2;
  const addCell = (value, style, x, y, w, h, isEdge = false) => {
    const cell = doc.ele('mxCell', { id: idCounter++, value: value, style: style, parent: '1', vertex: isEdge ? null : '1', edge: isEdge ? '1' : null });
    if (!isEdge) {
      cell.ele('mxGeometry', { x: x, y: y, width: w, height: h, as: 'geometry' });
    } else {
      const geo = cell.ele('mxGeometry', { relative: '1', as: 'geometry' });
      geo.ele('mxPoint', { x: x, y: y, as: 'sourcePoint' });
      geo.ele('mxPoint', { x: w, y: h, as: 'targetPoint' });
    }
    return cell;
  };

  // --- LAYER 1: Background & Titles ---
  
  // 1. Chart Title (Moved higher up to y=10 to avoid overlap)
  addCell(data.title, 'text;html=1;strokeColor=none;fillColor=none;align=center;verticalAlign=middle;whiteSpace=wrap;rounded=0;fontSize=24;fontStyle=1', PADDING, 10, CANVAS_SIZE, 40);

  // 2. Main Container Box
  addCell('', 'rounded=0;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#666666;', PADDING, PADDING, CANVAS_SIZE, CANVAS_SIZE);

  // 3. Quadrant Watermarks
  const qW = CANVAS_SIZE / 2;
  const qH = CANVAS_SIZE / 2;
  const midX = PADDING + qW;
  const midY = PADDING + qH;
  const wmStyle = 'text;html=1;strokeColor=none;fillColor=none;align=center;verticalAlign=middle;whiteSpace=wrap;rounded=0;fontSize=20;fontColor=#e0e0e0;fontStyle=1;';
  
  addCell(data.quadrants.q2, wmStyle, PADDING, PADDING, qW, qH);
  addCell(data.quadrants.q1, wmStyle, midX, PADDING, qW, qH);
  addCell(data.quadrants.q3, wmStyle, PADDING, midY, qW, qH);
  addCell(data.quadrants.q4, wmStyle, midX, midY, qW, qH);

  // --- LAYER 2: Grid Lines ---
  addCell('', 'endArrow=none;html=1;strokeWidth=2;strokeColor=#b0b0b0;dashed=1;', midX, PADDING, midX, PADDING + CANVAS_SIZE, true);
  addCell('', 'endArrow=none;html=1;strokeWidth=2;strokeColor=#b0b0b0;dashed=1;', PADDING, midY, PADDING + CANVAS_SIZE, midY, true);

  // --- AXIS LABELS (Fixed Positioning) ---
  const lblStyle = 'text;html=1;strokeColor=none;fillColor=none;align=center;verticalAlign=middle;whiteSpace=wrap;rounded=0;fontSize=12;fontStyle=2;fontColor=#333333;';
  
  // Left Axis (Rotated or just placed left? Mermaid usually places it horizontally on the left side)
  // Moved x to PADDING - 100 to give it space
  addCell(data.xAxis.left, lblStyle + 'align=left;', PADDING, midY + 10, 150, 20); 
  
  // Right Axis
  addCell(data.xAxis.right, lblStyle + 'align=right;', PADDING + CANVAS_SIZE - 150, midY + 10, 150, 20);
  
  // Top Axis (Moved to PADDING - 30 to sit squarely between Title and Chart)
  addCell(data.yAxis.top, lblStyle, midX - 75, PADDING - 30, 150, 20);
  
  // Bottom Axis (Moved down to +10)
  addCell(data.yAxis.bottom, lblStyle, midX - 75, PADDING + CANVAS_SIZE + 10, 150, 20);

  // --- LAYER 3: Data Points ---
  data.points.forEach(p => {
    const pixelX = PADDING + (p.x * CANVAS_SIZE);
    const pixelY = PADDING + (CANVAS_SIZE - (p.y * CANVAS_SIZE)); 

    let color = '#999999'; 
    if (p.x >= 0.5 && p.y >= 0.5) color = '#28a745';      
    else if (p.x < 0.5 && p.y >= 0.5) color = '#007bff';  
    else if (p.x < 0.5 && p.y < 0.5) color = '#6c757d';   
    else if (p.x >= 0.5 && p.y < 0.5) color = '#ffc107';  

    addCell('', `ellipse;whiteSpace=wrap;html=1;aspect=fixed;fillColor=${color};strokeColor=none;`, pixelX - 6, pixelY - 6, 12, 12);
    
    // Label
    addCell(p.label, 'text;html=1;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;whiteSpace=wrap;rounded=0;fontSize=11;fontColor=#000000;fontStyle=1', pixelX + 10, pixelY - 10, 150, 20);
  });

  return doc.end({ prettyPrint: true });
}

// --- 3. CLI Driver ---
program
  .name('mermaid2drawio')
  .description('Convert Mermaid Quadrant Charts to Draw.io XML')
  .argument('<inputFile>', 'Path to the .mmd mermaid file')
  .option('-o, --output <outputFile>', 'Output file path', 'chart.drawio')
  .action((inputFile, options) => {
    try {
      if (!fs.existsSync(inputFile)) {
        throw new Error(`Input file not found: ${inputFile}`);
      }

      console.log(`Reading ${inputFile}...`);
      const content = fs.readFileSync(inputFile, 'utf-8');
      
      console.log('Parsing Mermaid syntax...');
      const parsedData = parseMermaid(content);
      
      console.log(`Found ${parsedData.points.length} data points.`);
      
      console.log('Generating Draw.io XML (Fixed Layout)...');
      const xml = generateDrawioXml(parsedData);
      
      fs.writeFileSync(options.output, xml);
      console.log(`\x1b[32mSuccess! Chart saved to: ${options.output}\x1b[0m`);
    } catch (err) {
      console.error('\x1b[31m%s\x1b[0m', 'Error:', err.message);
      process.exit(1);
    }
  });

program.parse();