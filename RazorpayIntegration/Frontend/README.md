# Razorpay Integration Guide

## Flow

```
Button Click → Create Order (Backend) → Open Checkout → Verify Payment (Backend) → Update DB
```

---

## Step 1 — Install Packages

```bash
# Backend
npm install express razorpay mongoose cors dotenv

# Frontend
npm install axios
```

---

## Step 2 — Backend: Create Order Route

```js
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

app.post('/placerazorpayorder', async (req, res) => {
  const order = await razorpay.orders.create({
    amount: 543 * 100,   // ₹543 → paise
    currency: 'INR',
    receipt: 'receipt_001'
  });
  res.json({ success: true, order });
});
```

---

## Step 3 — Backend: Verify Payment Route

```js
app.post('/verifyRazorpay', async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const generated = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(razorpay_order_id + '|' + razorpay_payment_id)
    .digest('hex');

  res.json({ success: generated === razorpay_signature });
});
```

---

## Step 4 — Add Script in `index.html`

```html
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
```

---

## Step 5 — Frontend: Handle Payment

```jsx
const handlePayment = async () => {
  const { data } = await axios.post('/placerazorpayorder');

  new window.Razorpay({
    key: import.meta.env.VITE_RAZORPAY_KEY_ID,
    amount: data.order.amount,
    order_id: data.order.id,
    handler: async (response) => {
      const verify = await axios.post('/verifyRazorpay', response);
      alert(verify.data.success ? 'Payment Success ✅' : 'Failed ❌');
    }
  }).open();
};
```

---

## Step 6 — `.env` Files

```env
# Backend
RAZORPAY_KEY_ID=rzp_test_xxxx
RAZORPAY_KEY_SECRET=xxxx
MONGO_URI=your_mongo_uri

# Frontend (Vite)
VITE_RAZORPAY_KEY_ID=rzp_test_xxxx
VITE_BACKEND_URL=http://localhost:3000
```

---

## Key Points to Remember

| Point | Detail |
|---|---|
| Amount unit | Multiply by 100 (paise) |
| Secret key | Backend only, never frontend |
| Verification | Always verify on backend |
| Test cards | Use Razorpay test mode while dev |

---

## Step 7 — Switch to Production Mode

### 7.1 Activate Live Mode on Razorpay Dashboard

1. Go to [https://dashboard.razorpay.com](https://dashboard.razorpay.com)
2. Toggle from **Test Mode** → **Live Mode** (top-left switch)
3. Complete KYC if not done (business details, bank account, PAN/GST)
4. Wait for approval (usually 1–2 business days)
5. After approval, go to **Settings → API Keys → Generate Live Key**
6. Copy your **Live Key ID** and **Live Key Secret**

---

### 7.2 Update Backend `.env`

Replace test keys with live keys:

```env
# Before (Test Mode)
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=test_secret_xxxx

# After (Live Mode)
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=live_secret_xxxx
```

> ⚠️ Never commit `.env` to GitHub. Add it to `.gitignore`.

---

### 7.3 Update Frontend `.env`

```env
# Before (Test Mode)
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
VITE_BACKEND_URL=http://localhost:3000

# After (Live Mode)
VITE_RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxx
VITE_BACKEND_URL=https://your-production-backend.com
```

---

### 7.4 Production Checklist

| Task | Status |
|---|---|
| KYC completed on Razorpay dashboard | ✅ |
| Live Key ID & Secret generated | ✅ |
| Backend `.env` updated with live keys | ✅ |
| Frontend `.env` updated with live key | ✅ |
| Backend deployed to production server | ✅ |
| HTTPS enabled on backend URL | ✅ |
| `.env` added to `.gitignore` | ✅ |
| Dynamic `userId` from auth (not hardcoded) | ✅ |
| Dynamic `amount` from cart (not hardcoded) | ✅ |
| Payment failure handling added | ✅ |

---

### 7.5 Important Production Rules

```
❌ Never use rzp_test_ keys in production
❌ Never hardcode userId or amount
❌ Never expose RAZORPAY_KEY_SECRET in frontend
❌ Never skip backend payment verification
✅ Always use HTTPS in production
✅ Always verify payment signature on backend
✅ Always handle payment failure cases
✅ Always store transaction history in DB
```

---

### 7.6 Test Mode vs Live Mode Summary

| Feature | Test Mode | Live Mode |
|---|---|---|
| Key prefix | `rzp_test_` | `rzp_live_` |
| Real money charged | ❌ No | ✅ Yes |
| Use case | Development & testing | Production website |
| Test cards work | ✅ Yes | ❌ No |
| KYC required | ❌ No | ✅ Yes |