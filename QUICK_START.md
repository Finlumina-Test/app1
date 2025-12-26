# ⚡ Quick Start Guide - 5 Minutes to Play

The fastest way to get the game running in Unity!

## 📋 Prerequisites

- Unity 2021.3 or newer installed
- 10 minutes of your time

## 🚀 Ultra-Fast Setup (5 Steps)

### Step 1: Open Unity (30 seconds)
1. Open Unity Hub
2. Click "New Project"
3. Select "2D Core" template
4. Name it "ShootMerge"
5. Click "Create Project"

### Step 2: Import Scripts (1 minute)
1. Copy all files from this repository
2. Paste into your Unity project folder
3. Unity will auto-import everything

### Step 3: Create Ball Prefab (2 minutes)

**Quick version - copy this setup:**

1. GameObject → 2D Object → Sprites → Circle
2. Name: "NumberBall"
3. Add Components:
   - Click "Add Component"
   - Type "Rigidbody2D" → Add
   - Type "Circle Collider" → Add
   - Type "NumberBall" → Add

4. Add Text:
   - Right-click NumberBall → 3D Object → Text - TextMeshPro
   - (Click "Import TMP Essentials" if prompted)
   - Name: "NumberText"
   - Inspector: Position (0, 0, 0), Font Size: 4, Alignment: Center

5. Link References:
   - Select NumberBall
   - Find NumberBall script component
   - Drag "NumberText" from hierarchy to "Number Text" field
   - Drag "Sprite Renderer" component to "Sprite Renderer" field

6. Save as Prefab:
   - Create folder: Assets/Prefabs
   - Drag NumberBall from Hierarchy to Prefabs folder
   - Delete NumberBall from scene

### Step 4: Create Shooter (1 minute)

1. GameObject → Create Empty → Name: "BallShooter"
2. Position: (0, -8, 0)
3. Add Components:
   - "BallShooter" script
   - "Line Renderer"

4. Create shoot point:
   - Right-click BallShooter → Create Empty → Name: "ShootPoint"
   - Position: (0, 0.5, 0)

5. Configure:
   - Select BallShooter
   - Ball Prefab: Drag NumberBall prefab
   - Shoot Point: Drag ShootPoint object
   - Aim Line: Drag Line Renderer component

### Step 5: Add Managers & UI (1 minute)

1. **GameManager**:
   - GameObject → Create Empty → Name: "GameManager"
   - Add "GameManager" script
   - Ball Prefab: Drag NumberBall prefab
   - Ball Shooter: Drag BallShooter from hierarchy

2. **Simple UI** (optional for testing):
   - GameObject → UI → Text - TextMeshPro → Name: "ScoreText"
   - Position top-left, text: "Score: 0"

3. **UIManager**:
   - GameObject → Create Empty → Name: "UIManager"
   - Add "UIManager" script
   - Score Text: Drag ScoreText

4. **Link Everything**:
   - Select GameManager
   - UI Manager: Drag UIManager object

### ✅ Done! Press Play! ▶️

You should be able to:
- Click and drag to aim
- See trajectory line
- Shoot balls
- Watch them merge when same numbers collide

## 🐛 Troubleshooting

### "Script can't be loaded" Error
- Make sure all .cs files are in Assets/Scripts folder
- Wait for Unity to compile (bottom-right loading bar)

### Ball doesn't shoot
- Check BallShooter has Ball Prefab assigned
- Check Shoot Point exists and is positioned correctly

### No trajectory line
- Select BallShooter → Line Renderer component
- Width: 0.1
- Color: White
- Material: Default (or Sprites/Default)

### Balls don't merge
- Make sure NumberBall prefab has:
  - Rigidbody2D
  - Circle Collider 2D
  - NumberBall script

### Nothing happens when clicking
- Check Main Camera is at (0, 0, -10)
- Check EventSystem exists in hierarchy

## 🎮 Testing Checklist

Once you press Play, test these:
- [ ] Can aim and shoot balls
- [ ] Trajectory line appears when dragging
- [ ] Balls merge when same numbers collide (2+2=4)
- [ ] Score increases on merge
- [ ] New ball spawns after shooting

## 🎯 What's Next?

Now that it's working:

1. **Add Walls** (keep balls in bounds):
   - GameObject → 2D Object → Sprites → Square
   - Scale: (0.5, 20, 1)
   - Add Box Collider 2D
   - Position at left and right edges

2. **Improve UI**:
   - Follow full README.md for complete UI setup
   - Add game over panel
   - Add restart button

3. **Add Polish**:
   - Sound effects
   - Particle effects
   - Better visuals

4. **Build for Mobile**:
   - File → Build Settings
   - Switch to iOS/Android
   - Build and test on device

## 📚 Full Documentation

For complete setup with all features:
→ Read **README.md**

For selling this game:
→ Read **SELLING_GUIDE.md**

For creating different themes:
→ Read **RESKIN_GUIDE.md**

## 💬 Need Help?

Common issues and solutions:

| Problem | Solution |
|---------|----------|
| Can't add scripts | Scripts must be in Assets folder |
| Missing references | Drag components from scene/project |
| Balls fall through | Add Box Collider 2D to boundaries |
| Game too easy/hard | Adjust shootForce or gameOverHeight |

---

**🎉 Congratulations! You've got the game running!**

Now go make it your own! 🚀
