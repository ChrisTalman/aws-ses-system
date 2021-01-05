'use strict';

// External Modules
import { PromiseController } from '@chris-talman/isomorphic-utilities';

// Intenral Modules
import { EmailSystem } from 'src/Modules';
import { Scheduler } from 'src/Modules/Scheduler';
import { EmailDuplicateError, EmailInvalidError } from 'src/Modules/Errors';
import { isEmailUnwanted } from 'src/Modules/Send';

// Types
import { Email, SendMailOptions } from 'src/Modules/Send';

// Constants
import { RATE_LIMIT_INTERVAL_MILLISECONDS } from './';
const INVALID_PARAMETER_VALUE_ERROR_MESSAGE_EXPRESSION = /^InvalidParameterValue/;

export class ScheduledEmail
{
	public readonly mailOptions: SendMailOptions;
	public readonly email: Email <any, any>;
	public readonly useQueue: boolean;
	public readonly scheduler: Scheduler <any>;
	public readonly system: EmailSystem <any, any>;
	/** Unix milliseconds. */
	public readonly created: number;
	public readonly promiseController: PromiseController <void>;
	private executing = false;
	private executed = false;
	constructor({mailOptions, email, useQueue, scheduler, system}: Pick<ScheduledEmail, 'mailOptions' | 'email' | 'useQueue' | 'scheduler' | 'system'>)
	{
		this.mailOptions = mailOptions;
		this.email = email;
		this.useQueue = useQueue;
		this.scheduler = scheduler;
		this.system = system;
		this.promiseController = new PromiseController();
		this.execute();
	};
	public async execute()
	{
		if (this.executing || this.executed) return;
		this.executing = true;
		if (Date.now() > this.created + RATE_LIMIT_INTERVAL_MILLISECONDS)
		{
			try
			{
				await isEmailUnwanted({email: this.mailOptions, system: this.system});
				await isEmailDuplicate({email: this.email, system: this.system});
			}
			catch (error)
			{
				this.scheduler.removeQueueItem(this);
				this.markExecuted();
				this.reject(error);
				return;
			};
		};
		let rateLimitConsumed = false;
		try
		{
			rateLimitConsumed = await this.scheduler.consumeRateLimit(this);
		}
		catch (error)
		{
			this.reject(error);
		};
		if (!rateLimitConsumed)
		{
			this.executing = false;
			return;
		};
		if (this.email.lockId)
		{
			try
			{
				await this.system.callbacks.insertLock({id: this.email.lockId, emailId: this.email.id});
			}
			catch (error)
			{
				this.reject(error);
				this.executing = false;
				return;
			};
		};
		let result: any;
		try
		{
			result = await this.system.nodemailer.sendMail(this.mailOptions);
		}
		catch (error)
		{
			if (error.code === 'Throttling')
			{
				this.executing = false;
				this.scheduler.guaranteeQueueItem(this);
				if (this.email.lockId)
				{
					try
					{
						await this.system.callbacks.deleteLock({id: this.email.lockId});
					}
					catch (error)
					{
						console.error(`Failed to delete lock after throttling. Email ID: ${this.email.id}`);
						this.reject(error);
					};
				};
			}
			else if (error.code === 'InvalidParameterValue' && INVALID_PARAMETER_VALUE_ERROR_MESSAGE_EXPRESSION.test(error.message))
			{
				const emailInvalidError = new EmailInvalidError({sourceMessage: error.message});
				if (this.email.lockId)
				{
					try
					{
						await this.system.callbacks.deleteLock({id: this.email.lockId});
						console.log(`Deleted lock after nonlockable error. Email ID: ${this.email.id}`);
					}
					catch (error)
					{
						console.error(`Failed to delete lock after nonlockable error. Email ID: ${this.email.id}`);
						console.error(`Instigator error:\n${emailInvalidError}`);
						this.reject(error);
					};
				};
				this.reject(emailInvalidError);
			}
			else
			{
				this.reject(error);
			};
			return;
		};
		this.scheduler.removeQueueItem(this);
		this.promiseController.resolve(result);
		this.markExecuted();
	};
	private reject(error: any)
	{
		this.scheduler.removeQueueItem(this);
		this.promiseController.reject(error);
		this.markExecuted();
	};
	private markExecuted()
	{
		this.executed = true;
		this.executing = false;
	};
};

async function isEmailDuplicate({email, system}: {email: Email <any, any>, system: EmailSystem <any>})
{
	const duplicate = await system.callbacks.isDuplicate({email});
	if (duplicate)
	{
		throw new EmailDuplicateError();
	};
};