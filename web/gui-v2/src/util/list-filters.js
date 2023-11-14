


export const parseSlider = (val) => {
  return val?.split(',').map(e => parseInt(e));
}

export const parseOther = (val) => {
  return val?.split(',').filter(e => e !== "");
}

