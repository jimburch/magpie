<script lang="ts">
	import { PUBLIC_SITE_URL } from '$env/static/public';

	interface Props {
		title: string;
		description: string;
		url?: string;
		image?: string;
		type?: string;
		twitterCard?: string;
	}

	let {
		title,
		description,
		url = PUBLIC_SITE_URL,
		image = `${PUBLIC_SITE_URL}/og-image.png`,
		type = 'website',
		twitterCard = 'summary'
	}: Props = $props();

	const siteName = 'Coati';

	const absoluteUrl = $derived(url.startsWith('http') ? url : `${PUBLIC_SITE_URL}${url}`);
	const absoluteImage = $derived(image.startsWith('http') ? image : `${PUBLIC_SITE_URL}${image}`);
</script>

<svelte:head>
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:url" content={absoluteUrl} />
	<meta property="og:image" content={absoluteImage} />
	<meta property="og:type" content={type} />
	<meta property="og:site_name" content={siteName} />
	<meta name="twitter:card" content={twitterCard} />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content={absoluteImage} />
</svelte:head>
