<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import type { PageData } from './$types';

	const { data }: { data: PageData } = $props();

	let name = $state('');
	let slug = $state('');
	let description = $state('');
	let version = $state('0.1.0');
	let slugManuallyEdited = $state(false);
	let readmeContent = $state('');
	let selectedToolIds = $state<string[]>([]);
	let selectedTagIds = $state<string[]>([]);
	let files = $state<
		{ source: string; target: string; placement: string; description: string; content: string }[]
	>([]);
	let submitting = $state(false);
	let errorMsg = $state('');

	$effect(() => {
		if (!slugManuallyEdited) {
			slug = name
				.toLowerCase()
				.replace(/[^a-z0-9]+/g, '-')
				.replace(/^-+|-+$/g, '');
		}
	});

	function toggleTool(id: string) {
		if (selectedToolIds.includes(id)) {
			selectedToolIds = selectedToolIds.filter((t) => t !== id);
		} else {
			selectedToolIds = [...selectedToolIds, id];
		}
	}

	function toggleTag(id: string) {
		if (selectedTagIds.includes(id)) {
			selectedTagIds = selectedTagIds.filter((t) => t !== id);
		} else {
			selectedTagIds = [...selectedTagIds, id];
		}
	}

	function addFile() {
		files = [
			...files,
			{ source: '', target: '', placement: 'project', description: '', content: '' }
		];
	}

	function removeFile(index: number) {
		files = files.filter((_, i) => i !== index);
	}

	async function handleSubmit() {
		errorMsg = '';
		submitting = true;

		try {
			const bodyFiles = [...files.filter((f) => f.source && f.target && f.content)];

			let readmePath: string | undefined;
			if (readmeContent.trim()) {
				readmePath = 'README.md';
				bodyFiles.push({
					source: 'README.md',
					target: 'README.md',
					placement: 'project',
					description: 'Setup README',
					content: readmeContent
				});
			}

			const body: Record<string, unknown> = {
				name,
				slug,
				description,
				version,
				files: bodyFiles.length > 0 ? bodyFiles : undefined,
				readmePath,
				toolIds: selectedToolIds.length > 0 ? selectedToolIds : undefined,
				tagIds: selectedTagIds.length > 0 ? selectedTagIds : undefined
			};

			const res = await fetch('/api/v1/setups', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});

			if (!res.ok) {
				const json = await res.json();
				errorMsg = json.error || 'Something went wrong';
				return;
			}

			await goto(`/${data.user.username}/${slug}`);
		} catch {
			errorMsg = 'Network error. Please try again.';
		} finally {
			submitting = false;
		}
	}
</script>

<div class="mx-auto max-w-3xl px-4 py-8">
	<h1 class="mb-8 text-2xl font-bold">Create a new setup</h1>

	<form
		onsubmit={(e) => {
			e.preventDefault();
			handleSubmit();
		}}
		class="space-y-8"
	>
		<!-- Metadata -->
		<div class="space-y-4">
			<div>
				<label for="name" class="mb-1.5 block text-sm font-medium">Name</label>
				<Input id="name" bind:value={name} placeholder="My awesome setup" required />
			</div>

			<div>
				<label for="slug" class="mb-1.5 block text-sm font-medium">Slug</label>
				<div class="flex items-center gap-1.5">
					<span class="text-muted-foreground text-sm">{data.user.username}/</span>
					<Input
						id="slug"
						bind:value={slug}
						oninput={() => (slugManuallyEdited = true)}
						placeholder="my-awesome-setup"
						required
					/>
				</div>
			</div>

			<div>
				<label for="description" class="mb-1.5 block text-sm font-medium">Description</label>
				<textarea
					id="description"
					bind:value={description}
					maxlength={300}
					rows={3}
					placeholder="Briefly describe what this setup does"
					class="border-input bg-background w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
					required
				></textarea>
				<p class="text-muted-foreground mt-1 text-xs">{description.length}/300</p>
			</div>

			<div>
				<label for="version" class="mb-1.5 block text-sm font-medium">Version</label>
				<Input id="version" bind:value={version} placeholder="0.1.0" required />
			</div>
		</div>

		<!-- Tools -->
		<div>
			<h2 class="mb-3 text-lg font-semibold">Tools</h2>
			{#if data.tools.length === 0}
				<p class="text-muted-foreground text-sm">No tools available yet.</p>
			{:else}
				<div class="flex flex-wrap gap-3">
					{#each data.tools as tool (tool.id)}
						<label class="flex items-center gap-2 text-sm">
							<input
								type="checkbox"
								checked={selectedToolIds.includes(tool.id)}
								onchange={() => toggleTool(tool.id)}
								class="rounded"
							/>
							{tool.name}
						</label>
					{/each}
				</div>
			{/if}
		</div>

		<!-- Tags -->
		<div>
			<h2 class="mb-3 text-lg font-semibold">Tags</h2>
			{#if data.tags.length === 0}
				<p class="text-muted-foreground text-sm">No tags available yet.</p>
			{:else}
				<div class="flex flex-wrap gap-3">
					{#each data.tags as tag (tag.id)}
						<label class="flex items-center gap-2 text-sm">
							<input
								type="checkbox"
								checked={selectedTagIds.includes(tag.id)}
								onchange={() => toggleTag(tag.id)}
								class="rounded"
							/>
							{tag.name}
						</label>
					{/each}
				</div>
			{/if}
		</div>

		<!-- README -->
		<div>
			<h2 class="mb-3 text-lg font-semibold">README</h2>
			<textarea
				bind:value={readmeContent}
				rows={8}
				placeholder="Write your README in Markdown..."
				class="border-input bg-background w-full rounded-md border px-3 py-2 text-sm font-mono focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
			></textarea>
			<p class="text-muted-foreground mt-1 text-xs">Markdown will be rendered on the published page.</p>
		</div>

		<!-- Files -->
		<div>
			<div class="mb-3 flex items-center justify-between">
				<h2 class="text-lg font-semibold">Files</h2>
				<Button type="button" variant="outline" size="sm" onclick={addFile}>Add File</Button>
			</div>

			{#if files.length === 0}
				<p class="text-muted-foreground text-sm">
					No files added yet. Click "Add File" to include configuration files in your setup.
				</p>
			{/if}

			<div class="space-y-4">
				{#each files as file, i (i)}
					<div class="rounded-lg border p-4 space-y-3">
						<div class="flex items-center justify-between">
							<span class="text-sm font-medium">File {i + 1}</span>
							<Button
								type="button"
								variant="ghost"
								size="sm"
								class="text-destructive"
								onclick={() => removeFile(i)}
							>
								Remove
							</Button>
						</div>

						<div class="grid grid-cols-2 gap-3">
							<div>
								<label for="source-{i}" class="mb-1 block text-xs font-medium"
									>Source path</label
								>
								<Input
									id="source-{i}"
									bind:value={file.source}
									placeholder=".claude/settings.json"
								/>
							</div>
							<div>
								<label for="target-{i}" class="mb-1 block text-xs font-medium"
									>Target path</label
								>
								<Input
									id="target-{i}"
									bind:value={file.target}
									placeholder=".claude/settings.json"
								/>
							</div>
						</div>

						<div class="grid grid-cols-2 gap-3">
							<div>
								<label for="placement-{i}" class="mb-1 block text-xs font-medium"
									>Placement</label
								>
								<select
									id="placement-{i}"
									bind:value={file.placement}
									class="border-input bg-background h-9 w-full rounded-md border px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
								>
									<option value="global">Global</option>
									<option value="project">Project</option>
									<option value="relative">Relative</option>
								</select>
							</div>
							<div>
								<label for="filedesc-{i}" class="mb-1 block text-xs font-medium"
									>Description (optional)</label
								>
								<Input
									id="filedesc-{i}"
									bind:value={file.description}
									placeholder="What this file does"
								/>
							</div>
						</div>

						<div>
							<label for="content-{i}" class="mb-1 block text-xs font-medium">Content</label
							>
							<textarea
								id="content-{i}"
								bind:value={file.content}
								rows={6}
								placeholder="Paste file content here..."
								class="border-input bg-background w-full rounded-md border px-3 py-2 text-sm font-mono focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
							></textarea>
						</div>
					</div>
				{/each}
			</div>
		</div>

		<!-- Submit -->
		<div class="border-t pt-6">
			{#if errorMsg}
				<p class="mb-4 text-sm text-destructive">{errorMsg}</p>
			{/if}
			<Button type="submit" disabled={submitting}>
				{submitting ? 'Publishing...' : 'Publish Setup'}
			</Button>
		</div>
	</form>
</div>
