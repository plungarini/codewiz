import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { map, Observable, of, switchMap } from 'rxjs';
import { UsersService } from 'src/app/auth/services/users.service';
import { LernCourseRequest } from '../../../../models/course.model';
import { LernService } from '../../../../services/lern.service';

@Component({
  selector: 'app-preferences',
  templateUrl: './preferences.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PreferencesComponent {
	public get users(): UsersService {
		return this._users;
	}
	public set users(value: UsersService) {
		this._users = value;
	}

	course$: Observable<LernCourseRequest | undefined>;
	user$ = this.users.user$;

	form = new FormGroup({
		contentDepth: new FormControl<'beginner' | 'intermediate' | 'advanced'>('beginner', { validators: [Validators.required], nonNullable: true }),
		duration: new FormControl<'short' | 'medium' | 'long'>('short', { validators: [Validators.required], nonNullable: true }),
		goal: new FormControl<'knowledge' | 'skill' | 'certification'>('knowledge', { validators: [Validators.required], nonNullable: true }),
		style: new FormControl<'theory' | 'practical'>('practical', { validators: [Validators.required], nonNullable: true }),
		assessment: new FormControl<'quizz' | 'assignments' | 'none'>('none', { validators: [Validators.required], nonNullable: true }),
		revision: new FormControl<boolean>(false, { nonNullable: true }),
		language: new FormControl<string>('English', { validators: [Validators.required], nonNullable: true }),
	});

	courseId: string | undefined;

	loading = false;

	constructor(
		private router: Router,
		private route: ActivatedRoute,
		private cdRef: ChangeDetectorRef,
		private _users: UsersService,
		private lern: LernService,
	) {
		this.courseId = this.route.snapshot.parent?.parent?.params['id'];
		this.course$ = this.initCourse$();
	}

	async submit() {
		if (!this.form.valid || !this.courseId) return;
		this.loading = true;
		this.cdRef.markForCheck();

		const data: LernCourseRequest['preferences'] = {
			contentDepth: this.form.value.contentDepth ?? 'beginner',
			duration: this.form.value.duration ?? 'short',
			goal: this.form.value.goal ?? 'knowledge',
			style: this.form.value.style ?? 'practical',
			assessment: this.form.value.assessment ?? 'none',
			revision: this.form.value.revision ?? false,
			language: this.form.value.language ?? 'English',
		}

		try {
			await this.lern.updateCourse(this.courseId, {
				preferences: data,
			});
			this.router.navigate(['/app/lern/setup', this.courseId, 'finish']);
		} catch (err) {
			console.error(err);
		}

		this.loading = false;
		this.cdRef.markForCheck();
	}

	private initCourse$(): Observable<LernCourseRequest | undefined> {
		const parentParams = this.route.parent?.parent?.params;
		const typedParams: Observable<Params | undefined> = !parentParams ? of(undefined) : parentParams;

		return typedParams.pipe(
			map((params) => {
				if (!params) return undefined;
				const id = params['id'] as string | undefined;
				if (!id || id === 'new') return undefined;
				return id;
			}),
			switchMap((id) => {
				if (!id) return of(undefined);
				return this.lern.getCourseRequest(id);
			}),
		);
	}
}
