export class Logger{
static enabled=true
static info(...args){
if(!Logger.enabled)return
console.log('[Engine]',...args)}
static warn(...args){
if(!Logger.enabled)return
console.warn('[Engine]',...args)}
static error(...args){
if(!Logger.enabled)return
console.error('[Engine]',...args)}
static setEnabled(state){
Logger.enabled=state===true}}
