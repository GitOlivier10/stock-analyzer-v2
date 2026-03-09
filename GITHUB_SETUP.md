# 🔐 Configuration GitHub - Stock Analyzer V2

## ⚠️ IMPORTANT: Authentification GitHub Requise

GitHub nécessite maintenant un **Personal Access Token (PAT)** pour l'authentification.

## 📋 Étapes à suivre:

### 1. Créer un Personal Access Token

1. **Allez sur GitHub:**
   - Ouvrez https://github.com/settings/tokens dans votre navigateur
   - Connectez-vous si nécessaire

2. **Générez un nouveau token:**
   - Cliquez sur "Generate new token (classic)"
   - **Note:** Choisissez "classic" (pas "fine-grained")

3. **Configurez le token:**
   - **Name:** `Stock Analyzer V2`
   - **Expiration:** `No expiration` (ou choisissez une durée)
   - **Scopes:** Cochez uniquement `repo` (Full control of private repositories)

4. **Créez et sauvegardez:**
   - Cliquez "Generate token"
   - **⚠️ COPIEZ IMMÉDIATEMENT LE TOKEN** (il disparaîtra après)

### 2. Exécuter le script de configuration

```bash
# Double-cliquez sur le fichier ou exécutez:
./setup_github.bat
```

Le script vous demandera votre token et configurera automatiquement Git.

### 3. Vérification

Une fois terminé, votre projet sera accessible sur:
**https://github.com/GitOlivier10/stock-analyzer-v2**

## 🔧 Commandes alternatives (si le script ne fonctionne pas):

```bash
# 1. Configurer Git
git config --global user.name "GitOlivier10"
git config --global user.email "GitOlivier10@users.noreply.github.com"

# 2. Configurer le remote avec votre token
git remote set-url origin https://GitOlivier10:VOTRE_TOKEN@github.com/GitOlivier10/stock-analyzer-v2.git

# 3. Pousser
git push -u origin master
```

## ❓ Problèmes courants:

- **"Authentication failed"**: Vérifiez que le token est correct
- **"Repository not found"**: Assurez-vous d'avoir créé le repo sur GitHub
- **"Permission denied"**: Vérifiez que le token a les droits "repo"

## 🎯 Résultat attendu:

Après succès, vous verrez:
```
✅ SUCCÈS ! Votre projet est maintenant sur GitHub:
https://github.com/GitOlivier10/stock-analyzer-v2
```