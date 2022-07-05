#!/bin/bash
yarn build-debug
cd android
./gradlew installDebug
