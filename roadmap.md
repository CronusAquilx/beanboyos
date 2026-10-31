# Birchbeat import roadmap

## Console Mode
- [x] Fix console media/installed-game document reloads and add bundled original game thumbnails; launch and visit-state regression tests pass.
- [ ] Verify these updated launches with a real account — automatic sign-in could not match the requesting user; needs preview sign-in.
- [x] Fix the diagnosed proxy startup failure by stripping browser transports from server execution; compilation and regression tests pass.
- [ ] Verify the fix on the published runtime — waiting for Publish changes; the published site still runs the previous snapshot.
- [x] Ask layout, device and content every new visit; always show matching login/account confirmation. Signed-out and restored-session flows verified.
- [x] Finish Sony media, actual games/apps store and library, first-launch layout choice, profile/background settings and verification.
- [x] Shared navigation, per-user library, Sony home/store/library/settings/profile.
- [ ] Xbox Series and Xbox Classic screens and guides.
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
- [x] Fix game sign-in replacing gameplay: early interception and arcade bridge open a separate proxied window; routing tests and browser popup check pass.
- [x] Music, Movies and AI open inside a PS5-style frame (no sidebar) while Console Mode is on.
- [x] Game thumbnails come from each game's source (arcade covers, cloud site screenshots) with genre art fallback.
- [x] All movie sources (VidSrc, APIPlayer, etc.) and free movies play through the proxy with their full address kept.
- [x] Game/website sign-in popups (e.g. Google) open in a proxied overlay.
- [x] YouTube, Netflix, Hulu and Paramount+ downloadable from the console store; open through the proxy.
- [ ] Signed-in check of these screens and real Google sign-in inside 1v1.LOL — needs a real account and playtesting.
- [ ] Import previous user records — no data export supplied.
