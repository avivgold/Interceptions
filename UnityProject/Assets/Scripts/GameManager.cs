using UnityEngine;
using System.Collections.Generic;

public class GameManager : MonoBehaviour
{
    public GameObject missilePrefab;
    public GameObject interceptorPrefab;
    public Transform[] launcherPoints;
    public Transform[] cityTargets;

    public float spawnInterval = 2f;
    public int score = 0;
    public int wave = 1;

    private float spawnTimer = 0f;
    private List<GameObject> missiles = new List<GameObject>();
    private List<GameObject> interceptors = new List<GameObject>();

    void Update()
    {
        if (!Application.isPlaying) return;

        spawnTimer += Time.deltaTime;
        if (spawnTimer >= spawnInterval)
        {
            spawnTimer = 0f;
            SpawnMissile();
        }
    }

    void SpawnMissile()
    {
        Transform target = cityTargets[Random.Range(0, cityTargets.Length)];
        Vector3 startPos = new Vector3(Random.Range(-8f, 8f), 6f, 0);
        GameObject m = Instantiate(missilePrefab, startPos, Quaternion.identity);
        Missile missile = m.GetComponent<Missile>();
        missile.Init(target.position, this);
        missiles.Add(m);
    }

    public void LaunchInterceptor(int launcherIndex, Vector3 target)
    {
        Transform launchPoint = launcherPoints[launcherIndex];
        GameObject i = Instantiate(interceptorPrefab, launchPoint.position, Quaternion.identity);
        Interceptor interceptor = i.GetComponent<Interceptor>();
        interceptor.Init(target, this);
        interceptors.Add(i);
    }

    public void OnMissileDestroyed(GameObject missile)
    {
        missiles.Remove(missile);
        Destroy(missile);
        score += 100;
    }

    public void OnCityHit()
    {
        // end game when all cities destroyed
    }
}
