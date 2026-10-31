# Birchbeat import roadmap

## Current request — Fortnite browser games
- [x] Add Retrora Season 1 community Fortnite entry with complete-site proxy routing to preserve its virtual hostname, account navigation and online sockets.
- [x] Add separately labelled official Fortnite Xbox Cloud and GeForce NOW options; launch-routing and catalog tests pass (16 related tests).
- [x] Verify Retrora's styled login page, player script and 1.8.1 game manifest through the existing Epoxy proxy; all returned successfully.
- [ ] Verify actual Retrora match and official Fortnite stream — requires provider accounts; no Retrora account supplied and requesting user has no matching preview account for the default authenticated relay. No completed gameplay claimed.

## Current request — BuildNow GG and original 1v1.LOL
- [x] Repair BuildNow GG's separate provider frames/CDN assets and absolute URL construction; browser reached its rendered menu with ConnectedToMasterServer. 13 related tests pass. Full match and Google sign-in remain unverified; preview account does not match requesting user.
- [x] Verify availability of the real 1v1.LOL online service; official status page confirms permanent shutdown November 3, 2025. Removed replacement wording from BuildNow GG.

## Current request — Xbox Series X and Google sign-in
- [x] Build Xbox Series X home, library, store, media, themed settings/profile and guide using the existing catalog.
- [x] Expose Xbox Series X in welcome setup and layout settings; verified developer sign-in, app installation/library readback, guide, settings, Music without classic sidebar, and phone layout.
- [x] Repair blank/instant-closing OAuth routing and add regression coverage; delayed Google sign-in loads in a native 520×720 window that remains open.
- [ ] Verify completed Google login in the actual 1v1.LOL game — game host fails TLS connection from test network; Google credentials are not available for completion.

## Console Mode
- [x] Fix console media/installed-game document reloads and add bundled original game thumbnails; launch and visit-state regression tests pass.
- [ ] Verify these updated launches with a real account — automatic sign-in could not match the requesting user; needs preview sign-in.
- [x] Fix the diagnosed proxy startup failure by stripping browser transports from server execution; compilation and regression tests pass.
- [ ] Verify the fix on the published runtime — waiting for Publish changes; the published site still runs the previous snapshot.
- [x] Ask layout, device and content every new visit; always show matching login/account confirmation. Signed-out and restored-session flows verified.
- [x] Finish Sony media, actual games/apps store and library, first-launch layout choice, profile/background settings and verification.
- [x] Shared navigation, per-user library, Sony home/store/library/settings/profile.
- [x] Xbox Series X screens and guide.
- [ ] Xbox Classic screens and guide — separate earlier follow-up, not part of Series X request.
- [x] Sony settings picker, Home entry, documentation and verification.
- [ ] Real controller hardware and individual provider gameplay validation — needs controller/GPU playtesting; the OvO provider stayed on its loading screen during the browser check.

- [x] Import source and dependencies into the existing TanStack project.
- [x] Enable Lovable Cloud, migrate schema and wire authentication.
- [x] Reconcile configuration and verify preview launches.
- [ ] Import previous user records — no source data export supplied.

## Game smoothness
- [x] Apply GTA's supported performance profile with a native-quality option.
- [x] Use the standalone player by default for every Cloud game and lighten inline playback.
- [x] Remove proxy connection-selection delays and test profile/connection behavior.
- [x] Verify public relay isolation and manifest loading; eight regression tests pass.
- [ ] Verify signed-in launches and real FPS gains — signed-in cloud launch verified; FPS measurement requires playtesting on real GPU hardware.

## PS5 media rework (Oct 31)
- [x] Request a separate named Google window, preserve nested-frame callbacks and fix delayed fallback navigation; ten tests pass and browser displays proxied Google sign-in in a 520×720 window without replacing the game.
- [ ] Verify completed Google login back into 1v1.LOL — Google screen verified independently; actual game connection failed and automatic preview sign-in cannot match the requesting user's account.
- [x] Repair Google/Firebase blank-window handoff and native popup lifetime; nine regression tests pass and browser reaches Google's proxied sign-in screen without closing. Completed 1v1 sign-in remains in the account/playtesting check below.
- [x] Fix game sign-in replacing gameplay: early interception and arcade bridge open a separate proxied window; routing tests and browser popup check pass.
- [x] Music, Movies and AI open inside a PS5-style frame (no sidebar) while Console Mode is on.
- [x] Game thumbnails come from each game's source (arcade covers, cloud site screenshots) with genre art fallback.
- [x] All movie sources (VidSrc, APIPlayer, etc.) and free movies play through the proxy with their full address kept.
- [x] Game/website sign-in popups (e.g. Google) open in a proxied overlay.
- [x] YouTube, Netflix, Hulu and Paramount+ downloadable from the console store; open through the proxy.
- [ ] Signed-in check of these screens and real Google sign-in inside 1v1.LOL — needs a real account and playtesting.
- [ ] Import previous user records — no data export supplied.
