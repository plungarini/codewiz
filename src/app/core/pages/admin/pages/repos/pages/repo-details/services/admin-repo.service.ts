import { Injectable } from '@angular/core';
import { Timestamp } from '@angular/fire/firestore';
import { firstValueFrom, map, Observable } from 'rxjs';
import { FirebaseExtendedService } from 'src/app/shared/services/firebase-ext.service';
import { Repo } from '../../../../../../../../shared/models/repo.model';

type EditPagesSearch = {
	id: string;
	author: string;
	folder: string;
	relativeLinksHost: string;
};

@Injectable({
  providedIn: 'root'
})
export class AdminRepoService {

	constructor(
		private db: FirebaseExtendedService,
	) { }

	getEditPagesSearch(id: string): Observable<Repo['editPagesSearch']> {
		return this.db.getDoc<Repo>(`supported-docs/${id}`).pipe(
			map((doc) => doc?.editPagesSearch),
		);
	}

	async updateRepo(data: Partial<Repo>): Promise<void> {
		if (!data.id) throw new Error('Repo id is required');
		await this.db.upsert(`supported-docs/${data.id}`, data);
	}

	async updateEditPagesSearch(id: string, data: Partial<Repo['editPagesSearch']>): Promise<void> {
		if (!id) throw new Error('Repo id is required');
		const doc = await firstValueFrom(this.db.getDoc<Repo>(`supported-docs/${id}`));
		const author = new Set(doc?.editPagesSearch?.author ?? []);
		const folder = new Set(doc?.editPagesSearch?.folder ?? []);
		const relativeLinksHost = new Set(doc?.editPagesSearch?.relativeLinksHost ?? []);

		if (data?.author?.at(0)) author.add(data.author[0]);
		if (data?.folder?.at(0)) folder.add(data.folder[0]);
		if (data?.relativeLinksHost?.at(0)) relativeLinksHost.add(data.relativeLinksHost[0]);
		
		await this.db.upsert<Repo>(`supported-docs/${id}`, { editPagesSearch: { author: [...author], folder: [...folder], relativeLinksHost: [...relativeLinksHost] } });
	}

	async removeEditPagesSearch(id: string, data: Partial<Repo['editPagesSearch']>): Promise<void> {
		if (!id) throw new Error('Repo id is required');
		const doc = await firstValueFrom(this.db.getDoc<Repo>(`supported-docs/${id}`));
		const author = new Set(doc?.editPagesSearch?.author ?? []);
		const folder = new Set(doc?.editPagesSearch?.folder ?? []);
		const relativeLinksHost = new Set(doc?.editPagesSearch?.relativeLinksHost ?? []);

		if (data?.author?.at(0) && author.has(data.author[0])) author.delete(data.author[0]);
		if (data?.folder?.at(0) && folder.has(data.folder[0])) folder.delete(data.folder[0]);
		if (data?.relativeLinksHost?.at(0) && relativeLinksHost.has(data.relativeLinksHost[0])) relativeLinksHost.delete(data.relativeLinksHost[0]);
		
		await this.db.upsert<Repo>(`supported-docs/${id}`, { editPagesSearch: { author: [...author], folder: [...folder], relativeLinksHost: [...relativeLinksHost] } });
	}

	async updateRepoTimestamp(id: string): Promise<void> {
		await this.db.upsert<Repo>(`supported-docs/${id}`, { embeddingsUpdatedAt: Timestamp.fromDate(new Date()) });
	}
}
