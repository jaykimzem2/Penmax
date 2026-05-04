/**
 * Penmax Shopping Cart Logic
 */

const PenmaxCart = {
    items: JSON.parse(localStorage.getItem('penmax_cart')) || [],

    save: function() {
        localStorage.setItem('penmax_cart', JSON.stringify(this.items));
        this.updateUI();
    },

    addItem: function(id, name, price, image) {
        const existing = this.items.find(item => item.id === id);
        if (existing) {
            existing.quantity += 1;
        } else {
            this.items.push({ id, name, price, image, quantity: 1 });
        }
        this.save();
        this.showCart();
    },

    removeItem: function(id) {
        this.items = this.items.filter(item => item.id !== id);
        this.save();
    },

    updateQuantity: function(id, delta) {
        const item = this.items.find(item => item.id === id);
        if (item) {
            item.quantity += delta;
            if (item.quantity <= 0) {
                this.removeItem(id);
            } else {
                this.save();
            }
        }
    },

    getTotal: function() {
        return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    },

    updateUI: function() {
        const cartCounts = document.querySelectorAll('.cart-count');
        const count = this.items.reduce((sum, item) => sum + item.quantity, 0);
        cartCounts.forEach(el => el.textContent = count);
    },

    showCart: function() {
        let overlay = document.getElementById('cartOverlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'cartOverlay';
            overlay.style = `
                position: fixed; top: 0; right: 0; width: 100%; height: 100%;
                background: rgba(0,0,0,0.5); z-index: 10000;
                display: flex; justify-content: flex-end;
            `;
            overlay.onclick = (e) => { if(e.target === overlay) overlay.style.display = 'none'; };
            document.body.appendChild(overlay);
        }

        const total = this.getTotal();
        
        overlay.innerHTML = `
            <div style="background: white; width: 400px; height: 100%; padding: 30px; display: flex; flex-direction: column; box-shadow: -5px 0 15px rgba(0,0,0,0.1);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; border-bottom: 1px solid #eee; padding-bottom: 15px;">
                    <h2 style="color: #2d5a27; margin: 0;">Your Cart</h2>
                    <button onclick="document.getElementById('cartOverlay').style.display='none'" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #999;">&times;</button>
                </div>
                
                <div style="flex: 1; overflow-y: auto; margin-bottom: 20px;">
                    ${this.items.length === 0 ? '<p style="text-align: center; color: #999; margin-top: 50px;">Your cart is empty</p>' : 
                        this.items.map(item => `
                            <div style="display: flex; gap: 15px; margin-bottom: 20px; border-bottom: 1px solid #f9f9f9; padding-bottom: 15px;">
                                <img src="${item.image}" style="width: 70px; height: 70px; object-fit: contain; background: #f5f5f5; border-radius: 8px;">
                                <div style="flex: 1;">
                                    <h4 style="margin: 0 0 5px 0; font-size: 0.95rem; color: #333;">${item.name}</h4>
                                    <p style="margin: 0; color: #2d5a27; font-weight: 700;">KSh ${item.price.toLocaleString()}</p>
                                    <div style="display: flex; align-items: center; gap: 10px; margin-top: 10px;">
                                        <button onclick="PenmaxCart.updateQuantity('${item.id}', -1)" style="width: 25px; height: 25px; border-radius: 50%; border: 1px solid #ddd; background: white; cursor: pointer;">-</button>
                                        <span>${item.quantity}</span>
                                        <button onclick="PenmaxCart.updateQuantity('${item.id}', 1)" style="width: 25px; height: 25px; border-radius: 50%; border: 1px solid #ddd; background: white; cursor: pointer;">+</button>
                                    </div>
                                </div>
                                <button onclick="PenmaxCart.removeItem('${item.id}')" style="background: none; border: none; color: #ff6b6b; cursor: pointer;"><i class="fas fa-trash"></i></button>
                            </div>
                        `).join('')
                    }
                </div>
                
                ${this.items.length > 0 ? `
                    <div style="border-top: 2px solid #eee; padding-top: 20px;">
                        <div style="display: flex; justify-content: space-between; font-size: 1.2rem; font-weight: 700; margin-bottom: 20px; color: #2d5a27;">
                            <span>Total:</span>
                            <span>KSh ${total.toLocaleString()}</span>
                        </div>
                        
                        <div id="checkoutForm" style="display: block;">
                            <div style="margin-bottom: 15px;">
                                <label style="display: block; font-size: 0.85rem; margin-bottom: 5px; color: #666;">M-Pesa Phone Number *</label>
                                <input type="tel" id="checkoutPhone" placeholder="0712345678" style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 8px; outline: none;">
                            </div>
                            <button onclick="PenmaxCart.handleCheckout()" class="btn btn-primary" style="width: 100%; justify-content: center; padding: 16px;">
                                Pay via M-Pesa STK
                            </button>
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
        overlay.style.display = 'flex';
    },

    handleCheckout: async function() {
        const phoneInput = document.getElementById('checkoutPhone');
        const phone = phoneInput.value;
        if (!phone || phone.length < 10) {
            alert('Please enter a valid M-Pesa phone number');
            return;
        }

        const amount = this.getTotal();
        if (amount <= 0) return;

        document.getElementById('cartOverlay').style.display = 'none';
        
        if (typeof PenmaxPayment !== 'undefined') {
            PenmaxPayment.showStatus('processing', 'Please check your phone and enter your M-Pesa PIN to complete your order.');
            const result = await PenmaxPayment.initiateSTK(amount, phone, 'ORDER-' + Date.now());
            
            if (result.success || result.status === 'Success') {
                PenmaxPayment.showStatus('success', 'Order received! We will process your delivery as soon as payment is confirmed.');
                this.items = [];
                this.save();
            } else {
                PenmaxPayment.showStatus('error', result.message || 'Payment initiation failed. Please try again.');
            }
        } else {
            alert('Payment system not loaded. Please refresh the page.');
        }
    }
};

// Initialize listeners
document.addEventListener('DOMContentLoaded', () => {
    PenmaxCart.updateUI();
    
    // Add to cart buttons
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.add-to-cart');
        if (btn) {
            e.preventDefault();
            const card = btn.closest('.product-card');
            const name = card.querySelector('.product-name').textContent;
            const priceStr = card.querySelector('.product-price').textContent.split('KSh').pop().replace(/,/g, '').trim();
            const price = parseInt(priceStr);
            const image = card.querySelector('img').src;
            const id = name.toLowerCase().replace(/\s+/g, '-');
            
            PenmaxCart.addItem(id, name, price, image);
        }
    });

    // Cart toggle buttons
    const cartToggles = document.querySelectorAll('.cart-toggle');
    cartToggles.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            PenmaxCart.showCart();
        });
    });
});
