# Admin operations

Open `/admin` with an account whose `profiles.role` is `admin`.

- Use **7 days** or **30 days** by entering the desired duration.
- Use source `complimentary` for free tester access.
- `paused` temporarily blocks access; `revoked` closes the current grant.
- Every mutation creates a row in `subscription_events`.
- To recover the first admin, update the profile role through the Supabase SQL editor.

No payment provider is connected in the foundation release. A future verified
webhook must invoke the same `update_user_subscription` RPC.
