# Create and share your Overwatch 2 Stadium Builds!

## Visit here: [owbuildplanner.com](https://www.owbuildplanner.com)

## Credits

Website, and text content ripped by myself.

Assets ripped by [Leafcyn](https://leafycn.carrd.co/) (BIG THANKS, WOULDN'T HAVE DONE IT WITHOUT YOUR HELP)

## Asset Usage

Since it took an awful lot of time and effort to rip these assets from the stadium game mode, it would be wonderful if you credit myself and/or [Leafcyn](https://leafycn.carrd.co/) in your project! :)

## Installation & Setup

1. Make sure you have Node 18 installed
2. Clone the repository
3. Run `npm install` to install dependencies
4. Run `npm start` to start the development server
5. Visit `https://localhost:3000` in your browser to view the website

## Development Guidelines

### Updating Content
- **Items/Powers**: Use armory-manager.html and load `/static/data/data-original.json`
- **Heroes**: Use hero-builder.html and edit `/static/data/heroes-original.json`
- After modifying any data files, run: `npm run build:ids`

### Asset Management
- When updating image assets:
    1. Add your new asset file
    2. Run `npm run build:assets`
    3. Commit and push both the new asset and the generated `assets.zip` file

### Branch Management
- The [playground branch](https://github.com/legovader09/OW-Stadium-Build-Planner/tree/playground) is designated for experimental development and proof-of-concept testing.
  - The playground can be accessed here: [playground.owbuildplanner.com](https://playground.owbuildplanner.com)
- The staging branch is reserved for production-ready code changes and should be used for all official pull requests

## TODO:
- [ ] Fix health calculation inconsistency with in-game results (% health, armor, shield items have a strange way of calculating)
- [ ] Implement stat boosts from powers (like Sleep Regimen and Permafrost)
