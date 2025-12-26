using UnityEngine;

public class BallShooter : MonoBehaviour
{
    [Header("Shooting Settings")]
    public float shootForce = 15f;
    public float maxAimDistance = 3f;
    public GameObject ballPrefab;

    [Header("Ball Spawn")]
    public Transform shootPoint;
    public int[] possibleValues = { 2, 2, 2, 4, 4, 8 }; // Weighted probability

    [Header("Visual Feedback")]
    public LineRenderer aimLine;
    public int aimLineSegments = 20;
    public float aimLineLength = 5f;

    private NumberBall currentBall;
    private Vector2 shootDirection;
    private bool isDragging = false;
    private Camera mainCamera;

    void Start()
    {
        mainCamera = Camera.main;
        SpawnNewBall();

        if (aimLine != null)
        {
            aimLine.positionCount = aimLineSegments;
            aimLine.enabled = false;
        }
    }

    void Update()
    {
        if (GameManager.Instance != null && GameManager.Instance.isGameOver)
        {
            return;
        }

        HandleInput();
    }

    void HandleInput()
    {
        // Mouse/Touch input
        if (Input.GetMouseButtonDown(0))
        {
            isDragging = true;
        }

        if (Input.GetMouseButton(0) && isDragging)
        {
            UpdateAim();
        }

        if (Input.GetMouseButtonUp(0) && isDragging)
        {
            ShootBall();
            isDragging = false;
        }
    }

    void UpdateAim()
    {
        Vector3 mousePos = mainCamera.ScreenToWorldPoint(Input.mousePosition);
        mousePos.z = 0;

        Vector2 direction = (mousePos - shootPoint.position).normalized;

        // Restrict shooting to upward directions only
        if (direction.y < 0.1f)
        {
            direction.y = 0.1f;
            direction.Normalize();
        }

        shootDirection = direction;

        // Show aim line
        if (aimLine != null)
        {
            aimLine.enabled = true;
            DrawTrajectory();
        }
    }

    void DrawTrajectory()
    {
        Vector3 startPos = shootPoint.position;
        Vector3 velocity = shootDirection * shootForce;

        for (int i = 0; i < aimLineSegments; i++)
        {
            float time = i * 0.1f;

            // Physics calculation: position = initialPos + velocity*time + 0.5*gravity*time^2
            Vector3 pos = startPos + velocity * time;
            pos.y += 0.5f * Physics2D.gravity.y * 1.5f * time * time; // 1.5f is gravity scale

            aimLine.SetPosition(i, pos);
        }
    }

    void ShootBall()
    {
        if (currentBall != null && shootDirection != Vector2.zero)
        {
            currentBall.Shoot(shootDirection, shootForce);

            if (aimLine != null)
            {
                aimLine.enabled = false;
            }

            // Spawn next ball after a short delay
            Invoke(nameof(SpawnNewBall), 0.5f);
            currentBall = null;
        }
    }

    void SpawnNewBall()
    {
        if (ballPrefab == null || shootPoint == null)
        {
            Debug.LogError("Ball prefab or shoot point not assigned!");
            return;
        }

        GameObject ballObj = Instantiate(ballPrefab, shootPoint.position, Quaternion.identity);
        currentBall = ballObj.GetComponent<NumberBall>();

        if (currentBall != null)
        {
            // Random value from weighted array
            int randomValue = possibleValues[Random.Range(0, possibleValues.Length)];
            currentBall.Initialize(randomValue);
        }
    }

    public void SetNextBallValue(int value)
    {
        if (currentBall != null)
        {
            currentBall.Initialize(value);
        }
    }
}
