import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { AiChatMessageRole } from 'functions/src/models/tiktoken/tiktoken.model';
import { delay, map, Observable, of, Subscription, switchMap, tap } from 'rxjs';
import { UsersService } from 'src/app/auth/services/users.service';
import { UserRepoService } from 'src/app/core/pages/chat/services/user-repo.service';
import { Repo } from 'src/app/shared/models/repo.model';
import { LernCourse, SearchDocsResponse } from '../../../../models/course.model';
import { LernService } from '../../../../services/lern.service';

@Component({
  selector: 'app-prompt',
  templateUrl: './search.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchComponent implements OnDestroy {

	course$: Observable<LernCourse | undefined>;
	user$ = this.users.user$;

	queryArea = new FormControl('', { validators: [Validators.required], nonNullable: true });
	docs: SearchDocsResponse | undefined;
	
	error = '';
	
	errorTyping: string = '';
	queryTyping: string = '';
	foundTyping: string = '';

	initialized = false;
	gettingDocs = false;

	role = {
		user: AiChatMessageRole.User,
		assistant: AiChatMessageRole.User,
	}

	private repos: Repo[] | undefined;
	private currentRepo: Repo | undefined;
	private currentCourse: LernCourse | undefined;

	private _repoSub: Subscription;

	constructor(
		private router: Router,
		private route: ActivatedRoute,
		private users: UsersService,
		private lern: LernService,
		private repo: UserRepoService,
		private cdRef: ChangeDetectorRef,
	) {
		this.course$ = this.initCourse$();
		this._repoSub = this.initRepoSub();
	}

	ngOnDestroy(): void {
		this._repoSub.unsubscribe();
	}

	async search(): Promise<void> {
		if (
			!this.queryArea.valid ||
			!this.currentRepo ||
			!this.repos ||
			(this.repos.length || 0) <= 0
		) return;
		this.queryTyping = '';
		this.typingEffect(`I'm getting documents from "${this.currentRepo.name}" documentation... It can take up to 1 minute or so.`, 'query');

		this.error = '';
		this.gettingDocs = true;
		this.docs = undefined;
		this.foundTyping = '';
		this.cdRef.markForCheck();

		try {
			const res = await this.lern.searchDocs(
				this.queryArea.value,
				this.currentRepo.tableName,
				this.repos.map((r) => r.tableName ?? r.id),
			);
			
			const uniqueTitles = new Set<string>();
			this.docs = {
				...res,
				pages: res.pages.filter((p) => {
					const title = p.title.trim().toLowerCase();
					const hasTitle = uniqueTitles.has(title);
					if (hasTitle) return false;
					uniqueTitles.add(title);
					return true;
				})
			};

			await this.lern.updateCourse(this.currentCourse?.id ?? '', {
				topic: {
					query: this.queryArea.value,
					pages: res.pages,
					res: { can: res.can, suggested: res.suggested }
				}
			});

			this.docs.pages = this.docs.pages.map((p) => ({
				...p,
				id: this.getParsedUrl(p.id),
			}))

			const message = this.searchDocumentsSuccess(this.docs);
			this.typingEffect(message, 'found');
		} catch (err) {
			this.error = 'Ops. We are unable to search for documents. Please try again.';
			this.errorTyping = '';
			this.typingEffect(this.error, 'error');
			console.error(err);
		}
		this.gettingDocs = false;
		this.cdRef.markForCheck();
	}

	goBack() {
		this.router.navigate(['/app/lern/setup/new/hub']);
	}

	submit() {
		if (
			(this.docs?.pages?.length || 0) <= 0 ||
			this.gettingDocs ||
			!this.currentCourse?.id
		) return;

		this.router.navigate(['/app/lern/setup', this.currentCourse.id, 'preferences']);
	}

	private searchDocumentsSuccess(data: SearchDocsResponse): string {
		let message = '';
		const currentRepo = 'Angular';
		const suggested = this.repos?.find(r => r.tableName === data.suggested)?.name;

		if (data.can && data.pages.length > 4) {
			message = `Bingo! 🚀 I've found numerous articles related to your question. Review them briefly, and if they seem relevant, hit "Next step" to dive into your tailored AI path.`;
		} else if (data.can && data.pages.length > 0) {
			message = `Almost there! 😄 I've unearthed a few articles. Give them a skim. If they resonate, let's continue; otherwise, consider posing another question or topic.`;
		} else if (!data.can && data.pages.length > 0 && !suggested) {
			message = `Hmm... 🤔 I've fetched some articles, but they might not quite match your query's spirit. Try asking another question or exploring a different topic.`;
		} else if (!data.can && data.pages.length > 0 && suggested) {
			message = `Plot Twist! 🌀 I've located some articles, but they may not align with your query. Could "<b>${currentRepo}</b>" have been off the mark? Maybe "<b>${suggested}</b>" is the way to go?`;
		} else if (!data.can && data.pages.length <= 0 && !suggested) {
			message = `Oopsie daisy! 🌼 Couldn't find any matching articles this time. Let's head back to the setup page, choose another supported documentation, or perhaps refine your question.`;
		} else {
			message = `Damn it... 🌌 ${data.pages.length > 0 ? 'I\'ve found few articles but they might not be what you\'re looking for.' : 'I\'ve found no articles.'} Consider tweaking the question or opting for a different documentation.${suggested ? ' Maybe you can try selecting "<b>' + suggested + '</b>" as your repo?' : ''}`;
		}

		return message;
	}

  private typingEffect(text: string, prop: 'query' | 'found' | 'error'): void {
    let chunkLength = this.getRandomNumber(4, 10);
    if (chunkLength > text.length) {
      chunkLength = text.length;
    }

    const nextChunk = text.substring(0, chunkLength);

    // Simulate the typing effect
		if (prop === 'query') {
			this.queryTyping += nextChunk;
		} else if (prop === 'found') {
			this.foundTyping += nextChunk;
		} else {
			this.errorTyping += nextChunk;
		}

		this.cdRef.markForCheck();

    // If there's still text left to type
    if (chunkLength < text.length) {
			const remainingText = text.substring(chunkLength);
			const d = this.getRandomNumber(50, 150);

      // Delay and type the next chunk
      of(null).pipe(delay(d)).subscribe(() => {
        this.typingEffect(remainingText, prop);
      });
    }
  }

  private getRandomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	getParsedUrl(id: string): string {
		if (!this.currentRepo) return '';
		const absoluteUrlRegex = /^(?:http(s)?:\/\/)[\w.-]+(?:\.[\w\.-]+)+[\w\-._~:/?#[\]@!$&'(*+,;=.]+$/;
		let path = '';

		// Remove number from id
		const numberIdRegex = /^(.*?)(?:\[\d+\])?$/;
		const match = RegExp(numberIdRegex).exec(id);
		path = match ? match[1] : id;

		const { replaceUrl, hostUrl, replaceStrings } = this.currentRepo;

    // If the URL is already absolute, return it as is
    if (absoluteUrlRegex.test(id)) {
			path = id.replace(replaceUrl, '');
    } else {
			// If the URL is not absolute, perform the replacement
			path = path.replace(replaceUrl, hostUrl);
		}

		replaceStrings.forEach((v) => {
			const isRegex = this.isValidRegex(v.s);
			const normStr = isRegex ? v.s.replace(/\\\\/g, '\\') : v.s;
			const exp = isRegex ? new RegExp(normStr) : v.s;
			path = path.replace(exp, v.r);
		});

		return path;
	}

	private isValidRegex(str: string) {
    try {
			new RegExp(str);
			return true;
    } catch (e) {
			return false;
    }
	}
	
	private initCourse$(): Observable<LernCourse | undefined> {
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
				return this.lern.getCourse(id);
			}),
			tap((course) => this.updateCourse(course)),
		);
	}

	private updateCourse(course?: LernCourse): void {
		if (!course) {
			this.router.navigate(['/app/lern/setup/new/hub']);
		} else {
			this.currentCourse = course;
			this.currentRepo = this.repos?.find(r => r.id === course.repo);

			if (this.initialized) return;

			this.initialized = true;
			const uniqueTitles = new Set<string>();
			const pages = (course?.topic?.pages ?? []).filter((p) => {
				const title = p.title.trim().toLowerCase();
				const hasTitle = uniqueTitles.has(title);
				if (hasTitle) return false;
				uniqueTitles.add(title);
				return true;
			}).map((p) => ({
				...p,
				id: this.getParsedUrl(p.id),
			}));

			if (!course.topic) return;
			
			this.docs = {
				can: !!course?.topic?.res?.can,
				pages,
				suggested: course?.topic?.res?.suggested,
			};
			this.foundTyping = this.searchDocumentsSuccess(this.docs)
			this.queryArea.patchValue(course?.topic?.query ?? '');
		}
	}

	private initRepoSub(): Subscription {
		const parentParams = this.route.parent?.parent?.params;
		const typedParams: Observable<Params | undefined> = !parentParams ? of(undefined) : parentParams;

		return typedParams.pipe(
			switchMap(params => {
				if (!params) return of(undefined);
				const id = params['id'];
				if (!id || id === 'new') return of(undefined);
				return this.repo.getAllSupportedDocs();
			}),
		).subscribe((repos) => {
			this.repos = repos;
			this.currentRepo = this.repos?.find(r => r.id === this.currentCourse?.repo);
		})
	}

}
