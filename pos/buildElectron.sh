if [ -d "./release" ]; then
    rm -R release
fi

gulp bundle --release

# npm start

electron-packager . ConnectedSale --overwrite --platforn=darwin --arch=x64 --prune=true --out=release-builds