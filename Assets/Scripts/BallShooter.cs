using UnityEngine;

public class BallShooter : MonoBehaviour
{
    [Header("Shooting Settings")]
    public float shootForce = 15f;
    public GameObject ballPrefab;
    public Transform shootPoint;

    [Header("Game Logic")]
    public int[] possibleValues = { 2, 2, 2, 4, 4, 8 };

    [Header("Visuals")]
    public LineRenderer aimLine;
    public int aimLineSegments = 20;

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
        if (GameManager.Instance != null && GameManager.Instance.isGameOver) return;
        HandleInput();
    }

    void HandleInput()
    {
        if (Input.GetMouseButtonDown(0)) isDragging = true;
        if (Input.GetMouseButton(0) && isDragging) UpdateAim();
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
        if (direction.y < 0.1f) direction.y = 0.1f; // Clamp to upward only

        shootDirection = direction.normalized;

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
            Vector3 pos = startPos + velocity * time;
            pos.y += 0.5f * Physics2D.gravity.y * 1.5f * time * time; // 1.5f matches ball gravity
            aimLine.SetPosition(i, pos);
        }
    }

    void ShootBall()
    {
        if (currentBall != null && shootDirection != Vector2.zero)
        {
            currentBall.Shoot(shootDirection, shootForce);

            // Sound Effect
            if (AudioManager.Instance != null) AudioManager.Instance.PlayShoot();

            if (aimLine != null) aimLine.enabled = false;

            Invoke(nameof(SpawnNewBall), 0.5f);
            currentBall = null;
        }
    }

    void SpawnNewBall()
    {
        if (ballPrefab == null || shootPoint == null) return;

        GameObject ballObj = Instantiate(ballPrefab, shootPoint.position, Quaternion.identity);
        currentBall = ballObj.GetComponent<NumberBall>();

        if (currentBall != null)
        {
            int randomValue = possibleValues[Random.Range(0, possibleValues.Length)];
            currentBall.Initialize(randomValue);
        }
    }
}
