
export const formatActiveSliderFilter = (entry, defaultVal, isGrowth=false) => {
  const pct = isGrowth ? "%" : "";

  if ( entry[0] == defaultVal[0] && entry[1] == defaultVal[1] ) {
    // No-op - shouldn't happen, because this is means that no filter is applied.
    return "";
  } else if ( entry[1] == defaultVal[1] ) {
    return `${entry[0]}${pct} or higher`;
  } else if ( entry[0] == defaultVal[0] ) {
    return `No more than ${entry[1]}${pct}`;
  } else {
    return `Between ${entry[0]}${pct} and ${entry[1]}${pct}`;
  }
};
