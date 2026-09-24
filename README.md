# Product Admin Dashboard

A small admin panel to log in and manage products. Built with Next.js, React, Tailwind CSS, and Axios. Data comes from the free [DummyJSON](https://dummyjson.com) API.

## Live Demo
[Add your Vercel link here]

## How to Run This Project

```bash
git clone https://github.com/Sonukumar0009/product-admin-dashboard.git
cd product-admin-dashboard
npm install
npm run dev
```

Then open `http://localhost:3000` in your browser.

**Login with:**
- Username: `emilys`
- Password: `emilyspass`

## What This App Can Do

- Log in and log out (only logged-in users can see the products)
- See all products in a table (or as cards on mobile)
- Move between pages of products, and choose how many to show per page
- Search for products (it waits until you stop typing before searching)
- Filter products by category, and sort by price, rating, or title
- Click a product to see its full details, images, and reviews
- Add a new product, edit one, or delete one (with a confirm popup before deleting)
- See a loading spinner while data loads, a message when nothing is found, and a "Retry" button if something goes wrong
- All search/filter/sort/page settings are saved in the URL, so refreshing or sharing the link keeps the same view

## Why I Built It This Way

**Search and category filter don't work together.** The API can't search and filter by category at the same time. So I made it simple: typing in the search box clears the category filter, and picking a category clears the search box. This matches how most shopping websites behave.

**Add/Edit/Delete aren't really saved by the API.** The DummyJSON API pretends to save changes but doesn't actually store them. So my app still sends the real request (to show it works), and then also saves the change in the browser's `localStorage`. This way, if you add, edit, or delete something, it actually stays changed when you refresh the page — even though the API itself forgot about it.

**A problem I ran into:** When I opened a product with a wrong/invalid ID, I expected the API to give an error. Instead, it returned a normal "success" response, just with a message saying the product wasn't found. My page didn't catch this at first, so it showed a blank/broken page instead of a proper "not found" message. I fixed it by checking if that message was present in the response, and treating it the same as an error.

**Where AI helped:** I used Claude to explain tricky parts like avoiding duplicate requests and handling slow search results. I tested and understood everything before saving it.