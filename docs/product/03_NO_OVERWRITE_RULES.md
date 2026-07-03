# No Overwrite Rules

Before changing code, check:

1. Is this for BullPad or Trader Profile?
2. Is this owner-only or allocator-facing?
3. Does a component already exist?
4. Is this visual change only or domain logic?
5. Should this live in:
   - UI
   - Repository
   - Engine
   - Service
   - Adapter

Rule:
Do not create a new screen if an existing product surface can contain it.
