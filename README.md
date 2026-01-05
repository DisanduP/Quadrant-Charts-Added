# Mermaid Quadrant Chart to Draw.io Converter

A Node.js CLI tool that converts Mermaid quadrant chart syntax (.mmd files) into Draw.io XML format for easy visualization and editing.

## Features

- Parse Mermaid quadrant chart syntax
- Generate Draw.io compatible XML files
- Support for titles, axis labels, quadrant names, and data points
- Automatic layout with proper scaling and positioning

## Installation

1. Clone or download the project files
2. Install dependencies:
   ```bash
   npm install
   ```

## Usage

```bash
node converter.js <inputFile> [-o outputFile]
```

### Arguments

- `inputFile`: Path to the .mmd Mermaid file (required)
- `-o, --output <outputFile>`: Output file path (optional, defaults to `chart.drawio`)

### Examples

```bash
# Convert a quadrant chart
node converter.js health-goals.mmd -o health-goals.drawio

# Use default output name
node converter.js innovation-portfolio.mmd
```

## Mermaid Quadrant Chart Format

The converter expects .mmd files with the following syntax:

```
title Your Chart Title
x-axis Low Value --> High Value
y-axis Low Impact --> High Impact
quadrant-1 Top Right Quadrant
quadrant-2 Top Left Quadrant
quadrant-3 Bottom Left Quadrant
quadrant-4 Bottom Right Quadrant

Point Label: [x, y]
Another Point: [0.5, 0.8]
```

### Format Details

- **Title**: `title Your Title Here`
- **X-Axis**: `x-axis Left Label --> Right Label`
- **Y-Axis**: `y-axis Bottom Label --> Top Label`
- **Quadrants**: `quadrant-1` through `quadrant-4` (clockwise from top-right)
- **Data Points**: `Label: [x, y]` where x,y are floats from 0.0 to 1.0

## Generated Files

This project includes several example quadrant charts:

- `health-goals.mmd` / `health-goals.drawio` - Personal health goals matrix
- `innovation-portfolio.mmd` / `innovation-portfolio.drawio` - Innovation project portfolio
- `project-portfolio.mmd` / `project-portfolio.drawio` - Project management matrix
- `supplier-evaluation.mmd` / `supplier-evaluation.drawio` - Supplier assessment
- `time-management.mmd` / `time-management.drawio` - Eisenhower time management matrix
- `marketing-channels.mmd` / `marketing-channels.drawio` - Marketing effectiveness analysis

## Opening in Draw.io

1. Go to [draw.io](https://www.draw.io) or [diagrams.net](https://www.diagrams.net)
2. Click "Open Existing Diagram"
3. Select the .drawio file
4. The quadrant chart will load with proper layout and styling

## Dependencies

- [commander](https://www.npmjs.com/package/commander) - CLI argument parsing
- [xmlbuilder2](https://www.npmjs.com/package/xmlbuilder2) - XML generation

## License

ISC
