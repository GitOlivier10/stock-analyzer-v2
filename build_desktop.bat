@echo off
echo ===========================================
echo  STOCK ANALYZER V2 - BUILD DESKTOP
echo ===========================================
echo.
echo Construction de l'application desktop...
echo.

echo Étape 1: Installation des dépendances...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Erreur lors de l'installation des dépendances
    pause
    exit /b 1
)
echo ✅ Dépendances installées
echo.

echo Étape 2: Build de l'application web...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Erreur lors du build web
    pause
    exit /b 1
)
echo ✅ Application web buildée
echo.

echo Étape 3: Création de l'exécutable portable...
call npm run build-electron-portable
if %errorlevel% neq 0 (
    echo ❌ Erreur lors de la création de l'exécutable
    pause
    exit /b 1
)
echo ✅ Exécutable créé avec succès !
echo.

echo ===========================================
echo  🎉 BUILD TERMINÉ !
echo ===========================================
echo.
echo Fichiers générés dans le dossier dist-electron/ :
echo - Stock-Analyzer-V2-Portable-1.0.0.exe (VERSION PORTABLE)
echo.
echo 📁 Ce fichier peut être copié sur une clé USB
echo 🖥️  Double-cliquez pour lancer l'application
echo 💾 Données stockées dans ./data/ (même dossier)
echo.
echo 🔗 Repository GitHub:
echo https://github.com/GitOlivier10/stock-analyzer-v2
echo.
pause