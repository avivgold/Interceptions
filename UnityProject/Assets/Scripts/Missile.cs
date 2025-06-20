using UnityEngine;

public class Missile : MonoBehaviour
{
    public float speed = 2f;
    public int health = 1;
    private Vector3 target;
    private GameManager manager;

    public void Init(Vector3 targetPos, GameManager gm)
    {
        target = targetPos;
        manager = gm;
    }

    void Update()
    {
        Vector3 dir = (target - transform.position).normalized;
        transform.position += dir * speed * Time.deltaTime;

        if (Vector3.Distance(transform.position, target) < 0.1f)
        {
            manager.OnCityHit();
            Destroy(gameObject);
        }
    }

    public void Damage(int amt)
    {
        health -= amt;
        if (health <= 0)
        {
            manager.OnMissileDestroyed(gameObject);
        }
    }
}
