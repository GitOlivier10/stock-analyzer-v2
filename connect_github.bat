@echo off
echo ===========================================
echo  CONNEXION STOCK ANALYZER V2 A GITHUB
echo ===========================================
echo.
echo 1. Creez d'abord un repository sur GitHub.com
echo    - Allez sur https://github.com/new
echo    - Nommez-le: stock-analyzer-v2
echo    - NE cochez PAS "Add a README file"
echo    - Cliquez "Create repository"
echo.
echo 2. Ensuite, entrez votre nom d'utilisateur GitHub:
set /p GITHUB_USER="Votre nom d'utilisateur GitHub: "
echo.
echo Connexion en cours...
git remote add origin https://github.com/%GITHUB_USER%/stock-analyzer-v2.git
echo.
echo Poussée vers GitHub...
git push -u origin master
echo.
echo ✅ Terminé! Votre projet est maintenant sur GitHub:
echo https://github.com/%GITHUB_USER%/stock-analyzer-v2
echo.
pause