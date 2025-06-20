using UnityEngine;
using TMPro; // Use TextMeshPro for UI text rendering

public class UIController : MonoBehaviour
{
    public TMP_Text scoreText;
    public TMP_Text waveText;
    public TMP_Text buildingsText;
    public TMP_Text systemText;
    public GameManager manager;

    void Update()
    {
        if (manager != null)
        {
            scoreText.text = $"Score: {manager.score}";
            waveText.text = $"Wave: {manager.wave}";
            if (buildingsText != null)
                buildingsText.text = $"Buildings: {manager.BuildingsRemaining}";
            if (systemText != null)
                systemText.text = $"System: {manager.CurrentSystemName}";
        }
    }
}
