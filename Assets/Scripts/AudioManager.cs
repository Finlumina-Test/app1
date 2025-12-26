using UnityEngine;

public class AudioManager : MonoBehaviour
{
    public static AudioManager Instance;

    [Header("Audio Sources")]
    public AudioSource sfxSource;
    public AudioSource musicSource;

    [Header("Audio Clips")]
    public AudioClip shootClip;
    public AudioClip mergeClip;
    public AudioClip gameOverClip;

    void Awake()
    {
        if (Instance == null) Instance = this;
        else Destroy(gameObject);

        // Auto-create sources if missing
        if (sfxSource == null) sfxSource = gameObject.AddComponent<AudioSource>();
        if (musicSource == null)
        {
            musicSource = gameObject.AddComponent<AudioSource>();
            musicSource.loop = true;
        }
    }

    public void PlayShoot()
    {
        if (shootClip != null) sfxSource.PlayOneShot(shootClip);
    }

    public void PlayMerge(int value)
    {
        if (mergeClip != null)
        {
            // Pitch modulation: Higher pitch for higher numbers
            sfxSource.pitch = 1f + (Mathf.Log(value, 2) * 0.05f);
            sfxSource.PlayOneShot(mergeClip);
            sfxSource.pitch = 1f; // Reset
        }
    }

    public void PlayGameOver()
    {
        if (gameOverClip != null) sfxSource.PlayOneShot(gameOverClip);
    }
}
