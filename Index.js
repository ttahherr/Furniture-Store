function getCart() {
    const cart = localStorage.getItem('cart');
    return cart ? JSON.parse(cart) : [];
}

function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function updateCartIcon() {
    const cart = getCart();
    const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    const cartIcons = document.querySelectorAll('a[href="./Checkout.html"] img, #btn img[alt="Cart"]');
    
    cartIcons.forEach(icon => {
        let badge = icon.parentElement.querySelector('.cart-badge');
        if (!badge) {
            badge = document.createElement('span');
            badge.className = 'cart-badge';
            badge.style.cssText = `
                position: absolute;
                top: -8px;
                right: -8px;
                background-color: #e74c3c;
                color: white;
                border-radius: 50%;
                width: 20px;
                height: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
                font-weight: bold;
            `;
            icon.parentElement.style.position = 'relative';
            icon.parentElement.appendChild(badge);
        }
        
        if (totalQuantity > 0) {
            badge.textContent = totalQuantity;
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }
    });
}

function addToCart(productName, productPrice, productImage) {
    const cart = getCart();
    
    const existingProductIndex = cart.findIndex(item => item.name === productName);
    
    if (existingProductIndex !== -1) {
        cart[existingProductIndex].quantity += 1;
    } else {
        cart.push({
            name: productName,
            price: parseFloat(productPrice.replace('$', '')),
            image: productImage,
            quantity: 1
        });
    }
    
    saveCart(cart);
    updateCartIcon();
    
    showNotification('Product added to cart!');
}

function initProductPage() {
    // Add event listeners to all "Add to cart" buttons
    const addToCartButtons = document.querySelectorAll('.add');
    
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Get product information from the card
            const card = this.closest('.card');
            const productName = card.querySelector('h3').textContent.trim();
            const priceElement = card.querySelector('.price');
            const productPrice = priceElement ? priceElement.textContent.trim() : '$0';
            const productImage = card.querySelector('img') ? card.querySelector('img').src : '';
            
            // Add to cart
            addToCart(productName, productPrice, productImage);
        });
    });
    
    // Update cart icon on page load
    updateCartIcon();
}

function initCheckoutPage() {
    const orderItemsContainer = document.getElementById('orderItems');
    const priceBreakdown = document.getElementById('priceBreakdown');
    
    if (!orderItemsContainer) return;
    
    // Render cart items
    function renderCartItems() {
        const cart = getCart();
        
        if (cart.length === 0) {
            orderItemsContainer.innerHTML = '<p style="text-align: center; padding: 20px;">Your cart is empty</p>';
            updatePriceBreakdown([]);
            return;
        }
        
        orderItemsContainer.innerHTML = cart.map((item, index) => `
            <div class="orderItem" data-index="${index}">
                <img src="${item.image}" alt="${item.name}">
                <div class="itemDetails">
                    <h3>${item.name}</h3>
                    <div style="display: flex; align-items: center; gap: 10px; margin-top: 10px;">
                        <label for="quantity-${index}">Quantity:</label>
                        <input 
                            type="number" 
                            id="quantity-${index}" 
                            min="1" 
                            value="${item.quantity}" 
                            style="width: 60px; padding: 5px; border: 1px solid #ddd; border-radius: 4px;"
                            class="quantity-input"
                        >
                        <button 
                            class="remove-item" 
                            data-index="${index}"
                            style="background: #e74c3c; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;"
                        >Remove</button>
                    </div>
                    <p class="itemPrice">$${(item.price * item.quantity).toFixed(2)}</p>
                </div>
            </div>
        `).join('');
        
        document.querySelectorAll('.quantity-input').forEach(input => {
            input.addEventListener('change', function() {
                const index = parseInt(this.id.split('-')[1]);
                const newQuantity = parseInt(this.value) || 1;
                updateItemQuantity(index, newQuantity);
            });
        });
        
        document.querySelectorAll('.remove-item').forEach(button => {
            button.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                removeItem(index);
            });
        });
        
        updatePriceBreakdown(cart);
    }
    
    function updateItemQuantity(index, newQuantity) {
        const cart = getCart();
        if (cart[index]) {
            cart[index].quantity = Math.max(1, newQuantity);
            saveCart(cart);
            renderCartItems();
            updateCartIcon();
        }
    }
    
    function removeItem(index) {
        const cart = getCart();
        cart.splice(index, 1);
        saveCart(cart);
        renderCartItems();
        updateCartIcon();
    }
    
    function updatePriceBreakdown(cart) {
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const shipping = subtotal > 0 ? 49.99 : 0;
        const tax = subtotal * 0.08; // 8% tax
        const total = subtotal + shipping + tax;
        
        if (priceBreakdown) {
            priceBreakdown.innerHTML = `
                <div class="priceRow">
                    <span>Subtotal</span>
                    <span>$${subtotal.toFixed(2)}</span>
                </div>
                <div class="priceRow">
                    <span>Shipping</span>
                    <span>$${shipping.toFixed(2)}</span>
                </div>
                <div class="priceRow">
                    <span>Tax</span>
                    <span>$${tax.toFixed(2)}</span>
                </div>
                <div class="priceRow total">
                    <span>Total</span>
                    <span>$${total.toFixed(2)}</span>
                </div>
            `;
        }
    }
    
    renderCartItems();
    updateCartIcon();
}

document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on Product.HTML page
    if (document.querySelector('.product-section')) {
        initProductPage();
    }
    
    if (document.getElementById('orderItems')) {
        initCheckoutPage();
    }
    
    updateCartIcon();
});

