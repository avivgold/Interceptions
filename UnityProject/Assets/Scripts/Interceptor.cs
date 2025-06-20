using UnityEngine;

public class Interceptor : MonoBehaviour
{
    public float speed = 5f;
    public int damage = 1;
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

        if (Vector3.Distance(transform.position, target) < 0.2f)
        {
            Destroy(gameObject);
        }
    }

    void OnTriggerEnter2D(Collider2D other)
    {
        Missile m = other.GetComponent<Missile>();
        if (m != null)
        {
            m.Damage(damage);
            Destroy(gameObject);
        }
    }
}
