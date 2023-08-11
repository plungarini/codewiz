import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, interval, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-auth-banner',
  templateUrl: './auth-banner.component.html',
  styleUrls: ['./auth-banner.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuthBannerComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
	textValue: string = '';
	textValue$: BehaviorSubject<string> = new BehaviorSubject('')

  stringValues = [
		'Beginners',
		'Script Kiddos',
		'Developers',
		'Keyboard Ninjas',
		'Responsive Rulers',
		'Frontend Devs',
		'Recursive Rebels',
		'Bracket Wranglers',
		'Backend Devs',
		'Syntax Snobs',
		'Bug Busters',
		'Async Avengers',
		'Responsive Rockstars',
		'Fullstack Devs',
		'DOM Dominators',
		'HTML Hipsters',
		'Code Comment Comedians',
		'Function Fanatics',
		'Flexbox Fanatics',
		'Tab-vs-Space Debaters',
	];
	
	constructor(
		private cdRef: ChangeDetectorRef,
	) {
		this.stringValues = this.shuffleArray(this.stringValues);
	}

  ngOnInit() {
    this.startTypingEffect(0);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
	}
	
	private shuffleArray(array: string[]): string[] {
		for (let i = array.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[array[i], array[j]] = [array[j], array[i]];
		}
		return array;
	}

	private startTypingEffect(index: number) {
		const string = this.stringValues[index];
		const finished$ = new Subject<void>();
		let charIndex = 0;

    interval(180).pipe(
			takeUntil(finished$ || this.destroy$),
		).subscribe(() => {
			if (this.textValue.length === string.length) {
				finished$.next();
				finished$.complete();

				setTimeout(() => {
					this.startDeleteEffect(index);
				}, 2500);
			} else {
				this.textValue += string[charIndex++];
				this.textValue$.next(this.textValue);
			}
    });
	}
	
	private startDeleteEffect(index: number) {
		const string = this.stringValues[index];
		const finished$ = new Subject<void>();
		let charIndex = string.length - 1;

		const callNextItem = () => {
			finished$.next();
			finished$.complete();
			const newItem = this.stringValues[index + 1];
			if (!newItem) return this.startTypingEffect(0);
			return this.startTypingEffect(index + 1);
		}

    interval(80).pipe(
			takeUntil(finished$ || this.destroy$),
		).subscribe(() => {
			if (this.textValue.length === 0) {
				return callNextItem();
			} else {
				this.textValue = string.slice(0, charIndex--);
				this.textValue$.next(this.textValue);
			}
    });
  }
}