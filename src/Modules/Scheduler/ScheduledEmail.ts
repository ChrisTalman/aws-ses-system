'use strict';

// External Modules
import { PromiseController } from '@chris-talman/isomorphic-utilities';

// Intenral Modules
import { EmailSystem } from 'src/Modules';
import { Scheduler } from 'src/Modules/Scheduler';

// Types
import { BaseMetadata } from 'src/Modules';
import { SendMailOptions } from 'src/Modules/Send';

// Constants
const INVALID_ADDRESS_ERROR_MESSAGE_EXPRESSION = /^InvalidParameterValue: Local address contains control or whitespace$/;

export class ScheduledEmail
{
	public readonly system: EmailSystem <any, any>;
	public readonly scheduler: Scheduler <any>;
	public readonly email: SendMailOptions;
	public readonly metadata: BaseMetadata <any>;
	public readonly useQueue: boolean;
	public readonly metadataId: string;
	public readonly promiseController: PromiseController <void>;
	private executing = false;
	private executed = false;
	constructor({email, metadata, useQueue, scheduler}: Pick<ScheduledEmail, 'email' | 'metadata' | 'useQueue' | 'scheduler'>)
	{
		this.email = email;
		this.metadata = metadata;
		this.useQueue = useQueue;
		this.scheduler = scheduler;
		this.promiseController = new PromiseController();
		this.execute();
	};
	public async execute()
	{
		if (this.executing || this.executed) return;
		this.executing = true;
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
		if (this.metadata.lockId)
		{
			try
			{
				await this.system.callbacks.insertLock({id: this.metadata.lockId, metadataId: this.metadataId});
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
			result = await this.system.nodemailer.sendMail(this.email);
		}
		catch (error)
		{
			if (error.code === 'Throttling')
			{
				this.executing = false;
				this.scheduler.guaranteeQueueItem(this);
				if (this.metadata.lockId)
				{
					try
					{
						await this.system.callbacks.deleteLock({id: this.metadata.lockId});
					}
					catch (error)
					{
						console.error(`Failed to delete lock after throttling. Metadata ID: ${this.metadataId}`);
						this.reject(error);
					};
				};
			}
			else if (error.code === 'InvalidParameterValue' && INVALID_ADDRESS_ERROR_MESSAGE_EXPRESSION.test(error.message))
			{
				if (this.metadata.lockId)
				{
					try
					{
						await this.system.callbacks.deleteLock({id: this.metadata.lockId});
						console.log(`Deleted lock after nonlockable error. Metadata ID: ${this.metadataId}`);
					}
					catch (error)
					{
						console.error(`Failed to delete lock after nonlockable error. Metadata ID: ${this.metadataId}`);
						this.reject(error);
					};
				};
				this.reject(error);
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