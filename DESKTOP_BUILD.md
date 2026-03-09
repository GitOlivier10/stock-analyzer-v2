# 🚀 Stock Analyzer V2 - Application Desktop

## 📦 Créer l'exécutable Windows (.exe)

### Prérequis
- Node.js installé
- Toutes les dépendances installées (`npm install`)

### 🚀 Build Rapide (Recommandé)

```bash
# Build et package en une commande
npm run dist
```

Cette commande va :
1. ✅ Builder l'application React
2. ✅ Créer l'exécutable Windows
3. ✅ Générer une version portable

### 🔧 Build Étape par Étape

```bash
# 1. Installer les dépendances
npm install

# 2. Builder l'application web
npm run build

# 3. Créer l'exécutable Windows
npm run build-electron-win

# 4. Créer une version portable (clé USB)
npm run build-electron-portable
```

### 📁 Fichiers Générés

Après le build, vous trouverez dans `dist-electron/` :

- **Installateur Windows** : `Stock-Analyzer-V2-Setup-1.0.0.exe`
- **Version Portable** : `Stock-Analyzer-V2-Portable-1.0.0.exe`

### 🖥️ Tester l'Application

```bash
# Mode développement (avec serveur séparé)
npm run electron-dev

# Application Electron seule
npm run electron
```

### 📋 Fonctionnalités de l'App Desktop

- ✅ **Application native Windows** (.exe)
- ✅ **Portable** (fonctionne sur clé USB)
- ✅ **Base de données locale** (SQLite)
- ✅ **Pas besoin de serveur web**
- ✅ **Interface complète** identique au web
- ✅ **Installation automatique** ou portable

### 🔧 Configuration

L'application stocke ses données dans :
- **Installée** : `%APPDATA%/stock-analyzer-v2/`
- **Portable** : `./data/` (même dossier que l'exe)

### 📊 Taille de l'Application

- **Installateur** : ~150-200 MB
- **Portable** : ~180-250 MB
- **Dépend de** : données stockées et icônes

### 🐛 Dépannage

**Problème** : "MSVCP140.dll manquant"
**Solution** : Installer [Visual C++ Redistributable](https://aka.ms/vs/17/release/vc_redist.x64.exe)

**Problème** : Application ne démarre pas
**Solution** : Vérifier que le dossier `data/` existe et les permissions

**Problème** : Erreur de build
**Solution** : `npm install` et vérifier Node.js version

### 🎯 Distribution

- **Pour utilisateurs** : Fournir le fichier `.exe` portable
- **Pour installation** : Utiliser l'installateur Windows
- **Pour entreprise** : Créer un MSI avec des outils supplémentaires

---

**🎉 Prêt à distribuer votre application d'analyse boursière !**