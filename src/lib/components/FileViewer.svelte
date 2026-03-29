<script lang="ts">
	import { File } from '@lucide/svelte';

	interface Props {
		file: {
			source: string;
			target: string;
			placement: string;
			description: string | null;
			content: string;
		};
		highlightedHtml: string | null | undefined;
	}

	const { file, highlightedHtml }: Props = $props();

	const isEmpty = $derived(file.content === '');
	const lineCount = $derived(isEmpty ? 0 : file.content.split('\n').length);
</script>

<div class="overflow-hidden rounded-lg border border-border">
	<!-- Header bar -->
	<div class="flex items-center justify-between border-b border-border bg-muted/50 px-4 py-2">
		<div class="flex items-center gap-2 text-sm font-medium">
			<File class="size-4 text-muted-foreground" />
			{file.source}
		</div>
		<div class="flex items-center gap-3 text-xs text-muted-foreground">
			<span class="rounded-md bg-secondary px-1.5 py-0.5 font-medium text-secondary-foreground">
				{file.placement}
			</span>
			<span>{lineCount} line{lineCount !== 1 ? 's' : ''}</span>
		</div>
	</div>

	<!-- Target path -->
	<div class="border-b border-border bg-muted/25 px-4 py-1.5 text-xs text-muted-foreground">
		Installs to: <code class="rounded bg-muted px-1 py-0.5 font-mono">{file.target}</code>
	</div>

	<!-- Description -->
	{#if file.description}
		<div class="border-b border-border px-4 py-2 text-sm text-muted-foreground">
			{file.description}
		</div>
	{/if}

	<!-- Code block -->
	<div
		class="overflow-x-auto [&_code]:text-sm [&_pre]:!m-0 [&_pre]:!rounded-none [&_pre]:!border-0 [&_pre]:p-4"
	>
		{#if isEmpty}
			<div class="p-4 text-sm italic text-muted-foreground">This file is empty</div>
		{:else if highlightedHtml}
			{@html highlightedHtml}
		{:else}
			<pre class="!m-0 !rounded-none !border-0 p-4 text-sm">{file.content}</pre>
		{/if}
	</div>
</div>
