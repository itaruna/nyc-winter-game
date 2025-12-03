# NYC Winter Wonderland

A whimsical 3D browser game set in a magical winter version of New York City. Skate through Bryant Park and Rockefeller Center, collecting golden ornaments while enjoying the festive holiday atmosphere.

## Features

- **Two iconic NYC locations** - Bryant Park ice rink and Rockefeller Center with its famous Christmas tree
- **Smooth ice skating physics** - Glide around with realistic momentum
- **Collectible ornaments** - Find all 16 golden ornaments scattered throughout the city
- **Win condition** - Collect all ornaments to trigger a celebratory fireworks display
- **Atmospheric effects** - Falling snow, twinkling lights, and magical floating orbs
- **AI ice skaters** - Watch other skaters glide around the rinks
- **NYC details** - Hot dog cart, benches, street lamps, and a skyline backdrop

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
3. Collect all 16 golden ornaments floating throughout the city
4. Visit both Bryant Park and Rockefeller Center
5. Collect all ornaments to win and see the fireworks celebration!

## Tech Stack

- [Three.js](https://threejs.org/) - 3D graphics library
- Vanilla JavaScript - No build step required
- HTML5 / CSS3

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
