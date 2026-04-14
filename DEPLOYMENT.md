# FermaConnect API — Deployment

## Live URL

https://fermaconnect-api.onrender.com

## Endpoints

POST /api/auth/register
POST /api/auth/login
GET /api/auth/me

GET /api/products
GET /api/products/:id
POST /api/products
PUT /api/products/:id
DELETE /api/products/:id
PATCH /api/products/:id/availability

POST /api/orders
GET /api/orders
GET /api/orders/:id
PATCH /api/orders/:id/status

GET /api/farmers/:id
GET /api/farmers/:id/products

## Notes

- Free tier spins down after 15 min inactivity
- First request after sleep takes ~30 seconds
- All environment variables set in Render dashboard