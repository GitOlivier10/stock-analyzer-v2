<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/54d620ce-7b37-423d-8ea2-08a1a9bb1960

## 🚀 Connexion à GitHub

### 1. Créer un repository GitHub
1. Allez sur [GitHub.com](https://github.com) et connectez-vous
2. Cliquez sur "New repository"
3. Nommez-le `stock-analyzer-v2`
4. Ne cochez pas "Add a README file" (il existe déjà)
5. Cliquez sur "Create repository"

### 2. Connecter votre projet local à GitHub
```bash
# Ajouter le remote GitHub (remplacez VOTRE_USERNAME par votre nom d'utilisateur GitHub)
git remote add origin https://github.com/VOTRE_USERNAME/stock-analyzer-v2.git

# Pousser votre code vers GitHub
git push -u origin master
```

### 3. Vérifier la connexion
Votre projet sera maintenant disponible sur `https://github.com/VOTRE_USERNAME/stock-analyzer-v2`

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
