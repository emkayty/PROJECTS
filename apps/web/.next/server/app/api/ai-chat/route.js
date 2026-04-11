(()=>{var a={};a.id=6523,a.ids=[6523],a.modules={261:a=>{"use strict";a.exports=require("next/dist/shared/lib/router/utils/app-paths")},3295:a=>{"use strict";a.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},10846:a=>{"use strict";a.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},19121:a=>{"use strict";a.exports=require("next/dist/server/app-render/action-async-storage.external.js")},29294:a=>{"use strict";a.exports=require("next/dist/server/app-render/work-async-storage.external.js")},44870:a=>{"use strict";a.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},63033:a=>{"use strict";a.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},74236:(a,b,c)=>{"use strict";c.r(b),c.d(b,{handler:()=>C,patchFetch:()=>B,routeModule:()=>x,serverHooks:()=>A,workAsyncStorage:()=>y,workUnitAsyncStorage:()=>z});var d={};c.r(d),c.d(d,{POST:()=>w});var e=c(95736),f=c(9117),g=c(4044),h=c(39326),i=c(32324),j=c(261),k=c(54290),l=c(85328),m=c(38928),n=c(46595),o=c(3421),p=c(17679),q=c(41681),r=c(63446),s=c(86439),t=c(51356),u=c(10641);let v=(0,c(9608).lw)(process.env.DATABASE_URL);async function w(a){try{let b=a.cookies.get("auth_token")?.value;if(!b)return u.NextResponse.json({error:"Unauthorized"},{status:401});let c=await v`
      SELECT id, username FROM users WHERE session_token = ${b}
    `;if(0===c.length)return u.NextResponse.json({error:"Invalid session"},{status:401});let d=c[0],{messages:e}=await a.json();if(!e||0===e.length)return u.NextResponse.json({error:"No messages provided"},{status:400});let f=process.env.OPENAI_API_KEY;if(!f)return u.NextResponse.json({error:"OpenAI API key not configured",message:"I apologize, but AI assistance is not currently available. Please contact support."},{status:503});let g={role:"system",content:`You are an expert AI assistant for a professional BIOS, firmware, schematics, and electronics repair platform. You provide comprehensive technical support for:

**DEVICE CATEGORIES:**
- Laptops (Dell, HP, Lenovo, Asus, Acer, MSI, Razer, Alienware, Toshiba, Samsung, LG)
- MacBooks (Air, Pro, all models)
- Desktop Motherboards (Intel, AMD, all brands)
- All-in-One PCs
- Tablets (iPad, Surface, Android tablets)
- Gaming Consoles (PlayStation, Xbox, Nintendo Switch)
- Smartphones (iPhone, Android)
- Servers & Workstations
- Network Equipment (routers, switches)
- NLBA1 devices

**REPAIR SERVICES:**
- BIOS/UEFI programming & recovery
- EC (Embedded Controller) programming
- Chip-level repair & diagnostics
- Component-level troubleshooting
- Power supply repair (voltage rails, MOSFETs, capacitors)
- GPU repair & reballing
- CPU socket repair
- RAM slot repair
- Water/liquid damage recovery
- Data recovery
- Circuit tracing & analysis
- SMD soldering & rework
- BGA reballing & reflow
- Microsoldering
- BIOS password removal
- ME (Management Engine) region repair

**TECHNICAL RESOURCES:**
- Schematic diagrams (boardview files)
- BIOS firmware files (Dell, HP, Lenovo, etc.)
- EC firmware
- Service manuals & disassembly guides
- Component datasheets (ICs, MOSFETs, voltage regulators)
- Pinout diagrams
- Voltage rail charts
- Block diagrams
- Component location maps
- PCB layer analysis

**DIAGNOSTIC TECHNIQUES:**
- Multimeter testing (continuity, resistance, voltage)
- Oscilloscope signal analysis
- Logic analyzer usage
- Power-on sequence analysis
- POST code debugging
- BIOS beep codes
- LED diagnostic codes
- Current draw analysis
- Short circuit detection
- Thermal imaging

**COMMON ISSUES & SOLUTIONS:**
- No power / Dead motherboard
- No display / Black screen
- No POST / Boot failure
- Boot loops
- BIOS corruption / Brick recovery
- Overheating / Thermal shutdown
- Liquid damage corrosion
- Short circuits
- Blown fuses & MOSFETs
- Failed voltage regulators
- Capacitor failures
- Battery charging issues
- Keyboard/touchpad failures
- USB/HDMI port repair
- Audio jack repair
- WiFi/Bluetooth issues

**TOOLS & EQUIPMENT:**
- BIOS programmers (CH341A, TL866, RT809F)
- Hot air rework stations
- Soldering stations
- Multimeters & LCR meters
- Oscilloscopes
- Power supplies (bench PSU)
- Ultrasonic cleaners
- Magnification (microscope, magnifying lamps)
- ESD protection
- Flux & solder types

**SOFTWARE TOOLS:**
- BIOS editing tools
- Boardview viewers
- Hex editors
- Firmware extraction tools
- Flash programming software

Be highly technical, precise, and professional. Provide step-by-step diagnostics, voltage measurements, component identification, and repair procedures. Use proper electronics terminology. Current user: ${d.username}`},h=await fetch("https://api.openai.com/v1/chat/completions",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${f}`},body:JSON.stringify({model:"gpt-4o-mini",messages:[g,...e],max_tokens:1e3,temperature:.7})});if(!h.ok){let a=await h.json();return console.error("OpenAI API error:",a),u.NextResponse.json({error:"AI service error",message:"Sorry, I encountered an error. Please try again."},{status:500})}let i=(await h.json()).choices[0].message.content;return await v`
      INSERT INTO ai_conversations (user_id, messages, created_at)
      VALUES (${d.id}, ${JSON.stringify([...e,{role:"assistant",content:i}])}, NOW())
    `,u.NextResponse.json({message:i,success:!0})}catch(a){return console.error("AI chat error:",a),u.NextResponse.json({error:"Internal server error",message:"Sorry, something went wrong. Please try again."},{status:500})}}let x=new e.AppRouteRouteModule({definition:{kind:f.RouteKind.APP_ROUTE,page:"/api/ai-chat/route",pathname:"/api/ai-chat",filename:"route",bundlePath:"app/api/ai-chat/route"},distDir:".next",relativeProjectDir:"",resolvedPagePath:"/workspace/project/apps/web/app/api/ai-chat/route.ts",nextConfigOutput:"",userland:d}),{workAsyncStorage:y,workUnitAsyncStorage:z,serverHooks:A}=x;function B(){return(0,g.patchFetch)({workAsyncStorage:y,workUnitAsyncStorage:z})}async function C(a,b,c){var d;let e="/api/ai-chat/route";"/index"===e&&(e="/");let g=await x.prepare(a,b,{srcPage:e,multiZoneDraftMode:!1});if(!g)return b.statusCode=400,b.end("Bad Request"),null==c.waitUntil||c.waitUntil.call(c,Promise.resolve()),null;let{buildId:u,params:v,nextConfig:w,isDraftMode:y,prerenderManifest:z,routerServerContext:A,isOnDemandRevalidate:B,revalidateOnlyGenerated:C,resolvedPathname:D}=g,E=(0,j.normalizeAppPath)(e),F=!!(z.dynamicRoutes[E]||z.routes[D]);if(F&&!y){let a=!!z.routes[D],b=z.dynamicRoutes[E];if(b&&!1===b.fallback&&!a)throw new s.NoFallbackError}let G=null;!F||x.isDev||y||(G="/index"===(G=D)?"/":G);let H=!0===x.isDev||!F,I=F&&!H,J=a.method||"GET",K=(0,i.getTracer)(),L=K.getActiveScopeSpan(),M={params:v,prerenderManifest:z,renderOpts:{experimental:{cacheComponents:!!w.experimental.cacheComponents,authInterrupts:!!w.experimental.authInterrupts},supportsDynamicResponse:H,incrementalCache:(0,h.getRequestMeta)(a,"incrementalCache"),cacheLifeProfiles:null==(d=w.experimental)?void 0:d.cacheLife,isRevalidate:I,waitUntil:c.waitUntil,onClose:a=>{b.on("close",a)},onAfterTaskError:void 0,onInstrumentationRequestError:(b,c,d)=>x.onRequestError(a,b,d,A)},sharedContext:{buildId:u}},N=new k.NodeNextRequest(a),O=new k.NodeNextResponse(b),P=l.NextRequestAdapter.fromNodeNextRequest(N,(0,l.signalFromNodeResponse)(b));try{let d=async c=>x.handle(P,M).finally(()=>{if(!c)return;c.setAttributes({"http.status_code":b.statusCode,"next.rsc":!1});let d=K.getRootSpanAttributes();if(!d)return;if(d.get("next.span_type")!==m.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${d.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let e=d.get("next.route");if(e){let a=`${J} ${e}`;c.setAttributes({"next.route":e,"http.route":e,"next.span_name":a}),c.updateName(a)}else c.updateName(`${J} ${a.url}`)}),g=async g=>{var i,j;let k=async({previousCacheEntry:f})=>{try{if(!(0,h.getRequestMeta)(a,"minimalMode")&&B&&C&&!f)return b.statusCode=404,b.setHeader("x-nextjs-cache","REVALIDATED"),b.end("This page could not be found"),null;let e=await d(g);a.fetchMetrics=M.renderOpts.fetchMetrics;let i=M.renderOpts.pendingWaitUntil;i&&c.waitUntil&&(c.waitUntil(i),i=void 0);let j=M.renderOpts.collectedTags;if(!F)return await (0,o.I)(N,O,e,M.renderOpts.pendingWaitUntil),null;{let a=await e.blob(),b=(0,p.toNodeOutgoingHttpHeaders)(e.headers);j&&(b[r.NEXT_CACHE_TAGS_HEADER]=j),!b["content-type"]&&a.type&&(b["content-type"]=a.type);let c=void 0!==M.renderOpts.collectedRevalidate&&!(M.renderOpts.collectedRevalidate>=r.INFINITE_CACHE)&&M.renderOpts.collectedRevalidate,d=void 0===M.renderOpts.collectedExpire||M.renderOpts.collectedExpire>=r.INFINITE_CACHE?void 0:M.renderOpts.collectedExpire;return{value:{kind:t.CachedRouteKind.APP_ROUTE,status:e.status,body:Buffer.from(await a.arrayBuffer()),headers:b},cacheControl:{revalidate:c,expire:d}}}}catch(b){throw(null==f?void 0:f.isStale)&&await x.onRequestError(a,b,{routerKind:"App Router",routePath:e,routeType:"route",revalidateReason:(0,n.c)({isRevalidate:I,isOnDemandRevalidate:B})},A),b}},l=await x.handleResponse({req:a,nextConfig:w,cacheKey:G,routeKind:f.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:z,isRoutePPREnabled:!1,isOnDemandRevalidate:B,revalidateOnlyGenerated:C,responseGenerator:k,waitUntil:c.waitUntil});if(!F)return null;if((null==l||null==(i=l.value)?void 0:i.kind)!==t.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==l||null==(j=l.value)?void 0:j.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});(0,h.getRequestMeta)(a,"minimalMode")||b.setHeader("x-nextjs-cache",B?"REVALIDATED":l.isMiss?"MISS":l.isStale?"STALE":"HIT"),y&&b.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let m=(0,p.fromNodeOutgoingHttpHeaders)(l.value.headers);return(0,h.getRequestMeta)(a,"minimalMode")&&F||m.delete(r.NEXT_CACHE_TAGS_HEADER),!l.cacheControl||b.getHeader("Cache-Control")||m.get("Cache-Control")||m.set("Cache-Control",(0,q.getCacheControlHeader)(l.cacheControl)),await (0,o.I)(N,O,new Response(l.value.body,{headers:m,status:l.value.status||200})),null};L?await g(L):await K.withPropagatedContext(a.headers,()=>K.trace(m.BaseServerSpan.handleRequest,{spanName:`${J} ${a.url}`,kind:i.SpanKind.SERVER,attributes:{"http.method":J,"http.target":a.url}},g))}catch(b){if(b instanceof s.NoFallbackError||await x.onRequestError(a,b,{routerKind:"App Router",routePath:E,routeType:"route",revalidateReason:(0,n.c)({isRevalidate:I,isOnDemandRevalidate:B})}),F)throw b;return await (0,o.I)(N,O,new Response(null,{status:500})),null}}},78335:()=>{},86439:a=>{"use strict";a.exports=require("next/dist/shared/lib/no-fallback-error.external")},96487:()=>{}};var b=require("../../../webpack-runtime.js");b.C(a);var c=b.X(0,[4586,1692,9608],()=>b(b.s=74236));module.exports=c})();