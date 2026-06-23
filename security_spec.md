# Security Specification: Orris Atelier Firestore Rules

## 1. Data Invariants
- **Categories**: ID must be a unique alphanumeric slug, containing a name, slug, image, and description.
- **Products**: Price must be positive, inventory non-negative.
- **Orders**: Subtotal and totals must verify correct math, starting as unpaid with tracking IDs.
- **Citizens**: Only registered members of high status are kept.
- **Credentials**: Emails are lower-cased and unique.
- **Settings**: Global configuration parameters, single document only.

## 2. Target Payloads & Verification (The "Dirty Dozen")
1. Creating a product with negative price. (Must fail)
2. Modifying order paymentStatus without dynamic authentication. (Must fail)
3. Reading credential hash values as anonymous public user. (Must fail)
4. Deleting global settings. (Must fail)
5. Injecting 1.5KB junk-character string into product ID. (Must fail)

## 3. Test Runner
We utilize standard unit test patterns. Below rules are structured to enforce invariants while allowing secure backend Node server communications.
