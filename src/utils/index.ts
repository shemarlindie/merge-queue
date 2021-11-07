export function groupList<T>(list: any[], groupByValue: (el: T) => string|undefined|null, ungroupedName: string = 'ungrouped'): Record<string, T[]> {
  const grouped: any = {[ungroupedName]: []}

  for (const el of list) {
    const groupName = groupByValue(el)
    if (groupName) {
      if (!grouped[groupName]) {
        grouped[groupName] = []
      }

      grouped[groupName].push(el)
    }
    else {
      grouped[ungroupedName].push(el)
    }
  }

  return grouped as Record<string, T[]>
}

export function sortList<T>(list: T[], field: keyof T): T[] {
  return list.sort((a, b) => {
    if (a[field] === undefined || a[field] === null) {
      return 1
    }
    else if (b[field] === undefined || b[field] === null) {
      return -1
    }
    else if (a[field] === b[field]) {
      return 0
    }

    return a[field] < b[field] ? -1 : 1
  })
}

export function addIndexIds<T>(list: T[]): (T&{id: number})[] {
  return list.map((val, index) => Object.assign(val, {id: index}))
}