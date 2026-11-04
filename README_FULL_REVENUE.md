
# Full Revenue Implementation - All Features

## Features Implemented

### 1. Paywall (3 problems limit)
- components/Paywall.tsx
- 24h discount timer
- BEST/POPULAR badges, left count
- Triggers after 3 problems

### 2. Subscription
- FREE: 3 problems, 1 PDF
- MONTHLY 9900, YEARLY 59900 (50% off), LIFETIME 149000 (limited 100)
- lib/subscription.ts

### 3. Discount Timer
- components/DiscountTimer.tsx
- 24h countdown, localStorage
- First purchase 50% off

### 4. D-Day Banner
- components/DDayBanner.tsx
- Electric engineer D-30 etc
- Links to PASS_GUARANTEE

### 5. Additional Products
- AI_REPORT 4900 (margin 100%)
- QA_10 19900
- MOCK_EXAM 2900
- STUDY_ROOM 19900
- PRODUCTS in subscription.ts

### 6. Ads
- components/AdsBanner.tsx
- Free only, paid no ads
- AdSense style

### 7. Points
- 30 days expiry
- Max 30% usage
- calculatePointsUsage()

### 8. Payment
- app/payment/page.tsx
- Timer, points slider, all plans
- Verify API

### 9. Job Fee
- Jobs page can add commission

## Apply

1. Copy lib/subscription.ts, components/*, app/payment, app/api/payments/verify, app/api/subscription/check, app/api/referral/points

2. In app/learn/page.tsx:
```tsx
import Paywall from '@/components/Paywall'
import AdsBanner from '@/components/AdsBanner'
import DDayBanner from '@/components/DDayBanner'
import AIReportUpsell from '@/components/AIReportUpsell'
import { hasAccess } from '@/lib/subscription'

const [showPaywall, setShowPaywall] = useState(false)
const [solvedCount, setSolvedCount] = useState(0)

useEffect(()=>{
  // Check if free and solved >=3
  fetch('/api/subscription/check', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({feature:'problem', count: solvedCount})})
    .then(r=>r.json()).then(d=>{ if(!d.allowed) setShowPaywall(true) })
},[solvedCount])

// In render:
<DDayBanner cert={selectedCert} />
<AdsBanner />
{problems.map((p,i)=> i===2 && <AdsBanner key='ad' />)}
<AIReportUpsell />
{showPaywall && <Paywall reason='무료는 3문제만! 구독하면 2,997문제 무제한!' onClose={()=>setShowPaywall(false)} solvedCount={solvedCount} />}
```

3. Build & deploy
