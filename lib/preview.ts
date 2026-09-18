// Preview-only orchestration. A production customer build must not mount StorePanel.
// Store actions in production require server-side authentication and authorization.
export const PREVIEW_MODE = true;
export type PreviewScreen = 'intro'|'customer'|'toStore'|'store'|'toCustomer';
export type Section = 'menu'|'bbq'|'cart'|'status'|'guide'|'asama';
export const STORAGE_PREFIX = 'shining-food-preview:';

export function clearPreviewStorage(){
  for(const name of ['sessionStorage','localStorage'] as const){
    try{const storage=window[name];for(const key of Object.keys(storage))if(key.startsWith(STORAGE_PREFIX))storage.removeItem(key);}catch{/* storage can be disabled */}
  }
  // Transactions are memory-only. No IndexedDB database is created by this app.
}
