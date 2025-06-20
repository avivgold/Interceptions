using UnityEngine;

public enum InterceptorType { IronDome, DavidsSling, Arrow }

public class Interceptor : MonoBehaviour
{
    public float speed = 6f;
    public InterceptorType type = InterceptorType.IronDome;
    public Missile targetMissile;
    private GameManager manager;

    public void Init(Missile target, GameManager gm, InterceptorType t)
    {
        targetMissile = target;
        manager = gm;
        type = t;
    }

    void Update()
    {
        if (targetMissile == null)
        {
            transform.position += Vector3.up * speed * Time.deltaTime;
            if (transform.position.y > 8f)
                Destroy(gameObject);
            return;
        }

        Vector3 dir = (targetMissile.transform.position - transform.position).normalized;
        transform.position += dir * speed * Time.deltaTime;

        if (Vector3.Distance(transform.position, targetMissile.transform.position) < 0.2f)
        {
            targetMissile.Damage(type);
            manager.OnInterceptorHit(this);
            Destroy(gameObject);
        }
    }
}
