# API examples / Postman checklist

All `/api/*` requests require this header:

`Authorization: Bearer <token from server console>`

For POST / PUT / PATCH also set `Content-Type: application/json`.

## First requests

1. `GET http://localhost:3000/` — returns a short server-running message (public).
2. `GET http://localhost:3000/health` — returns JSON and storage mode (public).
3. `GET http://localhost:3000/api/categories` — returns categories (bearer token required).
4. `POST http://localhost:3000/api/personalities` with body:

```json
{
  "displayName": "Example Artist",
  "alias": "ExampleAlias",
  "categoryId": 1,
  "description": "Illustration",
  "notes": "Follow across sites",
  "isFavorite": true
}
```

5. `GET http://localhost:3000/api/personalities` — list.
6. `GET http://localhost:3000/api/personalities/1` — retrieve.
7. `PATCH http://localhost:3000/api/personalities/1` with `{ "isFavorite": false }` — update.
8. `POST http://localhost:3000/api/social-profiles` with body:

```json
{
  "personalityId": 1,
  "platform": "Pixiv",
  "username": "example",
  "profileUrl": "https://www.pixiv.net/",
  "isFollowing": false
}
```

9. `GET http://localhost:3000/api/social-profiles` — list.
10. `DELETE http://localhost:3000/api/social-profiles/1` — delete.

All three resources (`personalities`, `categories`, `social-profiles`) have `GET /`, `GET /:id`, `POST /`, `PUT /:id`, `PATCH /:id`, `DELETE /:id`.

IDs are examples, not guaranteed. Use the IDs from your API responses.

## Common HTTP responses

- `200` successful GET / update
- `201` created
- `204` deleted
- `400` invalid JSON, bad field, missing or invalid input
- `401` missing or invalid token
- `404` unknown ID or endpoint
- `409` conflicting/dependent data

## Powershell / Windows test command

```powershell
curl.exe http://localhost:3000/health
curl.exe -H "Authorization: Bearer REPLACE_WITH_CONSOLE_TOKEN" http://localhost:3000/api/categories
```

Use Postman's Body -> raw -> JSON editor for POST/PUT/PATCH payloads.
