'use server';

import { revalidatePath } from 'next/cache';
import { localeFrom } from '@/features/auth';
import { ApiError } from '@/lib/api/client';
import { getToken } from '@/lib/session';
import { accountApi } from './api/server';

export type ActionState = { ok?: boolean; error?: 'session' | 'not_allowed' | 'provider' | 'generic' };

async function run(
  formData: FormData,
  work: (ctx: { locale: ReturnType<typeof localeFrom>; token: string }, id: string) => Promise<unknown>,
): Promise<ActionState> {
  const token = await getToken();
  if (!token) return { error: 'session' };
  const id = String(formData.get('id') ?? '');
  if (!/^[A-Za-z0-9-]{1,40}$/.test(id)) return { error: 'generic' };
  try {
    await work({ locale: localeFrom(formData), token }, id);
  } catch (error) {
    // The API answers 422 when the order can no longer be cancelled, and 502 when Stripe cannot be reached.
    if (error instanceof ApiError && error.status === 422) return { error: 'not_allowed' };
    if (error instanceof ApiError && error.status === 502) return { error: 'provider' };
    console.error(error);
    return { error: 'generic' };
  }
  revalidatePath('/', 'layout');
  return { ok: true };
}

export const cancelOrder = async (_: ActionState, formData: FormData) =>
  run(formData, (ctx, id) => accountApi.cancelOrder(ctx, id));

// Used by the buttons in the address and card lists (see ListAction), which show the error when one fails.
export const makeAddressDefault = async (_: ActionState, formData: FormData) =>
  run(formData, (ctx, id) => accountApi.makeAddressDefault(ctx, Number(id)));
export const deleteAddress = async (_: ActionState, formData: FormData) =>
  run(formData, (ctx, id) => accountApi.deleteAddress(ctx, Number(id)));
export const makeCardDefault = async (_: ActionState, formData: FormData) =>
  run(formData, (ctx, id) => accountApi.makeCardDefault(ctx, Number(id)));
export const deleteCard = async (_: ActionState, formData: FormData) =>
  run(formData, (ctx, id) => accountApi.deleteCard(ctx, Number(id)));
