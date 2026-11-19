import type {Node as ProseMirrorNode, Slice} from '@tiptap/pm/model'

const LIST_TYPES = new Set(['bulletList', 'orderedList'])

// Serializes a copied slice to plain text while keeping list markers, so that a
// copied bullet or ordered list still reads as a list outside the editor.
export function sliceToPlainText(slice: Slice): string {
	const lines: string[] = []
	slice.content.forEach(node => lines.push(...blockToLines(node, 0)))
	return lines.join('\n')
}

function blockToLines(node: ProseMirrorNode, depth: number): string[] {
	if (node.isText) {
		return [node.text ?? '']
	}

	if (LIST_TYPES.has(node.type.name)) {
		const lines: string[] = []
		node.forEach((item, _offset, index) => {
			const marker = node.type.name === 'orderedList' ? `${index + 1}. ` : '- '
			const indent = '  '.repeat(depth)
			const [first = '', ...rest] = itemLines(item, depth + 1)
			lines.push(`${indent}${marker}${first}`, ...rest)
		})
		return lines
	}

	if (node.isTextblock) {
		return [node.textContent]
	}

	const lines: string[] = []
	node.forEach(child => lines.push(...blockToLines(child, depth)))
	return lines
}

function itemLines(item: ProseMirrorNode, depth: number): string[] {
	const lines: string[] = []
	item.forEach(child => lines.push(...blockToLines(child, depth)))
	return lines
}
