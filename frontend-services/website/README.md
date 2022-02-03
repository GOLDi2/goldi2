# This is the GOLDi 2 Web Frontend

## Prerequisites

You will need to have [nodejs](https://nodejs.org/) installed.
We also recommand to use yarn instead of npm: `npm install -g yarn`

## Dependencies

To install all dependencies simple run:
```
yarn
```

## Development
To Start development run the development task:
```
yarn run start:dev
```

## How to keep NPM and Yarn lock files in sync
Make sure that the package-lock.json is the single point of truth. Whenever the lock files needs to change, delete yarn.lock, change the package-lock.json and run `yarn import` to recreate the yarn.lock