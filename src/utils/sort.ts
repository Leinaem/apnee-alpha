import { GenericStringIndex } from "@/app/type/generic";


export const sortBy = (type: string, array: GenericStringIndex[], direction = 'asc') => {
  return array?.sort((a, b) => {
    const c = a[type] as number;
    const d = b[type] as number;
    if (typeof c === 'string' && c === 'DSQ') {
      return 1;
    } else if (typeof d === 'string' && d  === 'DSQ') {
      return -1;
    }

    if (c > d) {
      return direction ==='asc' ? 1 : -1;
    } else {
      return direction ==='asc' ? -1 : 1;
    }
  });
}
