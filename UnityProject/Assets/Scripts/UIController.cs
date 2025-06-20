using UnityEngine;
using TMPro; // Use TextMeshPro for UI text rendering

public class UIController : MonoBehaviour
{
    public TMP_Text scoreText;
    public TMP_Text waveText;
    public GameManager manager;

    void Update()
    {
        if (manager != null)
        {
            scoreText.text = $"Score: {manager.score}";
            waveText.text = $"Wave: {manager.wave}";
        }
    }
}
