using UnityEngine;
using UnityEngine.SceneManagement;

public class GameManager : MonoBehaviour
{
    public static GameManager Instance { get; private set; }

    [Header("Game State")]
    public int currentScore = 0;
    public int highScore = 0;
    public bool isGameOver = false;

    [Header("Game Settings")]
    public float gameOverHeight = 7f; // Y position where game ends
    public GameObject ballPrefab;

    [Header("References")]
    public UIManager uiManager;
    public BallShooter ballShooter;

    [Header("Effects")]
    public GameObject mergeParticlePrefab;

    private const string HIGH_SCORE_KEY = "ShootMerge_HighScore";

    void Awake()
    {
        // Singleton pattern
        if (Instance == null)
        {
            Instance = this;
        }
        else
        {
            Destroy(gameObject);
            return;
        }

        LoadHighScore();
    }

    void Start()
    {
        if (uiManager != null)
        {
            uiManager.UpdateScore(currentScore);
            uiManager.UpdateHighScore(highScore);
        }

        // Start checking for game over
        InvokeRepeating(nameof(CheckGameOver), 2f, 0.5f);
    }

    public void OnBallsMerged(int newValue, Vector3 position)
    {
        // Add to score
        int pointsEarned = newValue;
        currentScore += pointsEarned;

        // Update UI
        if (uiManager != null)
        {
            uiManager.UpdateScore(currentScore);
            uiManager.ShowMergeEffect(position, "+" + pointsEarned);
        }

        // Check high score
        if (currentScore > highScore)
        {
            highScore = currentScore;
            SaveHighScore();
            if (uiManager != null)
            {
                uiManager.UpdateHighScore(highScore);
            }
        }

        // Spawn merged ball
        SpawnMergedBall(newValue, position);

        // Spawn particle effect
        if (mergeParticlePrefab != null)
        {
            GameObject particles = Instantiate(mergeParticlePrefab, position, Quaternion.identity);
            Destroy(particles, 2f);
        }
    }

    void SpawnMergedBall(int value, Vector3 position)
    {
        if (ballPrefab == null) return;

        GameObject newBall = Instantiate(ballPrefab, position, Quaternion.identity);
        NumberBall ballScript = newBall.GetComponent<NumberBall>();

        if (ballScript != null)
        {
            ballScript.Initialize(value);
            ballScript.hasBeenShot = true;

            Rigidbody2D rb = newBall.GetComponent<Rigidbody2D>();
            if (rb != null)
            {
                rb.gravityScale = 1.5f;
            }
        }
    }

    void CheckGameOver()
    {
        if (isGameOver) return;

        // Find all balls in scene
        NumberBall[] balls = FindObjectsOfType<NumberBall>();

        foreach (NumberBall ball in balls)
        {
            if (ball.hasBeenShot && ball.transform.position.y >= gameOverHeight)
            {
                // Check if ball is relatively stationary (settled)
                Rigidbody2D rb = ball.GetComponent<Rigidbody2D>();
                if (rb != null && rb.velocity.magnitude < 0.5f)
                {
                    TriggerGameOver();
                    return;
                }
            }
        }
    }

    void TriggerGameOver()
    {
        isGameOver = true;
        CancelInvoke(nameof(CheckGameOver));

        if (uiManager != null)
        {
            uiManager.ShowGameOver();
        }

        Debug.Log("Game Over! Final Score: " + currentScore);
    }

    public void RestartGame()
    {
        SceneManager.LoadScene(SceneManager.GetActiveScene().buildIndex);
    }

    void LoadHighScore()
    {
        highScore = PlayerPrefs.GetInt(HIGH_SCORE_KEY, 0);
    }

    void SaveHighScore()
    {
        PlayerPrefs.SetInt(HIGH_SCORE_KEY, highScore);
        PlayerPrefs.Save();
    }

    void OnDestroy()
    {
        if (Instance == this)
        {
            Instance = null;
        }
    }
}
