import type { CreativeCategory, CreativeWork } from './types';

export function dedupeCreativeWorks(works: CreativeWork[]): CreativeWork[] {
  const seen = new Set<string>();
  return works.filter((work) => {
    if (seen.has(work.id)) return false;
    seen.add(work.id);
    return true;
  });
}

export function reorderCreativeCategory(
  works: CreativeWork[],
  category: CreativeCategory,
  fromIndex: number,
  toIndex: number,
): CreativeWork[] {
  const categoryWorks = works.filter((work) => work.category === category);
  if (
    fromIndex < 0 ||
    fromIndex >= categoryWorks.length ||
    toIndex < 0 ||
    toIndex >= categoryWorks.length ||
    fromIndex === toIndex
  ) return works;

  const reordered = [...categoryWorks];
  const [moved] = reordered.splice(fromIndex, 1);
  reordered.splice(toIndex, 0, moved);

  let cursor = 0;
  return works.map((work) => work.category === category ? reordered[cursor++] : work);
}
