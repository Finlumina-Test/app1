using UnityEngine;
using TMPro;

public class NumberBall : MonoBehaviour
{
    public int numberValue = 2;
    public bool hasBeenShot = false;
    public bool canMerge = true;

    [Header("References")]
    public TextMeshPro numberText;
    public SpriteRenderer spriteRenderer;

    private Rigidbody2D rb;

    // Updated Colors for better visual pop
    private Color[] numberColors = new Color[]
    {
        new Color(0.93f, 0.89f, 0.85f), // 2
        new Color(0.93f, 0.87f, 0.78f), // 4
        new Color(0.95f, 0.69f, 0.47f), // 8
        new Color(0.96f, 0.58f, 0.39f), // 16
        new Color(0.96f, 0.49f, 0.37f), // 32
        new Color(0.96f, 0.37f, 0.23f), // 64
        new Color(0.93f, 0.81f, 0.45f), // 128
        new Color(0.93f, 0.78f, 0.31f), // 256
        new Color(0.93f, 0.76f, 0.18f), // 512
        new Color(0.93f, 0.73f, 0.02f), // 1024
        new Color(0.93f, 0.71f, 0.00f), // 2048
    };

    void Awake()
    {
        rb = GetComponent<Rigidbody2D>();
        if (rb == null) rb = gameObject.AddComponent<Rigidbody2D>();

        rb.gravityScale = 0;
        rb.collisionDetectionMode = CollisionDetectionMode2D.Continuous; // Better physics

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
        rb.gravityScale = 1.5f;
        rb.AddForce(direction * force, ForceMode2D.Impulse);
        Invoke(nameof(EnableMerge), 0.1f);
    }

    private void EnableMerge() => canMerge = true;

    void UpdateVisuals()
    {
        if (numberText != null) numberText.text = numberValue.ToString();

        if (spriteRenderer != null)
        {
            int colorIndex = Mathf.Clamp((int)Mathf.Log(numberValue, 2) - 1, 0, numberColors.Length - 1);
            spriteRenderer.color = numberColors[colorIndex];
        }
    }

    void OnCollisionEnter2D(Collision2D collision)
    {
        if (!hasBeenShot || !canMerge) return;

        NumberBall otherBall = collision.gameObject.GetComponent<NumberBall>();

        if (otherBall != null && otherBall.canMerge && otherBall.numberValue == numberValue)
        {
            if (GetInstanceID() > otherBall.GetInstanceID())
            {
                MergeBalls(otherBall);
            }
        }
    }

    private void MergeBalls(NumberBall otherBall)
    {
        canMerge = false;
        otherBall.canMerge = false;

        Vector3 mergePosition = (transform.position + otherBall.transform.position) / 2;
        int newValue = numberValue * 2;

        // Audio Hook
        if (AudioManager.Instance != null) AudioManager.Instance.PlayMerge(newValue);

        GameManager.Instance?.OnBallsMerged(newValue, mergePosition);

        Destroy(otherBall.gameObject);
        Destroy(gameObject);
    }
}
