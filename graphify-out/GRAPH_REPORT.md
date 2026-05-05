# Graph Report - .  (2026-05-05)

## Corpus Check
- Corpus is ~39,040 words - fits in a single context window. You may not need a graph.

## Summary
- 361 nodes · 418 edges · 93 communities detected
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 9 edges (avg confidence: 0.83)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Core UI Components|Core UI Components]]
- [[_COMMUNITY_Layout UI Components|Layout UI Components]]
- [[_COMMUNITY_Navigation & Menu System|Navigation & Menu System]]
- [[_COMMUNITY_API Client Layer|API Client Layer]]
- [[_COMMUNITY_File Processing & Utilities|File Processing & Utilities]]
- [[_COMMUNITY_Toast Notification System|Toast Notification System]]
- [[_COMMUNITY_Application Core & Routing|Application Core & Routing]]
- [[_COMMUNITY_Sidebar & Sidebar Controls|Sidebar & Sidebar Controls]]
- [[_COMMUNITY_Vite Build & Preview Plugins|Vite Build & Preview Plugins]]
- [[_COMMUNITY_Pagination System|Pagination System]]
- [[_COMMUNITY_Health Monitoring API|Health Monitoring API]]
- [[_COMMUNITY_Data Visualization (Charts)|Data Visualization (Charts)]]
- [[_COMMUNITY_API Server Infrastructure|API Server Infrastructure]]
- [[_COMMUNITY_External Notification Libraries|External Notification Libraries]]
- [[_COMMUNITY_Item Layout Components|Item Layout Components]]
- [[_COMMUNITY_Home Page Integration|Home Page Integration]]
- [[_COMMUNITY_OTP Input System|OTP Input System]]
- [[_COMMUNITY_DashCam Architecture (Conceptual)|DashCam Architecture (Conceptual)]]
- [[_COMMUNITY_Static Assets & Identity|Static Assets & Identity]]
- [[_COMMUNITY_Input Grouping Logic|Input Grouping Logic]]
- [[_COMMUNITY_Loading Skeletons|Loading Skeletons]]
- [[_COMMUNITY_Keyboard Interaction UI|Keyboard Interaction UI]]
- [[_COMMUNITY_Empty State Management|Empty State Management]]
- [[_COMMUNITY_API Routes & Middleware|API Routes & Middleware]]
- [[_COMMUNITY_Sandbox Component Loader|Sandbox Component Loader]]
- [[_COMMUNITY_Radix UI Primitives|Radix UI Primitives]]
- [[_COMMUNITY_Form Field Logic|Form Field Logic]]
- [[_COMMUNITY_Mobile Optimization Hooks|Mobile Optimization Hooks]]
- [[_COMMUNITY_Carousel Interactions|Carousel Interactions]]
- [[_COMMUNITY_Project Documentation|Project Documentation]]
- [[_COMMUNITY_Error Pages|Error Pages]]
- [[_COMMUNITY_Build Scripts|Build Scripts]]
- [[_COMMUNITY_API Code Generation|API Code Generation]]
- [[_COMMUNITY_Component Module 33|Component Module 33]]
- [[_COMMUNITY_Component Module 34|Component Module 34]]
- [[_COMMUNITY_Component Module 35|Component Module 35]]
- [[_COMMUNITY_Component Module 36|Component Module 36]]
- [[_COMMUNITY_Component Module 37|Component Module 37]]
- [[_COMMUNITY_Component Module 38|Component Module 38]]
- [[_COMMUNITY_Component Module 39|Component Module 39]]
- [[_COMMUNITY_Component Module 40|Component Module 40]]
- [[_COMMUNITY_Component Module 41|Component Module 41]]
- [[_COMMUNITY_Component Module 42|Component Module 42]]
- [[_COMMUNITY_Component Module 43|Component Module 43]]
- [[_COMMUNITY_Component Module 44|Component Module 44]]
- [[_COMMUNITY_Database Persistence Layer|Database Persistence Layer]]
- [[_COMMUNITY_Component Module 46|Component Module 46]]
- [[_COMMUNITY_Component Module 47|Component Module 47]]
- [[_COMMUNITY_Component Module 48|Component Module 48]]
- [[_COMMUNITY_Component Module 49|Component Module 49]]
- [[_COMMUNITY_Component Module 50|Component Module 50]]
- [[_COMMUNITY_Component Module 51|Component Module 51]]
- [[_COMMUNITY_Component Module 52|Component Module 52]]
- [[_COMMUNITY_Component Module 53|Component Module 53]]
- [[_COMMUNITY_Component Module 54|Component Module 54]]
- [[_COMMUNITY_Component Module 55|Component Module 55]]
- [[_COMMUNITY_Component Module 56|Component Module 56]]
- [[_COMMUNITY_Component Module 57|Component Module 57]]
- [[_COMMUNITY_Component Module 58|Component Module 58]]
- [[_COMMUNITY_Component Module 59|Component Module 59]]
- [[_COMMUNITY_Component Module 60|Component Module 60]]
- [[_COMMUNITY_Component Module 61|Component Module 61]]
- [[_COMMUNITY_Component Module 62|Component Module 62]]
- [[_COMMUNITY_Component Module 63|Component Module 63]]
- [[_COMMUNITY_Component Module 64|Component Module 64]]
- [[_COMMUNITY_Component Module 65|Component Module 65]]
- [[_COMMUNITY_Component Module 66|Component Module 66]]
- [[_COMMUNITY_Component Module 67|Component Module 67]]
- [[_COMMUNITY_Component Module 68|Component Module 68]]
- [[_COMMUNITY_Component Module 69|Component Module 69]]
- [[_COMMUNITY_Component Module 70|Component Module 70]]
- [[_COMMUNITY_Component Module 71|Component Module 71]]
- [[_COMMUNITY_Component Module 72|Component Module 72]]
- [[_COMMUNITY_Component Module 73|Component Module 73]]
- [[_COMMUNITY_Component Module 74|Component Module 74]]
- [[_COMMUNITY_Component Module 75|Component Module 75]]
- [[_COMMUNITY_Component Module 76|Component Module 76]]
- [[_COMMUNITY_Component Module 77|Component Module 77]]
- [[_COMMUNITY_Component Module 78|Component Module 78]]
- [[_COMMUNITY_Component Module 79|Component Module 79]]
- [[_COMMUNITY_Component Module 80|Component Module 80]]
- [[_COMMUNITY_Component Module 81|Component Module 81]]
- [[_COMMUNITY_Component Module 82|Component Module 82]]
- [[_COMMUNITY_Component Module 83|Component Module 83]]
- [[_COMMUNITY_Component Module 84|Component Module 84]]
- [[_COMMUNITY_Component Module 85|Component Module 85]]
- [[_COMMUNITY_Component Module 86|Component Module 86]]
- [[_COMMUNITY_Component Module 87|Component Module 87]]
- [[_COMMUNITY_Component Module 88|Component Module 88]]
- [[_COMMUNITY_Component Module 89|Component Module 89]]
- [[_COMMUNITY_Component Module 90|Component Module 90]]
- [[_COMMUNITY_Component Module 91|Component Module 91]]
- [[_COMMUNITY_Component Module 92|Component Module 92]]

## God Nodes (most connected - your core abstractions)
1. `cn()` - 38 edges
2. `customFetch()` - 11 edges
3. `parseErrorBody()` - 8 edges
4. `parseContent()` - 6 edges
5. `toast()` - 5 edges
6. `inferResponseType()` - 5 edges
7. `parseSuccessBody()` - 5 edges
8. `Express App Setup` - 5 edges
9. `reducer()` - 4 edges
10. `dispatch()` - 4 edges

## Surprising Connections (you probably didn't know these)
- `parseContent()` --semantically_similar_to--> `extractTextFromPdf()`  [INFERRED] [semantically similar]
  artifacts/chat-to-files/src/lib/parser.ts → artifacts/chat-to-files/src/lib/pdfExtractor.ts
- `Usage Guide` --references--> `Deployment Guide`  [INFERRED]
  USAGE_GUIDE.md → DEPLOYMENT_GUIDE.md
- `Chat to Files Dark Theme UI` --conceptually_related_to--> `Chat to Files Web App`  [INFERRED]
  artifacts/chat-to-files/public/opengraph.jpg → artifacts/chat-to-files/index.html
- `Red Rounded Square App Icon` --conceptually_related_to--> `Chat to Files Web App`  [INFERRED]
  artifacts/chat-to-files/public/favicon.svg → artifacts/chat-to-files/index.html
- `ButtonGroup()` --semantically_similar_to--> `Button`  [INFERRED] [semantically similar]
  artifacts/mockup-sandbox/src/components/ui/button-group.tsx → artifacts/chat-to-files/src/components/ui/button.tsx

## Hyperedges (group relationships)
- **Radix UI Based Components** — context_menu_contextmenu, switch_switch, select_select, popover_popover, dialog_dialog, hover_card_hovercard, checkbox_checkbox, dropdown_menu_dropdownmenu [EXTRACTED 0.90]
- **Shadcn UI Library** — tabs_tabs, progress_progress, form_form, tooltip_tooltip, menubar_menubar, pagination_pagination, breadcrumb_breadcrumb, card_card, toggle_toggle, carousel_carousel, scroll_area_scrollarea, item_item [INFERRED 0.90]
- **API Server Infrastructure** — build_buildall, index_server, app_app, health_healthz, logger_logger [INFERRED 0.95]
- **Toast Management System** — use_toast_usetoast, toast_toast, toaster_toaster [INFERRED 0.85]
- **Chart UI Components** — chart_chartcontainer, chart_charttooltip, chart_chartlegend [INFERRED 0.80]
- **Overlay Components** — popover_popover, dialog_dialog, hover_card_hovercard, drawer_drawer, tooltip_tooltip, dropdown_menu_dropdownmenu [INFERRED 0.90]
- **Input Components** — select_select, toggle_group_togglegroup, textarea_textarea, checkbox_checkbox, form_form, field_field, calendar_calendar [INFERRED 0.85]
- **UI Component Library** — menubar_menubar, pagination_pagination, breadcrumb_breadcrumb, card_card, toggle_toggle, carousel_carousel, scroll_area_scrollarea, item_item [INFERRED 0.90]
- **API Code Generation Stack** — orval_config_defineconfig, custom_fetch_customfetch, api_healthcheck, api_z_healthcheckresponse [INFERRED 0.85]
- **DashCam Core Architecture** — pasted_i_cannot_directly_compile_and_hand_you_a_downloadable_a_1777743294859_dashcamapp, pasted_i_cannot_directly_compile_and_hand_you_a_downloadable_a_1777743294859_speedlimitdetector, pasted_i_cannot_directly_compile_and_hand_you_a_downloadable_a_1777743294859_telegrambotclient [EXTRACTED 1.00]
- **Chat to Files App Presentation** — index_chattofiles, opengraph_ui, favicon_appicon [INFERRED 0.80]

## Communities

### Community 0 - "Core UI Components"
Cohesion: 0.05
Nodes (40): Alert, Badge(), Breadcrumb Component, Button, ButtonGroup(), Calendar(), cn(), Card Component (+32 more)

### Community 1 - "Layout UI Components"
Cohesion: 0.04
Nodes (1): react

### Community 2 - "Navigation & Menu System"
Cohesion: 0.07
Nodes (1): lucide-react

### Community 3 - "API Client Layer"
Cohesion: 0.15
Nodes (23): ApiError, applyBaseUrl(), buildErrorMessage(), customFetch(), getMediaType(), getStringField(), hasNoBody(), inferResponseType() (+15 more)

### Community 4 - "File Processing & Utilities"
Cohesion: 0.27
Nodes (8): extractPathFromCodeFirstLine(), extractPathFromText(), getExtension(), getLanguageFromPath(), isFilePath(), parseContent(), extractTextFromPdf(), buildZip()

### Community 5 - "Toast Notification System"
Cohesion: 0.42
Nodes (8): Toast, Toaster, addToRemoveQueue(), dispatch(), genId(), reducer(), toast(), useToast()

### Community 6 - "Application Core & Routing"
Cohesion: 0.25
Nodes (2): @tanstack/react-query, wouter

### Community 7 - "Sidebar & Sidebar Controls"
Cohesion: 0.46
Nodes (6): cn(), handleKeyDown(), SidebarMenu(), SidebarMenuButton(), SidebarMenuItem(), useSidebar()

### Community 8 - "Vite Build & Preview Plugins"
Cohesion: 0.29
Nodes (4): Sandbox Entry, mockupPreviewPlugin(), vite, Mockup Sandbox Config

### Community 9 - "Pagination System"
Cohesion: 0.48
Nodes (5): Pagination(), PaginationEllipsis(), PaginationLink(), PaginationNext(), PaginationPrevious()

### Community 10 - "Health Monitoring API"
Cohesion: 0.43
Nodes (6): getHealthCheckQueryKey(), getHealthCheckQueryOptions(), getHealthCheckUrl(), healthCheck(), HealthStatus Schema, useHealthCheck()

### Community 11 - "Data Visualization (Charts)"
Cohesion: 0.47
Nodes (3): cn(), useChart(), recharts

### Community 12 - "API Server Infrastructure"
Cohesion: 0.4
Nodes (6): Express App Setup, Gallery, PreviewRenderer, Health Check Route, API Server Entry, Pino Logger

### Community 13 - "External Notification Libraries"
Cohesion: 0.5
Nodes (2): sonner, Toaster()

### Community 14 - "Item Layout Components"
Cohesion: 0.6
Nodes (3): cn(), ItemGroup(), ItemSeparator()

### Community 15 - "Home Page Integration"
Cohesion: 0.5
Nodes (0): 

### Community 16 - "OTP Input System"
Cohesion: 0.5
Nodes (1): input-otp

### Community 17 - "DashCam Architecture (Conceptual)"
Cohesion: 0.5
Nodes (4): DashCam App Architecture, ImageProxy Closure Rationale, Speed Limit OCR Detector, Telegram Bot Integration

### Community 18 - "Static Assets & Identity"
Cohesion: 0.5
Nodes (4): Red Rounded Square App Icon, Chat to Files Web App, File Upload Dropzone, Chat to Files Dark Theme UI

### Community 19 - "Input Grouping Logic"
Cohesion: 0.67
Nodes (1): cn()

### Community 20 - "Loading Skeletons"
Cohesion: 0.67
Nodes (1): Skeleton()

### Community 21 - "Keyboard Interaction UI"
Cohesion: 0.67
Nodes (1): cn()

### Community 22 - "Empty State Management"
Cohesion: 0.67
Nodes (1): cn()

### Community 23 - "API Routes & Middleware"
Cohesion: 0.67
Nodes (0): 

### Community 24 - "Sandbox Component Loader"
Cohesion: 1.0
Nodes (2): loadComponent(), _resolveComponent()

### Community 25 - "Radix UI Primitives"
Cohesion: 0.67
Nodes (1): @radix-ui/react-toast

### Community 26 - "Form Field Logic"
Cohesion: 0.67
Nodes (1): cn()

### Community 27 - "Mobile Optimization Hooks"
Cohesion: 0.67
Nodes (1): useIsMobile()

### Community 28 - "Carousel Interactions"
Cohesion: 0.67
Nodes (1): useCarousel()

### Community 29 - "Project Documentation"
Cohesion: 0.67
Nodes (3): Deployment Guide, Replit Workspace Config, Usage Guide

### Community 30 - "Error Pages"
Cohesion: 1.0
Nodes (0): 

### Community 31 - "Build Scripts"
Cohesion: 1.0
Nodes (0): 

### Community 32 - "API Code Generation"
Cohesion: 1.0
Nodes (0): 

### Community 33 - "Component Module 33"
Cohesion: 1.0
Nodes (1): @radix-ui/react-avatar

### Community 34 - "Component Module 34"
Cohesion: 1.0
Nodes (1): @radix-ui/react-dialog

### Community 35 - "Component Module 35"
Cohesion: 1.0
Nodes (0): 

### Community 36 - "Component Module 36"
Cohesion: 1.0
Nodes (1): @radix-ui/react-slider

### Community 37 - "Component Module 37"
Cohesion: 1.0
Nodes (1): @radix-ui/react-alert-dialog

### Community 38 - "Component Module 38"
Cohesion: 1.0
Nodes (1): @radix-ui/react-radio-group

### Community 39 - "Component Module 39"
Cohesion: 1.0
Nodes (1): @radix-ui/react-navigation-menu

### Community 40 - "Component Module 40"
Cohesion: 1.0
Nodes (1): @radix-ui/react-accordion

### Community 41 - "Component Module 41"
Cohesion: 1.0
Nodes (1): @radix-ui/react-aspect-ratio

### Community 42 - "Component Module 42"
Cohesion: 1.0
Nodes (1): @radix-ui/react-separator

### Community 43 - "Component Module 43"
Cohesion: 1.0
Nodes (1): @radix-ui/react-collapsible

### Community 44 - "Component Module 44"
Cohesion: 1.0
Nodes (2): InputGroup, Input

### Community 45 - "Database Persistence Layer"
Cohesion: 1.0
Nodes (2): Drizzle Configuration, Database Instance

### Community 46 - "Component Module 46"
Cohesion: 1.0
Nodes (0): 

### Community 47 - "Component Module 47"
Cohesion: 1.0
Nodes (0): 

### Community 48 - "Component Module 48"
Cohesion: 1.0
Nodes (0): 

### Community 49 - "Component Module 49"
Cohesion: 1.0
Nodes (0): 

### Community 50 - "Component Module 50"
Cohesion: 1.0
Nodes (0): 

### Community 51 - "Component Module 51"
Cohesion: 1.0
Nodes (0): 

### Community 52 - "Component Module 52"
Cohesion: 1.0
Nodes (0): 

### Community 53 - "Component Module 53"
Cohesion: 1.0
Nodes (0): 

### Community 54 - "Component Module 54"
Cohesion: 1.0
Nodes (0): 

### Community 55 - "Component Module 55"
Cohesion: 1.0
Nodes (0): 

### Community 56 - "Component Module 56"
Cohesion: 1.0
Nodes (0): 

### Community 57 - "Component Module 57"
Cohesion: 1.0
Nodes (0): 

### Community 58 - "Component Module 58"
Cohesion: 1.0
Nodes (0): 

### Community 59 - "Component Module 59"
Cohesion: 1.0
Nodes (0): 

### Community 60 - "Component Module 60"
Cohesion: 1.0
Nodes (0): 

### Community 61 - "Component Module 61"
Cohesion: 1.0
Nodes (0): 

### Community 62 - "Component Module 62"
Cohesion: 1.0
Nodes (0): 

### Community 63 - "Component Module 63"
Cohesion: 1.0
Nodes (0): 

### Community 64 - "Component Module 64"
Cohesion: 1.0
Nodes (0): 

### Community 65 - "Component Module 65"
Cohesion: 1.0
Nodes (0): 

### Community 66 - "Component Module 66"
Cohesion: 1.0
Nodes (0): 

### Community 67 - "Component Module 67"
Cohesion: 1.0
Nodes (0): 

### Community 68 - "Component Module 68"
Cohesion: 1.0
Nodes (0): 

### Community 69 - "Component Module 69"
Cohesion: 1.0
Nodes (0): 

### Community 70 - "Component Module 70"
Cohesion: 1.0
Nodes (0): 

### Community 71 - "Component Module 71"
Cohesion: 1.0
Nodes (0): 

### Community 72 - "Component Module 72"
Cohesion: 1.0
Nodes (1): ChartContainer

### Community 73 - "Component Module 73"
Cohesion: 1.0
Nodes (1): ChartTooltip

### Community 74 - "Component Module 74"
Cohesion: 1.0
Nodes (1): ChartLegend

### Community 75 - "Component Module 75"
Cohesion: 1.0
Nodes (1): AspectRatio

### Community 76 - "Component Module 76"
Cohesion: 1.0
Nodes (1): NavigationMenu

### Community 77 - "Component Module 77"
Cohesion: 1.0
Nodes (1): Avatar

### Community 78 - "Component Module 78"
Cohesion: 1.0
Nodes (1): InputOTP

### Community 79 - "Component Module 79"
Cohesion: 1.0
Nodes (1): Separator

### Community 80 - "Component Module 80"
Cohesion: 1.0
Nodes (1): Sheet

### Community 81 - "Component Module 81"
Cohesion: 1.0
Nodes (1): Slider

### Community 82 - "Component Module 82"
Cohesion: 1.0
Nodes (1): Accordion

### Community 83 - "Component Module 83"
Cohesion: 1.0
Nodes (1): Table

### Community 84 - "Component Module 84"
Cohesion: 1.0
Nodes (1): Collapsible

### Community 85 - "Component Module 85"
Cohesion: 1.0
Nodes (1): AlertDialog

### Community 86 - "Component Module 86"
Cohesion: 1.0
Nodes (1): RadioGroup

### Community 87 - "Component Module 87"
Cohesion: 1.0
Nodes (1): SelectContent

### Community 88 - "Component Module 88"
Cohesion: 1.0
Nodes (1): SelectItem

### Community 89 - "Component Module 89"
Cohesion: 1.0
Nodes (1): MenubarTrigger

### Community 90 - "Component Module 90"
Cohesion: 1.0
Nodes (1): Hello Script

### Community 91 - "Component Module 91"
Cohesion: 1.0
Nodes (1): Zod Health Check Response

### Community 92 - "Component Module 92"
Cohesion: 1.0
Nodes (1): Mockup Canvas Web App

## Knowledge Gaps
- **62 isolated node(s):** `ContextMenu`, `Switch`, `Kbd`, `Popover`, `ToggleGroup` (+57 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Error Pages`** (2 nodes): `not-found.tsx`, `NotFound()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Build Scripts`** (2 nodes): `build.mjs`, `buildAll()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `API Code Generation`** (2 nodes): `orval.config.ts`, `titleTransformer()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Component Module 33`** (2 nodes): `@radix-ui/react-avatar`, `avatar.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Component Module 34`** (2 nodes): `@radix-ui/react-dialog`, `sheet.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Component Module 35`** (2 nodes): `input-group.tsx`, `input.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Component Module 36`** (2 nodes): `@radix-ui/react-slider`, `slider.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Component Module 37`** (2 nodes): `@radix-ui/react-alert-dialog`, `alert-dialog.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Component Module 38`** (2 nodes): `@radix-ui/react-radio-group`, `radio-group.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Component Module 39`** (2 nodes): `@radix-ui/react-navigation-menu`, `navigation-menu.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Component Module 40`** (2 nodes): `@radix-ui/react-accordion`, `accordion.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Component Module 41`** (2 nodes): `@radix-ui/react-aspect-ratio`, `aspect-ratio.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Component Module 42`** (2 nodes): `@radix-ui/react-separator`, `separator.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Component Module 43`** (2 nodes): `@radix-ui/react-collapsible`, `collapsible.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Component Module 44`** (2 nodes): `InputGroup`, `Input`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Database Persistence Layer`** (2 nodes): `Drizzle Configuration`, `Database Instance`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Component Module 46`** (1 nodes): `main.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Component Module 47`** (1 nodes): `aspect-ratio.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Component Module 48`** (1 nodes): `collapsible.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Component Module 49`** (1 nodes): `toaster.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Component Module 50`** (1 nodes): `index.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Component Module 51`** (1 nodes): `health.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Component Module 52`** (1 nodes): `index.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Component Module 53`** (1 nodes): `logger.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Component Module 54`** (1 nodes): `main.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Component Module 55`** (1 nodes): `aspect-ratio.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Component Module 56`** (1 nodes): `collapsible.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Component Module 57`** (1 nodes): `toaster.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Component Module 58`** (1 nodes): `hello.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Component Module 59`** (1 nodes): `index.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Component Module 60`** (1 nodes): `api.schemas.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Component Module 61`** (1 nodes): `drizzle.config.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Component Module 62`** (1 nodes): `index.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Component Module 63`** (1 nodes): `index.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Component Module 64`** (1 nodes): `index.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Component Module 65`** (1 nodes): `api.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Component Module 66`** (1 nodes): `healthStatus.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Component Module 67`** (1 nodes): `index.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Component Module 68`** (1 nodes): `vite.config.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Component Module 69`** (1 nodes): `use-mobile.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Component Module 70`** (1 nodes): `skeleton.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Component Module 71`** (1 nodes): `table.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Component Module 72`** (1 nodes): `ChartContainer`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Component Module 73`** (1 nodes): `ChartTooltip`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Component Module 74`** (1 nodes): `ChartLegend`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Component Module 75`** (1 nodes): `AspectRatio`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Component Module 76`** (1 nodes): `NavigationMenu`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Component Module 77`** (1 nodes): `Avatar`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Component Module 78`** (1 nodes): `InputOTP`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Component Module 79`** (1 nodes): `Separator`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Component Module 80`** (1 nodes): `Sheet`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Component Module 81`** (1 nodes): `Slider`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Component Module 82`** (1 nodes): `Accordion`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Component Module 83`** (1 nodes): `Table`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Component Module 84`** (1 nodes): `Collapsible`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Component Module 85`** (1 nodes): `AlertDialog`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Component Module 86`** (1 nodes): `RadioGroup`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Component Module 87`** (1 nodes): `SelectContent`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Component Module 88`** (1 nodes): `SelectItem`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Component Module 89`** (1 nodes): `MenubarTrigger`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Component Module 90`** (1 nodes): `Hello Script`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Component Module 91`** (1 nodes): `Zod Health Check Response`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Component Module 92`** (1 nodes): `Mockup Canvas Web App`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `Core UI Components` to `Pagination System`?**
  _High betweenness centrality (0.105) - this node is a cross-community bridge._
- **Why does `Pagination()` connect `Pagination System` to `Core UI Components`?**
  _High betweenness centrality (0.032) - this node is a cross-community bridge._
- **What connects `ContextMenu`, `Switch`, `Kbd` to the rest of the system?**
  _62 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Core UI Components` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._
- **Should `Layout UI Components` be split into smaller, more focused modules?**
  _Cohesion score 0.04 - nodes in this community are weakly interconnected._
- **Should `Navigation & Menu System` be split into smaller, more focused modules?**
  _Cohesion score 0.07 - nodes in this community are weakly interconnected._