using UnityEngine;
using TMPro;

public class NumberBall : MonoBehaviour
{
    [Header("Ball Properties")]
    public int numberValue = 2;
    public bool hasBeenShot = false;
    public bool canMerge = true;

    [Header("References")]
    public TextMeshPro numberText;
    public SpriteRenderer spriteRenderer;

    private Rigidbody2D rb;
    private CircleCollider2D col;

    // Color scheme for different numbers
    private Color[] numberColors = new Color[]
    {
        new Color(0.93f, 0.89f, 0.85f), // 2 - Light beige
        new Color(0.93f, 0.87f, 0.78f), // 4 - Tan
        new Color(0.95f, 0.69f, 0.47f), // 8 - Orange
        new Color(0.96f, 0.58f, 0.39f), // 16 - Dark orange
        new Color(0.96f, 0.49f, 0.37f), // 32 - Red-orange
        new Color(0.96f, 0.37f, 0.23f), // 64 - Red
        new Color(0.93f, 0.81f, 0.45f), // 128 - Yellow
        new Color(0.93f, 0.78f, 0.31f), // 256 - Gold
        new Color(0.93f, 0.76f, 0.18f), // 512 - Dark gold
        new Color(0.93f, 0.73f, 0.02f), // 1024 - Bronze
        new Color(0.93f, 0.71f, 0.00f), // 2048 - Deep gold
    };

    void Awake()
    {
        rb = GetComponent<Rigidbody2D>();
        col = GetComponent<CircleCollider2D>();

        if (rb == null)
        {
            rb = gameObject.AddComponent<Rigidbody2D>();
        }

        if (col == null)
        {
            col = gameObject.AddComponent<CircleCollider2D>();
        }

        // Configure rigidbody
        rb.gravityScale = 0; // No gravity until shot
        rb.collisionDetectionMode = CollisionDetectionMode2D.Continuous;

        UpdateVisuals();
    }

    public void Initialize(int value)
    {
        numberValue = value;
        UpdateVisuals();
    }

    public void Shoot(Vector2 direction, float force)
    {
        hasBeenShot = true;
        rb.gravityScale = 1.5f; // Enable gravity when shot
        rb.AddForce(direction * force, ForceMode2D.Impulse);

        // Enable merge after a short delay to prevent immediate merging
        Invoke(nameof(EnableMerge), 0.1f);
    }

    private void EnableMerge()
    {
        canMerge = true;
    }

    public void UpdateVisuals()
    {
        if (numberText != null)
        {
            numberText.text = numberValue.ToString();
        }

        if (spriteRenderer != null)
        {
            // Calculate color index based on power of 2
            int colorIndex = Mathf.Min((int)Mathf.Log(numberValue, 2) - 1, numberColors.Length - 1);
            colorIndex = Mathf.Max(0, colorIndex);
            spriteRenderer.color = numberColors[colorIndex];
        }
    }

    void OnCollisionEnter2D(Collision2D collision)
    {
        if (!hasBeenShot || !canMerge) return;

        NumberBall otherBall = collision.gameObject.GetComponent<NumberBall>();

        if (otherBall != null && otherBall.canMerge && otherBall.numberValue == numberValue)
        {
            // Only one ball handles the merge to avoid double-merging
            if (GetInstanceID() > otherBall.GetInstanceID())
            {
                MergeBalls(otherBall);
            }
        }
    }

    private void MergeBalls(NumberBall otherBall)
    {
        // Prevent further merges
        canMerge = false;
        otherBall.canMerge = false;

        // Calculate merge position (midpoint)
        Vector3 mergePosition = (transform.position + otherBall.transform.position) / 2;

        // Create new merged ball
        int newValue = numberValue * 2;

        // Notify game manager
        GameManager.Instance?.OnBallsMerged(newValue, mergePosition);

        // Destroy both balls
        Destroy(otherBall.gameObject);
        Destroy(gameObject);
    }

    void OnBecameInvisible()
    {
        // Clean up balls that fall off screen
        if (hasBeenShot && transform.position.y < -10)
        {
            Destroy(gameObject);
        }
    }
}
