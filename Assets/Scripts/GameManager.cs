using UnityEngine;
using UnityEngine.SceneManagement;

public class GameManager : MonoBehaviour
{
    public static GameManager Instance { get; private set; }

    [Header("Game State")]
    public int currentScore = 0;
    public int highScore = 0;
    public bool isGameOver = false;

    [Header("Settings")]
    public float gameOverHeight = 7f;
    public GameObject ballPrefab;
    public GameObject mergeParticlePrefab;

    [Header("References")]
    public UIManager uiManager;
    public BallShooter ballShooter;
    public Camera mainCamera; // For screen shake

    private const string HIGH_SCORE_KEY = "ShootMerge_HighScore";

    void Awake()
    {
        if (Instance == null) Instance = this;
        else Destroy(gameObject);

        LoadHighScore();
        if (mainCamera == null) mainCamera = Camera.main;
    }

    void Start()
    {
        if (uiManager != null)
        {
            uiManager.UpdateScore(currentScore);
            uiManager.UpdateHighScore(highScore);
        }
        InvokeRepeating(nameof(CheckGameOver), 2f, 0.5f);
    }

    public void OnBallsMerged(int newValue, Vector3 position)
    {
        int pointsEarned = newValue;
        currentScore += pointsEarned;

        if (uiManager != null)
        {
            uiManager.UpdateScore(currentScore);
            uiManager.ShowMergeEffect(position, "+" + pointsEarned);
        }

        if (currentScore > highScore)
        {
            highScore = currentScore;
            SaveHighScore();
            if (uiManager != null) uiManager.UpdateHighScore(highScore);
        }

        SpawnMergedBall(newValue, position);

        // Screen Shake & Particles
        StartCoroutine(ShakeCamera(0.1f, 0.1f));

        if (mergeParticlePrefab != null)
        {
            GameObject p = Instantiate(mergeParticlePrefab, position, Quaternion.identity);
            Destroy(p, 2f);
        }
    }

    // Screen Shake Effect
    System.Collections.IEnumerator ShakeCamera(float duration, float magnitude)
    {
        Vector3 originalPos = new Vector3(0, 0, -10); // Standard camera position
        float elapsed = 0.0f;

        while (elapsed < duration)
        {
            float x = Random.Range(-1f, 1f) * magnitude;
            float y = Random.Range(-1f, 1f) * magnitude;

            if (mainCamera != null)
                mainCamera.transform.position = originalPos + new Vector3(x, y, 0);

            elapsed += Time.deltaTime;
            yield return null;
        }

        if (mainCamera != null)
            mainCamera.transform.position = originalPos;
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
            if (rb != null) rb.gravityScale = 1.5f;

            // Pop effect (requires LeanTween or DOTween)
            // LeanTween.scale(newBall, Vector3.one * 1.2f, 0.1f).setEasePunch();
        }
    }

    void CheckGameOver()
    {
        if (isGameOver) return;

        NumberBall[] balls = FindObjectsOfType<NumberBall>();
        foreach (NumberBall ball in balls)
        {
            if (ball.hasBeenShot && ball.transform.position.y >= gameOverHeight)
            {
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

        if (AudioManager.Instance != null) AudioManager.Instance.PlayGameOver();

        // Big screen shake on game over
        StartCoroutine(ShakeCamera(0.5f, 0.3f));

        if (uiManager != null) uiManager.ShowGameOver();

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
        if (Instance == this) Instance = null;
    }
}
