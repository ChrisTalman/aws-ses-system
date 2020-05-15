'use strict';

// Types
import { ValidationResult } from '@hapi/joi';

export class EmailUnwantedError extends Error
{
	constructor()
	{
		const message = 'Email unwanted';
		super(message);
	};
};

export class EmailDuplicateError extends Error
{
	constructor()
	{
		const message = 'Email duplicate';
		super(message);
	};
};

export class EmailInvalidError extends Error
{
	constructor({sourceMessage}: {sourceMessage: string})
	{
		const message = `Email invalid: ${sourceMessage}`;
		super(message);
	};
};

export class EmailRateLimitError extends Error
{
	constructor()
	{
		const message = 'Rate limit reached, and email has not been marked to be queued';
		super(message);
	};
};

export class EmailQueueTimeoutError extends Error
{
	constructor()
	{
		const message = 'Email was in rate limit queue for too long';
		super(message);
	};
};

export class EmailSignatureInvalidError extends Error
{
	constructor()
	{
		const message = 'Email signature invalid';
		super(message);
	};
};

export class EmailHandlerNotFoundError extends Error
{
	constructor()
	{
		const message = 'Email handler not found';
		super(message);
	};
};

export class EmailWebookParseError extends Error
{
	constructor()
	{
		const message = 'Failed to parse email webook';
		super(message);
	};
};

export class EmailWebhookInvalid extends Error
{
	constructor(validation: ValidationResult)
	{
		const message = `Failed email webhook validation: ${validation.error?.message}`;
		super(message);
	};
};