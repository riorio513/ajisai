/**
 * 作業の進捗（企業ごとの調査結果）の保存。アプリを閉じても続きから作業できる。
 * 保存するのは調査結果と選択だけ。Excelの本文・件名・個人情報は保存しない（ハッシュのみ）。
 */
import { join } from 'node:path';
import type { ResearchResult } from '../shared/types';
import { readJson, writeJson } from './json-store';
import { subDir } from './paths';

export interface CompanyOverrides {
  /** 利用者が選び直した職種（Excelの職種名） */
  jobLabel?: string;
  /** 同じ職種に文面が複数ある場合などに選んだ文面 */
  templateId?: string;
  contactUrl?: string;
  formIndex?: number;
  /** 営業可否が「要確認」だった企業を、利用者が根拠を見て「営業可」と確認した */
  salesConfirmed?: boolean;
  /** 対象フォームかどうか「要確認」だったものを利用者が確認した */
  formConfirmed?: boolean;
}

export interface StoredCompany {
  name: string;
  url: string;
  research?: ResearchResult;
  overrides?: CompanyOverrides;
  updatedAt?: string;
}

export interface Snapshot {
  fingerprint: string;
  companies: { key: string; name: string; url: string; row: number }[];
  templates: { id: string; number: string; job: string; subjectHash: string; bodyHash: string }[];
  masterHash: string;
}

export interface ProgressFile {
  version: 1;
  excelPath: string;
  updatedAt: string;
  snapshot?: Snapshot;
  companies: Record<string, StoredCompany>;
}

export class ProgressStore {
  private data: ProgressFile | null = null;
  private timer: NodeJS.Timeout | null = null;
  constructor(private readonly key: string, private readonly excelPath: string) {}

  private get file() {
    return join(subDir('progress'), `${this.key}.json`);
  }

  async load(): Promise<ProgressFile> {
    if (!this.data) {
      this.data = await readJson<ProgressFile>(this.file, { version: 1, excelPath: this.excelPath, updatedAt: '', companies: {} });
      this.data.excelPath = this.excelPath;
    }
    return this.data;
  }

  get current(): ProgressFile {
    if (!this.data) throw new Error('progress not loaded');
    return this.data;
  }

  /** 少しまとめてから保存する（連続更新でディスクを叩きすぎない） */
  save(): void {
    if (this.timer) return;
    this.timer = setTimeout(() => {
      this.timer = null;
      void this.flush();
    }, 300);
  }

  async flush(): Promise<void> {
    if (!this.data) return;
    this.data.updatedAt = new Date().toISOString();
    await writeJson(this.file, this.data);
  }
}
