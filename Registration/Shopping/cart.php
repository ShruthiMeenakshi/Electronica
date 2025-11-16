<!doctype html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width,initial-scale=1">
	<title>Cart - Electonica</title>
	<script src="https://cdn.tailwindcss.com"></script>
	<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
	<style>body{font-family:'Inter',sans-serif}</style>
</head>
<body class="bg-gray-50 min-h-screen">
	<header class="bg-white shadow">
		<div class="max-w-7xl mx-auto px-4 py-4">
			<div class="flex items-center justify-between">
				<div class="flex items-center">
					<a href="index.php" class="text-xl font-bold text-gray-900">Electonica</a>
				</div>
				<div>
					<a href="index.php" class="text-indigo-600 hover:underline">Continue shopping</a>
				</div>
			</div>
		</div>
	</header>

	<main class="max-w-7xl mx-auto px-4 py-12">
		<h1 class="text-2xl font-bold mb-6">Your Shopping Cart</h1>

		<div id="cart-container" class="bg-white rounded-lg shadow overflow-hidden">
			<div class="p-4">
				<div id="cart-empty" class="text-gray-600">Loading cart...</div>

				<div id="cart-table-wrap" class="hidden">
					<table class="w-full text-left">
						<thead>
							<tr class="text-sm text-gray-600 border-b">
								<th class="py-2">Product</th>
								<th class="py-2">Price</th>
								<th class="py-2">Quantity</th>
								<th class="py-2">Subtotal</th>
								<th class="py-2">Action</th>
							</tr>
						</thead>
						<tbody id="cart-list">
							<!-- JS will populate -->
						</tbody>
					</table>

					<div class="p-4 border-t flex justify-between items-center">
						<div class="text-lg font-medium">Total: <span id="cart-total">₹0.00</span></div>
						<div>
							<button id="checkout-btn" class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Proceed to Checkout</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	</main>

	<script src="cart.js"></script>
	<script>
		// Render cart from localStorage using the shared cart API (getCart, removeFromCart, changeQuantity)
		function renderCartPage() {
			const listEl = document.getElementById('cart-list');
			const emptyEl = document.getElementById('cart-empty');
			const tableWrap = document.getElementById('cart-table-wrap');
			const totalEl = document.getElementById('cart-total');

			const items = (typeof getCart === 'function') ? getCart() : (JSON.parse(localStorage.getItem('cart') || '[]'));
			if (!items || items.length === 0) {
				emptyEl.innerText = 'Your cart is empty.';
				tableWrap.classList.add('hidden');
				emptyEl.classList.remove('hidden');
				totalEl.innerText = '₹0.00';
				return;
			}

			// show table
			emptyEl.classList.add('hidden');
			tableWrap.classList.remove('hidden');
			listEl.innerHTML = '';

			let total = 0;
					items.forEach(item => {
				const qty = Number(item.quantity) || 1;
				const price = Number(item.price) || 0;
				const subtotal = qty * price;
				total += subtotal;

				const tr = document.createElement('tr');
				tr.className = 'border-b';
					tr.innerHTML = `
						<td class="py-3">
							<div class="flex items-center">
								<img src="${escapeHtml(item.image || '')}" alt="" class="w-16 h-16 object-cover rounded mr-4" onerror="this.style.display='none'" />
								<div>
									<div class="font-medium text-gray-900">${escapeHtml(item.name)}</div>
									<div class="text-sm text-gray-500">ID: ${escapeHtml(String(item.id))}</div>
								</div>
							</div>
						</td>
					<td class="py-3">₹${price.toFixed(2)}</td>
					<td class="py-3">
						<input type="number" min="1" value="${qty}" data-id="${escapeHtml(item.id)}" class="qty-input w-20 border rounded px-2 py-1">
					</td>
					<td class="py-3">₹${subtotal.toFixed(2)}</td>
					<td class="py-3"><button class="remove-btn px-3 py-1 bg-red-500 text-white rounded" data-id="${escapeHtml(item.id)}">Remove</button></td>
				`;
				listEl.appendChild(tr);
			});

			totalEl.innerText = '₹' + total.toFixed(2);

			// wire buttons
			listEl.querySelectorAll('.remove-btn').forEach(btn => {
				btn.addEventListener('click', () => {
					const id = btn.dataset.id;
					if (typeof removeFromCart === 'function') removeFromCart(id);
					// re-render
					renderCartPage();
				});
			});

			listEl.querySelectorAll('.qty-input').forEach(input => {
				input.addEventListener('change', () => {
					const id = input.dataset.id;
					const qty = Number(input.value) || 1;
					if (typeof changeQuantity === 'function') changeQuantity(id, qty);
					renderCartPage();
				});
			});
		}

		function escapeHtml(str) {
			if (!str && str !== 0) return '';
			return String(str).replace(/[&<>\"]/g, function (s) {
				return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[s]);
			});
		}

		document.addEventListener('DOMContentLoaded', () => {
			renderCartPage();

			// Keep page in sync if other tabs change the cart
			window.addEventListener('storage', (e) => {
				if (e.key === 'cart') renderCartPage();
			});

			// Checkout button behaviour (placeholder)
			const checkoutBtn = document.getElementById('checkout-btn');
			if (checkoutBtn) {
				checkoutBtn.addEventListener('click', () => {
					// In a real app: send cart to server, create order, redirect to payment
					alert('Proceeding to checkout (demo).');
				});
			}
		});
	</script>
</body>
</html>
