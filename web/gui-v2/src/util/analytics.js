
export const plausibleEvent = (eventName, props) => {
  if ( window.plausible ) {
    if ( props ) {
      window.plausible(eventName, { props });
    } else {
      window.plausible(eventName);
    }
  }
}
