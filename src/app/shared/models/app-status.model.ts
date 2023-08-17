import { Timestamp } from 'src/app/auth/models/timestamp.model';

export type AppStatus = {
	maintenance: {
		active: boolean;
		reason?: string;
		start?: Timestamp;
		end?: Timestamp;
	};
}