@echo off
echo ===========================================
echo  CONFIGURATION GITHUB - STOCK ANALYZER V2
echo ===========================================
echo.
echo 1. Creez d'abord un Personal Access Token sur GitHub:
echo    - Allez sur https://github.com/settings/tokens
echo    - Cliquez "Generate new token (classic)"
echo    - Nommez-le: "Stock Analyzer V2"
echo    - Cochez: repo (Full control of private repositories)
echo    - Cliquez "Generate token"
echo    - COPIEZ LE TOKEN (vous ne le reverrez plus!)
echo.
echo 2. Entrez votre token GitHub ci-dessous:
set /p GITHUB_TOKEN="Token GitHub: "
echo.
echo Configuration de Git...
git config --global user.name "GitOlivier10"
git config --global user.email "GitOlivier10@users.noreply.github.com"
echo.
echo Test de connexion...
git remote set-url origin https://GitOlivier10:%GITHUB_TOKEN%@github.com/GitOlivier10/stock-analyzer-v2.git
echo.
echo Poussée vers GitHub...
git push -u origin master
echo.
if %errorlevel% equ 0 (
    echo ✅ SUCCÈS ! Votre projet est maintenant sur GitHub:
    echo https://github.com/GitOlivier10/stock-analyzer-v2
) else (
    echo ❌ ÉCHEC ! Vérifiez votre token et réessayez.
)
echo.
pause