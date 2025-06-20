using UnityEngine;

public enum MissileType { Katyusha, Fateh, Shahab }

public class Missile : MonoBehaviour
{
    public float speed = 2f;
    public int health = 1;
    public MissileType type = MissileType.Katyusha;
    private Vector3 target;
    private Building targetBuilding;
    private GameManager manager;

    public void Init(Vector3 targetPos, Building building, GameManager gm, MissileType t, float s, int h)
    {
        target = targetPos;
        targetBuilding = building;
        manager = gm;
        type = t;
        speed = s;
        health = h;
    }

    void Update()
    {
        Vector3 dir = (target - transform.position).normalized;
        transform.position += dir * speed * Time.deltaTime;

        if (Vector3.Distance(transform.position, target) < 0.1f)
        {
            if (targetBuilding != null)
            {
                manager.OnCityHit(targetBuilding);
            }
            Destroy(gameObject);
        }
    }

    public void Damage(InterceptorType system)
    {
        int dmg = 1;
        if ((system == InterceptorType.IronDome && type == MissileType.Katyusha) ||
            (system == InterceptorType.DavidsSling && type == MissileType.Fateh) ||
            (system == InterceptorType.Arrow && type == MissileType.Shahab))
        {
            dmg = 2;
        }

        health -= dmg;
        if (health <= 0)
        {
            manager.OnMissileDestroyed(gameObject);
        }
    }
}
