# Koodal icons

All icons are **Phosphor Icons 2.1.1** (no custom SVG icons). The only image asset is the logo `design/assets/koodal-mark.png`.

## Why icons go missing when porting
- **39 of 138 icons never appear in the markup.** Their names are strings in the logic (`ic:'ph-hard-hat'`, `GS`, `STEPS`, nav items, category and stage maps) and reach the template through holes like `class="ph-bold {{ n.ic }}"`. A port that only reads markup drops them.
- The prototype loads icons as a **CSS font** (`ph-bold ph-x` classes). Rewriting to `@phosphor-icons/react` needs a name→component map for every dynamic string, and that step tends to get skipped.
- **Weights:** `ph-bold` = default UI, `ph-fill` = status and emphasis. The Citizen app also uses `ph-duotone` in a few places, but the prototype never loads the duotone CSS, so those icons render **blank** in the prototype too. Keep them blank or change them to `ph-bold`; don't invent a look.

## Required approach (keeps markup 1:1)
Use the same icon font as the prototype:

```bash
pnpm add @phosphor-icons/web@2.1.1
```
```ts
// app/layout.tsx
import '@phosphor-icons/web/bold';
import '@phosphor-icons/web/fill';
```
Then port icons literally: `<i className={`ph-bold ${n.ic}`} style={{fontSize:18}} />`. Keep every icon string in the logic unchanged. Don't swap to another icon set, and don't substitute "similar" icons.

Logo: copy `design/assets/koodal-mark.png` to `public/koodal-mark.png` and use it wherever the markup has `assets/koodal-mark.png`.

## Checklist: every icon used (138)
Columns: Phosphor name · React name (only if you really use @phosphor-icons/react) · app · where it's referenced

| icon | React | app | in |
|---|---|---|---|
| `ph-a` | `A` | citizen, gov | markup |
| `ph-alarm` | `Alarm` | gov | markup, logic |
| `ph-arrow-counter-clockwise` | `ArrowCounterClockwise` | citizen, gov | markup, logic |
| `ph-arrow-down` | `ArrowDown` | gov | logic |
| `ph-arrow-down-right` | `ArrowDownRight` | gov | logic |
| `ph-arrow-fat-down` | `ArrowFatDown` | citizen | logic |
| `ph-arrow-fat-up` | `ArrowFatUp` | citizen | markup, logic |
| `ph-arrow-left` | `ArrowLeft` | citizen, gov | markup, logic |
| `ph-arrow-right` | `ArrowRight` | citizen, gov | markup, logic |
| `ph-arrow-up` | `ArrowUp` | gov | logic |
| `ph-arrow-up-right` | `ArrowUpRight` | gov | logic |
| `ph-arrows-down-up` | `ArrowsDownUp` | citizen | markup |
| `ph-arrows-horizontal` | `ArrowsHorizontal` | citizen | markup |
| `ph-arrows-in-simple` | `ArrowsInSimple` | citizen, gov | logic |
| `ph-arrows-out-simple` | `ArrowsOutSimple` | citizen, gov | logic |
| `ph-b` | `B` | citizen, gov | markup |
| `ph-bank` | `Bank` | citizen, gov | markup, logic |
| `ph-bell` | `Bell` | gov | markup |
| `ph-bell-ringing` | `BellRinging` | citizen | logic |
| `ph-binoculars` | `Binoculars` | gov | markup |
| `ph-briefcase` | `Briefcase` | citizen | logic |
| `ph-buildings` | `Buildings` | citizen, gov | markup, logic |
| `ph-calendar-blank` | `CalendarBlank` | gov | markup, logic |
| `ph-calendar-check` | `CalendarCheck` | gov | markup, logic |
| `ph-camera` | `Camera` | citizen, gov | markup, logic |
| `ph-camera-plus` | `CameraPlus` | citizen | markup |
| `ph-camera-rotate` | `CameraRotate` | citizen | markup |
| `ph-cards` | `Cards` | citizen | logic |
| `ph-caret-double-left` | `CaretDoubleLeft` | citizen, gov | markup, logic |
| `ph-caret-double-right` | `CaretDoubleRight` | citizen | markup, logic |
| `ph-caret-down` | `CaretDown` | citizen, gov | markup |
| `ph-caret-left` | `CaretLeft` | citizen, gov | markup |
| `ph-caret-right` | `CaretRight` | citizen, gov | markup |
| `ph-caret-up-down` | `CaretUpDown` | gov | logic |
| `ph-chart-bar` | `ChartBar` | gov | markup, logic |
| `ph-chart-line` | `ChartLine` | gov | logic |
| `ph-chart-line-up` | `ChartLineUp` | gov | logic |
| `ph-chat-circle` | `ChatCircle` | citizen, gov | markup, logic |
| `ph-chat-text` | `ChatText` | gov | logic |
| `ph-check` | `Check` | citizen, gov | markup, logic |
| `ph-check-circle` | `CheckCircle` | citizen, gov | markup, logic |
| `ph-check-fat` | `CheckFat` | citizen | markup |
| `ph-check-square` | `CheckSquare` | gov | markup |
| `ph-circle` | `Circle` | gov | logic |
| `ph-circle-dashed` | `CircleDashed` | gov | logic |
| `ph-circle-half` | `CircleHalf` | citizen | markup, logic |
| `ph-city` | `City` | gov | logic |
| `ph-clock` | `Clock` | citizen, gov | logic |
| `ph-clock-counter-clockwise` | `ClockCounterClockwise` | citizen, gov | logic, markup |
| `ph-copy` | `Copy` | gov | markup |
| `ph-crosshair` | `Crosshair` | citizen, gov | markup, logic |
| `ph-desktop` | `Desktop` | gov | logic |
| `ph-detective` | `Detective` | citizen | markup, logic |
| `ph-device-mobile` | `DeviceMobile` | gov | logic |
| `ph-dots-nine` | `DotsNine` | citizen, gov | markup |
| `ph-dots-three` | `DotsThree` | citizen | markup |
| `ph-download-simple` | `DownloadSimple` | gov | markup |
| `ph-drop` | `Drop` | gov | markup, logic |
| `ph-envelope-simple` | `EnvelopeSimple` | gov | logic |
| `ph-eye` | `Eye` | gov | markup |
| `ph-file-text` | `FileText` | gov | markup, logic |
| `ph-fire` | `Fire` | gov | logic |
| `ph-flag` | `Flag` | citizen | markup |
| `ph-floppy-disk` | `FloppyDisk` | gov | logic |
| `ph-folders` | `Folders` | gov | logic |
| `ph-funnel-x` | `FunnelX` | citizen | markup |
| `ph-gear-six` | `GearSix` | citizen, gov | markup, logic |
| `ph-hand-pointing` | `HandPointing` | citizen | logic |
| `ph-hard-hat` | `HardHat` | citizen, gov | markup, logic |
| `ph-hash` | `Hash` | gov | logic |
| `ph-hourglass-medium` | `HourglassMedium` | citizen, gov | markup, logic |
| `ph-house` | `House` | gov | logic |
| `ph-house-line` | `HouseLine` | gov | markup |
| `ph-identification-badge` | `IdentificationBadge` | citizen | markup |
| `ph-identification-card` | `IdentificationCard` | citizen | markup |
| `ph-image-broken` | `ImageBroken` | gov | markup |
| `ph-images` | `Images` | citizen, gov | markup, logic |
| `ph-info` | `Info` | citizen | markup |
| `ph-intersect` | `Intersect` | citizen, gov | markup, logic |
| `ph-kanban` | `Kanban` | gov | logic |
| `ph-lifebuoy` | `Lifebuoy` | citizen | markup |
| `ph-lightbulb` | `Lightbulb` | gov | markup |
| `ph-lightning` | `Lightning` | citizen, gov | markup, logic |
| `ph-link-simple` | `LinkSimple` | gov | markup |
| `ph-list-bullets` | `ListBullets` | citizen, gov | markup |
| `ph-lock-key` | `LockKey` | gov | markup |
| `ph-lock-simple` | `LockSimple` | citizen, gov | markup |
| `ph-magnifying-glass` | `MagnifyingGlass` | citizen, gov | markup, logic |
| `ph-map-pin` | `MapPin` | citizen, gov | markup, logic |
| `ph-map-pin-simple` | `MapPinSimple` | citizen | logic |
| `ph-map-trifold` | `MapTrifold` | citizen, gov | logic, markup |
| `ph-megaphone` | `Megaphone` | gov | markup, logic |
| `ph-microphone` | `Microphone` | citizen | markup, logic |
| `ph-minus` | `Minus` | citizen, gov | markup |
| `ph-moon` | `Moon` | citizen | logic |
| `ph-navigation-arrow` | `NavigationArrow` | citizen | markup, logic |
| `ph-newspaper` | `Newspaper` | citizen | logic |
| `ph-paper-plane-tilt` | `PaperPlaneTilt` | citizen | markup, logic |
| `ph-paperclip` | `Paperclip` | gov | markup |
| `ph-pencil-simple` | `PencilSimple` | citizen, gov | markup, logic |
| `ph-phone` | `Phone` | citizen | markup |
| `ph-plus` | `Plus` | citizen, gov | markup |
| `ph-prohibit` | `Prohibit` | citizen, gov | markup |
| `ph-repeat` | `Repeat` | gov | markup, logic |
| `ph-road-horizon` | `RoadHorizon` | gov | markup |
| `ph-rows` | `Rows` | citizen, gov | logic |
| `ph-scales` | `Scales` | gov | markup |
| `ph-seal-check` | `SealCheck` | citizen, gov | markup, logic |
| `ph-share-fat` | `ShareFat` | citizen | markup |
| `ph-shield-check` | `ShieldCheck` | citizen, gov | markup |
| `ph-sidebar-simple` | `SidebarSimple` | citizen, gov | markup |
| `ph-sign-out` | `SignOut` | citizen, gov | markup |
| `ph-sliders-horizontal` | `SlidersHorizontal` | citizen, gov | markup |
| `ph-sort-ascending` | `SortAscending` | citizen | logic |
| `ph-sparkle` | `Sparkle` | citizen, gov | markup, logic |
| `ph-squares-four` | `SquaresFour` | citizen, gov | logic |
| `ph-sun` | `Sun` | citizen | logic |
| `ph-text-aa` | `TextAa` | citizen | markup |
| `ph-text-align-left` | `TextAlignLeft` | citizen | logic |
| `ph-thumbs-down` | `ThumbsDown` | citizen, gov | markup, logic |
| `ph-timer` | `Timer` | gov | logic |
| `ph-translate` | `Translate` | gov | markup |
| `ph-trash` | `Trash` | citizen, gov | markup |
| `ph-tree` | `Tree` | gov | markup |
| `ph-trend-up` | `TrendUp` | citizen | markup |
| `ph-upload-simple` | `UploadSimple` | citizen | markup |
| `ph-user` | `User` | citizen | logic |
| `ph-user-circle` | `UserCircle` | gov | markup |
| `ph-user-circle-check` | `UserCircleCheck` | gov | markup |
| `ph-users` | `Users` | citizen, gov | markup, logic |
| `ph-users-three` | `UsersThree` | citizen, gov | markup, logic |
| `ph-vibrate` | `Vibrate` | citizen | logic |
| `ph-warning` | `Warning` | citizen, gov | markup, logic |
| `ph-warning-circle` | `WarningCircle` | gov | markup |
| `ph-waveform` | `Waveform` | citizen | markup, logic |
| `ph-whatsapp-logo` | `WhatsappLogo` | citizen | markup, logic |
| `ph-x` | `X` | citizen, gov | markup, logic |
| `ph-x-circle` | `XCircle` | citizen, gov | markup, logic |

## Verify
After each slice, grep the built page's DOM for `i[class*="ph-"]`. Every element must have a non-zero width, because an empty glyph means the icon name or weight CSS is missing.
