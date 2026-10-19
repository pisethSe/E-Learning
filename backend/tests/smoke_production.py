"""Read-only smoke test against the deployed production API.

Usage: venv/bin/python tests/smoke_production.py [BASE_URL]

Never mutates production data: only GET requests and one deliberately
failed login (401 expected).
"""

import json
import sys

import httpx

BASE_URL = (sys.argv[1] if len(sys.argv) > 1 else "https://e-learning-j2s4.onrender.com").rstrip("/")
USER_SITE = "https://e-learning-grade-a-front.onrender.com"
ADMIN_SITE = "https://e-learning-grade-a-admin.onrender.com"

results = []


def check(name, condition, detail=""):
    results.append((name, bool(condition), detail))


def main():
    client = httpx.Client(timeout=60, follow_redirects=False)

    # 1. health
    r = client.get(f"{BASE_URL}/health")
    check("GET /health -> 200 healthy", r.status_code == 200 and r.json().get("status") == "healthy", str(r.status_code))

    # 2. root
    r = client.get(f"{BASE_URL}/")
    body = r.json() if r.status_code == 200 else {}
    check("GET / -> online + cloudinary", r.status_code == 200 and body.get("status") == "online" and body.get("storage_backend") == "cloudinary", body.get("storage_backend", ""))

    # 3. API docs hidden in production
    r = client.get(f"{BASE_URL}/docs")
    check("GET /docs -> hidden (404)", r.status_code == 404, str(r.status_code))
    r = client.get(f"{BASE_URL}/openapi.json")
    check("GET /openapi.json -> hidden (404)", r.status_code == 404, str(r.status_code))

    # 4. catalog
    r = client.get(f"{BASE_URL}/api/resources/")
    resources = r.json() if r.status_code == 200 else []
    check("GET /api/resources/ -> 200 with 700+ published", r.status_code == 200 and len(resources) >= 700, f"{len(resources)} resources")
    check("every resource is published", all(item.get("is_published") for item in resources))

    # 5. catalog reference lists
    for path, key in [
        ("/api/resources/grades/list", "grades"),
        ("/api/resources/subjects/list", "subjects"),
        ("/api/resources/categories/list", "categories"),
    ]:
        r = client.get(f"{BASE_URL}{path}")
        check(f"GET {path} -> 200", r.status_code == 200 and key in r.json(), str(r.status_code))

    # 6. events
    r = client.get(f"{BASE_URL}/api/events/")
    check("GET /api/events/ -> 200", r.status_code == 200 and isinstance(r.json(), list), f"{len(r.json()) if r.status_code == 200 else r.status_code} events")

    # 7. single resource + Cloudinary asset reachable
    with_file = next((item for item in resources if str(item.get("file_path", "")).startswith("https://")), None)
    if with_file:
        single = client.get(f"{BASE_URL}/api/resources/{with_file['id']}")
        check("GET /api/resources/{id} -> 200", single.status_code == 200, str(single.status_code))
        asset = client.get(with_file["file_path"])
        check("Cloudinary asset publicly reachable", asset.status_code == 200, f"{asset.status_code} {with_file['file_path'][:70]}")

    # 8. auth is enforced
    r = client.post(f"{BASE_URL}/api/auth/login", json={"email": "intruder@test.local", "password": "nope"})
    check("wrong login -> 401", r.status_code == 401, str(r.status_code))
    r = client.get(f"{BASE_URL}/api/admin/stats")
    check("admin stats without session -> 401/403", r.status_code in (401, 403), str(r.status_code))
    r = client.get(f"{BASE_URL}/api/admin/resources")
    check("admin resources without session -> 401/403", r.status_code in (401, 403), str(r.status_code))

    # 9. CORS preflight for both frontend sites
    for origin in (USER_SITE, ADMIN_SITE):
        r = client.options(
            f"{BASE_URL}/api/resources/",
            headers={
                "Origin": origin,
                "Access-Control-Request-Method": "GET",
                "Access-Control-Request-Headers": "content-type",
            },
        )
        allowed = r.headers.get("access-control-allow-origin")
        check(f"CORS allows {origin}", r.status_code in (200, 204) and allowed == origin, f"status={r.status_code} allow={allowed}")

    # 10. frontend sites live
    for site in (USER_SITE, ADMIN_SITE):
        r = client.get(f"{site}/")
        check(f"frontend live: {site}", r.status_code == 200, str(r.status_code))
        deep = "/grade/12" if "front" in site else "/upload/photo"
        r = client.get(f"{site}{deep}")
        check(f"SPA rewrite works ({deep})", r.status_code == 200, str(r.status_code))

    client.close()

    passed = sum(1 for _, ok, _ in results if ok)
    print()
    for name, ok, detail in results:
        print(f"{'PASS' if ok else 'FAIL'}  {name}" + (f"   [{detail}]" if detail else ""))
    print(f"\n{passed}/{len(results)} checks passed against {BASE_URL}")
    sys.exit(0 if passed == len(results) else 1)


if __name__ == "__main__":
    main()
