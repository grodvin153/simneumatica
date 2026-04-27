import { copyFile, mkdir, readdir } from 'fs/promises';
import { resolve } from 'path';
import { defineConfig } from 'vite';

async function listExampleFiles(sourceDir) {
  const entries = await readdir(sourceDir, { withFileTypes: true });

  return entries.filter((entry) => {
    return entry.isFile() &&
      entry.name.endsWith('.txt') &&
      entry.name !== 'ToDo.txt';
  });
}

function copyExampleSchematics() {
  return {
    name: 'copy-example-schematics',
    async closeBundle() {
      const sourceDir = resolve(__dirname, 'source');
      const outDir = resolve(__dirname, 'docs');
      const exampleFiles = await listExampleFiles(sourceDir);

      await mkdir(outDir, { recursive: true });

      await Promise.all(
        exampleFiles.map((entry) => {
          return copyFile(
            resolve(sourceDir, entry.name),
            resolve(outDir, entry.name),
          );
        }),
      );

      await copyFile(
        resolve(sourceDir, 'embedded-examples.js'),
        resolve(outDir, 'embedded-examples.js'),
      );
    },
  };
}

export default defineConfig({
  base: './',
  root: 'source',
  plugins: [copyExampleSchematics()],
  build: {
    outDir: resolve(__dirname, 'docs'),
    emptyOutDir: true, // Limpia la carpeta build antes de construir
    
    rollupOptions: {
        
      input: {
        main: resolve(__dirname, 'source/index.html'), // Entrada principal
      },        
        
      output: {
        // Deshabilita la división automática de chunks dinámicos
        inlineDynamicImports: true,
        
        // Define el formato de salida
        format: 'iife',
        
        // Opcional: Personaliza el nombre del archivo de salida
        entryFileNames: `neumatic.js`,
        
        // Opcional: Personaliza el nombre del archivo CSS si también se incluye CSS
        assetFileNames: (assetInfo) => {
          if (assetInfo.name.endsWith('.css')) {
            return 'neumatic.css';
          }
          return 'assets/[name].[extname]';
        },
      },
    },
  },
});
