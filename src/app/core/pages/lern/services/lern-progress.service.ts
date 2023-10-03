import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { UsersService } from 'src/app/auth/services/users.service';
import { FirebaseExtendedService } from 'src/app/shared/services/firebase-ext.service';
import { LernCourseSectionDataProgress } from '../models/course.model';

@Injectable({
  providedIn: 'root'
})
export class LernProgressService {

	constructor(
		private users: UsersService,
		private db: FirebaseExtendedService,
	) { }
	
	async setSectionProgress(
		courseId: string,
		sectionId: string,
		progress: LernCourseSectionDataProgress,
	) {
		const uid = await this._getCurrentUid();
		if (!uid || !courseId || !sectionId) return;
		await this.db.upsert<LernCourseSectionDataProgress>(
			`lern/${uid}/courses/${courseId}/sections/${sectionId}/progress/data`,
			{
				completed: progress.completed,
				multiQuiz: progress.multiQuiz,
				singleQuiz: progress.singleQuiz,
			}
		);
	}

	private async _getCurrentUid() {
		return (await firstValueFrom(this.users.fireUser$))?.uid;
	}
}
