/**
 * Supabase compatibility shim.
 * The original project used Supabase for auth and data.
 * This app uses tRPC + MySQL via Drizzle. This file provides
 * stub exports so legacy component imports don't break during migration.
 * All methods return `any` to avoid TypeScript property access errors.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

const noopResult = { data: [] as any, error: null };
const noopSingle = async () => ({ data: null as any, error: null });

function makeQueryBuilder(): any {
  const builder: any = {
    select: (_cols?: string) => makeQueryBuilder(),
    eq: (_col: string, _val: unknown) => makeQueryBuilder(),
    neq: (_col: string, _val: unknown) => makeQueryBuilder(),
    gt: (_col: string, _val: unknown) => makeQueryBuilder(),
    gte: (_col: string, _val: unknown) => makeQueryBuilder(),
    lt: (_col: string, _val: unknown) => makeQueryBuilder(),
    lte: (_col: string, _val: unknown) => makeQueryBuilder(),
    in: (_col: string, _vals: unknown[]) => makeQueryBuilder(),
    is: (_col: string, _val: unknown) => makeQueryBuilder(),
    order: (_col: string, _opts?: unknown) => makeQueryBuilder(),
    limit: (_n: number) => makeQueryBuilder(),
    range: (_from: number, _to: number) => makeQueryBuilder(),
    single: noopSingle,
    maybeSingle: noopSingle,
    then: (resolve: (v: any) => void) => resolve(noopResult),
  };
  // Make it thenable so await works
  Object.defineProperty(builder, Symbol.toStringTag, { value: 'Promise' });
  return builder;
}

export const supabase = {
  from: (_table: string): any => ({
    select: (_cols?: string) => makeQueryBuilder(),
    insert: (_data: unknown) => makeQueryBuilder(),
    update: (_data: unknown) => makeQueryBuilder(),
    delete: () => makeQueryBuilder(),
    upsert: (_data: unknown) => makeQueryBuilder(),
  }),
  auth: {
    getUser: async (): Promise<any> => ({ data: { user: null }, error: null }),
    getSession: async (): Promise<any> => ({ data: { session: null }, error: null }),
    signInWithPassword: async (_creds: unknown): Promise<any> => ({ data: null, error: null }),
    signUp: async (_creds: unknown): Promise<any> => ({ data: null, error: null }),
    signOut: async (): Promise<any> => ({ error: null }),
    onAuthStateChange: (_cb: unknown): any => ({
      data: { subscription: { unsubscribe: () => {} } },
    }),
    resetPasswordForEmail: async (_email: string): Promise<any> => ({ error: null }),
    updateUser: async (_data: unknown): Promise<any> => ({ error: null }),
    resend: async (_opts: unknown): Promise<any> => ({ error: null }),
  },
  storage: {
    from: (_bucket: string): any => ({
      upload: async (_path: string, _file: unknown): Promise<any> => ({ data: null, error: null }),
      download: async (_path: string): Promise<any> => ({ data: new Blob(), error: null }),
      getPublicUrl: (_path: string): any => ({ data: { publicUrl: '' } }),
      list: async (_prefix?: string): Promise<any> => ({ data: [], error: null }),
      remove: async (_paths: string[]): Promise<any> => ({ data: null, error: null }),
      createSignedUrl: async (_path: string, _exp: number): Promise<any> => ({ data: { signedUrl: '' }, error: null }),
    }),
  },
  functions: {
    invoke: async (_name: string, _opts?: unknown): Promise<any> => ({ data: null, error: null }),
  },
  channel: (_name: string): any => ({
    on: (_event: string, _filter: unknown, _cb: unknown) => ({
      subscribe: () => ({ unsubscribe: () => {} }),
    }),
  }),
  removeChannel: (_channel: unknown) => {},
};
