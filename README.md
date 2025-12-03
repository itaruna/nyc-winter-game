# NYC Winter Wonderland

A whimsical 3D browser game set in a magical winter version of New York City. Skate through iconic locations collecting ornaments while enjoying the festive holiday atmosphere.

## Play Now

**Live at:** https://itaruna.github.io/nyc-winter-game/

## Features

- **Four NYC locations** - Bryant Park, Rockefeller Center, 151 W 42nd St, and 1 Penn Plaza
- **Smooth ice skating physics** - Glide around with realistic momentum
- **12 named analysts to find** - Each ornament is named and spawns randomly each game
- **Win condition** - Collect all 12 analysts to trigger a celebratory fireworks display
- **Atmospheric effects** - Falling snow and magical floating orbs
- **AI ice skaters** - Watch other skaters glide around the rinks
- **NYC details** - Hot dog cart, benches, street lamps, Christmas tree, and skyline backdrop

## Running Locally

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- Python 3 (for the local server) or any static file server

### Quick Start

1. Clone the repository:
   ```bash
   git clone https://github.com/itaruna/nyc-winter-game.git
   cd nyc-winter-game
   ```

2. Start a local server:
   ```bash
   python3 -m http.server 8000
   ```

3. Open your browser and navigate to:
   ```
   http://localhost:8000
   ```

### Alternative Servers

If you don't have Python, you can use any static file server:

**Node.js (npx):**
```bash
npx serve
```

**Node.js (http-server):**
```bash
npx http-server
```

**PHP:**
```bash
php -S localhost:8000
```

## Controls

| Key | Action |
|-----|--------|
| W / Arrow Up | Skate forward |
| S / Arrow Down | Skate backward |
| A / Arrow Left | Skate left |
| D / Arrow Right | Skate right |
| Space | Jump |
| Mouse | Look around |
| Click | Start game / Lock cursor |
| Esc | Unlock cursor |

## How to Play

1. Click anywhere to start and lock your cursor
2. Use WASD or arrow keys to skate around the winter wonderland
3. Find all 12 named analyst ornaments floating throughout the city
4. Visit Bryant Park, Rockefeller Center, 151 W 42nd St, and 1 Penn Plaza
5. Collect all analysts to win and see the fireworks celebration!

## Deployment

This game is hosted on GitHub Pages.

### GitHub Pages Setup

The site is deployed from the `gh-pages` branch. To set up GitHub Pages:

1. Enable GitHub Pages via the GitHub CLI:
   ```bash
   gh api repos/OWNER/REPO/pages --method POST -F source='{"branch":"gh-pages","path":"/"}'
   ```

2. Or enable it in the GitHub UI:
   - Go to Settings > Pages
   - Set Source to "Deploy from a branch"
   - Select `gh-pages` branch and `/ (root)` folder

### Useful Commands

**Push changes to live site:**
```bash
git push origin main:gh-pages
```

**Check deployment status:**
```bash
gh api repos/itaruna/nyc-winter-game/pages
```

**View GitHub Pages URL:**
```bash
gh api repos/itaruna/nyc-winter-game/pages --jq '.html_url'
```

**Full deploy workflow:**
```bash
# Commit changes
git add .
git commit -m "Your commit message"

# Push to main
git push origin main

# Deploy to GitHub Pages
git push origin main:gh-pages
```

## Tech Stack

- [Three.js](https://threejs.org/) - 3D graphics library
- Vanilla JavaScript - No build step required
- HTML5 / CSS3
- GitHub Pages - Static hosting

## Project Structure

```
nyc-winter-game/
├── index.html    # Main HTML file with UI overlay
├── game.js       # Three.js game logic
├── README.md     # This file
└── .claude/
    └── CLAUDE.md # Git best practices for AI assistance
```

## License

MIT
