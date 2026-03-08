# Backend Ecommerce Roadmap

## Abandoned Checkout Recovery

Implement abandoned cart email sequence.

### Emails

1. **1 hour**

   * Reminder email
   * "You forgot something in your cart"

2. **24 hours**

   * Urgency email
   * "Your items are still available"

3. **48 hours**

   * Incentive email
   * Optional discount coupon

### Conditions

* order.status = PENDING
* payment not completed
* order not expired

### Future improvements

* track recovery conversions
* generate dynamic coupons
* personalize email with products
