import { ChangeDetectionStrategy, Component } from '@angular/core';

type Review = {
	rate: number;
	name: string;
	headline: string;
	description: string;
}

type reviewGroups = {
	group1: Review[];
	group2: Review[];
	group3: Review[];
}

@Component({
  selector: 'app-reviews',
  templateUrl: './reviews.component.html',
  styleUrls: ['./reviews.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReviewsComponent {

	reviews: Review[] = [
		{
			rate: 5,
			name: 'Johnathan R.',
			headline: 'Revolutionized My Learning!',
			description: 'Before CodeWiz, I\'d spend hours sifting through documentation. Now, I get precise answers instantly. A game-changer for sure!',
		},
		{
			rate: 4,
			name: 'Elene M.',
			headline: 'Multi-language Support? Yes, Please!',
			description: 'The ability to converse with CodeWiz in multiple languages is a boon for devs like me who aren\'t native English speakers.',
		},
		{
			rate: 4.5,
			name: 'Michelle L.',
			headline: 'Is part of my workflow now',
			description: 'From clarifying concepts to helping with errors, CodeWiz feels like a mentor always by my side.',
		},
		{
			rate: 5,
			name: 'Oscar H.',
			headline: 'Fair Subscription, Massive Value',
			description: 'I opted for the yearly plan, and the value I\'ve gotten is just unmatched. Totally worth it! Can\'t wait to see what the future holds.',
		},
		{
			rate: 4,
			name: 'Christian P.',
			headline: 'AI now scares me...',
			description: 'CodeWiz is the holistic learning platform I never knew I needed. Big thumbs up!',
		},
		{
			rate: 5,
			name: 'Alex B.',
			headline: 'Like Chatting with a Fellow Developer!',
			description: 'Last night, I got stuck on a tricky React issue. CodeWiz felt like a co-dev, guiding me through the solution. My late nights have a new companion.',
		},
		{
			rate: 5,
			name: 'Lucas T.',
			headline: 'Saying Goodbye to Endless Documentation Tabs.',
			description: 'No more 20+ tabs open trying to find answers. A simple chat with CodeWiz and I\'m sorted. It\'s streamlined my workflow massively.',
		},
		{
			rate: 4.5,
			name: 'Mia H.',
			headline: 'Multi-Language Support is Phenomenal',
			description: 'Being able to chat in my native language while working on a Angular project? It’s like CodeWiz knows exactly what I need.',
		},
		{
			rate: 5,
			name: 'Elijah R.',
			headline: 'Never Felt More Understood!',
			description: 'The way CodeWiz comprehends my coding queries and serves precise answers is uncanny. It\'s like talking to a seasoned developer!',
		},
		{
			rate: 5,
			name: 'Sophie K.',
			headline: 'Direct Links to Documentation? Love that.',
			description: 'When I chat with CodeWiz, not only do I get answers, but direct links to the related docs section. It\'s been a massive help!',
		},
		{
			rate: 4.5,
			name: 'Aaron L.',
			headline: 'It\'s My Go-To Tool for Framework Questions!',
			description: 'I wanted to learn React, but I didn\'t know where to start. CodeWiz made the journey so much smoother. It\'s like having a mentor on speed dial!',
		},
		{
			rate: 4.5,
			name: 'Mohammed Z.',
			headline: 'Like Having Coffee with a Coding Guru!',
			description: 'Every chat with CodeWiz feels like I\'m sitting down with an expert, dissecting and understanding code nuances. My coding sessions have never been better!',
		},
		{
			rate: 5,
			name: 'Matias F.',
			headline: 'Goodbye, Late-Night Troubleshooting :)',
			description: 'Just when I thought I\'d be up all night fixing a bug, CodeWiz stepped in. I found my answer within minutes, not hours.',
		},
		{
			rate: 5,
			name: 'Harrison Y.',
			headline: 'From Clueless to Confident',
			description: 'Whenever I\'m lost in a sea of code, CodeWiz is my lighthouse. Suddenly, that daunting framework isn’t so scary anymore.',
		},
		{
			rate: 5,
			name: 'Paul V.',
			headline: 'No More Bookmark Overload',
			description: 'I used to bookmark endless documentation pages. Now, a quick chat with CodeWiz and I have the precise info I need.',
		},
		{
			rate: 4.5,
			name: 'Theo P.',
			headline: 'Drowning in Docs? Say no man',
			description: 'CodeWiz has transformed my experience. Instead of skimming countless pages, I get straight to the solution.',
		},
		{
			rate: 4.5,
			name: 'Carlos L.',
			headline: 'My Secret Weapon for Deadlines!',
			description: 'With a project deadline looming, CodeWiz came to my rescue. It turned my panic into productivity.',
		},
		{
			rate: 5,
			name: 'Ibrahim S.',
			headline: 'Why Didn\'t I Find This Sooner?',
			description: 'Those moments where I\'d be scratching my head? They\'re a thing of the past. Thanks to CodeWiz, I\'m always in the know.',
		},
		{
			rate: 5,
			name: 'Dylan W.',
			headline: 'My Code Confusions, Sorted, voila!',
			description: 'Whenever my code feels like a jigsaw puzzle, CodeWiz magically makes all the pieces fit.',
		},
		{
			rate: 5,
			name: 'Jasmine Z.',
			headline: 'No More Trawling Through Stack Overflow',
			description: 'Instead of sifting through endless stack overflow threads, I turn to CodeWiz. It\'s like having the best bits of the internet in one chat.',
		},
		{
			rate: 4,
			name: 'Raj P.',
			headline: 'No More Endless Browsing',
			description: 'Before CodeWiz, I\'d lose hours searching for solutions. Now, I get clear answers without the extra noise. Huge timesaver.',
		},
		{
			rate: 4.5,
			name: 'Evan K.',
			headline: 'It’s Like a Cheat Sheet...',
			description: 'Stuck on a tricky framework detail? A quick chat with CodeWiz, and I’m back on track. It’s really that simple.',
		},
		{
			rate: 4,
			name: 'Melanie Q.',
			headline: 'Helpful for Daily Coding!',
			description: 'I\'ve reduced the time spent on minor coding hiccups. CodeWiz gives me the info I need without digging through docs.',
		},
		{
			rate: 5,
			name: 'Omar B.',
			headline: 'Quick Answers, Less Stress.',
			description: 'Deadlines are less daunting now. If I get stuck, CodeWiz is just a chat away. It\'s made my work life easier.',
		},
		{
			rate: 5,
			name: 'Jacob S.',
			headline: 'No More Guesswork',
			description: 'Instead of trying various solutions from forums, CodeWiz points me in the right direction. It\'s reliable.',
		},
		{
			rate: 4.5,
			name: 'Maria J.',
			headline: 'A Must-Have for Devs.',
			description: 'I was skeptical at first, but now CodeWiz is part of my coding routine. It\'s just really handy.',
		},
		{
			rate: 4.5,
			name: 'Jake M.',
			headline: 'My Go-To for Coding Queries.',
			description: 'When I\'m unsure about a function or method, CodeWiz clears things up. No fuss, just answers.',
		},
		{
			rate: 4,
			name: 'Simone G.',
			headline: 'Practical and Time-Saving.',
			description: 'I can focus on coding more, and spend less time searching for answers. CodeWiz fills in the gaps for me.',
		},
		{
			rate: 5,
			name: 'Luis F.',
			headline: 'Simple Solution to Common Struggles.',
			description: 'We\'ve all been there – stuck on a minor issue for hours. CodeWiz cuts that time down significantly. It\'s practical.',
		},
	];

	groups: reviewGroups = {
		group1: [],
		group2: [],
		group3: [],
	}

	constructor() {
		this.reviews = this.shuffleArray(this.reviews);
		const groupSize = Math.ceil(this.reviews.length / 3);
		this.groups = {
			group1: this.reviews.slice(0, groupSize),
			group2: this.reviews.slice(groupSize, groupSize * 2),
			group3: this.reviews.slice(groupSize * 2)
		};
	}

	getRandomAnimationDelay() {
		return Math.round(Math.random() * 100) / 100;
	}

	getDummyArray(length: number): number[] {
		const normLength = Math.floor(length);
		const array = [];
		for (let i = 0; i < normLength; i++) {
			array.push(i);
		}
		return array;
	}

	isInteger(number: number): boolean {
		return number % 1 === 0;
	}

	private shuffleArray(array: Review[]): Review[] {
		// Shuffles the elements of the given array using the Fisher-Yates algorithm
		for (let i = array.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[array[i], array[j]] = [array[j], array[i]];
		}
		return array;
	}

}
