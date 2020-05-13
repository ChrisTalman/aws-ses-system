'use strict';

// Internal Modules
import { mirror } from '@chris-talman/isomorphic-utilities';
import { createSubsetObject } from '@chris-talman/isomorphic-utilities';
import { EmailHandlerNotFoundError } from 'src/Modules/Errors';
import { EmailSystem } from 'src/Modules';
import { verifySignature } from './Signature';

// Handlers
import { handleSubscriptionConfirmation } from './Handlers/SubscriptionConfirmation';
import { handleUnsubscribeConfirmation } from './Handlers/UnsubscribeConfirmation';
import { handleNotification } from './Handlers/Notification';

// Types
export type Message = SubscriptionMessage | NotificationMessage;
export interface BaseMessage
{
	MessageId: string;
	Type: MessageType;
	Timestamp: string;
	SignatureVersion: string;
	Signature: string;
	SigningCertURL: string;
	TopicArn: string;
	Message: string;
};
export type MessageType = keyof typeof MESSAGE_TYPE;
export interface SubscriptionMessage extends BaseMessage
{
	Type: SubscriptionMessageType;
    SubscribeURL: string;
    Token: string;
};
export type SubscriptionMessageType = keyof typeof MESSAGE_TYPE_SUBSCRIPTION;
export interface NotificationMessage extends BaseMessage
{
	Subject: string;
};
interface Handlers
{
    [eventType: string]: Handler;
};
type Handler = 'ignore' | HandlerCallback;
type HandlerCallback = ({message: Message, system: EmailSystem}) => Promise<boolean>;

// Constants
export const MESSAGE_TYPE = mirror
(
	{
		SubscriptionConfirmation: true,
		UnsubscribeConfirmation: true,
		Notification: true
	}
);
const MESSAGE_TYPE_SUBSCRIPTION = createSubsetObject(MESSAGE_TYPE, ['SubscriptionConfirmation', 'UnsubscribeConfirmation']);
const HANDLERS: Handlers =
{
	[MESSAGE_TYPE.SubscriptionConfirmation]: handleSubscriptionConfirmation,
	[MESSAGE_TYPE.UnsubscribeConfirmation]: handleUnsubscribeConfirmation,
	[MESSAGE_TYPE.Notification]: handleNotification
};

export async function webhook(this: EmailSystem <any, any>, {message}: {message: Message})
{
	const signatureVerified = await verifySignature({message});
    if (!signatureVerified) return;
    await handleEvent({message, system: this});
};

async function handleEvent({message, system}: {message: Message, system: EmailSystem <any, any>})
{
    const handler = HANDLERS[message.Type];
    if (!handler)
    {
        throw new EmailHandlerNotFoundError();
    };
	if (handler === 'ignore') return true;
    await handler({message, system});
};