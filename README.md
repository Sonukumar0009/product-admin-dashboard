# Product Admin Dashboard

A small admin dashboard built with Next.js, React, Tailwind CSS, and Axios, using the [DummyJSON](https://dummyjson.com) API. Users log in, then browse, search, filter, sort, view, add, edit, and delete products.

## Live Demo
[Add your Vercel link here once deployed]

## Setup

```bash
git clone https://github.com/Sonukumar0009/product-admin-dashboard.git
cd product-admin-dashboard
npm install
npm run dev
```

Open `http://localhost:3000`. Log in with:
- **Username:** `emilys`
- **Password:** `emilyspass`

## What I Finished

- [x] Login page with error handling for wrong credentials, protected routes, logout
- [x] Product list — table on desktop, cards on mobile
- [x] Pagination — page numbers, Previous/Next, page size (10/20/50), "Showing X–Y of Z" text, synced to URL
- [x] Search — debounced (500ms), race-condition safe, resets to page 1, synced to URL
- [x] Filter by category and sort by price/rating/title, synced to URL
- [x] Product details page (`/products/[id]`) with images, description, reviews, and a "not found" page for bad ids
- [x] Add, edit, and delete products with form validation and a confirm popup before delete
- [x] Loading, empty, and error states (with Retry) throughout
- [x] One shared Axios instance (`src/lib/axios.js`) with a request interceptor (adds the token) and a response interceptor (centralized error handling + auto-logout on 401)
- [x] Bad URL values (`?page=abc`, `?page=999`) are handled safely without crashing
- [x] Double-submit protection on login and on add/edit forms

## My Approach & Decisions

**Search vs. category filter:** DummyJSON can't search and filter by category in the same request. I chose **search overrides category** — typing in the search box clears any active category filter, and picking a category clears the search box. I went this way because search usually implies "look across everything," matching how most e-commerce/admin search boxes behave, and it avoids confusing partial-filter states.

**Add/Edit/Delete persistence:** DummyJSON's `POST /products/add`, `PUT /products/:id`, and `DELETE /products/:id` all return a successful-looking response but don't actually change the server's data. My app still calls these real endpoints (so the network requests and Axios usage are genuine), and then separately stores the change in `localStorage` (see `src/lib/localProductStore.js`), merging it on top of whatever the API returns whenever a list or details page loads. This makes changes persist across refreshes within your own browser, without lying about what the API actually does. One known limitation: newly *added* products only show up in the default (no search/filter/sort) view, since a fake local product can't be meaningfully searched or sorted by DummyJSON's real endpoints.

**A problem I faced:** When building the product details page, I initially assumed a wrong/invalid product id (like `/products/99999`) would cause the API to return a real HTTP 404 error, which I could catch in a `try/catch` block. But DummyJSON actually returns a `200 OK` status with a body like `{ "message": "Product with id '99999' not found" }` — no error is thrown at all. This meant my first version silently tried to render a broken/empty product page instead of showing a proper "not found" message. I fixed it by explicitly checking whether the response body contains a `message` field (instead of the expected product fields) right after the API call succeeds, and treating that case the same as a genuine not-found error.

**Where AI helped:** I used Claude to help scaffold each feature (Axios setup, auth context, pagination logic, debounce + race-condition handling, category/sort logic, local persistence for add/edit/delete) and to explain tricky parts like the request-id guard against stale search responses. I reviewed, tested, and understood each piece before committing it — happy to walk through and modify any part of it live.