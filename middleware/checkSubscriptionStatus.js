async function checkSubscriptionStatus(user) {
    const now = new Date();
  
    if (user.subscriptionType === 'premium' && user.subscriptionExpiry) {
      if (user.subscriptionExpiry < now) {
        // Subscription expired — downgrade user
        user.subscriptionType = 'standard';
        user.isPaid = false;
        user.subscriptionExpiry = null;
  
        if (user.type === 'user-premium') {
          user.type = 'user-standard';
        }
  
        await user.save();
      }
    }
  }