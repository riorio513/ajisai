/** フォームの住所系の欄ごとに、マスターから貼り付け値を機械的に作る。境界が曖昧なら issue を返す（推測しない） */
import type { MasterData, StdField } from '../shared/types';
import { composeAddress, splitPrefecture, splitTokyoWard } from '../transformer';

export interface AddrResolved {
  value?: string;
  /** split: 分割要確認 / missing: データなし */
  issue?: 'split' | 'missing';
  note?: string;
}

export type AddrField = 'prefecture' | 'city' | 'town' | 'street' | 'building' | 'address';
const ADDR_FIELDS: AddrField[] = ['prefecture', 'city', 'town', 'street', 'building', 'address'];

function stripTrailing(rest: string, building: string | undefined): string {
  if (building && rest.endsWith(building)) return rest.slice(0, rest.length - building.length).replace(/[\s　]+$/, '');
  return rest;
}

export function resolveAddress(master: MasterData, present: Set<StdField>): Partial<Record<AddrField, AddrResolved>> {
  const v = master.values;
  const out: Partial<Record<AddrField, AddrResolved>> = {};
  const has = (f: AddrField) => present.has(f);
  const full = v.address ?? composeAddress({ prefecture: v.prefecture, city: v.city, town: v.town, street: v.street, building: v.building }) ?? undefined;

  let pref = v.prefecture;
  let afterPref = full;
  if (full) {
    const sp = splitPrefecture(full);
    if (sp && (!v.prefecture || v.prefecture === sp.prefecture)) {
      pref = pref ?? sp.prefecture;
      afterPref = sp.rest;
    }
  }
  let city = v.city;
  let afterCity: string | undefined = afterPref;
  if (afterPref) {
    if (city && afterPref.startsWith(city)) afterCity = afterPref.slice(city.length);
    else if (!city && pref) {
      const w = splitTokyoWard(pref, afterPref);
      if (w) {
        city = w.city;
        afterCity = w.rest;
      }
    } else if (city && !afterPref.startsWith(city)) {
      afterCity = undefined; // 市区町村の位置が全文と合わない
    }
  }
  const building = v.building;

  if (has('prefecture')) {
    out.prefecture = pref ? { value: pref } : full ? { issue: 'split', note: '住所から都道府県を特定できません' } : { issue: 'missing' };
  }
  if (has('city')) {
    out.city = city ? { value: city } : full ? { issue: 'split', note: '住所から市区町村の境界を確定できません（Excelに市区町村の欄が必要です）' } : { issue: 'missing' };
  }
  if (has('town')) {
    out.town = v.town ? { value: v.town } : full ? { issue: 'split', note: '町域の境界を確定できません（Excelに町域の欄が必要です）' } : { issue: 'missing' };
  }
  if (has('street')) {
    if (v.street) out.street = { value: v.street };
    else if (!has('town') && afterCity !== undefined && city) out.street = { value: stripTrailing(afterCity, has('building') ? building : undefined) };
    else out.street = full ? { issue: 'split', note: '番地の境界を確定できません（Excelに番地の欄が必要です）' } : { issue: 'missing' };
  }
  if (has('building')) {
    out.building = building ? { value: building } : { issue: 'missing' };
  }
  if (has('address')) {
    if (!full) out.address = { issue: 'missing' };
    else if (has('prefecture') && has('city')) {
      out.address = afterCity !== undefined && city
        ? { value: stripTrailing(afterCity, has('building') ? building : undefined) }
        : { issue: 'split', note: '都道府県・市区町村の欄と分かれているため、住所を確実に分けられません' };
    } else if (has('prefecture')) {
      out.address = pref && afterPref !== undefined && full.startsWith(pref)
        ? { value: stripTrailing(afterPref, has('building') ? building : undefined) }
        : pref ? { value: stripTrailing(full, has('building') ? building : undefined) } : { issue: 'split', note: '都道府県の欄と分かれているため、住所を確実に分けられません' };
    } else {
      out.address = { value: has('building') ? stripTrailing(full, building) : full };
    }
  }
  return out;
}

export function isAddrField(s: StdField): s is AddrField {
  return (ADDR_FIELDS as string[]).includes(s);
}
