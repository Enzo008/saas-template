import { rankItem } from "@tanstack/match-sorter-utils";
import { FilterFn } from "@tanstack/react-table";

export const fuzzyFilter: FilterFn<any> = (
  row,
  columnId,
  value,
  addMeta
) => {
  const itemRank = rankItem(row.getValue(columnId), value);
  addMeta({ itemRank });
  return itemRank.passed;
};

export const reorder = (
  list: string[],
  startIndex: number,
  endIndex: number
): string[] => {
  if (!Array.isArray(list)) {
    return [];
  }

  // Crear una copia del array original
  const result = Array.from(list);

  // Remover el elemento del índice inicial
  const [removed] = result.splice(startIndex, 1);

  // Insertar el elemento en el nuevo índice
  result.splice(endIndex, 0, removed || '');

  return result;
};

export const convertCamelToTitleCase = (text: string) => {
  if (!text) return '';
  const result = text.replace(/([A-Z])/g, " $1");
  return result.charAt(0).toUpperCase() + result.slice(1);
};
