'use strict';

// External Modules
import { delay } from '@chris-talman/isomorphic-utilities';

// Internal Modules
import { EmailRateLimitError, EmailQueueTimeoutError } from 'src/Modules/Errors';
import { EmailSystem } from 'src/Modules';
import { ScheduledEmail } from './ScheduledEmail';

// Types
import { BaseMetadata } from 'src/Modules';
import { SendMailOptions } from 'src/Modules/Send';
interface Queue extends Array<ScheduledEmail> {};
interface RateLimit
{
	remaining: number;
	reset: number;
};

// Constants
const RATE_LIMIT_INTERVAL_MILLISECONDS = 1000;

export class Scheduler <GenericEmailSystem extends EmailSystem <any, any>>
{
	public readonly system: GenericEmailSystem;
	public readonly queue: Queue = [];
	public rateLimit?: RateLimit;
	/**
		Callback invoked before every request to validate that the rate limit has not been exceeded.
		If returns `true`, request will proceed.
		If returns `false`, request will not proceed, and `RateLimitError` will throw, unless `options.useQueue` is enabled.
	*/
	private rateLimitResetTimeout?: RateLimitResetTimeout;
	private queueItemTimeout = 180000;
	constructor({queueItemTimeout, system}: {queueItemTimeout?: number, system: GenericEmailSystem})
	{
		if (typeof queueItemTimeout === 'number') this.queueItemTimeout = queueItemTimeout;
		this.system = system;
	};
	public async schedule({email, metadata, useQueue}: {email: SendMailOptions, metadata: BaseMetadata <any>, useQueue: boolean})
	{
		const scheduledEmail = new ScheduledEmail({email, metadata, useQueue, scheduler: this});
		const result = await scheduledEmail.promiseController.promise;
		return result;
	};
	public async consumeRateLimit(scheduledEmail: ScheduledEmail)
	{
		const consumed = await this.system.callbacks.consumeRateLimit();
		if (!consumed && !scheduledEmail.useQueue)
		{
			throw new EmailRateLimitError();
		};
		if (this.rateLimit === undefined || this.rateLimit.remaining > 0 || Date.now() >= this.rateLimit.reset)
		{
			if (this.rateLimit !== undefined && Date.now() >= this.rateLimit.reset)
			{
				this.rateLimit.reset = Date.now() + RATE_LIMIT_INTERVAL_MILLISECONDS;
				this.rateLimit.remaining = this.system.aws.ses.rateLimits.second;
			};
			this.recordRateLimitConsumed();
			return true;
		};
		if (!scheduledEmail.useQueue)
		{
			throw new EmailRateLimitError();
		};
		this.guaranteeQueueItem(scheduledEmail);
		this.timeoutQueueItem(scheduledEmail);
		this.guaranteeRateLimitResetTimeout();
		return false;
	};
	private async timeoutQueueItem(item: ScheduledEmail)
	{
		await delay(this.queueItemTimeout);
		this.removeQueueItem(item);
		const timeoutError = new EmailQueueTimeoutError();
		item.promiseController.reject(timeoutError);
	};
	private guaranteeRateLimitResetTimeout()
	{
		if ((this.rateLimitResetTimeout && !this.rateLimitResetTimeout.complete) || this.queue.length === 0) return;
		const delay = this.generateRateLimitResetDelay();
		this.rateLimitResetTimeout = new RateLimitResetTimeout({callback: () => this.processQueue(), delay});
	};
	private generateRateLimitResetDelay()
	{
		if (this.rateLimit === undefined) throw new Error('Rate limit undefined');
		let delay = this.rateLimit.reset - Date.now();
		if (delay < 0)
		{
			delay = 0;
		};
		return delay;
	};
	private processQueue()
	{
		if (this.rateLimit === undefined) throw new Error('Rate limit undefined');
		const processable = this.queue.slice(0, this.system.aws.ses.rateLimits.second);
		for (let item of processable)
		{
			item.execute();
		};
		this.guaranteeRateLimitResetTimeout();
	};
	private recordRateLimitConsumed()
	{
		if (this.rateLimit === undefined)
		{
			this.rateLimit =
			{
				remaining: this.system.aws.ses.rateLimits.second,
				reset: Date.now() + RATE_LIMIT_INTERVAL_MILLISECONDS
			};
		};
		--this.rateLimit.remaining;
	};
	public guaranteeQueueItem(item: ScheduledEmail)
	{
		const queueItem = this.queue.find(currentItem => currentItem === item);
		if (queueItem) return;
		this.queue.push(item);
	};
	public removeQueueItem(item: ScheduledEmail)
	{
		const queueItemIndex = this.queue.findIndex(currentItem => currentItem === item);
		if (queueItemIndex === -1) return;
		this.queue.splice(queueItemIndex, 1);
	};
};

export class RateLimitResetTimeout
{
	public readonly timeout: NodeJS.Timeout;
	public readonly callback: () => void;
	private _complete: boolean;
	constructor({callback, delay}: {callback: () => void, delay: number})
	{
		this._complete = false;
		this.callback = callback;
		this.timeout = setTimeout(() => this.handleComplete(), delay);
	};
	get complete()
	{
		return this._complete;
	};
	private handleComplete()
	{
		this._complete = true;
		this.callback();
	};
};