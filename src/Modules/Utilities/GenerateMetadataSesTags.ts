'use strict';

// Types
export interface Tags extends Array<Tag> {};
export interface Tag
{
	Name: string;
	Value: string;
};

/** Translates document metadata into AWS SES tags. */
export function generateMetadataSesTags <GenericMetadata extends { [GenericKey in keyof GenericMetadata]: string }> (metadata: GenericMetadata)
{
	const tags: Tags = [];
	const keys = Object.keys(metadata);
	for (let key of keys)
	{
		const value = metadata[key];
		tags.push({Name: key, Value: value});
	};
	return tags;
};