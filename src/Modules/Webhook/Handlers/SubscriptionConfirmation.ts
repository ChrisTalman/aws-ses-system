'use strict';

// External Modules
import { PromiseController } from '@chris-talman/isomorphic-utilities';

// Internal Modules
import { EmailSystem } from 'src/Modules';

// Types
import { SubscriptionMessage } from 'src/Modules/Webhook';

export async function handleSubscriptionConfirmation({message, system}: {message: SubscriptionMessage, system: EmailSystem <any, any>})
{
	await confirmSubscription({message, system});
};

function confirmSubscription({message, system}: {message: SubscriptionMessage, system: EmailSystem <any, any>})
{
	const promiseController = new PromiseController();
	system.sns.confirmSubscription
	(
		{
			TopicArn: message.TopicArn,
			Token: message.Token
		},
		(error, data) =>
		{
			if (error) promiseController.reject(error);
			else promiseController.resolve(data);
		}
	);
	const { promise } = promiseController;
	return promise;
};