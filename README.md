# The official HackMD Markdown VSCode extension

Use the same [HackMD](https://hackmd.io) markdown right in VSCode!

![Visual Studio Marketplace Installs](https://img.shields.io/visual-studio-marketplace/i/HackMD.vscode-hackmd)
![Visual Studio Marketplace Downloads](https://img.shields.io/visual-studio-marketplace/d/HackMD.vscode-hackmd)

## Features

- **New**: Preview you HackMD notes in VSCode
- **New**: Create note from editor content
- HackMD-compatible markdown rendering preview
  - We bring most HackMD markdown syntax into VSCode :tada:

### HackMD notes explorer

![sidebar](https://i.imgur.com/N5dS5HG.png)

### Render codeblock with line numbers

![line-numbers](https://i.imgur.com/X31HZqm.png)

### MathJax, Diagrams

![mathjax](https://i.imgur.com/6vpxBbo.png)
![Sequence-diagram](https://i.imgur.com/pinXrf6.png)
![mermaid](https://i.imgur.com/M15g6It.png)

## Release Notes

[Read the full Release Note on HackMD.][release-notes]

[release-notes]: https://bit.ly/2VXRTrq

### 1.1.1

#### Added

- HackMD Snippets command
  - Use command: `HackMD: Create a code snippet` to create a code snippet on HackMD from selected text range

#### Fixed

- Activity icon it not shown ([#23](https://github.com/hackmdio/vscode-hackmd/issues/23))

### 1.1.0

#### Added

- HackMD Note explorer
  - Preview your notes on HackMD
  - Create note from editor content in VSCode

### 1.0.0

Initial Release!

#### Added

- markdown-it plugins
  - markdown-it-abbr
  - markdown-it-container
  - markdown-it-deflist
  - markdown-it-ins
  - markdown-it-mark
  - markdown-it-mathjax
  - markdown-it-sub
  - markdown-it-sup
  - checkbox (As extension dependency)
  - markdown-it-emoji
  - markdown-it-footnote
  - markdown-it-imsize
- External Graph Renderer
  - Mermaid
  - Sequence Diagram
  - Flowchart
  - Graphviz
  - abc.js
  - Mathjax
