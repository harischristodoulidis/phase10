import type { DragItem, DropZone } from './turnMoves';

export type DragData = { item?: DragItem; zone?: DropZone };

function prop(value: unknown, key: string): unknown {
  return typeof value === 'object' && value !== null ? Reflect.get(value, key) : undefined;
}

function text(value: unknown, key: string): string | null {
  const found = prop(value, key);
  return typeof found === 'string' ? found : null;
}

function texts(value: unknown, key: string): string[] | null {
  const found = prop(value, key);
  if (!Array.isArray(found)) {
    return null;
  }
  const strings = found.filter((entry): entry is string => typeof entry === 'string');
  return strings.length === found.length ? strings : null;
}

function count(value: unknown, key: string): number | null {
  const found = prop(value, key);
  return typeof found === 'number' ? found : null;
}

// dnd-kit hands data back untyped, so each value is rebuilt from checked fields.
export function itemOf(data: unknown): DragItem | null {
  const item = prop(data, 'item');
  const cardId = text(item, 'cardId');
  const slot = count(item, 'slot');
  switch (text(item, 'kind')) {
    case 'handCard':
      return cardId === null ? null : { kind: 'handCard', cardId };
    case 'handCards': {
      const cardIds = texts(item, 'cardIds');
      return cardIds === null ? null : { kind: 'handCards', cardIds };
    }
    case 'placedCard':
      return cardId === null || slot === null ? null : { kind: 'placedCard', cardId, slot };
    case 'slotCards': {
      const cardIds = texts(item, 'cardIds');
      return cardIds === null || slot === null ? null : { kind: 'slotCards', slot, cardIds };
    }
    case 'deck':
      return { kind: 'deck' };
    case 'discardTop':
      return { kind: 'discardTop' };
    case null:
    default:
      return null;
  }
}

export function zoneOf(data: unknown): DropZone | null {
  const zone = prop(data, 'zone');
  const slot = count(zone, 'slot');
  const groupId = text(zone, 'groupId');
  switch (text(zone, 'kind')) {
    case 'hand':
      return { kind: 'hand' };
    case 'discard':
      return { kind: 'discard' };
    case 'slot':
      return slot === null ? null : { kind: 'slot', slot };
    case 'group':
      return groupId === null ? null : { kind: 'group', groupId };
    case null:
    default:
      return null;
  }
}
