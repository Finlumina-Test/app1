# Shoot & Merge - 2048 Ball Shooter Game

A unique twist on 2048 that combines bubble shooter mechanics with number merging gameplay. Shoot numbered balls upward, match identical numbers to merge them and score points!

## 🎮 Game Features

- **Physics-Based Shooting**: Drag and aim to shoot balls with realistic physics
- **Number Merging**: Match identical numbers (2+2=4, 4+4=8, etc.)
- **Visual Trajectory**: See exactly where your ball will go
- **Score System**: Earn points for every merge, track your high score
- **Color-Coded Numbers**: Each number tier has its own distinct color
- **Particle Effects**: Satisfying visual feedback on merges
- **Game Over Detection**: Game ends when balls stack too high

## 📁 Project Structure

```
Assets/
├── Scripts/
│   ├── NumberBall.cs          - Individual ball behavior & merge logic
│   ├── BallShooter.cs         - Shooting mechanics & aiming
│   ├── GameManager.cs         - Game state, scoring, game over
│   ├── UIManager.cs           - UI updates & animations
│   └── SimpleMergeParticle.cs - Particle effects on merge
├── Prefabs/
├── Scenes/
└── Materials/
```

## 🛠️ Unity Setup Instructions

### Prerequisites
- Unity 2021.3 or newer (2D template recommended)
- TextMeshPro package (should auto-import)

### Step 1: Create the Scene

1. **Create a new 2D Scene** or open an existing one
2. **Set up the Camera**:
   - Position: (0, 0, -10)
   - Size: 10 (orthographic)
   - Background: Your choice (dark blue recommended)

### Step 2: Create the Ball Prefab

1. **Create a new GameObject** → 2D Object → Sprites → Circle
2. **Rename** it to "NumberBall"
3. **Add Components**:
   - Rigidbody2D (set Gravity Scale to 0 initially)
   - Circle Collider 2D
   - Add script: `NumberBall.cs`

4. **Add Text for Number Display**:
   - Right-click NumberBall → 3D Object → Text - TextMeshPro
   - Rename to "NumberText"
   - Set position: (0, 0, -0.1)
   - Font size: 3-4
   - Alignment: Center
   - Color: Dark (e.g., #3C3A32)

5. **Configure NumberBall Script**:
   - Drag NumberText to "Number Text" field
   - Drag SpriteRenderer to "Sprite Renderer" field

6. **Save as Prefab**: Drag NumberBall to Prefabs folder
7. **Delete** from scene (we'll spawn it via script)

### Step 3: Create the Shooter

1. **Create Empty GameObject** → Rename to "BallShooter"
2. **Position**: (0, -8, 0) - bottom of screen
3. **Add Components**:
   - Add script: `BallShooter.cs`
   - Add Component: Line Renderer

4. **Configure Line Renderer**:
   - Width: 0.1
   - Color: White with transparency
   - Material: Default Sprites/Default

5. **Create Shoot Point**:
   - Create child empty GameObject under BallShooter
   - Rename to "ShootPoint"
   - Position: (0, 0.5, 0)

6. **Configure BallShooter Script**:
   - Shoot Force: 15
   - Ball Prefab: Drag your NumberBall prefab
   - Shoot Point: Drag ShootPoint object
   - Aim Line: Drag Line Renderer component
   - Aim Line Segments: 20

### Step 4: Create Game Manager

1. **Create Empty GameObject** → Rename to "GameManager"
2. **Add script**: `GameManager.cs`
3. **Create Particle Prefab**:
   - Create Empty GameObject → Rename "MergeParticle"
   - Add script: `SimpleMergeParticle.cs`
   - Configure: Particle Count: 20, Explosion Force: 5, Color: Yellow
   - Save as Prefab in Prefabs folder
   - Delete from scene

4. **Configure GameManager**:
   - Game Over Height: 7
   - Ball Prefab: Your NumberBall prefab
   - Merge Particle Prefab: Your MergeParticle prefab
   - Ball Shooter: Drag BallShooter object from scene
   - Main Camera: Drag Main Camera (for screen shake effect)

5. **Create AudioManager**:
   - Create Empty GameObject → Rename "AudioManager"
   - Add script: `AudioManager.cs`
   - Audio clips will auto-create if not assigned
   - **Optional**: Add your own sound effects:
     - Shoot Clip: .wav/.mp3 file for shooting sound
     - Merge Clip: .wav/.mp3 file for merge sound
     - Game Over Clip: .wav/.mp3 file for game over
   - **Note**: Game works without audio files (silent mode)

### Step 5: Create UI

1. **Create Canvas** (should auto-create EventSystem)
   - Canvas Scaler → UI Scale Mode: Scale With Screen Size
   - Reference Resolution: 1080 x 1920

2. **Create Score Text** (Canvas → Right-click → UI → Text - TextMeshPro):
   - Rename: "ScoreText"
   - Position: Top-left
   - Text: "Score: 0"
   - Font Size: 48
   - Alignment: Left

3. **Create High Score Text**:
   - Same as Score, position top-right
   - Text: "Best: 0"

4. **Create Game Over Panel**:
   - UI → Panel → Rename "GameOverPanel"
   - Background: Semi-transparent black
   - Add child Text: "Game Over" (large, centered)
   - Add child Text: "FinalScoreText"
   - Add child Button: "Restart"

5. **Create World Canvas** (for floating merge text):
   - Create new Canvas
   - Rename: "WorldCanvas"
   - Render Mode: Screen Space - Camera
   - Render Camera: Drag Main Camera

6. **Create Merge Text Prefab**:
   - Create UI → Text - TextMeshPro under WorldCanvas
   - Rename: "MergeText"
   - Font Size: 40
   - Color: Yellow
   - Save as Prefab
   - Delete from scene

7. **Create UIManager GameObject**:
   - Create Empty → Rename "UIManager"
   - Add script: `UIManager.cs`
   - Assign all UI references

8. **Link UIManager to GameManager**:
   - Select GameManager
   - Drag UIManager to "UI Manager" field

### Step 6: Add Boundaries (Optional but Recommended)

1. **Create walls** to keep balls in play:
   - Create 2D → Sprites → Square
   - Scale: (0.5, 20, 1)
   - Position: Left (-9, 0, 0) and Right (9, 0, 0)
   - Add Box Collider 2D

2. **Create ceiling**:
   - Same as walls but horizontal
   - Position: (0, 10, 0)
   - Scale: (20, 0.5, 1)

### Step 7: Physics Settings

1. **Edit → Project Settings → Physics 2D**:
   - Gravity Y: -9.81 (default)
   - Default Material: Create Physics Material 2D
     - Friction: 0.4
     - Bounciness: 0.3

## 🎯 How to Play

1. **Aim**: Click/touch and drag to aim
2. **Shoot**: Release to shoot the ball
3. **Merge**: Hit matching numbers to merge (2+2=4, 4+4=8, etc.)
4. **Score**: Each merge adds points equal to the new number value
5. **Survive**: Don't let balls stack above the danger line!

## 🎨 Customization Ideas for Reskinning

### Easy Reskins (High Marketable):
- **Fruit Merge**: Replace numbers with fruit sprites
- **Emoji Merge**: Use emoji instead of numbers
- **Candy Crush Style**: Colorful candy graphics
- **Space Theme**: Planets merging
- **Sports Balls**: Basketball, soccer ball themes

### Number Tweaks:
- Change starting values (4, 8 instead of 2, 4)
- Adjust merge scoring multipliers
- Modify ball spawn probabilities in `BallShooter.cs` → `possibleValues` array

### Difficulty Mods:
- Change `shootForce` in BallShooter
- Adjust `gameOverHeight` in GameManager
- Modify gravity scale in NumberBall

### What Makes This Valuable:
✅ **Unique Mechanic** - Not just another 2048 clone
✅ **Easy to Reskin** - Change visuals without touching code
✅ **Mobile Ready** - Touch controls built-in
✅ **Proven Concept** - Combines two popular genres
✅ **Complete Game Loop** - Score, game over, restart
✅ **Clean Code** - Well-commented, easy to modify

### Recommended Additions Before Selling:
- [ ] Sound effects (shoot, merge, game over)
- [ ] Background music
- [ ] Juice/polish (screen shake, better particles)
- [ ] Power-ups (wild card ball, bomb to clear area)
- [ ] Progressive difficulty
- [ ] Ads integration (Unity Ads)
- [ ] In-app purchases (remove ads, skins)

## 📝 Code Notes

- **No External Dependencies**: Uses only Unity built-in packages
- **TextMeshPro**: Only dependency (auto-installed in Unity)
- **LeanTween**: UIManager uses LeanTween for animations (optional - can replace with simple coroutines if needed)

## 🚀 Next Steps

1. **Add Polish**: Juice it up with better VFX and SFX
2. **Mobile Build**: Test on actual devices
3. **Monetization**: Integrate ads and IAP
4. **More Variations**: Build the other two variants (Tetris-style, Hexagonal)

## 📄 License

This is a template for commercial use. Modify and sell as you wish!

---

**Built for resale on SellMyApp.com** 🎯
**Easy to customize • Mobile ready • Complete game loop**
