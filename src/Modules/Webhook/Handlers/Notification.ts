'use strict';

// External Modules
import Joi from '@hapi/joi';

// Internal Modules
import { mirror } from '@chris-talman/isomorphic-utilities';
import { EmailSystem } from 'src/Modules';
import { generateMetadataFromSesTags } from 'src/Modules/Utilities/GenerateMetadataFromSesTags';
import { EmailWebookParseError, EmailWebhookInvalid } from 'src/Modules/Errors';

// Types
import { PartialDeep } from '@chris-talman/types-helpers';
import { Email } from 'src/Modules/Send';
import { NotificationMessage } from 'src/Modules/Webhook';
export type Event =  UntypedEvent | DeliveryEvent | BounceEvent | ComplaintEvent;
export interface BaseEvent
{
	eventType: 'Delivery' | 'Send' | 'Reject' | 'Open' | 'Click' | 'Bounce' | 'Complaint' | 'Rendering Failure';
	mail: EventMail;
	tags: BaseEventTags;
};
export interface BaseEventTags
{
	[key: string]: Array<string>;
};
export interface EventMail
{
	messageId: string;
	timestamp: string;
	destination: Array<string>;
	tags: EventMailTags<EmailTags>;
};
interface EmailTags
{
	emailId: string;
};
export type EventMailTags <GenericMetadata> = { [GenericKey in keyof GenericMetadata]: Array<string>; };
export interface UntypedEvent extends BaseEvent
{
	eventType: 'Send' | 'Reject' | 'Open' | 'Click' | 'Rendering Failure';
};
export interface DeliveryEvent extends BaseEvent
{
	eventType: 'Delivery';
	delivery: DeliveryEventDelivery;
};
export interface DeliveryEventDelivery
{
	timestamp: string;
};
export interface BounceEvent extends BaseEvent
{
	eventType: 'Bounce';
	bounce: BounceEventBounce;
};
export interface BounceEventBounce
{
	feedbackId: string;
	bounceType: string;
	bounceSubType: string;
	timestamp: string;
};
export interface ComplaintEvent extends BaseEvent
{
	eventType: 'Complaint';
	complaint: ComplaintEventComplaint;
};
export interface ComplaintEventComplaint
{
	feedbackId: string;
	timestamp: string;
};

// Constants
const EVENT_TYPE = mirror
(
	{
		Bounce: true,
		Complaint: true
	}
);
const SCHEMA =
{
	eventType: Joi.string().required(),
	mail:
	{
		timestamp: Joi.string().required(),
		messageId: Joi.string().required()
	},
	bounce: Joi.object
		(
			{
				bounceType: Joi.string().required(),
				bounceSubType: Joi.string().required(),
				timestamp: Joi.string().required()
			}
		)
		.when
		(
			Joi.ref('eventType'),
			{
				is: EVENT_TYPE.Bounce,
				then: Joi.required(),
				otherwise: Joi.forbidden()
			}
		),
	complaint: Joi.object
		(
			{
				timestamp: Joi.string().required()
			}
		)
		.when
		(
			Joi.ref('eventType'),
			{
				is: EVENT_TYPE.Complaint,
				then: Joi.required(),
				otherwise: Joi.forbidden()
			}
		)
};
const JOI_OPTIONS: Joi.ValidationOptions =
{
	presence: 'required',
	allowUnknown: true
};

export async function handleNotification <GenericEmailSystem extends EmailSystem <any, any, any>> ({message, system}: {message: NotificationMessage, system: GenericEmailSystem})
{
	const event = parseEvent({message});
	if (!event) return;
	if (event.mail.destination.length > 1)
	{
		console.error('Email notification has multiple destinations');
		return;
	};
	const recipient = event.mail.destination[0];
	if (!event.mail.tags)
	{
		console.error('Mail tags missing:', event.mail.messageId);
		return;
	};
	const tags = generateMetadataFromSesTags(event.mail.tags);
	if (typeof tags.emailId !== 'string')
	{
		console.error('Email ID missing in mail tags:', event.mail.messageId);
		console.error('Mail tags:\n' + tags);
		return;
	};
	const update: PartialDeep<Email<any, any>> =
	{
		queued: (new Date(event.mail.timestamp)).valueOf(),
		recipient
	};
	if (event.eventType === 'Bounce')
	{
		update.bounce =
		{
			id: event.bounce.feedbackId,
			bounceType: event.bounce.bounceType,
			bounceSubType: event.bounce.bounceSubType,
			timestamp: (new Date(event.bounce.timestamp)).valueOf()
		};
	}
	else if (event.eventType === 'Delivery')
	{
		update.delivery =
		{
			timestamp: (new Date(event.delivery.timestamp)).valueOf()
		};
	}
	else if (event.eventType === 'Complaint')
	{
		update.complaint =
		{
			id: event.complaint.feedbackId,
			timestamp: (new Date(event.complaint.timestamp)).valueOf()
		};
	};
	const email = await system.callbacks.updateEmail({id: tags.emailId, update});
	const handlerType = system.callbacks.resolveWebhookHandlerType({email});
	if (system.webhookHandlers !== undefined)
	{
		const handler = system.webhookHandlers[handlerType];
		if (handler)
		{
			let handled = true;
			try
			{
				await handler({email});
			}
			catch (error)
			{
				console.error(error);
				handled = false;
			};
			if (handled && email.lockId)
			{
				await system.callbacks.deleteLock({id: email.lockId});
			};
		};
	};
};

/** Parses event data JSON from body, and validates its data structure. */
function parseEvent({message}: {message: NotificationMessage})
{
	let event: Event;
	try
	{
		event = JSON.parse(message.Message);
	}
	catch (error)
	{
		throw new EmailWebookParseError();
	};
	const validation = Joi.compile(SCHEMA).validate(message, JOI_OPTIONS);
	if (validation.error)
	{
		throw new EmailWebhookInvalid(validation);
	};
	return event;
};