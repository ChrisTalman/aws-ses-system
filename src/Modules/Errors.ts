'use strict';

export class EmailUnwantedError extends Error {};

export class EmailRateLimitError extends Error
{
	constructor()
	{
		const message = 'Rate limit reached, and request has not been marked to be queued';
		super(message);
	};
};

export class EmailQueueTimeoutError extends Error
{
	constructor()
	{
		const message = 'Request was in rate limit queue for too long';
		super(message);
	};
};