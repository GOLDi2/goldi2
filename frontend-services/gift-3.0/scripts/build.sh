rm -rf build http-dist node_modules
npm ci
npm run build
mkdir -p http-dist
cp -r build/release/* http-dist