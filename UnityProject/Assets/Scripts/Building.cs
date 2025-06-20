using UnityEngine;

public class Building : MonoBehaviour
{
    public int health = 1;

    public bool IsDestroyed => health <= 0;

    public void Damage()
    {
        health--;
        if (health <= 0)
        {
            // Could add destruction visuals here
            gameObject.SetActive(false);
        }
    }
}
