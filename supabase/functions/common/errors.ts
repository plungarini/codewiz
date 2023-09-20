export class ApplicationError extends Error {
	constructor(message: string, public data: Record<string, any> = {}) {
		console.error({ message, data });
    super(message)
  }
}

export class UserError extends ApplicationError {}
