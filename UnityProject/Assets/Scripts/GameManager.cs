using UnityEngine;
using System;
using System.Collections.Generic;

public class GameManager : MonoBehaviour
{
    public GameObject missilePrefab;
    public GameObject interceptorPrefab;
    public GameObject buildingPrefab;
    public Transform[] launcherPoints;
    public Transform[] cityTargets;
    public UIController uiController;

    public float baseSpawnInterval = 2f;
    public int score = 0;
    public int wave = 1;

    private float spawnTimer = 0f;
    private readonly List<Missile> missiles = new();
    private readonly List<Interceptor> interceptors = new();
    private readonly List<Building> buildings = new();
    private int intercepted = 0;
    private InterceptorType currentSystem = InterceptorType.IronDome;

    public int BuildingsRemaining => buildings.FindAll(b => !b.IsDestroyed).Count;
    public string CurrentSystemName => currentSystem.ToString();

    void Start()
    {
        EnsureSceneSetup();

        // Spawn buildings at target positions
        foreach (var t in cityTargets)
        {
            var obj = Instantiate(buildingPrefab, t.position, Quaternion.identity);
            buildings.Add(obj.GetComponent<Building>());
        }
        if (uiController != null)
            uiController.manager = this;
    }

    void Update()
    {
        if (!Application.isPlaying) return;

        HandleInput();

        spawnTimer += Time.deltaTime;
        float interval = baseSpawnInterval / (1f + (wave - 1) * 0.1f);
        if (spawnTimer >= interval)
        {
            spawnTimer = 0f;
            SpawnMissile();
        }
    }

    void SpawnMissile()
    {
        Transform target = cityTargets[UnityEngine.Random.Range(0, cityTargets.Length)];
        Vector3 startPos = new Vector3(UnityEngine.Random.Range(-8f, 8f), 6f, 0);

        MissileType type = (MissileType)UnityEngine.Random.Range(0, 3);
        float[] baseSpeeds = { 1.2f, 0.8f, 0.6f };
        int[] baseHealth = { 1, 2, 3 };

        float speed = baseSpeeds[(int)type] * (1f + (wave - 1) * 0.15f);
        int health = baseHealth[(int)type];

        GameObject mObj = Instantiate(missilePrefab, startPos, Quaternion.identity);
        Missile missile = mObj.GetComponent<Missile>();
        Building b = buildings[System.Array.IndexOf(cityTargets, target)];
        missile.Init(target.position, b, this, type, speed, health);
        missiles.Add(missile);
    }

    void LaunchInterceptor(Missile target)
    {
        if (target == null) return;

        int bestIndex = 0;
        float bestDistance = float.MaxValue;
        for (int i = 0; i < launcherPoints.Length; i++)
        {
            float d = Vector3.Distance(launcherPoints[i].position, target.transform.position);
            if (d < bestDistance)
            {
                bestDistance = d;
                bestIndex = i;
            }
        }

        Transform launchPoint = launcherPoints[bestIndex];
        GameObject obj = Instantiate(interceptorPrefab, launchPoint.position, Quaternion.identity);
        Interceptor interceptor = obj.GetComponent<Interceptor>();
        interceptor.Init(target, this, currentSystem);
        interceptors.Add(interceptor);
    }

    public void OnMissileDestroyed(GameObject missileObj)
    {
        Missile m = missileObj.GetComponent<Missile>();
        missiles.Remove(m);
        Destroy(missileObj);
        score += 100;
        intercepted++;
        if (intercepted % 8 == 0)
        {
            wave++;
        }
    }

    public void OnCityHit(Building b)
    {
        b.Damage();
        if (BuildingsRemaining <= 0)
        {
            enabled = false; // stop game
        }
    }

    public void OnInterceptorHit(Interceptor i)
    {
        interceptors.Remove(i);
    }

    void HandleInput()
    {
        if (Input.GetKeyDown(KeyCode.Alpha1)) currentSystem = InterceptorType.IronDome;
        if (Input.GetKeyDown(KeyCode.Alpha2)) currentSystem = InterceptorType.DavidsSling;
        if (Input.GetKeyDown(KeyCode.Alpha3)) currentSystem = InterceptorType.Arrow;

        if (Input.GetMouseButtonDown(0))
        {
            Vector3 world = Camera.main.ScreenToWorldPoint(Input.mousePosition);
            world.z = 0;

            Missile best = null;
            float bestDist = 1.5f;
            foreach (var m in missiles)
            {
                float d = Vector3.Distance(world, m.transform.position);
                if (d < bestDist)
                {
                    bestDist = d;
                    best = m;
                }
            }
            if (best != null)
            {
                LaunchInterceptor(best);
            }
        }
    }

    void EnsureSceneSetup()
    {
        // Create a simple orthographic camera if none exists
        if (Camera.main == null)
        {
            var camObj = new GameObject("Main Camera");
            var cam = camObj.AddComponent<Camera>();
            cam.orthographic = true;
            camObj.tag = "MainCamera";
            cam.transform.position = new Vector3(0, 0, -10);
        }

        // Generate basic prefabs if they were not assigned in the editor
        if (missilePrefab == null)
        {
            missilePrefab = GameObject.CreatePrimitive(PrimitiveType.Sphere);
            missilePrefab.transform.localScale = Vector3.one * 0.3f;
            missilePrefab.AddComponent<Missile>();
            missilePrefab.SetActive(false);
        }

        if (interceptorPrefab == null)
        {
            interceptorPrefab = GameObject.CreatePrimitive(PrimitiveType.Capsule);
            interceptorPrefab.transform.localScale = new Vector3(0.2f, 0.5f, 0.2f);
            interceptorPrefab.AddComponent<Interceptor>();
            interceptorPrefab.SetActive(false);
        }

        if (buildingPrefab == null)
        {
            buildingPrefab = GameObject.CreatePrimitive(PrimitiveType.Cube);
            buildingPrefab.transform.localScale = new Vector3(1f, 0.6f, 1f);
            buildingPrefab.AddComponent<Building>();
            buildingPrefab.SetActive(false);
        }

        // Create launcher and city target transforms if none are set
        if (launcherPoints == null || launcherPoints.Length == 0)
        {
            launcherPoints = new Transform[3];
            for (int i = 0; i < launcherPoints.Length; i++)
            {
                var obj = new GameObject($"Launcher{i}");
                obj.transform.position = new Vector3(-6f + i * 6f, -3.5f, 0f);
                launcherPoints[i] = obj.transform;
            }
        }

        if (cityTargets == null || cityTargets.Length == 0)
        {
            cityTargets = new Transform[3];
            for (int i = 0; i < cityTargets.Length; i++)
            {
                var obj = new GameObject($"City{i}");
                obj.transform.position = new Vector3(-6f + i * 6f, -4.5f, 0f);
                cityTargets[i] = obj.transform;
            }
        }
    }
}
