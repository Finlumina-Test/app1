using UnityEngine;

public class SimpleMergeParticle : MonoBehaviour
{
    [Header("Particle Settings")]
    public int particleCount = 20;
    public float explosionForce = 5f;
    public float lifetime = 1f;
    public Color particleColor = Color.yellow;
    public float particleSize = 0.1f;

    void Start()
    {
        CreateParticles();
    }

    void CreateParticles()
    {
        for (int i = 0; i < particleCount; i++)
        {
            // Create particle object
            GameObject particle = GameObject.CreatePrimitive(PrimitiveType.Sphere);
            particle.transform.position = transform.position;
            particle.transform.localScale = Vector3.one * particleSize;

            // Set color
            Renderer renderer = particle.GetComponent<Renderer>();
            if (renderer != null)
            {
                renderer.material.color = particleColor;
            }

            // Remove collider
            Collider col = particle.GetComponent<Collider>();
            if (col != null)
            {
                Destroy(col);
            }

            // Add rigidbody and force
            Rigidbody2D rb = particle.AddComponent<Rigidbody2D>();
            rb.gravityScale = 0.5f;

            // Random direction
            Vector2 randomDirection = Random.insideUnitCircle.normalized;
            rb.AddForce(randomDirection * explosionForce, ForceMode2D.Impulse);

            // Destroy after lifetime
            Destroy(particle, lifetime);
        }

        // Destroy this parent object
        Destroy(gameObject, lifetime);
    }
}
