/* eslint-disable */
/* tslint:disable */
/**
 * Mock Service Worker.
 * @see https://github.com/mswjs/msw
 * - Please do NOT modify this file.
 */
const e=Symbol("isMockedResponse"),t=new Set;
/**
 * @param {Client} client
 * @param {any} message
 * @param {Array<Transferable>} transferrables
 * @returns {Promise<any>}
 */
function r(e,t,r=[]){return new Promise(((n,a)=>{const s=new MessageChannel;s.port1.onmessage=e=>{if(e.data&&e.data.error)return a(e.data.error);n(e.data)},e.postMessage(t,[s.port2,...r.filter(Boolean)])}))}
/**
 * @param {Response} response
 * @returns {Response}
 */
/**
 * @param {Request} request
 */
async function n(e){return{url:e.url,mode:e.mode,method:e.method,headers:Object.fromEntries(e.headers.entries()),cache:e.cache,credentials:e.credentials,destination:e.destination,integrity:e.integrity,redirect:e.redirect,referrer:e.referrer,referrerPolicy:e.referrerPolicy,body:await e.arrayBuffer(),keepalive:e.keepalive}}addEventListener("install",(function(){self.skipWaiting()})),addEventListener("activate",(function(e){e.waitUntil(self.clients.claim())})),addEventListener("message",(async function(e){const n=Reflect.get(e.source||{},"id");if(!n||!self.clients)return;const a=await self.clients.get(n);if(!a)return;const s=await self.clients.matchAll({type:"window"});switch(e.data){case"KEEPALIVE_REQUEST":r(a,{type:"KEEPALIVE_RESPONSE"});break;case"INTEGRITY_CHECK_REQUEST":r(a,{type:"INTEGRITY_CHECK_RESPONSE",payload:{packageVersion:"2.10.4",checksum:"f5825c521429caf22a4dd13b66e243af"}});break;case"MOCK_ACTIVATE":t.add(n),r(a,{type:"MOCKING_ENABLED",payload:{client:{id:a.id,frameType:a.frameType}}});break;case"MOCK_DEACTIVATE":t.delete(n);break;case"CLIENT_CLOSED":{t.delete(n);const e=s.filter((e=>e.id!==n));
// Unregister itself when there are no more clients
0===e.length&&self.registration.unregister();break}}})),addEventListener("fetch",(function(a){
// Bypass navigation requests.
if("navigate"===a.request.mode)return;
// Opening the DevTools triggers the "only-if-cached" request
// that cannot be handled by the worker. Bypass such requests.
if("only-if-cached"===a.request.cache&&"same-origin"!==a.request.mode)return;
// Bypass all requests when there are no active clients.
// Prevents the self-unregistered worked from handling requests
// after it's been deleted (still remains active until the next reload).
if(0===t.size)return;const s=crypto.randomUUID();a.respondWith(
/**
 * @param {FetchEvent} event
 * @param {string} requestId
 */
async function(a,s){const i=
/**
 * Resolve the main client for the given event.
 * Client that issues a request doesn't necessarily equal the client
 * that registered the worker. It's with the latter the worker should
 * communicate with during the response resolving phase.
 * @param {FetchEvent} event
 * @returns {Promise<Client | undefined>}
 */await async function(e){const r=await self.clients.get(e.clientId);if(t.has(e.clientId))return r;if("top-level"===r?.frameType)return r;return(await self.clients.matchAll({type:"window"})).filter((e=>"visible"===e.visibilityState)).find((e=>t.has(e.id)))}
/**
 * @param {FetchEvent} event
 * @param {Client | undefined} client
 * @param {string} requestId
 * @returns {Promise<Response>}
 */(a),c=a.request.clone(),o=await async function(a,s,i){
// Clone the request because it might've been already used
// (i.e. its body has been read and sent to the client).
const c=a.request.clone();function o(){
// Cast the request headers to a new Headers instance
// so the headers can be manipulated with.
const e=new Headers(c.headers),t=e.get("accept");
// Remove the "accept" header value that marked this request as passthrough.
// This prevents request alteration and also keeps it compliant with the
// user-defined CORS policies.
if(t){const r=t.split(",").map((e=>e.trim())).filter((e=>"msw/passthrough"!==e));r.length>0?e.set("accept",r.join(", ")):e.delete("accept")}return fetch(c,{headers:e})}
// Bypass mocking when the client is not active.
if(!s)return o();
// Bypass initial page load requests (i.e. static assets).
// The absence of the immediate/parent client in the map of the active clients
// means that MSW hasn't dispatched the "MOCK_ACTIVATE" event yet
// and is not ready to handle requests.
if(!t.has(s.id))return o();
// Notify the client that a request has been intercepted.
const d=await n(a.request),l=await r(s,{type:"REQUEST",payload:{id:i,...d}},[d.body]);switch(l.type){case"MOCK_RESPONSE":return function(t){
// Setting response status code to 0 is a no-op.
// However, when responding with a "Response.error()", the produced Response
// instance will have status code set to 0. Since it's not possible to create
// a Response instance with status code 0, handle that use-case separately.
if(0===t.status)return Response.error();const r=new Response(t.body,t);return Reflect.defineProperty(r,e,{value:!0,enumerable:!0}),r}(l.data);case"PASSTHROUGH":return o()}return o()}(a,i,s);
// Send back the response clone for the "response:*" life-cycle events.
// Ensure MSW is active and ready to handle the message, otherwise
// this message will pend indefinitely.
if(i&&t.has(i.id)){const t=await n(c),a=o.clone();
// Clone the response so both the client and the library could consume it.
r(i,{type:"RESPONSE",payload:{isMockedResponse:e in o,request:{id:s,...t},response:{type:a.type,status:a.status,statusText:a.statusText,headers:Object.fromEntries(a.headers.entries()),body:a.body}}},a.body?[t.body,a.body]:[])}return o}(a,s))}));