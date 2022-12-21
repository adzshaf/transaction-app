#!/bin/bash
# rm -rf ./android/app/src/main/res/drawable-*
# react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res/

# cd android
# ./gradlew installRelease
yarn build-release
cd android
./gradlew clean
sudo rm -rf ./app/src/main/res/drawable-*

./gradlew installRelease