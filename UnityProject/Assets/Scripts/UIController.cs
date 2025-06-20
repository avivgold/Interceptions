using UnityEngine;
using UnityEngine.UI;

public class UIController : MonoBehaviour
{
    public Text scoreText;
    public Text waveText;
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
