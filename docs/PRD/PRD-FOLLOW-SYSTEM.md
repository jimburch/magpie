# PRD: Follow System & Profile Page Fixes

## Problem Statement

Users cannot follow other users on Magpie. The profile page displays follower/following counts but there is no way to actually follow someone — the counts are always zero. Additionally, the profile page crashes when a user's `websiteUrl` field contains an invalid URL due to an unguarded `new URL()` call.

## Solution

Implement the full follow system: a FollowButton component on user profiles, server-side query logic with denormalized count maintenance, a form action for the web UI, and a REST API route for the CLI. Fix the profile page crash with a try/catch fallback. Add integration tests for both follow and star query modules.

## User Stories

1. As a logged-in user, I want to follow another user from their profile page, so that I can show interest in their work
2. As a logged-in user, I want to unfollow a user I previously followed, so that I can manage who I follow
3. As a logged-in user, I want the follow button to update immediately when I click it, so that the interaction feels responsive (optimistic UI)
4. As a logged-in user, I want to see the follower count update when I follow/unfollow, so that I get visual confirmation
5. As a user viewing my own profile, I want the follow button to be hidden, so that I'm not confused by a self-follow option
6. As a visitor (not logged in), I want to see follower/following counts on profiles, so that I can gauge a user's community presence
7. As a CLI user, I want to follow/unfollow a user via `POST/DELETE /api/v1/users/:username/follow`, so that I can manage follows from the terminal
8. As a CLI user, I want the API to return the updated follow state and follower count, so that my CLI can display current information
9. As a user, I want my follow actions to be logged as activities, so that they appear in activity feeds later
10. As a user whose profile has an invalid website URL, I want the profile page to still load without crashing, so that my profile is accessible
11. As a user viewing a profile with an invalid website URL, I want to see the raw URL text instead of a parsed hostname, so that the link is still useful

## Implementation Decisions

### Modules

#### 1. Follow Queries (`queries/follows.ts`) — New
- `isFollowing(followerId, followingId)` — checks if a follow relationship exists
- `toggleFollow(followerId, followingId)` — transactional toggle that:
  - Inserts or deletes the follow row
  - Updates denormalized `followersCount` on the followed user
  - Updates denormalized `followingCount` on the follower
  - Creates an activity record with `followed_user` action type on follow (not unfollow)
  - Returns `true` if now following, `false` if unfollowed
- Mirrors the `toggleStar`/`isSetupStarredByUser` pattern in the setups query module
- **Self-follow prevention:** `toggleFollow` should reject if `followerId === followingId`

#### 2. FollowButton Component (`FollowButton.svelte`) — New
- Props: `isFollowing: boolean`, `followersCount: number`, `formAction?: string`, `onoptimisticchange?: (count: number) => void`
- Uses SvelteKit `enhance` for form submission with optimistic UI
- Mirrors StarButton pattern exactly: pending state, optimistic count, rollback on failure
- Visual states: "Follow" (outline) / "Following" (filled/active)

#### 3. Profile Page Server (`[username]/+page.server.ts`) — Modify
- Loader: add `isFollowing` boolean to returned data (check if `locals.user` follows the profile user; `false` if not logged in)
- Form action: add `follow` action that calls `toggleFollow`, guarded by `requireAuth`

#### 4. Profile Page UI (`[username]/+page.svelte`) — Modify
- Add FollowButton next to the username `<h1>`, shown only when viewing another user's profile (hidden on own profile)
- Fix websiteUrl crash: wrap `new URL(data.profile.websiteUrl)` in try/catch, fall back to displaying raw URL string
- Pass `isFollowing` and `followersCount` to FollowButton
- Wire `onoptimisticchange` callback to update the displayed follower count

#### 5. Follow API Route (`api/v1/users/[username]/follow/+server.ts`) — New
- `POST` — ensure user is following the target (idempotent: no-op if already following)
- `DELETE` — ensure user is not following the target (idempotent: no-op if not following)
- Response: `{ data: { following: boolean, followersCount: number } }`
- Uses `requireApiAuth` guard
- Looks up target user by username, returns 404 if not found
- Prevents self-follow with 400 error

#### 6. Star Queries Tests — New
- Integration tests for `toggleStar` and `isSetupStarredByUser`
- Tests: star/unstar toggle, idempotency, denormalized count accuracy, concurrent star handling

#### 7. Follow Queries Tests — New
- Integration tests for `toggleFollow` and `isFollowing`
- Tests: follow/unfollow toggle, self-follow prevention, denormalized count accuracy on both users, activity creation on follow, no activity on unfollow

### API Contract

**`POST /api/v1/users/:username/follow`**
- Auth: required (Bearer token)
- Success 200: `{ data: { following: true, followersCount: number } }`
- Error 400: `{ error: "Cannot follow yourself", code: "SELF_FOLLOW" }`
- Error 401: `{ error: "Authentication required", code: "UNAUTHORIZED" }`
- Error 404: `{ error: "User not found", code: "NOT_FOUND" }`

**`DELETE /api/v1/users/:username/follow`**
- Auth: required (Bearer token)
- Success 200: `{ data: { following: false, followersCount: number } }`
- Error 401/404: same as above

### Schema

No schema changes needed. The `follows` table, denormalized count columns on `users`, `followed_user` action type, and `activities` table all exist already.

## Testing Decisions

### What makes a good test
- Test external behavior through the public interface, not implementation details
- Use the real database — no mocks (integration tests)
- Each test should be independent and clean up after itself

### Modules to test
1. **Follow queries** (`queries/follows.ts`): `toggleFollow` and `isFollowing` — the core transactional logic with count maintenance and activity logging
2. **Star queries** (`queries/setups.ts`): `toggleStar` and `isSetupStarredByUser` — existing untested code, same pattern as follows

### Test cases
- **toggleFollow:** follow creates relationship + increments both counts + creates activity; unfollow removes relationship + decrements both counts + no activity; self-follow throws/returns error; double-follow is idempotent
- **toggleStar:** star creates relationship + increments count; unstar removes relationship + decrements count; double-star is idempotent
- **isFollowing / isSetupStarredByUser:** returns correct boolean for existing and non-existing relationships

### Prior art
No existing query-level tests in the codebase. This will establish the pattern. Vitest is configured as the test runner.

## Out of Scope

- Followers/following list pages (clickable counts) — separate future feature
- Validating `websiteUrl` at the input/save layer — separate ticket
- Private profiles or follow requests/approval flow
- Follow notifications or email
- Activity feed page (activities are logged but the feed UI is a separate feature)
- CLI `magpie follow` command implementation (this PRD covers the API route; the CLI command is a separate CLI ticket)

## Further Notes

- The `activities` table has a `setupId` column (nullable) but no `targetUserId` column. For `followed_user` activities, `setupId` will be null. If we later need to know *who* was followed from the activity record, we'd need a schema migration. For MVP this is acceptable — the activity just records that user X followed someone.
- The star system (`toggleStar`, `StarButton`, star API route) is the direct reference implementation for this work — follow should mirror it closely for consistency.
