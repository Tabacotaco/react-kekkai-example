import json from './data.js';


function isFilterMapping(data, { name = '', operator = 'none', value = '', logic = 'and', filters = [] }) {
  if (filters.length > 0) {
    const isAllMapping = 'and' === logic.toLowerCase();
    const mappingCount = filters.filter(f => isFilterMapping(data, f)).length;

    return isAllMapping ? (filters.length === mappingCount) : (mappingCount > 0);
  } else {
    const { [name]: val = '' } = data;

    switch (operator.toLowerCase()) {
      case 'eq': return val === value;
      case 'neq': return val !== value;
      case 'like': return val.toLowerCase().indexOf(value.toLowerCase()) >= 0;
      case 'notlike': return val.toLowerCase().indexOf(value.toLowerCase()) < 0;
    }
  }
  return true;
}

function doSort(list, sorts) {
  [].concat(sorts).reverse().forEach(({ name, dir = 'asc' }) => list.sort((d1, d2) => {
    const { [name]: value1 } = d1;
    const { [name]: value2 } = d2;

    switch (dir.toLowerCase()) {
      case 'asc': return value1 < value2 ? -1 : value1 > value2 ? 1 : 0;
      case 'desc': return value1 < value2 ? 1 : value1 > value2 ? -1 : 0;
      default: return 0;
    }
  }));
  return list;
}

export async function getBudgetData({ conditions = {}, sorts = [], pageSize = 10, skipCount = 0 }) {
  console.log(' filters: ', conditions);
  console.log('   sorts: ', sorts);

  return await (new Promise(resolve => {
    const content = doSort(
      json.filter(data => isFilterMapping(data, conditions)),
      sorts
    );

    setTimeout(() => resolve({
      content: content.slice(skipCount, skipCount + pageSize),
      totalCount: content.length
    }), 1000);
  }));
}

export async function doCommitBudget({ modifieds = [], removes = [] }) {
  console.log(modifieds, removes);
}