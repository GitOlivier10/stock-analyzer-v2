# Stock Analyzer V2 - Guide de Distribution Portable

Ce logiciel est conçu pour être **100% portable** sur Windows 10 et 11.

## 📁 Structure du dossier final
Une fois packagé, votre dossier doit ressembler à ceci :
```
/StockAnalyzerV2/
├── StockAnalyzer.exe    # L'exécutable principal
├── data/                # Vos données (créé au premier lancement)
│   └── stock_analyzer.db
└── resources/           # Assets et fichiers système
```

## 🚀 Comment lancer le logiciel ?
1. Copiez le dossier `StockAnalyzerV2` n'importe où (Bureau, Clé USB).
2. Double-cliquez sur `StockAnalyzer.exe`.
3. C'est tout. Aucune installation n'est requise.

## 🛠️ Étapes de Build (pour le développeur)
Pour produire la version portable finale :

1. **Build du Frontend :**
   ```bash
   npm run build
   ```

2. **Packaging avec Electron Builder (recommandé) :**
   - Installez `electron` et `electron-builder`.
   - Configurez le `package.json` pour inclure le dossier `dist` et le fichier `server.ts` (compilé).
   - Lancez `electron-builder --win portable`.

3. **Alternative légère (Node Portable) :**
   - Utilisez `pkg` pour transformer le serveur Express en un `.exe`.
   - `npx pkg server.ts --targets node18-win-x64 --output StockAnalyzer.exe`

## 🔄 Migration V1 (Python) vers V2
Si vous souhaitez conserver vos modules Python complexes :
1. Gardez vos scripts Python dans un dossier `core/python/`.
2. Utilisez la bibliothèque `python-shell` dans le serveur Express pour appeler vos fonctions d'analyse.
3. Packager un interpréteur Python minimal (portable) dans le dossier `resources/`.

---
**Note :** Les données sont stockées localement dans le dossier `data/`. Pensez à sauvegarder ce dossier si vous changez de machine.
