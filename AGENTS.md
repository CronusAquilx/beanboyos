<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Cloud games default to the standalone /play view to avoid mounting the app shell during gameplay; keep inline playback as an explicit fallback.
- Use only verified provider-native graphics controls; FivePlay profiles live in the shared game-performance module so other providers never receive invented engine flags.
- Gameplay's lightweight styling is temporary and must not overwrite the user's saved appearance preferences.
- Console Mode uses isolated authenticated console routes and shared navigation/library modules; skin screens compose them without changing classic or launcher layouts.
- Console games reuse the shared cloud catalog and regular-game player; local per-user installation state stores stable catalog IDs, while console appearance stays in the existing preferences store.

- Browser proxy transports must live inside `createClientOnlyFn` so Worker module initialization never evaluates browser WASM transport packages.
- Opening choices and explicit account confirmation are document-scoped through VisitProvider; persisted preferences or restored auth sessions never mark a new visit complete, and standalone gameplay bypasses this flow.
- Console media and arcade launches use router navigation to retain the current document's visit confirmation; cloud games alone open the standalone player tab.
- Console game artwork goes through one shared resolver: the game's source thumbnail first (arcade cover, cloud site screenshot), bundled genre illustration as fallback.
- In Console Mode, media/app routes render in ConsoleAppFrame instead of AppShell so console users never see the classic sidebar.
- Every embedded third-party page loads via openProxied; install popup interception before page scripts. OAuth reuses named native windows, retains the actual caller as opener, and routes delayed blank-window navigation at the top level; arcade bridge messages remain source-validated and return a delayed-navigation handle rather than null.
- Shared authentication and arcade views live in components rather than exported route components, preventing route splitting from pulling browser-only dependencies into the server entry.
- Xbox Series X screens compose the shared catalog, library actions and authenticated console routes; skin-scoped styles and a reusable guide preserve Sony and regular layouts.

- Cloud games use the shared launch resolver: GTA V has its tuned relay; streaming services and hostname-sensitive account games use the complete-site proxy to retain virtual origins and online sockets; other games use the allowlisted same-domain relay, with isolation only for big AAA ports.
- The Xbox home shelves list only titles the user has installed; unowned games stay in the store.
- The cloud relay explicitly allowlists verified provider asset hosts and rewrites dynamic iframe/script URLs as well as static markup; portal-only relaying leaves games blocked on separate CDN hosts.
- Provider game-only entry overrides live in the shared cloud relay resolver, retaining original catalog URLs and installed IDs so launch repairs do not discard libraries.
