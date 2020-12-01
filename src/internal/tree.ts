import { EntityData, GlobalStore, TreeNode } from '../types';

export function climbTree(
  path: string[],
  store: GlobalStore,
  targetId: string | null
): string[] {
  if (!targetId) return path;

  const registered = store.entities[targetId];
  if (!registered)
    throw new Error(
      `Traversing tree to ${targetId} but it was not found (broken link)`
    );

  if (registered.parentId) {
    path.unshift(registered.parentId);
    return climbTree(path, store, registered.parentId);
  }

  return path;
}
export function discoverTreePath(store: GlobalStore, targetId: string | null) {
  return climbTree([], store, targetId);
}
export function traverseToNode(store: GlobalStore, path: string[]) {
  let currentNode = store.tree;
  let currentId = path.shift();
  while (path.length) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    currentId = path.shift()!;
    currentNode = currentNode.children[currentId];
  }
  return currentNode;
}
export function addTreeNode(
  store: GlobalStore,
  parentId: string | null,
  childId: string
) {
  const path = discoverTreePath(store, parentId);
  const node = traverseToNode(store, path);
  node.children[childId] = {
    id: childId,
    children: {},
  };
}
export function removeTreeNode(store: GlobalStore, childId: string) {
  const path = discoverTreePath(store, childId);
  const parentPath = path.slice(undefined, -1);
  const node = traverseToNode(store, parentPath);
  const childNode = node.children[childId];
  delete node.children[childId];
  return childNode;
}
/**
 * Removes all members of a subtree of the scene tree, starting
 * at a particular node. returns a list of entities removed
 * @param store
 * @param node
 */
export function removeSubtree(
  store: GlobalStore,
  node: TreeNode,
  removedList: EntityData[] = []
) {
  removedList.push(store.entities[node.id]);
  delete store.entities[node.id];
  Object.values(node.children).forEach((n) => {
    removeSubtree(store, n);
  });
  return removedList;
}
