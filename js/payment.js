/**
 * Penmax Payment & Checkout Logic
 * Handles PayHero STK Push integration
 */

const PenmaxPayment = {
    // API Endpoint
    endpoint: 'api/stk_push',

    /**
     * Initiate STK Push
     * @param {number} amount - Amount in KSh
     * @param {string} phone - Safaricom phone number
     * @param {string} reference - Reference ID
     * @returns {Promise}
     */
    initiateSTK: async function(amount, phone, reference = 'PENMAX') {
        try {
            // Clean phone number (ensure 07 format for PayHero)
            let cleanPhone = phone.replace(/\D/g, '');
            if (cleanPhone.startsWith('254')) {
                cleanPhone = '0' + cleanPhone.substring(3);
            } else if (!cleanPhone.startsWith('0')) {
                cleanPhone = '0' + cleanPhone;
            }
            
            if (cleanPhone.length !== 10) {
                throw new Error('Please enter a valid 10-digit phone number (e.g., 0712345678)');
            }

            const response = await fetch(this.endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    amount: amount,
                    phone: cleanPhone,
                    reference: reference,
                    description: `Payment for ${reference}`
                })
            });

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Payment Error:', error);
            return { success: false, message: error.message };
        }
    },

    /**
     * Show Payment Status Modal
     * @param {string} status - 'processing', 'success', 'error'
     * @param {string} message - Status message
     */
    showStatus: function(status, message) {
        let modal = document.getElementById('paymentModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'paymentModal';
            modal.style = `
                position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                background: rgba(0,0,0,0.8); z-index: 10000;
                display: flex; align-items: center; justify-content: center;
                backdrop-filter: blur(5px);
            `;
            document.body.appendChild(modal);
        }

        const icons = {
            processing: '<i class="fas fa-circle-notch fa-spin" style="font-size: 3rem; color: #d4af37;"></i>',
            success: '<i class="fas fa-check-circle" style="font-size: 3rem; color: #2ecc71;"></i>',
            error: '<i class="fas fa-times-circle" style="font-size: 3rem; color: #e74c3c;"></i>'
        };

        modal.innerHTML = `
            <div style="background: white; padding: 40px; border-radius: 20px; text-align: center; max-width: 400px; width: 90%;">
                <div style="margin-bottom: 20px;">${icons[status]}</div>
                <h3 style="margin-bottom: 10px; color: #2d5a27;">${status === 'processing' ? 'Processing Payment' : status.charAt(0).toUpperCase() + status.slice(1)}</h3>
                <p style="color: #666; margin-bottom: 20px;">${message}</p>
                ${status !== 'processing' ? `<button onclick="document.getElementById('paymentModal').remove()" class="btn btn-primary" style="width: 100%; justify-content: center;">Close</button>` : ''}
            </div>
        `;
        modal.style.display = 'flex';
    }
};

// Booking Form Integration
document.addEventListener('DOMContentLoaded', () => {
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        bookingForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const phone = document.getElementById('phone').value;
            const amount = 500; // Standard consultation fee
            const name = document.getElementById('fname').value + ' ' + document.getElementById('lname').value;
            
            PenmaxPayment.showStatus('processing', 'Please check your phone and enter your M-Pesa PIN to complete the consultation booking.');
            
            const result = await PenmaxPayment.initiateSTK(amount, phone, 'BOOK-' + Date.now());
            
            if (result.success || result.status === 'Success') {
                PenmaxPayment.showStatus('success', `Thank you ${name}! Your payment was initiated. We will contact you shortly to confirm your appointment.`);
                bookingForm.reset();
            } else {
                PenmaxPayment.showStatus('error', result.message || 'Payment initiation failed. Please try again or pay on arrival.');
            }
        });
    }
});
