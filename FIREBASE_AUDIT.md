# Firebase/Firestore Security Audit Report

## Executive Summary
Comprehensive audit of all Firebase operations in the SkyTech application. Found **strong authentication implementation** with proper permission checks in API routes, though some **client-side operations lack explicit validation** against Firestore rules.

---

## 1. FIRESTORE WRITE OPERATIONS FOUND

### A. CREATE Operations (addDoc)
| Collection | Location | Auth Check | Risk Level |
|-----------|----------|-----------|-----------|
| `products` | [app/admin/products/page.tsx](app/admin/products/page.tsx#L195) | Client-side only (admin role check) | **MEDIUM** |
| `services` | [app/admin/services/page.tsx](app/admin/services/page.tsx#L230) | Client-side only (admin role check) | **MEDIUM** |
| `works` | [app/admin/works/page.tsx](app/admin/works/page.tsx#L270) | Client-side only (admin role check) | **MEDIUM** |
| `chats` | [components/SupportChat.tsx](components/SupportChat.tsx#L225) | User authenticated via AuthContext | **LOW** |

### B. SET Operations (setDoc)
| Collection | Location | Operation | Auth Check |
|-----------|----------|-----------|-----------|
| `users` | [contexts/AuthContext.tsx](contexts/AuthContext.tsx#L45-L55) | User metadata on signup/login | Yes - current user only |
| `users` | [contexts/AuthContext.tsx](contexts/AuthContext.tsx#L60-L75) | Profile update on login | Yes - current user with merge |
| `carts` | [contexts/CartContext.tsx](contexts/CartContext.tsx#L75) | Cart sync from local | Yes - user.uid check |
| `carts` | [contexts/CartContext.tsx](contexts/CartContext.tsx#L125) | Cart update/sync | Yes - user.uid check |
| `chats` | [components/SupportChat.tsx](components/SupportChat.tsx#L230) | Chat creation/message | User ID embedded |
| `messages` (subcollection) | [components/SupportChat.tsx](components/SupportChat.tsx#L235) | Message creation | User ID embedded |
| `orders` | [lib/server-checkout.ts](lib/server-checkout.ts#L120) | Order creation via API | **YES - Server-side with auth** |
| `payments` | [lib/server-checkout.ts](lib/server-checkout.ts#L135) | Payment record creation | **YES - Server-side with auth** |

### C. UPDATE Operations (updateDoc)
| Collection | Location | Operation | Auth Check |
|-----------|----------|-----------|-----------|
| `products` | [app/admin/products/page.tsx](app/admin/products/page.tsx#L195) | Product edit/featured toggle | Client-side (admin check) | **MEDIUM** |
| `services` | [app/admin/services/page.tsx](app/admin/services/page.tsx#L200) | Service edit/featured toggle | Client-side (admin check) | **MEDIUM** |
| `works` | [app/admin/works/page.tsx](app/admin/works/page.tsx#L250) | Work edit/featured/status toggle | Client-side (admin check) | **MEDIUM** |
| `users` | [app/admin/users/page.tsx](app/admin/users/page.tsx#L70) | User role/status update | Client-side (admin check) | **MEDIUM** |
| `orders` | [app/admin/orders/page.tsx](app/admin/orders/page.tsx#L55) | Order status update + timeline | Client-side (admin check) | **MEDIUM** |
| `carts` | [contexts/CartContext.tsx](contexts/CartContext.tsx#L125) | Cart items update | User ID verified |
| `products` | [lib/server-checkout.ts](lib/server-checkout.ts#L112) | Stock decrement (transaction) | **YES - Server-side with auth** |
| `users` | [lib/server-checkout.ts](lib/server-checkout.ts#L140) | Order count/total spent update | **YES - Server-side with auth** |

### D. DELETE Operations (deleteDoc)
| Collection | Location | Auth Check | Risk Level |
|-----------|----------|-----------|-----------|
| `products` | [app/admin/products/page.tsx](app/admin/products/page.tsx#L130) | Client-side (admin check) | **MEDIUM** |
| `services` | [app/admin/services/page.tsx](app/admin/services/page.tsx#L165) | Client-side (admin check) | **MEDIUM** |
| `works` | [app/admin/works/page.tsx](app/admin/works/page.tsx#L190) | Client-side (admin check) | **MEDIUM** |

---

## 2. COLLECTIONS BEING WRITTEN TO

### Write Permissions by Collection:

```
users/
├── Write: User owns document OR isAdmin()
├── Client writes: ✓ Profile updates (AuthContext)
└── Server writes: ✓ Order count/totalSpent (checkout API)

products/
├── Write: isAdmin() ONLY
├── Client writes: ✓ Create/Update/Delete (admin page - needs verification)
└── Firestore rules: CORRECT

services/
├── Write: isAdmin() ONLY  
├── Client writes: ✓ Create/Update/Delete (admin page - needs verification)
└── Firestore rules: CORRECT

works/
├── Write: isAdmin() ONLY
├── Client writes: ✓ Create/Update/Delete (admin page - needs verification)
└── Firestore rules: CORRECT

orders/
├── Write: isAuthenticated() for create, isAdmin() OR isOwner() for update
├── Client writes: ✗ (Only server-side via /api/payments/verify)
├── Server writes: ✓ createVerifiedOrder() transaction
└── Firestore rules: CORRECT

payments/
├── Write: isAuthenticated() for create only, NO UPDATE
├── Client writes: ✗ (Server-side only)
├── Server writes: ✓ Payment record creation
└── Firestore rules: CORRECT

carts/
├── Write: isOwner() OR isAdmin()
├── Client writes: ✓ Cart sync (verified by user.uid)
└── Firestore rules: CORRECT

support-chats/ & support-chats/{chatId}/messages/
├── Write: isAuthenticated() for create/chat updates
├── Client writes: ✓ Message/chat creation (user embedded)
└── Firestore rules: CORRECT (note: rules use 'chats', code uses 'chats')
```

---

## 3. API ROUTES PERFORMING DATABASE OPERATIONS

### A. POST /api/payments/create-order
**File:** [app/api/payments/create-order/route.ts](app/api/payments/create-order/route.ts)

**Auth Check:**
- ✅ `getAuthenticatedUser()` verifies Firebase ID token
- ✅ Checks user role/status
- ✅ Extracts userId and email from authenticated token

**Operations:**
- No direct Firestore writes (only Razorpay API call)
- Validates checkout items against Firestore products

**Permission Compliance:** ✅ GOOD

---

### B. POST /api/payments/verify
**File:** [app/api/payments/verify/route.ts](app/api/payments/verify/route.ts)

**Auth Check:**
- ✅ `getAuthenticatedUser()` verifies Firebase ID token
- ✅ Signature verification from Razorpay
- ✅ Amount validation against cart total

**Write Operations:**
1. **orders/** - Creates new order document
2. **payments/** - Creates payment transaction record
3. **products/** - Updates stock (transaction)
4. **users/** - Updates orderCount, totalSpent
5. **carts/** - Clears cart items

**Permission Compliance:** ✅ GOOD (server-side with proper transaction)

---

## 4. POTENTIAL PERMISSION MISMATCHES & SECURITY FINDINGS

### 🔴 HIGH RISK ISSUES

#### Issue #1: Admin Operations Rely Only on Client-Side Auth Check
**Affected Operations:**
- Product create/update/delete: [app/admin/products/page.tsx](app/admin/products/page.tsx#L195)
- Service create/update/delete: [app/admin/services/page.tsx](app/admin/services/page.tsx#L230)
- Work create/update/delete: [app/admin/works/page.tsx](app/admin/works/page.tsx#L270)
- User role/status updates: [app/admin/users/page.tsx](app/admin/users/page.tsx#L70)
- Order status updates: [app/admin/orders/page.tsx](app/admin/orders/page.tsx#L55)

**Problem:**
- Authorization checked only in JavaScript (`useAuth()` hook)
- Firestore rules will allow writes if user provides valid ID token claiming admin status
- **Vulnerability:** Attacker can forge admin claims or manipulate client-side checks

**Fix Required:**
- Add server-side admin verification API routes OR
- Update Firestore rules to validate `request.auth` claims include admin role

---

#### Issue #2: Chat Operations Don't Verify Order Ownership
**File:** [components/SupportChat.tsx](components/SupportChat.tsx#L225-L235)

**Problem:**
```typescript
// No validation that user owns the order
const chatPayload = {
  userId: currentUserId,
  orderId: orderId || (chat?.orderId ?? ''),  // ⚠️ Could be manipulated
  userEmail: userEmail || user?.email || '',
  // ...
};
```

**Issue:** User could create chat attached to someone else's order

**Firestore Rule:** Currently allows `create` if `isAuthenticated()` without order owner check

**Recommended Fix:**
```firestore
match /support-chats/{chatId} {
  allow create: if isAuthenticated() && 
                request.resource.data.userId == request.auth.uid;
}
```

---

### 🟡 MEDIUM RISK ISSUES

#### Issue #3: Cart Sync Without Full Validation
**File:** [contexts/CartContext.tsx](contexts/CartContext.tsx#L60-L125)

**Problem:**
- Cart items stored by `user.uid` as document ID
- Firestore rules check `isOwner(userId)` on the `/carts/{userId}` path
- **This is CORRECT**, but client could theoretically manipulate product prices before sync

**Why It's Safe:**
- Server-side checkout validation in [lib/server-checkout.ts](lib/server-checkout.ts#L35-L60) refetches product prices
- Final price calculated at order creation time (not from client cart)

**Status:** ✅ Actually SAFE due to server-side verification

---

#### Issue #4: Support Chat Status Changes Not Restricted
**File:** [app/admin/support-chats/page.tsx](app/admin/support-chats/page.tsx#L55)

**Problem:**
```typescript
const markResolved = async () => {
  if (!currentChat) return;
  await updateDoc(doc(db, 'chats', currentChat.id), {
    status: 'resolved',
    updatedAt: serverTimestamp(),
  });
};
```

- No role check in component (relies on component not being rendered for non-admin)
- Firestore rule allows update if `isAdmin() || isOwner(resource.data.userId)`
- Users can mark their own chats as resolved

**Impact:** Low (users can only resolve their own chats by rules)

---

### 🟢 LOW RISK / GOOD PRACTICES

#### ✅ Order Creation Security
- Server-side with `getAuthenticatedUser()` verification
- Transaction ensures atomicity
- Stock decremented safely
- User metadata updated in same transaction

#### ✅ User Profile Sync
- User can only update own profile (`isOwner(userId)`)
- AuthContext properly embeds `user.uid`

#### ✅ Payment Record Immutability
- Firestore rules allow `create` but NO `update` or `delete`
- Prevents tampering with payment history

---

## 5. FIRESTORE RULES ANALYSIS

### Current Rule Structure:
```firestore
match /users/{userId} {
  allow read: if isOwner(userId) || isAdmin();
  allow write: if isOwner(userId) || isAdmin();
}

match /products/{productId} {
  allow read: if true;
  allow write: if isAdmin();  // ⚠️ Must verify admin claim server-side
}

match /orders/{orderId} {
  allow read: if isOwner(resource.data.userId) || isAdmin();
  allow create: if isAuthenticated();  // ⚠️ No validation that userId matches auth user
  allow update: if isAdmin() || isOwner(resource.data.userId);
}

match /payments/{paymentId} {
  allow read: if isOwner(resource.data.userId) || isAdmin();
  allow create: if isAuthenticated();
  // No update/delete - Good!
}

match /support-chats/{chatId} {
  allow read: if isOwner(resource.data.userId) || isAdmin();
  allow create: if isAuthenticated();  // ⚠️ No ownership validation
  allow update: if isAdmin() || isOwner(resource.data.userId);
}
```

### Recommended Firestore Rule Updates:

```firestore
// Products - require verified admin claim
match /products/{productId} {
  allow read: if true;
  allow write: if isAdmin();  // Current is OK, but ensure server-side API-only writes
  allow delete: if isAdmin();
}

// Orders - validate userId matches authenticated user on create
match /orders/{orderId} {
  allow read: if isOwner(resource.data.userId) || isAdmin();
  allow create: if isAuthenticated() && 
                request.resource.data.userId == request.auth.uid;
  allow update: if isAdmin() || isOwner(resource.data.userId);
}

// Support chats - validate ownership on create
match /support-chats/{chatId} {
  allow read: if isOwner(resource.data.userId) || isAdmin();
  allow create: if isAuthenticated() && 
                request.resource.data.userId == request.auth.uid;
  allow update: if isAdmin() || isOwner(resource.data.userId);
}
```

---

## 6. AUTHENTICATION CHECKS SUMMARY

| Operation | Location | Type | Auth Method | Result |
|-----------|----------|------|-----------|--------|
| User signup/login | AuthContext | setDoc | Firebase Auth | ✅ |
| Cart sync | CartContext | setDoc | user.uid check | ✅ |
| Product CRUD | Admin page | addDoc/updateDoc | Client role check | ⚠️ Should be API |
| Service CRUD | Admin page | addDoc/updateDoc | Client role check | ⚠️ Should be API |
| Work CRUD | Admin page | addDoc/updateDoc | Client role check | ⚠️ Should be API |
| User management | Admin page | updateDoc | Client role check | ⚠️ Should be API |
| Order status update | Admin page | updateDoc | Client role check | ⚠️ Should be API |
| Order creation | API route | transaction | getAuthenticatedUser() | ✅ |
| Payment create | API route | setDoc | getAuthenticatedUser() | ✅ |
| Chat creation | Component | setDoc | AuthContext | ✅ |
| Chat message | Component | setDoc | AuthContext | ✅ |

---

## 7. RECOMMENDATIONS & ACTION ITEMS

### Priority 1: Create API Routes for Admin Operations
```
Create these protected API routes:
- POST /api/admin/products/create
- PUT /api/admin/products/[id]
- DELETE /api/admin/products/[id]
- POST /api/admin/services/create
- PUT /api/admin/services/[id]
- DELETE /api/admin/services/[id]
- POST /api/admin/works/create
- PUT /api/admin/works/[id]
- DELETE /api/admin/works/[id]
- PUT /api/admin/users/[uid]
- PUT /api/admin/orders/[orderId]/status

Each route should:
1. Call getAuthenticatedUser()
2. Verify isAdmin role
3. Validate input
4. Perform operation with error handling
```

### Priority 2: Update Firestore Rules
Implement order validation on create:
```firestore
allow create: if isAuthenticated() && 
              request.resource.data.userId == request.auth.uid;
```

### Priority 3: Remove Client-Side Direct Writes
Replace admin page operations with API calls to ensure server-side verification.

### Priority 4: Add Rate Limiting
Consider rate limiting on:
- Order creation
- Chat message creation
- Admin operations

---

## 8. SECURITY SCORECARD

| Category | Score | Status |
|----------|-------|--------|
| Server-side order creation | 10/10 | ✅ Excellent |
| Payment immutability | 10/10 | ✅ Excellent |
| User data isolation | 9/10 | ✅ Good |
| Admin operations | 4/10 | ⚠️ **Needs improvement** |
| Chat operations | 7/10 | ⚠️ Could be tighter |
| Firestore rules | 7/10 | ⚠️ Add userId validation |
| **Overall** | **7/10** | ⚠️ **Good foundation, needs hardening** |

---

## Conclusion

✅ **Strengths:**
- Order creation properly secured with server-side verification
- Payment records immutable
- User data properly isolated
- ID token verification in place

⚠️ **Weaknesses:**
- Admin CRUD operations using client-side authorization only
- Firestore rules could add additional userId validation
- Chat operations lack explicit order ownership verification

**Recommended Action:** Migrate admin operations to API routes with server-side `getAuthenticatedUser()` calls within 1 sprint to achieve production-ready security.
