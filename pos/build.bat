rmdir /s /q "release"
REM rmdir /s /q "..\dll\webdesktop\"
gulp bundle --release

REM mkdir "e:\connectedsale\trunk\dll\webdesktop\"
REM xcopy /s/e "release" "e:\connectedsale\trunk\dll\webdesktop\"
REM npm start
REM electron-packager . ConnectedSale --overwrite --arch=x64 --prune=true --out=release-builds --icon=./app/img/csale.ico