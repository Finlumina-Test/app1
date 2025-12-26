using UnityEngine;
using TMPro;
using UnityEngine.UI;

public class UIManager : MonoBehaviour
{
    [Header("Score Display")]
    public TextMeshProUGUI scoreText;
    public TextMeshProUGUI highScoreText;

    [Header("Game Over")]
    public GameObject gameOverPanel;
    public TextMeshProUGUI finalScoreText;
    public Button restartButton;

    [Header("Merge Effect")]
    public GameObject mergeTextPrefab;
    public Canvas worldCanvas;

    void Start()
    {
        if (gameOverPanel != null)
        {
            gameOverPanel.SetActive(false);
        }

        if (restartButton != null)
        {
            restartButton.onClick.AddListener(OnRestartClicked);
        }
    }

    public void UpdateScore(int score)
    {
        if (scoreText != null)
        {
            scoreText.text = "Score: " + score.ToString();
        }
    }

    public void UpdateHighScore(int highScore)
    {
        if (highScoreText != null)
        {
            highScoreText.text = "Best: " + highScore.ToString();
        }
    }

    public void ShowGameOver()
    {
        if (gameOverPanel != null)
        {
            gameOverPanel.SetActive(true);

            if (finalScoreText != null && GameManager.Instance != null)
            {
                finalScoreText.text = "Final Score: " + GameManager.Instance.currentScore.ToString();
            }
        }
    }

    public void ShowMergeEffect(Vector3 worldPosition, string text)
    {
        if (mergeTextPrefab == null || worldCanvas == null) return;

        GameObject textObj = Instantiate(mergeTextPrefab, worldCanvas.transform);
        TextMeshProUGUI textComponent = textObj.GetComponent<TextMeshProUGUI>();

        if (textComponent != null)
        {
            textComponent.text = text;

            // Convert world position to screen position
            RectTransform rectTransform = textObj.GetComponent<RectTransform>();
            if (rectTransform != null)
            {
                Vector2 screenPos = Camera.main.WorldToScreenPoint(worldPosition);
                rectTransform.position = screenPos;

                // Animate upward and fade
                LeanTween.moveY(rectTransform, screenPos.y + 100f, 1f).setEaseOutQuad();
                LeanTween.alpha(rectTransform, 0f, 1f).setEaseInQuad();
            }
        }

        Destroy(textObj, 1f);
    }

    void OnRestartClicked()
    {
        if (GameManager.Instance != null)
        {
            GameManager.Instance.RestartGame();
        }
    }
}
